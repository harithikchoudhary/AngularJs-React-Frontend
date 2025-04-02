import React from 'react';
import logo from '../assets/ustlogo.png';
 
function Navbar() {
  return (
    <nav className="w-full bg-gray-900 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <img src={logo} alt="Company Logo" className="h-8 w-auto" />
          </div>
        </div>
      </div>
    </nav>
  );
}
 
export default Navbar;
 