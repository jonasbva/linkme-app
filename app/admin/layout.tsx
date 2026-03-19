import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AdminNav from '@/components/admin/AdminNav'

// Simple password protection — check cookie
function isAuthenticated() {
  const cookieStore = cookies()
  return cookieStore.get('admin_auth')?.value === 'true'
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!isAuthenticated()) {
    // Redirect to login page (lives outside /admin/ to avoid layout loop)
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <AdminNav />
      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  )
}
