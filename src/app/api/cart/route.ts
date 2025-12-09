import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Получить корзину пользователя
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Пользователь не авторизован' },
        { status: 401 }
      );
    }

    const cartItems = await prisma.cartItem.findMany({
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
    });

    // Парсинг JSON полей
    const parsedCartItems = cartItems.map((item: typeof cartItems[0]) => {
      let colors = null;
      let sizes = null;

      try {
        if (item.product.colors) {
          colors = JSON.parse(item.product.colors);
        }
      } catch (e) {
        console.error('Error parsing colors in cart:', e);
      }

      try {
        if (item.product.sizes) {
          sizes = JSON.parse(item.product.sizes);
        }
      } catch (e) {
        console.error('Error parsing sizes in cart:', e);
      }

      return {
        ...item,
        product: {
          ...item.product,
          colors,
          sizes,
        },
      };
    });

    return NextResponse.json({ cartItems: parsedCartItems }, { status: 200 });
  } catch (error: any) {
    console.error('Get cart error:', error);
    console.error('Error details:', {
      message: error?.message,
      stack: error?.stack,
      code: error?.code,
    });
    return NextResponse.json(
      { 
        error: 'Ошибка при получении корзины',
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined
      },
      { status: 500 }
    );
  }
}

// Добавить товар в корзину
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const { productId, quantity = 1, size, color, fit } = await request.json();

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

    // Проверка существования товара по ID или коду
    let product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      product = await prisma.product.findUnique({
        where: { code: productId },
      });
    }

    if (!product) {
      return NextResponse.json(
        { error: 'Товар не найден' },
        { status: 404 }
      );
    }

    const resolvedProductId = product.id;

    // Проверка существования товара в корзине
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId_size_color_fit: {
          userId,
          productId: resolvedProductId,
          size: size || '',
          color: color || '',
          fit: fit || '',
        },
      },
    });

    let cartItem;
    if (existingItem) {
      // Обновить количество
      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
        include: { product: true },
      });
    } else {
      // Создать новый элемент корзины
      cartItem = await prisma.cartItem.create({
        data: {
          userId,
          productId: resolvedProductId,
          quantity,
          size: size || null,
          color: color || null,
          fit: fit || null,
        },
        include: { product: true },
      });
    }

    return NextResponse.json({ cartItem }, { status: 200 });
  } catch (error) {
    console.error('Add to cart error:', error);
    return NextResponse.json(
      { error: 'Ошибка при добавлении в корзину' },
      { status: 500 }
    );
  }
}

// Удалить товар из корзины
export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Пользователь не авторизован' },
        { status: 401 }
      );
    }

    if (!itemId) {
      return NextResponse.json(
        { error: 'ID элемента корзины обязателен' },
        { status: 400 }
      );
    }

    // Проверка принадлежности элемента корзины пользователю
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
    });

    if (!cartItem || cartItem.userId !== userId) {
      return NextResponse.json(
        { error: 'Элемент корзины не найден' },
        { status: 404 }
      );
    }

    await prisma.cartItem.delete({
      where: { id: itemId },
    });

    return NextResponse.json(
      { message: 'Товар удален из корзины' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete from cart error:', error);
    return NextResponse.json(
      { error: 'Ошибка при удалении из корзины' },
      { status: 500 }
    );
  }
}

// Обновить количество товара в корзине
export async function PUT(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const { itemId, quantity } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'Пользователь не авторизован' },
        { status: 401 }
      );
    }

    if (!itemId || quantity === undefined) {
      return NextResponse.json(
        { error: 'ID элемента и количество обязательны' },
        { status: 400 }
      );
    }

    // Проверка принадлежности элемента корзины пользователю
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
    });

    if (!cartItem || cartItem.userId !== userId) {
      return NextResponse.json(
        { error: 'Элемент корзины не найден' },
        { status: 404 }
      );
    }

    const updatedItem = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
      include: { product: true },
    });

    return NextResponse.json({ cartItem: updatedItem }, { status: 200 });
  } catch (error) {
    console.error('Update cart error:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении корзины' },
      { status: 500 }
    );
  }
}

