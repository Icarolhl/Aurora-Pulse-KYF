"use client"

import { Controller, useFormContext, useWatch } from "react-hook-form"
import { formatCPF } from "@/lib/utils/formatCPF"
import estadosJson from "@/lib/data/estados-cidades-brasil.json"
import { validateNomeCompleto } from "@/lib/utils/validateNome"
import { validateEnderecoCompleto } from "@/lib/utils/validateEndereco"
import { validateCPF } from "@/lib/utils/validateCPF"
import StyledSelect from "@/components/ui/StyledSelect"

type Estado = {
  uf: string
  estado: string
  cidades: string[]
}

const estados = estadosJson as Estado[]

export default function StepPersonal() {
  const {
    register,
    control,
    formState: { errors }
  } = useFormContext()

  const selectedEstado = useWatch({ name: "estado" })
  const cidades = estados.find((e) => e.estado === selectedEstado)?.cidades ?? []

  return (
    <div className="space-y-4">
      <div>
        <label className="block font-medium text-white">Nome completo</label>
        <input
          {...register("nome", {
            required: "Campo obrigatório",
            validate: (val) =>
              validateNomeCompleto(val) || "Nome inválido"
          })}
          type="text"
          className="w-full bg-zinc-900 text-white border border-zinc-700
                     p-2 rounded focus:outline-none focus:ring-2
                     focus:ring-fuchsia-500"
        />
        {errors.nome && (
          <p className="text-sm text-red-600 mt-1">
            {(errors.nome.message as string)}
          </p>
        )}
      </div>

      <Controller
        name="cpf"
        control={control}
        rules={{
          required: "Campo obrigatório",
          validate: (val) => validateCPF(val) || "CPF inválido"
        }}
        render={({ field }) => (
          <div>
            <label className="block font-medium text-white">CPF</label>
            <input
              type="text"
              className="w-full bg-zinc-900 text-white border border-zinc-700
                         p-2 rounded focus:outline-none focus:ring-2
                         focus:ring-fuchsia-500"
              value={field.value}
              onChange={(e) => field.onChange(formatCPF(e.target.value))}
            />
            {errors.cpf && (
              <p className="text-sm text-red-600 mt-1">
                {(errors.cpf.message as string)}
              </p>
            )}
          </div>
        )}
      />

      <StyledSelect
        name="estado"
        label="Estado"
        options={estados.map((e) => ({
          value: e.estado,
          label: e.estado
        }))}
        register={register}
      />
      {errors.estado && (
        <p className="text-sm text-red-600 mt-1">
          {(errors.estado.message as string)}
        </p>
      )}

      <StyledSelect
        name="cidade"
        label="Cidade"
        options={cidades.map((cidade) => ({
          value: cidade,
          label: cidade
        }))}
        register={register}
      />
      {errors.cidade && (
        <p className="text-sm text-red-600 mt-1">
          {(errors.cidade.message as string)}
        </p>
      )}

      <div>
        <label className="block font-medium text-white">Endereço</label>
        <input
          {...register("endereco", {
            required: "Campo obrigatório",
            validate: (val) =>
              validateEnderecoCompleto(val) || "Endereço inválido"
          })}
          type="text"
          className="w-full bg-zinc-900 text-white border border-zinc-700
                     p-2 rounded focus:outline-none focus:ring-2
                     focus:ring-fuchsia-500"
        />
        {errors.endereco && (
          <p className="text-sm text-red-600 mt-1">
            {(errors.endereco.message as string)}
          </p>
        )}
      </div>
    </div>
  )
}
