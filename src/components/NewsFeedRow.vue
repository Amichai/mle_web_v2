<script setup>
import { ref, onMounted, computed, nextTick, watch } from 'vue'
import OverlayPanel from 'primevue/overlaypanel';
import PlayerInfoCard from './PlayerInfoCard.vue';

const props = defineProps({
  row: {
    type: Object,
    required: true
  },
  playerData: {
    type: Object,
    required: true
  },
})

const setupPlayerData = () => {
  
}

const op = ref();

const toggle = (event) => {
  console.log(props.playerData)
  op.value?.toggle(event);
}

const emits = defineEmits([])
</script>

<template>
  <p :class="[row.diff > 1 && 'highlight-1', row.diff < -1 && 'highlight-2', !row.diff && 'bold-text', row.isTimeString && 'underline-text', row.name && 'projection-row', 'feed-row']"
    @click="toggle">
    {{ row.text }}
    <OverlayPanel ref="op" v-if="row.name" :data="row.name">
      <PlayerInfoCard :name="row.name" :playerData="playerData" />
    </OverlayPanel>
  </p>
</template>

<style scoped>
.projection-row {
  cursor: pointer;
}
</style>