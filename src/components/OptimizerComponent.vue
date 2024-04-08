<script setup>
import { ref, onMounted, computed, nextTick, watch } from 'vue'
import Button from 'primevue/button';
import playIcon from '@/assets/play.png'
import stopIcon from '@/assets/stop.png'
import copyIcon from '@/assets/copy.png'
import { useOptimizer } from '../composables/useOptimizer.js'
import { useLocalStorage } from '../composables/useLocalStorage.js'
import { convertTimeStringToDecimal, getCurrentTimeDecimal, loadPlayerDataForSlate, setupTableData, postRosterSet } from '../utils.js'
import TabComponent from '../components/TabComponent.vue';

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

const rosterSet = ref([])
const maxExposurePercentage = ref('1')
const contestParams = ref([])
const slatePlayerData = ref([])
const isRosterDifferenceHighlighted = ref(false)

const averageRosterValue = computed(() => {
  if(rosterSet.value) {
    const total = rosterSet.value.reduce((acc, curr) => {
      return acc + curr.value
    }, 0)

    return total / rosterSet.value.length
  }

  return 0
})

const getContestParams = (selectedSlate) => {
  const uploadTemplates = [
    {
      type: 'FD Classic',
      firstLine: ['entry_id', 'contest_id', 'contest_name', 'PG', 'PG', 'SG', 'SG', 'SF', 'SF', 'PF', 'PF', 'C'],
      columnsToSet: ['PG', 'PG', 'SG', 'SG', 'SF', 'SF', 'PF', 'PF', 'C', 'Cost', 'Value'],
      lastColumnIndex: 12,
      positionsToFill: ["PG", "PG", "SG", "SG", "SF", "SF", "PF", "PF", "C"],
      costColumnIndex: 10,
      firstColumnIndex: 3,
      contestNameColumnIndex: 2,
      isSlateNameConsistent: (slateName) => {
        return slateName.includes('FD')
          && !slateName.includes('Single game')
      }
    },
    {
      type: 'FD Single Game',
      firstLine: ['entry_id', 'contest_id', 'contest_name', 'MVP - 2X Points', 'STAR - 1.5X Points', 'PRO - 1.2X Points', 'UTIL', 'UTIL'],
      columnsToSet: ['MVP 2x', 'STAR 1.5x', 'PRO 1.2x', 'UTIL', 'UTIL', 'Cost', 'Value'],
      positionsToFill: ['UTIL', 'UTIL', 'UTIL', 'UTIL', 'UTIL'],
      lastColumnIndex: 8,
      positionalScoreBoost: [2, 1.5, 1.2],
      costColumnIndex: 6,
      firstColumnIndex: 3,
      contestNameColumnIndex: 2,
      isSlateNameConsistent: (slateName) => {
        return slateName.includes('FD')
          && slateName.includes('Single game')
      }
    },
    {
      type: 'DK Classic',
      firstLine: ['Entry ID','Contest Name', 'Contest ID', 'Entry Fee', 'PG', 'SG', 'SF', 'PF', 'C', 'G', 'F', 'UTIL'],
      columnsToSet: ['PG', 'SG', 'SF', 'PF', 'C', 'G', 'F', 'UTIL', 'Cost', 'Value'],
      lastColumnIndex: 12,
      positionsToFill: ["PG", "SG", "SF", "PF", "C", "G", "F", "UTIL"],
      costColumnIndex: 9,
      firstColumnIndex: 4,
      contestNameColumnIndex: 1,
      isSlateNameConsistent: (slateName) => {
        return slateName.includes('DK')
          && !slateName.includes('SHOWDOWN')
      }
    },
    {
      type: 'DK Single Game',
      firstLine: ['Entry ID', 'Contest Name', 'Contest ID', 'Entry Fee', 'CPT', 'UTIL', 'UTIL', 'UTIL', 'UTIL', 'UTIL'],
      columnsToSet: ['CPT', 'UTIL', 'UTIL', 'UTIL', 'UTIL', 'UTIL', 'Cost', 'Value'],
      positionsToFill: ['UTIL', 'UTIL', 'UTIL', 'UTIL', 'UTIL', 'UTIL'],
      lastColumnIndex: 10,
      positionalScoreBoost: [1.5],
      positionalCostBoost: [1.5],
      costColumnIndex: 7,
      firstColumnIndex: 4,
      contestNameColumnIndex: 1,
      isSlateNameConsistent: (slateName) => {
        return slateName.includes('DK')
          && slateName.includes('SHOWDOWN')
      }
    },
  ]

  const matchedTemplate = uploadTemplates.filter((template) => {
    return template.isSlateNameConsistent(props.selectedSlate.name)
  })

  if(matchedTemplate.length) {
    return matchedTemplate[0]
  }

  throw new Error('Unable to parse upload template')
}

const areRostersDifferent = (rosters1, rosters2) => {
  if(rosters1.length !== rosters2.length) {
    return true
  }

  for(let i = 0; i < rosters1.length; i += 1) {
    for(let j = 0; j < rosters1[i].players.length; j += 1) {
      if(rosters1[i].players[j]?.playerId !== rosters2[i].players[j]?.playerId) {
        return true
      }
    }
  }
  return false
}

let timeoutId = null
const rostersUpdatedCallback = (rosters) => {
  console.log(rosters) 
  const areDifferent = areRostersDifferent(rosters, rosterSet.value)
  isRosterDifferenceHighlighted.value = areDifferent
  if(timeoutId) {
    clearTimeout(timeoutId)
  }

  timeoutId = setTimeout(() => {
    isRosterDifferenceHighlighted.value = false
  }, 2000)

  rosterSet.value = rosters.slice(0, props.rosterCount)
  

  constructRosterTable()
}

const site = computed(() => {
  if(!props.selectedSlate) {
    return ''
  }
  if(props.selectedSlate.name.includes('DK')) {
    return 'dk'
  } else if(props.selectedSlate.name.includes('FD')) {
    return 'fd'
  }

  return ''
})

const { startStopGeneratingRosters, isGeneratingRosters, stopGeneratingRosters } = useOptimizer(rostersUpdatedCallback, maxExposurePercentage)

const isPlayButtonDisabled = computed(() => {
  return !props.isDataLoaded
})

const loadSlatePlayerData = async (slateName) => {
  if(!props.selectedSlate) {
    return
  }

  if(!props.isDataLoaded) {
    return
  }

  slatePlayerData.value = setupTableData(props.playerData, props.slateData, props.teamData, props.selectedSlate.name)
}

watch(() => props.isDataLoaded, async () => {
  if(props.isDataLoaded){
    loadSlatePlayerData(props.selectedSlate)
    constructRosterTable()
  }
})

const playerByPlayerId = computed(() => {
  const idToPlayer = slatePlayerData.value.reduce((acc, curr) => {
    acc[curr.playerId] = curr
    return acc
  }, {})
  
  return idToPlayer
})

const constructRosterTable = () => {
  if(!Object.keys(playerByPlayerId.value).length) {
    return
  }

  contestParams.value = getContestParams(props.selectedSlate)

  const { columnsToSet, costColumnIndex } = contestParams.value
}

const optimizeHandler = () => {
  startStopGeneratingRosters(slatePlayerData.value, [], rosterSet.value, props.rosterCount, site.value, contestParams)
}
</script>

<template>
  <div>
    <Button class="button play-button tooltip" @click="optimizeHandler" v-show="!isGeneratingRosters" :disabled="isPlayButtonDisabled">
      <img :src="playIcon" alt="optimize" width="30">
    </Button>
    <Button class="button play-button tooltip" @click="optimizeHandler" v-show="isGeneratingRosters">
      <img :src="stopIcon" alt="optimize" width="30">
    </Button>
  </div>
</template>

<style>
</style>