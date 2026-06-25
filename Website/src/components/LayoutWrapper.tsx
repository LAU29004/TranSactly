'use client'

import { usePathname } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const HIDDEN_LAYOUT_PREFIXES = ['/login', '/dashboard']

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const hideLayout = HIDDEN_LAYOUT_PREFIXES.some(
    prefix => pathname === prefix || pathname.startsWith(prefix + '/')
  )

  return (
    <>
      {!hideLayout && <Navbar />}
      {children}
      {!hideLayout && <Footer />}
    </>
  )
}