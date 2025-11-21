import HeaderNavigation from "@/components/HeaderNavigation";
import Footer from "@/components/Footer";
import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-bg-1">
        <HeaderNavigation className="py-6" />

      {/* About Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16 text-left">

        {/* О бренде / История */}
        <section className="space-y-4">
          <h2 className="text-2xl uppercase border-b border-black/20 pb-2">О бренде / История</h2>
          <div className="space-y-4 leading-relaxed text-justify">
            <p>
              Rues Vertes — бренд одежды для креаторов и предпринимателей, основанный Элеонорой Григорян{"\u00a0"}в 2025 году. Наш бренд — это территория для тех, кто мыслит иначе. Мы объединяем работников креативной индустрии, вдохновляя их выражать свою индивидуальность и приверженность{"\u00a0"}к творческому сообществу. 
            </p>
            <p>
            Rues Vertes — это настоящее коммьюнити, где мода встречается с креативом, а стиль становится способом говорить о себе громко и уверенно. Мы верим, что одежда — это язык самовыражения. Наши вещи созданы для тех, кто живёт идеями, создаёт смыслы и делает мир вокруг ярче.
            </p>
            <div className="space-y-2">
              <p>
                Каждая коллекция Rues Vertes является лимитированной, а изделия из премиальных материалов доставляются в кастомных деревянных боксах с нанесением граффити и подписанной вручную открыткой. Наши изделия уникальны: они совмещают повседневный casual с нестандартностью и принадлежностью к коммьюнити молодых креаторов.
              </p>
              <p>
                Наша глобальная миссия — объединить всех креаторов, создавая для них уникальный способ заявить о себе.
              </p>
            </div>
          </div>
        </section>

        {/* Философия */}
        <section className="space-y-4">
          <h2 className="text-2xl uppercase border-b border-black/20 pb-2">Философия</h2>
          <div className="space-y-4 leading-relaxed text-justify">
            <p>
              Мы верим{"\u00a0"}в силу простоты и качества. Каждое изделие создаётся с мыслью{"\u00a0"}о том, что мода должна быть осознанной, долговечной и универсальной.
            </p>
            <p>
              Наша философия строится на трех принципах:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-4">
              <li>Качество превыше количества</li>
              <li>Вневременной дизайн вместо сезонных трендов</li>
              <li>Ответственное производство и честность с клиентами</li>
            </ul>
          </div>
        </section>

        {/* Миссия */}
        <section className="space-y-4">
          <h2 className="text-2xl uppercase border-b border-black/20 pb-2">Миссия</h2>
          <div className="space-y-4 leading-relaxed text-justify">
            <p>
              Наша миссия — создавать одежду, которая позволяет людям быть собой. Мы стремимся к тому, чтобы каждый человек мог найти в нашей коллекции вещи, которые станут частью повседневной жизни на долгие годы.
            </p>
            <p>
              Мы хотим изменить индустрию моды, делая её более осознанной, честной и доступной. При этом мы не жертвуем качеством и дизайном.
            </p>
          </div>
        </section>

        {/* Ценности */}
        <section className="space-y-4">
          <h2 className="text-2xl uppercase border-b border-black/20 pb-2">Ценности</h2>
          <div className="space-y-6 leading-relaxed text-justify">
            <div>
              <h3 className="font-semibold text-lg mb-2">Качество</h3>
              <div className="space-y-2">
                <p>
                  Мы используем только проверенные материалы и работаем с лучшими производителями.
                </p>
                <p>Чтобы каждое изделие служило вам долгие годы.</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Честность</h3>
              <div className="space-y-2">
              <p>
                Прозрачность на всех этапах — от выбора материалов до финальной цены.
              </p>
              <p>
                Мы открыто рассказываем о том, как и где производится наша продукция.
              </p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Устойчивость</h3>
              <div className="space-y-2">
                <p>Забота об окружающей среде — это не опция, а необходимость.</p>
                <p>Мы выбираем экологичные материалы, чтобы минимизировать отходы производства.</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Индивидуальность</h3>
              <p>
                Каждый человек уникален, и наша одежда призвана подчеркнуть это, а не навязать определённый образ.
              </p>
            </div>
          </div>
        </section>

        {/* Команда */}
        <section className="space-y-8">
          <h2 className="text-2xl uppercase border-b border-black/20 pb-2">Команда</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="relative aspect-square bg-bg-2 rounded-lg overflow-hidden">
                <Image
                  src="/about/IMG_4219.JPEG"
                  alt="Команда"
                  fill
                  priority
                  className="object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div>
                <h3 className="text-xl font-semibold uppercase">Элеонора Григорян</h3>
                <p className="text-sm opacity-70 uppercase">CEO</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="relative aspect-square bg-bg-2 rounded-lg overflow-hidden">
                <Image
                  src="/julia2.png"
                  alt="Команда"
                  fill
                  priority
                  className="object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div>
                <h3 className="text-xl font-semibold uppercase">Юлия Вирачева</h3>
                <p className="text-sm opacity-70 uppercase">Producer</p>
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
