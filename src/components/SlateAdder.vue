<script setup>
import { ref, onMounted, computed, nextTick, watch } from 'vue'
import Stepper from 'primevue/stepper';
import StepperPanel from 'primevue/stepperpanel';
import Button from 'primevue/button'
import Dropdown from 'primevue/dropdown';
import { useDataManager } from '../composables/useDataManager';

  
const props = defineProps({
  date: {
    type: Date,
    required: true
  },
  playerData: {
    type: Array,
    required: true
  },
})

const { queryNewsFeed, queryPlayerData, querySlateData, queryTeamData, querySlates } = useDataManager()

const filteredRows = ref([])
const selectedSlate = ref('')
const slates = ref([])
const reader = new FileReader();

const emits = defineEmits(['gotFocus'])

const loadSlates = async () => {
  const rows = await querySlates(props.date)
  slates.value = rows.map(row =>
  ({
    name: row[0],
    code: row[2]
  }))
}

onMounted(async () => {
  await loadSlates()
})

watch(() => props.date, async () => {
  await loadSlates()
})

const uploadSlateFile = (evt) => {
  emits('gotFocus', selectedSlate.value)
  const files = evt.target.files; // FileList object
  const f = files[0];
  // const name = f.name;

  reader.onload = (() => {
    return function (e) {
      const content = e.target.result
      const result = Papa.parse(content)
      const rows = result.data.filter(row => row[0] !== '').map(row => row.slice(0, 13))
      
      const firstRow = rows[0]
      contestParams.value = getContestParams(firstRow)
      if(!contestParams.value.isSlateNameConsistent(selectedSlate.value)){
        alert('Slate name does not match the contest type')
        return
      }

      filteredRows.value = rows


      setItem('tableRows', filteredRows.value)
      
      contests.value = Papa.unparse(filteredRows.value)

      postAnalytics('upload-slate-file', {
        slate: selectedSlate.value,
        contestCount: filteredRows.value.length - 1
      })
    };
  })();

  reader.readAsText(f);
}

</script>

<template>
    <div class="card flex justify-content-center">
        <Stepper>
            <StepperPanel header="Select Slate">
                <template #content="{ nextCallback }">
                    <div class="flex flex-column h-12rem">
                        <div class="border-2 border-dashed surface-border border-round surface-ground flex-auto flex justify-content-center align-items-center font-medium">
                          <Dropdown v-model="selectedSlate" :options="slates" optionLabel="name" placeholder="Select a slate" class="w-full md:w-14rem dropdown" />
                        </div>
                    </div>
                    <div class="flex pt-4 justify-content-end">
                        <Button label="Next" icon="pi pi-arrow-right" iconPos="right" @click="nextCallback" />
                    </div>
                </template>
            </StepperPanel>
            <StepperPanel header="Upload Your Slate CSV File">
                <template #content="{ prevCallback }">
                    <div class="flex flex-column h-12rem">
                        <div class="border-2 border-dashed surface-border border-round surface-ground flex-auto flex justify-content-center align-items-center font-medium">
                          <div class="input-file-row" v-show="selectedSlate && !filteredRows.length">
                            <input class="form-control" @change="uploadSlateFile" type="file" id="formFile">
                          </div>

                        </div>
                    </div>
                    <div class="flex pt-4 justify-content-between">
                        <Button label="Back" severity="secondary" icon="pi pi-arrow-left" @click="prevCallback" />
                    </div>
                </template>
            </StepperPanel>
        </Stepper>
    </div>
</template>

<style scoped>
.p-stepper {
    flex-basis: 50rem;
}
</style>
