import * as config from '../config.js';
import jwt from 'jsonwebtoken';
import { SendEmailCommand } from '@aws-sdk/client-ses';
import { emailTemplate } from '../helpers/email.js';
import { hashPassword, comparePassword } from '../helpers/auth.js';

import User from '../models/user.js';

import { nanoid } from 'nanoid';
import validator from 'email-validator';

const tokenAndUserResponse = (req, res, user) => {
    // create token
    const jwtToken = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '1h',
    });
    // create refresh token
    const refreshToken = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
    // hide fields
    user.password = undefined;
    user.resetCode = undefined;
    // send response
    return res.json({
        user,
        token: jwtToken,
        refreshToken,
    });
};

// create jwt with email and password then email as clickable link
// only when user click on that email link, registeration completes
export const preRegister = async (req, res) => {
    try {
        // take email and password from client
        const { email, password } = req.body;

        // validation
        if (!validator.validate(email)) {
            return res.json({ error: 'A valid email is required' });
        }
        if (!password) {
            return res.json({ error: 'Password is required' });
        }
        if (password && password?.length < 8) {
            return res.json({ error: 'Password should be at least 8 characters' });
        }

        const user = await User.findOne({ email });
        if (user) {
            return res.json({ error: 'Email is taken' });
        }

        // generate jwt using email and password
        const token = jwt.sign({ email, password }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });

        // prepare email content
        let content = ` 
            <p>Please click the link below to activate your account.</p>
            <a href="${process.env.CLIENT_URL}/auth/account-activate/${token}">Activate my account</a>`;
        let subject = 'Welcome to Education Platform';
        const sendEmailCommand = new SendEmailCommand(emailTemplate(email, content, process.env.REPLY_TO, subject));

        // send verification email
        await config.AWSSES.send(sendEmailCommand, (err, data) => {
            if (err) {
                console.log('Provide a valid email address', err);
                return res.json({ ok: false });
            } else {
                console.log('Check email to complete registration', data);
                return res.json({ ok: true });
            }
        });
    } catch (err) {
        console.log(err);
    }
};

// register user with valid email
export const register = async (req, res) => {
    try {
        // decode email, password from token
        const { email, password } = jwt.verify(req.body.token, process.env.JWT_SECRET);

        const userExist = await User.findOne({ email });
        if (userExist) {
            return res.json({ error: 'Email is taken' });
        }

        // hash password
        const hashedPassword = await hashPassword(password);
        // create user and save
        const user = await new User({
            username: nanoid(6),
            email,
            password: hashedPassword,
        }).save();

        tokenAndUserResponse(req, res, user);
    } catch (err) {
        console.log(err);
        res.json({ error: 'Invalid or expired token. Try again.' });
    }
};

//   allow valid user to login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // 1. find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.json({ error: 'Please register first' });
        }
        // 2. compare password
        const match = await comparePassword(password, user.password);
        if (!match) {
            return res.json({
                error: 'Wrong password',
            });
        }

        tokenAndUserResponse(req, res, user);
    } catch (err) {
        console.log(err);
        res.json({ error: 'Something went wrong. Try again.' });
    }
};

// allow user to reset password if forgot
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            res.json({ error: 'Could not find user with that email' });
        } else {
            const resetCode = nanoid();

            const token = jwt.sign({ resetCode }, process.env.JWT_SECRET, {
                expiresIn: '60m',
            });
            // save to user db
            user.resetCode = resetCode;
            user.save();

            // prepare email content
            let content = ` 
            <p>Please click the link below to access your account.</p>
            <a href="${process.env.CLIENT_URL}/auth/access-account/${token}">Access my account</a>`;
            let subject = 'Access your Education Platform account';
            const sendEmailCommand = new SendEmailCommand(emailTemplate(email, content, process.env.REPLY_TO, subject));

            // send verification email
            await config.AWSSES.send(sendEmailCommand, (err, data) => {
                if (err) {
                    console.log('Provide a valid email address', err);
                    return res.json({ ok: false });
                } else {
                    console.log('Check email to access your account', data);
                    return res.json({ ok: true });
                }
            });
        }
    } catch (err) {
        console.log(err);
        res.json({ error: 'Something went wrong. Try again.' });
    }
};

//   allow user to access account after resetting forgot password
export const accessAccount = async (req, res) => {
    try {
        // verify token and check expiry
        const { resetCode } = jwt.verify(req.body.resetCode, process.env.JWT_SECRET);

        const user = await User.findOneAndUpdate({ resetCode }, { resetCode: '' });

        tokenAndUserResponse(req, res, user);
    } catch (err) {
        console.log(err);
        res.json({ error: 'Expired or invalid token. Try again.' });
    }
};

// if token is expire, send refreshToken
export const refreshToken = async (req, res) => {
    try {
        // console.log("you hit refresh token endpoint => ", req.headers);

        const { _id } = jwt.verify(req.headers.refresh_token, process.env.JWT_SECRET);

        const user = await User.findById(_id);

        tokenAndUserResponse(req, res, user);
    } catch (err) {
        console.log('===> ', err.name);
        return res.status(403).json({ error: 'Refresh token failed' }); // 403 is important
    }
};

// get currently logged in user
export const currentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        user.password = undefined;
        user.resetCode = undefined;
        res.json(user);
    } catch (err) {
        console.log(err);
        return res.status(403).json({ error: 'Unauthorized' });
    }
};

//   get public profile, no need to login
export const publicProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        user.password = undefined;
        user.resetCode = undefined;
        res.json(user);
    } catch (err) {
        console.log(err);
        return res.status(403).json({ error: err });
    }
};

//   update password
export const updatePassword = async (req, res) => {
    try {
        // get new password from client
        const { password } = req.body;

        if (!password) {
            return res.json({ error: 'Password is required' });
        }

        // check if password meets the requirement
        if (password && password?.length < 6) {
            return res.json({
                error: 'Password should be at least 8 characters',
            });
        }

        //   const user = await User.findById(req.user._id);
        const hashedPassword = await hashPassword(password);

        await User.findByIdAndUpdate(req.user._id, {
            password: hashedPassword,
        });

        res.json({ ok: true });
    } catch (err) {
        console.log(err);
        return res.status(403).json({ error: 'Unauthorized' });
    }
};

// update name username company image phone about
export const updateProfile = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.user._id, req.body, { new: true });

        user.password = undefined;
        user.resetCode = undefined;
        res.json(user);
    } catch (err) {
        console.log(err);
        if (err.codeName === 'DuplicateKey') {
            return res.status(403).json({ error: 'Username or email is already taken' });
        } else {
            return res.status(403).json({ error: 'Unauhorized' });
        }
    }
};

// get all agents
// export const agents = async (req, res) => {
//     try {
//         const users = await User.find({ role: 'Seller' }).select(
//             '-password -role -enquiredProperties -wishlist -photo.Key -photo.Bucket',
//         );
//         res.json(users);
//     } catch (err) {
//         console.log(err);
//     }
// };

// to show how many ads one agent have
// export const agentAdCount = async (req, res) => {
//     try {
//         const ads = await Ad.find({ postedBy: req.params._id }).select('_id');
//         res.json(ads);
//     } catch (err) {
//         console.log(err);
//     }
// };

// get information of an agent
// export const agent = async (req, res) => {
//     try {
//         const user = await User.findOne({ username: req.params.username }).select(
//             '-password -role -enquiredProperties -wishlist -photo.Key -photo.Bucket',
//         );
//         const ads = await Ad.find({ postedBy: user._id }).select('-photos.Key -photos.Bucket -location -googleMap');
//         res.json({ user, ads });
//     } catch (err) {
//         console.log(err);
//     }
// };
