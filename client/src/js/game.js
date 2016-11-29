import {makeCanvas, remove, render, stage, sprite, text, background, particles, particleEffect} from './engine/display'
import {assets, wrap, outsideBounds, randomInt, randomFloat} from './engine/utilities'
import {keyboard} from './engine/interactive'
import {movingCircleCollision, circleRectangleCollision} from './engine/collision'

assets.load([
  'bgs/darkPurple.png',
  'fonts/kenvector_future_thin.ttf',
  'sounds/sfx_laser1.mp3',
  'sprites/sheet.json'
]).then(() => setup())

// define 'main' variables
let canvas, ship, message, shootSfx, bg
let bullets = []
let asteroids = []

let score = 0

function shoot (
            shooter, angle, offsetFromCenter,
            bulletSpeed, bulletsArray, bulletSprite) {
  let bullet = bulletSprite()

  bullet.x = shooter.centerX - bullet.halfWidth + (offsetFromCenter * Math.cos(angle))
  bullet.y = shooter.centerY - bullet.halfHeight + (offsetFromCenter * Math.sin(angle))

  bullet.vx = Math.sin(angle) * bulletSpeed
  bullet.vy = -Math.cos(angle) * bulletSpeed

  bullet.rotation = angle

  bulletsArray.push(bullet)

  particleEffect(bullet.x, bullet.y)
  shootSfx.play()
}

function spawnAsteroid () {
  let x = randomInt(0, stage.localBounds.width)
  let y = randomInt(0, stage.localBounds.height)

  let asteroid = sprite(assets['meteorBrown_big1.png'], x, y)
  asteroid.circular = true
  asteroid.diameter = 90

  asteroid.vx = randomFloat(-5, 5)
  asteroid.vy = randomFloat(-5, 5)

  asteroid.rotationSpeed = randomFloat(0.01, 0.07)

  asteroids.push(asteroid)
}

// Let's party begins!
function setup () {
  canvas = makeCanvas(1280, 720, 'none')
  stage.width = canvas.width
  stage.height = canvas.height

  shootSfx = assets['sounds/sfx_laser1.mp3']

  bg = background(assets['bgs/darkPurple.png'], canvas.width, canvas.height)

  ship = sprite(assets['playerShip2_red.png'])
  ship.scaleX = 0.5
  ship.scaleY = 0.5
  stage.putCenter(ship)

  ship.vx = 0
  ship.vy = 0
  ship.accelerationX = 0.2
  ship.accelerationY = 0.2
  ship.friction = 0.96
  ship.speed = 0

  ship.rotationSpeed = 0

  ship.moveForward = false

  ship.lives = 3
  ship.destroyed = false

  let leftArrow = keyboard(37)
  let rightArrow = keyboard(39)
  let upArrow = keyboard(38)
  let space = keyboard(32)

  leftArrow.press = () => { ship.rotationSpeed = -0.1 }
  leftArrow.release = () => {
    if (!rightArrow.isDown) ship.rotationSpeed = 0
  }

  rightArrow.press = () => { ship.rotationSpeed = 0.1 }
  rightArrow.release = () => {
    if (!leftArrow.isDown) ship.rotationSpeed = 0
  }

  upArrow.press = () => { ship.moveForward = true }
  upArrow.release = () => { ship.moveForward = false }

  space.press = () => {
    shoot(
            ship, ship.rotation, 14, 10, bullets,
            () => sprite(assets['laserRed07.png'])
        )
    shoot(
            ship, ship.rotation, -14, 10, bullets,
            () => sprite(assets['laserRed07.png'])
        )
  }

  message = text('Hello!', '16px kenvector_future_thin', 'white', 8, 8)

  for (let i = 0; i < 5; i++) {
    spawnAsteroid()
  }

  gameLoop()
}

function gameLoop () {
  requestAnimationFrame(gameLoop)

  if (particles.length > 0) {
    particles.forEach(particle => {
      particle.update()
    })
  }

  bullets = bullets.filter(bullet => {
    bullet.x += bullet.vx
    bullet.y += bullet.vy

    let collision = outsideBounds(bullet, stage.localBounds)

    if (collision) {
      remove(bullet)
      return false
    }

    return true
  })

  for (let i = 0; i < asteroids.length; i++) {
    let a1 = asteroids[i]

    // update asteroid
    a1.rotation += a1.rotationSpeed
    a1.x += a1.vx
    a1.y += a1.vy

    wrap(a1, stage.localBounds)

    // check collisisons
    // between asteroids
    for (let j = i + 1; j < asteroids.length; j++) {
      let a2 = asteroids[j]

      movingCircleCollision(a1, a2)
    }
        // and with player
    let playerHit = circleRectangleCollision(a1, ship, true)
    if (playerHit) {
      ship.lives -= 1
      // destroy ship
      ship.destroyed = true
      // stage.removeChild(ship);
      particleEffect(ship.centerX, ship.centerY)

      // respawn ship
      setTimeout(() => {
        // stage.addChild(ship);
        stage.putCenter(ship)
        ship.rotation = 0
        ship.destroyed = false
      }, 1000)
    }
  }

  if (!ship.destroyed) {
    ship.rotation += ship.rotationSpeed

    if (ship.moveForward) {
      ship.vx += ship.accelerationX * Math.sin(ship.rotation)
      ship.vy += -ship.accelerationY * Math.cos(ship.rotation)
    } else {
      ship.vx *= ship.friction
      ship.vy *= ship.friction
    }

    ship.x += ship.vx
    ship.y += ship.vy

    wrap(ship, stage.localBounds)
  }

  bg.x -= Math.floor(ship.vx)
  bg.y -= Math.floor(ship.vy)

  message.content = 'Scores: ' + score

  render(canvas)
}
