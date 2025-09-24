import GoogleProvider from 'next-auth/providers/google'
import DiscordProvider from 'next-auth/providers/discord'
import CredentialsProvider from 'next-auth/providers/credentials'
import { type NextAuthOptions } from 'next-auth'

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
            email: 'admin@furia.gg',
            role: 'admin',
          }
        }

        return null
      },
    }),
  ],

  callbacks: {
    async jwt({ token, account, profile, user }) {
      if (account?.provider === 'discord' && account.access_token) {
        try {
          const res = await fetch('https://discord.com/api/users/@me/guilds', {
            headers: {
              Authorization: `Bearer ${account.access_token}`,
            },
          })
          const guilds = await res.json()
          token.guilds = guilds.map((g: any) => g.name)
        } catch (err) {
          console.error('Erro ao buscar guilds do Discord:', err)
        }
      }

      if (user?.role === 'admin') {
        token.role = 'admin'
      }

      return token
    },

    async session({ session, token }) {
      if (token.guilds) {
        ;(session.user as any).guilds = token.guilds
      }

      const allowedAdmins = (process.env.ADMIN_EMAILS || '')
        .split(',')
        .map(email => email.trim().toLowerCase())

      session.user.isAdmin = allowedAdmins.includes(
        (session.user.email || '').toLowerCase()
      )

      return session
    },
  },
}
