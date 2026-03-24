import TeamClient from '@/components/admin/TeamClient'
import { getSessionUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function TeamPage() {
  const user = await getSessionUser()
  if (!user || !user.is_super_admin) redirect('/admin')
  return <TeamClient />
}
