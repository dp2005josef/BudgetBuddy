// Create a simple React component that redirects to the Angular application
import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';

function App() {
  useEffect(() => {
    window.location.href = '/src/';
  }, []);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontFamily: 'Roboto, Arial, sans-serif' 
    }}>
      <div style={{
        textAlign: 'center',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        backgroundColor: '#f9f9f9'
      }}>
        <h1>ETL Client Manager</h1>
        <p>Redirecting to Angular application...</p>
        <div style={{
          marginTop: '1rem',
          width: '50px',
          height: '50px',
          border: '5px solid #f3f3f3',
          borderTop: '5px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto'
        }}></div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <a href="/src/" style={{
          display: 'block',
          marginTop: '1rem',
          color: '#3498db',
          textDecoration: 'none'
        }}>Click here if not redirected automatically</a>
      </div>
    </div>
  );
}

const root = createRoot(document.getElementById('root') || document.body);
root.render(<App />);
