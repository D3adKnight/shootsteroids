import Entity from './entity'

let ships = {}

class Ship extends Entity {
  constructor (id) {
    super(id)

    this.x = 0
    this.y = 0
    this.rotation = 0

    this.vx = 0
    this.vy = 0
    this.acceleration = 0.2
    this.friction = 0.96
    this.rotationSpeed = 0

    this.moveForward = false

    this.controls = {
      up: false,
      right: false,
      left: false,
      space: false
    }
  }

  update () {
    if (!this.controls.left) this.rotationSpeed = 0.0
    if (!this.controls.right) this.rotationSpeed = 0.0

    if (this.controls.left) this.rotationSpeed = -0.1
    if (this.controls.right) this.rotationSpeed = 0.1

    this.rotation += this.rotationSpeed

    if (this.controls.up) this.moveForward = true
    if (!this.controls.up && this.moveForward) this.moveForward = false

    if (this.moveForward) {
      this.vx += this.acceleration * Math.sin(this.rotation)
      this.vy += -this.acceleration * Math.cos(this.rotation)
    } else {
      this.vx *= this.friction
      this.vy *= this.friction
    }

    this.x += this.vx
    this.y += this.vy

    return {
      x: this.x,
      y: this.y,
      rotation: this.rotation
    }
  }

  static spawnShip (socket) {
    let ship = new Ship(socket.id)
    ships[ship.id] = ship
    socket.on('keyState', (data) => {
      ship.controls[data.key] = data.state
    })
  }

  static destroyShip (socket) {
    delete ships[socket.id]
  }

  static updateAll () {
    let pack = []
    Object.keys(ships).forEach(k => {
      let ship = ships[k]
      pack.push(ship.update())
    })

    return pack
  }
}

export default Ship
