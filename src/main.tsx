import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import '@mysten/dapp-kit/dist/index.css';
import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();
const networks = {
  testnet: { url: getFullnodeUrl('testnet') },
  devnet: { url: getFullnodeUrl('devnet') },
  mainnet: { url: getFullnodeUrl('mainnet') },
};

// Make sure React StrictMode is not causing double mounting of providers
createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <SuiClientProvider networks={networks} defaultNetwork="devnet">
      <WalletProvider autoConnect={false}>
        <App />
      </WalletProvider>
    </SuiClientProvider>
  </QueryClientProvider>
);