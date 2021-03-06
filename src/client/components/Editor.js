import '@babel/polyfill';
import React from 'react';
import edgehandles from 'cytoscape-edgehandles';
import popper from 'cytoscape-popper';
import contextMenus from 'cytoscape-context-menus';
import 'cytoscape-context-menus/cytoscape-context-menus.css';
import compoundDragAndDrop from 'cytoscape-compound-drag-and-drop';
import isEqual from 'lodash.isequal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { Paths } from '../routes';
import fetchData from '../fetchData';
import { setupCytoscape } from './cytoscape';
import InfoIcon from './icons/InfoIcon';
import LoadingSpinner from './LoadingSpinner';
import InstructionsModal from './modals/InstructionsModal';
import ForkModal from './modals/ForkModal';
import RepoModal from './modals/RepoModal';
import BranchModal from './modals/BranchModal';
import CommitModal from './modals/CommitModal';
import ContributeModal from './modals/ContributeModal';
import Sidebar from './Sidebar';
import styles from './cyto.css';

const URL_OWNER_IDX = 1;
const URL_BRANCH_IDX = 4;

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

    componentDidMount = async () => {
        const owner = this.props.match?.params?.owner;
        const repo = this.props.match?.params?.repo;
        const branch = this.props.match?.params?.branch;
        const path = this.props.match.params[0];

        this.setState({
            loading: true
        });

        // Authenticate and redirect
        const queryParams = this.props.location?.search;
        if (queryParams) {
            // TODO Hack, parse properly
            const code = queryParams.split('?code=')[1];
            return await this.getAccessToken(code);
        }

        await this.checkUser({owner, repo});

        // Get graph
        if (branch) {
            this.setState({
                owner,
                repo,
                branch,
                path
            }, async () => {
                await this.getGraphFromBranch();
                await this.getCryptoFromBranch();
            });
        // New project
        } else if (repo) {
            this.setState({
                owner,
                repo,
                branch,
                path
            }, async () => {
                // Get branches
                const branches = await this.getBranches();
                this.setState({
                    branchModal: true,
                    modalOpen: true,
                    branches
                });
            });
        // New repo
        } else {
            this.setup();
        }

        this.setState({loading: false});
    }

    checkUser = async ({owner, repo}) => {
        // Check if logged in
        const url = `git/user`
        const {status, data} = await fetchData('GET', url);
        if ((status === 200) && (data)) {
            // New project
            if (this.props.match.path === Paths.New) {
                return this.setState({
                    user: data.user,
                    instructionsModal: true,
                    modalOpen: true,
                    newProject: true
                }, () => {
                    return this.setup();
                })
            }

            const accessUrl = `git/repos/${owner}/${repo}`;
            const accessRes = await fetchData('GET', accessUrl);
            if (accessRes.status === 200) {
                this.setState({
                    user: data.user,
                    hasAccess: accessRes.data.hasAccess
                });
            } else {
                toast.error('Problem checking contributors.');
            }
        } else {
            // New project
            if (this.props.match.path === Paths.New) {
                return this.setState({
                    newProject: true
                });
            }
        }
    }

    getGraphFromBranch = async () => {
        try {
            const branch = this.state.branch || this.state.selectedBranch;
            let url = `files/${this.state.owner}/${this.state.repo}/${branch}`;
            if (this.state.path) {
                url += `/${this.state.path}`;
                console.log(url);
            } else {
                url += '/gitmap.json';
            }
            const {status, data} = await fetchData('GET', url);
            if (status !== 200) {
                if (!this.state.user) {
                    this.setState({
                        error: 'Please log in to view this graph.'
                    });
                } else if (status === 404) {
                    // Try to create file
                    const success = await this.commitAndPush('Created GitMap', 'gitmap.json');
                    if (!success) {
                        this.setState({
                            noAccess: true,
                            error: "You don't have access to this repository."
                        });
                    } else {
                        this.setState({
                            instructionsModal: true,
                            modalOpen: true
                        });
                    }
                } else {
                    this.setState({
                        error: 'There was an error.'
                    });
                }

                return;
            }

            const graph = JSON.parse(data.data);

            this.setup(graph);
        } catch (err) {
            console.log(err);
        }
    }

    getCryptoFromBranch = async () => {
        try {
            const url = `files/${this.state.owner}/${this.state.repo}/${this.state.branch}/${this.state.path}`;
            let splitUrl = url.split('/');
            // Remove file from url
            splitUrl.pop();
            splitUrl.push('btc.txt');
            const btcUrl = splitUrl.join('/');
            const {status, data} = await fetchData('GET', btcUrl);
            if (status === 200) {
                this.setState({
                    crypto: {
                        // TODO allow other currencies
                        type: 'btc',
                        address: data.data.trim(),
                        // TODO unhardcode
                        amount: 0.0005
                    }
                });
            }
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
                selectedType: 'node',
                selectedNodeOriginalParent: node.parent(),
            });
        }

        const releaseChildrenFromParent = (node) => {
            // Children of node to be deleted are moved to the parent, if one exists. This allows for deletion of
            // parent node without losing children.
            node.children().move({parent: node.parent().id() ?? null});
        }

        const deleteGraphEntity = (type, id) => {
            const selector = `${type}[id = "${id}"]`;
            this.state.cytoscape.remove(selector);
        }

        const shouldParentBeRemoved = (node, originalParent) => {
            // Setup the data necessary for the check
            const freedNodeNewParentId = node.parent()?.id();
            const opId = originalParent.id();
            const opName = originalParent.data().name;
            const opDescription = originalParent.data().description;
            const opDegrees = originalParent.totalDegree();
            const opChildren = originalParent.children().length;

            const noMultipleNodeDependecies = opChildren < 2;
            const hasNoEdges = !opDegrees;
            const hasNoData = !opName && !opDescription;
            const nodeMovedToDifferentParent = opId != freedNodeNewParentId;

            // Leaving for future debugging purposes
            // console.log(`Old parent: ${opId}, new parent: ${freedNodeNewParentId}, name: ${opName}, desc: ${opDescription}, deg: ${opDegrees}, children: ${opChildren}`);

            return nodeMovedToDifferentParent
                && hasNoData
                && hasNoEdges
                && noMultipleNodeDependecies;
        }

        // Click node to select
        cyto.on('click', 'node', (evt) => {
            const node = evt.target;
            selectNode(node);
            this.closeSidebar();
        });

        // When an element is grabbed directly
        cyto.on('grabon', 'node', (evt) => {
            const node = evt.target;
            const originalParent = node.parent();
            this.setState({
                grabbedNodeOriginalParent: originalParent.first(),
            });
        });

        // When an element is freed directly
        cyto.on('freeon', 'node', (evt) => {
            const originalParent = this.state.grabbedNodeOriginalParent;
            if (originalParent.empty()) {
                return;
            }

            const opId = originalParent.id();

            // Remove prior compound parent if necessary
            const node = evt.target;
            if (shouldParentBeRemoved(node, originalParent)) {
                releaseChildrenFromParent(originalParent);
                deleteGraphEntity('node', opId)
            }

            // Set the state back to null
            this.setState({
                grabbedNodeOriginalParent: null,
            });
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
                selectedType: 'edge',
                selectedNodeOriginalParent: null,
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
            if ((evt.key === 'Delete') && (!this.state.modalOpen) && (!this.state.detailNode)) {
                const node = this.state.selected.first();
                releaseChildrenFromParent(node);

                const id = node.data().id;
                deleteGraphEntity(this.state.selectedType, id);
                handleDiv.hidden = true;
            }

            if ((evt.key === 'Escape') && (this.state.detailNode)) {
                this.setState({
                    detailNode: null
                });
            }
        });

        this.setState({
            cytoscape: cyto,
            edgeHandler,
            graphLoaded: true
        });
    }

    loginWithGithub = () => {
        const scopes = 'user%20repo';
        window.location = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${window.location}&scope=${scopes}`
    }

    getAccessToken = async (code) => {
        const res = await fetchData('GET', `auth/signin-github?code=${code}`);
        if (res.status === 200) {
            window.location = this.props.match.url;
        }
    }

    createNode = (position) => {
        const newNode = this.state.cytoscape.add({
            group: 'nodes',
            data: {},
            position: {
                x: position.x,
                y: position.y
            }
        });

        // Open for editing
        this.setState({
            detailNode: newNode.id(),
            // DANGEROUS - setting Sidebar initial state
            // from props
            sidebarMode: 'edit'
        }, () => {
            this.setState({
                sidebarMode: null
            });
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

    onExportJSON = () => {
        this.downloadJSON(this.exportJSON());
    }

    exportJSON = () => {
        const elements = this.state.cytoscape?.json().elements;
        // Filter out junk
        const nodes = elements?.nodes?.map((n) => {
            return {
                data: n.data,
                position: n.position,
                group: n.group,
                classes: n.classes
            }
        });
        const edges = elements?.edges?.map((e) => {
            return {
                data: e.data,
                position: e.position,
                group: e.group,
                classes: e.classes
            }
        });

        const json = JSON.stringify({
            nodes: nodes,
            edges: edges
        });

        return json;
    };

    downloadJSON = (json) => {
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

    startSaveFlow = async () => {
        const repo = this.state.repo;
        if (repo) {
            // Check if owner
            if (!this.state.hasAccess) {
                // Ask to fork
                return this.setState({
                    forkModal: true,
                    modalOpen: true
                });
            }
            // Get branches
            const branches = await this.getBranches();
            this.setState({
                saveFlow: true,
                branchModal: true,
                modalOpen: true,
                branches
            });

        } else {
            this.setState({
                saveFlow: true,
                repoModal: true,
                modalOpen: true
            });
        }
    }

    getBranches = async () => {
        const url = `git/repos/${this.state.owner}/${this.state.repo}/branches`;
        const {status, data} = await fetchData('GET', url);
        if ((status === 200) && (data)) {
            return data;
        }
    }

    selectBranch = (branch) => {
        this.setState({
            selectedBranch: branch,
            branch,
            branchModal: false,
            modalOpen: false,
            // Default path for initializing new
            path: this.state.path || 'gitmap.json'
        }, async () => {
            if (this.state.saveFlow) {
                this.setState({
                    commitModal: true
                });
            // Load branch
            } else {
                // Redirect to branch page
                window.location = `/${this.state.owner}/${this.state.repo}/${branch}`;
            }
        });
    }

    newBranchAndCommit = async ({baseBranch, newBranch}) => {
        try {
            this.setState({loading: true});
            const url = `git/repos/${this.state.owner}/${this.state.repo}/branches`;
            const {status, data} = await fetchData('POST', url, { baseBranch, newBranch });
            if (status === 200) {
                toast.success(`Created branch ${newBranch}`);
                this.selectBranch(newBranch);
            } else {
                toast.error('There was a problem creating the branch.');
            }
            this.setState({loading: false});
        } catch (err) {
            console.log(err);
        }
    }

    commitAndPush = async (message) => {
        this.setState({
            loading: true
        });
        const url = `git/save`;
        const {status, data} = await fetchData('POST', url, {
            owner: this.state.owner,
            repo: this.state.repo,
            branch: this.state.selectedBranch,
            path: this.state.path,
            content: this.exportJSON(),
            message
        });
        if (status === 200) {
            if (this.state.saveFlow) {
                toast.success('Saved!');
            }
            this.closeModals();
            // Redirect to the repo we just forked
            if (this.state.owner !== this.props.match?.params?.owner) {
                const splitUrl = this.props.match.url.split('/');
                splitUrl[URL_OWNER_IDX] = this.state.owner;
                splitUrl[URL_BRANCH_IDX] = this.state.selectedBranch;
                window.location = splitUrl.join('/');
            }
            this.setState({
                saveFlow: false,
                loading: false
            });
            return true;
        }
        return false;
    }

    forkRepo = async () => {
        try {
            const url = `git/repos/${this.state.owner}/${this.state.repo}/forks`;
            const {status, data} = await fetchData('POST', url, {});
            if (status === 200) {
                this.setState({
                    forkModal: false,
                    modalOpen: false,
                    owner: this.state.user,
                    hasAccess: true
                }, async () => {
                    await this.startSaveFlow();
                });
            }
        } catch (err) {
            throw err;
        }
    }

    createRepo = async (repo) => {
        this.setState({
            loading: true
        });

        const content = this.exportJSON();
        if (!content) {
            toast.error('Unable to export map.');
            return;
        } else {
            repo.content = content;
        }

        const url = 'git/user/repos';
        const {status, data} = await fetchData('POST', url, repo);

        if (status === 200) {
            const path = data.filePath;
            window.location = path;
        } else {
            toast.error('Unable to save map.');
        }
        this.setState({
            loading: false
        });
    }

    openBranchModal = async () => {
        this.setState({loading: true})
        const branches = await this.getBranches();
        this.setState({
            branchModal: true,
            modalOpen: true,
            branches,
            loading: false
        });
    }

    openContributeModal = () => {
        this.setState({
            contributeModal: true,
            modalOpen: true
        });
    }

    openInstructionsModal = () => {
        this.setState({
            instructionsModal: true,
            modalOpen: true
        });
    }

    closeModals = () => {
        this.setState({
            forkModal: false,
            repoModal: false,
            branchModal: false,
            commitModal: false,
            instructionsModal: false,
            contributeModal: false,
            modalOpen: false
        });
    }

    render() {

        return (
            <>
                <div className="absolute z-10 flex justify-between items-center w-full bg-blue-700">
                    <div className="p-2 text-white font-bold text-2xl w-1/4">
                        GitMaps.com
                    </div>
                    <div className="flex justify-center items-center w-1/2">
                        {(this.state.graphLoaded) &&
                            <>
                                {(this.state.user && !this.state.noAccess) &&
                                    <div className="p-2">
                                        <button
                                            className="border border-blue-700 rounded px-2 py-1 cursor-pointer text-white"
                                            style={{ borderColor: '#85d1ff' }}
                                            onClick={this.startSaveFlow}
                                        >
                                            Save
                                        </button>
                                    </div>
                                }
                                {(!this.state.user) &&
                                    <div className="p-2">
                                        <button
                                            className="border border-blue-700 rounded px-2 py-1 cursor-pointer text-white"
                                            style={{ borderColor: '#85d1ff' }}
                                            onClick={this.loginWithGithub}
                                        >
                                            Log in with GitHub
                                        </button>
                                    </div>
                                }
                                {(!this.state.error) &&
                                    <>
                                        <div className="p-2">
                                            <button
                                                className="border border-blue-700 rounded px-2 py-1 cursor-pointer text-white"
                                                style={{ borderColor: '#85d1ff' }}
                                                onClick={this.onExportJSON}
                                            >
                                                Export JSON
                                            </button>
                                        </div>
                                        {((!this.state.newProject) && (this.state.crypto)) &&
                                            <div className="p-2">
                                                <button
                                                    className="border border-blue-700 rounded px-2 py-1 cursor-pointer text-white"
                                                    style={{ borderColor: '#85d1ff' }}
                                                    onClick={this.openContributeModal}
                                                >
                                                    Contribute BTC
                                                </button>
                                            </div>
                                        }
                                    </>
                                }
                            </>
                        }
                    </div>
                    <div className="w-1/4 flex justify-center items-center select-none">
                        <div
                            className="cursor-pointer p-2"
                            onClick={this.openInstructionsModal}
                        >
                            <InfoIcon />
                        </div>
                        {(this.state.repo) &&
                            <div
                                className="p-2 text-white cursor-pointer"
                                onClick={this.openBranchModal}
                            >
                                {this.state.owner}/{this.state.repo}/{this.state.branch}
                            </div>
                        }
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
                        initialMode={this.state.sidebarMode}
                        onEdit={this.editNode}
                        onClose={this.closeSidebar}
                    />
                }
                {(this.state.forkModal) &&
                    <ForkModal
                        onClose={this.closeModals}
                        onFork={this.forkRepo}
                        owner={this.state.owner}
                        repo={this.state.repo}
                    />
                }
                {(this.state.repoModal) &&
                    <RepoModal
                        onSelect={this.createRepo}
                        onClose={this.closeModals}
                    />
                }
                {(this.state.branchModal) &&
                    <BranchModal
                        branches={this.state.branches}
                        onSelect={this.selectBranch}
                        onClose={this.closeModals}
                        onNewBranch={this.newBranchAndCommit}
                    />
                }
                {(this.state.commitModal) &&
                    <CommitModal
                        onCommit={this.commitAndPush}
                        onClose={this.closeModals}
                    />
                }
                <ToastContainer
                    position="bottom-center"
                    autoClose={2000}
                    hideProgressBar
                    newestOntop
                />
                {(this.state.error) &&
                    <div className="flex flex-col justify-center items-center z-10 absolute w-full h-full">
                        <span
                            className="text-2xl text-blue-300 font-semibold"
                        >
                            {this.state.error}
                        </span>
                        {(!this.state.user) &&
                            <div className="p-2 mt-2">
                                <button
                                    className="border border-blue-700 rounded px-2 py-1 cursor-pointer text-white"
                                    style={{ borderColor: '#85d1ff' }}
                                    onClick={this.loginWithGithub}
                                >
                                    Log in with GitHub
                                </button>
                            </div>
                        }
                    </div>
                }
                {((this.state.newProject) && (!this.state.user)) &&
                    <div className="flex flex-col justify-center items-center z-10 absolute w-full h-full">
                        <span
                            className="text-2xl text-blue-300 font-semibold"
                        >
                            Welcome to GitMaps!
                        </span>
                        <div className="p-2 mt-2">
                            <button
                                className="border border-blue-700 rounded px-2 py-1 cursor-pointer text-white"
                                style={{ borderColor: '#85d1ff' }}
                                onClick={this.loginWithGithub}
                            >
                                Log in with GitHub
                            </button>
                        </div>
                    </div>
                }
                {(this.state.instructionsModal) &&
                    <InstructionsModal
                        onClose={this.closeModals}
                    />
                }
                {(this.state.contributeModal) &&
                    <ContributeModal
                        onClose={this.closeModals}
                        type={this.state.crypto?.type}
                        address={this.state.crypto?.address}
                        amount={this.state.crypto?.amount}
                        owner={this.state.owner}
                        repo={this.state.repo}
                    />
                }
                <div className="absolute z-10 flex justify-between w-full bottom-0">
                </div>
                {(this.state.loading) &&
                    <LoadingSpinner />
                }
            </>
        );
    }
}

export default Editor;

