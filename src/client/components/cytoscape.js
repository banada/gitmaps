export function setupCytoscape(graph) {
    const cyto = window.cy = cytoscape({
        container: document.getElementById('cyto'),
        layout: {
            name: 'preset',
            padding: 5
        },
        elements: graph,
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
            },
            {
                 selector: 'node.green',
                 css: {
                    'background-color': 'green'
                 }
            },
            {
                 selector: 'edge.green',
                 css: {
                    'line-color': 'green'
                 }
            },
            {
                 selector: 'node.red',
                 css: {
                    'background-color': 'red'
                 }
            },
            {
                 selector: 'edge.red',
                 css: {
                    'line-color': 'red'
                 }
            },
            {
                selector: 'edge',
                css: {
                    'curve-style': 'bezier',
                    'target-arrow-shape': 'triangle'
                }
            }
        ]
    });

    return cyto;
}
