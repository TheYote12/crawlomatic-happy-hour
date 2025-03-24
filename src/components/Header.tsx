
import React from 'react';
import { MapPin } from 'lucide-react';

interface HeaderProps {
  isScrolled: boolean;
}

const Header: React.FC<HeaderProps> = ({ isScrolled }) => {
  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-center transition-all duration-300 ${
        isScrolled ? 'backdrop-blur-md bg-background/80 shadow-md' : 'bg-transparent'
      }`}
    >
      <div className="flex items-center">
        <MapPin className="h-6 w-6 text-primary mr-2" />
        <h1 className="text-xl font-medium tracking-tight">Happy Hour Crawl</h1>
      </div>
    </header>
  );
};

export default Header;
