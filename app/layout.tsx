import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MAHO Tracking',
  description: 'Creator social, conversion and revenue tracking.',
  robots: { index: false, follow: false },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
