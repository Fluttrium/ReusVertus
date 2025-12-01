declare module '@appigram/yookassa-node' {
  interface YooKassaConfig {
    shopId: string;
    secretKey: string;
  }

  interface CreatePaymentParams {
    amount: {
      value: string;
      currency: string;
    };
    confirmation: {
      type: string;
      return_url: string;
    };
    capture?: boolean;
    description: string;
    metadata?: Record<string, any>;
    receipt?: {
      customer: {
        email?: string;
        phone?: string;
      };
      items: Array<{
        description: string;
        quantity: string;
        amount: {
          value: string;
          currency: string;
        };
        vat_code: number;
        payment_mode: string;
        payment_subject: string;
      }>;
    };
  }

  interface PaymentResult {
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

  class YooKassa {
    constructor(config: YooKassaConfig);
    createPayment(params: CreatePaymentParams): Promise<PaymentResult>;
    getPayment(paymentId: string): Promise<PaymentResult>;
  }

  export default YooKassa;
}
