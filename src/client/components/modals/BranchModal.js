import React from 'react';
import { toast } from 'react-toastify';
import CloseIcon from '../icons/CloseIcon';

class BranchModal extends React.Component {
    constructor(props) {
        super(props);

        this.newBranch = React.createRef();

        this.state = {
            allowSubmit: false
        }
    }

    onChangeBranch = (evt) => {
        const branch = evt.target.value;
        let allowSubmit = false;

        if (branch !== '') {
            allowSubmit = true;
        }

        this.setState({
            branch,
            allowSubmit
        });
    }

    onSubmit = async (evt) => {
        if (!this.state.branch) {
            toast.error('Please select a branch.');
            return;
        }

        if (this.state.newBranch) {
            return this.props.onNewBranch({
                baseBranch: this.state.branch,
                newBranch: this.newBranch.current.value
            });
        }

        if (this.state.branch === 'New Branch') {
            // TODO branch select
            return this.setState({
                newBranch: true
            });
        }

        this.props.onSelect(this.state.branch);
    }

    render() {
        if (!this.props.branches) {
            return (
                <></>
            );
        }

        const branches = this.props.branches.map((b, idx) => {
            return (
                <option key={idx}>
                    {b}
                </option>
            );
        });

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
                    {(!this.state.newBranch) &&
                        <>
                            <p className="text-2xl mt-4">Choose a branch:</p>
                            <div className="my-4">
                                <select
                                    className="p-2 rounded cursor-pointer"
                                    onChange={this.onChangeBranch}
                                >
                                    <option></option>
                                    {branches}
                                    <option>New Branch</option>
                                </select>
                            </div>
                            <div className="flex justify-center mb-4">
                                <div
                                    className="mt-4 p-2 rounded cursor-pointer bg-blue-200 w-1/4"
                                    onClick={this.onSubmit}
                                >
                                    Select
                                </div>
                            </div>
                        </>
                    }
                    {(this.state.newBranch) &&
                        <>
                            <p className="text-2xl mt-4">Choose a base branch:</p>
                            <div className="my-4">
                                <select
                                    className="p-2 rounded cursor-pointer"
                                    onChange={this.onChangeBranch}
                                >
                                    <option></option>
                                    {branches}
                                </select>
                            </div>
                            <p className="text-2xl mt-4">Choose a name for your new branch:</p>
                            <div className="my-4">
                                <input
                                    type="text"
                                    className="bg-gray-200 rounded p-2"
                                    ref={this.newBranch}
                                ></input>
                            </div>
                            <div className="flex justify-center mb-4">
                                <div
                                    className="mt-4 p-2 rounded cursor-pointer bg-blue-200 w-1/4"
                                    onClick={this.onSubmit}
                                >
                                    Select
                                </div>
                            </div>
                        </>
                    }
                </div>
            </div>
        );
    }
}

export default BranchModal;

