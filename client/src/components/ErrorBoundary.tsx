import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage?: string;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMessage: error.message
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, errorMessage: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-4">
              Oops! Something went wrong
            </h1>
            
            <p className="text-gray-300 mb-6 leading-relaxed">
              We encountered an unexpected error. Don't worry, this has been logged and our team will look into it.
            </p>
            
            {this.state.errorMessage && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
                <p className="text-red-300 text-sm font-mono">
                  {this.state.errorMessage}
                </p>
              </div>
            )}
            
            <div className="space-y-4">
              <button
                onClick={this.handleRetry}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
              >
                <RefreshCw className="h-5 w-5" />
                <span>Try Again</span>
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-white/10 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:bg-white/20 border border-white/20"
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;