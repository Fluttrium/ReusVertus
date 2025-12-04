"use client";

import HeaderNavigation from "@/components/HeaderNavigation";
import Footer from "@/components/Footer";
import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import type { CdekDeliveryData } from "@/components/CdekWidget";

// Динамический импорт официального виджета СДЭК без SSR
const CdekWidgetDynamic = dynamic(() => import("@/components/CdekWidget"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-green-50 flex items-center justify-center rounded-xl border-2 border-green-200">
      <div className="text-center">
        <div className="animate-spin w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-green-800 font-medium">Загрузка виджета СДЭК...</p>
      </div>
    </div>
  ),
});

interface CartItem {
  id: string;
  quantity: number;
  size: string | null;
  color: string | null;
  product: {
    id: string;
    name: string;
    code: string;
    price: number;
    imageUrl: string | null;
  };
}

interface DeliveryTariff {
  tariff_code: number;
  tariff_name: string;
  tariff_description: string;
  delivery_mode: number;
  delivery_sum: number;
  period_min: number;
  period_max: number;
}

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

const FALLBACK_PRODUCT_IMAGE = "/shirt/shirt1.png";

const formatProductName = (name: string) =>
  name
    .replace(/женская/gi, "")
    .replace(/футболка/gi, "")
    .replace(/sheert/gi, "shirt")
    .replace(/\s+/g, " ")
    .trim();

const getProductImageSrc = (url: string | null) => {
  if (!url) return FALLBACK_PRODUCT_IMAGE;
  try {
    return encodeURI(url);
  } catch {
    return url.replace(/ /g, "%20");
  }
};

export default function CheckoutPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOrdering, setIsOrdering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Данные для оформления заказа
  const [orderData, setOrderData] = useState({
    recipientName: "", // ФИО получателя для СДЭК
    address: "",
    city: "",
    phone: "",
    email: user?.email || "",
    deliveryType: "cdek" as "cdek" | "courier",
    pickupPointCode: "",
  });

  // Данные из виджета СДЭК
  const [cdekData, setCdekData] = useState<CdekDeliveryData | null>(null);

  // Данные СДЭК (для обратной совместимости)
  const [deliveryTariffs, setDeliveryTariffs] = useState<DeliveryTariff[]>([]);
  const [pickupPoints, setPickupPoints] = useState<PickupPoint[]>([]);
  const [selectedTariff, setSelectedTariff] = useState<DeliveryTariff | null>(null);
  const [selectedPickupPoint, setSelectedPickupPoint] = useState<PickupPoint | null>(null);
  const [isLoadingDelivery, setIsLoadingDelivery] = useState(false);
  const [citySuggestions, setCitySuggestions] = useState<Array<{ name: string; code?: number; region?: string }>>([]);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  
  // Ref для debounce таймера
  const citySearchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Обработчик выбора в виджете СДЭК
  const handleCdekSelect = useCallback((data: CdekDeliveryData) => {
    console.log("[Checkout] CDEK selection:", data);
    setCdekData(data);
    
    // Обновляем данные заказа в зависимости от режима доставки
    if (data.mode === 'office' && data.office) {
      // Доставка до пункта выдачи
      setOrderData(prev => ({
        ...prev,
        city: data.office!.city,
        address: data.office!.address,
        pickupPointCode: data.office!.code,
        deliveryType: "cdek",
      }));
    } else if (data.mode === 'door' && data.door) {
      // Доставка до двери курьером
      setOrderData(prev => ({
        ...prev,
        city: data.door!.city,
        address: data.door!.formatted || data.door!.name,
        pickupPointCode: "",
        deliveryType: "courier",
      }));
    }
    
    // Обновляем тариф
    if (data.tariff) {
      setSelectedTariff({
        tariff_code: data.tariff.tariff_code,
        tariff_name: data.tariff.tariff_name,
        tariff_description: data.tariff.tariff_description || "",
        delivery_mode: data.tariff.delivery_mode,
        delivery_sum: data.tariff.delivery_sum,
        period_min: data.tariff.period_min,
        period_max: data.tariff.period_max,
      });
    }
  }, []);

  useEffect(() => {
    if (!user) {
      router.push("/cart");
      return;
    }
    loadCart();
  }, [user]);

  useEffect(() => {
    if (orderData.city && orderData.deliveryType === "cdek") {
      loadDeliveryOptions();
    }
  }, [orderData.city, orderData.deliveryType]);

  // Автодополнение городов с debounce (300мс задержка)
  const loadCitySuggestions = useCallback((query: string) => {
    // Очищаем предыдущий таймер
    if (citySearchTimeoutRef.current) {
      clearTimeout(citySearchTimeoutRef.current);
    }

    if (query.length < 2) {
      setCitySuggestions([]);
      setShowCitySuggestions(false);
      setIsLoadingCities(false);
      return;
    }

    setIsLoadingCities(true);

    // Устанавливаем новый таймер с задержкой 300мс
    citySearchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/delivery/cdek?action=cities&q=${encodeURIComponent(query)}`);
        if (response.ok) {
          const data = await response.json();
          const queryLower = query.toLowerCase().trim();
          
          // Фильтруем города, которые содержат введенный запрос
          const cities = (data.cities || [])
            .filter((c: any) => {
              const cityName = (c.city || c.name || '').toLowerCase();
              return cityName.includes(queryLower);
            })
            .slice(0, 8)
            .map((c: any) => ({
              name: c.city || c.name || '',
              code: c.code,
              region: c.region,
            }));
          
          setCitySuggestions(cities);
          setShowCitySuggestions(cities.length > 0);
        }
      } catch (error) {
        console.error("Error loading city suggestions:", error);
      } finally {
        setIsLoadingCities(false);
      }
    }, 300); // 300мс задержка
  }, []);

  const loadCart = async () => {
    try {
      if (user) {
        const response = await fetch("/api/cart", {
          headers: {
            "x-user-id": user.id,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setCartItems(data.cartItems || []);
          if (data.cartItems.length === 0) {
            router.push("/cart");
          }
        } else {
          setError("Ошибка при загрузке корзины");
        }
      }
    } catch (error) {
      console.error("Error loading cart:", error);
      setError("Ошибка при загрузке корзины");
    } finally {
      setIsLoading(false);
    }
  };

  const loadDeliveryOptions = async () => {
    if (!orderData.city || orderData.city.trim().length < 2) {
      return; // Не загружаем, если город слишком короткий
    }

    setIsLoadingDelivery(true);
    setError(null);
    try {
      // Сначала загружаем пункты выдачи (они более терпимы к названиям городов)
      const pointsResponse = await fetch("/api/delivery/cdek", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ city: orderData.city }),
      });
      if (pointsResponse.ok) {
        const pointsData = await pointsResponse.json();
        setPickupPoints(pointsData.pickupPoints || []);
      } else {
        const errorData = await pointsResponse.json().catch(() => ({ error: 'Ошибка загрузки пунктов выдачи' }));
        console.error("Failed to load CDEK pickup points:", errorData);
        // Не показываем ошибку пользователю, просто оставляем пустой список
      }

      // Затем загружаем тарифы доставки
      const tariffsResponse = await fetch(
        `/api/delivery/cdek?fromCity=Москва&toCity=${encodeURIComponent(orderData.city)}&weight=1000`
      );
      if (tariffsResponse.ok) {
        const tariffsData = await tariffsResponse.json();
        setDeliveryTariffs(tariffsData.tariffs || []);
        if (tariffsData.tariffs.length > 0) {
          setSelectedTariff(tariffsData.tariffs[0]);
        }
      } else {
        // Ошибка расчета тарифов не критична, просто не показываем тарифы
        console.warn("Failed to load CDEK tariffs");
        setDeliveryTariffs([]);
      }
    } catch (error) {
      console.error("Error loading delivery options:", error);
      // Не показываем ошибку пользователю, чтобы не блокировать оформление
    } finally {
      setIsLoadingDelivery(false);
    }
  };

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsOrdering(true);
    try {
      // Формируем адрес доставки
      let deliveryAddress = orderData.address;
      if (cdekData?.mode === 'office' && cdekData.office) {
        deliveryAddress = `ПВЗ СДЭК ${cdekData.office.code}: ${cdekData.office.city}, ${cdekData.office.address}`;
      } else if (cdekData?.mode === 'door' && cdekData.door) {
        deliveryAddress = `Курьер СДЭК: ${cdekData.door.city}, ${cdekData.door.formatted || cdekData.door.name}`;
      }

      // Стоимость доставки
      const deliveryCost = cdekData?.tariff?.delivery_sum || 0;

      // Создаем платеж через ЮКассу
      const response = await fetch("/api/payments/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
        },
        body: JSON.stringify({
          recipientName: orderData.recipientName,
          address: deliveryAddress,
          phone: orderData.phone,
          email: orderData.email,
          deliveryCost: deliveryCost,
          deliveryType: cdekData?.mode || orderData.deliveryType,
          deliveryTariff: cdekData?.tariff?.tariff_name,
          deliveryPointCode: cdekData?.office?.code || null,
          deliveryTariffCode: cdekData?.tariff?.tariff_code || null,
          deliveryCity: cdekData?.office?.city || cdekData?.door?.city || orderData.city,
          deliveryCityCode: cdekData?.office?.city_code || null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Перенаправляем на страницу оплаты ЮКассы
        if (data.confirmationUrl) {
          window.location.href = data.confirmationUrl;
        } else {
          alert("Ошибка: не получена ссылка для оплаты");
        }
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.error || "Ошибка при создании платежа";
        
        if (response.status === 401) {
          alert(`Ошибка авторизации: ${errorMessage}\n\nПроверьте настройки ЮКассы в переменных окружения.`);
        } else {
          alert(errorMessage);
        }
      }
    } catch (error) {
      console.error("Error creating payment:", error);
      alert("Ошибка при создании платежа");
    } finally {
      setIsOrdering(false);
    }
  };

  const total = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const deliveryCost = selectedTariff ? selectedTariff.delivery_sum : 0;
  const finalTotal = total + deliveryCost;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-1 flex flex-col">
        <HeaderNavigation className="py-6" />
        <div className="flex-grow flex items-center justify-center">
          <p>Загрузка...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-bg-1 flex flex-col">
        <HeaderNavigation className="py-6" />
        <div className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
          <div className="text-center py-12">
            <p className="opacity-70 mb-6 uppercase">{error || "Корзина пуста"}</p>
            <Link
              href="/cart"
              className="inline-block bg-bg-4 text-white px-6 py-3 uppercase hover:opacity-90 transition-opacity"
            >
              Вернуться в корзину
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-1 flex flex-col">
      <HeaderNavigation className="py-6" />

      <form onSubmit={handleOrder} className="flex-grow w-full">
        {/* Верхняя секция с контактами и корзиной */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <Link
              href="/cart"
              className="text-sm uppercase opacity-70 hover:opacity-100 transition-opacity"
            >
              ← Вернуться в корзину
            </Link>
          </div>

          <h1 className="text-2xl uppercase mb-8">Оформление заказа</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Контактные данные */}
            <div className="bg-white border-2 border-black/10 p-6 rounded-lg space-y-4">
              <h2 className="text-xl uppercase border-b-2 border-black/20 pb-3 font-semibold">
                Данные получателя
              </h2>
              
              <div>
                <label className="block text-sm uppercase mb-2 font-medium">ФИО получателя *</label>
                <input
                  type="text"
                  value={orderData.recipientName}
                  onChange={(e) =>
                    setOrderData({ ...orderData, recipientName: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 border-2 border-black/20 rounded-lg focus:outline-none focus:border-bg-4 focus:ring-2 focus:ring-bg-4/20 transition-all text-sm"
                  placeholder="Иванов Иван Иванович"
                />
              </div>

              <div>
                <label className="block text-sm uppercase mb-2 font-medium">Email *</label>
                <input
                  type="email"
                  value={orderData.email}
                  onChange={(e) =>
                    setOrderData({ ...orderData, email: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 border-2 border-black/20 rounded-lg focus:outline-none focus:border-bg-4 focus:ring-2 focus:ring-bg-4/20 transition-all text-sm"
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm uppercase mb-2 font-medium">Телефон *</label>
                <input
                  type="tel"
                  value={orderData.phone}
                  onChange={(e) =>
                    setOrderData({ ...orderData, phone: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 border-2 border-black/20 rounded-lg focus:outline-none focus:border-bg-4 focus:ring-2 focus:ring-bg-4/20 transition-all text-sm"
                  placeholder="+7 (XXX) XXX-XX-XX"
                />
              </div>
            </div>

            {/* Сводка заказа */}
            <div className="lg:col-span-2 bg-bg-2 p-6 rounded-lg">
              <h2 className="text-xl uppercase border-b border-black/20 pb-2 mb-4">
                Ваш заказ
              </h2>

              {/* Товары */}
              <div className="space-y-3 max-h-[200px] overflow-y-auto mb-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative w-14 h-14 bg-bg-1 rounded overflow-hidden flex-shrink-0">
                      {item.product.imageUrl ? (
                        <Image
                          src={getProductImageSrc(item.product.imageUrl)}
                          alt={formatProductName(item.product.name)}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      ) : (
                        <Image
                          src={FALLBACK_PRODUCT_IMAGE}
                          alt="Изображение товара"
                          fill
                          sizes="56px"
                          className="object-cover opacity-80"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm uppercase font-medium truncate">
                        {formatProductName(item.product.name)}
                      </h3>
                      {item.size && (
                        <p className="text-xs opacity-60">Размер: {item.size}</p>
                      )}
                      <p className="text-sm">
                        {item.product.price} ₽ × {item.quantity}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-semibold">
                        {item.product.price * item.quantity} ₽
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Итого */}
              <div className="border-t border-black/20 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="opacity-70">Товары:</span>
                  <span>{total} ₽</span>
                </div>
                {cdekData?.tariff && (
                  <div className="flex justify-between text-sm">
                    <span className="opacity-70">Доставка СДЭК:</span>
                    <span>{cdekData.tariff.delivery_sum} ₽</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-black/20">
                  <span className="text-lg uppercase font-semibold">Итого:</span>
                  <span className="text-2xl font-bold">
                    {cdekData?.tariff
                      ? (total + cdekData.tariff.delivery_sum).toLocaleString('ru-RU')
                      : total.toLocaleString('ru-RU')} ₽
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Виджет СДЭК на всю ширину */}
        <div className="bg-white border-y-2 border-black/10 py-8">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl uppercase font-semibold">
                Выберите способ доставки СДЭК
              </h2>
              {cdekData && (
                <span className="text-sm bg-green-100 text-green-700 px-4 py-2 rounded-full font-medium">
                  ✓ {cdekData.mode === 'office' ? 'Пункт выдачи выбран' : 'Доставка до двери'}
                </span>
              )}
            </div>
            
            {/* Виджет СДЭК */}
            <CdekWidgetDynamic
              fromCity="Москва"
              defaultCity={orderData.city || "Москва"}
              onSelect={handleCdekSelect}
              goods={[{ width: 20, height: 15, length: 10, weight: 1 }]}
            />

            {/* Информация о выбранном пункте */}
            {cdekData && (
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Информация о выбранном пункте выдачи */}
                {cdekData.mode === 'office' && cdekData.office && (
                  <div className="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-300 rounded-xl p-5 shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded font-medium">
                            Пункт выдачи
                          </span>
                          <span className="text-xs text-green-600">{cdekData.office.type}</span>
                        </div>
                        <p className="font-bold text-green-800 mb-1">{cdekData.office.name}</p>
                        <p className="text-sm text-green-700">
                          {cdekData.office.city}, {cdekData.office.address}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {cdekData.office.work_time && (
                            <span className="inline-flex items-center gap-1.5 text-xs text-green-600 bg-white px-2 py-1 rounded-full">
                              🕐 {cdekData.office.work_time}
                            </span>
                          )}
                          {cdekData.office.have_cash && (
                            <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-white px-2 py-1 rounded-full">
                              💵 Наличные
                            </span>
                          )}
                          {cdekData.office.have_cashless && (
                            <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-white px-2 py-1 rounded-full">
                              💳 Карта
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Информация о доставке до двери */}
                {cdekData.mode === 'door' && cdekData.door && (
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl p-5 shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded font-medium">
                          До двери
                        </span>
                        <p className="font-bold text-blue-800 mb-1 mt-1">Курьерская доставка</p>
                        <p className="text-sm text-blue-700">
                          {cdekData.door.city}, {cdekData.door.formatted || cdekData.door.name}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Информация о тарифе */}
                {cdekData.tariff && (
                  <div className="bg-white border-2 border-gray-200 rounded-xl p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Выбранный тариф</p>
                        <p className="font-semibold text-gray-800">{cdekData.tariff.tariff_name}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {cdekData.tariff.period_min === cdekData.tariff.period_max 
                            ? `${cdekData.tariff.period_min} дней` 
                            : `${cdekData.tariff.period_min}-${cdekData.tariff.period_max} дней`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500 mb-1">Стоимость</p>
                        <p className="font-bold text-2xl text-green-600">{cdekData.tariff.delivery_sum.toLocaleString('ru-RU')} ₽</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Кнопка оформления */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-md mx-auto">
            <div className="bg-white border-2 border-black/10 p-6 rounded-lg">
              <div className="mb-4 text-xs opacity-70 text-center">
                Все транзакции защищены и зашифрованы
              </div>
              <button
                type="submit"
                disabled={isOrdering || !cdekData}
                className="w-full bg-bg-4 text-white py-4 px-6 uppercase font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {isOrdering ? "Переход к оплате..." : "Перейти к оплате"}
              </button>
              {!cdekData && (
                <p className="text-center text-sm text-orange-600 mt-3">
                  Выберите способ доставки в виджете СДЭК выше
                </p>
              )}
            </div>
          </div>
        </div>
      </form>

      <Footer />
    </div>
  );
}
