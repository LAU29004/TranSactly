import type { Metadata } from 'next'
import './globals.css'
import LayoutWrapper from '../components/LayoutWrapper'

export const metadata: Metadata = {
  title: 'Finorio — Manage Your Money with Confidence',
  description: 'Track spending, monitor your balance, request payments, and send money effortlessly.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  )
}