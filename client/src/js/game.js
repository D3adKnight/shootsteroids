// Import engine code
import {makeCanvas, remove, render, stage, sprite, text, background, particles} from './engine/display'
import {assets, outsideBounds} from './engine/utilities'
import {keyboard} from './engine/interactive'
import {circleRectangleCollision} from './engine/collision'

// Import game code
import {Asteroid, spawnAsteroid} from './game/asteroid'
import {Ship} from './game/ship'
import {HUD} from './game/hud'

assets.load([
  'bgs/darkPurple.png',
  'fonts/kenvector_future_thin.ttf',
  'sounds/sfx_laser1.mp3',
  'sprites/sheet.json'
]).then(() => setup())

// define 'main' variables
let canvas, ship, hud, shootSfx, bg
let bullets = []
let isGameOver

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

  // particleEffect(bullet.x, bullet.y)
  shootSfx.play()
}

// Let's party begins!
function setup () {
  canvas = makeCanvas(1280, 720, 'none')
  stage.width = canvas.width
  stage.height = canvas.height

  shootSfx = assets['sounds/sfx_laser1.mp3']

  bg = background(assets['bgs/darkPurple.png'], canvas.width, canvas.height)

  ship = new Ship(assets['playerShip2_red.png'])

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

  for (let i = 0; i < 5; i++) {
    spawnAsteroid()
  }

  hud = new HUD()

  gameLoop()
}

function gameLoop () {
  if (isGameOver) return

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

    let asteroids = Asteroid.asteroids
    for (let i = 0; i < asteroids.length; i++) {
      let hit = circleRectangleCollision(bullet, asteroids[i].sprite)
      if (hit) {
        score += asteroids[i].hit(2)
        remove(bullet)
        return false
      }
    }

    return true
  })

  Asteroid.updateAll()

  if (!ship.invulnerable) {
    Asteroid.asteroids.forEach(a => {
      let playerHit = circleRectangleCollision(a.sprite, ship.sprite, true)
      if (playerHit) {
        isGameOver = ship.hit()
      }
    })
  }

  ship.update()

  bg.x -= Math.floor(ship.vx)
  bg.y -= Math.floor(ship.vy)

  // message.content = 'Scores: ' + score
  hud.update(score, ship.lives, isGameOver)

  render(canvas)

  requestAnimationFrame(gameLoop)
}
