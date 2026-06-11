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
const historial = ref([
  { role: 'assistant', content: '¡Hola! Soy tu asistente de PadelManager. ¿Tenés alguna duda con las reglas o los torneos?' }
]);

// Función para enviar a Groq (la lógica la armamos en el próximo paso)
const enviarMensaje = async () => {
  if (!nuevoMensaje.value.trim()) return;

  // 1. Agregamos el mensaje del usuario al chat
  historial.value.push({ role: 'user', content: nuevoMensaje.value });
  
  const mensajeEnviado = nuevoMensaje.value;
  nuevoMensaje.value = ''; // Limpiamos el input

  // Acá después vamos a meter el fetch a la API de Groq
  setTimeout(() => {
    historial.value.push({ role: 'assistant', content: 'Acá iría la respuesta inteligente de Groq sobre: ' + mensajeEnviado });
  }, 1000);
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