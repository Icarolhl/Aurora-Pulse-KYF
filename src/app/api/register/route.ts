import { getServerSession } from "next-auth"
import { authOptions, type GuildSummary } from "@/lib/auth"
import { createClient } from "@supabase/supabase-js"
import { z, ZodError } from "zod"

const fanSchema = z.object({
  nome: z.string().min(1),
  cpf: z
    .string()
    .regex(/^[0-9]{3}\.[0-9]{3}\.[0-9]{3}-[0-9]{2}$/, "CPF inválido"),
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
  guilds?: GuildSummary[]
}

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { global: { fetch } }
  )

  const session = await getServerSession(authOptions)
  const userEmail = session?.user?.email?.trim()

  if (!session || !userEmail) {
    return new Response(
      JSON.stringify({ error: "Não autenticado" }),
      { status: 401 }
    )
  }

  try {
    const rawBody = await req.json()
    const { email: providedEmail, ...payload } = (rawBody ?? {}) as Record<string, unknown>

    if (
      typeof providedEmail === "string" &&
      providedEmail.trim().toLowerCase() !== userEmail.toLowerCase()
    ) {
      return new Response(
        JSON.stringify({ error: "E-mail informado não coincide com o usuário autenticado" }),
        { status: 403 }
      )
    }

    const fanData = fanSchema.parse(payload)
    const user = session.user as SessionUserWithGuilds
    const guildsDiscord = (user.guilds ?? []).map(guild => guild.name)

    const { error } = await supabase
      .from("fans")
      .insert([{ ...fanData, email: userEmail, guilds_discord: guildsDiscord }])

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
