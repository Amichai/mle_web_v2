<script setup>
import { ref, onMounted, computed, nextTick, watch } from 'vue'
import Dropdown from 'primevue/dropdown';

import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import ColumnGroup from 'primevue/columngroup';   // optional
import Row from 'primevue/row';                   // optional


const props = defineProps()

const emits = defineEmits([])
const selectedSite = ref('FanDuel')
const selectedSlate = ref('')

const sites = [
  { name: 'FanDuel', code: 'FD' },
  { name: 'DraftKings', code: 'DK' },
]

const slates = [
]


const players = [
  {
    code: '123',
    name: 'John Doe',
    category: 'WR',
    quantity: 1
  }
]

</script>

<template>
  <div class="">
    <Dropdown v-model="selectedSite" :options="sites" optionLabel="name" placeholder="Select a site" class="w-full md:w-14rem dropdown" />
    <Dropdown v-model="selectedSlate" :options="slates" optionLabel="name" placeholder="Select a slate" class="w-full md:w-14rem dropdown" />
  </div>

  <DataTable :value="players" sortMode="multiple" tableStyle="min-width: 50rem">
    <Column field="code" header="Code" sortable style="width: 25%"></Column>
    <Column field="name" header="Name" sortable style="width: 25%"></Column>
    <Column field="category" header="Category" sortable style="width: 25%"></Column>
    <Column field="quantity" header="Quantity" sortable style="width: 25%"></Column>
</DataTable>

</template>

<style scoped>
.dropdown {
  width: 15rem;
}
</style>