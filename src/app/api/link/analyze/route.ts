export const runtime = "nodejs"

import { createClient } from "@supabase/supabase-js"
import { z } from "zod"
import * as cheerio from "cheerio"
import { classifyTextRelevance } from "@/lib/ai"
import { isIP } from "node:net"
import { requireAdminSession } from "@/lib/admin-auth"
import { logAdminAccess } from "@/lib/log-admin"

const bodySchema = z.object({
  fanId: z.string().uuid(),
  url: z.string().url()
})

type Fan = {
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

const DISALLOWED_HOSTNAMES = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "[::1]",
  "169.254.169.254",
  "metadata.google.internal"
])

const isPrivateIPv4 = (ip: string) => {
  const parts = ip.split(".").map(Number)
  if (parts.length !== 4 || parts.some(n => Number.isNaN(n))) return false

  const [a, b] = parts
  if (a === 10) return true
  if (a === 127) return true
  if (a === 169 && b === 254) return true
  if (a === 172 && b >= 16 && b <= 31) return true
  if (a === 192 && b === 168) return true
  return false
}

const isPrivateIPv6 = (ip: string) => {
  const normalized = ip.toLowerCase()
  return (
    normalized === "::1" ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("fe80")
  )
}

const isUnsafeHost = (hostname: string) => {
  const normalized = hostname.trim().toLowerCase()

  if (!normalized) return true
  if (DISALLOWED_HOSTNAMES.has(normalized)) return true
  if (normalized.endsWith(".localhost") || normalized.endsWith(".local")) {
    return true
  }

  const ipType = isIP(normalized)
  if (ipType === 4 && isPrivateIPv4(normalized)) return true
  if (ipType === 6 && isPrivateIPv6(normalized)) return true

  return false
}

export async function POST(req: Request) {
  const guard = await requireAdminSession()
  if ("response" in guard) {
    return guard.response
  }

  const adminEmail = guard.session.user?.email ?? ""

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    const { fanId, url } = bodySchema.parse(await req.json())

    await logAdminAccess(adminEmail, `/api/link/analyze?fanId=${fanId}`)

    const parsedUrl = new URL(url)
    if (parsedUrl.protocol !== "https:") {
      return new Response(
        JSON.stringify({ error: "Apenas URLs HTTPS são permitidas" }),
        { status: 400 }
      )
    }

    if (isUnsafeHost(parsedUrl.hostname)) {
      return new Response(
        JSON.stringify({ error: "Host não permitido" }),
        { status: 400 }
      )
    }

    const { data: fan, error: fanError } = await supabase
      .from<Fan>("fans")
      .select("*")
      .eq("id", fanId)
      .single()

    if (fanError || !fan) {
      return new Response(
        JSON.stringify({ error: "Fã não encontrado" }),
        { status: 404 }
      )
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5_000)
    let html: string

    try {
      const response = await fetch(parsedUrl.toString(), {
        signal: controller.signal,
        redirect: "follow"
      })

      if (!response.ok) {
        return new Response(
          JSON.stringify({ error: "Falha ao acessar a URL informada" }),
          { status: 502 }
        )
      }

      html = await response.text()
    } catch (fetchError) {
      const isAbort =
        fetchError instanceof Error && fetchError.name === "AbortError"
      const message = isAbort
        ? "Tempo limite ao acessar a URL"
        : "Erro ao buscar o conteúdo"
      const status = isAbort ? 408 : 502

      return new Response(
        JSON.stringify({ error: message }),
        { status }
      )
    } finally {
      clearTimeout(timeout)
    }

    const blockedPatterns = [
      "Just a moment...",
      "Access denied",
      "Cloudflare",
      "Checking your browser",
      "Verification required"
    ]

    if (blockedPatterns.some(pat => html.includes(pat))) {
      return new Response(
        JSON.stringify({
          relevance: 0,
          warning: "Site protegido por bloqueadores"
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
        guilds_discord: fan.guilds_discord
      },
      pageContent: content
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
