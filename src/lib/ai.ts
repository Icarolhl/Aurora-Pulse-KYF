const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY!

export async function classifyTextRelevance(
  text: string
): Promise<number> {
  const messages = [
    {
      role: 'system',
      content: [
        'Você é um classificador de relevância de conteúdo web para fãs de e-sports.',
        'Responda APENAS um objeto JSON válido com a propriedade "score".',
        'Atributos esperados:',
        '- score: inteiro de 0 a 100.',
        'Escala:',
        '0–29: Irrelevante,',
        '30–59: Pouco relacionado,',
        '60–84: Relevante,',
        '85–100: Muito relevante.'
      ].join(' ')
    },
    {
      role: 'user',
      content: JSON.stringify({ textToClassify: text })
    }
  ]

  const res = await fetch(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENROUTER_KEY}`
      },
      body: JSON.stringify({ model: 'gpt-3.5-turbo', temperature: 0, messages })
    }
  )

  const data = await res.json()
  const content = data.choices?.[0]?.message?.content || ''

  try {
    const parsed = JSON.parse(content)
    const score = Number(parsed.score)
    return Number.isNaN(score) ? 0 : Math.min(100, Math.max(0, score))
  } catch {
    return 0
  }
}
