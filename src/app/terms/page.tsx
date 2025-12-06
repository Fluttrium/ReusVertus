import HeaderNavigation from "@/components/HeaderNavigation";
import Footer from "@/components/Footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-bg-1">
      <HeaderNavigation className="py-6" />

      {/* Terms Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        {/* Hero Title */}
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl uppercase mb-4">Пользовательское соглашение</h1>
          <p className="text-sm opacity-70">Обновлено: 2024</p>
        </div>

        {/* Sections */}
        <section className="space-y-6 leading-relaxed">
          <div>
            <h2 className="text-2xl uppercase border-b border-black/20 pb-2 mb-4">
              1. Общие положения
            </h2>
            <p className="mb-3">
              Настоящее Пользовательское соглашение (далее — «Соглашение») определяет порядок использования 
              интернет-сайта и регулирует отношения между владельцем сайта и пользователем.
            </p>
            <p className="mb-3">
              Используя сайт, вы соглашаетесь с условиями настоящего Соглашения. 
              Если вы не согласны с условиями Соглашения, пожалуйста, не используйте сайт.
            </p>
          </div>

          <div>
            <h2 className="text-2xl uppercase border-b border-black/20 pb-2 mb-4">
              2. Использование сайта
            </h2>
            <p className="mb-3">
              Пользователь имеет право использовать сайт в личных, некоммерческих целях 
              в соответствии с настоящим Соглашением и применимым законодательством.
            </p>
            <p className="font-semibold mb-2">Пользователю запрещается:</p>
            <ul className="list-disc list-inside space-y-2 pl-4">
              <li>Использовать сайт в незаконных целях</li>
              <li>Пытаться получить несанкционированный доступ к системам сайта</li>
              <li>Распространять вредоносное программное обеспечение</li>
              <li>Копировать контент сайта без разрешения</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl uppercase border-b border-black/20 pb-2 mb-4">
              3. Регистрация и аккаунт
            </h2>
            <p className="mb-3">
              Для оформления заказа пользователь может зарегистрироваться на сайте, 
              создав учетную запись с указанием email и пароля.
            </p>
            <p className="mb-3">
              Пользователь несет ответственность за сохранность своих учетных данных 
              и за все действия, совершенные с использованием его аккаунта.
            </p>
          </div>

          <div>
            <h2 className="text-2xl uppercase border-b border-black/20 pb-2 mb-4">
              4. Интеллектуальная собственность
            </h2>
            <p className="mb-3">
              Все материалы сайта, включая тексты, изображения, логотипы, являются собственностью 
              правообладателя и защищены законодательством об интеллектуальной собственности.
            </p>
          </div>

          <div>
            <h2 className="text-2xl uppercase border-b border-black/20 pb-2 mb-4">
              5. Обработка персональных данных
            </h2>
            <p className="mb-3">
              Обработка персональных данных пользователей осуществляется в соответствии 
              с Политикой конфиденциальности, размещенной на сайте.
            </p>
          </div>

          <div>
            <h2 className="text-2xl uppercase border-b border-black/20 pb-2 mb-4">
              6. Ответственность
            </h2>
            <p className="mb-3">
              Администрация сайта не несет ответственности за временные сбои в работе сайта, 
              а также за возможные последствия использования информации, размещенной на сайте.
            </p>
          </div>

          <div>
            <h2 className="text-2xl uppercase border-b border-black/20 pb-2 mb-4">
              7. Изменение условий соглашения
            </h2>
            <p className="mb-3">
              Администрация сайта оставляет за собой право вносить изменения в настоящее Соглашение. 
              Продолжение использования сайта после внесения изменений означает согласие 
              с новыми условиями Соглашения.
            </p>
          </div>

          <div>
            <h2 className="text-2xl uppercase border-b border-black/20 pb-2 mb-4">
              8. Контактная информация
            </h2>
            <div className="bg-bg-2 p-6 rounded-lg space-y-3">
              <div>
                <p className="font-semibold mb-2">ОРГАНИЗАЦИЯ</p>
                <p>ООО "РЮ ВЕРТ"</p>
                <p>129327, Россия, г. Москва,</p>
                <p>вн.тер.г. муниципальный округ Бабушкинский,</p>
                <p>ул. Енисейская, д. 20, кв. 6</p>
              </div>
              
              <div className="pt-3 border-t border-black/10">
                <p className="font-semibold mb-2">РЕГИСТРАЦИОННЫЕ ДАННЫЕ</p>
                <p>ИНН: 7716255348</p>
                <p>КПП: 771601001</p>
                <p>ОГРН: 1257700504555</p>
              </div>

              <div className="pt-3 border-t border-black/10">
                <p className="font-semibold mb-2">БАНКОВСКИЕ РЕКВИЗИТЫ</p>
                <p>Банк: АО «ТБанк»</p>
                <p>БИК: 044525974</p>
                <p>ИНН банка: 7710140679</p>
                <p>Р/с: 40702810910002005128</p>
                <p>К/с: 30101810145250000974</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
