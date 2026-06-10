import { redirect } from 'next/navigation'
import Sidebar from '@/components/admin/Sidebar'
import ThemeProvider from '@/components/admin/ThemeProvider'
import ErrorBoundary from '@/components/ErrorBoundary'
import { getSessionUser } from '@/lib/auth'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser()
  if (!user) {
    redirect('/login')
  }

  return (
    <ThemeProvider>
      {/* Keep min-h-screen + bg-* + text-white on the root so the existing
          [data-theme="light"] overrides in globals.css still repaint. */}
      <div className="flex min-h-screen bg-[#060606] text-white">
        <Sidebar isSuperAdmin={user.is_super_admin} displayName={user.display_name} />
        <div className="flex-1 min-w-0 h-screen overflow-y-auto">
          <main className="max-w-7xl mx-auto px-6 py-8">
            <ErrorBoundary context="admin">
              {children}
            </ErrorBoundary>
          </main>
        </div>
      </div>
    </ThemeProvider>
  )
}
