import type { Metadata } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/AuthProvider";

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "RUES VERTES",
  description:
    "RUES VERTES — официальный сайт бренда.",
  keywords: [
    "rues vertes clothing",
    "rues vertes brand",
    "rues vertes moscow",
    "ruesvertes официальный сайт",
    "ruesvertes бренд",
    "руес вертес",
    "рюес вертес",
    "рус вертес одежда",
    "ру вертес одежда",
    "rues vertes футболки",
    "rues vertes streetwear",
    "уличная мода москва",
    "стритвир из Москвы",
    "streetwear бренд",
    "московский streetwear",
    "российский streetwear бренд",
    "streetwear одежда",
    "стильная уличная одежда",
    "минималистичный streetwear",
    "премиальный streetwear",
    "одежда для креативных людей",
    "одежда для креативных профессий",
    "одежда для предпринимателей",
    "одежда для стартаперов",
    "одежда для дизайнеров",
    "одежда для создателей контента",
    "одежда для блогеров и создателей",
    "одежда для молодых создателей",
    "одежда для творческой молодежи",
    "одежда для IT и digital специалистов",
    "премиальные футболки",
    "футболка из премиального хлопка",
    "качественная футболка из хлопка",
    "базовые футболки",
    "минималистичные футболки",
    "оверсайз футболки",
    "премиальный оверсайз",
    "дизайнерские футболки",
    "уличные футболки",
    "лимитированные футболки",
    "limited edition одежда",
    "limited drop одежда",
    "локальное производство одежды",
    "одежда made in moscow",
    "российское производство одежды",
    "московские бренды одежды",
    "локальные fashion бренды",
    "премиальная базовая одежда",
    "базовые вещи премиум качества",
    "минималистичный бренд одежды",
    "бренд одежды для самовыражения",
    "бренд одежды с идеей",
    "одежда для создателей",
    "одежда для современных креаторов",
    "стильная базовая одежда",
    "купить футболку премиум",
    "купить футболку москва",
    "купить streetwear одежду",
    "купить базовую футболку",
    "купить оверсайз футболку",
    "купить брендовые футболки",
    "купить дизайнерскую футболку",
    "одежда для уверенных в себе",
    "одежда для самовыражения",
    "одежда для людей с вкусом",
    "эстетичная одежда",
    "одежда для современных брендов",
    "бренд для молодых предпринимателей",
    "одежда с характером",
  ],
  openGraph: {
    title: "RUES VERTES — streetwear из Москвы",
    description:
      "Лимитированные коллекции и базовые вещи RUES VERTES. Подпишись на рассылку, чтобы получить 10% скидку на первый заказ.",
    url: "https://ruesvertes.ru",
    siteName: "RUES VERTES",
    images: [
      {
        url: "/metalogo.svg",
        alt: "RUES VERTES",
      },
    ],
    locale: "ru_RU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RUES VERTES — streetwear из Москвы",
    description:
      "Лимитированные коллекции и базовые вещи RUES VERTES. Подпишись на рассылку, чтобы получить 10% скидку на первый заказ.",
    images: ["/metalogo.svg"],
  },
  icons: {
    icon: [
      { url: "/metalogo.svg", sizes: "any", type: "image/svg+xml" },
      { url: "/metalogo.svg", sizes: "any", type: "image/svg+xml" },
      { url: "/", sizes: "any" },
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/metalogo.svg",
  },
  metadataBase: new URL("https://ruesvertes.ru"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${ibmPlexMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
