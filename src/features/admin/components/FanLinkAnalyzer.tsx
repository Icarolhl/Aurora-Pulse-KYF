'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Activity,
  CheckCircle,
  AlertTriangle,
  XCircle
} from 'lucide-react'

type Props = {
  fan: { id: string; nome: string }
}

type AnalyzeResponse = {
  relevance: number
  warning?: string
  error?: string
}

export default function FanLinkAnalyzer({ fan }: Props) {
  const [url, setUrl] = useState<string>('')
  const [score, setScore] = useState<number | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [warning, setWarning] = useState<string>('')

  const analyze = async () => {
    setLoading(true)
    setError('')
    setScore(null)
    setWarning('')

    try {
      const res = await fetch('/api/link/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fanId: fan.id, url })
      })
      const data: AnalyzeResponse = await res.json()
      if (!res.ok) {
        throw new Error(data.error ?? 'Erro ao analisar link')
      }
      setScore(data.relevance)
      if (data.warning) setWarning(data.warning)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg p-6 space-y-4"
    >
      <h2 className="text-xl font-semibold text-white">
        Relevância de link para {fan.nome}
      </h2>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <input
          type="url"
          placeholder="https://exemplo.com"
          value={url}
          onChange={e => setUrl(e.target.value)}
          className="flex-1 bg-zinc-900 text-white border border-zinc-700 px-4 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
        />
        <button
          onClick={analyze}
          disabled={!url || loading}
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-fuchsia-600 to-pink-600 px-5 py-2 rounded-full font-semibold shadow hover:brightness-110 transition-all disabled:opacity-50"
        >
          {loading ? <Activity className="animate-spin" /> : <CheckCircle />}
          <span>{loading ? 'Analisando...' : 'Analisar'}</span>
        </button>
      </div>

      {score !== null && (
        <div className="flex items-center space-x-2 text-green-400">
          <CheckCircle />
          <motion.span initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="font-medium">
            Relevância estimada: {score}%
          </motion.span>
        </div>
      )}

      {warning && (
        <div className="flex items-center space-x-2 text-yellow-400">
          <AlertTriangle />
          <span className="text-sm font-medium">{warning}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center space-x-2 text-red-400">
          <XCircle />
          <span className="text-sm">{error}</span>
        </div>
      )}
    </motion.section>
  )
}
