import React from 'react';
import { useNavigate } from 'react-router-dom';

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-white flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <h1 className="text-5xl font-extrabold text-black text-center mb-6">
          AngularJS to React Converter
        </h1>

        <div className="w-24 h-1 bg-black mb-8"></div>

        <p className="text-xl text-gray-700 text-center mb-12 max-w-2xl">
          Transform your AngularJS components into modern React code with our intelligent conversion tools.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl">
          <button
            onClick={() => navigate('/analysis')}
            className="px-8 py-6 bg-white text-black border-2 border-black rounded-lg font-medium text-lg hover:bg-gray-100 transition-all duration-300 flex flex-col items-center justify-center shadow-lg hover:-translate-y-1 h-48"
          >
            <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span className="text-xl mb-1">Project Import</span>
            <span className="text-sm text-gray-600 text-center">Upload ZIP or provide GitHub URL</span>
          </button>

          <button
            onClick={() => navigate('/chat')}
            className="px-8 py-6 bg-white text-black border-2 border-black rounded-lg font-medium text-lg hover:bg-gray-100 transition-all duration-300 flex flex-col items-center justify-center shadow-lg hover:-translate-y-1 h-48"
          >
            <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="text-xl mb-1">Quick Convert</span>
            <span className="text-sm text-gray-600 text-center">Paste code and convert instantly</span>
          </button>
        </div>


      </div>

      <footer className="py-4 text-center text-sm text-gray-500 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col items-center space-y-1">
            <div>&copy; 2025 Angular to React Converter</div>
            <div>Built with Azure OpenAI </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Welcome;