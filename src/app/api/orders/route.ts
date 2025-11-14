import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendOrderNotification } from '@/lib/mailer';

const sanitizeProductName = (name: string) =>
  name
    .replace(/женская/gi, "")
    .replace(/футболка/gi, "")
    .replace(/sheert/gi, "shirt")
    .replace(/\s+/g, " ")
    .trim();

// Создать заказ
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const { address, phone, email } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'Пользователь не авторизован' },
        { status: 401 }
      );
    }

    // Получить корзину пользователя
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      return NextResponse.json(
        { error: 'Корзина пуста' },
        { status: 400 }
      );
    }

    // Вычислить общую сумму
    const total = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    // Создать заказ
    const order = await prisma.order.create({
      data: {
        userId,
        total,
        address: address || null,
        phone: phone || null,
        email: email || null,
        status: 'pending',
        orderItems: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
            size: item.size || null,
            color: item.color || null,
          })),
        },
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    await sendOrderNotification({
      id: order.id,
      total: order.total,
      email: order.email,
      phone: order.phone,
      address: order.address,
      items: order.orderItems.map((item) => ({
        name: sanitizeProductName(item.product?.name ?? ""),
        code: item.product?.code ?? null,
        quantity: item.quantity,
        price: item.price,
        size: item.size,
      })),
    });

    // Очистить корзину
    await prisma.cartItem.deleteMany({
      where: { userId },
    });

    return NextResponse.json(
      { message: 'Заказ успешно создан', order },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: 'Ошибка при создании заказа' },
      { status: 500 }
    );
  }
}

// Получить заказы пользователя
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Пользователь не авторизован' },
        { status: 401 }
      );
    }

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении заказов' },
      { status: 500 }
    );
  }
}

