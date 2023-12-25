import express from 'express';
import * as authController from '../controllers/auth.js';
import { requireSignin } from '../middlewares/auth.js';

const router = express.Router();

router.post('/pre-register', authController.preRegister);
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/access-account', authController.accessAccount);
router.get('/refresh-token', authController.refreshToken);
router.get('/current-user', requireSignin, authController.currentUser);
router.get('/profile/:userId', authController.publicProfile);
router.put('/update-password', requireSignin, authController.updatePassword);
router.put('/update-profile', requireSignin, authController.updateProfile);

// router.get('/agents', authController.agents);
// router.get('/agent-ad-count/:_id', authController.agentAdCount);
// router.get('/agent/:username', authController.agent);

export default router;
