import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function GET(
  _req: Request,
  contextPromise: Promise<{ params: { id: string } }>
) {
  const { params } = await contextPromise

  const { data, error } = await supabaseAdmin
    .from("fans")
    .select("*")
    .eq("id", params.id)
    .single()

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? "Não encontrado" },
      { status: 404 }
    )
  }

  return NextResponse.json({ data }, { status: 200 })
}
  