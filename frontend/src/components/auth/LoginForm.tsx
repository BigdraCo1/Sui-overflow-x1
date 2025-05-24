import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import SuiWalletAuth from '@/components/auth/SuiWalletAuth';
import { SuiWalletAccount } from '@/utils/auth';
import { Link } from 'react-router-dom'; 
import { Separator } from '@/components/ui/separator'; 
import { Card, CardContent } from '@/components/ui/card';
import { Button } from "@/components/ui/button"; 
import { SuiSvgIcon } from '@/components/ui/sui-icon'; 

const LoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  // const [isZkLoginLoading, setIsZkLoginLoading] = useState(false); 
  const navigate = useNavigate();

  

  const handleSuiWalletSuccess = (account: SuiWalletAccount) => {
    setIsLoading(true);
    
    console.log('User authenticated via Sui Wallet:', account);
    
    setTimeout(() => {
      setIsLoading(false);
      toast.success(`connection successful: ${account.address.substring(0, 6)}...${account.address.substring(account.address.length - 4)}`);
      navigate('/dashboard');
    }, 500);
  };

  const handleSuiWalletError = (error: Error) => {
    setIsLoading(false);
    toast.error('Sui Wallet Connection Failed: ' + error.message);
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-transparent border-none shadow-none">
      <CardContent className="pt-6">
        <div className="space-y-6 animate-slide-up">
       
          
          <div className="w-full">
            <SuiWalletAuth
              onSuccess={handleSuiWalletSuccess}
              onError={handleSuiWalletError}
              
              // disabled={isLoading}
              
            />
          </div>
          
        </div>
      </CardContent>
    </Card>
  );
};

export default LoginForm;  
