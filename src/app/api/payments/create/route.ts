import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createPayment } from '@/lib/yookassa';

/**
 * POST /api/payments/create
 * Создание платежа в ЮКассе и заказа в базе данных
 */
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

    // Проверка наличия учетных данных ЮКассы
    if (!process.env.YOOKASSA_SHOP_ID || !process.env.YOOKASSA_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Платежная система не настроена' },
        { status: 500 }
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
      (sum: number, item: typeof cartItems[0]) => sum + item.product.price * item.quantity,
      0
    );

    // Создать заказ со статусом "awaiting_payment"
    const order = await prisma.order.create({
      data: {
        userId,
        total,
        address: address || null,
        phone: phone || null,
        email: email || null,
        status: 'awaiting_payment',
        paymentStatus: 'pending',
        orderItems: {
          create: cartItems.map((item: typeof cartItems[0]) => ({
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

    // Формируем описание для платежа
    const itemNames = order.orderItems
      .map((item: typeof order.orderItems[0]) => item.product.name)
      .join(', ')
      .substring(0, 100);
    const description = `Заказ #${order.id.substring(0, 8)}: ${itemNames}`;

    // Создаем платеж в ЮКассе
    const payment = await createPayment({
      amount: total,
      orderId: order.id,
      description,
      customerEmail: email || undefined,
      customerPhone: phone || undefined,
    });

    // Обновляем заказ с ID платежа
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentId: payment.id,
        paymentStatus: payment.status,
      },
    });

    // НЕ очищаем корзину здесь - очистим после успешной оплаты

    return NextResponse.json({
      success: true,
      orderId: order.id,
      paymentId: payment.id,
      confirmationUrl: payment.confirmation?.confirmation_url,
    });
  } catch (error) {
    console.error('Create payment error:', error);
    return NextResponse.json(
      { error: 'Ошибка при создании платежа' },
      { status: 500 }
    );
  }
}
