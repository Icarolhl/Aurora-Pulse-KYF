'use client'

import { useEffect } from "react"
import { motion } from "framer-motion"

type Props = {
  show: boolean
  onClose?: () => void
  status?: 'success' | 'error'
  message: string
  description?: string
  icon?: string
  duration?: number // default: 3000ms
}

export default function StatusPopup({
  show,
  onClose,
  status = 'success',
  message,
  description,
  icon,
  duration = 3000
}: Props) {
  useEffect(() => {
    if (show && onClose) {
      const timeout = setTimeout(() => onClose(), duration)
      return () => clearTimeout(timeout)
    }
  }, [show, onClose, duration])

  if (!show) return null

  const baseStyle = {
    success: {
      icon: icon || '✓',
      iconColor: 'text-green-400',
      bgColor: 'bg-green-900/20 border-green-600',
    },
    error: {
      icon: icon || '⚠️',
      iconColor: 'text-red-400',
      bgColor: 'bg-red-900/20 border-red-600',
    }
  }[status]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <div
        className={`max-w-sm w-full rounded-xl p-6 shadow-xl border text-center backdrop-blur-lg
          ${baseStyle.bgColor}`}
      >
        <div className={`text-5xl mb-2 ${baseStyle.iconColor}`}>
          {baseStyle.icon}
        </div>
        <h2 className="text-white text-lg font-semibold">{message}</h2>
        {description && (
          <p className="text-sm text-zinc-300 mt-1">{description}</p>
        )}
      </div>
    </motion.div>
  )
}
