'use client'

import { useAuthGuard }
from '@/hooks/useAuthGuard'

export default function DashboardLayout({
  children,
}:{
  children: React.ReactNode
}) {

  useAuthGuard()

  return <>{children}</>
}