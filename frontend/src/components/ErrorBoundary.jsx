import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          backgroundColor: '#0B192C',
          color: '#ffffff',
          fontFamily: 'sans-serif',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '540px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(251, 191, 36, 0.3)',
            borderRadius: '24px',
            padding: '32px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
          }}>
            <h2 style={{ color: '#FBBF24', fontSize: '22px', marginBottom: '12px' }}>
              Grace Victory Church Application Notice
            </h2>
            <p style={{ fontSize: '14px', color: '#CBD5E1', marginBottom: '20px' }}>
              The application encountered a temporary display issue.
            </p>
            {this.state.error && (
              <pre style={{
                background: 'rgba(0,0,0,0.4)',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#F87171',
                textAlign: 'left',
                overflowX: 'auto',
                marginBottom: '20px'
              }}>
                {this.state.error.toString()}
              </pre>
            )}
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              style={{
                backgroundColor: '#F59E0B',
                color: '#000000',
                border: 'none',
                padding: '12px 28px',
                borderRadius: '12px',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              Clear Cache & Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
