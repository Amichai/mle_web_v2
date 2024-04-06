<script setup>
import { ref, onMounted, computed, nextTick, watch } from 'vue'
import Button from 'primevue/button'
import addIcon from '@/assets/add.png'
import SlateAdder from '../components/SlateAdder.vue';

  
const props = defineProps({
  date: {
    type: Date,
    required: true
  },
  playerData: {
    type: Array,
    required: true
  },
})

const addSlate = () => {
  console.log('add slate')
}

const emits = defineEmits([])
</script>

<template>
  <Button class="add-button" @click="addSlate">
      <img :src="addIcon" alt="add slate" width="30">
  </Button>
  Add slate

  <SlateAdder 
    :date="date"
    :playerData="playerData"
  />
</template>

<style>
</style>