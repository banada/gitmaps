import express from 'express';
import userController from '../../../controllers/user/userController';

const user = express.Router();

/**
 *  Get a single user
 *
 */
user.get('/:id', async (req, res, next) => {
    return await userController.readUser(req, res, next);
});

user.post('/verification', async (req, res, next) => {
    return await userController.sendVerificationEmail(req, res, next);
});

export default user;

