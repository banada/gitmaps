import React from 'react';

class CloseIcon extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const width = this.props.size ? `w-${this.props.size}` : "w-4";
        const height = this.props.size ? `h-${this.props.size}` : "h-4";

        return (
            <svg className={`${width} ${height} fill-current`} viewBox="0 0 20 20"><path d="M10 8.586L2.929 1.515 1.515 2.929 8.586 10l-7.071 7.071 1.414 1.414L10 11.414l7.071 7.071 1.414-1.414L11.414 10l7.071-7.071-1.414-1.414L10 8.586z"/></svg>
        );
    }
}

export default CloseIcon;

