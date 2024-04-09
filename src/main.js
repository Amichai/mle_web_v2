import { createApp } from 'vue'
import './style.css'
import 'primeicons/primeicons.css'
import App from './App.vue'
import PrimeVue from 'primevue/config';
import Tooltip from 'primevue/tooltip';



import 'primevue/resources/themes/lara-dark-blue/theme.css'

const app = createApp(App);
app.use(PrimeVue);
app.directive('tooltip', Tooltip);

app.mount('#app')
