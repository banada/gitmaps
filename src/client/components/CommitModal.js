import React from 'react';

class CommitModal extends React.Component {
    constructor(props) {
        super(props);

        this.message = React.createRef();
    }

    render() {

        return (
            <div className="w-full h-full fixed top-0 left-0 flex items-center text-center">
                <div
                    className="absolute w-full h-full bg-gray-900 opacity-50 cursor-pointer"
                    onClick={this.props.onClose}
                ></div>
                <div
                    className="bg-white w-1/3 rounded z-50 mx-auto flex flex-col justify-center"
                >
                    <p className="text-2xl my-4">Write a commit message:</p>
                    <div className="">
                        <textarea
                            rows="5"
                            className="bg-gray-200"
                            selected
                            ref={this.message}
                        ></textarea>
                    </div>
                    <div className="flex justify-center">
                        <div
                            className="mt-4 p-2 rounded cursor-pointer bg-blue-200 w-1/2"
                            onClick={e => this.props.onCommit(this.message.current.value)}
                        >
                            Commit and Push
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default CommitModal;

