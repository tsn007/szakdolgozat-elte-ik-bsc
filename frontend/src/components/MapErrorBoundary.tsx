import React, { type ReactNode } from "react";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
}

export class MapErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(): State {
        return { hasError: true };
    }

    componentDidCatch() {
        console.warn("Caught Leaflet crash, preventing React Router from taking over.");
    }

    render() {
        if (this.state.hasError) {
            return null;
        }

        return this.props.children;
    }
}
