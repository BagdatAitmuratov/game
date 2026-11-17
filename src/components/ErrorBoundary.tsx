import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error.message || 'Unexpected error occurred.',
    };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-dvh flex items-center justify-center bg-[#FAF8F5] p-6">
          <div className="max-w-md w-full bg-white rounded-3xl border border-[#E6DFD3] p-6 text-center shadow-sm">
            <h2 className="text-xl font-bold text-[#242938] mb-2">Oops!</h2>
            <p className="text-sm text-[#5C6478] mb-5 break-words">{this.state.message}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="min-h-[44px] px-6 py-2.5 rounded-2xl bg-[#4E89E8] text-white font-semibold hover:bg-[#3B76D6] transition-colors"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
