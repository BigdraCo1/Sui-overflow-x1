interface SuiWalletResponse {
    result?: {
      accounts: string[];
      publicKey?: string;
    };
    error?: {
      code: number;
      message: string;
    };
  }
  
  interface SuiWalletInterface {
    connect: () => Promise<SuiWalletResponse>;
    disconnect: () => Promise<void>;
    getAccounts: () => Promise<string[]>;
    getWallets?: () => Array<{ name: string; icon: string }>;
    signTransaction?: (transaction: any) => Promise<any>;
    executeTransaction?: (transaction: any) => Promise<any>;
  }
  
  declare global {
    interface Window {
      suiWallet?: SuiWalletInterface;
    }
  }
  
  export {};
  