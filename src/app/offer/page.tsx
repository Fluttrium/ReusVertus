import HeaderNavigation from "@/components/HeaderNavigation";
import Footer from "@/components/Footer";

export default function OfferPage() {
  return (
    <div className="min-h-screen bg-bg-1">
      <HeaderNavigation className="py-6" />

      {/* Offer Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        {/* Hero Title */}
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl uppercase mb-4">Договор публичной оферты</h1>
          <p className="text-sm opacity-70">Обновлено: 2024</p>
        </div>

        {/* Sections */}
        <section className="space-y-6 leading-relaxed">
          <div>
            <h2 className="text-2xl uppercase border-b border-black/20 pb-2 mb-4">
              1. Общие положения
            </h2>
            <p className="mb-3">
              Настоящий документ является публичной офертой (далее — «Оферта») в адрес физических лиц (далее — «Покупатель») 
              на заключение договора купли-продажи товаров дистанционным способом.
            </p>
            <p className="mb-3">
              В соответствии с пунктом 2 статьи 437 Гражданского кодекса Российской Федерации данный документ является публичной офертой, 
              и в случае принятия изложенных ниже условий лицо, производящее акцепт этой оферты, становится Покупателем.
            </p>
            <p className="mb-3">
              Акцептом настоящей оферты является оформление Покупателем заказа на товар, представленный на сайте интернет-магазина.
            </p>
          </div>

          <div>
            <h2 className="text-2xl uppercase border-b border-black/20 pb-2 mb-4">
              2. Предмет договора
            </h2>
            <p className="mb-3">
              Продавец обязуется передать в собственность Покупателю товар, а Покупатель обязуется принять и оплатить товар 
              на условиях настоящей оферты.
            </p>
          </div>

          <div>
            <h2 className="text-2xl uppercase border-b border-black/20 pb-2 mb-4">
              3. Права и обязанности сторон
            </h2>
            <p className="font-semibold mb-2">Продавец обязуется:</p>
            <ul className="list-disc list-inside space-y-2 pl-4 mb-4">
              <li>Передать товар Покупателю в сроки, указанные на сайте</li>
              <li>Обеспечить качество товара</li>
              <li>Информировать Покупателя о статусе заказа</li>
            </ul>
            <p className="font-semibold mb-2">Покупатель обязуется:</p>
            <ul className="list-disc list-inside space-y-2 pl-4">
              <li>Оплатить товар в полном объеме</li>
              <li>Принять товар при доставке</li>
              <li>Предоставить корректные данные для доставки</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl uppercase border-b border-black/20 pb-2 mb-4">
              4. Цена товара и порядок оплаты
            </h2>
            <p className="mb-3">
              Цена товара указывается на сайте интернет-магазина в рублях Российской Федерации.
            </p>
            <p className="mb-3">
              Оплата товара осуществляется путем перечисления денежных средств на расчетный счет Продавца 
              через платежную систему ЮКасса.
            </p>
            <p className="mb-3">
              Стоимость доставки указывается при оформлении заказа и может быть изменена в зависимости от выбранного способа доставки.
            </p>
          </div>

          <div>
            <h2 className="text-2xl uppercase border-b border-black/20 pb-2 mb-4">
              5. Доставка товара
            </h2>
            <p className="mb-3">
              Доставка товара осуществляется службой доставки СДЭК в соответствии с условиями, указанными на сайте.
            </p>
            <p className="mb-3">
              Доставка по Москве осуществляется бесплатно.
            </p>
          </div>

          <div>
            <h2 className="text-2xl uppercase border-b border-black/20 pb-2 mb-4">
              6. Возврат товара
            </h2>
            <p className="mb-3">
              Возврат товара осуществляется в соответствии с законодательством Российской Федерации 
              о защите прав потребителей.
            </p>
          </div>

          <div>
            <h2 className="text-2xl uppercase border-b border-black/20 pb-2 mb-4">
              7. Реквизиты Продавца
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
