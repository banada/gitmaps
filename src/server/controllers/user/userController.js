import { isUn } from '../../../utils/utils';
import { PublishLevel } from '@types/Conversation';
import userService from '../../services/users/userService';
//import mailService from '../../services/mail/mailService';

const readUser = async (req, res, next) => {
    const username = req.params.id;
    if (isUn(username)) {
        res.status(400);
        return res.send();
    }
    try {
        const user = await userService.getUserByUsername(username, req?.token?.data?.email);
        if (isUn(user)) {
            res.status(404);
            return res.send();
        }

        res.status(200);
        return res.json(user);
    } catch (err) {
        console.log(err);
        res.status(500);
        return res.send();
    }
}

const sendVerificationEmail = async (req, res, next) => {
    try {
        const email = req?.token?.data?.email;
        const user = await userService.readUser(email, null);
        if (isUn(user)) {
            res.status(404);
            return res.send();
        }
        // Resend email using the same verification hash
        //await mailService.sendVerificationEmail(user.email, user.verificationHash);
        return res.status(200).send();
    } catch (err) {
        res.status(500);
        return res.send();
        throw err;
    }
}

const userController = {
    readUser,
    sendVerificationEmail
}

export default userController;

