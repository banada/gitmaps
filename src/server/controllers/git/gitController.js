import { Octokit, App } from 'octokit';
import { Base64 } from 'js-base64';
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

        const refResult = await octokit.rest.git.getRef({
            owner: username,
            repo: 'graph-test',
            ref: 'heads/test-pr'
        });

/*
        // Get SHA
        const shaResult = await octokit.rest.repos.listCommits({
            owner: username,
            repo: 'graph-test'
        });
        */
        console.log(refResult);
        const commitSHA = refResult.data.object.sha;
        const files = [
            {
                mode: '100644',
                path: 'gitmap.json',
                content: Base64.encode(JSON.stringify(test))
            }
        ]

        const result2 = await octokit.rest.git.createTree({
            owner: username,
            repo: 'graph-test',
            tree: files,
            base_tree: commitSHA
        });
        console.log(result2);
        const result3 = await octokit.rest.git.createCommit({
            owner: username,
            repo: 'graph-test',
            author: {
                name: 'Nathaniel Chen',
                email: 'nathaniel@chengen.co'
            },
            tree: result2.data.sha,
            message: 'Added something!',
            parents: [commitSHA]
        });
        console.log(result3);

        const pushRes = await octokit.rest.git.updateRef({
            owner: username,
            repo: 'graph-test',
            ref: 'heads/test-pr',
            sha: result3.data.sha
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

