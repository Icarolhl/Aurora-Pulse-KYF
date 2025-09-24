export const runtime = "nodejs"

import { createClient } from "@supabase/supabase-js"
import { z } from "zod"
import * as cheerio from "cheerio"
import { classifyTextRelevance } from "@/lib/ai"

const bodySchema = z.object({
  fanId: z.string().uuid(),
  url: z.string().url(),
})

interface Fan {
  id: string
  nome: string
  estado: string
  cidade: string
  interesses: string[]
  atividades: string[]
  eventos_participados: string[]
  compras_relacionadas: string[]
  guilds_discord: string[]
}

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    const { fanId, url } = bodySchema.parse(await req.json())

    const { data: fan, error: fanError } = await supabase
      .from("fans")
      .select("*")
      .eq("id", fanId)
      .single()

    if (fanError || !fan) {
      return new Response(
        JSON.stringify({ error: "Fã não encontrado" }),
        { status: 404 }
      )
    }

    const html = await fetch(url).then(res => res.text())

    const blockedPatterns = [
      "Just a moment...",
      "Access denied",
      "Cloudflare",
      "Checking your browser",
      "Verification required",
    ]

    if (blockedPatterns.some(pat => html.includes(pat))) {
      return new Response(
        JSON.stringify({
          relevance: 0,
          warning: "Site protegido por bloqueadores",
        }),
        { status: 200 }
      )
    }

    const $ = cheerio.load(html)
    const title = $("title").text()
    const description =
      $('meta[name="description"]').attr("content") ||
      $('meta[property="og:description"]').attr("content") || ""
    const headings = $("h1,h2,h3")
      .map((_, el) => $(el).text())
      .get()
      .join(" | ")
    const paragraphs = $("p")
      .map((_, el) => $(el).text())
      .get()
      .slice(0, 3)
      .join(" ")

    const content = [title, description, headings, paragraphs]
      .filter(Boolean)
      .join(" | ")

    const classificationInput = JSON.stringify({
      fanProfile: {
        nome: fan.nome,
        estado: fan.estado,
        cidade: fan.cidade,
        interesses: fan.interesses,
        atividades: fan.atividades,
        eventos_participados: fan.eventos_participados,
        compras_relacionadas: fan.compras_relacionadas,
        guilds_discord: fan.guilds_discord,
      },
      pageContent: content,
    })

    const relevance = await classifyTextRelevance(
      classificationInput
    )

    return new Response(
      JSON.stringify({ relevance }),
      { status: 200 }
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500 }
    )
  }
}
