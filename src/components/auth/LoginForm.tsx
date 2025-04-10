import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import GoogleAuth from '@/components/auth/GoogleAuth';
import SuiWalletAuth from '@/components/auth/SuiWalletAuth';
import { GoogleUserProfile } from '@/utils/auth';
import { Link } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';

// Use an interface that matches what dApp Kit provides
interface SuiWalletAccount {
  address: string;
}

const LoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Handle successful Google authentication
  const handleGoogleAuthSuccess = (userProfile: GoogleUserProfile) => {
    // ... keep existing code (Google auth handling)
  };

  // Handle Google authentication error
  const handleGoogleAuthError = (error: Error) => {
    // ... keep existing code (Google auth error handling)
  };
  
  // Handle successful Sui Wallet authentication
  const handleSuiWalletSuccess = (account: SuiWalletAccount) => {
    setIsLoading(true);
    
    console.log('User authenticated via Sui Wallet:', account);
    
    setTimeout(() => {
      setIsLoading(false);
      toast.success(`เชื่อมต่อสำเร็จ: ${account.address.substring(0, 6)}...${account.address.substring(account.address.length - 4)}`);
      navigate('/dashboard');
    }, 500);
  };
  
  // Handle Sui Wallet authentication error
  const handleSuiWalletError = (error: Error) => {
    setIsLoading(false);
    toast.error('การเชื่อมต่อ Sui Wallet ล้มเหลว: ' + error.message);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="pt-6">
        <div className="space-y-6 animate-slide-up">
          {/* Google Identity Services Authentication Button */}
          <div className="w-full">
            <GoogleAuth 
              onSuccess={handleGoogleAuthSuccess} 
              onError={handleGoogleAuthError} 
            />
          </div>
          
          <div className="relative flex items-center justify-center w-full my-4">
            <Separator className="w-full" />
            <span className="absolute bg-white px-2 text-xs text-gray-500">หรือ</span>
          </div>
          
          {/* Sui Wallet Authentication Button */}
          <div className="w-full">
            <SuiWalletAuth
              onSuccess={handleSuiWalletSuccess}
              onError={handleSuiWalletError}
            />
          </div>
          
          <div className="text-center text-sm">
            ยังไม่มีบัญชีผู้ใช้?{' '}
            <Link to="/register" className="text-med-blue hover:text-med-blue-dark font-medium">
              ลงทะเบียน
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoginForm;