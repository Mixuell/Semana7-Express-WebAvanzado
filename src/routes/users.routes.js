import express from 'express';
import UserController from '../controllers/UserController.js';
import authenticate from '../middlewares/authenticate.js';
import authorize from '../middlewares/authorize.js';

const router = express.Router();

router.get('/', authenticate, authorize(['admin']), UserController.getAll);
router.get('/me', authenticate, authorize([]), UserController.getMe);

export default router;