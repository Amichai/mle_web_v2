<script setup>
import { ref, onMounted, computed, nextTick, watch } from 'vue'
import Stepper from 'primevue/stepper';
import StepperPanel from 'primevue/stepperpanel';
import Button from 'primevue/button'
import Dropdown from 'primevue/dropdown';
import { useDataManager } from '../composables/useDataManager';
import { getTodaysDateString } from '../utils';
import uploadIcon from '@/assets/upload.png'
import Papa from 'papaparse';

  
const props = defineProps({
  playerData: {
    type: Array,
    required: true
  },
})

const { queryNewsFeed, queryPlayerData, querySlateData, queryTeamData, querySlates } = useDataManager()

const date = new Date(getTodaysDateString())

const filteredRows = ref([])
const selectedSlate = ref('')
const slates = ref([])
const reader = new FileReader();
const filename = ref('')

const emits = defineEmits(['gotFocus'])

const loadSlates = async () => {
  const rows = await querySlates(date)
  slates.value = rows.map(row =>
  ({
    name: row[0],
    code: row[2]
  }))
}

onMounted(async () => {
  await loadSlates()
})

watch(() => date, async () => {
  await loadSlates()
})

const slateFileUploaded = (evt) => {
  emits('gotFocus', selectedSlate.value)
  const files = evt.target.files; // FileList object
  const f = files[0];
  filename.value = f.name;

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

const uploadSlateFile = () =>  {
  document.getElementById('formFileSlateFile').click();
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
                    <div class="flex pt-4 justify-content-end button-row">
                      <Button label="Next" icon="pi pi-arrow-right" iconPos="right" @click="nextCallback" />
                      <Button label="Cancel" severity="secondary" @click="cancelSlate" />
                    </div>
                </template>
            </StepperPanel>
            <StepperPanel header="Upload Your CSV File">
                <template #content="{ prevCallback }">
                    <div class="flex flex-column h-12rem">
                        <div class="border-2 border-dashed surface-border border-round surface-ground flex-auto flex justify-content-center align-items-center font-medium">
                          <div class="input-file-row" v-show="(selectedSlate && !filteredRows.length) || true"
                          >
                          <div class="file-upload-wrapper">
                            <Button class="button upload-button" 
                            severity="secondary"
                            @click="uploadSlateFile">
                              <img :src="uploadIcon" alt="upload projections" width="40">
                            </Button>
                            <input class="form-control-projections" type="file" 
                            @change="slateFileUploaded"
                            id="formFileSlateFile">
                            {{ filename }}
                          </div>
                          </div>
                        </div>
                    </div>
                    <div class="flex pt-4 justify-content-between button-row">
                      <Button label="Back" severity="primary" icon="pi pi-arrow-left" @click="prevCallback" />

                      <Button label="Cancel" severity="secondary" @click="cancelSlate" />
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

.form-control-projections {
  display: none;
}

.button-row {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}
</style>
