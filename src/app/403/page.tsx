'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Lock } from 'lucide-react'

export default function AccessDenied() {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen flex items-center justify-center px-4 
        bg-zinc-950 text-white"
      style={{
        backgroundImage: `radial-gradient(
          circle at 30% 30%, rgba(139,92,246,0.15), transparent 40%
        ), radial-gradient(
          circle at 70% 70%, rgba(236,72,153,0.12), transparent 40%
        )`,
        backgroundSize: 'cover'
      }}
    >
      <div className="max-w-md text-center space-y-6">
        <div className="flex justify-center">
          <Lock size={48} className="text-fuchsia-400" />
        </div>
        <h1 className="text-4xl font-bold">
          403 – Acesso Negado
        </h1>
        <p className="text-white/70">
          Você não tem permissão para acessar esta página.
        </p>
        <Link
          href="/"
          className="inline-block px-4 py-2 border border-fuchsia-500 
            text-fuchsia-300 hover:bg-fuchsia-600 hover:text-white 
            transition rounded-lg"
        >
          Voltar para a Home
        </Link>
      </div>
    </motion.main>
  )
}
