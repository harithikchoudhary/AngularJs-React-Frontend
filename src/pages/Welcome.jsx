import React from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-vh-100 d-flex flex-column bg-light bg-gradient">
      <div className="flex-grow-1 d-flex flex-column align-items-center justify-content-center px-3 py-5">
        <h1 className="display-4 fw-bolder text-black text-center mb-3">
          AngularJS to React Converter
        </h1>

        <div className="bg-black mx-auto" style={{ width: '6rem', height: '2px', marginBottom: '2rem' }}></div>

        <p className="fs-4 text-secondary text-center mb-5 mx-auto" style={{ maxWidth: '36rem' }}>
          Transform your AngularJS components into modern React code with our intelligent conversion tools.
        </p>

        <div className="container">
          <div className="row row-cols-1 row-cols-md-2 g-4" style={{ maxWidth: '48rem', margin: '0 auto' }}>
            <div className="col">
              <button
                onClick={() => navigate('/analysis')}
                className="p-4 bg-white text-black border border-2 border-dark rounded-3 fw-medium fs-5 h-100 d-flex flex-column align-items-center justify-content-center shadow transition"
                style={{ height: '12rem', transition: 'all 0.3s ease-in-out' }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <svg className="mb-3" width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="fs-4 mb-1">Project Import</span>
                <span className="small text-secondary text-center">Upload ZIP or provide GitHub URL</span>
              </button>
            </div>

            <div className="col">
              <button
                onClick={() => navigate('/chat')}
                className="p-4 bg-white text-black border border-2 border-dark rounded-3 fw-medium fs-5 h-100 d-flex flex-column align-items-center justify-content-center shadow transition"
                style={{ height: '12rem', transition: 'all 0.3s ease-in-out' }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <svg className="mb-3" width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span className="fs-4 mb-1">Quick Convert</span>
                <span className="small text-secondary text-center">Paste code and convert instantly</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <footer className="py-3 text-center small text-secondary border-top border-light">
        <div className="container">
          <div className="d-flex flex-column align-items-center">
            <div>&copy; 2025 Angular to React Converter</div>
            <div>Built with Azure OpenAI </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Welcome;