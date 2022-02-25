import React from 'react';
import edgehandles from 'cytoscape-edgehandles';
import popper from 'cytoscape-popper';
import contextMenus from 'cytoscape-context-menus';
import 'cytoscape-context-menus/cytoscape-context-menus.css';
import compoundDragAndDrop from 'cytoscape-compound-drag-and-drop';
import isEqual from 'lodash.isequal';
import { setupCytoscape } from './cytoscape';

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

class Editor extends React.Component {
    constructor(props) {
        super(props);

        this.state = {}
    }

    componentDidMount = () => {
        this.setup();
    }

    setup = (graph) => {
        const cyto = setupCytoscape(graph);

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

        const dnd = cyto.compoundDragAndDrop({
            outThreshold: 50
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

        // Double click node to open sidebar
        cyto.on('dblclick', 'node', (evt) => {
            const node = evt.target;
            this.setState({
                detailNode: node.id()
            });
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

    editNode = (evt, property) => {
        const id = this.state.detailNode;
        const cytoscape = this.state.cytoscape;
        const selector = `node[id = "${id}"]`;
        const node = cytoscape.$(selector);
        node.data(property, evt.target.value);
        this.setState({
            cytoscape
        });
    }

    closeSidebar = () => this.setState({detailNode: null});

    exportJSON = () => {
        const elements = this.state.cytoscape.json().elements;
        // Filter out junk
        const nodes = elements.nodes.map((n) => {
            return {
                data: n.data,
                position: n.position,
                group: n.group,
                classes: n.classes
            }
        });
        const edges = elements.edges.map((e) => {
            return {
                data: e.data,
                position: e.position,
                group: e.group,
                classes: e.classes
            }
        });

        const json = JSON.stringify({nodes, edges});
        const data = "data:text/json;charset=utf-8," + encodeURIComponent(json);
        const downloadEl = document.getElementById('download');
        download.setAttribute('href', data);
        download.click();
    }

    handleUpload = (evt) => {
        const file = evt.target.files[0];
        if (!file || (file.type !== 'application/json')) {
            alert('Please upload a JSON file.');
        }

        this.setState({file});
    }

    importJSON = () => {
        const file = this.state.file;
        if (!file || (file.type !== 'application/json')) {
            alert('Failed to read the file.');
        }
        const reader = new FileReader();
        reader.onload = (evt) => {
            const data = evt.target.result;
            let graph;
            try {
                graph = JSON.parse(data);
                this.setup(graph);
            } catch (err) {
                console.log(err);
                alert('There was a problem parsing the file.');
            }
        }
        reader.readAsText(file);
    }

    /**
     *  Diff two graphs
     *  Separate nodes and edges into three groups:
     *      equal: exactly identical, no change
     *      left: old (changed)
     *      right: new (changed)
     */
    viewDiff = () => {
        const equalNodes = [];
        const equalEdges = [];
        let leftNodes = [];
        let leftEdges = [];
        let rightNodes = [];
        let rightEdges  = [];

        // Split left nodes into equal/left
        left.nodes.forEach((l) => {
            let matched = false;
            right.nodes.forEach((r) => {
                if (r.data.id === l.data.id) {
                    if (isEqual(r, l)) {
                        equalNodes.push(l);
                        matched = true;
                    }
                }
            });
            if (!matched) {
                leftNodes.push(l);
            }
        });

        // Split right nodes into equal/right
        right.nodes.forEach((r) => {
            let matched = false;
            equalNodes.forEach((m) => {
                // Match ID
                if (m.data.id === r.data.id) {
                    if (isEqual(m, r)) {
                        matched = true;
                    }
                }
            });
            if (!matched) {
                rightNodes.push(r);
            }
        });

        left.edges.forEach((l) => {
            let matched = false;
            right.edges.forEach((r) => {
                if (r.data.id === l.data.id) {
                    if (isEqual(r, l)) {
                        equalEdges.push(l);
                        matched = true;
                    }
                }
            });
            if (!matched) {
                leftEdges.push(l);
            }
        });

        right.edges.forEach((r) => {
            let matched = false;
            equalEdges.forEach((m) => {
                // Match ID
                if (m.data.id === r.data.id) {
                    if (isEqual(m, r)) {
                        matched = true;
                    }
                }
            });
            if (!matched) {
                rightEdges.push(r);
            }
        });

        // Color tag nodes
        leftNodes = leftNodes.map((l) => {
            if (l.classes.split(' ').indexOf('red') < 0) {
                l.classes += ' red';
            }
            return l;
        });
        rightNodes = rightNodes.map((r) => {
            if (r.classes.split(' ').indexOf('green') < 0) {
                r.classes += ' green';
            }
            return r;
        });
        // Color tag edges
        leftEdges = leftEdges.map((l) => {
            if (l.classes.split(' ').indexOf('red') < 0) {
                l.classes += ' red';
            }
            return l;
        });
        rightEdges = rightEdges.map((r) => {
            if (r.classes.split(' ').indexOf('green') < 0) {
                r.classes += ' green';
            }
            return r;
        });

        const leftGraph = {
            nodes: [
                ...equalNodes,
                ...leftNodes
            ],
            edges: [
                ...equalEdges,
                ...leftEdges
            ]
        }
        const rightGraph = {
            nodes: [
                ...equalNodes,
                ...rightNodes
            ],
            edges: [
                ...equalEdges,
                ...rightEdges
            ]
        }

        this.setState({
            leftGraph,
            rightGraph,
            currentGraph: 'left'
        }, () => {
            this.setup(leftGraph, this.state.cytoscape.zoom());
        });
    }

    toggleDiff = () => {
        if (this.state.currentGraph === 'left') {
            this.setState({
                currentGraph: 'right'
            });

            this.setup(this.state.rightGraph, this.state.cytoscape.zoom());
        } else {
            this.setState({
                currentGraph: 'left'
            });

            this.setup(this.state.leftGraph, this.state.cytoscape.zoom());
        }
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
                    <input
                        type="file"
                        accept="application/json"
                        onChange={this.handleUpload}
                    ></input>
                    <button
                        className="border border-blue-700 rounded px-2 py-1 cursor-pointer"
                        onClick={this.importJSON}
                    >
                        Import JSON
                    </button>
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
                        onEdit={this.editNode}
                        onClose={this.closeSidebar}
                    />
                }
            </>
        );
    }
}

export default Editor;

