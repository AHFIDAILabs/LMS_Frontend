// hooks/useAuth.ts
import { authService } from '@/services/authService';
import { useFetch } from './useFetch';
import { User, RegisterData } from '@/types';

// ==============================
// AUTH HOOK
// ==============================
export const useCurrentUser = () => {
  return useFetch<User | null>(async () => {
    const res = await authService.getMe() as { data: User } | null;
    return res?.data || null;
  }, []);
};

// ==============================
// MUTATIONS
// ==============================
export const useLogin = () => {
  return async (email: string, password: string) => {
    const res = await authService.login({ email, password });
    return res;
  };
};

export const useRegister = () => {
  return async (data: RegisterData) => {
    const res = await authService.register(data);
    return res;
  };
};

export const useLogout = () => {
  return async () => {
    const res = await authService.logout();
    return res;
  };
};

export const useUpdateProfile = () => {
  return async (data: FormData | Partial<User>) => {
    const res = await authService.updateProfile(data);
    return res;
  };
};

export const useChangePassword = () => {
  return async (currentPassword: string, newPassword: string) => {
    const res = await authService.changePassword({ currentPassword, newPassword });
    return res;
  };
};
