import React, { useState, useEffect } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-jsx';
import 'prismjs/plugins/line-numbers/prism-line-numbers.css';
import 'prismjs/plugins/line-numbers/prism-line-numbers';

const ChatComponent = () => {
  // State for form inputs
  const [angularCode, setAngularCode] = useState('');
  const [reactCode, setReactCode] = useState('');
  
  // State for file types
  const [fileTypes, setFileTypes] = useState({
    javascript: false,
    cshtml: false,
    html: false,
    css: false,
    scss: false
  });
  
  // State for UI
  const [isLoading, setIsLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  // Apply syntax highlighting when reactCode changes
  useEffect(() => {
    if (showResult && reactCode) {
      Prism.highlightAll();
    }
  }, [reactCode, showResult]);
  
  // Show error message
  const showError = (message) => {
    setErrorMessage(message);
  };

  // Handle file type change
  const handleFileTypeChange = (type) => {
    setFileTypes(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  // Check if at least one file type is selected
  const isAtLeastOneSelected = () => {
    return Object.values(fileTypes).some(value => value);
  };
  
  // Handle code conversion
  const convertCode = async (data) => {
    setIsLoading(true);
    setShowResult(false);
    
    try {
      const response = await fetch('http://localhost:5000/convert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          fileTypes: Object.keys(fileTypes).filter(key => fileTypes[key])
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to convert code');
      }
      
      const responseData = await response.json();
      setReactCode(responseData.react_code);
      setShowResult(true);
      
      // Scroll to result after a short delay to ensure DOM update
      setTimeout(() => {
        document.getElementById('resultContainer')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      showError(error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle convert code button click
  const handleConvertCodeClick = () => {
    if (!angularCode.trim()) {
      showError('Please enter some AngularJS code');
      return;
    }

    if (!isAtLeastOneSelected()) {
      showError('Please select at least one file type');
      return;
    }
    
    convertCode({
      type: 'single',
      angular_code: angularCode.trim()
    });
  };
  
  // Handle copy button click
  const handleCopyClick = async () => {
    try {
      await navigator.clipboard.writeText(reactCode);
      setCopied(true);
      
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      showError('Failed to copy: ' + err.message);
    }
  };
  
  // Handle download button click
  const handleDownloadClick = () => {
    const blob = new Blob([reactCode], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'react-component.jsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">Angular to React Converter</h1>
          <p className="mt-3 text-lg text-gray-500">Transform your AngularJS code into modern React functional components</p>
        </header>
        
        <div className="bg-white shadow-xl rounded-lg overflow-hidden border border-gray-200">
          {errorMessage && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{errorMessage}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="p-6">
            <div className="relative mb-4">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full flex justify-between items-center px-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              >
                <div className="font-medium text-gray-700 flex flex-wrap gap-1 items-center">
                  {isAtLeastOneSelected() ? (
                    Object.entries(fileTypes)
                      .filter(([_, isSelected]) => isSelected)
                      .map(([type]) => (
                        <span key={type} className="bg-gray-100 px-2 py-1 rounded-md capitalize text-xs">
                          {type}
                        </span>
                      ))
                  ) : (
                    <span>Select File Types <span className="text-red-500">*</span></span>
                  )}
                </div>
                <svg
                  className={`h-5 w-5 transform transition-transform ${dropdownOpen ? 'rotate-180' : ''} ml-2 flex-shrink-0`}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              {dropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg">
                  <div className="p-2">
                    {Object.keys(fileTypes).map((type) => (
                      <label key={type} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={fileTypes[type]}
                          onChange={() => handleFileTypeChange(type)}
                          className="h-4 w-4 text-black border-gray-300 rounded focus:ring-black"
                        />
                        <span className="ml-2 text-sm text-gray-700 capitalize">
                          {type}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="mb-4">
              <label htmlFor="angularCode" className="block text-sm font-medium text-gray-700 mb-2">
                Paste your AngularJS code here:
              </label>
              <textarea 
                id="angularCode" 
                className="w-full h-64 px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none font-mono text-sm"
                placeholder="Paste your AngularJS code here..."
                value={angularCode}
                onChange={(e) => setAngularCode(e.target.value)}
              />
            </div>
            
            <button 
              onClick={handleConvertCodeClick}
              disabled={isLoading}
              className="w-full bg-black text-white py-3 px-4 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black flex items-center justify-center transition-colors duration-200"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
              )}
              {isLoading ? 'Converting...' : 'Convert to React'}
            </button>
            
            
          </div>
        </div>
        
        {showResult && (
  <div id="resultContainer" className="mt-8 bg-white shadow-xl rounded-lg overflow-hidden border border-gray-200">
    <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <svg className="h-6 w-6 text-blue-500 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7.75 12.75L9.25 14.25L13.75 9.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h3 className="text-lg font-medium text-gray-900">React Component Generated</h3>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={handleCopyClick}
            className={`inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${copied ? 'bg-green-50 text-green-700 border-green-300' : 'bg-white text-gray-700 hover:bg-gray-50'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200`}
          >
            {copied ? (
              <>
                <svg className="h-5 w-5 mr-2 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                  <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                </svg>
                Copy Code
              </>
            )}
          </button>
          <button 
            onClick={handleDownloadClick}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 010 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Download
          </button>
        </div>
      </div>
    </div>
    <div className="relative">
      <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-gray-800 to-gray-900 flex items-center px-4 z-10">
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div className="ml-4 text-gray-400 text-xs font-mono">ReactComponent.jsx</div>
      </div>
      <div className="line-numbers" style={{ height: "400px", paddingTop: "40px" }}>
        <pre className="language-jsx bg-gray-900 text-gray-50 font-mono text-sm p-6 pt-6 h-full overflow-y-auto">
          <code className="language-jsx">{reactCode}</code>
        </pre>
      </div>
    </div>
    <div className="bg-gray-100 px-6 py-3 flex justify-between items-center border-t border-gray-200">
      <div className="text-xs text-gray-500">
        Generated with Azure OpenAI
      </div>
      <div className="text-xs flex items-center">
        <span className="text-gray-500 mr-3">Ready to use in your project</span>
        <span className="h-2 w-2 bg-green-500 rounded-full"></span>
      </div>
    </div>
  </div>
)}
        
        <footer className="mt-12 text-center text-sm text-gray-500">
          &copy; 2025 Angular to React Converter | Built with Azure OpenAI
        </footer>
      </div>
    </div>
  );
};

export default ChatComponent;