import React, { useState } from 'react';
import Navbar from './components/Navbar';
import UploadPanel from './components/UploadPanel';
import ResultPanel from './components/ResultPanel';

const App = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleImageSelected = (file) => {
    setSelectedFile(file);
  };

  const handleAnalyzeClick = (file) => {
    setIsAnalyzing(true);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="flex flex-col items-center px-4 py-8 md:py-12">
        <div className="w-full max-w-5xl space-y-8">
          <div className="flex flex-col md:flex-row md:space-x-8">
            {/* Left Panel: Upload */}
            <div className="flex-1 space-y-4">
              <UploadPanel 
                onImageSelected={handleImageSelected}
                onAnalyzeClick={handleAnalyzeClick}
                isAnalyzing={isAnalyzing}
              />
            </div>
            
            {/* Right Panel: Results */}
            <div className="flex-1 space-y-4">
              <ResultPanel onAnalyzeClick={handleAnalyzeClick} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;