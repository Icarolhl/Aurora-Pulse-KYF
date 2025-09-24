"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { motion } from "framer-motion"

import StepPersonal from "@/features/register/components/StepPersonal"
import StepFanProfile from "@/features/register/components/StepFanProfile"
import StepDocumentUpload from "@/features/register/components/StepDocumentUpload"
import StatusPopup from "@/components/ui/StatusPopup"

type FormValues = {
  nome: string
  cpf: string
  estado: string
  cidade: string
  endereco: string
  interesses: string[]
  atividades: string[]
  eventos_participados: string[]
  compras_relacionadas: string[]
  documentImage: { path: string } | null
  documentText: string
  documentValidado: boolean
}

export default function RegisterPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [showPopup, setShowPopup] = useState(false)
  const [errorPopup, setErrorPopup] = useState("")

  const form = useForm<FormValues>({
    defaultValues: {
      nome: "",
      cpf: "",
      estado: "",
      cidade: "",
      endereco: "",
      interesses: [],
      atividades: [],
      eventos_participados: [],
      compras_relacionadas: [],
      documentImage: null,
      documentText: "",
      documentValidado: false
    }
  })

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/connect")
  }, [status, router])

  useEffect(() => {
    if (!errorPopup) return
    const timer = setTimeout(() => {
      if (errorPopup === "CPF já registrado.") router.push("/")
      setErrorPopup("")
    }, 3000)
    return () => clearTimeout(timer)
  }, [errorPopup, router])

  useEffect(() => {
    if (!showPopup) return
    const timer = setTimeout(() => router.push("/"), 3000)
    return () => clearTimeout(timer)
  }, [showPopup, router])

  if (status === "loading") return null

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
    else router.push("/connect")
  }

  const onSubmit = async (data: FormValues) => {
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          email: session?.user?.email ?? "",
          documentImage: data.documentImage?.path
        })
      })
      const result = await res.json()
      if (!res.ok) {
        setErrorPopup(result.error ?? "Erro ao enviar dados.")
        return
      }
      setShowPopup(true)
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Erro inesperado. Tente novamente."
      console.error("[ERRO GERAL]", message)
      setErrorPopup(message)
    }
  }

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen flex items-center justify-center px-4 bg-zinc-950 text-white"
      style={{
        backgroundImage:
          "radial-gradient(circle at 30% 30%, rgba(139,92,246,0.15), transparent 40%)," +
          "radial-gradient(circle at 70% 70%, rgba(236,72,153,0.12), transparent 40%)",
        backgroundSize: "cover"
      }}
    >
      <div
        className="w-full max-w-2xl p-8 rounded-2xl shadow-xl bg-white/5 backdrop-blur-md \
          border border-white/10 space-y-6"
      >
        <h1 className="text-2xl font-bold text-center">
          Formulário de Registro
        </h1>

        <StatusPopup
          show={showPopup}
          status="success"
          message="Registro enviado com sucesso!"
          description="Obrigado por compartilhar seus dados. Você será redirecionado."
        />

        <StatusPopup
          show={!!errorPopup}
          status="error"
          message="Erro ao enviar dados"
          description={errorPopup}
        />

        <FormProvider {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            {step === 1 && <StepPersonal />}
            {step === 2 && <StepFanProfile />}
            {step === 3 && <StepDocumentUpload />}

            <div className="mt-8 flex flex-col gap-4">
              {step < 3 ? (
                <div className="flex justify-between">
                  <motion.button
                    type="button"
                    onClick={handleBack}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="px-6 py-2 bg-black text-white font-semibold \
                      rounded-full shadow hover:bg-zinc-800 transition"
                  >
                    Voltar
                  </motion.button>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={async () => {
                      const campos =
                        step === 1
                          ? ([
                              "nome",
                              "cpf",
                              "estado",
                              "cidade",
                              "endereco"
                            ] as const)
                          : ([] as const)
                      const isValid = await form.trigger(campos)
                      if (isValid) setStep(step + 1)
                    }}
                    className="px-6 py-2 bg-gradient-to-r from-fuchsia-600 \
                      to-pink-600 text-white font-semibold rounded-full shadow \
                      hover:brightness-110 transition"
                  >
                    Avançar
                  </motion.button>
                </div>
              ) : (
                <div className="flex justify-between gap-4">
                  <motion.button
                    type="button"
                    onClick={handleBack}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full px-6 py-2 bg-black text-white font-semibold \
                      rounded-full shadow hover:bg-zinc-800 transition"
                  >
                    Voltar
                  </motion.button>
                  <motion.button
                    type="submit"
                    disabled={!form.watch("documentValidado")}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full px-6 py-2 bg-green-600 text-white font-semibold \
                      rounded-full shadow disabled:opacity-50 transition"
                  >
                    Enviar
                  </motion.button>
                </div>
              )}
            </div>
          </form>
        </FormProvider>
      </div>
    </motion.main>
  )
}
