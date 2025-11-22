"use client";

import HeaderNavigation from "@/components/HeaderNavigation";
import Footer from "@/components/Footer";
import { useState } from "react";

export default function FAQPage() {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const sections = [
    "О бренде",
    "Доставка",
    "Уход за одеждой",
    "Возврат",
  ];

  const sectionContent: Record<string, string> = {
    "О бренде": `Rues Vertes — бренд одежды для креаторов и предпринимателей, основанный Элеонорой Григорян в 2025 году. Наш бренд — это территория для тех, кто мыслит иначе. Мы объединяем работников креативной индустрии, вдохновляя их выражать свою индивидуальность и приверженность к творческому сообществу.

Rues Vertes — это настоящее коммьюнити, где мода встречается с креативом, а стиль становится способом говорить о себе громко и уверенно. Мы верим, что одежда — это язык самовыражения. Наши вещи созданы для тех, кто живёт идеями, создаёт смыслы и делает мир вокруг ярче.

Каждая коллекция Rues Vertes является лимитированной, а изделия из премиальных материалов доставляются в кастомных деревянных боксах с нанесением граффити и подписанной вручную открыткой. Наши изделия уникальны: они совмещают повседневный casual с нестандартностью и принадлежностью к коммьюнити молодых креаторов.

Наша глобальная миссия — объединить всех креаторов, создавая для них уникальный способ заявить о себе.`,
    "Доставка": `Доставка по Москве и регионам России. Срок доставки: 1–3 рабочих дня.`,
    "Уход за одеждой": `• Машинная стирка при 30°C

• Не отбеливать

• Гладить при низкой температуре

• Не подвергать химчистке`,
    "Возврат": `Все вопросы по возврату товара просим направлять на электронную почту rues.vertes11@gmail.com`,
  };

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
                  <p className="opacity-80 whitespace-pre-line leading-relaxed">
                    {sectionContent[section] || "Rues Vertes"}
                  </p>
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
