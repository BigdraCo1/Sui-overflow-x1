import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import IsopodLogo from '@/components/ui/isopod_logo';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
}

const AuthLayout = ({ children, title, description }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="absolute top-8 left-8">
        <IsopodLogo size={48} />
      </div>
      
      <Card className="w-full max-w-md mx-auto bg-white shadow-xl border-none rounded-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-gray-800 font-orbitron">{title}</CardTitle>
          <CardDescription className="text-center text-gray-600">{description}</CardDescription>
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthLayout;