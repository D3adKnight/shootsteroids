export function hitTestPoint (point, sprite) {
  let shape, left, right, top, bottom, vx, vy, magnitude, hit

  if (sprite.radius) {
    shape = 'circle'
  } else {
    shape = 'rectangle'
  }

  if (shape === 'rectangle') {
    left = sprite.x
    right = sprite.x + sprite.width
    top = sprite.y
    bottom = sprite.y + sprite.height

    hit = point.x > left && point.x < right && point.y > top && point.y < bottom
  }

  if (shape === 'circle') {
    vx = point.x - sprite.centerX
    vy = point.y - sprite.centerY
    magnitude = Math.sqrt(vx * vx + vy * vy)

    hit = magnitude < sprite.radius
  }

  return hit
}

export function hitTestCircle (c1, c2, global = false) {
  let vx, vy, magnitude, combinedRadii, hit

  if (global) {
    vx = (c2.gx + c2.radius) - (c1.gx + c1.radius)
    vy = (c2.gy + c2.radius) - (c1.gy + c1.radius)
  } else {
    vx = c2.centerX - c1.centerX
    vy = c2.centerY - c1.centerY
  }

  magnitude = Math.sqrt(vx * vx + vy * vy)

  combinedRadii = c1.radius + c2.radius
  hit = magnitude < combinedRadii

  return hit
};

export function circleCollision (c1, c2, bounce = false, global = false) {
  let magnitude, combinedRadii, overlap
  let vx, vy, dx, dy
  let s = {}
  let hit = false

  if (global) {
    vx = (c2.gx + c2.radius) - (c1.gx + c1.radius)
    vy = (c2.gy + c2.radius) - (c1.gy + c1.radius)
  } else {
    vx = c2.centerX - c1.centerX
    vy = c2.centerY - c1.centerY
  }

  magnitude = Math.sqrt(vx * vx + vy * vy)

  combinedRadii = c1.radius + c2.radius

  if (magnitude < combinedRadii) {
    hit = true

    overlap = combinedRadii - magnitude

    let quantumPadding = 0.3
    overlap += quantumPadding

    dx = vx / magnitude
    dy = vy / magnitude

    c1.x -= overlap * dx
    c1.y -= overlap * dy

    if (bounce) {
      s.x = vy
      s.y = -vx

      bounceOffSurface(c1, s)
    }
  }
  return hit
}

export function movingCircleCollision (c1, c2, global = false) {
  let combinedRadii, overlap, xSide, ySide
  let s = {}
  let p1A = {}
  let p1B = {}
  let p2A = {}
  let p2B = {}
  let hit = false

  c1.mass = c1.mass || 1
  c2.mass = c2.mass || 1

  if (global) {
    s.vx = (c2.gx + c2.radius) - (c1.gx + c1.radius)
    s.vy = (c2.gy + c2.radius) - (c1.gy + c1.radius)
  } else {
    s.vx = c2.centerX - c1.centerX
    s.vy = c2.centerY - c1.centerY
  }

  s.magnitude = Math.sqrt(s.vx * s.vx + s.vy * s.vy)

  combinedRadii = c1.radius + c2.radius

  if (s.magnitude < combinedRadii) {
    hit = true

    overlap = combinedRadii - s.magnitude
    overlap += 0.3

    s.dx = s.vx / s.magnitude
    s.dy = s.vy / s.magnitude

    s.vxHalf = Math.abs(s.dx * overlap / 2)
    s.vyHalf = Math.abs(s.dy * overlap / 2)

    xSide = (c1.x > c2.x) ? 1 : -1
    ySide = (c1.y > c2.y) ? 1 : -1

    c1.x = c1.x + (s.vxHalf * xSide)
    c1.y = c1.y + (s.vyHalf * ySide)

    c2.x = c2.x + (s.vxHalf * -xSide)
    c2.y = c2.y + (s.vyHalf * -ySide)

    s.lx = s.vy
    s.ly = -s.vx

    let dp1 = c1.vx * s.dx + c1.vy * s.dy

    p1A.x = dp1 * s.dx
    p1A.y = dp1 * s.dy

    let dp2 = c1.vx * (s.lx / s.magnitude) + c1.vy * (s.ly / s.magnitude)

    p1B.x = dp2 * (s.lx / s.magnitude)
    p1B.y = dp2 * (s.ly / s.magnitude)

    let dp3 = c2.vx * s.dx + c2.vy * s.dy

    p2A.x = dp3 * s.dx
    p2A.y = dp3 * s.dy

    let dp4 = c2.vx * (s.lx / s.magnitude) + c2.vy * (s.ly / s.magnitude)

    p2B.x = dp4 * (s.lx / s.magnitude)
    p2B.y = dp4 * (s.ly / s.magnitude)

    c1.bounce = {}
    c1.bounce.x = p1B.x + p2A.x
    c1.bounce.y = p1B.y + p2A.y

    c2.bounce = {}
    c2.bounce.x = p1A.x + p2B.x
    c2.bounce.y = p1A.y + p2B.y

    c1.vx = c1.bounce.x / c1.mass
    c1.vy = c1.bounce.y / c1.mass
    c2.vx = c2.bounce.x / c2.mass
    c2.vy = c2.bounce.y / c2.mass
  }
  return hit
}

export function multipleCircleCollision (arrayOfCircles, global = false) {
  for (let i = 0; i < arrayOfCircles.length; i++) {
    var c1 = arrayOfCircles[i]
    for (let j = i + 1; j < arrayOfCircles.length; j++) {
      let c2 = arrayOfCircles[j]
      movingCircleCollision(c1, c2, global)
    }
  }
}

export function hitTestRectangle (r1, r2, global = false) {
  let hit, combinedHalfWidths, combinedHalfHeights, vx, vy

  hit = false

  if (global) {
    vx = (r1.gx + r1.halfWidth) - (r2.gx + r2.halfWidth)
    vy = (r1.gy + r1.halfHeight) - (r2.gy + r2.halfHeight)
  } else {
    vx = r1.centerX - r2.centerX
    vy = r1.centerY - r2.centerY
  }

  combinedHalfWidths = r1.halfWidth + r2.halfWidth
  combinedHalfHeights = r1.halfHeight + r2.halfHeight

  if (Math.abs(vx) < combinedHalfWidths) {
    if (Math.abs(vy) < combinedHalfHeights) {
      hit = true
    } else {
      hit = false
    }
  } else {
    hit = false
  }

  return hit
}

export function rectangleCollision (
  r1, r2, bounce = false, global = true
) {
  let collision, combinedHalfWidths, combinedHalfHeights,
    overlapX, overlapY, vx, vy

  if (global) {
    vx = (r1.gx + r1.halfWidth) - (r2.gx + r2.halfWidth)
    vy = (r1.gy + r1.halfHeight) - (r2.gy + r2.halfHeight)
  } else {
    vx = r1.centerX - r2.centerX
    vy = r1.centerY - r2.centerY
  }

  combinedHalfWidths = r1.halfWidth + r2.halfWidth
  combinedHalfHeights = r1.halfHeight + r2.halfHeight

  if (Math.abs(vx) < combinedHalfWidths) {
    if (Math.abs(vy) < combinedHalfHeights) {
      overlapX = combinedHalfWidths - Math.abs(vx)
      overlapY = combinedHalfHeights - Math.abs(vy)

      if (overlapX >= overlapY) {
        if (vy > 0) {
          collision = 'top'
          r1.y = r1.y + overlapY
        } else {
          collision = 'bottom'
          r1.y = r1.y - overlapY
        }

        if (bounce) {
          r1.vy *= -1
        }
      } else {
        if (vx > 0) {
          collision = 'left'
          r1.x = r1.x + overlapX
        } else {
          collision = 'right'
          r1.x = r1.x - overlapX
        }

        if (bounce) {
          r1.vx *= -1
        }
      }
    } else {
      // No collision
    }
  } else {
    // No collision
  }

  return collision
}

export function hitTestCircleRectangle (c1, r1, global = false) {
  let region, collision, c1x, c1y, r1x, r1y

  if (global) {
    c1x = c1.gx
    c1y = c1.gy
    r1x = r1.gx
    r1y = r1.gy
  } else {
    c1x = c1.x
    c1y = c1.y
    r1x = r1.x
    r1y = r1.y
  }

  if (c1y < r1y - r1.halfHeight) {
    if (c1x < r1x - 1 - r1.halfWidth) {
      region = 'topLeft'
    } else if (c1x > r1x + 1 + r1.halfWidth) {
      region = 'topRight'
    } else {
      region = 'topMiddle'
    }
  } else if (c1y > r1y + r1.halfHeight) {
    if (c1x < r1x - 1 - r1.halfWidth) {
      region = 'bottomLeft'
    } else if (c1x > r1x + 1 + r1.halfWidth) {
      region = 'bottomRight'
    } else {
      region = 'bottomMiddle'
    }
  } else {
    if (c1x < r1x - r1.halfWidth) {
      region = 'leftMiddle'
    } else {
      region = 'rightMiddle'
    }
  }

  if (region === 'topMiddle' || region === 'bottomMiddle' || region === 'leftMiddle' || region === 'rightMiddle') {
    collision = hitTestRectangle(c1, r1, global)
  } else {
    let point = {}

    switch (region) {
      case 'topLeft':
        point.x = r1x
        point.y = r1y
        break

      case 'topRight':
        point.x = r1x + r1.width
        point.y = r1y
        break

      case 'bottomLeft':
        point.x = r1x
        point.y = r1y + r1.height
        break

      case 'bottomRight':
        point.x = r1x + r1.width
        point.y = r1y + r1.height
    }

    collision = hitTestCirclePoint(c1, point, global)
  }

  if (collision) {
    return region
  } else {
    return collision
  }
}

export function hitTestCirclePoint (c1, point, global = false) {
  point.diameter = 1
  point.radius = 0.5
  point.centerX = point.x
  point.centerY = point.y
  point.gx = point.x
  point.gy = point.y
  return hitTestCircle(c1, point, global)
}

export function circleRectangleCollision (
  c1, r1, bounce = false, global = false
) {
  let region, collision, c1x, c1y, r1x, r1y

  if (global) {
    c1x = c1.gx
    c1y = c1.gy
    r1x = r1.gx
    r1y = r1.gy
  } else {
    c1x = c1.x
    c1y = c1.y
    r1x = r1.x
    r1y = r1.y
  }

  if (c1y < r1y - r1.halfHeight) {
    if (c1x < r1x - 1 - r1.halfWidth) {
      region = 'topLeft'
    } else if (c1x > r1x + 1 + r1.halfWidth) {
      region = 'topRight'
    } else {
      region = 'topMiddle'
    }
  } else if (c1y > r1y + r1.halfHeight) {
    if (c1x < r1x - 1 - r1.halfWidth) {
      region = 'bottomLeft'
    } else if (c1x > r1x + 1 + r1.halfWidth) {
      region = 'bottomRight'
    } else {
      region = 'bottomMiddle'
    }
  } else {
    if (c1x < r1x - r1.halfWidth) {
      region = 'leftMiddle'
    } else {
      region = 'rightMiddle'
    }
  }

  if (region === 'topMiddle' || region === 'bottomMiddle' || region === 'leftMiddle' || region === 'rightMiddle') {
    collision = rectangleCollision(c1, r1, bounce, global)
  } else {
    let point = {}

    switch (region) {
      case 'topLeft':
        point.x = r1x
        point.y = r1y
        break

      case 'topRight':
        point.x = r1x + r1.width
        point.y = r1y
        break

      case 'bottomLeft':
        point.x = r1x
        point.y = r1y + r1.height
        break

      case 'bottomRight':
        point.x = r1x + r1.width
        point.y = r1y + r1.height
    }

    collision = circlePointCollision(c1, point, bounce, global)
  }

  if (collision) {
    return region
  } else {
    return collision
  }
}

export function circlePointCollision (c1, point, bounce = false, global = false) {
  point.diameter = 1
  point.radius = 0.5
  point.centerX = point.x
  point.centerY = point.y
  point.gx = point.x
  point.gy = point.y
  return circleCollision(c1, point, bounce, global)
}

function bounceOffSurface (o, s) {
  let dp1, dp2
  let p1 = {}
  let p2 = {}
  let bounce = {}
  let mass = o.mass || 1

  s.lx = s.y
  s.ly = -s.x

  s.magnitude = Math.sqrt(s.x * s.x + s.y * s.y)

  s.dx = s.x / s.magnitude
  s.dy = s.y / s.magnitude

  dp1 = o.vx * s.dx + o.vy * s.dy

  p1.vx = dp1 * s.dx
  p1.vy = dp1 * s.dy

  dp2 = o.vx * (s.lx / s.magnitude) + o.vy * (s.ly / s.magnitude)

  p2.vx = dp2 * (s.lx / s.magnitude)
  p2.vy = dp2 * (s.ly / s.magnitude)

  p2.vx *= -1
  p2.vy *= -1

  bounce.x = p1.vx + p2.vx
  bounce.y = p1.vy + p2.vy

  o.vx = bounce.x / mass
  o.vy = bounce.y / mass
}

export function hit (a, b, react = false, bounce = false, global, extra = undefined) {
  let collision
  let aIsASprite = a.parent !== undefined
  let bIsASprite = b.parent !== undefined

  if (aIsASprite && b instanceof Array || bIsASprite && a instanceof Array) {
    spriteVsArray()
  } else {
    collision = findCollisionType(a, b)
    if (collision && extra) extra(collision)
  }

  return collision

  function findCollisionType (a, b) {
    let aIsASprite = a.parent !== undefined
    let bIsASprite = b.parent !== undefined

    if (aIsASprite && bIsASprite) {
      if (a.diameter && b.diameter) {
        return circleVsCircle(a, b)
      } else if (a.diameter && !b.diameter) {
        return circleVsRectangle(a, b)
      } else {
        return rectangleVsRectangle(a, b)
      }
    } else if (bIsASprite && !(a.x === undefined) && !(a.y === undefined)) {
      return hitTestPoint(a, b)
    } else {
      throw new Error(`I'm sorry, ${a} and ${b} cannot be use together in a collision test.'`)
    }
  }

  function spriteVsArray () {
    if (a instanceof Array) {
      let [a, b] = [b, a]
    }
    for (let i = b.length - 1; i >= 0; i--) {
      let sprite = b[i]
      collision = findCollisionType(a, sprite)
      if (collision && extra) extra(collision, sprite)
    }
  }

  function circleVsCircle (a, b) {
    if (!react) {
      return hitTestCircle(a, b)
    } else {
      if (a.vx + a.vy !== 0 && b.vx + b.vy !== 0) {
        return movingCircleCollision(a, b, global)
      } else {
        return circleCollision(a, b, bounce, global)
      }
    }
  }

  function rectangleVsRectangle (a, b) {
    if (!react) {
      return hitTestRectangle(a, b, global)
    } else {
      return rectangleCollision(a, b, bounce, global)
    }
  }

  function circleVsRectangle (a, b) {
    if (!react) {
      return hitTestCircleRectangle(a, b, global)
    } else {
      return circleRectangleCollision(a, b, bounce, global)
    }
  }
}
