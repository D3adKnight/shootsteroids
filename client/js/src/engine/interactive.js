import draggableSprites from './display'

export function keyboard (keyCode) {
  let key = {}
  key.code = keyCode
  key.isDown = false
  key.isUp = true
  key.press = undefined
  key.release = undefined

  key.downHandler = function (event) {
    if (event.keyCode === key.code) {
      if (key.isUp && key.press) key.press()
      key.isDown = true
      key.isUp = false
    }
    event.preventDefault()
  }

  key.upHandler = function (event) {
    if (event.keyCode === key.code) {
      if (key.isDown && key.release) key.release()
      key.isDown = false
      key.isUp = true
    }
    event.preventDefault()
  }

  window.addEventListener('keydown', key.downHandler.bind(key), false)
  window.addEventListener('keyup', key.upHandler.bind(key), false)

  return key
}

export function makePointer (element, scale = 1) {
  let pointer = {
    element: element,
    scale: scale,

    _x: 0,
    _y: 0,

    get x () {
      return this._x / this.scale
    },
    get y () {
      return this._y / this.scale
    },

    get centerX () {
      return this.x
    },
    get centerY () {
      return this.y
    },

    get position () {
      return {x: this.x, y: this.y}
    },

    isDown: false,
    isUp: true,
    tapped: false,

    downTime: 0,
    elapsedTime: 0,

    press: undefined,
    release: undefined,
    tap: undefined,

    dragSprite: null,
    dragOffsetX: 0,
    dragOffsetY: 0,

    moveHandler (event) {
      let element = event.target

      this._x = (event.pageX - element.offsetLeft)
      this._y = (event.pageY - element.offsetTop)

      event.preventDefault()
    },

    touchMoveHandler (event) {
      let element = event.target

      this._x = (event.targetTouches[0].pageX - element.offsetLeft)
      this._y = (event.targetTouches[0].pageY - element.offsetTop)

      event.preventDefault()
    },

    downHandler (event) {
      this.isDown = true
      this.isUp = false
      this.tapped = false

      this.downTime = Date.now()

      if (this.press) this.press()
      event.preventDefault()
    },

    touchStartHandler (event) {
      let element = event.target

      this._x = event.targetTouches[0].pageX - element.offsetLeft
      this._y = event.targetTouches[0].pageY - element.offsetTop

      this.isDown = true
      this.isUp = false
      this.tapped = false

      this.downTime = Date.now()

      if (this.press) this.press()
      event.preventDefault()
    },

    upHandler (event) {
      this.elapsedTime = Math.abs(this.downTime - Date.now())
      if (this.elapsedTime <= 200 && this.tapped === false) {
        this.tapped = true
        if (this.tap) this.tap()
      }

      this.isUp = true
      this.isDown = false

      if (this.release) this.release()
      event.preventDefault()
    },

    touchEndHandler (event) {
      this.elapsedTime = Math.abs(this.downTime - Date.now())

      if (this.elapsedTime <= 200 && this.tapped === false) {
        this.tapped = true
        if (this.tap) this.tap()
      }

      this.isUp = true
      this.isDown = false

      if (this.release) this.release()
      event.preventDefault()
    },

    hitTestSprite (sprite) {
      let hit = false

      if (!sprite.circular) {
        let left = sprite.gx
        let right = sprite.gx + sprite.width
        let top = sprite.gy
        let bottom = sprite.gy + sprite.height

        hit = this.x > left && this.x < right &&
                    this.y > top && this.y < bottom
      } else {
        let vx = this.x - (sprite.gx + sprite.radius)
        let vy = this.y - (sprite.gy + sprite.radius)
        let distance = Math.sqrt(vx * vx + vy * vy)

        hit = distance < sprite.radius
      }

      return hit
    },

    updateDragAndDrop (sprite) {
      if (this.isDown) {
        if (this.dragSprite === null) {
          for (let i = draggableSprites.length - 1; i > -1; i--) {
            let sprite = draggableSprites[i]

            if (this.hitTestSprite(sprite) && sprite.draggable) {
              this.dragOffsetX = this.x - sprite.gx
              this.dragOffsetY = this.y - sprite.gy

              this.dragSprite = sprite

                            // reorder sprites to display dragged sprite above all
              let children = sprite.parent.children
              children.splice(children.indexOf(sprite), 1)
              children.push(sprite)

                            // reorder draggableSprites in the same way
              draggableSprites.splice(draggableSprites.indexOf(sprite), 1)
              draggableSprites.push(sprite)
            }
          }
        } else {
          this.dragSprite.x = this.x - this.dragOffsetX
          this.dragSprite.y = this.y - this.dragOffsetY
        }
      }

      if (this.isUp) {
        this.dragSprite = null
      }

            // change cursor to hand if it's over draggable sprites
      draggableSprites.some(sprite => {
        if (this.hitTestSprite(sprite) && sprite.draggable) {
          this.element.style.cursor = 'pointer'
          return true
        } else {
          this.element.style.cursor = 'auto'
          return false
        }
      })
    }
  }

  element.addEventListener(
        'mousemove', pointer.moveHandler.bind(pointer), false
    )

  element.addEventListener(
        'mousedown', pointer.downHandler.bind(pointer), false
    )

  element.addEventListener(
        'mouseup', pointer.upHandler.bind(pointer), false
    )

  element.addEventListener(
        'touchmove', pointer.touchMoveHandler.bind(pointer), false
    )

  element.addEventListener(
        'touchstart', pointer.touchStartHandler.bind(pointer), false
    )

  element.addEventListener(
        'touchend', pointer.touchEndHandler.bind(pointer), false
    )

  element.style.touchAction = 'none'

  return pointer
}
