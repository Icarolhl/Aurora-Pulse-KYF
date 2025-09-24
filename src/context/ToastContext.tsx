"use client"

import { createContext, useContext, useState } from "react"

type ToastType = "success" | "error" | "info"

type Toast = {
  type: ToastType
  message: string
}

const ToastContext = createContext<{
  showToast: (toast: Toast) => void
}>({ showToast: () => {} })

export function ToastProvider({ children }: {
  children: React.ReactNode
}) {
  const [toast, setToast] = useState<Toast | null>(null)

  const showToast = (toast: Toast) => {
    setToast(toast)
    setTimeout(() => setToast(null), 4000)
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div
          className={`fixed bottom-4 right-4 z-50 p-4 rounded-md 
            shadow-md bg-white border text-sm font-medium transition 
            ${toast.type === "error"
              ? "border-red-500 text-red-700"
              : toast.type === "success"
              ? "border-green-500 text-green-700"
              : "border-gray-500 text-gray-700"
            }`}
        >
          {toast.message}
        </div>
      )}
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
