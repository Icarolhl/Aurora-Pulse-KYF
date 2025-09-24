import GoogleProvider from 'next-auth/providers/google'
import DiscordProvider from 'next-auth/providers/discord'
import CredentialsProvider from 'next-auth/providers/credentials'
import { type NextAuthOptions, type Session } from 'next-auth'
import type { JWT } from 'next-auth/jwt'
import { isAdminEmail } from '@/lib/admin-emails'

type DiscordGuildApi = {
  id: string
  name: string
  icon: string | null
}

const isDiscordGuild = (value: unknown): value is DiscordGuildApi => {
  if (!value || typeof value !== 'object') return false
  const candidate = value as {
    id?: unknown
    name?: unknown
    icon?: unknown
  }

  return (
    typeof candidate.id === 'string' &&
    typeof candidate.name === 'string' &&
    (candidate.icon === null || typeof candidate.icon === 'string')
  )
}

export type GuildSummary = Pick<DiscordGuildApi, 'id' | 'name' | 'icon'>

type TokenWithExtras = JWT & {
  guilds?: GuildSummary[]
  role?: string
}

type SessionWithExtras = Session & {
  user: (Session['user'] & {
    guilds?: GuildSummary[]
    isAdmin?: boolean
  }) | undefined
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: 'https://discord.com/api/oauth2/authorize?scope=identify email guilds',
    }),
    CredentialsProvider({
      name: 'Admin Login',
      credentials: {
        username: { label: 'Usuário', type: 'text' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        const username = credentials?.username
        const password = credentials?.password

        if (
          username === process.env.ADMIN_USER &&
          password === process.env.ADMIN_PASS
        ) {
          return {
            id: 'admin',
            name: 'Administrador',
            email: 'admin@aurorapulse.gg',
            role: 'admin',
          }
        }

        return null
      },
    }),
  ],

  callbacks: {
    async jwt({ token, account, user }) {
      const tokenWithExtras = token as TokenWithExtras

      if (account?.provider === 'discord' && account.access_token) {
        try {
          const res = await fetch('https://discord.com/api/users/@me/guilds', {
            headers: {
              Authorization: `Bearer ${account.access_token}`,
            },
          })
          const rawGuilds = await res.json()
          const guildSummaries: GuildSummary[] = Array.isArray(rawGuilds)
            ? rawGuilds
                .filter(isDiscordGuild)
                .map(({ id, name, icon }) => ({ id, name, icon }))
            : []

          tokenWithExtras.guilds = guildSummaries
        } catch (err) {
          console.error('Erro ao buscar guilds do Discord:', err)
        }
      }

      if ((user as { role?: string } | undefined)?.role === 'admin') {
        tokenWithExtras.role = 'admin'
      }

      return tokenWithExtras
    },

    async session({ session, token }) {
      const sessionWithExtras = session as SessionWithExtras
      const tokenWithExtras = token as TokenWithExtras

      if (sessionWithExtras.user && tokenWithExtras.guilds) {
        sessionWithExtras.user.guilds = tokenWithExtras.guilds
      }

      if (sessionWithExtras.user) {
        sessionWithExtras.user.isAdmin = isAdminEmail(sessionWithExtras.user.email)
      }

      return sessionWithExtras
    },
  },
}
