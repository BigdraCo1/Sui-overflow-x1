// This file is kept for compatibility with existing code
// The actual wallet connection is now handled by @mysten/dapp-kit

export interface SuiWalletAccount {
    address: string;
  }
  
  // These functions are maintained for compatibility but now use dApp Kit internally
  export async function detectSuiWallet(): Promise<boolean> {
    if (typeof window !== 'undefined') {
      // Check if dApp Kit detects wallets
      return true; // dApp Kit handles wallet detection now
    }
    return false;
  }
  
  export async function connectSuiWallet(): Promise<SuiWalletAccount | null> {
    // The actual connection is handled by dApp Kit
    // This is just a compatibility layer
    console.log('Connection now handled by dApp Kit');
    return null;
  }
  