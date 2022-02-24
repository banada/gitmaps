import Joi from 'joi';

export const Registration = Joi.object({
    username: Joi.string()
                 .alphanum()
                 .min(4)
                 .max(24)
                 .required(),
    email:    Joi.string()
                 .email()
                 .required(),
    password: Joi.string()
                 .min(6)
                 .max(48)
                 .required()
});

export const Login = Joi.object({
    username: Joi.string()
                 .alphanum()
                 .min(4)
                 .max(24),
    email:    Joi.string()
                 .email(),
    password: Joi.string()
                 .min(6)
                 .max(48)
                 .required()
}).or('username', 'email');

export const ResetPassword = Joi.object({
    password: Joi.string()
                 .min(6)
                 .max(48)
                 .required(),
    resetHash: Joi.string()
                 .length(64)
                 .required()
});

