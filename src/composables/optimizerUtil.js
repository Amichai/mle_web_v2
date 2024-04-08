import { ref, onMounted, computed, nextTick, watch } from 'vue'

export const playerListToRoster = (players) => {
  const totalValue = players.map((row) => {
    return row.override
  }).reduce((a, b) => a + b, 0)
  const lineupKey = players.map((row) => row.name).sort().join('|')
  
  return [players, totalValue, lineupKey]
}

export const l = (lineup, prop) => {
  if(prop === "value") {
    return lineup[1]
  }
  if(prop === "key") {
    return lineup[2]
  }
}

export const dedupLineups = (lineups) => {
  const seenKeys = new Set()
  return lineups.filter((lineup) => {
    const lineupKey = l(lineup, "key")
    const wasSeen = seenKeys.has(lineupKey)
    !wasSeen && seenKeys.add(lineupKey)
    return !wasSeen
  })
}

export const cloneRoster = (roster) => {
  return JSON.parse(JSON.stringify(roster))
}

export const getRandomInt = (max) => {
  return Math.floor(Math.random() * max);
}

export const rand = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}