import {text, sprite, group, stage} from '../engine/display'
import {assets} from '../engine/utilities'

class Lives {
  constructor (liveSprite, x, y) {
    this.template = liveSprite
    this.lives = group()
    this.lives.x = x
    this.lives.y = y
    this.liveSprites = []
    this.offset = liveSprite.w + 10
  }

  update (lives) {
    if (this.liveSprites.length < lives) {
      let i = this.liveSprites.length
      let posX = 0
      for (; i <= lives; i++) {
        let live = sprite(this.template)
        live.x = posX
        this.liveSprites.push(live)
        this.lives.addChild(live)

        posX += this.offset
      }
    } else {
      // bla-bla
    }
  }
}

export class HUD {
  constructor () {
    this.scores = text('Hello!', '16px kenvector_future_thin', 'white', 8, 8)
    this.lives = new Lives(assets['playerLife2_red.png'], stage.width - 142, 8)
    this.gameOver = text('Game Over', '48px kenvector_future_thin', 'white', 495, 340)
    this.gameOver.visible = false
  }

  update (scores, lives, isGameOver) {
    this.scores.content = `Scores: ${scores}`
    this.lives.update(lives)
    if (isGameOver) {
      this.gameOver.visible = true
    }
  }
}
