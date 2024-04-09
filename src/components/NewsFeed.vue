<script setup>
import { ref, onMounted, computed, nextTick, watch } from 'vue'
import ScrollPanel from 'primevue/scrollpanel';

  
const props = defineProps({
  feed: {
    type: Array,
    required: true
  }
})

const emits = defineEmits([])
</script>

<template>
<ScrollPanel
    style="width: 100%; height: calc(100vh - 7rem); min-height: 10rem;"
    :pt="{
        wrapper: {
            style: 'border-right: 10px solid var(--surface-50);'
        },
        bary: 'surface-300 opacity-100 border-noround'
    }"
>
    <p>
        {{ feed }}
    </p>
</ScrollPanel>
</template>

<style>
.p-scrollpanel-bar{ 
  opacity: 1;
}
</style>