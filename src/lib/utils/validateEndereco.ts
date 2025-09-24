export function validateEnderecoCompleto(endereco: string): boolean {
    const partes = endereco.trim().split(/\s+/)
    if (partes.length < 2) return false
  
    const regex = /^[A-Za-zÀ-ÿ0-9,.]{2,}$/
    return partes.every((p) => regex.test(p))
  }
  