import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'

type Fan = {
  id: string
  nome: string
  email: string
  estado: string
  cidade: string
  created_at: string
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)
  const allowed = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',') || []
  const email = session?.user?.email

  if (!session || !email || !allowed.includes(email)) {
    redirect('/403')
  }

  const rawBaseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  const baseUrl = rawBaseUrl.replace(/\/admin\/?$/, '')

  const res = await fetch(`${baseUrl}/api/admin/fans`, {
    cache: 'no-store'
  })

  const json = await res.json()
  const fans: Fan[] = json.data || []

  return <DashboardClient fans={fans} />
}
