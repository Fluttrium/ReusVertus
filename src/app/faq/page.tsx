"use client";

import HeaderNavigation from "@/components/HeaderNavigation";
import Footer from "@/components/Footer";
import { useState } from "react";

export default function FAQPage() {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const sections = [
    "О бренде",
    "Программа Лояльности",
    "Адреса магазинов",
    "Доставка",
    "Оплата",
    "Уход за одеждой",
    "Возврат",
    "Гарантия",
    "Сертификаты",
    "Документы",
    "Контакты",
  ];

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <div className="min-h-screen bg-bg-1 flex flex-col">
      <HeaderNavigation className="py-6" />

      <div className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {/* Hero Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl uppercase">FAQ</h1>
        </div>

        {/* FAQ Sections */}
        <section className="space-y-4">
          {sections.map((section) => (
            <div key={section} className="border-b border-black/20">
              <button
                onClick={() => toggleSection(section)}
                className="w-full py-4 text-left flex items-center justify-between hover:opacity-70 transition-opacity uppercase"
              >
                <span className="text-lg font-medium">{section}</span>
                <svg
                  className={`w-5 h-5 transition-transform ${
                    openSection === section ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {openSection === section && (
                <div className="pb-4 pt-2">
                  <p className="opacity-80">Rues Vertes</p>
                </div>
              )}
            </div>
          ))}
        </section>
      </div>

      <Footer />
    </div>
  );
}
