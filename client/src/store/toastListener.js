import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';
import { createTask, updateTask, deleteTask } from './slices/tasksSlice';
import { loginUser, registerUser } from './slices/authSlice';

// Centralises user feedback for mutations so pages don't each have to wire up toasts.
export const toastListener = createListenerMiddleware();

toastListener.startListening({
  actionCreator: createTask.fulfilled,
  effect: () => toast.success('Task created'),
});

toastListener.startListening({
  actionCreator: updateTask.fulfilled,
  effect: (action) => {
    const changed = Object.keys(action.meta.arg.payload);
    const statusOnly = changed.length === 1 && changed[0] === 'status';
    toast.success(statusOnly ? `Moved to ${action.payload.status}` : 'Task updated');
  },
});

toastListener.startListening({
  actionCreator: deleteTask.fulfilled,
  effect: () => toast.success('Task deleted'),
});

toastListener.startListening({
  matcher: isAnyOf(createTask.rejected, updateTask.rejected, deleteTask.rejected),
  effect: (action) => toast.error(action.payload || 'Something went wrong'),
});

toastListener.startListening({
  actionCreator: loginUser.fulfilled,
  effect: (action) => toast.success(`Welcome back, ${action.payload.user.name}`),
});

toastListener.startListening({
  actionCreator: registerUser.fulfilled,
  effect: (action) => toast.success(`Account created. Welcome, ${action.payload.user.name}!`),
});
