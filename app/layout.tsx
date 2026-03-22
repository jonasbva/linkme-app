import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'LinkMe',
  description: 'Your links, your way.',
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
