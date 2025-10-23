import React from 'react'

export default function Spinner({ size = 48, className = '' }) {
  const s = typeof size === 'number' ? `${size}px` : size;
  return (
    <div className={`flex items-center justify-center ${className}`} aria-busy="true">
      <svg width={s} height={s} viewBox="0 0 50 50" className="animate-spin">
        <circle cx="25" cy="25" r="20" fill="none" strokeWidth="5" stroke="#e5e7eb" />
        <path d="M45 25a20 20 0 0 1-20 20" fill="none" strokeWidth="5" stroke="#10b981" strokeLinecap="round" />
      </svg>
    </div>
  );
}
