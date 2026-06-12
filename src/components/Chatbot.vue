<template>
  <div class="chatbot-container">
    <div v-if="isOpen" class="chat-window">
      <div class="chat-header">
        <span>🎾 Asistente Padel</span>
        <button @click="isOpen = false" class="close-btn">✖</button>
      </div>
      <div class="chat-messages">
        <div v-for="(msg, index) in historial" :key="index" :class="['message', msg.role]">
          {{ msg.content }}
        </div>
        <div v-if="isLoading" class="message assistant">
          Escribiendo... 🎾
        </div>
      </div>

      <div class="chat-input">
        <input 
          v-model="nuevoMensaje" 
          @keyup.enter="enviarMensaje"
          placeholder="Preguntá sobre reglas o torneos..." 
        />
        <button @click="enviarMensaje">Enviar</button>
      </div>
    </div>

    <button v-else @click="isOpen = true" class="chat-toggle-btn">
      💬 Ayuda
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// Estados del componente
const isOpen = ref(false);
const nuevoMensaje = ref('');
const isLoading = ref(false); // Para mostrar que la IA está cargando

const historial = ref([
  { role: 'assistant', content: '¡Hola! Soy tu asistente de PadelManager. ¿Tenés alguna duda con las reglas o los torneos?' }
]);

const enviarMensaje = async () => {
  if (!nuevoMensaje.value.trim() || isLoading.value) return;

  const mensajeEnviado = nuevoMensaje.value;
  historial.value.push({ role: 'user', content: mensajeEnviado });
  nuevoMensaje.value = ''; 
  isLoading.value = true;

  try {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    
    // Llamada a Groq con el modelo 8b-instant (más estable)
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant', 
        messages: [
          { 
            role: 'system', 
            content: 'Sos un asistente virtual experto en pádel para la plataforma PadelManager. Respondé de forma concisa, amigable y en español argentino.' 
          },
          ...historial.value.map(msg => ({ role: msg.role, content: msg.content }))
        ],
        temperature: 0.7,
        max_tokens: 200
      })
    });

    const data = await response.json();
    
    // Si la API responde con error, el log nos dirá por qué
    if (!response.ok) {
      console.error("Error desde Groq:", data);
      throw new Error(data.error?.message || "Error en la API");
    }

    historial.value.push({ role: 'assistant', content: data.choices[0].message.content });

  } catch (error) {
    console.error("Error capturado:", error);
    historial.value.push({ 
      role: 'assistant', 
      content: 'No pude conectarme con la IA. Verificá que la API Key sea válida.' 
    });
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
/* Estilos para dejarlo flotando abajo a la derecha */
.chatbot-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  font-family: sans-serif;
}

.chat-toggle-btn {
  background-color: #10b981;
  color: white;
  border: none;
  border-radius: 50px;
  padding: 12px 20px;
  font-size: 16px;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.chat-window {
  width: 300px;
  height: 400px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-header {
  background: #10b981;
  color: white;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  font-weight: bold;
}

.close-btn {
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
}

.chat-messages {
  flex: 1;
  padding: 15px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.message {
  padding: 10px;
  border-radius: 8px;
  max-width: 80%;
}

.message.user {
  background: #e5e7eb;
  align-self: flex-end;
}

.message.assistant {
  background: #d1fae5;
  align-self: flex-start;
}

.chat-input {
  display: flex;
  padding: 10px;
  border-top: 1px solid #e5e7eb;
}

.chat-input input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.chat-input button {
  background: #10b981;
  color: white;
  border: none;
  padding: 8px 12px;
  margin-left: 5px;
  border-radius: 5px;
  cursor: pointer;
}
</style>