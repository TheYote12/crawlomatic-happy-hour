
import React from 'react';
import { MapPin } from 'lucide-react';

interface HeaderProps {
  isScrolled: boolean;
}

const Header: React.FC<HeaderProps> = ({ isScrolled }) => {
  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 px-6 py-4 transition-all duration-300 ${
        isScrolled ? 'bg-netflix-black shadow-md' : 'netflix-gradient'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <MapPin className="h-6 w-6 text-netflix-red mr-2" />
          <h1 className="text-2xl font-bold tracking-tight text-white">Happy Hour Crawl</h1>
        </div>
      </div>
    </header>
  );
};

export default Header;
