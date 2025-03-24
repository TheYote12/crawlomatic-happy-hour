
import React from 'react';
import { MapPin } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface HeaderProps {
  isScrolled: boolean;
}

const Header: React.FC<HeaderProps> = ({ isScrolled }) => {
  const isMobile = useIsMobile();
  
  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-3 sm:py-4 transition-all duration-300 ${
        isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm' : 'apple-gradient'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <MapPin className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'} text-primary mr-2`} />
          <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-medium tracking-tight text-gray-900`}>
            Happy Hour Finder
          </h1>
        </div>
      </div>
    </header>
  );
};

export default Header;
