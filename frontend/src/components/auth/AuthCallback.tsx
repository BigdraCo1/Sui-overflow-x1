
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { handleZkLoginCallback } from '@/services/zkLoginService';
import { toast } from 'sonner';

const AuthCallback = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    async function processCallback() {
      try {
        // Parse the JWT token from the URL
        const urlParams = new URLSearchParams(location.hash.substring(1));
        const idToken = urlParams.get('id_token');
        
        if (!idToken) {
          throw new Error('No ID token found in the callback URL');
        }
        
        // Complete the zkLogin process with the JWT
        const result = await handleZkLoginCallback(idToken);
        
        if (result.success) {
          toast.success('Login successful.');
          navigate('/dashboard');
        } else {
          throw new Error('Failed to complete authentication');
        }
      } catch (err) {
        console.error('Authentication callback error:', err);
        setError('Login failed. Please try again.');
        setTimeout(() => navigate('/login'), 3000);
      } finally {
        setLoading(false);
      }
    }
    
    processCallback();
  }, [location, navigate]);
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        {loading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-lg">Logging in.....</p>
          </div>
        ) : error ? (
          <div className="text-center text-red-500">
            <p className="text-lg">{error}</p>
            <p className="mt-2">Redirecting you to the login page...</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default AuthCallback;