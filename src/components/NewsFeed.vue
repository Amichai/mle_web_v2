<script setup>
import { ref, onMounted, computed, nextTick, watch } from 'vue'
import ScrollPanel from 'primevue/scrollpanel';
import RadioButton from 'primevue/radiobutton';
import Button from 'primevue/button';
import dklogo from '@/assets/draftkings.png'
import fdlogo from '@/assets/fanduel.png'
import sync from '@/assets/sync.png'
import discord from '@/assets/discord-icon.png'
import OverlayPanel from 'primevue/overlaypanel';
import PlayerInfoCard from './PlayerInfoCard.vue';

const props = defineProps({
  newsRows: {
    type: Array,
    required: true
  },
  selectedSiteInitial: {
    type: String,
    required: true
  }
})

const selectedSite = ref(props.selectedSiteInitial)
const scrollPanelRef = ref(null)
const op = ref();

const toggle = (event, idx, name) => {
  // debugger
  op.value[idx].toggle(event);
}

watch(() => props.selectedSiteInitial, (newVal) => {
  selectedSite.value = newVal

  console.log("Selected site1", selectedSite.value)
})

watch(() => selectedSite.value, (newVal) => {
  console.log("Selected site2", selectedSite.value)
})

onMounted(() => {
  formatRows(props.newsRows)

  nextTick(() => {
    scrollToBottom()
  })
})

const emits = defineEmits(['queryProjections'])
const newsRowsLocal = ref(props.newsRows)

const formatTime = (date) => {
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let seconds = date.getSeconds();
  let ampm = hours >= 12 ? 'pm' : 'am';

  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0' + minutes : minutes;
  seconds = seconds < 10 ? '0' + seconds : seconds;

  let strTime = hours + ':' + minutes + ':' + seconds + ampm;
  return strTime;
}

const formatRows = (rows) => {
  newsRowsLocal.value = []
  rows.forEach((row) => {
    if (!row) {
      return
    }
    const newRows = []
    const parts = row.split(',')
    const time = parts[0]
    const startIdx = row.indexOf(',')
    let canParseJSON = false
    try {
      JSON.parse(row.substring(startIdx + 2, row.length))
      canParseJSON = true
    } catch {
      canParseJSON = false
    }

    if (!canParseJSON) {
      newsRowsLocal.value.push({
        text: row
      })

      return
    }

    const projections = JSON.parse(row.substring(startIdx + 2, row.length))

    const timeString = new Date(parseFloat(time) * 1000)

    newsRowsLocal.value.push({
      text: `${formatTime(timeString)}`,
      isTimeString: true
    })
    projections.forEach((projection) => {
      const name = projection[0]
      const team = projection[1]
      const fdInitial = projection[2]
      const dkInitial = projection[3]
      const fdFinal = projection[4]
      const dkFinal = projection[5]

      if (!fdInitial || !dkInitial) {
        return
      }

      const fdDiff = (fdFinal - fdInitial).toFixed(2)
      const dkDiff = (dkFinal - dkInitial).toFixed(2)

      if ((fdInitial > 13 || fdFinal > 13) && Math.abs(fdDiff) > 0.3) {
        newRows.push([`${name} ${fdInitial.toFixed(2)} → ${fdFinal.toFixed(2)} (${fdDiff > 0 ? '+' : ''}${fdDiff})`, fdDiff, 'fd', team, name])
      }
      if ((dkInitial > 13 || dkFinal > 13) && Math.abs(dkDiff) > 0.3) {
        newRows.push([`${name} ${dkInitial.toFixed(2)} → ${dkFinal.toFixed(2)} (${fdDiff > 0 ? '+' : ''}${dkDiff})`, dkDiff, 'dk', team, name])
      }
    })

    newsRowsLocal.value = [...newsRowsLocal.value, ...newRows.sort((a, b) => {
      return b[1] - a[1]
    }).map((row) =>
    ({
      text: row[0],
      diff: row[1],
      site: row[2],
      team: row[3],
      name: row[4],
    }))]
  })
}

watch(() => props.newsRows, (newVal) => {
  formatRows(newVal)
  nextTick(() => {
    scrollToBottom()
  })
})

const newsRowsFiltered = computed(() => {
  const fdRows = newsRowsLocal.value.filter((row) => !row.site || row.site === 'fd')

  const dkRows = newsRowsLocal.value.filter((row) => !row.site || row.site === 'dk')

  return selectedSite.value === 'FD' ? fdRows : dkRows
})

const scrollToBottom = () => {
  let scrollableHeight = scrollPanelRef.value.$refs.content.scrollHeight - scrollPanelRef.value.$refs.content.clientHeight;
  scrollPanelRef.value.$refs.content.scrollTop = scrollableHeight
}

const refreshProjections = () => {
  let cube = document.querySelector(".refresh-icon");
  cube.classList.add("animate-cube");

  // Optional: Remove the class after the animation ends
  cube.addEventListener('animationend', function () {
    cube.classList.remove("animate-cube");
  });

  emits('queryProjections');
}
</script>

<template>
  <div>
    <div class="news-feed-title">
      <div class="button-bar">
        <Button class="refresh-button" @click="refreshProjections">
          <img :src="sync" alt="refresh projections" width="17" class="refresh-icon">
        </Button>
        <p>Breaking News</p>
      </div>
      <div class="site-selector">
        <RadioButton v-model="selectedSite" inputId="option1" name="option" value="FD" />
        <label for="option1" class="ml-2">
          <img :src="fdlogo" alt="FanDuel" height="20">
        </label>
        <RadioButton v-model="selectedSite" inputId="option2" name="option" value="DK" />
        <label for="option2" class="ml-2">
          <img :src="dklogo" alt="DraftKings" height="20">
        </label>
      </div>
    </div>
    <ScrollPanel ref="scrollPanelRef" class="news-feed"
      style="width: 100%; height: calc(100vh - 12.5rem); min-height: 10rem;" :pt="{
          wrapper: {
            style: 'border-right: 10px solid var(--surface-50);'
          },
          bary: 'surface-300 opacity-100 border-noround'
        }">
      <div class="feed" id="feed">
        <div v-for="(row, idx) in newsRowsFiltered" :key="idx">
          <p
            :class="[row.diff > 1 && 'highlight-1', row.diff < -1 && 'highlight-2', !row.diff && 'bold-text', row.isTimeString && 'underline-text', 'feed-row']"
            >
            {{ row.text }}
            <!-- <OverlayPanel ref="op" v-if="row.name" :data="row.name">
              @click="(evt) => toggle(evt, idx, row.name)"
              <PlayerInfoCard
                :name="row.name"
              />
            </OverlayPanel> -->
          </p>
        </div>
      </div>
    </ScrollPanel>
    <div class="discord-link"><img :src="discord" alt="discord" class="discord-icon">
      <p class="news-feed-footer">Have a question? Ask us <a href="https://discord.gg/VPjHhUr69g">here</a></p>
    </div>
  </div>
</template>

<style>
.p-scrollpanel-bar {
  opacity: 1;
}

.news-feed-title {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  justify-content: space-between;
  user-select: none;
}

.discord-icon {
  width: 1.38rem;
  height: 1.5rem;
}

.refresh-button {
  display: flex;
  border-radius: 5rem;
  padding: 0.2rem;
}

.p-radiobutton-icon {
  background-color: var(--foreground-color);
}

.site-selector {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  gap: 0.5rem;
  font-size: 1rem;
}

.button-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-weight: 700;
  color: var(--foreground-color);
}

.feed-row {
  margin: 0;
  cursor: pointer;
}

.news-feed {
  background-color: var(--background-color-dark);
  padding: 0.5rem;
  border-radius: 0.5rem 0.5rem 0 0;
}

.discord-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.news-feed-footer {
  margin-top: 0.4rem;
}

@keyframes rotateCube {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(180deg);
    }
}

.animate-cube {
    animation: rotateCube 1s ease-in-out;
    visibility: visible !important;
}

.highlight-1 {
  /* color: green; */
  color: rgba(144, 238, 144, 0.657);
}

.highlight-2 {
  /* color: red; */
  color: rgba(240, 128, 128, 0.461);
}

.bold-text {
  font-weight: bold;
}

.underline-text {
  text-decoration: underline;
  font-size: 1.1rem;
}
</style>