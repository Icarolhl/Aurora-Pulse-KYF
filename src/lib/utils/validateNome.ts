export function validateNomeCompleto(nome: string): boolean {
    const partes = nome.trim().split(/\s+/)
    if (partes.length < 2) return false
    return partes.every((parte) => /^[A-Za-zÀ-ÿ]{2,}$/.test(parte))
  }
  