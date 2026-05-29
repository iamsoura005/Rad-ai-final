import React from 'react';

const getSeverityColor = (severity) => {
  const lowerSeverity = severity.toLowerCase();
  if (lowerSeverity.includes('mild')) return 'border-green-500';
  if (lowerSeverity.includes('moderate')) return 'border-yellow-500';
  if (lowerSeverity.includes('severe')) return 'border-orange-500';
  if (lowerSeverity.includes('critical')) return 'border-red-500';
  return 'border-gray-500';
};

const getConfidenceBarColor = (percentage) => {
  const num = parseInt(percentage);
  if (isNaN(num)) return 'bg-gray-500';
  if (num >= 80) return 'bg-green-500';
  if (num >= 60) return 'bg-yellow-500';
  return 'bg-red-500';
};

const ResultCard = ({ header, content }) => {
  // Extract severity from content if this is the severity section
  const isSeveritySection = header.toLowerCase().includes('severity');
  const severityColor = isSeveritySection ? getSeverityColor(content) : '';

  // Extract confidence percentage if this is the confidence section
  const isConfidenceSection = header.toLowerCase().includes('confidence');
  let confidencePercentage = '';
  let confidenceBarColor = 'bg-gray-500';
  
  if (isConfidenceSection) {
    const match = content.match(/(\d+)%/);
    if (match) {
      confidencePercentage = match[1];
      confidenceBarColor = getConfidenceBarColor(confidencePercentage);
    }
  }

  // Determine icon based on header
  const getIcon = () => {
    if (header.includes('Image Type')) return '<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m2 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>';
    if (header.includes('Region Analyzed')) return '<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-2.21 0-4 1.79-4 4v2h4V12h4v2c0 2.21-1.79 4-4 4zm0-10c-1.1 0-2 .9-2 2v2h4V10c0-1.1-.9-2-2-2zm0 14c-2.21 0-4-1.79-4-4v-2H4v2c0 2.21 1.79 4 4 4h4v-2c0-1.1.9-2 2-2z"/></svg>';
    if (header.includes('Key Observations')) return '<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7 20h10a2 2 0 002-2V6a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>';
    if (header.includes('Possible Condition')) return '<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m2 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>';
    if (header.includes('Clinical Explanation')) return '<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m2 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>';
    if (header.includes('Recommendation')) return '<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7 20h10a2 2 0 002-2V6a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>';
    return '<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7 20h10a2 2 0 002-2V6a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>';
  };

  // Since we can't directly embed SVG strings in JSX like this, we'll use a different approach
  // For simplicity, we'll use a placeholder icon and note that in a real app we'd use proper SVG components or icons
  const IconPlaceholder = () => (
    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
      ?
    </div>
  );

  return (
    <div className="border-l-4 pl-4 mb-6 last:mb-0 fade-in">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">
          <IconPlaceholder />
        </div>
        <div>
          <h3 className="font-medium text-white mb-1">{header}</h3>
          <p className="text-gray-300 whitespace-pre-wrap">{content}</p>
          {isConfidenceSection && confidencePercentage && (
            <div className="mt-2">
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div className={`${confidenceBarColor} h-2.5 rounded-full`} style={{ width: `${confidencePercentage}%` }}></div>
              </div>
              <p className="text-xs text-gray-400 mt-1">{confidencePercentage}% Confidence</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultCard;