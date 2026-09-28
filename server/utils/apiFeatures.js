const PRIORITY_WEIGHT = { Low: 1, Medium: 2, High: 3 };

export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function buildTaskFilter(query) {
  const filter = {};
  if (query.search) {
    filter.title = { $regex: escapeRegex(query.search), $options: 'i' };
  }
  if (query.status) {
    filter.status = query.status;
  }
  if (query.priority) {
    filter.priority = query.priority;
  }
  return filter;
}

// Returns `null` when no page/limit was requested, so callers can keep returning the full list.
export function parsePagination(query) {
  if (!query.page && !query.limit) return null;
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || DEFAULT_PAGE_SIZE, 1), MAX_PAGE_SIZE);
  return { page, limit, skip: (page - 1) * limit };
}

export async function getSortedTasks(Task, filter, sortBy = 'createdAt', order = 'desc', pagination = null) {
  const direction = order === 'asc' ? 1 : -1;
  const pageStages = pagination ? [{ $skip: pagination.skip }, { $limit: pagination.limit }] : [];

  if (sortBy === 'priority') {
    return Task.aggregate([
      { $match: filter },
      {
        $addFields: {
          priorityWeight: {
            $switch: {
              branches: [
                { case: { $eq: ['$priority', 'Low'] }, then: PRIORITY_WEIGHT.Low },
                { case: { $eq: ['$priority', 'Medium'] }, then: PRIORITY_WEIGHT.Medium },
                { case: { $eq: ['$priority', 'High'] }, then: PRIORITY_WEIGHT.High },
              ],
              default: 0,
            },
          },
        },
      },
      { $sort: { priorityWeight: direction, _id: direction } },
      ...pageStages,
      {
        $lookup: {
          from: 'users',
          localField: 'assignedTo',
          foreignField: '_id',
          as: 'assignedTo',
        },
      },
      { $unwind: { path: '$assignedTo', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'users',
          localField: 'createdBy',
          foreignField: '_id',
          as: 'createdBy',
        },
      },
      { $unwind: { path: '$createdBy', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          title: 1,
          description: 1,
          priority: 1,
          status: 1,
          dueDate: 1,
          createdAt: 1,
          updatedAt: 1,
          'assignedTo._id': 1,
          'assignedTo.name': 1,
          'assignedTo.email': 1,
          'createdBy._id': 1,
          'createdBy.name': 1,
          'createdBy.email': 1,
        },
      },
    ]);
  }

  const query = Task.find(filter)
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email')
    .sort({ [sortBy]: direction, _id: direction });

  if (pagination) query.skip(pagination.skip).limit(pagination.limit);
  return query;
}
