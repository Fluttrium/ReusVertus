"use client";

import HeaderNavigation from "@/components/HeaderNavigation";
import Footer from "@/components/Footer";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

interface OrderStatus {
  orderId: string;
  status: string;
  paymentStatus: string;
  total: number;
}

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [orderStatus, setOrderStatus] = useState<OrderStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError("ID заказа не найден");
      setIsLoading(false);
      return;
    }

    checkOrderStatus();
  }, [orderId]);

  const checkOrderStatus = async () => {
    try {
      const response = await fetch(`/api/payments/webhook?orderId=${orderId}`);
      
      if (response.ok) {
        const data = await response.json();
        setOrderStatus(data);
        
        // Если платеж еще в обработке, проверяем через 3 секунды
        if (data.paymentStatus === "pending" || data.paymentStatus === "waiting_for_capture") {
          setTimeout(checkOrderStatus, 3000);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Ошибка при проверке статуса заказа");
      }
    } catch (error) {
      console.error("Error checking order status:", error);
      setError("Ошибка при проверке статуса заказа");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusMessage = () => {
    if (!orderStatus) return null;

    switch (orderStatus.paymentStatus) {
      case "succeeded":
        return {
          icon: "✓",
          title: "Оплата прошла успешно!",
          message: "Спасибо за ваш заказ. Мы отправили подтверждение на вашу почту.",
          color: "text-green-600",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
        };
      case "pending":
      case "waiting_for_capture":
        return {
          icon: "⏳",
          title: "Обработка платежа...",
          message: "Ваш платеж обрабатывается. Пожалуйста, подождите.",
          color: "text-yellow-600",
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
        };
      case "canceled":
        return {
          icon: "✕",
          title: "Платеж отменен",
          message: "К сожалению, ваш платеж был отменен. Попробуйте еще раз.",
          color: "text-red-600",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
        };
      default:
        return {
          icon: "?",
          title: "Статус неизвестен",
          message: "Не удалось определить статус платежа. Свяжитесь с нами для уточнения.",
          color: "text-gray-600",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
        };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-1 flex flex-col">
        <HeaderNavigation className="py-6" />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bg-4 mx-auto mb-4"></div>
            <p className="uppercase">Проверяем статус оплаты...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg-1 flex flex-col">
        <HeaderNavigation className="py-6" />
        <div className="flex-grow max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
          <div className="text-center py-12">
            <div className="text-6xl mb-6">⚠️</div>
            <h1 className="text-2xl uppercase mb-4">Ошибка</h1>
            <p className="opacity-70 mb-8">{error}</p>
            <Link
              href="/"
              className="inline-block bg-bg-4 text-white px-6 py-3 uppercase hover:opacity-90 transition-opacity"
            >
              На главную
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const status = getStatusMessage();

  return (
    <div className="min-h-screen bg-bg-1 flex flex-col">
      <HeaderNavigation className="py-6" />

      <div className="flex-grow max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className={`${status?.bgColor} ${status?.borderColor} border-2 rounded-lg p-8 text-center`}>
          <div className={`text-6xl mb-6 ${status?.color}`}>{status?.icon}</div>
          <h1 className={`text-2xl uppercase mb-4 ${status?.color}`}>
            {status?.title}
          </h1>
          <p className="opacity-70 mb-6">{status?.message}</p>
          
          {orderStatus && (
            <div className="bg-white/50 rounded-lg p-4 mb-6">
              <p className="text-sm uppercase mb-2">Номер заказа</p>
              <p className="font-mono text-lg">{orderStatus.orderId.substring(0, 8).toUpperCase()}</p>
              <p className="text-xl font-semibold mt-4">{orderStatus.total} ₽</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {orderStatus?.paymentStatus === "succeeded" && orderStatus?.orderId && (
              <>
                <Link
                  href={`/order/${orderStatus.orderId}`}
                  className="inline-block bg-bg-4 text-white px-6 py-3 uppercase hover:opacity-90 transition-opacity"
                >
                  Посмотреть заказ
                </Link>
                <Link
                  href="/profile"
                  className="inline-block border-2 border-bg-4 text-bg-4 px-6 py-3 uppercase hover:bg-bg-4 hover:text-white transition-all"
                >
                  Мои заказы
                </Link>
              </>
            )}
            {orderStatus?.paymentStatus === "canceled" && (
              <Link
                href="/cart"
                className="inline-block bg-bg-4 text-white px-6 py-3 uppercase hover:opacity-90 transition-opacity"
              >
                Вернуться в корзину
              </Link>
            )}
            <Link
              href="/"
              className="inline-block border-2 border-bg-4 text-bg-4 px-6 py-3 uppercase hover:bg-bg-4 hover:text-white transition-all"
            >
              На главную
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg-1 flex flex-col">
        <HeaderNavigation className="py-6" />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bg-4 mx-auto mb-4"></div>
            <p className="uppercase">Загрузка...</p>
          </div>
        </div>
        <Footer />
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
