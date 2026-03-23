import { createServerSupabaseClient } from '@/lib/supabase'
import DomainsManager from '@/components/admin/DomainsManager'

export default async function DomainsPage() {
  const supabase = createServerSupabaseClient()
  const { data: creators } = await supabase
    .from('creators')
    .select('id, display_name, slug, custom_domain')
    .order('display_name')

  return <DomainsManager initialCreators={creators || []} />
}
