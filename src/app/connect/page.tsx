'use client'

import {
  useSession,
  signIn,
  signOut
} from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { FcGoogle } from 'react-icons/fc'
import { SiDiscord } from 'react-icons/si'

const ADMIN_EMAILS =
  process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',') || []

export default function ConnectPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const isAdmin =
    session?.user?.email &&
    ADMIN_EMAILS.includes(session.user.email)

  if (status === 'loading') return null

  if (status === 'authenticated') {
    return (
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="min-h-screen flex items-center justify-center
                   px-4 bg-zinc-950 text-white"
        style={{
          backgroundImage: `radial-gradient(
            circle at 30% 30%, rgba(139, 92, 246, 0.15), transparent 40%
          ), radial-gradient(
            circle at 70% 70%, rgba(236, 72, 153, 0.12), transparent 40%
          )`,
          backgroundSize: 'cover'
        }}
      >
        <div
          className="w-full max-w-md p-8 rounded-2xl shadow-xl
                     backdrop-blur-md bg-white/5 border border-white/10
                     flex flex-col items-center text-center space-y-6"
        >
          {session.user?.image && (
            <Image
              src={session.user.image}
              alt="Avatar"
              width={80}
              height={80}
              className="rounded-full border"
            />
          )}

          <h2 className="text-xl font-semibold">
            Você está conectado como {session.user?.name}
          </h2>

          <div className="flex flex-col gap-4 w-full">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push('/register')}
              className="py-3 px-6 bg-gradient-to-r from-fuchsia-600 to-pink-600
                         text-white font-semibold rounded-full shadow
                         hover:brightness-110 transition-all"
            >
              Registro
            </motion.button>

            {isAdmin && (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => router.push('/admin')}
                className="py-3 px-6 bg-white text-black font-semibold rounded-full
                           shadow hover:bg-gray-100 transition-all"
              >
                Dashboard Admin
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => signOut({ callbackUrl: '/' })}
              className="py-3 px-6 border border-gray-400 text-gray-300
                         rounded-full hover:bg-zinc-800 font-medium transition-all"
            >
              Sair
            </motion.button>
          </div>
        </div>
      </motion.main>
    )
  }

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen flex items-center justify-center
                 px-4 bg-zinc-950 text-white"
      style={{
        backgroundImage: `radial-gradient(
          circle at 30% 30%, rgba(139, 92, 246, 0.15), transparent 40%
        ), radial-gradient(
          circle at 70% 70%, rgba(236, 72, 153, 0.12), transparent 40%
        )`,
        backgroundSize: 'cover'
      }}
    >
      <div
        className="w-full max-w-md p-8 rounded-2xl shadow-xl
                   backdrop-blur-md bg-white/5 border border-white/10
                   flex flex-col items-center text-center space-y-6"
      >
        <h1 className="text-2xl font-bold">
          Conectar com sua conta
        </h1>

        <p className="text-zinc-400 text-sm">
          Use sua conta Google ou Discord para continuar.
        </p>

        <div className="flex flex-col w-full gap-4 pt-2">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => signIn('google')}
            className="w-full flex items-center justify-center gap-3
                       bg-white text-black font-semibold px-6 py-3
                       rounded-full shadow hover:bg-zinc-100 transition-all"
          >
            <FcGoogle size={20} />
            Entrar com Google
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => signIn('discord')}
            className="w-full flex items-center justify-center gap-3
                       bg-indigo-600 text-white font-semibold px-6 py-3
                       rounded-full shadow hover:bg-indigo-500 transition-all"
          >
            <SiDiscord size={18} />
            Entrar com Discord
          </motion.button>
        </div>
      </div>
    </motion.main>
  )
}
