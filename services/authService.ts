// ============================================
// services/authService.ts
// ============================================

import { getAuthToken, handleResponse, fetchWithAuth } from '../lib/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// ============================================
// Types
// ============================================
interface AuthResponse {
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  user?: any;
  error?: string;
  message?: string;
  errors?: any;
  [key: string]: any;
}

interface ServiceResponse {
  success: boolean;
  token?: string;
  refreshToken?: string;
  data?: any;
  error?: string;
  message?: string;
}

// ============================================
// Helpers
// ============================================

/**
 * Read the response body exactly once as text, then attempt
 * JSON.parse.  Keeps the raw string as a fallback so nothing
 * is ever lost and we never hit the "body already consumed" error.
 */
async function readBody(res: Response): Promise<{ raw: string; json: any }> {
  const raw = await res.text();
  let json: any = null;
  try {
    json = JSON.parse(raw);
  } catch {
    // not valid JSON — json stays null
  }
  return { raw, json };
}

/**
 * Walk the parsed body in priority order and return the most
 * useful error string.  Covers every shape your backend sends:
 *   { success: false, error: "..." }
 *   { success: false, message: "..." }
 *   { errors: [{ msg: "..." }] }          ← express-validator array
 *   { errors: { field: ["..."] } }        ← express-validator object
 * Falls back to raw text, then HTTP status.
 */
function extractError(json: any, raw: string, status: number): string {
  if (json) {
    if (typeof json.error === 'string' && json.error) return json.error;
    if (typeof json.message === 'string' && json.message) return json.message;

    if (json.errors) {
      // express-validator array shape
      if (Array.isArray(json.errors) && json.errors[0]?.msg) {
        return json.errors[0].msg;
      }
      // express-validator object shape
      if (typeof json.errors === 'object') {
        const first = Object.values(json.errors)[0];
        if (Array.isArray(first) && first[0]) return first[0];
      }
    }
  }

  if (raw.trim()) return raw.trim();
  return `Request failed with status ${status}`;
}

/**
 * Ensure _id is always present on a user object regardless of
 * whether the backend sent "id" or "_id".
 */
function normaliseUser(user: any): any {
  if (!user) return user;
  if (!user._id && user.id) user._id = user.id;
  return user;
}

// ============================================
// Service
// ============================================
export const authService = {
  // =============================
  // PUBLIC
  // =============================
  register: async (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phoneNumber?: string;
    cohort?: string;
  }): Promise<ServiceResponse> => {
    if (typeof window === 'undefined') {
      throw new Error('Auth service can only be used on client side');
    }

    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    const { raw, json } = await readBody(response);

    if (!response.ok) {
      throw new Error(extractError(json, raw, response.status));
    }

    const result = json as AuthResponse;

    if (result.accessToken) {
      localStorage.setItem('authToken', result.accessToken);
      if (result.refreshToken) {
        localStorage.setItem('refreshToken', result.refreshToken);
      }
    }

    return {
      success: result.success,
      token: result.accessToken,
      refreshToken: result.refreshToken,
      data: normaliseUser(result.user),
    };
  },

  login: async (credentials: { email: string; password: string }): Promise<ServiceResponse> => {
    if (typeof window === 'undefined') {
      throw new Error('Auth service can only be used on client side');
    }

    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(credentials),
    });

    // Single read — raw preserved so we never lose the body
    const { raw, json } = await readBody(response);

    if (!response.ok) {
      // Log the full raw payload so we can see exactly what came back
      console.error('❌ Login failed:', { status: response.status, body: raw });
      throw new Error(extractError(json, raw, response.status));
    }

    const result = json as AuthResponse;

    // Backend returned 200 but explicitly flagged failure
    if (result.success === false) {
      throw new Error(extractError(json, raw, response.status));
    }

    if (result.accessToken) {
      localStorage.setItem('authToken', result.accessToken);
      if (result.refreshToken) {
        localStorage.setItem('refreshToken', result.refreshToken);
      }
    }

    return {
      success: true,
      token: result.accessToken,
      refreshToken: result.refreshToken,
      data: normaliseUser(result.user),
    };
  },

  refreshToken: async (): Promise<ServiceResponse> => {
    if (typeof window === 'undefined') {
      throw new Error('Auth service can only be used on client side');
    }

    const refreshToken = localStorage.getItem('refreshToken');

    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: refreshToken ? JSON.stringify({ refreshToken }) : undefined,
    });

    const { raw, json } = await readBody(response);

    if (!response.ok) {
      throw new Error(extractError(json, raw, response.status));
    }

    const result = json as AuthResponse;

    if (result.accessToken) {
      localStorage.setItem('authToken', result.accessToken);
      if (result.refreshToken) {
        localStorage.setItem('refreshToken', result.refreshToken);
      }
    }

    return {
      success: result.success,
      token: result.accessToken,
      refreshToken: result.refreshToken,
      data: normaliseUser(result.user),
    };
  },

  forgotPassword: async (email: string) => {
    const response = await fetch(`${API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return handleResponse(response);
  },

  resetPassword: async (resetToken: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/reset-password/${resetToken}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    return handleResponse(response);
  },

  verifyEmail: async (token: string) => {
    const response = await fetch(`${API_URL}/auth/verify-email/${token}`, {
      method: 'GET',
    });
    return handleResponse(response);
  },

  // =============================
  // PROTECTED
  // =============================
  getMe: async () => {
    if (typeof window === 'undefined') {
      throw new Error('Auth service can only be used on client side');
    }

    
    const response = await fetchWithAuth(`${API_URL}/auth/me`);
    const { raw, json } = await readBody(response);

    if (!response.ok) {
      throw new Error(extractError(json, raw, response.status));
    }

    const result = json as AuthResponse;

    return {
      success: result.success,
      data: normaliseUser(result.data),
    };
  },

  logout: async () => {
    if (typeof window === 'undefined') {
      throw new Error('Auth service can only be used on client side');
    }

    try {
      await fetchWithAuth(`${API_URL}/auth/logout`, { method: 'POST' });
    } catch {
      // best-effort — tokens cleared below regardless
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
    }

    return { success: true };
  },

  logoutAll: async () => {
    if (typeof window === 'undefined') {
      throw new Error('Auth service can only be used on client side');
    }

    try {
      await fetchWithAuth(`${API_URL}/auth/logout-all`, { method: 'POST' });
    } catch {
      // best-effort
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
    }

    return { success: true };
  },

  updateProfile: async (data: FormData | {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    githubProfile?: string;
    linkedinProfile?: string;
    portfolioUrl?: string;
  }) => {
    if (typeof window === 'undefined') {
      throw new Error('Auth service can only be used on client side');
    }

    const token = getAuthToken();
    const headers: any = {
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    if (!(data instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_URL}/auth/profile`, {
      method: 'PUT',
      headers,
      credentials: 'include',
      body: data instanceof FormData ? data : JSON.stringify(data),
    });

    const { raw, json } = await readBody(response);

    if (!response.ok) {
      throw new Error(extractError(json, raw, response.status));
    }

    const result = json as AuthResponse;

    return {
      success: result.success,
      message: result.message,
      data: normaliseUser(result.data),
    };
  },

  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }) => {
    if (typeof window === 'undefined') {
      throw new Error('Auth service can only be used on client side');
    }

    const response = await fetchWithAuth(`${API_URL}/auth/change-password`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });

    const { raw, json } = await readBody(response);

    if (!response.ok) {
      throw new Error(extractError(json, raw, response.status));
    }

    const result = json as AuthResponse;

    // Password changed — force re-login
    if (result.success) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
    }

    return { success: result.success, message: result.message };
  },

  // =============================
  // UTILITY
  // =============================
  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') return false;
    return !!getAuthToken();
  },

  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return getAuthToken();
  },

  clearTokens: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('login_attempts');
      localStorage.removeItem('account_lockout');
    }
  },
};