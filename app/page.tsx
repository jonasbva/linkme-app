import { redirect } from 'next/navigation'

// The root page redirects to admin.
// When a creator's custom domain hits this app,
// middleware.ts intercepts and rewrites to /[slug] before reaching here.
export default function Home() {
  redirect('/admin')
}
