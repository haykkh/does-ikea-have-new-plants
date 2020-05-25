/**
 * @fileoverview view components
 *
 * @author       Hayk Khachatryan
 *
 * @requires     styles/content.scss
 */

import '/styles/content.scss'
// eslint-disable-next-line no-unused-vars
import { Plant, State } from '/types'

/**
 * Renders title showing whether there was an update today or not
 *
 * @param {{ fetching: boolean; updateToday: boolean }} props system state
 *
 * @returns {JSX.Element} <h1 /> indicating update status
 */
const UpdateSection = (props: {
  fetching: boolean
  updateToday: boolean
}): JSX.Element => (
  <h1 id="update">
    {props.fetching
      ? 'Checking'
      : props.updateToday
      ? 'Yes, IKEA has new plants today.'
      : 'No, IKEA does not have new plants today'}
  </h1>
)

/**
 * Renders list of recently added plants
 *
 * @param {{ fetching: boolean; recents: Plant[] }} props system state
 *
 * @returns {JSX.Element} <ul /> of recently added plants with <h2 /> title
 */
const RecentsSection = (props: {
  fetching: boolean
  recents: Plant[]
}): JSX.Element =>
  props.fetching ? null : (
    <section id="recents">
      <h2>Recently added</h2>
      <ul>
        {props.recents.map(plant => (
          <li>
            <a href={plant.url}>
              {plant.name[0] + plant.name.slice(1).toLowerCase()}
            </a>
          </li>
        ))}
      </ul>
    </section>
  )

/**
 * Renders footer with Հայկ link
 *
 * @returns {JSX.Element} <footer /> linking to hayk.earth/
 */
const Footer = (): JSX.Element => (
  <footer>
    <span>
      made with <span class="red">❤</span> by{' '}
      <a class="red" href="https://hayk.earth">
        Հայկ
      </a>
    </span>
  </footer>
)

/**
 * Renders body of app containing UpdateSection, RecentsSection, and Footer
 *
 * @param {State} state system state
 *
 * @returns {JSX.Element} <main />
 */
const Main = (state: State): JSX.Element => (
  <main>
    {UpdateSection(state)}
    {RecentsSection(state)}
    {Footer()}
  </main>
)

export default Main
