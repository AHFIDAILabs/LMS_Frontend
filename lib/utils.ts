import { ApiResponse } from '@/types'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get auth token from localStorage (client-side only)
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('authToken')
}

/**
 * Handle API response errors with improved error handling
 */
export async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  try {
    const contentType = response.headers.get("content-type");
    let data: any;

    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      return {
        success: false,
        error: data?.error || data?.message || `Error ${response.status}`,
        data: null,
      };
    }

    // Build generic ApiResponse
    const apiResponse: ApiResponse<T> = {
      success: data.success ?? true,
      data: data.data ?? (data as T), // fallback: treat whole response as data if no 'data' key
      error: data.success === false ? data.error || data.message || null : null,
    };

    // Attach optional pagination if present
    if (typeof data.count === "number") apiResponse.count = data.count;
    if (typeof data.total === "number") apiResponse.total = data.total;
    if (typeof data.page === "number") apiResponse.page = data.page;
    if (typeof data.pages === "number") apiResponse.pages = data.pages;

    return apiResponse;
  } catch (err: any) {
    return {
      success: false,
      error: "Network or parsing error",
      data: null,
    };
  }
}
/**
 * Make authenticated fetch requests (client-side only)
 */
export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  // Prevent SSR fetch calls
  if (typeof window === 'undefined') {
    throw new Error('fetchWithAuth can only be called on the client side')
  }

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'

  // Builds and fires the request using whatever token is currently in storage
  const makeRequest = async (): Promise<Response> => {
    const token = getAuthToken()

    const headers: any = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    return fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    })
  }

  let response = await makeRequest()

  // --- 401 recovery: attempt a single token refresh, then retry ---
  if (response.status === 401) {
    try {
      const refreshToken = localStorage.getItem('refreshToken')

      const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: refreshToken ? JSON.stringify({ refreshToken }) : undefined,
      })

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json()

        if (refreshData.accessToken) {
          // Persist the new tokens
          localStorage.setItem('authToken', refreshData.accessToken)
          if (refreshData.refreshToken) {
            localStorage.setItem('refreshToken', refreshData.refreshToken)
          }

          // Retry the original request — makeRequest() will pick up the new token
          response = await makeRequest()
        }
      }
      // If refresh itself returned non-ok, fall through and return the original 401
    } catch {
      // Refresh request failed entirely — return the original 401 as-is
    }
  }

  return response
}

/**
 * Format date to readable string
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Format currency
 */
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}

/**
 * Generate random ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }
    
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof window === 'undefined') return false
  
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}