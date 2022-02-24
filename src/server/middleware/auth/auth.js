import jwt from 'express-jwt';

import { isUn } from '../../../utils/utils';

// API JWT Checks

// TODO Get JWT from headers
const getToken = (req) => {
    const authHeader = req.headers.authorization.split(' ');
    if (authHeader[0] === 'Bearer') {
        return authHeader[1];
    }
}

export const checkHeaders = (req, res, next) => {
    if (req.originalUrl === '/login') {
        return next();
    }
    if (!req || !req.headers || isUn(req.headers.authorization)) {
        return next();
    } else {
        const authHeader = req.headers.authorization.split(' ');
        if (isUn(authHeader[1])) {
            return res.status(401).send();
        }
    }
    return next();
}

// Check JWT validity
export const checkJWT = jwt({
    secret: process.env.JWT_KEY,
    userProperty: 'token',
    getToken: getToken
});

// Check JWT validity
export const checkJWTError = (err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
        console.log('Bad token');
        return res.status(401).send();
    }
    return next();
}

// TODO check user permissions
export const checkUser = (req, res, next) => {
    if (!req.token || !req.token.data || isUn(req.token.data.email)) {
        return res.status(401).send();
    }

    return next();
}

