import { ref, onMounted, computed, nextTick, watch } from 'vue'
import { getTodaysDateString, queryData, splitData, loadPlayerDataForSlate, convertDateToDateString } from '../utils.js'

export function useDataManager() {
  const queryNewsFeed = async (date) => {
    const formattedDate = convertDateToDateString(date)
    const result = await queryData(`https://amichai-dfs-data.s3.amazonaws.com/news_feed_${formattedDate}`, true)
    if(!result) {
      return []
    }
    const rows = result.split('\n');
    return rows
  }

  const queryPlayerData = async (date) => {
    const formattedDate = convertDateToDateString(date)
    const data1 = await queryData(`https://amichai-dfs-data.s3.amazonaws.com/player_data_${formattedDate}`, true)
    return splitData(data1, 1)
  }
  
  const querySlateData = async (slate, date) => {
    const formattedDate = convertDateToDateString(date)
    const data4 = await queryData(`https://amichai-dfs-data.s3.amazonaws.com/slate_player_data_${formattedDate}_${slate}`)
    const player_data = splitData(data4, 5)

    const toReturn = player_data.sort((a, b) => {
      return parseFloat(a[3]) < parseFloat(b[3]) ? 1 : -1
    })


    return toReturn.filter((obj, index, self) =>
      index === self.findIndex((t) => t[0] === obj[0])
    )
  }

  const queryTeamData = async (date) => {
    const formattedDate = convertDateToDateString(date)
    const data3 = await queryData(`https://amichai-dfs-data.s3.amazonaws.com/team_data_${formattedDate}`)

    return splitData(data3)
  }

  const querySlates = async (date) => {
    const formattedDate = convertDateToDateString(date)
    const data2 = await queryData(`https://amichai-dfs-data.s3.amazonaws.com/slate_data_${formattedDate}`)
    return splitData(data2)
  }

  return {
    queryNewsFeed,
    queryPlayerData,
    querySlateData,
    queryTeamData,
    querySlates,
  }
}