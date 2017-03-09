// Entity components

class Component {
  constructor (parent) {
    this.parent = parent
  }

  update (dt) {
    // empty parent function
  }
}

class GraphicsComponent extends Component {
  constructor (parent, image, ctx) {
    super(parent)

    this.ctx = ctx
    this.sprite = image
  }

  update (dt) {
    this.sprite.render(this.ctx)
  }
}

class PhysicsComponent extends Component {
  constructor (parent) {
    super(parent)

    this.vx = 0
    this.vy = 0
    this.acceleration = 0
    this.friction = 0
    this.rotationSpeed = 0
  }

  update (dt) {
    //
  }
}
