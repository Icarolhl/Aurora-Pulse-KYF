import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { isAdminEmail } from '@/lib/admin-emails'

type AdminSessionResult =
  | { session: Awaited<ReturnType<typeof getServerSession>> }
  | { response: NextResponse }

export async function requireAdminSession(): Promise<AdminSessionResult> {
  const session = await getServerSession(authOptions)
  const email = session?.user?.email

  if (!session || !email) {
    return {
      response: NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      ),
    }
  }

  if (!isAdminEmail(email)) {
    return {
      response: NextResponse.json(
        { error: 'Não autorizado' },
        { status: 403 }
      ),
    }
  }

  return { session }
}
