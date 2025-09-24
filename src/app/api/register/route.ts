import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createClient } from "@supabase/supabase-js"
import { z, ZodError } from "zod"

const fanSchema = z.object({
  nome: z.string().min(1),
  email: z.string().email(),
  cpf: z.string().regex(/^[0-9]{3}\.[0-9]{3}\.[0-9]{3}-[0-9]{2}$/, "CPF inválido"),
  endereco: z.string(),
  estado: z.string(),
  cidade: z.string(),
  interesses: z.array(z.string()),
  atividades: z.array(z.string()),
  eventos_participados: z.array(z.string()),
  compras_relacionadas: z.array(z.string())
})

interface SessionUserWithGuilds {
  email?: string
  guilds?: string[]
}

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { global: { fetch } }
  )

  const session = await getServerSession(authOptions)

  try {
    const body = await req.json()
    const fanData = fanSchema.parse(body)
    const user = session?.user as SessionUserWithGuilds
    const guildsDiscord = user.guilds ?? []

    const { error } = await supabase
      .from("fans")
      .insert([{ ...fanData, guilds_discord: guildsDiscord }])

    if (error) {
      const isCpfDuplicate =
        error.message.includes("duplicate key value") &&
        error.message.includes("cpf")
      const message = isCpfDuplicate
        ? "CPF já registrado."
        : error.message
      return new Response(JSON.stringify({ error: message }), { status: 500 })
    }

    return new Response(JSON.stringify({ success: true }), { status: 201 })
  } catch (err) {
    const message =
      err instanceof ZodError
        ? err.errors[0]?.message
        : err instanceof Error
        ? err.message
        : "Erro de validação"
    return new Response(JSON.stringify({ error: message }), { status: 400 })
  }
}