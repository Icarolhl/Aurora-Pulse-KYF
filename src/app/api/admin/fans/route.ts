import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { requireAdminSession } from "@/lib/admin-auth"
import { logAdminAccess } from "@/lib/log-admin"

export async function GET() {
  const guard = await requireAdminSession()
  if ("response" in guard) {
    return guard.response
  }

  const adminEmail = guard.session.user?.email ?? ""
  await logAdminAccess(adminEmail, "/api/admin/fans")

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
