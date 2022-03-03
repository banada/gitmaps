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
                    <p className="text-2xl my-4">Choose a branch:</p>
                    <div className="">
                        <select onChange={this.onChangeBranch}>
                            <option></option>
                            {branches}
                        </select>
                    </div>
                    {(this.state.allowSubmit) &&
                        <div className="flex justify-center">
                            <div
                                className="mt-4 p-2 rounded cursor-pointer bg-blue-200 w-1/2"
                                onClick={e => this.props.onSelect(this.state.branch)}
                            >
                                Select
                            </div>
                        </div>
                    }
                </div>
            </div>
        );
    }
}

export default BranchModal;

