import express from 'express';
import filesController from '../../../controllers/files/filesController';

const files = express.Router();

/**
 * Read a file, avoiding CORS
 *
 */
files.get('/*', async (req, res, next) => {
    return await filesController.readFile(req, res, next);
});

export default files;

