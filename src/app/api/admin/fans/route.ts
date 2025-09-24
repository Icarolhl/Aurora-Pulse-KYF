import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("fans")
    .select("id, nome, email, estado, cidade, created_at")
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json(
      { error: error.message ?? "Erro desconhecido" },
      { status: 500 }
    )
  }

  return NextResponse.json({ data }, { status: 200 })
}
