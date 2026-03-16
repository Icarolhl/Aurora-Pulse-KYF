import 'server-only'
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const getSupabaseAdmin = () => {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase environment variables are missing.")
  }
  return createClient(supabaseUrl, supabaseKey)
}

// Para manter compatibilidade com o código atual, mas exportando como getter para evitar erro no build
export const supabaseAdmin = (function() {
  try {
    if (typeof window === 'undefined' && supabaseUrl && supabaseKey) {
      return createClient(supabaseUrl, supabaseKey)
    }
  } catch {
    // Silencia erros durante o build
  }
  return null as unknown as ReturnType<typeof createClient>
})()
