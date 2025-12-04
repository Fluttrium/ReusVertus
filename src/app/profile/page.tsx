"use client";

import HeaderNavigation from "@/components/HeaderNavigation";
import Footer from "@/components/Footer";
import EmailSubscription from "@/components/EmailSubscription";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import Image from "next/image";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  size: string | null;
  color: string | null;
  product: {
    id: string;
    name: string;
    code: string;
    imageUrl: string | null;
  };
}

interface Order {
  id: string;
  status: string;
  paymentStatus: string | null;
  total: number;
  address: string | null;
  phone: string | null;
  email: string | null;
  createdAt: string;
  orderItems: OrderItem[];
}

const FALLBACK_PRODUCT_IMAGE = "/shirt/shirt1.png";

const getStatusText = (status: string, paymentStatus: string | null) => {
  if (paymentStatus === "succeeded" || status === "paid") {
    return { text: "Оплачен", color: "text-green-600" };
  }
  if (paymentStatus === "pending" || status === "awaiting_payment") {
    return { text: "Ожидает оплаты", color: "text-yellow-600" };
  }
  if (paymentStatus === "canceled" || status === "payment_failed") {
    return { text: "Отменен", color: "text-red-600" };
  }
  return { text: "В обработке", color: "text-gray-600" };
};

export default function ProfilePage() {
  const { user, login, register, logout, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Состояния для заказов
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  // Загружаем заказы при авторизации
  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    if (!user) return;
    
    setOrdersLoading(true);
    setOrdersError(null);
    
    try {
      const response = await fetch("/api/orders", {
        headers: {
          "x-user-id": user.id,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      } else {
        setOrdersError("Ошибка при загрузке заказов");
      }
    } catch (error) {
      console.error("Error loading orders:", error);
      setOrdersError("Ошибка при загрузке заказов");
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (isLoginMode) {
        await login(email, password);
        // Очистить форму только при успешном входе
        setEmail("");
        setPassword("");
        setName("");
        setError("");
      } else {
        await register(email, password, name || undefined);
        // Очистить форму только при успешной регистрации
        setEmail("");
        setPassword("");
        setName("");
        setError("");
      }
    } catch (err: any) {
      // Показываем понятное сообщение об ошибке
      const errorMessage = err.message || "Произошла ошибка";
      setError(errorMessage);
      // Не очищаем пароль при ошибке, чтобы пользователь мог попробовать снова
      if (errorMessage.includes("пароль") || errorMessage.includes("email")) {
        setPassword(""); // Очищаем пароль для безопасности
      }
    } finally {
      setIsSubmitting(false);
    }
  };


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

  return (
    <div className="min-h-screen bg-bg-1 flex flex-col">
      <HeaderNavigation className="py-6" />
      <div className="h-2 bg-black/10 sm:hidden" aria-hidden="true" />

      <div className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {/* Плашка авторизации */}
        {!user ? (
          <div className="bg-bg-2 rounded-lg p-8 mb-12">
            <h1 className="text-2xl uppercase mb-2 text-center">Профиль</h1>
            <div className="h-[2px] bg-black/15 w-full sm:w-4/5 sm:max-w-md mx-auto mb-6" aria-hidden="true" />
            <div className="flex gap-4 justify-center mb-6">
              <button
                onClick={() => {
                  setIsLoginMode(true);
                  setError("");
                }}
                className={`px-4 py-2 uppercase text-sm transition-colors ${
                  isLoginMode
                    ? "border-b-2 border-black font-medium"
                    : "opacity-50 hover:opacity-100"
                }`}
              >
                Войти
              </button>
              <button
                onClick={() => {
                  setIsLoginMode(false);
                  setError("");
                }}
                className={`px-4 py-2 uppercase text-sm transition-colors ${
                  !isLoginMode
                    ? "border-b-2 border-black font-medium"
                    : "opacity-50 hover:opacity-100"
                }`}
              >
                Зарегистрироваться
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="max-w-md mx-auto space-y-4">
              {!isLoginMode && (
                <div>
                  <label className="block text-sm uppercase mb-2">Имя</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-black/20 rounded-lg focus:outline-none focus:border-bg-4 uppercase text-sm"
                    placeholder="Ваше имя"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm uppercase mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-black/20 rounded-lg focus:outline-none focus:border-bg-4 uppercase text-sm"
                  placeholder="Ваш email"
                />
              </div>
              <div>
                <label className="block text-sm uppercase mb-2">Пароль</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-black/20 rounded-lg focus:outline-none focus:border-bg-4 uppercase text-sm"
                  placeholder="Пароль"
                />
              </div>
              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 text-red-700 text-sm text-center">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-bg-4 text-white px-6 py-3 uppercase hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isSubmitting
                  ? "Обработка..."
                  : isLoginMode
                  ? "Войти"
                  : "Зарегистрироваться"}
              </button>
            </form>
          </div>
        ) : (
          <div className="mb-12">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl uppercase">Профиль</h1>
              <button
                onClick={logout}
                className="px-4 py-2 border-2 border-black/20 uppercase text-sm hover:border-black/40 transition-colors"
              >
                Выйти
              </button>
            </div>
            <div className="space-y-4 bg-bg-2 rounded-lg p-6 mb-8">
              <p>
                <span className="font-medium uppercase">Email:</span> {user.email}
              </p>
              {user.name && (
                <p>
                  <span className="font-medium uppercase">Имя:</span> {user.name}
                </p>
              )}
            </div>

            {/* Секция "Мои заказы" */}
            <div className="mb-12">
              <h2 className="text-2xl uppercase mb-6">Мои заказы</h2>
              
              {ordersLoading ? (
                <div className="text-center py-12">
                  <p className="opacity-70 uppercase">Загрузка заказов...</p>
                </div>
              ) : ordersError ? (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 text-red-700 text-sm text-center">
                  {ordersError}
                </div>
              ) : orders.length === 0 ? (
                <div className="bg-bg-2 rounded-lg p-8 text-center">
                  <p className="opacity-70 uppercase mb-4">Заказов нет</p>
                  <Link
                    href="/"
                    className="inline-block bg-bg-4 text-white px-6 py-3 uppercase hover:opacity-90 transition-opacity"
                  >
                    Перейти к покупкам
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => {
                    const statusInfo = getStatusText(order.status, order.paymentStatus);
                    const firstItem = order.orderItems[0];
                    const itemsCount = order.orderItems.length;
                    
                    return (
                      <Link
                        key={order.id}
                        href={`/order/${order.id}`}
                        className="block bg-bg-2 rounded-lg p-6 hover:bg-bg-2/80 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                          {/* Изображение первого товара */}
                          {firstItem?.product?.imageUrl && (
                            <div className="relative w-24 h-24 sm:w-20 sm:h-20 flex-shrink-0 bg-white rounded">
                              <Image
                                src={firstItem.product.imageUrl || FALLBACK_PRODUCT_IMAGE}
                                alt={firstItem.product.name || "Товар"}
                                fill
                                className="object-contain rounded"
                              />
                            </div>
                          )}
                          
                          {/* Информация о заказе */}
                          <div className="flex-grow min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                              <div>
                                <p className="font-medium uppercase text-sm opacity-70">
                                  Заказ #{order.id.substring(0, 8).toUpperCase()}
                                </p>
                                <p className="text-xs opacity-60 mt-1">
                                  {new Date(order.createdAt).toLocaleDateString("ru-RU", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                              <span className={`font-semibold uppercase text-sm ${statusInfo.color}`}>
                                {statusInfo.text}
                              </span>
                            </div>
                            
                            <div className="text-sm opacity-70">
                              <p>
                                {itemsCount === 1
                                  ? `1 товар`
                                  : `${itemsCount} товара`}
                                {" • "}
                                {order.total.toLocaleString("ru-RU")} ₽
                              </p>
                              {firstItem && (
                                <p className="mt-1 truncate">
                                  {firstItem.product.name}
                                  {itemsCount > 1 && ` и еще ${itemsCount - 1}`}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          {/* Стрелка */}
                          <div className="flex-shrink-0 text-bg-4 opacity-50">
                            <svg
                              className="w-6 h-6"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Блок №2: Скидка за подписку на имейл */}
        <EmailSubscription />
      </div>

      {/* Блок №3: Подвал */}
      <Footer />
    </div>
  );
}
