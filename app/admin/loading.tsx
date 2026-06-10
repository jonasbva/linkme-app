import { PageLoader } from '@/components/admin/ui'

// Shown instantly on navigation while the server component streams.
// Covers /admin and any child route without its own loading.tsx.
export default function Loading() {
  return <PageLoader />
}
