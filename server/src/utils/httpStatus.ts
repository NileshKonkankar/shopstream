export const getErrorCode = (statusCode: number): string => {
  if (statusCode === 400) {
    return "BAD_REQUEST";
  }

  if (statusCode === 401) {
    return "UNAUTHENTICATED";
  }

  if (statusCode === 403) {
    return "FORBIDDEN";
  }

  if (statusCode === 404) {
    return "NOT_FOUND";
  }

  if (statusCode === 405) {
    return "METHOD_NOT_ALLOWED";
  }

  if (statusCode === 409) {
    return "CONFLICT";
  }

  if (statusCode === 429) {
    return "RATE_LIMITED";
  }

  if (statusCode >= 500) {
    return "INTERNAL_ERROR";
  }

  return "REQUEST_FAILED";
};
