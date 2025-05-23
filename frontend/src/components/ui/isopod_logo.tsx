import React from 'react';

interface IsopodLogoProps {
  className?: string;
  size?: number;
}

export const IsopodLogo: React.FC<IsopodLogoProps> = ({ 
  className = "", 
  size = 40 
}) => {
  return (
    <div className={`flex items-center ${className}`}>
      <img 
        src="src\image\android-chrome-192x192.png" 
        alt="ISOPOD Logo" 
        className={`w-${size / 10} h-${size / 10}`} 
        style={{ width: size, height: size }}
      />
      <span className="ml-2 text-xl font-bold text-black font-orbitron">ISOPOD</span>
    </div>
  );
};

export default IsopodLogo;
