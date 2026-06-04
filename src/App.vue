<template>
  <div id="app">
    <NavBar v-if="authStore.isLoggedIn" />
    <main :class="{ 'with-nav': authStore.isLoggedIn }">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
import NavBar from '@/components/NavBar.vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
</script>
