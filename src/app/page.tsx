import HeaderNavigation from "@/components/HeaderNavigation";
import Footer from "@/components/Footer";
import { EmailSubscriptionBeige } from "@/components/EmailSubscription";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

const featuredProductId = "RV-W-001";

export default function Home() {
  return (
    <div className="min-h-screen bg-bg-1">
        <HeaderNavigation className="py-6" />

      {/* Блок №1: Статичное фото - полноширинное */}
      <section className="relative w-full h-screen overflow-hidden flex items-center justify-center">
        <Image
          src="/IMG_1811%20(1)%20(1).jpg"
          alt="Зеленая улица с граффити и брендовыми коробками"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 flex flex-col items-center justify-center gap-2 sm:gap-4 md:gap-8 px-4 text-center translate-y-24 md:translate-y-20">
          <h1
            className="text-white text-3xl md:text-5xl lg:text-[4.5rem] font-bold uppercase tracking-[0.1em] leading-[1.3] whitespace-nowrap"
            style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontWeight: 700 }}
          >
            VRT SHIRT 001
          </h1>
          <h2
            className="text-sm md:text-2xl lg:text-[4.5rem] font-bold uppercase tracking-[0.1em] leading-[1.8]"
            style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontWeight: 600, color: 'var(--bg-1)' }}
          >
            {/* Мобильная версия */}
            <span className="block md:hidden">
              Сообщество дизайнеров и молодых{"\u00A0"}предпринимателей с уникальным{"\u00A0"}мировозрением, выражающих свои{"\u00A0"}ценности через стиль{"\u00A0"}одежды. Пространство для тех, кто творит и{"\u00A0"}вдохновляет
            </span>
            {/* Десктопная версия */}
            <span className="hidden md:block">
              Сообщество дизайнеров и молодых предпринимателей с уникальным мировозрением,
              <br />
              выражающих свои ценности через стиль одежды.
              <br />
              Пространство для тех, кто творит и вдохновляет
            </span>
          </h2>
          <Link
            href={`/product/${featuredProductId}`}
            className="button-link px-10 py-5 md:px-20 md:py-8 border-[2px] border-white text-white uppercase tracking-[0.2em] text-[2.4rem] md:text-[10.4rem] font-black flex items-center justify-center transition-colors duration-200 hover:bg-white hover:text-bg-4 translate-y-3 md:translate-y-0 md:mt-32 whitespace-nowrap"
          >
            Shop now
          </Link>
      </div>
      </section>

      <section className="w-full py-8 bg-bg-4" aria-hidden="true" />

      {/* Блок №2: Карта улицы - полноширинные изображения с наложенными текстами */}
      <section className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-2">

          <div className="group relative w-full h-[90vh] bg-bg-2 overflow-hidden">
            <Image
              src="/IMG_1804.jpg"
              alt="Мужская коллекция Reus Vertus"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" aria-hidden="true" />
          </div>

          <div className="group relative w-full h-[90vh] bg-bg-2 overflow-hidden">
            <Image
              src="/IMG_4212.JPG"
              alt="коллекция Reus Vertus"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" aria-hidden="true" />
          </div>
          </div>
        </section>

      <section className="w-full py-8 bg-bg-4" aria-hidden="true" />

      {/* Блок №3: Прохожие - луки из lookbook */}
      <section className="w-full bg-bg-4">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 px-4 sm:px-6 lg:px-8 py-12">
          {[
            { id: 1, src: "/blok3/IMG_4357.JPEG", label: "Look 1" },
            { id: 2, src: "/blok3/IMG_4230.png", label: "Look 2" },
            { id: 3, src: "/blok3/IMG_1609.jpg", label: "Look 3" },
            { id: 4, src: "/blok3/1.1.JPEG", label: "Look 4" },
            { id: 5, src: "/blok3/IMG_4186.JPEG", label: "Look 5" },
            { id: 6, src: "/photo_2025-11-1820.57.02.jpeg", label: "Look 6" },
          ].map((look, index) => (
            <div
              key={look.id}
              className="relative aspect-[3/4] bg-bg-2 overflow-hidden rounded-lg group"
            >
              <Image
                src={look.src}
                alt={look.label}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                priority={index < 2}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" aria-hidden="true" />
              <div className="absolute inset-0 flex items-end justify-start p-4 sm:p-6">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-white uppercase text-xs sm:text-sm tracking-[0.2em]">
                  {look.label}
                </div>
              </div>
            </div>
          ))}
          </div>
        </section>

      <section className="w-full py-8 bg-bg-4" aria-hidden="true" />

      {/* Блок №4: Подписка на email */}
      <section className="w-full bg-bg-4 py-4 sm:py-4">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <EmailSubscriptionBeige />
          </div>
        </section>

      <Footer />
    </div>
  );
}

export const metadata: Metadata = {
  title: "RUES VERTES — интернет-магазин лимитированных коллекций",
  description:
    "RUES VERTES — streetwear brand из Москвы: лимитированные дропы, базовые вещи, подписка со скидкой 10% на первый заказ.",
};
