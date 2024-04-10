<script setup>
import { ref, onMounted, computed, nextTick, watch } from 'vue'
import StatusTag from './StatusTag.vue';
  
const props = defineProps({
  name: {
    type: String,
    required: true
  }
})

const emits = defineEmits([])
</script>

<template>
  <div>
    {{ name }}
  </div>
</template>

<style>
</style>