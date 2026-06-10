import CreatorsClient from '@/components/admin/CreatorsClient'
import { getSessionUser, getUserPermissions } from '@/lib/auth'
import { getCreatorStats } from '@/lib/dashboard-data'

export default async function CreatorsPage() {
  const user = await getSessionUser()
  let visibleCreatorIds: string[] | undefined
  let userPermissions: Record<string, string[]> | undefined

  if (user && !user.is_super_admin) {
    const { visibleCreatorIds: ids, grantAllCreators, permissions, allCreatorsPermissions } = await getUserPermissions(user.id)
    if (!grantAllCreators) visibleCreatorIds = ids
    const serialized: Record<string, string[]> = {}
    for (const [creatorId, perms] of Object.entries(permissions)) {
      serialized[creatorId] = Array.from(perms)
    }
    if (grantAllCreators) serialized['__all__'] = Array.from(allCreatorsPermissions)
    userPermissions = serialized
  }

  const data = await getCreatorStats(visibleCreatorIds)
  return <CreatorsClient {...data} isSuperAdmin={user?.is_super_admin} userPermissions={userPermissions} />
}
