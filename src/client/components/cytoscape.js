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
                    'font-size': '14px',
                    'shape': 'cut-rectangle',
                    'width': '120px',
                    'height': '60px',
                    'text-wrap': 'wrap',
                    'text-max-width': '100px',
                    'background-color': '#112a38',
                    'border-width': '1px',
                    'color': '#cfedff',
                    'line-color': '#85d1ff',
                    'border-color': '#85d1ff'
                }
            },
            {
                selector: 'edge',
                css: {
                    'line-color': '#85d1ff',
                    'curve-style': 'bezier',
                    'target-arrow-shape': 'triangle',
                    'target-arrow-color': '#85d1ff'
                }
            },
            {
                selector: 'node:selected',
                css: {
                    'background-color': '#85d1ff',
                    'color': 'black'
                }
            },
            {
                selector: 'edge:selected',
                css: {
                    'width': '6px'
                }
            },
            {
                 selector: 'node.green',
                 css: {
                    'background-color': '#66ff6c',
                    'color': 'black'
                 }
            },
            {
                 selector: 'edge.green',
                 css: {
                    'line-color': '#66ff6c',
                    'target-arrow-color': '#66ff6c'
                 }
            },
            {
                 selector: 'node.red',
                 css: {
                    'background-color': '#ff8066',
                    'color': 'black'
                 }
            },
            {
                 selector: 'edge.red',
                 css: {
                    'line-color': '#ff8066',
                    'target-arrow-color': '#ff8066'
                 }
            },
            {
                selector: 'node.outline-green',
                css: {
                    'border-color': '#66ff6c'
                }
            },
            {
                selector: 'node.outline-yellow',
                css: {
                    'border-color': '#ffff47'
                }
            },
            {
                selector: 'node.outline-purple',
                css: {
                    'border-color': '#ce5df0'
                }
            },
            {
                selector: 'node.outline-blue',
                css: {
                    'border-color': '#85d1ff',
                }
            }
        ]
    });

    return cyto;
}
