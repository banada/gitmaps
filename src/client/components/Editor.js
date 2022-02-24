import React from 'react';
import edgehandles from 'cytoscape-edgehandles';
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
        //TODO CY select listener
        console.log(cytoscape);
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
        console.log(cy);
        const eh = cy.edgehandles({
            snap: true
        });
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

