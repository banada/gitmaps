import express from 'express';
import gitController from '../../../controllers/git/gitController';

const git = express.Router();

/**
 *
 */
git.get('/', async (req, res, next) => {
    return await gitController.gitCommit(req, res, next);
});

export default git;

