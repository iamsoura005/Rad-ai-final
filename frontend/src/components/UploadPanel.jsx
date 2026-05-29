import React, { useState } from 'react';

const UploadPanel = ({ onImageSelected, onAnalyzeClick, isAnalyzing }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setPreviewUrl(previewUrl);
      onImageSelected(file);
    } else {
      setSelectedFile(null);
      setPreviewUrl(null);
      onImageSelected(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      const previewUrl = URL.createObjectURL(file);
      setPreviewUrl(previewUrl);
      onImageSelected(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleClickAnalyze = () => {
    if (selectedFile) {
      onAnalyzeClick(selectedFile);
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 space-y-4">
      <h2 className="text-lg font-semibold text-white">Upload Medical Image</h2>
      
      {/* Drop zone */}
      <div 
        className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center flex flex-col items-center space-y-3 hover:border-gray-400 transition-colors"
        onDrop={handleDrop}
        onDragover={handleDragOver}
      >
        {/* Medical icon (using a simple circle for now, can be replaced with actual icon) */}
        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white text-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        
        <p className="text-gray-400">Drag & drop your medical image here</p>
        <p className="text-sm text-gray-500">or click to browse</p>
        <input 
          type="file" 
          accept=".jpg,.jpeg,.png,.webp,.dcm" 
          className="hidden"
          onChange={handleFileChange}
        />
        <button 
          onClick={() => document.querySelector('input[type="file"]').click()}
          className="text-medical-blue hover:text-medical-cyan underline"
        >
          Browse files
        </button>
        <p className="text-xs text-gray-600">
          Accepted formats: JPG, PNG, WEBP
        </p>
      </div>

      {/* Image preview */}
      {previewUrl && (
        <div className="relative">
          <img 
            src={previewUrl} 
            alt="Preview" 
            className="w-full h-64 object-contain rounded-lg bg-gray-800 p-2"
          />
          <div className="absolute bottom-2 left-2 right-2 text-sm text-gray-400 bg-gray-800/50 px-2 py-1 rounded">
            {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
          </div>
        </div>
      )}

      {/* Analyze button */}
      <button
        onClick={handleClickAnalyze}
        disabled={!selectedFile || isAnalyzing}
        className="w-full bg-medical-blue hover:bg-medical-cyan text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isAnalyzing ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Analyzing...</span>
          </div>
        ) : (
          <span>Analyze Image</span>
        )}
      </button>
    </div>
  );
};

export default UploadPanel;