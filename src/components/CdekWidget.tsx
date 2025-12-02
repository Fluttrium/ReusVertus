"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface CdekWidgetProps {
  fromCity?: string;
  onSelect: (data: CdekDeliveryData) => void;
  defaultCity?: string;
  goods?: Array<{
    width: number;
    height: number;
    length: number;
    weight: number;
  }>;
}

// Объект адреса для режима office
interface OfficeAddress {
  city_code: number;
  city: string;
  type: string;
  postal_code: string;
  country_code: string;
  have_cashless: boolean;
  have_cash: boolean;
  allowed_cod: boolean;
  is_dressing_room: boolean;
  code: string;
  name: string;
  address: string;
  work_time: string;
  location: number[];
}

// Объект адреса для режима door
interface DoorAddress {
  name: string;
  position: number[];
  kind: string;
  precision: string;
  formatted: string;
  postal_code: string;
  country_code: string;
  city: string;
}

// Объект тарифа
interface CdekTariff {
  tariff_code: number;
  tariff_name: string;
  tariff_description: string;
  delivery_mode: number;
  period_min: number;
  period_max: number;
  delivery_sum: number;
}

export interface CdekDeliveryData {
  mode: "office" | "door";
  tariff: CdekTariff;
  office?: OfficeAddress;
  door?: DoorAddress;
}

declare global {
  interface Window {
    CDEKWidget: any;
    __cdekWidgetInstance: any;
  }
}

export default function CdekWidget({
  fromCity = "Москва",
  onSelect,
  defaultCity = "",
  goods = [{ width: 20, height: 15, length: 10, weight: 1 }],
}: CdekWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initedRef = useRef(false);
  const onSelectRef = useRef(onSelect);
  
  // Обновляем ref при изменении onSelect
  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  // Стабильный ID для контейнера
  const widgetId = "cdek-widget-root";

  useEffect(() => {
    // Предотвращаем повторную инициализацию
    if (initedRef.current) return;
    
    let mounted = true;

    const loadScript = (): Promise<void> => {
      return new Promise((resolve, reject) => {
        // Если виджет уже загружен
        if (window.CDEKWidget) {
          resolve();
          return;
        }

        // Проверяем существующий скрипт
        const existingScript = document.querySelector('script[src*="@cdek-it/widget"]');
        if (existingScript) {
          // Ждём загрузки
          const checkLoaded = setInterval(() => {
            if (window.CDEKWidget) {
              clearInterval(checkLoaded);
              resolve();
            }
          }, 100);
          
          setTimeout(() => {
            clearInterval(checkLoaded);
            if (!window.CDEKWidget) {
              reject(new Error("Timeout waiting for CDEKWidget"));
            }
          }, 10000);
          return;
        }

        // Загружаем скрипт
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/@cdek-it/widget@3";
        script.charset = "utf-8";
        script.async = true;
        script.onload = () => {
          // Даём время на инициализацию
          setTimeout(() => {
            if (window.CDEKWidget) {
              resolve();
            } else {
              reject(new Error("CDEKWidget not defined after load"));
            }
          }, 100);
        };
        script.onerror = () => reject(new Error("Failed to load CDEK widget script"));
        document.head.appendChild(script);
      });
    };

    const initWidget = async () => {
      try {
        await loadScript();
        
        if (!mounted) return;

        // Проверяем, нет ли уже виджета
        if (window.__cdekWidgetInstance) {
          setIsLoading(false);
          return;
        }

        const yandexApiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY || "";
        
        console.log('[CDEK Widget] Initializing...');
        console.log('[CDEK Widget] Yandex API key:', yandexApiKey ? `${yandexApiKey.substring(0, 8)}...` : 'NOT SET');

        // Подготавливаем goods с правильным весом (в граммах)
        const preparedGoods = goods.map(g => ({
          width: g.width,
          height: g.height,
          length: g.length,
          weight: g.weight < 100 ? g.weight * 1000 : g.weight,
        }));

        window.__cdekWidgetInstance = new window.CDEKWidget({
          from: {
            country_code: 'RU',
            city: fromCity,
            code: 44, // Москва
          },
          root: widgetId,
          apiKey: yandexApiKey,
          canChoose: true,
          servicePath: '/api/cdek-service',
          hideFilters: {
            have_cashless: false,
            have_cash: false,
            is_dressing_room: false,
            type: false,
          },
          hideDeliveryOptions: {
            office: false,
            door: false,
          },
          debug: false, // Отключаем debug чтобы уменьшить логи
          goods: preparedGoods,
          defaultLocation: [55.7558, 37.6173],
          lang: 'rus',
          currency: 'RUB',
          tariffs: {
            office: [234, 136, 138],
            door: [233, 137, 139],
          },
          onReady: () => {
            console.log('[CDEK Widget] Ready');
            if (mounted) {
              setIsLoading(false);
              initedRef.current = true;
            }
          },
          onCalculate: (tariffs: any, address: any) => {
            console.log('[CDEK Widget] Calculate:', { tariffs, address });
          },
          onChoose: (
            mode: 'door' | 'office',
            tariff: CdekTariff,
            address: OfficeAddress | DoorAddress
          ) => {
            console.log('[CDEK Widget] Choose:', { mode, tariff, address });
            
            const data: CdekDeliveryData = {
              mode,
              tariff,
            };

            if (mode === 'office') {
              data.office = address as OfficeAddress;
            } else {
              data.door = address as DoorAddress;
            }

            // Используем ref чтобы всегда иметь актуальный callback
            onSelectRef.current(data);
          },
        });
      } catch (err: any) {
        console.error("Error initializing CDEK widget:", err);
        if (mounted) {
          setError(err.message || "Ошибка загрузки виджета");
          setIsLoading(false);
        }
      }
    };

    initWidget();

    return () => {
      mounted = false;
      // Не уничтожаем виджет при unmount, чтобы избежать проблем со Strict Mode
    };
  }, []); // Пустой массив зависимостей - инициализируем только один раз

  if (error) {
    return (
      <div 
        className="w-full bg-red-50 border-2 border-red-200 rounded-xl flex items-center justify-center"
        style={{ height: '600px' }}
      >
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <p className="text-red-800 font-medium mb-2">{error}</p>
          <p className="text-red-600 text-sm mb-4">Попробуйте обновить страницу</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
          >
            Обновить страницу
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div 
          className="absolute inset-0 bg-green-50 border-2 border-green-200 rounded-xl flex items-center justify-center z-10"
          style={{ height: '600px' }}
        >
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-green-800 font-medium">Загрузка виджета СДЭК...</p>
            <p className="text-green-600 text-sm mt-1">Пожалуйста, подождите</p>
          </div>
        </div>
      )}
      
      <div
        ref={containerRef}
        id={widgetId}
        className="w-full rounded-xl overflow-hidden border-2 border-gray-200"
        style={{ 
          width: '100%', 
          height: '600px',
          minHeight: '600px',
        }}
      />
    </div>
  );
}
