
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, 
  Package, 
  Settings, 
  User 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface MainLayoutProps {
  children: React.ReactNode;
  title: string;
}

const MainLayout = ({ children, title }: MainLayoutProps) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Top header with app name and logo */}
      <div className="bg-background border-b border-gray-300 py-3 px-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <path d="m8 18-6-6 6-6" />
                <path d="M2 12h20" />
              </svg>
            </div>
            <span className="text-xl font-semibold text-med-gray">ISOPOD</span>
          </div>
          
          {/* Right side controls */}
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-med-gray hover:text-med-blue hover:bg-med-blue/5"
              onClick={() => navigate('/profile')}
            >
              <User size={18} className="mr-1" />
              <span className="hidden sm:inline">Profile</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-med-gray hover:text-med-blue hover:bg-med-blue/5"
              onClick={() => navigate('/settings')}
            >
              <Settings size={18} className="mr-1" />
              <span className="hidden sm:inline">Settings</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-med-gray hover:text-med-red"
              onClick={handleLogout}
            >
              <LogOut size={18} className="mr-1" />
              <span className="hidden sm:inline">Log out</span>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Page header */}
      <div className="py-4 px-6 bg-background border-b border-gray-300">
        <h1 className="text-2xl font-semibold text-med-gray">{title}</h1>
      </div>
      
      {/* Main content */}
      <main className="flex-1 overflow-auto p-6 bg-background">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
