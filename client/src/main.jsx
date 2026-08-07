import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    this.setState({ info });
    console.error('RENDER HATASI:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', color: 'white', background: '#0a0a1a', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
          <h1 style={{ color: '#ef4444', marginBottom: '1rem' }}>⚠️ Render Hatası Yakalandı</h1>
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', padding: '1.5rem', borderRadius: '12px', marginBottom: '1rem' }}>
            <pre style={{ color: '#f59e0b', whiteSpace: 'pre-wrap', fontSize: '0.9rem', margin: 0 }}>
              {this.state.error?.toString()}
            </pre>
          </div>
          <div style={{ background: 'rgba(100,116,139,0.1)', border: '1px solid rgba(100,116,139,0.3)', padding: '1.5rem', borderRadius: '12px' }}>
            <h3 style={{ color: '#94a3b8', marginBottom: '0.5rem' }}>Component Stack:</h3>
            <pre style={{ color: '#64748b', whiteSpace: 'pre-wrap', fontSize: '0.8rem', margin: 0 }}>
              {this.state.info?.componentStack}
            </pre>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Import App directly
import App from './App.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
