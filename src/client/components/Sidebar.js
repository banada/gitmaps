import React from 'react';

class Sidebar extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        console.log(this.props.node);
        return (
            <div className="absolute z-10 h-full w-1/3 right-0 top-0 bg-blue-300 shadow-lg px-6">
                <div className="mt-4">
                    <span className="">Title:</span>
                    <div className="flex justify-center items-center mt-4">
                        <input
                            onChange={evt => this.props.onEdit(evt, 'name')}
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
                            onChange={evt => this.props.onEdit(evt, 'description')}
                            value={this.props.node?.description || ''}
                            className="rounded w-full"
                        ></textarea>
                    </div>
                </div>
            </div>
        );
    }
}

export default Sidebar;
