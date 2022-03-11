import React from 'react';

class InfoIcon extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const width = this.props.size ? `w-${this.props.size}` : "w-8";
        const height = this.props.size ? `h-${this.props.size}` : "h-8";

        return (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        );
    }
}

export default InfoIcon;

