
// Google Identity Services types
declare global {
    interface Window {
      google: {
        accounts: {
          id: {
            initialize: (config: GoogleAuthConfig) => void;
            renderButton: (element: HTMLElement, options: GoogleButtonOptions) => void;
            prompt: (momentListener?: (notification: { isNotDisplayed: () => boolean, isSkippedMoment: () => boolean }) => void) => void;
          };
        };
      }
    }
  }
  
  export interface GoogleAuthConfig {
    client_id: string;
    callback: (response: { credential: string }) => void;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
  }
  
  export interface GoogleButtonOptions {
    type?: 'standard' | 'icon';
    theme?: 'outline' | 'filled_blue' | 'filled_black';
    size?: 'large' | 'medium' | 'small';
    text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
    shape?: 'rectangular' | 'pill' | 'circle' | 'square';
    logo_alignment?: 'left' | 'center';
    width?: string | number;
  }
  