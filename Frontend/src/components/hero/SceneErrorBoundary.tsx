import { Component, type ErrorInfo, type ReactNode } from "react";
import { RoboticSceneFallback } from "./RoboticSceneFallback";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error Boundary for 3D WebGL scenes
 * Catches Three.js/React Three Fiber rendering errors and shows fallback UI
 */
export class SceneErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("3D Scene Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <RoboticSceneFallback className="h-[340px] w-full rounded-3xl" />
        )
      );
    }

    return this.props.children;
  }
}
