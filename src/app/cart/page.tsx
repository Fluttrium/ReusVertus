"use client";

import HeaderNavigation from "@/components/HeaderNavigation";
import Footer from "@/components/Footer";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";

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

export default function CartPage() {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCart();
  }, [user]);

  const loadCart = async () => {
    try {
      if (user) {
        // Авторизованный пользователь - загружаем с сервера
        const response = await fetch("/api/cart", {
          headers: {
            "x-user-id": user.id,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setCartItems(data.cartItems || []);
          setError(null);
        } else {
          setError("Ошибка при загрузке корзины");
        }
      } else {
        // Неавторизованный пользователь - загружаем из localStorage
        try {
          const localCart = JSON.parse(localStorage.getItem("cart") || "[]");
          setCartItems(localCart);
          setError(null);
        } catch (error) {
          console.error("Error reading from localStorage:", error);
          setCartItems([]);
          setError(null);
        }
      }
    } catch (error) {
      console.error("Error loading cart:", error);
      setError("Ошибка при загрузке корзины");
    } finally {
      setIsLoading(false);
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      if (user) {
        // Авторизованный пользователь - удаляем на сервере
        const response = await fetch(`/api/cart?itemId=${itemId}`, {
          method: "DELETE",
          headers: {
            "x-user-id": user.id,
          },
        });

        if (response.ok) {
          loadCart();
        }
      } else {
        // Неавторизованный пользователь - удаляем из localStorage
        try {
          const localCart = JSON.parse(localStorage.getItem("cart") || "[]");
          const updatedCart = localCart.filter((item: any, index: number) => index.toString() !== itemId);
          localStorage.setItem("cart", JSON.stringify(updatedCart));
          loadCart();
        } catch (error) {
          console.error("Error removing from localStorage:", error);
        }
      }
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return;

    try {
      if (user) {
        // Авторизованный пользователь - обновляем на сервере
        const response = await fetch("/api/cart", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": user.id,
          },
          body: JSON.stringify({ itemId, quantity }),
        });

        if (response.ok) {
          loadCart();
        }
      } else {
        // Неавторизованный пользователь - обновляем в localStorage
        try {
          const localCart = JSON.parse(localStorage.getItem("cart") || "[]");
          const index = parseInt(itemId);
          if (localCart[index]) {
            localCart[index].quantity = quantity;
            localStorage.setItem("cart", JSON.stringify(localCart));
            loadCart();
          }
        } catch (error) {
          console.error("Error updating localStorage:", error);
        }
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };


  const total = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

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

  if (error) {
    return (
      <div className="min-h-screen bg-bg-1 flex flex-col">
        <HeaderNavigation className="py-6" />
        <div className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
          <div className="text-center py-12">
            <p className="opacity-70 mb-6 uppercase">{error}</p>
            <button
              onClick={() => {
                setError(null);
                loadCart();
              }}
              className="inline-block bg-bg-4 text-white px-6 py-3 uppercase hover:opacity-90 transition-opacity"
            >
              Попробовать снова
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-1 flex flex-col">
      <HeaderNavigation className="py-6" />

      <div className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <h1 className="text-2xl uppercase mb-8">Корзина</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="opacity-70 mb-6">Корзина пуста</p>
            <Link
              href="/"
              className="inline-block bg-bg-4 text-white px-6 py-3 uppercase hover:opacity-90 transition-opacity"
            >
              Перейти к покупкам
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Товары в корзине */}
            {cartItems.map((item, index) => (
              <div
                key={user ? item.id : `cart-item-${index}-${item.product.id}-${item.size || ''}-${item.color || ''}`}
                className="flex gap-4 border-b border-black/10 pb-6"
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
                  {item.size && (
                    <p className="text-xs opacity-60 mt-1">Размер: {item.size}</p>
                  )}
                </div>
                <button
                  onClick={() => removeItem(user ? item.id : index.toString())}
                  className="text-sm underline opacity-70 hover:opacity-100 self-start"
                >
                  Удалить
                </button>
              </div>
            ))}

            {/* Итого */}
            <div className="border-t border-black/20 pt-6 space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-xl uppercase">Итого:</span>
                <span className="text-2xl font-semibold">{total} ₽</span>
              </div>

              {/* Кнопка перехода к оформлению */}
              {user ? (
                <Link
                  href="/checkout"
                  className="block w-full bg-bg-4 text-white py-4 px-6 uppercase hover:opacity-90 transition-opacity text-center"
                >
                  Перейти к оформлению заказа
                </Link>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm opacity-70 text-center">
                    Для оформления заказа необходимо войти в аккаунт
                  </p>
                  <Link
                    href="/profile"
                    className="block w-full bg-bg-4 text-white py-4 px-6 uppercase hover:opacity-90 transition-opacity text-center"
                  >
                    Войти
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
