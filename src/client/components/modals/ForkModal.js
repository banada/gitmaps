import React from 'react';
import CloseIcon from '../icons/CloseIcon';

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
                    className="bg-white w-1/2 rounded z-50 mx-auto flex flex-col justify-center"
                >
                    {/* Close Icon */}
                    <div
                        className="flex justify-end items-center cursor-pointer m-2"
                        onClick={this.props.onClose}
                    >
                        <CloseIcon
                            size={6}
                        />
                    </div>
                    <p
                        className="text-xl p-4 pb-0"
                    >
                        You don't have write access to {this.props.owner}/{this.props.repo}.
                    </p>
                    <p
                        className="text-lg p-4"
                    >
                        Use your fork? If it doesn't exist, it will be created.
                    </p>
                    <div className="flex justify-center">
                        <div
                            className="mt-4 mb-8 p-2 rounded cursor-pointer bg-blue-200 w-1/2"
                            onClick={this.props.onFork}
                        >
                            OK
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default ForkModal;

