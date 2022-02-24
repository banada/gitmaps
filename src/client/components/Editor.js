import React from 'react';
import edgehandles from 'cytoscape-edgehandles';
import popper from 'cytoscape-popper';
import testgraph from './testgraph.json';
import styles from './cy.css';

//EDITOR

// TODO import popper
// TODO on select, display handle using popper
// TODO on handle drag, draw edge
//
// TODO export new JSON
// TODO create new node on right click
// TODO double-click node to edit text
// TODO click and drag to select, then display a button to group items
// TODO how should we show text entry? Double click to open sidebar?

class Editor extends React.Component {
    constructor(props) {
        super(props);

        this.state = {}
    }

    componentDidMount = () => {
        // Handle is shared by all nodes
        const div = document.createElement('div');
        div.id = 'handle';
        div.className = 'p-2 border-2 border-blue-700 rounded';
        div.hidden = true;
        document.body.appendChild(div);

        //cytoscape.use(edgehandles);
        const cy = window.cy = cytoscape({
            container: document.getElementById('cy'),
            elements: testgraph,
            layout: {
                name: 'preset',
                padding: 5
            },
            style: [
                {
                    selector: 'node',
                    css: {
                        'content': 'data(id)',
                        'text-valign': 'center'
                    }
                }
            ]
        });
        const eh = cy.edgehandles({
            snap: true
        });

        let selectedNodes = cy.collection();
        this.setState({
            selectedNodes
        });

        // Select node
        const selectNode = (node) => {
            node.handle = node.popper({
                content: () => {
                    div.hidden = false;
                    return div;
                }
            });

            // Add to empty collection so that we
            // only select one node at a time
            this.setState({
                selectedNodes: cy.collection().union(node)
            });
        }

        cy.on('click', 'node', (evt) => {
            const node = evt.target;
            selectNode(node);
        });

        // Move node
        cy.on('position', 'node', (evt) => {
            const node = evt.target;
            // Update handle position
            if (node.handle) {
                node.handle.update();
            }
        });

        // Update handle when grid moves
        cy.on('pan zoom resize', () => {
            // Get selected node
            const node = this.state.selectedNodes.first();
            // Update handle position
            if (node.handle) {
                node.handle.update();
            }
        })
    }

    render() {
        return (
            <>
                <h1>GitMaps</h1>
                <div id="cy"></div>
            </>
        );
    }
}

export default Editor;

