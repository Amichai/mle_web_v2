<script setup>
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';

const props = defineProps({
  tabs: {
    type: Array,
    required: true
  },
})
</script>
  

<template>
  <div class="card">
    <TabView>
      <TabPanel v-for="tab in tabs" :header="tab.header">
        <p class="m-0">
          <component :is="tab.content" />
        </p>
      </TabPanel>
    </TabView>
  </div>
</template>

