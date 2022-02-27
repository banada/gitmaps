import express from 'express';
import gitController from '../../../controllers/git/gitController';

const git = express.Router();

/**
 * Routes a repo creation request 
 */
git.post('/repo', async (req, res, next) => {
    return await gitController.createRepo(req, res, next);
});

/**
 *
 */
git.get('/', async (req, res, next) => {
    return await gitController.gitCommit(req, res, next);
});

export default git;
