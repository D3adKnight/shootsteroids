import {sprite, stage, remove, particleEffect} from '../engine/display'
import {wrap} from '../engine/utilities'

import {Entity} from './entity'

export class Ship extends Entity {
  constructor (image) {
    super()

    this.sprite = sprite(image)
    this.sprite.width = this.sprite.halfWidth
    this.sprite.height = this.sprite.halfHeight
    stage.putCenter(this.sprite)

    this.vx = 0
    this.vy = 0
    this.acceleration = 0.2
    this.friction = 0.96
    this.rotationSpeed = 0

    this.moveForward = false

    this.lives = 3
    this.destroyed = false
    this.invulnerable = false
  }

  get rotation () {
    return this.sprite.rotation
  }

  get centerX () {
    return this.sprite.centerX
  }

  get centerY () {
    return this.sprite.centerY
  }

  update (dt) {
    if (this.destroyed) {
      return
    }

    this.sprite.rotation += this.rotationSpeed

    if (this.moveForward) {
      this.vx += this.acceleration * Math.sin(this.sprite.rotation)
      this.vy += -this.acceleration * Math.cos(this.sprite.rotation)
    } else {
      this.vx *= this.friction
      this.vy *= this.friction
    }

    this.sprite.x += this.vx
    this.sprite.y += this.vy

    wrap(this.sprite, stage.localBounds)
  }

  hit () {
    this.lives -= 1
    this.destroyed = true

    remove(this.sprite)
    particleEffect(this.centerX, this.centerY)

    setTimeout(() => this.respawn(), 1000)

    if (this.lives <= 0) {
      return true
    } else {
      return false
    }
  }

  respawn () {
    stage.addChild(this.sprite)
    stage.putCenter(this.sprite)
    this.sprite.rotation = 0

    this.destroyed = false

    this.invulnerable = true
    this.sprite.alpha = 0.5

    setTimeout(() => {
      this.invulnerable = false
      this.sprite.alpha = 1
    }, 4000)
  }
}
