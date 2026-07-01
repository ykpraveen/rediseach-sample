import { Component } from 'react';
import { Button } from '@/components/ui/button';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex flex-col items-center justify-center py-32 text-center gap-4">
          <p className="text-6xl">💥</p>
          <h1 className="text-3xl font-bold">Something went wrong</h1>
          <p className="text-muted-foreground max-w-md">
            {this.state.error.message}
          </p>
          <Button onClick={() => { this.setState({ error: null }); window.location.href = '/'; }}>
            Back to Home
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
