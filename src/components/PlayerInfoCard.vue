<script setup>
import { ref, onMounted, computed, nextTick, watch } from 'vue'
import StatusTag from './StatusTag.vue';
import { useLogoProvider } from '../composables/useLogoProvider.js'

const { getLogo } = useLogoProvider()

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  playerInfo: {
    type: Object,
    required: true
  }
})

const emits = defineEmits([])
</script>

<template>
  <div class="name-status">
    {{ name }}
    <component :is="getLogo(playerInfo.team)" v-tooltip="playerInfo.team" />
    <StatusTag :status="playerInfo.status" />
  </div>
</template>

<style scoped>
.name-status {
  display: flex;
  gap: 0.5rem;
}
</style>