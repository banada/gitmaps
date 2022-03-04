import React from 'react';

class BranchModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            allowSubmit: false
        }
    }

    onChangeBranch = (evt) => {
        const branch = evt.target.value;
        if (branch !== '') {
            this.setState({
                branch: evt.target.value,
                allowSubmit: true
            });
        }
    }

    onSubmit = (evt) => {
        if (this.state.branch === 'New Branch') {
            // TODO Create a new branch, then continue
            // TODO Set state to new branch
        }

        this.props.onSelect(this.state.branch);
    }

    render() {
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
                    className="bg-white w-1/3 rounded z-50 mx-auto flex flex-col justify-center"
                >
                    <p className="text-2xl mt-4">Choose a branch to save to:</p>
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
                </div>
            </div>
        );
    }
}

export default BranchModal;

