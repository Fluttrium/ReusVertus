"use client";

import HeaderNavigation from "@/components/HeaderNavigation";
import Footer from "@/components/Footer";
import EmailSubscription from "@/components/EmailSubscription";
import { useState, useEffect } from "react";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

interface Favorite {
  id: string;
  product: {
    id: string;
    name: string;
    code: string;
    price: number;
    imageUrl: string | null;
    sizes: string[] | null;
  };
}

export default function FavoritesPage() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadFavorites();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const loadFavorites = async () => {
    if (!user) return;

    try {
      const response = await fetch("/api/favorites", {
        headers: {
          "x-user-id": user.id,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFavorites(data.favorites || []);
        setError(null);
      } else {
        setError("Ошибка при загрузке избранного");
      }
    } catch (error) {
      console.error("Error loading favorites:", error);
      setError("Ошибка при загрузке избранного");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFavorite = async (productId: string) => {
    if (!user) return;

    try {
      const response = await fetch(`/api/favorites?productId=${productId}`, {
        method: "DELETE",
        headers: {
          "x-user-id": user.id,
        },
      });

      if (response.ok) {
        // Удалить из локального состояния
        setFavorites(favorites.filter((fav) => fav.product.id !== productId));
      }
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  };

  return (
    <div className="min-h-screen bg-bg-1 flex flex-col">
      <HeaderNavigation className="py-6" />

      <div className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="opacity-70 uppercase">Загрузка...</p>
          </div>
        ) : !user ? (
          <div className="text-center py-12">
            <p className="opacity-70 mb-6">
              Для просмотра избранного необходимо войти в аккаунт
            </p>
            <Link
              href="/profile"
              className="inline-block bg-bg-4 text-white px-6 py-3 uppercase hover:opacity-90 transition-opacity"
            >
              Войти
            </Link>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="opacity-70 mb-6 uppercase">{error}</p>
            <button
              onClick={loadFavorites}
              className="inline-block bg-bg-4 text-white px-6 py-3 uppercase hover:opacity-90 transition-opacity"
            >
              Попробовать снова
            </button>
          </div>
        ) : favorites.length === 0 ? (
          <>
            {/* Плашка - пустое избранное */}
            <div className="bg-bg-2 rounded-lg p-8 mb-12 text-center">
              <h2 className="text-2xl uppercase mb-4">Салют, прохожий!</h2>
              <p className="opacity-80 mb-6 leading-relaxed">
                Место для твоих избранных пустует. Нажимай на кнопку и выбирай то, что попадет в твое сердечко.
              </p>
              <Link
                href="/"
                className="inline-block bg-bg-4 text-white px-6 py-3 uppercase hover:opacity-90 transition-opacity"
              >
                Пройтись по улице
              </Link>
            </div>

            {/* Блок №2: Скидка за подписку на имейл */}
            <EmailSubscription />
          </>
        ) : (
          <>
            {/* Карточки товаров */}
            <div className="mb-12">
            
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map((favorite) => (
                  <div key={favorite.id} className="relative group">
                    <ProductCard
                      id={favorite.product.id}
                      name={favorite.product.name}
                      code={favorite.product.code}
                      price={favorite.product.price}
                      image={favorite.product.imageUrl || undefined}
                    />
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleRemoveFavorite(favorite.product.id);
                      }}
                      className="absolute top-2 right-2 p-2 bg-white/80 hover:bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      aria-label="Удалить из избранного"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-red-600"
                      >
                        <path
                          d="M17.5 3.33334C17.058 2.89134 16.517 2.55934 15.925 2.36334C15.333 2.16734 14.705 2.11234 14.089 2.20334C13.473 2.29434 12.884 2.52834 12.366 2.88934C11.848 3.25034 11.414 3.72834 11.1 4.28534L10 6.66667L8.9 4.28534C8.586 3.72834 8.152 3.25034 7.634 2.88934C7.116 2.52834 6.527 2.29434 5.911 2.20334C5.295 2.11234 4.667 2.16734 4.075 2.36334C3.483 2.55934 2.942 2.89134 2.5 3.33334C1.916 3.91734 1.467 4.62034 1.185 5.39334C0.903 6.16634 0.794 6.99034 0.866 7.80634C0.938 8.62234 1.189 9.41134 1.6 10.12C2.011 10.8287 2.573 11.4387 3.243 11.9053L10 17.5L16.757 11.9053C17.427 11.4387 17.989 10.8287 18.4 10.12C18.811 9.41134 19.062 8.62234 19.134 7.80634C19.206 6.99034 19.097 6.16634 18.815 5.39334C18.533 4.62034 18.084 3.91734 17.5 3.33334Z"
                          fill="currentColor"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Блок №2: Скидка за подписку на имейл */}
            <EmailSubscription />
          </>
        )}
      </div>

      {/* Блок №3: Подвал */}
      <Footer />
    </div>
  );
}


