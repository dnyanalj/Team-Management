// Mirrors the server rule in taskController.updateTask: creator, assignee or admin.
function idOf(ref) {
  return ref?._id ?? ref;
}

export function canEditTask(task, user) {
  if (!task || !user) return false;
  if (user.role === 'admin') return true;
  return idOf(task.createdBy) === user.id || idOf(task.assignedTo) === user.id;
}

