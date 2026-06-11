<template>
  <div id="app">
    <NavBar v-if="authStore.isLoggedIn" />
    
    <main :class="{ 'with-nav': authStore.isLoggedIn }">
      <RouterView />
    </main>

    <!-- El Chatbot solo aparece si el usuario está logueado -->
    <Chatbot v-if="authStore.isLoggedIn" />
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
import NavBar from '@/components/NavBar.vue'
import Chatbot from '@/components/Chatbot.vue' 
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
</script>

<style>

.with-nav {
  /*  estilos actuales */
}
</style>