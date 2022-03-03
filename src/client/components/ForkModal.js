import React from 'react';

class ForkModal extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="w-full h-full fixed top-0 left-0 flex items-center text-center">
                <div
                    className="absolute w-full h-full bg-gray-900 opacity-50 cursor-pointer"
                    onClick={this.props.onClose}
                ></div>
                <div
                    className="bg-white w-1/3 rounded z-50 mx-auto"
                >
                    <p className="text-2xl my-4">Fork this repo?</p>
                </div>
            </div>
        );
    }
}

export default ForkModal;

