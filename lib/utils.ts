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
    let data;
    
    // Check if the response is actually JSON before parsing
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      return {
        success: false,
        error: data?.error || data?.message || `Error ${response.status}`,
        data: null as any
      };
    }

    // If the backend sends { success: true, data: [...] }
    return data; 
  } catch (error: any) {
    return {
      success: false,
      error: "Network or Parsing error",
      data: null as any
    };
  }
}
/**
 * Make authenticated fetch requests (client-side only)
 */
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  // Prevent SSR fetch calls
  if (typeof window === 'undefined') {
    throw new Error('fetchWithAuth can only be called on the client side')
  }

  const token = getAuthToken()

  const headers: any = {
    'Content-Type': 'application/json',
    ...options.headers,
  }
  
  // Add auth token if available (optional)
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  
  try {
    const response = await fetch(url, { 
      ...options, 
      headers, 
      credentials: 'include',
    })
    return response
  } catch (error) {
    console.error('Fetch error:', error)
    throw error
  }
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