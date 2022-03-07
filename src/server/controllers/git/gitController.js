import { Octokit } from 'octokit';

import gitService from '@services/git/gitService';
import { getAccessToken } from '@serverutils/utils';
import { isUn } from '../../../utils/utils';

const DEFAULT_BRANCH = 'main';
const DEFAULT_GITMAP_PATH  = 'gitmap.json';

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
});

/**
 * Creates a repository, initializes, and pushes the initial content for the authenticated user.
 */
const createRepo = async (req, res, next) => {
    try {
        // Auth
        const access_token = getAccessToken(req.session);
        if (!access_token) {
            return res.sendStatus(401);
        }

        // Create repo
        const repoRequest = {
            'name': req.body.repo,
            'private': req.body.visibility === 'private' ? true : false,
            'auto_init': true,
        };

        const repoResponse = await gitService.createRepo(repoRequest, access_token);
        if (!repoResponse) {
            return res.sendStatus(500);
        }

        // Push initial content to the default main branch 
        const content = req.body.content;
        const message = 'Saving initial map';
        const path = DEFAULT_GITMAP_PATH;
        const branch = repoResponse.branch;
        const repo = repoResponse.name;
        const owner = repoResponse.owner;

        const commit = await gitService.commitBranch({
            owner,
            repo,
            branch,
            path,
            message,
            content,
            access_token
        });

        if (!commit) {
            return res.sendStatus(500);
        }

        const filePath = `${owner}/${repo}/blob/${branch}/${path}`;
        res.status(200);
        return res.json({filePath});
    } catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
}

const getAuthenticatedUser = async (req, res, next) => {
    try {
        const access_token = getAccessToken(req.session);
        if (!access_token) {
            return res.sendStatus(401);
        }

        const user = await gitService.getAuthenticatedUser({
            access_token
        });
        if (!user?.data?.login) {
            return res.sendStatus(401);
        }

        res.status(200);
        return res.json({user: user.data.login});
    } catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
}

const getBranches = async (req, res, next) => {
    try {
        const owner = req.params.owner;
        const repo = req.params.repo;
        const access_token = getAccessToken(req.session);
        if (!access_token) {
            return res.sendStatus(401);
        }

        const branches = await gitService.getBranches({
            owner,
            repo,
            access_token
        });
        if (!branches?.data) {
            return res.sendStatus(404);
        }

        const result = branches.data.map((b) => {
            return b.name;
        });

        return res.json(result);
    } catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
}

const createBranch = async (req, res, next) => {
    try {
        // TODO validate
        const owner = req.params.owner;
        const repo = req.params.repo;
        const baseBranch = req.body.baseBranch;
        const newBranch = req.body.newBranch;

        const access_token = getAccessToken(req.session);
        if (!access_token) {
            return res.sendStatus(401);
        }

        const branchSHA = await gitService.createBranch({
            owner,
            repo,
            baseBranch,
            newBranch,
            access_token
        });

        if (!branchSHA) {
            return res.sendStatus(500);
        }

        res.status(200);
        return res.json({branchSHA});
    } catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
}

const commitAndPush = async (req, res, next) => {
    try {
        const owner = req.body.owner;
        const repo = req.body.repo;
        const branch = req.body.branch;
        const path = req.body.path;
        const message = req.body.message;
        const content = req.body.content;
        const access_token = getAccessToken(req.session);
        if (!access_token) {
            return res.sendStatus(401);
        }

        const commit = await gitService.commitBranch({
            owner,
            repo,
            branch,
            path,
            message,
            content,
            access_token
        });

        if (!commit) {
            return res.sendStatus(500);
        }

        return res.sendStatus(200);

    } catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
}

const forkRepo = async(req, res, next) => {
    try {
        const access_token = getAccessToken(req.session);
        if (!access_token) {
            return res.sendStatus(401);
        }

        const owner = req.params.owner;
        const repo = req.params.repo;

        const refUrl = await gitService.forkRepo({owner, repo, access_token});
        if (!refUrl) {
            return res.sendStatus(500);
        }

        res.status(200);
        return res.json({ref: refUrl});
    } catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
}

const checkContributor = async (req, res, next) => {
    try {
        const owner = req.params.owner;
        const repo = req.params.repo;
        const user = req.params.user;
        const access_token = getAccessToken(req.session);
        if (!access_token) {
            return res.sendStatus(401);
        }

        const isContributor = await gitService.checkContributor({owner, repo, user, access_token});

        res.status(200);
        return res.json({isContributor});

    } catch (err) {
        return res.sendStatus(500);
    }
}

const checkAccess = async (req, res, next) => {
    try {
        const owner = req.params.owner;
        const repo = req.params.repo;
        const access_token = getAccessToken(req.session);
        if (!access_token) {
            return res.sendStatus(401);
        }
        const hasAccess = await gitService.canAccessRepo({owner, repo, access_token});

        res.status(200);
        return res.json({hasAccess});
    } catch (err) {
        return res.sendStatus(500);
    }
}

const gitController = {
    createRepo,
    getAuthenticatedUser,
    getBranches,
    createBranch,
    commitAndPush,
    forkRepo,
    checkContributor,
    checkAccess
}

export default gitController;

