import express from 'express';
import filesController from '../../../controllers/files/filesController';

const files = express.Router();

/**
 * Read a file, avoiding CORS
 *
 */
files.get('/:owner/:repo/:pr', async (req, res, next) => {
    return await filesController.readFilesByPullRequest(req, res, next);
});

files.get('/:owner/:repo/:branch/*', async (req, res, next) => {
    return await filesController.readFileByBranch(req, res, next);
});

export default files;

