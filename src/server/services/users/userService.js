import mongoQuery from '../../db/mongo/mongo';
import { isUn } from '@utils/utils';
import { ObjectId } from 'mongodb';


const readUser = async (email, username, id) => {
    try {
        let user;
        if (email) {
            user = await mongoQuery.read('users', {email: email});
        } else if (username) {
            user = await mongoQuery.read('users', {username: username});
        } else if (id) {
            user = await mongoQuery.read('users', {_id: ObjectId(id)});
        }

        return user[0];
    } catch (err) {
        throw err;
    }
}

const getUserByEmail = async (email, requesterEmail) => {
    try {
        const queryResult = await mongoQuery.readOne('users', { email: email });
        return buildUserFromDocument(queryResult, requesterEmail);
    } catch (err) {
        throw err;
    }
}

const getUserByUsername = async (username, requesterEmail) => {
    try {
        const queryResult = await mongoQuery.readOne('users', { username: username });
        return buildUserFromDocument(queryResult, requesterEmail);
    } catch (err) {
        throw err;
    }
}

const buildUserFromDocument = (userDocument, requesterEmail) => {
    if (!userDocument) {
        return undefined;
    }
    const user = {
        username: userDocument.username,
        image: userDocument.image,
    };

    const isOwner = !isUn(requesterEmail) && requesterEmail === userDocument.email;
    if (isOwner) {
        user.email = userDocument.email;
        user.verified = userDocument.verificationHash === '';
    }

    return user;
}

const updateUser = async (user) => {
    try {
        const success = await mongoQuery.update('users', {email: user.email}, user);

        return success;
    } catch (err) {
        throw err;
    }
}

const userService = {
    readUser,
    getUserByEmail,
    getUserByUsername,
    updateUser
}

export default userService;

