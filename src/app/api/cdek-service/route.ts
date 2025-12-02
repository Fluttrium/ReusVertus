import { NextRequest, NextResponse } from 'next/server';

/**
 * API endpoint для виджета СДЭК 3.x
 * Проксирует запросы к API СДЭК с авторизацией
 * 
 * Виджет отправляет запросы с параметрами:
 * - action: тип действия (offices, calculate, cities и т.д.)
 * - другие параметры зависят от action
 */

const CDEK_CLIENT_ID = process.env.CDEK_CLIENT_ID || '';
const CDEK_CLIENT_SECRET = process.env.CDEK_CLIENT_SECRET || '';
const CDEK_TEST_MODE = process.env.CDEK_TEST_MODE === 'true';

const CDEK_API_URL = CDEK_TEST_MODE 
  ? 'https://api.edu.cdek.ru/v2'
  : 'https://api.cdek.ru/v2';

const CDEK_AUTH_URL = CDEK_TEST_MODE
  ? 'https://api.edu.cdek.ru/v2/oauth/token'
  : 'https://api.cdek.ru/v2/oauth/token';

let accessToken: string | null = null;
let tokenExpiry: number = 0;

async function getAccessToken(): Promise<string> {
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }

  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');
  params.append('client_id', CDEK_CLIENT_ID);
  params.append('client_secret', CDEK_CLIENT_SECRET);

  const response = await fetch(CDEK_AUTH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('[CDEK Service] Auth error:', error);
    throw new Error(`CDEK auth error: ${error}`);
  }

  const data = await response.json();
  accessToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;

  return accessToken!;
}

// Проксирование запроса к API СДЭК
async function proxyToCdek(endpoint: string, method: string = 'GET', body?: any): Promise<any> {
  const token = await getAccessToken();
  
  const options: RequestInit = {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  };

  if (body && method !== 'GET') {
    options.body = JSON.stringify(body);
  }

  const url = `${CDEK_API_URL}${endpoint}`;
  console.log(`[CDEK Service] ${method} ${url}`);
  
  const response = await fetch(url, options);
  const data = await response.json();
  
  if (!response.ok) {
    console.error('[CDEK Service] API error:', data);
  }
  
  return data;
}

// GET запросы от виджета
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    console.log('[CDEK Service] GET action:', action, 'params:', Object.fromEntries(searchParams));

    // Если нет action - статус сервиса
    if (!action) {
      return NextResponse.json({
        status: 'ok',
        message: 'CDEK widget service',
        testMode: CDEK_TEST_MODE,
      });
    }

    let data: any;

    switch (action) {
      case 'offices': {
        // Получение пунктов выдачи
        const params = new URLSearchParams();
        
        // Копируем все параметры кроме action
        searchParams.forEach((value, key) => {
          if (key !== 'action') {
            // Маппинг параметров виджета на API СДЭК
            if (key === 'city') params.append('city_code', value);
            else if (key === 'country') params.append('country_code', value);
            else if (key === 'is_handout') params.append('is_handout', value);
            else if (key === 'type') params.append('type', value);
            else if (key === 'have_cashless') params.append('have_cashless', value);
            else if (key === 'have_cash') params.append('have_cash', value);
            else if (key === 'allowed_cod') params.append('allowed_cod', value);
            else if (key === 'is_dressing_room') params.append('is_dressing_room', value);
            else if (key !== 'page' && key !== 'size') params.append(key, value);
          }
        });
        
        data = await proxyToCdek(`/deliverypoints?${params.toString()}`);
        break;
      }

      case 'cities': {
        // Поиск городов
        const params = new URLSearchParams();
        searchParams.forEach((value, key) => {
          if (key !== 'action') {
            params.append(key, value);
          }
        });
        data = await proxyToCdek(`/location/cities?${params.toString()}`);
        break;
      }

      case 'regions': {
        // Получение регионов
        const params = new URLSearchParams();
        searchParams.forEach((value, key) => {
          if (key !== 'action') {
            params.append(key, value);
          }
        });
        data = await proxyToCdek(`/location/regions?${params.toString()}`);
        break;
      }

      default: {
        // Общий прокси для других action
        const params = new URLSearchParams();
        searchParams.forEach((value, key) => {
          if (key !== 'action') {
            params.append(key, value);
          }
        });
        const queryString = params.toString();
        data = await proxyToCdek(`/${action}${queryString ? `?${queryString}` : ''}`);
      }
    }

    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error: any) {
    console.error('[CDEK Service] GET error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST запросы от виджета (расчёт тарифов)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[CDEK Service] POST body:', JSON.stringify(body, null, 2));

    const { action, ...params } = body;

    let data: any;

    switch (action) {
      case 'calculate':
      case 'calculator': {
        // Расчёт стоимости доставки
        data = await proxyToCdek('/calculator/tarifflist', 'POST', params);
        break;
      }

      case 'offices': {
        // Иногда виджет отправляет POST для offices
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, String(value));
          }
        });
        data = await proxyToCdek(`/deliverypoints?${queryParams.toString()}`);
        break;
      }

      default: {
        // Общий POST прокси
        if (action) {
          data = await proxyToCdek(`/${action}`, 'POST', params);
        } else {
          // Если action не указан, считаем что это расчёт тарифов
          data = await proxyToCdek('/calculator/tarifflist', 'POST', body);
        }
      }
    }

    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error: any) {
    console.error('[CDEK Service] POST error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// OPTIONS для CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
