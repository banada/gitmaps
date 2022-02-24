import bcrypt from 'bcrypt';
import dayjs from 'dayjs';
import * as jwt from 'jsonwebtoken';
import crypto from 'crypto';

import mongoQuery from '../../db/mongo/mongo';
//import mailService from '@services/mail/mailService';
import { isUn } from '@utils/utils';

const USERS_COLLECTION = 'users'
const SALT_ROUNDS = 10;
const JWT_EXPIRY = '7d';
const VERIFICATION_EXPIRY_LENGTH = [3, 'days'];
const RESET_EXPIRY_LENGTH = [1, 'days'];
const authService = {};

const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);

/**
 *  generateJWT
 *
 *
 */
authService.generateJWT = async (email, username, id) => {
    const data = {
        email,
        username,
        id,
    }

    return jwt.sign({data}, process.env.JWT_KEY, { expiresIn: JWT_EXPIRY });
}

/**
 *  register
 *
 *  
 *
 *  Returns false on failure or if user already exists
 *  Returns true on success
 */
authService.register = async (email, username, password) => {
    return new Promise(async (resolve, reject) => {
        // Check if email already exists
        const sameEmail = await mongoQuery.read(USERS_COLLECTION, {'email': email});
        if (isUn(sameEmail) || !isUn(sameEmail[0])) {
            return resolve({
                success: false,
                msg: 'That username or email is already registered.'
            });
        }
        // Check if username already exists
        const sameUsername = await mongoQuery.read(USERS_COLLECTION, {'username': username});
        if (isUn(sameUsername) || !isUn(sameUsername[0])) {
            return resolve({
                success: false,
                msg: 'That username or email is already registered.'
            });
        }
        // Hash & Salt password
        bcrypt.genSalt(SALT_ROUNDS, function(err, salt) {
            bcrypt.hash(password, salt, async (err, hash) => {
                const verificationExpiryDate = dayjs().utc().add(...VERIFICATION_EXPIRY_LENGTH);
                crypto.randomBytes(32, async (err, buf) => {
                    const verificationHash = buf.toString('hex');
                    const user = {
                        username,
                        email,
                        salt,
                        hash,
                        verificationHash: verificationHash,
                        verificationExpiration: verificationExpiryDate.toDate()
                    };

                    // Save new user
                    const res = await mongoQuery.create(USERS_COLLECTION, user);

                    if (isUn(res)) {
                        return resolve({
                            success: false
                        });
                    } else {
                        if (process.env.NODE_ENV === 'production') {
                            //await mailService.sendVerificationEmail(email, verificationHash);
                            //await mailService.addContact(email, process.env.SENDGRID_LIST_USERS)
                        }
                        return resolve({
                            success: true
                        });
                    }
                });
            });
        });
    });
}

/**
 *  login
 *
 *  Allows username or email
 *  Returns undefined on bad credentials
 */
authService.login = async (username, email, password) => {
    return new Promise(async (resolve, reject) => {
        let user;
        if (username) {
            user = await mongoQuery.read(USERS_COLLECTION, {'username': username});
        } else if (email) {
            user = await mongoQuery.read(USERS_COLLECTION, {'email': email});
        }
        if (isUn(user) || isUn(user[0])) {
            return resolve(undefined);
        }
        user = { ...user[0] };

        // Re-hash & salt password
        bcrypt.hash(password, user.salt, async (err, hash) => {
            if (err) {
                return reject(err);
            }
            // Check password
            // TODO shouldn't do this, but bcrypt.compare
            // seems to be broken
            if (hash === user.hash) {
                // Generate JWT
                const jwt = await authService.generateJWT(user.email, user.username, user._id);
                return resolve(jwt);
            } else {
                return resolve(undefined);
            }
        });
    });
}

/**
 * verifyAccount
 *
 *
 *
 *  Returns false if account has already been verified, current date is past the expiry date, or account does not exist
 *  Returns true on success
 */
authService.verifyAccount = async (verificationHash) => {
    try {
        const currentTime = dayjs().toDate();
        const query = {
            verificationExpiration: { $gte: currentTime },
            verificationHash: { $eq: verificationHash },
        };
        const setFields = { verificationHash: '' };
        const updateSuccessful = await mongoQuery.update(USERS_COLLECTION, query, setFields);
        return updateSuccessful;
    } catch (err) {
        throw err;
    }
}

/**
 *  requestReset
 *
 *  Requesting a password reset triggers the creation of a new
 *  reset hash, and an email is sent to the user.
 *
 */
authService.requestReset = async (email) => {
    return new Promise(async (resolve, reject) => {
        try {
            let user = await mongoQuery.read(USERS_COLLECTION, {'email': email});
            if (isUn(user) || isUn(user[0])) {
                return resolve(undefined);
            }
            user = { ...user[0] };
            crypto.randomBytes(32, async (err, buf) => {
                const resetHash = buf.toString('hex');
                const resetExpiryDate = dayjs().utc().add(...RESET_EXPIRY_LENGTH).toDate();
                const query = {
                    email: { $eq: email },
                };
                const setFields = {
                    resetHash: resetHash,
                    resetExpiration: resetExpiryDate
                };
                const updateSuccessful = await mongoQuery.update(USERS_COLLECTION, query, setFields);
                // Only send email if the user exists
                if (updateSuccessful && (process.env.NODE_ENV === 'production')) {
                    //await mailService.sendPasswordResetEmail(email, resetHash);
                }

                return resolve(updateSuccessful);
            });
        } catch (err) {
            throw err;
        }
    });
}

authService.resetPassword = async (resetHash, newPassword) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Hash & Salt password
            bcrypt.genSalt(SALT_ROUNDS, function(err, salt) {
                if (err) {
                    return reject(err);
                }
                bcrypt.hash(newPassword, salt, async (err, hash) => {
                    if (err) {
                        return reject(err);
                    }
                    const currentTime = dayjs().toDate();
                    const query = {
                        resetExpiration: { $gte: currentTime },
                        resetHash: { $eq: resetHash },
                    };
                    const setFields = {
                        resetHash: '',
                        hash: hash,
                        salt: salt
                    };
                    const user = await mongoQuery.findOneAndUpdate(USERS_COLLECTION, query, setFields);
                    if (isUn(user)) {
                        return resolve(undefined);
                    }
                    if (process.env.NODE_ENV === 'production') {
                        //await mailService.sendPasswordResetConfirmationEmail(user.email);
                    }

                    return resolve(true);
                });
            });
        } catch (err) {
            throw err;
        }
    });
}

export default authService;

