(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.hitTestPoint = hitTestPoint;
exports.hitTestCircle = hitTestCircle;
exports.circleCollision = circleCollision;
exports.movingCircleCollision = movingCircleCollision;
exports.multipleCircleCollision = multipleCircleCollision;
exports.hitTestRectangle = hitTestRectangle;
exports.rectangleCollision = rectangleCollision;
exports.hitTestCircleRectangle = hitTestCircleRectangle;
exports.hitTestCirclePoint = hitTestCirclePoint;
exports.circleRectangleCollision = circleRectangleCollision;
exports.circlePointCollision = circlePointCollision;
exports.hit = hit;
function hitTestPoint(point, sprite) {
  var shape = void 0,
      left = void 0,
      right = void 0,
      top = void 0,
      bottom = void 0,
      vx = void 0,
      vy = void 0,
      magnitude = void 0,
      hit = void 0;

  if (sprite.radius) {
    shape = 'circle';
  } else {
    shape = 'rectangle';
  }

  if (shape === 'rectangle') {
    left = sprite.x;
    right = sprite.x + sprite.width;
    top = sprite.y;
    bottom = sprite.y + sprite.height;

    hit = point.x > left && point.x < right && point.y > top && point.y < bottom;
  }

  if (shape === 'circle') {
    vx = point.x - sprite.centerX;
    vy = point.y - sprite.centerY;
    magnitude = Math.sqrt(vx * vx + vy * vy);

    hit = magnitude < sprite.radius;
  }

  return hit;
}

function hitTestCircle(c1, c2) {
  var global = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

  var vx = void 0,
      vy = void 0,
      magnitude = void 0,
      combinedRadii = void 0,
      hit = void 0;

  if (global) {
    vx = c2.gx + c2.radius - (c1.gx + c1.radius);
    vy = c2.gy + c2.radius - (c1.gy + c1.radius);
  } else {
    vx = c2.centerX - c1.centerX;
    vy = c2.centerY - c1.centerY;
  }

  magnitude = Math.sqrt(vx * vx + vy * vy);

  combinedRadii = c1.radius + c2.radius;
  hit = magnitude < combinedRadii;

  return hit;
};

function circleCollision(c1, c2) {
  var bounce = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  var global = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

  var magnitude = void 0,
      combinedRadii = void 0,
      overlap = void 0;
  var vx = void 0,
      vy = void 0,
      dx = void 0,
      dy = void 0;
  var s = {};
  var hit = false;

  if (global) {
    vx = c2.gx + c2.radius - (c1.gx + c1.radius);
    vy = c2.gy + c2.radius - (c1.gy + c1.radius);
  } else {
    vx = c2.centerX - c1.centerX;
    vy = c2.centerY - c1.centerY;
  }

  magnitude = Math.sqrt(vx * vx + vy * vy);

  combinedRadii = c1.radius + c2.radius;

  if (magnitude < combinedRadii) {
    hit = true;

    overlap = combinedRadii - magnitude;

    var quantumPadding = 0.3;
    overlap += quantumPadding;

    dx = vx / magnitude;
    dy = vy / magnitude;

    c1.x -= overlap * dx;
    c1.y -= overlap * dy;

    if (bounce) {
      s.x = vy;
      s.y = -vx;

      bounceOffSurface(c1, s);
    }
  }
  return hit;
}

function movingCircleCollision(c1, c2) {
  var global = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

  var combinedRadii = void 0,
      overlap = void 0,
      xSide = void 0,
      ySide = void 0;
  var s = {};
  var p1A = {};
  var p1B = {};
  var p2A = {};
  var p2B = {};
  var hit = false;

  c1.mass = c1.mass || 1;
  c2.mass = c2.mass || 1;

  if (global) {
    s.vx = c2.gx + c2.radius - (c1.gx + c1.radius);
    s.vy = c2.gy + c2.radius - (c1.gy + c1.radius);
  } else {
    s.vx = c2.centerX - c1.centerX;
    s.vy = c2.centerY - c1.centerY;
  }

  s.magnitude = Math.sqrt(s.vx * s.vx + s.vy * s.vy);

  combinedRadii = c1.radius + c2.radius;

  if (s.magnitude < combinedRadii) {
    hit = true;

    overlap = combinedRadii - s.magnitude;
    overlap += 0.3;

    s.dx = s.vx / s.magnitude;
    s.dy = s.vy / s.magnitude;

    s.vxHalf = Math.abs(s.dx * overlap / 2);
    s.vyHalf = Math.abs(s.dy * overlap / 2);

    xSide = c1.x > c2.x ? 1 : -1;
    ySide = c1.y > c2.y ? 1 : -1;

    c1.x = c1.x + s.vxHalf * xSide;
    c1.y = c1.y + s.vyHalf * ySide;

    c2.x = c2.x + s.vxHalf * -xSide;
    c2.y = c2.y + s.vyHalf * -ySide;

    s.lx = s.vy;
    s.ly = -s.vx;

    var dp1 = c1.vx * s.dx + c1.vy * s.dy;

    p1A.x = dp1 * s.dx;
    p1A.y = dp1 * s.dy;

    var dp2 = c1.vx * (s.lx / s.magnitude) + c1.vy * (s.ly / s.magnitude);

    p1B.x = dp2 * (s.lx / s.magnitude);
    p1B.y = dp2 * (s.ly / s.magnitude);

    var dp3 = c2.vx * s.dx + c2.vy * s.dy;

    p2A.x = dp3 * s.dx;
    p2A.y = dp3 * s.dy;

    var dp4 = c2.vx * (s.lx / s.magnitude) + c2.vy * (s.ly / s.magnitude);

    p2B.x = dp4 * (s.lx / s.magnitude);
    p2B.y = dp4 * (s.ly / s.magnitude);

    c1.bounce = {};
    c1.bounce.x = p1B.x + p2A.x;
    c1.bounce.y = p1B.y + p2A.y;

    c2.bounce = {};
    c2.bounce.x = p1A.x + p2B.x;
    c2.bounce.y = p1A.y + p2B.y;

    c1.vx = c1.bounce.x / c1.mass;
    c1.vy = c1.bounce.y / c1.mass;
    c2.vx = c2.bounce.x / c2.mass;
    c2.vy = c2.bounce.y / c2.mass;
  }
  return hit;
}

function multipleCircleCollision(arrayOfCircles) {
  var global = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  for (var i = 0; i < arrayOfCircles.length; i++) {
    var c1 = arrayOfCircles[i];
    for (var j = i + 1; j < arrayOfCircles.length; j++) {
      var c2 = arrayOfCircles[j];
      movingCircleCollision(c1, c2, global);
    }
  }
}

function hitTestRectangle(r1, r2) {
  var global = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

  var hit = void 0,
      combinedHalfWidths = void 0,
      combinedHalfHeights = void 0,
      vx = void 0,
      vy = void 0;

  hit = false;

  if (global) {
    vx = r1.gx + r1.halfWidth - (r2.gx + r2.halfWidth);
    vy = r1.gy + r1.halfHeight - (r2.gy + r2.halfHeight);
  } else {
    vx = r1.centerX - r2.centerX;
    vy = r1.centerY - r2.centerY;
  }

  combinedHalfWidths = r1.halfWidth + r2.halfWidth;
  combinedHalfHeights = r1.halfHeight + r2.halfHeight;

  if (Math.abs(vx) < combinedHalfWidths) {
    if (Math.abs(vy) < combinedHalfHeights) {
      hit = true;
    } else {
      hit = false;
    }
  } else {
    hit = false;
  }

  return hit;
}

function rectangleCollision(r1, r2) {
  var bounce = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  var global = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;

  var collision = void 0,
      combinedHalfWidths = void 0,
      combinedHalfHeights = void 0,
      overlapX = void 0,
      overlapY = void 0,
      vx = void 0,
      vy = void 0;

  if (global) {
    vx = r1.gx + r1.halfWidth - (r2.gx + r2.halfWidth);
    vy = r1.gy + r1.halfHeight - (r2.gy + r2.halfHeight);
  } else {
    vx = r1.centerX - r2.centerX;
    vy = r1.centerY - r2.centerY;
  }

  combinedHalfWidths = r1.halfWidth + r2.halfWidth;
  combinedHalfHeights = r1.halfHeight + r2.halfHeight;

  if (Math.abs(vx) < combinedHalfWidths) {
    if (Math.abs(vy) < combinedHalfHeights) {
      overlapX = combinedHalfWidths - Math.abs(vx);
      overlapY = combinedHalfHeights - Math.abs(vy);

      if (overlapX >= overlapY) {
        if (vy > 0) {
          collision = 'top';
          r1.y = r1.y + overlapY;
        } else {
          collision = 'bottom';
          r1.y = r1.y - overlapY;
        }

        if (bounce) {
          r1.vy *= -1;
        }
      } else {
        if (vx > 0) {
          collision = 'left';
          r1.x = r1.x + overlapX;
        } else {
          collision = 'right';
          r1.x = r1.x - overlapX;
        }

        if (bounce) {
          r1.vx *= -1;
        }
      }
    } else {
      // No collision
    }
  } else {
      // No collision
    }

  return collision;
}

function hitTestCircleRectangle(c1, r1) {
  var global = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

  var region = void 0,
      collision = void 0,
      c1x = void 0,
      c1y = void 0,
      r1x = void 0,
      r1y = void 0;

  if (global) {
    c1x = c1.gx;
    c1y = c1.gy;
    r1x = r1.gx;
    r1y = r1.gy;
  } else {
    c1x = c1.x;
    c1y = c1.y;
    r1x = r1.x;
    r1y = r1.y;
  }

  if (c1y < r1y - r1.halfHeight) {
    if (c1x < r1x - 1 - r1.halfWidth) {
      region = 'topLeft';
    } else if (c1x > r1x + 1 + r1.halfWidth) {
      region = 'topRight';
    } else {
      region = 'topMiddle';
    }
  } else if (c1y > r1y + r1.halfHeight) {
    if (c1x < r1x - 1 - r1.halfWidth) {
      region = 'bottomLeft';
    } else if (c1x > r1x + 1 + r1.halfWidth) {
      region = 'bottomRight';
    } else {
      region = 'bottomMiddle';
    }
  } else {
    if (c1x < r1x - r1.halfWidth) {
      region = 'leftMiddle';
    } else {
      region = 'rightMiddle';
    }
  }

  if (region === 'topMiddle' || region === 'bottomMiddle' || region === 'leftMiddle' || region === 'rightMiddle') {
    collision = hitTestRectangle(c1, r1, global);
  } else {
    var point = {};

    switch (region) {
      case 'topLeft':
        point.x = r1x;
        point.y = r1y;
        break;

      case 'topRight':
        point.x = r1x + r1.width;
        point.y = r1y;
        break;

      case 'bottomLeft':
        point.x = r1x;
        point.y = r1y + r1.height;
        break;

      case 'bottomRight':
        point.x = r1x + r1.width;
        point.y = r1y + r1.height;
    }

    collision = hitTestCirclePoint(c1, point, global);
  }

  if (collision) {
    return region;
  } else {
    return collision;
  }
}

function hitTestCirclePoint(c1, point) {
  var global = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

  point.diameter = 1;
  point.radius = 0.5;
  point.centerX = point.x;
  point.centerY = point.y;
  point.gx = point.x;
  point.gy = point.y;
  return hitTestCircle(c1, point, global);
}

function circleRectangleCollision(c1, r1) {
  var bounce = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  var global = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

  var region = void 0,
      collision = void 0,
      c1x = void 0,
      c1y = void 0,
      r1x = void 0,
      r1y = void 0;

  if (global) {
    c1x = c1.gx;
    c1y = c1.gy;
    r1x = r1.gx;
    r1y = r1.gy;
  } else {
    c1x = c1.x;
    c1y = c1.y;
    r1x = r1.x;
    r1y = r1.y;
  }

  if (c1y < r1y - r1.halfHeight) {
    if (c1x < r1x - 1 - r1.halfWidth) {
      region = 'topLeft';
    } else if (c1x > r1x + 1 + r1.halfWidth) {
      region = 'topRight';
    } else {
      region = 'topMiddle';
    }
  } else if (c1y > r1y + r1.halfHeight) {
    if (c1x < r1x - 1 - r1.halfWidth) {
      region = 'bottomLeft';
    } else if (c1x > r1x + 1 + r1.halfWidth) {
      region = 'bottomRight';
    } else {
      region = 'bottomMiddle';
    }
  } else {
    if (c1x < r1x - r1.halfWidth) {
      region = 'leftMiddle';
    } else {
      region = 'rightMiddle';
    }
  }

  if (region === 'topMiddle' || region === 'bottomMiddle' || region === 'leftMiddle' || region === 'rightMiddle') {
    collision = rectangleCollision(c1, r1, bounce, global);
  } else {
    var point = {};

    switch (region) {
      case 'topLeft':
        point.x = r1x;
        point.y = r1y;
        break;

      case 'topRight':
        point.x = r1x + r1.width;
        point.y = r1y;
        break;

      case 'bottomLeft':
        point.x = r1x;
        point.y = r1y + r1.height;
        break;

      case 'bottomRight':
        point.x = r1x + r1.width;
        point.y = r1y + r1.height;
    }

    collision = circlePointCollision(c1, point, bounce, global);
  }

  if (collision) {
    return region;
  } else {
    return collision;
  }
}

function circlePointCollision(c1, point) {
  var bounce = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  var global = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

  point.diameter = 1;
  point.radius = 0.5;
  point.centerX = point.x;
  point.centerY = point.y;
  point.gx = point.x;
  point.gy = point.y;
  return circleCollision(c1, point, bounce, global);
}

function bounceOffSurface(o, s) {
  var dp1 = void 0,
      dp2 = void 0;
  var p1 = {};
  var p2 = {};
  var bounce = {};
  var mass = o.mass || 1;

  s.lx = s.y;
  s.ly = -s.x;

  s.magnitude = Math.sqrt(s.x * s.x + s.y * s.y);

  s.dx = s.x / s.magnitude;
  s.dy = s.y / s.magnitude;

  dp1 = o.vx * s.dx + o.vy * s.dy;

  p1.vx = dp1 * s.dx;
  p1.vy = dp1 * s.dy;

  dp2 = o.vx * (s.lx / s.magnitude) + o.vy * (s.ly / s.magnitude);

  p2.vx = dp2 * (s.lx / s.magnitude);
  p2.vy = dp2 * (s.ly / s.magnitude);

  p2.vx *= -1;
  p2.vy *= -1;

  bounce.x = p1.vx + p2.vx;
  bounce.y = p1.vy + p2.vy;

  o.vx = bounce.x / mass;
  o.vy = bounce.y / mass;
}

function hit(a, b) {
  var react = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  var bounce = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
  var global = arguments[4];
  var extra = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : undefined;

  var collision = void 0;
  var aIsASprite = a.parent !== undefined;
  var bIsASprite = b.parent !== undefined;

  if (aIsASprite && b instanceof Array || bIsASprite && a instanceof Array) {
    spriteVsArray();
  } else {
    collision = findCollisionType(a, b);
    if (collision && extra) extra(collision);
  }

  return collision;

  function findCollisionType(a, b) {
    var aIsASprite = a.parent !== undefined;
    var bIsASprite = b.parent !== undefined;

    if (aIsASprite && bIsASprite) {
      if (a.diameter && b.diameter) {
        return circleVsCircle(a, b);
      } else if (a.diameter && !b.diameter) {
        return circleVsRectangle(a, b);
      } else {
        return rectangleVsRectangle(a, b);
      }
    } else if (bIsASprite && !(a.x === undefined) && !(a.y === undefined)) {
      return hitTestPoint(a, b);
    } else {
      throw new Error('I\'m sorry, ' + a + ' and ' + b + ' cannot be use together in a collision test.\'');
    }
  }

  function spriteVsArray() {
    if (a instanceof Array) {
      var _ref = [_b, _a],
          _a = _ref[0],
          _b = _ref[1];
    }
    for (var i = b.length - 1; i >= 0; i--) {
      var sprite = b[i];
      collision = findCollisionType(a, sprite);
      if (collision && extra) extra(collision, sprite);
    }
  }

  function circleVsCircle(a, b) {
    if (!react) {
      return hitTestCircle(a, b);
    } else {
      if (a.vx + a.vy !== 0 && b.vx + b.vy !== 0) {
        return movingCircleCollision(a, b, global);
      } else {
        return circleCollision(a, b, bounce, global);
      }
    }
  }

  function rectangleVsRectangle(a, b) {
    if (!react) {
      return hitTestRectangle(a, b, global);
    } else {
      return rectangleCollision(a, b, bounce, global);
    }
  }

  function circleVsRectangle(a, b) {
    if (!react) {
      return hitTestCircleRectangle(a, b, global);
    } else {
      return circleRectangleCollision(a, b, bounce, global);
    }
  }
}

},{}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.makeCanvas = makeCanvas;
exports.render = render;
exports.renderWithInterpolation = renderWithInterpolation;
exports.remove = remove;
exports.rectangle = rectangle;
exports.circle = circle;
exports.line = line;
exports.text = text;
exports.group = group;
exports.sprite = sprite;
exports.frame = frame;
exports.frames = frames;
exports.filmstrip = filmstrip;
exports.button = button;
exports.particleEffect = particleEffect;
exports.emitter = emitter;
exports.grid = grid;
exports.tilingSprite = tilingSprite;
exports.background = background;

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var draggableSprites = exports.draggableSprites = [];
var buttons = exports.buttons = [];
var particles = exports.particles = [];

var DisplayObject = function () {
  function DisplayObject() {
    _classCallCheck(this, DisplayObject);

    // The sprite position and size
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;

    // transformation properties
    this.rotation = 0;
    this.alpha = 1;
    this.visible = true;
    this.scaleX = 1;
    this.scaleY = 1;

    // pivot point
    // (0.5 is center point)
    this.pivotX = 0.5;
    this.pivotY = 0.5;

    // Velocity
    this.vx = 0;
    this.vy = 0;

    // 'private' layer property
    this._layer = 0;

    this.children = [];
    this.parent = undefined;

    // Optional shadow
    this.shadow = false;
    this.shadowColor = 'rgba(100, 100, 100, 0.5)';
    this.shadowOffsetX = 3;
    this.shadowOffsetY = 3;
    this.shadowBlur = 3;

    this.blendMode = undefined;

    // advanced features
    // animation
    this.frames = [];
    this.loop = true;
    this._currentFrame = 0;
    this.playing = false;

    // can be dragged
    this._draggable = undefined;

    // used for 'radius' and 'diameter' props
    this._circular = false;

    // is interactive? (clickable/touchable)
    this._interactive = false;
  }

  // Global position


  _createClass(DisplayObject, [{
    key: 'addChild',


    // Children manipulation
    value: function addChild(sprite) {
      if (sprite.parent) {
        sprite.parent.removeChild(sprite);
      }
      sprite.parent = this;
      this.children.push(sprite);
    }
  }, {
    key: 'removeChild',
    value: function removeChild(sprite) {
      if (sprite.parent === this) {
        this.children.splice(this.children.indexOf(sprite), 1);
      } else {
        throw new Error(sprite + ' is not a child of ' + this);
      }
    }
  }, {
    key: 'swapChildren',
    value: function swapChildren(child1, child2) {
      var index1 = this.children.indexOf(child1);
      var index2 = this.children.indexOf(child2);

      if (index1 !== -1 && index2 !== -1) {
        child1.childIndex = index2;
        child2.childIndex = index1;

        this.children[index1] = child2;
        this.children[index2] = child1;
      } else {
        throw new Error('Both objects must be a child of the caller ' + this);
      }
    }
  }, {
    key: 'add',
    value: function add() {
      var _this = this;

      for (var _len = arguments.length, spritesToAdd = Array(_len), _key = 0; _key < _len; _key++) {
        spritesToAdd[_key] = arguments[_key];
      }

      spritesToAdd.forEach(function (sprite) {
        return _this.addChild(sprite);
      });
    }
  }, {
    key: 'remove',
    value: function remove() {
      var _this2 = this;

      for (var _len2 = arguments.length, spritesToRemove = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        spritesToRemove[_key2] = arguments[_key2];
      }

      spritesToRemove.forEach(function (sprite) {
        return _this2.removeChild(sprite);
      });
    }

    // Helpers

  }, {
    key: 'setPosition',
    value: function setPosition(x, y) {
      this.x = x;
      this.y = y;
    }
  }, {
    key: 'putCenter',


    // position helpers
    value: function putCenter(b) {
      var xOffset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      var yOffset = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

      var a = this;
      b.x = a.x + a.halfWidth - b.halfWidth + xOffset;
      b.y = a.y + a.halfHeight - b.halfHeight + yOffset;
    }
  }, {
    key: 'putTop',
    value: function putTop(b) {
      var xOffset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      var yOffset = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

      var a = this;
      b.x = a.x + a.halfWidth - b.halfWidth + xOffset;
      b.y = a.y - b.height + yOffset;
    }
  }, {
    key: 'putBottom',
    value: function putBottom(b) {
      var xOffset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      var yOffset = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

      var a = this;
      b.x = a.x + a.halfWidth - b.halfWidth + xOffset;
      b.y = a.y + a.height + yOffset;
    }
  }, {
    key: 'putRight',
    value: function putRight(b) {
      var xOffset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      var yOffset = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

      var a = this;
      b.x = a.x + a.width + xOffset;
      b.y = a.y + a.halfHeight - b.halfHeight + yOffset;
    }
  }, {
    key: 'putLeft',
    value: function putLeft(b) {
      var xOffset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      var yOffset = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

      var a = this;
      b.x = a.x - b.width + xOffset;
      b.y = a.y + a.halfHeight - b.halfHeight + yOffset;
    }

    // animation helpers

  }, {
    key: 'gx',
    get: function get() {
      if (this.parent) {
        return this.x + this.parent.gx;
      } else {
        return this.x;
      }
    }
  }, {
    key: 'gy',
    get: function get() {
      if (this.parent) {
        return this.y + this.parent.gy;
      } else {
        return this.y;
      }
    }

    // Depth layer

  }, {
    key: 'layer',
    get: function get() {
      return this._layer;
    },
    set: function set(value) {
      this._layer = value;
      if (this.parent) {
        this.parent.children.sort(function (a, b) {
          return a.layer - b.layer;
        });
      }
    }
  }, {
    key: 'empty',
    get: function get() {
      if (this.children.length === 0) {
        return true;
      } else {
        return false;
      }
    }
  }, {
    key: 'halfWidth',
    get: function get() {
      return this.width / 2;
    }
  }, {
    key: 'halfHeight',
    get: function get() {
      return this.height / 2;
    }
  }, {
    key: 'centerX',
    get: function get() {
      return this.x + this.halfWidth;
    }
  }, {
    key: 'centerY',
    get: function get() {
      return this.y + this.halfHeight;
    }

    // ...

  }, {
    key: 'position',
    get: function get() {
      return { x: this.x, y: this.y };
    }
  }, {
    key: 'localBounds',
    get: function get() {
      return {
        x: 0,
        y: 0,
        width: this.width,
        height: this.height
      };
    }
  }, {
    key: 'globalBounds',
    get: function get() {
      return {
        x: this.gx,
        y: this.gy,
        width: this.gx + this.width,
        height: this.gy + this.height
      };
    }
  }, {
    key: 'currentFrame',
    get: function get() {
      return this._currentFrame;
    }

    // circular

  }, {
    key: 'circular',
    get: function get() {
      return this._circular;
    },
    set: function set(value) {
      if (value === true && this._circular === false) {
        Object.defineProperties(this, {
          diameter: {
            get: function get() {
              return this.width;
            },
            set: function set(value) {
              this.width = value;
              this.height = value;
            },

            enumerable: true,
            configurable: true
          },
          radius: {
            get: function get() {
              return this.halfWidth;
            },
            set: function set(value) {
              this.width = value * 2;
              this.height = value * 2;
            },

            enumerable: true,
            configurable: true
          }
        });

        this._circular = true;
      }

      if (value === false && this._circular === true) {
        delete this.diameter;
        delete this.radius;
        this._circular = false;
      }
    }

    // draggable

  }, {
    key: 'draggable',
    get: function get() {
      return this._draggable;
    },
    set: function set(value) {
      if (value === true) {
        draggableSprites.push(this);
        this._draggable = true;
      }

      if (value === false) {
        draggableSprites.splice(draggableSprites.indexOf(this), 1);
        this._draggable = false;
      }
    }
  }, {
    key: 'interactive',
    get: function get() {
      return this._interactive;
    },
    set: function set(value) {
      if (value === true) {
        makeInteractive(this);
        buttons.push(this);

        this._interactive = true;
      }
      if (value === false) {
        buttons.splice(buttons.indexOf(this), 1);
        this._interactive = false;
      }
    }
  }]);

  return DisplayObject;
}();

var stage = exports.stage = new DisplayObject();

function makeCanvas() {
  var width = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 256;
  var height = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 256;
  var border = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '1px dashed black';
  var backgroundColor = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'white';

  var canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.style.border = border;
  canvas.style.backgroundColor = backgroundColor;
  document.body.appendChild(canvas);

  canvas.ctx = canvas.getContext('2d');

  return canvas;
}

function render(canvas) {
  var ctx = canvas.ctx;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // draw background
  if (stageBackground) {
    stageBackground.render(ctx);
  }

  stage.children.forEach(function (sprite) {
    displaySprite(sprite);
  });

  function displaySprite(sprite) {
    if (sprite.visible && sprite.gx < canvas.width + sprite.width && sprite.gx + sprite.width >= -sprite.width && sprite.gy < canvas.height + sprite.height && sprite.gy + sprite.height >= -sprite.height) {
      ctx.save();

      ctx.translate(sprite.x + sprite.width * sprite.pivotX, sprite.y + sprite.height * sprite.pivotY);

      ctx.rotate(sprite.rotation);
      ctx.globalAlpha = sprite.alpha * sprite.parent.alpha;
      ctx.scale(sprite.scaleX, sprite.scaleY);

      if (sprite.shadow) {
        ctx.shadowColor = sprite.shadowColor;
        ctx.shadowOffsetX = sprite.shadowOffsetX;
        ctx.shadowOffsetY = sprite.shadowOffsetY;
        ctx.shadowBlur = sprite.shadowBlur;
      }

      if (sprite.blendMode) ctx.globalCompositeOperation = sprite.blendMode;

      if (sprite.render) {
        sprite.render(ctx);
      }

      if (sprite.children && sprite.children.length > 0) {
        ctx.translate(-sprite.width * sprite.pivotX, -sprite.height * sprite.pivotY);

        sprite.children.forEach(function (child) {
          displaySprite(child);
        });
      }

      ctx.restore();
    }
  }
}

function renderWithInterpolation(canvas, lagOffset) {
  var ctx = canvas.ctx;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  stage.children.forEach(function (sprite) {
    displaySprite(sprite);
  });

  function displaySprite(sprite) {
    if (sprite.visible && sprite.gx < canvas.width + sprite.width && sprite.gx + sprite.width >= -sprite.width && sprite.gy < canvas.height + sprite.height && sprite.gy + sprite.height >= -sprite.height) {
      ctx.save();

      if (sprite.previousX !== undefined) {
        sprite.renderX = (sprite.x - sprite.previousX) * lagOffset + sprite.previousX;
      } else {
        sprite.renderX = sprite.x;
      }

      if (sprite.previousY !== undefined) {
        sprite.renderY = (sprite.y - sprite.previousY) * lagOffset + sprite.previousY;
      } else {
        sprite.renderY = sprite.y;
      }

      ctx.translate(sprite.renderX + sprite.width * sprite.pivotX, sprite.renderY + sprite.height * sprite.pivotY);

      ctx.rotate(sprite.rotation);
      ctx.globalAlpha = sprite.alpha * sprite.parent.alpha;
      ctx.scale(sprite.scaleX, sprite.scaleY);

      if (sprite.shadow) {
        ctx.shadowColor = sprite.shadowColor;
        ctx.shadowOffsetX = sprite.shadowOffsetX;
        ctx.shadowOffsetY = sprite.shadowOffsetY;
        ctx.shadowBlur = sprite.shadowBlur;
      }

      if (sprite.blendMode) ctx.globalCompositeOperation = sprite.blendMode;

      if (sprite.render) {
        sprite.render(ctx);
      }

      if (sprite.children && sprite.children.length > 0) {
        ctx.translate(-sprite.width * sprite.pivotX, -sprite.height * sprite.pivotY);

        sprite.children.forEach(function (child) {
          displaySprite(child);
        });
      }

      ctx.restore();
    }
  }
}

function remove() {
  for (var _len3 = arguments.length, spritesToRemove = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
    spritesToRemove[_key3] = arguments[_key3];
  }

  spritesToRemove.forEach(function (sprite) {
    sprite.parent.removeChild(sprite);
  });
}

var Rectangle = function (_DisplayObject) {
  _inherits(Rectangle, _DisplayObject);

  function Rectangle() {
    var width = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 32;
    var height = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 32;
    var fillStyle = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'gray';
    var strokeStyle = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'none';
    var lineWidth = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;
    var x = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 0;
    var y = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : 0;

    _classCallCheck(this, Rectangle);

    var _this3 = _possibleConstructorReturn(this, (Rectangle.__proto__ || Object.getPrototypeOf(Rectangle)).call(this));

    Object.assign(_this3, { width: width, height: height, fillStyle: fillStyle, strokeStyle: strokeStyle, lineWidth: lineWidth, x: x, y: y });

    _this3.mask = false;
    return _this3;
  }

  _createClass(Rectangle, [{
    key: 'render',
    value: function render(ctx) {
      ctx.strokeStyle = this.strokeStyle;
      ctx.lineWidth = this.lineWidth;
      ctx.fillStyle = this.fillStyle;

      ctx.beginPath();
      ctx.rect(-this.width * this.pivotX, -this.height * this.pivotY, this.width, this.height);

      if (this.strokeStyle !== 'none') ctx.stroke();
      if (this.fillStyle !== 'none') ctx.fill();
      if (this.mask && this.mask === true) ctx.clip();
    }
  }]);

  return Rectangle;
}(DisplayObject);

// rectangle wrapper


function rectangle(width, height, fillStyle, strokeStyle, lineWidth, x, y) {
  var sprite = new Rectangle(width, height, fillStyle, strokeStyle, lineWidth, x, y);
  stage.addChild(sprite);
  return sprite;
}

var Circle = function (_DisplayObject2) {
  _inherits(Circle, _DisplayObject2);

  function Circle() {
    var diameter = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 32;
    var fillStyle = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'gray';
    var strokeStyle = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'none';
    var lineWidth = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
    var x = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;
    var y = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 0;

    _classCallCheck(this, Circle);

    var _this4 = _possibleConstructorReturn(this, (Circle.__proto__ || Object.getPrototypeOf(Circle)).call(this));

    _this4.circular = true;

    Object.assign(_this4, { diameter: diameter, fillStyle: fillStyle, strokeStyle: strokeStyle, lineWidth: lineWidth, x: x, y: y });

    _this4.mask = false;
    return _this4;
  }

  _createClass(Circle, [{
    key: 'render',
    value: function render(ctx) {
      ctx.strokeStyle = this.strokeStyle;
      ctx.lineWidth = this.lineWidth;
      ctx.fillStyle = this.fillStyle;

      ctx.beginPath();
      ctx.arc(this.radius + -this.diameter * this.pivotX, this.radius + -this.diameter * this.pivotY, this.radius, 0, 2 * Math.PI, false);

      if (this.strokeStyle !== 'none') ctx.stroke();
      if (this.fillStyle !== 'none') ctx.fill();
      if (this.mask && this.mask === true) ctx.clip();
    }
  }]);

  return Circle;
}(DisplayObject);

// circle wrapper


function circle(diameter, fillStyle, strokeStyle, lineWidth, x, y) {
  var sprite = new Circle(diameter, fillStyle, strokeStyle, lineWidth, x, y);
  stage.addChild(sprite);
  return sprite;
}

var Line = function (_DisplayObject3) {
  _inherits(Line, _DisplayObject3);

  function Line() {
    var strokeStyle = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'none';
    var lineWidth = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
    var ax = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
    var ay = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
    var bx = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 32;
    var by = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 32;

    _classCallCheck(this, Line);

    var _this5 = _possibleConstructorReturn(this, (Line.__proto__ || Object.getPrototypeOf(Line)).call(this));

    Object.assign(_this5, { strokeStyle: strokeStyle, lineWidth: lineWidth, ax: ax, ay: ay, bx: bx, by: by });

    _this5.lineJoin = 'round';
    return _this5;
  }

  _createClass(Line, [{
    key: 'render',
    value: function render(ctx) {
      ctx.strokeStyle = this.strokeStyle;
      ctx.lineWidth = this.lineWidth;

      ctx.beginPath();
      ctx.moveTo(this.ax, this.ay);
      ctx.lineTo(this.bx, this.by);

      if (this.strokeStyle !== 'none') ctx.stroke();
    }
  }]);

  return Line;
}(DisplayObject);

function line(strokeStyle, lineWidth, ax, ay, bx, by) {
  var sprite = new Line(strokeStyle, lineWidth, ax, ay, bx, by);
  stage.addChild(sprite);
  return sprite;
}

var Text = function (_DisplayObject4) {
  _inherits(Text, _DisplayObject4);

  function Text() {
    var content = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'Hello!';
    var font = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '12px sans-serif';
    var fillStyle = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'red';
    var x = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
    var y = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;

    _classCallCheck(this, Text);

    var _this6 = _possibleConstructorReturn(this, (Text.__proto__ || Object.getPrototypeOf(Text)).call(this));

    Object.assign(_this6, { content: content, font: font, fillStyle: fillStyle, x: x, y: y });

    _this6.textBaseline = 'top';
    _this6.strokeText = 'none';
    return _this6;
  }

  _createClass(Text, [{
    key: 'render',
    value: function render(ctx) {
      ctx.font = this.font;
      ctx.strokeStyle = this.strokeStyle;
      ctx.lineWidth = this.lineWidth;
      ctx.fillStyle = this.fillStyle;

      if (this.width === 0) this.width = ctx.measureText(this.content).width;
      if (this.height === 0) this.height = ctx.measureText('M').width;

      ctx.translate(-this.width * this.pivotX, -this.height * this.pivotY);

      ctx.textBaseline = this.textBaseline;

      ctx.fillText(this.content, 0, 0);

      if (this.strokeText !== 'none') ctx.stroke();
    }
  }]);

  return Text;
}(DisplayObject);

function text(content, font, fillStyle, x, y) {
  var sprite = new Text(content, font, fillStyle, x, y);
  stage.addChild(sprite);
  return sprite;
}

var Group = function (_DisplayObject5) {
  _inherits(Group, _DisplayObject5);

  function Group() {
    _classCallCheck(this, Group);

    var _this7 = _possibleConstructorReturn(this, (Group.__proto__ || Object.getPrototypeOf(Group)).call(this));

    for (var _len4 = arguments.length, spritesToGroup = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
      spritesToGroup[_key4] = arguments[_key4];
    }

    spritesToGroup.forEach(function (sprite) {
      return _this7.addChild(sprite);
    });
    return _this7;
  }

  _createClass(Group, [{
    key: 'addChild',
    value: function addChild(sprite) {
      if (sprite.parent) {
        sprite.parent.removeChild(sprite);
      }
      sprite.parent = this;
      this.children.push(sprite);

      this.calculateSize();
    }
  }, {
    key: 'removeChild',
    value: function removeChild(sprite) {
      if (sprite.parent === this) {
        this.children.splice(this.children.indexOf(sprite), 1);
        this.calculateSize();
      } else {
        throw new Error(sprite + ' is not child of ' + this);
      }
    }
  }, {
    key: 'calculateSize',
    value: function calculateSize() {
      var _this8 = this;

      if (this.children.length > 0) {
        this._newWidth = 0;
        this._newHeight = 0;

        this.children.forEach(function (child) {
          if (child.x + child.width > _this8._newWidth) {
            _this8._newWidth = child.x + child.width;
          }
          if (child.y + child.height > _this8._newHeight) {
            _this8._newHeight = child.y + child.height;
          }
        });

        this.width = this._newWidth;
        this.height = this._newHeight;
      }
    }
  }]);

  return Group;
}(DisplayObject);

function group() {
  for (var _len5 = arguments.length, spritesToGroup = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
    spritesToGroup[_key5] = arguments[_key5];
  }

  var sprite = new (Function.prototype.bind.apply(Group, [null].concat(spritesToGroup)))();
  stage.addChild(sprite);
  return sprite;
}

var Sprite = function (_DisplayObject6) {
  _inherits(Sprite, _DisplayObject6);

  function Sprite(source) {
    var x = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var y = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

    _classCallCheck(this, Sprite);

    var _this9 = _possibleConstructorReturn(this, (Sprite.__proto__ || Object.getPrototypeOf(Sprite)).call(this));

    Object.assign(_this9, { x: x, y: y });

    if (source instanceof Image) {
      _this9.createFromImage(source);
    } else if (source.name) {
      _this9.createFromAtlas(source);
    } else if (source.image && !source.data) {
      _this9.createFromTileset(source);
    } else if (source.image && source.data) {
      _this9.createFromTilesetFrames(source);
    } else if (source instanceof Array) {
      if (source[0] && source[0].source) {
        _this9.createFromAtlasFrames(source);
      } else if (source[0] instanceof Image) {
        _this9.createFromImages(source);
      } else {
        throw new Error('The image sources in ' + source + ' are not recognized');
      }
    } else {
      throw new Error('The image source ' + source + ' is not recognized');
    }
    return _this9;
  }

  _createClass(Sprite, [{
    key: 'createFromImage',
    value: function createFromImage(source) {
      if (!(source instanceof Image)) {
        throw new Error(source + ' is not an image object');
      } else {
        this.source = source;
        this.sourceX = 0;
        this.sourceY = 0;
        this.sourceWidth = source.width;
        this.sourceHeight = source.height;

        this.width = source.width;
        this.height = source.height;
      }
    }
  }, {
    key: 'createFromAtlas',
    value: function createFromAtlas(source) {
      this.tilesetFrame = source;
      this.source = this.tilesetFrame.source;
      this.sourceX = this.tilesetFrame.sx;
      this.sourceY = this.tilesetFrame.sy;
      this.sourceWidth = source.tilew;
      this.sourceHeight = source.tileh;

      this.width = this.tilesetFrame.w;
      this.height = this.tilesetFrame.h;
    }
  }, {
    key: 'createFromTileset',
    value: function createFromTileset(source) {
      if (!(source.image instanceof Image)) {
        throw new Error(source.image + ' is not an image object');
      } else {
        this.source = source.image;

        this.sourceX = source.x;
        this.sourceY = source.y;
        this.sourceWidth = source.width;
        this.sourceHeight = source.height;

        this.width = source.width;
        this.height = source.height;
      }
    }
  }, {
    key: 'createFromTilesetFrames',
    value: function createFromTilesetFrames(source) {
      if (!(source.image instanceof Image)) {
        throw new Error(source.image + ' is not an image object');
      } else {
        this.source = source.image;
        this.frames = source.data;

        this.sourceX = this.frames[0][0];
        this.sourceY = this.frames[0][1];
        this.sourceWidth = source.width;
        this.sourceHeight = source.height;

        this.width = source.width;
        this.height = source.height;
      }
    }
  }, {
    key: 'createFromAtlasFrames',
    value: function createFromAtlasFrames(source) {
      this.frames = source;
      this.source = source[0].source;
      this.sourceX = source[0].frame.x;
      this.sourceY = source[0].frame.y;
      this.sourceWidth = source[0].frame.w;
      this.sourceHeight = source[0].frame.h;

      this.width = source[0].frame.w;
      this.height = source[0].frame.h;
    }
  }, {
    key: 'createFromImages',
    value: function createFromImages(source) {
      this.frames = source;
      this.source = source[0];
      this.sourceX = 0;
      this.sourceY = 0;
      this.sourceWidth = source[0].width;
      this.sourceHeight = source[0].height;

      this.width = source[0].width;
      this.height = source[0].height;
    }
  }, {
    key: 'gotoAndStop',
    value: function gotoAndStop(frameNumber) {
      if (this.frames.length > 0 && frameNumber < this.frames.length) {
        if (this.frames[0] instanceof Array) {
          this.sourceX = this.frames[frameNumber][0];
          this.sourceY = this.frames[frameNumber][1];
        } else if (this.frames[frameNumber].frame) {
          this.sourceX = this.frames[frameNumber].frame.x;
          this.sourceY = this.frames[frameNumber].frame.y;
          this.sourceWidth = this.frames[frameNumber].frame.w;
          this.sourceHeight = this.frames[frameNumber].frame.h;
          this.width = this.frames[frameNumber].frame.w;
          this.height = this.frames[frameNumber].frame.h;
        } else {
          this.source = this.frames[frameNumber];
          this.sourceX = 0;
          this.sourceY = 0;
          this.sourceWidth = this.source.width;
          this.sourceHeight = this.source.height;
          this.width = this.source.width;
          this.height = this.source.height;
        }

        this._currentFrame = frameNumber;
      } else {
        throw new Error('Frame number ' + frameNumber + ' does not exists!');
      }
    }
  }, {
    key: 'render',
    value: function render(ctx) {
      ctx.drawImage(this.source, this.sourceX, this.sourceY, this.sourceWidth, this.sourceHeight, -this.width * this.pivotX, -this.height * this.pivotY, this.width, this.height);
    }
  }]);

  return Sprite;
}(DisplayObject);

function sprite(source, x, y) {
  var sprite = new Sprite(source, x, y);
  if (sprite.frames.length > 0) addStatePlayer(sprite);
  stage.addChild(sprite);
  return sprite;
}

function frame(source, x, y, width, height) {
  var o = {};
  o.image = source;
  o.x = x;
  o.y = y;
  o.width = width;
  o.height = height;
  return o;
}

function frames(source, arrayOfPositions, width, height) {
  var o = {};
  o.image = source;
  o.data = arrayOfPositions;
  o.width = width;
  o.height = height;
  return o;
}

function filmstrip(image, frameWidth, frameHeight) {
  var spacing = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

  var positions = [];

  var columns = image.width / frameWidth;
  var rows = image.height / frameHeight;

  var numberOfFrames = columns * rows;

  for (var i = 0; i < numberOfFrames; i++) {
    var x = i % columns * frameWidth;
    var y = Math.floor(i / columns) * frameHeight;

    if (spacing && spacing > 0) {
      x += spacing + spacing * i % columns;
      y += spacing + spacing * Math.floor(i / columns);
    }

    positions.push([x, y]);
  }

  return frames(image, positions, frameWidth, frameHeight);
}

var Button = function (_Sprite) {
  _inherits(Button, _Sprite);

  function Button(source) {
    var x = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var y = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

    _classCallCheck(this, Button);

    var _this10 = _possibleConstructorReturn(this, (Button.__proto__ || Object.getPrototypeOf(Button)).call(this, source, x, y));

    _this10.interactive = true;
    return _this10;
  }

  return Button;
}(Sprite);

function button(source, x, y) {
  var sprite = new Button(source, x, y);
  stage.addChild(sprite);
  return sprite;
}

function makeInteractive(o) {
  o.press = o.press || undefined;
  o.release = o.release || undefined;
  o.over = o.over || undefined;
  o.out = o.out || undefined;
  o.tap = o.tap || undefined;

  o.state = 'up';

  o.action = '';

  o.pressed = false;
  o.hoverOver = false;

  o.update = function (pointer) {
    var hit = pointer.hitTestSprite(o);

    if (pointer.isUp) {
      o.state = 'up';
      if (o instanceof Button) o.gotoAndStop(0);
    }

    if (hit) {
      o.state = 'over';

      if (o.frames && o.frames.length === 3 && o instanceof Button) {
        o.gotoAndStop(1);
      }

      if (pointer.isDown) {
        o.state = 'down';

        if (o instanceof Button) {
          if (o.frames.length === 3) {
            o.gotoAndStop(2);
          } else {
            o.gotoAndStop(1);
          }
        }
      }
    }

    if (o.state === 'down') {
      if (!o.pressed) {
        if (o.press) o.press();
        o.pressed = true;
        o.action = 'pressed';
      }
    }

    if (o.state === 'over') {
      if (o.pressed) {
        if (o.release) o.release();
        o.pressed = false;
        o.action = 'released';

        if (pointer.tapped && o.tap) o.tap();
      }

      if (!o.hoverOver) {
        if (o.over) o.over();
        o.hoverOver = true;
      }
    }

    if (o.state === 'up') {
      if (o.pressed) {
        if (o.release) o.release();
        o.pressed = false;
        o.action = 'released';
      }

      if (o.hoverOver) {
        if (o.out) o.out();
        o.hoverOver = false;
      }
    }
  };
}

function addStatePlayer(sprite) {
  var frameCounter = 0;
  var numberOfFrames = 0;
  var startFrame = 0;
  var endFrame = 0;
  var timeInterval = void 0;

  function show(frameNumber) {
    reset();
    sprite.gotoAndStop(frameNumber);
  }

  function play() {
    playSequence([0, sprite.frames.length - 1]);
  }

  function stop() {
    reset();
    sprite.gotoAndStop(sprite.currentFrame);
  }

  function playSequence(sequenceArray) {
    reset();

    startFrame = sequenceArray[0];
    endFrame = sequenceArray[1];
    numberOfFrames = endFrame - startFrame;

    if (startFrame === 0) {
      numberOfFrames += 1;
      frameCounter += 1;
    }

    if (numberOfFrames === 1) {
      numberOfFrames = 2;
      frameCounter += 1;
    }

    if (!sprite.fps) sprite.fps = 12;
    var frameRate = 1000 / sprite.fps;

    sprite.gotoAndStop(startFrame);

    if (!sprite.playing) {
      timeInterval = setInterval(advanceFrame.bind(this), frameRate);
      sprite.playing = true;
    }
  }

  function advanceFrame() {
    if (frameCounter < numberOfFrames) {
      sprite.gotoAndStop(sprite.currentFrame + 1);
      frameCounter += 1;
    } else {
      if (sprite.loop) {
        sprite.gotoAndStop(startFrame);
        frameCounter = 1;
      }
    }
  }

  function reset() {
    if (timeInterval !== undefined && sprite.playing === true) {
      sprite.playing = false;
      frameCounter = 0;
      startFrame = 0;
      endFrame = 0;
      numberOfFrames = 0;
      clearInterval(timeInterval);
    }
  }

  sprite.show = show;
  sprite.play = play;
  sprite.stop = stop;
  sprite.playSequence = playSequence;
}

function particleEffect() {
  var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
  var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var spriteFunction = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function () {
    return circle(10, 'red');
  };
  var numberOfParticles = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 10;
  var gravity = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;
  var randomSpacing = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : true;
  var minAngle = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : 0;
  var maxAngle = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : 6.28;
  var minSize = arguments.length > 8 && arguments[8] !== undefined ? arguments[8] : 4;
  var maxSize = arguments.length > 9 && arguments[9] !== undefined ? arguments[9] : 16;
  var minSpeed = arguments.length > 10 && arguments[10] !== undefined ? arguments[10] : 0.1;
  var maxSpeed = arguments.length > 11 && arguments[11] !== undefined ? arguments[11] : 1;
  var minScaleSpeed = arguments.length > 12 && arguments[12] !== undefined ? arguments[12] : 0.01;
  var maxScaleSpeed = arguments.length > 13 && arguments[13] !== undefined ? arguments[13] : 0.05;
  var minAlphaSpeed = arguments.length > 14 && arguments[14] !== undefined ? arguments[14] : 0.02;
  var maxAlphaSpeed = arguments.length > 15 && arguments[15] !== undefined ? arguments[15] : 0.02;
  var minRotationSpeed = arguments.length > 16 && arguments[16] !== undefined ? arguments[16] : 0.01;
  var maxRotationSpeed = arguments.length > 17 && arguments[17] !== undefined ? arguments[17] : 0.03;

  var randomFloat = function randomFloat(min, max) {
    return min + Math.random() * (max - min);
  };
  var randomInt = function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  var angles = [];
  var angle = void 0;

  var spacing = (maxAngle - minAngle) / (numberOfParticles - 1);

  for (var i = 0; i < numberOfParticles; i++) {
    if (randomSpacing) {
      angle = randomFloat(minAngle, maxAngle);
      angles.push(angle);
    } else {
      if (angle === undefined) angle = minAngle;
      angles.push(angle);
      angle += spacing;
    }
  }

  angles.forEach(function (angle) {
    return makeParticle(angle);
  });

  function makeParticle(angle) {
    var particle = spriteFunction();

    if (particle.frames.length > 0) {
      particle.gotoAndStop(randomInt(0, particle.frames.length - 1));
    }

    particle.x = x - particle.halfHeight;
    particle.y = y - particle.halfHeight;

    var size = randomInt(minSize, maxSize);
    particle.width = size;
    particle.height = size;

    particle.scaleSpeed = randomFloat(minScaleSpeed, maxScaleSpeed);
    particle.alphaSpeed = randomFloat(minAlphaSpeed, maxAlphaSpeed);
    particle.rotationSpeed = randomFloat(minRotationSpeed, maxRotationSpeed);

    var speed = randomFloat(minSpeed, maxSpeed);
    particle.vx = speed * Math.cos(angle);
    particle.vy = speed * Math.sin(angle);

    particle.update = function () {
      particle.vy += gravity;

      particle.x += particle.vx;
      particle.y += particle.vy;

      if (particle.scaleX - particle.scaleSpeed > 0) {
        particle.scaleX -= particle.scaleSpeed;
      }
      if (particle.scaleY - particle.scaleSpeed > 0) {
        particle.scaleY -= particle.scaleSpeed;
      }

      particle.rotation += particle.rotationSpeed;

      particle.alpha -= particle.alphaSpeed;

      if (particle.alpha <= 0) {
        remove(particle);
        particles.splice(particles.indexOf(particle), 1);
      }
    };

    particles.push(particle);
  }
}

function emitter(interval, particleFunction) {
  var emitter = {};
  var timerInterval = void 0;

  emitter.playing = false;

  function play() {
    if (!emitter.playing) {
      particleFunction();
      timerInterval = setInterval(emitParticle.bind(this), interval);
      emitter.playing = true;
    }
  }

  function stop() {
    if (emitter.playing) {
      clearInterval(timerInterval);
      emitter.playing = false;
    }
  }

  function emitParticle() {
    particleFunction();
  }

  emitter.play = play;
  emitter.stop = stop;

  return emitter;
}

function grid() {
  var columns = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
  var rows = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var cellWidth = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 32;
  var cellHeight = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 32;
  var centerCell = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
  var xOffset = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 0;
  var yOffset = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : 0;
  var makeSprite = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : undefined;
  var extra = arguments.length > 8 && arguments[8] !== undefined ? arguments[8] : undefined;

  var container = group();
  var createGrid = function createGrid() {
    var length = columns * rows;

    for (var i = 0; i < length; i++) {
      var x = i % columns * cellWidth;
      var y = Math.floor(i / columns) * cellHeight;

      var _sprite = makeSprite();
      container.addChild(_sprite);

      if (!centerCell) {
        _sprite.x = x + xOffset;
        _sprite.y = y + yOffset;
      } else {
        _sprite.x = x + cellWidth / 2 - _sprite.halfWidth + xOffset;
        _sprite.y = y + cellHeight / 2 - _sprite.halfHeight + yOffset;
      }

      if (extra) extra(_sprite);
    }
  };

  createGrid();

  return container;
}

function tilingSprite(width, height, source) {
  var x = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
  var y = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;

  var tileWidth = void 0,
      tileHeight = void 0;

  if (source.frame) {
    tileWidth = source.frame.w;
    tileHeight = source.frame.h;
  } else {
    tileWidth = source.width;
    tileHeight = source.height;
  }

  var columns = void 0,
      rows = void 0;

  if (width >= tileWidth) {
    columns = Math.round(width / tileWidth) + 1;
  } else {
    columns = 2;
  }

  if (height >= tileHeight) {
    rows = Math.round(height / tileHeight) + 1;
  } else {
    rows = 2;
  }

  var tileGrid = grid(columns, rows, tileWidth, tileHeight, false, 0, 0, function () {
    var tile = sprite(source);
    return tile;
  });

  tileGrid._tileX = 0;
  tileGrid._tileY = 0;

  var container = rectangle(width, height, 'none', 'none');
  container.x = x;
  container.y = y;

  container.mask = true;

  container.addChild(tileGrid);

  Object.defineProperties(container, {
    tileX: {
      get: function get() {
        return tileGrid._tileX;
      },
      set: function set(value) {
        tileGrid.children.forEach(function (child) {
          var difference = value - tileGrid._tileX;
          child.x += difference;

          if (child.x > (columns - 1) * tileWidth) {
            child.x = 0 - tileWidth + difference;
          }

          if (child.x < 0 - tileWidth - difference) {
            child.x = (columns - 1) * tileWidth;
          }
        });

        tileGrid._tileX = value;
      },

      enumerable: true,
      configurable: true
    },
    tileY: {
      get: function get() {
        return tileGrid._tileY;
      },
      set: function set(value) {
        tileGrid.children.forEach(function (child) {
          var difference = value - tileGrid._tileY;
          child.y += difference;
          if (child.y > (rows - 1) * tileHeight) {
            child.y = 0 - tileHeight + difference;
          }
          if (child.y < 0 - tileHeight - difference) {
            child.y = (rows - 1) * tileHeight;
          }
        });
        tileGrid._tileY = value;
      },

      enumerable: true,
      configurable: true
    }
  });

  return container;
}

var stageBackground = void 0;

var Background = function () {
  function Background(source, width, height) {
    var x = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
    var y = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;

    _classCallCheck(this, Background);

    this.source = source;

    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
  }

  _createClass(Background, [{
    key: 'render',
    value: function render(ctx) {
      if (!this.pattern) {
        this.pattern = ctx.createPattern(this.source, 'repeat');
      }
      ctx.fillStyle = this.pattern;

      ctx.translate(this.x, this.y);
      ctx.fillRect(-this.x, -this.y, this.width, this.height);
      ctx.translate(-this.x, -this.y);
    }
  }]);

  return Background;
}();

function background(source, width, height, x, y) {
  stageBackground = new Background(source, width, height, x, y);
  return stageBackground;
}

},{}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.keyboard = keyboard;
exports.makePointer = makePointer;

var _display = require('./display');

var _display2 = _interopRequireDefault(_display);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function keyboard(keyCode) {
  var key = {};
  key.code = keyCode;
  key.isDown = false;
  key.isUp = true;
  key.press = undefined;
  key.release = undefined;

  key.downHandler = function (event) {
    if (event.keyCode === key.code) {
      if (key.isUp && key.press) key.press();
      key.isDown = true;
      key.isUp = false;
    }
    event.preventDefault();
  };

  key.upHandler = function (event) {
    if (event.keyCode === key.code) {
      if (key.isDown && key.release) key.release();
      key.isDown = false;
      key.isUp = true;
    }
    event.preventDefault();
  };

  window.addEventListener('keydown', key.downHandler.bind(key), false);
  window.addEventListener('keyup', key.upHandler.bind(key), false);

  return key;
}

function makePointer(element) {
  var scale = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

  var pointer = {
    element: element,
    scale: scale,

    _x: 0,
    _y: 0,

    get x() {
      return this._x / this.scale;
    },
    get y() {
      return this._y / this.scale;
    },

    get centerX() {
      return this.x;
    },
    get centerY() {
      return this.y;
    },

    get position() {
      return { x: this.x, y: this.y };
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

    moveHandler: function moveHandler(event) {
      var element = event.target;

      this._x = event.pageX - element.offsetLeft;
      this._y = event.pageY - element.offsetTop;

      event.preventDefault();
    },
    touchMoveHandler: function touchMoveHandler(event) {
      var element = event.target;

      this._x = event.targetTouches[0].pageX - element.offsetLeft;
      this._y = event.targetTouches[0].pageY - element.offsetTop;

      event.preventDefault();
    },
    downHandler: function downHandler(event) {
      this.isDown = true;
      this.isUp = false;
      this.tapped = false;

      this.downTime = Date.now();

      if (this.press) this.press();
      event.preventDefault();
    },
    touchStartHandler: function touchStartHandler(event) {
      var element = event.target;

      this._x = event.targetTouches[0].pageX - element.offsetLeft;
      this._y = event.targetTouches[0].pageY - element.offsetTop;

      this.isDown = true;
      this.isUp = false;
      this.tapped = false;

      this.downTime = Date.now();

      if (this.press) this.press();
      event.preventDefault();
    },
    upHandler: function upHandler(event) {
      this.elapsedTime = Math.abs(this.downTime - Date.now());
      if (this.elapsedTime <= 200 && this.tapped === false) {
        this.tapped = true;
        if (this.tap) this.tap();
      }

      this.isUp = true;
      this.isDown = false;

      if (this.release) this.release();
      event.preventDefault();
    },
    touchEndHandler: function touchEndHandler(event) {
      this.elapsedTime = Math.abs(this.downTime - Date.now());

      if (this.elapsedTime <= 200 && this.tapped === false) {
        this.tapped = true;
        if (this.tap) this.tap();
      }

      this.isUp = true;
      this.isDown = false;

      if (this.release) this.release();
      event.preventDefault();
    },
    hitTestSprite: function hitTestSprite(sprite) {
      var hit = false;

      if (!sprite.circular) {
        var left = sprite.gx;
        var right = sprite.gx + sprite.width;
        var top = sprite.gy;
        var bottom = sprite.gy + sprite.height;

        hit = this.x > left && this.x < right && this.y > top && this.y < bottom;
      } else {
        var vx = this.x - (sprite.gx + sprite.radius);
        var vy = this.y - (sprite.gy + sprite.radius);
        var distance = Math.sqrt(vx * vx + vy * vy);

        hit = distance < sprite.radius;
      }

      return hit;
    },
    updateDragAndDrop: function updateDragAndDrop(sprite) {
      var _this = this;

      if (this.isDown) {
        if (this.dragSprite === null) {
          for (var i = _display2.default.length - 1; i > -1; i--) {
            var _sprite = _display2.default[i];

            if (this.hitTestSprite(_sprite) && _sprite.draggable) {
              this.dragOffsetX = this.x - _sprite.gx;
              this.dragOffsetY = this.y - _sprite.gy;

              this.dragSprite = _sprite;

              // reorder sprites to display dragged sprite above all
              var children = _sprite.parent.children;
              children.splice(children.indexOf(_sprite), 1);
              children.push(_sprite);

              // reorder draggableSprites in the same way
              _display2.default.splice(_display2.default.indexOf(_sprite), 1);
              _display2.default.push(_sprite);
            }
          }
        } else {
          this.dragSprite.x = this.x - this.dragOffsetX;
          this.dragSprite.y = this.y - this.dragOffsetY;
        }
      }

      if (this.isUp) {
        this.dragSprite = null;
      }

      // change cursor to hand if it's over draggable sprites
      _display2.default.some(function (sprite) {
        if (_this.hitTestSprite(sprite) && sprite.draggable) {
          _this.element.style.cursor = 'pointer';
          return true;
        } else {
          _this.element.style.cursor = 'auto';
          return false;
        }
      });
    }
  };

  element.addEventListener('mousemove', pointer.moveHandler.bind(pointer), false);

  element.addEventListener('mousedown', pointer.downHandler.bind(pointer), false);

  element.addEventListener('mouseup', pointer.upHandler.bind(pointer), false);

  element.addEventListener('touchmove', pointer.touchMoveHandler.bind(pointer), false);

  element.addEventListener('touchstart', pointer.touchStartHandler.bind(pointer), false);

  element.addEventListener('touchend', pointer.touchEndHandler.bind(pointer), false);

  element.style.touchAction = 'none';

  return pointer;
}

},{"./display":2}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.makeSound = makeSound;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var actx = new AudioContext();

var Sound = function () {
  function Sound(source, loadHandler) {
    _classCallCheck(this, Sound);

    this.source = source;
    this.loadHandler = loadHandler;

    this.actx = actx;
    this.volumeNode = this.actx.createGain();
    this.panNode = this.actx.createStereoPanner();
    this.soundNode = null;
    this.buffer = null;
    this.loop = false;
    this.playing = false;

    this.panValue = 0;
    this.volumeValue = 1;

    this.startTime = 0;
    this.startOffset = 0;

    this.load();
  }

  _createClass(Sound, [{
    key: 'load',
    value: function load() {
      var _this = this;

      var xhr = new XMLHttpRequest();
      xhr.open('GET', this.source, true);
      xhr.responseType = 'arraybuffer';
      xhr.addEventListener('load', function () {
        _this.actx.decodeAudioData(xhr.response, function (buffer) {
          _this.buffer = buffer;
          _this.hasLoaded = true;

          if (_this.loadHandler) {
            _this.loadHandler();
          }
        }, function (error) {
          throw new Error('Audio could not be decoded: ' + error);
        });
      });

      xhr.send();
    }
  }, {
    key: 'play',
    value: function play() {
      this.startTime = this.actx.currentTime;
      this.soundNode = this.actx.createBufferSource();

      this.soundNode.buffer = this.buffer;

      this.soundNode.connect(this.volumeNode);
      this.volumeNode.connect(this.panNode);
      this.panNode.connect(this.actx.destination);

      this.soundNode.loop = this.loop;

      this.soundNode.start(this.startTime, this.startOffset % this.buffer.duration);

      this.playing = true;
    }
  }, {
    key: 'pause',
    value: function pause() {
      if (this.playing) {
        this.soundNode.stop(this.actx.currentTime);
        this.startOffset += this.actx.currentTime - this.startTime;
        this.playing = false;
      }
    }
  }, {
    key: 'restart',
    value: function restart() {
      if (this.playing) {
        this.soundNode.stop(this.actx.currentTime);
      }
      this.startOffset = 0;
      this.play();
    }
  }, {
    key: 'playFrom',
    value: function playFrom(value) {
      if (this.playing) {
        this.soundNode.stop(this.actx.currentTime);
      }
      this.startOffset = value;
      this.play();
    }
  }, {
    key: 'volume',
    get: function get() {
      return this.volumeValue;
    },
    set: function set(value) {
      this.volumeNode.gain.value = value;
      this.volumeValue = value;
    }
  }, {
    key: 'pan',
    get: function get() {
      return this.panValue;
    },
    set: function set(value) {
      this.panNode.pan.value = value;
      this.panValue = value;
    }
  }]);

  return Sound;
}();

function makeSound(source, loadHandler) {
  return new Sound(source, loadHandler);
}

},{}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.randomFloat = exports.randomInt = exports.assets = undefined;
exports.contain = contain;
exports.outsideBounds = outsideBounds;
exports.wrap = wrap;
exports.capturePreviousPositions = capturePreviousPositions;
exports.distance = distance;
exports.followEase = followEase;
exports.followConstant = followConstant;
exports.angle = angle;
exports.rotateSprite = rotateSprite;
exports.rotatePoint = rotatePoint;

var _sound = require('./sound');

var assets = exports.assets = {
  toLoad: 0,
  loaded: 0,

  imageExtensions: ['png', 'jpg', 'gif'],
  fontExtensions: ['ttf', 'otf', 'ttc', 'woff'],
  jsonExtensions: ['json'],
  audioExtensions: ['mp3', 'ogg', 'wav', 'webm'],

  // API
  load: function load(sources) {
    var _this = this;

    return new Promise(function (resolve) {
      var loadHandler = function loadHandler() {
        _this.loaded += 1;
        console.log(_this.loaded);

        if (_this.toLoad === _this.loaded) {
          _this.loaded = 0;
          _this.toLoad = 0;
          console.log('Assets loaded!');

          resolve();
        }
      };

      console.log('Loading assets...');

      _this.toLoad = sources.length;

      sources.forEach(function (source) {
        var extension = source.split('.').pop();

        if (_this.imageExtensions.indexOf(extension) !== -1) {
          _this.loadImage(source, loadHandler);
        } else if (_this.fontExtensions.indexOf(extension) !== -1) {
          _this.loadFont(source, loadHandler);
        } else if (_this.jsonExtensions.indexOf(extension) !== -1) {
          _this.loadJson(source, loadHandler);
        } else if (_this.audioExtensions.indexOf(extension) !== -1) {
          _this.loadSound(source, loadHandler);
        } else {
          console.log('File type not recognized: ' + source);
        }
      });
    });
  },
  loadImage: function loadImage(source, loadHandler) {
    var image = new Image();
    image.addEventListener('load', loadHandler, false);
    this[source] = image;
    image.src = source;
  },
  loadFont: function loadFont(source, loadHandler) {
    var fontFamily = source.split('/').pop().split('.')[0];

    var newStyle = document.createElement('style');
    var fontFace = "@font-face {font-family: '" + fontFamily + "'; src: url('" + source + "');}";

    newStyle.appendChild(document.createTextNode(fontFace));
    document.head.appendChild(newStyle);

    loadHandler();
  },
  loadJson: function loadJson(source, loadHandler) {
    var _this2 = this;

    var xhr = new XMLHttpRequest();
    xhr.open('GET', source, true);
    xhr.responseType = 'text';

    xhr.onload = function (event) {
      if (xhr.status === 200) {
        var file = JSON.parse(xhr.responseText);
        file.name = source;
        _this2[file.name] = file;

        if (file.sprites) {
          _this2.createSpriteSheet(file, source, loadHandler);
        } else {
          loadHandler();
        }
      }
    };

    xhr.send();
  },
  createSpriteSheet: function createSpriteSheet(file, source, loadHandler) {
    var _this3 = this;

    var baseUrl = source.replace(/[^/]*$/, '');
    var imageSource = baseUrl + file.imagePath;

    var imageLoadHandler = function imageLoadHandler() {
      _this3[imageSource] = image;

      Object.keys(file.sprites).forEach(function (sprite) {
        _this3[sprite] = file.sprites[sprite];
        _this3[sprite].source = image;
      });

      loadHandler();
    };

    var image = new Image();
    image.addEventListener('load', imageLoadHandler, false);
    image.src = imageSource;
  },
  loadSound: function loadSound(source, loadHandler) {
    var sound = (0, _sound.makeSound)(source, loadHandler);

    sound.name = source;
    this[sound.name] = sound;
  }
};

function contain(sprite, bounds) {
  var bounce = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  var extra = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : undefined;

  var x = bounds.x;
  var y = bounds.y;
  var width = bounds.width;
  var height = bounds.height;

  var collision = void 0;

  if (sprite.x < x) {
    if (bounce) sprite.vx *= -1;
    if (sprite.mass) sprite.vx /= sprite.mass;

    sprite.x = x;
    collision = 'left';
  }

  if (sprite.y < y) {
    if (bounce) sprite.vy *= -1;
    if (sprite.mass) sprite.vy /= sprite.mass;

    sprite.y = y;
    collision = 'top';
  }

  if (sprite.x + sprite.width > width) {
    if (bounce) sprite.vx *= -1;
    if (sprite.mass) sprite.vx /= sprite.mass;

    sprite.x = width - sprite.width;
    collision = 'right';
  }

  if (sprite.y + sprite.height > height) {
    if (bounce) sprite.vy *= -1;
    if (sprite.mass) sprite.vy /= sprite.mass;

    sprite.y = height - sprite.height;
    collision = 'bottom';
  }

  if (collision && extra) extra(collision);

  return collision;
}

function outsideBounds(sprite, bounds) {
  var extra = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;

  var x = bounds.x;
  var y = bounds.y;
  var width = bounds.width;
  var height = bounds.height;

  var collision = void 0;

  if (sprite.x < x - sprite.width) {
    collision = 'left';
  }
  if (sprite.y < y - sprite.height) {
    collision = 'top';
  }
  if (sprite.x > width) {
    collision = 'right';
  }
  if (sprite.y > height) {
    collision = 'bottom';
  }

  if (collision && extra) extra(collision);

  return collision;
}

function wrap(sprite, bounds) {
  var width = bounds.width;
  var height = bounds.height;

  if (sprite.x + sprite.width < 0) {
    sprite.x = width;
  }
  if (sprite.y + sprite.height < 0) {
    sprite.y = height;
  }
  if (sprite.x - sprite.width > width) {
    sprite.x = -sprite.width;
  }
  if (sprite.y - sprite.height > height) {
    sprite.y = -sprite.height;
  }
}

function capturePreviousPositions(stage) {
  stage.children.forEach(function (sprite) {
    setPreviousPosition(sprite);
  });

  function setPreviousPosition(sprite) {
    sprite.previousX = sprite.x;
    sprite.previousY = sprite.y;

    if (sprite.children && sprite.children.length > 0) {
      sprite.children.forEach(function (child) {
        setPreviousPosition(child);
      });
    }
  }
}

function distance(s1, s2) {
  var vx = s2.centerX - s1.centerX;
  var vy = s2.centerY - s1.centerY;

  return Math.sqrt(vx * vx + vy * vy);
}

function followEase(follower, leader, speed) {
  var vx = leader.centerX - follower.centerX;
  var vy = leader.centerY - follower.centerY;
  var distance = Math.sqrt(vx * vx + vy * vy);
  if (distance >= 1) {
    follower.x += vx * speed;
    follower.y += vy * speed;
  }
}

function followConstant(follower, leader, speed) {
  var vx = leader.centerX - follower.centerX;
  var vy = leader.centerY - follower.centerY;
  var distance = Math.sqrt(vx * vx + vy * vy);
  if (distance >= speed) {
    follower.x += vx / distance * speed;
    follower.y += vy / distance * speed;
  }
}

function angle(s1, s2) {
  return Math.atan2(s2.centerX - s1.centerX, s2.centerY - s1.centerY);
}

function rotateSprite(rotatingSprite, centerSprite, distance, angle) {
  rotatingSprite.x = centerSprite.centerX - rotatingSprite.parent.x + distance * Math.cos(angle) - rotatingSprite.halfWidth;
  rotatingSprite.y = centerSprite.centerY - rotatingSprite.parent.y + distance * Math.sin(angle) - rotatingSprite.halfWidth;
}

function rotatePoint(pointX, pointY, distanceX, distanceY, angle) {
  var point = {};

  point.x = pointX + Math.cos(angle) * distanceX;
  point.y = pointY + Math.sin(angle) * distanceY;

  return point;
}

// Random range
var randomInt = exports.randomInt = function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

var randomFloat = exports.randomFloat = function randomFloat(min, max) {
  return min + Math.random() * (max - min);
};

},{"./sound":4}],6:[function(require,module,exports){
'use strict';

var _display = require('./engine/display');

var _utilities = require('./engine/utilities');

var _interactive = require('./engine/interactive');

var _collision = require('./engine/collision');

_utilities.assets.load(['bgs/darkPurple.png', 'fonts/kenvector_future_thin.ttf', 'sounds/sfx_laser1.mp3', 'sprites/sheet.json']).then(function () {
  return setup();
});

// define 'main' variables
var canvas = void 0,
    ship = void 0,
    message = void 0,
    shootSfx = void 0,
    bg = void 0;
var bullets = [];
var asteroids = [];

var score = 0;

function shoot(shooter, angle, offsetFromCenter, bulletSpeed, bulletsArray, bulletSprite) {
  var bullet = bulletSprite();

  bullet.x = shooter.centerX - bullet.halfWidth + offsetFromCenter * Math.cos(angle);
  bullet.y = shooter.centerY - bullet.halfHeight + offsetFromCenter * Math.sin(angle);

  bullet.vx = Math.sin(angle) * bulletSpeed;
  bullet.vy = -Math.cos(angle) * bulletSpeed;

  bullet.rotation = angle;

  bulletsArray.push(bullet);

  (0, _display.particleEffect)(bullet.x, bullet.y);
  shootSfx.play();
}

function spawnAsteroid() {
  var x = (0, _utilities.randomInt)(0, _display.stage.localBounds.width);
  var y = (0, _utilities.randomInt)(0, _display.stage.localBounds.height);

  var asteroid = (0, _display.sprite)(_utilities.assets['meteorBrown_big1.png'], x, y);
  asteroid.circular = true;
  asteroid.diameter = 90;

  asteroid.vx = (0, _utilities.randomFloat)(-5, 5);
  asteroid.vy = (0, _utilities.randomFloat)(-5, 5);

  asteroid.rotationSpeed = (0, _utilities.randomFloat)(0.01, 0.07);

  asteroids.push(asteroid);
}

// Let's party begins!
function setup() {
  canvas = (0, _display.makeCanvas)(1280, 720, 'none');
  _display.stage.width = canvas.width;
  _display.stage.height = canvas.height;

  shootSfx = _utilities.assets['sounds/sfx_laser1.mp3'];

  bg = (0, _display.background)(_utilities.assets['bgs/darkPurple.png'], canvas.width, canvas.height);

  ship = (0, _display.sprite)(_utilities.assets['playerShip2_red.png']);
  ship.scaleX = 0.5;
  ship.scaleY = 0.5;
  _display.stage.putCenter(ship);

  ship.vx = 0;
  ship.vy = 0;
  ship.accelerationX = 0.2;
  ship.accelerationY = 0.2;
  ship.friction = 0.96;
  ship.speed = 0;

  ship.rotationSpeed = 0;

  ship.moveForward = false;

  ship.lives = 3;
  ship.destroyed = false;

  var leftArrow = (0, _interactive.keyboard)(37);
  var rightArrow = (0, _interactive.keyboard)(39);
  var upArrow = (0, _interactive.keyboard)(38);
  var space = (0, _interactive.keyboard)(32);

  leftArrow.press = function () {
    ship.rotationSpeed = -0.1;
  };
  leftArrow.release = function () {
    if (!rightArrow.isDown) ship.rotationSpeed = 0;
  };

  rightArrow.press = function () {
    ship.rotationSpeed = 0.1;
  };
  rightArrow.release = function () {
    if (!leftArrow.isDown) ship.rotationSpeed = 0;
  };

  upArrow.press = function () {
    ship.moveForward = true;
  };
  upArrow.release = function () {
    ship.moveForward = false;
  };

  space.press = function () {
    shoot(ship, ship.rotation, 14, 10, bullets, function () {
      return (0, _display.sprite)(_utilities.assets['laserRed07.png']);
    });
    shoot(ship, ship.rotation, -14, 10, bullets, function () {
      return (0, _display.sprite)(_utilities.assets['laserRed07.png']);
    });
  };

  message = (0, _display.text)('Hello!', '16px kenvector_future_thin', 'white', 8, 8);

  for (var i = 0; i < 5; i++) {
    spawnAsteroid();
  }

  gameLoop();
}

function gameLoop() {
  requestAnimationFrame(gameLoop);

  if (_display.particles.length > 0) {
    _display.particles.forEach(function (particle) {
      particle.update();
    });
  }

  bullets = bullets.filter(function (bullet) {
    bullet.x += bullet.vx;
    bullet.y += bullet.vy;

    var collision = (0, _utilities.outsideBounds)(bullet, _display.stage.localBounds);

    if (collision) {
      (0, _display.remove)(bullet);
      return false;
    }

    return true;
  });

  for (var i = 0; i < asteroids.length; i++) {
    var a1 = asteroids[i];

    // update asteroid
    a1.rotation += a1.rotationSpeed;
    a1.x += a1.vx;
    a1.y += a1.vy;

    (0, _utilities.wrap)(a1, _display.stage.localBounds);

    // check collisisons
    // between asteroids
    for (var j = i + 1; j < asteroids.length; j++) {
      var a2 = asteroids[j];

      (0, _collision.movingCircleCollision)(a1, a2);
    }
    // and with player
    var playerHit = (0, _collision.circleRectangleCollision)(a1, ship, true);
    if (playerHit) {
      ship.lives -= 1;
      // destroy ship
      ship.destroyed = true;
      // stage.removeChild(ship);
      (0, _display.particleEffect)(ship.centerX, ship.centerY);

      // respawn ship
      setTimeout(function () {
        // stage.addChild(ship);
        _display.stage.putCenter(ship);
        ship.rotation = 0;
        ship.destroyed = false;
      }, 1000);
    }
  }

  if (!ship.destroyed) {
    ship.rotation += ship.rotationSpeed;

    if (ship.moveForward) {
      ship.vx += ship.accelerationX * Math.sin(ship.rotation);
      ship.vy += -ship.accelerationY * Math.cos(ship.rotation);
    } else {
      ship.vx *= ship.friction;
      ship.vy *= ship.friction;
    }

    ship.x += ship.vx;
    ship.y += ship.vy;

    (0, _utilities.wrap)(ship, _display.stage.localBounds);
  }

  bg.x -= Math.floor(ship.vx);
  bg.y -= Math.floor(ship.vy);

  message.content = 'Scores: ' + score;

  (0, _display.render)(canvas);
}

},{"./engine/collision":1,"./engine/display":2,"./engine/interactive":3,"./engine/utilities":5}]},{},[6])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnRcXHNyY1xcanNcXGVuZ2luZVxcY29sbGlzaW9uLmpzIiwiY2xpZW50XFxzcmNcXGpzXFxlbmdpbmVcXGRpc3BsYXkuanMiLCJjbGllbnRcXHNyY1xcanNcXGVuZ2luZVxcaW50ZXJhY3RpdmUuanMiLCJjbGllbnRcXHNyY1xcanNcXGVuZ2luZVxcc291bmQuanMiLCJjbGllbnRcXHNyY1xcanNcXGVuZ2luZVxcdXRpbGl0aWVzLmpzIiwiY2xpZW50XFxzcmNcXGpzXFxnYW1lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7UUNBZ0IsWSxHQUFBLFk7UUE2QkEsYSxHQUFBLGE7UUFtQkEsZSxHQUFBLGU7UUEwQ0EscUIsR0FBQSxxQjtRQW9GQSx1QixHQUFBLHVCO1FBVUEsZ0IsR0FBQSxnQjtRQTZCQSxrQixHQUFBLGtCO1FBeURBLHNCLEdBQUEsc0I7UUEyRUEsa0IsR0FBQSxrQjtRQVVBLHdCLEdBQUEsd0I7UUE2RUEsb0IsR0FBQSxvQjtRQTZDQSxHLEdBQUEsRztBQTdkVCxTQUFTLFlBQVQsQ0FBdUIsS0FBdkIsRUFBOEIsTUFBOUIsRUFBc0M7QUFDM0MsTUFBSSxjQUFKO0FBQUEsTUFBVyxhQUFYO0FBQUEsTUFBaUIsY0FBakI7QUFBQSxNQUF3QixZQUF4QjtBQUFBLE1BQTZCLGVBQTdCO0FBQUEsTUFBcUMsV0FBckM7QUFBQSxNQUF5QyxXQUF6QztBQUFBLE1BQTZDLGtCQUE3QztBQUFBLE1BQXdELFlBQXhEOztBQUVBLE1BQUksT0FBTyxNQUFYLEVBQW1CO0FBQ2pCLFlBQVEsUUFBUjtBQUNELEdBRkQsTUFFTztBQUNMLFlBQVEsV0FBUjtBQUNEOztBQUVELE1BQUksVUFBVSxXQUFkLEVBQTJCO0FBQ3pCLFdBQU8sT0FBTyxDQUFkO0FBQ0EsWUFBUSxPQUFPLENBQVAsR0FBVyxPQUFPLEtBQTFCO0FBQ0EsVUFBTSxPQUFPLENBQWI7QUFDQSxhQUFTLE9BQU8sQ0FBUCxHQUFXLE9BQU8sTUFBM0I7O0FBRUEsVUFBTSxNQUFNLENBQU4sR0FBVSxJQUFWLElBQWtCLE1BQU0sQ0FBTixHQUFVLEtBQTVCLElBQXFDLE1BQU0sQ0FBTixHQUFVLEdBQS9DLElBQXNELE1BQU0sQ0FBTixHQUFVLE1BQXRFO0FBQ0Q7O0FBRUQsTUFBSSxVQUFVLFFBQWQsRUFBd0I7QUFDdEIsU0FBSyxNQUFNLENBQU4sR0FBVSxPQUFPLE9BQXRCO0FBQ0EsU0FBSyxNQUFNLENBQU4sR0FBVSxPQUFPLE9BQXRCO0FBQ0EsZ0JBQVksS0FBSyxJQUFMLENBQVUsS0FBSyxFQUFMLEdBQVUsS0FBSyxFQUF6QixDQUFaOztBQUVBLFVBQU0sWUFBWSxPQUFPLE1BQXpCO0FBQ0Q7O0FBRUQsU0FBTyxHQUFQO0FBQ0Q7O0FBRU0sU0FBUyxhQUFULENBQXdCLEVBQXhCLEVBQTRCLEVBQTVCLEVBQWdEO0FBQUEsTUFBaEIsTUFBZ0IsdUVBQVAsS0FBTzs7QUFDckQsTUFBSSxXQUFKO0FBQUEsTUFBUSxXQUFSO0FBQUEsTUFBWSxrQkFBWjtBQUFBLE1BQXVCLHNCQUF2QjtBQUFBLE1BQXNDLFlBQXRDOztBQUVBLE1BQUksTUFBSixFQUFZO0FBQ1YsU0FBTSxHQUFHLEVBQUgsR0FBUSxHQUFHLE1BQVosSUFBdUIsR0FBRyxFQUFILEdBQVEsR0FBRyxNQUFsQyxDQUFMO0FBQ0EsU0FBTSxHQUFHLEVBQUgsR0FBUSxHQUFHLE1BQVosSUFBdUIsR0FBRyxFQUFILEdBQVEsR0FBRyxNQUFsQyxDQUFMO0FBQ0QsR0FIRCxNQUdPO0FBQ0wsU0FBSyxHQUFHLE9BQUgsR0FBYSxHQUFHLE9BQXJCO0FBQ0EsU0FBSyxHQUFHLE9BQUgsR0FBYSxHQUFHLE9BQXJCO0FBQ0Q7O0FBRUQsY0FBWSxLQUFLLElBQUwsQ0FBVSxLQUFLLEVBQUwsR0FBVSxLQUFLLEVBQXpCLENBQVo7O0FBRUEsa0JBQWdCLEdBQUcsTUFBSCxHQUFZLEdBQUcsTUFBL0I7QUFDQSxRQUFNLFlBQVksYUFBbEI7O0FBRUEsU0FBTyxHQUFQO0FBQ0Q7O0FBRU0sU0FBUyxlQUFULENBQTBCLEVBQTFCLEVBQThCLEVBQTlCLEVBQWtFO0FBQUEsTUFBaEMsTUFBZ0MsdUVBQXZCLEtBQXVCO0FBQUEsTUFBaEIsTUFBZ0IsdUVBQVAsS0FBTzs7QUFDdkUsTUFBSSxrQkFBSjtBQUFBLE1BQWUsc0JBQWY7QUFBQSxNQUE4QixnQkFBOUI7QUFDQSxNQUFJLFdBQUo7QUFBQSxNQUFRLFdBQVI7QUFBQSxNQUFZLFdBQVo7QUFBQSxNQUFnQixXQUFoQjtBQUNBLE1BQUksSUFBSSxFQUFSO0FBQ0EsTUFBSSxNQUFNLEtBQVY7O0FBRUEsTUFBSSxNQUFKLEVBQVk7QUFDVixTQUFNLEdBQUcsRUFBSCxHQUFRLEdBQUcsTUFBWixJQUF1QixHQUFHLEVBQUgsR0FBUSxHQUFHLE1BQWxDLENBQUw7QUFDQSxTQUFNLEdBQUcsRUFBSCxHQUFRLEdBQUcsTUFBWixJQUF1QixHQUFHLEVBQUgsR0FBUSxHQUFHLE1BQWxDLENBQUw7QUFDRCxHQUhELE1BR087QUFDTCxTQUFLLEdBQUcsT0FBSCxHQUFhLEdBQUcsT0FBckI7QUFDQSxTQUFLLEdBQUcsT0FBSCxHQUFhLEdBQUcsT0FBckI7QUFDRDs7QUFFRCxjQUFZLEtBQUssSUFBTCxDQUFVLEtBQUssRUFBTCxHQUFVLEtBQUssRUFBekIsQ0FBWjs7QUFFQSxrQkFBZ0IsR0FBRyxNQUFILEdBQVksR0FBRyxNQUEvQjs7QUFFQSxNQUFJLFlBQVksYUFBaEIsRUFBK0I7QUFDN0IsVUFBTSxJQUFOOztBQUVBLGNBQVUsZ0JBQWdCLFNBQTFCOztBQUVBLFFBQUksaUJBQWlCLEdBQXJCO0FBQ0EsZUFBVyxjQUFYOztBQUVBLFNBQUssS0FBSyxTQUFWO0FBQ0EsU0FBSyxLQUFLLFNBQVY7O0FBRUEsT0FBRyxDQUFILElBQVEsVUFBVSxFQUFsQjtBQUNBLE9BQUcsQ0FBSCxJQUFRLFVBQVUsRUFBbEI7O0FBRUEsUUFBSSxNQUFKLEVBQVk7QUFDVixRQUFFLENBQUYsR0FBTSxFQUFOO0FBQ0EsUUFBRSxDQUFGLEdBQU0sQ0FBQyxFQUFQOztBQUVBLHVCQUFpQixFQUFqQixFQUFxQixDQUFyQjtBQUNEO0FBQ0Y7QUFDRCxTQUFPLEdBQVA7QUFDRDs7QUFFTSxTQUFTLHFCQUFULENBQWdDLEVBQWhDLEVBQW9DLEVBQXBDLEVBQXdEO0FBQUEsTUFBaEIsTUFBZ0IsdUVBQVAsS0FBTzs7QUFDN0QsTUFBSSxzQkFBSjtBQUFBLE1BQW1CLGdCQUFuQjtBQUFBLE1BQTRCLGNBQTVCO0FBQUEsTUFBbUMsY0FBbkM7QUFDQSxNQUFJLElBQUksRUFBUjtBQUNBLE1BQUksTUFBTSxFQUFWO0FBQ0EsTUFBSSxNQUFNLEVBQVY7QUFDQSxNQUFJLE1BQU0sRUFBVjtBQUNBLE1BQUksTUFBTSxFQUFWO0FBQ0EsTUFBSSxNQUFNLEtBQVY7O0FBRUEsS0FBRyxJQUFILEdBQVUsR0FBRyxJQUFILElBQVcsQ0FBckI7QUFDQSxLQUFHLElBQUgsR0FBVSxHQUFHLElBQUgsSUFBVyxDQUFyQjs7QUFFQSxNQUFJLE1BQUosRUFBWTtBQUNWLE1BQUUsRUFBRixHQUFRLEdBQUcsRUFBSCxHQUFRLEdBQUcsTUFBWixJQUF1QixHQUFHLEVBQUgsR0FBUSxHQUFHLE1BQWxDLENBQVA7QUFDQSxNQUFFLEVBQUYsR0FBUSxHQUFHLEVBQUgsR0FBUSxHQUFHLE1BQVosSUFBdUIsR0FBRyxFQUFILEdBQVEsR0FBRyxNQUFsQyxDQUFQO0FBQ0QsR0FIRCxNQUdPO0FBQ0wsTUFBRSxFQUFGLEdBQU8sR0FBRyxPQUFILEdBQWEsR0FBRyxPQUF2QjtBQUNBLE1BQUUsRUFBRixHQUFPLEdBQUcsT0FBSCxHQUFhLEdBQUcsT0FBdkI7QUFDRDs7QUFFRCxJQUFFLFNBQUYsR0FBYyxLQUFLLElBQUwsQ0FBVSxFQUFFLEVBQUYsR0FBTyxFQUFFLEVBQVQsR0FBYyxFQUFFLEVBQUYsR0FBTyxFQUFFLEVBQWpDLENBQWQ7O0FBRUEsa0JBQWdCLEdBQUcsTUFBSCxHQUFZLEdBQUcsTUFBL0I7O0FBRUEsTUFBSSxFQUFFLFNBQUYsR0FBYyxhQUFsQixFQUFpQztBQUMvQixVQUFNLElBQU47O0FBRUEsY0FBVSxnQkFBZ0IsRUFBRSxTQUE1QjtBQUNBLGVBQVcsR0FBWDs7QUFFQSxNQUFFLEVBQUYsR0FBTyxFQUFFLEVBQUYsR0FBTyxFQUFFLFNBQWhCO0FBQ0EsTUFBRSxFQUFGLEdBQU8sRUFBRSxFQUFGLEdBQU8sRUFBRSxTQUFoQjs7QUFFQSxNQUFFLE1BQUYsR0FBVyxLQUFLLEdBQUwsQ0FBUyxFQUFFLEVBQUYsR0FBTyxPQUFQLEdBQWlCLENBQTFCLENBQVg7QUFDQSxNQUFFLE1BQUYsR0FBVyxLQUFLLEdBQUwsQ0FBUyxFQUFFLEVBQUYsR0FBTyxPQUFQLEdBQWlCLENBQTFCLENBQVg7O0FBRUEsWUFBUyxHQUFHLENBQUgsR0FBTyxHQUFHLENBQVgsR0FBZ0IsQ0FBaEIsR0FBb0IsQ0FBQyxDQUE3QjtBQUNBLFlBQVMsR0FBRyxDQUFILEdBQU8sR0FBRyxDQUFYLEdBQWdCLENBQWhCLEdBQW9CLENBQUMsQ0FBN0I7O0FBRUEsT0FBRyxDQUFILEdBQU8sR0FBRyxDQUFILEdBQVEsRUFBRSxNQUFGLEdBQVcsS0FBMUI7QUFDQSxPQUFHLENBQUgsR0FBTyxHQUFHLENBQUgsR0FBUSxFQUFFLE1BQUYsR0FBVyxLQUExQjs7QUFFQSxPQUFHLENBQUgsR0FBTyxHQUFHLENBQUgsR0FBUSxFQUFFLE1BQUYsR0FBVyxDQUFDLEtBQTNCO0FBQ0EsT0FBRyxDQUFILEdBQU8sR0FBRyxDQUFILEdBQVEsRUFBRSxNQUFGLEdBQVcsQ0FBQyxLQUEzQjs7QUFFQSxNQUFFLEVBQUYsR0FBTyxFQUFFLEVBQVQ7QUFDQSxNQUFFLEVBQUYsR0FBTyxDQUFDLEVBQUUsRUFBVjs7QUFFQSxRQUFJLE1BQU0sR0FBRyxFQUFILEdBQVEsRUFBRSxFQUFWLEdBQWUsR0FBRyxFQUFILEdBQVEsRUFBRSxFQUFuQzs7QUFFQSxRQUFJLENBQUosR0FBUSxNQUFNLEVBQUUsRUFBaEI7QUFDQSxRQUFJLENBQUosR0FBUSxNQUFNLEVBQUUsRUFBaEI7O0FBRUEsUUFBSSxNQUFNLEdBQUcsRUFBSCxJQUFTLEVBQUUsRUFBRixHQUFPLEVBQUUsU0FBbEIsSUFBK0IsR0FBRyxFQUFILElBQVMsRUFBRSxFQUFGLEdBQU8sRUFBRSxTQUFsQixDQUF6Qzs7QUFFQSxRQUFJLENBQUosR0FBUSxPQUFPLEVBQUUsRUFBRixHQUFPLEVBQUUsU0FBaEIsQ0FBUjtBQUNBLFFBQUksQ0FBSixHQUFRLE9BQU8sRUFBRSxFQUFGLEdBQU8sRUFBRSxTQUFoQixDQUFSOztBQUVBLFFBQUksTUFBTSxHQUFHLEVBQUgsR0FBUSxFQUFFLEVBQVYsR0FBZSxHQUFHLEVBQUgsR0FBUSxFQUFFLEVBQW5DOztBQUVBLFFBQUksQ0FBSixHQUFRLE1BQU0sRUFBRSxFQUFoQjtBQUNBLFFBQUksQ0FBSixHQUFRLE1BQU0sRUFBRSxFQUFoQjs7QUFFQSxRQUFJLE1BQU0sR0FBRyxFQUFILElBQVMsRUFBRSxFQUFGLEdBQU8sRUFBRSxTQUFsQixJQUErQixHQUFHLEVBQUgsSUFBUyxFQUFFLEVBQUYsR0FBTyxFQUFFLFNBQWxCLENBQXpDOztBQUVBLFFBQUksQ0FBSixHQUFRLE9BQU8sRUFBRSxFQUFGLEdBQU8sRUFBRSxTQUFoQixDQUFSO0FBQ0EsUUFBSSxDQUFKLEdBQVEsT0FBTyxFQUFFLEVBQUYsR0FBTyxFQUFFLFNBQWhCLENBQVI7O0FBRUEsT0FBRyxNQUFILEdBQVksRUFBWjtBQUNBLE9BQUcsTUFBSCxDQUFVLENBQVYsR0FBYyxJQUFJLENBQUosR0FBUSxJQUFJLENBQTFCO0FBQ0EsT0FBRyxNQUFILENBQVUsQ0FBVixHQUFjLElBQUksQ0FBSixHQUFRLElBQUksQ0FBMUI7O0FBRUEsT0FBRyxNQUFILEdBQVksRUFBWjtBQUNBLE9BQUcsTUFBSCxDQUFVLENBQVYsR0FBYyxJQUFJLENBQUosR0FBUSxJQUFJLENBQTFCO0FBQ0EsT0FBRyxNQUFILENBQVUsQ0FBVixHQUFjLElBQUksQ0FBSixHQUFRLElBQUksQ0FBMUI7O0FBRUEsT0FBRyxFQUFILEdBQVEsR0FBRyxNQUFILENBQVUsQ0FBVixHQUFjLEdBQUcsSUFBekI7QUFDQSxPQUFHLEVBQUgsR0FBUSxHQUFHLE1BQUgsQ0FBVSxDQUFWLEdBQWMsR0FBRyxJQUF6QjtBQUNBLE9BQUcsRUFBSCxHQUFRLEdBQUcsTUFBSCxDQUFVLENBQVYsR0FBYyxHQUFHLElBQXpCO0FBQ0EsT0FBRyxFQUFILEdBQVEsR0FBRyxNQUFILENBQVUsQ0FBVixHQUFjLEdBQUcsSUFBekI7QUFDRDtBQUNELFNBQU8sR0FBUDtBQUNEOztBQUVNLFNBQVMsdUJBQVQsQ0FBa0MsY0FBbEMsRUFBa0U7QUFBQSxNQUFoQixNQUFnQix1RUFBUCxLQUFPOztBQUN2RSxPQUFLLElBQUksSUFBSSxDQUFiLEVBQWdCLElBQUksZUFBZSxNQUFuQyxFQUEyQyxHQUEzQyxFQUFnRDtBQUM5QyxRQUFJLEtBQUssZUFBZSxDQUFmLENBQVQ7QUFDQSxTQUFLLElBQUksSUFBSSxJQUFJLENBQWpCLEVBQW9CLElBQUksZUFBZSxNQUF2QyxFQUErQyxHQUEvQyxFQUFvRDtBQUNsRCxVQUFJLEtBQUssZUFBZSxDQUFmLENBQVQ7QUFDQSw0QkFBc0IsRUFBdEIsRUFBMEIsRUFBMUIsRUFBOEIsTUFBOUI7QUFDRDtBQUNGO0FBQ0Y7O0FBRU0sU0FBUyxnQkFBVCxDQUEyQixFQUEzQixFQUErQixFQUEvQixFQUFtRDtBQUFBLE1BQWhCLE1BQWdCLHVFQUFQLEtBQU87O0FBQ3hELE1BQUksWUFBSjtBQUFBLE1BQVMsMkJBQVQ7QUFBQSxNQUE2Qiw0QkFBN0I7QUFBQSxNQUFrRCxXQUFsRDtBQUFBLE1BQXNELFdBQXREOztBQUVBLFFBQU0sS0FBTjs7QUFFQSxNQUFJLE1BQUosRUFBWTtBQUNWLFNBQU0sR0FBRyxFQUFILEdBQVEsR0FBRyxTQUFaLElBQTBCLEdBQUcsRUFBSCxHQUFRLEdBQUcsU0FBckMsQ0FBTDtBQUNBLFNBQU0sR0FBRyxFQUFILEdBQVEsR0FBRyxVQUFaLElBQTJCLEdBQUcsRUFBSCxHQUFRLEdBQUcsVUFBdEMsQ0FBTDtBQUNELEdBSEQsTUFHTztBQUNMLFNBQUssR0FBRyxPQUFILEdBQWEsR0FBRyxPQUFyQjtBQUNBLFNBQUssR0FBRyxPQUFILEdBQWEsR0FBRyxPQUFyQjtBQUNEOztBQUVELHVCQUFxQixHQUFHLFNBQUgsR0FBZSxHQUFHLFNBQXZDO0FBQ0Esd0JBQXNCLEdBQUcsVUFBSCxHQUFnQixHQUFHLFVBQXpDOztBQUVBLE1BQUksS0FBSyxHQUFMLENBQVMsRUFBVCxJQUFlLGtCQUFuQixFQUF1QztBQUNyQyxRQUFJLEtBQUssR0FBTCxDQUFTLEVBQVQsSUFBZSxtQkFBbkIsRUFBd0M7QUFDdEMsWUFBTSxJQUFOO0FBQ0QsS0FGRCxNQUVPO0FBQ0wsWUFBTSxLQUFOO0FBQ0Q7QUFDRixHQU5ELE1BTU87QUFDTCxVQUFNLEtBQU47QUFDRDs7QUFFRCxTQUFPLEdBQVA7QUFDRDs7QUFFTSxTQUFTLGtCQUFULENBQ0wsRUFESyxFQUNELEVBREMsRUFFTDtBQUFBLE1BRFEsTUFDUix1RUFEaUIsS0FDakI7QUFBQSxNQUR3QixNQUN4Qix1RUFEaUMsSUFDakM7O0FBQ0EsTUFBSSxrQkFBSjtBQUFBLE1BQWUsMkJBQWY7QUFBQSxNQUFtQyw0QkFBbkM7QUFBQSxNQUNFLGlCQURGO0FBQUEsTUFDWSxpQkFEWjtBQUFBLE1BQ3NCLFdBRHRCO0FBQUEsTUFDMEIsV0FEMUI7O0FBR0EsTUFBSSxNQUFKLEVBQVk7QUFDVixTQUFNLEdBQUcsRUFBSCxHQUFRLEdBQUcsU0FBWixJQUEwQixHQUFHLEVBQUgsR0FBUSxHQUFHLFNBQXJDLENBQUw7QUFDQSxTQUFNLEdBQUcsRUFBSCxHQUFRLEdBQUcsVUFBWixJQUEyQixHQUFHLEVBQUgsR0FBUSxHQUFHLFVBQXRDLENBQUw7QUFDRCxHQUhELE1BR087QUFDTCxTQUFLLEdBQUcsT0FBSCxHQUFhLEdBQUcsT0FBckI7QUFDQSxTQUFLLEdBQUcsT0FBSCxHQUFhLEdBQUcsT0FBckI7QUFDRDs7QUFFRCx1QkFBcUIsR0FBRyxTQUFILEdBQWUsR0FBRyxTQUF2QztBQUNBLHdCQUFzQixHQUFHLFVBQUgsR0FBZ0IsR0FBRyxVQUF6Qzs7QUFFQSxNQUFJLEtBQUssR0FBTCxDQUFTLEVBQVQsSUFBZSxrQkFBbkIsRUFBdUM7QUFDckMsUUFBSSxLQUFLLEdBQUwsQ0FBUyxFQUFULElBQWUsbUJBQW5CLEVBQXdDO0FBQ3RDLGlCQUFXLHFCQUFxQixLQUFLLEdBQUwsQ0FBUyxFQUFULENBQWhDO0FBQ0EsaUJBQVcsc0JBQXNCLEtBQUssR0FBTCxDQUFTLEVBQVQsQ0FBakM7O0FBRUEsVUFBSSxZQUFZLFFBQWhCLEVBQTBCO0FBQ3hCLFlBQUksS0FBSyxDQUFULEVBQVk7QUFDVixzQkFBWSxLQUFaO0FBQ0EsYUFBRyxDQUFILEdBQU8sR0FBRyxDQUFILEdBQU8sUUFBZDtBQUNELFNBSEQsTUFHTztBQUNMLHNCQUFZLFFBQVo7QUFDQSxhQUFHLENBQUgsR0FBTyxHQUFHLENBQUgsR0FBTyxRQUFkO0FBQ0Q7O0FBRUQsWUFBSSxNQUFKLEVBQVk7QUFDVixhQUFHLEVBQUgsSUFBUyxDQUFDLENBQVY7QUFDRDtBQUNGLE9BWkQsTUFZTztBQUNMLFlBQUksS0FBSyxDQUFULEVBQVk7QUFDVixzQkFBWSxNQUFaO0FBQ0EsYUFBRyxDQUFILEdBQU8sR0FBRyxDQUFILEdBQU8sUUFBZDtBQUNELFNBSEQsTUFHTztBQUNMLHNCQUFZLE9BQVo7QUFDQSxhQUFHLENBQUgsR0FBTyxHQUFHLENBQUgsR0FBTyxRQUFkO0FBQ0Q7O0FBRUQsWUFBSSxNQUFKLEVBQVk7QUFDVixhQUFHLEVBQUgsSUFBUyxDQUFDLENBQVY7QUFDRDtBQUNGO0FBQ0YsS0E3QkQsTUE2Qk87QUFDTDtBQUNEO0FBQ0YsR0FqQ0QsTUFpQ087QUFDTDtBQUNEOztBQUVELFNBQU8sU0FBUDtBQUNEOztBQUVNLFNBQVMsc0JBQVQsQ0FBaUMsRUFBakMsRUFBcUMsRUFBckMsRUFBeUQ7QUFBQSxNQUFoQixNQUFnQix1RUFBUCxLQUFPOztBQUM5RCxNQUFJLGVBQUo7QUFBQSxNQUFZLGtCQUFaO0FBQUEsTUFBdUIsWUFBdkI7QUFBQSxNQUE0QixZQUE1QjtBQUFBLE1BQWlDLFlBQWpDO0FBQUEsTUFBc0MsWUFBdEM7O0FBRUEsTUFBSSxNQUFKLEVBQVk7QUFDVixVQUFNLEdBQUcsRUFBVDtBQUNBLFVBQU0sR0FBRyxFQUFUO0FBQ0EsVUFBTSxHQUFHLEVBQVQ7QUFDQSxVQUFNLEdBQUcsRUFBVDtBQUNELEdBTEQsTUFLTztBQUNMLFVBQU0sR0FBRyxDQUFUO0FBQ0EsVUFBTSxHQUFHLENBQVQ7QUFDQSxVQUFNLEdBQUcsQ0FBVDtBQUNBLFVBQU0sR0FBRyxDQUFUO0FBQ0Q7O0FBRUQsTUFBSSxNQUFNLE1BQU0sR0FBRyxVQUFuQixFQUErQjtBQUM3QixRQUFJLE1BQU0sTUFBTSxDQUFOLEdBQVUsR0FBRyxTQUF2QixFQUFrQztBQUNoQyxlQUFTLFNBQVQ7QUFDRCxLQUZELE1BRU8sSUFBSSxNQUFNLE1BQU0sQ0FBTixHQUFVLEdBQUcsU0FBdkIsRUFBa0M7QUFDdkMsZUFBUyxVQUFUO0FBQ0QsS0FGTSxNQUVBO0FBQ0wsZUFBUyxXQUFUO0FBQ0Q7QUFDRixHQVJELE1BUU8sSUFBSSxNQUFNLE1BQU0sR0FBRyxVQUFuQixFQUErQjtBQUNwQyxRQUFJLE1BQU0sTUFBTSxDQUFOLEdBQVUsR0FBRyxTQUF2QixFQUFrQztBQUNoQyxlQUFTLFlBQVQ7QUFDRCxLQUZELE1BRU8sSUFBSSxNQUFNLE1BQU0sQ0FBTixHQUFVLEdBQUcsU0FBdkIsRUFBa0M7QUFDdkMsZUFBUyxhQUFUO0FBQ0QsS0FGTSxNQUVBO0FBQ0wsZUFBUyxjQUFUO0FBQ0Q7QUFDRixHQVJNLE1BUUE7QUFDTCxRQUFJLE1BQU0sTUFBTSxHQUFHLFNBQW5CLEVBQThCO0FBQzVCLGVBQVMsWUFBVDtBQUNELEtBRkQsTUFFTztBQUNMLGVBQVMsYUFBVDtBQUNEO0FBQ0Y7O0FBRUQsTUFBSSxXQUFXLFdBQVgsSUFBMEIsV0FBVyxjQUFyQyxJQUF1RCxXQUFXLFlBQWxFLElBQWtGLFdBQVcsYUFBakcsRUFBZ0g7QUFDOUcsZ0JBQVksaUJBQWlCLEVBQWpCLEVBQXFCLEVBQXJCLEVBQXlCLE1BQXpCLENBQVo7QUFDRCxHQUZELE1BRU87QUFDTCxRQUFJLFFBQVEsRUFBWjs7QUFFQSxZQUFRLE1BQVI7QUFDRSxXQUFLLFNBQUw7QUFDRSxjQUFNLENBQU4sR0FBVSxHQUFWO0FBQ0EsY0FBTSxDQUFOLEdBQVUsR0FBVjtBQUNBOztBQUVGLFdBQUssVUFBTDtBQUNFLGNBQU0sQ0FBTixHQUFVLE1BQU0sR0FBRyxLQUFuQjtBQUNBLGNBQU0sQ0FBTixHQUFVLEdBQVY7QUFDQTs7QUFFRixXQUFLLFlBQUw7QUFDRSxjQUFNLENBQU4sR0FBVSxHQUFWO0FBQ0EsY0FBTSxDQUFOLEdBQVUsTUFBTSxHQUFHLE1BQW5CO0FBQ0E7O0FBRUYsV0FBSyxhQUFMO0FBQ0UsY0FBTSxDQUFOLEdBQVUsTUFBTSxHQUFHLEtBQW5CO0FBQ0EsY0FBTSxDQUFOLEdBQVUsTUFBTSxHQUFHLE1BQW5CO0FBbEJKOztBQXFCQSxnQkFBWSxtQkFBbUIsRUFBbkIsRUFBdUIsS0FBdkIsRUFBOEIsTUFBOUIsQ0FBWjtBQUNEOztBQUVELE1BQUksU0FBSixFQUFlO0FBQ2IsV0FBTyxNQUFQO0FBQ0QsR0FGRCxNQUVPO0FBQ0wsV0FBTyxTQUFQO0FBQ0Q7QUFDRjs7QUFFTSxTQUFTLGtCQUFULENBQTZCLEVBQTdCLEVBQWlDLEtBQWpDLEVBQXdEO0FBQUEsTUFBaEIsTUFBZ0IsdUVBQVAsS0FBTzs7QUFDN0QsUUFBTSxRQUFOLEdBQWlCLENBQWpCO0FBQ0EsUUFBTSxNQUFOLEdBQWUsR0FBZjtBQUNBLFFBQU0sT0FBTixHQUFnQixNQUFNLENBQXRCO0FBQ0EsUUFBTSxPQUFOLEdBQWdCLE1BQU0sQ0FBdEI7QUFDQSxRQUFNLEVBQU4sR0FBVyxNQUFNLENBQWpCO0FBQ0EsUUFBTSxFQUFOLEdBQVcsTUFBTSxDQUFqQjtBQUNBLFNBQU8sY0FBYyxFQUFkLEVBQWtCLEtBQWxCLEVBQXlCLE1BQXpCLENBQVA7QUFDRDs7QUFFTSxTQUFTLHdCQUFULENBQ0wsRUFESyxFQUNELEVBREMsRUFFTDtBQUFBLE1BRFEsTUFDUix1RUFEaUIsS0FDakI7QUFBQSxNQUR3QixNQUN4Qix1RUFEaUMsS0FDakM7O0FBQ0EsTUFBSSxlQUFKO0FBQUEsTUFBWSxrQkFBWjtBQUFBLE1BQXVCLFlBQXZCO0FBQUEsTUFBNEIsWUFBNUI7QUFBQSxNQUFpQyxZQUFqQztBQUFBLE1BQXNDLFlBQXRDOztBQUVBLE1BQUksTUFBSixFQUFZO0FBQ1YsVUFBTSxHQUFHLEVBQVQ7QUFDQSxVQUFNLEdBQUcsRUFBVDtBQUNBLFVBQU0sR0FBRyxFQUFUO0FBQ0EsVUFBTSxHQUFHLEVBQVQ7QUFDRCxHQUxELE1BS087QUFDTCxVQUFNLEdBQUcsQ0FBVDtBQUNBLFVBQU0sR0FBRyxDQUFUO0FBQ0EsVUFBTSxHQUFHLENBQVQ7QUFDQSxVQUFNLEdBQUcsQ0FBVDtBQUNEOztBQUVELE1BQUksTUFBTSxNQUFNLEdBQUcsVUFBbkIsRUFBK0I7QUFDN0IsUUFBSSxNQUFNLE1BQU0sQ0FBTixHQUFVLEdBQUcsU0FBdkIsRUFBa0M7QUFDaEMsZUFBUyxTQUFUO0FBQ0QsS0FGRCxNQUVPLElBQUksTUFBTSxNQUFNLENBQU4sR0FBVSxHQUFHLFNBQXZCLEVBQWtDO0FBQ3ZDLGVBQVMsVUFBVDtBQUNELEtBRk0sTUFFQTtBQUNMLGVBQVMsV0FBVDtBQUNEO0FBQ0YsR0FSRCxNQVFPLElBQUksTUFBTSxNQUFNLEdBQUcsVUFBbkIsRUFBK0I7QUFDcEMsUUFBSSxNQUFNLE1BQU0sQ0FBTixHQUFVLEdBQUcsU0FBdkIsRUFBa0M7QUFDaEMsZUFBUyxZQUFUO0FBQ0QsS0FGRCxNQUVPLElBQUksTUFBTSxNQUFNLENBQU4sR0FBVSxHQUFHLFNBQXZCLEVBQWtDO0FBQ3ZDLGVBQVMsYUFBVDtBQUNELEtBRk0sTUFFQTtBQUNMLGVBQVMsY0FBVDtBQUNEO0FBQ0YsR0FSTSxNQVFBO0FBQ0wsUUFBSSxNQUFNLE1BQU0sR0FBRyxTQUFuQixFQUE4QjtBQUM1QixlQUFTLFlBQVQ7QUFDRCxLQUZELE1BRU87QUFDTCxlQUFTLGFBQVQ7QUFDRDtBQUNGOztBQUVELE1BQUksV0FBVyxXQUFYLElBQTBCLFdBQVcsY0FBckMsSUFBdUQsV0FBVyxZQUFsRSxJQUFrRixXQUFXLGFBQWpHLEVBQWdIO0FBQzlHLGdCQUFZLG1CQUFtQixFQUFuQixFQUF1QixFQUF2QixFQUEyQixNQUEzQixFQUFtQyxNQUFuQyxDQUFaO0FBQ0QsR0FGRCxNQUVPO0FBQ0wsUUFBSSxRQUFRLEVBQVo7O0FBRUEsWUFBUSxNQUFSO0FBQ0UsV0FBSyxTQUFMO0FBQ0UsY0FBTSxDQUFOLEdBQVUsR0FBVjtBQUNBLGNBQU0sQ0FBTixHQUFVLEdBQVY7QUFDQTs7QUFFRixXQUFLLFVBQUw7QUFDRSxjQUFNLENBQU4sR0FBVSxNQUFNLEdBQUcsS0FBbkI7QUFDQSxjQUFNLENBQU4sR0FBVSxHQUFWO0FBQ0E7O0FBRUYsV0FBSyxZQUFMO0FBQ0UsY0FBTSxDQUFOLEdBQVUsR0FBVjtBQUNBLGNBQU0sQ0FBTixHQUFVLE1BQU0sR0FBRyxNQUFuQjtBQUNBOztBQUVGLFdBQUssYUFBTDtBQUNFLGNBQU0sQ0FBTixHQUFVLE1BQU0sR0FBRyxLQUFuQjtBQUNBLGNBQU0sQ0FBTixHQUFVLE1BQU0sR0FBRyxNQUFuQjtBQWxCSjs7QUFxQkEsZ0JBQVkscUJBQXFCLEVBQXJCLEVBQXlCLEtBQXpCLEVBQWdDLE1BQWhDLEVBQXdDLE1BQXhDLENBQVo7QUFDRDs7QUFFRCxNQUFJLFNBQUosRUFBZTtBQUNiLFdBQU8sTUFBUDtBQUNELEdBRkQsTUFFTztBQUNMLFdBQU8sU0FBUDtBQUNEO0FBQ0Y7O0FBRU0sU0FBUyxvQkFBVCxDQUErQixFQUEvQixFQUFtQyxLQUFuQyxFQUEwRTtBQUFBLE1BQWhDLE1BQWdDLHVFQUF2QixLQUF1QjtBQUFBLE1BQWhCLE1BQWdCLHVFQUFQLEtBQU87O0FBQy9FLFFBQU0sUUFBTixHQUFpQixDQUFqQjtBQUNBLFFBQU0sTUFBTixHQUFlLEdBQWY7QUFDQSxRQUFNLE9BQU4sR0FBZ0IsTUFBTSxDQUF0QjtBQUNBLFFBQU0sT0FBTixHQUFnQixNQUFNLENBQXRCO0FBQ0EsUUFBTSxFQUFOLEdBQVcsTUFBTSxDQUFqQjtBQUNBLFFBQU0sRUFBTixHQUFXLE1BQU0sQ0FBakI7QUFDQSxTQUFPLGdCQUFnQixFQUFoQixFQUFvQixLQUFwQixFQUEyQixNQUEzQixFQUFtQyxNQUFuQyxDQUFQO0FBQ0Q7O0FBRUQsU0FBUyxnQkFBVCxDQUEyQixDQUEzQixFQUE4QixDQUE5QixFQUFpQztBQUMvQixNQUFJLFlBQUo7QUFBQSxNQUFTLFlBQVQ7QUFDQSxNQUFJLEtBQUssRUFBVDtBQUNBLE1BQUksS0FBSyxFQUFUO0FBQ0EsTUFBSSxTQUFTLEVBQWI7QUFDQSxNQUFJLE9BQU8sRUFBRSxJQUFGLElBQVUsQ0FBckI7O0FBRUEsSUFBRSxFQUFGLEdBQU8sRUFBRSxDQUFUO0FBQ0EsSUFBRSxFQUFGLEdBQU8sQ0FBQyxFQUFFLENBQVY7O0FBRUEsSUFBRSxTQUFGLEdBQWMsS0FBSyxJQUFMLENBQVUsRUFBRSxDQUFGLEdBQU0sRUFBRSxDQUFSLEdBQVksRUFBRSxDQUFGLEdBQU0sRUFBRSxDQUE5QixDQUFkOztBQUVBLElBQUUsRUFBRixHQUFPLEVBQUUsQ0FBRixHQUFNLEVBQUUsU0FBZjtBQUNBLElBQUUsRUFBRixHQUFPLEVBQUUsQ0FBRixHQUFNLEVBQUUsU0FBZjs7QUFFQSxRQUFNLEVBQUUsRUFBRixHQUFPLEVBQUUsRUFBVCxHQUFjLEVBQUUsRUFBRixHQUFPLEVBQUUsRUFBN0I7O0FBRUEsS0FBRyxFQUFILEdBQVEsTUFBTSxFQUFFLEVBQWhCO0FBQ0EsS0FBRyxFQUFILEdBQVEsTUFBTSxFQUFFLEVBQWhCOztBQUVBLFFBQU0sRUFBRSxFQUFGLElBQVEsRUFBRSxFQUFGLEdBQU8sRUFBRSxTQUFqQixJQUE4QixFQUFFLEVBQUYsSUFBUSxFQUFFLEVBQUYsR0FBTyxFQUFFLFNBQWpCLENBQXBDOztBQUVBLEtBQUcsRUFBSCxHQUFRLE9BQU8sRUFBRSxFQUFGLEdBQU8sRUFBRSxTQUFoQixDQUFSO0FBQ0EsS0FBRyxFQUFILEdBQVEsT0FBTyxFQUFFLEVBQUYsR0FBTyxFQUFFLFNBQWhCLENBQVI7O0FBRUEsS0FBRyxFQUFILElBQVMsQ0FBQyxDQUFWO0FBQ0EsS0FBRyxFQUFILElBQVMsQ0FBQyxDQUFWOztBQUVBLFNBQU8sQ0FBUCxHQUFXLEdBQUcsRUFBSCxHQUFRLEdBQUcsRUFBdEI7QUFDQSxTQUFPLENBQVAsR0FBVyxHQUFHLEVBQUgsR0FBUSxHQUFHLEVBQXRCOztBQUVBLElBQUUsRUFBRixHQUFPLE9BQU8sQ0FBUCxHQUFXLElBQWxCO0FBQ0EsSUFBRSxFQUFGLEdBQU8sT0FBTyxDQUFQLEdBQVcsSUFBbEI7QUFDRDs7QUFFTSxTQUFTLEdBQVQsQ0FBYyxDQUFkLEVBQWlCLENBQWpCLEVBQThFO0FBQUEsTUFBMUQsS0FBMEQsdUVBQWxELEtBQWtEO0FBQUEsTUFBM0MsTUFBMkMsdUVBQWxDLEtBQWtDO0FBQUEsTUFBM0IsTUFBMkI7QUFBQSxNQUFuQixLQUFtQix1RUFBWCxTQUFXOztBQUNuRixNQUFJLGtCQUFKO0FBQ0EsTUFBSSxhQUFhLEVBQUUsTUFBRixLQUFhLFNBQTlCO0FBQ0EsTUFBSSxhQUFhLEVBQUUsTUFBRixLQUFhLFNBQTlCOztBQUVBLE1BQUksY0FBYyxhQUFhLEtBQTNCLElBQW9DLGNBQWMsYUFBYSxLQUFuRSxFQUEwRTtBQUN4RTtBQUNELEdBRkQsTUFFTztBQUNMLGdCQUFZLGtCQUFrQixDQUFsQixFQUFxQixDQUFyQixDQUFaO0FBQ0EsUUFBSSxhQUFhLEtBQWpCLEVBQXdCLE1BQU0sU0FBTjtBQUN6Qjs7QUFFRCxTQUFPLFNBQVA7O0FBRUEsV0FBUyxpQkFBVCxDQUE0QixDQUE1QixFQUErQixDQUEvQixFQUFrQztBQUNoQyxRQUFJLGFBQWEsRUFBRSxNQUFGLEtBQWEsU0FBOUI7QUFDQSxRQUFJLGFBQWEsRUFBRSxNQUFGLEtBQWEsU0FBOUI7O0FBRUEsUUFBSSxjQUFjLFVBQWxCLEVBQThCO0FBQzVCLFVBQUksRUFBRSxRQUFGLElBQWMsRUFBRSxRQUFwQixFQUE4QjtBQUM1QixlQUFPLGVBQWUsQ0FBZixFQUFrQixDQUFsQixDQUFQO0FBQ0QsT0FGRCxNQUVPLElBQUksRUFBRSxRQUFGLElBQWMsQ0FBQyxFQUFFLFFBQXJCLEVBQStCO0FBQ3BDLGVBQU8sa0JBQWtCLENBQWxCLEVBQXFCLENBQXJCLENBQVA7QUFDRCxPQUZNLE1BRUE7QUFDTCxlQUFPLHFCQUFxQixDQUFyQixFQUF3QixDQUF4QixDQUFQO0FBQ0Q7QUFDRixLQVJELE1BUU8sSUFBSSxjQUFjLEVBQUUsRUFBRSxDQUFGLEtBQVEsU0FBVixDQUFkLElBQXNDLEVBQUUsRUFBRSxDQUFGLEtBQVEsU0FBVixDQUExQyxFQUFnRTtBQUNyRSxhQUFPLGFBQWEsQ0FBYixFQUFnQixDQUFoQixDQUFQO0FBQ0QsS0FGTSxNQUVBO0FBQ0wsWUFBTSxJQUFJLEtBQUosa0JBQXdCLENBQXhCLGFBQWlDLENBQWpDLG9EQUFOO0FBQ0Q7QUFDRjs7QUFFRCxXQUFTLGFBQVQsR0FBMEI7QUFDeEIsUUFBSSxhQUFhLEtBQWpCLEVBQXdCO0FBQUEsaUJBQ1QsQ0FBQyxFQUFELEVBQUksRUFBSixDQURTO0FBQUEsVUFDakIsRUFEaUI7QUFBQSxVQUNkLEVBRGM7QUFFdkI7QUFDRCxTQUFLLElBQUksSUFBSSxFQUFFLE1BQUYsR0FBVyxDQUF4QixFQUEyQixLQUFLLENBQWhDLEVBQW1DLEdBQW5DLEVBQXdDO0FBQ3RDLFVBQUksU0FBUyxFQUFFLENBQUYsQ0FBYjtBQUNBLGtCQUFZLGtCQUFrQixDQUFsQixFQUFxQixNQUFyQixDQUFaO0FBQ0EsVUFBSSxhQUFhLEtBQWpCLEVBQXdCLE1BQU0sU0FBTixFQUFpQixNQUFqQjtBQUN6QjtBQUNGOztBQUVELFdBQVMsY0FBVCxDQUF5QixDQUF6QixFQUE0QixDQUE1QixFQUErQjtBQUM3QixRQUFJLENBQUMsS0FBTCxFQUFZO0FBQ1YsYUFBTyxjQUFjLENBQWQsRUFBaUIsQ0FBakIsQ0FBUDtBQUNELEtBRkQsTUFFTztBQUNMLFVBQUksRUFBRSxFQUFGLEdBQU8sRUFBRSxFQUFULEtBQWdCLENBQWhCLElBQXFCLEVBQUUsRUFBRixHQUFPLEVBQUUsRUFBVCxLQUFnQixDQUF6QyxFQUE0QztBQUMxQyxlQUFPLHNCQUFzQixDQUF0QixFQUF5QixDQUF6QixFQUE0QixNQUE1QixDQUFQO0FBQ0QsT0FGRCxNQUVPO0FBQ0wsZUFBTyxnQkFBZ0IsQ0FBaEIsRUFBbUIsQ0FBbkIsRUFBc0IsTUFBdEIsRUFBOEIsTUFBOUIsQ0FBUDtBQUNEO0FBQ0Y7QUFDRjs7QUFFRCxXQUFTLG9CQUFULENBQStCLENBQS9CLEVBQWtDLENBQWxDLEVBQXFDO0FBQ25DLFFBQUksQ0FBQyxLQUFMLEVBQVk7QUFDVixhQUFPLGlCQUFpQixDQUFqQixFQUFvQixDQUFwQixFQUF1QixNQUF2QixDQUFQO0FBQ0QsS0FGRCxNQUVPO0FBQ0wsYUFBTyxtQkFBbUIsQ0FBbkIsRUFBc0IsQ0FBdEIsRUFBeUIsTUFBekIsRUFBaUMsTUFBakMsQ0FBUDtBQUNEO0FBQ0Y7O0FBRUQsV0FBUyxpQkFBVCxDQUE0QixDQUE1QixFQUErQixDQUEvQixFQUFrQztBQUNoQyxRQUFJLENBQUMsS0FBTCxFQUFZO0FBQ1YsYUFBTyx1QkFBdUIsQ0FBdkIsRUFBMEIsQ0FBMUIsRUFBNkIsTUFBN0IsQ0FBUDtBQUNELEtBRkQsTUFFTztBQUNMLGFBQU8seUJBQXlCLENBQXpCLEVBQTRCLENBQTVCLEVBQStCLE1BQS9CLEVBQXVDLE1BQXZDLENBQVA7QUFDRDtBQUNGO0FBQ0Y7Ozs7Ozs7Ozs7O1FDelFlLFUsR0FBQSxVO1FBaUJBLE0sR0FBQSxNO1FBMkRBLHVCLEdBQUEsdUI7UUFrRUEsTSxHQUFBLE07UUE2Q0EsUyxHQUFBLFM7UUE0Q0EsTSxHQUFBLE07UUFrQ0EsSSxHQUFBLEk7UUE4Q0EsSSxHQUFBLEk7UUFvREEsSyxHQUFBLEs7UUFpS0EsTSxHQUFBLE07UUFPQSxLLEdBQUEsSztRQVVBLE0sR0FBQSxNO1FBU0EsUyxHQUFBLFM7UUE4QkEsTSxHQUFBLE07UUFvS0EsYyxHQUFBLGM7UUFvRkEsTyxHQUFBLE87UUErQkEsSSxHQUFBLEk7UUFrQ0EsWSxHQUFBLFk7UUFxSEEsVSxHQUFBLFU7Ozs7Ozs7O0FBN3dDVCxJQUFJLDhDQUFtQixFQUF2QjtBQUNBLElBQUksNEJBQVUsRUFBZDtBQUNBLElBQUksZ0NBQVksRUFBaEI7O0lBRUQsYTtBQUNKLDJCQUFlO0FBQUE7O0FBQ1Q7QUFDSixTQUFLLENBQUwsR0FBUyxDQUFUO0FBQ0EsU0FBSyxDQUFMLEdBQVMsQ0FBVDtBQUNBLFNBQUssS0FBTCxHQUFhLENBQWI7QUFDQSxTQUFLLE1BQUwsR0FBYyxDQUFkOztBQUVJO0FBQ0osU0FBSyxRQUFMLEdBQWdCLENBQWhCO0FBQ0EsU0FBSyxLQUFMLEdBQWEsQ0FBYjtBQUNBLFNBQUssT0FBTCxHQUFlLElBQWY7QUFDQSxTQUFLLE1BQUwsR0FBYyxDQUFkO0FBQ0EsU0FBSyxNQUFMLEdBQWMsQ0FBZDs7QUFFSTtBQUNBO0FBQ0osU0FBSyxNQUFMLEdBQWMsR0FBZDtBQUNBLFNBQUssTUFBTCxHQUFjLEdBQWQ7O0FBRUk7QUFDSixTQUFLLEVBQUwsR0FBVSxDQUFWO0FBQ0EsU0FBSyxFQUFMLEdBQVUsQ0FBVjs7QUFFSTtBQUNKLFNBQUssTUFBTCxHQUFjLENBQWQ7O0FBRUEsU0FBSyxRQUFMLEdBQWdCLEVBQWhCO0FBQ0EsU0FBSyxNQUFMLEdBQWMsU0FBZDs7QUFFSTtBQUNKLFNBQUssTUFBTCxHQUFjLEtBQWQ7QUFDQSxTQUFLLFdBQUwsR0FBbUIsMEJBQW5CO0FBQ0EsU0FBSyxhQUFMLEdBQXFCLENBQXJCO0FBQ0EsU0FBSyxhQUFMLEdBQXFCLENBQXJCO0FBQ0EsU0FBSyxVQUFMLEdBQWtCLENBQWxCOztBQUVBLFNBQUssU0FBTCxHQUFpQixTQUFqQjs7QUFFSTtBQUNBO0FBQ0osU0FBSyxNQUFMLEdBQWMsRUFBZDtBQUNBLFNBQUssSUFBTCxHQUFZLElBQVo7QUFDQSxTQUFLLGFBQUwsR0FBcUIsQ0FBckI7QUFDQSxTQUFLLE9BQUwsR0FBZSxLQUFmOztBQUVJO0FBQ0osU0FBSyxVQUFMLEdBQWtCLFNBQWxCOztBQUVJO0FBQ0osU0FBSyxTQUFMLEdBQWlCLEtBQWpCOztBQUVJO0FBQ0osU0FBSyxZQUFMLEdBQW9CLEtBQXBCO0FBQ0Q7O0FBRUM7Ozs7Ozs7QUEyQkE7NkJBQ1EsTSxFQUFRO0FBQ2hCLFVBQUksT0FBTyxNQUFYLEVBQW1CO0FBQ2pCLGVBQU8sTUFBUCxDQUFjLFdBQWQsQ0FBMEIsTUFBMUI7QUFDRDtBQUNELGFBQU8sTUFBUCxHQUFnQixJQUFoQjtBQUNBLFdBQUssUUFBTCxDQUFjLElBQWQsQ0FBbUIsTUFBbkI7QUFDRDs7O2dDQUVZLE0sRUFBUTtBQUNuQixVQUFJLE9BQU8sTUFBUCxLQUFrQixJQUF0QixFQUE0QjtBQUMxQixhQUFLLFFBQUwsQ0FBYyxNQUFkLENBQXFCLEtBQUssUUFBTCxDQUFjLE9BQWQsQ0FBc0IsTUFBdEIsQ0FBckIsRUFBb0QsQ0FBcEQ7QUFDRCxPQUZELE1BRU87QUFDTCxjQUFNLElBQUksS0FBSixDQUFVLFNBQVMscUJBQVQsR0FBaUMsSUFBM0MsQ0FBTjtBQUNEO0FBQ0Y7OztpQ0FVYSxNLEVBQVEsTSxFQUFRO0FBQzVCLFVBQUksU0FBUyxLQUFLLFFBQUwsQ0FBYyxPQUFkLENBQXNCLE1BQXRCLENBQWI7QUFDQSxVQUFJLFNBQVMsS0FBSyxRQUFMLENBQWMsT0FBZCxDQUFzQixNQUF0QixDQUFiOztBQUVBLFVBQUksV0FBVyxDQUFDLENBQVosSUFBaUIsV0FBVyxDQUFDLENBQWpDLEVBQW9DO0FBQ2xDLGVBQU8sVUFBUCxHQUFvQixNQUFwQjtBQUNBLGVBQU8sVUFBUCxHQUFvQixNQUFwQjs7QUFFQSxhQUFLLFFBQUwsQ0FBYyxNQUFkLElBQXdCLE1BQXhCO0FBQ0EsYUFBSyxRQUFMLENBQWMsTUFBZCxJQUF3QixNQUF4QjtBQUNELE9BTkQsTUFNTztBQUNMLGNBQU0sSUFBSSxLQUFKLGlEQUF3RCxJQUF4RCxDQUFOO0FBQ0Q7QUFDRjs7OzBCQUVxQjtBQUFBOztBQUFBLHdDQUFkLFlBQWM7QUFBZCxvQkFBYztBQUFBOztBQUNwQixtQkFBYSxPQUFiLENBQXFCO0FBQUEsZUFBVSxNQUFLLFFBQUwsQ0FBYyxNQUFkLENBQVY7QUFBQSxPQUFyQjtBQUNEOzs7NkJBQzJCO0FBQUE7O0FBQUEseUNBQWpCLGVBQWlCO0FBQWpCLHVCQUFpQjtBQUFBOztBQUMxQixzQkFBZ0IsT0FBaEIsQ0FBd0I7QUFBQSxlQUFVLE9BQUssV0FBTCxDQUFpQixNQUFqQixDQUFWO0FBQUEsT0FBeEI7QUFDRDs7QUFFQzs7OztnQ0FtQlcsQyxFQUFHLEMsRUFBRztBQUNqQixXQUFLLENBQUwsR0FBUyxDQUFUO0FBQ0EsV0FBSyxDQUFMLEdBQVMsQ0FBVDtBQUNEOzs7OztBQW1CQzs4QkFDUyxDLEVBQTZCO0FBQUEsVUFBMUIsT0FBMEIsdUVBQWhCLENBQWdCO0FBQUEsVUFBYixPQUFhLHVFQUFILENBQUc7O0FBQ3RDLFVBQUksSUFBSSxJQUFSO0FBQ0EsUUFBRSxDQUFGLEdBQU8sRUFBRSxDQUFGLEdBQU0sRUFBRSxTQUFSLEdBQW9CLEVBQUUsU0FBdkIsR0FBb0MsT0FBMUM7QUFDQSxRQUFFLENBQUYsR0FBTyxFQUFFLENBQUYsR0FBTSxFQUFFLFVBQVIsR0FBcUIsRUFBRSxVQUF4QixHQUFzQyxPQUE1QztBQUNEOzs7MkJBQ08sQyxFQUE2QjtBQUFBLFVBQTFCLE9BQTBCLHVFQUFoQixDQUFnQjtBQUFBLFVBQWIsT0FBYSx1RUFBSCxDQUFHOztBQUNuQyxVQUFJLElBQUksSUFBUjtBQUNBLFFBQUUsQ0FBRixHQUFPLEVBQUUsQ0FBRixHQUFNLEVBQUUsU0FBUixHQUFvQixFQUFFLFNBQXZCLEdBQW9DLE9BQTFDO0FBQ0EsUUFBRSxDQUFGLEdBQU8sRUFBRSxDQUFGLEdBQU0sRUFBRSxNQUFULEdBQW1CLE9BQXpCO0FBQ0Q7Ozs4QkFDVSxDLEVBQTZCO0FBQUEsVUFBMUIsT0FBMEIsdUVBQWhCLENBQWdCO0FBQUEsVUFBYixPQUFhLHVFQUFILENBQUc7O0FBQ3RDLFVBQUksSUFBSSxJQUFSO0FBQ0EsUUFBRSxDQUFGLEdBQU8sRUFBRSxDQUFGLEdBQU0sRUFBRSxTQUFSLEdBQW9CLEVBQUUsU0FBdkIsR0FBb0MsT0FBMUM7QUFDQSxRQUFFLENBQUYsR0FBTyxFQUFFLENBQUYsR0FBTSxFQUFFLE1BQVQsR0FBbUIsT0FBekI7QUFDRDs7OzZCQUNTLEMsRUFBNkI7QUFBQSxVQUExQixPQUEwQix1RUFBaEIsQ0FBZ0I7QUFBQSxVQUFiLE9BQWEsdUVBQUgsQ0FBRzs7QUFDckMsVUFBSSxJQUFJLElBQVI7QUFDQSxRQUFFLENBQUYsR0FBTyxFQUFFLENBQUYsR0FBTSxFQUFFLEtBQVQsR0FBa0IsT0FBeEI7QUFDQSxRQUFFLENBQUYsR0FBTyxFQUFFLENBQUYsR0FBTSxFQUFFLFVBQVIsR0FBcUIsRUFBRSxVQUF4QixHQUFzQyxPQUE1QztBQUNEOzs7NEJBQ1EsQyxFQUE2QjtBQUFBLFVBQTFCLE9BQTBCLHVFQUFoQixDQUFnQjtBQUFBLFVBQWIsT0FBYSx1RUFBSCxDQUFHOztBQUNwQyxVQUFJLElBQUksSUFBUjtBQUNBLFFBQUUsQ0FBRixHQUFPLEVBQUUsQ0FBRixHQUFNLEVBQUUsS0FBVCxHQUFrQixPQUF4QjtBQUNBLFFBQUUsQ0FBRixHQUFPLEVBQUUsQ0FBRixHQUFNLEVBQUUsVUFBUixHQUFxQixFQUFFLFVBQXhCLEdBQXNDLE9BQTVDO0FBQ0Q7O0FBRUM7Ozs7d0JBN0lRO0FBQ1IsVUFBSSxLQUFLLE1BQVQsRUFBaUI7QUFDZixlQUFPLEtBQUssQ0FBTCxHQUFTLEtBQUssTUFBTCxDQUFZLEVBQTVCO0FBQ0QsT0FGRCxNQUVPO0FBQ0wsZUFBTyxLQUFLLENBQVo7QUFDRDtBQUNGOzs7d0JBQ1M7QUFDUixVQUFJLEtBQUssTUFBVCxFQUFpQjtBQUNmLGVBQU8sS0FBSyxDQUFMLEdBQVMsS0FBSyxNQUFMLENBQVksRUFBNUI7QUFDRCxPQUZELE1BRU87QUFDTCxlQUFPLEtBQUssQ0FBWjtBQUNEO0FBQ0Y7O0FBRUM7Ozs7d0JBQ1c7QUFDWCxhQUFPLEtBQUssTUFBWjtBQUNELEs7c0JBQ1UsSyxFQUFPO0FBQ2hCLFdBQUssTUFBTCxHQUFjLEtBQWQ7QUFDQSxVQUFJLEtBQUssTUFBVCxFQUFpQjtBQUNmLGFBQUssTUFBTCxDQUFZLFFBQVosQ0FBcUIsSUFBckIsQ0FBMEIsVUFBQyxDQUFELEVBQUksQ0FBSjtBQUFBLGlCQUFVLEVBQUUsS0FBRixHQUFVLEVBQUUsS0FBdEI7QUFBQSxTQUExQjtBQUNEO0FBQ0Y7Ozt3QkFtQlk7QUFDWCxVQUFJLEtBQUssUUFBTCxDQUFjLE1BQWQsS0FBeUIsQ0FBN0IsRUFBZ0M7QUFDOUIsZUFBTyxJQUFQO0FBQ0QsT0FGRCxNQUVPO0FBQ0wsZUFBTyxLQUFQO0FBQ0Q7QUFDRjs7O3dCQXlCZ0I7QUFDZixhQUFPLEtBQUssS0FBTCxHQUFhLENBQXBCO0FBQ0Q7Ozt3QkFDaUI7QUFDaEIsYUFBTyxLQUFLLE1BQUwsR0FBYyxDQUFyQjtBQUNEOzs7d0JBRWM7QUFDYixhQUFPLEtBQUssQ0FBTCxHQUFTLEtBQUssU0FBckI7QUFDRDs7O3dCQUNjO0FBQ2IsYUFBTyxLQUFLLENBQUwsR0FBUyxLQUFLLFVBQXJCO0FBQ0Q7O0FBRUM7Ozs7d0JBQ2M7QUFDZCxhQUFPLEVBQUMsR0FBRyxLQUFLLENBQVQsRUFBWSxHQUFHLEtBQUssQ0FBcEIsRUFBUDtBQUNEOzs7d0JBTWtCO0FBQ2pCLGFBQU87QUFDTCxXQUFHLENBREU7QUFFTCxXQUFHLENBRkU7QUFHTCxlQUFPLEtBQUssS0FIUDtBQUlMLGdCQUFRLEtBQUs7QUFKUixPQUFQO0FBTUQ7Ozt3QkFDbUI7QUFDbEIsYUFBTztBQUNMLFdBQUcsS0FBSyxFQURIO0FBRUwsV0FBRyxLQUFLLEVBRkg7QUFHTCxlQUFPLEtBQUssRUFBTCxHQUFVLEtBQUssS0FIakI7QUFJTCxnQkFBUSxLQUFLLEVBQUwsR0FBVSxLQUFLO0FBSmxCLE9BQVA7QUFNRDs7O3dCQThCbUI7QUFDbEIsYUFBTyxLQUFLLGFBQVo7QUFDRDs7QUFFQzs7Ozt3QkFDYztBQUNkLGFBQU8sS0FBSyxTQUFaO0FBQ0QsSztzQkFDYSxLLEVBQU87QUFDbkIsVUFBSSxVQUFVLElBQVYsSUFBa0IsS0FBSyxTQUFMLEtBQW1CLEtBQXpDLEVBQWdEO0FBQzlDLGVBQU8sZ0JBQVAsQ0FBd0IsSUFBeEIsRUFBOEI7QUFDNUIsb0JBQVU7QUFDUixlQURRLGlCQUNEO0FBQ0wscUJBQU8sS0FBSyxLQUFaO0FBQ0QsYUFITztBQUlSLGVBSlEsZUFJSCxLQUpHLEVBSUk7QUFDVixtQkFBSyxLQUFMLEdBQWEsS0FBYjtBQUNBLG1CQUFLLE1BQUwsR0FBYyxLQUFkO0FBQ0QsYUFQTzs7QUFRUix3QkFBWSxJQVJKO0FBU1IsMEJBQWM7QUFUTixXQURrQjtBQVk1QixrQkFBUTtBQUNOLGVBRE0saUJBQ0M7QUFDTCxxQkFBTyxLQUFLLFNBQVo7QUFDRCxhQUhLO0FBSU4sZUFKTSxlQUlELEtBSkMsRUFJTTtBQUNWLG1CQUFLLEtBQUwsR0FBYSxRQUFRLENBQXJCO0FBQ0EsbUJBQUssTUFBTCxHQUFjLFFBQVEsQ0FBdEI7QUFDRCxhQVBLOztBQVFOLHdCQUFZLElBUk47QUFTTiwwQkFBYztBQVRSO0FBWm9CLFNBQTlCOztBQXlCQSxhQUFLLFNBQUwsR0FBaUIsSUFBakI7QUFDRDs7QUFFRCxVQUFJLFVBQVUsS0FBVixJQUFtQixLQUFLLFNBQUwsS0FBbUIsSUFBMUMsRUFBZ0Q7QUFDOUMsZUFBTyxLQUFLLFFBQVo7QUFDQSxlQUFPLEtBQUssTUFBWjtBQUNBLGFBQUssU0FBTCxHQUFpQixLQUFqQjtBQUNEO0FBQ0Y7O0FBRUM7Ozs7d0JBQ2U7QUFDZixhQUFPLEtBQUssVUFBWjtBQUNELEs7c0JBQ2MsSyxFQUFPO0FBQ3BCLFVBQUksVUFBVSxJQUFkLEVBQW9CO0FBQ2xCLHlCQUFpQixJQUFqQixDQUFzQixJQUF0QjtBQUNBLGFBQUssVUFBTCxHQUFrQixJQUFsQjtBQUNEOztBQUVELFVBQUksVUFBVSxLQUFkLEVBQXFCO0FBQ25CLHlCQUFpQixNQUFqQixDQUF3QixpQkFBaUIsT0FBakIsQ0FBeUIsSUFBekIsQ0FBeEIsRUFBd0QsQ0FBeEQ7QUFDQSxhQUFLLFVBQUwsR0FBa0IsS0FBbEI7QUFDRDtBQUNGOzs7d0JBRWtCO0FBQ2pCLGFBQU8sS0FBSyxZQUFaO0FBQ0QsSztzQkFDZ0IsSyxFQUFPO0FBQ3RCLFVBQUksVUFBVSxJQUFkLEVBQW9CO0FBQ2xCLHdCQUFnQixJQUFoQjtBQUNBLGdCQUFRLElBQVIsQ0FBYSxJQUFiOztBQUVBLGFBQUssWUFBTCxHQUFvQixJQUFwQjtBQUNEO0FBQ0QsVUFBSSxVQUFVLEtBQWQsRUFBcUI7QUFDbkIsZ0JBQVEsTUFBUixDQUFlLFFBQVEsT0FBUixDQUFnQixJQUFoQixDQUFmLEVBQXNDLENBQXRDO0FBQ0EsYUFBSyxZQUFMLEdBQW9CLEtBQXBCO0FBQ0Q7QUFDRjs7Ozs7O0FBR0ksSUFBSSx3QkFBUSxJQUFJLGFBQUosRUFBWjs7QUFFQSxTQUFTLFVBQVQsR0FJTDtBQUFBLE1BSEUsS0FHRix1RUFIVSxHQUdWO0FBQUEsTUFIZSxNQUdmLHVFQUh3QixHQUd4QjtBQUFBLE1BRkUsTUFFRix1RUFGVyxrQkFFWDtBQUFBLE1BREUsZUFDRix1RUFEb0IsT0FDcEI7O0FBQ0EsTUFBSSxTQUFTLFNBQVMsYUFBVCxDQUF1QixRQUF2QixDQUFiO0FBQ0EsU0FBTyxLQUFQLEdBQWUsS0FBZjtBQUNBLFNBQU8sTUFBUCxHQUFnQixNQUFoQjtBQUNBLFNBQU8sS0FBUCxDQUFhLE1BQWIsR0FBc0IsTUFBdEI7QUFDQSxTQUFPLEtBQVAsQ0FBYSxlQUFiLEdBQStCLGVBQS9CO0FBQ0EsV0FBUyxJQUFULENBQWMsV0FBZCxDQUEwQixNQUExQjs7QUFFQSxTQUFPLEdBQVAsR0FBYSxPQUFPLFVBQVAsQ0FBa0IsSUFBbEIsQ0FBYjs7QUFFQSxTQUFPLE1BQVA7QUFDRDs7QUFFTSxTQUFTLE1BQVQsQ0FBaUIsTUFBakIsRUFBeUI7QUFDOUIsTUFBSSxNQUFNLE9BQU8sR0FBakI7O0FBRUEsTUFBSSxTQUFKLENBQWMsQ0FBZCxFQUFpQixDQUFqQixFQUFvQixPQUFPLEtBQTNCLEVBQWtDLE9BQU8sTUFBekM7O0FBRUU7QUFDRixNQUFJLGVBQUosRUFBcUI7QUFDbkIsb0JBQWdCLE1BQWhCLENBQXVCLEdBQXZCO0FBQ0Q7O0FBRUQsUUFBTSxRQUFOLENBQWUsT0FBZixDQUF1QixrQkFBVTtBQUMvQixrQkFBYyxNQUFkO0FBQ0QsR0FGRDs7QUFJQSxXQUFTLGFBQVQsQ0FBd0IsTUFBeEIsRUFBZ0M7QUFDOUIsUUFDUSxPQUFPLE9BQVAsSUFDQSxPQUFPLEVBQVAsR0FBWSxPQUFPLEtBQVAsR0FBZSxPQUFPLEtBRGxDLElBRUEsT0FBTyxFQUFQLEdBQVksT0FBTyxLQUFuQixJQUE0QixDQUFDLE9BQU8sS0FGcEMsSUFHQSxPQUFPLEVBQVAsR0FBWSxPQUFPLE1BQVAsR0FBZ0IsT0FBTyxNQUhuQyxJQUlBLE9BQU8sRUFBUCxHQUFZLE9BQU8sTUFBbkIsSUFBNkIsQ0FBQyxPQUFPLE1BTDdDLEVBTU07QUFDSixVQUFJLElBQUo7O0FBRUEsVUFBSSxTQUFKLENBQ1UsT0FBTyxDQUFQLEdBQVksT0FBTyxLQUFQLEdBQWUsT0FBTyxNQUQ1QyxFQUVVLE9BQU8sQ0FBUCxHQUFZLE9BQU8sTUFBUCxHQUFnQixPQUFPLE1BRjdDOztBQUtBLFVBQUksTUFBSixDQUFXLE9BQU8sUUFBbEI7QUFDQSxVQUFJLFdBQUosR0FBa0IsT0FBTyxLQUFQLEdBQWUsT0FBTyxNQUFQLENBQWMsS0FBL0M7QUFDQSxVQUFJLEtBQUosQ0FBVSxPQUFPLE1BQWpCLEVBQXlCLE9BQU8sTUFBaEM7O0FBRUEsVUFBSSxPQUFPLE1BQVgsRUFBbUI7QUFDakIsWUFBSSxXQUFKLEdBQWtCLE9BQU8sV0FBekI7QUFDQSxZQUFJLGFBQUosR0FBb0IsT0FBTyxhQUEzQjtBQUNBLFlBQUksYUFBSixHQUFvQixPQUFPLGFBQTNCO0FBQ0EsWUFBSSxVQUFKLEdBQWlCLE9BQU8sVUFBeEI7QUFDRDs7QUFFRCxVQUFJLE9BQU8sU0FBWCxFQUFzQixJQUFJLHdCQUFKLEdBQStCLE9BQU8sU0FBdEM7O0FBRXRCLFVBQUksT0FBTyxNQUFYLEVBQW1CO0FBQ2pCLGVBQU8sTUFBUCxDQUFjLEdBQWQ7QUFDRDs7QUFFRCxVQUFJLE9BQU8sUUFBUCxJQUFtQixPQUFPLFFBQVAsQ0FBZ0IsTUFBaEIsR0FBeUIsQ0FBaEQsRUFBbUQ7QUFDakQsWUFBSSxTQUFKLENBQWMsQ0FBQyxPQUFPLEtBQVIsR0FBZ0IsT0FBTyxNQUFyQyxFQUE2QyxDQUFDLE9BQU8sTUFBUixHQUFpQixPQUFPLE1BQXJFOztBQUVBLGVBQU8sUUFBUCxDQUFnQixPQUFoQixDQUF3QixpQkFBUztBQUMvQix3QkFBYyxLQUFkO0FBQ0QsU0FGRDtBQUdEOztBQUVELFVBQUksT0FBSjtBQUNEO0FBQ0Y7QUFDRjs7QUFFTSxTQUFTLHVCQUFULENBQWtDLE1BQWxDLEVBQTBDLFNBQTFDLEVBQXFEO0FBQzFELE1BQUksTUFBTSxPQUFPLEdBQWpCOztBQUVBLE1BQUksU0FBSixDQUFjLENBQWQsRUFBaUIsQ0FBakIsRUFBb0IsT0FBTyxLQUEzQixFQUFrQyxPQUFPLE1BQXpDOztBQUVBLFFBQU0sUUFBTixDQUFlLE9BQWYsQ0FBdUIsa0JBQVU7QUFDL0Isa0JBQWMsTUFBZDtBQUNELEdBRkQ7O0FBSUEsV0FBUyxhQUFULENBQXdCLE1BQXhCLEVBQWdDO0FBQzlCLFFBQ1EsT0FBTyxPQUFQLElBQ0EsT0FBTyxFQUFQLEdBQVksT0FBTyxLQUFQLEdBQWUsT0FBTyxLQURsQyxJQUVBLE9BQU8sRUFBUCxHQUFZLE9BQU8sS0FBbkIsSUFBNEIsQ0FBQyxPQUFPLEtBRnBDLElBR0EsT0FBTyxFQUFQLEdBQVksT0FBTyxNQUFQLEdBQWdCLE9BQU8sTUFIbkMsSUFJQSxPQUFPLEVBQVAsR0FBWSxPQUFPLE1BQW5CLElBQTZCLENBQUMsT0FBTyxNQUw3QyxFQU1NO0FBQ0osVUFBSSxJQUFKOztBQUVBLFVBQUksT0FBTyxTQUFQLEtBQXFCLFNBQXpCLEVBQW9DO0FBQ2xDLGVBQU8sT0FBUCxHQUFpQixDQUFDLE9BQU8sQ0FBUCxHQUFXLE9BQU8sU0FBbkIsSUFBZ0MsU0FBaEMsR0FBNEMsT0FBTyxTQUFwRTtBQUNELE9BRkQsTUFFTztBQUNMLGVBQU8sT0FBUCxHQUFpQixPQUFPLENBQXhCO0FBQ0Q7O0FBRUQsVUFBSSxPQUFPLFNBQVAsS0FBcUIsU0FBekIsRUFBb0M7QUFDbEMsZUFBTyxPQUFQLEdBQWlCLENBQUMsT0FBTyxDQUFQLEdBQVcsT0FBTyxTQUFuQixJQUFnQyxTQUFoQyxHQUE0QyxPQUFPLFNBQXBFO0FBQ0QsT0FGRCxNQUVPO0FBQ0wsZUFBTyxPQUFQLEdBQWlCLE9BQU8sQ0FBeEI7QUFDRDs7QUFFRCxVQUFJLFNBQUosQ0FDVSxPQUFPLE9BQVAsR0FBa0IsT0FBTyxLQUFQLEdBQWUsT0FBTyxNQURsRCxFQUVVLE9BQU8sT0FBUCxHQUFrQixPQUFPLE1BQVAsR0FBZ0IsT0FBTyxNQUZuRDs7QUFLQSxVQUFJLE1BQUosQ0FBVyxPQUFPLFFBQWxCO0FBQ0EsVUFBSSxXQUFKLEdBQWtCLE9BQU8sS0FBUCxHQUFlLE9BQU8sTUFBUCxDQUFjLEtBQS9DO0FBQ0EsVUFBSSxLQUFKLENBQVUsT0FBTyxNQUFqQixFQUF5QixPQUFPLE1BQWhDOztBQUVBLFVBQUksT0FBTyxNQUFYLEVBQW1CO0FBQ2pCLFlBQUksV0FBSixHQUFrQixPQUFPLFdBQXpCO0FBQ0EsWUFBSSxhQUFKLEdBQW9CLE9BQU8sYUFBM0I7QUFDQSxZQUFJLGFBQUosR0FBb0IsT0FBTyxhQUEzQjtBQUNBLFlBQUksVUFBSixHQUFpQixPQUFPLFVBQXhCO0FBQ0Q7O0FBRUQsVUFBSSxPQUFPLFNBQVgsRUFBc0IsSUFBSSx3QkFBSixHQUErQixPQUFPLFNBQXRDOztBQUV0QixVQUFJLE9BQU8sTUFBWCxFQUFtQjtBQUNqQixlQUFPLE1BQVAsQ0FBYyxHQUFkO0FBQ0Q7O0FBRUQsVUFBSSxPQUFPLFFBQVAsSUFBbUIsT0FBTyxRQUFQLENBQWdCLE1BQWhCLEdBQXlCLENBQWhELEVBQW1EO0FBQ2pELFlBQUksU0FBSixDQUFjLENBQUMsT0FBTyxLQUFSLEdBQWdCLE9BQU8sTUFBckMsRUFBNkMsQ0FBQyxPQUFPLE1BQVIsR0FBaUIsT0FBTyxNQUFyRTs7QUFFQSxlQUFPLFFBQVAsQ0FBZ0IsT0FBaEIsQ0FBd0IsaUJBQVM7QUFDL0Isd0JBQWMsS0FBZDtBQUNELFNBRkQ7QUFHRDs7QUFFRCxVQUFJLE9BQUo7QUFDRDtBQUNGO0FBQ0Y7O0FBRU0sU0FBUyxNQUFULEdBQXFDO0FBQUEscUNBQWpCLGVBQWlCO0FBQWpCLG1CQUFpQjtBQUFBOztBQUMxQyxrQkFBZ0IsT0FBaEIsQ0FBd0Isa0JBQVU7QUFDaEMsV0FBTyxNQUFQLENBQWMsV0FBZCxDQUEwQixNQUExQjtBQUNELEdBRkQ7QUFHRDs7SUFFSyxTOzs7QUFDSix1QkFRSTtBQUFBLFFBUEUsS0FPRix1RUFQVSxFQU9WO0FBQUEsUUFORSxNQU1GLHVFQU5XLEVBTVg7QUFBQSxRQUxFLFNBS0YsdUVBTGMsTUFLZDtBQUFBLFFBSkUsV0FJRix1RUFKZ0IsTUFJaEI7QUFBQSxRQUhFLFNBR0YsdUVBSGMsQ0FHZDtBQUFBLFFBRkUsQ0FFRix1RUFGTSxDQUVOO0FBQUEsUUFERSxDQUNGLHVFQURNLENBQ047O0FBQUE7O0FBQUE7O0FBR0YsV0FBTyxNQUFQLFNBQ2MsRUFBQyxZQUFELEVBQVEsY0FBUixFQUFnQixvQkFBaEIsRUFBMkIsd0JBQTNCLEVBQXdDLG9CQUF4QyxFQUFtRCxJQUFuRCxFQUFzRCxJQUF0RCxFQURkOztBQUlBLFdBQUssSUFBTCxHQUFZLEtBQVo7QUFQRTtBQVFIOzs7OzJCQUVPLEcsRUFBSztBQUNYLFVBQUksV0FBSixHQUFrQixLQUFLLFdBQXZCO0FBQ0EsVUFBSSxTQUFKLEdBQWdCLEtBQUssU0FBckI7QUFDQSxVQUFJLFNBQUosR0FBZ0IsS0FBSyxTQUFyQjs7QUFFQSxVQUFJLFNBQUo7QUFDQSxVQUFJLElBQUosQ0FDUSxDQUFDLEtBQUssS0FBTixHQUFjLEtBQUssTUFEM0IsRUFFUSxDQUFDLEtBQUssTUFBTixHQUFlLEtBQUssTUFGNUIsRUFHUSxLQUFLLEtBSGIsRUFJUSxLQUFLLE1BSmI7O0FBT0EsVUFBSSxLQUFLLFdBQUwsS0FBcUIsTUFBekIsRUFBaUMsSUFBSSxNQUFKO0FBQ2pDLFVBQUksS0FBSyxTQUFMLEtBQW1CLE1BQXZCLEVBQStCLElBQUksSUFBSjtBQUMvQixVQUFJLEtBQUssSUFBTCxJQUFhLEtBQUssSUFBTCxLQUFjLElBQS9CLEVBQXFDLElBQUksSUFBSjtBQUN0Qzs7OztFQW5DcUIsYTs7QUFzQ3hCOzs7QUFDTyxTQUFTLFNBQVQsQ0FBb0IsS0FBcEIsRUFBMkIsTUFBM0IsRUFBbUMsU0FBbkMsRUFBOEMsV0FBOUMsRUFBMkQsU0FBM0QsRUFBc0UsQ0FBdEUsRUFBeUUsQ0FBekUsRUFBNEU7QUFDakYsTUFBSSxTQUFTLElBQUksU0FBSixDQUFjLEtBQWQsRUFBcUIsTUFBckIsRUFBNkIsU0FBN0IsRUFBd0MsV0FBeEMsRUFBcUQsU0FBckQsRUFBZ0UsQ0FBaEUsRUFBbUUsQ0FBbkUsQ0FBYjtBQUNBLFFBQU0sUUFBTixDQUFlLE1BQWY7QUFDQSxTQUFPLE1BQVA7QUFDRDs7SUFFSyxNOzs7QUFDSixvQkFPSTtBQUFBLFFBTkUsUUFNRix1RUFOYSxFQU1iO0FBQUEsUUFMRSxTQUtGLHVFQUxjLE1BS2Q7QUFBQSxRQUpFLFdBSUYsdUVBSmdCLE1BSWhCO0FBQUEsUUFIRSxTQUdGLHVFQUhjLENBR2Q7QUFBQSxRQUZFLENBRUYsdUVBRk0sQ0FFTjtBQUFBLFFBREUsQ0FDRix1RUFETSxDQUNOOztBQUFBOztBQUFBOztBQUVGLFdBQUssUUFBTCxHQUFnQixJQUFoQjs7QUFFQSxXQUFPLE1BQVAsU0FBb0IsRUFBQyxrQkFBRCxFQUFXLG9CQUFYLEVBQXNCLHdCQUF0QixFQUFtQyxvQkFBbkMsRUFBOEMsSUFBOUMsRUFBaUQsSUFBakQsRUFBcEI7O0FBRUEsV0FBSyxJQUFMLEdBQVksS0FBWjtBQU5FO0FBT0g7Ozs7MkJBRU8sRyxFQUFLO0FBQ1gsVUFBSSxXQUFKLEdBQWtCLEtBQUssV0FBdkI7QUFDQSxVQUFJLFNBQUosR0FBZ0IsS0FBSyxTQUFyQjtBQUNBLFVBQUksU0FBSixHQUFnQixLQUFLLFNBQXJCOztBQUVBLFVBQUksU0FBSjtBQUNBLFVBQUksR0FBSixDQUNRLEtBQUssTUFBTCxHQUFlLENBQUMsS0FBSyxRQUFOLEdBQWlCLEtBQUssTUFEN0MsRUFFUSxLQUFLLE1BQUwsR0FBZSxDQUFDLEtBQUssUUFBTixHQUFpQixLQUFLLE1BRjdDLEVBR1EsS0FBSyxNQUhiLEVBSVEsQ0FKUixFQUlXLElBQUksS0FBSyxFQUpwQixFQUtRLEtBTFI7O0FBUUEsVUFBSSxLQUFLLFdBQUwsS0FBcUIsTUFBekIsRUFBaUMsSUFBSSxNQUFKO0FBQ2pDLFVBQUksS0FBSyxTQUFMLEtBQW1CLE1BQXZCLEVBQStCLElBQUksSUFBSjtBQUMvQixVQUFJLEtBQUssSUFBTCxJQUFhLEtBQUssSUFBTCxLQUFjLElBQS9CLEVBQXFDLElBQUksSUFBSjtBQUN0Qzs7OztFQWxDa0IsYTs7QUFxQ3JCOzs7QUFDTyxTQUFTLE1BQVQsQ0FBaUIsUUFBakIsRUFBMkIsU0FBM0IsRUFBc0MsV0FBdEMsRUFBbUQsU0FBbkQsRUFBOEQsQ0FBOUQsRUFBaUUsQ0FBakUsRUFBb0U7QUFDekUsTUFBSSxTQUFTLElBQUksTUFBSixDQUFXLFFBQVgsRUFBcUIsU0FBckIsRUFBZ0MsV0FBaEMsRUFBNkMsU0FBN0MsRUFBd0QsQ0FBeEQsRUFBMkQsQ0FBM0QsQ0FBYjtBQUNBLFFBQU0sUUFBTixDQUFlLE1BQWY7QUFDQSxTQUFPLE1BQVA7QUFDRDs7SUFFSyxJOzs7QUFDSixrQkFPSTtBQUFBLFFBTkUsV0FNRix1RUFOZ0IsTUFNaEI7QUFBQSxRQUxFLFNBS0YsdUVBTGMsQ0FLZDtBQUFBLFFBSkUsRUFJRix1RUFKTyxDQUlQO0FBQUEsUUFIRSxFQUdGLHVFQUhPLENBR1A7QUFBQSxRQUZFLEVBRUYsdUVBRk8sRUFFUDtBQUFBLFFBREUsRUFDRix1RUFETyxFQUNQOztBQUFBOztBQUFBOztBQUdGLFdBQU8sTUFBUCxTQUFvQixFQUFDLHdCQUFELEVBQWMsb0JBQWQsRUFBeUIsTUFBekIsRUFBNkIsTUFBN0IsRUFBaUMsTUFBakMsRUFBcUMsTUFBckMsRUFBcEI7O0FBRUEsV0FBSyxRQUFMLEdBQWdCLE9BQWhCO0FBTEU7QUFNSDs7OzsyQkFFTyxHLEVBQUs7QUFDWCxVQUFJLFdBQUosR0FBa0IsS0FBSyxXQUF2QjtBQUNBLFVBQUksU0FBSixHQUFnQixLQUFLLFNBQXJCOztBQUVBLFVBQUksU0FBSjtBQUNBLFVBQUksTUFBSixDQUFXLEtBQUssRUFBaEIsRUFBb0IsS0FBSyxFQUF6QjtBQUNBLFVBQUksTUFBSixDQUFXLEtBQUssRUFBaEIsRUFBb0IsS0FBSyxFQUF6Qjs7QUFFQSxVQUFJLEtBQUssV0FBTCxLQUFxQixNQUF6QixFQUFpQyxJQUFJLE1BQUo7QUFDbEM7Ozs7RUF6QmdCLGE7O0FBNEJaLFNBQVMsSUFBVCxDQUFlLFdBQWYsRUFBNEIsU0FBNUIsRUFBdUMsRUFBdkMsRUFBMkMsRUFBM0MsRUFBK0MsRUFBL0MsRUFBbUQsRUFBbkQsRUFBdUQ7QUFDNUQsTUFBSSxTQUFTLElBQUksSUFBSixDQUFTLFdBQVQsRUFBc0IsU0FBdEIsRUFBaUMsRUFBakMsRUFBcUMsRUFBckMsRUFBeUMsRUFBekMsRUFBNkMsRUFBN0MsQ0FBYjtBQUNBLFFBQU0sUUFBTixDQUFlLE1BQWY7QUFDQSxTQUFPLE1BQVA7QUFDRDs7SUFFSyxJOzs7QUFDSixrQkFNSTtBQUFBLFFBTEUsT0FLRix1RUFMWSxRQUtaO0FBQUEsUUFKRSxJQUlGLHVFQUpTLGlCQUlUO0FBQUEsUUFIRSxTQUdGLHVFQUhjLEtBR2Q7QUFBQSxRQUZFLENBRUYsdUVBRk0sQ0FFTjtBQUFBLFFBREUsQ0FDRix1RUFETSxDQUNOOztBQUFBOztBQUFBOztBQUdGLFdBQU8sTUFBUCxTQUFvQixFQUFDLGdCQUFELEVBQVUsVUFBVixFQUFnQixvQkFBaEIsRUFBMkIsSUFBM0IsRUFBOEIsSUFBOUIsRUFBcEI7O0FBRUEsV0FBSyxZQUFMLEdBQW9CLEtBQXBCO0FBQ0EsV0FBSyxVQUFMLEdBQWtCLE1BQWxCO0FBTkU7QUFPSDs7OzsyQkFFTyxHLEVBQUs7QUFDWCxVQUFJLElBQUosR0FBVyxLQUFLLElBQWhCO0FBQ0EsVUFBSSxXQUFKLEdBQWtCLEtBQUssV0FBdkI7QUFDQSxVQUFJLFNBQUosR0FBZ0IsS0FBSyxTQUFyQjtBQUNBLFVBQUksU0FBSixHQUFnQixLQUFLLFNBQXJCOztBQUVBLFVBQUksS0FBSyxLQUFMLEtBQWUsQ0FBbkIsRUFBc0IsS0FBSyxLQUFMLEdBQWEsSUFBSSxXQUFKLENBQWdCLEtBQUssT0FBckIsRUFBOEIsS0FBM0M7QUFDdEIsVUFBSSxLQUFLLE1BQUwsS0FBZ0IsQ0FBcEIsRUFBdUIsS0FBSyxNQUFMLEdBQWMsSUFBSSxXQUFKLENBQWdCLEdBQWhCLEVBQXFCLEtBQW5DOztBQUV2QixVQUFJLFNBQUosQ0FDUSxDQUFDLEtBQUssS0FBTixHQUFjLEtBQUssTUFEM0IsRUFFUSxDQUFDLEtBQUssTUFBTixHQUFlLEtBQUssTUFGNUI7O0FBS0EsVUFBSSxZQUFKLEdBQW1CLEtBQUssWUFBeEI7O0FBRUEsVUFBSSxRQUFKLENBQ1EsS0FBSyxPQURiLEVBQ3NCLENBRHRCLEVBQ3lCLENBRHpCOztBQUlBLFVBQUksS0FBSyxVQUFMLEtBQW9CLE1BQXhCLEVBQWdDLElBQUksTUFBSjtBQUNqQzs7OztFQXJDZ0IsYTs7QUF3Q1osU0FBUyxJQUFULENBQWUsT0FBZixFQUF3QixJQUF4QixFQUE4QixTQUE5QixFQUF5QyxDQUF6QyxFQUE0QyxDQUE1QyxFQUErQztBQUNwRCxNQUFJLFNBQVMsSUFBSSxJQUFKLENBQVMsT0FBVCxFQUFrQixJQUFsQixFQUF3QixTQUF4QixFQUFtQyxDQUFuQyxFQUFzQyxDQUF0QyxDQUFiO0FBQ0EsUUFBTSxRQUFOLENBQWUsTUFBZjtBQUNBLFNBQU8sTUFBUDtBQUNEOztJQUVLLEs7OztBQUNKLG1CQUFnQztBQUFBOztBQUFBOztBQUFBLHVDQUFoQixjQUFnQjtBQUFoQixvQkFBZ0I7QUFBQTs7QUFHOUIsbUJBQWUsT0FBZixDQUF1QjtBQUFBLGFBQVUsT0FBSyxRQUFMLENBQWMsTUFBZCxDQUFWO0FBQUEsS0FBdkI7QUFIOEI7QUFJL0I7Ozs7NkJBRVMsTSxFQUFRO0FBQ2hCLFVBQUksT0FBTyxNQUFYLEVBQW1CO0FBQ2pCLGVBQU8sTUFBUCxDQUFjLFdBQWQsQ0FBMEIsTUFBMUI7QUFDRDtBQUNELGFBQU8sTUFBUCxHQUFnQixJQUFoQjtBQUNBLFdBQUssUUFBTCxDQUFjLElBQWQsQ0FBbUIsTUFBbkI7O0FBRUEsV0FBSyxhQUFMO0FBQ0Q7OztnQ0FFWSxNLEVBQVE7QUFDbkIsVUFBSSxPQUFPLE1BQVAsS0FBa0IsSUFBdEIsRUFBNEI7QUFDMUIsYUFBSyxRQUFMLENBQWMsTUFBZCxDQUFxQixLQUFLLFFBQUwsQ0FBYyxPQUFkLENBQXNCLE1BQXRCLENBQXJCLEVBQW9ELENBQXBEO0FBQ0EsYUFBSyxhQUFMO0FBQ0QsT0FIRCxNQUdPO0FBQ0wsY0FBTSxJQUFJLEtBQUosQ0FBYSxNQUFiLHlCQUF1QyxJQUF2QyxDQUFOO0FBQ0Q7QUFDRjs7O29DQUVnQjtBQUFBOztBQUNmLFVBQUksS0FBSyxRQUFMLENBQWMsTUFBZCxHQUF1QixDQUEzQixFQUE4QjtBQUM1QixhQUFLLFNBQUwsR0FBaUIsQ0FBakI7QUFDQSxhQUFLLFVBQUwsR0FBa0IsQ0FBbEI7O0FBRUEsYUFBSyxRQUFMLENBQWMsT0FBZCxDQUFzQixpQkFBUztBQUM3QixjQUFJLE1BQU0sQ0FBTixHQUFVLE1BQU0sS0FBaEIsR0FBd0IsT0FBSyxTQUFqQyxFQUE0QztBQUMxQyxtQkFBSyxTQUFMLEdBQWlCLE1BQU0sQ0FBTixHQUFVLE1BQU0sS0FBakM7QUFDRDtBQUNELGNBQUksTUFBTSxDQUFOLEdBQVUsTUFBTSxNQUFoQixHQUF5QixPQUFLLFVBQWxDLEVBQThDO0FBQzVDLG1CQUFLLFVBQUwsR0FBa0IsTUFBTSxDQUFOLEdBQVUsTUFBTSxNQUFsQztBQUNEO0FBQ0YsU0FQRDs7QUFTQSxhQUFLLEtBQUwsR0FBYSxLQUFLLFNBQWxCO0FBQ0EsYUFBSyxNQUFMLEdBQWMsS0FBSyxVQUFuQjtBQUNEO0FBQ0Y7Ozs7RUEzQ2lCLGE7O0FBOENiLFNBQVMsS0FBVCxHQUFtQztBQUFBLHFDQUFoQixjQUFnQjtBQUFoQixrQkFBZ0I7QUFBQTs7QUFDeEMsTUFBSSw0Q0FBYSxLQUFiLGdCQUFzQixjQUF0QixLQUFKO0FBQ0EsUUFBTSxRQUFOLENBQWUsTUFBZjtBQUNBLFNBQU8sTUFBUDtBQUNEOztJQUVLLE07OztBQUNKLGtCQUNNLE1BRE4sRUFJSTtBQUFBLFFBRkUsQ0FFRix1RUFGTSxDQUVOO0FBQUEsUUFERSxDQUNGLHVFQURNLENBQ047O0FBQUE7O0FBQUE7O0FBR0YsV0FBTyxNQUFQLFNBQW9CLEVBQUMsSUFBRCxFQUFJLElBQUosRUFBcEI7O0FBRUEsUUFBSSxrQkFBa0IsS0FBdEIsRUFBNkI7QUFDM0IsYUFBSyxlQUFMLENBQXFCLE1BQXJCO0FBQ0QsS0FGRCxNQUVPLElBQUksT0FBTyxJQUFYLEVBQWlCO0FBQ3RCLGFBQUssZUFBTCxDQUFxQixNQUFyQjtBQUNELEtBRk0sTUFFQSxJQUFJLE9BQU8sS0FBUCxJQUFnQixDQUFDLE9BQU8sSUFBNUIsRUFBa0M7QUFDdkMsYUFBSyxpQkFBTCxDQUF1QixNQUF2QjtBQUNELEtBRk0sTUFFQSxJQUFJLE9BQU8sS0FBUCxJQUFnQixPQUFPLElBQTNCLEVBQWlDO0FBQ3RDLGFBQUssdUJBQUwsQ0FBNkIsTUFBN0I7QUFDRCxLQUZNLE1BRUEsSUFBSSxrQkFBa0IsS0FBdEIsRUFBNkI7QUFDbEMsVUFBSSxPQUFPLENBQVAsS0FBYSxPQUFPLENBQVAsRUFBVSxNQUEzQixFQUFtQztBQUNqQyxlQUFLLHFCQUFMLENBQTJCLE1BQTNCO0FBQ0QsT0FGRCxNQUVPLElBQUksT0FBTyxDQUFQLGFBQXFCLEtBQXpCLEVBQWdDO0FBQ3JDLGVBQUssZ0JBQUwsQ0FBc0IsTUFBdEI7QUFDRCxPQUZNLE1BRUE7QUFDTCxjQUFNLElBQUksS0FBSiwyQkFBa0MsTUFBbEMseUJBQU47QUFDRDtBQUNGLEtBUk0sTUFRQTtBQUNMLFlBQU0sSUFBSSxLQUFKLHVCQUE4QixNQUE5Qix3QkFBTjtBQUNEO0FBdkJDO0FBd0JIOzs7O29DQUVnQixNLEVBQVE7QUFDdkIsVUFBSSxFQUFFLGtCQUFrQixLQUFwQixDQUFKLEVBQWdDO0FBQzlCLGNBQU0sSUFBSSxLQUFKLENBQWEsTUFBYiw2QkFBTjtBQUNELE9BRkQsTUFFTztBQUNMLGFBQUssTUFBTCxHQUFjLE1BQWQ7QUFDQSxhQUFLLE9BQUwsR0FBZSxDQUFmO0FBQ0EsYUFBSyxPQUFMLEdBQWUsQ0FBZjtBQUNBLGFBQUssV0FBTCxHQUFtQixPQUFPLEtBQTFCO0FBQ0EsYUFBSyxZQUFMLEdBQW9CLE9BQU8sTUFBM0I7O0FBRUEsYUFBSyxLQUFMLEdBQWEsT0FBTyxLQUFwQjtBQUNBLGFBQUssTUFBTCxHQUFjLE9BQU8sTUFBckI7QUFDRDtBQUNGOzs7b0NBRWdCLE0sRUFBUTtBQUN2QixXQUFLLFlBQUwsR0FBb0IsTUFBcEI7QUFDQSxXQUFLLE1BQUwsR0FBYyxLQUFLLFlBQUwsQ0FBa0IsTUFBaEM7QUFDQSxXQUFLLE9BQUwsR0FBZSxLQUFLLFlBQUwsQ0FBa0IsRUFBakM7QUFDQSxXQUFLLE9BQUwsR0FBZSxLQUFLLFlBQUwsQ0FBa0IsRUFBakM7QUFDQSxXQUFLLFdBQUwsR0FBbUIsT0FBTyxLQUExQjtBQUNBLFdBQUssWUFBTCxHQUFvQixPQUFPLEtBQTNCOztBQUVBLFdBQUssS0FBTCxHQUFhLEtBQUssWUFBTCxDQUFrQixDQUEvQjtBQUNBLFdBQUssTUFBTCxHQUFjLEtBQUssWUFBTCxDQUFrQixDQUFoQztBQUNEOzs7c0NBRWtCLE0sRUFBUTtBQUN6QixVQUFJLEVBQUUsT0FBTyxLQUFQLFlBQXdCLEtBQTFCLENBQUosRUFBc0M7QUFDcEMsY0FBTSxJQUFJLEtBQUosQ0FBYSxPQUFPLEtBQXBCLDZCQUFOO0FBQ0QsT0FGRCxNQUVPO0FBQ0wsYUFBSyxNQUFMLEdBQWMsT0FBTyxLQUFyQjs7QUFFQSxhQUFLLE9BQUwsR0FBZSxPQUFPLENBQXRCO0FBQ0EsYUFBSyxPQUFMLEdBQWUsT0FBTyxDQUF0QjtBQUNBLGFBQUssV0FBTCxHQUFtQixPQUFPLEtBQTFCO0FBQ0EsYUFBSyxZQUFMLEdBQW9CLE9BQU8sTUFBM0I7O0FBRUEsYUFBSyxLQUFMLEdBQWEsT0FBTyxLQUFwQjtBQUNBLGFBQUssTUFBTCxHQUFjLE9BQU8sTUFBckI7QUFDRDtBQUNGOzs7NENBRXdCLE0sRUFBUTtBQUMvQixVQUFJLEVBQUUsT0FBTyxLQUFQLFlBQXdCLEtBQTFCLENBQUosRUFBc0M7QUFDcEMsY0FBTSxJQUFJLEtBQUosQ0FBYSxPQUFPLEtBQXBCLDZCQUFOO0FBQ0QsT0FGRCxNQUVPO0FBQ0wsYUFBSyxNQUFMLEdBQWMsT0FBTyxLQUFyQjtBQUNBLGFBQUssTUFBTCxHQUFjLE9BQU8sSUFBckI7O0FBRUEsYUFBSyxPQUFMLEdBQWUsS0FBSyxNQUFMLENBQVksQ0FBWixFQUFlLENBQWYsQ0FBZjtBQUNBLGFBQUssT0FBTCxHQUFlLEtBQUssTUFBTCxDQUFZLENBQVosRUFBZSxDQUFmLENBQWY7QUFDQSxhQUFLLFdBQUwsR0FBbUIsT0FBTyxLQUExQjtBQUNBLGFBQUssWUFBTCxHQUFvQixPQUFPLE1BQTNCOztBQUVBLGFBQUssS0FBTCxHQUFhLE9BQU8sS0FBcEI7QUFDQSxhQUFLLE1BQUwsR0FBYyxPQUFPLE1BQXJCO0FBQ0Q7QUFDRjs7OzBDQUVzQixNLEVBQVE7QUFDN0IsV0FBSyxNQUFMLEdBQWMsTUFBZDtBQUNBLFdBQUssTUFBTCxHQUFjLE9BQU8sQ0FBUCxFQUFVLE1BQXhCO0FBQ0EsV0FBSyxPQUFMLEdBQWUsT0FBTyxDQUFQLEVBQVUsS0FBVixDQUFnQixDQUEvQjtBQUNBLFdBQUssT0FBTCxHQUFlLE9BQU8sQ0FBUCxFQUFVLEtBQVYsQ0FBZ0IsQ0FBL0I7QUFDQSxXQUFLLFdBQUwsR0FBbUIsT0FBTyxDQUFQLEVBQVUsS0FBVixDQUFnQixDQUFuQztBQUNBLFdBQUssWUFBTCxHQUFvQixPQUFPLENBQVAsRUFBVSxLQUFWLENBQWdCLENBQXBDOztBQUVBLFdBQUssS0FBTCxHQUFhLE9BQU8sQ0FBUCxFQUFVLEtBQVYsQ0FBZ0IsQ0FBN0I7QUFDQSxXQUFLLE1BQUwsR0FBYyxPQUFPLENBQVAsRUFBVSxLQUFWLENBQWdCLENBQTlCO0FBQ0Q7OztxQ0FFaUIsTSxFQUFRO0FBQ3hCLFdBQUssTUFBTCxHQUFjLE1BQWQ7QUFDQSxXQUFLLE1BQUwsR0FBYyxPQUFPLENBQVAsQ0FBZDtBQUNBLFdBQUssT0FBTCxHQUFlLENBQWY7QUFDQSxXQUFLLE9BQUwsR0FBZSxDQUFmO0FBQ0EsV0FBSyxXQUFMLEdBQW1CLE9BQU8sQ0FBUCxFQUFVLEtBQTdCO0FBQ0EsV0FBSyxZQUFMLEdBQW9CLE9BQU8sQ0FBUCxFQUFVLE1BQTlCOztBQUVBLFdBQUssS0FBTCxHQUFhLE9BQU8sQ0FBUCxFQUFVLEtBQXZCO0FBQ0EsV0FBSyxNQUFMLEdBQWMsT0FBTyxDQUFQLEVBQVUsTUFBeEI7QUFDRDs7O2dDQUVZLFcsRUFBYTtBQUN4QixVQUFJLEtBQUssTUFBTCxDQUFZLE1BQVosR0FBcUIsQ0FBckIsSUFBMEIsY0FBYyxLQUFLLE1BQUwsQ0FBWSxNQUF4RCxFQUFnRTtBQUM5RCxZQUFJLEtBQUssTUFBTCxDQUFZLENBQVosYUFBMEIsS0FBOUIsRUFBcUM7QUFDbkMsZUFBSyxPQUFMLEdBQWUsS0FBSyxNQUFMLENBQVksV0FBWixFQUF5QixDQUF6QixDQUFmO0FBQ0EsZUFBSyxPQUFMLEdBQWUsS0FBSyxNQUFMLENBQVksV0FBWixFQUF5QixDQUF6QixDQUFmO0FBQ0QsU0FIRCxNQUdPLElBQUksS0FBSyxNQUFMLENBQVksV0FBWixFQUF5QixLQUE3QixFQUFvQztBQUN6QyxlQUFLLE9BQUwsR0FBZSxLQUFLLE1BQUwsQ0FBWSxXQUFaLEVBQXlCLEtBQXpCLENBQStCLENBQTlDO0FBQ0EsZUFBSyxPQUFMLEdBQWUsS0FBSyxNQUFMLENBQVksV0FBWixFQUF5QixLQUF6QixDQUErQixDQUE5QztBQUNBLGVBQUssV0FBTCxHQUFtQixLQUFLLE1BQUwsQ0FBWSxXQUFaLEVBQXlCLEtBQXpCLENBQStCLENBQWxEO0FBQ0EsZUFBSyxZQUFMLEdBQW9CLEtBQUssTUFBTCxDQUFZLFdBQVosRUFBeUIsS0FBekIsQ0FBK0IsQ0FBbkQ7QUFDQSxlQUFLLEtBQUwsR0FBYSxLQUFLLE1BQUwsQ0FBWSxXQUFaLEVBQXlCLEtBQXpCLENBQStCLENBQTVDO0FBQ0EsZUFBSyxNQUFMLEdBQWMsS0FBSyxNQUFMLENBQVksV0FBWixFQUF5QixLQUF6QixDQUErQixDQUE3QztBQUNELFNBUE0sTUFPQTtBQUNMLGVBQUssTUFBTCxHQUFjLEtBQUssTUFBTCxDQUFZLFdBQVosQ0FBZDtBQUNBLGVBQUssT0FBTCxHQUFlLENBQWY7QUFDQSxlQUFLLE9BQUwsR0FBZSxDQUFmO0FBQ0EsZUFBSyxXQUFMLEdBQW1CLEtBQUssTUFBTCxDQUFZLEtBQS9CO0FBQ0EsZUFBSyxZQUFMLEdBQW9CLEtBQUssTUFBTCxDQUFZLE1BQWhDO0FBQ0EsZUFBSyxLQUFMLEdBQWEsS0FBSyxNQUFMLENBQVksS0FBekI7QUFDQSxlQUFLLE1BQUwsR0FBYyxLQUFLLE1BQUwsQ0FBWSxNQUExQjtBQUNEOztBQUVELGFBQUssYUFBTCxHQUFxQixXQUFyQjtBQUNELE9BdEJELE1Bc0JPO0FBQ0wsY0FBTSxJQUFJLEtBQUosbUJBQTBCLFdBQTFCLHVCQUFOO0FBQ0Q7QUFDRjs7OzJCQUVPLEcsRUFBSztBQUNYLFVBQUksU0FBSixDQUNRLEtBQUssTUFEYixFQUVRLEtBQUssT0FGYixFQUVzQixLQUFLLE9BRjNCLEVBR1EsS0FBSyxXQUhiLEVBRzBCLEtBQUssWUFIL0IsRUFJUSxDQUFDLEtBQUssS0FBTixHQUFjLEtBQUssTUFKM0IsRUFLUSxDQUFDLEtBQUssTUFBTixHQUFlLEtBQUssTUFMNUIsRUFNUSxLQUFLLEtBTmIsRUFNb0IsS0FBSyxNQU56QjtBQVFEOzs7O0VBeEprQixhOztBQTJKZCxTQUFTLE1BQVQsQ0FBaUIsTUFBakIsRUFBeUIsQ0FBekIsRUFBNEIsQ0FBNUIsRUFBK0I7QUFDcEMsTUFBSSxTQUFTLElBQUksTUFBSixDQUFXLE1BQVgsRUFBbUIsQ0FBbkIsRUFBc0IsQ0FBdEIsQ0FBYjtBQUNBLE1BQUksT0FBTyxNQUFQLENBQWMsTUFBZCxHQUF1QixDQUEzQixFQUE4QixlQUFlLE1BQWY7QUFDOUIsUUFBTSxRQUFOLENBQWUsTUFBZjtBQUNBLFNBQU8sTUFBUDtBQUNEOztBQUVNLFNBQVMsS0FBVCxDQUFnQixNQUFoQixFQUF3QixDQUF4QixFQUEyQixDQUEzQixFQUE4QixLQUE5QixFQUFxQyxNQUFyQyxFQUE2QztBQUNsRCxNQUFJLElBQUksRUFBUjtBQUNBLElBQUUsS0FBRixHQUFVLE1BQVY7QUFDQSxJQUFFLENBQUYsR0FBTSxDQUFOO0FBQ0EsSUFBRSxDQUFGLEdBQU0sQ0FBTjtBQUNBLElBQUUsS0FBRixHQUFVLEtBQVY7QUFDQSxJQUFFLE1BQUYsR0FBVyxNQUFYO0FBQ0EsU0FBTyxDQUFQO0FBQ0Q7O0FBRU0sU0FBUyxNQUFULENBQWlCLE1BQWpCLEVBQXlCLGdCQUF6QixFQUEyQyxLQUEzQyxFQUFrRCxNQUFsRCxFQUEwRDtBQUMvRCxNQUFJLElBQUksRUFBUjtBQUNBLElBQUUsS0FBRixHQUFVLE1BQVY7QUFDQSxJQUFFLElBQUYsR0FBUyxnQkFBVDtBQUNBLElBQUUsS0FBRixHQUFVLEtBQVY7QUFDQSxJQUFFLE1BQUYsR0FBVyxNQUFYO0FBQ0EsU0FBTyxDQUFQO0FBQ0Q7O0FBRU0sU0FBUyxTQUFULENBQW9CLEtBQXBCLEVBQTJCLFVBQTNCLEVBQXVDLFdBQXZDLEVBQWlFO0FBQUEsTUFBYixPQUFhLHVFQUFILENBQUc7O0FBQ3RFLE1BQUksWUFBWSxFQUFoQjs7QUFFQSxNQUFJLFVBQVUsTUFBTSxLQUFOLEdBQWMsVUFBNUI7QUFDQSxNQUFJLE9BQU8sTUFBTSxNQUFOLEdBQWUsV0FBMUI7O0FBRUEsTUFBSSxpQkFBaUIsVUFBVSxJQUEvQjs7QUFFQSxPQUFLLElBQUksSUFBSSxDQUFiLEVBQWdCLElBQUksY0FBcEIsRUFBb0MsR0FBcEMsRUFBeUM7QUFDdkMsUUFBSSxJQUFLLElBQUksT0FBTCxHQUFnQixVQUF4QjtBQUNBLFFBQUksSUFBSSxLQUFLLEtBQUwsQ0FBVyxJQUFJLE9BQWYsSUFBMEIsV0FBbEM7O0FBRUEsUUFBSSxXQUFXLFVBQVUsQ0FBekIsRUFBNEI7QUFDMUIsV0FBSyxVQUFXLFVBQVUsQ0FBVixHQUFjLE9BQTlCO0FBQ0EsV0FBSyxVQUFXLFVBQVUsS0FBSyxLQUFMLENBQVcsSUFBSSxPQUFmLENBQTFCO0FBQ0Q7O0FBRUQsY0FBVSxJQUFWLENBQWUsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFmO0FBQ0Q7O0FBRUQsU0FBTyxPQUFPLEtBQVAsRUFBYyxTQUFkLEVBQXlCLFVBQXpCLEVBQXFDLFdBQXJDLENBQVA7QUFDRDs7SUFFSyxNOzs7QUFDSixrQkFBYSxNQUFiLEVBQW1DO0FBQUEsUUFBZCxDQUFjLHVFQUFWLENBQVU7QUFBQSxRQUFQLENBQU8sdUVBQUgsQ0FBRzs7QUFBQTs7QUFBQSxrSEFDM0IsTUFEMkIsRUFDbkIsQ0FEbUIsRUFDaEIsQ0FEZ0I7O0FBRWpDLFlBQUssV0FBTCxHQUFtQixJQUFuQjtBQUZpQztBQUdsQzs7O0VBSmtCLE07O0FBT2QsU0FBUyxNQUFULENBQWlCLE1BQWpCLEVBQXlCLENBQXpCLEVBQTRCLENBQTVCLEVBQStCO0FBQ3BDLE1BQUksU0FBUyxJQUFJLE1BQUosQ0FBVyxNQUFYLEVBQW1CLENBQW5CLEVBQXNCLENBQXRCLENBQWI7QUFDQSxRQUFNLFFBQU4sQ0FBZSxNQUFmO0FBQ0EsU0FBTyxNQUFQO0FBQ0Q7O0FBRUQsU0FBUyxlQUFULENBQTBCLENBQTFCLEVBQTZCO0FBQzNCLElBQUUsS0FBRixHQUFVLEVBQUUsS0FBRixJQUFXLFNBQXJCO0FBQ0EsSUFBRSxPQUFGLEdBQVksRUFBRSxPQUFGLElBQWEsU0FBekI7QUFDQSxJQUFFLElBQUYsR0FBUyxFQUFFLElBQUYsSUFBVSxTQUFuQjtBQUNBLElBQUUsR0FBRixHQUFRLEVBQUUsR0FBRixJQUFTLFNBQWpCO0FBQ0EsSUFBRSxHQUFGLEdBQVEsRUFBRSxHQUFGLElBQVMsU0FBakI7O0FBRUEsSUFBRSxLQUFGLEdBQVUsSUFBVjs7QUFFQSxJQUFFLE1BQUYsR0FBVyxFQUFYOztBQUVBLElBQUUsT0FBRixHQUFZLEtBQVo7QUFDQSxJQUFFLFNBQUYsR0FBYyxLQUFkOztBQUVBLElBQUUsTUFBRixHQUFXLFVBQUMsT0FBRCxFQUFhO0FBQ3RCLFFBQUksTUFBTSxRQUFRLGFBQVIsQ0FBc0IsQ0FBdEIsQ0FBVjs7QUFFQSxRQUFJLFFBQVEsSUFBWixFQUFrQjtBQUNoQixRQUFFLEtBQUYsR0FBVSxJQUFWO0FBQ0EsVUFBSSxhQUFhLE1BQWpCLEVBQXlCLEVBQUUsV0FBRixDQUFjLENBQWQ7QUFDMUI7O0FBRUQsUUFBSSxHQUFKLEVBQVM7QUFDUCxRQUFFLEtBQUYsR0FBVSxNQUFWOztBQUVBLFVBQUksRUFBRSxNQUFGLElBQVksRUFBRSxNQUFGLENBQVMsTUFBVCxLQUFvQixDQUFoQyxJQUFxQyxhQUFhLE1BQXRELEVBQThEO0FBQzVELFVBQUUsV0FBRixDQUFjLENBQWQ7QUFDRDs7QUFFRCxVQUFJLFFBQVEsTUFBWixFQUFvQjtBQUNsQixVQUFFLEtBQUYsR0FBVSxNQUFWOztBQUVBLFlBQUksYUFBYSxNQUFqQixFQUF5QjtBQUN2QixjQUFJLEVBQUUsTUFBRixDQUFTLE1BQVQsS0FBb0IsQ0FBeEIsRUFBMkI7QUFDekIsY0FBRSxXQUFGLENBQWMsQ0FBZDtBQUNELFdBRkQsTUFFTztBQUNMLGNBQUUsV0FBRixDQUFjLENBQWQ7QUFDRDtBQUNGO0FBQ0Y7QUFDRjs7QUFFRCxRQUFJLEVBQUUsS0FBRixLQUFZLE1BQWhCLEVBQXdCO0FBQ3RCLFVBQUksQ0FBQyxFQUFFLE9BQVAsRUFBZ0I7QUFDZCxZQUFJLEVBQUUsS0FBTixFQUFhLEVBQUUsS0FBRjtBQUNiLFVBQUUsT0FBRixHQUFZLElBQVo7QUFDQSxVQUFFLE1BQUYsR0FBVyxTQUFYO0FBQ0Q7QUFDRjs7QUFFRCxRQUFJLEVBQUUsS0FBRixLQUFZLE1BQWhCLEVBQXdCO0FBQ3RCLFVBQUksRUFBRSxPQUFOLEVBQWU7QUFDYixZQUFJLEVBQUUsT0FBTixFQUFlLEVBQUUsT0FBRjtBQUNmLFVBQUUsT0FBRixHQUFZLEtBQVo7QUFDQSxVQUFFLE1BQUYsR0FBVyxVQUFYOztBQUVBLFlBQUksUUFBUSxNQUFSLElBQWtCLEVBQUUsR0FBeEIsRUFBNkIsRUFBRSxHQUFGO0FBQzlCOztBQUVELFVBQUksQ0FBQyxFQUFFLFNBQVAsRUFBa0I7QUFDaEIsWUFBSSxFQUFFLElBQU4sRUFBWSxFQUFFLElBQUY7QUFDWixVQUFFLFNBQUYsR0FBYyxJQUFkO0FBQ0Q7QUFDRjs7QUFFRCxRQUFJLEVBQUUsS0FBRixLQUFZLElBQWhCLEVBQXNCO0FBQ3BCLFVBQUksRUFBRSxPQUFOLEVBQWU7QUFDYixZQUFJLEVBQUUsT0FBTixFQUFlLEVBQUUsT0FBRjtBQUNmLFVBQUUsT0FBRixHQUFZLEtBQVo7QUFDQSxVQUFFLE1BQUYsR0FBVyxVQUFYO0FBQ0Q7O0FBRUQsVUFBSSxFQUFFLFNBQU4sRUFBaUI7QUFDZixZQUFJLEVBQUUsR0FBTixFQUFXLEVBQUUsR0FBRjtBQUNYLFVBQUUsU0FBRixHQUFjLEtBQWQ7QUFDRDtBQUNGO0FBQ0YsR0EvREQ7QUFnRUQ7O0FBRUQsU0FBUyxjQUFULENBQXlCLE1BQXpCLEVBQWlDO0FBQy9CLE1BQUksZUFBZSxDQUFuQjtBQUNBLE1BQUksaUJBQWlCLENBQXJCO0FBQ0EsTUFBSSxhQUFhLENBQWpCO0FBQ0EsTUFBSSxXQUFXLENBQWY7QUFDQSxNQUFJLHFCQUFKOztBQUVBLFdBQVMsSUFBVCxDQUFlLFdBQWYsRUFBNEI7QUFDMUI7QUFDQSxXQUFPLFdBQVAsQ0FBbUIsV0FBbkI7QUFDRDs7QUFFRCxXQUFTLElBQVQsR0FBaUI7QUFDZixpQkFBYSxDQUFDLENBQUQsRUFBSSxPQUFPLE1BQVAsQ0FBYyxNQUFkLEdBQXVCLENBQTNCLENBQWI7QUFDRDs7QUFFRCxXQUFTLElBQVQsR0FBaUI7QUFDZjtBQUNBLFdBQU8sV0FBUCxDQUFtQixPQUFPLFlBQTFCO0FBQ0Q7O0FBRUQsV0FBUyxZQUFULENBQXVCLGFBQXZCLEVBQXNDO0FBQ3BDOztBQUVBLGlCQUFhLGNBQWMsQ0FBZCxDQUFiO0FBQ0EsZUFBVyxjQUFjLENBQWQsQ0FBWDtBQUNBLHFCQUFpQixXQUFXLFVBQTVCOztBQUVBLFFBQUksZUFBZSxDQUFuQixFQUFzQjtBQUNwQix3QkFBa0IsQ0FBbEI7QUFDQSxzQkFBZ0IsQ0FBaEI7QUFDRDs7QUFFRCxRQUFJLG1CQUFtQixDQUF2QixFQUEwQjtBQUN4Qix1QkFBaUIsQ0FBakI7QUFDQSxzQkFBZ0IsQ0FBaEI7QUFDRDs7QUFFRCxRQUFJLENBQUMsT0FBTyxHQUFaLEVBQWlCLE9BQU8sR0FBUCxHQUFhLEVBQWI7QUFDakIsUUFBSSxZQUFZLE9BQU8sT0FBTyxHQUE5Qjs7QUFFQSxXQUFPLFdBQVAsQ0FBbUIsVUFBbkI7O0FBRUEsUUFBSSxDQUFDLE9BQU8sT0FBWixFQUFxQjtBQUNuQixxQkFBZSxZQUFZLGFBQWEsSUFBYixDQUFrQixJQUFsQixDQUFaLEVBQXFDLFNBQXJDLENBQWY7QUFDQSxhQUFPLE9BQVAsR0FBaUIsSUFBakI7QUFDRDtBQUNGOztBQUVELFdBQVMsWUFBVCxHQUF5QjtBQUN2QixRQUFJLGVBQWUsY0FBbkIsRUFBbUM7QUFDakMsYUFBTyxXQUFQLENBQW1CLE9BQU8sWUFBUCxHQUFzQixDQUF6QztBQUNBLHNCQUFnQixDQUFoQjtBQUNELEtBSEQsTUFHTztBQUNMLFVBQUksT0FBTyxJQUFYLEVBQWlCO0FBQ2YsZUFBTyxXQUFQLENBQW1CLFVBQW5CO0FBQ0EsdUJBQWUsQ0FBZjtBQUNEO0FBQ0Y7QUFDRjs7QUFFRCxXQUFTLEtBQVQsR0FBa0I7QUFDaEIsUUFBSSxpQkFBaUIsU0FBakIsSUFBOEIsT0FBTyxPQUFQLEtBQW1CLElBQXJELEVBQTJEO0FBQ3pELGFBQU8sT0FBUCxHQUFpQixLQUFqQjtBQUNBLHFCQUFlLENBQWY7QUFDQSxtQkFBYSxDQUFiO0FBQ0EsaUJBQVcsQ0FBWDtBQUNBLHVCQUFpQixDQUFqQjtBQUNBLG9CQUFjLFlBQWQ7QUFDRDtBQUNGOztBQUVELFNBQU8sSUFBUCxHQUFjLElBQWQ7QUFDQSxTQUFPLElBQVAsR0FBYyxJQUFkO0FBQ0EsU0FBTyxJQUFQLEdBQWMsSUFBZDtBQUNBLFNBQU8sWUFBUCxHQUFzQixZQUF0QjtBQUNEOztBQUVNLFNBQVMsY0FBVCxHQWFMO0FBQUEsTUFaRSxDQVlGLHVFQVpNLENBWU47QUFBQSxNQVhFLENBV0YsdUVBWE0sQ0FXTjtBQUFBLE1BVkUsY0FVRix1RUFWbUI7QUFBQSxXQUFNLE9BQU8sRUFBUCxFQUFXLEtBQVgsQ0FBTjtBQUFBLEdBVW5CO0FBQUEsTUFURSxpQkFTRix1RUFUc0IsRUFTdEI7QUFBQSxNQVJFLE9BUUYsdUVBUlksQ0FRWjtBQUFBLE1BUEUsYUFPRix1RUFQa0IsSUFPbEI7QUFBQSxNQU5FLFFBTUYsdUVBTmEsQ0FNYjtBQUFBLE1BTmdCLFFBTWhCLHVFQU4yQixJQU0zQjtBQUFBLE1BTEUsT0FLRix1RUFMWSxDQUtaO0FBQUEsTUFMZSxPQUtmLHVFQUx5QixFQUt6QjtBQUFBLE1BSkUsUUFJRiwwRUFKYSxHQUliO0FBQUEsTUFKa0IsUUFJbEIsMEVBSjZCLENBSTdCO0FBQUEsTUFIRSxhQUdGLDBFQUhrQixJQUdsQjtBQUFBLE1BSHdCLGFBR3hCLDBFQUh3QyxJQUd4QztBQUFBLE1BRkUsYUFFRiwwRUFGa0IsSUFFbEI7QUFBQSxNQUZ3QixhQUV4QiwwRUFGd0MsSUFFeEM7QUFBQSxNQURFLGdCQUNGLDBFQURxQixJQUNyQjtBQUFBLE1BRDJCLGdCQUMzQiwwRUFEOEMsSUFDOUM7O0FBQ0EsTUFBSSxjQUFjLFNBQWQsV0FBYyxDQUFDLEdBQUQsRUFBTSxHQUFOO0FBQUEsV0FBYyxNQUFNLEtBQUssTUFBTCxNQUFpQixNQUFNLEdBQXZCLENBQXBCO0FBQUEsR0FBbEI7QUFDQSxNQUFJLFlBQVksU0FBWixTQUFZLENBQUMsR0FBRCxFQUFNLEdBQU47QUFBQSxXQUFjLEtBQUssS0FBTCxDQUFXLEtBQUssTUFBTCxNQUFpQixNQUFNLEdBQU4sR0FBWSxDQUE3QixDQUFYLElBQThDLEdBQTVEO0FBQUEsR0FBaEI7O0FBRUEsTUFBSSxTQUFTLEVBQWI7QUFDQSxNQUFJLGNBQUo7O0FBRUEsTUFBSSxVQUFVLENBQUMsV0FBVyxRQUFaLEtBQXlCLG9CQUFvQixDQUE3QyxDQUFkOztBQUVBLE9BQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsSUFBSSxpQkFBcEIsRUFBdUMsR0FBdkMsRUFBNEM7QUFDMUMsUUFBSSxhQUFKLEVBQW1CO0FBQ2pCLGNBQVEsWUFBWSxRQUFaLEVBQXNCLFFBQXRCLENBQVI7QUFDQSxhQUFPLElBQVAsQ0FBWSxLQUFaO0FBQ0QsS0FIRCxNQUdPO0FBQ0wsVUFBSSxVQUFVLFNBQWQsRUFBeUIsUUFBUSxRQUFSO0FBQ3pCLGFBQU8sSUFBUCxDQUFZLEtBQVo7QUFDQSxlQUFTLE9BQVQ7QUFDRDtBQUNGOztBQUVELFNBQU8sT0FBUCxDQUFlO0FBQUEsV0FBUyxhQUFhLEtBQWIsQ0FBVDtBQUFBLEdBQWY7O0FBRUEsV0FBUyxZQUFULENBQXVCLEtBQXZCLEVBQThCO0FBQzVCLFFBQUksV0FBVyxnQkFBZjs7QUFFQSxRQUFJLFNBQVMsTUFBVCxDQUFnQixNQUFoQixHQUF5QixDQUE3QixFQUFnQztBQUM5QixlQUFTLFdBQVQsQ0FBcUIsVUFBVSxDQUFWLEVBQWEsU0FBUyxNQUFULENBQWdCLE1BQWhCLEdBQXlCLENBQXRDLENBQXJCO0FBQ0Q7O0FBRUQsYUFBUyxDQUFULEdBQWEsSUFBSSxTQUFTLFVBQTFCO0FBQ0EsYUFBUyxDQUFULEdBQWEsSUFBSSxTQUFTLFVBQTFCOztBQUVBLFFBQUksT0FBTyxVQUFVLE9BQVYsRUFBbUIsT0FBbkIsQ0FBWDtBQUNBLGFBQVMsS0FBVCxHQUFpQixJQUFqQjtBQUNBLGFBQVMsTUFBVCxHQUFrQixJQUFsQjs7QUFFQSxhQUFTLFVBQVQsR0FBc0IsWUFBWSxhQUFaLEVBQTJCLGFBQTNCLENBQXRCO0FBQ0EsYUFBUyxVQUFULEdBQXNCLFlBQVksYUFBWixFQUEyQixhQUEzQixDQUF0QjtBQUNBLGFBQVMsYUFBVCxHQUF5QixZQUFZLGdCQUFaLEVBQThCLGdCQUE5QixDQUF6Qjs7QUFFQSxRQUFJLFFBQVEsWUFBWSxRQUFaLEVBQXNCLFFBQXRCLENBQVo7QUFDQSxhQUFTLEVBQVQsR0FBYyxRQUFRLEtBQUssR0FBTCxDQUFTLEtBQVQsQ0FBdEI7QUFDQSxhQUFTLEVBQVQsR0FBYyxRQUFRLEtBQUssR0FBTCxDQUFTLEtBQVQsQ0FBdEI7O0FBRUEsYUFBUyxNQUFULEdBQWtCLFlBQU07QUFDdEIsZUFBUyxFQUFULElBQWUsT0FBZjs7QUFFQSxlQUFTLENBQVQsSUFBYyxTQUFTLEVBQXZCO0FBQ0EsZUFBUyxDQUFULElBQWMsU0FBUyxFQUF2Qjs7QUFFQSxVQUFJLFNBQVMsTUFBVCxHQUFrQixTQUFTLFVBQTNCLEdBQXdDLENBQTVDLEVBQStDO0FBQzdDLGlCQUFTLE1BQVQsSUFBbUIsU0FBUyxVQUE1QjtBQUNEO0FBQ0QsVUFBSSxTQUFTLE1BQVQsR0FBa0IsU0FBUyxVQUEzQixHQUF3QyxDQUE1QyxFQUErQztBQUM3QyxpQkFBUyxNQUFULElBQW1CLFNBQVMsVUFBNUI7QUFDRDs7QUFFRCxlQUFTLFFBQVQsSUFBcUIsU0FBUyxhQUE5Qjs7QUFFQSxlQUFTLEtBQVQsSUFBa0IsU0FBUyxVQUEzQjs7QUFFQSxVQUFJLFNBQVMsS0FBVCxJQUFrQixDQUF0QixFQUF5QjtBQUN2QixlQUFPLFFBQVA7QUFDQSxrQkFBVSxNQUFWLENBQWlCLFVBQVUsT0FBVixDQUFrQixRQUFsQixDQUFqQixFQUE4QyxDQUE5QztBQUNEO0FBQ0YsS0FyQkQ7O0FBdUJBLGNBQVUsSUFBVixDQUFlLFFBQWY7QUFDRDtBQUNGOztBQUVNLFNBQVMsT0FBVCxDQUFrQixRQUFsQixFQUE0QixnQkFBNUIsRUFBOEM7QUFDbkQsTUFBSSxVQUFVLEVBQWQ7QUFDQSxNQUFJLHNCQUFKOztBQUVBLFVBQVEsT0FBUixHQUFrQixLQUFsQjs7QUFFQSxXQUFTLElBQVQsR0FBaUI7QUFDZixRQUFJLENBQUMsUUFBUSxPQUFiLEVBQXNCO0FBQ3BCO0FBQ0Esc0JBQWdCLFlBQVksYUFBYSxJQUFiLENBQWtCLElBQWxCLENBQVosRUFBcUMsUUFBckMsQ0FBaEI7QUFDQSxjQUFRLE9BQVIsR0FBa0IsSUFBbEI7QUFDRDtBQUNGOztBQUVELFdBQVMsSUFBVCxHQUFpQjtBQUNmLFFBQUksUUFBUSxPQUFaLEVBQXFCO0FBQ25CLG9CQUFjLGFBQWQ7QUFDQSxjQUFRLE9BQVIsR0FBa0IsS0FBbEI7QUFDRDtBQUNGOztBQUVELFdBQVMsWUFBVCxHQUF5QjtBQUN2QjtBQUNEOztBQUVELFVBQVEsSUFBUixHQUFlLElBQWY7QUFDQSxVQUFRLElBQVIsR0FBZSxJQUFmOztBQUVBLFNBQU8sT0FBUDtBQUNEOztBQUVNLFNBQVMsSUFBVCxHQUtIO0FBQUEsTUFKQSxPQUlBLHVFQUpVLENBSVY7QUFBQSxNQUphLElBSWIsdUVBSm9CLENBSXBCO0FBQUEsTUFKdUIsU0FJdkIsdUVBSm1DLEVBSW5DO0FBQUEsTUFKdUMsVUFJdkMsdUVBSm9ELEVBSXBEO0FBQUEsTUFIQSxVQUdBLHVFQUhhLEtBR2I7QUFBQSxNQUhvQixPQUdwQix1RUFIOEIsQ0FHOUI7QUFBQSxNQUhpQyxPQUdqQyx1RUFIMkMsQ0FHM0M7QUFBQSxNQUZBLFVBRUEsdUVBRmEsU0FFYjtBQUFBLE1BREEsS0FDQSx1RUFEUSxTQUNSOztBQUNGLE1BQUksWUFBWSxPQUFoQjtBQUNBLE1BQUksYUFBYSxTQUFiLFVBQWEsR0FBTTtBQUNyQixRQUFJLFNBQVMsVUFBVSxJQUF2Qjs7QUFFQSxTQUFLLElBQUksSUFBSSxDQUFiLEVBQWdCLElBQUksTUFBcEIsRUFBNEIsR0FBNUIsRUFBaUM7QUFDL0IsVUFBSSxJQUFLLElBQUksT0FBTCxHQUFnQixTQUF4QjtBQUNBLFVBQUksSUFBSSxLQUFLLEtBQUwsQ0FBVyxJQUFJLE9BQWYsSUFBMEIsVUFBbEM7O0FBRUEsVUFBSSxVQUFTLFlBQWI7QUFDQSxnQkFBVSxRQUFWLENBQW1CLE9BQW5COztBQUVBLFVBQUksQ0FBQyxVQUFMLEVBQWlCO0FBQ2YsZ0JBQU8sQ0FBUCxHQUFXLElBQUksT0FBZjtBQUNBLGdCQUFPLENBQVAsR0FBVyxJQUFJLE9BQWY7QUFDRCxPQUhELE1BR087QUFDTCxnQkFBTyxDQUFQLEdBQVcsSUFBSyxZQUFZLENBQWpCLEdBQXNCLFFBQU8sU0FBN0IsR0FBeUMsT0FBcEQ7QUFDQSxnQkFBTyxDQUFQLEdBQVcsSUFBSyxhQUFhLENBQWxCLEdBQXVCLFFBQU8sVUFBOUIsR0FBMkMsT0FBdEQ7QUFDRDs7QUFFRCxVQUFJLEtBQUosRUFBVyxNQUFNLE9BQU47QUFDWjtBQUNGLEdBcEJEOztBQXNCQTs7QUFFQSxTQUFPLFNBQVA7QUFDRDs7QUFFTSxTQUFTLFlBQVQsQ0FBdUIsS0FBdkIsRUFBOEIsTUFBOUIsRUFBc0MsTUFBdEMsRUFBNEQ7QUFBQSxNQUFkLENBQWMsdUVBQVYsQ0FBVTtBQUFBLE1BQVAsQ0FBTyx1RUFBSCxDQUFHOztBQUNqRSxNQUFJLGtCQUFKO0FBQUEsTUFBZSxtQkFBZjs7QUFFQSxNQUFJLE9BQU8sS0FBWCxFQUFrQjtBQUNoQixnQkFBWSxPQUFPLEtBQVAsQ0FBYSxDQUF6QjtBQUNBLGlCQUFhLE9BQU8sS0FBUCxDQUFhLENBQTFCO0FBQ0QsR0FIRCxNQUdPO0FBQ0wsZ0JBQVksT0FBTyxLQUFuQjtBQUNBLGlCQUFhLE9BQU8sTUFBcEI7QUFDRDs7QUFFRCxNQUFJLGdCQUFKO0FBQUEsTUFBYSxhQUFiOztBQUVBLE1BQUksU0FBUyxTQUFiLEVBQXdCO0FBQ3RCLGNBQVUsS0FBSyxLQUFMLENBQVcsUUFBUSxTQUFuQixJQUFnQyxDQUExQztBQUNELEdBRkQsTUFFTztBQUNMLGNBQVUsQ0FBVjtBQUNEOztBQUVELE1BQUksVUFBVSxVQUFkLEVBQTBCO0FBQ3hCLFdBQU8sS0FBSyxLQUFMLENBQVcsU0FBUyxVQUFwQixJQUFrQyxDQUF6QztBQUNELEdBRkQsTUFFTztBQUNMLFdBQU8sQ0FBUDtBQUNEOztBQUVELE1BQUksV0FBVyxLQUNULE9BRFMsRUFDQSxJQURBLEVBQ00sU0FETixFQUNpQixVQURqQixFQUM2QixLQUQ3QixFQUNvQyxDQURwQyxFQUN1QyxDQUR2QyxFQUVULFlBQU07QUFDSixRQUFJLE9BQU8sT0FBTyxNQUFQLENBQVg7QUFDQSxXQUFPLElBQVA7QUFDRCxHQUxRLENBQWY7O0FBUUEsV0FBUyxNQUFULEdBQWtCLENBQWxCO0FBQ0EsV0FBUyxNQUFULEdBQWtCLENBQWxCOztBQUVBLE1BQUksWUFBWSxVQUFVLEtBQVYsRUFBaUIsTUFBakIsRUFBeUIsTUFBekIsRUFBaUMsTUFBakMsQ0FBaEI7QUFDQSxZQUFVLENBQVYsR0FBYyxDQUFkO0FBQ0EsWUFBVSxDQUFWLEdBQWMsQ0FBZDs7QUFFQSxZQUFVLElBQVYsR0FBaUIsSUFBakI7O0FBRUEsWUFBVSxRQUFWLENBQW1CLFFBQW5COztBQUVBLFNBQU8sZ0JBQVAsQ0FBd0IsU0FBeEIsRUFBbUM7QUFDakMsV0FBTztBQUNMLFNBREssaUJBQ0U7QUFDTCxlQUFPLFNBQVMsTUFBaEI7QUFDRCxPQUhJO0FBSUwsU0FKSyxlQUlBLEtBSkEsRUFJTztBQUNWLGlCQUFTLFFBQVQsQ0FBa0IsT0FBbEIsQ0FBMEIsaUJBQVM7QUFDakMsY0FBSSxhQUFhLFFBQVEsU0FBUyxNQUFsQztBQUNBLGdCQUFNLENBQU4sSUFBVyxVQUFYOztBQUVBLGNBQUksTUFBTSxDQUFOLEdBQVUsQ0FBQyxVQUFVLENBQVgsSUFBZ0IsU0FBOUIsRUFBeUM7QUFDdkMsa0JBQU0sQ0FBTixHQUFVLElBQUksU0FBSixHQUFnQixVQUExQjtBQUNEOztBQUVELGNBQUksTUFBTSxDQUFOLEdBQVUsSUFBSSxTQUFKLEdBQWdCLFVBQTlCLEVBQTBDO0FBQ3hDLGtCQUFNLENBQU4sR0FBVSxDQUFDLFVBQVUsQ0FBWCxJQUFnQixTQUExQjtBQUNEO0FBQ0YsU0FYRDs7QUFhQSxpQkFBUyxNQUFULEdBQWtCLEtBQWxCO0FBQ0QsT0FuQkk7O0FBb0JMLGtCQUFZLElBcEJQO0FBcUJMLG9CQUFjO0FBckJULEtBRDBCO0FBd0JqQyxXQUFPO0FBQ0wsU0FESyxpQkFDRTtBQUNMLGVBQU8sU0FBUyxNQUFoQjtBQUNELE9BSEk7QUFJTCxTQUpLLGVBSUEsS0FKQSxFQUlPO0FBQ1YsaUJBQVMsUUFBVCxDQUFrQixPQUFsQixDQUEwQixpQkFBUztBQUNqQyxjQUFJLGFBQWEsUUFBUSxTQUFTLE1BQWxDO0FBQ0EsZ0JBQU0sQ0FBTixJQUFXLFVBQVg7QUFDQSxjQUFJLE1BQU0sQ0FBTixHQUFVLENBQUMsT0FBTyxDQUFSLElBQWEsVUFBM0IsRUFBdUM7QUFDckMsa0JBQU0sQ0FBTixHQUFVLElBQUksVUFBSixHQUFpQixVQUEzQjtBQUNEO0FBQ0QsY0FBSSxNQUFNLENBQU4sR0FBVSxJQUFJLFVBQUosR0FBaUIsVUFBL0IsRUFBMkM7QUFDekMsa0JBQU0sQ0FBTixHQUFVLENBQUMsT0FBTyxDQUFSLElBQWEsVUFBdkI7QUFDRDtBQUNGLFNBVEQ7QUFVQSxpQkFBUyxNQUFULEdBQWtCLEtBQWxCO0FBQ0QsT0FoQkk7O0FBaUJMLGtCQUFZLElBakJQO0FBa0JMLG9CQUFjO0FBbEJUO0FBeEIwQixHQUFuQzs7QUE4Q0EsU0FBTyxTQUFQO0FBQ0Q7O0FBRUQsSUFBSSx3QkFBSjs7SUFFTSxVO0FBQ0osc0JBQWEsTUFBYixFQUFxQixLQUFyQixFQUE0QixNQUE1QixFQUFrRDtBQUFBLFFBQWQsQ0FBYyx1RUFBVixDQUFVO0FBQUEsUUFBUCxDQUFPLHVFQUFILENBQUc7O0FBQUE7O0FBQ2hELFNBQUssTUFBTCxHQUFjLE1BQWQ7O0FBRUEsU0FBSyxLQUFMLEdBQWEsS0FBYjtBQUNBLFNBQUssTUFBTCxHQUFjLE1BQWQ7QUFDQSxTQUFLLENBQUwsR0FBUyxDQUFUO0FBQ0EsU0FBSyxDQUFMLEdBQVMsQ0FBVDtBQUNEOzs7OzJCQUVPLEcsRUFBSztBQUNYLFVBQUksQ0FBQyxLQUFLLE9BQVYsRUFBbUI7QUFDakIsYUFBSyxPQUFMLEdBQWUsSUFBSSxhQUFKLENBQWtCLEtBQUssTUFBdkIsRUFBK0IsUUFBL0IsQ0FBZjtBQUNEO0FBQ0QsVUFBSSxTQUFKLEdBQWdCLEtBQUssT0FBckI7O0FBRUEsVUFBSSxTQUFKLENBQWMsS0FBSyxDQUFuQixFQUFzQixLQUFLLENBQTNCO0FBQ0EsVUFBSSxRQUFKLENBQWEsQ0FBQyxLQUFLLENBQW5CLEVBQXNCLENBQUMsS0FBSyxDQUE1QixFQUErQixLQUFLLEtBQXBDLEVBQTJDLEtBQUssTUFBaEQ7QUFDQSxVQUFJLFNBQUosQ0FBYyxDQUFDLEtBQUssQ0FBcEIsRUFBdUIsQ0FBQyxLQUFLLENBQTdCO0FBQ0Q7Ozs7OztBQUdJLFNBQVMsVUFBVCxDQUFxQixNQUFyQixFQUE2QixLQUE3QixFQUFvQyxNQUFwQyxFQUE0QyxDQUE1QyxFQUErQyxDQUEvQyxFQUFrRDtBQUN2RCxvQkFBa0IsSUFBSSxVQUFKLENBQWUsTUFBZixFQUF1QixLQUF2QixFQUE4QixNQUE5QixFQUFzQyxDQUF0QyxFQUF5QyxDQUF6QyxDQUFsQjtBQUNBLFNBQU8sZUFBUDtBQUNEOzs7Ozs7OztRQzl3Q2UsUSxHQUFBLFE7UUFnQ0EsVyxHQUFBLFc7O0FBbENoQjs7Ozs7O0FBRU8sU0FBUyxRQUFULENBQW1CLE9BQW5CLEVBQTRCO0FBQ2pDLE1BQUksTUFBTSxFQUFWO0FBQ0EsTUFBSSxJQUFKLEdBQVcsT0FBWDtBQUNBLE1BQUksTUFBSixHQUFhLEtBQWI7QUFDQSxNQUFJLElBQUosR0FBVyxJQUFYO0FBQ0EsTUFBSSxLQUFKLEdBQVksU0FBWjtBQUNBLE1BQUksT0FBSixHQUFjLFNBQWQ7O0FBRUEsTUFBSSxXQUFKLEdBQWtCLFVBQVUsS0FBVixFQUFpQjtBQUNqQyxRQUFJLE1BQU0sT0FBTixLQUFrQixJQUFJLElBQTFCLEVBQWdDO0FBQzlCLFVBQUksSUFBSSxJQUFKLElBQVksSUFBSSxLQUFwQixFQUEyQixJQUFJLEtBQUo7QUFDM0IsVUFBSSxNQUFKLEdBQWEsSUFBYjtBQUNBLFVBQUksSUFBSixHQUFXLEtBQVg7QUFDRDtBQUNELFVBQU0sY0FBTjtBQUNELEdBUEQ7O0FBU0EsTUFBSSxTQUFKLEdBQWdCLFVBQVUsS0FBVixFQUFpQjtBQUMvQixRQUFJLE1BQU0sT0FBTixLQUFrQixJQUFJLElBQTFCLEVBQWdDO0FBQzlCLFVBQUksSUFBSSxNQUFKLElBQWMsSUFBSSxPQUF0QixFQUErQixJQUFJLE9BQUo7QUFDL0IsVUFBSSxNQUFKLEdBQWEsS0FBYjtBQUNBLFVBQUksSUFBSixHQUFXLElBQVg7QUFDRDtBQUNELFVBQU0sY0FBTjtBQUNELEdBUEQ7O0FBU0EsU0FBTyxnQkFBUCxDQUF3QixTQUF4QixFQUFtQyxJQUFJLFdBQUosQ0FBZ0IsSUFBaEIsQ0FBcUIsR0FBckIsQ0FBbkMsRUFBOEQsS0FBOUQ7QUFDQSxTQUFPLGdCQUFQLENBQXdCLE9BQXhCLEVBQWlDLElBQUksU0FBSixDQUFjLElBQWQsQ0FBbUIsR0FBbkIsQ0FBakMsRUFBMEQsS0FBMUQ7O0FBRUEsU0FBTyxHQUFQO0FBQ0Q7O0FBRU0sU0FBUyxXQUFULENBQXNCLE9BQXRCLEVBQTBDO0FBQUEsTUFBWCxLQUFXLHVFQUFILENBQUc7O0FBQy9DLE1BQUksVUFBVTtBQUNaLGFBQVMsT0FERztBQUVaLFdBQU8sS0FGSzs7QUFJWixRQUFJLENBSlE7QUFLWixRQUFJLENBTFE7O0FBT1osUUFBSSxDQUFKLEdBQVM7QUFDUCxhQUFPLEtBQUssRUFBTCxHQUFVLEtBQUssS0FBdEI7QUFDRCxLQVRXO0FBVVosUUFBSSxDQUFKLEdBQVM7QUFDUCxhQUFPLEtBQUssRUFBTCxHQUFVLEtBQUssS0FBdEI7QUFDRCxLQVpXOztBQWNaLFFBQUksT0FBSixHQUFlO0FBQ2IsYUFBTyxLQUFLLENBQVo7QUFDRCxLQWhCVztBQWlCWixRQUFJLE9BQUosR0FBZTtBQUNiLGFBQU8sS0FBSyxDQUFaO0FBQ0QsS0FuQlc7O0FBcUJaLFFBQUksUUFBSixHQUFnQjtBQUNkLGFBQU8sRUFBQyxHQUFHLEtBQUssQ0FBVCxFQUFZLEdBQUcsS0FBSyxDQUFwQixFQUFQO0FBQ0QsS0F2Qlc7O0FBeUJaLFlBQVEsS0F6Qkk7QUEwQlosVUFBTSxJQTFCTTtBQTJCWixZQUFRLEtBM0JJOztBQTZCWixjQUFVLENBN0JFO0FBOEJaLGlCQUFhLENBOUJEOztBQWdDWixXQUFPLFNBaENLO0FBaUNaLGFBQVMsU0FqQ0c7QUFrQ1osU0FBSyxTQWxDTzs7QUFvQ1osZ0JBQVksSUFwQ0E7QUFxQ1osaUJBQWEsQ0FyQ0Q7QUFzQ1osaUJBQWEsQ0F0Q0Q7O0FBd0NaLGVBeENZLHVCQXdDQyxLQXhDRCxFQXdDUTtBQUNsQixVQUFJLFVBQVUsTUFBTSxNQUFwQjs7QUFFQSxXQUFLLEVBQUwsR0FBVyxNQUFNLEtBQU4sR0FBYyxRQUFRLFVBQWpDO0FBQ0EsV0FBSyxFQUFMLEdBQVcsTUFBTSxLQUFOLEdBQWMsUUFBUSxTQUFqQzs7QUFFQSxZQUFNLGNBQU47QUFDRCxLQS9DVztBQWlEWixvQkFqRFksNEJBaURNLEtBakROLEVBaURhO0FBQ3ZCLFVBQUksVUFBVSxNQUFNLE1BQXBCOztBQUVBLFdBQUssRUFBTCxHQUFXLE1BQU0sYUFBTixDQUFvQixDQUFwQixFQUF1QixLQUF2QixHQUErQixRQUFRLFVBQWxEO0FBQ0EsV0FBSyxFQUFMLEdBQVcsTUFBTSxhQUFOLENBQW9CLENBQXBCLEVBQXVCLEtBQXZCLEdBQStCLFFBQVEsU0FBbEQ7O0FBRUEsWUFBTSxjQUFOO0FBQ0QsS0F4RFc7QUEwRFosZUExRFksdUJBMERDLEtBMURELEVBMERRO0FBQ2xCLFdBQUssTUFBTCxHQUFjLElBQWQ7QUFDQSxXQUFLLElBQUwsR0FBWSxLQUFaO0FBQ0EsV0FBSyxNQUFMLEdBQWMsS0FBZDs7QUFFQSxXQUFLLFFBQUwsR0FBZ0IsS0FBSyxHQUFMLEVBQWhCOztBQUVBLFVBQUksS0FBSyxLQUFULEVBQWdCLEtBQUssS0FBTDtBQUNoQixZQUFNLGNBQU47QUFDRCxLQW5FVztBQXFFWixxQkFyRVksNkJBcUVPLEtBckVQLEVBcUVjO0FBQ3hCLFVBQUksVUFBVSxNQUFNLE1BQXBCOztBQUVBLFdBQUssRUFBTCxHQUFVLE1BQU0sYUFBTixDQUFvQixDQUFwQixFQUF1QixLQUF2QixHQUErQixRQUFRLFVBQWpEO0FBQ0EsV0FBSyxFQUFMLEdBQVUsTUFBTSxhQUFOLENBQW9CLENBQXBCLEVBQXVCLEtBQXZCLEdBQStCLFFBQVEsU0FBakQ7O0FBRUEsV0FBSyxNQUFMLEdBQWMsSUFBZDtBQUNBLFdBQUssSUFBTCxHQUFZLEtBQVo7QUFDQSxXQUFLLE1BQUwsR0FBYyxLQUFkOztBQUVBLFdBQUssUUFBTCxHQUFnQixLQUFLLEdBQUwsRUFBaEI7O0FBRUEsVUFBSSxLQUFLLEtBQVQsRUFBZ0IsS0FBSyxLQUFMO0FBQ2hCLFlBQU0sY0FBTjtBQUNELEtBbkZXO0FBcUZaLGFBckZZLHFCQXFGRCxLQXJGQyxFQXFGTTtBQUNoQixXQUFLLFdBQUwsR0FBbUIsS0FBSyxHQUFMLENBQVMsS0FBSyxRQUFMLEdBQWdCLEtBQUssR0FBTCxFQUF6QixDQUFuQjtBQUNBLFVBQUksS0FBSyxXQUFMLElBQW9CLEdBQXBCLElBQTJCLEtBQUssTUFBTCxLQUFnQixLQUEvQyxFQUFzRDtBQUNwRCxhQUFLLE1BQUwsR0FBYyxJQUFkO0FBQ0EsWUFBSSxLQUFLLEdBQVQsRUFBYyxLQUFLLEdBQUw7QUFDZjs7QUFFRCxXQUFLLElBQUwsR0FBWSxJQUFaO0FBQ0EsV0FBSyxNQUFMLEdBQWMsS0FBZDs7QUFFQSxVQUFJLEtBQUssT0FBVCxFQUFrQixLQUFLLE9BQUw7QUFDbEIsWUFBTSxjQUFOO0FBQ0QsS0FqR1c7QUFtR1osbUJBbkdZLDJCQW1HSyxLQW5HTCxFQW1HWTtBQUN0QixXQUFLLFdBQUwsR0FBbUIsS0FBSyxHQUFMLENBQVMsS0FBSyxRQUFMLEdBQWdCLEtBQUssR0FBTCxFQUF6QixDQUFuQjs7QUFFQSxVQUFJLEtBQUssV0FBTCxJQUFvQixHQUFwQixJQUEyQixLQUFLLE1BQUwsS0FBZ0IsS0FBL0MsRUFBc0Q7QUFDcEQsYUFBSyxNQUFMLEdBQWMsSUFBZDtBQUNBLFlBQUksS0FBSyxHQUFULEVBQWMsS0FBSyxHQUFMO0FBQ2Y7O0FBRUQsV0FBSyxJQUFMLEdBQVksSUFBWjtBQUNBLFdBQUssTUFBTCxHQUFjLEtBQWQ7O0FBRUEsVUFBSSxLQUFLLE9BQVQsRUFBa0IsS0FBSyxPQUFMO0FBQ2xCLFlBQU0sY0FBTjtBQUNELEtBaEhXO0FBa0haLGlCQWxIWSx5QkFrSEcsTUFsSEgsRUFrSFc7QUFDckIsVUFBSSxNQUFNLEtBQVY7O0FBRUEsVUFBSSxDQUFDLE9BQU8sUUFBWixFQUFzQjtBQUNwQixZQUFJLE9BQU8sT0FBTyxFQUFsQjtBQUNBLFlBQUksUUFBUSxPQUFPLEVBQVAsR0FBWSxPQUFPLEtBQS9CO0FBQ0EsWUFBSSxNQUFNLE9BQU8sRUFBakI7QUFDQSxZQUFJLFNBQVMsT0FBTyxFQUFQLEdBQVksT0FBTyxNQUFoQzs7QUFFQSxjQUFNLEtBQUssQ0FBTCxHQUFTLElBQVQsSUFBaUIsS0FBSyxDQUFMLEdBQVMsS0FBMUIsSUFDTSxLQUFLLENBQUwsR0FBUyxHQURmLElBQ3NCLEtBQUssQ0FBTCxHQUFTLE1BRHJDO0FBRUQsT0FSRCxNQVFPO0FBQ0wsWUFBSSxLQUFLLEtBQUssQ0FBTCxJQUFVLE9BQU8sRUFBUCxHQUFZLE9BQU8sTUFBN0IsQ0FBVDtBQUNBLFlBQUksS0FBSyxLQUFLLENBQUwsSUFBVSxPQUFPLEVBQVAsR0FBWSxPQUFPLE1BQTdCLENBQVQ7QUFDQSxZQUFJLFdBQVcsS0FBSyxJQUFMLENBQVUsS0FBSyxFQUFMLEdBQVUsS0FBSyxFQUF6QixDQUFmOztBQUVBLGNBQU0sV0FBVyxPQUFPLE1BQXhCO0FBQ0Q7O0FBRUQsYUFBTyxHQUFQO0FBQ0QsS0F0SVc7QUF3SVoscUJBeElZLDZCQXdJTyxNQXhJUCxFQXdJZTtBQUFBOztBQUN6QixVQUFJLEtBQUssTUFBVCxFQUFpQjtBQUNmLFlBQUksS0FBSyxVQUFMLEtBQW9CLElBQXhCLEVBQThCO0FBQzVCLGVBQUssSUFBSSxJQUFJLGtCQUFpQixNQUFqQixHQUEwQixDQUF2QyxFQUEwQyxJQUFJLENBQUMsQ0FBL0MsRUFBa0QsR0FBbEQsRUFBdUQ7QUFDckQsZ0JBQUksVUFBUyxrQkFBaUIsQ0FBakIsQ0FBYjs7QUFFQSxnQkFBSSxLQUFLLGFBQUwsQ0FBbUIsT0FBbkIsS0FBOEIsUUFBTyxTQUF6QyxFQUFvRDtBQUNsRCxtQkFBSyxXQUFMLEdBQW1CLEtBQUssQ0FBTCxHQUFTLFFBQU8sRUFBbkM7QUFDQSxtQkFBSyxXQUFMLEdBQW1CLEtBQUssQ0FBTCxHQUFTLFFBQU8sRUFBbkM7O0FBRUEsbUJBQUssVUFBTCxHQUFrQixPQUFsQjs7QUFFYztBQUNkLGtCQUFJLFdBQVcsUUFBTyxNQUFQLENBQWMsUUFBN0I7QUFDQSx1QkFBUyxNQUFULENBQWdCLFNBQVMsT0FBVCxDQUFpQixPQUFqQixDQUFoQixFQUEwQyxDQUExQztBQUNBLHVCQUFTLElBQVQsQ0FBYyxPQUFkOztBQUVjO0FBQ2QsZ0NBQWlCLE1BQWpCLENBQXdCLGtCQUFpQixPQUFqQixDQUF5QixPQUF6QixDQUF4QixFQUEwRCxDQUExRDtBQUNBLGdDQUFpQixJQUFqQixDQUFzQixPQUF0QjtBQUNEO0FBQ0Y7QUFDRixTQXBCRCxNQW9CTztBQUNMLGVBQUssVUFBTCxDQUFnQixDQUFoQixHQUFvQixLQUFLLENBQUwsR0FBUyxLQUFLLFdBQWxDO0FBQ0EsZUFBSyxVQUFMLENBQWdCLENBQWhCLEdBQW9CLEtBQUssQ0FBTCxHQUFTLEtBQUssV0FBbEM7QUFDRDtBQUNGOztBQUVELFVBQUksS0FBSyxJQUFULEVBQWU7QUFDYixhQUFLLFVBQUwsR0FBa0IsSUFBbEI7QUFDRDs7QUFFSztBQUNOLHdCQUFpQixJQUFqQixDQUFzQixrQkFBVTtBQUM5QixZQUFJLE1BQUssYUFBTCxDQUFtQixNQUFuQixLQUE4QixPQUFPLFNBQXpDLEVBQW9EO0FBQ2xELGdCQUFLLE9BQUwsQ0FBYSxLQUFiLENBQW1CLE1BQW5CLEdBQTRCLFNBQTVCO0FBQ0EsaUJBQU8sSUFBUDtBQUNELFNBSEQsTUFHTztBQUNMLGdCQUFLLE9BQUwsQ0FBYSxLQUFiLENBQW1CLE1BQW5CLEdBQTRCLE1BQTVCO0FBQ0EsaUJBQU8sS0FBUDtBQUNEO0FBQ0YsT0FSRDtBQVNEO0FBbExXLEdBQWQ7O0FBcUxBLFVBQVEsZ0JBQVIsQ0FDTSxXQUROLEVBQ21CLFFBQVEsV0FBUixDQUFvQixJQUFwQixDQUF5QixPQUF6QixDQURuQixFQUNzRCxLQUR0RDs7QUFJQSxVQUFRLGdCQUFSLENBQ00sV0FETixFQUNtQixRQUFRLFdBQVIsQ0FBb0IsSUFBcEIsQ0FBeUIsT0FBekIsQ0FEbkIsRUFDc0QsS0FEdEQ7O0FBSUEsVUFBUSxnQkFBUixDQUNNLFNBRE4sRUFDaUIsUUFBUSxTQUFSLENBQWtCLElBQWxCLENBQXVCLE9BQXZCLENBRGpCLEVBQ2tELEtBRGxEOztBQUlBLFVBQVEsZ0JBQVIsQ0FDTSxXQUROLEVBQ21CLFFBQVEsZ0JBQVIsQ0FBeUIsSUFBekIsQ0FBOEIsT0FBOUIsQ0FEbkIsRUFDMkQsS0FEM0Q7O0FBSUEsVUFBUSxnQkFBUixDQUNNLFlBRE4sRUFDb0IsUUFBUSxpQkFBUixDQUEwQixJQUExQixDQUErQixPQUEvQixDQURwQixFQUM2RCxLQUQ3RDs7QUFJQSxVQUFRLGdCQUFSLENBQ00sVUFETixFQUNrQixRQUFRLGVBQVIsQ0FBd0IsSUFBeEIsQ0FBNkIsT0FBN0IsQ0FEbEIsRUFDeUQsS0FEekQ7O0FBSUEsVUFBUSxLQUFSLENBQWMsV0FBZCxHQUE0QixNQUE1Qjs7QUFFQSxTQUFPLE9BQVA7QUFDRDs7Ozs7Ozs7Ozs7UUN0SWUsUyxHQUFBLFM7Ozs7QUE3R2hCLElBQUksT0FBTyxJQUFJLFlBQUosRUFBWDs7SUFFTSxLO0FBQ0osaUJBQWEsTUFBYixFQUFxQixXQUFyQixFQUFrQztBQUFBOztBQUNoQyxTQUFLLE1BQUwsR0FBYyxNQUFkO0FBQ0EsU0FBSyxXQUFMLEdBQW1CLFdBQW5COztBQUVBLFNBQUssSUFBTCxHQUFZLElBQVo7QUFDQSxTQUFLLFVBQUwsR0FBa0IsS0FBSyxJQUFMLENBQVUsVUFBVixFQUFsQjtBQUNBLFNBQUssT0FBTCxHQUFlLEtBQUssSUFBTCxDQUFVLGtCQUFWLEVBQWY7QUFDQSxTQUFLLFNBQUwsR0FBaUIsSUFBakI7QUFDQSxTQUFLLE1BQUwsR0FBYyxJQUFkO0FBQ0EsU0FBSyxJQUFMLEdBQVksS0FBWjtBQUNBLFNBQUssT0FBTCxHQUFlLEtBQWY7O0FBRUEsU0FBSyxRQUFMLEdBQWdCLENBQWhCO0FBQ0EsU0FBSyxXQUFMLEdBQW1CLENBQW5COztBQUVBLFNBQUssU0FBTCxHQUFpQixDQUFqQjtBQUNBLFNBQUssV0FBTCxHQUFtQixDQUFuQjs7QUFFQSxTQUFLLElBQUw7QUFDRDs7OzsyQkFFTztBQUFBOztBQUNOLFVBQUksTUFBTSxJQUFJLGNBQUosRUFBVjtBQUNBLFVBQUksSUFBSixDQUFTLEtBQVQsRUFBZ0IsS0FBSyxNQUFyQixFQUE2QixJQUE3QjtBQUNBLFVBQUksWUFBSixHQUFtQixhQUFuQjtBQUNBLFVBQUksZ0JBQUosQ0FBcUIsTUFBckIsRUFBNkIsWUFBTTtBQUNqQyxjQUFLLElBQUwsQ0FBVSxlQUFWLENBQ1UsSUFBSSxRQURkLEVBRVUsa0JBQVU7QUFDUixnQkFBSyxNQUFMLEdBQWMsTUFBZDtBQUNBLGdCQUFLLFNBQUwsR0FBaUIsSUFBakI7O0FBRUEsY0FBSSxNQUFLLFdBQVQsRUFBc0I7QUFDcEIsa0JBQUssV0FBTDtBQUNEO0FBQ0YsU0FUWCxFQVVVLGlCQUFTO0FBQ1AsZ0JBQU0sSUFBSSxLQUFKLENBQVUsaUNBQWlDLEtBQTNDLENBQU47QUFDRCxTQVpYO0FBY0QsT0FmRDs7QUFpQkEsVUFBSSxJQUFKO0FBQ0Q7OzsyQkFFTztBQUNOLFdBQUssU0FBTCxHQUFpQixLQUFLLElBQUwsQ0FBVSxXQUEzQjtBQUNBLFdBQUssU0FBTCxHQUFpQixLQUFLLElBQUwsQ0FBVSxrQkFBVixFQUFqQjs7QUFFQSxXQUFLLFNBQUwsQ0FBZSxNQUFmLEdBQXdCLEtBQUssTUFBN0I7O0FBRUEsV0FBSyxTQUFMLENBQWUsT0FBZixDQUF1QixLQUFLLFVBQTVCO0FBQ0EsV0FBSyxVQUFMLENBQWdCLE9BQWhCLENBQXdCLEtBQUssT0FBN0I7QUFDQSxXQUFLLE9BQUwsQ0FBYSxPQUFiLENBQXFCLEtBQUssSUFBTCxDQUFVLFdBQS9COztBQUVBLFdBQUssU0FBTCxDQUFlLElBQWYsR0FBc0IsS0FBSyxJQUEzQjs7QUFFQSxXQUFLLFNBQUwsQ0FBZSxLQUFmLENBQ1EsS0FBSyxTQURiLEVBRVEsS0FBSyxXQUFMLEdBQW1CLEtBQUssTUFBTCxDQUFZLFFBRnZDOztBQUtBLFdBQUssT0FBTCxHQUFlLElBQWY7QUFDRDs7OzRCQUVRO0FBQ1AsVUFBSSxLQUFLLE9BQVQsRUFBa0I7QUFDaEIsYUFBSyxTQUFMLENBQWUsSUFBZixDQUFvQixLQUFLLElBQUwsQ0FBVSxXQUE5QjtBQUNBLGFBQUssV0FBTCxJQUFvQixLQUFLLElBQUwsQ0FBVSxXQUFWLEdBQXdCLEtBQUssU0FBakQ7QUFDQSxhQUFLLE9BQUwsR0FBZSxLQUFmO0FBQ0Q7QUFDRjs7OzhCQUVVO0FBQ1QsVUFBSSxLQUFLLE9BQVQsRUFBa0I7QUFDaEIsYUFBSyxTQUFMLENBQWUsSUFBZixDQUFvQixLQUFLLElBQUwsQ0FBVSxXQUE5QjtBQUNEO0FBQ0QsV0FBSyxXQUFMLEdBQW1CLENBQW5CO0FBQ0EsV0FBSyxJQUFMO0FBQ0Q7Ozs2QkFFUyxLLEVBQU87QUFDZixVQUFJLEtBQUssT0FBVCxFQUFrQjtBQUNoQixhQUFLLFNBQUwsQ0FBZSxJQUFmLENBQW9CLEtBQUssSUFBTCxDQUFVLFdBQTlCO0FBQ0Q7QUFDRCxXQUFLLFdBQUwsR0FBbUIsS0FBbkI7QUFDQSxXQUFLLElBQUw7QUFDRDs7O3dCQUVhO0FBQ1osYUFBTyxLQUFLLFdBQVo7QUFDRCxLO3NCQUNXLEssRUFBTztBQUNqQixXQUFLLFVBQUwsQ0FBZ0IsSUFBaEIsQ0FBcUIsS0FBckIsR0FBNkIsS0FBN0I7QUFDQSxXQUFLLFdBQUwsR0FBbUIsS0FBbkI7QUFDRDs7O3dCQUVVO0FBQ1QsYUFBTyxLQUFLLFFBQVo7QUFDRCxLO3NCQUNRLEssRUFBTztBQUNkLFdBQUssT0FBTCxDQUFhLEdBQWIsQ0FBaUIsS0FBakIsR0FBeUIsS0FBekI7QUFDQSxXQUFLLFFBQUwsR0FBZ0IsS0FBaEI7QUFDRDs7Ozs7O0FBR0ksU0FBUyxTQUFULENBQW9CLE1BQXBCLEVBQTRCLFdBQTVCLEVBQXlDO0FBQzlDLFNBQU8sSUFBSSxLQUFKLENBQVUsTUFBVixFQUFrQixXQUFsQixDQUFQO0FBQ0Q7Ozs7Ozs7OztRQ1FlLE8sR0FBQSxPO1FBNkNBLGEsR0FBQSxhO1FBMEJBLEksR0FBQSxJO1FBa0JBLHdCLEdBQUEsd0I7UUFpQkEsUSxHQUFBLFE7UUFPQSxVLEdBQUEsVTtRQVVBLGMsR0FBQSxjO1FBVUEsSyxHQUFBLEs7UUFPQSxZLEdBQUEsWTtRQVNBLFcsR0FBQSxXOztBQTVRaEI7O0FBRU8sSUFBSSwwQkFBUztBQUNsQixVQUFRLENBRFU7QUFFbEIsVUFBUSxDQUZVOztBQUlsQixtQkFBaUIsQ0FBQyxLQUFELEVBQVEsS0FBUixFQUFlLEtBQWYsQ0FKQztBQUtsQixrQkFBZ0IsQ0FBQyxLQUFELEVBQVEsS0FBUixFQUFlLEtBQWYsRUFBc0IsTUFBdEIsQ0FMRTtBQU1sQixrQkFBZ0IsQ0FBQyxNQUFELENBTkU7QUFPbEIsbUJBQWlCLENBQUMsS0FBRCxFQUFRLEtBQVIsRUFBZSxLQUFmLEVBQXNCLE1BQXRCLENBUEM7O0FBU2hCO0FBQ0YsTUFWa0IsZ0JBVVosT0FWWSxFQVVIO0FBQUE7O0FBQ2IsV0FBTyxJQUFJLE9BQUosQ0FBWSxtQkFBVztBQUM1QixVQUFJLGNBQWMsU0FBZCxXQUFjLEdBQU07QUFDdEIsY0FBSyxNQUFMLElBQWUsQ0FBZjtBQUNBLGdCQUFRLEdBQVIsQ0FBWSxNQUFLLE1BQWpCOztBQUVBLFlBQUksTUFBSyxNQUFMLEtBQWdCLE1BQUssTUFBekIsRUFBaUM7QUFDL0IsZ0JBQUssTUFBTCxHQUFjLENBQWQ7QUFDQSxnQkFBSyxNQUFMLEdBQWMsQ0FBZDtBQUNBLGtCQUFRLEdBQVIsQ0FBWSxnQkFBWjs7QUFFQTtBQUNEO0FBQ0YsT0FYRDs7QUFhQSxjQUFRLEdBQVIsQ0FBWSxtQkFBWjs7QUFFQSxZQUFLLE1BQUwsR0FBYyxRQUFRLE1BQXRCOztBQUVBLGNBQVEsT0FBUixDQUFnQixrQkFBVTtBQUN4QixZQUFJLFlBQVksT0FBTyxLQUFQLENBQWEsR0FBYixFQUFrQixHQUFsQixFQUFoQjs7QUFFQSxZQUFJLE1BQUssZUFBTCxDQUFxQixPQUFyQixDQUE2QixTQUE3QixNQUE0QyxDQUFDLENBQWpELEVBQW9EO0FBQ2xELGdCQUFLLFNBQUwsQ0FBZSxNQUFmLEVBQXVCLFdBQXZCO0FBQ0QsU0FGRCxNQUVPLElBQUksTUFBSyxjQUFMLENBQW9CLE9BQXBCLENBQTRCLFNBQTVCLE1BQTJDLENBQUMsQ0FBaEQsRUFBbUQ7QUFDeEQsZ0JBQUssUUFBTCxDQUFjLE1BQWQsRUFBc0IsV0FBdEI7QUFDRCxTQUZNLE1BRUEsSUFBSSxNQUFLLGNBQUwsQ0FBb0IsT0FBcEIsQ0FBNEIsU0FBNUIsTUFBMkMsQ0FBQyxDQUFoRCxFQUFtRDtBQUN4RCxnQkFBSyxRQUFMLENBQWMsTUFBZCxFQUFzQixXQUF0QjtBQUNELFNBRk0sTUFFQSxJQUFJLE1BQUssZUFBTCxDQUFxQixPQUFyQixDQUE2QixTQUE3QixNQUE0QyxDQUFDLENBQWpELEVBQW9EO0FBQ3pELGdCQUFLLFNBQUwsQ0FBZSxNQUFmLEVBQXVCLFdBQXZCO0FBQ0QsU0FGTSxNQUVBO0FBQ0wsa0JBQVEsR0FBUixDQUFZLCtCQUErQixNQUEzQztBQUNEO0FBQ0YsT0FkRDtBQWVELEtBakNNLENBQVA7QUFrQ0QsR0E3Q2lCO0FBK0NsQixXQS9Da0IscUJBK0NQLE1BL0NPLEVBK0NDLFdBL0NELEVBK0NjO0FBQzlCLFFBQUksUUFBUSxJQUFJLEtBQUosRUFBWjtBQUNBLFVBQU0sZ0JBQU4sQ0FBdUIsTUFBdkIsRUFBK0IsV0FBL0IsRUFBNEMsS0FBNUM7QUFDQSxTQUFLLE1BQUwsSUFBZSxLQUFmO0FBQ0EsVUFBTSxHQUFOLEdBQVksTUFBWjtBQUNELEdBcERpQjtBQXNEbEIsVUF0RGtCLG9CQXNEUixNQXREUSxFQXNEQSxXQXREQSxFQXNEYTtBQUM3QixRQUFJLGFBQWEsT0FBTyxLQUFQLENBQWEsR0FBYixFQUFrQixHQUFsQixHQUF3QixLQUF4QixDQUE4QixHQUE5QixFQUFtQyxDQUFuQyxDQUFqQjs7QUFFQSxRQUFJLFdBQVcsU0FBUyxhQUFULENBQXVCLE9BQXZCLENBQWY7QUFDQSxRQUFJLFdBQ1EsK0JBQStCLFVBQS9CLEdBQTRDLGVBQTVDLEdBQThELE1BQTlELEdBQXVFLE1BRG5GOztBQUdBLGFBQVMsV0FBVCxDQUFxQixTQUFTLGNBQVQsQ0FBd0IsUUFBeEIsQ0FBckI7QUFDQSxhQUFTLElBQVQsQ0FBYyxXQUFkLENBQTBCLFFBQTFCOztBQUVBO0FBQ0QsR0FqRWlCO0FBbUVsQixVQW5Fa0Isb0JBbUVSLE1BbkVRLEVBbUVBLFdBbkVBLEVBbUVhO0FBQUE7O0FBQzdCLFFBQUksTUFBTSxJQUFJLGNBQUosRUFBVjtBQUNBLFFBQUksSUFBSixDQUFTLEtBQVQsRUFBZ0IsTUFBaEIsRUFBd0IsSUFBeEI7QUFDQSxRQUFJLFlBQUosR0FBbUIsTUFBbkI7O0FBRUEsUUFBSSxNQUFKLEdBQWEsaUJBQVM7QUFDcEIsVUFBSSxJQUFJLE1BQUosS0FBZSxHQUFuQixFQUF3QjtBQUN0QixZQUFJLE9BQU8sS0FBSyxLQUFMLENBQVcsSUFBSSxZQUFmLENBQVg7QUFDQSxhQUFLLElBQUwsR0FBWSxNQUFaO0FBQ0EsZUFBSyxLQUFLLElBQVYsSUFBa0IsSUFBbEI7O0FBRUEsWUFBSSxLQUFLLE9BQVQsRUFBa0I7QUFDaEIsaUJBQUssaUJBQUwsQ0FBdUIsSUFBdkIsRUFBNkIsTUFBN0IsRUFBcUMsV0FBckM7QUFDRCxTQUZELE1BRU87QUFDTDtBQUNEO0FBQ0Y7QUFDRixLQVpEOztBQWNBLFFBQUksSUFBSjtBQUNELEdBdkZpQjtBQXlGbEIsbUJBekZrQiw2QkF5RkMsSUF6RkQsRUF5Rk8sTUF6RlAsRUF5RmUsV0F6RmYsRUF5RjRCO0FBQUE7O0FBQzVDLFFBQUksVUFBVSxPQUFPLE9BQVAsQ0FBZSxRQUFmLEVBQXlCLEVBQXpCLENBQWQ7QUFDQSxRQUFJLGNBQWMsVUFBVSxLQUFLLFNBQWpDOztBQUVBLFFBQUksbUJBQW1CLFNBQW5CLGdCQUFtQixHQUFNO0FBQzNCLGFBQUssV0FBTCxJQUFvQixLQUFwQjs7QUFFQSxhQUFPLElBQVAsQ0FBWSxLQUFLLE9BQWpCLEVBQTBCLE9BQTFCLENBQWtDLGtCQUFVO0FBQzFDLGVBQUssTUFBTCxJQUFlLEtBQUssT0FBTCxDQUFhLE1BQWIsQ0FBZjtBQUNBLGVBQUssTUFBTCxFQUFhLE1BQWIsR0FBc0IsS0FBdEI7QUFDRCxPQUhEOztBQUtBO0FBQ0QsS0FURDs7QUFXQSxRQUFJLFFBQVEsSUFBSSxLQUFKLEVBQVo7QUFDQSxVQUFNLGdCQUFOLENBQXVCLE1BQXZCLEVBQStCLGdCQUEvQixFQUFpRCxLQUFqRDtBQUNBLFVBQU0sR0FBTixHQUFZLFdBQVo7QUFDRCxHQTNHaUI7QUE2R2xCLFdBN0drQixxQkE2R1AsTUE3R08sRUE2R0MsV0E3R0QsRUE2R2M7QUFDOUIsUUFBSSxRQUFRLHNCQUFVLE1BQVYsRUFBa0IsV0FBbEIsQ0FBWjs7QUFFQSxVQUFNLElBQU4sR0FBYSxNQUFiO0FBQ0EsU0FBSyxNQUFNLElBQVgsSUFBbUIsS0FBbkI7QUFDRDtBQWxIaUIsQ0FBYjs7QUFxSEEsU0FBUyxPQUFULENBQWtCLE1BQWxCLEVBQTBCLE1BQTFCLEVBQXFFO0FBQUEsTUFBbkMsTUFBbUMsdUVBQTFCLEtBQTBCO0FBQUEsTUFBbkIsS0FBbUIsdUVBQVgsU0FBVzs7QUFDMUUsTUFBSSxJQUFJLE9BQU8sQ0FBZjtBQUNBLE1BQUksSUFBSSxPQUFPLENBQWY7QUFDQSxNQUFJLFFBQVEsT0FBTyxLQUFuQjtBQUNBLE1BQUksU0FBUyxPQUFPLE1BQXBCOztBQUVBLE1BQUksa0JBQUo7O0FBRUEsTUFBSSxPQUFPLENBQVAsR0FBVyxDQUFmLEVBQWtCO0FBQ2hCLFFBQUksTUFBSixFQUFZLE9BQU8sRUFBUCxJQUFhLENBQUMsQ0FBZDtBQUNaLFFBQUksT0FBTyxJQUFYLEVBQWlCLE9BQU8sRUFBUCxJQUFhLE9BQU8sSUFBcEI7O0FBRWpCLFdBQU8sQ0FBUCxHQUFXLENBQVg7QUFDQSxnQkFBWSxNQUFaO0FBQ0Q7O0FBRUQsTUFBSSxPQUFPLENBQVAsR0FBVyxDQUFmLEVBQWtCO0FBQ2hCLFFBQUksTUFBSixFQUFZLE9BQU8sRUFBUCxJQUFhLENBQUMsQ0FBZDtBQUNaLFFBQUksT0FBTyxJQUFYLEVBQWlCLE9BQU8sRUFBUCxJQUFhLE9BQU8sSUFBcEI7O0FBRWpCLFdBQU8sQ0FBUCxHQUFXLENBQVg7QUFDQSxnQkFBWSxLQUFaO0FBQ0Q7O0FBRUQsTUFBSSxPQUFPLENBQVAsR0FBVyxPQUFPLEtBQWxCLEdBQTBCLEtBQTlCLEVBQXFDO0FBQ25DLFFBQUksTUFBSixFQUFZLE9BQU8sRUFBUCxJQUFhLENBQUMsQ0FBZDtBQUNaLFFBQUksT0FBTyxJQUFYLEVBQWlCLE9BQU8sRUFBUCxJQUFhLE9BQU8sSUFBcEI7O0FBRWpCLFdBQU8sQ0FBUCxHQUFXLFFBQVEsT0FBTyxLQUExQjtBQUNBLGdCQUFZLE9BQVo7QUFDRDs7QUFFRCxNQUFJLE9BQU8sQ0FBUCxHQUFXLE9BQU8sTUFBbEIsR0FBMkIsTUFBL0IsRUFBdUM7QUFDckMsUUFBSSxNQUFKLEVBQVksT0FBTyxFQUFQLElBQWEsQ0FBQyxDQUFkO0FBQ1osUUFBSSxPQUFPLElBQVgsRUFBaUIsT0FBTyxFQUFQLElBQWEsT0FBTyxJQUFwQjs7QUFFakIsV0FBTyxDQUFQLEdBQVcsU0FBUyxPQUFPLE1BQTNCO0FBQ0EsZ0JBQVksUUFBWjtBQUNEOztBQUVELE1BQUksYUFBYSxLQUFqQixFQUF3QixNQUFNLFNBQU47O0FBRXhCLFNBQU8sU0FBUDtBQUNEOztBQUVNLFNBQVMsYUFBVCxDQUF3QixNQUF4QixFQUFnQyxNQUFoQyxFQUEyRDtBQUFBLE1BQW5CLEtBQW1CLHVFQUFYLFNBQVc7O0FBQ2hFLE1BQUksSUFBSSxPQUFPLENBQWY7QUFDQSxNQUFJLElBQUksT0FBTyxDQUFmO0FBQ0EsTUFBSSxRQUFRLE9BQU8sS0FBbkI7QUFDQSxNQUFJLFNBQVMsT0FBTyxNQUFwQjs7QUFFQSxNQUFJLGtCQUFKOztBQUVBLE1BQUksT0FBTyxDQUFQLEdBQVcsSUFBSSxPQUFPLEtBQTFCLEVBQWlDO0FBQy9CLGdCQUFZLE1BQVo7QUFDRDtBQUNELE1BQUksT0FBTyxDQUFQLEdBQVcsSUFBSSxPQUFPLE1BQTFCLEVBQWtDO0FBQ2hDLGdCQUFZLEtBQVo7QUFDRDtBQUNELE1BQUksT0FBTyxDQUFQLEdBQVcsS0FBZixFQUFzQjtBQUNwQixnQkFBWSxPQUFaO0FBQ0Q7QUFDRCxNQUFJLE9BQU8sQ0FBUCxHQUFXLE1BQWYsRUFBdUI7QUFDckIsZ0JBQVksUUFBWjtBQUNEOztBQUVELE1BQUksYUFBYSxLQUFqQixFQUF3QixNQUFNLFNBQU47O0FBRXhCLFNBQU8sU0FBUDtBQUNEOztBQUVNLFNBQVMsSUFBVCxDQUFlLE1BQWYsRUFBdUIsTUFBdkIsRUFBK0I7QUFDcEMsTUFBSSxRQUFRLE9BQU8sS0FBbkI7QUFDQSxNQUFJLFNBQVMsT0FBTyxNQUFwQjs7QUFFQSxNQUFJLE9BQU8sQ0FBUCxHQUFXLE9BQU8sS0FBbEIsR0FBMEIsQ0FBOUIsRUFBaUM7QUFDL0IsV0FBTyxDQUFQLEdBQVcsS0FBWDtBQUNEO0FBQ0QsTUFBSSxPQUFPLENBQVAsR0FBVyxPQUFPLE1BQWxCLEdBQTJCLENBQS9CLEVBQWtDO0FBQ2hDLFdBQU8sQ0FBUCxHQUFXLE1BQVg7QUFDRDtBQUNELE1BQUksT0FBTyxDQUFQLEdBQVcsT0FBTyxLQUFsQixHQUEwQixLQUE5QixFQUFxQztBQUNuQyxXQUFPLENBQVAsR0FBVyxDQUFDLE9BQU8sS0FBbkI7QUFDRDtBQUNELE1BQUksT0FBTyxDQUFQLEdBQVcsT0FBTyxNQUFsQixHQUEyQixNQUEvQixFQUF1QztBQUNyQyxXQUFPLENBQVAsR0FBVyxDQUFDLE9BQU8sTUFBbkI7QUFDRDtBQUNGOztBQUVNLFNBQVMsd0JBQVQsQ0FBbUMsS0FBbkMsRUFBMEM7QUFDL0MsUUFBTSxRQUFOLENBQWUsT0FBZixDQUF1QixrQkFBVTtBQUMvQix3QkFBb0IsTUFBcEI7QUFDRCxHQUZEOztBQUlBLFdBQVMsbUJBQVQsQ0FBOEIsTUFBOUIsRUFBc0M7QUFDcEMsV0FBTyxTQUFQLEdBQW1CLE9BQU8sQ0FBMUI7QUFDQSxXQUFPLFNBQVAsR0FBbUIsT0FBTyxDQUExQjs7QUFFQSxRQUFJLE9BQU8sUUFBUCxJQUFtQixPQUFPLFFBQVAsQ0FBZ0IsTUFBaEIsR0FBeUIsQ0FBaEQsRUFBbUQ7QUFDakQsYUFBTyxRQUFQLENBQWdCLE9BQWhCLENBQXdCLGlCQUFTO0FBQy9CLDRCQUFvQixLQUFwQjtBQUNELE9BRkQ7QUFHRDtBQUNGO0FBQ0Y7O0FBRU0sU0FBUyxRQUFULENBQW1CLEVBQW5CLEVBQXVCLEVBQXZCLEVBQTJCO0FBQ2hDLE1BQUksS0FBSyxHQUFHLE9BQUgsR0FBYSxHQUFHLE9BQXpCO0FBQ0EsTUFBSSxLQUFLLEdBQUcsT0FBSCxHQUFhLEdBQUcsT0FBekI7O0FBRUEsU0FBTyxLQUFLLElBQUwsQ0FBVSxLQUFLLEVBQUwsR0FBVSxLQUFLLEVBQXpCLENBQVA7QUFDRDs7QUFFTSxTQUFTLFVBQVQsQ0FBcUIsUUFBckIsRUFBK0IsTUFBL0IsRUFBdUMsS0FBdkMsRUFBOEM7QUFDbkQsTUFBSSxLQUFLLE9BQU8sT0FBUCxHQUFpQixTQUFTLE9BQW5DO0FBQ0EsTUFBSSxLQUFLLE9BQU8sT0FBUCxHQUFpQixTQUFTLE9BQW5DO0FBQ0EsTUFBSSxXQUFXLEtBQUssSUFBTCxDQUFVLEtBQUssRUFBTCxHQUFVLEtBQUssRUFBekIsQ0FBZjtBQUNBLE1BQUksWUFBWSxDQUFoQixFQUFtQjtBQUNqQixhQUFTLENBQVQsSUFBYyxLQUFLLEtBQW5CO0FBQ0EsYUFBUyxDQUFULElBQWMsS0FBSyxLQUFuQjtBQUNEO0FBQ0Y7O0FBRU0sU0FBUyxjQUFULENBQXlCLFFBQXpCLEVBQW1DLE1BQW5DLEVBQTJDLEtBQTNDLEVBQWtEO0FBQ3ZELE1BQUksS0FBSyxPQUFPLE9BQVAsR0FBaUIsU0FBUyxPQUFuQztBQUNBLE1BQUksS0FBSyxPQUFPLE9BQVAsR0FBaUIsU0FBUyxPQUFuQztBQUNBLE1BQUksV0FBVyxLQUFLLElBQUwsQ0FBVSxLQUFLLEVBQUwsR0FBVSxLQUFLLEVBQXpCLENBQWY7QUFDQSxNQUFJLFlBQVksS0FBaEIsRUFBdUI7QUFDckIsYUFBUyxDQUFULElBQWUsS0FBSyxRQUFOLEdBQWtCLEtBQWhDO0FBQ0EsYUFBUyxDQUFULElBQWUsS0FBSyxRQUFOLEdBQWtCLEtBQWhDO0FBQ0Q7QUFDRjs7QUFFTSxTQUFTLEtBQVQsQ0FBZ0IsRUFBaEIsRUFBb0IsRUFBcEIsRUFBd0I7QUFDN0IsU0FBTyxLQUFLLEtBQUwsQ0FDRCxHQUFHLE9BQUgsR0FBYSxHQUFHLE9BRGYsRUFFRCxHQUFHLE9BQUgsR0FBYSxHQUFHLE9BRmYsQ0FBUDtBQUlEOztBQUVNLFNBQVMsWUFBVCxDQUF1QixjQUF2QixFQUF1QyxZQUF2QyxFQUFxRCxRQUFyRCxFQUErRCxLQUEvRCxFQUFzRTtBQUMzRSxpQkFBZSxDQUFmLEdBQW1CLGFBQWEsT0FBYixHQUF1QixlQUFlLE1BQWYsQ0FBc0IsQ0FBN0MsR0FDSSxXQUFXLEtBQUssR0FBTCxDQUFTLEtBQVQsQ0FEZixHQUVHLGVBQWUsU0FGckM7QUFHQSxpQkFBZSxDQUFmLEdBQW1CLGFBQWEsT0FBYixHQUF1QixlQUFlLE1BQWYsQ0FBc0IsQ0FBN0MsR0FDSSxXQUFXLEtBQUssR0FBTCxDQUFTLEtBQVQsQ0FEZixHQUVHLGVBQWUsU0FGckM7QUFHRDs7QUFFTSxTQUFTLFdBQVQsQ0FBc0IsTUFBdEIsRUFBOEIsTUFBOUIsRUFBc0MsU0FBdEMsRUFBaUQsU0FBakQsRUFBNEQsS0FBNUQsRUFBbUU7QUFDeEUsTUFBSSxRQUFRLEVBQVo7O0FBRUEsUUFBTSxDQUFOLEdBQVUsU0FBUyxLQUFLLEdBQUwsQ0FBUyxLQUFULElBQWtCLFNBQXJDO0FBQ0EsUUFBTSxDQUFOLEdBQVUsU0FBUyxLQUFLLEdBQUwsQ0FBUyxLQUFULElBQWtCLFNBQXJDOztBQUVBLFNBQU8sS0FBUDtBQUNEOztBQUVEO0FBQ08sSUFBSSxnQ0FBWSxTQUFaLFNBQVksQ0FBQyxHQUFELEVBQU0sR0FBTixFQUFjO0FBQ25DLFNBQU8sS0FBSyxLQUFMLENBQVcsS0FBSyxNQUFMLE1BQWlCLE1BQU0sR0FBTixHQUFZLENBQTdCLENBQVgsSUFBOEMsR0FBckQ7QUFDRCxDQUZNOztBQUlBLElBQUksb0NBQWMsU0FBZCxXQUFjLENBQUMsR0FBRCxFQUFNLEdBQU4sRUFBYztBQUNyQyxTQUFPLE1BQU0sS0FBSyxNQUFMLE1BQWlCLE1BQU0sR0FBdkIsQ0FBYjtBQUNELENBRk07Ozs7O0FDMVJQOztBQUNBOztBQUNBOztBQUNBOztBQUVBLGtCQUFPLElBQVAsQ0FBWSxDQUNWLG9CQURVLEVBRVYsaUNBRlUsRUFHVix1QkFIVSxFQUlWLG9CQUpVLENBQVosRUFLRyxJQUxILENBS1E7QUFBQSxTQUFNLE9BQU47QUFBQSxDQUxSOztBQU9BO0FBQ0EsSUFBSSxlQUFKO0FBQUEsSUFBWSxhQUFaO0FBQUEsSUFBa0IsZ0JBQWxCO0FBQUEsSUFBMkIsaUJBQTNCO0FBQUEsSUFBcUMsV0FBckM7QUFDQSxJQUFJLFVBQVUsRUFBZDtBQUNBLElBQUksWUFBWSxFQUFoQjs7QUFFQSxJQUFJLFFBQVEsQ0FBWjs7QUFFQSxTQUFTLEtBQVQsQ0FDWSxPQURaLEVBQ3FCLEtBRHJCLEVBQzRCLGdCQUQ1QixFQUVZLFdBRlosRUFFeUIsWUFGekIsRUFFdUMsWUFGdkMsRUFFcUQ7QUFDbkQsTUFBSSxTQUFTLGNBQWI7O0FBRUEsU0FBTyxDQUFQLEdBQVcsUUFBUSxPQUFSLEdBQWtCLE9BQU8sU0FBekIsR0FBc0MsbUJBQW1CLEtBQUssR0FBTCxDQUFTLEtBQVQsQ0FBcEU7QUFDQSxTQUFPLENBQVAsR0FBVyxRQUFRLE9BQVIsR0FBa0IsT0FBTyxVQUF6QixHQUF1QyxtQkFBbUIsS0FBSyxHQUFMLENBQVMsS0FBVCxDQUFyRTs7QUFFQSxTQUFPLEVBQVAsR0FBWSxLQUFLLEdBQUwsQ0FBUyxLQUFULElBQWtCLFdBQTlCO0FBQ0EsU0FBTyxFQUFQLEdBQVksQ0FBQyxLQUFLLEdBQUwsQ0FBUyxLQUFULENBQUQsR0FBbUIsV0FBL0I7O0FBRUEsU0FBTyxRQUFQLEdBQWtCLEtBQWxCOztBQUVBLGVBQWEsSUFBYixDQUFrQixNQUFsQjs7QUFFQSwrQkFBZSxPQUFPLENBQXRCLEVBQXlCLE9BQU8sQ0FBaEM7QUFDQSxXQUFTLElBQVQ7QUFDRDs7QUFFRCxTQUFTLGFBQVQsR0FBMEI7QUFDeEIsTUFBSSxJQUFJLDBCQUFVLENBQVYsRUFBYSxlQUFNLFdBQU4sQ0FBa0IsS0FBL0IsQ0FBUjtBQUNBLE1BQUksSUFBSSwwQkFBVSxDQUFWLEVBQWEsZUFBTSxXQUFOLENBQWtCLE1BQS9CLENBQVI7O0FBRUEsTUFBSSxXQUFXLHFCQUFPLGtCQUFPLHNCQUFQLENBQVAsRUFBdUMsQ0FBdkMsRUFBMEMsQ0FBMUMsQ0FBZjtBQUNBLFdBQVMsUUFBVCxHQUFvQixJQUFwQjtBQUNBLFdBQVMsUUFBVCxHQUFvQixFQUFwQjs7QUFFQSxXQUFTLEVBQVQsR0FBYyw0QkFBWSxDQUFDLENBQWIsRUFBZ0IsQ0FBaEIsQ0FBZDtBQUNBLFdBQVMsRUFBVCxHQUFjLDRCQUFZLENBQUMsQ0FBYixFQUFnQixDQUFoQixDQUFkOztBQUVBLFdBQVMsYUFBVCxHQUF5Qiw0QkFBWSxJQUFaLEVBQWtCLElBQWxCLENBQXpCOztBQUVBLFlBQVUsSUFBVixDQUFlLFFBQWY7QUFDRDs7QUFFRDtBQUNBLFNBQVMsS0FBVCxHQUFrQjtBQUNoQixXQUFTLHlCQUFXLElBQVgsRUFBaUIsR0FBakIsRUFBc0IsTUFBdEIsQ0FBVDtBQUNBLGlCQUFNLEtBQU4sR0FBYyxPQUFPLEtBQXJCO0FBQ0EsaUJBQU0sTUFBTixHQUFlLE9BQU8sTUFBdEI7O0FBRUEsYUFBVyxrQkFBTyx1QkFBUCxDQUFYOztBQUVBLE9BQUsseUJBQVcsa0JBQU8sb0JBQVAsQ0FBWCxFQUF5QyxPQUFPLEtBQWhELEVBQXVELE9BQU8sTUFBOUQsQ0FBTDs7QUFFQSxTQUFPLHFCQUFPLGtCQUFPLHFCQUFQLENBQVAsQ0FBUDtBQUNBLE9BQUssTUFBTCxHQUFjLEdBQWQ7QUFDQSxPQUFLLE1BQUwsR0FBYyxHQUFkO0FBQ0EsaUJBQU0sU0FBTixDQUFnQixJQUFoQjs7QUFFQSxPQUFLLEVBQUwsR0FBVSxDQUFWO0FBQ0EsT0FBSyxFQUFMLEdBQVUsQ0FBVjtBQUNBLE9BQUssYUFBTCxHQUFxQixHQUFyQjtBQUNBLE9BQUssYUFBTCxHQUFxQixHQUFyQjtBQUNBLE9BQUssUUFBTCxHQUFnQixJQUFoQjtBQUNBLE9BQUssS0FBTCxHQUFhLENBQWI7O0FBRUEsT0FBSyxhQUFMLEdBQXFCLENBQXJCOztBQUVBLE9BQUssV0FBTCxHQUFtQixLQUFuQjs7QUFFQSxPQUFLLEtBQUwsR0FBYSxDQUFiO0FBQ0EsT0FBSyxTQUFMLEdBQWlCLEtBQWpCOztBQUVBLE1BQUksWUFBWSwyQkFBUyxFQUFULENBQWhCO0FBQ0EsTUFBSSxhQUFhLDJCQUFTLEVBQVQsQ0FBakI7QUFDQSxNQUFJLFVBQVUsMkJBQVMsRUFBVCxDQUFkO0FBQ0EsTUFBSSxRQUFRLDJCQUFTLEVBQVQsQ0FBWjs7QUFFQSxZQUFVLEtBQVYsR0FBa0IsWUFBTTtBQUFFLFNBQUssYUFBTCxHQUFxQixDQUFDLEdBQXRCO0FBQTJCLEdBQXJEO0FBQ0EsWUFBVSxPQUFWLEdBQW9CLFlBQU07QUFDeEIsUUFBSSxDQUFDLFdBQVcsTUFBaEIsRUFBd0IsS0FBSyxhQUFMLEdBQXFCLENBQXJCO0FBQ3pCLEdBRkQ7O0FBSUEsYUFBVyxLQUFYLEdBQW1CLFlBQU07QUFBRSxTQUFLLGFBQUwsR0FBcUIsR0FBckI7QUFBMEIsR0FBckQ7QUFDQSxhQUFXLE9BQVgsR0FBcUIsWUFBTTtBQUN6QixRQUFJLENBQUMsVUFBVSxNQUFmLEVBQXVCLEtBQUssYUFBTCxHQUFxQixDQUFyQjtBQUN4QixHQUZEOztBQUlBLFVBQVEsS0FBUixHQUFnQixZQUFNO0FBQUUsU0FBSyxXQUFMLEdBQW1CLElBQW5CO0FBQXlCLEdBQWpEO0FBQ0EsVUFBUSxPQUFSLEdBQWtCLFlBQU07QUFBRSxTQUFLLFdBQUwsR0FBbUIsS0FBbkI7QUFBMEIsR0FBcEQ7O0FBRUEsUUFBTSxLQUFOLEdBQWMsWUFBTTtBQUNsQixVQUNRLElBRFIsRUFDYyxLQUFLLFFBRG5CLEVBQzZCLEVBRDdCLEVBQ2lDLEVBRGpDLEVBQ3FDLE9BRHJDLEVBRVE7QUFBQSxhQUFNLHFCQUFPLGtCQUFPLGdCQUFQLENBQVAsQ0FBTjtBQUFBLEtBRlI7QUFJQSxVQUNRLElBRFIsRUFDYyxLQUFLLFFBRG5CLEVBQzZCLENBQUMsRUFEOUIsRUFDa0MsRUFEbEMsRUFDc0MsT0FEdEMsRUFFUTtBQUFBLGFBQU0scUJBQU8sa0JBQU8sZ0JBQVAsQ0FBUCxDQUFOO0FBQUEsS0FGUjtBQUlELEdBVEQ7O0FBV0EsWUFBVSxtQkFBSyxRQUFMLEVBQWUsNEJBQWYsRUFBNkMsT0FBN0MsRUFBc0QsQ0FBdEQsRUFBeUQsQ0FBekQsQ0FBVjs7QUFFQSxPQUFLLElBQUksSUFBSSxDQUFiLEVBQWdCLElBQUksQ0FBcEIsRUFBdUIsR0FBdkIsRUFBNEI7QUFDMUI7QUFDRDs7QUFFRDtBQUNEOztBQUVELFNBQVMsUUFBVCxHQUFxQjtBQUNuQix3QkFBc0IsUUFBdEI7O0FBRUEsTUFBSSxtQkFBVSxNQUFWLEdBQW1CLENBQXZCLEVBQTBCO0FBQ3hCLHVCQUFVLE9BQVYsQ0FBa0Isb0JBQVk7QUFDNUIsZUFBUyxNQUFUO0FBQ0QsS0FGRDtBQUdEOztBQUVELFlBQVUsUUFBUSxNQUFSLENBQWUsa0JBQVU7QUFDakMsV0FBTyxDQUFQLElBQVksT0FBTyxFQUFuQjtBQUNBLFdBQU8sQ0FBUCxJQUFZLE9BQU8sRUFBbkI7O0FBRUEsUUFBSSxZQUFZLDhCQUFjLE1BQWQsRUFBc0IsZUFBTSxXQUE1QixDQUFoQjs7QUFFQSxRQUFJLFNBQUosRUFBZTtBQUNiLDJCQUFPLE1BQVA7QUFDQSxhQUFPLEtBQVA7QUFDRDs7QUFFRCxXQUFPLElBQVA7QUFDRCxHQVpTLENBQVY7O0FBY0EsT0FBSyxJQUFJLElBQUksQ0FBYixFQUFnQixJQUFJLFVBQVUsTUFBOUIsRUFBc0MsR0FBdEMsRUFBMkM7QUFDekMsUUFBSSxLQUFLLFVBQVUsQ0FBVixDQUFUOztBQUVBO0FBQ0EsT0FBRyxRQUFILElBQWUsR0FBRyxhQUFsQjtBQUNBLE9BQUcsQ0FBSCxJQUFRLEdBQUcsRUFBWDtBQUNBLE9BQUcsQ0FBSCxJQUFRLEdBQUcsRUFBWDs7QUFFQSx5QkFBSyxFQUFMLEVBQVMsZUFBTSxXQUFmOztBQUVBO0FBQ0E7QUFDQSxTQUFLLElBQUksSUFBSSxJQUFJLENBQWpCLEVBQW9CLElBQUksVUFBVSxNQUFsQyxFQUEwQyxHQUExQyxFQUErQztBQUM3QyxVQUFJLEtBQUssVUFBVSxDQUFWLENBQVQ7O0FBRUEsNENBQXNCLEVBQXRCLEVBQTBCLEVBQTFCO0FBQ0Q7QUFDRztBQUNKLFFBQUksWUFBWSx5Q0FBeUIsRUFBekIsRUFBNkIsSUFBN0IsRUFBbUMsSUFBbkMsQ0FBaEI7QUFDQSxRQUFJLFNBQUosRUFBZTtBQUNiLFdBQUssS0FBTCxJQUFjLENBQWQ7QUFDQTtBQUNBLFdBQUssU0FBTCxHQUFpQixJQUFqQjtBQUNBO0FBQ0EsbUNBQWUsS0FBSyxPQUFwQixFQUE2QixLQUFLLE9BQWxDOztBQUVBO0FBQ0EsaUJBQVcsWUFBTTtBQUNmO0FBQ0EsdUJBQU0sU0FBTixDQUFnQixJQUFoQjtBQUNBLGFBQUssUUFBTCxHQUFnQixDQUFoQjtBQUNBLGFBQUssU0FBTCxHQUFpQixLQUFqQjtBQUNELE9BTEQsRUFLRyxJQUxIO0FBTUQ7QUFDRjs7QUFFRCxNQUFJLENBQUMsS0FBSyxTQUFWLEVBQXFCO0FBQ25CLFNBQUssUUFBTCxJQUFpQixLQUFLLGFBQXRCOztBQUVBLFFBQUksS0FBSyxXQUFULEVBQXNCO0FBQ3BCLFdBQUssRUFBTCxJQUFXLEtBQUssYUFBTCxHQUFxQixLQUFLLEdBQUwsQ0FBUyxLQUFLLFFBQWQsQ0FBaEM7QUFDQSxXQUFLLEVBQUwsSUFBVyxDQUFDLEtBQUssYUFBTixHQUFzQixLQUFLLEdBQUwsQ0FBUyxLQUFLLFFBQWQsQ0FBakM7QUFDRCxLQUhELE1BR087QUFDTCxXQUFLLEVBQUwsSUFBVyxLQUFLLFFBQWhCO0FBQ0EsV0FBSyxFQUFMLElBQVcsS0FBSyxRQUFoQjtBQUNEOztBQUVELFNBQUssQ0FBTCxJQUFVLEtBQUssRUFBZjtBQUNBLFNBQUssQ0FBTCxJQUFVLEtBQUssRUFBZjs7QUFFQSx5QkFBSyxJQUFMLEVBQVcsZUFBTSxXQUFqQjtBQUNEOztBQUVELEtBQUcsQ0FBSCxJQUFRLEtBQUssS0FBTCxDQUFXLEtBQUssRUFBaEIsQ0FBUjtBQUNBLEtBQUcsQ0FBSCxJQUFRLEtBQUssS0FBTCxDQUFXLEtBQUssRUFBaEIsQ0FBUjs7QUFFQSxVQUFRLE9BQVIsR0FBa0IsYUFBYSxLQUEvQjs7QUFFQSx1QkFBTyxNQUFQO0FBQ0QiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiZXhwb3J0IGZ1bmN0aW9uIGhpdFRlc3RQb2ludCAocG9pbnQsIHNwcml0ZSkge1xuICBsZXQgc2hhcGUsIGxlZnQsIHJpZ2h0LCB0b3AsIGJvdHRvbSwgdngsIHZ5LCBtYWduaXR1ZGUsIGhpdFxuXG4gIGlmIChzcHJpdGUucmFkaXVzKSB7XG4gICAgc2hhcGUgPSAnY2lyY2xlJ1xuICB9IGVsc2Uge1xuICAgIHNoYXBlID0gJ3JlY3RhbmdsZSdcbiAgfVxuXG4gIGlmIChzaGFwZSA9PT0gJ3JlY3RhbmdsZScpIHtcbiAgICBsZWZ0ID0gc3ByaXRlLnhcbiAgICByaWdodCA9IHNwcml0ZS54ICsgc3ByaXRlLndpZHRoXG4gICAgdG9wID0gc3ByaXRlLnlcbiAgICBib3R0b20gPSBzcHJpdGUueSArIHNwcml0ZS5oZWlnaHRcblxuICAgIGhpdCA9IHBvaW50LnggPiBsZWZ0ICYmIHBvaW50LnggPCByaWdodCAmJiBwb2ludC55ID4gdG9wICYmIHBvaW50LnkgPCBib3R0b21cbiAgfVxuXG4gIGlmIChzaGFwZSA9PT0gJ2NpcmNsZScpIHtcbiAgICB2eCA9IHBvaW50LnggLSBzcHJpdGUuY2VudGVyWFxuICAgIHZ5ID0gcG9pbnQueSAtIHNwcml0ZS5jZW50ZXJZXG4gICAgbWFnbml0dWRlID0gTWF0aC5zcXJ0KHZ4ICogdnggKyB2eSAqIHZ5KVxuXG4gICAgaGl0ID0gbWFnbml0dWRlIDwgc3ByaXRlLnJhZGl1c1xuICB9XG5cbiAgcmV0dXJuIGhpdFxufVxuXG5leHBvcnQgZnVuY3Rpb24gaGl0VGVzdENpcmNsZSAoYzEsIGMyLCBnbG9iYWwgPSBmYWxzZSkge1xuICBsZXQgdngsIHZ5LCBtYWduaXR1ZGUsIGNvbWJpbmVkUmFkaWksIGhpdFxuXG4gIGlmIChnbG9iYWwpIHtcbiAgICB2eCA9IChjMi5neCArIGMyLnJhZGl1cykgLSAoYzEuZ3ggKyBjMS5yYWRpdXMpXG4gICAgdnkgPSAoYzIuZ3kgKyBjMi5yYWRpdXMpIC0gKGMxLmd5ICsgYzEucmFkaXVzKVxuICB9IGVsc2Uge1xuICAgIHZ4ID0gYzIuY2VudGVyWCAtIGMxLmNlbnRlclhcbiAgICB2eSA9IGMyLmNlbnRlclkgLSBjMS5jZW50ZXJZXG4gIH1cblxuICBtYWduaXR1ZGUgPSBNYXRoLnNxcnQodnggKiB2eCArIHZ5ICogdnkpXG5cbiAgY29tYmluZWRSYWRpaSA9IGMxLnJhZGl1cyArIGMyLnJhZGl1c1xuICBoaXQgPSBtYWduaXR1ZGUgPCBjb21iaW5lZFJhZGlpXG5cbiAgcmV0dXJuIGhpdFxufTtcblxuZXhwb3J0IGZ1bmN0aW9uIGNpcmNsZUNvbGxpc2lvbiAoYzEsIGMyLCBib3VuY2UgPSBmYWxzZSwgZ2xvYmFsID0gZmFsc2UpIHtcbiAgbGV0IG1hZ25pdHVkZSwgY29tYmluZWRSYWRpaSwgb3ZlcmxhcFxuICBsZXQgdngsIHZ5LCBkeCwgZHlcbiAgbGV0IHMgPSB7fVxuICBsZXQgaGl0ID0gZmFsc2VcblxuICBpZiAoZ2xvYmFsKSB7XG4gICAgdnggPSAoYzIuZ3ggKyBjMi5yYWRpdXMpIC0gKGMxLmd4ICsgYzEucmFkaXVzKVxuICAgIHZ5ID0gKGMyLmd5ICsgYzIucmFkaXVzKSAtIChjMS5neSArIGMxLnJhZGl1cylcbiAgfSBlbHNlIHtcbiAgICB2eCA9IGMyLmNlbnRlclggLSBjMS5jZW50ZXJYXG4gICAgdnkgPSBjMi5jZW50ZXJZIC0gYzEuY2VudGVyWVxuICB9XG5cbiAgbWFnbml0dWRlID0gTWF0aC5zcXJ0KHZ4ICogdnggKyB2eSAqIHZ5KVxuXG4gIGNvbWJpbmVkUmFkaWkgPSBjMS5yYWRpdXMgKyBjMi5yYWRpdXNcblxuICBpZiAobWFnbml0dWRlIDwgY29tYmluZWRSYWRpaSkge1xuICAgIGhpdCA9IHRydWVcblxuICAgIG92ZXJsYXAgPSBjb21iaW5lZFJhZGlpIC0gbWFnbml0dWRlXG5cbiAgICBsZXQgcXVhbnR1bVBhZGRpbmcgPSAwLjNcbiAgICBvdmVybGFwICs9IHF1YW50dW1QYWRkaW5nXG5cbiAgICBkeCA9IHZ4IC8gbWFnbml0dWRlXG4gICAgZHkgPSB2eSAvIG1hZ25pdHVkZVxuXG4gICAgYzEueCAtPSBvdmVybGFwICogZHhcbiAgICBjMS55IC09IG92ZXJsYXAgKiBkeVxuXG4gICAgaWYgKGJvdW5jZSkge1xuICAgICAgcy54ID0gdnlcbiAgICAgIHMueSA9IC12eFxuXG4gICAgICBib3VuY2VPZmZTdXJmYWNlKGMxLCBzKVxuICAgIH1cbiAgfVxuICByZXR1cm4gaGl0XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtb3ZpbmdDaXJjbGVDb2xsaXNpb24gKGMxLCBjMiwgZ2xvYmFsID0gZmFsc2UpIHtcbiAgbGV0IGNvbWJpbmVkUmFkaWksIG92ZXJsYXAsIHhTaWRlLCB5U2lkZVxuICBsZXQgcyA9IHt9XG4gIGxldCBwMUEgPSB7fVxuICBsZXQgcDFCID0ge31cbiAgbGV0IHAyQSA9IHt9XG4gIGxldCBwMkIgPSB7fVxuICBsZXQgaGl0ID0gZmFsc2VcblxuICBjMS5tYXNzID0gYzEubWFzcyB8fCAxXG4gIGMyLm1hc3MgPSBjMi5tYXNzIHx8IDFcblxuICBpZiAoZ2xvYmFsKSB7XG4gICAgcy52eCA9IChjMi5neCArIGMyLnJhZGl1cykgLSAoYzEuZ3ggKyBjMS5yYWRpdXMpXG4gICAgcy52eSA9IChjMi5neSArIGMyLnJhZGl1cykgLSAoYzEuZ3kgKyBjMS5yYWRpdXMpXG4gIH0gZWxzZSB7XG4gICAgcy52eCA9IGMyLmNlbnRlclggLSBjMS5jZW50ZXJYXG4gICAgcy52eSA9IGMyLmNlbnRlclkgLSBjMS5jZW50ZXJZXG4gIH1cblxuICBzLm1hZ25pdHVkZSA9IE1hdGguc3FydChzLnZ4ICogcy52eCArIHMudnkgKiBzLnZ5KVxuXG4gIGNvbWJpbmVkUmFkaWkgPSBjMS5yYWRpdXMgKyBjMi5yYWRpdXNcblxuICBpZiAocy5tYWduaXR1ZGUgPCBjb21iaW5lZFJhZGlpKSB7XG4gICAgaGl0ID0gdHJ1ZVxuXG4gICAgb3ZlcmxhcCA9IGNvbWJpbmVkUmFkaWkgLSBzLm1hZ25pdHVkZVxuICAgIG92ZXJsYXAgKz0gMC4zXG5cbiAgICBzLmR4ID0gcy52eCAvIHMubWFnbml0dWRlXG4gICAgcy5keSA9IHMudnkgLyBzLm1hZ25pdHVkZVxuXG4gICAgcy52eEhhbGYgPSBNYXRoLmFicyhzLmR4ICogb3ZlcmxhcCAvIDIpXG4gICAgcy52eUhhbGYgPSBNYXRoLmFicyhzLmR5ICogb3ZlcmxhcCAvIDIpXG5cbiAgICB4U2lkZSA9IChjMS54ID4gYzIueCkgPyAxIDogLTFcbiAgICB5U2lkZSA9IChjMS55ID4gYzIueSkgPyAxIDogLTFcblxuICAgIGMxLnggPSBjMS54ICsgKHMudnhIYWxmICogeFNpZGUpXG4gICAgYzEueSA9IGMxLnkgKyAocy52eUhhbGYgKiB5U2lkZSlcblxuICAgIGMyLnggPSBjMi54ICsgKHMudnhIYWxmICogLXhTaWRlKVxuICAgIGMyLnkgPSBjMi55ICsgKHMudnlIYWxmICogLXlTaWRlKVxuXG4gICAgcy5seCA9IHMudnlcbiAgICBzLmx5ID0gLXMudnhcblxuICAgIGxldCBkcDEgPSBjMS52eCAqIHMuZHggKyBjMS52eSAqIHMuZHlcblxuICAgIHAxQS54ID0gZHAxICogcy5keFxuICAgIHAxQS55ID0gZHAxICogcy5keVxuXG4gICAgbGV0IGRwMiA9IGMxLnZ4ICogKHMubHggLyBzLm1hZ25pdHVkZSkgKyBjMS52eSAqIChzLmx5IC8gcy5tYWduaXR1ZGUpXG5cbiAgICBwMUIueCA9IGRwMiAqIChzLmx4IC8gcy5tYWduaXR1ZGUpXG4gICAgcDFCLnkgPSBkcDIgKiAocy5seSAvIHMubWFnbml0dWRlKVxuXG4gICAgbGV0IGRwMyA9IGMyLnZ4ICogcy5keCArIGMyLnZ5ICogcy5keVxuXG4gICAgcDJBLnggPSBkcDMgKiBzLmR4XG4gICAgcDJBLnkgPSBkcDMgKiBzLmR5XG5cbiAgICBsZXQgZHA0ID0gYzIudnggKiAocy5seCAvIHMubWFnbml0dWRlKSArIGMyLnZ5ICogKHMubHkgLyBzLm1hZ25pdHVkZSlcblxuICAgIHAyQi54ID0gZHA0ICogKHMubHggLyBzLm1hZ25pdHVkZSlcbiAgICBwMkIueSA9IGRwNCAqIChzLmx5IC8gcy5tYWduaXR1ZGUpXG5cbiAgICBjMS5ib3VuY2UgPSB7fVxuICAgIGMxLmJvdW5jZS54ID0gcDFCLnggKyBwMkEueFxuICAgIGMxLmJvdW5jZS55ID0gcDFCLnkgKyBwMkEueVxuXG4gICAgYzIuYm91bmNlID0ge31cbiAgICBjMi5ib3VuY2UueCA9IHAxQS54ICsgcDJCLnhcbiAgICBjMi5ib3VuY2UueSA9IHAxQS55ICsgcDJCLnlcblxuICAgIGMxLnZ4ID0gYzEuYm91bmNlLnggLyBjMS5tYXNzXG4gICAgYzEudnkgPSBjMS5ib3VuY2UueSAvIGMxLm1hc3NcbiAgICBjMi52eCA9IGMyLmJvdW5jZS54IC8gYzIubWFzc1xuICAgIGMyLnZ5ID0gYzIuYm91bmNlLnkgLyBjMi5tYXNzXG4gIH1cbiAgcmV0dXJuIGhpdFxufVxuXG5leHBvcnQgZnVuY3Rpb24gbXVsdGlwbGVDaXJjbGVDb2xsaXNpb24gKGFycmF5T2ZDaXJjbGVzLCBnbG9iYWwgPSBmYWxzZSkge1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGFycmF5T2ZDaXJjbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGMxID0gYXJyYXlPZkNpcmNsZXNbaV1cbiAgICBmb3IgKGxldCBqID0gaSArIDE7IGogPCBhcnJheU9mQ2lyY2xlcy5sZW5ndGg7IGorKykge1xuICAgICAgbGV0IGMyID0gYXJyYXlPZkNpcmNsZXNbal1cbiAgICAgIG1vdmluZ0NpcmNsZUNvbGxpc2lvbihjMSwgYzIsIGdsb2JhbClcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhpdFRlc3RSZWN0YW5nbGUgKHIxLCByMiwgZ2xvYmFsID0gZmFsc2UpIHtcbiAgbGV0IGhpdCwgY29tYmluZWRIYWxmV2lkdGhzLCBjb21iaW5lZEhhbGZIZWlnaHRzLCB2eCwgdnlcblxuICBoaXQgPSBmYWxzZVxuXG4gIGlmIChnbG9iYWwpIHtcbiAgICB2eCA9IChyMS5neCArIHIxLmhhbGZXaWR0aCkgLSAocjIuZ3ggKyByMi5oYWxmV2lkdGgpXG4gICAgdnkgPSAocjEuZ3kgKyByMS5oYWxmSGVpZ2h0KSAtIChyMi5neSArIHIyLmhhbGZIZWlnaHQpXG4gIH0gZWxzZSB7XG4gICAgdnggPSByMS5jZW50ZXJYIC0gcjIuY2VudGVyWFxuICAgIHZ5ID0gcjEuY2VudGVyWSAtIHIyLmNlbnRlcllcbiAgfVxuXG4gIGNvbWJpbmVkSGFsZldpZHRocyA9IHIxLmhhbGZXaWR0aCArIHIyLmhhbGZXaWR0aFxuICBjb21iaW5lZEhhbGZIZWlnaHRzID0gcjEuaGFsZkhlaWdodCArIHIyLmhhbGZIZWlnaHRcblxuICBpZiAoTWF0aC5hYnModngpIDwgY29tYmluZWRIYWxmV2lkdGhzKSB7XG4gICAgaWYgKE1hdGguYWJzKHZ5KSA8IGNvbWJpbmVkSGFsZkhlaWdodHMpIHtcbiAgICAgIGhpdCA9IHRydWVcbiAgICB9IGVsc2Uge1xuICAgICAgaGl0ID0gZmFsc2VcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaGl0ID0gZmFsc2VcbiAgfVxuXG4gIHJldHVybiBoaXRcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlY3RhbmdsZUNvbGxpc2lvbiAoXG4gIHIxLCByMiwgYm91bmNlID0gZmFsc2UsIGdsb2JhbCA9IHRydWVcbikge1xuICBsZXQgY29sbGlzaW9uLCBjb21iaW5lZEhhbGZXaWR0aHMsIGNvbWJpbmVkSGFsZkhlaWdodHMsXG4gICAgb3ZlcmxhcFgsIG92ZXJsYXBZLCB2eCwgdnlcblxuICBpZiAoZ2xvYmFsKSB7XG4gICAgdnggPSAocjEuZ3ggKyByMS5oYWxmV2lkdGgpIC0gKHIyLmd4ICsgcjIuaGFsZldpZHRoKVxuICAgIHZ5ID0gKHIxLmd5ICsgcjEuaGFsZkhlaWdodCkgLSAocjIuZ3kgKyByMi5oYWxmSGVpZ2h0KVxuICB9IGVsc2Uge1xuICAgIHZ4ID0gcjEuY2VudGVyWCAtIHIyLmNlbnRlclhcbiAgICB2eSA9IHIxLmNlbnRlclkgLSByMi5jZW50ZXJZXG4gIH1cblxuICBjb21iaW5lZEhhbGZXaWR0aHMgPSByMS5oYWxmV2lkdGggKyByMi5oYWxmV2lkdGhcbiAgY29tYmluZWRIYWxmSGVpZ2h0cyA9IHIxLmhhbGZIZWlnaHQgKyByMi5oYWxmSGVpZ2h0XG5cbiAgaWYgKE1hdGguYWJzKHZ4KSA8IGNvbWJpbmVkSGFsZldpZHRocykge1xuICAgIGlmIChNYXRoLmFicyh2eSkgPCBjb21iaW5lZEhhbGZIZWlnaHRzKSB7XG4gICAgICBvdmVybGFwWCA9IGNvbWJpbmVkSGFsZldpZHRocyAtIE1hdGguYWJzKHZ4KVxuICAgICAgb3ZlcmxhcFkgPSBjb21iaW5lZEhhbGZIZWlnaHRzIC0gTWF0aC5hYnModnkpXG5cbiAgICAgIGlmIChvdmVybGFwWCA+PSBvdmVybGFwWSkge1xuICAgICAgICBpZiAodnkgPiAwKSB7XG4gICAgICAgICAgY29sbGlzaW9uID0gJ3RvcCdcbiAgICAgICAgICByMS55ID0gcjEueSArIG92ZXJsYXBZXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29sbGlzaW9uID0gJ2JvdHRvbSdcbiAgICAgICAgICByMS55ID0gcjEueSAtIG92ZXJsYXBZXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoYm91bmNlKSB7XG4gICAgICAgICAgcjEudnkgKj0gLTFcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHZ4ID4gMCkge1xuICAgICAgICAgIGNvbGxpc2lvbiA9ICdsZWZ0J1xuICAgICAgICAgIHIxLnggPSByMS54ICsgb3ZlcmxhcFhcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb2xsaXNpb24gPSAncmlnaHQnXG4gICAgICAgICAgcjEueCA9IHIxLnggLSBvdmVybGFwWFxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGJvdW5jZSkge1xuICAgICAgICAgIHIxLnZ4ICo9IC0xXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gTm8gY29sbGlzaW9uXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIC8vIE5vIGNvbGxpc2lvblxuICB9XG5cbiAgcmV0dXJuIGNvbGxpc2lvblxufVxuXG5leHBvcnQgZnVuY3Rpb24gaGl0VGVzdENpcmNsZVJlY3RhbmdsZSAoYzEsIHIxLCBnbG9iYWwgPSBmYWxzZSkge1xuICBsZXQgcmVnaW9uLCBjb2xsaXNpb24sIGMxeCwgYzF5LCByMXgsIHIxeVxuXG4gIGlmIChnbG9iYWwpIHtcbiAgICBjMXggPSBjMS5neFxuICAgIGMxeSA9IGMxLmd5XG4gICAgcjF4ID0gcjEuZ3hcbiAgICByMXkgPSByMS5neVxuICB9IGVsc2Uge1xuICAgIGMxeCA9IGMxLnhcbiAgICBjMXkgPSBjMS55XG4gICAgcjF4ID0gcjEueFxuICAgIHIxeSA9IHIxLnlcbiAgfVxuXG4gIGlmIChjMXkgPCByMXkgLSByMS5oYWxmSGVpZ2h0KSB7XG4gICAgaWYgKGMxeCA8IHIxeCAtIDEgLSByMS5oYWxmV2lkdGgpIHtcbiAgICAgIHJlZ2lvbiA9ICd0b3BMZWZ0J1xuICAgIH0gZWxzZSBpZiAoYzF4ID4gcjF4ICsgMSArIHIxLmhhbGZXaWR0aCkge1xuICAgICAgcmVnaW9uID0gJ3RvcFJpZ2h0J1xuICAgIH0gZWxzZSB7XG4gICAgICByZWdpb24gPSAndG9wTWlkZGxlJ1xuICAgIH1cbiAgfSBlbHNlIGlmIChjMXkgPiByMXkgKyByMS5oYWxmSGVpZ2h0KSB7XG4gICAgaWYgKGMxeCA8IHIxeCAtIDEgLSByMS5oYWxmV2lkdGgpIHtcbiAgICAgIHJlZ2lvbiA9ICdib3R0b21MZWZ0J1xuICAgIH0gZWxzZSBpZiAoYzF4ID4gcjF4ICsgMSArIHIxLmhhbGZXaWR0aCkge1xuICAgICAgcmVnaW9uID0gJ2JvdHRvbVJpZ2h0J1xuICAgIH0gZWxzZSB7XG4gICAgICByZWdpb24gPSAnYm90dG9tTWlkZGxlJ1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBpZiAoYzF4IDwgcjF4IC0gcjEuaGFsZldpZHRoKSB7XG4gICAgICByZWdpb24gPSAnbGVmdE1pZGRsZSdcbiAgICB9IGVsc2Uge1xuICAgICAgcmVnaW9uID0gJ3JpZ2h0TWlkZGxlJ1xuICAgIH1cbiAgfVxuXG4gIGlmIChyZWdpb24gPT09ICd0b3BNaWRkbGUnIHx8IHJlZ2lvbiA9PT0gJ2JvdHRvbU1pZGRsZScgfHwgcmVnaW9uID09PSAnbGVmdE1pZGRsZScgfHwgcmVnaW9uID09PSAncmlnaHRNaWRkbGUnKSB7XG4gICAgY29sbGlzaW9uID0gaGl0VGVzdFJlY3RhbmdsZShjMSwgcjEsIGdsb2JhbClcbiAgfSBlbHNlIHtcbiAgICBsZXQgcG9pbnQgPSB7fVxuXG4gICAgc3dpdGNoIChyZWdpb24pIHtcbiAgICAgIGNhc2UgJ3RvcExlZnQnOlxuICAgICAgICBwb2ludC54ID0gcjF4XG4gICAgICAgIHBvaW50LnkgPSByMXlcbiAgICAgICAgYnJlYWtcblxuICAgICAgY2FzZSAndG9wUmlnaHQnOlxuICAgICAgICBwb2ludC54ID0gcjF4ICsgcjEud2lkdGhcbiAgICAgICAgcG9pbnQueSA9IHIxeVxuICAgICAgICBicmVha1xuXG4gICAgICBjYXNlICdib3R0b21MZWZ0JzpcbiAgICAgICAgcG9pbnQueCA9IHIxeFxuICAgICAgICBwb2ludC55ID0gcjF5ICsgcjEuaGVpZ2h0XG4gICAgICAgIGJyZWFrXG5cbiAgICAgIGNhc2UgJ2JvdHRvbVJpZ2h0JzpcbiAgICAgICAgcG9pbnQueCA9IHIxeCArIHIxLndpZHRoXG4gICAgICAgIHBvaW50LnkgPSByMXkgKyByMS5oZWlnaHRcbiAgICB9XG5cbiAgICBjb2xsaXNpb24gPSBoaXRUZXN0Q2lyY2xlUG9pbnQoYzEsIHBvaW50LCBnbG9iYWwpXG4gIH1cblxuICBpZiAoY29sbGlzaW9uKSB7XG4gICAgcmV0dXJuIHJlZ2lvblxuICB9IGVsc2Uge1xuICAgIHJldHVybiBjb2xsaXNpb25cbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaGl0VGVzdENpcmNsZVBvaW50IChjMSwgcG9pbnQsIGdsb2JhbCA9IGZhbHNlKSB7XG4gIHBvaW50LmRpYW1ldGVyID0gMVxuICBwb2ludC5yYWRpdXMgPSAwLjVcbiAgcG9pbnQuY2VudGVyWCA9IHBvaW50LnhcbiAgcG9pbnQuY2VudGVyWSA9IHBvaW50LnlcbiAgcG9pbnQuZ3ggPSBwb2ludC54XG4gIHBvaW50Lmd5ID0gcG9pbnQueVxuICByZXR1cm4gaGl0VGVzdENpcmNsZShjMSwgcG9pbnQsIGdsb2JhbClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNpcmNsZVJlY3RhbmdsZUNvbGxpc2lvbiAoXG4gIGMxLCByMSwgYm91bmNlID0gZmFsc2UsIGdsb2JhbCA9IGZhbHNlXG4pIHtcbiAgbGV0IHJlZ2lvbiwgY29sbGlzaW9uLCBjMXgsIGMxeSwgcjF4LCByMXlcblxuICBpZiAoZ2xvYmFsKSB7XG4gICAgYzF4ID0gYzEuZ3hcbiAgICBjMXkgPSBjMS5neVxuICAgIHIxeCA9IHIxLmd4XG4gICAgcjF5ID0gcjEuZ3lcbiAgfSBlbHNlIHtcbiAgICBjMXggPSBjMS54XG4gICAgYzF5ID0gYzEueVxuICAgIHIxeCA9IHIxLnhcbiAgICByMXkgPSByMS55XG4gIH1cblxuICBpZiAoYzF5IDwgcjF5IC0gcjEuaGFsZkhlaWdodCkge1xuICAgIGlmIChjMXggPCByMXggLSAxIC0gcjEuaGFsZldpZHRoKSB7XG4gICAgICByZWdpb24gPSAndG9wTGVmdCdcbiAgICB9IGVsc2UgaWYgKGMxeCA+IHIxeCArIDEgKyByMS5oYWxmV2lkdGgpIHtcbiAgICAgIHJlZ2lvbiA9ICd0b3BSaWdodCdcbiAgICB9IGVsc2Uge1xuICAgICAgcmVnaW9uID0gJ3RvcE1pZGRsZSdcbiAgICB9XG4gIH0gZWxzZSBpZiAoYzF5ID4gcjF5ICsgcjEuaGFsZkhlaWdodCkge1xuICAgIGlmIChjMXggPCByMXggLSAxIC0gcjEuaGFsZldpZHRoKSB7XG4gICAgICByZWdpb24gPSAnYm90dG9tTGVmdCdcbiAgICB9IGVsc2UgaWYgKGMxeCA+IHIxeCArIDEgKyByMS5oYWxmV2lkdGgpIHtcbiAgICAgIHJlZ2lvbiA9ICdib3R0b21SaWdodCdcbiAgICB9IGVsc2Uge1xuICAgICAgcmVnaW9uID0gJ2JvdHRvbU1pZGRsZSdcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaWYgKGMxeCA8IHIxeCAtIHIxLmhhbGZXaWR0aCkge1xuICAgICAgcmVnaW9uID0gJ2xlZnRNaWRkbGUnXG4gICAgfSBlbHNlIHtcbiAgICAgIHJlZ2lvbiA9ICdyaWdodE1pZGRsZSdcbiAgICB9XG4gIH1cblxuICBpZiAocmVnaW9uID09PSAndG9wTWlkZGxlJyB8fCByZWdpb24gPT09ICdib3R0b21NaWRkbGUnIHx8IHJlZ2lvbiA9PT0gJ2xlZnRNaWRkbGUnIHx8IHJlZ2lvbiA9PT0gJ3JpZ2h0TWlkZGxlJykge1xuICAgIGNvbGxpc2lvbiA9IHJlY3RhbmdsZUNvbGxpc2lvbihjMSwgcjEsIGJvdW5jZSwgZ2xvYmFsKVxuICB9IGVsc2Uge1xuICAgIGxldCBwb2ludCA9IHt9XG5cbiAgICBzd2l0Y2ggKHJlZ2lvbikge1xuICAgICAgY2FzZSAndG9wTGVmdCc6XG4gICAgICAgIHBvaW50LnggPSByMXhcbiAgICAgICAgcG9pbnQueSA9IHIxeVxuICAgICAgICBicmVha1xuXG4gICAgICBjYXNlICd0b3BSaWdodCc6XG4gICAgICAgIHBvaW50LnggPSByMXggKyByMS53aWR0aFxuICAgICAgICBwb2ludC55ID0gcjF5XG4gICAgICAgIGJyZWFrXG5cbiAgICAgIGNhc2UgJ2JvdHRvbUxlZnQnOlxuICAgICAgICBwb2ludC54ID0gcjF4XG4gICAgICAgIHBvaW50LnkgPSByMXkgKyByMS5oZWlnaHRcbiAgICAgICAgYnJlYWtcblxuICAgICAgY2FzZSAnYm90dG9tUmlnaHQnOlxuICAgICAgICBwb2ludC54ID0gcjF4ICsgcjEud2lkdGhcbiAgICAgICAgcG9pbnQueSA9IHIxeSArIHIxLmhlaWdodFxuICAgIH1cblxuICAgIGNvbGxpc2lvbiA9IGNpcmNsZVBvaW50Q29sbGlzaW9uKGMxLCBwb2ludCwgYm91bmNlLCBnbG9iYWwpXG4gIH1cblxuICBpZiAoY29sbGlzaW9uKSB7XG4gICAgcmV0dXJuIHJlZ2lvblxuICB9IGVsc2Uge1xuICAgIHJldHVybiBjb2xsaXNpb25cbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY2lyY2xlUG9pbnRDb2xsaXNpb24gKGMxLCBwb2ludCwgYm91bmNlID0gZmFsc2UsIGdsb2JhbCA9IGZhbHNlKSB7XG4gIHBvaW50LmRpYW1ldGVyID0gMVxuICBwb2ludC5yYWRpdXMgPSAwLjVcbiAgcG9pbnQuY2VudGVyWCA9IHBvaW50LnhcbiAgcG9pbnQuY2VudGVyWSA9IHBvaW50LnlcbiAgcG9pbnQuZ3ggPSBwb2ludC54XG4gIHBvaW50Lmd5ID0gcG9pbnQueVxuICByZXR1cm4gY2lyY2xlQ29sbGlzaW9uKGMxLCBwb2ludCwgYm91bmNlLCBnbG9iYWwpXG59XG5cbmZ1bmN0aW9uIGJvdW5jZU9mZlN1cmZhY2UgKG8sIHMpIHtcbiAgbGV0IGRwMSwgZHAyXG4gIGxldCBwMSA9IHt9XG4gIGxldCBwMiA9IHt9XG4gIGxldCBib3VuY2UgPSB7fVxuICBsZXQgbWFzcyA9IG8ubWFzcyB8fCAxXG5cbiAgcy5seCA9IHMueVxuICBzLmx5ID0gLXMueFxuXG4gIHMubWFnbml0dWRlID0gTWF0aC5zcXJ0KHMueCAqIHMueCArIHMueSAqIHMueSlcblxuICBzLmR4ID0gcy54IC8gcy5tYWduaXR1ZGVcbiAgcy5keSA9IHMueSAvIHMubWFnbml0dWRlXG5cbiAgZHAxID0gby52eCAqIHMuZHggKyBvLnZ5ICogcy5keVxuXG4gIHAxLnZ4ID0gZHAxICogcy5keFxuICBwMS52eSA9IGRwMSAqIHMuZHlcblxuICBkcDIgPSBvLnZ4ICogKHMubHggLyBzLm1hZ25pdHVkZSkgKyBvLnZ5ICogKHMubHkgLyBzLm1hZ25pdHVkZSlcblxuICBwMi52eCA9IGRwMiAqIChzLmx4IC8gcy5tYWduaXR1ZGUpXG4gIHAyLnZ5ID0gZHAyICogKHMubHkgLyBzLm1hZ25pdHVkZSlcblxuICBwMi52eCAqPSAtMVxuICBwMi52eSAqPSAtMVxuXG4gIGJvdW5jZS54ID0gcDEudnggKyBwMi52eFxuICBib3VuY2UueSA9IHAxLnZ5ICsgcDIudnlcblxuICBvLnZ4ID0gYm91bmNlLnggLyBtYXNzXG4gIG8udnkgPSBib3VuY2UueSAvIG1hc3Ncbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhpdCAoYSwgYiwgcmVhY3QgPSBmYWxzZSwgYm91bmNlID0gZmFsc2UsIGdsb2JhbCwgZXh0cmEgPSB1bmRlZmluZWQpIHtcbiAgbGV0IGNvbGxpc2lvblxuICBsZXQgYUlzQVNwcml0ZSA9IGEucGFyZW50ICE9PSB1bmRlZmluZWRcbiAgbGV0IGJJc0FTcHJpdGUgPSBiLnBhcmVudCAhPT0gdW5kZWZpbmVkXG5cbiAgaWYgKGFJc0FTcHJpdGUgJiYgYiBpbnN0YW5jZW9mIEFycmF5IHx8IGJJc0FTcHJpdGUgJiYgYSBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgc3ByaXRlVnNBcnJheSgpXG4gIH0gZWxzZSB7XG4gICAgY29sbGlzaW9uID0gZmluZENvbGxpc2lvblR5cGUoYSwgYilcbiAgICBpZiAoY29sbGlzaW9uICYmIGV4dHJhKSBleHRyYShjb2xsaXNpb24pXG4gIH1cblxuICByZXR1cm4gY29sbGlzaW9uXG5cbiAgZnVuY3Rpb24gZmluZENvbGxpc2lvblR5cGUgKGEsIGIpIHtcbiAgICBsZXQgYUlzQVNwcml0ZSA9IGEucGFyZW50ICE9PSB1bmRlZmluZWRcbiAgICBsZXQgYklzQVNwcml0ZSA9IGIucGFyZW50ICE9PSB1bmRlZmluZWRcblxuICAgIGlmIChhSXNBU3ByaXRlICYmIGJJc0FTcHJpdGUpIHtcbiAgICAgIGlmIChhLmRpYW1ldGVyICYmIGIuZGlhbWV0ZXIpIHtcbiAgICAgICAgcmV0dXJuIGNpcmNsZVZzQ2lyY2xlKGEsIGIpXG4gICAgICB9IGVsc2UgaWYgKGEuZGlhbWV0ZXIgJiYgIWIuZGlhbWV0ZXIpIHtcbiAgICAgICAgcmV0dXJuIGNpcmNsZVZzUmVjdGFuZ2xlKGEsIGIpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gcmVjdGFuZ2xlVnNSZWN0YW5nbGUoYSwgYilcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGJJc0FTcHJpdGUgJiYgIShhLnggPT09IHVuZGVmaW5lZCkgJiYgIShhLnkgPT09IHVuZGVmaW5lZCkpIHtcbiAgICAgIHJldHVybiBoaXRUZXN0UG9pbnQoYSwgYilcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBJJ20gc29ycnksICR7YX0gYW5kICR7Yn0gY2Fubm90IGJlIHVzZSB0b2dldGhlciBpbiBhIGNvbGxpc2lvbiB0ZXN0LidgKVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHNwcml0ZVZzQXJyYXkgKCkge1xuICAgIGlmIChhIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgIGxldCBbYSwgYl0gPSBbYiwgYV1cbiAgICB9XG4gICAgZm9yIChsZXQgaSA9IGIubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgIGxldCBzcHJpdGUgPSBiW2ldXG4gICAgICBjb2xsaXNpb24gPSBmaW5kQ29sbGlzaW9uVHlwZShhLCBzcHJpdGUpXG4gICAgICBpZiAoY29sbGlzaW9uICYmIGV4dHJhKSBleHRyYShjb2xsaXNpb24sIHNwcml0ZSlcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBjaXJjbGVWc0NpcmNsZSAoYSwgYikge1xuICAgIGlmICghcmVhY3QpIHtcbiAgICAgIHJldHVybiBoaXRUZXN0Q2lyY2xlKGEsIGIpXG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChhLnZ4ICsgYS52eSAhPT0gMCAmJiBiLnZ4ICsgYi52eSAhPT0gMCkge1xuICAgICAgICByZXR1cm4gbW92aW5nQ2lyY2xlQ29sbGlzaW9uKGEsIGIsIGdsb2JhbClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBjaXJjbGVDb2xsaXNpb24oYSwgYiwgYm91bmNlLCBnbG9iYWwpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gcmVjdGFuZ2xlVnNSZWN0YW5nbGUgKGEsIGIpIHtcbiAgICBpZiAoIXJlYWN0KSB7XG4gICAgICByZXR1cm4gaGl0VGVzdFJlY3RhbmdsZShhLCBiLCBnbG9iYWwpXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiByZWN0YW5nbGVDb2xsaXNpb24oYSwgYiwgYm91bmNlLCBnbG9iYWwpXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gY2lyY2xlVnNSZWN0YW5nbGUgKGEsIGIpIHtcbiAgICBpZiAoIXJlYWN0KSB7XG4gICAgICByZXR1cm4gaGl0VGVzdENpcmNsZVJlY3RhbmdsZShhLCBiLCBnbG9iYWwpXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBjaXJjbGVSZWN0YW5nbGVDb2xsaXNpb24oYSwgYiwgYm91bmNlLCBnbG9iYWwpXG4gICAgfVxuICB9XG59XG4iLCJleHBvcnQgbGV0IGRyYWdnYWJsZVNwcml0ZXMgPSBbXVxuZXhwb3J0IGxldCBidXR0b25zID0gW11cbmV4cG9ydCBsZXQgcGFydGljbGVzID0gW11cblxuY2xhc3MgRGlzcGxheU9iamVjdCB7XG4gIGNvbnN0cnVjdG9yICgpIHtcbiAgICAgICAgLy8gVGhlIHNwcml0ZSBwb3NpdGlvbiBhbmQgc2l6ZVxuICAgIHRoaXMueCA9IDBcbiAgICB0aGlzLnkgPSAwXG4gICAgdGhpcy53aWR0aCA9IDBcbiAgICB0aGlzLmhlaWdodCA9IDBcblxuICAgICAgICAvLyB0cmFuc2Zvcm1hdGlvbiBwcm9wZXJ0aWVzXG4gICAgdGhpcy5yb3RhdGlvbiA9IDBcbiAgICB0aGlzLmFscGhhID0gMVxuICAgIHRoaXMudmlzaWJsZSA9IHRydWVcbiAgICB0aGlzLnNjYWxlWCA9IDFcbiAgICB0aGlzLnNjYWxlWSA9IDFcblxuICAgICAgICAvLyBwaXZvdCBwb2ludFxuICAgICAgICAvLyAoMC41IGlzIGNlbnRlciBwb2ludClcbiAgICB0aGlzLnBpdm90WCA9IDAuNVxuICAgIHRoaXMucGl2b3RZID0gMC41XG5cbiAgICAgICAgLy8gVmVsb2NpdHlcbiAgICB0aGlzLnZ4ID0gMFxuICAgIHRoaXMudnkgPSAwXG5cbiAgICAgICAgLy8gJ3ByaXZhdGUnIGxheWVyIHByb3BlcnR5XG4gICAgdGhpcy5fbGF5ZXIgPSAwXG5cbiAgICB0aGlzLmNoaWxkcmVuID0gW11cbiAgICB0aGlzLnBhcmVudCA9IHVuZGVmaW5lZFxuXG4gICAgICAgIC8vIE9wdGlvbmFsIHNoYWRvd1xuICAgIHRoaXMuc2hhZG93ID0gZmFsc2VcbiAgICB0aGlzLnNoYWRvd0NvbG9yID0gJ3JnYmEoMTAwLCAxMDAsIDEwMCwgMC41KSdcbiAgICB0aGlzLnNoYWRvd09mZnNldFggPSAzXG4gICAgdGhpcy5zaGFkb3dPZmZzZXRZID0gM1xuICAgIHRoaXMuc2hhZG93Qmx1ciA9IDNcblxuICAgIHRoaXMuYmxlbmRNb2RlID0gdW5kZWZpbmVkXG5cbiAgICAgICAgLy8gYWR2YW5jZWQgZmVhdHVyZXNcbiAgICAgICAgLy8gYW5pbWF0aW9uXG4gICAgdGhpcy5mcmFtZXMgPSBbXVxuICAgIHRoaXMubG9vcCA9IHRydWVcbiAgICB0aGlzLl9jdXJyZW50RnJhbWUgPSAwXG4gICAgdGhpcy5wbGF5aW5nID0gZmFsc2VcblxuICAgICAgICAvLyBjYW4gYmUgZHJhZ2dlZFxuICAgIHRoaXMuX2RyYWdnYWJsZSA9IHVuZGVmaW5lZFxuXG4gICAgICAgIC8vIHVzZWQgZm9yICdyYWRpdXMnIGFuZCAnZGlhbWV0ZXInIHByb3BzXG4gICAgdGhpcy5fY2lyY3VsYXIgPSBmYWxzZVxuXG4gICAgICAgIC8vIGlzIGludGVyYWN0aXZlPyAoY2xpY2thYmxlL3RvdWNoYWJsZSlcbiAgICB0aGlzLl9pbnRlcmFjdGl2ZSA9IGZhbHNlXG4gIH1cblxuICAgIC8vIEdsb2JhbCBwb3NpdGlvblxuICBnZXQgZ3ggKCkge1xuICAgIGlmICh0aGlzLnBhcmVudCkge1xuICAgICAgcmV0dXJuIHRoaXMueCArIHRoaXMucGFyZW50Lmd4XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnhcbiAgICB9XG4gIH1cbiAgZ2V0IGd5ICgpIHtcbiAgICBpZiAodGhpcy5wYXJlbnQpIHtcbiAgICAgIHJldHVybiB0aGlzLnkgKyB0aGlzLnBhcmVudC5neVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy55XG4gICAgfVxuICB9XG5cbiAgICAvLyBEZXB0aCBsYXllclxuICBnZXQgbGF5ZXIgKCkge1xuICAgIHJldHVybiB0aGlzLl9sYXllclxuICB9XG4gIHNldCBsYXllciAodmFsdWUpIHtcbiAgICB0aGlzLl9sYXllciA9IHZhbHVlXG4gICAgaWYgKHRoaXMucGFyZW50KSB7XG4gICAgICB0aGlzLnBhcmVudC5jaGlsZHJlbi5zb3J0KChhLCBiKSA9PiBhLmxheWVyIC0gYi5sYXllcilcbiAgICB9XG4gIH1cblxuICAgIC8vIENoaWxkcmVuIG1hbmlwdWxhdGlvblxuICBhZGRDaGlsZCAoc3ByaXRlKSB7XG4gICAgaWYgKHNwcml0ZS5wYXJlbnQpIHtcbiAgICAgIHNwcml0ZS5wYXJlbnQucmVtb3ZlQ2hpbGQoc3ByaXRlKVxuICAgIH1cbiAgICBzcHJpdGUucGFyZW50ID0gdGhpc1xuICAgIHRoaXMuY2hpbGRyZW4ucHVzaChzcHJpdGUpXG4gIH1cblxuICByZW1vdmVDaGlsZCAoc3ByaXRlKSB7XG4gICAgaWYgKHNwcml0ZS5wYXJlbnQgPT09IHRoaXMpIHtcbiAgICAgIHRoaXMuY2hpbGRyZW4uc3BsaWNlKHRoaXMuY2hpbGRyZW4uaW5kZXhPZihzcHJpdGUpLCAxKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3Ioc3ByaXRlICsgJyBpcyBub3QgYSBjaGlsZCBvZiAnICsgdGhpcylcbiAgICB9XG4gIH1cblxuICBnZXQgZW1wdHkgKCkge1xuICAgIGlmICh0aGlzLmNoaWxkcmVuLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICB9XG5cbiAgc3dhcENoaWxkcmVuIChjaGlsZDEsIGNoaWxkMikge1xuICAgIGxldCBpbmRleDEgPSB0aGlzLmNoaWxkcmVuLmluZGV4T2YoY2hpbGQxKVxuICAgIGxldCBpbmRleDIgPSB0aGlzLmNoaWxkcmVuLmluZGV4T2YoY2hpbGQyKVxuXG4gICAgaWYgKGluZGV4MSAhPT0gLTEgJiYgaW5kZXgyICE9PSAtMSkge1xuICAgICAgY2hpbGQxLmNoaWxkSW5kZXggPSBpbmRleDJcbiAgICAgIGNoaWxkMi5jaGlsZEluZGV4ID0gaW5kZXgxXG5cbiAgICAgIHRoaXMuY2hpbGRyZW5baW5kZXgxXSA9IGNoaWxkMlxuICAgICAgdGhpcy5jaGlsZHJlbltpbmRleDJdID0gY2hpbGQxXG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQm90aCBvYmplY3RzIG11c3QgYmUgYSBjaGlsZCBvZiB0aGUgY2FsbGVyICR7dGhpc31gKVxuICAgIH1cbiAgfVxuXG4gIGFkZCAoLi4uc3ByaXRlc1RvQWRkKSB7XG4gICAgc3ByaXRlc1RvQWRkLmZvckVhY2goc3ByaXRlID0+IHRoaXMuYWRkQ2hpbGQoc3ByaXRlKSlcbiAgfVxuICByZW1vdmUgKC4uLnNwcml0ZXNUb1JlbW92ZSkge1xuICAgIHNwcml0ZXNUb1JlbW92ZS5mb3JFYWNoKHNwcml0ZSA9PiB0aGlzLnJlbW92ZUNoaWxkKHNwcml0ZSkpXG4gIH1cblxuICAgIC8vIEhlbHBlcnNcbiAgZ2V0IGhhbGZXaWR0aCAoKSB7XG4gICAgcmV0dXJuIHRoaXMud2lkdGggLyAyXG4gIH1cbiAgZ2V0IGhhbGZIZWlnaHQgKCkge1xuICAgIHJldHVybiB0aGlzLmhlaWdodCAvIDJcbiAgfVxuXG4gIGdldCBjZW50ZXJYICgpIHtcbiAgICByZXR1cm4gdGhpcy54ICsgdGhpcy5oYWxmV2lkdGhcbiAgfVxuICBnZXQgY2VudGVyWSAoKSB7XG4gICAgcmV0dXJuIHRoaXMueSArIHRoaXMuaGFsZkhlaWdodFxuICB9XG5cbiAgICAvLyAuLi5cbiAgZ2V0IHBvc2l0aW9uICgpIHtcbiAgICByZXR1cm4ge3g6IHRoaXMueCwgeTogdGhpcy55fVxuICB9XG4gIHNldFBvc2l0aW9uICh4LCB5KSB7XG4gICAgdGhpcy54ID0geFxuICAgIHRoaXMueSA9IHlcbiAgfVxuXG4gIGdldCBsb2NhbEJvdW5kcyAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHg6IDAsXG4gICAgICB5OiAwLFxuICAgICAgd2lkdGg6IHRoaXMud2lkdGgsXG4gICAgICBoZWlnaHQ6IHRoaXMuaGVpZ2h0XG4gICAgfVxuICB9XG4gIGdldCBnbG9iYWxCb3VuZHMgKCkge1xuICAgIHJldHVybiB7XG4gICAgICB4OiB0aGlzLmd4LFxuICAgICAgeTogdGhpcy5neSxcbiAgICAgIHdpZHRoOiB0aGlzLmd4ICsgdGhpcy53aWR0aCxcbiAgICAgIGhlaWdodDogdGhpcy5neSArIHRoaXMuaGVpZ2h0XG4gICAgfVxuICB9XG5cbiAgICAvLyBwb3NpdGlvbiBoZWxwZXJzXG4gIHB1dENlbnRlciAoYiwgeE9mZnNldCA9IDAsIHlPZmZzZXQgPSAwKSB7XG4gICAgbGV0IGEgPSB0aGlzXG4gICAgYi54ID0gKGEueCArIGEuaGFsZldpZHRoIC0gYi5oYWxmV2lkdGgpICsgeE9mZnNldFxuICAgIGIueSA9IChhLnkgKyBhLmhhbGZIZWlnaHQgLSBiLmhhbGZIZWlnaHQpICsgeU9mZnNldFxuICB9XG4gIHB1dFRvcCAoYiwgeE9mZnNldCA9IDAsIHlPZmZzZXQgPSAwKSB7XG4gICAgbGV0IGEgPSB0aGlzXG4gICAgYi54ID0gKGEueCArIGEuaGFsZldpZHRoIC0gYi5oYWxmV2lkdGgpICsgeE9mZnNldFxuICAgIGIueSA9IChhLnkgLSBiLmhlaWdodCkgKyB5T2Zmc2V0XG4gIH1cbiAgcHV0Qm90dG9tIChiLCB4T2Zmc2V0ID0gMCwgeU9mZnNldCA9IDApIHtcbiAgICBsZXQgYSA9IHRoaXNcbiAgICBiLnggPSAoYS54ICsgYS5oYWxmV2lkdGggLSBiLmhhbGZXaWR0aCkgKyB4T2Zmc2V0XG4gICAgYi55ID0gKGEueSArIGEuaGVpZ2h0KSArIHlPZmZzZXRcbiAgfVxuICBwdXRSaWdodCAoYiwgeE9mZnNldCA9IDAsIHlPZmZzZXQgPSAwKSB7XG4gICAgbGV0IGEgPSB0aGlzXG4gICAgYi54ID0gKGEueCArIGEud2lkdGgpICsgeE9mZnNldFxuICAgIGIueSA9IChhLnkgKyBhLmhhbGZIZWlnaHQgLSBiLmhhbGZIZWlnaHQpICsgeU9mZnNldFxuICB9XG4gIHB1dExlZnQgKGIsIHhPZmZzZXQgPSAwLCB5T2Zmc2V0ID0gMCkge1xuICAgIGxldCBhID0gdGhpc1xuICAgIGIueCA9IChhLnggLSBiLndpZHRoKSArIHhPZmZzZXRcbiAgICBiLnkgPSAoYS55ICsgYS5oYWxmSGVpZ2h0IC0gYi5oYWxmSGVpZ2h0KSArIHlPZmZzZXRcbiAgfVxuXG4gICAgLy8gYW5pbWF0aW9uIGhlbHBlcnNcbiAgZ2V0IGN1cnJlbnRGcmFtZSAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2N1cnJlbnRGcmFtZVxuICB9XG5cbiAgICAvLyBjaXJjdWxhclxuICBnZXQgY2lyY3VsYXIgKCkge1xuICAgIHJldHVybiB0aGlzLl9jaXJjdWxhclxuICB9XG4gIHNldCBjaXJjdWxhciAodmFsdWUpIHtcbiAgICBpZiAodmFsdWUgPT09IHRydWUgJiYgdGhpcy5fY2lyY3VsYXIgPT09IGZhbHNlKSB7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyh0aGlzLCB7XG4gICAgICAgIGRpYW1ldGVyOiB7XG4gICAgICAgICAgZ2V0ICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLndpZHRoXG4gICAgICAgICAgfSxcbiAgICAgICAgICBzZXQgKHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLndpZHRoID0gdmFsdWVcbiAgICAgICAgICAgIHRoaXMuaGVpZ2h0ID0gdmFsdWVcbiAgICAgICAgICB9LFxuICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH0sXG4gICAgICAgIHJhZGl1czoge1xuICAgICAgICAgIGdldCAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5oYWxmV2lkdGhcbiAgICAgICAgICB9LFxuICAgICAgICAgIHNldCAodmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMud2lkdGggPSB2YWx1ZSAqIDJcbiAgICAgICAgICAgIHRoaXMuaGVpZ2h0ID0gdmFsdWUgKiAyXG4gICAgICAgICAgfSxcbiAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9XG4gICAgICB9KVxuXG4gICAgICB0aGlzLl9jaXJjdWxhciA9IHRydWVcbiAgICB9XG5cbiAgICBpZiAodmFsdWUgPT09IGZhbHNlICYmIHRoaXMuX2NpcmN1bGFyID09PSB0cnVlKSB7XG4gICAgICBkZWxldGUgdGhpcy5kaWFtZXRlclxuICAgICAgZGVsZXRlIHRoaXMucmFkaXVzXG4gICAgICB0aGlzLl9jaXJjdWxhciA9IGZhbHNlXG4gICAgfVxuICB9XG5cbiAgICAvLyBkcmFnZ2FibGVcbiAgZ2V0IGRyYWdnYWJsZSAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2RyYWdnYWJsZVxuICB9XG4gIHNldCBkcmFnZ2FibGUgKHZhbHVlKSB7XG4gICAgaWYgKHZhbHVlID09PSB0cnVlKSB7XG4gICAgICBkcmFnZ2FibGVTcHJpdGVzLnB1c2godGhpcylcbiAgICAgIHRoaXMuX2RyYWdnYWJsZSA9IHRydWVcbiAgICB9XG5cbiAgICBpZiAodmFsdWUgPT09IGZhbHNlKSB7XG4gICAgICBkcmFnZ2FibGVTcHJpdGVzLnNwbGljZShkcmFnZ2FibGVTcHJpdGVzLmluZGV4T2YodGhpcyksIDEpXG4gICAgICB0aGlzLl9kcmFnZ2FibGUgPSBmYWxzZVxuICAgIH1cbiAgfVxuXG4gIGdldCBpbnRlcmFjdGl2ZSAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2ludGVyYWN0aXZlXG4gIH1cbiAgc2V0IGludGVyYWN0aXZlICh2YWx1ZSkge1xuICAgIGlmICh2YWx1ZSA9PT0gdHJ1ZSkge1xuICAgICAgbWFrZUludGVyYWN0aXZlKHRoaXMpXG4gICAgICBidXR0b25zLnB1c2godGhpcylcblxuICAgICAgdGhpcy5faW50ZXJhY3RpdmUgPSB0cnVlXG4gICAgfVxuICAgIGlmICh2YWx1ZSA9PT0gZmFsc2UpIHtcbiAgICAgIGJ1dHRvbnMuc3BsaWNlKGJ1dHRvbnMuaW5kZXhPZih0aGlzKSwgMSlcbiAgICAgIHRoaXMuX2ludGVyYWN0aXZlID0gZmFsc2VcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGxldCBzdGFnZSA9IG5ldyBEaXNwbGF5T2JqZWN0KClcblxuZXhwb3J0IGZ1bmN0aW9uIG1ha2VDYW52YXMgKFxuICAgIHdpZHRoID0gMjU2LCBoZWlnaHQgPSAyNTYsXG4gICAgYm9yZGVyID0gJzFweCBkYXNoZWQgYmxhY2snLFxuICAgIGJhY2tncm91bmRDb2xvciA9ICd3aGl0ZSdcbikge1xuICBsZXQgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJylcbiAgY2FudmFzLndpZHRoID0gd2lkdGhcbiAgY2FudmFzLmhlaWdodCA9IGhlaWdodFxuICBjYW52YXMuc3R5bGUuYm9yZGVyID0gYm9yZGVyXG4gIGNhbnZhcy5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBiYWNrZ3JvdW5kQ29sb3JcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChjYW52YXMpXG5cbiAgY2FudmFzLmN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpXG5cbiAgcmV0dXJuIGNhbnZhc1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyIChjYW52YXMpIHtcbiAgbGV0IGN0eCA9IGNhbnZhcy5jdHhcblxuICBjdHguY2xlYXJSZWN0KDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodClcblxuICAgIC8vIGRyYXcgYmFja2dyb3VuZFxuICBpZiAoc3RhZ2VCYWNrZ3JvdW5kKSB7XG4gICAgc3RhZ2VCYWNrZ3JvdW5kLnJlbmRlcihjdHgpXG4gIH1cblxuICBzdGFnZS5jaGlsZHJlbi5mb3JFYWNoKHNwcml0ZSA9PiB7XG4gICAgZGlzcGxheVNwcml0ZShzcHJpdGUpXG4gIH0pXG5cbiAgZnVuY3Rpb24gZGlzcGxheVNwcml0ZSAoc3ByaXRlKSB7XG4gICAgaWYgKFxuICAgICAgICAgICAgc3ByaXRlLnZpc2libGUgJiZcbiAgICAgICAgICAgIHNwcml0ZS5neCA8IGNhbnZhcy53aWR0aCArIHNwcml0ZS53aWR0aCAmJlxuICAgICAgICAgICAgc3ByaXRlLmd4ICsgc3ByaXRlLndpZHRoID49IC1zcHJpdGUud2lkdGggJiZcbiAgICAgICAgICAgIHNwcml0ZS5neSA8IGNhbnZhcy5oZWlnaHQgKyBzcHJpdGUuaGVpZ2h0ICYmXG4gICAgICAgICAgICBzcHJpdGUuZ3kgKyBzcHJpdGUuaGVpZ2h0ID49IC1zcHJpdGUuaGVpZ2h0XG4gICAgICAgICkge1xuICAgICAgY3R4LnNhdmUoKVxuXG4gICAgICBjdHgudHJhbnNsYXRlKFxuICAgICAgICAgICAgICAgIHNwcml0ZS54ICsgKHNwcml0ZS53aWR0aCAqIHNwcml0ZS5waXZvdFgpLFxuICAgICAgICAgICAgICAgIHNwcml0ZS55ICsgKHNwcml0ZS5oZWlnaHQgKiBzcHJpdGUucGl2b3RZKVxuICAgICAgICAgICAgKVxuXG4gICAgICBjdHgucm90YXRlKHNwcml0ZS5yb3RhdGlvbilcbiAgICAgIGN0eC5nbG9iYWxBbHBoYSA9IHNwcml0ZS5hbHBoYSAqIHNwcml0ZS5wYXJlbnQuYWxwaGFcbiAgICAgIGN0eC5zY2FsZShzcHJpdGUuc2NhbGVYLCBzcHJpdGUuc2NhbGVZKVxuXG4gICAgICBpZiAoc3ByaXRlLnNoYWRvdykge1xuICAgICAgICBjdHguc2hhZG93Q29sb3IgPSBzcHJpdGUuc2hhZG93Q29sb3JcbiAgICAgICAgY3R4LnNoYWRvd09mZnNldFggPSBzcHJpdGUuc2hhZG93T2Zmc2V0WFxuICAgICAgICBjdHguc2hhZG93T2Zmc2V0WSA9IHNwcml0ZS5zaGFkb3dPZmZzZXRZXG4gICAgICAgIGN0eC5zaGFkb3dCbHVyID0gc3ByaXRlLnNoYWRvd0JsdXJcbiAgICAgIH1cblxuICAgICAgaWYgKHNwcml0ZS5ibGVuZE1vZGUpIGN0eC5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSBzcHJpdGUuYmxlbmRNb2RlXG5cbiAgICAgIGlmIChzcHJpdGUucmVuZGVyKSB7XG4gICAgICAgIHNwcml0ZS5yZW5kZXIoY3R4KVxuICAgICAgfVxuXG4gICAgICBpZiAoc3ByaXRlLmNoaWxkcmVuICYmIHNwcml0ZS5jaGlsZHJlbi5sZW5ndGggPiAwKSB7XG4gICAgICAgIGN0eC50cmFuc2xhdGUoLXNwcml0ZS53aWR0aCAqIHNwcml0ZS5waXZvdFgsIC1zcHJpdGUuaGVpZ2h0ICogc3ByaXRlLnBpdm90WSlcblxuICAgICAgICBzcHJpdGUuY2hpbGRyZW4uZm9yRWFjaChjaGlsZCA9PiB7XG4gICAgICAgICAgZGlzcGxheVNwcml0ZShjaGlsZClcbiAgICAgICAgfSlcbiAgICAgIH1cblxuICAgICAgY3R4LnJlc3RvcmUoKVxuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyV2l0aEludGVycG9sYXRpb24gKGNhbnZhcywgbGFnT2Zmc2V0KSB7XG4gIGxldCBjdHggPSBjYW52YXMuY3R4XG5cbiAgY3R4LmNsZWFyUmVjdCgwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpXG5cbiAgc3RhZ2UuY2hpbGRyZW4uZm9yRWFjaChzcHJpdGUgPT4ge1xuICAgIGRpc3BsYXlTcHJpdGUoc3ByaXRlKVxuICB9KVxuXG4gIGZ1bmN0aW9uIGRpc3BsYXlTcHJpdGUgKHNwcml0ZSkge1xuICAgIGlmIChcbiAgICAgICAgICAgIHNwcml0ZS52aXNpYmxlICYmXG4gICAgICAgICAgICBzcHJpdGUuZ3ggPCBjYW52YXMud2lkdGggKyBzcHJpdGUud2lkdGggJiZcbiAgICAgICAgICAgIHNwcml0ZS5neCArIHNwcml0ZS53aWR0aCA+PSAtc3ByaXRlLndpZHRoICYmXG4gICAgICAgICAgICBzcHJpdGUuZ3kgPCBjYW52YXMuaGVpZ2h0ICsgc3ByaXRlLmhlaWdodCAmJlxuICAgICAgICAgICAgc3ByaXRlLmd5ICsgc3ByaXRlLmhlaWdodCA+PSAtc3ByaXRlLmhlaWdodFxuICAgICAgICApIHtcbiAgICAgIGN0eC5zYXZlKClcblxuICAgICAgaWYgKHNwcml0ZS5wcmV2aW91c1ggIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBzcHJpdGUucmVuZGVyWCA9IChzcHJpdGUueCAtIHNwcml0ZS5wcmV2aW91c1gpICogbGFnT2Zmc2V0ICsgc3ByaXRlLnByZXZpb3VzWFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3ByaXRlLnJlbmRlclggPSBzcHJpdGUueFxuICAgICAgfVxuXG4gICAgICBpZiAoc3ByaXRlLnByZXZpb3VzWSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHNwcml0ZS5yZW5kZXJZID0gKHNwcml0ZS55IC0gc3ByaXRlLnByZXZpb3VzWSkgKiBsYWdPZmZzZXQgKyBzcHJpdGUucHJldmlvdXNZXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzcHJpdGUucmVuZGVyWSA9IHNwcml0ZS55XG4gICAgICB9XG5cbiAgICAgIGN0eC50cmFuc2xhdGUoXG4gICAgICAgICAgICAgICAgc3ByaXRlLnJlbmRlclggKyAoc3ByaXRlLndpZHRoICogc3ByaXRlLnBpdm90WCksXG4gICAgICAgICAgICAgICAgc3ByaXRlLnJlbmRlclkgKyAoc3ByaXRlLmhlaWdodCAqIHNwcml0ZS5waXZvdFkpXG4gICAgICAgICAgICApXG5cbiAgICAgIGN0eC5yb3RhdGUoc3ByaXRlLnJvdGF0aW9uKVxuICAgICAgY3R4Lmdsb2JhbEFscGhhID0gc3ByaXRlLmFscGhhICogc3ByaXRlLnBhcmVudC5hbHBoYVxuICAgICAgY3R4LnNjYWxlKHNwcml0ZS5zY2FsZVgsIHNwcml0ZS5zY2FsZVkpXG5cbiAgICAgIGlmIChzcHJpdGUuc2hhZG93KSB7XG4gICAgICAgIGN0eC5zaGFkb3dDb2xvciA9IHNwcml0ZS5zaGFkb3dDb2xvclxuICAgICAgICBjdHguc2hhZG93T2Zmc2V0WCA9IHNwcml0ZS5zaGFkb3dPZmZzZXRYXG4gICAgICAgIGN0eC5zaGFkb3dPZmZzZXRZID0gc3ByaXRlLnNoYWRvd09mZnNldFlcbiAgICAgICAgY3R4LnNoYWRvd0JsdXIgPSBzcHJpdGUuc2hhZG93Qmx1clxuICAgICAgfVxuXG4gICAgICBpZiAoc3ByaXRlLmJsZW5kTW9kZSkgY3R4Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9IHNwcml0ZS5ibGVuZE1vZGVcblxuICAgICAgaWYgKHNwcml0ZS5yZW5kZXIpIHtcbiAgICAgICAgc3ByaXRlLnJlbmRlcihjdHgpXG4gICAgICB9XG5cbiAgICAgIGlmIChzcHJpdGUuY2hpbGRyZW4gJiYgc3ByaXRlLmNoaWxkcmVuLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY3R4LnRyYW5zbGF0ZSgtc3ByaXRlLndpZHRoICogc3ByaXRlLnBpdm90WCwgLXNwcml0ZS5oZWlnaHQgKiBzcHJpdGUucGl2b3RZKVxuXG4gICAgICAgIHNwcml0ZS5jaGlsZHJlbi5mb3JFYWNoKGNoaWxkID0+IHtcbiAgICAgICAgICBkaXNwbGF5U3ByaXRlKGNoaWxkKVxuICAgICAgICB9KVxuICAgICAgfVxuXG4gICAgICBjdHgucmVzdG9yZSgpXG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW1vdmUgKC4uLnNwcml0ZXNUb1JlbW92ZSkge1xuICBzcHJpdGVzVG9SZW1vdmUuZm9yRWFjaChzcHJpdGUgPT4ge1xuICAgIHNwcml0ZS5wYXJlbnQucmVtb3ZlQ2hpbGQoc3ByaXRlKVxuICB9KVxufVxuXG5jbGFzcyBSZWN0YW5nbGUgZXh0ZW5kcyBEaXNwbGF5T2JqZWN0IHtcbiAgY29uc3RydWN0b3IgKFxuICAgICAgICB3aWR0aCA9IDMyLFxuICAgICAgICBoZWlnaHQgPSAzMixcbiAgICAgICAgZmlsbFN0eWxlID0gJ2dyYXknLFxuICAgICAgICBzdHJva2VTdHlsZSA9ICdub25lJyxcbiAgICAgICAgbGluZVdpZHRoID0gMCxcbiAgICAgICAgeCA9IDAsXG4gICAgICAgIHkgPSAwXG4gICAgKSB7XG4gICAgc3VwZXIoKVxuXG4gICAgT2JqZWN0LmFzc2lnbihcbiAgICAgICAgICAgIHRoaXMsIHt3aWR0aCwgaGVpZ2h0LCBmaWxsU3R5bGUsIHN0cm9rZVN0eWxlLCBsaW5lV2lkdGgsIHgsIHl9XG4gICAgICAgIClcblxuICAgIHRoaXMubWFzayA9IGZhbHNlXG4gIH1cblxuICByZW5kZXIgKGN0eCkge1xuICAgIGN0eC5zdHJva2VTdHlsZSA9IHRoaXMuc3Ryb2tlU3R5bGVcbiAgICBjdHgubGluZVdpZHRoID0gdGhpcy5saW5lV2lkdGhcbiAgICBjdHguZmlsbFN0eWxlID0gdGhpcy5maWxsU3R5bGVcblxuICAgIGN0eC5iZWdpblBhdGgoKVxuICAgIGN0eC5yZWN0KFxuICAgICAgICAgICAgLXRoaXMud2lkdGggKiB0aGlzLnBpdm90WCxcbiAgICAgICAgICAgIC10aGlzLmhlaWdodCAqIHRoaXMucGl2b3RZLFxuICAgICAgICAgICAgdGhpcy53aWR0aCxcbiAgICAgICAgICAgIHRoaXMuaGVpZ2h0XG4gICAgICAgIClcblxuICAgIGlmICh0aGlzLnN0cm9rZVN0eWxlICE9PSAnbm9uZScpIGN0eC5zdHJva2UoKVxuICAgIGlmICh0aGlzLmZpbGxTdHlsZSAhPT0gJ25vbmUnKSBjdHguZmlsbCgpXG4gICAgaWYgKHRoaXMubWFzayAmJiB0aGlzLm1hc2sgPT09IHRydWUpIGN0eC5jbGlwKClcbiAgfVxufVxuXG4vLyByZWN0YW5nbGUgd3JhcHBlclxuZXhwb3J0IGZ1bmN0aW9uIHJlY3RhbmdsZSAod2lkdGgsIGhlaWdodCwgZmlsbFN0eWxlLCBzdHJva2VTdHlsZSwgbGluZVdpZHRoLCB4LCB5KSB7XG4gIGxldCBzcHJpdGUgPSBuZXcgUmVjdGFuZ2xlKHdpZHRoLCBoZWlnaHQsIGZpbGxTdHlsZSwgc3Ryb2tlU3R5bGUsIGxpbmVXaWR0aCwgeCwgeSlcbiAgc3RhZ2UuYWRkQ2hpbGQoc3ByaXRlKVxuICByZXR1cm4gc3ByaXRlXG59XG5cbmNsYXNzIENpcmNsZSBleHRlbmRzIERpc3BsYXlPYmplY3Qge1xuICBjb25zdHJ1Y3RvciAoXG4gICAgICAgIGRpYW1ldGVyID0gMzIsXG4gICAgICAgIGZpbGxTdHlsZSA9ICdncmF5JyxcbiAgICAgICAgc3Ryb2tlU3R5bGUgPSAnbm9uZScsXG4gICAgICAgIGxpbmVXaWR0aCA9IDAsXG4gICAgICAgIHggPSAwLFxuICAgICAgICB5ID0gMFxuICAgICkge1xuICAgIHN1cGVyKClcbiAgICB0aGlzLmNpcmN1bGFyID0gdHJ1ZVxuXG4gICAgT2JqZWN0LmFzc2lnbih0aGlzLCB7ZGlhbWV0ZXIsIGZpbGxTdHlsZSwgc3Ryb2tlU3R5bGUsIGxpbmVXaWR0aCwgeCwgeX0pXG5cbiAgICB0aGlzLm1hc2sgPSBmYWxzZVxuICB9XG5cbiAgcmVuZGVyIChjdHgpIHtcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSB0aGlzLnN0cm9rZVN0eWxlXG4gICAgY3R4LmxpbmVXaWR0aCA9IHRoaXMubGluZVdpZHRoXG4gICAgY3R4LmZpbGxTdHlsZSA9IHRoaXMuZmlsbFN0eWxlXG5cbiAgICBjdHguYmVnaW5QYXRoKClcbiAgICBjdHguYXJjKFxuICAgICAgICAgICAgdGhpcy5yYWRpdXMgKyAoLXRoaXMuZGlhbWV0ZXIgKiB0aGlzLnBpdm90WCksXG4gICAgICAgICAgICB0aGlzLnJhZGl1cyArICgtdGhpcy5kaWFtZXRlciAqIHRoaXMucGl2b3RZKSxcbiAgICAgICAgICAgIHRoaXMucmFkaXVzLFxuICAgICAgICAgICAgMCwgMiAqIE1hdGguUEksXG4gICAgICAgICAgICBmYWxzZVxuICAgICAgICApXG5cbiAgICBpZiAodGhpcy5zdHJva2VTdHlsZSAhPT0gJ25vbmUnKSBjdHguc3Ryb2tlKClcbiAgICBpZiAodGhpcy5maWxsU3R5bGUgIT09ICdub25lJykgY3R4LmZpbGwoKVxuICAgIGlmICh0aGlzLm1hc2sgJiYgdGhpcy5tYXNrID09PSB0cnVlKSBjdHguY2xpcCgpXG4gIH1cbn1cblxuLy8gY2lyY2xlIHdyYXBwZXJcbmV4cG9ydCBmdW5jdGlvbiBjaXJjbGUgKGRpYW1ldGVyLCBmaWxsU3R5bGUsIHN0cm9rZVN0eWxlLCBsaW5lV2lkdGgsIHgsIHkpIHtcbiAgbGV0IHNwcml0ZSA9IG5ldyBDaXJjbGUoZGlhbWV0ZXIsIGZpbGxTdHlsZSwgc3Ryb2tlU3R5bGUsIGxpbmVXaWR0aCwgeCwgeSlcbiAgc3RhZ2UuYWRkQ2hpbGQoc3ByaXRlKVxuICByZXR1cm4gc3ByaXRlXG59XG5cbmNsYXNzIExpbmUgZXh0ZW5kcyBEaXNwbGF5T2JqZWN0IHtcbiAgY29uc3RydWN0b3IgKFxuICAgICAgICBzdHJva2VTdHlsZSA9ICdub25lJyxcbiAgICAgICAgbGluZVdpZHRoID0gMSxcbiAgICAgICAgYXggPSAwLFxuICAgICAgICBheSA9IDAsXG4gICAgICAgIGJ4ID0gMzIsXG4gICAgICAgIGJ5ID0gMzJcbiAgICApIHtcbiAgICBzdXBlcigpXG5cbiAgICBPYmplY3QuYXNzaWduKHRoaXMsIHtzdHJva2VTdHlsZSwgbGluZVdpZHRoLCBheCwgYXksIGJ4LCBieX0pXG5cbiAgICB0aGlzLmxpbmVKb2luID0gJ3JvdW5kJ1xuICB9XG5cbiAgcmVuZGVyIChjdHgpIHtcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSB0aGlzLnN0cm9rZVN0eWxlXG4gICAgY3R4LmxpbmVXaWR0aCA9IHRoaXMubGluZVdpZHRoXG5cbiAgICBjdHguYmVnaW5QYXRoKClcbiAgICBjdHgubW92ZVRvKHRoaXMuYXgsIHRoaXMuYXkpXG4gICAgY3R4LmxpbmVUbyh0aGlzLmJ4LCB0aGlzLmJ5KVxuXG4gICAgaWYgKHRoaXMuc3Ryb2tlU3R5bGUgIT09ICdub25lJykgY3R4LnN0cm9rZSgpXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxpbmUgKHN0cm9rZVN0eWxlLCBsaW5lV2lkdGgsIGF4LCBheSwgYngsIGJ5KSB7XG4gIGxldCBzcHJpdGUgPSBuZXcgTGluZShzdHJva2VTdHlsZSwgbGluZVdpZHRoLCBheCwgYXksIGJ4LCBieSlcbiAgc3RhZ2UuYWRkQ2hpbGQoc3ByaXRlKVxuICByZXR1cm4gc3ByaXRlXG59XG5cbmNsYXNzIFRleHQgZXh0ZW5kcyBEaXNwbGF5T2JqZWN0IHtcbiAgY29uc3RydWN0b3IgKFxuICAgICAgICBjb250ZW50ID0gJ0hlbGxvIScsXG4gICAgICAgIGZvbnQgPSAnMTJweCBzYW5zLXNlcmlmJyxcbiAgICAgICAgZmlsbFN0eWxlID0gJ3JlZCcsXG4gICAgICAgIHggPSAwLFxuICAgICAgICB5ID0gMFxuICAgICkge1xuICAgIHN1cGVyKClcblxuICAgIE9iamVjdC5hc3NpZ24odGhpcywge2NvbnRlbnQsIGZvbnQsIGZpbGxTdHlsZSwgeCwgeX0pXG5cbiAgICB0aGlzLnRleHRCYXNlbGluZSA9ICd0b3AnXG4gICAgdGhpcy5zdHJva2VUZXh0ID0gJ25vbmUnXG4gIH1cblxuICByZW5kZXIgKGN0eCkge1xuICAgIGN0eC5mb250ID0gdGhpcy5mb250XG4gICAgY3R4LnN0cm9rZVN0eWxlID0gdGhpcy5zdHJva2VTdHlsZVxuICAgIGN0eC5saW5lV2lkdGggPSB0aGlzLmxpbmVXaWR0aFxuICAgIGN0eC5maWxsU3R5bGUgPSB0aGlzLmZpbGxTdHlsZVxuXG4gICAgaWYgKHRoaXMud2lkdGggPT09IDApIHRoaXMud2lkdGggPSBjdHgubWVhc3VyZVRleHQodGhpcy5jb250ZW50KS53aWR0aFxuICAgIGlmICh0aGlzLmhlaWdodCA9PT0gMCkgdGhpcy5oZWlnaHQgPSBjdHgubWVhc3VyZVRleHQoJ00nKS53aWR0aFxuXG4gICAgY3R4LnRyYW5zbGF0ZShcbiAgICAgICAgICAgIC10aGlzLndpZHRoICogdGhpcy5waXZvdFgsXG4gICAgICAgICAgICAtdGhpcy5oZWlnaHQgKiB0aGlzLnBpdm90WVxuICAgICAgICApXG5cbiAgICBjdHgudGV4dEJhc2VsaW5lID0gdGhpcy50ZXh0QmFzZWxpbmVcblxuICAgIGN0eC5maWxsVGV4dChcbiAgICAgICAgICAgIHRoaXMuY29udGVudCwgMCwgMFxuICAgICAgICApXG5cbiAgICBpZiAodGhpcy5zdHJva2VUZXh0ICE9PSAnbm9uZScpIGN0eC5zdHJva2UoKVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0ZXh0IChjb250ZW50LCBmb250LCBmaWxsU3R5bGUsIHgsIHkpIHtcbiAgbGV0IHNwcml0ZSA9IG5ldyBUZXh0KGNvbnRlbnQsIGZvbnQsIGZpbGxTdHlsZSwgeCwgeSlcbiAgc3RhZ2UuYWRkQ2hpbGQoc3ByaXRlKVxuICByZXR1cm4gc3ByaXRlXG59XG5cbmNsYXNzIEdyb3VwIGV4dGVuZHMgRGlzcGxheU9iamVjdCB7XG4gIGNvbnN0cnVjdG9yICguLi5zcHJpdGVzVG9Hcm91cCkge1xuICAgIHN1cGVyKClcblxuICAgIHNwcml0ZXNUb0dyb3VwLmZvckVhY2goc3ByaXRlID0+IHRoaXMuYWRkQ2hpbGQoc3ByaXRlKSlcbiAgfVxuXG4gIGFkZENoaWxkIChzcHJpdGUpIHtcbiAgICBpZiAoc3ByaXRlLnBhcmVudCkge1xuICAgICAgc3ByaXRlLnBhcmVudC5yZW1vdmVDaGlsZChzcHJpdGUpXG4gICAgfVxuICAgIHNwcml0ZS5wYXJlbnQgPSB0aGlzXG4gICAgdGhpcy5jaGlsZHJlbi5wdXNoKHNwcml0ZSlcblxuICAgIHRoaXMuY2FsY3VsYXRlU2l6ZSgpXG4gIH1cblxuICByZW1vdmVDaGlsZCAoc3ByaXRlKSB7XG4gICAgaWYgKHNwcml0ZS5wYXJlbnQgPT09IHRoaXMpIHtcbiAgICAgIHRoaXMuY2hpbGRyZW4uc3BsaWNlKHRoaXMuY2hpbGRyZW4uaW5kZXhPZihzcHJpdGUpLCAxKVxuICAgICAgdGhpcy5jYWxjdWxhdGVTaXplKClcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGAke3Nwcml0ZX0gaXMgbm90IGNoaWxkIG9mICR7dGhpc31gKVxuICAgIH1cbiAgfVxuXG4gIGNhbGN1bGF0ZVNpemUgKCkge1xuICAgIGlmICh0aGlzLmNoaWxkcmVuLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMuX25ld1dpZHRoID0gMFxuICAgICAgdGhpcy5fbmV3SGVpZ2h0ID0gMFxuXG4gICAgICB0aGlzLmNoaWxkcmVuLmZvckVhY2goY2hpbGQgPT4ge1xuICAgICAgICBpZiAoY2hpbGQueCArIGNoaWxkLndpZHRoID4gdGhpcy5fbmV3V2lkdGgpIHtcbiAgICAgICAgICB0aGlzLl9uZXdXaWR0aCA9IGNoaWxkLnggKyBjaGlsZC53aWR0aFxuICAgICAgICB9XG4gICAgICAgIGlmIChjaGlsZC55ICsgY2hpbGQuaGVpZ2h0ID4gdGhpcy5fbmV3SGVpZ2h0KSB7XG4gICAgICAgICAgdGhpcy5fbmV3SGVpZ2h0ID0gY2hpbGQueSArIGNoaWxkLmhlaWdodFxuICAgICAgICB9XG4gICAgICB9KVxuXG4gICAgICB0aGlzLndpZHRoID0gdGhpcy5fbmV3V2lkdGhcbiAgICAgIHRoaXMuaGVpZ2h0ID0gdGhpcy5fbmV3SGVpZ2h0XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBncm91cCAoLi4uc3ByaXRlc1RvR3JvdXApIHtcbiAgbGV0IHNwcml0ZSA9IG5ldyBHcm91cCguLi5zcHJpdGVzVG9Hcm91cClcbiAgc3RhZ2UuYWRkQ2hpbGQoc3ByaXRlKVxuICByZXR1cm4gc3ByaXRlXG59XG5cbmNsYXNzIFNwcml0ZSBleHRlbmRzIERpc3BsYXlPYmplY3Qge1xuICBjb25zdHJ1Y3RvciAoXG4gICAgICAgIHNvdXJjZSxcbiAgICAgICAgeCA9IDAsXG4gICAgICAgIHkgPSAwXG4gICAgKSB7XG4gICAgc3VwZXIoKVxuXG4gICAgT2JqZWN0LmFzc2lnbih0aGlzLCB7eCwgeX0pXG5cbiAgICBpZiAoc291cmNlIGluc3RhbmNlb2YgSW1hZ2UpIHtcbiAgICAgIHRoaXMuY3JlYXRlRnJvbUltYWdlKHNvdXJjZSlcbiAgICB9IGVsc2UgaWYgKHNvdXJjZS5uYW1lKSB7XG4gICAgICB0aGlzLmNyZWF0ZUZyb21BdGxhcyhzb3VyY2UpXG4gICAgfSBlbHNlIGlmIChzb3VyY2UuaW1hZ2UgJiYgIXNvdXJjZS5kYXRhKSB7XG4gICAgICB0aGlzLmNyZWF0ZUZyb21UaWxlc2V0KHNvdXJjZSlcbiAgICB9IGVsc2UgaWYgKHNvdXJjZS5pbWFnZSAmJiBzb3VyY2UuZGF0YSkge1xuICAgICAgdGhpcy5jcmVhdGVGcm9tVGlsZXNldEZyYW1lcyhzb3VyY2UpXG4gICAgfSBlbHNlIGlmIChzb3VyY2UgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgaWYgKHNvdXJjZVswXSAmJiBzb3VyY2VbMF0uc291cmNlKSB7XG4gICAgICAgIHRoaXMuY3JlYXRlRnJvbUF0bGFzRnJhbWVzKHNvdXJjZSlcbiAgICAgIH0gZWxzZSBpZiAoc291cmNlWzBdIGluc3RhbmNlb2YgSW1hZ2UpIHtcbiAgICAgICAgdGhpcy5jcmVhdGVGcm9tSW1hZ2VzKHNvdXJjZSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgVGhlIGltYWdlIHNvdXJjZXMgaW4gJHtzb3VyY2V9IGFyZSBub3QgcmVjb2duaXplZGApXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVGhlIGltYWdlIHNvdXJjZSAke3NvdXJjZX0gaXMgbm90IHJlY29nbml6ZWRgKVxuICAgIH1cbiAgfVxuXG4gIGNyZWF0ZUZyb21JbWFnZSAoc291cmNlKSB7XG4gICAgaWYgKCEoc291cmNlIGluc3RhbmNlb2YgSW1hZ2UpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYCR7c291cmNlfSBpcyBub3QgYW4gaW1hZ2Ugb2JqZWN0YClcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zb3VyY2UgPSBzb3VyY2VcbiAgICAgIHRoaXMuc291cmNlWCA9IDBcbiAgICAgIHRoaXMuc291cmNlWSA9IDBcbiAgICAgIHRoaXMuc291cmNlV2lkdGggPSBzb3VyY2Uud2lkdGhcbiAgICAgIHRoaXMuc291cmNlSGVpZ2h0ID0gc291cmNlLmhlaWdodFxuXG4gICAgICB0aGlzLndpZHRoID0gc291cmNlLndpZHRoXG4gICAgICB0aGlzLmhlaWdodCA9IHNvdXJjZS5oZWlnaHRcbiAgICB9XG4gIH1cblxuICBjcmVhdGVGcm9tQXRsYXMgKHNvdXJjZSkge1xuICAgIHRoaXMudGlsZXNldEZyYW1lID0gc291cmNlXG4gICAgdGhpcy5zb3VyY2UgPSB0aGlzLnRpbGVzZXRGcmFtZS5zb3VyY2VcbiAgICB0aGlzLnNvdXJjZVggPSB0aGlzLnRpbGVzZXRGcmFtZS5zeFxuICAgIHRoaXMuc291cmNlWSA9IHRoaXMudGlsZXNldEZyYW1lLnN5XG4gICAgdGhpcy5zb3VyY2VXaWR0aCA9IHNvdXJjZS50aWxld1xuICAgIHRoaXMuc291cmNlSGVpZ2h0ID0gc291cmNlLnRpbGVoXG5cbiAgICB0aGlzLndpZHRoID0gdGhpcy50aWxlc2V0RnJhbWUud1xuICAgIHRoaXMuaGVpZ2h0ID0gdGhpcy50aWxlc2V0RnJhbWUuaFxuICB9XG5cbiAgY3JlYXRlRnJvbVRpbGVzZXQgKHNvdXJjZSkge1xuICAgIGlmICghKHNvdXJjZS5pbWFnZSBpbnN0YW5jZW9mIEltYWdlKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGAke3NvdXJjZS5pbWFnZX0gaXMgbm90IGFuIGltYWdlIG9iamVjdGApXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc291cmNlID0gc291cmNlLmltYWdlXG5cbiAgICAgIHRoaXMuc291cmNlWCA9IHNvdXJjZS54XG4gICAgICB0aGlzLnNvdXJjZVkgPSBzb3VyY2UueVxuICAgICAgdGhpcy5zb3VyY2VXaWR0aCA9IHNvdXJjZS53aWR0aFxuICAgICAgdGhpcy5zb3VyY2VIZWlnaHQgPSBzb3VyY2UuaGVpZ2h0XG5cbiAgICAgIHRoaXMud2lkdGggPSBzb3VyY2Uud2lkdGhcbiAgICAgIHRoaXMuaGVpZ2h0ID0gc291cmNlLmhlaWdodFxuICAgIH1cbiAgfVxuXG4gIGNyZWF0ZUZyb21UaWxlc2V0RnJhbWVzIChzb3VyY2UpIHtcbiAgICBpZiAoIShzb3VyY2UuaW1hZ2UgaW5zdGFuY2VvZiBJbWFnZSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgJHtzb3VyY2UuaW1hZ2V9IGlzIG5vdCBhbiBpbWFnZSBvYmplY3RgKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnNvdXJjZSA9IHNvdXJjZS5pbWFnZVxuICAgICAgdGhpcy5mcmFtZXMgPSBzb3VyY2UuZGF0YVxuXG4gICAgICB0aGlzLnNvdXJjZVggPSB0aGlzLmZyYW1lc1swXVswXVxuICAgICAgdGhpcy5zb3VyY2VZID0gdGhpcy5mcmFtZXNbMF1bMV1cbiAgICAgIHRoaXMuc291cmNlV2lkdGggPSBzb3VyY2Uud2lkdGhcbiAgICAgIHRoaXMuc291cmNlSGVpZ2h0ID0gc291cmNlLmhlaWdodFxuXG4gICAgICB0aGlzLndpZHRoID0gc291cmNlLndpZHRoXG4gICAgICB0aGlzLmhlaWdodCA9IHNvdXJjZS5oZWlnaHRcbiAgICB9XG4gIH1cblxuICBjcmVhdGVGcm9tQXRsYXNGcmFtZXMgKHNvdXJjZSkge1xuICAgIHRoaXMuZnJhbWVzID0gc291cmNlXG4gICAgdGhpcy5zb3VyY2UgPSBzb3VyY2VbMF0uc291cmNlXG4gICAgdGhpcy5zb3VyY2VYID0gc291cmNlWzBdLmZyYW1lLnhcbiAgICB0aGlzLnNvdXJjZVkgPSBzb3VyY2VbMF0uZnJhbWUueVxuICAgIHRoaXMuc291cmNlV2lkdGggPSBzb3VyY2VbMF0uZnJhbWUud1xuICAgIHRoaXMuc291cmNlSGVpZ2h0ID0gc291cmNlWzBdLmZyYW1lLmhcblxuICAgIHRoaXMud2lkdGggPSBzb3VyY2VbMF0uZnJhbWUud1xuICAgIHRoaXMuaGVpZ2h0ID0gc291cmNlWzBdLmZyYW1lLmhcbiAgfVxuXG4gIGNyZWF0ZUZyb21JbWFnZXMgKHNvdXJjZSkge1xuICAgIHRoaXMuZnJhbWVzID0gc291cmNlXG4gICAgdGhpcy5zb3VyY2UgPSBzb3VyY2VbMF1cbiAgICB0aGlzLnNvdXJjZVggPSAwXG4gICAgdGhpcy5zb3VyY2VZID0gMFxuICAgIHRoaXMuc291cmNlV2lkdGggPSBzb3VyY2VbMF0ud2lkdGhcbiAgICB0aGlzLnNvdXJjZUhlaWdodCA9IHNvdXJjZVswXS5oZWlnaHRcblxuICAgIHRoaXMud2lkdGggPSBzb3VyY2VbMF0ud2lkdGhcbiAgICB0aGlzLmhlaWdodCA9IHNvdXJjZVswXS5oZWlnaHRcbiAgfVxuXG4gIGdvdG9BbmRTdG9wIChmcmFtZU51bWJlcikge1xuICAgIGlmICh0aGlzLmZyYW1lcy5sZW5ndGggPiAwICYmIGZyYW1lTnVtYmVyIDwgdGhpcy5mcmFtZXMubGVuZ3RoKSB7XG4gICAgICBpZiAodGhpcy5mcmFtZXNbMF0gaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICB0aGlzLnNvdXJjZVggPSB0aGlzLmZyYW1lc1tmcmFtZU51bWJlcl1bMF1cbiAgICAgICAgdGhpcy5zb3VyY2VZID0gdGhpcy5mcmFtZXNbZnJhbWVOdW1iZXJdWzFdXG4gICAgICB9IGVsc2UgaWYgKHRoaXMuZnJhbWVzW2ZyYW1lTnVtYmVyXS5mcmFtZSkge1xuICAgICAgICB0aGlzLnNvdXJjZVggPSB0aGlzLmZyYW1lc1tmcmFtZU51bWJlcl0uZnJhbWUueFxuICAgICAgICB0aGlzLnNvdXJjZVkgPSB0aGlzLmZyYW1lc1tmcmFtZU51bWJlcl0uZnJhbWUueVxuICAgICAgICB0aGlzLnNvdXJjZVdpZHRoID0gdGhpcy5mcmFtZXNbZnJhbWVOdW1iZXJdLmZyYW1lLndcbiAgICAgICAgdGhpcy5zb3VyY2VIZWlnaHQgPSB0aGlzLmZyYW1lc1tmcmFtZU51bWJlcl0uZnJhbWUuaFxuICAgICAgICB0aGlzLndpZHRoID0gdGhpcy5mcmFtZXNbZnJhbWVOdW1iZXJdLmZyYW1lLndcbiAgICAgICAgdGhpcy5oZWlnaHQgPSB0aGlzLmZyYW1lc1tmcmFtZU51bWJlcl0uZnJhbWUuaFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5zb3VyY2UgPSB0aGlzLmZyYW1lc1tmcmFtZU51bWJlcl1cbiAgICAgICAgdGhpcy5zb3VyY2VYID0gMFxuICAgICAgICB0aGlzLnNvdXJjZVkgPSAwXG4gICAgICAgIHRoaXMuc291cmNlV2lkdGggPSB0aGlzLnNvdXJjZS53aWR0aFxuICAgICAgICB0aGlzLnNvdXJjZUhlaWdodCA9IHRoaXMuc291cmNlLmhlaWdodFxuICAgICAgICB0aGlzLndpZHRoID0gdGhpcy5zb3VyY2Uud2lkdGhcbiAgICAgICAgdGhpcy5oZWlnaHQgPSB0aGlzLnNvdXJjZS5oZWlnaHRcbiAgICAgIH1cblxuICAgICAgdGhpcy5fY3VycmVudEZyYW1lID0gZnJhbWVOdW1iZXJcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBGcmFtZSBudW1iZXIgJHtmcmFtZU51bWJlcn0gZG9lcyBub3QgZXhpc3RzIWApXG4gICAgfVxuICB9XG5cbiAgcmVuZGVyIChjdHgpIHtcbiAgICBjdHguZHJhd0ltYWdlKFxuICAgICAgICAgICAgdGhpcy5zb3VyY2UsXG4gICAgICAgICAgICB0aGlzLnNvdXJjZVgsIHRoaXMuc291cmNlWSxcbiAgICAgICAgICAgIHRoaXMuc291cmNlV2lkdGgsIHRoaXMuc291cmNlSGVpZ2h0LFxuICAgICAgICAgICAgLXRoaXMud2lkdGggKiB0aGlzLnBpdm90WCxcbiAgICAgICAgICAgIC10aGlzLmhlaWdodCAqIHRoaXMucGl2b3RZLFxuICAgICAgICAgICAgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHRcbiAgICAgICAgKVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzcHJpdGUgKHNvdXJjZSwgeCwgeSkge1xuICBsZXQgc3ByaXRlID0gbmV3IFNwcml0ZShzb3VyY2UsIHgsIHkpXG4gIGlmIChzcHJpdGUuZnJhbWVzLmxlbmd0aCA+IDApIGFkZFN0YXRlUGxheWVyKHNwcml0ZSlcbiAgc3RhZ2UuYWRkQ2hpbGQoc3ByaXRlKVxuICByZXR1cm4gc3ByaXRlXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmcmFtZSAoc291cmNlLCB4LCB5LCB3aWR0aCwgaGVpZ2h0KSB7XG4gIHZhciBvID0ge31cbiAgby5pbWFnZSA9IHNvdXJjZVxuICBvLnggPSB4XG4gIG8ueSA9IHlcbiAgby53aWR0aCA9IHdpZHRoXG4gIG8uaGVpZ2h0ID0gaGVpZ2h0XG4gIHJldHVybiBvXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmcmFtZXMgKHNvdXJjZSwgYXJyYXlPZlBvc2l0aW9ucywgd2lkdGgsIGhlaWdodCkge1xuICB2YXIgbyA9IHt9XG4gIG8uaW1hZ2UgPSBzb3VyY2VcbiAgby5kYXRhID0gYXJyYXlPZlBvc2l0aW9uc1xuICBvLndpZHRoID0gd2lkdGhcbiAgby5oZWlnaHQgPSBoZWlnaHRcbiAgcmV0dXJuIG9cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZpbG1zdHJpcCAoaW1hZ2UsIGZyYW1lV2lkdGgsIGZyYW1lSGVpZ2h0LCBzcGFjaW5nID0gMCkge1xuICBsZXQgcG9zaXRpb25zID0gW11cblxuICBsZXQgY29sdW1ucyA9IGltYWdlLndpZHRoIC8gZnJhbWVXaWR0aFxuICBsZXQgcm93cyA9IGltYWdlLmhlaWdodCAvIGZyYW1lSGVpZ2h0XG5cbiAgbGV0IG51bWJlck9mRnJhbWVzID0gY29sdW1ucyAqIHJvd3NcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IG51bWJlck9mRnJhbWVzOyBpKyspIHtcbiAgICBsZXQgeCA9IChpICUgY29sdW1ucykgKiBmcmFtZVdpZHRoXG4gICAgbGV0IHkgPSBNYXRoLmZsb29yKGkgLyBjb2x1bW5zKSAqIGZyYW1lSGVpZ2h0XG5cbiAgICBpZiAoc3BhY2luZyAmJiBzcGFjaW5nID4gMCkge1xuICAgICAgeCArPSBzcGFjaW5nICsgKHNwYWNpbmcgKiBpICUgY29sdW1ucylcbiAgICAgIHkgKz0gc3BhY2luZyArIChzcGFjaW5nICogTWF0aC5mbG9vcihpIC8gY29sdW1ucykpXG4gICAgfVxuXG4gICAgcG9zaXRpb25zLnB1c2goW3gsIHldKVxuICB9XG5cbiAgcmV0dXJuIGZyYW1lcyhpbWFnZSwgcG9zaXRpb25zLCBmcmFtZVdpZHRoLCBmcmFtZUhlaWdodClcbn1cblxuY2xhc3MgQnV0dG9uIGV4dGVuZHMgU3ByaXRlIHtcbiAgY29uc3RydWN0b3IgKHNvdXJjZSwgeCA9IDAsIHkgPSAwKSB7XG4gICAgc3VwZXIoc291cmNlLCB4LCB5KVxuICAgIHRoaXMuaW50ZXJhY3RpdmUgPSB0cnVlXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJ1dHRvbiAoc291cmNlLCB4LCB5KSB7XG4gIGxldCBzcHJpdGUgPSBuZXcgQnV0dG9uKHNvdXJjZSwgeCwgeSlcbiAgc3RhZ2UuYWRkQ2hpbGQoc3ByaXRlKVxuICByZXR1cm4gc3ByaXRlXG59XG5cbmZ1bmN0aW9uIG1ha2VJbnRlcmFjdGl2ZSAobykge1xuICBvLnByZXNzID0gby5wcmVzcyB8fCB1bmRlZmluZWRcbiAgby5yZWxlYXNlID0gby5yZWxlYXNlIHx8IHVuZGVmaW5lZFxuICBvLm92ZXIgPSBvLm92ZXIgfHwgdW5kZWZpbmVkXG4gIG8ub3V0ID0gby5vdXQgfHwgdW5kZWZpbmVkXG4gIG8udGFwID0gby50YXAgfHwgdW5kZWZpbmVkXG5cbiAgby5zdGF0ZSA9ICd1cCdcblxuICBvLmFjdGlvbiA9ICcnXG5cbiAgby5wcmVzc2VkID0gZmFsc2VcbiAgby5ob3Zlck92ZXIgPSBmYWxzZVxuXG4gIG8udXBkYXRlID0gKHBvaW50ZXIpID0+IHtcbiAgICBsZXQgaGl0ID0gcG9pbnRlci5oaXRUZXN0U3ByaXRlKG8pXG5cbiAgICBpZiAocG9pbnRlci5pc1VwKSB7XG4gICAgICBvLnN0YXRlID0gJ3VwJ1xuICAgICAgaWYgKG8gaW5zdGFuY2VvZiBCdXR0b24pIG8uZ290b0FuZFN0b3AoMClcbiAgICB9XG5cbiAgICBpZiAoaGl0KSB7XG4gICAgICBvLnN0YXRlID0gJ292ZXInXG5cbiAgICAgIGlmIChvLmZyYW1lcyAmJiBvLmZyYW1lcy5sZW5ndGggPT09IDMgJiYgbyBpbnN0YW5jZW9mIEJ1dHRvbikge1xuICAgICAgICBvLmdvdG9BbmRTdG9wKDEpXG4gICAgICB9XG5cbiAgICAgIGlmIChwb2ludGVyLmlzRG93bikge1xuICAgICAgICBvLnN0YXRlID0gJ2Rvd24nXG5cbiAgICAgICAgaWYgKG8gaW5zdGFuY2VvZiBCdXR0b24pIHtcbiAgICAgICAgICBpZiAoby5mcmFtZXMubGVuZ3RoID09PSAzKSB7XG4gICAgICAgICAgICBvLmdvdG9BbmRTdG9wKDIpXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG8uZ290b0FuZFN0b3AoMSlcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoby5zdGF0ZSA9PT0gJ2Rvd24nKSB7XG4gICAgICBpZiAoIW8ucHJlc3NlZCkge1xuICAgICAgICBpZiAoby5wcmVzcykgby5wcmVzcygpXG4gICAgICAgIG8ucHJlc3NlZCA9IHRydWVcbiAgICAgICAgby5hY3Rpb24gPSAncHJlc3NlZCdcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoby5zdGF0ZSA9PT0gJ292ZXInKSB7XG4gICAgICBpZiAoby5wcmVzc2VkKSB7XG4gICAgICAgIGlmIChvLnJlbGVhc2UpIG8ucmVsZWFzZSgpXG4gICAgICAgIG8ucHJlc3NlZCA9IGZhbHNlXG4gICAgICAgIG8uYWN0aW9uID0gJ3JlbGVhc2VkJ1xuXG4gICAgICAgIGlmIChwb2ludGVyLnRhcHBlZCAmJiBvLnRhcCkgby50YXAoKVxuICAgICAgfVxuXG4gICAgICBpZiAoIW8uaG92ZXJPdmVyKSB7XG4gICAgICAgIGlmIChvLm92ZXIpIG8ub3ZlcigpXG4gICAgICAgIG8uaG92ZXJPdmVyID0gdHJ1ZVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChvLnN0YXRlID09PSAndXAnKSB7XG4gICAgICBpZiAoby5wcmVzc2VkKSB7XG4gICAgICAgIGlmIChvLnJlbGVhc2UpIG8ucmVsZWFzZSgpXG4gICAgICAgIG8ucHJlc3NlZCA9IGZhbHNlXG4gICAgICAgIG8uYWN0aW9uID0gJ3JlbGVhc2VkJ1xuICAgICAgfVxuXG4gICAgICBpZiAoby5ob3Zlck92ZXIpIHtcbiAgICAgICAgaWYgKG8ub3V0KSBvLm91dCgpXG4gICAgICAgIG8uaG92ZXJPdmVyID0gZmFsc2VcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gYWRkU3RhdGVQbGF5ZXIgKHNwcml0ZSkge1xuICBsZXQgZnJhbWVDb3VudGVyID0gMFxuICBsZXQgbnVtYmVyT2ZGcmFtZXMgPSAwXG4gIGxldCBzdGFydEZyYW1lID0gMFxuICBsZXQgZW5kRnJhbWUgPSAwXG4gIGxldCB0aW1lSW50ZXJ2YWxcblxuICBmdW5jdGlvbiBzaG93IChmcmFtZU51bWJlcikge1xuICAgIHJlc2V0KClcbiAgICBzcHJpdGUuZ290b0FuZFN0b3AoZnJhbWVOdW1iZXIpXG4gIH1cblxuICBmdW5jdGlvbiBwbGF5ICgpIHtcbiAgICBwbGF5U2VxdWVuY2UoWzAsIHNwcml0ZS5mcmFtZXMubGVuZ3RoIC0gMV0pXG4gIH1cblxuICBmdW5jdGlvbiBzdG9wICgpIHtcbiAgICByZXNldCgpXG4gICAgc3ByaXRlLmdvdG9BbmRTdG9wKHNwcml0ZS5jdXJyZW50RnJhbWUpXG4gIH1cblxuICBmdW5jdGlvbiBwbGF5U2VxdWVuY2UgKHNlcXVlbmNlQXJyYXkpIHtcbiAgICByZXNldCgpXG5cbiAgICBzdGFydEZyYW1lID0gc2VxdWVuY2VBcnJheVswXVxuICAgIGVuZEZyYW1lID0gc2VxdWVuY2VBcnJheVsxXVxuICAgIG51bWJlck9mRnJhbWVzID0gZW5kRnJhbWUgLSBzdGFydEZyYW1lXG5cbiAgICBpZiAoc3RhcnRGcmFtZSA9PT0gMCkge1xuICAgICAgbnVtYmVyT2ZGcmFtZXMgKz0gMVxuICAgICAgZnJhbWVDb3VudGVyICs9IDFcbiAgICB9XG5cbiAgICBpZiAobnVtYmVyT2ZGcmFtZXMgPT09IDEpIHtcbiAgICAgIG51bWJlck9mRnJhbWVzID0gMlxuICAgICAgZnJhbWVDb3VudGVyICs9IDFcbiAgICB9XG5cbiAgICBpZiAoIXNwcml0ZS5mcHMpIHNwcml0ZS5mcHMgPSAxMlxuICAgIGxldCBmcmFtZVJhdGUgPSAxMDAwIC8gc3ByaXRlLmZwc1xuXG4gICAgc3ByaXRlLmdvdG9BbmRTdG9wKHN0YXJ0RnJhbWUpXG5cbiAgICBpZiAoIXNwcml0ZS5wbGF5aW5nKSB7XG4gICAgICB0aW1lSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbChhZHZhbmNlRnJhbWUuYmluZCh0aGlzKSwgZnJhbWVSYXRlKVxuICAgICAgc3ByaXRlLnBsYXlpbmcgPSB0cnVlXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gYWR2YW5jZUZyYW1lICgpIHtcbiAgICBpZiAoZnJhbWVDb3VudGVyIDwgbnVtYmVyT2ZGcmFtZXMpIHtcbiAgICAgIHNwcml0ZS5nb3RvQW5kU3RvcChzcHJpdGUuY3VycmVudEZyYW1lICsgMSlcbiAgICAgIGZyYW1lQ291bnRlciArPSAxXG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChzcHJpdGUubG9vcCkge1xuICAgICAgICBzcHJpdGUuZ290b0FuZFN0b3Aoc3RhcnRGcmFtZSlcbiAgICAgICAgZnJhbWVDb3VudGVyID0gMVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHJlc2V0ICgpIHtcbiAgICBpZiAodGltZUludGVydmFsICE9PSB1bmRlZmluZWQgJiYgc3ByaXRlLnBsYXlpbmcgPT09IHRydWUpIHtcbiAgICAgIHNwcml0ZS5wbGF5aW5nID0gZmFsc2VcbiAgICAgIGZyYW1lQ291bnRlciA9IDBcbiAgICAgIHN0YXJ0RnJhbWUgPSAwXG4gICAgICBlbmRGcmFtZSA9IDBcbiAgICAgIG51bWJlck9mRnJhbWVzID0gMFxuICAgICAgY2xlYXJJbnRlcnZhbCh0aW1lSW50ZXJ2YWwpXG4gICAgfVxuICB9XG5cbiAgc3ByaXRlLnNob3cgPSBzaG93XG4gIHNwcml0ZS5wbGF5ID0gcGxheVxuICBzcHJpdGUuc3RvcCA9IHN0b3BcbiAgc3ByaXRlLnBsYXlTZXF1ZW5jZSA9IHBsYXlTZXF1ZW5jZVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFydGljbGVFZmZlY3QgKFxuICAgIHggPSAwLFxuICAgIHkgPSAwLFxuICAgIHNwcml0ZUZ1bmN0aW9uID0gKCkgPT4gY2lyY2xlKDEwLCAncmVkJyksXG4gICAgbnVtYmVyT2ZQYXJ0aWNsZXMgPSAxMCxcbiAgICBncmF2aXR5ID0gMCxcbiAgICByYW5kb21TcGFjaW5nID0gdHJ1ZSxcbiAgICBtaW5BbmdsZSA9IDAsIG1heEFuZ2xlID0gNi4yOCxcbiAgICBtaW5TaXplID0gNCwgbWF4U2l6ZSA9IDE2LFxuICAgIG1pblNwZWVkID0gMC4xLCBtYXhTcGVlZCA9IDEsXG4gICAgbWluU2NhbGVTcGVlZCA9IDAuMDEsIG1heFNjYWxlU3BlZWQgPSAwLjA1LFxuICAgIG1pbkFscGhhU3BlZWQgPSAwLjAyLCBtYXhBbHBoYVNwZWVkID0gMC4wMixcbiAgICBtaW5Sb3RhdGlvblNwZWVkID0gMC4wMSwgbWF4Um90YXRpb25TcGVlZCA9IDAuMDNcbikge1xuICBsZXQgcmFuZG9tRmxvYXQgPSAobWluLCBtYXgpID0+IG1pbiArIE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluKVxuICBsZXQgcmFuZG9tSW50ID0gKG1pbiwgbWF4KSA9PiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluICsgMSkpICsgbWluXG5cbiAgbGV0IGFuZ2xlcyA9IFtdXG4gIGxldCBhbmdsZVxuXG4gIGxldCBzcGFjaW5nID0gKG1heEFuZ2xlIC0gbWluQW5nbGUpIC8gKG51bWJlck9mUGFydGljbGVzIC0gMSlcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IG51bWJlck9mUGFydGljbGVzOyBpKyspIHtcbiAgICBpZiAocmFuZG9tU3BhY2luZykge1xuICAgICAgYW5nbGUgPSByYW5kb21GbG9hdChtaW5BbmdsZSwgbWF4QW5nbGUpXG4gICAgICBhbmdsZXMucHVzaChhbmdsZSlcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGFuZ2xlID09PSB1bmRlZmluZWQpIGFuZ2xlID0gbWluQW5nbGVcbiAgICAgIGFuZ2xlcy5wdXNoKGFuZ2xlKVxuICAgICAgYW5nbGUgKz0gc3BhY2luZ1xuICAgIH1cbiAgfVxuXG4gIGFuZ2xlcy5mb3JFYWNoKGFuZ2xlID0+IG1ha2VQYXJ0aWNsZShhbmdsZSkpXG5cbiAgZnVuY3Rpb24gbWFrZVBhcnRpY2xlIChhbmdsZSkge1xuICAgIGxldCBwYXJ0aWNsZSA9IHNwcml0ZUZ1bmN0aW9uKClcblxuICAgIGlmIChwYXJ0aWNsZS5mcmFtZXMubGVuZ3RoID4gMCkge1xuICAgICAgcGFydGljbGUuZ290b0FuZFN0b3AocmFuZG9tSW50KDAsIHBhcnRpY2xlLmZyYW1lcy5sZW5ndGggLSAxKSlcbiAgICB9XG5cbiAgICBwYXJ0aWNsZS54ID0geCAtIHBhcnRpY2xlLmhhbGZIZWlnaHRcbiAgICBwYXJ0aWNsZS55ID0geSAtIHBhcnRpY2xlLmhhbGZIZWlnaHRcblxuICAgIGxldCBzaXplID0gcmFuZG9tSW50KG1pblNpemUsIG1heFNpemUpXG4gICAgcGFydGljbGUud2lkdGggPSBzaXplXG4gICAgcGFydGljbGUuaGVpZ2h0ID0gc2l6ZVxuXG4gICAgcGFydGljbGUuc2NhbGVTcGVlZCA9IHJhbmRvbUZsb2F0KG1pblNjYWxlU3BlZWQsIG1heFNjYWxlU3BlZWQpXG4gICAgcGFydGljbGUuYWxwaGFTcGVlZCA9IHJhbmRvbUZsb2F0KG1pbkFscGhhU3BlZWQsIG1heEFscGhhU3BlZWQpXG4gICAgcGFydGljbGUucm90YXRpb25TcGVlZCA9IHJhbmRvbUZsb2F0KG1pblJvdGF0aW9uU3BlZWQsIG1heFJvdGF0aW9uU3BlZWQpXG5cbiAgICBsZXQgc3BlZWQgPSByYW5kb21GbG9hdChtaW5TcGVlZCwgbWF4U3BlZWQpXG4gICAgcGFydGljbGUudnggPSBzcGVlZCAqIE1hdGguY29zKGFuZ2xlKVxuICAgIHBhcnRpY2xlLnZ5ID0gc3BlZWQgKiBNYXRoLnNpbihhbmdsZSlcblxuICAgIHBhcnRpY2xlLnVwZGF0ZSA9ICgpID0+IHtcbiAgICAgIHBhcnRpY2xlLnZ5ICs9IGdyYXZpdHlcblxuICAgICAgcGFydGljbGUueCArPSBwYXJ0aWNsZS52eFxuICAgICAgcGFydGljbGUueSArPSBwYXJ0aWNsZS52eVxuXG4gICAgICBpZiAocGFydGljbGUuc2NhbGVYIC0gcGFydGljbGUuc2NhbGVTcGVlZCA+IDApIHtcbiAgICAgICAgcGFydGljbGUuc2NhbGVYIC09IHBhcnRpY2xlLnNjYWxlU3BlZWRcbiAgICAgIH1cbiAgICAgIGlmIChwYXJ0aWNsZS5zY2FsZVkgLSBwYXJ0aWNsZS5zY2FsZVNwZWVkID4gMCkge1xuICAgICAgICBwYXJ0aWNsZS5zY2FsZVkgLT0gcGFydGljbGUuc2NhbGVTcGVlZFxuICAgICAgfVxuXG4gICAgICBwYXJ0aWNsZS5yb3RhdGlvbiArPSBwYXJ0aWNsZS5yb3RhdGlvblNwZWVkXG5cbiAgICAgIHBhcnRpY2xlLmFscGhhIC09IHBhcnRpY2xlLmFscGhhU3BlZWRcblxuICAgICAgaWYgKHBhcnRpY2xlLmFscGhhIDw9IDApIHtcbiAgICAgICAgcmVtb3ZlKHBhcnRpY2xlKVxuICAgICAgICBwYXJ0aWNsZXMuc3BsaWNlKHBhcnRpY2xlcy5pbmRleE9mKHBhcnRpY2xlKSwgMSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICBwYXJ0aWNsZXMucHVzaChwYXJ0aWNsZSlcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZW1pdHRlciAoaW50ZXJ2YWwsIHBhcnRpY2xlRnVuY3Rpb24pIHtcbiAgbGV0IGVtaXR0ZXIgPSB7fVxuICBsZXQgdGltZXJJbnRlcnZhbFxuXG4gIGVtaXR0ZXIucGxheWluZyA9IGZhbHNlXG5cbiAgZnVuY3Rpb24gcGxheSAoKSB7XG4gICAgaWYgKCFlbWl0dGVyLnBsYXlpbmcpIHtcbiAgICAgIHBhcnRpY2xlRnVuY3Rpb24oKVxuICAgICAgdGltZXJJbnRlcnZhbCA9IHNldEludGVydmFsKGVtaXRQYXJ0aWNsZS5iaW5kKHRoaXMpLCBpbnRlcnZhbClcbiAgICAgIGVtaXR0ZXIucGxheWluZyA9IHRydWVcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBzdG9wICgpIHtcbiAgICBpZiAoZW1pdHRlci5wbGF5aW5nKSB7XG4gICAgICBjbGVhckludGVydmFsKHRpbWVySW50ZXJ2YWwpXG4gICAgICBlbWl0dGVyLnBsYXlpbmcgPSBmYWxzZVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGVtaXRQYXJ0aWNsZSAoKSB7XG4gICAgcGFydGljbGVGdW5jdGlvbigpXG4gIH1cblxuICBlbWl0dGVyLnBsYXkgPSBwbGF5XG4gIGVtaXR0ZXIuc3RvcCA9IHN0b3BcblxuICByZXR1cm4gZW1pdHRlclxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ3JpZCAoXG4gICAgY29sdW1ucyA9IDAsIHJvd3MgPSAwLCBjZWxsV2lkdGggPSAzMiwgY2VsbEhlaWdodCA9IDMyLFxuICAgIGNlbnRlckNlbGwgPSBmYWxzZSwgeE9mZnNldCA9IDAsIHlPZmZzZXQgPSAwLFxuICAgIG1ha2VTcHJpdGUgPSB1bmRlZmluZWQsXG4gICAgZXh0cmEgPSB1bmRlZmluZWRcbiAgKSB7XG4gIGxldCBjb250YWluZXIgPSBncm91cCgpXG4gIGxldCBjcmVhdGVHcmlkID0gKCkgPT4ge1xuICAgIGxldCBsZW5ndGggPSBjb2x1bW5zICogcm93c1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgbGV0IHggPSAoaSAlIGNvbHVtbnMpICogY2VsbFdpZHRoXG4gICAgICBsZXQgeSA9IE1hdGguZmxvb3IoaSAvIGNvbHVtbnMpICogY2VsbEhlaWdodFxuXG4gICAgICBsZXQgc3ByaXRlID0gbWFrZVNwcml0ZSgpXG4gICAgICBjb250YWluZXIuYWRkQ2hpbGQoc3ByaXRlKVxuXG4gICAgICBpZiAoIWNlbnRlckNlbGwpIHtcbiAgICAgICAgc3ByaXRlLnggPSB4ICsgeE9mZnNldFxuICAgICAgICBzcHJpdGUueSA9IHkgKyB5T2Zmc2V0XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzcHJpdGUueCA9IHggKyAoY2VsbFdpZHRoIC8gMikgLSBzcHJpdGUuaGFsZldpZHRoICsgeE9mZnNldFxuICAgICAgICBzcHJpdGUueSA9IHkgKyAoY2VsbEhlaWdodCAvIDIpIC0gc3ByaXRlLmhhbGZIZWlnaHQgKyB5T2Zmc2V0XG4gICAgICB9XG5cbiAgICAgIGlmIChleHRyYSkgZXh0cmEoc3ByaXRlKVxuICAgIH1cbiAgfVxuXG4gIGNyZWF0ZUdyaWQoKVxuXG4gIHJldHVybiBjb250YWluZXJcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRpbGluZ1Nwcml0ZSAod2lkdGgsIGhlaWdodCwgc291cmNlLCB4ID0gMCwgeSA9IDApIHtcbiAgbGV0IHRpbGVXaWR0aCwgdGlsZUhlaWdodFxuXG4gIGlmIChzb3VyY2UuZnJhbWUpIHtcbiAgICB0aWxlV2lkdGggPSBzb3VyY2UuZnJhbWUud1xuICAgIHRpbGVIZWlnaHQgPSBzb3VyY2UuZnJhbWUuaFxuICB9IGVsc2Uge1xuICAgIHRpbGVXaWR0aCA9IHNvdXJjZS53aWR0aFxuICAgIHRpbGVIZWlnaHQgPSBzb3VyY2UuaGVpZ2h0XG4gIH1cblxuICBsZXQgY29sdW1ucywgcm93c1xuXG4gIGlmICh3aWR0aCA+PSB0aWxlV2lkdGgpIHtcbiAgICBjb2x1bW5zID0gTWF0aC5yb3VuZCh3aWR0aCAvIHRpbGVXaWR0aCkgKyAxXG4gIH0gZWxzZSB7XG4gICAgY29sdW1ucyA9IDJcbiAgfVxuXG4gIGlmIChoZWlnaHQgPj0gdGlsZUhlaWdodCkge1xuICAgIHJvd3MgPSBNYXRoLnJvdW5kKGhlaWdodCAvIHRpbGVIZWlnaHQpICsgMVxuICB9IGVsc2Uge1xuICAgIHJvd3MgPSAyXG4gIH1cblxuICBsZXQgdGlsZUdyaWQgPSBncmlkKFxuICAgICAgICBjb2x1bW5zLCByb3dzLCB0aWxlV2lkdGgsIHRpbGVIZWlnaHQsIGZhbHNlLCAwLCAwLFxuICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgbGV0IHRpbGUgPSBzcHJpdGUoc291cmNlKVxuICAgICAgICAgIHJldHVybiB0aWxlXG4gICAgICAgIH1cbiAgICApXG5cbiAgdGlsZUdyaWQuX3RpbGVYID0gMFxuICB0aWxlR3JpZC5fdGlsZVkgPSAwXG5cbiAgbGV0IGNvbnRhaW5lciA9IHJlY3RhbmdsZSh3aWR0aCwgaGVpZ2h0LCAnbm9uZScsICdub25lJylcbiAgY29udGFpbmVyLnggPSB4XG4gIGNvbnRhaW5lci55ID0geVxuXG4gIGNvbnRhaW5lci5tYXNrID0gdHJ1ZVxuXG4gIGNvbnRhaW5lci5hZGRDaGlsZCh0aWxlR3JpZClcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhjb250YWluZXIsIHtcbiAgICB0aWxlWDoge1xuICAgICAgZ2V0ICgpIHtcbiAgICAgICAgcmV0dXJuIHRpbGVHcmlkLl90aWxlWFxuICAgICAgfSxcbiAgICAgIHNldCAodmFsdWUpIHtcbiAgICAgICAgdGlsZUdyaWQuY2hpbGRyZW4uZm9yRWFjaChjaGlsZCA9PiB7XG4gICAgICAgICAgbGV0IGRpZmZlcmVuY2UgPSB2YWx1ZSAtIHRpbGVHcmlkLl90aWxlWFxuICAgICAgICAgIGNoaWxkLnggKz0gZGlmZmVyZW5jZVxuXG4gICAgICAgICAgaWYgKGNoaWxkLnggPiAoY29sdW1ucyAtIDEpICogdGlsZVdpZHRoKSB7XG4gICAgICAgICAgICBjaGlsZC54ID0gMCAtIHRpbGVXaWR0aCArIGRpZmZlcmVuY2VcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoY2hpbGQueCA8IDAgLSB0aWxlV2lkdGggLSBkaWZmZXJlbmNlKSB7XG4gICAgICAgICAgICBjaGlsZC54ID0gKGNvbHVtbnMgLSAxKSAqIHRpbGVXaWR0aFxuICAgICAgICAgIH1cbiAgICAgICAgfSlcblxuICAgICAgICB0aWxlR3JpZC5fdGlsZVggPSB2YWx1ZVxuICAgICAgfSxcbiAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9LFxuICAgIHRpbGVZOiB7XG4gICAgICBnZXQgKCkge1xuICAgICAgICByZXR1cm4gdGlsZUdyaWQuX3RpbGVZXG4gICAgICB9LFxuICAgICAgc2V0ICh2YWx1ZSkge1xuICAgICAgICB0aWxlR3JpZC5jaGlsZHJlbi5mb3JFYWNoKGNoaWxkID0+IHtcbiAgICAgICAgICBsZXQgZGlmZmVyZW5jZSA9IHZhbHVlIC0gdGlsZUdyaWQuX3RpbGVZXG4gICAgICAgICAgY2hpbGQueSArPSBkaWZmZXJlbmNlXG4gICAgICAgICAgaWYgKGNoaWxkLnkgPiAocm93cyAtIDEpICogdGlsZUhlaWdodCkge1xuICAgICAgICAgICAgY2hpbGQueSA9IDAgLSB0aWxlSGVpZ2h0ICsgZGlmZmVyZW5jZVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoY2hpbGQueSA8IDAgLSB0aWxlSGVpZ2h0IC0gZGlmZmVyZW5jZSkge1xuICAgICAgICAgICAgY2hpbGQueSA9IChyb3dzIC0gMSkgKiB0aWxlSGVpZ2h0XG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICB0aWxlR3JpZC5fdGlsZVkgPSB2YWx1ZVxuICAgICAgfSxcbiAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9XG4gIH0pXG5cbiAgcmV0dXJuIGNvbnRhaW5lclxufVxuXG5sZXQgc3RhZ2VCYWNrZ3JvdW5kXG5cbmNsYXNzIEJhY2tncm91bmQge1xuICBjb25zdHJ1Y3RvciAoc291cmNlLCB3aWR0aCwgaGVpZ2h0LCB4ID0gMCwgeSA9IDApIHtcbiAgICB0aGlzLnNvdXJjZSA9IHNvdXJjZVxuXG4gICAgdGhpcy53aWR0aCA9IHdpZHRoXG4gICAgdGhpcy5oZWlnaHQgPSBoZWlnaHRcbiAgICB0aGlzLnggPSB4XG4gICAgdGhpcy55ID0geVxuICB9XG5cbiAgcmVuZGVyIChjdHgpIHtcbiAgICBpZiAoIXRoaXMucGF0dGVybikge1xuICAgICAgdGhpcy5wYXR0ZXJuID0gY3R4LmNyZWF0ZVBhdHRlcm4odGhpcy5zb3VyY2UsICdyZXBlYXQnKVxuICAgIH1cbiAgICBjdHguZmlsbFN0eWxlID0gdGhpcy5wYXR0ZXJuXG5cbiAgICBjdHgudHJhbnNsYXRlKHRoaXMueCwgdGhpcy55KVxuICAgIGN0eC5maWxsUmVjdCgtdGhpcy54LCAtdGhpcy55LCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodClcbiAgICBjdHgudHJhbnNsYXRlKC10aGlzLngsIC10aGlzLnkpXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJhY2tncm91bmQgKHNvdXJjZSwgd2lkdGgsIGhlaWdodCwgeCwgeSkge1xuICBzdGFnZUJhY2tncm91bmQgPSBuZXcgQmFja2dyb3VuZChzb3VyY2UsIHdpZHRoLCBoZWlnaHQsIHgsIHkpXG4gIHJldHVybiBzdGFnZUJhY2tncm91bmRcbn1cbiIsImltcG9ydCBkcmFnZ2FibGVTcHJpdGVzIGZyb20gJy4vZGlzcGxheSdcblxuZXhwb3J0IGZ1bmN0aW9uIGtleWJvYXJkIChrZXlDb2RlKSB7XG4gIGxldCBrZXkgPSB7fVxuICBrZXkuY29kZSA9IGtleUNvZGVcbiAga2V5LmlzRG93biA9IGZhbHNlXG4gIGtleS5pc1VwID0gdHJ1ZVxuICBrZXkucHJlc3MgPSB1bmRlZmluZWRcbiAga2V5LnJlbGVhc2UgPSB1bmRlZmluZWRcblxuICBrZXkuZG93bkhhbmRsZXIgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICBpZiAoZXZlbnQua2V5Q29kZSA9PT0ga2V5LmNvZGUpIHtcbiAgICAgIGlmIChrZXkuaXNVcCAmJiBrZXkucHJlc3MpIGtleS5wcmVzcygpXG4gICAgICBrZXkuaXNEb3duID0gdHJ1ZVxuICAgICAga2V5LmlzVXAgPSBmYWxzZVxuICAgIH1cbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gIH1cblxuICBrZXkudXBIYW5kbGVyID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgaWYgKGV2ZW50LmtleUNvZGUgPT09IGtleS5jb2RlKSB7XG4gICAgICBpZiAoa2V5LmlzRG93biAmJiBrZXkucmVsZWFzZSkga2V5LnJlbGVhc2UoKVxuICAgICAga2V5LmlzRG93biA9IGZhbHNlXG4gICAgICBrZXkuaXNVcCA9IHRydWVcbiAgICB9XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICB9XG5cbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBrZXkuZG93bkhhbmRsZXIuYmluZChrZXkpLCBmYWxzZSlcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywga2V5LnVwSGFuZGxlci5iaW5kKGtleSksIGZhbHNlKVxuXG4gIHJldHVybiBrZXlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1ha2VQb2ludGVyIChlbGVtZW50LCBzY2FsZSA9IDEpIHtcbiAgbGV0IHBvaW50ZXIgPSB7XG4gICAgZWxlbWVudDogZWxlbWVudCxcbiAgICBzY2FsZTogc2NhbGUsXG5cbiAgICBfeDogMCxcbiAgICBfeTogMCxcblxuICAgIGdldCB4ICgpIHtcbiAgICAgIHJldHVybiB0aGlzLl94IC8gdGhpcy5zY2FsZVxuICAgIH0sXG4gICAgZ2V0IHkgKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX3kgLyB0aGlzLnNjYWxlXG4gICAgfSxcblxuICAgIGdldCBjZW50ZXJYICgpIHtcbiAgICAgIHJldHVybiB0aGlzLnhcbiAgICB9LFxuICAgIGdldCBjZW50ZXJZICgpIHtcbiAgICAgIHJldHVybiB0aGlzLnlcbiAgICB9LFxuXG4gICAgZ2V0IHBvc2l0aW9uICgpIHtcbiAgICAgIHJldHVybiB7eDogdGhpcy54LCB5OiB0aGlzLnl9XG4gICAgfSxcblxuICAgIGlzRG93bjogZmFsc2UsXG4gICAgaXNVcDogdHJ1ZSxcbiAgICB0YXBwZWQ6IGZhbHNlLFxuXG4gICAgZG93blRpbWU6IDAsXG4gICAgZWxhcHNlZFRpbWU6IDAsXG5cbiAgICBwcmVzczogdW5kZWZpbmVkLFxuICAgIHJlbGVhc2U6IHVuZGVmaW5lZCxcbiAgICB0YXA6IHVuZGVmaW5lZCxcblxuICAgIGRyYWdTcHJpdGU6IG51bGwsXG4gICAgZHJhZ09mZnNldFg6IDAsXG4gICAgZHJhZ09mZnNldFk6IDAsXG5cbiAgICBtb3ZlSGFuZGxlciAoZXZlbnQpIHtcbiAgICAgIGxldCBlbGVtZW50ID0gZXZlbnQudGFyZ2V0XG5cbiAgICAgIHRoaXMuX3ggPSAoZXZlbnQucGFnZVggLSBlbGVtZW50Lm9mZnNldExlZnQpXG4gICAgICB0aGlzLl95ID0gKGV2ZW50LnBhZ2VZIC0gZWxlbWVudC5vZmZzZXRUb3ApXG5cbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICB9LFxuXG4gICAgdG91Y2hNb3ZlSGFuZGxlciAoZXZlbnQpIHtcbiAgICAgIGxldCBlbGVtZW50ID0gZXZlbnQudGFyZ2V0XG5cbiAgICAgIHRoaXMuX3ggPSAoZXZlbnQudGFyZ2V0VG91Y2hlc1swXS5wYWdlWCAtIGVsZW1lbnQub2Zmc2V0TGVmdClcbiAgICAgIHRoaXMuX3kgPSAoZXZlbnQudGFyZ2V0VG91Y2hlc1swXS5wYWdlWSAtIGVsZW1lbnQub2Zmc2V0VG9wKVxuXG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgfSxcblxuICAgIGRvd25IYW5kbGVyIChldmVudCkge1xuICAgICAgdGhpcy5pc0Rvd24gPSB0cnVlXG4gICAgICB0aGlzLmlzVXAgPSBmYWxzZVxuICAgICAgdGhpcy50YXBwZWQgPSBmYWxzZVxuXG4gICAgICB0aGlzLmRvd25UaW1lID0gRGF0ZS5ub3coKVxuXG4gICAgICBpZiAodGhpcy5wcmVzcykgdGhpcy5wcmVzcygpXG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgfSxcblxuICAgIHRvdWNoU3RhcnRIYW5kbGVyIChldmVudCkge1xuICAgICAgbGV0IGVsZW1lbnQgPSBldmVudC50YXJnZXRcblxuICAgICAgdGhpcy5feCA9IGV2ZW50LnRhcmdldFRvdWNoZXNbMF0ucGFnZVggLSBlbGVtZW50Lm9mZnNldExlZnRcbiAgICAgIHRoaXMuX3kgPSBldmVudC50YXJnZXRUb3VjaGVzWzBdLnBhZ2VZIC0gZWxlbWVudC5vZmZzZXRUb3BcblxuICAgICAgdGhpcy5pc0Rvd24gPSB0cnVlXG4gICAgICB0aGlzLmlzVXAgPSBmYWxzZVxuICAgICAgdGhpcy50YXBwZWQgPSBmYWxzZVxuXG4gICAgICB0aGlzLmRvd25UaW1lID0gRGF0ZS5ub3coKVxuXG4gICAgICBpZiAodGhpcy5wcmVzcykgdGhpcy5wcmVzcygpXG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgfSxcblxuICAgIHVwSGFuZGxlciAoZXZlbnQpIHtcbiAgICAgIHRoaXMuZWxhcHNlZFRpbWUgPSBNYXRoLmFicyh0aGlzLmRvd25UaW1lIC0gRGF0ZS5ub3coKSlcbiAgICAgIGlmICh0aGlzLmVsYXBzZWRUaW1lIDw9IDIwMCAmJiB0aGlzLnRhcHBlZCA9PT0gZmFsc2UpIHtcbiAgICAgICAgdGhpcy50YXBwZWQgPSB0cnVlXG4gICAgICAgIGlmICh0aGlzLnRhcCkgdGhpcy50YXAoKVxuICAgICAgfVxuXG4gICAgICB0aGlzLmlzVXAgPSB0cnVlXG4gICAgICB0aGlzLmlzRG93biA9IGZhbHNlXG5cbiAgICAgIGlmICh0aGlzLnJlbGVhc2UpIHRoaXMucmVsZWFzZSgpXG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgfSxcblxuICAgIHRvdWNoRW5kSGFuZGxlciAoZXZlbnQpIHtcbiAgICAgIHRoaXMuZWxhcHNlZFRpbWUgPSBNYXRoLmFicyh0aGlzLmRvd25UaW1lIC0gRGF0ZS5ub3coKSlcblxuICAgICAgaWYgKHRoaXMuZWxhcHNlZFRpbWUgPD0gMjAwICYmIHRoaXMudGFwcGVkID09PSBmYWxzZSkge1xuICAgICAgICB0aGlzLnRhcHBlZCA9IHRydWVcbiAgICAgICAgaWYgKHRoaXMudGFwKSB0aGlzLnRhcCgpXG4gICAgICB9XG5cbiAgICAgIHRoaXMuaXNVcCA9IHRydWVcbiAgICAgIHRoaXMuaXNEb3duID0gZmFsc2VcblxuICAgICAgaWYgKHRoaXMucmVsZWFzZSkgdGhpcy5yZWxlYXNlKClcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICB9LFxuXG4gICAgaGl0VGVzdFNwcml0ZSAoc3ByaXRlKSB7XG4gICAgICBsZXQgaGl0ID0gZmFsc2VcblxuICAgICAgaWYgKCFzcHJpdGUuY2lyY3VsYXIpIHtcbiAgICAgICAgbGV0IGxlZnQgPSBzcHJpdGUuZ3hcbiAgICAgICAgbGV0IHJpZ2h0ID0gc3ByaXRlLmd4ICsgc3ByaXRlLndpZHRoXG4gICAgICAgIGxldCB0b3AgPSBzcHJpdGUuZ3lcbiAgICAgICAgbGV0IGJvdHRvbSA9IHNwcml0ZS5neSArIHNwcml0ZS5oZWlnaHRcblxuICAgICAgICBoaXQgPSB0aGlzLnggPiBsZWZ0ICYmIHRoaXMueCA8IHJpZ2h0ICYmXG4gICAgICAgICAgICAgICAgICAgIHRoaXMueSA+IHRvcCAmJiB0aGlzLnkgPCBib3R0b21cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxldCB2eCA9IHRoaXMueCAtIChzcHJpdGUuZ3ggKyBzcHJpdGUucmFkaXVzKVxuICAgICAgICBsZXQgdnkgPSB0aGlzLnkgLSAoc3ByaXRlLmd5ICsgc3ByaXRlLnJhZGl1cylcbiAgICAgICAgbGV0IGRpc3RhbmNlID0gTWF0aC5zcXJ0KHZ4ICogdnggKyB2eSAqIHZ5KVxuXG4gICAgICAgIGhpdCA9IGRpc3RhbmNlIDwgc3ByaXRlLnJhZGl1c1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gaGl0XG4gICAgfSxcblxuICAgIHVwZGF0ZURyYWdBbmREcm9wIChzcHJpdGUpIHtcbiAgICAgIGlmICh0aGlzLmlzRG93bikge1xuICAgICAgICBpZiAodGhpcy5kcmFnU3ByaXRlID09PSBudWxsKSB7XG4gICAgICAgICAgZm9yIChsZXQgaSA9IGRyYWdnYWJsZVNwcml0ZXMubGVuZ3RoIC0gMTsgaSA+IC0xOyBpLS0pIHtcbiAgICAgICAgICAgIGxldCBzcHJpdGUgPSBkcmFnZ2FibGVTcHJpdGVzW2ldXG5cbiAgICAgICAgICAgIGlmICh0aGlzLmhpdFRlc3RTcHJpdGUoc3ByaXRlKSAmJiBzcHJpdGUuZHJhZ2dhYmxlKSB7XG4gICAgICAgICAgICAgIHRoaXMuZHJhZ09mZnNldFggPSB0aGlzLnggLSBzcHJpdGUuZ3hcbiAgICAgICAgICAgICAgdGhpcy5kcmFnT2Zmc2V0WSA9IHRoaXMueSAtIHNwcml0ZS5neVxuXG4gICAgICAgICAgICAgIHRoaXMuZHJhZ1Nwcml0ZSA9IHNwcml0ZVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmVvcmRlciBzcHJpdGVzIHRvIGRpc3BsYXkgZHJhZ2dlZCBzcHJpdGUgYWJvdmUgYWxsXG4gICAgICAgICAgICAgIGxldCBjaGlsZHJlbiA9IHNwcml0ZS5wYXJlbnQuY2hpbGRyZW5cbiAgICAgICAgICAgICAgY2hpbGRyZW4uc3BsaWNlKGNoaWxkcmVuLmluZGV4T2Yoc3ByaXRlKSwgMSlcbiAgICAgICAgICAgICAgY2hpbGRyZW4ucHVzaChzcHJpdGUpXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyByZW9yZGVyIGRyYWdnYWJsZVNwcml0ZXMgaW4gdGhlIHNhbWUgd2F5XG4gICAgICAgICAgICAgIGRyYWdnYWJsZVNwcml0ZXMuc3BsaWNlKGRyYWdnYWJsZVNwcml0ZXMuaW5kZXhPZihzcHJpdGUpLCAxKVxuICAgICAgICAgICAgICBkcmFnZ2FibGVTcHJpdGVzLnB1c2goc3ByaXRlKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLmRyYWdTcHJpdGUueCA9IHRoaXMueCAtIHRoaXMuZHJhZ09mZnNldFhcbiAgICAgICAgICB0aGlzLmRyYWdTcHJpdGUueSA9IHRoaXMueSAtIHRoaXMuZHJhZ09mZnNldFlcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5pc1VwKSB7XG4gICAgICAgIHRoaXMuZHJhZ1Nwcml0ZSA9IG51bGxcbiAgICAgIH1cblxuICAgICAgICAgICAgLy8gY2hhbmdlIGN1cnNvciB0byBoYW5kIGlmIGl0J3Mgb3ZlciBkcmFnZ2FibGUgc3ByaXRlc1xuICAgICAgZHJhZ2dhYmxlU3ByaXRlcy5zb21lKHNwcml0ZSA9PiB7XG4gICAgICAgIGlmICh0aGlzLmhpdFRlc3RTcHJpdGUoc3ByaXRlKSAmJiBzcHJpdGUuZHJhZ2dhYmxlKSB7XG4gICAgICAgICAgdGhpcy5lbGVtZW50LnN0eWxlLmN1cnNvciA9ICdwb2ludGVyJ1xuICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5lbGVtZW50LnN0eWxlLmN1cnNvciA9ICdhdXRvJ1xuICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgJ21vdXNlbW92ZScsIHBvaW50ZXIubW92ZUhhbmRsZXIuYmluZChwb2ludGVyKSwgZmFsc2VcbiAgICApXG5cbiAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICAnbW91c2Vkb3duJywgcG9pbnRlci5kb3duSGFuZGxlci5iaW5kKHBvaW50ZXIpLCBmYWxzZVxuICAgIClcblxuICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICAgICdtb3VzZXVwJywgcG9pbnRlci51cEhhbmRsZXIuYmluZChwb2ludGVyKSwgZmFsc2VcbiAgICApXG5cbiAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICAndG91Y2htb3ZlJywgcG9pbnRlci50b3VjaE1vdmVIYW5kbGVyLmJpbmQocG9pbnRlciksIGZhbHNlXG4gICAgKVxuXG4gIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgJ3RvdWNoc3RhcnQnLCBwb2ludGVyLnRvdWNoU3RhcnRIYW5kbGVyLmJpbmQocG9pbnRlciksIGZhbHNlXG4gICAgKVxuXG4gIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgJ3RvdWNoZW5kJywgcG9pbnRlci50b3VjaEVuZEhhbmRsZXIuYmluZChwb2ludGVyKSwgZmFsc2VcbiAgICApXG5cbiAgZWxlbWVudC5zdHlsZS50b3VjaEFjdGlvbiA9ICdub25lJ1xuXG4gIHJldHVybiBwb2ludGVyXG59XG4iLCJsZXQgYWN0eCA9IG5ldyBBdWRpb0NvbnRleHQoKVxyXG5cclxuY2xhc3MgU291bmQge1xyXG4gIGNvbnN0cnVjdG9yIChzb3VyY2UsIGxvYWRIYW5kbGVyKSB7XHJcbiAgICB0aGlzLnNvdXJjZSA9IHNvdXJjZVxyXG4gICAgdGhpcy5sb2FkSGFuZGxlciA9IGxvYWRIYW5kbGVyXHJcblxyXG4gICAgdGhpcy5hY3R4ID0gYWN0eFxyXG4gICAgdGhpcy52b2x1bWVOb2RlID0gdGhpcy5hY3R4LmNyZWF0ZUdhaW4oKVxyXG4gICAgdGhpcy5wYW5Ob2RlID0gdGhpcy5hY3R4LmNyZWF0ZVN0ZXJlb1Bhbm5lcigpXHJcbiAgICB0aGlzLnNvdW5kTm9kZSA9IG51bGxcclxuICAgIHRoaXMuYnVmZmVyID0gbnVsbFxyXG4gICAgdGhpcy5sb29wID0gZmFsc2VcclxuICAgIHRoaXMucGxheWluZyA9IGZhbHNlXHJcblxyXG4gICAgdGhpcy5wYW5WYWx1ZSA9IDBcclxuICAgIHRoaXMudm9sdW1lVmFsdWUgPSAxXHJcblxyXG4gICAgdGhpcy5zdGFydFRpbWUgPSAwXHJcbiAgICB0aGlzLnN0YXJ0T2Zmc2V0ID0gMFxyXG5cclxuICAgIHRoaXMubG9hZCgpXHJcbiAgfVxyXG5cclxuICBsb2FkICgpIHtcclxuICAgIGxldCB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxyXG4gICAgeGhyLm9wZW4oJ0dFVCcsIHRoaXMuc291cmNlLCB0cnVlKVxyXG4gICAgeGhyLnJlc3BvbnNlVHlwZSA9ICdhcnJheWJ1ZmZlcidcclxuICAgIHhoci5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgKCkgPT4ge1xyXG4gICAgICB0aGlzLmFjdHguZGVjb2RlQXVkaW9EYXRhKFxyXG4gICAgICAgICAgICAgICAgeGhyLnJlc3BvbnNlLFxyXG4gICAgICAgICAgICAgICAgYnVmZmVyID0+IHtcclxuICAgICAgICAgICAgICAgICAgdGhpcy5idWZmZXIgPSBidWZmZXJcclxuICAgICAgICAgICAgICAgICAgdGhpcy5oYXNMb2FkZWQgPSB0cnVlXHJcblxyXG4gICAgICAgICAgICAgICAgICBpZiAodGhpcy5sb2FkSGFuZGxlcikge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9hZEhhbmRsZXIoKVxyXG4gICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZXJyb3IgPT4ge1xyXG4gICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0F1ZGlvIGNvdWxkIG5vdCBiZSBkZWNvZGVkOiAnICsgZXJyb3IpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIClcclxuICAgIH0pXHJcblxyXG4gICAgeGhyLnNlbmQoKVxyXG4gIH1cclxuXHJcbiAgcGxheSAoKSB7XHJcbiAgICB0aGlzLnN0YXJ0VGltZSA9IHRoaXMuYWN0eC5jdXJyZW50VGltZVxyXG4gICAgdGhpcy5zb3VuZE5vZGUgPSB0aGlzLmFjdHguY3JlYXRlQnVmZmVyU291cmNlKClcclxuXHJcbiAgICB0aGlzLnNvdW5kTm9kZS5idWZmZXIgPSB0aGlzLmJ1ZmZlclxyXG5cclxuICAgIHRoaXMuc291bmROb2RlLmNvbm5lY3QodGhpcy52b2x1bWVOb2RlKVxyXG4gICAgdGhpcy52b2x1bWVOb2RlLmNvbm5lY3QodGhpcy5wYW5Ob2RlKVxyXG4gICAgdGhpcy5wYW5Ob2RlLmNvbm5lY3QodGhpcy5hY3R4LmRlc3RpbmF0aW9uKVxyXG5cclxuICAgIHRoaXMuc291bmROb2RlLmxvb3AgPSB0aGlzLmxvb3BcclxuXHJcbiAgICB0aGlzLnNvdW5kTm9kZS5zdGFydChcclxuICAgICAgICAgICAgdGhpcy5zdGFydFRpbWUsXHJcbiAgICAgICAgICAgIHRoaXMuc3RhcnRPZmZzZXQgJSB0aGlzLmJ1ZmZlci5kdXJhdGlvblxyXG4gICAgICAgIClcclxuXHJcbiAgICB0aGlzLnBsYXlpbmcgPSB0cnVlXHJcbiAgfVxyXG5cclxuICBwYXVzZSAoKSB7XHJcbiAgICBpZiAodGhpcy5wbGF5aW5nKSB7XHJcbiAgICAgIHRoaXMuc291bmROb2RlLnN0b3AodGhpcy5hY3R4LmN1cnJlbnRUaW1lKVxyXG4gICAgICB0aGlzLnN0YXJ0T2Zmc2V0ICs9IHRoaXMuYWN0eC5jdXJyZW50VGltZSAtIHRoaXMuc3RhcnRUaW1lXHJcbiAgICAgIHRoaXMucGxheWluZyA9IGZhbHNlXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXN0YXJ0ICgpIHtcclxuICAgIGlmICh0aGlzLnBsYXlpbmcpIHtcclxuICAgICAgdGhpcy5zb3VuZE5vZGUuc3RvcCh0aGlzLmFjdHguY3VycmVudFRpbWUpXHJcbiAgICB9XHJcbiAgICB0aGlzLnN0YXJ0T2Zmc2V0ID0gMFxyXG4gICAgdGhpcy5wbGF5KClcclxuICB9XHJcblxyXG4gIHBsYXlGcm9tICh2YWx1ZSkge1xyXG4gICAgaWYgKHRoaXMucGxheWluZykge1xyXG4gICAgICB0aGlzLnNvdW5kTm9kZS5zdG9wKHRoaXMuYWN0eC5jdXJyZW50VGltZSlcclxuICAgIH1cclxuICAgIHRoaXMuc3RhcnRPZmZzZXQgPSB2YWx1ZVxyXG4gICAgdGhpcy5wbGF5KClcclxuICB9XHJcblxyXG4gIGdldCB2b2x1bWUgKCkge1xyXG4gICAgcmV0dXJuIHRoaXMudm9sdW1lVmFsdWVcclxuICB9XHJcbiAgc2V0IHZvbHVtZSAodmFsdWUpIHtcclxuICAgIHRoaXMudm9sdW1lTm9kZS5nYWluLnZhbHVlID0gdmFsdWVcclxuICAgIHRoaXMudm9sdW1lVmFsdWUgPSB2YWx1ZVxyXG4gIH1cclxuXHJcbiAgZ2V0IHBhbiAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5wYW5WYWx1ZVxyXG4gIH1cclxuICBzZXQgcGFuICh2YWx1ZSkge1xyXG4gICAgdGhpcy5wYW5Ob2RlLnBhbi52YWx1ZSA9IHZhbHVlXHJcbiAgICB0aGlzLnBhblZhbHVlID0gdmFsdWVcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBtYWtlU291bmQgKHNvdXJjZSwgbG9hZEhhbmRsZXIpIHtcclxuICByZXR1cm4gbmV3IFNvdW5kKHNvdXJjZSwgbG9hZEhhbmRsZXIpXHJcbn1cclxuIiwiaW1wb3J0IHttYWtlU291bmR9IGZyb20gJy4vc291bmQnXG5cbmV4cG9ydCBsZXQgYXNzZXRzID0ge1xuICB0b0xvYWQ6IDAsXG4gIGxvYWRlZDogMCxcblxuICBpbWFnZUV4dGVuc2lvbnM6IFsncG5nJywgJ2pwZycsICdnaWYnXSxcbiAgZm9udEV4dGVuc2lvbnM6IFsndHRmJywgJ290ZicsICd0dGMnLCAnd29mZiddLFxuICBqc29uRXh0ZW5zaW9uczogWydqc29uJ10sXG4gIGF1ZGlvRXh0ZW5zaW9uczogWydtcDMnLCAnb2dnJywgJ3dhdicsICd3ZWJtJ10sXG5cbiAgICAvLyBBUElcbiAgbG9hZCAoc291cmNlcykge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgIGxldCBsb2FkSGFuZGxlciA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5sb2FkZWQgKz0gMVxuICAgICAgICBjb25zb2xlLmxvZyh0aGlzLmxvYWRlZClcblxuICAgICAgICBpZiAodGhpcy50b0xvYWQgPT09IHRoaXMubG9hZGVkKSB7XG4gICAgICAgICAgdGhpcy5sb2FkZWQgPSAwXG4gICAgICAgICAgdGhpcy50b0xvYWQgPSAwXG4gICAgICAgICAgY29uc29sZS5sb2coJ0Fzc2V0cyBsb2FkZWQhJylcblxuICAgICAgICAgIHJlc29sdmUoKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNvbnNvbGUubG9nKCdMb2FkaW5nIGFzc2V0cy4uLicpXG5cbiAgICAgIHRoaXMudG9Mb2FkID0gc291cmNlcy5sZW5ndGhcblxuICAgICAgc291cmNlcy5mb3JFYWNoKHNvdXJjZSA9PiB7XG4gICAgICAgIGxldCBleHRlbnNpb24gPSBzb3VyY2Uuc3BsaXQoJy4nKS5wb3AoKVxuXG4gICAgICAgIGlmICh0aGlzLmltYWdlRXh0ZW5zaW9ucy5pbmRleE9mKGV4dGVuc2lvbikgIT09IC0xKSB7XG4gICAgICAgICAgdGhpcy5sb2FkSW1hZ2Uoc291cmNlLCBsb2FkSGFuZGxlcilcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmZvbnRFeHRlbnNpb25zLmluZGV4T2YoZXh0ZW5zaW9uKSAhPT0gLTEpIHtcbiAgICAgICAgICB0aGlzLmxvYWRGb250KHNvdXJjZSwgbG9hZEhhbmRsZXIpXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5qc29uRXh0ZW5zaW9ucy5pbmRleE9mKGV4dGVuc2lvbikgIT09IC0xKSB7XG4gICAgICAgICAgdGhpcy5sb2FkSnNvbihzb3VyY2UsIGxvYWRIYW5kbGVyKVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuYXVkaW9FeHRlbnNpb25zLmluZGV4T2YoZXh0ZW5zaW9uKSAhPT0gLTEpIHtcbiAgICAgICAgICB0aGlzLmxvYWRTb3VuZChzb3VyY2UsIGxvYWRIYW5kbGVyKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdGaWxlIHR5cGUgbm90IHJlY29nbml6ZWQ6ICcgKyBzb3VyY2UpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfSlcbiAgfSxcblxuICBsb2FkSW1hZ2UgKHNvdXJjZSwgbG9hZEhhbmRsZXIpIHtcbiAgICBsZXQgaW1hZ2UgPSBuZXcgSW1hZ2UoKVxuICAgIGltYWdlLmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBsb2FkSGFuZGxlciwgZmFsc2UpXG4gICAgdGhpc1tzb3VyY2VdID0gaW1hZ2VcbiAgICBpbWFnZS5zcmMgPSBzb3VyY2VcbiAgfSxcblxuICBsb2FkRm9udCAoc291cmNlLCBsb2FkSGFuZGxlcikge1xuICAgIGxldCBmb250RmFtaWx5ID0gc291cmNlLnNwbGl0KCcvJykucG9wKCkuc3BsaXQoJy4nKVswXVxuXG4gICAgbGV0IG5ld1N0eWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKVxuICAgIGxldCBmb250RmFjZSA9XG4gICAgICAgICAgICAgICAgXCJAZm9udC1mYWNlIHtmb250LWZhbWlseTogJ1wiICsgZm9udEZhbWlseSArIFwiJzsgc3JjOiB1cmwoJ1wiICsgc291cmNlICsgXCInKTt9XCJcblxuICAgIG5ld1N0eWxlLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGZvbnRGYWNlKSlcbiAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKG5ld1N0eWxlKVxuXG4gICAgbG9hZEhhbmRsZXIoKVxuICB9LFxuXG4gIGxvYWRKc29uIChzb3VyY2UsIGxvYWRIYW5kbGVyKSB7XG4gICAgbGV0IHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpXG4gICAgeGhyLm9wZW4oJ0dFVCcsIHNvdXJjZSwgdHJ1ZSlcbiAgICB4aHIucmVzcG9uc2VUeXBlID0gJ3RleHQnXG5cbiAgICB4aHIub25sb2FkID0gZXZlbnQgPT4ge1xuICAgICAgaWYgKHhoci5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICBsZXQgZmlsZSA9IEpTT04ucGFyc2UoeGhyLnJlc3BvbnNlVGV4dClcbiAgICAgICAgZmlsZS5uYW1lID0gc291cmNlXG4gICAgICAgIHRoaXNbZmlsZS5uYW1lXSA9IGZpbGVcblxuICAgICAgICBpZiAoZmlsZS5zcHJpdGVzKSB7XG4gICAgICAgICAgdGhpcy5jcmVhdGVTcHJpdGVTaGVldChmaWxlLCBzb3VyY2UsIGxvYWRIYW5kbGVyKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGxvYWRIYW5kbGVyKClcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHhoci5zZW5kKClcbiAgfSxcblxuICBjcmVhdGVTcHJpdGVTaGVldCAoZmlsZSwgc291cmNlLCBsb2FkSGFuZGxlcikge1xuICAgIGxldCBiYXNlVXJsID0gc291cmNlLnJlcGxhY2UoL1teL10qJC8sICcnKVxuICAgIGxldCBpbWFnZVNvdXJjZSA9IGJhc2VVcmwgKyBmaWxlLmltYWdlUGF0aFxuXG4gICAgbGV0IGltYWdlTG9hZEhhbmRsZXIgPSAoKSA9PiB7XG4gICAgICB0aGlzW2ltYWdlU291cmNlXSA9IGltYWdlXG5cbiAgICAgIE9iamVjdC5rZXlzKGZpbGUuc3ByaXRlcykuZm9yRWFjaChzcHJpdGUgPT4ge1xuICAgICAgICB0aGlzW3Nwcml0ZV0gPSBmaWxlLnNwcml0ZXNbc3ByaXRlXVxuICAgICAgICB0aGlzW3Nwcml0ZV0uc291cmNlID0gaW1hZ2VcbiAgICAgIH0pXG5cbiAgICAgIGxvYWRIYW5kbGVyKClcbiAgICB9XG5cbiAgICBsZXQgaW1hZ2UgPSBuZXcgSW1hZ2UoKVxuICAgIGltYWdlLmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBpbWFnZUxvYWRIYW5kbGVyLCBmYWxzZSlcbiAgICBpbWFnZS5zcmMgPSBpbWFnZVNvdXJjZVxuICB9LFxuXG4gIGxvYWRTb3VuZCAoc291cmNlLCBsb2FkSGFuZGxlcikge1xuICAgIGxldCBzb3VuZCA9IG1ha2VTb3VuZChzb3VyY2UsIGxvYWRIYW5kbGVyKVxuXG4gICAgc291bmQubmFtZSA9IHNvdXJjZVxuICAgIHRoaXNbc291bmQubmFtZV0gPSBzb3VuZFxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb250YWluIChzcHJpdGUsIGJvdW5kcywgYm91bmNlID0gZmFsc2UsIGV4dHJhID0gdW5kZWZpbmVkKSB7XG4gIGxldCB4ID0gYm91bmRzLnhcbiAgbGV0IHkgPSBib3VuZHMueVxuICBsZXQgd2lkdGggPSBib3VuZHMud2lkdGhcbiAgbGV0IGhlaWdodCA9IGJvdW5kcy5oZWlnaHRcblxuICBsZXQgY29sbGlzaW9uXG5cbiAgaWYgKHNwcml0ZS54IDwgeCkge1xuICAgIGlmIChib3VuY2UpIHNwcml0ZS52eCAqPSAtMVxuICAgIGlmIChzcHJpdGUubWFzcykgc3ByaXRlLnZ4IC89IHNwcml0ZS5tYXNzXG5cbiAgICBzcHJpdGUueCA9IHhcbiAgICBjb2xsaXNpb24gPSAnbGVmdCdcbiAgfVxuXG4gIGlmIChzcHJpdGUueSA8IHkpIHtcbiAgICBpZiAoYm91bmNlKSBzcHJpdGUudnkgKj0gLTFcbiAgICBpZiAoc3ByaXRlLm1hc3MpIHNwcml0ZS52eSAvPSBzcHJpdGUubWFzc1xuXG4gICAgc3ByaXRlLnkgPSB5XG4gICAgY29sbGlzaW9uID0gJ3RvcCdcbiAgfVxuXG4gIGlmIChzcHJpdGUueCArIHNwcml0ZS53aWR0aCA+IHdpZHRoKSB7XG4gICAgaWYgKGJvdW5jZSkgc3ByaXRlLnZ4ICo9IC0xXG4gICAgaWYgKHNwcml0ZS5tYXNzKSBzcHJpdGUudnggLz0gc3ByaXRlLm1hc3NcblxuICAgIHNwcml0ZS54ID0gd2lkdGggLSBzcHJpdGUud2lkdGhcbiAgICBjb2xsaXNpb24gPSAncmlnaHQnXG4gIH1cblxuICBpZiAoc3ByaXRlLnkgKyBzcHJpdGUuaGVpZ2h0ID4gaGVpZ2h0KSB7XG4gICAgaWYgKGJvdW5jZSkgc3ByaXRlLnZ5ICo9IC0xXG4gICAgaWYgKHNwcml0ZS5tYXNzKSBzcHJpdGUudnkgLz0gc3ByaXRlLm1hc3NcblxuICAgIHNwcml0ZS55ID0gaGVpZ2h0IC0gc3ByaXRlLmhlaWdodFxuICAgIGNvbGxpc2lvbiA9ICdib3R0b20nXG4gIH1cblxuICBpZiAoY29sbGlzaW9uICYmIGV4dHJhKSBleHRyYShjb2xsaXNpb24pXG5cbiAgcmV0dXJuIGNvbGxpc2lvblxufVxuXG5leHBvcnQgZnVuY3Rpb24gb3V0c2lkZUJvdW5kcyAoc3ByaXRlLCBib3VuZHMsIGV4dHJhID0gdW5kZWZpbmVkKSB7XG4gIGxldCB4ID0gYm91bmRzLnhcbiAgbGV0IHkgPSBib3VuZHMueVxuICBsZXQgd2lkdGggPSBib3VuZHMud2lkdGhcbiAgbGV0IGhlaWdodCA9IGJvdW5kcy5oZWlnaHRcblxuICBsZXQgY29sbGlzaW9uXG5cbiAgaWYgKHNwcml0ZS54IDwgeCAtIHNwcml0ZS53aWR0aCkge1xuICAgIGNvbGxpc2lvbiA9ICdsZWZ0J1xuICB9XG4gIGlmIChzcHJpdGUueSA8IHkgLSBzcHJpdGUuaGVpZ2h0KSB7XG4gICAgY29sbGlzaW9uID0gJ3RvcCdcbiAgfVxuICBpZiAoc3ByaXRlLnggPiB3aWR0aCkge1xuICAgIGNvbGxpc2lvbiA9ICdyaWdodCdcbiAgfVxuICBpZiAoc3ByaXRlLnkgPiBoZWlnaHQpIHtcbiAgICBjb2xsaXNpb24gPSAnYm90dG9tJ1xuICB9XG5cbiAgaWYgKGNvbGxpc2lvbiAmJiBleHRyYSkgZXh0cmEoY29sbGlzaW9uKVxuXG4gIHJldHVybiBjb2xsaXNpb25cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdyYXAgKHNwcml0ZSwgYm91bmRzKSB7XG4gIGxldCB3aWR0aCA9IGJvdW5kcy53aWR0aFxuICBsZXQgaGVpZ2h0ID0gYm91bmRzLmhlaWdodFxuXG4gIGlmIChzcHJpdGUueCArIHNwcml0ZS53aWR0aCA8IDApIHtcbiAgICBzcHJpdGUueCA9IHdpZHRoXG4gIH1cbiAgaWYgKHNwcml0ZS55ICsgc3ByaXRlLmhlaWdodCA8IDApIHtcbiAgICBzcHJpdGUueSA9IGhlaWdodFxuICB9XG4gIGlmIChzcHJpdGUueCAtIHNwcml0ZS53aWR0aCA+IHdpZHRoKSB7XG4gICAgc3ByaXRlLnggPSAtc3ByaXRlLndpZHRoXG4gIH1cbiAgaWYgKHNwcml0ZS55IC0gc3ByaXRlLmhlaWdodCA+IGhlaWdodCkge1xuICAgIHNwcml0ZS55ID0gLXNwcml0ZS5oZWlnaHRcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FwdHVyZVByZXZpb3VzUG9zaXRpb25zIChzdGFnZSkge1xuICBzdGFnZS5jaGlsZHJlbi5mb3JFYWNoKHNwcml0ZSA9PiB7XG4gICAgc2V0UHJldmlvdXNQb3NpdGlvbihzcHJpdGUpXG4gIH0pXG5cbiAgZnVuY3Rpb24gc2V0UHJldmlvdXNQb3NpdGlvbiAoc3ByaXRlKSB7XG4gICAgc3ByaXRlLnByZXZpb3VzWCA9IHNwcml0ZS54XG4gICAgc3ByaXRlLnByZXZpb3VzWSA9IHNwcml0ZS55XG5cbiAgICBpZiAoc3ByaXRlLmNoaWxkcmVuICYmIHNwcml0ZS5jaGlsZHJlbi5sZW5ndGggPiAwKSB7XG4gICAgICBzcHJpdGUuY2hpbGRyZW4uZm9yRWFjaChjaGlsZCA9PiB7XG4gICAgICAgIHNldFByZXZpb3VzUG9zaXRpb24oY2hpbGQpXG4gICAgICB9KVxuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZGlzdGFuY2UgKHMxLCBzMikge1xuICBsZXQgdnggPSBzMi5jZW50ZXJYIC0gczEuY2VudGVyWFxuICBsZXQgdnkgPSBzMi5jZW50ZXJZIC0gczEuY2VudGVyWVxuXG4gIHJldHVybiBNYXRoLnNxcnQodnggKiB2eCArIHZ5ICogdnkpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmb2xsb3dFYXNlIChmb2xsb3dlciwgbGVhZGVyLCBzcGVlZCkge1xuICBsZXQgdnggPSBsZWFkZXIuY2VudGVyWCAtIGZvbGxvd2VyLmNlbnRlclhcbiAgbGV0IHZ5ID0gbGVhZGVyLmNlbnRlclkgLSBmb2xsb3dlci5jZW50ZXJZXG4gIGxldCBkaXN0YW5jZSA9IE1hdGguc3FydCh2eCAqIHZ4ICsgdnkgKiB2eSlcbiAgaWYgKGRpc3RhbmNlID49IDEpIHtcbiAgICBmb2xsb3dlci54ICs9IHZ4ICogc3BlZWRcbiAgICBmb2xsb3dlci55ICs9IHZ5ICogc3BlZWRcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZm9sbG93Q29uc3RhbnQgKGZvbGxvd2VyLCBsZWFkZXIsIHNwZWVkKSB7XG4gIGxldCB2eCA9IGxlYWRlci5jZW50ZXJYIC0gZm9sbG93ZXIuY2VudGVyWFxuICBsZXQgdnkgPSBsZWFkZXIuY2VudGVyWSAtIGZvbGxvd2VyLmNlbnRlcllcbiAgbGV0IGRpc3RhbmNlID0gTWF0aC5zcXJ0KHZ4ICogdnggKyB2eSAqIHZ5KVxuICBpZiAoZGlzdGFuY2UgPj0gc3BlZWQpIHtcbiAgICBmb2xsb3dlci54ICs9ICh2eCAvIGRpc3RhbmNlKSAqIHNwZWVkXG4gICAgZm9sbG93ZXIueSArPSAodnkgLyBkaXN0YW5jZSkgKiBzcGVlZFxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhbmdsZSAoczEsIHMyKSB7XG4gIHJldHVybiBNYXRoLmF0YW4yKFxuICAgICAgICBzMi5jZW50ZXJYIC0gczEuY2VudGVyWCxcbiAgICAgICAgczIuY2VudGVyWSAtIHMxLmNlbnRlcllcbiAgICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiByb3RhdGVTcHJpdGUgKHJvdGF0aW5nU3ByaXRlLCBjZW50ZXJTcHJpdGUsIGRpc3RhbmNlLCBhbmdsZSkge1xuICByb3RhdGluZ1Nwcml0ZS54ID0gY2VudGVyU3ByaXRlLmNlbnRlclggLSByb3RhdGluZ1Nwcml0ZS5wYXJlbnQueCArXG4gICAgICAgICAgICAgICAgICAgICAgICAoZGlzdGFuY2UgKiBNYXRoLmNvcyhhbmdsZSkpIC1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJvdGF0aW5nU3ByaXRlLmhhbGZXaWR0aFxuICByb3RhdGluZ1Nwcml0ZS55ID0gY2VudGVyU3ByaXRlLmNlbnRlclkgLSByb3RhdGluZ1Nwcml0ZS5wYXJlbnQueSArXG4gICAgICAgICAgICAgICAgICAgICAgICAoZGlzdGFuY2UgKiBNYXRoLnNpbihhbmdsZSkpIC1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJvdGF0aW5nU3ByaXRlLmhhbGZXaWR0aFxufVxuXG5leHBvcnQgZnVuY3Rpb24gcm90YXRlUG9pbnQgKHBvaW50WCwgcG9pbnRZLCBkaXN0YW5jZVgsIGRpc3RhbmNlWSwgYW5nbGUpIHtcbiAgbGV0IHBvaW50ID0ge31cblxuICBwb2ludC54ID0gcG9pbnRYICsgTWF0aC5jb3MoYW5nbGUpICogZGlzdGFuY2VYXG4gIHBvaW50LnkgPSBwb2ludFkgKyBNYXRoLnNpbihhbmdsZSkgKiBkaXN0YW5jZVlcblxuICByZXR1cm4gcG9pbnRcbn1cblxuLy8gUmFuZG9tIHJhbmdlXG5leHBvcnQgbGV0IHJhbmRvbUludCA9IChtaW4sIG1heCkgPT4ge1xuICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbiArIDEpKSArIG1pblxufVxuXG5leHBvcnQgbGV0IHJhbmRvbUZsb2F0ID0gKG1pbiwgbWF4KSA9PiB7XG4gIHJldHVybiBtaW4gKyBNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbilcbn1cbiIsImltcG9ydCB7bWFrZUNhbnZhcywgcmVtb3ZlLCByZW5kZXIsIHN0YWdlLCBzcHJpdGUsIHRleHQsIGJhY2tncm91bmQsIHBhcnRpY2xlcywgcGFydGljbGVFZmZlY3R9IGZyb20gJy4vZW5naW5lL2Rpc3BsYXknXG5pbXBvcnQge2Fzc2V0cywgd3JhcCwgb3V0c2lkZUJvdW5kcywgcmFuZG9tSW50LCByYW5kb21GbG9hdH0gZnJvbSAnLi9lbmdpbmUvdXRpbGl0aWVzJ1xuaW1wb3J0IHtrZXlib2FyZH0gZnJvbSAnLi9lbmdpbmUvaW50ZXJhY3RpdmUnXG5pbXBvcnQge21vdmluZ0NpcmNsZUNvbGxpc2lvbiwgY2lyY2xlUmVjdGFuZ2xlQ29sbGlzaW9ufSBmcm9tICcuL2VuZ2luZS9jb2xsaXNpb24nXG5cbmFzc2V0cy5sb2FkKFtcbiAgJ2Jncy9kYXJrUHVycGxlLnBuZycsXG4gICdmb250cy9rZW52ZWN0b3JfZnV0dXJlX3RoaW4udHRmJyxcbiAgJ3NvdW5kcy9zZnhfbGFzZXIxLm1wMycsXG4gICdzcHJpdGVzL3NoZWV0Lmpzb24nXG5dKS50aGVuKCgpID0+IHNldHVwKCkpXG5cbi8vIGRlZmluZSAnbWFpbicgdmFyaWFibGVzXG5sZXQgY2FudmFzLCBzaGlwLCBtZXNzYWdlLCBzaG9vdFNmeCwgYmdcbmxldCBidWxsZXRzID0gW11cbmxldCBhc3Rlcm9pZHMgPSBbXVxuXG5sZXQgc2NvcmUgPSAwXG5cbmZ1bmN0aW9uIHNob290IChcbiAgICAgICAgICAgIHNob290ZXIsIGFuZ2xlLCBvZmZzZXRGcm9tQ2VudGVyLFxuICAgICAgICAgICAgYnVsbGV0U3BlZWQsIGJ1bGxldHNBcnJheSwgYnVsbGV0U3ByaXRlKSB7XG4gIGxldCBidWxsZXQgPSBidWxsZXRTcHJpdGUoKVxuXG4gIGJ1bGxldC54ID0gc2hvb3Rlci5jZW50ZXJYIC0gYnVsbGV0LmhhbGZXaWR0aCArIChvZmZzZXRGcm9tQ2VudGVyICogTWF0aC5jb3MoYW5nbGUpKVxuICBidWxsZXQueSA9IHNob290ZXIuY2VudGVyWSAtIGJ1bGxldC5oYWxmSGVpZ2h0ICsgKG9mZnNldEZyb21DZW50ZXIgKiBNYXRoLnNpbihhbmdsZSkpXG5cbiAgYnVsbGV0LnZ4ID0gTWF0aC5zaW4oYW5nbGUpICogYnVsbGV0U3BlZWRcbiAgYnVsbGV0LnZ5ID0gLU1hdGguY29zKGFuZ2xlKSAqIGJ1bGxldFNwZWVkXG5cbiAgYnVsbGV0LnJvdGF0aW9uID0gYW5nbGVcblxuICBidWxsZXRzQXJyYXkucHVzaChidWxsZXQpXG5cbiAgcGFydGljbGVFZmZlY3QoYnVsbGV0LngsIGJ1bGxldC55KVxuICBzaG9vdFNmeC5wbGF5KClcbn1cblxuZnVuY3Rpb24gc3Bhd25Bc3Rlcm9pZCAoKSB7XG4gIGxldCB4ID0gcmFuZG9tSW50KDAsIHN0YWdlLmxvY2FsQm91bmRzLndpZHRoKVxuICBsZXQgeSA9IHJhbmRvbUludCgwLCBzdGFnZS5sb2NhbEJvdW5kcy5oZWlnaHQpXG5cbiAgbGV0IGFzdGVyb2lkID0gc3ByaXRlKGFzc2V0c1snbWV0ZW9yQnJvd25fYmlnMS5wbmcnXSwgeCwgeSlcbiAgYXN0ZXJvaWQuY2lyY3VsYXIgPSB0cnVlXG4gIGFzdGVyb2lkLmRpYW1ldGVyID0gOTBcblxuICBhc3Rlcm9pZC52eCA9IHJhbmRvbUZsb2F0KC01LCA1KVxuICBhc3Rlcm9pZC52eSA9IHJhbmRvbUZsb2F0KC01LCA1KVxuXG4gIGFzdGVyb2lkLnJvdGF0aW9uU3BlZWQgPSByYW5kb21GbG9hdCgwLjAxLCAwLjA3KVxuXG4gIGFzdGVyb2lkcy5wdXNoKGFzdGVyb2lkKVxufVxuXG4vLyBMZXQncyBwYXJ0eSBiZWdpbnMhXG5mdW5jdGlvbiBzZXR1cCAoKSB7XG4gIGNhbnZhcyA9IG1ha2VDYW52YXMoMTI4MCwgNzIwLCAnbm9uZScpXG4gIHN0YWdlLndpZHRoID0gY2FudmFzLndpZHRoXG4gIHN0YWdlLmhlaWdodCA9IGNhbnZhcy5oZWlnaHRcblxuICBzaG9vdFNmeCA9IGFzc2V0c1snc291bmRzL3NmeF9sYXNlcjEubXAzJ11cblxuICBiZyA9IGJhY2tncm91bmQoYXNzZXRzWydiZ3MvZGFya1B1cnBsZS5wbmcnXSwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KVxuXG4gIHNoaXAgPSBzcHJpdGUoYXNzZXRzWydwbGF5ZXJTaGlwMl9yZWQucG5nJ10pXG4gIHNoaXAuc2NhbGVYID0gMC41XG4gIHNoaXAuc2NhbGVZID0gMC41XG4gIHN0YWdlLnB1dENlbnRlcihzaGlwKVxuXG4gIHNoaXAudnggPSAwXG4gIHNoaXAudnkgPSAwXG4gIHNoaXAuYWNjZWxlcmF0aW9uWCA9IDAuMlxuICBzaGlwLmFjY2VsZXJhdGlvblkgPSAwLjJcbiAgc2hpcC5mcmljdGlvbiA9IDAuOTZcbiAgc2hpcC5zcGVlZCA9IDBcblxuICBzaGlwLnJvdGF0aW9uU3BlZWQgPSAwXG5cbiAgc2hpcC5tb3ZlRm9yd2FyZCA9IGZhbHNlXG5cbiAgc2hpcC5saXZlcyA9IDNcbiAgc2hpcC5kZXN0cm95ZWQgPSBmYWxzZVxuXG4gIGxldCBsZWZ0QXJyb3cgPSBrZXlib2FyZCgzNylcbiAgbGV0IHJpZ2h0QXJyb3cgPSBrZXlib2FyZCgzOSlcbiAgbGV0IHVwQXJyb3cgPSBrZXlib2FyZCgzOClcbiAgbGV0IHNwYWNlID0ga2V5Ym9hcmQoMzIpXG5cbiAgbGVmdEFycm93LnByZXNzID0gKCkgPT4geyBzaGlwLnJvdGF0aW9uU3BlZWQgPSAtMC4xIH1cbiAgbGVmdEFycm93LnJlbGVhc2UgPSAoKSA9PiB7XG4gICAgaWYgKCFyaWdodEFycm93LmlzRG93bikgc2hpcC5yb3RhdGlvblNwZWVkID0gMFxuICB9XG5cbiAgcmlnaHRBcnJvdy5wcmVzcyA9ICgpID0+IHsgc2hpcC5yb3RhdGlvblNwZWVkID0gMC4xIH1cbiAgcmlnaHRBcnJvdy5yZWxlYXNlID0gKCkgPT4ge1xuICAgIGlmICghbGVmdEFycm93LmlzRG93bikgc2hpcC5yb3RhdGlvblNwZWVkID0gMFxuICB9XG5cbiAgdXBBcnJvdy5wcmVzcyA9ICgpID0+IHsgc2hpcC5tb3ZlRm9yd2FyZCA9IHRydWUgfVxuICB1cEFycm93LnJlbGVhc2UgPSAoKSA9PiB7IHNoaXAubW92ZUZvcndhcmQgPSBmYWxzZSB9XG5cbiAgc3BhY2UucHJlc3MgPSAoKSA9PiB7XG4gICAgc2hvb3QoXG4gICAgICAgICAgICBzaGlwLCBzaGlwLnJvdGF0aW9uLCAxNCwgMTAsIGJ1bGxldHMsXG4gICAgICAgICAgICAoKSA9PiBzcHJpdGUoYXNzZXRzWydsYXNlclJlZDA3LnBuZyddKVxuICAgICAgICApXG4gICAgc2hvb3QoXG4gICAgICAgICAgICBzaGlwLCBzaGlwLnJvdGF0aW9uLCAtMTQsIDEwLCBidWxsZXRzLFxuICAgICAgICAgICAgKCkgPT4gc3ByaXRlKGFzc2V0c1snbGFzZXJSZWQwNy5wbmcnXSlcbiAgICAgICAgKVxuICB9XG5cbiAgbWVzc2FnZSA9IHRleHQoJ0hlbGxvIScsICcxNnB4IGtlbnZlY3Rvcl9mdXR1cmVfdGhpbicsICd3aGl0ZScsIDgsIDgpXG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCA1OyBpKyspIHtcbiAgICBzcGF3bkFzdGVyb2lkKClcbiAgfVxuXG4gIGdhbWVMb29wKClcbn1cblxuZnVuY3Rpb24gZ2FtZUxvb3AgKCkge1xuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZ2FtZUxvb3ApXG5cbiAgaWYgKHBhcnRpY2xlcy5sZW5ndGggPiAwKSB7XG4gICAgcGFydGljbGVzLmZvckVhY2gocGFydGljbGUgPT4ge1xuICAgICAgcGFydGljbGUudXBkYXRlKClcbiAgICB9KVxuICB9XG5cbiAgYnVsbGV0cyA9IGJ1bGxldHMuZmlsdGVyKGJ1bGxldCA9PiB7XG4gICAgYnVsbGV0LnggKz0gYnVsbGV0LnZ4XG4gICAgYnVsbGV0LnkgKz0gYnVsbGV0LnZ5XG5cbiAgICBsZXQgY29sbGlzaW9uID0gb3V0c2lkZUJvdW5kcyhidWxsZXQsIHN0YWdlLmxvY2FsQm91bmRzKVxuXG4gICAgaWYgKGNvbGxpc2lvbikge1xuICAgICAgcmVtb3ZlKGJ1bGxldClcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIHJldHVybiB0cnVlXG4gIH0pXG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBhc3Rlcm9pZHMubGVuZ3RoOyBpKyspIHtcbiAgICBsZXQgYTEgPSBhc3Rlcm9pZHNbaV1cblxuICAgIC8vIHVwZGF0ZSBhc3Rlcm9pZFxuICAgIGExLnJvdGF0aW9uICs9IGExLnJvdGF0aW9uU3BlZWRcbiAgICBhMS54ICs9IGExLnZ4XG4gICAgYTEueSArPSBhMS52eVxuXG4gICAgd3JhcChhMSwgc3RhZ2UubG9jYWxCb3VuZHMpXG5cbiAgICAvLyBjaGVjayBjb2xsaXNpc29uc1xuICAgIC8vIGJldHdlZW4gYXN0ZXJvaWRzXG4gICAgZm9yIChsZXQgaiA9IGkgKyAxOyBqIDwgYXN0ZXJvaWRzLmxlbmd0aDsgaisrKSB7XG4gICAgICBsZXQgYTIgPSBhc3Rlcm9pZHNbal1cblxuICAgICAgbW92aW5nQ2lyY2xlQ29sbGlzaW9uKGExLCBhMilcbiAgICB9XG4gICAgICAgIC8vIGFuZCB3aXRoIHBsYXllclxuICAgIGxldCBwbGF5ZXJIaXQgPSBjaXJjbGVSZWN0YW5nbGVDb2xsaXNpb24oYTEsIHNoaXAsIHRydWUpXG4gICAgaWYgKHBsYXllckhpdCkge1xuICAgICAgc2hpcC5saXZlcyAtPSAxXG4gICAgICAvLyBkZXN0cm95IHNoaXBcbiAgICAgIHNoaXAuZGVzdHJveWVkID0gdHJ1ZVxuICAgICAgLy8gc3RhZ2UucmVtb3ZlQ2hpbGQoc2hpcCk7XG4gICAgICBwYXJ0aWNsZUVmZmVjdChzaGlwLmNlbnRlclgsIHNoaXAuY2VudGVyWSlcblxuICAgICAgLy8gcmVzcGF3biBzaGlwXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgLy8gc3RhZ2UuYWRkQ2hpbGQoc2hpcCk7XG4gICAgICAgIHN0YWdlLnB1dENlbnRlcihzaGlwKVxuICAgICAgICBzaGlwLnJvdGF0aW9uID0gMFxuICAgICAgICBzaGlwLmRlc3Ryb3llZCA9IGZhbHNlXG4gICAgICB9LCAxMDAwKVxuICAgIH1cbiAgfVxuXG4gIGlmICghc2hpcC5kZXN0cm95ZWQpIHtcbiAgICBzaGlwLnJvdGF0aW9uICs9IHNoaXAucm90YXRpb25TcGVlZFxuXG4gICAgaWYgKHNoaXAubW92ZUZvcndhcmQpIHtcbiAgICAgIHNoaXAudnggKz0gc2hpcC5hY2NlbGVyYXRpb25YICogTWF0aC5zaW4oc2hpcC5yb3RhdGlvbilcbiAgICAgIHNoaXAudnkgKz0gLXNoaXAuYWNjZWxlcmF0aW9uWSAqIE1hdGguY29zKHNoaXAucm90YXRpb24pXG4gICAgfSBlbHNlIHtcbiAgICAgIHNoaXAudnggKj0gc2hpcC5mcmljdGlvblxuICAgICAgc2hpcC52eSAqPSBzaGlwLmZyaWN0aW9uXG4gICAgfVxuXG4gICAgc2hpcC54ICs9IHNoaXAudnhcbiAgICBzaGlwLnkgKz0gc2hpcC52eVxuXG4gICAgd3JhcChzaGlwLCBzdGFnZS5sb2NhbEJvdW5kcylcbiAgfVxuXG4gIGJnLnggLT0gTWF0aC5mbG9vcihzaGlwLnZ4KVxuICBiZy55IC09IE1hdGguZmxvb3Ioc2hpcC52eSlcblxuICBtZXNzYWdlLmNvbnRlbnQgPSAnU2NvcmVzOiAnICsgc2NvcmVcblxuICByZW5kZXIoY2FudmFzKVxufVxuIl19
