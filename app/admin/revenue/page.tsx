import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import RevenueClient from '@/components/admin/RevenueClient'

export default function RevenuePage() {
  const cookieStore = cookies()
  const isAdmin = cookieStore.get('admin_auth')?.value === 'true'

  if (!isAdmin) {
    redirect('/login')
  }

  return <RevenueClient />
}
