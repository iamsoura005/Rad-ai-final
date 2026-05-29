import React, { useState } from 'react';
import ResultCard from './ResultCard';

const ResultPanel = ({ onAnalyzeClick }) => {
  const [analysisText, setAnalysisText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const textRef = useRef(null);

  const handleAnalyzeClick = async (file) => {
    setIsAnalyzing(true);
    setError(null);
    setAnalysisText('');
    setHasAnalyzed(false);
    textRef.current = null;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Check if the response is readable
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      // Function to process the stream
      const processStream = () => {
        return reader.read().then(({ done, value }) => {
          if (done) {
            setIsAnalyzing(false);
            setHasAnalyzed(true);
            return;
          }
          const chunkText = decoder.decode(value, { stream: true });
          // Split by SSE pattern: "data: " and then the chunk, ending with "\n\n"
          // We'll look for lines that start with "data: "
          const lines = chunkText.split('\n');
          lines.forEach(line => {
            if (line.startsWith('data: ')) {
              const data = line.substring(6); // Remove "data: "
              if data.trim() !== '' {
                setAnalysisText(prev => prev + data);
              }
            }
          });
          // Continue reading
          return processStream();
        });
      };

      await processStream();
    } catch (err) {
      setError(err.message);
      setIsAnalyzing(false);
      console.error('Error:', err);
    }
  };

  // Parse the analysis text into sections
  const parseAnalysis = (text) => {
    const sections = [];
    // We expect sections like:
    // 1. Image Type:\n   - (X-ray / MRI / CT Scan / etc.)
    // 2. Region Analyzed:\n   - (e.g., Chest, Brain, Spine, Abdomen)
    // ... etc.
    // We'll split by newline and then look for lines that start with a number and a dot.
    const lines = text.split('\n');
    let currentHeader = null;
    let currentContent = [];

    lines.forEach(line => {
      // Check if the line starts with a number and a dot (e.g., "1. ")
      if (/^\d+\.\s/.test(line)) {
        // If we were building a section, push it
        if (currentHeader) {
          sections.push({ header: currentHeader, content: currentContent.join('\n').trim() });
        }
        // Start a new section
        currentHeader = line.replace(/^\d+\.\s/, '').trim();
        currentContent = [];
      } else if (line.trim() !== '') {
        currentContent.push(line);
      }
    });

    // Push the last section
    if (currentHeader) {
      sections.push({ header: currentHeader, content: currentContent.join('\n').trim() });
    }

    return sections;
  };

  const sections = parseAnalysis(analysisText);

  return (
    <div className="bg-gray-900 rounded-lg p-6 space-y-4">
      <h2 className="text-lg font-semibold text-white">Analysis Results</h2>
      
      {error && (
        <div className="bg-red-900 border border-red-800 text-red-400 px-4 py-2 rounded mb-4">
          Error: {error}
        </div>
      )}

      {!hasAnalyzed && analysisText === '' ? (
        <p className="text-gray-400 text-center py-8">
          Upload a medical image and click Analyze to get started
        </p>
      ) : (
        <>
          {isAnalyzing && (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-2 border-medical-blue border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-2 text-medical-blue">Analyzing image...</span>
            </div>
          )}
          
          {!isAnalyzing && sections.length > 0 && (
            <div className="space-y-4">
              {sections.map((section, index) => (
                <ResultCard
                  key={index}
                  header={section.header}
                  content={section.content}
                />
              ))}
              
              {/* Disclaimer banner */}
              <div className="bg-red-900 border border-red-800 text-red-400 px-4 py-2 rounded mt-4">
                ⚠️ This is an AI-assisted analysis and not a medical diagnosis.
              </div>
            </>
          )}
          
          {/* If we have analyzed but no sections parsed (maybe the format is different) */}
          {!isAnalyzing && !hasAnalyzed && analysisText !== '' && sections.length === 0 && (
            <div className="whitespace-pre-wrap text-gray-300">
              {analysisText}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ResultPanel;