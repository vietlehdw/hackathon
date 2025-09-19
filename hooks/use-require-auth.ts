"use client"

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from './use-auth'

export function useRequireAuth() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && !user) {
      const params = new URLSearchParams()
      if (pathname) params.set('next', pathname)
      router.replace(`/login?${params.toString()}`)
    }
  }, [loading, user, router, pathname])

  return { user, loading }
}
