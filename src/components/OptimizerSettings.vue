<script setup>
import { ref, onMounted, computed, nextTick, watch } from 'vue'
import Slider from 'primevue/slider';
  
const props = defineProps({
  modelValue: {
    type: Number,
    required: true
  }
})

const emits = defineEmits(['update:modelValue'])

const maxExposure = ref(props.modelValue)

const sliderClicked = (evt) => {
    evt.stopPropagation()
}

watch(() => props.modelValue, (newVal) => {
  maxExposure.value = newVal
})

watch(() => maxExposure.value, (newVal) => {
  emits('update:modelValue', newVal)
})
</script>

<template>
  <div class="root">
    <p>Max player exposure:</p>
    <Slider class="slider" v-model="maxExposure" :min="0.5" :max="1" :step="0.05" />
    <p>{{ maxExposure }}</p>
  </div>
</template>

<style scoped>
.root {
  display: grid;
  gap: 1rem;
  grid-template-columns: 15rem 15rem 1fr;
}

.slider {
  align-self: center;
}
</style>