import { AxiosError } from "axios";

interface ValidationIssue {
  path?: string;
  message: string;
}

interface ApiErrorBody {
  message?: string;
  errors?: ValidationIssue[];
}

export const getApiErrorMessage = (error: unknown): string => {
  const fallbackMessage = "Something went wrong. Please try again.";

  if (!error) {
    return fallbackMessage;
  }

  const axiosError = error as AxiosError<ApiErrorBody>;
  const status = axiosError.response?.status;
  const data = axiosError.response?.data;

  if (data?.errors?.length) {
    return data.errors.map((issue) => issue.message).join(" ");
  }

  if (data?.message) {
    return data.message;
  }

  if (status === 401) {
    return "Please login to continue.";
  }

  if (status === 403) {
    return "You do not have permission to perform this action.";
  }

  if (status === 404) {
    return "The requested resource was not found.";
  }

  if (status && status >= 500) {
    return "The server is having trouble. Please try again soon.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
};
