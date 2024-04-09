<script setup>
import { ref, onMounted, computed, nextTick, watch } from 'vue'
import HeaderBar from '../components/HeaderBar.vue';
import TabComponent from '../components/TabComponent.vue';
import ProjectionsTable from '../components/ProjectionsTable.vue';
import NewsFeed from '../components/NewsFeed.vue';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import Sidebar from 'primevue/sidebar';
import Divider from 'primevue/divider';
import { useDataManager } from '../composables/useDataManager';
import { convertTimeStringToDecimal, getCurrentTimeDecimal, loadPlayerDataForSlate, setupTableData, postRosterSet, postAnalytics, getTodaysDate } from '../utils.js'
import SlatesBuilder from './SlatesBuilder.vue';

const props = defineProps()

const playerData = ref([])
const newsFeed = ref([])

const emits = defineEmits([])

const { queryNewsFeed, queryPlayerData, querySlates } = useDataManager()


onMounted(async () => {
  const date = getTodaysDate()
  newsFeed.value = await queryNewsFeed(date)
  playerData.value = await queryPlayerData(date)
})

const selectedSite = ref('FD')
</script>

<template>
  <HeaderBar />
  <Divider />

  <div class="two-columns">
    <TabComponent :tabs="[
      {
        header: 'Projections',
        content: ProjectionsTable,
        props: { },
      },
      {
        header: 'Slates',
        content: SlatesBuilder,
        props: { playerData },
      },
    ]" />
    <Divider class="divider" layout="vertical" />
    <NewsFeed 
      :newsRows="newsFeed"
      :selectedSiteInitial="selectedSite"
      />
  </div>
</template>

<style scoped>

.two-columns {
  display: grid;
  grid-template-columns: 1fr auto 25rem;
}


.divider {
  margin: 0.4rem;
}
</style>