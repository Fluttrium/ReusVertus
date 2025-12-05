import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createPayment } from '@/lib/yookassa';

/**
 * Функция для проверки, является ли город Москвой
 */
function isMoscowCity(cityName: string | null | undefined): boolean {
  if (!cityName) return false;
  const normalized = cityName.toLowerCase().trim();
  return normalized.includes('москв') || normalized === 'moscow';
}

/**
 * POST /api/payments/create
 * Создание платежа в ЮКассе и заказа в базе данных
 */
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const { 
      recipientName,
      address, 
      phone, 
      email, 
      deliveryCost, 
      deliveryType, 
      deliveryTariff,
      deliveryPointCode,
      deliveryTariffCode,
      deliveryCity,
      deliveryCityCode,
      subscriptionDiscount = 0, // Скидка за подписку на рассылку
    } = await request.json();

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

    // Вычислить сумму товаров
    const productsTotal = cartItems.reduce(
      (sum: number, item: typeof cartItems[0]) => sum + item.product.price * item.quantity,
      0
    );

    // Применяем скидку за подписку (10% от суммы товаров)
    const discountAmount = subscriptionDiscount || 0;
    const productsTotalWithDiscount = productsTotal - discountAmount;

    // Проверяем, является ли город доставки Москвой (доставка бесплатна)
    const isMoscow = isMoscowCity(deliveryCity);
    const deliveryAmount = isMoscow ? 0 : (deliveryCost || 0);
    const total = productsTotalWithDiscount + deliveryAmount;
    
    console.log(`[Payment] Products: ${productsTotal}₽, Discount: ${discountAmount}₽, Products after discount: ${productsTotalWithDiscount}₽, Delivery: ${deliveryAmount}₽ ${isMoscow ? '(бесплатно для Москвы)' : ''}, Total: ${total}₽`);

    // Создать заказ со статусом "awaiting_payment"
    const order = await prisma.order.create({
      data: {
        userId,
        total,
        recipientName: recipientName || null,
        address: address || null,
        phone: phone || null,
        email: email || null,
        status: 'awaiting_payment',
        paymentStatus: 'pending',
        // Данные доставки СДЭК
        deliveryType: deliveryType || null,
        deliveryCost: deliveryAmount || null,
        deliveryTariff: deliveryTariff || null,
      deliveryTariffCode: deliveryTariffCode || null,
      deliveryPointCode: deliveryPointCode || null,
      deliveryCity: deliveryCity || null,
      deliveryCityCode: deliveryCityCode || null,
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
      .substring(0, 80);
    const discountInfo = discountAmount > 0 ? ` - скидка ${discountAmount}₽` : '';
    const deliveryInfo = deliveryAmount > 0 ? ` + доставка ${deliveryAmount}₽` : '';
    const description = `Заказ #${order.id.substring(0, 8)}: ${itemNames}${discountInfo}${deliveryInfo}`.substring(0, 128);

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
  } catch (error: any) {
    console.error('Create payment error:', error);
    
    // Передаем понятное сообщение об ошибке
    const errorMessage = error.message || 'Ошибка при создании платежа';
    
    // Если это ошибка авторизации, возвращаем 401
    if (errorMessage.includes('авторизации') || errorMessage.includes('credentials not configured')) {
      return NextResponse.json(
        { error: errorMessage },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
