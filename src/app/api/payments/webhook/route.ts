import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getPayment } from '@/lib/yookassa';
import { sendOrderNotification } from '@/lib/mailer';

// IP адреса ЮКассы для проверки
const YOOKASSA_IPS = [
  '185.71.76.',
  '185.71.77.',
  '77.75.153.',
  '77.75.156.11',
  '77.75.156.35',
  '77.75.154.',
  '2a02:5180:0:1509::',
  '2a02:5180:0:2655::',
  '2a02:5180:0:1533::',
  '2a02:5180:0:2669::',
];

const sanitizeProductName = (name: string) =>
  name
    .replace(/женская/gi, '')
    .replace(/футболка/gi, '')
    .replace(/sheert/gi, 'shirt')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * POST /api/payments/webhook
 * Обработка уведомлений от ЮКассы о статусе платежа
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Проверяем наличие необходимых полей
    if (!body.event || !body.object) {
      return NextResponse.json(
        { error: 'Invalid webhook payload' },
        { status: 400 }
      );
    }

    const event = body.event;
    const paymentData = body.object;
    const paymentId = paymentData.id;
    const orderId = paymentData.metadata?.order_id;

    console.log(`[YooKassa Webhook] Event: ${event}, Payment ID: ${paymentId}, Order ID: ${orderId}`);

    // Находим заказ по paymentId
    let order = await prisma.order.findFirst({
      where: {
        OR: [
          { paymentId },
          { id: orderId },
        ],
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
        user: true,
      },
    });

    if (!order) {
      console.error(`[YooKassa Webhook] Order not found for payment ${paymentId}`);
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Обрабатываем различные события
    switch (event) {
      case 'payment.succeeded':
        // Платеж успешно завершен
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: 'paid',
            paymentStatus: 'succeeded',
            paymentId,
          },
        });

        // Очищаем корзину пользователя
        await prisma.cartItem.deleteMany({
          where: { userId: order.userId },
        });

        // Отправляем уведомление о заказе
        await sendOrderNotification({
          id: order.id,
          total: order.total,
          email: order.email,
          phone: order.phone,
          address: order.address,
          items: order.orderItems.map((item: typeof order.orderItems[0]) => ({
            name: sanitizeProductName(item.product?.name ?? ''),
            code: item.product?.code ?? null,
            quantity: item.quantity,
            price: item.price,
            size: item.size,
          })),
        });

        console.log(`[YooKassa Webhook] Order ${order.id} paid successfully`);
        break;

      case 'payment.waiting_for_capture':
        // Платеж ожидает подтверждения (для двухстадийных платежей)
        await prisma.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: 'waiting_for_capture',
          },
        });
        console.log(`[YooKassa Webhook] Order ${order.id} waiting for capture`);
        break;

      case 'payment.canceled':
        // Платеж отменен
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: 'payment_failed',
            paymentStatus: 'canceled',
          },
        });
        console.log(`[YooKassa Webhook] Order ${order.id} payment canceled`);
        break;

      case 'refund.succeeded':
        // Возврат успешно выполнен
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: 'refunded',
            paymentStatus: 'refunded',
          },
        });
        console.log(`[YooKassa Webhook] Order ${order.id} refunded`);
        break;

      default:
        console.log(`[YooKassa Webhook] Unhandled event: ${event}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[YooKassa Webhook] Error:', error);
    return NextResponse.json(
      { error: 'Webhook processing error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/payments/webhook
 * Проверка статуса платежа (для fallback при redirect)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('orderId');

  if (!orderId) {
    return NextResponse.json(
      { error: 'Order ID required' },
      { status: 400 }
    );
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        status: true,
        paymentStatus: true,
        paymentId: true,
        total: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Если есть paymentId и статус еще не финальный, проверяем актуальный статус в ЮКассе
    if (order.paymentId && order.paymentStatus === 'pending') {
      try {
        const payment = await getPayment(order.paymentId);
        
        if (payment.status !== order.paymentStatus) {
          // Обновляем статус в базе
          await prisma.order.update({
            where: { id: orderId },
            data: {
              paymentStatus: payment.status,
              status: payment.status === 'succeeded' ? 'paid' : 
                      payment.status === 'canceled' ? 'payment_failed' : order.status,
            },
          });

          // Если платеж прошел, очищаем корзину
          if (payment.status === 'succeeded') {
            await prisma.cartItem.deleteMany({
              where: { userId: order.id },
            });
          }
        }

        return NextResponse.json({
          orderId: order.id,
          status: order.status,
          paymentStatus: payment.status,
          total: order.total,
        });
      } catch (e) {
        console.error('Error fetching payment status:', e);
      }
    }

    return NextResponse.json({
      orderId: order.id,
      status: order.status,
      paymentStatus: order.paymentStatus,
      total: order.total,
    });
  } catch (error) {
    console.error('Get order status error:', error);
    return NextResponse.json(
      { error: 'Error fetching order status' },
      { status: 500 }
    );
  }
}
