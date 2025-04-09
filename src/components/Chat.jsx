import React, { useState, useEffect, useRef } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-jsx';
import 'prismjs/plugins/line-numbers/prism-line-numbers.css';
import 'prismjs/plugins/line-numbers/prism-line-numbers';
import 'bootstrap/dist/css/bootstrap.min.css';

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
  
  // Ref for the dropdown element
  const dropdownRef = useRef(null);
  
  // Effect to handle clicks outside the dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    
    // Add event listener when dropdown is open
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    // Clean up event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);
  
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
    // Clear error message when user selects a file type
    setErrorMessage('');

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
      const response = await fetch('http://localhost:8000/api/v1/migrator/convert', {
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

      // Strip markdown code block markers if they exist
      let cleanedCode = responseData.react_code;
      if (cleanedCode.startsWith('```javascript') || cleanedCode.startsWith('```jsx')) {
        cleanedCode = cleanedCode.substring(cleanedCode.indexOf('\n') + 1);
      }
      if (cleanedCode.endsWith('```')) {
        cleanedCode = cleanedCode.substring(0, cleanedCode.lastIndexOf('```'));
      }

      setReactCode(cleanedCode);
      setShowResult(true);
      
      // Scroll to result after a short delay to ensure DOM update
      setTimeout(() => {
        document.getElementById('resultContainer')?.scrollIntoView({ behavior: 'smooth' });
        // Re-initialize Prism to ensure line numbers are applied
        Prism.highlightAll();
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

  // Custom styles for dropdown
  const dropdownStyles = {
    dropdown: {
      position: 'relative'
    },
    menu: {
      position: 'absolute',
      top: '100%',
      left: 0,
      zIndex: 1000,
      display: dropdownOpen ? 'block' : 'none',
      minWidth: '100%',
      padding: '0.5rem 0',
      backgroundColor: '#fff',
      border: '1px solid rgba(0,0,0,.15)',
      borderRadius: '0.25rem',
      boxShadow: '0 0.5rem 1rem rgba(0,0,0,.175)'
    },
    item: {
      display: 'block',
      padding: '0.5rem 1rem',
      cursor: 'pointer',
      backgroundColor: 'transparent',
      border: 0
    },

    customCheckbox: {
      marginRight: '8px',
      border: '1px solid #ccc',
      borderRadius: '3px',
      width: '16px',
      height: '16px',
      appearance: 'none',
      position: 'relative'
    }
  };

  return (
    <div className="min-vh-100 bg-light py-4 py-md-5">
      <div className="container" style={{ maxWidth: '1080px' }}>
        <header className="text-center mb-5">
          <h1
            className="display-4 fw-bold text-center"
            style={{
              background: 'linear-gradient(to right, #212529, #495057)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Angular to React Converter
          </h1>
          <p className="mt-3 fs-5 text-secondary">Transform your AngularJS code into modern React functional components</p>
        </header>
        
        <div className="card shadow border">
          {errorMessage && (
            <div className="alert alert-danger d-flex mb-0 rounded-0.5 rounded-top">
              <div className="flex-shrink-0">
                <svg className="bi bi-exclamation-circle" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                  <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z" />
                </svg>
              </div>
              <div className="ms-3">
                <p className="mb-0">{errorMessage}</p>
              </div>
            </div>
          )}
          
          <div className="card-body p-4">
            <div className="position-relative mb-4">
              <div style={dropdownStyles.dropdown} ref={dropdownRef}>
                <label className="form-label fw-medium mb-2 text-dark">
                  Select file types to convert <span className="text-danger">*</span>
                </label>

                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="btn btn-outline-secondary d-flex justify-content-between align-items-center w-100"
                  type="button"
                  style={{ backgroundColor: '#fff' }}
                >
                  <div className="fw-medium text-secondary d-flex flex-wrap gap-1 align-items-center">
                    {isAtLeastOneSelected() ? (
                      Object.entries(fileTypes)
                        .filter(([_, isSelected]) => isSelected)
                        .map(([type]) => (
                          <span key={type} className="badge bg-light text-dark me-1 text-capitalize small d-flex align-items-center">
                            {type}
                            <button
                              className="btn-close btn-close-sm ms-1"
                              style={{ fontSize: '0.5rem', padding: '2px' }}
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent dropdown from toggling
                                handleFileTypeChange(type);
                              }}
                              aria-label={`Deselect ${type}`}
                            ></button>
                          </span>
                        ))
                    ) : (
                      <span>Select File Types... <span className="text-danger"></span></span>
                    )}
                  </div>
                  <svg
                    className={`bi ${dropdownOpen ? 'bi-chevron-up' : 'bi-chevron-down'}`}
                    width="16" height="16" fill="currentColor" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"
                  >
                    <path fillRule="evenodd" d={dropdownOpen ? "M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z" : "M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"} />
                  </svg>
                </button>

                <div style={dropdownStyles.menu}>
                  {Object.keys(fileTypes).map((type) => (
                    <div key={type}
                      className="px-3 py-2 hover-bg-light"
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleFileTypeChange(type)}
                    >
                      <label className="d-flex align-items-center m-0 w-100" style={{ cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={fileTypes[type]}
                          onChange={() => { }}
                          style={{
                            marginRight: '8px',
                            position: 'relative',
                            width: '16px',
                            height: '16px',
                            accentColor: '#000'
                          }}
                          className="form-check-input border-secondary"
                        />
                        <span className="text-capitalize">
                          {type}
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="angularCode" className="form-label" aria-required="true">
                Paste your AngularJS code
              </label>

              <textarea 
                id="angularCode" 
                className="form-control font-monospace"
                style={{ height: '256px', resize: 'none', borderColor: 'black', boxShadow: 'none' }}
                placeholder="Paste your AngularJS code here..."
                value={angularCode}
                onChange={(e) => setAngularCode(e.target.value)}
              />
            </div>
            
            <button 
              onClick={handleConvertCodeClick}
              disabled={isLoading}
              className="btn btn-dark w-100 py-3 d-flex align-items-center justify-content-center rounded"
            >
              {isLoading ? (
                <>
                  <div className="spinner-border spinner-border-sm me-2" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  Converting...
                </>
              ) : (
                  <>
                    <svg className="bi bi-arrow-repeat me-2" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z" />
                      <path fillRule="evenodd" d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z" />
                    </svg>
                    Convert to React
                  </>
              )}
            </button>
          </div>
        </div>
        
        {showResult && (
          <div id="resultContainer" className="card shadow border mt-4">
            <div className="border-bottom bg-gradient">
              <div className="card-header bg-light bg-gradient d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <svg className="bi bi-check-circle text-primary me-2" width="24" height="24" fill="currentColor" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                    <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z" />
                  </svg>
                  <h5 className="mb-0">React Component Generated</h5>
                </div>
                <div className="d-flex">
                  <button
                    onClick={handleCopyClick}
                    className={`btn ${copied ? 'btn-success' : 'btn-outline-secondary'} btn-sm me-2 d-flex align-items-center`}
                  >
                    {copied ? (
                      <>
                        <svg className="bi bi-check me-2" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                          <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z" />
                        </svg>
                        Copied!
                      </>
                    ) : (
                      <>
                        <svg className="bi bi-clipboard me-2" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                          <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z" />
                          <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z" />
                        </svg>
                        Copy Code
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleDownloadClick}
                    className="btn btn-outline-secondary btn-sm d-flex align-items-center"
                  >
                    <svg className="bi bi-download me-2" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                      <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z" />
                      <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z" />
                    </svg>
                    Download
                  </button>
                </div>
              </div>
            </div>
            <div className="position-relative">
              <div className="position-absolute top-0 start-0 end-0 bg-dark d-flex align-items-center px-3 py-2" style={{ height: '40px', zIndex: 10 }}>
                <div className="d-flex me-3">
                  <div className="rounded-circle bg-danger me-1" style={{ width: '12px', height: '12px' }}></div>
                  <div className="rounded-circle bg-warning me-1" style={{ width: '12px', height: '12px' }}></div>
                  <div className="rounded-circle bg-success" style={{ width: '12px', height: '12px' }}></div>
                </div>
                <div className="text-secondary small font-monospace">ReactComponent.jsx</div>
              </div>
              <div style={{ height: "400px", paddingTop: "40px" }}>
                {/* Add line-numbers class to pre element */}
                <pre className="language-jsx bg-dark text-light font-monospace p-3 h-100 overflow-auto">
                  <code className="language-jsx">{reactCode}</code>
                </pre>
              </div>
            </div>
            <div className="card-footer bg-light d-flex justify-content-between align-items-center">
              <small className="text-muted">Generated with Azure OpenAI</small>
              <div className="d-flex align-items-center">
                <small className="text-muted me-2">Ready to use in your project</small>
                <span className="bg-success rounded-circle" style={{ width: '8px', height: '8px' }}></span>
              </div>
            </div>
          </div>
        )}
        
        <footer className="text-center my-5">
          <small className="text-muted">&copy; 2025 Angular to React Converter | Built with Azure OpenAI</small>
        </footer>
      </div>
    </div>
  );
};

export default ChatComponent;