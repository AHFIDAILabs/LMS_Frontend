'use client'

import Image from 'next/image'
import { getProfileImageUrl, getUserInitials, getAvatarGradient } from '@/lib/imageUtils'

interface AvatarProps {
  src?: string | null
  alt?: string
  firstName?: string
  lastName?: string
  userId?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  className?: string
  showOnlineStatus?: boolean
  isOnline?: boolean
}

const sizeMap = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl',
  '2xl': 'w-20 h-20 text-2xl',
}

const pixelSizeMap = {
  xs: '24px',
  sm: '32px',
  md: '40px',
  lg: '48px',
  xl: '64px',
  '2xl': '80px',
}

export function Avatar({
  src,
  alt,
  firstName,
  lastName,
  userId,
  size = 'md',
  className = '',
  showOnlineStatus = false,
  isOnline = false,
}: AvatarProps) {
  const imageUrl = getProfileImageUrl(src)
  const initials = getUserInitials(firstName, lastName)
  const gradient = getAvatarGradient(userId)
  const sizeClass = sizeMap[size]
  const pixelSize = pixelSizeMap[size]

  return (
    <div className={`relative ${sizeClass} ${className}`}>
      {imageUrl && imageUrl !== '/default-avatar.png' ? (
        <div className={`relative ${sizeClass} rounded-full overflow-hidden bg-slate-700`}>
          <Image
            src={imageUrl}
            alt={alt || `${firstName || 'User'}'s avatar`}
            fill
            className="object-cover"
            sizes={pixelSize}
          />
        </div>
      ) : (
        <div
          className={`${sizeClass} rounded-full bg-linear-to-br ${gradient} flex items-center justify-center text-white font-semibold`}
        >
          {initials}
        </div>
      )}
      
      {/* Online Status Indicator */}
      {showOnlineStatus && (
        <span
          className={`absolute bottom-0 right-0 block rounded-full ring-2 ring-slate-900 ${
            size === 'xs' || size === 'sm' ? 'w-2 h-2' : 'w-3 h-3'
          } ${isOnline ? 'bg-green-500' : 'bg-gray-500'}`}
        />
      )}
    </div>
  )
}