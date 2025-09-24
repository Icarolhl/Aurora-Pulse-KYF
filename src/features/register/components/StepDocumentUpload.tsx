'use client'

import { useEffect, useRef, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import Tesseract from 'tesseract.js'
import { motion } from 'framer-motion'

export default function StepDocumentUpload() {
  const {
    register,
    setValue,
    watch,
    resetField
  } = useFormContext()

  const inputRef = useRef<HTMLInputElement | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle')
  const [mensagem, setMensagem] = useState('')

  const cpfFormulario = watch('cpf')?.replace(/\D/g, '') || ''

  useEffect(() => {
    setStatus('idle')
    setMensagem('')
    setValue('documentValidado', false)
    resetField('documentImage')
    resetField('documentText')

    if (inputRef.current) inputRef.current.value = ''
  }, [])

  const handleUpload = async (file: File) => {
    if (!file) return

    const dataTransfer = new DataTransfer()
    dataTransfer.items.add(file)
    if (inputRef.current) inputRef.current.files = dataTransfer.files

    setStatus('processing')
    setMensagem('🔍 Lendo documento...')

    try {
      const {
        data: { text }
      } = await Tesseract.recognize(file, 'por', {
        logger: (m) => console.log(m)
      })

      setValue('documentText', text)

      const cpfExtraido = text.match(/\d{3}\.?\d{3}\.?\d{3}-?\d{2}/)?.[0]?.replace(/\D/g, '')

      if (cpfExtraido && cpfExtraido === cpfFormulario) {
        setStatus('success')
        setMensagem('✅ Documento validado com sucesso.')
        setValue('documentValidado', true)
        setValue('documentImage', file, { shouldDirty: true })
      } else {
        setStatus('error')
        setMensagem('❌ CPF do documento não confere.')
        setValue('documentValidado', false)
      }
    } catch (err) {
      console.error(err)
      setStatus('error')
      setMensagem('❌ Erro ao ler o documento.')
      setValue('documentValidado', false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleUpload(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    if (e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files[0])
    }
  }

  const registerFile = register('documentImage')

  return (
    <div className="space-y-6">
      <label
        htmlFor="document"
        onDragOver={(e) => {
          e.preventDefault()
          setDragActive(true)
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center border-2 border-dashed
                    rounded-xl p-10 transition-all cursor-pointer text-center
                    ${
                      dragActive
                        ? 'border-pink-600 bg-pink-600/10'
                        : 'border-zinc-700 hover:border-pink-600'
                    }`}
      >
        <input
          id="document"
          type="file"
          accept="image/*"
          {...registerFile}
          onChange={handleFileChange}
          ref={(e) => {
            registerFile.ref(e)
            inputRef.current = e
          }}
          className="hidden"
        />

        <p className="text-white text-base font-semibold">
          Envie uma imagem do seu documento com{' '}
          <span className="text-pink-400">CPF visível</span>
        </p>
        <p className="text-sm text-zinc-400 mt-1">
          Você pode <span className="text-white font-semibold">arrastar aqui</span> ou{' '}
          <span className="text-white font-semibold">clicar</span> para selecionar o arquivo.
        </p>
        <span className="mt-2 text-xs text-zinc-500">Formatos suportados: JPG, PNG</span>
      </label>

      {status !== 'idle' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`text-sm font-medium p-3 rounded transition-all border
            ${
              status === 'success'
                ? 'text-green-400 bg-green-900/30 border-green-600'
                : status === 'error'
                ? 'text-red-400 bg-red-900/30 border-red-600'
                : 'text-yellow-400 bg-yellow-900/30 border-yellow-600'
            }`}
        >
          {mensagem}
        </motion.div>
      )}
    </div>
  )
}
