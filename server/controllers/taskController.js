import { Task } from '../models/Task.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { buildTaskFilter, getSortedTasks, parsePagination } from '../utils/apiFeatures.js';

export const getTasks = asyncHandler(async (req, res) => {
  const { search, status, priority, sortBy, order } = req.query;

  const filter = buildTaskFilter({ search, status, priority });
  const pagination = parsePagination(req.query);

  const [tasks, total] = await Promise.all([
    getSortedTasks(Task, filter, sortBy || 'createdAt', order || 'desc', pagination),
    Task.countDocuments(filter),
  ]);

  const page = pagination?.page ?? 1;
  const limit = pagination?.limit ?? total;

  res.status(200).json({
    success: true,
    data: tasks,
    pagination: {
      page,
      limit,
      total,
      totalPages: limit > 0 ? Math.ceil(total / limit) : 1,
    },
  });
});

export const getTaskStats = asyncHandler(async (req, res) => {
  const [statusCounts, priorityCounts, total, overdue] = await Promise.all([
    Task.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Task.aggregate([{ $group: { _id: '$priority', count: { $sum: 1 } } }]),
    Task.countDocuments(),
    Task.countDocuments({ status: { $ne: 'Completed' }, dueDate: { $lt: new Date() } }),
  ]);

  const byStatus = { Pending: 0, 'In Progress': 0, Completed: 0 };
  statusCounts.forEach((row) => {
    byStatus[row._id] = row.count;
  });

  const byPriority = { Low: 0, Medium: 0, High: 0 };
  priorityCounts.forEach((row) => {
    byPriority[row._id] = row.count;
  });

  res.status(200).json({
    success: true,
    data: {
      total,
      pending: byStatus.Pending,
      inProgress: byStatus['In Progress'],
      completed: byStatus.Completed,
      overdue,
      byPriority,
    },
  });
});

export const getTaskById = asyncHandler(async (req, res) => {
  
  const task = await Task.findById(req.params.id)
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email');

  if (!task) {
    throw new AppError('Task not found', 404);
  }

  res.status(200).json({ success: true, data: task });
});

export const createTask = asyncHandler(async (req, res) => {
  const { title, description, priority, status, dueDate, assignedTo } = req.body;

  const task = await Task.create({
    title,
    description,
    priority,
    status,
    dueDate,
    assignedTo,
    createdBy: req.user._id,
  });

  const populated = await task.populate([
    { path: 'assignedTo', select: 'name email' },
    { path: 'createdBy', select: 'name email' },
  ]);

  res.status(201).json({ success: true, data: populated });
});

export const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    throw new AppError('Task not found', 404);
  }

  const isOwner = task.createdBy.equals(req.user._id);
  const isAssignee = task.assignedTo.equals(req.user._id);
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAssignee && !isAdmin) {
    throw new AppError('Not authorized to modify this task', 403);
  }

  const { title, description, priority, status, dueDate, assignedTo } = req.body;
  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (priority !== undefined) task.priority = priority;
  if (status !== undefined) task.status = status;
  if (dueDate !== undefined) task.dueDate = dueDate;
  if (assignedTo !== undefined) task.assignedTo = assignedTo;

  await task.save();
  const populated = await task.populate([
    { path: 'assignedTo', select: 'name email' },
    { path: 'createdBy', select: 'name email' },
  ]);

  res.status(200).json({ success: true, data: populated });
});

export const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    throw new AppError('Task not found', 404);
  }

  const isOwner = task.createdBy.equals(req.user._id);
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    throw new AppError('Not authorized to delete this task', 403);
  }

  await task.deleteOne();

  res.status(200).json({ success: true, data: { id: req.params.id } });
});
