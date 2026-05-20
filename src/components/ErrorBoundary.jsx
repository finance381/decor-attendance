import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('App error:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24, textAlign: 'center' }}>
          <h2>⚠️ कुछ गलत हो गया / Something went wrong</h2>
          <p style={{ color: '#666', marginTop: 8 }}>{this.state.error?.message}</p>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: 16, padding: '10px 24px', borderRadius: 8, border: 'none', background: '#667eea', color: '#fff', fontSize: 16 }}
          >
            🔄 Reload / रीलोड करें
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}