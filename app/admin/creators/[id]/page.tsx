import { redirect } from 'next/navigation'

interface Props {
  params: { id: string }
}

export default function CreatorIndexPage({ params }: Props) {
  // /admin/creators/new still goes through edit page
  redirect(`/admin/creators/${params.id}/edit`)
}
