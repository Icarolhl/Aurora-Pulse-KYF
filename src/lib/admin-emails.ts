const rawAdminEnv =
  process.env.ADMIN_EMAILS ?? process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? ''

const adminEmails = rawAdminEnv
  .split(',')
  .map(email => email.trim().toLowerCase())
  .filter(Boolean)

const adminEmailSet = new Set(adminEmails)

export const isAdminEmail = (email?: string | null) => {
  if (!email) return false
  return adminEmailSet.has(email.trim().toLowerCase())
}

export const listAdminEmails = () => Array.from(adminEmailSet)
