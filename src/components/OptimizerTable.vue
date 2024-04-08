<script setup>
import { ref, onMounted, computed, nextTick, watch } from 'vue'
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
  
const props = defineProps({
  tableColumns: {
    type: Array,
    required: true
  },
  tableRows: {
    type: Array,
    required: true
  },
})

const emits = defineEmits([])
const tableData = ref([])

const loadTableData = () => {
  tableData.value = props.tableRows.map(row => {
    props.tableColumns.forEach((column, index) => {
      row[index] = row[index]?.name || row[index]
    })

    return row
  })
}

onMounted(() => {
  loadTableData()
})

watch(() => props.tableRows, () => {
  loadTableData()
})
</script>

<template>
  <DataTable :value="tableRows" sortMode="multiple" tableStyle="min-width: 50rem">
    <Column v-for="(column, index) in tableColumns" :header="column" :field="`${index}`"></Column>
</DataTable>
</template>

<style>
</style>