import RolesClient from '@/components/admin/RolesClient'
import { getSessionUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function RolesPage() {
  const user = await getSessionUser()
  if (!user || !user.is_super_admin) redirect('/admin')
  return <RolesClient />
}
