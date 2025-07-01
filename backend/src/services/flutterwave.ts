import Flutterwave from 'flutterwave-node-v3';

const flw = new Flutterwave(
  process.env.FLUTTERWAVE_PUBLIC_KEY!,
  process.env.FLUTTERWAVE_SECRET_KEY!
);

export interface PaymentData {
  tx_ref: string;
  amount: number;
  currency: string;
  redirect_url: string;
  payment_options?: string;
  customer: {
    email: string;
    phonenumber?: string;
    name: string;
  };
  customizations?: {
    title?: string;
    description?: string;
    logo?: string;
  };
  meta?: any;
}

export interface PayoutData {
  account_bank: string;
  account_number: string;
  amount: number;
  currency: string;
  narration: string;
  reference: string;
  beneficiary_name: string;
}

export class FlutterwaveService {
  static async initializePayment(paymentData: PaymentData) {
    try {
      const payload = {
        ...paymentData,
        currency: 'RWF', // Force Rwandan Franc
      };

      const response = await flw.Charge.card(payload);
      return response;
    } catch (error) {
      console.error('Flutterwave payment initialization error:', error);
      throw new Error('Payment initialization failed');
    }
  }

  static async verifyPayment(transactionId: string) {
    try {
      const response = await flw.Transaction.verify({ id: transactionId });
      return response;
    } catch (error) {
      console.error('Flutterwave payment verification error:', error);
      throw new Error('Payment verification failed');
    }
  }

  static async createPayout(payoutData: PayoutData) {
    try {
      const payload = {
        ...payoutData,
        currency: 'RWF', // Force Rwandan Franc
      };

      const response = await flw.Transfer.initiate(payload);
      return response;
    } catch (error) {
      console.error('Flutterwave payout error:', error);
      throw new Error('Payout creation failed');
    }
  }

  static async getBanks(country: string = 'RW') {
    try {
      const response = await flw.Misc.fetch_banks(country);
      return response;
    } catch (error) {
      console.error('Flutterwave banks fetch error:', error);
      throw new Error('Failed to fetch banks');
    }
  }

  static async verifyAccount(accountNumber: string, bankCode: string) {
    try {
      const response = await flw.Misc.verify_Account({
        account_number: accountNumber,
        account_bank: bankCode
      });
      return response;
    } catch (error) {
      console.error('Flutterwave account verification error:', error);
      throw new Error('Account verification failed');
    }
  }
}
