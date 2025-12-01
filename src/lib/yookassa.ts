// Инициализация клиента ЮКассы
// ВАЖНО: Добавьте эти переменные в .env файл:
// YOOKASSA_SHOP_ID=your_shop_id
// YOOKASSA_SECRET_KEY=your_secret_key
// NEXT_PUBLIC_APP_URL=https://your-domain.com

const shopId = process.env.YOOKASSA_SHOP_ID;
const secretKey = process.env.YOOKASSA_SECRET_KEY;

if (!shopId || !secretKey) {
  console.warn('YooKassa credentials not configured. Payment functionality will not work.');
}

// Ленивая инициализация клиента ЮКассы
let yookassaInstance: any = null;

async function getYooKassaClient() {
  if (yookassaInstance) {
    return yookassaInstance;
  }
  
  // @ts-ignore - модуль не имеет типов
  const YooKassaModule = await import('@appigram/yookassa-node');
  const YooKassa = (YooKassaModule as any).default || YooKassaModule;
  
  yookassaInstance = new YooKassa({
    shopId: shopId || '',
    secretKey: secretKey || '',
  });
  
  return yookassaInstance;
}

export interface CreatePaymentParams {
  amount: number; // в рублях
  orderId: string;
  description: string;
  customerEmail?: string;
  customerPhone?: string;
  returnUrl?: string;
}

export interface PaymentResult {
  id: string;
  status: string;
  confirmation?: {
    type: string;
    confirmation_url: string;
  };
  amount: {
    value: string;
    currency: string;
  };
}

/**
 * Создание платежа в ЮКассе
 */
export async function createPayment(params: CreatePaymentParams): Promise<PaymentResult> {
  const { amount, orderId, description, customerEmail, customerPhone, returnUrl } = params;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const yookassa = await getYooKassaClient();
  
  const payment = await yookassa.createPayment({
    amount: {
      value: amount.toFixed(2),
      currency: 'RUB',
    },
    confirmation: {
      type: 'redirect',
      return_url: returnUrl || `${appUrl}/payment/success?orderId=${orderId}`,
    },
    capture: true, // Автоматическое подтверждение платежа
    description,
    metadata: {
      order_id: orderId,
    },
    receipt: customerEmail || customerPhone ? {
      customer: {
        ...(customerEmail && { email: customerEmail }),
        ...(customerPhone && { phone: customerPhone }),
      },
      items: [
        {
          description: description.substring(0, 128), // Максимум 128 символов
          quantity: '1',
          amount: {
            value: amount.toFixed(2),
            currency: 'RUB',
          },
          vat_code: 1, // Без НДС
          payment_mode: 'full_payment',
          payment_subject: 'commodity',
        },
      ],
    } : undefined,
  });

  return payment as PaymentResult;
}

/**
 * Получение информации о платеже
 */
export async function getPayment(paymentId: string): Promise<PaymentResult> {
  const yookassa = await getYooKassaClient();
  const payment = await yookassa.getPayment(paymentId);
  return payment as PaymentResult;
}

/**
 * Проверка подписи webhook от ЮКассы
 * В реальном проекте рекомендуется проверять IP адреса ЮКассы
 */
export function verifyWebhook(body: string, signature: string): boolean {
  // ЮКасса не использует подпись для webhooks
  // Рекомендуется проверять IP адреса и статус платежа через API
  // IP адреса ЮКассы: 185.71.76.0/27, 185.71.77.0/27, 77.75.153.0/25, 77.75.156.11, 77.75.156.35
  return true;
}

export default getYooKassaClient;
