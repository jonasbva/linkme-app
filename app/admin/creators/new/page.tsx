import Link from 'next/link'
import { getSessionUser } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase'
import NewCreatorClient from '@/components/admin/NewCreatorClient'

export default async function NewCreatorPage() {
  const user = await getSessionUser()
  if (!user?.is_super_admin) return <div><h1 className="text-xl font-semibold">Creator access required</h1><p className="mt-3">Please ask an administrator to add a creator.</p><Link className="mt-4 inline-block text-pink-500" href="/admin/creators">Back to creators</Link></div>
  const db = createServerSupabaseClient()
  const { data } = await db.from('infloww_creators_cache').select('infloww_id, name, user_name').order('name')
  return <NewCreatorClient inflowwCreators={data || []} />
}
