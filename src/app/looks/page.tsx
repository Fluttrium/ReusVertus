import HeaderNavigation from "@/components/HeaderNavigation";
import Footer from "@/components/Footer";
import EmailSubscription from "@/components/EmailSubscription";
import Image from "next/image";
import type { Metadata } from "next";

const looks = [
  { id: 1, title: "Look 1", file: "look1/IMG_4219.JPEG", hoverFile: "look1/IMG_1786.jpg" },
  { id: 2, title: "Look 2", file: "look2/IMG_4(2).JPEG", hoverFile: "look2/IMG_1752.jpg" },
  { id: 3, title: "Look 3", file: "look3/2.0.JPG", hoverFile: "look3/IMG_4233.JPEG" },
  { id: 4, title: "Look 4", file: "look4/IMG_3108.PNG", hoverFile: "/look4/IMG_3108.PNG" },
  { id: 5, title: "Look 5", file: "look5/IMG_1790.jpg", hoverFile: "look5/IMG_1791.jpg" },
  { id: 6, title: "Look 6", file: "look6/IMG_4217.JPEG", hoverFile: "look6/IMG_1772.JPEG" },
  { id: 7, title: "Look 7", file: "look7/IMG_1818(1).jpg", hoverFile: "look7/IMG_4210.JPEG" },
  { id: 8, title: "Look 8", file: "look8/IMG_1800.JPEG", hoverFile: "look8/IMG_4352.JPG" },
  { id: 9, title: "Look 9", file: "look9/IMG_1788.jpg", hoverFile: "look9/IMG_4236.png" },
  { id: 10, title: "Look 10", file: "look10/IMG_4190.JPEG", hoverFile: "look10/IMG_4355.JPG" },
  { id: 11, title: "Look 11", file: "look11/IMG_1804.jpg", hoverFile: "look11/IMG_4235.JPEG" },
  { id: 12, title: "Look 12", file: "look12/IMG_1815.jpg", hoverFile: "look12/IMG_1811(1).jpg" },
];

const buildImageSrc = (filename: string) => `/lookbook/${encodeURIComponent(filename)}`;

export default function LooksPage() {
  return (
    <div className="min-h-screen bg-bg-1">
      <HeaderNavigation className="py-6" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
          {looks.map((look, index) => (
            <div
              key={look.id}
              className="relative aspect-[3/4] overflow-hidden rounded-lg bg-bg-2 group cursor-pointer"
              tabIndex={0}
            >
              <Image
                src={buildImageSrc(look.file)}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                priority={index < 2}
                className="object-cover transition-transform duration-500"
              />
              <Image
                src={buildImageSrc(look.hoverFile ?? look.file)}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                className="object-cover absolute inset-0 opacity-0 scale-105 transition-transform duration-500 group-hover:opacity-100 group-hover:scale-110 group-focus:opacity-100 group-focus:scale-110 group-active:opacity-100 group-active:scale-110"
              />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <span className="text-white uppercase tracking-[0.2em] text-sm opacity-0 transition-opacity group-hover:opacity-100 group-focus:opacity-100 group-active:opacity-100">
                  {look.title}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Блок подписки на имейл */}
        <EmailSubscription />
      </div>

      <Footer />
    </div>
  );
}

export const metadata: Metadata = {
  title: "Lookbook — RUES VERTES",
  description: "Образы из лимитированных коллекций RUES VERTES.",
};

