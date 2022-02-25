import React from 'react';

const SidebarMode = {
    View: 'view',
    Edit: 'edit'
}

class Sidebar extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            mode: SidebarMode.View
        }
    }

    viewMode = () => {
        this.setState({ mode: SidebarMode.View });
    }

    editMode = () => {
        this.setState({ mode: SidebarMode.Edit });
    }

    render() {
        return (
            <div className="absolute z-10 h-full w-1/3 right-0 top-0 bg-blue-300 shadow-lg px-6">
                {(this.state.mode === SidebarMode.View) &&
                    <>
                        <div className="mt-4">
                            <button
                                onClick={this.editMode}
                                className="rounded px-2 py-1 border border-blue-700"
                            >
                                Edit
                            </button>
                        </div>
                        <div className="mt-4">
                            <span className="">Title:</span>
                            <div className="flex justify-center items-center mt-4">
                                <div
                                    className="w-full"
                                >
                                    {this.props.node?.name || ''}
                                </div>
                            </div>
                        </div>
                        <div className="mt-4">
                            <span className="">Description:</span>
                            <div className="flex justify-center items-center mt-4">
                                <div
                                    className="w-full"
                                >
                                    {this.props.node?.description || ''}
                                </div>
                            </div>
                        </div>
                    </>
                }
                {(this.state.mode === SidebarMode.Edit) &&
                    <>
                        <div className="mt-4">
                            <button
                                onClick={this.viewMode}
                                className="rounded px-2 py-1 border border-blue-700"
                            >
                                View Mode
                            </button>
                        </div>
                        <div className="mt-4">
                            <span className="">Title:</span>
                            <div className="flex justify-center items-center mt-4">
                                <input
                                    onChange={evt => this.props.onEdit && this.props.onEdit(evt, 'name')}
                                    value={this.props.node?.name || ''}
                                    type="text"
                                    className="rounded w-full"
                                ></input>
                            </div>
                        </div>
                        <div className="mt-4">
                            <span className="">Description:</span>
                            <div className="flex justify-center items-center mt-4">
                                <textarea
                                    onChange={evt => this.props.onEdit && this.props.onEdit(evt, 'description')}
                                    value={this.props.node?.description || ''}
                                    className="rounded w-full"
                                ></textarea>
                            </div>
                        </div>
                    </>
                }
                <div className="mt-4">
                    <button
                        onClick={this.props.onClose}
                        className="rounded px-2 py-1 border border-blue-700"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }
}

export default Sidebar;
