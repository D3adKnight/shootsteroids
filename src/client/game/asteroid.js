import {assets, wrap, randomInt, randomFloat} from '../engine/utilities'
import {sprite, stage, remove, particleEffect} from '../engine/display'
import {movingCircleCollision} from '../engine/collision'

import {Entity} from './entity'

/*
  Assets list
*/
const _assets = {
  'big': [
    'meteorBrown_big1.png',
    'meteorGrey_big1.png',
    'meteorBrown_big2.png',
    'meteorGrey_big2.png',
    'meteorBrown_big3.png',
    'meteorGrey_big3.png',
    'meteorBrown_big4.png',
    'meteorGrey_big4.png'
  ],

  'med': [
    'meteorBrown_med1.png',
    'meteorGrey_med1.png',
    'meteorBrown_med2.png',
    'meteorGrey_med2.png'
  ],

  'small': [
    'meteorBrown_small1.png',
    'meteorGrey_small1.png',
    'meteorBrown_small2.png',
    'meteorGrey_small2.png'
  ],

  'tiny': [
    'meteorBrown_tiny1.png',
    'meteorGrey_tiny1.png',
    'meteorBrown_tiny2.png',
    'meteorGrey_tiny2.png'
  ]
}

const _stats = {
  'big': {
    hp: 10,
    mass: 10,
    score: 20
  },
  'med': {
    hp: 7,
    mass: 7,
    score: 15
  },
  'small': {
    hp: 5,
    mass: 5,
    score: 10
  },
  'tiny': {
    hp: 3,
    mass: 3,
    score: 5
  }
}

let _asteroids = []

export class Asteroid extends Entity {
  constructor (size = 'big', x = 0, y = 0) {
    super()

    this.size = size
    Object.assign(this, _stats[size])

    let i = randomInt(0, _assets[size].length - 1)
    let image = assets[_assets[size][i]]
    x = (x !== 0) ? x : randomInt(0, stage.localBounds.width)
    y = (y !== 0) ? y : randomInt(0, stage.localBounds.height)
    this.sprite = sprite(image, x, y)

    this.sprite.circular = true
    this.sprite.diameter = image.w

    this.sprite.vx = randomFloat(-5, 5)
    this.sprite.vy = randomFloat(-5, 5)
    this.rotationSpeed = randomFloat(0.01, 0.07)

    _asteroids.push(this)
  }

  update (dt) {
    this.sprite.rotation += this.rotationSpeed
    this.sprite.x += this.sprite.vx
    this.sprite.y += this.sprite.vy

    wrap(this.sprite, stage.localBounds)

    // check collisions
    _asteroids.forEach(a => {
      if (a.id === this.id) return // don't collide with self xD
      movingCircleCollision(this.sprite, a.sprite)
    })
  }

  static updateAll (dt) {
    let destroyed = []
    _asteroids.forEach(a => {
      if (a.hp <= 0) {
        destroyed.push(a)
      } else {
        a.update(dt)
      }
    })

    destroyed.forEach(da => da.destroy())
  }
/*
  static checkCollisions (collider) {
    _asteroids
  }
*/
  static get asteroids () {
    return _asteroids
  }

  hit (damage) {
    this.hp -= damage
    if (this.hp <= 0) {
      return this.score
    }
    return 0
  }

  destroy () {
    remove(this.sprite)
    _asteroids.splice(_asteroids.indexOf(this), 1)

    particleEffect(this.sprite.x, this.sprite.y,
                  () => sprite(assets['meteorBrown_tiny1.png']), 10, 0,
                  true, 0, 7, 16, 32)

    // spawn asteroids if destroy big/med asteroids
    if (this.size === 'big' || this.size === 'med') {
      let toSpawn = 0
      let spawnSize = 'small'
      let dice = (Math.floor(Math.random() * 3) % 2)
      if (this.size === 'big') {
        toSpawn = dice ? 3 : 2
        spawnSize = dice ? 'small' : 'med'
      } else if (this.size === 'med') {
        toSpawn = dice ? 2 : 1
        spawnSize = dice ? 'small' : 'tiny'
      }

      for (let i = 0; i < toSpawn; i++) {
        spawnAsteroid(spawnSize, this.sprite.x, this.sprite.y)
      }
    }
  }
}

export function spawnAsteroid (size = 'big', x = 0, y = 0) {
  let asteroid = new Asteroid(size, x, y)
  return asteroid
}
