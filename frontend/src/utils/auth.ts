import type { GoogleButtonOptions, GoogleAuthConfig } from '@/types/google';

export interface GoogleUserProfile {
  email: string;
  name: string;
  picture: string;
  sub: string; // Google user ID
}

export interface SuiWalletAccount {
  address: string;
}

export async function initGoogleAuth(
  clientId: string,
  callback: (response: { credential: string }) => void
): Promise<void> {
  // Load the Google Identity Services script
  if (document.getElementById('google-auth-script')) return;

  return new Promise((resolve, reject) => {
    try {
      const script = document.createElement('script');
      script.id = 'google-auth-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        // Initialize Google One Tap
        window.google?.accounts.id.initialize({
          client_id: clientId,
          callback,
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        resolve();
      };
      
      script.onerror = (error) => {
        reject(new Error('Failed to load Google authentication script'));
      };
      
      document.head.appendChild(script);
    } catch (error) {
      reject(error);
    }
  });
}

export async function renderGoogleButton(
  buttonId: string, 
  options: GoogleButtonOptions = {}
): Promise<void> {
  // Wait for the Google Identity Services to be loaded
  if (!window.google?.accounts?.id) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return renderGoogleButton(buttonId, options);
  }

  const buttonElement = document.getElementById(buttonId);
  if (!buttonElement) {
    throw new Error(`Button element with id ${buttonId} not found`);
  }

  // Default options with proper types
  const defaultOptions: GoogleButtonOptions = {
    type: 'standard',
    theme: 'outline',
    size: 'large',
    text: 'continue_with',
    shape: 'rectangular',
    logo_alignment: 'left',
    width: 320
  };

  // Merge default options with provided options
  const buttonOptions: GoogleButtonOptions = { ...defaultOptions, ...options };

  // Render the Google Sign In button
  window.google.accounts.id.renderButton(
    buttonElement,
    buttonOptions
  );
}

// Parse and validate Google JWT token
export function parseJwt(token: string): GoogleUserProfile {
  try {
    // Decode the JWT token (base64)
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error parsing Google JWT token:', error);
    throw new Error('Invalid authentication token');
  }
}
