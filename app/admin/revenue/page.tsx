import { redirect } from 'next/navigation'
import RevenueClient from '@/components/admin/RevenueClient'
import { getSessionUser } from '@/lib/auth'

export default async function RevenuePage() {
  const user = await getSessionUser()
  if (!user) {
    redirect('/login')
  }

  return <RevenueClient isSuperAdmin={user.is_super_admin} />
}
