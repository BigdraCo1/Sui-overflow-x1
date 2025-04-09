import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import GoogleAuth from '@/components/auth/GoogleAuth';
import { GoogleUserProfile } from '@/utils/auth';
import { Link } from 'react-router-dom';

const LoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Handle successful Google authentication
  const handleGoogleAuthSuccess = (userProfile: GoogleUserProfile) => {
    setIsLoading(true);
    
    // Here you would typically:
    // 1. Send the token to your backend to verify
    // 2. Create or retrieve the user account
    // 3. Set authentication state
    
    console.log('User authenticated:', userProfile);
    
    // For this example, we'll just simulate success
    setTimeout(() => {
      setIsLoading(false);
      toast.success(`ยินดีต้อนรับ, ${userProfile.name}!`);
      navigate('/dashboard');
    }, 500);
  };

  // Handle Google authentication error
  const handleGoogleAuthError = (error: Error) => {
    setIsLoading(false);
    toast.error('การเข้าสู่ระบบผ่าน Google ล้มเหลว: ' + error.message);
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Google Identity Services Authentication Button */}
      <div className="w-full">
        <GoogleAuth 
          onSuccess={handleGoogleAuthSuccess} 
          onError={handleGoogleAuthError} 
        />
      </div>
      
      <div className="text-center text-sm">
        ยังไม่มีบัญชีผู้ใช้?{' '}
        <Link to="/register" className="text-med-blue hover:text-med-blue-dark font-medium">
          ลงทะเบียน
        </Link>
      </div>
    </div>
  );
};

export default LoginForm;