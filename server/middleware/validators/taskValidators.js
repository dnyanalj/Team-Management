import { body, param, query } from 'express-validator';

const SORT_FIELDS = ['dueDate', 'createdAt', 'priority', 'title'];

export const createTaskValidators = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ min: 3, max: 120 }),
  body('description').optional({ checkFalsy: true }).trim().isLength({ max: 2000 }),
  body('priority').optional().isIn(['Low', 'Medium', 'High']).withMessage('Priority must be Low, Medium, or High'),
  body('status').optional().isIn(['Pending', 'In Progress', 'Completed']).withMessage('Invalid status'),
  body('dueDate').notEmpty().withMessage('Due date is required').isISO8601().withMessage('Due date must be a valid date'),
  body('assignedTo').notEmpty().withMessage('Assigned user is required').isMongoId().withMessage('Invalid assigned user id'),
];

export const updateTaskValidators = [
  param('id').isMongoId().withMessage('Invalid task id'),
  body('title').optional().trim().isLength({ min: 3, max: 120 }),
  body('description').optional({ checkFalsy: true }).trim().isLength({ max: 2000 }),
  body('priority').optional().isIn(['Low', 'Medium', 'High']),
  body('status').optional().isIn(['Pending', 'In Progress', 'Completed']),
  body('dueDate').optional().isISO8601(),
  body('assignedTo').optional().isMongoId(),
];

export const taskIdValidator = [param('id').isMongoId().withMessage('Invalid task id')];

export const getTasksValidators = [
  query('status').optional({ values: 'falsy' }).isIn(['Pending', 'In Progress', 'Completed']),
  query('priority').optional({ values: 'falsy' }).isIn(['Low', 'Medium', 'High']),
  query('sortBy').optional({ values: 'falsy' }).isIn(SORT_FIELDS).withMessage(`sortBy must be one of: ${SORT_FIELDS.join(', ')}`),
  query('order').optional({ values: 'falsy' }).isIn(['asc', 'desc']),
  query('page').optional({ values: 'falsy' }).isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional({ values: 'falsy' }).isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
];
