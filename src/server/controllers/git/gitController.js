import { Octokit } from 'octokit';
import { isUn } from '../../../utils/utils';
import test from './test.json';

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
});

const gitCommit = async (req, res, next) => {
    try {
        const result = await octokit.rest.users.getAuthenticated();
        console.log(`Hello ${result.data.login}`);
        const username = result.data.login;

        const master = await octokit.rest.git.getRef({
            owner: username,
            repo: 'graph-test',
            ref: 'heads/master'
        });
        console.log(master.data);

        // Branch off of master
        const newRefResult = await octokit.rest.git.createRef({
            owner: username,
            repo: 'graph-test',
            ref: 'refs/heads/newbranch6',
            sha: master.data.object.sha
        });

        const branch = await octokit.rest.git.getRef({
            owner: username,
            repo: 'graph-test',
            ref: 'heads/newbranch6'
        });

        console.log(branch);
        const commitSHA = branch.data.object.sha;
        const files = [
            {
                mode: '100644',
                path: 'gitmap.json',
                content: JSON.stringify(test)
            }
        ]

        const tree = await octokit.rest.git.createTree({
            owner: username,
            repo: 'graph-test',
            tree: files,
            base_tree: commitSHA
        });
        console.log(tree);
        const newCommit = await octokit.rest.git.createCommit({
            owner: username,
            repo: 'graph-test',
            author: {
                name: 'Nathaniel Chen',
                email: 'nathaniel@chengen.co'
            },
            tree: tree.data.sha,
            message: 'Added something!',
            parents: [commitSHA]
        });
        console.log(newCommit);

        const pushRes = await octokit.rest.git.updateRef({
            owner: username,
            repo: 'graph-test',
            ref: 'heads/newbranch6',
            sha: newCommit.data.sha
        });
        console.log(pushRes);

        res.sendStatus(200);

    } catch (err) {
        console.log(err);
        res.status(500);
        return res.send();
    }
}

const gitController = {
    gitCommit,
}

export default gitController;

