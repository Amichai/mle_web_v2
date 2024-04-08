<script setup>
import { ref, onMounted, computed, nextTick, watch } from 'vue'
import Button from 'primevue/button';
import playIcon from '@/assets/play.png'
import stopIcon from '@/assets/stop.png'
import copyIcon from '@/assets/copy.png'
import { useOptimizer } from '../composables/useOptimizer.js'
  
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

})

const emits = defineEmits([])

const rosterSet = ref([])
const maxExposurePercentage = ref('1')

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
    return template.isSlateNameConsistent(selectedSlate)
  })

  if(matchedTemplate.length) {
    return matchedTemplate[0]
  }

  throw new Error('Unable to parse upload template')
}

const rostersUpdatedCallback = (rosters) => { 
}

const { startStopGeneratingRosters, isGeneratingRosters, stopGeneratingRosters } = useOptimizer(rostersUpdatedCallback, maxExposurePercentage)


watch(() => props.isDataLoaded, async () => {
  if(props.isDataLoaded){
    console.log('data loaded')
  }
})


const optimizeHandler = () => {
  startStopGeneratingRosters(props.slateData, [], rosterSet.value, props.rosterCount, site.value, contestParams)
}
</script>

<template>
  <div>
    <Button class="button play-button tooltip" @click="optimizeHandler" v-show="!isGeneratingRosters">
      <img :src="playIcon" alt="optimize" width="30">
    </Button>
    <Button class="button play-button tooltip" @click="optimizeHandler" v-show="isGeneratingRosters">
      <img :src="stopIcon" alt="optimize" width="30">
    </Button>
</div>
</template>

<style>
</style>