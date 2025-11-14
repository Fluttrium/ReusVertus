"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function Footer() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 800);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Mobile version
  if (isMobile) {
    return (
      <footer className="bg-bg-4 text-white py-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="space-y-6">
            {/* Основные ссылки */}
            <div className="flex flex-col gap-4 text-sm uppercase">
              <Link href="/about" className="hover:opacity-70 transition-opacity">
                ABOUT
              </Link>
              <Link href="/contacts" className="hover:opacity-70 transition-opacity">
                CONTACTS
              </Link>
              <Link href="/faq" className="hover:opacity-70 transition-opacity">
                FAQ
              </Link>
            </div>

            {/* Соцсети */}
            <div className="flex gap-4 text-sm uppercase pt-4 border-t border-white/20">
              <Link
                href="https://instagram.com/reusvertes"
                target="_blank"
                className="hover:opacity-70 transition-opacity"
              >
                Instagram
              </Link>
              <Link
                href="https://t.me/reusvertes"
                target="_blank"
                className="hover:opacity-70 transition-opacity"
              >
                Telegram
              </Link>
              <Link
                href="https://vk.com/reusvertes"
                target="_blank"
                className="hover:opacity-70 transition-opacity"
              >
                VK
              </Link>
            </div>

            {/* Поддержка Фонда содействия инновациям */}
            <div className="pt-4 border-t border-white/20 space-y-4">
              <div className="flex items-center gap-3">
                <Image
                  src="/FASIE.svg"
                  alt="Фонд содействия инновациям"
                  width={100}
                  height={56}
                  className="h-auto"
                />
              </div>
              <p className="text-xs opacity-80 leading-relaxed">
                Проект реализован при поддержке Фонда содействия инновациям в рамках программы «Студенческий стартап» 
                мероприятия «Платформа университетского технологического предпринимательства» 
                федерального проекта «Технологии».
              </p>
            </div>

            {/* Информация о компании */}
            <div className="pt-4 border-t border-white/20 text-xs opacity-70">
              <p>© 2024 Reus Vertes. Все права защищены.</p>
            </div>
            </div>
          </div>
        </footer>
    );
  }

  // Desktop version
  return (
    <footer className="bg-bg-4 text-white py-6">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between flex-wrap gap-6">
          {/* Основные ссылки */}
          <div className="flex gap-6 text-sm uppercase">
            <Link href="/about" className="hover:opacity-70 transition-opacity">
              ABOUT
            </Link>
            <Link href="/contacts" className="hover:opacity-70 transition-opacity">
              CONTACTS
            </Link>
            <Link href="/faq" className="hover:opacity-70 transition-opacity">
              FAQ
            </Link>
          </div>

          {/* Соцсети */}
          <div className="flex gap-4 text-sm uppercase">
            <Link
              href="https://instagram.com/reusvertes"
              target="_blank"
              className="hover:opacity-70 transition-opacity"
            >
              Instagram
            </Link>
            <Link
              href="https://t.me/reusvertes"
              target="_blank"
              className="hover:opacity-70 transition-opacity"
            >
              Telegram
            </Link>
            <Link
              href="https://vk.com/reusvertes"
              target="_blank"
              className="hover:opacity-70 transition-opacity"
            >
              VK
                </Link>
              </div>
            </div>

        {/* Поддержка Фонда содействия инновациям */}
        <div className="mt-6 pt-6 border-t border-white/20 space-y-4">
          <div className="flex items-center gap-4">
            <Image
              src="/FASIE.svg"
              alt="Фонд содействия инновациям"
              width={120}
              height={68}
              className="h-auto"
            />
          </div>
          <p className="text-xs opacity-80 leading-relaxed max-w-3xl">
            Проект реализован при поддержке Фонда содействия инновациям в рамках программы «Студенческий стартап» 
            мероприятия «Платформа университетского технологического предпринимательства» 
            федерального проекта «Технологии».
          </p>
        </div>

        
        </div>
      </footer>
  );
}
