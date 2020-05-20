/**
 * @fileoverview initializes system state
 *
 * @author       Hayk Khachatryan
 *
 * @requires     utills.ts
 * @requires     actions.ts
 */

import { fetchDB } from '/utils'
import { SetRecents, SetFetching, SetUpdateToday } from '/actions'

export default [
  {
    fetching: false,
    updateToday: false,
    recents: {}
  },
  [
    fetchDB,
    {
      file: process.env.DB_FILE,
      ondatabaseupdate: SetRecents,
      ontodayupdate: SetUpdateToday,
      onstart: [SetFetching, true],
      onfinish: [SetFetching, false]
    }
  ]
]
