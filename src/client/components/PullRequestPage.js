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
            // Pull Request Data
            const prRoute = `/repos/${user}/${repo}/pulls/${pullNum}`;
            const prRes = await fetch(`${GITHUB_API}${prRoute}`, {
                method: 'GET',
                headers: {'Content-Type': 'application/json'}
            });
            const prData = await prRes.json();
            // Pull Request Files
            const fileRoute = `${prRoute}/files`;
            const fileRes = await fetch(`${GITHUB_API}${fileRoute}`, {
                method: 'GET',
                headers: {'Content-Type': 'application/json'}
            });
            const fileData = await fileRes.json();
            const files = [];
            let foundMatch = false;
            for (let i=0; i<fileData.length; i++) {
                const parts = fileData[i].filename.split('/');
                if (parts[parts.length-1].includes(GITMAP_EXT)) {
                    foundMatch = true;
                    // Base file
                    files.push(`https://raw.githubusercontent.com/${prData.base.user.login}/${repo}/${prData.base.sha}/${fileData[i].filename}`);
                    // Head file
                    files.push(`https://raw.githubusercontent.com/${prData.head.user.login}/${repo}/${prData.head.sha}/${fileData[i].filename}`);

                    await this.fetchFiles(files);
                    this.setState({
                        branches: {
                            left: prData.base.label,
                            right: prData.head.label
                        }
                    });

                    // Found the first graph
                    // TODO figure out how to handle
                    // PRs with multiple graphs
                    break;
                }
            }
            if (!foundMatch) {
                alert('This PR does not contain gitmap JSON files');
            }
        } catch (err) {
            console.log(err);
        }
    }

    /**
     *  Fetch raw github files through our server
     *  to avoid CORS
     */
    fetchFiles = async (files) => {
        const data = [];
        for (let i=0; i<files.length; i++) {
            const fileRes = await fetchData('GET', `files/${files[i]}`);
            data.push(fileRes.data);
        };

        this.viewDiff(data[0], data[1]);
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
                <div className="absolute z-10 flex justify-between w-full -mt-6">
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

