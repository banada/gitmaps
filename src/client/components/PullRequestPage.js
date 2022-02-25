import React from 'react';
import edgehandles from 'cytoscape-edgehandles';
import popper from 'cytoscape-popper';
import contextMenus from 'cytoscape-context-menus';
import 'cytoscape-context-menus/cytoscape-context-menus.css';
import compoundDragAndDrop from 'cytoscape-compound-drag-and-drop';
import { setupCytoscape } from './cytoscape';
import {
    graphDiffSeparate,
    graphDiffCombined
} from './libgitmap';

import Sidebar from './Sidebar';
import testgraph from './testgraph.json';
import left from './left.json'
import right from './right.json';
import styles from './cyto.css';

// Handle is shared by all nodes
const handleDiv = document.createElement('div');
handleDiv.id = 'handle';
handleDiv.className = 'p-2 border-2 border-blue-700 rounded';
handleDiv.hidden = true;
document.body.appendChild(handleDiv);

class PullRequestPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {}
    }

    componentDidMount = () => {
        this.setup();
    }

    setup = (graph) => {
        const cyto = setupCytoscape(graph);

        cyto.autoungrabify(true);

        // Double click node to open sidebar
        cyto.on('dblclick', 'node', (evt) => {
            const node = evt.target;
            this.setState({
                detailNode: node.id()
            });
        });

        this.setState({
            cytoscape: cyto
        });
    }

    createNode = (position) => {
        this.state.cytoscape.add({
            group: 'nodes',
            data: {
                name: 'New node'
            },
            position: {
                x: position.x,
                y: position.y
            }
        });
    }

    viewDiff = () => {
        const { leftGraph, rightGraph } = graphDiffSeparate(left, right);

        this.setState({
            leftGraph,
            rightGraph,
            currentGraph: 'left'
        }, () => {
            this.setup(leftGraph);
        });
    }

    toggleDiff = () => {
        if (this.state.currentGraph === 'left') {
            this.setState({
                currentGraph: 'right'
            });

            this.setup(this.state.rightGraph);
        } else {
            this.setState({
                currentGraph: 'left'
            });

            this.setup(this.state.leftGraph);
        }
    }

    closeSidebar = () => this.setState({detailNode: null});

    render() {
        return (
            <>
                <div className="absolute z-10">
                    <button
                        className="border border-blue-700 rounded px-2 py-1 cursor-pointer"
                        onClick={this.viewDiff}
                    >
                        View Diff
                    </button>
                    <button
                        className="border border-blue-700 rounded px-2 py-1 cursor-pointer"
                        onClick={this.toggleDiff}
                    >
                        Toggle Diff
                    </button>
                </div>
                <div id="cyto"></div>
                {(this.state.detailNode) &&
                    <Sidebar
                        node={this.state.cytoscape.$(`node[id = "${this.state.detailNode}"]`).data()}
                        onClose={this.closeSidebar}
                    />
                }
            </>
        );
    }
}

export default PullRequestPage;

