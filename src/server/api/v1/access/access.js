import express from 'express';
import accessController from '../../../controllers/access/accessController';

const access = express.Router();

/**
 *  Get all users that have access to the asset
 *
 */
access.get('/', async (req, res, next) => {
    return await accessController.readAccess(req, res, next);
});

/**
 *  Grant access to a user
 *
 */
access.post('/', async (req, res, next) => {
    return await accessController.grantAccess(req, res, next);
});

/**
 *  Remove a user's access
 *
 */
access.delete('/', async (req, res, next) => {
    return await accessController.revokeAccess(req, res, next);
});

export default access;

