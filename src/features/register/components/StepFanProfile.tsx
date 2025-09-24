"use client"

import { useFormContext } from "react-hook-form"
import DynamicTagInput from "@/components/form/DynamicTagInput"

export default function StepFanProfile() {
  const { setValue, watch } = useFormContext()

  const inputClass =
    "bg-zinc-900 text-white border border-zinc-700 " +
    "focus:outline-none focus:ring-2 focus:ring-fuchsia-500 rounded"

  return (
    <div className="space-y-6">
      <div>
        <label className="block font-medium text-white mb-1">
          Interesses
        </label>
        <DynamicTagInput
          tags={watch("interesses")}
          onChange={(tags: string[]) => setValue("interesses", tags)}
          placeholder="Digite e pressione Enter"
          className={inputClass}
        />
      </div>

      <div>
        <label className="block font-medium text-white mb-1">
          Atividades
        </label>
        <DynamicTagInput
          tags={watch("atividades")}
          onChange={(tags: string[]) => setValue("atividades", tags)}
          placeholder="Ex: jogar CS, assistir streams..."
          className={inputClass}
        />
      </div>

      <div>
        <label className="block font-medium text-white mb-1">
          Eventos Participados
        </label>
        <DynamicTagInput
          tags={watch("eventos_participados")}
          onChange={(tags: string[]) =>
            setValue("eventos_participados", tags)
          }
          placeholder="Ex: Fan Fest, Majors, Arena..."
          className={inputClass}
        />
      </div>

      <div>
        <label className="block font-medium text-white mb-1">
          Compras Relacionadas
        </label>
        <DynamicTagInput
          tags={watch("compras_relacionadas")}
          onChange={(tags: string[]) =>
            setValue("compras_relacionadas", tags)
          }
          placeholder="Ex: camisa FURIA, ingresso GC..."
          className={inputClass}
        />
      </div>
    </div>
  )
}
