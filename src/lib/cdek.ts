/**
 * Интеграция с API СДЭК v2
 * Документация: https://api-docs.cdek.ru/
 * 
 * Алгоритм работы:
 * 1. Авторизация в сервисе (OAuth 2.0)
 * 2. Получить список локаций (регионы, города, индексы)
 * 3. Получить список офисов (пункты выдачи)
 * 4. Расчёт стоимости доставки
 * 5. Проверка ограничений по международным заказам
 * 6. Регистрация заказа
 * 7. Изменить заказ
 * 8. Получить инфо по заказу
 * 9. Удалить заказ
 * 10. Зарегистрировать отказ
 */

// ==================== ТИПЫ ДАННЫХ ====================

export interface Money {
  value: number; // float
  vat_sum?: number; // float
  vat_rate?: number; // integer: 0, 5, 7, 10, 12, 20, null
}

export interface Threshold {
  threshold: number; // integer
  sum: number; // float
  vat_sum?: number; // float
  vat_rate?: number; // integer
}

export interface Phone {
  number: string; // string(255) - международный формат: +7XXXXXXXXXX
  additional?: string; // string(255)
}

export interface Contact {
  company?: string; // string(255)
  name: string; // string(255) - Ф.И.О
  email?: string; // string(255)
  phones: Phone[]; // обязательное поле
  passport_series?: string; // string(255)
  passport_number?: string; // string(255)
  passport_date_of_issue?: string; // date
  passport_organization?: string; // string(255)
  passport_date_of_birth?: string; // date
  tin?: string; // string(255) - ИНН
  passport_requirements_satisfied?: boolean;
}

export interface Location {
  code?: number; // код населенного пункта СДЭК
  fias_guid?: string; // UUID
  postal_code?: string; // string(255)
  longitude?: number; // float
  latitude?: number; // float
  country_code?: string; // string(2) - ISO_3166-1_alpha-2
  region?: string; // string(255)
  sub_region?: string; // string(255)
  city?: string; // string(255)
  address: string; // string(255) - обязательное поле
}

export interface Service {
  code: string;
  parameter?: string;
}

export interface Item {
  name: string; // string(255) - обязательное
  ware_key: string; // string(20) - идентификатор/артикул - обязательное
  payment: Money; // обязательное
  cost: number; // float - объявленная стоимость - обязательное
  weight: number; // integer - вес в граммах - обязательное
  weight_gross?: number; // integer
  amount: number; // integer - количество - обязательное
  name_i18n?: string; // string(255)
  brand?: string; // string(255)
  country_code?: string; // string(2)
  material?: string; // string(255)
  wifi_gsm?: boolean;
  url?: string; // string(255)
}

export interface Package {
  number: string; // string(255) - номер упаковки - обязательное
  weight: number; // integer - вес в граммах - обязательное
  length?: number; // integer - длина в см
  width?: number; // integer - ширина в см
  height?: number; // integer - высота в см
  comment?: string; // string(255)
  items?: Item[]; // для интернет-магазина
}

export interface Seller {
  name?: string; // string(255)
  inn?: string; // string(20)
  phone?: string; // string(255)
  ownership_form?: number;
  address?: string; // string(255)
}

export interface Status {
  code: string; // string(255)
  name: string; // string(255)
  date_time: string; // datetime
  reason_code?: string; // string(2)
  city?: string; // string(255)
}

export interface Error {
  code: string; // string(255)
  message: string; // string(255)
}

// ==================== КОНФИГУРАЦИЯ ====================

const CDEK_API_URL = 'https://api.cdek.ru/v2';
const CDEK_TEST_API_URL = 'https://api.edu.cdek.ru/v2'; // для тестирования

const clientId = process.env.CDEK_CLIENT_ID;
const clientSecret = process.env.CDEK_CLIENT_SECRET;
const useTestMode = process.env.CDEK_TEST_MODE === 'true';

const baseUrl = useTestMode ? CDEK_TEST_API_URL : CDEK_API_URL;

// Кэш токена
let accessToken: string | null = null;
let tokenExpiresAt: number = 0;

// ==================== 1. АВТОРИЗАЦИЯ ====================

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

/**
 * Получить OAuth токен доступа
 */
async function getAccessToken(): Promise<string> {
  // Проверяем кэш
  if (accessToken && Date.now() < tokenExpiresAt) {
    return accessToken;
  }

  if (!clientId || !clientSecret) {
    throw new Error('CDEK credentials not configured. Please set CDEK_CLIENT_ID and CDEK_CLIENT_SECRET in environment variables.');
  }

  try {
    const params = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    });

    if (process.env.NODE_ENV === 'development') {
      console.log('[CDEK Debug] Auth request to:', `${baseUrl}/oauth/token`);
      console.log('[CDEK Debug] Client ID:', clientId ? `${clientId.substring(0, 5)}...` : 'NOT SET');
      console.log('[CDEK Debug] Test mode:', useTestMode);
      console.log('[CDEK Debug] Base URL:', baseUrl);
    }

    const response = await fetch(`${baseUrl}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let error;
      try {
        error = JSON.parse(errorText);
      } catch {
        error = { message: errorText || response.statusText };
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.error('[CDEK Debug] Auth error response:', {
          status: response.status,
          statusText: response.statusText,
          error,
        });
      }
      
      throw new Error(`CDEK auth error (${response.status}): ${error.message || error.error_description || response.statusText}`);
    }

    const data: TokenResponse = await response.json();
    accessToken = data.access_token;
    // Сохраняем токен с запасом в 60 секунд до истечения
    tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;

    return accessToken;
  } catch (error: any) {
    console.error('CDEK auth error:', error);
    throw new Error(`Failed to get CDEK access token: ${error.message}`);
  }
}

/**
 * Выполнить авторизованный запрос к API СДЭК
 */
async function cdekRequest<T>(
  method: string,
  endpoint: string,
  body?: any
): Promise<T> {
  const token = await getAccessToken();

  if (process.env.NODE_ENV === 'development') {
    console.log(`[CDEK Debug] ${method} ${baseUrl}${endpoint}`);
  }

  const response = await fetch(`${baseUrl}${endpoint}`, {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    let error;
    try {
      error = JSON.parse(errorText);
    } catch {
      error = { message: errorText || response.statusText };
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.error('[CDEK Debug] API error response:', {
        status: response.status,
        statusText: response.statusText,
        endpoint,
        error,
      });
    }
    
    throw new Error(`CDEK API error (${response.status}): ${error.message || error.error_description || JSON.stringify(error)}`);
  }

  const data = await response.json();
  return data as T;
}

// ==================== 2. ПОЛУЧИТЬ СПИСОК ЛОКАЦИЙ ====================

export interface Region {
  country_codes?: string[];
  region_code?: string;
  region?: string;
  country?: string;
  country_code?: string;
}

export interface City {
  code?: number;
  city?: string;
  city_uuid?: string;
  fias_region_code?: string;
  fias_region_guid?: string;
  region?: string;
  region_code?: number;
  country?: string;
  country_code?: string;
  kladr_region_code?: string;
  longitude?: number;
  latitude?: number;
  time_zone?: string;
  payment_limit?: number;
}

/**
 * GET /v2/location/regions
 * Получить список регионов
 */
export async function getCdekRegions(params?: {
  country_codes?: string[];
  region_code?: string;
  region?: string;
  page?: number;
  size?: number;
}): Promise<Region[]> {
  try {
    const searchParams = new URLSearchParams();
    if (params?.country_codes) {
      params.country_codes.forEach(code => searchParams.append('country_codes', code));
    }
    if (params?.region_code) searchParams.set('region_code', params.region_code);
    if (params?.region) searchParams.set('region', params.region);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.size) searchParams.set('size', params.size.toString());

    const query = searchParams.toString();
    return await cdekRequest<Region[]>(`GET`, `/location/regions${query ? `?${query}` : ''}`);
  } catch (error) {
    console.error('Error fetching CDEK regions:', error);
    throw error;
  }
}

/**
 * GET /v2/location/suggest/cities
 * Поиск городов (автодополнение)
 */
export async function getCdekCitiesSuggest(query: string, params?: {
  country_codes?: string[];
  size?: number;
  fias_region_guid?: string;
  kladr_region_code?: string;
  fias_region_code?: string;
  region_code?: number;
}): Promise<City[]> {
  try {
    const searchParams = new URLSearchParams({ q: query });
    if (params?.country_codes) {
      params.country_codes.forEach(code => searchParams.append('country_codes', code));
    }
    if (params?.size) searchParams.set('size', params.size.toString());
    if (params?.fias_region_guid) searchParams.set('fias_region_guid', params.fias_region_guid);
    if (params?.kladr_region_code) searchParams.set('kladr_region_code', params.kladr_region_code);
    if (params?.fias_region_code) searchParams.set('fias_region_code', params.fias_region_code);
    if (params?.region_code) searchParams.set('region_code', params.region_code.toString());

    return await cdekRequest<City[]>(`GET`, `/location/suggest/cities?${searchParams.toString()}`);
  } catch (error) {
    console.error('Error fetching CDEK cities suggest:', error);
    throw error;
  }
}

/**
 * GET /v2/location/cities
 * Получить список городов
 */
export async function getCdekCities(params?: {
  country_codes?: string[];
  region_code?: number;
  fias_region_guid?: string;
  kladr_region_code?: string;
  fias_region_code?: string;
  page?: number;
  size?: number;
  lang?: string;
}): Promise<City[]> {
  try {
    const searchParams = new URLSearchParams();
    if (params?.country_codes) {
      params.country_codes.forEach(code => searchParams.append('country_codes', code));
    }
    if (params?.region_code) searchParams.set('region_code', params.region_code.toString());
    if (params?.fias_region_guid) searchParams.set('fias_region_guid', params.fias_region_guid);
    if (params?.kladr_region_code) searchParams.set('kladr_region_code', params.kladr_region_code);
    if (params?.fias_region_code) searchParams.set('fias_region_code', params.fias_region_code);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.size) searchParams.set('size', params.size.toString());
    if (params?.lang) searchParams.set('lang', params.lang);

    const query = searchParams.toString();
    return await cdekRequest<City[]>(`GET`, `/location/cities${query ? `?${query}` : ''}`);
  } catch (error) {
    console.error('Error fetching CDEK cities:', error);
    throw error;
  }
}

/**
 * GET /v2/location/postcodes
 * Получить список почтовых индексов
 */
export async function getCdekPostcodes(params?: {
  country_codes?: string[];
  region_code?: number;
  city?: string;
  postcode?: string;
  page?: number;
  size?: number;
}): Promise<any[]> {
  try {
    const searchParams = new URLSearchParams();
    if (params?.country_codes) {
      params.country_codes.forEach(code => searchParams.append('country_codes', code));
    }
    if (params?.region_code) searchParams.set('region_code', params.region_code.toString());
    if (params?.city) searchParams.set('city', params.city);
    if (params?.postcode) searchParams.set('postcode', params.postcode);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.size) searchParams.set('size', params.size.toString());

    const query = searchParams.toString();
    return await cdekRequest<any[]>(`GET`, `/location/postcodes${query ? `?${query}` : ''}`);
  } catch (error) {
    console.error('Error fetching CDEK postcodes:', error);
    throw error;
  }
}

// ==================== 3. ПОЛУЧИТЬ СПИСОК ОФИСОВ ====================

export interface DeliveryPoint {
  code: string;
  name: string;
  location?: Location;
  address_comment?: string;
  nearest_station?: string;
  nearest_metro_station?: string;
  work_time?: string;
  phones?: Phone[];
  email?: string;
  note?: string;
  type?: string;
  owner_code?: string;
  take_only?: boolean;
  is_handout?: boolean;
  is_reception?: boolean;
  is_dressing_room?: boolean;
  have_cashless?: boolean;
  have_cash?: boolean;
  allowed_cod?: boolean;
  weight_min?: number;
  weight_max?: number;
  longitude?: number;
  latitude?: number;
}

/**
 * GET /v2/deliverypoints
 * Получить список пунктов выдачи заказов (ПВЗ)
 */
export async function getCdekPickupPoints(params?: {
  type?: string;
  city_code?: number;
  city?: string;
  region_code?: number;
  country_codes?: string[];
  postal_code?: string;
  fias_region_guid?: string;
  fias_city_guid?: string;
  code?: string;
  page?: number;
  size?: number;
  lang?: string;
}): Promise<DeliveryPoint[]> {
  // Если нет учетных данных, выбрасываем ошибку
  if (!clientId || !clientSecret) {
    throw new Error('CDEK credentials not configured. Please set CDEK_CLIENT_ID and CDEK_CLIENT_SECRET in environment variables.');
  }

  try {

    const searchParams = new URLSearchParams();
    if (params?.type) searchParams.set('type', params.type);
    if (params?.city_code) searchParams.set('city_code', params.city_code.toString());
    if (params?.city) searchParams.set('city', params.city);
    if (params?.region_code) searchParams.set('region_code', params.region_code.toString());
    if (params?.country_codes) {
      params.country_codes.forEach(code => searchParams.append('country_codes', code));
    }
    if (params?.postal_code) searchParams.set('postal_code', params.postal_code);
    if (params?.fias_region_guid) searchParams.set('fias_region_guid', params.fias_region_guid);
    if (params?.fias_city_guid) searchParams.set('fias_city_guid', params.fias_city_guid);
    if (params?.code) searchParams.set('code', params.code);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.size) searchParams.set('size', params.size.toString());
    if (params?.lang) searchParams.set('lang', params.lang);

    const query = searchParams.toString();
    const response = await cdekRequest<any>(
      `GET`,
      `/deliverypoints${query ? `?${query}` : ''}`
    );
    
    // API может вернуть массив напрямую или объект с deliverypoints
    if (Array.isArray(response)) {
      return response as DeliveryPoint[];
    } else if (response.deliverypoints) {
      return response.deliverypoints as DeliveryPoint[];
    } else if (response.deliverypoint) {
      // Иногда возвращается deliverypoint (единственное число)
      return Array.isArray(response.deliverypoint) 
        ? response.deliverypoint as DeliveryPoint[]
        : [response.deliverypoint] as DeliveryPoint[];
    }
    
    // Если формат неожиданный, логируем и возвращаем пустой массив
    console.warn('[CDEK] Unexpected response format:', JSON.stringify(response).substring(0, 200));
    return [];
  } catch (error) {
    console.error('Error fetching CDEK pickup points:', error);
    throw error;
  }
}

// ==================== 4. РАСЧЁТ СТОИМОСТИ ДОСТАВКИ ====================

export interface TariffRequest {
  type?: number; // тип заказа (1 - интернет-магазин, 2 - доставка)
  date?: string; // date - дата планируемой передачи заказа
  currency?: number; // код валюты в формате ISO_4217 (по умолчанию 643 - рубли)
  lang?: string; // язык ответа (rus, eng, zho)
  from_location: Location;
  to_location: Location;
  packages: Package[];
  services?: Service[];
  tariff_code?: number; // код тарифа
}

export interface Tariff {
  tariff_code: number;
  tariff_name: string;
  tariff_description?: string;
  delivery_mode: number; // 1 - до склада, 2 - до двери
  delivery_sum: number; // float
  period_min: number; // integer
  period_max: number; // integer
  calendar_min?: number; // integer
  calendar_max?: number; // integer
}

export interface TariffResponse {
  tariff_codes?: Tariff[];
  errors?: Error[];
}

/**
 * POST /v2/calculator/tarifflist
 * Получить список доступных тарифов с расчетом стоимости
 * 
 * Согласно документации API СДЭК:
 * - type: 1 - интернет-магазин, 2 - доставка (по умолчанию 1)
 * - from_location: обязательно - населённый пункт отправления
 * - to_location: обязательно - населённый пункт получения
 * - packages: обязательно - места (упаковки) в заказе
 */
export async function getCdekTariffs(request: TariffRequest): Promise<Tariff[]> {
  // Если нет учетных данных, выбрасываем ошибку
  if (!clientId || !clientSecret) {
    throw new Error('CDEK credentials not configured. Please set CDEK_CLIENT_ID and CDEK_CLIENT_SECRET in environment variables.');
  }

  // Устанавливаем тип заказа по умолчанию (1 - интернет-магазин)
  if (!request.type) {
    request.type = 1;
  }

  // Если передан только город без кода, пытаемся найти код города
  if (request.to_location.city && !request.to_location.code) {
    try {
      const cities = await getCdekCitiesSuggest(request.to_location.city, { size: 1 });
      if (cities.length > 0 && cities[0].code) {
        request.to_location.code = cities[0].code;
        if (!request.to_location.address) {
          request.to_location.address = cities[0].city || request.to_location.city;
        }
      }
    } catch (error) {
      console.warn('[CDEK] Failed to find city code, using city name:', error);
    }
  }

  if (request.from_location.city && !request.from_location.code) {
    try {
      const cities = await getCdekCitiesSuggest(request.from_location.city, { size: 1 });
      if (cities.length > 0 && cities[0].code) {
        request.from_location.code = cities[0].code;
        if (!request.from_location.address) {
          request.from_location.address = cities[0].city || request.from_location.city;
        }
      }
    } catch (error) {
      console.warn('[CDEK] Failed to find city code, using city name:', error);
    }
  }

  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('[CDEK Debug] Tariff request:', JSON.stringify(request, null, 2));
    }

    const response = await cdekRequest<TariffResponse>(
      'POST',
      '/calculator/tarifflist',
      request
    );

    if (response.errors && response.errors.length > 0) {
      throw new Error(`CDEK tariff calculation error: ${response.errors.map(e => e.message).join(', ')}`);
    }

    return response.tariff_codes || [];
  } catch (error) {
    console.error('Error fetching CDEK tariffs:', error);
    throw error;
  }
}

/**
 * POST /v2/calculator/tariff
 * Расчет стоимости доставки по конкретному тарифу
 */
export async function calculateCdekTariff(request: TariffRequest): Promise<Tariff> {
  try {
    if (!request.tariff_code) {
      throw new Error('tariff_code is required for tariff calculation');
    }

    const response = await cdekRequest<Tariff>(
      'POST',
      '/calculator/tariff',
      request
    );

    return response;
  } catch (error) {
    console.error('Error calculating CDEK tariff:', error);
    throw error;
  }
}

// ==================== 5. ПРОВЕРКА ОГРАНИЧЕНИЙ ====================

/**
 * POST /v2/international/package/restrictions
 * Проверка ограничений по международным заказам
 */
export async function checkInternationalRestrictions(packages: Package[]): Promise<any> {
  try {
    return await cdekRequest('POST', '/international/package/restrictions', { packages });
  } catch (error) {
    console.error('Error checking international restrictions:', error);
    throw error;
  }
}

// ==================== 6-10. РАБОТА С ЗАКАЗАМИ ====================

export interface OrderRequest {
  type?: number; // тип заказа
  number?: string; // номер заказа в системе клиента
  tariff_code: number; // код тарифа
  comment?: string;
  shipment_point?: string; // код пункта приёма
  delivery_point?: string; // код пункта выдачи
  date?: string; // date - дата планируемой передачи заказа
  recipient: Contact;
  sender: Contact;
  from_location: Location;
  to_location: Location;
  packages: Package[];
  services?: Service[];
  seller?: Seller;
  delivery_recipient_cost?: Money;
  delivery_recipient_cost_adv?: Money[];
  recipient_currency?: string; // код валюты получателя
  items_currency?: string; // код валюты товаров
  threshold?: Threshold[];
}

export interface OrderResponse {
  request_uuid?: string;
  type?: string;
  cdek_number?: string;
  number?: string;
  tariff_code?: number;
  comment?: string;
  state?: Status;
  errors?: Error[];
  warnings?: any[];
  shipment_point?: string;
  delivery_point?: string;
  delivery_recipient_cost?: Money;
  delivery_recipient_cost_adv?: Money[];
  recipient_currency?: string;
  items_currency?: string;
  related_entities?: any[];
  from_location?: Location;
  to_location?: Location;
  recipient?: Contact;
  sender?: Contact;
  services?: Service[];
  packages?: Package[];
  seller?: Seller;
  threshold?: Threshold[];
}

/**
 * POST /v2/orders
 * Регистрация заказа
 */
export async function createCdekOrder(order: OrderRequest): Promise<OrderResponse> {
  try {
    if (!clientId || !clientSecret) {
      // Моковый ответ для разработки
      return {
        cdek_number: `CDEK-${Date.now()}`,
        number: order.number || `ORDER-${Date.now()}`,
        tariff_code: order.tariff_code,
        state: {
          code: 'ACCEPTED',
          name: 'Принят',
          date_time: new Date().toISOString(),
        },
      };
    }

    return await cdekRequest<OrderResponse>('POST', '/orders', order);
  } catch (error) {
    console.error('Error creating CDEK order:', error);
    throw error;
  }
}

/**
 * PATCH /v2/orders/{uuid}
 * Изменить заказ
 */
export async function updateCdekOrder(uuid: string, order: Partial<OrderRequest>): Promise<OrderResponse> {
  try {
    return await cdekRequest<OrderResponse>('PATCH', `/orders/${uuid}`, order);
  } catch (error) {
    console.error('Error updating CDEK order:', error);
    throw error;
  }
}

/**
 * GET /v2/orders
 * Получить список заказов
 */
export async function getCdekOrders(params?: {
  cdek_number?: string;
  order_number?: string;
  im_number?: string;
  date?: string;
  date_from?: string;
  date_to?: string;
  type?: number;
  state?: string;
  size?: number;
  page?: number;
}): Promise<OrderResponse[]> {
  try {
    const searchParams = new URLSearchParams();
    if (params?.cdek_number) searchParams.set('cdek_number', params.cdek_number);
    if (params?.order_number) searchParams.set('order_number', params.order_number);
    if (params?.im_number) searchParams.set('im_number', params.im_number);
    if (params?.date) searchParams.set('date', params.date);
    if (params?.date_from) searchParams.set('date_from', params.date_from);
    if (params?.date_to) searchParams.set('date_to', params.date_to);
    if (params?.type) searchParams.set('type', params.type.toString());
    if (params?.state) searchParams.set('state', params.state);
    if (params?.size) searchParams.set('size', params.size.toString());
    if (params?.page) searchParams.set('page', params.page.toString());

    const query = searchParams.toString();
    const response = await cdekRequest<{ requests: OrderResponse[] }>(
      'GET',
      `/orders${query ? `?${query}` : ''}`
    );
    return response.requests || [];
  } catch (error) {
    console.error('Error fetching CDEK orders:', error);
    throw error;
  }
}

/**
 * GET /v2/orders/{uuid}
 * Получить информацию по заказу
 */
export async function getCdekOrder(uuid: string): Promise<OrderResponse> {
  try {
    return await cdekRequest<OrderResponse>('GET', `/orders/${uuid}`);
  } catch (error) {
    console.error('Error fetching CDEK order:', error);
    throw error;
  }
}

/**
 * DELETE /v2/orders/{uuid}
 * Удалить заказ
 */
export async function deleteCdekOrder(uuid: string): Promise<void> {
  try {
    await cdekRequest('DELETE', `/orders/${uuid}`);
  } catch (error) {
    console.error('Error deleting CDEK order:', error);
    throw error;
  }
}

/**
 * POST /v2/orders/{uuid}/refusal
 * Зарегистрировать отказ от заказа
 */
export async function refuseCdekOrder(uuid: string, reason?: string): Promise<OrderResponse> {
  try {
    return await cdekRequest<OrderResponse>('POST', `/orders/${uuid}/refusal`, { reason });
  } catch (error) {
    console.error('Error refusing CDEK order:', error);
    throw error;
  }
}

// ==================== УДОБНЫЕ ФУНКЦИИ (для обратной совместимости) ====================

/**
 * Удобная функция для получения тарифов (старый формат)
 * 
 * @param fromCity - город отправления
 * @param toCity - город получения
 * @param weight - вес в граммах (по умолчанию 1000г = 1кг)
 * @param length - длина в см (по умолчанию 20)
 * @param width - ширина в см (по умолчанию 15)
 * @param height - высота в см (по умолчанию 10)
 */
export async function getCdekTariffsSimple(
  fromCity: string,
  toCity: string,
  weight: number = 1000,
  length: number = 20,
  width: number = 15,
  height: number = 10
): Promise<Tariff[]> {
  return getCdekTariffs({
    type: 1, // интернет-магазин
    from_location: { city: fromCity, address: fromCity },
    to_location: { city: toCity, address: toCity },
    packages: [{ 
      number: '1', 
      weight,
      length,
      width,
      height,
    }],
  });
}

/**
 * Удобная функция для получения пунктов выдачи (старый формат)
 */
export async function getCdekPickupPointsSimple(city: string): Promise<DeliveryPoint[]> {
  try {
    return await getCdekPickupPoints({ city });
  } catch (error: any) {
    console.error('[CDEK] Error in getCdekPickupPointsSimple:', error);
    throw error;
  }
}

// ==================== СОЗДАНИЕ ЗАКАЗА ДЛЯ ИНТЕРНЕТ-МАГАЗИНА ====================

export interface CreateShopOrderParams {
  // Данные о заказе
  orderId: string;           // ID заказа в нашей системе
  tariffCode: number;        // Код тарифа СДЭК
  
  // Отправитель (магазин)
  senderCity: string;        // Город отправителя
  senderAddress: string;     // Адрес отправителя
  senderName: string;        // Название магазина
  senderPhone: string;       // Телефон магазина
  
  // Получатель
  recipientName: string;     // ФИО получателя
  recipientPhone: string;    // Телефон получателя
  recipientEmail?: string;   // Email получателя
  
  // Место доставки
  deliveryPointCode?: string; // Код пункта выдачи (для доставки до ПВЗ)
  deliveryCity?: string;      // Город доставки (для курьерской)
  deliveryAddress?: string;   // Адрес доставки (для курьерской)
  
  // Товары
  items: Array<{
    name: string;
    ware_key: string;     // Артикул
    cost: number;         // Стоимость товара
    weight: number;       // Вес в граммах
    amount: number;       // Количество
  }>;
  
  // Дополнительно
  comment?: string;
}

/**
 * Создание заказа в СДЭК для интернет-магазина
 */
export async function createShopOrder(params: CreateShopOrderParams): Promise<OrderResponse> {
  console.log('[CDEK] Creating shop order:', params.orderId);
  
  // Определяем тип доставки по наличию кода пункта выдачи
  const isToOffice = !!params.deliveryPointCode;
  
  // Формируем товары с payment = 0 (предоплата)
  const items: Item[] = params.items.map((item, index) => ({
    name: item.name.substring(0, 255),
    ware_key: item.ware_key.substring(0, 20),
    payment: { value: 0 }, // Предоплата - наложенный платёж не нужен
    cost: item.cost,
    weight: item.weight,
    amount: item.amount,
  }));
  
  // Общий вес
  const totalWeight = params.items.reduce((sum, item) => sum + item.weight * item.amount, 0);
  
  // Формируем запрос
  const orderRequest: OrderRequest = {
    type: 1, // Интернет-магазин
    number: params.orderId.substring(0, 40), // Номер заказа в нашей системе
    tariff_code: params.tariffCode,
    comment: params.comment || `Заказ ${params.orderId}`,
    
    // Отправитель
    sender: {
      name: params.senderName,
      phones: [{ number: params.senderPhone }],
    },
    
    // Получатель
    recipient: {
      name: params.recipientName,
      phones: [{ number: params.recipientPhone }],
      email: params.recipientEmail,
    },
    
    // Место отправления
    from_location: {
      city: params.senderCity,
      address: params.senderAddress,
    },
    
    // Место назначения
    to_location: isToOffice 
      ? { code: parseInt(params.deliveryPointCode!.replace(/\D/g, '')) || undefined, address: params.deliveryAddress || '' }
      : { city: params.deliveryCity, address: params.deliveryAddress || '' },
    
    // Упаковка с товарами
    packages: [{
      number: '1',
      weight: totalWeight,
      length: 30,
      width: 20,
      height: 10,
      items,
    }],
  };
  
  // Если доставка до ПВЗ - добавляем код пункта
  if (isToOffice && params.deliveryPointCode) {
    orderRequest.delivery_point = params.deliveryPointCode;
  }
  
  console.log('[CDEK] Order request:', JSON.stringify(orderRequest, null, 2));
  
  try {
    const response = await createCdekOrder(orderRequest);
    console.log('[CDEK] Order created:', response);
    return response;
  } catch (error: any) {
    console.error('[CDEK] Error creating order:', error);
    throw error;
  }
}
