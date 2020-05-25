/**
 * @fileoverview main entry imported by index.html
 *
 * @author       Hayk Khachatryan
 *
 * @requires     NPM:hyperapp
 * @requires     NPM:sanitize.css
 * @requires     NPM:dotenv
 * @requires     init.ts
 * @requires     views/app.tsx
 */

import { app } from 'hyperapp'

// App init imports
import init from '/init'
import view from '/views/app'

import 'sanitize.css'
import 'sanitize.css/typography.css'
import '/styles/base.scss'

require('dotenv').config()

// Initialize the app on the #app div
app({ init, view, node: document.getElementById('app') })

// Enable the service worker when running the build command
// if (process.env.NODE_ENV === 'production') {
//   navigator.serviceWorker.register(`${window.location.origin}/sw.js`)
// }
