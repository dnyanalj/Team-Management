export function getErrorMessage(error) {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (error?.response) {
    return 'Something went wrong. Please try again.';
  }
  if (error?.request) {
    return 'Network error: unable to reach the server. Please check your connection.';
  }
  return error?.message || 'An unexpected error occurred.';
}

export function getFieldErrors(error) {
  return error?.response?.data?.errors || [];
}
