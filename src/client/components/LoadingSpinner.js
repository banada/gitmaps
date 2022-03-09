import React from 'react';
import styles from './loading-spinner.css';

class LoadingSpinner extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {

        return (
            <div className="w-full h-full fixed top-0 left-0 flex items-center text-center">
                <div
                    className="absolute w-full h-full bg-gray-900 opacity-50 cursor-pointer"
                ></div>
                <div
                    className="bg-white rounded z-50 mx-auto flex justify-center items-center"
                >
                    <div className="spinner">
                    </div>
                </div>
            </div>
        );
    }
}

export default LoadingSpinner;

