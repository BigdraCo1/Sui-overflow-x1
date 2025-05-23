import React from 'react';
import AuthLayout from '@/components/auth/AuthLayout';
import LoginForm from '@/components/auth/LoginForm';

const Login = () => {
  return (
    <AuthLayout 
      title="Welcome to ISOPOD" 
      description="Secure, efficient monitoring for your shipments"
    >
      <LoginForm />
    </AuthLayout>
  );
};

export default Login;