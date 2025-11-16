"use client";

import HeaderNavigation from "@/components/HeaderNavigation";
import Footer from "@/components/Footer";
import EmailSubscription from "@/components/EmailSubscription";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function ProfilePage() {
  const { user, login, register, logout, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
            <h2 className="text-2xl uppercase mb-2 text-center">Профиль</h2>
            <div className="h-[2px] bg-black/15 w-3/4 max-w-xs mx-auto mb-6" aria-hidden="true" />
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
            <div className="space-y-4 bg-bg-2 rounded-lg p-6">
              <p>
                <span className="font-medium uppercase">Email:</span> {user.email}
              </p>
              {user.name && (
                <p>
                  <span className="font-medium uppercase">Имя:</span> {user.name}
                </p>
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
