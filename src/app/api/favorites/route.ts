import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Получить избранное пользователя
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Пользователь не авторизован' },
        { status: 401 }
      );
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            code: true,
            price: true,
            imageUrl: true,
            colors: true,
            sizes: true,
            fit: true,
            category: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Парсинг JSON полей товаров
    const parsedFavorites = favorites.map((fav) => {
      let colors = null;
      let sizes = null;

      try {
        if (fav.product.colors) {
          colors = JSON.parse(fav.product.colors);
        }
      } catch (e) {
        console.error('Error parsing colors:', e);
      }

      try {
        if (fav.product.sizes) {
          sizes = JSON.parse(fav.product.sizes);
        }
      } catch (e) {
        console.error('Error parsing sizes:', e);
      }

      return {
        id: fav.id,
        product: {
          ...fav.product,
          colors,
          sizes,
        },
        createdAt: fav.createdAt,
      };
    });

    return NextResponse.json({ favorites: parsedFavorites }, { status: 200 });
  } catch (error: any) {
    console.error('Get favorites error:', error);
    console.error('Error details:', {
      message: error?.message,
      stack: error?.stack,
      code: error?.code,
    });
    return NextResponse.json(
      { 
        error: 'Ошибка при получении избранного',
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined
      },
      { status: 500 }
    );
  }
}

// Добавить товар в избранное
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const { productId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'Пользователь не авторизован' },
        { status: 401 }
      );
    }

    if (!productId) {
      return NextResponse.json(
        { error: 'ID товара обязателен' },
        { status: 400 }
      );
    }

    // Проверка существования товара
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Товар не найден' },
        { status: 404 }
      );
    }

    // Проверка существования в избранном
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (existingFavorite) {
      return NextResponse.json(
        { error: 'Товар уже в избранном' },
        { status: 400 }
      );
    }

    // Создание записи в избранном
    const favorite = await prisma.favorite.create({
      data: {
        userId,
        productId,
      },
      include: {
        product: true,
      },
    });

    return NextResponse.json({ favorite }, { status: 201 });
  } catch (error: any) {
    console.error('Add to favorites error:', error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Товар уже в избранном' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Ошибка при добавлении в избранное' },
      { status: 500 }
    );
  }
}

// Удалить товар из избранного
export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Пользователь не авторизован' },
        { status: 401 }
      );
    }

    if (!productId) {
      return NextResponse.json(
        { error: 'ID товара обязателен' },
        { status: 400 }
      );
    }

    // Проверка принадлежности избранного пользователю
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (!favorite) {
      return NextResponse.json(
        { error: 'Товар не найден в избранном' },
        { status: 404 }
      );
    }

    await prisma.favorite.delete({
      where: { id: favorite.id },
    });

    return NextResponse.json(
      { message: 'Товар удален из избранного' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete from favorites error:', error);
    return NextResponse.json(
      { error: 'Ошибка при удалении из избранного' },
      { status: 500 }
    );
  }
}

