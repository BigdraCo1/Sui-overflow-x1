
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { connectSuiWallet, detectSuiWallet, SuiWalletAccount } from '@/lib/suiWallet';
import { toast } from '@/hooks/use-toast';

interface SuiAuthProps {
  onSuccess: (account: SuiWalletAccount) => void;
  onError?: (error: Error) => void;
}

const SuiAuth: React.FC<SuiAuthProps> = ({ onSuccess, onError }) => {
  const [isWalletAvailable, setIsWalletAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    const checkWallet = async () => {
      try {
        const hasWallet = await detectSuiWallet();
        setIsWalletAvailable(hasWallet);
      } catch (error) {
        console.error('Error detecting Sui wallet:', error);
        setIsWalletAvailable(false);
      }
    };
    
    checkWallet();
  }, []);

  const handleConnect = async () => {
    try {
      const account = await connectSuiWallet();
      if (account) {
        onSuccess(account);
      } else {
        throw new Error('Failed to connect to Sui wallet');
      }
    } catch (error) {
      console.error('Sui wallet connection error:', error);
      toast({
        title: "การเชื่อมต่อล้มเหลว",
        description: "ไม่สามารถเชื่อมต่อกับกระเป๋า Sui ได้",
        variant: "destructive",
      });
      if (onError) onError(error as Error);
    }
  };

  if (isWalletAvailable === null) {
    return <Button disabled>กำลังตรวจสอบกระเป๋า Sui...</Button>;
  }

  if (isWalletAvailable === false) {
    return (
      <Button 
        variant="outline" 
        onClick={() => window.open('https://chrome.google.com/webstore/detail/sui-wallet/opcgpfmipidbgpenhmajoajpbobppdil', '_blank')}
      >
        ติดตั้งกระเป๋า Sui
      </Button>
    );
  }

  return (
    <Button onClick={handleConnect} className="w-full">
      เชื่อมต่อกับกระเป๋า Sui
    </Button>
  );
};

export default SuiAuth;