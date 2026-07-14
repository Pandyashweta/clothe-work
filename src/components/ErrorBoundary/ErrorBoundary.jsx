import React, { Component } from 'react';
import { ServerCrash, RotateCw, HelpCircle } from 'lucide-react';
import './ErrorBoundary.css';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-overlay flex-center">
          <div className="error-boundary-card animate-fade">
            <ServerCrash size={48} className="server-icon" />
            <h2 className="server-title">SERVER UNAVAILABLE</h2>
            <p className="server-desc">
              We are currently experiencing database connection issues or technical difficulties. 
              Our team has been automatically notified and is working to resolve it. Please try reloading the page.
            </p>
            <div className="error-actions">
              <button className="error-btn report-btn" onClick={() => alert("ISSUE REPORTED SUCCESSFULLY. THANK YOU!")}>
                <HelpCircle size={14} /> REPORT ISSUE
              </button>
              <button className="error-btn reload-btn" onClick={this.handleReload}>
                <RotateCw size={14} /> RELOAD PAGE
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
