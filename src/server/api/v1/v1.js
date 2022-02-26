import express from 'express';
import { checkHeaders, checkJWT, checkJWTError, checkUser } from '../../middleware/auth/auth';
/*
import user from '@api/v1/user/user';
import upload from '@api/v1/upload/upload';
import auth from '@api/v1/auth/auth';
import access from '@api/v1/access/access'
*/

import files from '@api/v1/files/files';

const v1 = express.Router();

v1.use('/files', files);

/*
// Upload images and other assets
v1.use('/upload',
    checkHeaders,
    checkJWT,
    checkJWTError,
    upload);

v1.use('/auth', auth);

// Users
v1.use('/user',
    checkHeaders,
    checkJWT,
    checkJWTError,
    user);

v1.use('/access',
    checkHeaders,
    checkJWT,
    checkJWTError,
    checkUser,
    access);
*/


export default v1;
