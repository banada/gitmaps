import axios from 'axios';
import Base64 from 'js-base64';
import { Octokit } from 'octokit';
import { createOAuthAppAuth } from '@octokit/auth-oauth-app';

import gitService from '@services/git/gitService';
import { isUn } from '../../../utils/utils';

const GITMAP_EXT = '.json';

const octokit = new Octokit({
    authStrategy: createOAuthAppAuth,
    auth: {
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET
    }
});

/**
 *  getAccessToken
 *
 *  Get and parse the access token from session cookies.
 *
 *  @param  {object} session Session object.
 *  @return {string}         GitHub API token or undefined.
 */
const getAccessToken = (session) => {
    let result;
    const ghapi = session.ghapi;
    if (ghapi) {
        const queryToken = ghapi.split('access_token=')[1];
        if (queryToken) {
            const token = queryToken.split('&')[0];
            result = token;
        }
    }

    return result;
}

const readFilesByPullRequest = async (req, res, next) => {

    //TODO validate

    const owner = req.params.owner;
    const repo = req.params.repo;
    const pull_number = req.params.pr;

    try {
        const access_token = getAccessToken(req.session);

        // Get a pull request
        const pullRequest = await gitService.getPullRequest({
            owner,
            repo,
            pull_number,
            access_token
        });

        const base = pullRequest.data.base;
        const head = pullRequest.data.head;

        // Get pull request file path
        const prFiles = await gitService.getPullRequestFiles({
            owner,
            repo,
            pull_number,
            access_token
        });

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
        const baseBlob = await gitService.readFileBlob({
            owner: base.user.login,
            repo,
            path: matchedFilePath,
            ref: base.ref,
            access_token
        });

        const headBlob = await gitService.readFileBlob({
            owner: head.user.login,
            repo,
            path: matchedFilePath,
            ref: head.ref,
            access_token
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

const readFileByBranch = async (req, res, next) => {
    try {
        const owner = req.params.owner;
        const repo = req.params.repo;
        const branch = req.params.branch;
        const path = req.params[0];

        const access_token = getAccessToken(req.session);
        if (!access_token) {
            return res.sendStatus(401);
        }

        const blob = await gitService.readFileBlob({
            owner,
            repo,
            path,
            ref: branch,
            access_token
        });
        if (!blob?.data?.content) {
            return res.sendStatus(404);
        }
        res.status(200);
        return res.json({
            data: Base64.decode(blob.data.content),
        });
    } catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
}

const filesController = {
    readFilesByPullRequest,
    readFileByBranch
}

export default filesController;

