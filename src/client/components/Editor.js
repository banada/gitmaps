import '@babel/polyfill';
import React from 'react';
import edgehandles from 'cytoscape-edgehandles';
import popper from 'cytoscape-popper';
import contextMenus from 'cytoscape-context-menus';
import 'cytoscape-context-menus/cytoscape-context-menus.css';
import compoundDragAndDrop from 'cytoscape-compound-drag-and-drop';
import isEqual from 'lodash.isequal';

import fetchData from '../fetchData';
import { setupCytoscape } from './cytoscape';

import Sidebar from './Sidebar';
import styles from './cyto.css';

// Handle is shared by all nodes
const handleDiv = document.createElement('div');
handleDiv.id = 'handle';
handleDiv.className = 'p-2 border rounded';
handleDiv.hidden = true;
document.body.appendChild(handleDiv);

class Editor extends React.Component {
    constructor(props) {
        super(props);

        this.state = {}
    }

    componentDidMount = () => {
        const owner = this.props.match?.params?.owner;
        const repo = this.props.match?.params?.repo;
        const branch = this.props.match?.params?.branch;
        const path = this.props.match.params[0];
        if (branch) {
            this.setState({
                owner,
                repo,
                branch,
                path
            }, () => {
                this.getGraphFromBranch();
            });
        // New
        } else {
            this.setup();
        }

        const queryParams = this.props.location?.search;
        if (queryParams) {
            // TODO Hack, parse properly
            const code = queryParams.split('?code=')[1];
            this.getAccessToken(code);
        }
    }

    getGraphFromBranch = async () => {
        try {
            const url = `files/${this.state.owner}/${this.state.repo}/${this.state.branch}/${this.state.path}`;
            const {status, data} = await fetchData('GET', url);
            if (status !== 200) {
                alert('Failed to load graph.');
            }
            const graph = JSON.parse(data.data);

            this.setup(graph);
        } catch (err) {
            console.log(err);
        }
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

        let selected = cyto.collection();
        this.setState({
            selected
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
                selected: cyto.collection().union(node),
                selectedType: 'node'
            });
        }

        // Click node to select
        cyto.on('click', 'node', (evt) => {
            const node = evt.target;
            selectNode(node);
            this.closeSidebar();
        });

        // Click edge to select
        cyto.on('click', 'edge', (evt) => {
            const edge = evt.target;
            this.closeSidebar();
            handleDiv.hidden = true;
            // Add to empty collection so that we
            // only select one edge at a time
            this.setState({
                selected: cyto.collection().union(edge),
                selectedType: 'edge'
            });
        });

        // Click background to deselect
        cyto.on('click', (evt) => {
            if (evt.target === cyto) {
                handleDiv.hidden = true;
                this.closeSidebar();
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
            if (node.id() === this.state.selected.first().id()) {
                node.handle.update();
            }
        });

        // Update handle when grid moves
        cyto.on('pan zoom resize', () => {
            // Get selected node
            const node = this.state.selected.first();
            // Update handle position
            if (node.handle) {
                node.handle.update();
            }
        });

        // Start drawing edge
        handleDiv.addEventListener('mousedown', () => {
            const node = this.state.selected.first();
            edgeHandler.start(node);
        });

        // Stop drawing edge
        document.addEventListener('mouseup', () => {
            edgeHandler.stop();
        });

        document.addEventListener('keydown', (evt) => {
            // Delete a node
            if (evt.key === 'Delete') {
                const node = this.state.selected.first();
                const id = node.data().id;
                const selector = `${this.state.selectedType}[id = "${id}"]`;
                this.state.cytoscape.remove(selector);
                handleDiv.hidden = true;
            }
        });

        this.setState({
            cytoscape: cyto,
            edgeHandler
        });
    }

    loginWithGithub = () => {
        window.location = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${window.location}`
    }

    getAccessToken = async (code) => {
        // TODO
        const res = await fetchData('GET', `auth/signin-github?code=${code}`);
        console.log(res);
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

    

    render() {
        return (
            <>
                <div className="absolute z-10 flex justify-between w-full">
                    <div className="p-2 text-white font-bold text-2xl">
                        GitMaps.com
                    </div>
                    <div>
                        {(this.state.name) &&
                            <h3>Hello {this.state.name} </h3>
                        }
                    </div>
                    <div className="p-2">
                        <button
                            className="border border-blue-700 rounded px-2 py-1 cursor-pointer text-white"
                            style={{ borderColor: '#85d1ff' }}
                            onClick={this.exportJSON}
                        >
                            Export JSON
                        </button>
                    </div>
                    <div className="p-2">
                        <button
                            className="border border-blue-700 rounded px-2 py-1 cursor-pointer text-white"
                            style={{ borderColor: '#85d1ff' }}
                            onClick={this.loginWithGithub}
                        >
                            Log in with GitHub
                        </button>
                    </div>
                    {/*
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
                    */}
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

