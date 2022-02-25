import isEqual from 'lodash.isequal';

/*
 *  Diff two graphs
 *  Separate nodes and edges into three groups:
 *      equal: exactly identical, no change
 *      left: old (changed)
 *      right: new (changed)
 */
function splitGraphDiff(left, right) {
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

    return {
        equalNodes,
        equalEdges,
        leftNodes,
        leftEdges,
        rightNodes,
        rightEdges
    }
}

export function graphDiffSeparate(left, right) {
    const diff = splitGraphDiff(left, right);

    const leftGraph = {
        nodes: [
            ...diff.equalNodes,
            ...diff.leftNodes
        ],
        edges: [
            ...diff.equalEdges,
            ...diff.leftEdges
        ]
    }
    const rightGraph = {
        nodes: [
            ...diff.equalNodes,
            ...diff.rightNodes
        ],
        edges: [
            ...diff.equalEdges,
            ...diff.rightEdges
        ]
    }

    return {
        leftGraph,
        rightGraph
    }
}

export function graphDiffCombined(left, right) {
    const diff = splitGraphDiff(left, right);

    const graph = {
        nodes: [
            ...diff.equalNodes,
            ...diff.leftNodes,
            ...diff.rightNodes
        ],
        edges: [
            ...diff.equalEdges,
            ...diff.leftEdges,
            ...diff.rightEdges
        ]
    }

    return graph;
}
