import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Product } from "@prisma/client";

const CYRILLIC_TO_LATIN: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "e",
  ж: "zh",
  з: "z",
  и: "i",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "h",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "shch",
  ы: "y",
  э: "e",
  ю: "yu",
  я: "ya",
};

const normalizeText = (value: string | null | undefined) =>
  (value ?? "").trim().toLowerCase();

const transliterateRuToEn = (value: string) =>
  value
    .split("")
    .map((char) => CYRILLIC_TO_LATIN[char] ?? char)
    .join("");

const buildSearchVariants = (rawQuery: string) => {
  const normalized = normalizeText(rawQuery);
  if (!normalized) {
    return [];
  }

  const variants = new Set<string>();
  const words = normalized.split(/\s+/).filter(Boolean);

  const maybeAddVariant = (candidate: string) => {
    const trimmed = candidate.trim();
    if (trimmed.length > 0) {
      variants.add(trimmed);
    }
  };

  maybeAddVariant(normalized);
  maybeAddVariant(transliterateRuToEn(normalized));

  words.forEach((word) => {
    maybeAddVariant(word);
    maybeAddVariant(transliterateRuToEn(word));
  });

  return Array.from(variants);
};

const computeScore = (product: Product, variants: string[]) => {
  const name = normalizeText(product.name);
  const code = normalizeText(product.code);
  const category = normalizeText(product.category);
  const fit = normalizeText(product.fit);
  let score = 0;

  variants.forEach((variant) => {
    if (!variant) return;

    if (code === variant) {
      score += 12;
    } else if (code.includes(variant)) {
      score += 8;
    }

    if (name === variant) {
      score += 10;
    } else if (name.includes(variant)) {
      score += variant.length > 3 ? 6 : 4;
    }

    if (category.includes(variant)) {
      score += 3;
    }

    if (fit.includes(variant)) {
      score += 2;
    }
  });

  return score;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ products: [] }, { status: 200 });
    }

    const variants = buildSearchVariants(query);
    if (variants.length === 0) {
      return NextResponse.json({ products: [] }, { status: 200 });
    }

    const allProducts = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });

    const scoredProducts = allProducts
      .map((product) => ({
        product: {
      id: product.id,
      name: product.name,
      code: product.code,
      price: product.price,
      category: product.category,
        },
        score: computeScore(product, variants),
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 15)
      .map((item) => item.product);

    return NextResponse.json({ products: scoredProducts }, { status: 200 });
  } catch (error) {
    console.error("Search products error:", error);
    return NextResponse.json(
      { error: "Ошибка при поиске товаров" },
      { status: 500 }
    );
  }
}

