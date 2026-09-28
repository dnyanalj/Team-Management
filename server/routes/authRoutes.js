import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import { registerValidators, loginValidators } from '../middleware/validators/authValidators.js';
import { handleValidationErrors } from '../middleware/validators/handleValidationErrors.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.post('/register', registerValidators, handleValidationErrors, register);
router.post('/login', loginValidators, handleValidationErrors, login);
router.get('/me', protect, getMe);

export default router;
