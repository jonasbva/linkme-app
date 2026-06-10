import DashboardClient from '@/components/admin/DashboardClient'
import { getSessionUser, getUserPermissions } from '@/lib/auth'
import { getOverviewData } from '@/lib/dashboard-data'

export default async function AdminDashboard() {
  const user = await getSessionUser()
  let visibleCreatorIds: string[] | undefined
  if (user && !user.is_super_admin) {
    const { visibleCreatorIds: ids, grantAllCreators } = await getUserPermissions(user.id)
    if (!grantAllCreators) visibleCreatorIds = ids
  }

  const data = await getOverviewData(visibleCreatorIds)
  return <DashboardClient {...data} displayName={user?.display_name} isSuperAdmin={user?.is_super_admin} />
}
