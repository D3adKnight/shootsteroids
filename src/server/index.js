// @flow

import compression from 'compression'
import express from 'express'
import http from 'http'
import socketIO from 'socket.io'

import { APP_NAME, STATIC_PATH, WEB_PORT } from '../shared/config'
import { isProd } from '../shared/util'
import renderApp from './render-app'
import socketsSetup from './socket'

const app = express()
const server = http.createServer(app)
const io = socketIO(server)

socketsSetup(io)

app.use(compression())
app.use(STATIC_PATH, express.static('dist'))
app.use(STATIC_PATH, express.static('public'))
app.use(express.static('public/assets'))

app.get('/', (req, res) => {
  res.send(renderApp(APP_NAME))
})

// flow-disable-next-line
server.listen(WEB_PORT, () => {
  console.log(`Server running on port ${WEB_PORT} ${isProd ? '(production)'
    : '(development).\nKeep "npm run dev:wds running in an other terminal'}.`)
})
