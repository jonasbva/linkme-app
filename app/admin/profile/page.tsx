import { redirect } from 'next/navigation'
import ProfileClient from '@/components/admin/ProfileClient'
import { getSessionUser } from '@/lib/auth'

export default async function ProfilePage() {
  const user = await getSessionUser()
  if (!user) redirect('/login')
  return <ProfileClient email={user.email} displayName={user.display_name} isSuperAdmin={user.is_super_admin} />
}
