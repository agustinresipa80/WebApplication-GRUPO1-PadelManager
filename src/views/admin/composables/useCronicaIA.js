import { ref } from 'vue'

export function useCronicaIA() {
  const cargandoCronica = ref(false)
  const errorCronica = ref(null)

  const redactarCronica = async (pareja1, pareja2, score1, score2) => {
    cargandoCronica.value = true
    errorCronica.value = null

    try {
      const apiKey = import.meta.env.VITE_GROQ_API_KEY
      
      const prompt = `Sos un periodista deportivo argentino especializado en pádel. Escribí una crónica emocionante y breve (MÁXIMO 3 ORACIONES) sobre el siguiente partido amateur: Se enfrentaron la Pareja 1 (${pareja1}) contra la Pareja 2 (${pareja2}). El resultado fue ${score1} a ${score2}. Destacá la entrega y el nivel de juego en la cancha.`

      // URL corregida: api.groq.com
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant', 
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.8
        })
      })

      if (!response.ok) throw new Error('Fallo al contactar a la IA')

      const data = await response.json()
      return data.choices[0].message.content

    } catch (error) {
      console.error("Error generando crónica:", error)
      errorCronica.value = "La IA está descansando."
      return `Intenso partido disputado entre ${pareja1} y ${pareja2}. El encuentro finalizó con un marcador de ${score1} a ${score2}.`
    } finally {
      cargandoCronica.value = false
    }
  }

  return { redactarCronica, cargandoCronica, errorCronica }
}