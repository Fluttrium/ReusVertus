"use client";

import { useEffect, useRef, useState } from "react";

interface PickupPoint {
  code: string;
  name: string;
  address?: string;
  location?: {
    address: string;
    city?: string;
  };
  work_time?: string;
  phones?: Array<{ number: string }>;
  latitude?: number;
  longitude?: number;
}

interface CdekMapProps {
  pickupPoints: PickupPoint[];
  selectedPointCode: string | null;
  onSelectPoint: (point: PickupPoint) => void;
  city: string;
}

declare global {
  interface Window {
    ymaps: any;
  }
}

export default function CdekMap({
  pickupPoints,
  selectedPointCode,
  onSelectPoint,
  city,
}: CdekMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<PickupPoint | null>(null);

  // Загрузка Яндекс Карт API
  useEffect(() => {
    // Если API уже загружен
    if (window.ymaps) {
      window.ymaps.ready(() => {
        setIsMapLoaded(true);
      });
      return;
    }

    // Проверяем, не загружается ли уже скрипт
    const existingScript = document.querySelector('script[src*="api-maps.yandex.ru"]');
    if (existingScript) {
      // Скрипт уже добавлен, ждём загрузки
      const checkYmaps = setInterval(() => {
        if (window.ymaps) {
          clearInterval(checkYmaps);
          window.ymaps.ready(() => {
            setIsMapLoaded(true);
          });
        }
      }, 100);
      return () => clearInterval(checkYmaps);
    }

    // Создаём и добавляем скрипт
    const script = document.createElement("script");
    script.src = "https://api-maps.yandex.ru/2.1/?apikey=&lang=ru_RU";
    script.async = true;
    script.onload = () => {
      window.ymaps.ready(() => {
        setIsMapLoaded(true);
      });
    };
    script.onerror = () => {
      console.error("Failed to load Yandex Maps API");
    };
    document.head.appendChild(script);
  }, []);

  // Инициализация карты
  useEffect(() => {
    if (!isMapLoaded || !mapContainerRef.current || pickupPoints.length === 0) return;

    const pointsWithCoords = pickupPoints.filter(
      (p) => p.latitude && p.longitude
    );
    if (pointsWithCoords.length === 0) return;

    // Вычисляем центр карты
    const lats = pointsWithCoords.map((p) => p.latitude!);
    const lons = pointsWithCoords.map((p) => p.longitude!);
    const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
    const centerLon = (Math.min(...lons) + Math.max(...lons)) / 2;

    // Определяем зум
    const latSpread = Math.max(...lats) - Math.min(...lats);
    const lonSpread = Math.max(...lons) - Math.min(...lons);
    const maxSpread = Math.max(latSpread, lonSpread);
    let zoom = 12;
    if (maxSpread > 0.5) zoom = 10;
    else if (maxSpread > 0.2) zoom = 11;
    else if (maxSpread > 0.1) zoom = 12;
    else if (maxSpread > 0.05) zoom = 13;
    else zoom = 14;

    // Удаляем старую карту
    if (mapRef.current) {
      mapRef.current.destroy();
      mapRef.current = null;
      markersRef.current = [];
    }

    // Создаём новую карту
    const map = new window.ymaps.Map(mapContainerRef.current, {
      center: [centerLat, centerLon],
      zoom: zoom,
      controls: ["zoomControl", "geolocationControl"],
    });
    mapRef.current = map;

    // Добавляем маркеры
    pointsWithCoords.forEach((point, index) => {
      const isSelected = point.code === selectedPointCode;

      const placemark = new window.ymaps.Placemark(
        [point.latitude, point.longitude],
        {
          balloonContentHeader: `<strong>${point.name}</strong>`,
          balloonContentBody: `
            <div style="font-size: 12px; line-height: 1.4;">
              <p style="margin: 4px 0;">${point.location?.address || point.address}</p>
              ${point.work_time ? `<p style="margin: 4px 0; color: #666;">🕐 ${point.work_time}</p>` : ""}
              ${point.phones?.[0]?.number ? `<p style="margin: 4px 0; color: #666;">📞 ${point.phones[0].number}</p>` : ""}
              <button 
                onclick="window.selectCdekPoint('${point.code}')"
                style="
                  margin-top: 8px;
                  padding: 8px 16px;
                  background: #00b33c;
                  color: white;
                  border: none;
                  border-radius: 4px;
                  cursor: pointer;
                  font-size: 12px;
                  width: 100%;
                "
              >
                Выбрать этот пункт
              </button>
            </div>
          `,
          hintContent: point.name,
        },
        {
          preset: isSelected ? "islands#greenDotIcon" : "islands#blueDotIcon",
          iconColor: isSelected ? "#00b33c" : "#1e88e5",
        }
      );

      placemark.events.add("click", () => {
        onSelectPoint(point);
      });

      placemark.events.add("mouseenter", () => {
        setHoveredPoint(point);
      });

      placemark.events.add("mouseleave", () => {
        setHoveredPoint(null);
      });

      map.geoObjects.add(placemark);
      markersRef.current.push({ placemark, point });
    });

    // Глобальная функция для выбора пункта из balloon
    (window as any).selectCdekPoint = (code: string) => {
      const point = pickupPoints.find((p) => p.code === code);
      if (point) {
        onSelectPoint(point);
        map.balloon.close();
      }
    };

    return () => {
      delete (window as any).selectCdekPoint;
    };
  }, [isMapLoaded, pickupPoints, city]);

  // Обновление выделения при изменении selectedPointCode
  useEffect(() => {
    if (!mapRef.current || markersRef.current.length === 0) return;

    markersRef.current.forEach(({ placemark, point }) => {
      const isSelected = point.code === selectedPointCode;
      placemark.options.set({
        preset: isSelected ? "islands#greenDotIcon" : "islands#blueDotIcon",
        iconColor: isSelected ? "#00b33c" : "#1e88e5",
      });
    });

    // Центрируем на выбранный пункт
    if (selectedPointCode) {
      const selected = markersRef.current.find(
        ({ point }) => point.code === selectedPointCode
      );
      if (selected && selected.point.latitude && selected.point.longitude) {
        mapRef.current.setCenter(
          [selected.point.latitude, selected.point.longitude],
          15,
          { duration: 300 }
        );
      }
    }
  }, [selectedPointCode]);

  const pointsWithCoords = pickupPoints.filter((p) => p.latitude && p.longitude);

  if (pointsWithCoords.length === 0) {
    return (
      <div className="w-full h-[450px] bg-gray-100 flex items-center justify-center rounded-lg border-2 border-gray-200">
        <p className="text-gray-500">Координаты пунктов выдачи недоступны</p>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* Карта */}
      <div
        ref={mapContainerRef}
        className="w-full h-[450px] rounded-lg border-2 border-black/10 overflow-hidden"
      />

      {/* Загрузка */}
      {!isMapLoaded && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center rounded-lg">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Загрузка карты...</p>
          </div>
        </div>
      )}

      {/* Информация о пункте при наведении */}
      {hoveredPoint && (
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 max-w-xs z-10 border border-gray-200">
          <p className="font-semibold text-sm text-green-700">{hoveredPoint.name}</p>
          <p className="text-xs text-gray-600 mt-1">
            {hoveredPoint.location?.address || hoveredPoint.address}
          </p>
        </div>
      )}

      {/* Счётчик пунктов */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg px-3 py-2 z-10 border border-gray-200">
        <p className="text-xs text-gray-600">
          <span className="font-semibold text-green-600">{pointsWithCoords.length}</span> пунктов выдачи в {city}
        </p>
      </div>
    </div>
  );
}
