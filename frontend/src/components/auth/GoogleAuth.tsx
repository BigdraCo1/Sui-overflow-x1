import React, { useEffect, useRef } from 'react';
import { initGoogleAuth, renderGoogleButton, parseJwt, GoogleUserProfile } from '@/utils/auth';

interface GoogleAuthProps {
  onSuccess: (user: GoogleUserProfile) => void;
  onError?: (error: Error) => void;
}

const GoogleAuth: React.FC<GoogleAuthProps> = ({ onSuccess, onError }) => {
  const buttonRef = useRef<HTMLDivElement>(null);
  const buttonId = 'google-login-button';

  useEffect(() => {
    const GOOGLE_CLIENT_ID = "962179703260-q6gtv8s0vdpqr9neg3sl11fdnbr8mpjj.apps.googleusercontent.com";

    const handleGoogleResponse = (response: any) => {
      try {
        if (response.credential) {
          // Parse the JWT token to get user information
          const userProfile = parseJwt(response.credential);
          onSuccess(userProfile);
        }
      } catch (error) {
        console.error('Google authentication error:', error);
        if (onError) onError(error as Error);
      }
    };

    // Initialize Google authentication
    const setupAuth = async () => {
      try {
        await initGoogleAuth(GOOGLE_CLIENT_ID, handleGoogleResponse);
        if (buttonRef.current) {
          await renderGoogleButton(buttonId, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: 'continue_with',
            shape: 'rectangular',
            logo_alignment: 'left',
            width: 320
          });
        }
      } catch (error) {
        console.error('Error setting up Google authentication:', error);
        if (onError) onError(error as Error);
      }
    };

    setupAuth();
  }, [onSuccess, onError]);

  return <div id={buttonId} ref={buttonRef} className="w-full flex justify-center"></div>;
};

export default GoogleAuth;