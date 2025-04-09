
import React from 'react';
import AuthLayout from '@/components/auth/AuthLayout';
import RegisterForm from '@/components/auth/RegisterForm';

const Register = () => {
  return (
    <AuthLayout 
      title="Create an account" 
      description="Enter your details to create your account"
    >
      <RegisterForm />
    </AuthLayout>
  );
};

export default Register;
