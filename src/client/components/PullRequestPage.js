import React from 'react';
import '@babel/polyfill';

import fetchData from '../fetchData';
import { setupCytoscape } from './cytoscape';
import {
    graphDiffSeparate,
    graphDiffCombined
} from './libgitmap';
import Sidebar from './Sidebar';
import styles from './cyto.css';

const GITHUB_API = 'https://api.github.com';
const GITMAP_EXT = '.json';

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

    componentDidMount = async () => {
        try {
            await this.fetchPullRequestFiles();
        } catch (err) {
            throw err;
        }
    }

    fetchPullRequestFiles = async () => {
        try {
            const user = this.props.match.params.user;
            const repo = this.props.match.params.repo;
            const pullNum = this.props.match.params.pullNum;

            const url = `files/${user}/${repo}/${pullNum}`;
            const res = await fetchData('GET', url);

            const base = JSON.parse(res.data.base.data);
            const head = JSON.parse(res.data.head.data);

            this.setState({
                branches: {
                    left: res.data.base.ref,
                    right: res.data.head.ref
                }
            });

            this.viewDiff(base, head);
        } catch (err) {
            console.log(err);
        }
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

        // Click background to deselect
        cyto.on('click', (evt) => {
            this.closeSidebar();
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

    viewDiff = (left, right) => {
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
                <div className="absolute z-10 flex justify-between w-full">
                    <div className="p-2 text-white font-bold text-2xl">
                        GitMaps.com
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="p-2">
                            <button
                                className="border border-blue-700 rounded px-2 py-1 cursor-pointer text-white"
                                onClick={evt => alert('TODO')}
                            >
                                Edit Graph
                            </button>
                        </div>
                        <div className="p-2">
                            <button
                                className="border border-blue-700 rounded px-2 py-1 cursor-pointer text-white"
                                onClick={this.toggleDiff}
                            >
                                Toggle Diff
                            </button>
                        </div>
                    </div>
                    <div className="w-16"></div>
                </div>
                <div className="absolute z-10 flex justify-between w-full bottom-0">
                    {(this.state.branches) &&
                        <div className="p-2 text-white text-2xl">
                            {this.state.branches[this.state.currentGraph]}
                        </div>
                    }
                </div>
                <div id="cyto"></div>
                {(this.state.detailNode) &&
                    <Sidebar
                        noEditing
                        node={this.state.cytoscape.$(`node[id = "${this.state.detailNode}"]`).data()}
                        onClose={this.closeSidebar}
                    />
                }
            </>
        );
    }
}

export default PullRequestPage;

