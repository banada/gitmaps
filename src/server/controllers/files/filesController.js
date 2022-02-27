import axios from 'axios';
import Base64 from 'js-base64';
import { Octokit } from 'octokit';
import { createOAuthAppAuth } from '@octokit/auth-oauth-app';
import { isUn } from '../../../utils/utils';

const GITMAP_EXT = '.json';

const octokit = new Octokit({
    authStrategy: createOAuthAppAuth,
    auth: {
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET
    }
});

const readFile = async (req, res, next) => {

    //TODO validate

    const owner = req.params.user;
    const repo = req.params.repo;
    const pull_number = req.params.pr;

    try {
        // Get a pull request
        const pullRequest = await octokit.rest.pulls.get({
            owner,
            repo,
            pull_number
        });

        const base = pullRequest.data.base;
        const head = pullRequest.data.head;

        // Get pull request file path
        const prFiles = await octokit.rest.pulls.listFiles({
            owner,
            repo,
            pull_number
        });

        //console.log(prFiles.data);
        let matchedFilePath;
        for (let i=0; i<prFiles.data.length; i++) {
            const file = prFiles.data[i];
            const parts = file.filename.split('/');
            if (parts[parts.length-1].includes(GITMAP_EXT)) {
                matchedFilePath = file.filename;
            }
            break;
        }

        // Get files from each branch
        const baseFile = await octokit.rest.repos.getContent({
            owner: base.user.login,
            repo,
            path: matchedFilePath,
            ref: base.ref
        });
        const headFile = await octokit.rest.repos.getContent({
            owner: head.user.login,
            repo,
            path: matchedFilePath,
            ref: head.ref
        });

        // Get gitmap blob
        const baseBlob = await octokit.rest.git.getBlob({
            owner: base.user.login,
            repo,
            file_sha: baseFile.data.sha
        });
        const headBlob = await octokit.rest.git.getBlob({
            owner: head.user.login,
            repo,
            file_sha: headFile.data.sha
        });

        res.status(200);
        return res.json({
            base: {
                data: Base64.decode(baseBlob.data.content),
                ref: base.label
            },
            head: {
                data: Base64.decode(headBlob.data.content),
                ref: head.label
            }
        });
    } catch (err) {
        console.log(err);
        res.status(500);
        return res.send();
    }
}

const filesController = {
    readFile,
}

export default filesController;

