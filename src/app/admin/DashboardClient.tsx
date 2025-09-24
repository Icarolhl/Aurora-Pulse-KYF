'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Home as HomeIcon, ArrowRight } from 'lucide-react'

export type Fan = {
  id: string
  nome: string
  email: string
  estado: string
  cidade: string
  created_at: string
}

interface DashboardClientProps {
  fans: Fan[]
}

export default function DashboardClient({
  fans
}: DashboardClientProps) {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen flex flex-col items-center justify-center px-4
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
      <div className="w-full max-w-4xl p-8 rounded-2xl shadow-xl backdrop-blur-md
        bg-white/5 border border-white/10 space-y-6"
      >
        <Link
          href="/"
          className="inline-flex items-center text-white/60 hover:text-white
            transition-colors"
        >
          <HomeIcon size={20} />
          <span>Home</span>
        </Link>
        <h1 className="text-3xl font-bold text-center">
          Dashboard Admin
        </h1>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-white/10">
                <th
                  className="p-2 border border-white/10 text-left"
                >Nome</th>
                <th
                  className="p-2 border border-white/10 text-left"
                >Email</th>
                <th
                  className="p-2 border border-white/10 text-left"
                >Estado</th>
                <th
                  className="p-2 border border-white/10 text-left"
                >Cidade</th>
                <th
                  className="p-2 border border-white/10 text-left"
                >Ações</th>
              </tr>
            </thead>
            <tbody>
              {fans.map(fan => (
                <tr
                  key={fan.id}
                  className="hover:bg-white/5 cursor-pointer"
                >
                  <td className="p-2 border border-white/10">
                    {fan.nome}
                  </td>
                  <td className="p-2 border border-white/10">
                    {fan.email}
                  </td>
                  <td className="p-2 border border-white/10">
                    {fan.estado}
                  </td>
                  <td className="p-2 border border-white/10">
                    {fan.cidade}
                  </td>
                  <td className="p-2 border border-white/10">
                    <Link
                      href={`/admin/fan/${fan.id}`}
                      className="inline-flex items-center space-x-1
                        text-fuchsia-400 hover:text-fuchsia-300
                        hover:underline transition-colors"
                    >
                      <span>Ver perfil</span>
                      <ArrowRight size={16} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.main>
  )
}
