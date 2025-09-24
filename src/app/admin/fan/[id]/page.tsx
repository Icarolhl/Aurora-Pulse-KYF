'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useIsAdmin } from '@/hooks/useIsAdmin'
import FanLinkAnalyzer from '@/features/admin/components/FanLinkAnalyzer'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

interface Fan {
  id: string
  nome: string
  email: string
  cpf: string
  estado: string
  cidade: string
  endereco: string
  interesses: string[]
  atividades: string[]
  eventos_participados: string[]
  compras_relacionadas: string[]
  guilds_discord: string[]
  created_at: string
}

export default function FanDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { isAdmin, loading: authLoading } = useIsAdmin()

  const [fan, setFan] = useState<Fan | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authLoading && !isAdmin) router.replace('/403')
  }, [authLoading, isAdmin, router])

  useEffect(() => {
    if (typeof id !== 'string') return
    const fetchFan = async () => {
      try {
        const res = await fetch(
          `/api/admin/fan/${id}`,
          { cache: 'no-store' }
        )
        const json = await res.json()
        if (!res.ok) throw new Error(json.error)
        setFan(json.data)
      } catch {
        setError('Erro ao carregar dados do fã')
      } finally {
        setLoading(false)
      }
    }
    fetchFan()
  }, [id])

  // loading invisível
  if (authLoading || loading) return null

  if (error || !fan) {
    return (
      <p className="text-center text-red-500">
        {error || 'Fã não encontrado'}
      </p>
    )
  }

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen flex items-start justify-center px-4 py-8
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
      <div className="w-full max-w-3xl space-y-6">
        {/* Botão voltar para Dashboard */}
        <Link
          href="/admin"
          className="inline-flex items-center text-white/60 hover:text-white
           transition-colors"
        >
          <ChevronLeft size={20} />
          <span>Voltar ao Dashboard</span>
        </Link>

        <div className="bg-white/5 backdrop-blur-md border border-white/10
           rounded-2xl shadow-lg p-6">
          <h1 className="text-3xl font-bold mb-2">
            Perfil de {fan.nome}
          </h1>
          <p className="text-sm text-white/60">
            Registrado em:{' '}
            {new Date(fan.created_at).toLocaleString('pt-BR')}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <p className="font-medium">Email</p>
              <p className="text-white/80 break-all">{fan.email}</p>
            </div>
            <div>
              <p className="font-medium">CPF</p>
              <p className="text-white/80">{fan.cpf}</p>
            </div>
            <div>
              <p className="font-medium">Estado</p>
              <p className="text-white/80">{fan.estado}</p>
            </div>
            <div>
              <p className="font-medium">Cidade</p>
              <p className="text-white/80">{fan.cidade}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="font-medium">Endereço</p>
              <p className="text-white/80 break-all">{fan.endereco}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {[
            { title: 'Interesses', items: fan.interesses },
            { title: 'Atividades', items: fan.atividades },
            { title: 'Eventos', items: fan.eventos_participados },
            { title: 'Compras', items: fan.compras_relacionadas },
            { title: 'Servidores Discord', items: fan.guilds_discord }
          ].map((section, idx) => (
            <details
              key={idx}
              className="bg-white/5 border border-white/10 rounded-lg p-4"
            >
              <summary className="cursor-pointer font-medium text-lg">
                {section.title} ({section.items.length})
              </summary>
              {section.items.length ? (
                <ul className="list-disc pl-5 mt-2 space-y-1 text-white/80">
                  {section.items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-white/60">
                  Nenhum {section.title.toLowerCase()}
                </p>
              )}
            </details>
          ))}
        </div>

        <FanLinkAnalyzer fan={fan} />
      </div>
    </motion.main>
  )
}
