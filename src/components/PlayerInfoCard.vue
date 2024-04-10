<script setup>
import { ref, onMounted, computed, nextTick, watch } from 'vue'
  
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
    test
    test
    testing123
    {{ name }}
  </div>
</template>

<style>
</style>