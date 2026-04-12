import { getSessionUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import SocialAccountsClient from '@/components/admin/SocialAccountsClient'

export default async function SocialAccountsPage() {
  const user = await getSessionUser()
  if (!user || !user.is_super_admin) redirect('/admin')
  return <SocialAccountsClient />
}
