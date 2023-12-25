import express from 'express';
import * as authController from '../controllers/auth.js';
import { requireSignin } from '../middlewares/auth.js';

const router = express.Router();

router.post('api/pre-register', authController.preRegister);
router.post('api/register', authController.register);
router.post('api/login', authController.login);
router.post('api/forgot-password', authController.forgotPassword);
router.post('api/access-account', authController.accessAccount);
router.get('api/refresh-token', authController.refreshToken);
router.get('api/current-user', requireSignin, authController.currentUser);
router.get('api/profile/:userId', authController.publicProfile);
router.put('api/update-password', requireSignin, authController.updatePassword);
router.put('api/update-profile', requireSignin, authController.updateProfile);

// router.get('api/agents', authController.agents);
// router.get('api/agent-ad-count/:_id', authController.agentAdCount);
// router.get('api/agent/:username', authController.agent);

export default router;
