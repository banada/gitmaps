import authService from '../../services/auth/authService';
import { Registration, Login, ResetPassword } from '@types/Auth';
import { isUn, emailRegex } from '@utils/utils';

const authController = {};

authController.register = async (req, res, next) => {

    let register = req.body;
    try {
        register = await Registration.validateAsync(register);
    } catch (err) {
        res.status(400);
        return res.json({
            msg: err.details[0].message || 'Invalid registration'
        });
    }

    try {
        const result = await authService.register(register.email, register.username, register.password);
        if (!result.success) {
            res.status(400);
            return res.json({
                jwt: undefined,
                msg: result.msg
            });
        }
        // Login
        const jwt = await authService.login(register.username, register.email, register.password);
        if (isUn(jwt)) {
            return res.status(401).send();
        }
        res.status(200);
        return res.json({
            jwt
        });
    } catch (err) {
        throw err;
        res.status(500);
        return res.send();
    }
}

authController.login = async (req, res, next) => {
    let login = req.body;
    try {
        login = await Login.validateAsync(login);
    } catch (err) {
        res.status(400)
        return res.json({
            msg: 'Invalid login'
        });
    }

    try {
        const jwt = await authService.login(login.username, login.email, login.password);
        if (isUn(jwt)) {
            return res.status(401).send();
        } else {
            res.status(200);
            return res.json({
                jwt
            });
        }
    } catch (err) {
        throw err;
    }
}

authController.verify = async (req, res, next) => {
    try {
        const verificationSuccessful = await authService.verifyAccount(req.params.verificationHash);
        if (verificationSuccessful) {
            res.status(200);
        } else {
            res.status(404)
            res.json({
                msg: 'The link is expired or the account has already been confirmed or does not exist.'
            });
        }
        return res.send();
    } catch (err) {
        throw err;
    }
}

authController.requestReset = async (req, res, next) => {
    const email = req.body.email;
    if (isUn(email) || !emailRegex.test(email.toString())) {
        res.status(400);
        return res.send();
    }

    try {
        const requestSuccess = await authService.requestReset(email);
        // Intentional ambiguity
        return res.status(200).send();

    } catch (err) {
        console.log(err);
        return res.status(500).send();
    }
}

authController.resetPassword = async (req, res, next) => {
    let newPassword, resetHash;
    try {
        const resetInput = await ResetPassword.validateAsync(req.body);
        newPassword = resetInput.password;
        resetHash = resetInput.resetHash;
    } catch (err) {
        return res.status(400).send();
    }

    try {
        const resetSuccess = await authService.resetPassword(resetHash, newPassword);
        if (resetSuccess) {
            return res.status(200).send();
        } else {
            return res.status(404).send();
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send();
    }
}

export default authController;

