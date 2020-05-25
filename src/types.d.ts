/**
 * @fileoverview type definitions
 *
 * @author       Hayk Khachatryan
 */

interface IKEAPlant {
  [key: string]: string
  id: string
  name: string
  pipUrl: string
}

interface IKEAPlantDb {
  [key: string]: any
  moreProducts: {
    productWindow: IKEAPlant[]
  }
}

interface Plant {
  id: string
  name: string
  url: string
}

interface DatedPlants {
  date: string
  plants: Plant[]
}

interface PlantDb {
  allPlants: DatedPlants[]
  recents: Plant[]
}

interface State {
  fetching: boolean
  updateToday: boolean
  recents: Plant[]
}

export { IKEAPlant, IKEAPlantDb, Plant, DatedPlants, PlantDb, State }
