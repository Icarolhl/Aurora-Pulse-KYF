import { useSession } from "next-auth/react"

const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(",") || []

export function useIsAdmin() {
  const { data: session, status } = useSession()
  const email = session?.user?.email

  const isAdmin = email ? adminEmails.includes(email) : false

  return { isAdmin, loading: status === "loading", session }
}

