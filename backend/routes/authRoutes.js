import express from 'express';
import { login as loginAdmin } from '../controllers/authController.js';

const router = express.Router();

// Admin login
router.post('/login', loginAdmin);

export default router;
