import React from 'react';

const SidebarMode = {
    View: 'view',
    Edit: 'edit'
}

class Sidebar extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            mode: this.props.initialMode || SidebarMode.View
        }
    }

    viewMode = () => {
        this.setState({ mode: SidebarMode.View });
    }

    editMode = () => {
        this.setState({ mode: SidebarMode.Edit });
    }

    renderText = (text) => {
        if (!text) {
            return;
        }
        const lines = text.split('\n').map((line, idx) => {
            return <p key={idx}>{line}</p>
        });

        return lines;
    }

    render() {
        const text = this.renderText(this.props.node?.description);

        return (
            <div id="sidebar" className="absolute z-10 h-full w-1/3 right-0 top-0 shadow-lg px-6">
                {(this.state.mode === SidebarMode.View) &&
                    <>
                        {(!this.props.noEditing) &&
                            <div className="mt-4">
                                <button
                                    onClick={this.editMode}
                                    className="rounded px-2 py-1 border border-blue-700"
                                >
                                    Edit
                                </button>
                            </div>
                        }
                        <div className="mt-4">
                            <div className="flex justify-center items-center mt-4 font-semibold text-2xl">
                                <div
                                    className="w-full"
                                >
                                    {this.props.node?.name || ''}
                                </div>
                            </div>
                        </div>
                        <div className="mt-4">
                            <div className="flex justify-center items-center mt-4">
                                <div
                                    className="w-full"
                                >
                                    {text}
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
                                Done
                            </button>
                        </div>
                        <div className="mt-4">
                            <span className="">Title:</span>
                            <div className="flex justify-center items-center mt-2">
                                <input
                                    onChange={evt => this.props.onEdit && this.props.onEdit(evt, 'name')}
                                    value={this.props.node?.name || ''}
                                    type="text"
                                    className="rounded w-full p-2"
                                    autoFocus
                                ></input>
                            </div>
                        </div>
                        <div className="mt-4">
                            <span className="">Notes:</span>
                            <div className="flex justify-center items-center mt-2">
                                <textarea
                                    onChange={evt => this.props.onEdit && this.props.onEdit(evt, 'description')}
                                    value={this.props.node?.description || ''}
                                    className="rounded w-full p-2"
                                ></textarea>
                            </div>
                        </div>
                    </>
                }
            </div>
        );
    }
}

export default Sidebar;
