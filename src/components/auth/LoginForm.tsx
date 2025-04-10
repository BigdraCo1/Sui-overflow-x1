import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import GoogleAuth from '@/components/auth/GoogleAuth';
import SuiWalletAuth from '@/components/auth/SuiWalletAuth';
import { GoogleUserProfile } from '@/utils/auth';
import { Link } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { SuiSvgIcon } from '@/components/ui/sui-icon';
import { executeZkLogin } from '@/services/zkLoginService';

interface SuiWalletAccount {
  address: string;
}

const LoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isZkLoginLoading, setIsZkLoginLoading] = useState(false);
  const navigate = useNavigate();

  const handleZkLoginAuth = async () => {
    setIsZkLoginLoading(true);
    
    try {
      const result = await executeZkLogin();
      
      if (result.success) {
        toast.success(`เชื่อมต่อสำเร็จด้วย zkLogin: ${result.address.substring(0, 6)}...${result.address.substring(result.address.length - 4)}`);
        navigate('/dashboard');
      } else {
        toast.error('การเชื่อมต่อด้วย zkLogin ล้มเหลว');
      }
    } catch (error) {
      console.error('zkLogin error:', error);
      toast.error('การเชื่อมต่อด้วย zkLogin ล้มเหลว');
    } finally {
      setIsZkLoginLoading(false);
    }
  };

  const handleGoogleAuthSuccess = (userProfile: GoogleUserProfile) => {
    setIsLoading(true);
    
    toast.success('Successfully logged in with Google!');
    navigate('/dashboard');
  };

  const handleGoogleAuthError = (error: Error) => {
    console.error('Google auth error:', error);
    toast.error('Failed to log in with Google. Please try again.');
    setIsLoading(false);
  };

  const handleSuiWalletSuccess = (account: SuiWalletAccount) => {
    setIsLoading(true);
    
    console.log('User authenticated via Sui Wallet:', account);
    
    setTimeout(() => {
      setIsLoading(false);
      toast.success(`เชื่อมต่อสำเร็จ: ${account.address.substring(0, 6)}...${account.address.substring(account.address.length - 4)}`);
      navigate('/dashboard');
    }, 500);
  };

  const handleSuiWalletError = (error: Error) => {
    setIsLoading(false);
    toast.error('การเชื่อมต่อ Sui Wallet ล้มเหลว: ' + error.message);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="pt-6">
        <div className="space-y-6 animate-slide-up">
          <div className="w-full">
            <Button 
              onClick={handleZkLoginAuth}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
              disabled={isZkLoginLoading || isLoading}
            >
              <SuiSvgIcon className="w-5 h-5" />
              {isZkLoginLoading ? 'กำลังเชื่อมต่อ...' : 'เข้าสู่ระบบด้วย Sui zkLogin'}
            </Button>
          </div>
          
          <div className="relative flex items-center justify-center w-full my-4">
            <Separator className="w-full" />
            <span className="absolute bg-white px-2 text-xs text-gray-500">หรือ</span>
          </div>
          
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
