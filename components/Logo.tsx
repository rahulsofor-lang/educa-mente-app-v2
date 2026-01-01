import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const LOGO_URL = "https://i.postimg.cc/VJgvNxTK/295fefff.png";

  const sizeClasses = {
    sm: 'h-10 md:h-12',
    md: 'h-24 md:h-32',
    lg: 'h-40 md:h-56'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <img 
        src={LOGO_URL} 
        alt="EducaMente - Consultoria NR1" 
        className={`${sizeClasses[size]} w-auto object-contain`}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = "https://i.postimg.cc/VJgvNxTK/295fefff.png";
        }}
      />
    </div>
  );
};

export default Logo;