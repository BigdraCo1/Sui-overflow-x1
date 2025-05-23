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
import { executeZkLogin } from '@/services/zkLoginService';

const LoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isZkLoginLoading, setIsZkLoginLoading] = useState(false);
  const navigate = useNavigate();

  const handleZkLoginAuth = async () => {
    setIsZkLoginLoading(true);
    
    try {
      const result = await executeZkLogin();
      
      if (result.redirecting) {
        // The user is being redirected to Google OAuth, no need to do anything else
        return;
      }
      
      if (result.success) {
        toast.success(`zkLogin connection successful: ${result.address.substring(0, 6)}...${result.address.substring(result.address.length - 4)}`);
        navigate('/dashboard');
      } else {
        toast.error('zkLogin connection failed');
      }
    } catch (error) {
      console.error('zkLogin error:', error);
      toast.error('zkLogin connection failed');
    } finally {
      setIsZkLoginLoading(false);
    }
  };

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
            <button
              onClick={handleZkLoginAuth}
              disabled={isZkLoginLoading || isLoading}
              className="w-full h-12 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center gap-3 shadow-sm"
            >
              {/* Google logo SVG */}
              <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              <span className="text-gray-700 font-medium">
                {isZkLoginLoading ? 'Connecting...' : 'Continue With Google'}
              </span>
            </button>
          </div>
          
          <div className="relative flex items-center justify-center w-full my-4">
            <Separator className="w-full" />
            <span className="absolute bg-isopod-bone px-2 text-xs text-gray-500"></span>
          </div>
          
          <div className="w-full">
            <SuiWalletAuth
              onSuccess={handleSuiWalletSuccess}
              onError={handleSuiWalletError}
            />
          </div>
          
        </div>
      </CardContent>
    </Card>
  );
};

export default LoginForm;