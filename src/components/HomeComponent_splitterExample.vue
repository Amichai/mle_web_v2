<script setup>
import { ref, onMounted, computed, nextTick, watch } from 'vue'
import HeaderBar from '../components/HeaderBar.vue';
import TabComponent from '../components/TabComponent.vue';
import ProjectionsTable from '../components/ProjectionsTable.vue';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import Sidebar from 'primevue/sidebar';
import Divider from 'primevue/divider';
import { useDataManager } from '../composables/useDataManager';
import { convertTimeStringToDecimal, getCurrentTimeDecimal, loadPlayerDataForSlate, setupTableData, postRosterSet, postAnalytics, getTodaysDate } from '../utils.js'
import SlatesBuilder from './SlatesBuilder.vue';
import Splitter from 'primevue/splitter';
import SplitterPanel from 'primevue/splitterpanel';

const props = defineProps()

const playerData = ref([])
const newsFeed = ref(null)

const emits = defineEmits([])

const { queryNewsFeed, queryPlayerData, querySlates } = useDataManager()


onMounted(async () => {
  const date = getTodaysDate()
  newsFeed.value = await queryNewsFeed(date)
  playerData.value = await queryPlayerData(date)
})
</script>

<template>
  <HeaderBar />
  <Divider />
  <div class="two-columns">
    <Splitter>
        <SplitterPanel class="flex align-items-center justify-content-center" :size="75" :minSize="60">
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
        </SplitterPanel>
        <SplitterPanel class="flex align-items-center justify-content-center" :size="25" :minSize="10" >
        <div>
          panel
        </div>
      </SplitterPanel>
    </Splitter>

  </div>
</template>

<style scoped>

.two-columns {
  display: grid;
  /* grid-template-columns: 1fr auto 20rem; */
}

</style>