import React from 'react';
import { toast } from 'react-toastify';
import CloseIcon from '../icons/CloseIcon';

class RepoModal extends React.Component {
    constructor(props) {
        super(props);

        this.newRepo = React.createRef();
        this.visibility = React.createRef();

        this.state = {
            allowSubmit: false
        }
    }

    onSubmit = async (evt) => {
        const content = this.props.onGetContent();
        const repo = this.newRepo.current.value;
        const visibility = this.visibility.current.value;
        if (repo === '') {
            toast.error('Please choose a name for your repository.');
        } else if (!content) {
            toast.error('There was an error exporting the map.');
        } else {
            this.props.onSelect({repo, visibility, content});
        }
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
                    <p className="text-3xl mt-4">New Repo</p>
                    <p className="text-xl mt-4">Choose a name for your new repository:</p>
                    <div className="my-4">
                        <input
                            type="text"
                            className="bg-gray-200 rounded p-2"
                            autoFocus
                            ref={this.newRepo}
                        ></input>
                    </div>
                    <div className="my-4 flex justify-center">
                        <select
                            className="rounded p-2 bg-gray-200 w-1/2"
                            ref={this.visibility}
                        >
                            <option value="public">
                                Public
                            </option>
                            <option value="private">
                                Private
                            </option>
                        </select>
                    </div>
                    <div className="flex justify-center mb-4">
                        <div
                            className="mt-4 p-2 rounded cursor-pointer bg-blue-200 w-1/4"
                            onClick={this.onSubmit}
                        >
                            Create
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default RepoModal;

