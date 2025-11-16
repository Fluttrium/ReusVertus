import HeaderNavigation from "@/components/HeaderNavigation";
import Footer from "@/components/Footer";
import EmailSubscription from "@/components/EmailSubscription";
import LookbookGrid from "@/components/LookbookGrid";
import type { Metadata } from "next";

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

export default function LooksPage() {
  return (
    <div className="min-h-screen bg-bg-1">
      <HeaderNavigation className="py-6" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        

        <LookbookGrid looks={looks} />

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

