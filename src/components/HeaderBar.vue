<script setup>
import { ref, onMounted, computed, nextTick, watch } from 'vue'
import logo from '@/assets/logo.png'


const emits = defineEmits([])
</script>

<template>
  <div class="header">
      <img :src="logo" alt="money line edge" class="logo" height="40">

      <div class="title">
        MONEY LINE EDGE
      </div>
  </div>
</template>

<style scoped>

.header {
  background-color: var(--surface-10);
  text-align: center;
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.title {

  font-family: Anton;
  color: #f5bf42;
  text-align: center;
  text-shadow: 0px 4px 4px rgba(255, 255, 255, 0.25);
  font-size: 25px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  align-self: center;
}

.logo {
  margin: 0.3rem;
}
</style>