"use client";

import HeaderNavigation from "@/components/HeaderNavigation";
import Footer from "@/components/Footer";
import { useState, useEffect, Suspense } from "react";
import { useParams } from "next/navigation";
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

function OrderContent() {
  const params = useParams();
  const { user } = useAuth();
  const orderId = params.id as string;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderId && user) {
      loadOrder();
    } else if (!user) {
      setError("Необходима авторизация");
      setIsLoading(false);
    }
  }, [orderId, user]);

  const loadOrder = async () => {
    try {
      const response = await fetch("/api/orders", {
        headers: {
          "x-user-id": user!.id,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const foundOrder = data.orders.find((o: Order) => o.id === orderId);
        
        if (foundOrder) {
          setOrder(foundOrder);
        } else {
          setError("Заказ не найден");
        }
      } else {
        setError("Ошибка при загрузке заказа");
      }
    } catch (error) {
      console.error("Error loading order:", error);
      setError("Ошибка при загрузке заказа");
    } finally {
      setIsLoading(false);
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

  if (error || !order) {
    return (
      <div className="min-h-screen bg-bg-1 flex flex-col">
        <HeaderNavigation className="py-6" />
        <div className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
          <div className="text-center py-12">
            <p className="opacity-70 mb-6 uppercase">{error || "Заказ не найден"}</p>
            <Link
              href="/profile"
              className="inline-block bg-bg-4 text-white px-6 py-3 uppercase hover:opacity-90 transition-opacity"
            >
              Вернуться к заказам
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const statusInfo = getStatusText(order.status, order.paymentStatus);

  return (
    <div className="min-h-screen bg-bg-1 flex flex-col">
      <HeaderNavigation className="py-6" />

      <div className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="mb-8">
          <Link
            href="/profile"
            className="text-sm uppercase opacity-70 hover:opacity-100 transition-opacity"
          >
            ← Вернуться к заказам
          </Link>
        </div>

        <h1 className="text-2xl uppercase mb-8">Заказ #{order.id.substring(0, 8).toUpperCase()}</h1>

        <div className="space-y-6">
          {/* Статус заказа */}
          <div className="bg-bg-2 p-6 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm uppercase opacity-70">Статус заказа</span>
              <span className={`font-semibold uppercase ${statusInfo.color}`}>
                {statusInfo.text}
              </span>
            </div>
            <div className="mt-4 text-sm opacity-70">
              <p>Дата создания: {new Date(order.createdAt).toLocaleString("ru-RU")}</p>
            </div>
          </div>

          {/* Товары в заказе */}
          <div className="space-y-4">
            <h2 className="text-xl uppercase">Товары</h2>
            {order.orderItems.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 border-b border-black/10 pb-4"
              >
                <div className="relative w-24 h-24 bg-bg-2 rounded overflow-hidden flex items-center justify-center">
                  {item.product.imageUrl ? (
                    <Image
                      src={getProductImageSrc(item.product.imageUrl)}
                      alt={formatProductName(item.product.name)}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  ) : (
                    <Image
                      src={FALLBACK_PRODUCT_IMAGE}
                      alt="Изображение товара"
                      fill
                      sizes="96px"
                      className="object-cover opacity-80"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <Link
                    href={`/product/${item.product.id}`}
                    className="hover:opacity-70 transition-opacity"
                  >
                    <h3 className="uppercase font-medium">
                      {formatProductName(item.product.name)}
                    </h3>
                  </Link>
                  <p className="text-xs opacity-60 mt-1">Код: {item.product.code}</p>
                  {item.size && (
                    <p className="text-xs opacity-60">Размер: {item.size}</p>
                  )}
                  {item.color && (
                    <p className="text-xs opacity-60">Цвет: {item.color}</p>
                  )}
                  <p className="text-sm mt-2">Количество: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{item.price * item.quantity} ₽</p>
                  <p className="text-xs opacity-60">{item.price} ₽ × {item.quantity}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Информация о доставке */}
          <div className="bg-bg-2 p-6 rounded-lg space-y-4">
            <h2 className="text-xl uppercase">Информация о доставке</h2>
            {order.address && (
              <div>
                <span className="text-sm uppercase opacity-70">Адрес:</span>
                <p className="mt-1">{order.address}</p>
              </div>
            )}
            {order.phone && (
              <div>
                <span className="text-sm uppercase opacity-70">Телефон:</span>
                <p className="mt-1">{order.phone}</p>
              </div>
            )}
            {order.email && (
              <div>
                <span className="text-sm uppercase opacity-70">Email:</span>
                <p className="mt-1">{order.email}</p>
              </div>
            )}
          </div>

          {/* Итого */}
          <div className="border-t border-black/20 pt-6">
            <div className="flex justify-between items-center">
              <span className="text-xl uppercase">Итого:</span>
              <span className="text-2xl font-semibold">{order.total} ₽</span>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function OrderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg-1 flex flex-col">
        <HeaderNavigation className="py-6" />
        <div className="flex-grow flex items-center justify-center">
          <p>Загрузка...</p>
        </div>
        <Footer />
      </div>
    }>
      <OrderContent />
    </Suspense>
  );
}
