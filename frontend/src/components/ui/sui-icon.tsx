import React from 'react';

interface SuiSvgIconProps {
  className?: string;
}

export const SuiSvgIcon: React.FC<SuiSvgIconProps> = ({ className = "w-6 h-6" }) => {
  return (
    <svg 
      className={className}
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z" 
        fill="white" 
      />
      <path 
        d="M7.09179 8.95833C6.67901 8.95833 6.34375 8.6598 6.34375 8.29165C6.34375 7.92351 6.67901 7.62498 7.09179 7.62498H16.9082C17.321 7.62498 17.6562 7.92351 17.6562 8.29165C17.6562 8.6598 17.321 8.95833 16.9082 8.95833H7.09179Z" 
        fill="#6fbcf0" 
      />
      <path 
        d="M10.6752 13.625C10.2624 13.625 9.92715 13.3265 9.92715 12.9583C9.92715 12.5902 10.2624 12.2917 10.6752 12.2917H16.9082C17.321 12.2917 17.6562 12.5902 17.6562 12.9583C17.6562 13.3265 17.321 13.625 16.9082 13.625H10.6752Z" 
        fill="#6fbcf0" 
      />
      <path 
        d="M7.09179 17.0417C6.67901 17.0417 6.34375 16.7431 6.34375 16.375C6.34375 16.0069 6.67901 15.7083 7.09179 15.7083H13.3248C13.7376 15.7083 14.0729 16.0069 14.0729 16.375C14.0729 16.7431 13.7376 17.0417 13.3248 17.0417H7.09179Z" 
        fill="#6fbcf0" 
      />
    </svg>
  );
};