import { Router } from 'express';
import {
  getTasks,
  getTaskStats,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} from '../controllers/taskController.js';
import {
  createTaskValidators,
  updateTaskValidators,
  taskIdValidator,
  getTasksValidators,
} from '../middleware/validators/taskValidators.js';
import { handleValidationErrors } from '../middleware/validators/handleValidationErrors.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/stats', getTaskStats);
router.get('/', getTasksValidators, handleValidationErrors, getTasks);
router.get('/:id', taskIdValidator, handleValidationErrors, getTaskById);
router.post('/', createTaskValidators, handleValidationErrors, createTask);
router.put('/:id', updateTaskValidators, handleValidationErrors, updateTask);
router.delete('/:id', taskIdValidator, handleValidationErrors, deleteTask);

export default router;
