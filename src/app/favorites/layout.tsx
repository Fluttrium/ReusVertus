import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Избранное — RUES VERTES",
  description: "Сохранённые товары и лимитированные дропы RUES VERTES.",
};

export default function FavoritesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

