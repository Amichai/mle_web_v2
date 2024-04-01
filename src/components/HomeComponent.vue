<script setup>
import { ref, onMounted, computed, nextTick, watch } from 'vue'
import HeaderBar from '../components/HeaderBar.vue';
import TabComponent from '../components/TabComponent.vue';
import ProjectionsTable from '../components/ProjectionsTable.vue';

import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';

import Sidebar from 'primevue/sidebar';
import Divider from 'primevue/divider';



const props = defineProps()

const emits = defineEmits([])
</script>

<template>
  <HeaderBar />
  Date Picker
  <div class="two-tabs">
    <TabComponent :tabs="[
      {
        header: 'Projections',
        content: ProjectionsTable,
      },
      {
        header: 'Slates',
        content: ProjectionsTable,
      },
      {
        header: 'Optimizer',
        content: ProjectionsTable,
      },
    
    ]" />
    <Divider layout="vertical" />

    <div>
      panel
    </div>
  </div>
</template>

<style scoped>

.two-tabs {
  display: grid;
  grid-template-columns: 1fr auto 14rem;
}

</style>