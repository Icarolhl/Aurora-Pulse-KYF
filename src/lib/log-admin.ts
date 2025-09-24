import { promises as fs } from 'fs'
import path from 'path'
import os from 'os'

const logDir = path.join(os.tmpdir(), 'aurora-pulse-logs')
const logPath = path.join(logDir, 'admin-access.log')

export async function logAdminAccess(email: string, route: string) {
  const line = `${new Date().toISOString()} | ${email} | ${route}\n`

  try {
    await fs.mkdir(logDir, { recursive: true })
    await fs.appendFile(logPath, line, { encoding: 'utf-8' })
  } catch (err) {
    console.error('Erro ao registrar log de admin:', err)
  }
}
