import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { requireAdminSession } from "@/lib/admin-auth"
import { logAdminAccess } from "@/lib/log-admin"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdminSession()
  if ("response" in guard) {
    return guard.response
  }

  const { id } = await params

  const adminEmail = guard.session.user?.email ?? ""
  await logAdminAccess(adminEmail, `/api/admin/fan/${id}`)

  const { data, error } = await supabaseAdmin
    .from("fans")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? "Não encontrado" },
      { status: 404 }
    )
  }

  return NextResponse.json({ data }, { status: 200 })
}
