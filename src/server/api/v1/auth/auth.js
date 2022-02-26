import express from 'express';
import authController from '../../../controllers/auth/authController';

const axios = require('axios');
const auth = express.Router();

const clientID = process.env.GITHUB_CLIENT_ID;
const clientSecret = process.env.GITHUB_CLIENT_SECRET;

auth.get('/signin-github', (req, res, next) => {
    try {
        return authController.githubSignin(req, res, next);
    } catch (err) {
        throw err;
    }
});

auth.post('/register', async (req, res, next) => {
    try {
        return await authController.register(req, res, next);
    } catch (err) {
        throw err;
    }
});

auth.post('/login', async (req, res, next) => {
    try {
        return await authController.login(req, res, next);
    } catch (err) {
        throw err;
    }
});

auth.post('/verification/:verificationHash', async (req, res, next) => {
    try {
        return await authController.verify(req, res, next);
    } catch (err) {
        throw err;
    }
})

auth.post('/requestreset', async (req, res, next) => {
    try {
        return await authController.requestReset(req, res, next);
    } catch (err) {
        throw err;
    }
});

auth.post('/reset', async (req, res, next) => {
    try {
        return await authController.resetPassword(req, res, next);
    } catch (err) {
        throw err;
    }
});

export default auth;

