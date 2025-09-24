export function validateCPF(cpf: string): boolean {
    const clean = cpf.replace(/\D/g, '')
  
    if (clean.length !== 11 || /^(\d)\1+$/.test(clean)) return false
  
    const calcDigit = (factor: number) => {
      let sum = 0
      for (let i = 0; i < factor - 1; i++) {
        sum += parseInt(clean.charAt(i)) * (factor - i)
      }
      const rest = (sum * 10) % 11
      return rest === 10 ? 0 : rest
    }
  
    const d1 = calcDigit(10)
    const d2 = calcDigit(11)
  
    return d1 === parseInt(clean[9]) && d2 === parseInt(clean[10])
  }
  