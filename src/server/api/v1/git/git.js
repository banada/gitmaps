import express from 'express';
import gitController from '../../../controllers/git/gitController';

const git = express.Router();

/**
 * Routes a repo creation request 
 */
git.post('/repo', async (req, res, next) => {
    return await gitController.createRepo(req, res, next);
});

git.get('/', async (req, res, next) => {
    return await gitController.gitCommit(req, res, next);
});

git.get('/user', async (req, res, next) => {
    return await gitController.getAuthenticatedUser(req, res, next);
});

git.post('/user/repos', async (req, res, next) => {
    return await gitController.createRepo(req, res, next);
});

git.get('/repos/:owner/:repo/branches', async (req, res, next) => {
    return await gitController.getBranches(req, res, next);
});

git.post('/repos/:owner/:repo/branches', async (req, res, next) => {
    return await gitController.createBranch(req, res, next);
});

git.post('/save', async (req, res, next) => {
    return await gitController.commitAndPush(req, res, next);
});

git.post('/repos/:owner/:repo/forks', async (req, res, next) => {
    return await gitController.forkRepo(req, res, next);
});

git.get('/repos/:owner/:repo/contributors/:user', async (req, res, next) => {
    return await gitController.checkContributor(req, res, next);
});

git.get('/repos/:owner/:repo', async (req, res, next) => {
    return await gitController.checkAccess(req, res, next);
});

export default git;

