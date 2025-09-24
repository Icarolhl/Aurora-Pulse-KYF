export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { classifyTextRelevance } from "@/lib/ai"

interface Guild {
  id: string
  name: string
  icon: string | null
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json(
      { error: "Não autenticado" },
      { status: 401 }
    )
  }

  const user = session.user as { guilds?: Guild[] }
  const guilds: Guild[] = user.guilds ?? []

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
