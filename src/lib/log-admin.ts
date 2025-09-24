import fs from 'fs'
import path from 'path'

const logPath = path.join(process.cwd(), 'logs/admin-access.log')

export function logAdminAccess(email: string, route: string) {
  const line = `${new Date().toISOString()} | ${email} | ${route}\n`
  fs.appendFile(logPath, line, (err) => {
    if (err) console.error('Erro ao registrar log de admin:', err)
  })
}
