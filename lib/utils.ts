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
        data: null as any,
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
      data: null as any,
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


// utils/extractError.ts

/**
 * Extracts a user-friendly error message from various error formats
 * @param err - The error object (can be from Axios, Mongoose, or generic Error)
 * @returns A formatted error message string
 */
export const extractError = (err: any): string => {
  // Check for Axios response error
  const data = err?.response?.data

  if (!data) {
    // Fallback to error message or generic message
    return err?.message || 'Request failed'
  }

  // Priority 1: Check for 'error' field (common in API responses)
  if (data.error) {
    return typeof data.error === 'string' ? data.error : JSON.stringify(data.error)
  }

  // Priority 2: Check for 'message' field
  if (data.message) {
    return typeof data.message === 'string' ? data.message : JSON.stringify(data.message)
  }

  // Priority 3: Check for validation errors array (Express Validator format)
  if (data.errors) {
    // Handle array of error objects: [{ msg: '...' }, ...]
    if (Array.isArray(data.errors) && data.errors.length > 0) {
      const firstError = data.errors[0]
      
      if (firstError?.msg) {
        return firstError.msg
      }
      
      if (typeof firstError === 'string') {
        return firstError
      }
    }

    // Handle object of errors: { field: ['error1', 'error2'], ... }
    if (typeof data.errors === 'object' && !Array.isArray(data.errors)) {
      const firstKey = Object.keys(data.errors)[0]
      const firstValue = data.errors[firstKey]

      if (Array.isArray(firstValue) && firstValue.length > 0) {
        return firstValue[0] as string
      }

      if (typeof firstValue === 'string') {
        return firstValue
      }
    }

    // Handle string error
    if (typeof data.errors === 'string') {
      return data.errors
    }
  }

  // Priority 4: Check for Mongoose validation errors
  if (err?.name === 'ValidationError' && err?.errors) {
    const firstField = Object.keys(err.errors)[0]
    return err.errors[firstField]?.message || 'Validation failed'
  }

  // Priority 5: Check for specific error types
  if (err?.name === 'MongoServerError' && err?.code === 11000) {
    // Duplicate key error
    const field = Object.keys(err.keyValue || {})[0] || 'field'
    return `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`
  }

  if (err?.name === 'CastError') {
    return 'Invalid ID format'
  }

  if (err?.name === 'JsonWebTokenError') {
    return 'Invalid token'
  }

  if (err?.name === 'TokenExpiredError') {
    return 'Token expired'
  }

  // Priority 6: HTTP status text
  if (err?.response?.statusText) {
    return err.response.statusText
  }

  // Fallback
  return 'Something went wrong'
}

/**
 * Extracts HTTP status code from error
 * @param err - The error object
 * @returns HTTP status code or 500
 */
export const extractStatusCode = (err: any): number => {
  return err?.response?.status || err?.statusCode || 500
}

/**
 * Checks if error is a specific HTTP status code
 * @param err - The error object
 * @param statusCode - The status code to check
 * @returns boolean
 */
export const isStatusCode = (err: any, statusCode: number): boolean => {
  return extractStatusCode(err) === statusCode
}

/**
 * Checks if error is an authentication error (401)
 * @param err - The error object
 * @returns boolean
 */
export const isAuthError = (err: any): boolean => {
  return isStatusCode(err, 401)
}

/**
 * Checks if error is a forbidden error (403)
 * @param err - The error object
 * @returns boolean
 */
export const isForbiddenError = (err: any): boolean => {
  return isStatusCode(err, 403)
}

/**
 * Checks if error is a not found error (404)
 * @param err - The error object
 * @returns boolean
 */
export const isNotFoundError = (err: any): boolean => {
  return isStatusCode(err, 404)
}

/**
 * Checks if error is a validation error (400 or 422)
 * @param err - The error object
 * @returns boolean
 */
export const isValidationError = (err: any): boolean => {
  const status = extractStatusCode(err)
  return status === 400 || status === 422
}

/**
 * Checks if error is a rate limit error (429)
 * @param err - The error object
 * @returns boolean
 */
export const isRateLimitError = (err: any): boolean => {
  return isStatusCode(err, 429)
}

/**
 * Formats error for display in UI
 * @param err - The error object
 * @returns Object with title and message
 */
export const formatErrorForUI = (err: any): { title: string; message: string } => {
  const statusCode = extractStatusCode(err)
  const message = extractError(err)

  let title = 'Error'

  switch (statusCode) {
    case 400:
      title = 'Bad Request'
      break
    case 401:
      title = 'Authentication Required'
      break
    case 403:
      title = 'Access Denied'
      break
    case 404:
      title = 'Not Found'
      break
    case 422:
      title = 'Validation Error'
      break
    case 429:
      title = 'Too Many Requests'
      break
    case 500:
      title = 'Server Error'
      break
    default:
      title = 'Error'
  }

  return { title, message }
}