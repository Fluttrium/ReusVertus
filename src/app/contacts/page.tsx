import HeaderNavigation from "@/components/HeaderNavigation";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function ContactsPage() {
  return (
    <div className="min-h-screen bg-bg-1">
      <HeaderNavigation className="py-6" />

      {/* Contacts Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">

        {/* Hero Title */}
        {/* Contact Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* General Inquiries */}
          <div className="bg-bg-2 p-8 rounded-lg space-y-4">
            <h2 className="text-2xl uppercase border-b border-black/20 pb-2">
              Общие вопросы
            </h2>
            <div className="space-y-3">
              <p>
                <span className="font-semibold">Email:</span><br />
                <a href="mailto:rues.vertes11@gmail.com" className="underline hover:opacity-70 transition-opacity">
                  rues.vertes11@gmail.com
                </a>
              </p>
            </div>
          </div>

          {/* Press */}
          <div className="bg-bg-2 p-8 rounded-lg space-y-4">
            <h2 className="text-2xl uppercase border-b border-black/20 pb-2">
              Пресса
            </h2>
            <div className="space-y-3">
              <p>
                <span className="font-semibold">Email:</span><br />
                <a href="mailto:rues.vertes11@gmail.com" className="underline hover:opacity-70 transition-opacity">
                  rues.vertes11@gmail.com
                </a>
              </p>
            </div>
          </div>

          {/* Wholesale */}
          <div className="bg-bg-2 p-8 rounded-lg space-y-4">
            <h2 className="text-2xl uppercase border-b border-black/20 pb-2">
              Оптовые продажи
            </h2>
            <div className="space-y-3">
              <p>
                <span className="font-semibold">Email:</span><br />
                <a href="mailto:rues.vertes11@gmail.com" className="underline hover:opacity-70 transition-opacity">
                  rues.vertes11@gmail.com
                </a>
              </p>
            </div>
          </div>

          {/* Collaborations */}
          <div className="bg-bg-2 p-8 rounded-lg space-y-4">
            <h2 className="text-2xl uppercase border-b border-black/20 pb-2">
              Сотрудничество
            </h2>
            <div className="space-y-3">
              <p>
                <span className="font-semibold">Email:</span><br />
                <a href="mailto:rues.vertes11@gmail.com" className="underline hover:opacity-70 transition-opacity">
                  rues.vertes11@gmail.com
                </a>
              </p>
            </div>
          </div>

        </div>

        {/* Office Address */}
        <section className="space-y-6">
          <h2 className="text-2xl uppercase border-b border-black/20 pb-2">Офис</h2>
          <div className="space-y-2 leading-relaxed">
            <p className="font-semibold">Rues Vertes</p>
            <p>Москва, Россия</p>
          </div>
        </section>

        {/* Social Media */}
        <section className="space-y-6">
          <h2 className="text-2xl uppercase border-b border-black/20 pb-2">Социальные сети</h2>
          <div className="flex flex-wrap gap-6 text-lg">
            <Link
              href="https://www.instagram.com/ruesvertes?igsh=MTdreXY4b2Z4NWpqbw=="
              className="uppercase underline hover:opacity-70 transition-opacity"
              target="_blank"
            >
              Instagram
            </Link>
            <Link
              href="https://t.me/ruesvertes"
              className="uppercase underline hover:opacity-70 transition-opacity"
              target="_blank"
            >
              Telegram
            </Link>
          </div>
        </section>

        {/* Working Hours */}
        <section className="space-y-4">
          <h2 className="text-2xl uppercase border-b border-black/20 pb-2">Часы работы</h2>
          <div className="leading-relaxed">
            <p>Служба поддержки: Пн-Пт, 10:00 - 19:00 (МСК)</p>
            <p className="text-sm opacity-70 mt-2">
              Мы отвечаем на письма в течение 24 часов
            </p>
          </div>
        </section>

        {/* Реквизиты */}
        <section className="space-y-6">
          <h2 className="text-2xl uppercase border-b border-black/20 pb-2">Реквизиты</h2>
          <div className="bg-bg-2 p-8 rounded-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="font-semibold uppercase text-sm opacity-70">Организация</h3>
                <p className="font-semibold">ООО &quot;РЮ ВЕРТ&quot;</p>
                <p className="text-sm leading-relaxed">
                  129327, Россия, г. Москва,<br />
                  вн.тер.г. муниципальный округ Бабушкинский,<br />
                  ул. Енисейская, д. 20, кв. 6
                </p>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold uppercase text-sm opacity-70">Регистрационные данные</h3>
                <p><span className="opacity-70">ИНН:</span> 7716255348</p>
                <p><span className="opacity-70">КПП:</span> 771601001</p>
                <p><span className="opacity-70">ОГРН:</span> 1257700504555</p>
              </div>
            </div>
            
            <div className="border-t border-black/10 pt-4 mt-4">
              <h3 className="font-semibold uppercase text-sm opacity-70 mb-3">Банковские реквизиты</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <p><span className="opacity-70">Банк:</span> АО «ТБанк»</p>
                  <p><span className="opacity-70">БИК:</span> 044525974</p>
                  <p><span className="opacity-70">ИНН банка:</span> 7710140679</p>
                </div>
                <div className="space-y-2">
                  <p><span className="opacity-70">Р/с:</span> 40702810910002005128</p>
                  <p><span className="opacity-70">К/с:</span> 30101810145250000974</p>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
