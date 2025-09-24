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
  const isAdmin = Boolean((session?.user as { isAdmin?: boolean } | undefined)?.isAdmin)

  if (!session || !isAdmin) {
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
