<script setup>
import { ref, onMounted, computed, nextTick, watch } from 'vue'
import Dropdown from 'primevue/dropdown';

import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { useDataManager } from '../composables/useDataManager';

import { convertTimeStringToDecimal, getCurrentTimeDecimal, loadPlayerDataForSlate, setupTableData, postRosterSet, postAnalytics, getTodaysDateString } from '../utils.js'
import Calendar from 'primevue/calendar'
import { getTodaysDate } from '../utils.js';


const props = defineProps({
})

const { queryNewsFeed, queryPlayerData, querySlateData, queryTeamData, querySlates } = useDataManager()

const emits = defineEmits([])
const selectedSite = ref('FanDuel')
const selectedSlate = ref('')
const slateToIdToOverride = localStorage.getItem('slateToIdToOverride') ? JSON.parse(localStorage.getItem('slateToIdToOverride')) : {}

// const sites = [
//   { name: 'FanDuel', code: 'FD' },
//   { name: 'DraftKings', code: 'DK' },
// ]

const slates = ref([])

const date = ref(getTodaysDate())

watch(() => date.value, async () => {
  await loadSlates()
  selectedSlate.value = slates.value[0]
})

const loadSlates = async () => {
  const rows = await querySlates(date.value)
  slates.value = rows.map(row =>
  ({
    name: row[0],
    code: row[2]
  }))
}

onMounted(async () => {
  await loadSlates()
})

const players = ref([])
const tableData = ref([])
const isLoading = ref(false)

watch(() => selectedSlate.value, async (newSlate) => {
  tableData.value = []
  isLoading.value = true
  const slateData = await querySlateData(newSlate.code, date.value)
  const teamData = await queryTeamData(date.value)
  const playerData = await queryPlayerData(date.value)

  tableData.value = setupTableData(playerData, slateData, teamData, newSlate.code)
  isLoading.value = false
})

watch(() => props.playerData, async (newPlayerData) => {
  selectedSlate.value = slates.value[0]
  selectedSite.value = 'FanDuel'
})

const isNumeric = (value) => {
  return value !== "" && !isNaN(+value);
}

const overrideChanged = (playerRow) => {
  if(!(selectedSlate.value in slateToIdToOverride)) {
    slateToIdToOverride[selectedSlate.value] = {}
  }
  const playerIdToOverride = slateToIdToOverride[selectedSlate.value]
  const playerId = playerRow['playerId']
  const override = playerRow['override']
  if(isNumeric(override)) {
    playerIdToOverride[playerId] = parseFloat(override)
  } else {
    delete playerIdToOverride[playerId]
    playerRow['override'] = playerRow['projection']
  }
  
  localStorage.setItem('slateToIdToOverride', JSON.stringify(slateToIdToOverride))
}

const resetRow = (row) => {
  const playerId = row.playerId
  delete slateToIdToOverride[selectedSlate.value][playerId];
  row['override'] = row['projection']
  localStorage.setItem('slateToIdToOverride', JSON.stringify(slateToIdToOverride))
}

</script>

<template>
  <div class="">
    <Calendar v-model="date" />
    <!-- <Dropdown v-model="selectedSite" :options="sites" optionLabel="name" placeholder="Select a site" class="w-full md:w-14rem dropdown" /> -->
    <Dropdown v-model="selectedSlate" :options="slates" optionLabel="name" placeholder="Select a slate" class="w-full md:w-14rem dropdown" />
  </div>

  <DataTable :value="tableData" sortMode="multiple" tableStyle="min-width: 50rem">
    <Column field="name" header="Name" sortable style="width: 14%"></Column>
    <Column field="position" header="Position" sortable style="width: 14%"></Column>
    <Column field="salary" header="Salary" sortable style="width: 14%"></Column>
    <Column field="team" header="Team" sortable style="width: 14%"></Column>
    <Column field="projection" header="Projection" sortable style="width: 14%"></Column>
    <Column header="Override" style="width: 14%">
      <template #body="slotProps">
        <div class="override-cell">
          <input class="override" type="number" v-model="slotProps.data.override" 
              @change="() => overrideChanged(slotProps.data)"
              />
            </div>
            <div v-if="slotProps.data.override !== slotProps.data.projection">
            ({{ slotProps.data.override - slotProps.data.projection > 0 ? '+' : '' }}{{ (slotProps.data.override - slotProps.data.projection).toFixed(2) }})
            <button class="reset-row" @click="() => resetRow(slotProps.data)">×</button>
          </div>
        </template>
    </Column>
    <Column field="status" header="Status" sortable style="width: 14%"></Column>
</DataTable>

</template>

<style scoped>
.dropdown {
  width: 15rem;
}

.override-cell {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.reset-row {
  border: none;
  border-radius: 1rem;
}

.override {
  width: 4rem;
}

.dropdown {
  width: 28rem;
}
</style>