import { NextRequest, NextResponse } from 'next/server';
import {
  getCdekTariffsSimple,
  getCdekPickupPointsSimple,
  getCdekTariffs,
  getCdekPickupPoints,
  getCdekCitiesSuggest,
  getCdekCities,
  getCdekRegions,
} from '@/lib/cdek';

/**
 * GET /api/delivery/cdek?fromCity=Москва&toCity=Санкт-Петербург&weight=1000
 * Получить тарифы доставки СДЭК (простой формат)
 * 
 * GET /api/delivery/cdek?action=tariffs&fromCity=Москва&toCity=Санкт-Петербург&weight=1000
 * Получить тарифы доставки СДЭК (полный формат)
 * 
 * GET /api/delivery/cdek?action=cities&q=Москва
 * Поиск городов (автодополнение)
 * 
 * GET /api/delivery/cdek?action=regions
 * Получить список регионов
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    // Поиск городов
    if (action === 'cities') {
      const query = searchParams.get('q');
      if (!query) {
        return NextResponse.json(
          { error: 'Параметр q (query) обязателен для поиска городов' },
          { status: 400 }
        );
      }
      // Ограничиваем количество результатов и фильтруем по запросу
      const cities = await getCdekCitiesSuggest(query, { size: 20 });
      
      // Дополнительная фильтрация на бэкенде для надежности
      const queryLower = query.toLowerCase().trim();
      const filteredCities = cities.filter((city: any) => {
        const cityName = (city.city || city.name || '').toLowerCase();
        return cityName.includes(queryLower);
      }).slice(0, 10); // Ограничиваем до 10 результатов
      
      return NextResponse.json({ cities: filteredCities }, { status: 200 });
    }

    // Список регионов
    if (action === 'regions') {
      const country_codes = searchParams.get('country_codes')?.split(',');
      const region = searchParams.get('region');
      const regions = await getCdekRegions({
        country_codes,
        region: region || undefined,
      });
      return NextResponse.json({ regions }, { status: 200 });
    }

    // Полный формат тарифов
    if (action === 'tariffs') {
      const fromCity = searchParams.get('fromCity');
      const toCity = searchParams.get('toCity');
      const weight = parseInt(searchParams.get('weight') || '1000');

      if (!fromCity || !toCity) {
        return NextResponse.json(
          { error: 'Города отправления и получения обязательны' },
          { status: 400 }
        );
      }

      try {
        const tariffs = await getCdekTariffs({
          from_location: { city: fromCity, address: fromCity },
          to_location: { city: toCity, address: toCity },
          packages: [{ number: '1', weight }],
        });

        return NextResponse.json({ tariffs }, { status: 200 });
      } catch (error: any) {
        console.error('Get CDEK tariffs error:', error);
        // Возвращаем пустой массив вместо ошибки, чтобы не блокировать оформление
        return NextResponse.json({ tariffs: [] }, { status: 200 });
      }
    }

    // Простой формат тарифов (для обратной совместимости)
    const fromCity = searchParams.get('fromCity') || 'Москва';
    const toCity = searchParams.get('toCity');
    const weight = parseInt(searchParams.get('weight') || '1000');

    if (!toCity) {
      return NextResponse.json(
        { error: 'Город получателя обязателен' },
        { status: 400 }
      );
    }

    try {
      const tariffs = await getCdekTariffsSimple(fromCity, toCity, weight);
      return NextResponse.json({ tariffs }, { status: 200 });
    } catch (error: any) {
      console.error('Get CDEK tariffs error:', error);
      // Возвращаем пустой массив вместо ошибки, чтобы не блокировать оформление
      return NextResponse.json({ tariffs: [] }, { status: 200 });
    }
  } catch (error: any) {
    console.error('Get CDEK data error:', error);
    return NextResponse.json(
      { error: error.message || 'Ошибка при получении данных СДЭК' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/delivery/cdek
 * Получить список пунктов выдачи заказов
 * Body: { city: "Москва" }
 * 
 * POST /api/delivery/cdek?action=pickup-points
 * Получить список пунктов выдачи (расширенный формат)
 * Body: { city?: string, city_code?: number, type?: string, ... }
 */
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const body = await request.json();

    // Расширенный формат получения ПВЗ
    if (action === 'pickup-points') {
      const pickupPoints = await getCdekPickupPoints(body);
      return NextResponse.json({ pickupPoints }, { status: 200 });
    }

    // Простой формат (для обратной совместимости)
    const { city } = body;

    if (!city) {
      return NextResponse.json(
        { error: 'Город обязателен' },
        { status: 400 }
      );
    }

    const pickupPoints = await getCdekPickupPointsSimple(city);
    return NextResponse.json({ pickupPoints }, { status: 200 });
  } catch (error: any) {
    console.error('Get CDEK pickup points error:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { 
        error: error.message || 'Ошибка при получении пунктов выдачи',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
