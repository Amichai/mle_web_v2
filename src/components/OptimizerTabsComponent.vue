<script setup>
import { ref, onMounted, computed, nextTick, watch } from 'vue'
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import OptimizerComponent from './OptimizerComponent.vue';
import OptimizerSettings from './OptimizerSettings.vue';


const props = defineProps({
  slateData: {
    type: Array,
    required: true
  },
  teamData: {
    type: Array,
    required: true
  },
  playerData: {
    type: Array,
    required: true
  },
  isDataLoaded: {
    type: Boolean,
    required: true
  },
  rosterCount: {
    type: Number,
    required: true
  },
  selectedSlate: {
    type: Object,
    required: true
  },
})

const emits = defineEmits([])

</script>

<template>
  <TabView class="root">
    <TabPanel header="Optimizer">
      <OptimizerComponent 
        :slateData="slateData"
        :teamData="teamData"
        :playerData="playerData"
        :isDataLoaded="isDataLoaded"
        :rosterCount="rosterCount"
        :selectedSlate="selectedSlate"
      />
  </TabPanel>
    <TabPanel header="Settings">
      <OptimizerSettings
        :modelValue="1"
      />
    </TabPanel>
</TabView>
                
</template>

<style scoped>

</style>