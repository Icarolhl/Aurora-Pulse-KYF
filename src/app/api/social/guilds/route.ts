export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions, type GuildSummary } from "@/lib/auth"
import { classifyTextRelevance } from "@/lib/ai"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json(
      { error: "Não autenticado" },
      { status: 401 }
    )
  }

  const user = session.user as { guilds?: GuildSummary[] }
  const guilds = Array.isArray(user.guilds)
    ? user.guilds.filter(guild => typeof guild.name === "string" && guild.name.trim().length > 0)
    : []

  const classified = await Promise.all(
    guilds.map(async (guild) => {
      const relevance = await classifyTextRelevance(guild.name)
      return {
        id: guild.id,
        name: guild.name,
        icon: guild.icon,
        relevance,
      }
    })
  )

  return NextResponse.json({ guilds: classified })
}
