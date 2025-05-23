import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Wallet } from 'lucide-react';
import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';

interface SuiWalletAuthProps {
  onSuccess: (account: { address: string }) => void;
  onError?: (error: Error) => void;
}

const SuiWalletAuth: React.FC<SuiWalletAuthProps> = ({ onSuccess, onError }) => {
  const account = useCurrentAccount();
  const [isConnecting, setIsConnecting] = useState(false);
  
  // When account changes and we have an account, call onSuccess
  useEffect(() => {
    if (account) {
      console.log("Successfully connected with account:", account);
      onSuccess(account);
    }
  }, [account, onSuccess]);

  return (
    <div className="relative">
      <ConnectButton 
        className="w-full flex items-center justify-center gap-2 py-6 text-base"
        connectText={
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            <span>{isConnecting ? 'Connecting...' : 'Connect Sui Wallet'}</span>
          </div>
        }
      />
    </div>
  );
};

export default SuiWalletAuth;
