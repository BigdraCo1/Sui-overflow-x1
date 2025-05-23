/**
 * Helper function to check for wallet extensions using dApp Kit
 * This can help debug issues with wallet detection
 */
export function registerWalletDetector() {
    // Make sure we're in a browser environment
    if (typeof window !== 'undefined') {
      // Add a helper function to window for checking wallet presence
      (window as any).checkWallets = () => {
        console.log('Checking for wallet extensions...');
        
        // Check for dApp Kit wallet detection
        const dappKitWallets = (window as any).__dapp_kit_wallets;
        console.log('dApp Kit detected wallets:', dappKitWallets);
        
        // Legacy check for Sui Wallet
        console.log('Sui Wallet direct detection:', Boolean(window.suiWallet));
        
        if (window.suiWallet) {
          console.log('Sui Wallet methods:', Object.keys(window.suiWallet));
        }
        
        // Check all window properties that might be related to wallets
        const possibleWalletProps = Object.keys(window).filter(key => 
          key.toLowerCase().includes('wallet') || 
          key.toLowerCase().includes('sui') ||
          key.toLowerCase().includes('crypto')
        );
        
        console.log('Possible wallet-related window properties:', possibleWalletProps);
        return {
          hasSuiWallet: Boolean(window.suiWallet || dappKitWallets?.sui),
          dappKitWallets,
          possibleWalletProps
        };
      };
      
      console.log('Wallet detector registered. Run window.checkWallets() in console to check wallet status');
    }
  }
  