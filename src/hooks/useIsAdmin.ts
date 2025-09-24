import { useSession } from "next-auth/react"

type SessionUser = {
  isAdmin?: boolean
}

export function useIsAdmin() {
  const { data: session, status } = useSession()
  const user = session?.user as SessionUser | undefined
  const isAdmin = Boolean(user?.isAdmin)

  return { isAdmin, loading: status === "loading", session }
}
