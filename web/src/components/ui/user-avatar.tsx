"use client"

import Image from "next/image"
import { useState } from "react"

type UserAvatarProps = {
  avatarUrl?: string | null
  name?: string | null
  size?: number
  className?: string
}

function initials(name?: string | null) {
  if (!name) return "?"
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function UserAvatar({ avatarUrl, name, size = 20, className = "" }: UserAvatarProps) {
  const [error, setError] = useState(false)
  if (avatarUrl && !error) {
    return (
      <Image
        src={avatarUrl}
        alt=""
        width={size}
        height={size}
        className={`rounded-full object-cover ${className}`}
        style={{ width: size, height: size }}
        onError={() => setError(true)}
      />
    )
  }
  return (
    <span
      aria-hidden="true"
      className={`inline-flex items-center justify-center rounded-full bg-slate-200 text-slate-700 font-semibold ${className}`}
      style={{ width: size, height: size, fontSize: Math.max(10, Math.round(size * 0.42)) }}
    >
      {initials(name)}
    </span>
  )
}
