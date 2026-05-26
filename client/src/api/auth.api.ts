import { apiClient } from "./axios";
import { AuthResponse, User, UserRole } from "../types";

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

interface RawUser {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: UserRole;
}

interface RawAuthResponse {
  user: RawUser;
  accessToken?: string;
  token?: string;
}

export const normalizeUser = (user: RawUser): User => {
  const id = user._id ?? user.id ?? "";

  return {
    _id: user._id ?? id,
    id,
    name: user.name,
    email: user.email,
    role: user.role
  };
};

const normalizeAuthResponse = (payload: RawAuthResponse): AuthResponse => {
  const accessToken = payload.accessToken ?? payload.token ?? "";

  return {
    user: normalizeUser(payload.user),
    accessToken,
    token: accessToken
  };
};

export const authApi = {
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const response = await apiClient.post<RawAuthResponse>("/api/auth/register", payload);
    return normalizeAuthResponse(response.data);
  },
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const response = await apiClient.post<RawAuthResponse>("/api/auth/login", payload);
    return normalizeAuthResponse(response.data);
  },
  me: async (): Promise<User> => {
    const response = await apiClient.get<{ user: RawUser }>("/api/auth/me");
    return normalizeUser(response.data.user);
  }
};
