import React from 'react';

const Navbar = () => {
  return (
    <nav className="bg-gray-900 px-6 py-4 flex items-center justify-between border-b border-gray-800">
      <div className="flex items-center space-x-3">
        <div className="w-5 h-5 bg-blue-500 rounded-full pulse animate-pulse"></div>
        <div>
          <h1 className="text-xl font-bold text-white">RadiologyAI</h1>
          <p className="text-sm text-gray-400">AI-Powered Medical Image Analysis</p>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;