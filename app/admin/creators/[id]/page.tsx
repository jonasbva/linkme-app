import { redirect } from 'next/navigation'

interface Props {
  params: { id: string }
}

// The old /edit route was the LinkMe editor and is gone. Social Media is the
// creator's landing tab in the sidebar, so send bare creator links there.
export default function CreatorIndexPage({ params }: Props) {
  redirect(`/admin/creators/${params.id}/analysis`)
}
