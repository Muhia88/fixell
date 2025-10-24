import React from 'react'
import { User } from 'lucide-react'

// Simple reusable profile icon. Shows initials when provided, otherwise a user icon.
export default function ProfileIcon({ initials = '', size = 48, className = '', onClick, ariaLabel = 'Profile' }) {
  const px = typeof size === 'number' ? `${size}px` : size
  const Wrapper = onClick ? 'button' : 'div'
  const commonProps = onClick ? { onClick, 'aria-label': ariaLabel } : {}

  return (
    <Wrapper
      {...commonProps}
      className={`inline-flex items-center justify-center rounded-full bg-green-100 text-green-700 border-2 border-white shadow ${className}`}
      style={{ width: px, height: px }}
    >
      {initials ? (
        <span className="font-extrabold text-xl select-none">{initials}</span>
      ) : (
        <User size={Math.max(16, Math.floor(parseInt(px, 10) / 3))} />
      )}
    </Wrapper>
  )
}
