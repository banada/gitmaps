import React from 'react';
import edgehandles from 'cytoscape-edgehandles';
import popper from 'cytoscape-popper';
import contextMenus from 'cytoscape-context-menus';
import 'cytoscape-context-menus/cytoscape-context-menus.css';
import testgraph from './testgraph.json';
import styles from './cyto.css';

class Editor extends React.Component {
    constructor(props) {
        super(props);

        this.state = {}
    }

    componentDidMount = () => {
        // Handle is shared by all nodes
        const handleDiv = document.createElement('div');
        handleDiv.id = 'handle';
        handleDiv.className = 'p-2 border-2 border-blue-700 rounded';
        handleDiv.hidden = true;
        document.body.appendChild(handleDiv);

        const cyto = window.cy = cytoscape({
            container: document.getElementById('cyto'),
            layout: {
                name: 'preset',
                padding: 5
            },
            style: [
                {
                    selector: 'node',
                    css: {
                        'content': 'data(name)',
                        'text-valign': 'center',
                        'font-size': '10px',
                        'shape': 'round-rectangle',
                        'width': '100px',
                        'text-wrap': 'wrap',
                        'text-max-width': '100px'
                    }
                }
            ]
        });

        // Set up edge handler
        const edgeHandler = cyto.edgehandles({
            snap: false
        });

        // Set up context menu
        const ctxMenu = cyto.contextMenus({
            menuItems: [
                {
                    id: 'newnode',
                    content: 'Add node',
                    tooltipText: 'Create a new node',
                    selector: '',
                    coreAsWell: true,
                    onClickFunction: (evt) => {
                        this.createNode(evt.position);
                    }
                }
            ]
        });

        let selectedNodes = cyto.collection();
        this.setState({
            selectedNodes
        });

        // Select node
        const selectNode = (node) => {
            node.handle = node.popper({
                content: () => {
                    handleDiv.hidden = false;
                    return handleDiv;
                }
            });

            // Add to empty collection so that we
            // only select one node at a time
            this.setState({
                selectedNodes: cyto.collection().union(node)
            });
        }

        // Click node to select
        cyto.on('click', 'node', (evt) => {
            const node = evt.target;
            selectNode(node);
        });

        // Click background to deselect
        cyto.on('click', (evt) => {
            if (evt.target === cyto) {
                handleDiv.hidden = true;
            }
        });

        // Move node
        cyto.on('position', 'node', (evt) => {
            const node = evt.target;

            // Update handle position
            if (node.id() === this.state.selectedNodes.first().id()) {
                node.handle.update();
            }
        });

        // Update handle when grid moves
        cyto.on('pan zoom resize', () => {
            // Get selected node
            const node = this.state.selectedNodes.first();
            // Update handle position
            if (node.handle) {
                node.handle.update();
            }
        });

        // Start drawing edge
        handleDiv.addEventListener('mousedown', () => {
            const node = this.state.selectedNodes.first();
            edgeHandler.start(node);
        });

        // Stop drawing edge
        document.addEventListener('mouseup', () => {
            edgeHandler.stop();
        });

        this.setState({
            cytoscape: cyto,
            edgeHandler
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

    exportJSON = () => {
        console.log(this.state.cytoscape.json().elements);
    }

    importJSON = () => {
        alert('TODO');
    }

    render() {
        return (
            <>
                <h1>GitMaps</h1>
                <div className="absolute z-10">
                    <button
                        className="border border-blue-700 rounded px-2 py-1 cursor-pointer"
                        onClick={this.exportJSON}
                    >
                        Export JSON
                    </button>
                    <button
                        className="border border-blue-700 rounded px-2 py-1 cursor-pointer"
                        onClick={this.importJSON}
                    >
                        Import JSON
                    </button>
                </div>
                <div id="cyto"></div>
            </>
        );
    }
}

export default Editor;

