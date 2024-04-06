<script setup>
import { ref, onMounted, computed, nextTick, watch } from 'vue'
import HeaderBar from '../components/HeaderBar.vue';
import TabComponent from '../components/TabComponent.vue';
import ProjectionsTable from '../components/ProjectionsTable.vue';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import Sidebar from 'primevue/sidebar';
import Divider from 'primevue/divider';
import Calendar from 'primevue/calendar'
import { useDataManager } from '../composables/useDataManager';
import { convertTimeStringToDecimal, getCurrentTimeDecimal, loadPlayerDataForSlate, setupTableData, postRosterSet, postAnalytics } from '../utils.js'
import SlatesBuilder from './SlatesBuilder.vue';

const props = defineProps()

const playerData = ref([])
const newsFeed = ref(null)

const emits = defineEmits([])

const date = ref(new Date())

const { queryNewsFeed, queryPlayerData, querySlates } = useDataManager()

watch(date, async () => {
  newsFeed.value = await queryNewsFeed(date.value)
  playerData.value = await queryPlayerData(date.value)
})

</script>

<template>
  <HeaderBar />
  <Divider />
  <Calendar v-model="date" />
  <br>
  <br>

  <div class="two-tabs">
    <TabComponent :tabs="[
      {
        header: 'Projections',
        content: ProjectionsTable,
        props: { date, playerData },
      },
      {
        header: 'Slates',
        content: SlatesBuilder,
        props: { date, playerData },
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
  grid-template-columns: 1fr auto 20rem;
}

</style>