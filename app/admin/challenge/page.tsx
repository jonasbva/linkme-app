import { notFound } from 'next/navigation'
import { requireChallengeAccess } from '@/lib/challenge/access'
import ChallengeClient from '@/components/admin/challenge/ChallengeClient'

export const metadata = { title: 'November Challenge · MAHO' }
export default async function ChallengePage() {
  const gate = await requireChallengeAccess()
  if (!gate.ok) notFound()
  return <ChallengeClient />
}
