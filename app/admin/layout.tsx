import { redirect } from 'next/navigation'
import Sidebar from '@/components/admin/Sidebar'
import ThemeProvider from '@/components/admin/ThemeProvider'
import ErrorBoundary from '@/components/ErrorBoundary'
import { getSessionUser, getUserPermissions } from '@/lib/auth'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser()
  if (!user) {
    redirect('/login')
  }

  // Per-creator permissions so the sidebar can gate the contextual sub-nav.
  let userPermissions: Record<string, string[]> | undefined
  if (!user.is_super_admin) {
    const { permissions, grantAllCreators, allCreatorsPermissions } = await getUserPermissions(user.id)
    const serialized: Record<string, string[]> = {}
    for (const [creatorId, perms] of Object.entries(permissions)) {
      serialized[creatorId] = Array.from(perms)
    }
    if (grantAllCreators) serialized['__all__'] = Array.from(allCreatorsPermissions)
    userPermissions = serialized
  }

  return (
    <ThemeProvider>
      {/* Keep min-h-screen + bg-* + text-white on the root so the existing
          [data-theme="light"] overrides in globals.css still repaint. */}
      <div className="flex min-h-screen bg-[#060606] text-white">
        <Sidebar isSuperAdmin={user.is_super_admin} displayName={user.display_name} userPermissions={userPermissions} />
        <div className="flex-1 min-w-0 h-screen overflow-y-auto">
          <main className="max-w-7xl mx-auto px-6 py-8">
            <ErrorBoundary context="admin">
              {children}
            </ErrorBoundary>
          </main>
        </div>
      </div>
    </ThemeProvider>
  )
}
