<script setup>
import { ref, onMounted, computed, nextTick, watch } from 'vue'
import playIcon from '@/assets/play.png'

import Dropdown from 'primevue/dropdown';

import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { useDataManager } from '../composables/useDataManager';

import { convertTimeStringToDecimal, getCurrentTimeDecimal, loadPlayerDataForSlate, setupTableData, postRosterSet, postAnalytics, getTodaysDateString } from '../utils.js'
import Calendar from 'primevue/calendar'
import { getTodaysDate } from '../utils.js';
import OptimizerComponent from './OptimizerComponent.vue';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputNumber from 'primevue/inputnumber';

const props = defineProps({
})

const { queryNewsFeed, queryPlayerData, querySlateData, queryTeamData, querySlates } = useDataManager()


const emits = defineEmits([])
const selectedSlate = ref('')
const slateToIdToOverride = localStorage.getItem('slateToIdToOverride') ? JSON.parse(localStorage.getItem('slateToIdToOverride')) : {}
const date = ref(getTodaysDate())
const tableData = ref([])
const isLoading = ref(false)
const isOptimizerVisible = ref(true)
const rosterCount = ref(10)

const slates = ref([])

const teamData = ref([])
const playerData = ref([])
const slateData = ref([])
const isDataLoaded = ref(false)


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
  selectedSlate.value = slates.value[0]
})

watch(() => selectedSlate.value, async (newSlate) => {
  isDataLoaded.value = false
  tableData.value = []
  isLoading.value = true
  slateData.value = await querySlateData(newSlate.code, date.value)
  teamData.value = await queryTeamData(date.value)
  playerData.value = await queryPlayerData(date.value)
  tableData.value = setupTableData(playerData.value, slateData.value, teamData.value, newSlate.code)
  isLoading.value = false
  isDataLoaded.value = true
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

const isSlateSelected = () => {
  return selectedSlate.value !== ''
}

const openOptimizer = () => {
  isOptimizerVisible.value = true
}
</script>

<template>
  <div class="card flex justify-content-center">
      <Dialog v-model:visible="isOptimizerVisible" modal header="Optimizer" :style="{ width: '90%' }">
          <OptimizerComponent 
            :slateData="slateData"
            :teamData="teamData"
            :playerData="playerData"
            :isDataLoaded="isDataLoaded"
            :rosterCount="rosterCount"
            />
      </Dialog>
    </div>

  <div class="table-header">
    <div class="slate-selector-area">
      <Calendar v-model="date" />
      <Dropdown v-model="selectedSlate" :options="slates" optionLabel="name" placeholder="Select a slate" class="w-full md:w-14rem dropdown" />
    </div>

    <div class="optimize-button-area">
      <InputNumber v-model="rosterCount" class="number-input" inputId="minmax-buttons" mode="decimal" showButtons 
      :min="1" :max="150" />

      Rosters
      <Button :disabled="!isSlateSelected()" @click="openOptimizer">
        <img class="play-img" :src="playIcon" alt="optimize rosters" width="20">
        Optimize
      </Button>
    </div>
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

<style>
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

.optimize-button-area, .slate-selector-area {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.table-header {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1rem;
  justify-content: space-between;
}

.play-img {
  margin-right: 0.5rem;
}

input {
  font-size: 0.9rem;
}

#minmax-buttons {
}

.p-inputnumber-input {
  width: 4rem;
}
</style>