// ============================================
// services/authService.ts
// ============================================

import { getAuthToken, handleResponse, fetchWithAuth } from '../lib/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

interface AuthResponse {
  success: boolean;
  token?: string;
  refreshToken?: string;
  warning?: string;
  [key: string]: any;
}

export const authService = {
  // =============================
  // PUBLIC ROUTES
  // =============================
register: async (data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  cohort?: string;
}) => {
  if (typeof window === 'undefined') {
    throw new Error('Auth service can only be used on client side');
  }

  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // IMPORTANT: Send/receive cookies
    body: JSON.stringify(data),
  });
  const result = await handleResponse(response) as AuthResponse;
  
  // Save tokens if registration successful
  if (result.success && result.accessToken) {
    localStorage.setItem('authToken', result.accessToken);
    if (result.refreshToken) {
      localStorage.setItem('refreshToken', result.refreshToken);
    }
  }
  
  // Return in the format AuthContext expects
  return {
    success: result.success,
    token: result.accessToken,
    refreshToken: result.refreshToken,
    data: result.user, // Backend sends 'user', frontend expects 'data'
  };
},

 login: async (credentials: { email: string; password: string }) => {
  if (typeof window === 'undefined') {
    throw new Error('Auth service can only be used on client side');
  }
  
  console.log('API_URL:', API_URL);

  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // IMPORTANT: Send/receive cookies
    body: JSON.stringify(credentials),
  });
  const result = await handleResponse(response) as AuthResponse;
  
  console.log('Login API result:', result); // DEBUG
  
  // Backend returns { success, accessToken, refreshToken, user }
  // Save tokens if login successful
  if (result.success && result.accessToken) {
    localStorage.setItem('authToken', result.accessToken);
    if (result.refreshToken) {
      localStorage.setItem('refreshToken', result.refreshToken);
    }
  }
  
  // Return in the format AuthContext expects (with 'data' key)
  return {
    success: result.success,
    token: result.accessToken,
    refreshToken: result.refreshToken,
    data: result.user, // Backend sends 'user', frontend expects 'data'
  };
},

refreshToken: async () => {
  if (typeof window === 'undefined') {
    throw new Error('Auth service can only be used on client side');
  }

  const refreshToken = localStorage.getItem('refreshToken');
  
  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // IMPORTANT: Send cookies
    body: refreshToken ? JSON.stringify({ refreshToken }) : undefined,
  });
  const result = await handleResponse(response) as AuthResponse;
  
  // Update tokens if in response body
  if (result.success && result.accessToken) {
    localStorage.setItem('authToken', result.accessToken);
    if (result.refreshToken) {
      localStorage.setItem('refreshToken', result.refreshToken);
    }
  }
  
  return {
    success: result.success,
    token: result.accessToken,
    refreshToken: result.refreshToken,
    data: result.user,
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
  // PROTECTED ROUTES
  // =============================
  getMe: async () => {
    if (typeof window === 'undefined') {
      throw new Error('Auth service can only be used on client side');
    }

    const response = await fetchWithAuth(`${API_URL}/auth/me`);
    return handleResponse(response);
  },

  logout: async () => {
    if (typeof window === 'undefined') {
      throw new Error('Auth service can only be used on client side');
    }

    try {
      const response = await fetchWithAuth(`${API_URL}/auth/logout`, {
        method: 'POST',
      });
      const result = await handleResponse(response) as AuthResponse;
      
      // Clear local storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      
      return result;
    } catch (error) {
      // Clear tokens anyway even if API call fails
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      throw error;
    }
  },

  logoutAll: async () => {
    if (typeof window === 'undefined') {
      throw new Error('Auth service can only be used on client side');
    }

    try {
      const response = await fetchWithAuth(`${API_URL}/auth/logout-all`, {
        method: 'POST',
      });
      const result = await handleResponse(response) as AuthResponse;
      
      // Clear local storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      
      return result;
    } catch (error) {
      // Clear tokens anyway
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      throw error;
    }
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
    
    // Don't set Content-Type for FormData (browser sets it with boundary)
    if (!(data instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    
    const response = await fetch(`${API_URL}/auth/profile`, {
      method: 'PUT',
      headers,
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
    return handleResponse(response);
  },

  changePassword: async (data: { 
    currentPassword: string; 
    newPassword: string 
  }) => {
    if (typeof window === 'undefined') {
      throw new Error('Auth service can only be used on client side');
    }

    const response = await fetchWithAuth(`${API_URL}/auth/change-password`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    const result = await handleResponse(response) as AuthResponse;
    
    // Clear tokens on password change (user needs to login again)
    if (result.success) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
    }
    
    return result;
  },

  // =============================
  // UTILITY METHODS
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
      // Also clear lockout data
      localStorage.removeItem('login_attempts');
      localStorage.removeItem('account_lockout');
    }
  },
};