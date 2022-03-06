import { Octokit } from 'octokit';

import gitService from '@services/git/gitService';
import { getAccessToken } from '@serverutils/utils';
import { isUn } from '../../../utils/utils';
import test from './test.json';

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

        const fullName = await gitService.createRepo(repoRequest, access_token);
        if (!fullName) {
            return res.sendStatus(500);
        }

        // Push initial content to the default main branch 
        const content = req.body.content;
        const message = 'Saving initial map';
        const path = DEFAULT_GITMAP_PATH;
        const branch = DEFAULT_BRANCH;

        const splitFullName = fullName.split('/');
        const repo = splitFullName[1];
        const owner = splitFullName[0];

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
            repo: 'graph-test', // Parameterize this using the original repo
            ref: 'refs/heads/newbranch6', // Have user pass in a branch
            sha: master.data.object.sha
        });

        // Get branch info
        const branch = await octokit.rest.git.getRef({
            owner: username,
            repo: 'graph-test',
            ref: 'heads/newbranch6'
        });
        console.log(branch);
        const commitSHA = branch.data.object.sha;

        // Create the file to commit
        const files = [
            {
                mode: '100644',
                path: 'gitmap.json',
                content: JSON.stringify(test)
            }
        ]

        // Update the index
        const tree = await octokit.rest.git.createTree({
            owner: username,
            repo: 'graph-test',
            tree: files,
            base_tree: commitSHA
        });
        console.log(tree);

        // Commit the changes
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

        // Pushes the commit
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
    gitCommit,
    getAuthenticatedUser,
    getBranches,
    createBranch,
    commitAndPush,
    forkRepo,
    checkContributor,
    checkAccess
}

export default gitController;

