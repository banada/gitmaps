import express from 'express';
import { checkHeaders, checkJWT, checkJWTError, checkUser } from '../../middleware/auth/auth';
/*
import user from '@api/v1/user/user';
import upload from '@api/v1/upload/upload';
import access from '@api/v1/access/access'
*/
import auth from '@api/v1/auth/auth';
import files from '@api/v1/files/files';
import git from '@api/v1/git/git';

const v1 = express.Router();

v1.use('/files', files);
v1.use('/auth', auth);
v1.use('/git', git);

/*
// Upload images and other assets
v1.use('/upload',
    checkHeaders,
    checkJWT,
    checkJWTError,
    upload);


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
