// Инициализация клиента ЮКассы
// ВАЖНО: Добавьте эти переменные в .env файл:
// YOOKASSA_SHOP_ID=your_shop_id
// YOOKASSA_SECRET_KEY=your_secret_key
// YOOKASSA_SHOP_NAME=Название магазина (опционально, для страницы оплаты)
// NEXT_PUBLIC_APP_URL=https://your-domain.com

const shopId = process.env.YOOKASSA_SHOP_ID;
const secretKey = process.env.YOOKASSA_SECRET_KEY;
const shopName = process.env.YOOKASSA_SHOP_NAME || 'RUES VERTES';

if (!shopId || !secretKey) {
  console.warn('YooKassa credentials not configured. Payment functionality will not work.');
}

// Ленивая инициализация клиента ЮКассы
let yookassaInstance: any = null;

async function getYooKassaClient() {
  if (yookassaInstance) {
    return yookassaInstance;
  }
  
  // Логируем для отладки (только в dev режиме)
  if (process.env.NODE_ENV === 'development') {
    console.log('[YooKassa Debug] shopId:', shopId ? `${shopId.substring(0, 3)}...` : 'NOT SET');
    console.log('[YooKassa Debug] secretKey:', secretKey ? `${secretKey.substring(0, 3)}...` : 'NOT SET');
  }
  
  if (!shopId || !secretKey) {
    throw new Error('YooKassa credentials not configured. Please set YOOKASSA_SHOP_ID and YOOKASSA_SECRET_KEY in environment variables.');
  }
  
  // @ts-ignore - модуль не имеет типов
  const YooKassaModule = await import('@appigram/yookassa-node');
  // Модуль экспортирует класс YooKassa в свойстве YooKassa
  const YooKassa = (YooKassaModule as any).YooKassa;
  
  if (!YooKassa || typeof YooKassa !== 'function') {
    throw new Error('YooKassa class not found in module. Available keys: ' + Object.keys(YooKassaModule));
  }
  
  try {
    yookassaInstance = new YooKassa({
      shopId: shopId,
      secretKey: secretKey,
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[YooKassa Debug] Client initialized successfully');
    }
  } catch (error: any) {
    console.error('[YooKassa Debug] Initialization error:', error);
    throw error;
  }
  
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
  
  try {
    const yookassa = await getYooKassaClient();
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[YooKassa Debug] Creating payment with amount:', amount, 'orderId:', orderId);
    }
    
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
        shop_name: shopName, // Название магазина для страницы оплаты
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
  } catch (error: any) {
    // Детальное логирование ошибок для отладки
    if (process.env.NODE_ENV === 'development') {
      console.error('[YooKassa Debug] Payment creation error:', {
        message: error.message,
        response: error.response ? {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
        } : null,
        stack: error.stack,
      });
    }
    
    // Обработка ошибок API ЮКассы
    if (error.response) {
      const status = error.response.status;
      const statusText = error.response.statusText;
      const data = error.response.data;
      
      if (status === 401) {
        const errorDetails = process.env.NODE_ENV === 'development' 
          ? ` (Response: ${JSON.stringify(data)})` 
          : '';
        throw new Error(`Ошибка авторизации в ЮКассе. Проверьте правильность YOOKASSA_SHOP_ID и YOOKASSA_SECRET_KEY в переменных окружения.${errorDetails}`);
      } else if (status === 400) {
        throw new Error(`Ошибка запроса к ЮКассе: ${data?.description || statusText}`);
      } else {
        throw new Error(`Ошибка API ЮКассы (${status}): ${data?.description || statusText}`);
      }
    }
    
    // Если это наша ошибка о настройках
    if (error.message?.includes('credentials not configured')) {
      throw error;
    }
    
    // Другие ошибки
    throw new Error(`Ошибка при создании платежа: ${error.message || 'Неизвестная ошибка'}`);
  }
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
