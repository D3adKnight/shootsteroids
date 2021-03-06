/*
let Entity = function () {
  let self = {
    id: '',
    x: 320,
    y: 240,
    vx: 0,
    vy: 0,
    rotation: 0
  }

  self.update = function () {
    self.updatePosition()
  }

  self.updatePosition = function () {
    self.x += self.vx
    self.y += self.vy
  }

  self.distance = function (pt) {
    return Math.sqrt(Math.pow(self.x - pt.x, 2) + Math.pow(self.y - pt.y, 2))
  }

  return self
}

let Player = function (id) {
  let self = Entity()
  self.id = id
  self.acceleration = 0.2
  self.friction = 0.98
  self.move = false
  // controls
  self.controls = {
    right: false,
    left: false,
    up: false,
    shoot: false
  }

  self.shoot = function () {
    let b = Bullet(self.id, self.rotation)
    b.x = self.x
    b.y = self.y
  }

  let superUpdatePosition = self.updatePosition
  self.updatePosition = function () {
    if (self.controls.right) {
      self.rotation += 0.1
    }
    if (self.controls.left) {
      self.rotation -= 0.1
    }
    if (self.controls.up) {
      self.move = true
    }
    if (!self.controls.up && self.move) {
      self.move = false
    }

    if (self.move) {
      self.vx += self.acceleration * Math.sin(self.rotation)
      self.vy += -self.acceleration * Math.cos(self.rotation)
    } else {
      self.vx *= self.friction
      self.vy *= self.friction
    }

    superUpdatePosition()
  }

  let superUpdate = self.update
  self.update = function () {
    superUpdate()

    if (self.controls.shoot) {
      self.shoot()
    }
  }

  Player.list[id] = self
  return self
}

Player.list = {}

Player.onConnect = function (socket) {
  let player = Player(socket.id)
  socket.on('keyState', function (data) {
    player.controls[data.key] = data.state
  })
}

Player.onDisconnect = function (socket) {
  delete Player.list[socket.id]
}

Player.update = function () {
  var pack = []
  Object.keys(Player.list).forEach(p => {
    let player = Player.list[p]
    player.update()

    pack.push({
      number: player.number,
      x: player.x,
      y: player.y,
      rotation: player.rotation
    })
  })

  return pack
}

let Bullet = function (parent, angle) {
  var self = Entity()
  self.parent = parent
  self.id = Math.random()
  self.vx = Math.sin(angle) * 10
  self.vy = -Math.cos(angle) * 10

  self.timer = 0
  self.toRemove = false

  let superUpdate = self.update
  self.update = function () {
    if (self.timer++ > 100) {
      self.toRemove = true
    }
    superUpdate()

    Object.keys(Player.list).forEach(p => {
      let player = Player.list[p]
      if (self.distance(player) < 32 && self.parent !== player.id) {
        self.toRemove = true
      }
    })
  }

  Bullet.list[self.id] = self
  return self
}

Bullet.list = {}

Bullet.update = function () {
  var pack = []

  Object.keys(Bullet.list).forEach(b => {
    let bullet = Bullet.list[b]
    bullet.update()
    if (bullet.toRemove) {
      delete Bullet.list[b]
    } else {
      pack.push({
        x: bullet.x,
        y: bullet.y
      })
    }
  })

  return pack
}
*/
import {
  IO_CONNECT,
  IO_DISCONNECT
} from '../shared/protocol'

import Ship from './ship'

// multiplayer support
let SOKET_LIST = {}

let playerCount = 0

let socketsSetup = (io) => {
  io.on(IO_CONNECT, socket => {
    console.log('client connected!')
    socket.id = Math.random().toString().replace(/\D/g, '')
    SOKET_LIST[socket.id] = socket
    Ship.spawnShip(socket)

    playerCount++
    io.emit('playerCount', playerCount)

    socket.on(IO_DISCONNECT, () => {
      console.log('client disconnected!')
      playerCount--
      io.emit('playerCount', playerCount)

      delete SOKET_LIST[socket.id]
      Ship.destroyShip(socket)
    })

    socket.on('sendChatMsg', data => {
      let playerName = ('' + socket.id)
      io.emit('reciveChatMsg', (playerName + ': ' + data))
    })
  })

  setInterval(() => {
    /* let pack = {
      players: Player.update(),
      bullets: Bullet.update()
    }
    */
    let pack = Ship.updateAll()

    if (pack.length > 0) {
      Object.keys(SOKET_LIST).forEach(s => {
        let socket = SOKET_LIST[s]
        socket.emit('positions', pack)
      })
    }
  }, 1000 / 30) // 25fps server tick
}

export default socketsSetup
