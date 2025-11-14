import HeaderNavigation from "@/components/HeaderNavigation";
import Footer from "@/components/Footer";
import EmailSubscription from "@/components/EmailSubscription";
import Image from "next/image";

const looks = [
  { id: 1, title: "Look 1", file: "202571920230512.jpg", hoverFile: "2025719202722568.jpg" },
  { id: 2, title: "Look 2", file: "2025719202722568.jpg", hoverFile: "202571921630928 (1).jpg" },
  { id: 3, title: "Look 3", file: "202571921630928 (1).jpg", hoverFile: "2025825151941112.jpg" },
  { id: 4, title: "Look 4", file: "2025825151941112.jpg", hoverFile: "202583123237760.jpg" },
  { id: 5, title: "Look 5", file: "202583123237760.jpg", hoverFile: "202583125859640.jpg" },
  { id: 6, title: "Look 6", file: "202583125859640.jpg", hoverFile: "202583151222472.jpg" },
  { id: 7, title: "Look 7", file: "202583151222472.jpg", hoverFile: "202583151459872.jpg" },
  { id: 8, title: "Look 8", file: "202583151459872.jpg", hoverFile: "2025831539728.jpg" },
  { id: 9, title: "Look 9", file: "2025831539728.jpg", hoverFile: "dclassic 2025-08-17 173726.260.JPG" },
  { id: 10, title: "Look 10", file: "dclassic 2025-08-17 173726.260.JPG", hoverFile: "dclassic 2025-08-25 154007.751.JPG" },
  { id: 11, title: "Look 11", file: "dclassic 2025-08-25 154007.751.JPG", hoverFile: "202571920230512.jpg" },
];

const buildImageSrc = (filename: string) => `/lookbook/${encodeURIComponent(filename)}`;

export default function LooksPage() {
  return (
    <div className="min-h-screen bg-bg-1">
      <HeaderNavigation className="py-6" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        

        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
          {looks.map((look, index) => (
            <div key={look.id} className="relative aspect-[3/4] overflow-hidden rounded-lg bg-bg-2 group">
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
                className="object-cover absolute inset-0 opacity-0 scale-105 transition-transform duration-500 group-hover:opacity-100 group-hover:scale-110"
              />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <span className="text-white uppercase tracking-[0.2em] text-sm opacity-0 group-hover:opacity-100 transition-opacity">
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

