/**
 * @fileoverview `brains` of the operation
 *
 * @author       Hayk Khachatryan
 *
 * @requires     NPM:hubdb
 * @requires     types.ts
 */

import { IKEAPlant, IKEAPlantDb, Plant, DatedPlants, PlantDb } from '/types'

const Hubdb = require('hubdb')

/**
 * Inits a Hubdb object with env vars
 *
 * @returns {{}} initiated Hubdb object
 */
const initHubDb = (): {} =>
  Hubdb({
    token: process.env.GH_TOKEN,
    username: process.env.GH_USERNAME,
    repo: process.env.GH_REPO,
    branch: process.env.GH_REPO_BRANCH
  })

/**
 * Returns the current UTC date as a YYYYMMDD string
 * adds a leading zero to date.getUTCMonth & date.getUTCDate()
 * if they don't have one
 *
 * @example
 * // for May 14, 2020
 * getDate() // 20200514
 *
 * @returns {string} current UTC date in YYYYMMDD
 */
const getDate = (): string => {
  const date = new Date()
  return [
    date.getUTCFullYear(),
    ('0' + (date.getUTCMonth() + 1)).slice(-2),
    ('0' + date.getUTCDate()).slice(-2)
  ].join('')
}

/**
 * Gets IKEA product list JSON using fetch() and returns it as a promised object
 *
 * @param {string} url location of JSON
 *
 * @returns {Promise<IKEAPlantDb>} promised IKEAPlantDb
 */
const fetchIKEAJSONData = async (url: string): Promise<IKEAPlantDb> =>
  await fetch(url, {
    method: 'GET'
  }).then(response => response.json())

/**
 * Gets database from github using Hubdb as promised object
 * required as Hubdb.get() doesn't return a promise
 * needs to be properly formated JSON file
 *
 * @param {{ get?: any }} db   Hubdb object
 * @param {string}        file name of database file in db including extension
 *
 * @example
 * fetchHubData(db, 'db.json')
 *
 * @todo handle error for this
 *
 * @returns {Promise<PlantDb>} promised database
 */
const fetchHubData = (db: { get?: any }, file: string): Promise<PlantDb> =>
  new Promise((resolve, reject) => db.get(file, (_err, res) => resolve(res)))

/**
 * Generates an array of all IDs of plants from github database
 *
 * @param {PlantDb} hubData hub database containing plants
 *
 * @example
 * const db = {
 *    allPlants: [
 *    {
 *      date: date1,
 *      plants: [
 *        {
 *          id: id1,
 *          name: name1,
 *          url: url1
 *        },
 *        {
 *          id: id2,
 *          name: name2,
 *          url: url2
 *        },
 *      ]
 *    }]
 * }
 *
 * generateIdArray(db) // [id1, id2]
 *
 *
 * @returns {string[]} array of IDs of plants
 */
const generateIdArray = (hubData: PlantDb): string[] => {
  if (hubData.allPlants.length > 0) {
    return hubData.allPlants
      .map(date => {
        if (date.plants.length > 0) {
          return date.plants.map(plant => plant.id)
        }
        return []
      })
      .flat()
  }
  return []
}

/**
 * If `plant` is in `ids` pushes `plant` into `result`
 *
 * @param {Plant[]}   accumulator .reduce accumulator
 * @param {string[]}  ids          array of IDs of plants already in hub database
 * @param {IKEAPlant} plant        plant that is checked
 *
 * @returns {Plant[]} accumulator returned with or without the new plant
 */

const checkNewPlant = (
  accumulator: Plant[],
  ids: string[],
  plant: IKEAPlant
): Plant[] => {
  if (!ids.includes(plant.id)) {
    accumulator.push({
      id: plant.id,
      name: plant.name,
      url: plant.pipUrl
    })
  }
  return accumulator
}

/**
 * Reduces plants fetched from IKEA API to new ones
 * reduce used instead of map as map iterates and creates a value for every element of `ikea`
 * reduce allows us to ignore already existing elements entirely
 *
 * Uses checkNewPlant() to filter out existing plants
 *
 * @param {IKEAPlant[]} ikea array of plants received from IKEA API
 * @param {string[]}    ids  array of IDs of plants already in hub database
 *
 * @returns {Plant[]} array of plant objects containing their id, name, and url
 */

const newPlants = (ikea: IKEAPlant[], ids: string[]): Plant[] =>
  ikea.reduce(
    (accumulator, plant) => checkNewPlant(accumulator, ids, plant),
    []
  )

/**
 * Cross references plants received from IKEA (`ikea`) with plants already in database `ids`
 * Returns a DatedPlants object with today's date and all the new plants added today
 *
 * @param {IKEAPlant[]} ikea array of plants received from IKEA API
 * @param {string[]} ids     array of IDs of plants already in hub database
 *
 * @returns {DatedPlants} an object containing today's date and all the new plants added today
 */
const getNewPlants = (ikea: IKEAPlant[], ids: string[]): DatedPlants => ({
  date: getDate(),
  plants: newPlants(ikea, ids)
})

/**
 * Generates an array of 5 most recent plants, recursively
 *
 * First checks if there are already 5 most recent plants (base case)
 *   in which case returns plants
 * Then adds plants from hub database recents
 * Then adds plants from all the plants in hub database
 *   (^ first extracts plants the hub database using .map)
 *
 * @param {DatedPlants[]} allPlants array of all the plants in hub database
 * @param {Plant[]} hubDataRecents  array of the recent plants in hub database
 * @param {Plant[]} someRecents     array containing some recents
 *                                  starts off as newPlants.plants (the plants added today)
 * @param {number} leftToUpdate     plants left to add to reach 5
 *
 * @returns {Plant[]} array of 5 most recent plants
 */
const recurRecents = (
  allPlants: DatedPlants[] | Plant[],
  hubDataRecents: Plant[],
  someRecents: Plant[],
  leftToUpdate: number
): Plant[] => {
  // no more plants left to reach 5
  if (leftToUpdate === 0) {
    return someRecents
  }

  // add plants from hub database recents
  if (hubDataRecents.length > 0) {
    return recurRecents(
      allPlants,
      hubDataRecents,
      someRecents.concat(hubDataRecents.shift()),
      leftToUpdate - 1
    )
  }
  // add plants from all the plants in hub database
  else if (allPlants.length > 0) {
    // if you haven't already, create array of plants from allPlants (effectively remove date properties)
    if ((allPlants as DatedPlants[])[0].date) {
      allPlants = (allPlants as DatedPlants[]).map(date => date.plants).flat()
    }
    return recurRecents(
      allPlants,
      hubDataRecents,
      someRecents.concat((allPlants as Plant[]).shift()),
      leftToUpdate - 1
    )
  }
}

/**
 * Returns an array of the 5 most recent plants
 *
 * If more than 4 plants added today, return the first 5
 * else recursively check for plants already in the hub databasw
 *
 * @param {PlantDb} hubData       hub database containing plants
 * @param {DatedPlants} newPlants today's date and all the new plants added today
 *
 * @returns {Plant[]} array of the 5 most recent plants
 */
const updateRecents = (hubData: PlantDb, newPlants: DatedPlants): Plant[] => {
  if (newPlants.plants.length > 4) {
    return newPlants.plants.slice(0, 5)
  } else if (newPlants.plants.length < 5) {
    const allPlants = hubData.allPlants
    const hubDataRecents = hubData.recents
    return recurRecents(
      allPlants,
      hubDataRecents,
      newPlants.plants,
      5 - newPlants.plants.length
    )
  }
}

/**
 * Called when plants have been added on multiple visits to the site today
 * Injects new plants into the same date in hubData
 *
 * @param {PlantDb} hubData       hub database containing plants
 * @param {DatedPlants} newPlants today's date and all the new plants added today
 */
const addPlantsMultipleUpdatesToday = (
  hubData: PlantDb,
  newPlants: DatedPlants
): void => {
  const hubIndex = hubData.allPlants.findIndex(i => i.date === newPlants.date)
  hubData.allPlants[hubIndex].plants.unshift.apply(
    hubData.allPlants[hubIndex].plants,
    newPlants.plants
  )
}

/**
 * Adds new plants to hubData and checks if there is an update today
 *
 * First checks if there has already been another update today
 *   updates recents
 *   injects new plants into today's date in hubData
 * Else checks if there are new plants
 *   updates recents
 *   add new plants to hubData as a new date
 *
 * @param {PlantDb} hubData       hub database containing plants
 * @param {DatedPlants} newPlants today's date and all the new plants added today
 *
 * @returns {{
 *     hubData: PlantDb,    hub database containing plants
 *     updateToday: boolean was there an update today?
 *   }}
 */
const addToHubDataAndCheckUpdate = (
  hubData: PlantDb,
  newPlants: DatedPlants
): {
  hubData: PlantDb
  updateToday: boolean
} => {
  let updateToday = false
  if (hubData.allPlants.map(elem => elem.date).includes(newPlants.date)) {
    updateToday = true
    hubData.recents = updateRecents(hubData, newPlants)
    addPlantsMultipleUpdatesToday(hubData, newPlants)
  } else if (newPlants.plants.length > 0) {
    updateToday = true
    hubData.recents = updateRecents(hubData, newPlants)
    hubData.allPlants.unshift(newPlants)
  }

  return { hubData: hubData, updateToday: updateToday }
}

/**
 * Updates database on Github
 *
 * @todo handle error
 *
 * @param {{ update?: any }} db HubDb object
 * @param {string} dbFile       database file in Github repo
 * @param {PlantDb} hubData     database to update into Github
 */
const updateGhDb = (
  db: { update?: any },
  dbFile: string,
  hubData: PlantDb
): void =>
  db.update(dbFile, hubData, (_err, res) => {
    if (_err) {
      console.log(_err)
    }
  })

export const fetchDB = (
  dispatch: any,
  options: {
    onstart: () => void
    ontodayupdate: () => void
    ondatabaseupdate: () => void
    onfinish: () => void
  }
): void => {
  // dispatch start function
  dispatch(options.onstart)

  const db = initHubDb()

  const apiUrl = process.env.API_URL
  const dbFile = process.env.DB_FILE

  // get ikea
  const ikeaData = fetchIKEAJSONData(apiUrl).then(
    res => res.moreProducts.productWindow
  )

  // get hubdb
  const hubData = fetchHubData(db, dbFile)

  // get ids
  const ids = hubData.then(hubres => generateIdArray(hubres))

  // cross ref ids, add to newPlants, and then hubData
  ikeaData
    // cross ref ids, add to newPlants
    .then(ikeares => ids.then(idsres => getNewPlants(ikeares, idsres)))
    // add to hubData, check updateToday, update recents
    .then(newPlants =>
      hubData.then(hubres => addToHubDataAndCheckUpdate(hubres, newPlants))
    )
    // update Github db, dispatch updateToday and recents to front end
    .then(({ hubData, updateToday }) => {
      updateGhDb(db, dbFile, hubData)
      dispatch(options.ontodayupdate, updateToday)
      dispatch(options.ondatabaseupdate, hubData.recents)
    })
    // dispatch finish function
    .finally(() => dispatch(options.onfinish))
}
