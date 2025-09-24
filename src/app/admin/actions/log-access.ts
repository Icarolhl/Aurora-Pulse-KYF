'use server'

import { logAdminAccess } from '@/lib/log-admin'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function logAdminVisit(route: string) {
  const session = await getServerSession(authOptions)
  const email = session?.user?.email
  if (email) {
    logAdminAccess(email, route)
  }
}
