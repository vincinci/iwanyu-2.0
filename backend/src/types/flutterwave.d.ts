declare module 'flutterwave-node-v3' {
  export default class Flutterwave {
    constructor(publicKey: string, secretKey: string);
    
    Charge: {
      card(payload: any): Promise<any>;
    };
    
    Transaction: {
      verify(payload: { id: string }): Promise<any>;
    };
    
    Transfer: {
      initiate(payload: any): Promise<any>;
    };
    
    Misc: {
      fetch_banks(country: string): Promise<any>;
      verify_Account(payload: { account_number: string; account_bank: string }): Promise<any>;
    };
  }
}
