import { redirect } from 'next/navigation'
import AdminNav from '@/components/admin/AdminNav'
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
      <div className="min-h-screen bg-[#060606] text-white">
        <AdminNav isSuperAdmin={user.is_super_admin} displayName={user.display_name} />
        <main className="max-w-7xl mx-auto px-6 py-8">
          <ErrorBoundary context="admin">
            {children}
          </ErrorBoundary>
        </main>
      </div>
    </ThemeProvider>
  )
}
