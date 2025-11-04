import axios from 'axios';

const NOWPAYMENTS_API_URL = 'https://api.nowpayments.io/v1';

export interface CreatePaymentParams {
  price_amount: number;
  price_currency: string;
  pay_currency: string;
  order_id: string;
  order_description: string;
  ipn_callback_url: string;
}

export interface PaymentResponse {
  payment_id: string;
  payment_status: string;
  pay_address: string;
  price_amount: number;
  price_currency: string;
  pay_amount: number;
  pay_currency: string;
  order_id: string;
  order_description: string;
  ipn_callback_url: string;
  created_at: string;
  updated_at: string;
  payment_url: string;
}

export class NOWPaymentsService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Creates a new payment
   */
  async createPayment(params: CreatePaymentParams): Promise<PaymentResponse> {
    try {
      const response = await axios.post(
        `${NOWPAYMENTS_API_URL}/payment`,
        params,
        {
          headers: {
            'x-api-key': this.apiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('NOWPayments API error:', error);
      throw new Error('Failed to create payment');
    }
  }

  /**
   * Gets payment status
   */
  async getPaymentStatus(paymentId: string): Promise<any> {
    try {
      const response = await axios.get(
        `${NOWPAYMENTS_API_URL}/payment/${paymentId}`,
        {
          headers: {
            'x-api-key': this.apiKey,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('NOWPayments API error:', error);
      throw new Error('Failed to get payment status');
    }
  }

  /**
   * Gets available currencies
   */
  async getAvailableCurrencies(): Promise<string[]> {
    try {
      const response = await axios.get(
        `${NOWPAYMENTS_API_URL}/currencies`,
        {
          headers: {
            'x-api-key': this.apiKey,
          },
        }
      );

      return response.data.currencies;
    } catch (error) {
      console.error('NOWPayments API error:', error);
      throw new Error('Failed to get currencies');
    }
  }

  /**
   * Verifies IPN callback
   */
  verifyIPN(signature: string, payload: string, secret: string): boolean {
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha512', secret);
    hmac.update(payload);
    const calculatedSignature = hmac.digest('hex');

    return signature === calculatedSignature;
  }
}

export default NOWPaymentsService;
