/**
 * @fileoverview state updating actions
 *
 * @author       Hayk Khachatryan
 *
 * @requires     types.ts
 */

// eslint-disable-next-line no-unused-vars
import { State, Plant } from './types'

/**
 * Updates state.recents
 *
 * @param {State} state   system state
 * @param {Plant[]} recents new recents value
 *
 * @returns {State} updated state
 */
const SetRecents = (state: State, recents: Plant[]): State => ({
  ...state,
  recents
})

/**
 * Updates state.fetching
 *
 * @param {State} state      system state
 * @param {boolean} fetching new fetching value
 *
 * @returns {State}          updated state
 */
const SetFetching = (state: State, fetching: boolean): State => ({
  ...state,
  fetching
})

/**
 * Updates state.updateToday
 *
 * @param {State} state         system state
 * @param {boolean} updateToday new updateToday value
 *
 * @returns {State}             updated state
 */
const SetUpdateToday = (state: State, updateToday: boolean): State => ({
  ...state,
  updateToday
})

export { SetRecents, SetFetching, SetUpdateToday }
