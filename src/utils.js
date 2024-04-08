import { nameMapper, teamNameMapper } from './nameMapper.js'

export const convertTimeStringToDecimal = (timeString) => {
  const lookup = {
    '12:00pm ET': 12,
    '12:15pm ET': 12.25,
    '12:30pm ET': 12.5,
    '12:45pm ET': 12.75,
    '01:00pm ET': 13,
    '01:15pm ET': 13.25,
    '01:30pm ET': 13.5,
    '01:45pm ET': 13.75,
    '02:00pm ET': 14,
    '02:15pm ET': 14.25,
    '02:30pm ET': 14.5,
    '02:45pm ET': 14.75,
    '03:00pm ET': 15,
    '03:15pm ET': 15.25,
    '03:30pm ET': 15.5,
    '03:45pm ET': 15.75,
    '04:00pm ET': 16,
    '04:15pm ET': 16.25,
    '04:30pm ET': 16.5,
    '04:45pm ET': 16.75,
    '05:00pm ET': 17,
    '05:15pm ET': 17.25,
    '05:30pm ET': 17.5,
    '05:45pm ET': 17.75,
    '06:00pm ET': 18,
    '06:15pm ET': 18.25,
    '06:30pm ET': 18.5,
    '06:45pm ET': 18.75,
    '07:00pm ET': 19,
    '07:15pm ET': 19.25,
    '07:30pm ET': 19.5,
    '07:45pm ET': 19.75,
    '08:00pm ET': 20,
    '08:15pm ET': 20.25,
    '08:30pm ET': 20.5,
    '08:45pm ET': 20.75,
    '09:00pm ET': 21,
    '09:15pm ET': 21.25,
    '09:30pm ET': 21.5,
    '09:45pm ET': 21.75,
    '10:00pm ET': 22,
    '10:15pm ET': 22.25,
    '10:30pm ET': 22.5,
    '10:45pm ET': 22.75,
    '11:00pm ET': 23,
    '11:15pm ET': 23.25,
    '11:30pm ET': 23.5,
    '11:45pm ET': 23.75
}

  return lookup[timeString]
}

export const convertDateToDateString = (date) => {
  const localOffset = date.getTimezoneOffset() * 60000;
  const targetTime = new Date(date.getTime() - localOffset);
  const formattedDate = targetTime.toISOString();

  return formattedDate.split('T')[0]
}

export const getTodaysDate = () => {
  return new Date('2024-03-25')
}

export const getTodaysDateString = () => {
  const today = getTodaysDate()
  return convertDateToDateString(today)
  // return '2024-03-19'
}

export const getCurrentTimeDecimal = () => {
  let now = getTodaysDate()
  
  // Convert the time to Eastern Time Zone
  let easternTime = now.toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour12: false }).split(':');
  
  let hours = parseInt(easternTime[0], 10);
  let minutes = parseInt(easternTime[1], 10);
  
  let current_time_decimal = hours + (minutes / 60);
  
  current_time_decimal = Math.round(current_time_decimal * 100) / 100;
  
  return current_time_decimal;
}

export const isPlayerLocked = (startTime) => {
  const currentTime = getCurrentTimeDecimal()
  const decimalStartTime = convertTimeStringToDecimal(startTime)
  return decimalStartTime < currentTime
}

export const queryData = async (url, noCache=false) => {
  // Fetch the CSV file
  const response = await fetch(url, {
    headers: {
      'Cache-Control': noCache ? 'no-cache' : 'max-age=600',
    },
  })
  const data = await response.text()
  if(data.includes('<Error><Code>AccessDenied</Code><Message>Access Denied</Message>')) {
    return null
  }

  return data
}

export const splitData = (data, teamColumn = null) => {
  if(data === null) {
    return []
  }

  const toReturn = data.split('\n').filter(i => i).map((row) => row.split(','))
  if(teamColumn) {
    toReturn.forEach((row) => {
      if(!(row[teamColumn] in teamNameMapper)) {
        return
      }

      row[teamColumn] = teamNameMapper[row[teamColumn]]
    })
  }

  return toReturn
}

export const loadPlayerDataForSlate = async (slate) => {
  const formattedDate = getTodaysDateString()
  const data4 = await queryData(`https://amichai-dfs-data.s3.amazonaws.com/slate_player_data_${formattedDate}_${slate[2]}`)
  const player_data = splitData(data4, 5)

  const toReturn = player_data.sort((a, b) => {
    return parseFloat(a[3]) < parseFloat(b[3]) ? 1 : -1
  })


  return toReturn.filter((obj, index, self) =>
    index === self.findIndex((t) => t[0] === obj[0])
  )
}

export const setupTableData = (playerData, slateData, teamData, slateName) => {
  const overrides = localStorage.getItem('slateToIdToOverride') ? JSON.parse(localStorage.getItem('slateToIdToOverride')) : {}
  const nameToPlayerData = {}
  for(const row of playerData) {
    let name = row[0]
    if(name in nameMapper) {
      name = nameMapper[name]
    }

    nameToPlayerData[name] = row
  }

  const teamToStartTime = teamData.reduce((acc, row) => {
    const team = row[0]
    acc[team] = row[2]
    return acc
  }, {})

  const teamToOpponent = teamData.reduce((acc, row) => {
    const team = row[0]
    acc[team] = row[1]
    return acc
  }, {})

  return slateData.map((row) => {
    let name = row[1]
    if(name in nameMapper) {
      name = nameMapper[name]
    } 

    const team = row[4]
    const opponent = teamToOpponent[team]
    if(!opponent) {
      // name mapping problem?
      debugger
    }

    const startTime = teamToStartTime[team]

    if(!startTime) {
      // name mapping problem?
      debugger
    }

    const playerData = nameToPlayerData[name]
    if (!playerData) {
      ///Are you missing a name conversion here?
      return {
        name: name,
        playerId: row[0],
        position: row[2],
        salary: row[3],
        cost: parseInt(row[3]),
        team,
        projection: 0,
        override: 0,
        status: row[6],
        opp: opponent,
        startTime,
      }
    }

    let projection = '0.0'

    if(slateName.includes('DK')) {
      projection = playerData[3]
    } else {
      projection = playerData[2]
    }

    const status = playerData[4]
    if (status === 'O') {
      row.push('0.0')
      projection = '0.0'
    } else {
      row.push(projection)
    }
    row.push(status)

    const projectionRounded = Math.round(parseFloat(projection) * 100) / 100;

    return {
      name: row[1],
      playerId: row[0],
      position: row[2],
      salary: row[3],
      cost: parseInt(row[3]),
      team,
      projection: projectionRounded,
      override: overrides ? overrides[row[0]] ?? projectionRounded : projectionRounded,
      status,
      opp: opponent,
      startTime,
    }
  })
}

export const postRosterSet = async (type, rosterSet, contests, site, slate) => {
  ///get roster count
  ///get all contests
  /// get player exposures
  const rosterCount = rosterSet.length
  const playerExposures = {}
  rosterSet.forEach((roster) => {
    roster.players.forEach((player) => {
      if(!(player.name in playerExposures)) {
        playerExposures[player.name] = 1
      } else {
        playerExposures[player.name] += 1
      }
    })
  })

  const contestToEntries = {}
  contests.split('\n').forEach((row) => {
    const parts = row.split(',')
    const entryId = parts[0]
    const contestName = parts[1]
    const contestId = parts[2]
    const entryFee = parts[3]
    if(!(contestId in contestToEntries)) {
      contestToEntries[contestId] = {
        info: {
          contestName,
          entryFee,
        },
        entries: []
      }
    }

    contestToEntries[contestId].entries.push(entryId)
  })

  await postAnalytics(type, {
    rosterCount,
    site,
    playerExposures,
    contestToEntries,
    slate: slate ?? '',
  })
}


export const postAnalytics = async (type, data) => {
  const date = getTodaysDateString()
  const time = getCurrentTimeDecimal()
  const body = JSON.stringify({
    value: encodeURI(JSON.stringify({
      ...data,
      date,
      time,
    }))
  })

  const response = await fetch(`https://icw7yaef4f.execute-api.us-east-1.amazonaws.com/dev/analytics_v2?type=${type}&date=${date}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },

    body,
  })

  return response
}