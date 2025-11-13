import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Получить все товары
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category'); // Мужское/Женское

    const where = category ? { category } : {};

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    // Парсинг JSON полей
    const parsedProducts = products.map(product => ({
      ...product,
      colors: product.colors ? JSON.parse(product.colors) : null,
      sizes: product.sizes ? JSON.parse(product.sizes) : null,
    }));

    return NextResponse.json({ products: parsedProducts }, { status: 200 });
  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении товаров' },
      { status: 500 }
    );
  }
}

// Создать товар (для админа)
export async function POST(request: NextRequest) {
  try {
    const {
      name,
      code,
      price,
      imageUrl,
      colors,
      sizes,
      category,
    } = await request.json();

    if (!name || !code || !price) {
      return NextResponse.json(
        { error: 'Название, код и цена обязательны' },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        code,
        price: parseInt(price),
        imageUrl: imageUrl || null,
        colors: colors ? JSON.stringify(colors) : null,
        sizes: sizes ? JSON.stringify(sizes) : null,
        category: category || null,
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error: any) {
    console.error('Create product error:', error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Товар с таким кодом уже существует' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Ошибка при создании товара' },
      { status: 500 }
    );
  }
}

