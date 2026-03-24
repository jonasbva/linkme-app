import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AdminNav from '@/components/admin/AdminNav'
import ThemeProvider from '@/components/admin/ThemeProvider'
import ErrorBoundary from '@/components/ErrorBoundary'

function isAuthenticated() {
  const cookieStore = cookies()
  return cookieStore.get('admin_auth')?.value === 'true'
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!isAuthenticated()) {
    redirect('/login')
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-[#060606] text-white">
        <AdminNav />
        <main className="max-w-7xl mx-auto px-6 py-10">
          <ErrorBoundary context="admin">
            {children}
          </ErrorBoundary>
        </main>
      </div>
    </ThemeProvider>
  )
}
