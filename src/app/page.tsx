'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'

export default function LandingPage() {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col items-center justify-center
                 text-center px-4 text-white"
      style={{
        backgroundColor: '#0f0f0f',
        backgroundImage: `radial-gradient(
          circle at 20% 30%, rgba(139, 92, 246, 0.15) 0%, transparent 40%
        ),
        radial-gradient(
          circle at 80% 70%, rgba(236, 72, 153, 0.12) 0%, transparent 40%
        )`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover'
      }}
    >
      <div className="mb-10">
        <Image
          src="/avatar-furia.png"
          alt="Logo FURIA"
          width={128}
          height={128}
          className="rounded-full shadow-lg transition-transform duration-300
                     hover:scale-105"
          priority
        />
      </div>

      <h1 className="text-5xl sm:text-6xl font-extrabold mb-6">
        Know Your Fan
      </h1>

      <p className="text-zinc-300 max-w-xl text-lg leading-relaxed mb-8">
        Plataforma oficial da FURIA para entender fãs por meio de inteligência
        artificial, OCR e autenticação social.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <motion.a
          href="/connect"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className="inline-block bg-gradient-to-r from-fuchsia-600 to-pink-600
                     hover:from-fuchsia-500 hover:to-pink-500 px-8 py-4
                     rounded-full text-base font-semibold tracking-wide
                     shadow-md ring-1 ring-fuchsia-800 transition-all"
        >
          Entrar com rede social
        </motion.a>

        <motion.a
          href="https://github.com/Icarolhl/Furia-KYF"
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className="inline-block bg-zinc-800 hover:bg-zinc-700
                     px-8 py-4 rounded-full text-base font-semibold
                     tracking-wide shadow-md ring-1 ring-zinc-600
                     transition-all"
        >
          Ver no GitHub
        </motion.a>
      </div>
    </motion.main>
  )
}
