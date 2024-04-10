<script setup>
import { ref, onMounted, computed, nextTick, watch } from 'vue'
import Tag from 'primevue/tag';

const props = defineProps({
  status: {
    type: String,
    required: true
  }
})

const emits = defineEmits([])
</script>

<template>
  <div>
    <Tag v-if="status === 'O'" severity="danger" value="OUT" class="status-tag"></Tag>
    <Tag v-if="status === 'GTD'" severity="warning" value="GTD" class="status-tag"></Tag>
  </div>
</template>

<style></style>