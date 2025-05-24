import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, 
  Copy,
  ChevronDown
} from 'lucide-react'; // Icon library
import { Button } from '@/components/ui/button'; // Shadcn UI Button
import { toast } from 'sonner'; // Toast notifications
import {
  useCurrentWallet,
  useCurrentAccount,
  useDisconnectWallet,
} from '@mysten/dapp-kit'; // Sui Wallet hooks
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Shadcn UI Dropdown
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Shadcn UI Avatar
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"; // Shadcn UI Tooltip

interface MainLayoutProps {
  children: React.ReactNode;
  title: string;
}

// Helper function to truncate address to "0xPREF...SUFF"
const truncateWalletAddress = (address: string | undefined, prefixLength = 6, suffixLength = 4): string => {
  if (!address) return "";
  // Ensure address starts with "0x" and has enough length for truncation
  if (address.startsWith("0x") && address.length > prefixLength + suffixLength) {
    return `${address.substring(0, prefixLength)}...${address.substring(address.length - suffixLength)}`;
  }
  return address; // Return full address if too short or not "0x"
};


const MainLayout = ({ children, title }: MainLayoutProps) => {
  const navigate = useNavigate();
  const { currentWallet, isConnected } = useCurrentWallet();
  const currentAccount = useCurrentAccount();
  const { mutate: disconnectWallet } = useDisconnectWallet();

  const handleLogout = () => {
    disconnectWallet(
      undefined, // No specific parameters needed for basic disconnect
      {
        onSuccess: () => {
          toast.success('Wallet disconnected. Logging out...');
          navigate('/login'); // Navigate to the login/home page
        },
        onError: (error) => {
          // Even if wallet disconnect fails (e.g., user cancels in extension), still log out from app UI
          toast.error(`Wallet disconnect may have issues: ${error.message}. Logging out...`);
          navigate('/login'); // Navigate to the login/home page
        }
      }
    );
  };

  const handleCopyToClipboard = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent dropdown from toggling when copy icon is clicked
    if (currentAccount?.address) {
      try {
        await navigator.clipboard.writeText(currentAccount.address);
        toast.success('Address copied to clipboard!');
      } catch (err) {
        toast.error('Failed to copy address.');
        console.error('Failed to copy: ', err);
      }
    }
  };

  // This useEffect acts as a safeguard. If MainLayout is rendered
  // without a connected wallet (e.g., direct navigation, state loss),
  // redirect to the login page. Your routing should ideally prevent this.
  React.useEffect(() => {
    if (!isConnected || !currentWallet || !currentAccount?.address) {
      console.warn("MainLayout: Wallet not connected or account info missing. Redirecting to /login.");
      navigate('/login');
    }
  }, [isConnected, currentWallet, currentAccount, navigate]);

  // If wallet information is not yet available (e.g., during initial load or redirect),
  // render nothing or a minimal loader to prevent errors.
  if (!isConnected || !currentWallet || !currentAccount?.address) {
    return null; // Or <LoadingSpinner /> if you have one
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50"> {/* Main background */}
      {/* Top Header Bar */}
      <div className="bg-white border-b border-gray-200 py-3 px-6 shadow-sm">
        <div className="flex justify-between items-center">
          {/* Left Side: App Logo and Name */}
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shrink-0"> {/* Your App Logo */}
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <path d="m8 18-6-6 6-6" />
                <path d="M2 12h20" />
              </svg>
            </div>
            <span className="text-xl font-semibold text-gray-700">ISOPOD</span>
          </div>
          
          {/* Right Side: Wallet Display and Logout Dropdown */}
          <TooltipProvider delayDuration={100}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline" // Use "outline" or "ghost" and style accordingly
                  className="flex items-center gap-2.5 px-3 py-2 h-auto rounded-lg bg-sky-50 hover:bg-sky-100 border-sky-200 text-slate-800 shadow-sm focus-visible:ring-1 focus-visible:ring-sky-400 focus-visible:ring-offset-1 cursor-pointer"
                >
                  <Avatar className="h-7 w-7">
                    {currentWallet.icon ? (
                      <AvatarImage src={currentWallet.icon} alt={currentWallet.name} className="object-contain" />
                    ) : (
                      // Fallback Sui-like icon SVG (similar to your image)
                      <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full text-blue-600">
                        <path d="M30 0C13.431 0 0 13.431 0 30C0 46.569 13.431 60 30 60C46.569 60 60 46.569 60 30C60 13.431 46.569 0 30 0ZM40.1832 40.7121C38.4164 43.3401 35.373 45 32.0192 45C26.9421 45 22.8107 40.8686 22.8107 35.7915C22.8107 32.4377 24.4703 29.513 27.1899 27.8209C27.6879 27.4881 28.2655 27.3032 28.8794 27.3032C29.7099 27.3032 30.4495 27.8209 30.8101 28.5774C31.289 29.513 31.0902 30.6653 30.2597 31.3951C28.8054 32.475 27.9749 33.9968 27.9749 35.7915C27.9749 38.2506 29.7839 40.1984 32.0988 40.1984C33.5531 40.1984 34.8701 39.3679 35.6331 38.1831C36.1311 37.4266 37.0668 37.1263 37.8973 37.3584C38.7278 37.5905 39.2954 38.347 39.2954 39.1775C39.2954 39.7551 39.0633 40.3327 38.6352 40.7121H40.1832ZM41.1206 23.6049C41.1206 22.0156 42.0563 20.731 43.4431 19.9744C44.8299 19.2179 46.457 19.5182 47.4599 20.5885C48.1572 21.3183 48.7348 22.4373 48.7348 23.6049C48.7348 26.2329 46.8583 28.3505 44.3635 28.3505C42.5217 28.3505 41.1206 26.9494 41.1206 25.1547V23.6049Z" fill="currentColor"/>
                      </svg>
                    )}
                    <AvatarFallback>{currentWallet.name?.[0]?.toUpperCase() || 'W'}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start text-left mr-1">
                    <span className="text-sm font-semibold leading-tight">{currentWallet.name}</span>
                    <span className="text-xs text-slate-600 leading-tight">{truncateWalletAddress(currentAccount.address)}</span>
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="p-1 h-auto w-auto text-slate-500 hover:text-slate-700 hover:bg-sky-200/50 rounded-md"
                        onClick={handleCopyToClipboard}
                        aria-label="Copy wallet address"
                      >
                        <Copy size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Copy address</p>
                    </TooltipContent>
                  </Tooltip>
                  <ChevronDown size={18} className="text-slate-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-1"> {/* Adjust width and margin as needed */}
                <DropdownMenuItem 
                  onSelect={handleLogout} 
                  className="text-red-600 hover:!text-red-700 hover:!bg-red-50 focus:!bg-red-50 focus:!text-red-700 cursor-pointer"
                >
                  <LogOut size={16} className="mr-2" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TooltipProvider>
        </div>
      </div>
      
      {/* Page Header Section */}
      <div className="py-4 px-6 bg-white border-b border-gray-200">
        <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
      </div>
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-auto p-6 bg-gray-50"> {/* Content area background */}
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
