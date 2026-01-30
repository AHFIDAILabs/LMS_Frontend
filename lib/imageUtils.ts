// lib/imageUtils.ts

/**
 * Get proper profile image URL for Next.js Image component
 * Handles various image URL formats from backend
 */
export function getProfileImageUrl(imageUrl?: string | null): string {
  // Default avatar if no image provided
  if (!imageUrl || imageUrl === 'default-avatar.png') {
    return '/default-avatar.png'
  }
  
  // If it's already an absolute URL (Cloudinary, S3, etc.)
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl
  }
  
  // If it starts with a slash, it's already a proper local path
  if (imageUrl.startsWith('/')) {
    return imageUrl
  }
  
  // Otherwise, add the leading slash for local images
  return `/${imageUrl}`
}

/**
 * Get course thumbnail URL
 */
export function getCourseImageUrl(imageUrl?: string | null): string {
  if (!imageUrl) {
    return '/default-course-thumbnail.png'
  }
  
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl
  }
  
  if (imageUrl.startsWith('/')) {
    return imageUrl
  }
  
  return `/${imageUrl}`
}

/**
 * Get user initials for avatar fallback
 */
export function getUserInitials(firstName?: string, lastName?: string): string {
  const first = firstName?.charAt(0)?.toUpperCase() || ''
  const last = lastName?.charAt(0)?.toUpperCase() || ''
  return `${first}${last}` || 'U'
}

/**
 * Get random gradient color for avatar background
 */
export function getAvatarGradient(userId?: string): string {
  const gradients = [
    'from-blue-500 to-cyan-500',
    'from-purple-500 to-pink-500',
    'from-green-500 to-emerald-500',
    'from-orange-500 to-red-500',
    'from-yellow-500 to-orange-500',
    'from-indigo-500 to-purple-500',
    'from-lime-500 to-green-500',
    'from-teal-500 to-cyan-500',
  ]
  
  if (!userId) return gradients[0]
  
  // Use userId to consistently select the same gradient
  const index = userId.charCodeAt(0) % gradients.length
  return gradients[index]
}