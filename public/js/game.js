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
      (0, _display.particleEffect)(ship.x, ship.y);

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnRcXHNyY1xcanNcXGVuZ2luZVxcY29sbGlzaW9uLmpzIiwiY2xpZW50XFxzcmNcXGpzXFxlbmdpbmVcXGRpc3BsYXkuanMiLCJjbGllbnRcXHNyY1xcanNcXGVuZ2luZVxcaW50ZXJhY3RpdmUuanMiLCJjbGllbnRcXHNyY1xcanNcXGVuZ2luZVxcc291bmQuanMiLCJjbGllbnRcXHNyY1xcanNcXGVuZ2luZVxcdXRpbGl0aWVzLmpzIiwiY2xpZW50XFxzcmNcXGpzXFxnYW1lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7UUNBZ0IsWSxHQUFBLFk7UUE2QkEsYSxHQUFBLGE7UUFtQkEsZSxHQUFBLGU7UUEwQ0EscUIsR0FBQSxxQjtRQW9GQSx1QixHQUFBLHVCO1FBVUEsZ0IsR0FBQSxnQjtRQTZCQSxrQixHQUFBLGtCO1FBeURBLHNCLEdBQUEsc0I7UUEyRUEsa0IsR0FBQSxrQjtRQVVBLHdCLEdBQUEsd0I7UUE2RUEsb0IsR0FBQSxvQjtRQTZDQSxHLEdBQUEsRztBQTdkVCxTQUFTLFlBQVQsQ0FBdUIsS0FBdkIsRUFBOEIsTUFBOUIsRUFBc0M7QUFDM0MsTUFBSSxjQUFKO0FBQUEsTUFBVyxhQUFYO0FBQUEsTUFBaUIsY0FBakI7QUFBQSxNQUF3QixZQUF4QjtBQUFBLE1BQTZCLGVBQTdCO0FBQUEsTUFBcUMsV0FBckM7QUFBQSxNQUF5QyxXQUF6QztBQUFBLE1BQTZDLGtCQUE3QztBQUFBLE1BQXdELFlBQXhEOztBQUVBLE1BQUksT0FBTyxNQUFYLEVBQW1CO0FBQ2pCLFlBQVEsUUFBUjtBQUNELEdBRkQsTUFFTztBQUNMLFlBQVEsV0FBUjtBQUNEOztBQUVELE1BQUksVUFBVSxXQUFkLEVBQTJCO0FBQ3pCLFdBQU8sT0FBTyxDQUFkO0FBQ0EsWUFBUSxPQUFPLENBQVAsR0FBVyxPQUFPLEtBQTFCO0FBQ0EsVUFBTSxPQUFPLENBQWI7QUFDQSxh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QUFDbkIsU0FBSyxRQUFMLElBQWlCLEtBQUssYUFBdEI7O0FBRUEsUUFBSSxLQUFLLFdBQVQsRUFBc0I7QUFDcEIsV0FBSyxFQUFMLElBQVcsS0FBSyxhQUFMLEdBQXFCLEtBQUssR0FBTCxDQUFTLEtBQUssUUFBZCxDQUFoQztBQUNBLFdBQUssRUFBTCxJQUFXLENBQUMsS0FBSyxhQUFOLEdBQXNCLEtBQUssR0FBTCxDQUFTLEtBQUssUUFBZCxDQUFqQztBQUNELEtBSEQsTUFHTztBQUNMLFdBQUssRUFBTCxJQUFXLEtBQUssUUFBaEI7QUFDQSxXQUFLLEVBQUwsSUFBVyxLQUFLLFFBQWhCO0FBQ0Q7O0FBRUQsU0FBSyxDQUFMLElBQVUsS0FBSyxFQUFmO0FBQ0EsU0FBSyxDQUFMLElBQVUsS0FBSyxFQUFmOztBQUVBLHlCQUFLLElBQUwsRUFBVyxlQUFNLFdBQWpCO0FBQ0Q7O0FBRUQsS0FBRyxDQUFILElBQVEsS0FBSyxLQUFMLENBQVcsS0FBSyxFQUFoQixDQUFSO0FBQ0EsS0FBRyxDQUFILElBQVEsS0FBSyxLQUFMLENBQVcsS0FBSyxFQUFoQixDQUFSOztBQUVBLFVBQVEsT0FBUixHQUFrQixhQUFhLEtBQS9COztBQUVBLHVCQUFPLE1BQVA7QUFDRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJleHBvcnQgZnVuY3Rpb24gaGl0VGVzdFBvaW50IChwb2ludCwgc3ByaXRlKSB7XG4gIGxldCBzaGFwZSwgbGVmdCwgcmlnaHQsIHRvcCwgYm90dG9tLCB2eCwgdnksIG1hZ25pdHVkZSwgaGl0XG5cbiAgaWYgKHNwcml0ZS5yYWRpdXMpIHtcbiAgICBzaGFwZSA9ICdjaXJjbGUnXG4gIH0gZWxzZSB7XG4gICAgc2hhcGUgPSAncmVjdGFuZ2xlJ1xuICB9XG5cbiAgaWYgKHNoYXBlID09PSAncmVjdGFuZ2xlJykge1xuICAgIGxlZnQgPSBzcHJpdGUueFxuICAgIHJpZ2h0ID0gc3ByaXRlLnggKyBzcHJpdGUud2lkdGhcbiAgICB0b3AgPSBzcHJpdGUueVxuICAgIGJvdHRvbSA9IHNwcml0ZS55ICsgc3ByaXRlLmhlaWdodFxuXG4gICAgaGl0ID0gcG9pbnQueCA+IGxlZnQgJiYgcG9pbnQueCA8IHJpZ2h0ICYmIHBvaW50LnkgPiB0b3AgJiYgcG9pbnQueSA8IGJvdHRvbVxuICB9XG5cbiAgaWYgKHNoYXBlID09PSAnY2lyY2xlJykge1xuICAgIHZ4ID0gcG9pbnQueCAtIHNwcml0ZS5jZW50ZXJYXG4gICAgdnkgPSBwb2ludC55IC0gc3ByaXRlLmNlbnRlcllcbiAgICBtYWduaXR1ZGUgPSBNYXRoLnNxcnQodnggKiB2eCArIHZ5ICogdnkpXG5cbiAgICBoaXQgPSBtYWduaXR1ZGUgPCBzcHJpdGUucmFkaXVzXG4gIH1cblxuICByZXR1cm4gaGl0XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoaXRUZXN0Q2lyY2xlIChjMSwgYzIsIGdsb2JhbCA9IGZhbHNlKSB7XG4gIGxldCB2eCwgdnksIG1hZ25pdHVkZSwgY29tYmluZWRSYWRpaSwgaGl0XG5cbiAgaWYgKGdsb2JhbCkge1xuICAgIHZ4ID0gKGMyLmd4ICsgYzIucmFkaXVzKSAtIChjMS5neCArIGMxLnJhZGl1cylcbiAgICB2eSA9IChjMi5neSArIGMyLnJhZGl1cykgLSAoYzEuZ3kgKyBjMS5yYWRpdXMpXG4gIH0gZWxzZSB7XG4gICAgdnggPSBjMi5jZW50ZXJYIC0gYzEuY2VudGVyWFxuICAgIHZ5ID0gYzIuY2VudGVyWSAtIGMxLmNlbnRlcllcbiAgfVxuXG4gIG1hZ25pdHVkZSA9IE1hdGguc3FydCh2eCAqIHZ4ICsgdnkgKiB2eSlcblxuICBjb21iaW5lZFJhZGlpID0gYzEucmFkaXVzICsgYzIucmFkaXVzXG4gIGhpdCA9IG1hZ25pdHVkZSA8IGNvbWJpbmVkUmFkaWlcblxuICByZXR1cm4gaGl0XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gY2lyY2xlQ29sbGlzaW9uIChjMSwgYzIsIGJvdW5jZSA9IGZhbHNlLCBnbG9iYWwgPSBmYWxzZSkge1xuICBsZXQgbWFnbml0dWRlLCBjb21iaW5lZFJhZGlpLCBvdmVybGFwXG4gIGxldCB2eCwgdnksIGR4LCBkeVxuICBsZXQgcyA9IHt9XG4gIGxldCBoaXQgPSBmYWxzZVxuXG4gIGlmIChnbG9iYWwpIHtcbiAgICB2eCA9IChjMi5neCArIGMyLnJhZGl1cykgLSAoYzEuZ3ggKyBjMS5yYWRpdXMpXG4gICAgdnkgPSAoYzIuZ3kgKyBjMi5yYWRpdXMpIC0gKGMxLmd5ICsgYzEucmFkaXVzKVxuICB9IGVsc2Uge1xuICAgIHZ4ID0gYzIuY2VudGVyWCAtIGMxLmNlbnRlclhcbiAgICB2eSA9IGMyLmNlbnRlclkgLSBjMS5jZW50ZXJZXG4gIH1cblxuICBtYWduaXR1ZGUgPSBNYXRoLnNxcnQodnggKiB2eCArIHZ5ICogdnkpXG5cbiAgY29tYmluZWRSYWRpaSA9IGMxLnJhZGl1cyArIGMyLnJhZGl1c1xuXG4gIGlmIChtYWduaXR1ZGUgPCBjb21iaW5lZFJhZGlpKSB7XG4gICAgaGl0ID0gdHJ1ZVxuXG4gICAgb3ZlcmxhcCA9IGNvbWJpbmVkUmFkaWkgLSBtYWduaXR1ZGVcblxuICAgIGxldCBxdWFudHVtUGFkZGluZyA9IDAuM1xuICAgIG92ZXJsYXAgKz0gcXVhbnR1bVBhZGRpbmdcblxuICAgIGR4ID0gdnggLyBtYWduaXR1ZGVcbiAgICBkeSA9IHZ5IC8gbWFnbml0dWRlXG5cbiAgICBjMS54IC09IG92ZXJsYXAgKiBkeFxuICAgIGMxLnkgLT0gb3ZlcmxhcCAqIGR5XG5cbiAgICBpZiAoYm91bmNlKSB7XG4gICAgICBzLnggPSB2eVxuICAgICAgcy55ID0gLXZ4XG5cbiAgICAgIGJvdW5jZU9mZlN1cmZhY2UoYzEsIHMpXG4gICAgfVxuICB9XG4gIHJldHVybiBoaXRcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1vdmluZ0NpcmNsZUNvbGxpc2lvbiAoYzEsIGMyLCBnbG9iYWwgPSBmYWxzZSkge1xuICBsZXQgY29tYmluZWRSYWRpaSwgb3ZlcmxhcCwgeFNpZGUsIHlTaWRlXG4gIGxldCBzID0ge31cbiAgbGV0IHAxQSA9IHt9XG4gIGxldCBwMUIgPSB7fVxuICBsZXQgcDJBID0ge31cbiAgbGV0IHAyQiA9IHt9XG4gIGxldCBoaXQgPSBmYWxzZVxuXG4gIGMxLm1hc3MgPSBjMS5tYXNzIHx8IDFcbiAgYzIubWFzcyA9IGMyLm1hc3MgfHwgMVxuXG4gIGlmIChnbG9iYWwpIHtcbiAgICBzLnZ4ID0gKGMyLmd4ICsgYzIucmFkaXVzKSAtIChjMS5neCArIGMxLnJhZGl1cylcbiAgICBzLnZ5ID0gKGMyLmd5ICsgYzIucmFkaXVzKSAtIChjMS5neSArIGMxLnJhZGl1cylcbiAgfSBlbHNlIHtcbiAgICBzLnZ4ID0gYzIuY2VudGVyWCAtIGMxLmNlbnRlclhcbiAgICBzLnZ5ID0gYzIuY2VudGVyWSAtIGMxLmNlbnRlcllcbiAgfVxuXG4gIHMubWFnbml0dWRlID0gTWF0aC5zcXJ0KHMudnggKiBzLnZ4ICsgcy52eSAqIHMudnkpXG5cbiAgY29tYmluZWRSYWRpaSA9IGMxLnJhZGl1cyArIGMyLnJhZGl1c1xuXG4gIGlmIChzLm1hZ25pdHVkZSA8IGNvbWJpbmVkUmFkaWkpIHtcbiAgICBoaXQgPSB0cnVlXG5cbiAgICBvdmVybGFwID0gY29tYmluZWRSYWRpaSAtIHMubWFnbml0dWRlXG4gICAgb3ZlcmxhcCArPSAwLjNcblxuICAgIHMuZHggPSBzLnZ4IC8gcy5tYWduaXR1ZGVcbiAgICBzLmR5ID0gcy52eSAvIHMubWFnbml0dWRlXG5cbiAgICBzLnZ4SGFsZiA9IE1hdGguYWJzKHMuZHggKiBvdmVybGFwIC8gMilcbiAgICBzLnZ5SGFsZiA9IE1hdGguYWJzKHMuZHkgKiBvdmVybGFwIC8gMilcblxuICAgIHhTaWRlID0gKGMxLnggPiBjMi54KSA/IDEgOiAtMVxuICAgIHlTaWRlID0gKGMxLnkgPiBjMi55KSA/IDEgOiAtMVxuXG4gICAgYzEueCA9IGMxLnggKyAocy52eEhhbGYgKiB4U2lkZSlcbiAgICBjMS55ID0gYzEueSArIChzLnZ5SGFsZiAqIHlTaWRlKVxuXG4gICAgYzIueCA9IGMyLnggKyAocy52eEhhbGYgKiAteFNpZGUpXG4gICAgYzIueSA9IGMyLnkgKyAocy52eUhhbGYgKiAteVNpZGUpXG5cbiAgICBzLmx4ID0gcy52eVxuICAgIHMubHkgPSAtcy52eFxuXG4gICAgbGV0IGRwMSA9IGMxLnZ4ICogcy5keCArIGMxLnZ5ICogcy5keVxuXG4gICAgcDFBLnggPSBkcDEgKiBzLmR4XG4gICAgcDFBLnkgPSBkcDEgKiBzLmR5XG5cbiAgICBsZXQgZHAyID0gYzEudnggKiAocy5seCAvIHMubWFnbml0dWRlKSArIGMxLnZ5ICogKHMubHkgLyBzLm1hZ25pdHVkZSlcblxuICAgIHAxQi54ID0gZHAyICogKHMubHggLyBzLm1hZ25pdHVkZSlcbiAgICBwMUIueSA9IGRwMiAqIChzLmx5IC8gcy5tYWduaXR1ZGUpXG5cbiAgICBsZXQgZHAzID0gYzIudnggKiBzLmR4ICsgYzIudnkgKiBzLmR5XG5cbiAgICBwMkEueCA9IGRwMyAqIHMuZHhcbiAgICBwMkEueSA9IGRwMyAqIHMuZHlcblxuICAgIGxldCBkcDQgPSBjMi52eCAqIChzLmx4IC8gcy5tYWduaXR1ZGUpICsgYzIudnkgKiAocy5seSAvIHMubWFnbml0dWRlKVxuXG4gICAgcDJCLnggPSBkcDQgKiAocy5seCAvIHMubWFnbml0dWRlKVxuICAgIHAyQi55ID0gZHA0ICogKHMubHkgLyBzLm1hZ25pdHVkZSlcblxuICAgIGMxLmJvdW5jZSA9IHt9XG4gICAgYzEuYm91bmNlLnggPSBwMUIueCArIHAyQS54XG4gICAgYzEuYm91bmNlLnkgPSBwMUIueSArIHAyQS55XG5cbiAgICBjMi5ib3VuY2UgPSB7fVxuICAgIGMyLmJvdW5jZS54ID0gcDFBLnggKyBwMkIueFxuICAgIGMyLmJvdW5jZS55ID0gcDFBLnkgKyBwMkIueVxuXG4gICAgYzEudnggPSBjMS5ib3VuY2UueCAvIGMxLm1hc3NcbiAgICBjMS52eSA9IGMxLmJvdW5jZS55IC8gYzEubWFzc1xuICAgIGMyLnZ4ID0gYzIuYm91bmNlLnggLyBjMi5tYXNzXG4gICAgYzIudnkgPSBjMi5ib3VuY2UueSAvIGMyLm1hc3NcbiAgfVxuICByZXR1cm4gaGl0XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtdWx0aXBsZUNpcmNsZUNvbGxpc2lvbiAoYXJyYXlPZkNpcmNsZXMsIGdsb2JhbCA9IGZhbHNlKSB7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgYXJyYXlPZkNpcmNsZXMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgYzEgPSBhcnJheU9mQ2lyY2xlc1tpXVxuICAgIGZvciAobGV0IGogPSBpICsgMTsgaiA8IGFycmF5T2ZDaXJjbGVzLmxlbmd0aDsgaisrKSB7XG4gICAgICBsZXQgYzIgPSBhcnJheU9mQ2lyY2xlc1tqXVxuICAgICAgbW92aW5nQ2lyY2xlQ29sbGlzaW9uKGMxLCBjMiwgZ2xvYmFsKVxuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaGl0VGVzdFJlY3RhbmdsZSAocjEsIHIyLCBnbG9iYWwgPSBmYWxzZSkge1xuICBsZXQgaGl0LCBjb21iaW5lZEhhbGZXaWR0aHMsIGNvbWJpbmVkSGFsZkhlaWdodHMsIHZ4LCB2eVxuXG4gIGhpdCA9IGZhbHNlXG5cbiAgaWYgKGdsb2JhbCkge1xuICAgIHZ4ID0gKHIxLmd4ICsgcjEuaGFsZldpZHRoKSAtIChyMi5neCArIHIyLmhhbGZXaWR0aClcbiAgICB2eSA9IChyMS5neSArIHIxLmhhbGZIZWlnaHQpIC0gKHIyLmd5ICsgcjIuaGFsZkhlaWdodClcbiAgfSBlbHNlIHtcbiAgICB2eCA9IHIxLmNlbnRlclggLSByMi5jZW50ZXJYXG4gICAgdnkgPSByMS5jZW50ZXJZIC0gcjIuY2VudGVyWVxuICB9XG5cbiAgY29tYmluZWRIYWxmV2lkdGhzID0gcjEuaGFsZldpZHRoICsgcjIuaGFsZldpZHRoXG4gIGNvbWJpbmVkSGFsZkhlaWdodHMgPSByMS5oYWxmSGVpZ2h0ICsgcjIuaGFsZkhlaWdodFxuXG4gIGlmIChNYXRoLmFicyh2eCkgPCBjb21iaW5lZEhhbGZXaWR0aHMpIHtcbiAgICBpZiAoTWF0aC5hYnModnkpIDwgY29tYmluZWRIYWxmSGVpZ2h0cykge1xuICAgICAgaGl0ID0gdHJ1ZVxuICAgIH0gZWxzZSB7XG4gICAgICBoaXQgPSBmYWxzZVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBoaXQgPSBmYWxzZVxuICB9XG5cbiAgcmV0dXJuIGhpdFxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVjdGFuZ2xlQ29sbGlzaW9uIChcbiAgcjEsIHIyLCBib3VuY2UgPSBmYWxzZSwgZ2xvYmFsID0gdHJ1ZVxuKSB7XG4gIGxldCBjb2xsaXNpb24sIGNvbWJpbmVkSGFsZldpZHRocywgY29tYmluZWRIYWxmSGVpZ2h0cyxcbiAgICBvdmVybGFwWCwgb3ZlcmxhcFksIHZ4LCB2eVxuXG4gIGlmIChnbG9iYWwpIHtcbiAgICB2eCA9IChyMS5neCArIHIxLmhhbGZXaWR0aCkgLSAocjIuZ3ggKyByMi5oYWxmV2lkdGgpXG4gICAgdnkgPSAocjEuZ3kgKyByMS5oYWxmSGVpZ2h0KSAtIChyMi5neSArIHIyLmhhbGZIZWlnaHQpXG4gIH0gZWxzZSB7XG4gICAgdnggPSByMS5jZW50ZXJYIC0gcjIuY2VudGVyWFxuICAgIHZ5ID0gcjEuY2VudGVyWSAtIHIyLmNlbnRlcllcbiAgfVxuXG4gIGNvbWJpbmVkSGFsZldpZHRocyA9IHIxLmhhbGZXaWR0aCArIHIyLmhhbGZXaWR0aFxuICBjb21iaW5lZEhhbGZIZWlnaHRzID0gcjEuaGFsZkhlaWdodCArIHIyLmhhbGZIZWlnaHRcblxuICBpZiAoTWF0aC5hYnModngpIDwgY29tYmluZWRIYWxmV2lkdGhzKSB7XG4gICAgaWYgKE1hdGguYWJzKHZ5KSA8IGNvbWJpbmVkSGFsZkhlaWdodHMpIHtcbiAgICAgIG92ZXJsYXBYID0gY29tYmluZWRIYWxmV2lkdGhzIC0gTWF0aC5hYnModngpXG4gICAgICBvdmVybGFwWSA9IGNvbWJpbmVkSGFsZkhlaWdodHMgLSBNYXRoLmFicyh2eSlcblxuICAgICAgaWYgKG92ZXJsYXBYID49IG92ZXJsYXBZKSB7XG4gICAgICAgIGlmICh2eSA+IDApIHtcbiAgICAgICAgICBjb2xsaXNpb24gPSAndG9wJ1xuICAgICAgICAgIHIxLnkgPSByMS55ICsgb3ZlcmxhcFlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb2xsaXNpb24gPSAnYm90dG9tJ1xuICAgICAgICAgIHIxLnkgPSByMS55IC0gb3ZlcmxhcFlcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChib3VuY2UpIHtcbiAgICAgICAgICByMS52eSAqPSAtMVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAodnggPiAwKSB7XG4gICAgICAgICAgY29sbGlzaW9uID0gJ2xlZnQnXG4gICAgICAgICAgcjEueCA9IHIxLnggKyBvdmVybGFwWFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbGxpc2lvbiA9ICdyaWdodCdcbiAgICAgICAgICByMS54ID0gcjEueCAtIG92ZXJsYXBYXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoYm91bmNlKSB7XG4gICAgICAgICAgcjEudnggKj0gLTFcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBObyBjb2xsaXNpb25cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgLy8gTm8gY29sbGlzaW9uXG4gIH1cblxuICByZXR1cm4gY29sbGlzaW9uXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoaXRUZXN0Q2lyY2xlUmVjdGFuZ2xlIChjMSwgcjEsIGdsb2JhbCA9IGZhbHNlKSB7XG4gIGxldCByZWdpb24sIGNvbGxpc2lvbiwgYzF4LCBjMXksIHIxeCwgcjF5XG5cbiAgaWYgKGdsb2JhbCkge1xuICAgIGMxeCA9IGMxLmd4XG4gICAgYzF5ID0gYzEuZ3lcbiAgICByMXggPSByMS5neFxuICAgIHIxeSA9IHIxLmd5XG4gIH0gZWxzZSB7XG4gICAgYzF4ID0gYzEueFxuICAgIGMxeSA9IGMxLnlcbiAgICByMXggPSByMS54XG4gICAgcjF5ID0gcjEueVxuICB9XG5cbiAgaWYgKGMxeSA8IHIxeSAtIHIxLmhhbGZIZWlnaHQpIHtcbiAgICBpZiAoYzF4IDwgcjF4IC0gMSAtIHIxLmhhbGZXaWR0aCkge1xuICAgICAgcmVnaW9uID0gJ3RvcExlZnQnXG4gICAgfSBlbHNlIGlmIChjMXggPiByMXggKyAxICsgcjEuaGFsZldpZHRoKSB7XG4gICAgICByZWdpb24gPSAndG9wUmlnaHQnXG4gICAgfSBlbHNlIHtcbiAgICAgIHJlZ2lvbiA9ICd0b3BNaWRkbGUnXG4gICAgfVxuICB9IGVsc2UgaWYgKGMxeSA+IHIxeSArIHIxLmhhbGZIZWlnaHQpIHtcbiAgICBpZiAoYzF4IDwgcjF4IC0gMSAtIHIxLmhhbGZXaWR0aCkge1xuICAgICAgcmVnaW9uID0gJ2JvdHRvbUxlZnQnXG4gICAgfSBlbHNlIGlmIChjMXggPiByMXggKyAxICsgcjEuaGFsZldpZHRoKSB7XG4gICAgICByZWdpb24gPSAnYm90dG9tUmlnaHQnXG4gICAgfSBlbHNlIHtcbiAgICAgIHJlZ2lvbiA9ICdib3R0b21NaWRkbGUnXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGlmIChjMXggPCByMXggLSByMS5oYWxmV2lkdGgpIHtcbiAgICAgIHJlZ2lvbiA9ICdsZWZ0TWlkZGxlJ1xuICAgIH0gZWxzZSB7XG4gICAgICByZWdpb24gPSAncmlnaHRNaWRkbGUnXG4gICAgfVxuICB9XG5cbiAgaWYgKHJlZ2lvbiA9PT0gJ3RvcE1pZGRsZScgfHwgcmVnaW9uID09PSAnYm90dG9tTWlkZGxlJyB8fCByZWdpb24gPT09ICdsZWZ0TWlkZGxlJyB8fCByZWdpb24gPT09ICdyaWdodE1pZGRsZScpIHtcbiAgICBjb2xsaXNpb24gPSBoaXRUZXN0UmVjdGFuZ2xlKGMxLCByMSwgZ2xvYmFsKVxuICB9IGVsc2Uge1xuICAgIGxldCBwb2ludCA9IHt9XG5cbiAgICBzd2l0Y2ggKHJlZ2lvbikge1xuICAgICAgY2FzZSAndG9wTGVmdCc6XG4gICAgICAgIHBvaW50LnggPSByMXhcbiAgICAgICAgcG9pbnQueSA9IHIxeVxuICAgICAgICBicmVha1xuXG4gICAgICBjYXNlICd0b3BSaWdodCc6XG4gICAgICAgIHBvaW50LnggPSByMXggKyByMS53aWR0aFxuICAgICAgICBwb2ludC55ID0gcjF5XG4gICAgICAgIGJyZWFrXG5cbiAgICAgIGNhc2UgJ2JvdHRvbUxlZnQnOlxuICAgICAgICBwb2ludC54ID0gcjF4XG4gICAgICAgIHBvaW50LnkgPSByMXkgKyByMS5oZWlnaHRcbiAgICAgICAgYnJlYWtcblxuICAgICAgY2FzZSAnYm90dG9tUmlnaHQnOlxuICAgICAgICBwb2ludC54ID0gcjF4ICsgcjEud2lkdGhcbiAgICAgICAgcG9pbnQueSA9IHIxeSArIHIxLmhlaWdodFxuICAgIH1cblxuICAgIGNvbGxpc2lvbiA9IGhpdFRlc3RDaXJjbGVQb2ludChjMSwgcG9pbnQsIGdsb2JhbClcbiAgfVxuXG4gIGlmIChjb2xsaXNpb24pIHtcbiAgICByZXR1cm4gcmVnaW9uXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGNvbGxpc2lvblxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoaXRUZXN0Q2lyY2xlUG9pbnQgKGMxLCBwb2ludCwgZ2xvYmFsID0gZmFsc2UpIHtcbiAgcG9pbnQuZGlhbWV0ZXIgPSAxXG4gIHBvaW50LnJhZGl1cyA9IDAuNVxuICBwb2ludC5jZW50ZXJYID0gcG9pbnQueFxuICBwb2ludC5jZW50ZXJZID0gcG9pbnQueVxuICBwb2ludC5neCA9IHBvaW50LnhcbiAgcG9pbnQuZ3kgPSBwb2ludC55XG4gIHJldHVybiBoaXRUZXN0Q2lyY2xlKGMxLCBwb2ludCwgZ2xvYmFsKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY2lyY2xlUmVjdGFuZ2xlQ29sbGlzaW9uIChcbiAgYzEsIHIxLCBib3VuY2UgPSBmYWxzZSwgZ2xvYmFsID0gZmFsc2Vcbikge1xuICBsZXQgcmVnaW9uLCBjb2xsaXNpb24sIGMxeCwgYzF5LCByMXgsIHIxeVxuXG4gIGlmIChnbG9iYWwpIHtcbiAgICBjMXggPSBjMS5neFxuICAgIGMxeSA9IGMxLmd5XG4gICAgcjF4ID0gcjEuZ3hcbiAgICByMXkgPSByMS5neVxuICB9IGVsc2Uge1xuICAgIGMxeCA9IGMxLnhcbiAgICBjMXkgPSBjMS55XG4gICAgcjF4ID0gcjEueFxuICAgIHIxeSA9IHIxLnlcbiAgfVxuXG4gIGlmIChjMXkgPCByMXkgLSByMS5oYWxmSGVpZ2h0KSB7XG4gICAgaWYgKGMxeCA8IHIxeCAtIDEgLSByMS5oYWxmV2lkdGgpIHtcbiAgICAgIHJlZ2lvbiA9ICd0b3BMZWZ0J1xuICAgIH0gZWxzZSBpZiAoYzF4ID4gcjF4ICsgMSArIHIxLmhhbGZXaWR0aCkge1xuICAgICAgcmVnaW9uID0gJ3RvcFJpZ2h0J1xuICAgIH0gZWxzZSB7XG4gICAgICByZWdpb24gPSAndG9wTWlkZGxlJ1xuICAgIH1cbiAgfSBlbHNlIGlmIChjMXkgPiByMXkgKyByMS5oYWxmSGVpZ2h0KSB7XG4gICAgaWYgKGMxeCA8IHIxeCAtIDEgLSByMS5oYWxmV2lkdGgpIHtcbiAgICAgIHJlZ2lvbiA9ICdib3R0b21MZWZ0J1xuICAgIH0gZWxzZSBpZiAoYzF4ID4gcjF4ICsgMSArIHIxLmhhbGZXaWR0aCkge1xuICAgICAgcmVnaW9uID0gJ2JvdHRvbVJpZ2h0J1xuICAgIH0gZWxzZSB7XG4gICAgICByZWdpb24gPSAnYm90dG9tTWlkZGxlJ1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBpZiAoYzF4IDwgcjF4IC0gcjEuaGFsZldpZHRoKSB7XG4gICAgICByZWdpb24gPSAnbGVmdE1pZGRsZSdcbiAgICB9IGVsc2Uge1xuICAgICAgcmVnaW9uID0gJ3JpZ2h0TWlkZGxlJ1xuICAgIH1cbiAgfVxuXG4gIGlmIChyZWdpb24gPT09ICd0b3BNaWRkbGUnIHx8IHJlZ2lvbiA9PT0gJ2JvdHRvbU1pZGRsZScgfHwgcmVnaW9uID09PSAnbGVmdE1pZGRsZScgfHwgcmVnaW9uID09PSAncmlnaHRNaWRkbGUnKSB7XG4gICAgY29sbGlzaW9uID0gcmVjdGFuZ2xlQ29sbGlzaW9uKGMxLCByMSwgYm91bmNlLCBnbG9iYWwpXG4gIH0gZWxzZSB7XG4gICAgbGV0IHBvaW50ID0ge31cblxuICAgIHN3aXRjaCAocmVnaW9uKSB7XG4gICAgICBjYXNlICd0b3BMZWZ0JzpcbiAgICAgICAgcG9pbnQueCA9IHIxeFxuICAgICAgICBwb2ludC55ID0gcjF5XG4gICAgICAgIGJyZWFrXG5cbiAgICAgIGNhc2UgJ3RvcFJpZ2h0JzpcbiAgICAgICAgcG9pbnQueCA9IHIxeCArIHIxLndpZHRoXG4gICAgICAgIHBvaW50LnkgPSByMXlcbiAgICAgICAgYnJlYWtcblxuICAgICAgY2FzZSAnYm90dG9tTGVmdCc6XG4gICAgICAgIHBvaW50LnggPSByMXhcbiAgICAgICAgcG9pbnQueSA9IHIxeSArIHIxLmhlaWdodFxuICAgICAgICBicmVha1xuXG4gICAgICBjYXNlICdib3R0b21SaWdodCc6XG4gICAgICAgIHBvaW50LnggPSByMXggKyByMS53aWR0aFxuICAgICAgICBwb2ludC55ID0gcjF5ICsgcjEuaGVpZ2h0XG4gICAgfVxuXG4gICAgY29sbGlzaW9uID0gY2lyY2xlUG9pbnRDb2xsaXNpb24oYzEsIHBvaW50LCBib3VuY2UsIGdsb2JhbClcbiAgfVxuXG4gIGlmIChjb2xsaXNpb24pIHtcbiAgICByZXR1cm4gcmVnaW9uXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGNvbGxpc2lvblxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjaXJjbGVQb2ludENvbGxpc2lvbiAoYzEsIHBvaW50LCBib3VuY2UgPSBmYWxzZSwgZ2xvYmFsID0gZmFsc2UpIHtcbiAgcG9pbnQuZGlhbWV0ZXIgPSAxXG4gIHBvaW50LnJhZGl1cyA9IDAuNVxuICBwb2ludC5jZW50ZXJYID0gcG9pbnQueFxuICBwb2ludC5jZW50ZXJZID0gcG9pbnQueVxuICBwb2ludC5neCA9IHBvaW50LnhcbiAgcG9pbnQuZ3kgPSBwb2ludC55XG4gIHJldHVybiBjaXJjbGVDb2xsaXNpb24oYzEsIHBvaW50LCBib3VuY2UsIGdsb2JhbClcbn1cblxuZnVuY3Rpb24gYm91bmNlT2ZmU3VyZmFjZSAobywgcykge1xuICBsZXQgZHAxLCBkcDJcbiAgbGV0IHAxID0ge31cbiAgbGV0IHAyID0ge31cbiAgbGV0IGJvdW5jZSA9IHt9XG4gIGxldCBtYXNzID0gby5tYXNzIHx8IDFcblxuICBzLmx4ID0gcy55XG4gIHMubHkgPSAtcy54XG5cbiAgcy5tYWduaXR1ZGUgPSBNYXRoLnNxcnQocy54ICogcy54ICsgcy55ICogcy55KVxuXG4gIHMuZHggPSBzLnggLyBzLm1hZ25pdHVkZVxuICBzLmR5ID0gcy55IC8gcy5tYWduaXR1ZGVcblxuICBkcDEgPSBvLnZ4ICogcy5keCArIG8udnkgKiBzLmR5XG5cbiAgcDEudnggPSBkcDEgKiBzLmR4XG4gIHAxLnZ5ID0gZHAxICogcy5keVxuXG4gIGRwMiA9IG8udnggKiAocy5seCAvIHMubWFnbml0dWRlKSArIG8udnkgKiAocy5seSAvIHMubWFnbml0dWRlKVxuXG4gIHAyLnZ4ID0gZHAyICogKHMubHggLyBzLm1hZ25pdHVkZSlcbiAgcDIudnkgPSBkcDIgKiAocy5seSAvIHMubWFnbml0dWRlKVxuXG4gIHAyLnZ4ICo9IC0xXG4gIHAyLnZ5ICo9IC0xXG5cbiAgYm91bmNlLnggPSBwMS52eCArIHAyLnZ4XG4gIGJvdW5jZS55ID0gcDEudnkgKyBwMi52eVxuXG4gIG8udnggPSBib3VuY2UueCAvIG1hc3NcbiAgby52eSA9IGJvdW5jZS55IC8gbWFzc1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaGl0IChhLCBiLCByZWFjdCA9IGZhbHNlLCBib3VuY2UgPSBmYWxzZSwgZ2xvYmFsLCBleHRyYSA9IHVuZGVmaW5lZCkge1xuICBsZXQgY29sbGlzaW9uXG4gIGxldCBhSXNBU3ByaXRlID0gYS5wYXJlbnQgIT09IHVuZGVmaW5lZFxuICBsZXQgYklzQVNwcml0ZSA9IGIucGFyZW50ICE9PSB1bmRlZmluZWRcblxuICBpZiAoYUlzQVNwcml0ZSAmJiBiIGluc3RhbmNlb2YgQXJyYXkgfHwgYklzQVNwcml0ZSAmJiBhIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICBzcHJpdGVWc0FycmF5KClcbiAgfSBlbHNlIHtcbiAgICBjb2xsaXNpb24gPSBmaW5kQ29sbGlzaW9uVHlwZShhLCBiKVxuICAgIGlmIChjb2xsaXNpb24gJiYgZXh0cmEpIGV4dHJhKGNvbGxpc2lvbilcbiAgfVxuXG4gIHJldHVybiBjb2xsaXNpb25cblxuICBmdW5jdGlvbiBmaW5kQ29sbGlzaW9uVHlwZSAoYSwgYikge1xuICAgIGxldCBhSXNBU3ByaXRlID0gYS5wYXJlbnQgIT09IHVuZGVmaW5lZFxuICAgIGxldCBiSXNBU3ByaXRlID0gYi5wYXJlbnQgIT09IHVuZGVmaW5lZFxuXG4gICAgaWYgKGFJc0FTcHJpdGUgJiYgYklzQVNwcml0ZSkge1xuICAgICAgaWYgKGEuZGlhbWV0ZXIgJiYgYi5kaWFtZXRlcikge1xuICAgICAgICByZXR1cm4gY2lyY2xlVnNDaXJjbGUoYSwgYilcbiAgICAgIH0gZWxzZSBpZiAoYS5kaWFtZXRlciAmJiAhYi5kaWFtZXRlcikge1xuICAgICAgICByZXR1cm4gY2lyY2xlVnNSZWN0YW5nbGUoYSwgYilcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiByZWN0YW5nbGVWc1JlY3RhbmdsZShhLCBiKVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoYklzQVNwcml0ZSAmJiAhKGEueCA9PT0gdW5kZWZpbmVkKSAmJiAhKGEueSA9PT0gdW5kZWZpbmVkKSkge1xuICAgICAgcmV0dXJuIGhpdFRlc3RQb2ludChhLCBiKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEknbSBzb3JyeSwgJHthfSBhbmQgJHtifSBjYW5ub3QgYmUgdXNlIHRvZ2V0aGVyIGluIGEgY29sbGlzaW9uIHRlc3QuJ2ApXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gc3ByaXRlVnNBcnJheSAoKSB7XG4gICAgaWYgKGEgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgbGV0IFthLCBiXSA9IFtiLCBhXVxuICAgIH1cbiAgICBmb3IgKGxldCBpID0gYi5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgbGV0IHNwcml0ZSA9IGJbaV1cbiAgICAgIGNvbGxpc2lvbiA9IGZpbmRDb2xsaXNpb25UeXBlKGEsIHNwcml0ZSlcbiAgICAgIGlmIChjb2xsaXNpb24gJiYgZXh0cmEpIGV4dHJhKGNvbGxpc2lvbiwgc3ByaXRlKVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGNpcmNsZVZzQ2lyY2xlIChhLCBiKSB7XG4gICAgaWYgKCFyZWFjdCkge1xuICAgICAgcmV0dXJuIGhpdFRlc3RDaXJjbGUoYSwgYilcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGEudnggKyBhLnZ5ICE9PSAwICYmIGIudnggKyBiLnZ5ICE9PSAwKSB7XG4gICAgICAgIHJldHVybiBtb3ZpbmdDaXJjbGVDb2xsaXNpb24oYSwgYiwgZ2xvYmFsKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGNpcmNsZUNvbGxpc2lvbihhLCBiLCBib3VuY2UsIGdsb2JhbClcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiByZWN0YW5nbGVWc1JlY3RhbmdsZSAoYSwgYikge1xuICAgIGlmICghcmVhY3QpIHtcbiAgICAgIHJldHVybiBoaXRUZXN0UmVjdGFuZ2xlKGEsIGIsIGdsb2JhbClcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHJlY3RhbmdsZUNvbGxpc2lvbihhLCBiLCBib3VuY2UsIGdsb2JhbClcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBjaXJjbGVWc1JlY3RhbmdsZSAoYSwgYikge1xuICAgIGlmICghcmVhY3QpIHtcbiAgICAgIHJldHVybiBoaXRUZXN0Q2lyY2xlUmVjdGFuZ2xlKGEsIGIsIGdsb2JhbClcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGNpcmNsZVJlY3RhbmdsZUNvbGxpc2lvbihhLCBiLCBib3VuY2UsIGdsb2JhbClcbiAgICB9XG4gIH1cbn1cbiIsImV4cG9ydCBsZXQgZHJhZ2dhYmxlU3ByaXRlcyA9IFtdXG5leHBvcnQgbGV0IGJ1dHRvbnMgPSBbXVxuZXhwb3J0IGxldCBwYXJ0aWNsZXMgPSBbXVxuXG5jbGFzcyBEaXNwbGF5T2JqZWN0IHtcbiAgY29uc3RydWN0b3IgKCkge1xuICAgICAgICAvLyBUaGUgc3ByaXRlIHBvc2l0aW9uIGFuZCBzaXplXG4gICAgdGhpcy54ID0gMFxuICAgIHRoaXMueSA9IDBcbiAgICB0aGlzLndpZHRoID0gMFxuICAgIHRoaXMuaGVpZ2h0ID0gMFxuXG4gICAgICAgIC8vIHRyYW5zZm9ybWF0aW9uIHByb3BlcnRpZXNcbiAgICB0aGlzLnJvdGF0aW9uID0gMFxuICAgIHRoaXMuYWxwaGEgPSAxXG4gICAgdGhpcy52aXNpYmxlID0gdHJ1ZVxuICAgIHRoaXMuc2NhbGVYID0gMVxuICAgIHRoaXMuc2NhbGVZID0gMVxuXG4gICAgICAgIC8vIHBpdm90IHBvaW50XG4gICAgICAgIC8vICgwLjUgaXMgY2VudGVyIHBvaW50KVxuICAgIHRoaXMucGl2b3RYID0gMC41XG4gICAgdGhpcy5waXZvdFkgPSAwLjVcblxuICAgICAgICAvLyBWZWxvY2l0eVxuICAgIHRoaXMudnggPSAwXG4gICAgdGhpcy52eSA9IDBcblxuICAgICAgICAvLyAncHJpdmF0ZScgbGF5ZXIgcHJvcGVydHlcbiAgICB0aGlzLl9sYXllciA9IDBcblxuICAgIHRoaXMuY2hpbGRyZW4gPSBbXVxuICAgIHRoaXMucGFyZW50ID0gdW5kZWZpbmVkXG5cbiAgICAgICAgLy8gT3B0aW9uYWwgc2hhZG93XG4gICAgdGhpcy5zaGFkb3cgPSBmYWxzZVxuICAgIHRoaXMuc2hhZG93Q29sb3IgPSAncmdiYSgxMDAsIDEwMCwgMTAwLCAwLjUpJ1xuICAgIHRoaXMuc2hhZG93T2Zmc2V0WCA9IDNcbiAgICB0aGlzLnNoYWRvd09mZnNldFkgPSAzXG4gICAgdGhpcy5zaGFkb3dCbHVyID0gM1xuXG4gICAgdGhpcy5ibGVuZE1vZGUgPSB1bmRlZmluZWRcblxuICAgICAgICAvLyBhZHZhbmNlZCBmZWF0dXJlc1xuICAgICAgICAvLyBhbmltYXRpb25cbiAgICB0aGlzLmZyYW1lcyA9IFtdXG4gICAgdGhpcy5sb29wID0gdHJ1ZVxuICAgIHRoaXMuX2N1cnJlbnRGcmFtZSA9IDBcbiAgICB0aGlzLnBsYXlpbmcgPSBmYWxzZVxuXG4gICAgICAgIC8vIGNhbiBiZSBkcmFnZ2VkXG4gICAgdGhpcy5fZHJhZ2dhYmxlID0gdW5kZWZpbmVkXG5cbiAgICAgICAgLy8gdXNlZCBmb3IgJ3JhZGl1cycgYW5kICdkaWFtZXRlcicgcHJvcHNcbiAgICB0aGlzLl9jaXJjdWxhciA9IGZhbHNlXG5cbiAgICAgICAgLy8gaXMgaW50ZXJhY3RpdmU/IChjbGlja2FibGUvdG91Y2hhYmxlKVxuICAgIHRoaXMuX2ludGVyYWN0aXZlID0gZmFsc2VcbiAgfVxuXG4gICAgLy8gR2xvYmFsIHBvc2l0aW9uXG4gIGdldCBneCAoKSB7XG4gICAgaWYgKHRoaXMucGFyZW50KSB7XG4gICAgICByZXR1cm4gdGhpcy54ICsgdGhpcy5wYXJlbnQuZ3hcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMueFxuICAgIH1cbiAgfVxuICBnZXQgZ3kgKCkge1xuICAgIGlmICh0aGlzLnBhcmVudCkge1xuICAgICAgcmV0dXJuIHRoaXMueSArIHRoaXMucGFyZW50Lmd5XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnlcbiAgICB9XG4gIH1cblxuICAgIC8vIERlcHRoIGxheWVyXG4gIGdldCBsYXllciAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2xheWVyXG4gIH1cbiAgc2V0IGxheWVyICh2YWx1ZSkge1xuICAgIHRoaXMuX2xheWVyID0gdmFsdWVcbiAgICBpZiAodGhpcy5wYXJlbnQpIHtcbiAgICAgIHRoaXMucGFyZW50LmNoaWxkcmVuLnNvcnQoKGEsIGIpID0+IGEubGF5ZXIgLSBiLmxheWVyKVxuICAgIH1cbiAgfVxuXG4gICAgLy8gQ2hpbGRyZW4gbWFuaXB1bGF0aW9uXG4gIGFkZENoaWxkIChzcHJpdGUpIHtcbiAgICBpZiAoc3ByaXRlLnBhcmVudCkge1xuICAgICAgc3ByaXRlLnBhcmVudC5yZW1vdmVDaGlsZChzcHJpdGUpXG4gICAgfVxuICAgIHNwcml0ZS5wYXJlbnQgPSB0aGlzXG4gICAgdGhpcy5jaGlsZHJlbi5wdXNoKHNwcml0ZSlcbiAgfVxuXG4gIHJlbW92ZUNoaWxkIChzcHJpdGUpIHtcbiAgICBpZiAoc3ByaXRlLnBhcmVudCA9PT0gdGhpcykge1xuICAgICAgdGhpcy5jaGlsZHJlbi5zcGxpY2UodGhpcy5jaGlsZHJlbi5pbmRleE9mKHNwcml0ZSksIDEpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihzcHJpdGUgKyAnIGlzIG5vdCBhIGNoaWxkIG9mICcgKyB0aGlzKVxuICAgIH1cbiAgfVxuXG4gIGdldCBlbXB0eSAoKSB7XG4gICAgaWYgKHRoaXMuY2hpbGRyZW4ubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gIH1cblxuICBzd2FwQ2hpbGRyZW4gKGNoaWxkMSwgY2hpbGQyKSB7XG4gICAgbGV0IGluZGV4MSA9IHRoaXMuY2hpbGRyZW4uaW5kZXhPZihjaGlsZDEpXG4gICAgbGV0IGluZGV4MiA9IHRoaXMuY2hpbGRyZW4uaW5kZXhPZihjaGlsZDIpXG5cbiAgICBpZiAoaW5kZXgxICE9PSAtMSAmJiBpbmRleDIgIT09IC0xKSB7XG4gICAgICBjaGlsZDEuY2hpbGRJbmRleCA9IGluZGV4MlxuICAgICAgY2hpbGQyLmNoaWxkSW5kZXggPSBpbmRleDFcblxuICAgICAgdGhpcy5jaGlsZHJlbltpbmRleDFdID0gY2hpbGQyXG4gICAgICB0aGlzLmNoaWxkcmVuW2luZGV4Ml0gPSBjaGlsZDFcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBCb3RoIG9iamVjdHMgbXVzdCBiZSBhIGNoaWxkIG9mIHRoZSBjYWxsZXIgJHt0aGlzfWApXG4gICAgfVxuICB9XG5cbiAgYWRkICguLi5zcHJpdGVzVG9BZGQpIHtcbiAgICBzcHJpdGVzVG9BZGQuZm9yRWFjaChzcHJpdGUgPT4gdGhpcy5hZGRDaGlsZChzcHJpdGUpKVxuICB9XG4gIHJlbW92ZSAoLi4uc3ByaXRlc1RvUmVtb3ZlKSB7XG4gICAgc3ByaXRlc1RvUmVtb3ZlLmZvckVhY2goc3ByaXRlID0+IHRoaXMucmVtb3ZlQ2hpbGQoc3ByaXRlKSlcbiAgfVxuXG4gICAgLy8gSGVscGVyc1xuICBnZXQgaGFsZldpZHRoICgpIHtcbiAgICByZXR1cm4gdGhpcy53aWR0aCAvIDJcbiAgfVxuICBnZXQgaGFsZkhlaWdodCAoKSB7XG4gICAgcmV0dXJuIHRoaXMuaGVpZ2h0IC8gMlxuICB9XG5cbiAgZ2V0IGNlbnRlclggKCkge1xuICAgIHJldHVybiB0aGlzLnggKyB0aGlzLmhhbGZXaWR0aFxuICB9XG4gIGdldCBjZW50ZXJZICgpIHtcbiAgICByZXR1cm4gdGhpcy55ICsgdGhpcy5oYWxmSGVpZ2h0XG4gIH1cblxuICAgIC8vIC4uLlxuICBnZXQgcG9zaXRpb24gKCkge1xuICAgIHJldHVybiB7eDogdGhpcy54LCB5OiB0aGlzLnl9XG4gIH1cbiAgc2V0UG9zaXRpb24gKHgsIHkpIHtcbiAgICB0aGlzLnggPSB4XG4gICAgdGhpcy55ID0geVxuICB9XG5cbiAgZ2V0IGxvY2FsQm91bmRzICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgeDogMCxcbiAgICAgIHk6IDAsXG4gICAgICB3aWR0aDogdGhpcy53aWR0aCxcbiAgICAgIGhlaWdodDogdGhpcy5oZWlnaHRcbiAgICB9XG4gIH1cbiAgZ2V0IGdsb2JhbEJvdW5kcyAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHg6IHRoaXMuZ3gsXG4gICAgICB5OiB0aGlzLmd5LFxuICAgICAgd2lkdGg6IHRoaXMuZ3ggKyB0aGlzLndpZHRoLFxuICAgICAgaGVpZ2h0OiB0aGlzLmd5ICsgdGhpcy5oZWlnaHRcbiAgICB9XG4gIH1cblxuICAgIC8vIHBvc2l0aW9uIGhlbHBlcnNcbiAgcHV0Q2VudGVyIChiLCB4T2Zmc2V0ID0gMCwgeU9mZnNldCA9IDApIHtcbiAgICBsZXQgYSA9IHRoaXNcbiAgICBiLnggPSAoYS54ICsgYS5oYWxmV2lkdGggLSBiLmhhbGZXaWR0aCkgKyB4T2Zmc2V0XG4gICAgYi55ID0gKGEueSArIGEuaGFsZkhlaWdodCAtIGIuaGFsZkhlaWdodCkgKyB5T2Zmc2V0XG4gIH1cbiAgcHV0VG9wIChiLCB4T2Zmc2V0ID0gMCwgeU9mZnNldCA9IDApIHtcbiAgICBsZXQgYSA9IHRoaXNcbiAgICBiLnggPSAoYS54ICsgYS5oYWxmV2lkdGggLSBiLmhhbGZXaWR0aCkgKyB4T2Zmc2V0XG4gICAgYi55ID0gKGEueSAtIGIuaGVpZ2h0KSArIHlPZmZzZXRcbiAgfVxuICBwdXRCb3R0b20gKGIsIHhPZmZzZXQgPSAwLCB5T2Zmc2V0ID0gMCkge1xuICAgIGxldCBhID0gdGhpc1xuICAgIGIueCA9IChhLnggKyBhLmhhbGZXaWR0aCAtIGIuaGFsZldpZHRoKSArIHhPZmZzZXRcbiAgICBiLnkgPSAoYS55ICsgYS5oZWlnaHQpICsgeU9mZnNldFxuICB9XG4gIHB1dFJpZ2h0IChiLCB4T2Zmc2V0ID0gMCwgeU9mZnNldCA9IDApIHtcbiAgICBsZXQgYSA9IHRoaXNcbiAgICBiLnggPSAoYS54ICsgYS53aWR0aCkgKyB4T2Zmc2V0XG4gICAgYi55ID0gKGEueSArIGEuaGFsZkhlaWdodCAtIGIuaGFsZkhlaWdodCkgKyB5T2Zmc2V0XG4gIH1cbiAgcHV0TGVmdCAoYiwgeE9mZnNldCA9IDAsIHlPZmZzZXQgPSAwKSB7XG4gICAgbGV0IGEgPSB0aGlzXG4gICAgYi54ID0gKGEueCAtIGIud2lkdGgpICsgeE9mZnNldFxuICAgIGIueSA9IChhLnkgKyBhLmhhbGZIZWlnaHQgLSBiLmhhbGZIZWlnaHQpICsgeU9mZnNldFxuICB9XG5cbiAgICAvLyBhbmltYXRpb24gaGVscGVyc1xuICBnZXQgY3VycmVudEZyYW1lICgpIHtcbiAgICByZXR1cm4gdGhpcy5fY3VycmVudEZyYW1lXG4gIH1cblxuICAgIC8vIGNpcmN1bGFyXG4gIGdldCBjaXJjdWxhciAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2NpcmN1bGFyXG4gIH1cbiAgc2V0IGNpcmN1bGFyICh2YWx1ZSkge1xuICAgIGlmICh2YWx1ZSA9PT0gdHJ1ZSAmJiB0aGlzLl9jaXJjdWxhciA9PT0gZmFsc2UpIHtcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHRoaXMsIHtcbiAgICAgICAgZGlhbWV0ZXI6IHtcbiAgICAgICAgICBnZXQgKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMud2lkdGhcbiAgICAgICAgICB9LFxuICAgICAgICAgIHNldCAodmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMud2lkdGggPSB2YWx1ZVxuICAgICAgICAgICAgdGhpcy5oZWlnaHQgPSB2YWx1ZVxuICAgICAgICAgIH0sXG4gICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSxcbiAgICAgICAgcmFkaXVzOiB7XG4gICAgICAgICAgZ2V0ICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmhhbGZXaWR0aFxuICAgICAgICAgIH0sXG4gICAgICAgICAgc2V0ICh2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy53aWR0aCA9IHZhbHVlICogMlxuICAgICAgICAgICAgdGhpcy5oZWlnaHQgPSB2YWx1ZSAqIDJcbiAgICAgICAgICB9LFxuICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH1cbiAgICAgIH0pXG5cbiAgICAgIHRoaXMuX2NpcmN1bGFyID0gdHJ1ZVxuICAgIH1cblxuICAgIGlmICh2YWx1ZSA9PT0gZmFsc2UgJiYgdGhpcy5fY2lyY3VsYXIgPT09IHRydWUpIHtcbiAgICAgIGRlbGV0ZSB0aGlzLmRpYW1ldGVyXG4gICAgICBkZWxldGUgdGhpcy5yYWRpdXNcbiAgICAgIHRoaXMuX2NpcmN1bGFyID0gZmFsc2VcbiAgICB9XG4gIH1cblxuICAgIC8vIGRyYWdnYWJsZVxuICBnZXQgZHJhZ2dhYmxlICgpIHtcbiAgICByZXR1cm4gdGhpcy5fZHJhZ2dhYmxlXG4gIH1cbiAgc2V0IGRyYWdnYWJsZSAodmFsdWUpIHtcbiAgICBpZiAodmFsdWUgPT09IHRydWUpIHtcbiAgICAgIGRyYWdnYWJsZVNwcml0ZXMucHVzaCh0aGlzKVxuICAgICAgdGhpcy5fZHJhZ2dhYmxlID0gdHJ1ZVxuICAgIH1cblxuICAgIGlmICh2YWx1ZSA9PT0gZmFsc2UpIHtcbiAgICAgIGRyYWdnYWJsZVNwcml0ZXMuc3BsaWNlKGRyYWdnYWJsZVNwcml0ZXMuaW5kZXhPZih0aGlzKSwgMSlcbiAgICAgIHRoaXMuX2RyYWdnYWJsZSA9IGZhbHNlXG4gICAgfVxuICB9XG5cbiAgZ2V0IGludGVyYWN0aXZlICgpIHtcbiAgICByZXR1cm4gdGhpcy5faW50ZXJhY3RpdmVcbiAgfVxuICBzZXQgaW50ZXJhY3RpdmUgKHZhbHVlKSB7XG4gICAgaWYgKHZhbHVlID09PSB0cnVlKSB7XG4gICAgICBtYWtlSW50ZXJhY3RpdmUodGhpcylcbiAgICAgIGJ1dHRvbnMucHVzaCh0aGlzKVxuXG4gICAgICB0aGlzLl9pbnRlcmFjdGl2ZSA9IHRydWVcbiAgICB9XG4gICAgaWYgKHZhbHVlID09PSBmYWxzZSkge1xuICAgICAgYnV0dG9ucy5zcGxpY2UoYnV0dG9ucy5pbmRleE9mKHRoaXMpLCAxKVxuICAgICAgdGhpcy5faW50ZXJhY3RpdmUgPSBmYWxzZVxuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgbGV0IHN0YWdlID0gbmV3IERpc3BsYXlPYmplY3QoKVxuXG5leHBvcnQgZnVuY3Rpb24gbWFrZUNhbnZhcyAoXG4gICAgd2lkdGggPSAyNTYsIGhlaWdodCA9IDI1NixcbiAgICBib3JkZXIgPSAnMXB4IGRhc2hlZCBibGFjaycsXG4gICAgYmFja2dyb3VuZENvbG9yID0gJ3doaXRlJ1xuKSB7XG4gIGxldCBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKVxuICBjYW52YXMud2lkdGggPSB3aWR0aFxuICBjYW52YXMuaGVpZ2h0ID0gaGVpZ2h0XG4gIGNhbnZhcy5zdHlsZS5ib3JkZXIgPSBib3JkZXJcbiAgY2FudmFzLnN0eWxlLmJhY2tncm91bmRDb2xvciA9IGJhY2tncm91bmRDb2xvclxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGNhbnZhcylcblxuICBjYW52YXMuY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJylcblxuICByZXR1cm4gY2FudmFzXG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXIgKGNhbnZhcykge1xuICBsZXQgY3R4ID0gY2FudmFzLmN0eFxuXG4gIGN0eC5jbGVhclJlY3QoMCwgMCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KVxuXG4gICAgLy8gZHJhdyBiYWNrZ3JvdW5kXG4gIGlmIChzdGFnZUJhY2tncm91bmQpIHtcbiAgICBzdGFnZUJhY2tncm91bmQucmVuZGVyKGN0eClcbiAgfVxuXG4gIHN0YWdlLmNoaWxkcmVuLmZvckVhY2goc3ByaXRlID0+IHtcbiAgICBkaXNwbGF5U3ByaXRlKHNwcml0ZSlcbiAgfSlcblxuICBmdW5jdGlvbiBkaXNwbGF5U3ByaXRlIChzcHJpdGUpIHtcbiAgICBpZiAoXG4gICAgICAgICAgICBzcHJpdGUudmlzaWJsZSAmJlxuICAgICAgICAgICAgc3ByaXRlLmd4IDwgY2FudmFzLndpZHRoICsgc3ByaXRlLndpZHRoICYmXG4gICAgICAgICAgICBzcHJpdGUuZ3ggKyBzcHJpdGUud2lkdGggPj0gLXNwcml0ZS53aWR0aCAmJlxuICAgICAgICAgICAgc3ByaXRlLmd5IDwgY2FudmFzLmhlaWdodCArIHNwcml0ZS5oZWlnaHQgJiZcbiAgICAgICAgICAgIHNwcml0ZS5neSArIHNwcml0ZS5oZWlnaHQgPj0gLXNwcml0ZS5oZWlnaHRcbiAgICAgICAgKSB7XG4gICAgICBjdHguc2F2ZSgpXG5cbiAgICAgIGN0eC50cmFuc2xhdGUoXG4gICAgICAgICAgICAgICAgc3ByaXRlLnggKyAoc3ByaXRlLndpZHRoICogc3ByaXRlLnBpdm90WCksXG4gICAgICAgICAgICAgICAgc3ByaXRlLnkgKyAoc3ByaXRlLmhlaWdodCAqIHNwcml0ZS5waXZvdFkpXG4gICAgICAgICAgICApXG5cbiAgICAgIGN0eC5yb3RhdGUoc3ByaXRlLnJvdGF0aW9uKVxuICAgICAgY3R4Lmdsb2JhbEFscGhhID0gc3ByaXRlLmFscGhhICogc3ByaXRlLnBhcmVudC5hbHBoYVxuICAgICAgY3R4LnNjYWxlKHNwcml0ZS5zY2FsZVgsIHNwcml0ZS5zY2FsZVkpXG5cbiAgICAgIGlmIChzcHJpdGUuc2hhZG93KSB7XG4gICAgICAgIGN0eC5zaGFkb3dDb2xvciA9IHNwcml0ZS5zaGFkb3dDb2xvclxuICAgICAgICBjdHguc2hhZG93T2Zmc2V0WCA9IHNwcml0ZS5zaGFkb3dPZmZzZXRYXG4gICAgICAgIGN0eC5zaGFkb3dPZmZzZXRZID0gc3ByaXRlLnNoYWRvd09mZnNldFlcbiAgICAgICAgY3R4LnNoYWRvd0JsdXIgPSBzcHJpdGUuc2hhZG93Qmx1clxuICAgICAgfVxuXG4gICAgICBpZiAoc3ByaXRlLmJsZW5kTW9kZSkgY3R4Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9IHNwcml0ZS5ibGVuZE1vZGVcblxuICAgICAgaWYgKHNwcml0ZS5yZW5kZXIpIHtcbiAgICAgICAgc3ByaXRlLnJlbmRlcihjdHgpXG4gICAgICB9XG5cbiAgICAgIGlmIChzcHJpdGUuY2hpbGRyZW4gJiYgc3ByaXRlLmNoaWxkcmVuLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY3R4LnRyYW5zbGF0ZSgtc3ByaXRlLndpZHRoICogc3ByaXRlLnBpdm90WCwgLXNwcml0ZS5oZWlnaHQgKiBzcHJpdGUucGl2b3RZKVxuXG4gICAgICAgIHNwcml0ZS5jaGlsZHJlbi5mb3JFYWNoKGNoaWxkID0+IHtcbiAgICAgICAgICBkaXNwbGF5U3ByaXRlKGNoaWxkKVxuICAgICAgICB9KVxuICAgICAgfVxuXG4gICAgICBjdHgucmVzdG9yZSgpXG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXJXaXRoSW50ZXJwb2xhdGlvbiAoY2FudmFzLCBsYWdPZmZzZXQpIHtcbiAgbGV0IGN0eCA9IGNhbnZhcy5jdHhcblxuICBjdHguY2xlYXJSZWN0KDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodClcblxuICBzdGFnZS5jaGlsZHJlbi5mb3JFYWNoKHNwcml0ZSA9PiB7XG4gICAgZGlzcGxheVNwcml0ZShzcHJpdGUpXG4gIH0pXG5cbiAgZnVuY3Rpb24gZGlzcGxheVNwcml0ZSAoc3ByaXRlKSB7XG4gICAgaWYgKFxuICAgICAgICAgICAgc3ByaXRlLnZpc2libGUgJiZcbiAgICAgICAgICAgIHNwcml0ZS5neCA8IGNhbnZhcy53aWR0aCArIHNwcml0ZS53aWR0aCAmJlxuICAgICAgICAgICAgc3ByaXRlLmd4ICsgc3ByaXRlLndpZHRoID49IC1zcHJpdGUud2lkdGggJiZcbiAgICAgICAgICAgIHNwcml0ZS5neSA8IGNhbnZhcy5oZWlnaHQgKyBzcHJpdGUuaGVpZ2h0ICYmXG4gICAgICAgICAgICBzcHJpdGUuZ3kgKyBzcHJpdGUuaGVpZ2h0ID49IC1zcHJpdGUuaGVpZ2h0XG4gICAgICAgICkge1xuICAgICAgY3R4LnNhdmUoKVxuXG4gICAgICBpZiAoc3ByaXRlLnByZXZpb3VzWCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHNwcml0ZS5yZW5kZXJYID0gKHNwcml0ZS54IC0gc3ByaXRlLnByZXZpb3VzWCkgKiBsYWdPZmZzZXQgKyBzcHJpdGUucHJldmlvdXNYXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzcHJpdGUucmVuZGVyWCA9IHNwcml0ZS54XG4gICAgICB9XG5cbiAgICAgIGlmIChzcHJpdGUucHJldmlvdXNZICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgc3ByaXRlLnJlbmRlclkgPSAoc3ByaXRlLnkgLSBzcHJpdGUucHJldmlvdXNZKSAqIGxhZ09mZnNldCArIHNwcml0ZS5wcmV2aW91c1lcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNwcml0ZS5yZW5kZXJZID0gc3ByaXRlLnlcbiAgICAgIH1cblxuICAgICAgY3R4LnRyYW5zbGF0ZShcbiAgICAgICAgICAgICAgICBzcHJpdGUucmVuZGVyWCArIChzcHJpdGUud2lkdGggKiBzcHJpdGUucGl2b3RYKSxcbiAgICAgICAgICAgICAgICBzcHJpdGUucmVuZGVyWSArIChzcHJpdGUuaGVpZ2h0ICogc3ByaXRlLnBpdm90WSlcbiAgICAgICAgICAgIClcblxuICAgICAgY3R4LnJvdGF0ZShzcHJpdGUucm90YXRpb24pXG4gICAgICBjdHguZ2xvYmFsQWxwaGEgPSBzcHJpdGUuYWxwaGEgKiBzcHJpdGUucGFyZW50LmFscGhhXG4gICAgICBjdHguc2NhbGUoc3ByaXRlLnNjYWxlWCwgc3ByaXRlLnNjYWxlWSlcblxuICAgICAgaWYgKHNwcml0ZS5zaGFkb3cpIHtcbiAgICAgICAgY3R4LnNoYWRvd0NvbG9yID0gc3ByaXRlLnNoYWRvd0NvbG9yXG4gICAgICAgIGN0eC5zaGFkb3dPZmZzZXRYID0gc3ByaXRlLnNoYWRvd09mZnNldFhcbiAgICAgICAgY3R4LnNoYWRvd09mZnNldFkgPSBzcHJpdGUuc2hhZG93T2Zmc2V0WVxuICAgICAgICBjdHguc2hhZG93Qmx1ciA9IHNwcml0ZS5zaGFkb3dCbHVyXG4gICAgICB9XG5cbiAgICAgIGlmIChzcHJpdGUuYmxlbmRNb2RlKSBjdHguZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gc3ByaXRlLmJsZW5kTW9kZVxuXG4gICAgICBpZiAoc3ByaXRlLnJlbmRlcikge1xuICAgICAgICBzcHJpdGUucmVuZGVyKGN0eClcbiAgICAgIH1cblxuICAgICAgaWYgKHNwcml0ZS5jaGlsZHJlbiAmJiBzcHJpdGUuY2hpbGRyZW4ubGVuZ3RoID4gMCkge1xuICAgICAgICBjdHgudHJhbnNsYXRlKC1zcHJpdGUud2lkdGggKiBzcHJpdGUucGl2b3RYLCAtc3ByaXRlLmhlaWdodCAqIHNwcml0ZS5waXZvdFkpXG5cbiAgICAgICAgc3ByaXRlLmNoaWxkcmVuLmZvckVhY2goY2hpbGQgPT4ge1xuICAgICAgICAgIGRpc3BsYXlTcHJpdGUoY2hpbGQpXG4gICAgICAgIH0pXG4gICAgICB9XG5cbiAgICAgIGN0eC5yZXN0b3JlKClcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZSAoLi4uc3ByaXRlc1RvUmVtb3ZlKSB7XG4gIHNwcml0ZXNUb1JlbW92ZS5mb3JFYWNoKHNwcml0ZSA9PiB7XG4gICAgc3ByaXRlLnBhcmVudC5yZW1vdmVDaGlsZChzcHJpdGUpXG4gIH0pXG59XG5cbmNsYXNzIFJlY3RhbmdsZSBleHRlbmRzIERpc3BsYXlPYmplY3Qge1xuICBjb25zdHJ1Y3RvciAoXG4gICAgICAgIHdpZHRoID0gMzIsXG4gICAgICAgIGhlaWdodCA9IDMyLFxuICAgICAgICBmaWxsU3R5bGUgPSAnZ3JheScsXG4gICAgICAgIHN0cm9rZVN0eWxlID0gJ25vbmUnLFxuICAgICAgICBsaW5lV2lkdGggPSAwLFxuICAgICAgICB4ID0gMCxcbiAgICAgICAgeSA9IDBcbiAgICApIHtcbiAgICBzdXBlcigpXG5cbiAgICBPYmplY3QuYXNzaWduKFxuICAgICAgICAgICAgdGhpcywge3dpZHRoLCBoZWlnaHQsIGZpbGxTdHlsZSwgc3Ryb2tlU3R5bGUsIGxpbmVXaWR0aCwgeCwgeX1cbiAgICAgICAgKVxuXG4gICAgdGhpcy5tYXNrID0gZmFsc2VcbiAgfVxuXG4gIHJlbmRlciAoY3R4KSB7XG4gICAgY3R4LnN0cm9rZVN0eWxlID0gdGhpcy5zdHJva2VTdHlsZVxuICAgIGN0eC5saW5lV2lkdGggPSB0aGlzLmxpbmVXaWR0aFxuICAgIGN0eC5maWxsU3R5bGUgPSB0aGlzLmZpbGxTdHlsZVxuXG4gICAgY3R4LmJlZ2luUGF0aCgpXG4gICAgY3R4LnJlY3QoXG4gICAgICAgICAgICAtdGhpcy53aWR0aCAqIHRoaXMucGl2b3RYLFxuICAgICAgICAgICAgLXRoaXMuaGVpZ2h0ICogdGhpcy5waXZvdFksXG4gICAgICAgICAgICB0aGlzLndpZHRoLFxuICAgICAgICAgICAgdGhpcy5oZWlnaHRcbiAgICAgICAgKVxuXG4gICAgaWYgKHRoaXMuc3Ryb2tlU3R5bGUgIT09ICdub25lJykgY3R4LnN0cm9rZSgpXG4gICAgaWYgKHRoaXMuZmlsbFN0eWxlICE9PSAnbm9uZScpIGN0eC5maWxsKClcbiAgICBpZiAodGhpcy5tYXNrICYmIHRoaXMubWFzayA9PT0gdHJ1ZSkgY3R4LmNsaXAoKVxuICB9XG59XG5cbi8vIHJlY3RhbmdsZSB3cmFwcGVyXG5leHBvcnQgZnVuY3Rpb24gcmVjdGFuZ2xlICh3aWR0aCwgaGVpZ2h0LCBmaWxsU3R5bGUsIHN0cm9rZVN0eWxlLCBsaW5lV2lkdGgsIHgsIHkpIHtcbiAgbGV0IHNwcml0ZSA9IG5ldyBSZWN0YW5nbGUod2lkdGgsIGhlaWdodCwgZmlsbFN0eWxlLCBzdHJva2VTdHlsZSwgbGluZVdpZHRoLCB4LCB5KVxuICBzdGFnZS5hZGRDaGlsZChzcHJpdGUpXG4gIHJldHVybiBzcHJpdGVcbn1cblxuY2xhc3MgQ2lyY2xlIGV4dGVuZHMgRGlzcGxheU9iamVjdCB7XG4gIGNvbnN0cnVjdG9yIChcbiAgICAgICAgZGlhbWV0ZXIgPSAzMixcbiAgICAgICAgZmlsbFN0eWxlID0gJ2dyYXknLFxuICAgICAgICBzdHJva2VTdHlsZSA9ICdub25lJyxcbiAgICAgICAgbGluZVdpZHRoID0gMCxcbiAgICAgICAgeCA9IDAsXG4gICAgICAgIHkgPSAwXG4gICAgKSB7XG4gICAgc3VwZXIoKVxuICAgIHRoaXMuY2lyY3VsYXIgPSB0cnVlXG5cbiAgICBPYmplY3QuYXNzaWduKHRoaXMsIHtkaWFtZXRlciwgZmlsbFN0eWxlLCBzdHJva2VTdHlsZSwgbGluZVdpZHRoLCB4LCB5fSlcblxuICAgIHRoaXMubWFzayA9IGZhbHNlXG4gIH1cblxuICByZW5kZXIgKGN0eCkge1xuICAgIGN0eC5zdHJva2VTdHlsZSA9IHRoaXMuc3Ryb2tlU3R5bGVcbiAgICBjdHgubGluZVdpZHRoID0gdGhpcy5saW5lV2lkdGhcbiAgICBjdHguZmlsbFN0eWxlID0gdGhpcy5maWxsU3R5bGVcblxuICAgIGN0eC5iZWdpblBhdGgoKVxuICAgIGN0eC5hcmMoXG4gICAgICAgICAgICB0aGlzLnJhZGl1cyArICgtdGhpcy5kaWFtZXRlciAqIHRoaXMucGl2b3RYKSxcbiAgICAgICAgICAgIHRoaXMucmFkaXVzICsgKC10aGlzLmRpYW1ldGVyICogdGhpcy5waXZvdFkpLFxuICAgICAgICAgICAgdGhpcy5yYWRpdXMsXG4gICAgICAgICAgICAwLCAyICogTWF0aC5QSSxcbiAgICAgICAgICAgIGZhbHNlXG4gICAgICAgIClcblxuICAgIGlmICh0aGlzLnN0cm9rZVN0eWxlICE9PSAnbm9uZScpIGN0eC5zdHJva2UoKVxuICAgIGlmICh0aGlzLmZpbGxTdHlsZSAhPT0gJ25vbmUnKSBjdHguZmlsbCgpXG4gICAgaWYgKHRoaXMubWFzayAmJiB0aGlzLm1hc2sgPT09IHRydWUpIGN0eC5jbGlwKClcbiAgfVxufVxuXG4vLyBjaXJjbGUgd3JhcHBlclxuZXhwb3J0IGZ1bmN0aW9uIGNpcmNsZSAoZGlhbWV0ZXIsIGZpbGxTdHlsZSwgc3Ryb2tlU3R5bGUsIGxpbmVXaWR0aCwgeCwgeSkge1xuICBsZXQgc3ByaXRlID0gbmV3IENpcmNsZShkaWFtZXRlciwgZmlsbFN0eWxlLCBzdHJva2VTdHlsZSwgbGluZVdpZHRoLCB4LCB5KVxuICBzdGFnZS5hZGRDaGlsZChzcHJpdGUpXG4gIHJldHVybiBzcHJpdGVcbn1cblxuY2xhc3MgTGluZSBleHRlbmRzIERpc3BsYXlPYmplY3Qge1xuICBjb25zdHJ1Y3RvciAoXG4gICAgICAgIHN0cm9rZVN0eWxlID0gJ25vbmUnLFxuICAgICAgICBsaW5lV2lkdGggPSAxLFxuICAgICAgICBheCA9IDAsXG4gICAgICAgIGF5ID0gMCxcbiAgICAgICAgYnggPSAzMixcbiAgICAgICAgYnkgPSAzMlxuICAgICkge1xuICAgIHN1cGVyKClcblxuICAgIE9iamVjdC5hc3NpZ24odGhpcywge3N0cm9rZVN0eWxlLCBsaW5lV2lkdGgsIGF4LCBheSwgYngsIGJ5fSlcblxuICAgIHRoaXMubGluZUpvaW4gPSAncm91bmQnXG4gIH1cblxuICByZW5kZXIgKGN0eCkge1xuICAgIGN0eC5zdHJva2VTdHlsZSA9IHRoaXMuc3Ryb2tlU3R5bGVcbiAgICBjdHgubGluZVdpZHRoID0gdGhpcy5saW5lV2lkdGhcblxuICAgIGN0eC5iZWdpblBhdGgoKVxuICAgIGN0eC5tb3ZlVG8odGhpcy5heCwgdGhpcy5heSlcbiAgICBjdHgubGluZVRvKHRoaXMuYngsIHRoaXMuYnkpXG5cbiAgICBpZiAodGhpcy5zdHJva2VTdHlsZSAhPT0gJ25vbmUnKSBjdHguc3Ryb2tlKClcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbGluZSAoc3Ryb2tlU3R5bGUsIGxpbmVXaWR0aCwgYXgsIGF5LCBieCwgYnkpIHtcbiAgbGV0IHNwcml0ZSA9IG5ldyBMaW5lKHN0cm9rZVN0eWxlLCBsaW5lV2lkdGgsIGF4LCBheSwgYngsIGJ5KVxuICBzdGFnZS5hZGRDaGlsZChzcHJpdGUpXG4gIHJldHVybiBzcHJpdGVcbn1cblxuY2xhc3MgVGV4dCBleHRlbmRzIERpc3BsYXlPYmplY3Qge1xuICBjb25zdHJ1Y3RvciAoXG4gICAgICAgIGNvbnRlbnQgPSAnSGVsbG8hJyxcbiAgICAgICAgZm9udCA9ICcxMnB4IHNhbnMtc2VyaWYnLFxuICAgICAgICBmaWxsU3R5bGUgPSAncmVkJyxcbiAgICAgICAgeCA9IDAsXG4gICAgICAgIHkgPSAwXG4gICAgKSB7XG4gICAgc3VwZXIoKVxuXG4gICAgT2JqZWN0LmFzc2lnbih0aGlzLCB7Y29udGVudCwgZm9udCwgZmlsbFN0eWxlLCB4LCB5fSlcblxuICAgIHRoaXMudGV4dEJhc2VsaW5lID0gJ3RvcCdcbiAgICB0aGlzLnN0cm9rZVRleHQgPSAnbm9uZSdcbiAgfVxuXG4gIHJlbmRlciAoY3R4KSB7XG4gICAgY3R4LmZvbnQgPSB0aGlzLmZvbnRcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSB0aGlzLnN0cm9rZVN0eWxlXG4gICAgY3R4LmxpbmVXaWR0aCA9IHRoaXMubGluZVdpZHRoXG4gICAgY3R4LmZpbGxTdHlsZSA9IHRoaXMuZmlsbFN0eWxlXG5cbiAgICBpZiAodGhpcy53aWR0aCA9PT0gMCkgdGhpcy53aWR0aCA9IGN0eC5tZWFzdXJlVGV4dCh0aGlzLmNvbnRlbnQpLndpZHRoXG4gICAgaWYgKHRoaXMuaGVpZ2h0ID09PSAwKSB0aGlzLmhlaWdodCA9IGN0eC5tZWFzdXJlVGV4dCgnTScpLndpZHRoXG5cbiAgICBjdHgudHJhbnNsYXRlKFxuICAgICAgICAgICAgLXRoaXMud2lkdGggKiB0aGlzLnBpdm90WCxcbiAgICAgICAgICAgIC10aGlzLmhlaWdodCAqIHRoaXMucGl2b3RZXG4gICAgICAgIClcblxuICAgIGN0eC50ZXh0QmFzZWxpbmUgPSB0aGlzLnRleHRCYXNlbGluZVxuXG4gICAgY3R4LmZpbGxUZXh0KFxuICAgICAgICAgICAgdGhpcy5jb250ZW50LCAwLCAwXG4gICAgICAgIClcblxuICAgIGlmICh0aGlzLnN0cm9rZVRleHQgIT09ICdub25lJykgY3R4LnN0cm9rZSgpXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRleHQgKGNvbnRlbnQsIGZvbnQsIGZpbGxTdHlsZSwgeCwgeSkge1xuICBsZXQgc3ByaXRlID0gbmV3IFRleHQoY29udGVudCwgZm9udCwgZmlsbFN0eWxlLCB4LCB5KVxuICBzdGFnZS5hZGRDaGlsZChzcHJpdGUpXG4gIHJldHVybiBzcHJpdGVcbn1cblxuY2xhc3MgR3JvdXAgZXh0ZW5kcyBEaXNwbGF5T2JqZWN0IHtcbiAgY29uc3RydWN0b3IgKC4uLnNwcml0ZXNUb0dyb3VwKSB7XG4gICAgc3VwZXIoKVxuXG4gICAgc3ByaXRlc1RvR3JvdXAuZm9yRWFjaChzcHJpdGUgPT4gdGhpcy5hZGRDaGlsZChzcHJpdGUpKVxuICB9XG5cbiAgYWRkQ2hpbGQgKHNwcml0ZSkge1xuICAgIGlmIChzcHJpdGUucGFyZW50KSB7XG4gICAgICBzcHJpdGUucGFyZW50LnJlbW92ZUNoaWxkKHNwcml0ZSlcbiAgICB9XG4gICAgc3ByaXRlLnBhcmVudCA9IHRoaXNcbiAgICB0aGlzLmNoaWxkcmVuLnB1c2goc3ByaXRlKVxuXG4gICAgdGhpcy5jYWxjdWxhdGVTaXplKClcbiAgfVxuXG4gIHJlbW92ZUNoaWxkIChzcHJpdGUpIHtcbiAgICBpZiAoc3ByaXRlLnBhcmVudCA9PT0gdGhpcykge1xuICAgICAgdGhpcy5jaGlsZHJlbi5zcGxpY2UodGhpcy5jaGlsZHJlbi5pbmRleE9mKHNwcml0ZSksIDEpXG4gICAgICB0aGlzLmNhbGN1bGF0ZVNpemUoKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYCR7c3ByaXRlfSBpcyBub3QgY2hpbGQgb2YgJHt0aGlzfWApXG4gICAgfVxuICB9XG5cbiAgY2FsY3VsYXRlU2l6ZSAoKSB7XG4gICAgaWYgKHRoaXMuY2hpbGRyZW4ubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5fbmV3V2lkdGggPSAwXG4gICAgICB0aGlzLl9uZXdIZWlnaHQgPSAwXG5cbiAgICAgIHRoaXMuY2hpbGRyZW4uZm9yRWFjaChjaGlsZCA9PiB7XG4gICAgICAgIGlmIChjaGlsZC54ICsgY2hpbGQud2lkdGggPiB0aGlzLl9uZXdXaWR0aCkge1xuICAgICAgICAgIHRoaXMuX25ld1dpZHRoID0gY2hpbGQueCArIGNoaWxkLndpZHRoXG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNoaWxkLnkgKyBjaGlsZC5oZWlnaHQgPiB0aGlzLl9uZXdIZWlnaHQpIHtcbiAgICAgICAgICB0aGlzLl9uZXdIZWlnaHQgPSBjaGlsZC55ICsgY2hpbGQuaGVpZ2h0XG4gICAgICAgIH1cbiAgICAgIH0pXG5cbiAgICAgIHRoaXMud2lkdGggPSB0aGlzLl9uZXdXaWR0aFxuICAgICAgdGhpcy5oZWlnaHQgPSB0aGlzLl9uZXdIZWlnaHRcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdyb3VwICguLi5zcHJpdGVzVG9Hcm91cCkge1xuICBsZXQgc3ByaXRlID0gbmV3IEdyb3VwKC4uLnNwcml0ZXNUb0dyb3VwKVxuICBzdGFnZS5hZGRDaGlsZChzcHJpdGUpXG4gIHJldHVybiBzcHJpdGVcbn1cblxuY2xhc3MgU3ByaXRlIGV4dGVuZHMgRGlzcGxheU9iamVjdCB7XG4gIGNvbnN0cnVjdG9yIChcbiAgICAgICAgc291cmNlLFxuICAgICAgICB4ID0gMCxcbiAgICAgICAgeSA9IDBcbiAgICApIHtcbiAgICBzdXBlcigpXG5cbiAgICBPYmplY3QuYXNzaWduKHRoaXMsIHt4LCB5fSlcblxuICAgIGlmIChzb3VyY2UgaW5zdGFuY2VvZiBJbWFnZSkge1xuICAgICAgdGhpcy5jcmVhdGVGcm9tSW1hZ2Uoc291cmNlKVxuICAgIH0gZWxzZSBpZiAoc291cmNlLm5hbWUpIHtcbiAgICAgIHRoaXMuY3JlYXRlRnJvbUF0bGFzKHNvdXJjZSlcbiAgICB9IGVsc2UgaWYgKHNvdXJjZS5pbWFnZSAmJiAhc291cmNlLmRhdGEpIHtcbiAgICAgIHRoaXMuY3JlYXRlRnJvbVRpbGVzZXQoc291cmNlKVxuICAgIH0gZWxzZSBpZiAoc291cmNlLmltYWdlICYmIHNvdXJjZS5kYXRhKSB7XG4gICAgICB0aGlzLmNyZWF0ZUZyb21UaWxlc2V0RnJhbWVzKHNvdXJjZSlcbiAgICB9IGVsc2UgaWYgKHNvdXJjZSBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICBpZiAoc291cmNlWzBdICYmIHNvdXJjZVswXS5zb3VyY2UpIHtcbiAgICAgICAgdGhpcy5jcmVhdGVGcm9tQXRsYXNGcmFtZXMoc291cmNlKVxuICAgICAgfSBlbHNlIGlmIChzb3VyY2VbMF0gaW5zdGFuY2VvZiBJbWFnZSkge1xuICAgICAgICB0aGlzLmNyZWF0ZUZyb21JbWFnZXMoc291cmNlKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBUaGUgaW1hZ2Ugc291cmNlcyBpbiAke3NvdXJjZX0gYXJlIG5vdCByZWNvZ25pemVkYClcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBUaGUgaW1hZ2Ugc291cmNlICR7c291cmNlfSBpcyBub3QgcmVjb2duaXplZGApXG4gICAgfVxuICB9XG5cbiAgY3JlYXRlRnJvbUltYWdlIChzb3VyY2UpIHtcbiAgICBpZiAoIShzb3VyY2UgaW5zdGFuY2VvZiBJbWFnZSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgJHtzb3VyY2V9IGlzIG5vdCBhbiBpbWFnZSBvYmplY3RgKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnNvdXJjZSA9IHNvdXJjZVxuICAgICAgdGhpcy5zb3VyY2VYID0gMFxuICAgICAgdGhpcy5zb3VyY2VZID0gMFxuICAgICAgdGhpcy5zb3VyY2VXaWR0aCA9IHNvdXJjZS53aWR0aFxuICAgICAgdGhpcy5zb3VyY2VIZWlnaHQgPSBzb3VyY2UuaGVpZ2h0XG5cbiAgICAgIHRoaXMud2lkdGggPSBzb3VyY2Uud2lkdGhcbiAgICAgIHRoaXMuaGVpZ2h0ID0gc291cmNlLmhlaWdodFxuICAgIH1cbiAgfVxuXG4gIGNyZWF0ZUZyb21BdGxhcyAoc291cmNlKSB7XG4gICAgdGhpcy50aWxlc2V0RnJhbWUgPSBzb3VyY2VcbiAgICB0aGlzLnNvdXJjZSA9IHRoaXMudGlsZXNldEZyYW1lLnNvdXJjZVxuICAgIHRoaXMuc291cmNlWCA9IHRoaXMudGlsZXNldEZyYW1lLnN4XG4gICAgdGhpcy5zb3VyY2VZID0gdGhpcy50aWxlc2V0RnJhbWUuc3lcbiAgICB0aGlzLnNvdXJjZVdpZHRoID0gc291cmNlLnRpbGV3XG4gICAgdGhpcy5zb3VyY2VIZWlnaHQgPSBzb3VyY2UudGlsZWhcblxuICAgIHRoaXMud2lkdGggPSB0aGlzLnRpbGVzZXRGcmFtZS53XG4gICAgdGhpcy5oZWlnaHQgPSB0aGlzLnRpbGVzZXRGcmFtZS5oXG4gIH1cblxuICBjcmVhdGVGcm9tVGlsZXNldCAoc291cmNlKSB7XG4gICAgaWYgKCEoc291cmNlLmltYWdlIGluc3RhbmNlb2YgSW1hZ2UpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYCR7c291cmNlLmltYWdlfSBpcyBub3QgYW4gaW1hZ2Ugb2JqZWN0YClcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zb3VyY2UgPSBzb3VyY2UuaW1hZ2VcblxuICAgICAgdGhpcy5zb3VyY2VYID0gc291cmNlLnhcbiAgICAgIHRoaXMuc291cmNlWSA9IHNvdXJjZS55XG4gICAgICB0aGlzLnNvdXJjZVdpZHRoID0gc291cmNlLndpZHRoXG4gICAgICB0aGlzLnNvdXJjZUhlaWdodCA9IHNvdXJjZS5oZWlnaHRcblxuICAgICAgdGhpcy53aWR0aCA9IHNvdXJjZS53aWR0aFxuICAgICAgdGhpcy5oZWlnaHQgPSBzb3VyY2UuaGVpZ2h0XG4gICAgfVxuICB9XG5cbiAgY3JlYXRlRnJvbVRpbGVzZXRGcmFtZXMgKHNvdXJjZSkge1xuICAgIGlmICghKHNvdXJjZS5pbWFnZSBpbnN0YW5jZW9mIEltYWdlKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGAke3NvdXJjZS5pbWFnZX0gaXMgbm90IGFuIGltYWdlIG9iamVjdGApXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc291cmNlID0gc291cmNlLmltYWdlXG4gICAgICB0aGlzLmZyYW1lcyA9IHNvdXJjZS5kYXRhXG5cbiAgICAgIHRoaXMuc291cmNlWCA9IHRoaXMuZnJhbWVzWzBdWzBdXG4gICAgICB0aGlzLnNvdXJjZVkgPSB0aGlzLmZyYW1lc1swXVsxXVxuICAgICAgdGhpcy5zb3VyY2VXaWR0aCA9IHNvdXJjZS53aWR0aFxuICAgICAgdGhpcy5zb3VyY2VIZWlnaHQgPSBzb3VyY2UuaGVpZ2h0XG5cbiAgICAgIHRoaXMud2lkdGggPSBzb3VyY2Uud2lkdGhcbiAgICAgIHRoaXMuaGVpZ2h0ID0gc291cmNlLmhlaWdodFxuICAgIH1cbiAgfVxuXG4gIGNyZWF0ZUZyb21BdGxhc0ZyYW1lcyAoc291cmNlKSB7XG4gICAgdGhpcy5mcmFtZXMgPSBzb3VyY2VcbiAgICB0aGlzLnNvdXJjZSA9IHNvdXJjZVswXS5zb3VyY2VcbiAgICB0aGlzLnNvdXJjZVggPSBzb3VyY2VbMF0uZnJhbWUueFxuICAgIHRoaXMuc291cmNlWSA9IHNvdXJjZVswXS5mcmFtZS55XG4gICAgdGhpcy5zb3VyY2VXaWR0aCA9IHNvdXJjZVswXS5mcmFtZS53XG4gICAgdGhpcy5zb3VyY2VIZWlnaHQgPSBzb3VyY2VbMF0uZnJhbWUuaFxuXG4gICAgdGhpcy53aWR0aCA9IHNvdXJjZVswXS5mcmFtZS53XG4gICAgdGhpcy5oZWlnaHQgPSBzb3VyY2VbMF0uZnJhbWUuaFxuICB9XG5cbiAgY3JlYXRlRnJvbUltYWdlcyAoc291cmNlKSB7XG4gICAgdGhpcy5mcmFtZXMgPSBzb3VyY2VcbiAgICB0aGlzLnNvdXJjZSA9IHNvdXJjZVswXVxuICAgIHRoaXMuc291cmNlWCA9IDBcbiAgICB0aGlzLnNvdXJjZVkgPSAwXG4gICAgdGhpcy5zb3VyY2VXaWR0aCA9IHNvdXJjZVswXS53aWR0aFxuICAgIHRoaXMuc291cmNlSGVpZ2h0ID0gc291cmNlWzBdLmhlaWdodFxuXG4gICAgdGhpcy53aWR0aCA9IHNvdXJjZVswXS53aWR0aFxuICAgIHRoaXMuaGVpZ2h0ID0gc291cmNlWzBdLmhlaWdodFxuICB9XG5cbiAgZ290b0FuZFN0b3AgKGZyYW1lTnVtYmVyKSB7XG4gICAgaWYgKHRoaXMuZnJhbWVzLmxlbmd0aCA+IDAgJiYgZnJhbWVOdW1iZXIgPCB0aGlzLmZyYW1lcy5sZW5ndGgpIHtcbiAgICAgIGlmICh0aGlzLmZyYW1lc1swXSBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgIHRoaXMuc291cmNlWCA9IHRoaXMuZnJhbWVzW2ZyYW1lTnVtYmVyXVswXVxuICAgICAgICB0aGlzLnNvdXJjZVkgPSB0aGlzLmZyYW1lc1tmcmFtZU51bWJlcl1bMV1cbiAgICAgIH0gZWxzZSBpZiAodGhpcy5mcmFtZXNbZnJhbWVOdW1iZXJdLmZyYW1lKSB7XG4gICAgICAgIHRoaXMuc291cmNlWCA9IHRoaXMuZnJhbWVzW2ZyYW1lTnVtYmVyXS5mcmFtZS54XG4gICAgICAgIHRoaXMuc291cmNlWSA9IHRoaXMuZnJhbWVzW2ZyYW1lTnVtYmVyXS5mcmFtZS55XG4gICAgICAgIHRoaXMuc291cmNlV2lkdGggPSB0aGlzLmZyYW1lc1tmcmFtZU51bWJlcl0uZnJhbWUud1xuICAgICAgICB0aGlzLnNvdXJjZUhlaWdodCA9IHRoaXMuZnJhbWVzW2ZyYW1lTnVtYmVyXS5mcmFtZS5oXG4gICAgICAgIHRoaXMud2lkdGggPSB0aGlzLmZyYW1lc1tmcmFtZU51bWJlcl0uZnJhbWUud1xuICAgICAgICB0aGlzLmhlaWdodCA9IHRoaXMuZnJhbWVzW2ZyYW1lTnVtYmVyXS5mcmFtZS5oXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnNvdXJjZSA9IHRoaXMuZnJhbWVzW2ZyYW1lTnVtYmVyXVxuICAgICAgICB0aGlzLnNvdXJjZVggPSAwXG4gICAgICAgIHRoaXMuc291cmNlWSA9IDBcbiAgICAgICAgdGhpcy5zb3VyY2VXaWR0aCA9IHRoaXMuc291cmNlLndpZHRoXG4gICAgICAgIHRoaXMuc291cmNlSGVpZ2h0ID0gdGhpcy5zb3VyY2UuaGVpZ2h0XG4gICAgICAgIHRoaXMud2lkdGggPSB0aGlzLnNvdXJjZS53aWR0aFxuICAgICAgICB0aGlzLmhlaWdodCA9IHRoaXMuc291cmNlLmhlaWdodFxuICAgICAgfVxuXG4gICAgICB0aGlzLl9jdXJyZW50RnJhbWUgPSBmcmFtZU51bWJlclxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEZyYW1lIG51bWJlciAke2ZyYW1lTnVtYmVyfSBkb2VzIG5vdCBleGlzdHMhYClcbiAgICB9XG4gIH1cblxuICByZW5kZXIgKGN0eCkge1xuICAgIGN0eC5kcmF3SW1hZ2UoXG4gICAgICAgICAgICB0aGlzLnNvdXJjZSxcbiAgICAgICAgICAgIHRoaXMuc291cmNlWCwgdGhpcy5zb3VyY2VZLFxuICAgICAgICAgICAgdGhpcy5zb3VyY2VXaWR0aCwgdGhpcy5zb3VyY2VIZWlnaHQsXG4gICAgICAgICAgICAtdGhpcy53aWR0aCAqIHRoaXMucGl2b3RYLFxuICAgICAgICAgICAgLXRoaXMuaGVpZ2h0ICogdGhpcy5waXZvdFksXG4gICAgICAgICAgICB0aGlzLndpZHRoLCB0aGlzLmhlaWdodFxuICAgICAgICApXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNwcml0ZSAoc291cmNlLCB4LCB5KSB7XG4gIGxldCBzcHJpdGUgPSBuZXcgU3ByaXRlKHNvdXJjZSwgeCwgeSlcbiAgaWYgKHNwcml0ZS5mcmFtZXMubGVuZ3RoID4gMCkgYWRkU3RhdGVQbGF5ZXIoc3ByaXRlKVxuICBzdGFnZS5hZGRDaGlsZChzcHJpdGUpXG4gIHJldHVybiBzcHJpdGVcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZyYW1lIChzb3VyY2UsIHgsIHksIHdpZHRoLCBoZWlnaHQpIHtcbiAgdmFyIG8gPSB7fVxuICBvLmltYWdlID0gc291cmNlXG4gIG8ueCA9IHhcbiAgby55ID0geVxuICBvLndpZHRoID0gd2lkdGhcbiAgby5oZWlnaHQgPSBoZWlnaHRcbiAgcmV0dXJuIG9cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZyYW1lcyAoc291cmNlLCBhcnJheU9mUG9zaXRpb25zLCB3aWR0aCwgaGVpZ2h0KSB7XG4gIHZhciBvID0ge31cbiAgby5pbWFnZSA9IHNvdXJjZVxuICBvLmRhdGEgPSBhcnJheU9mUG9zaXRpb25zXG4gIG8ud2lkdGggPSB3aWR0aFxuICBvLmhlaWdodCA9IGhlaWdodFxuICByZXR1cm4gb1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZmlsbXN0cmlwIChpbWFnZSwgZnJhbWVXaWR0aCwgZnJhbWVIZWlnaHQsIHNwYWNpbmcgPSAwKSB7XG4gIGxldCBwb3NpdGlvbnMgPSBbXVxuXG4gIGxldCBjb2x1bW5zID0gaW1hZ2Uud2lkdGggLyBmcmFtZVdpZHRoXG4gIGxldCByb3dzID0gaW1hZ2UuaGVpZ2h0IC8gZnJhbWVIZWlnaHRcblxuICBsZXQgbnVtYmVyT2ZGcmFtZXMgPSBjb2x1bW5zICogcm93c1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbnVtYmVyT2ZGcmFtZXM7IGkrKykge1xuICAgIGxldCB4ID0gKGkgJSBjb2x1bW5zKSAqIGZyYW1lV2lkdGhcbiAgICBsZXQgeSA9IE1hdGguZmxvb3IoaSAvIGNvbHVtbnMpICogZnJhbWVIZWlnaHRcblxuICAgIGlmIChzcGFjaW5nICYmIHNwYWNpbmcgPiAwKSB7XG4gICAgICB4ICs9IHNwYWNpbmcgKyAoc3BhY2luZyAqIGkgJSBjb2x1bW5zKVxuICAgICAgeSArPSBzcGFjaW5nICsgKHNwYWNpbmcgKiBNYXRoLmZsb29yKGkgLyBjb2x1bW5zKSlcbiAgICB9XG5cbiAgICBwb3NpdGlvbnMucHVzaChbeCwgeV0pXG4gIH1cblxuICByZXR1cm4gZnJhbWVzKGltYWdlLCBwb3NpdGlvbnMsIGZyYW1lV2lkdGgsIGZyYW1lSGVpZ2h0KVxufVxuXG5jbGFzcyBCdXR0b24gZXh0ZW5kcyBTcHJpdGUge1xuICBjb25zdHJ1Y3RvciAoc291cmNlLCB4ID0gMCwgeSA9IDApIHtcbiAgICBzdXBlcihzb3VyY2UsIHgsIHkpXG4gICAgdGhpcy5pbnRlcmFjdGl2ZSA9IHRydWVcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gYnV0dG9uIChzb3VyY2UsIHgsIHkpIHtcbiAgbGV0IHNwcml0ZSA9IG5ldyBCdXR0b24oc291cmNlLCB4LCB5KVxuICBzdGFnZS5hZGRDaGlsZChzcHJpdGUpXG4gIHJldHVybiBzcHJpdGVcbn1cblxuZnVuY3Rpb24gbWFrZUludGVyYWN0aXZlIChvKSB7XG4gIG8ucHJlc3MgPSBvLnByZXNzIHx8IHVuZGVmaW5lZFxuICBvLnJlbGVhc2UgPSBvLnJlbGVhc2UgfHwgdW5kZWZpbmVkXG4gIG8ub3ZlciA9IG8ub3ZlciB8fCB1bmRlZmluZWRcbiAgby5vdXQgPSBvLm91dCB8fCB1bmRlZmluZWRcbiAgby50YXAgPSBvLnRhcCB8fCB1bmRlZmluZWRcblxuICBvLnN0YXRlID0gJ3VwJ1xuXG4gIG8uYWN0aW9uID0gJydcblxuICBvLnByZXNzZWQgPSBmYWxzZVxuICBvLmhvdmVyT3ZlciA9IGZhbHNlXG5cbiAgby51cGRhdGUgPSAocG9pbnRlcikgPT4ge1xuICAgIGxldCBoaXQgPSBwb2ludGVyLmhpdFRlc3RTcHJpdGUobylcblxuICAgIGlmIChwb2ludGVyLmlzVXApIHtcbiAgICAgIG8uc3RhdGUgPSAndXAnXG4gICAgICBpZiAobyBpbnN0YW5jZW9mIEJ1dHRvbikgby5nb3RvQW5kU3RvcCgwKVxuICAgIH1cblxuICAgIGlmIChoaXQpIHtcbiAgICAgIG8uc3RhdGUgPSAnb3ZlcidcblxuICAgICAgaWYgKG8uZnJhbWVzICYmIG8uZnJhbWVzLmxlbmd0aCA9PT0gMyAmJiBvIGluc3RhbmNlb2YgQnV0dG9uKSB7XG4gICAgICAgIG8uZ290b0FuZFN0b3AoMSlcbiAgICAgIH1cblxuICAgICAgaWYgKHBvaW50ZXIuaXNEb3duKSB7XG4gICAgICAgIG8uc3RhdGUgPSAnZG93bidcblxuICAgICAgICBpZiAobyBpbnN0YW5jZW9mIEJ1dHRvbikge1xuICAgICAgICAgIGlmIChvLmZyYW1lcy5sZW5ndGggPT09IDMpIHtcbiAgICAgICAgICAgIG8uZ290b0FuZFN0b3AoMilcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgby5nb3RvQW5kU3RvcCgxKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChvLnN0YXRlID09PSAnZG93bicpIHtcbiAgICAgIGlmICghby5wcmVzc2VkKSB7XG4gICAgICAgIGlmIChvLnByZXNzKSBvLnByZXNzKClcbiAgICAgICAgby5wcmVzc2VkID0gdHJ1ZVxuICAgICAgICBvLmFjdGlvbiA9ICdwcmVzc2VkJ1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChvLnN0YXRlID09PSAnb3ZlcicpIHtcbiAgICAgIGlmIChvLnByZXNzZWQpIHtcbiAgICAgICAgaWYgKG8ucmVsZWFzZSkgby5yZWxlYXNlKClcbiAgICAgICAgby5wcmVzc2VkID0gZmFsc2VcbiAgICAgICAgby5hY3Rpb24gPSAncmVsZWFzZWQnXG5cbiAgICAgICAgaWYgKHBvaW50ZXIudGFwcGVkICYmIG8udGFwKSBvLnRhcCgpXG4gICAgICB9XG5cbiAgICAgIGlmICghby5ob3Zlck92ZXIpIHtcbiAgICAgICAgaWYgKG8ub3Zlcikgby5vdmVyKClcbiAgICAgICAgby5ob3Zlck92ZXIgPSB0cnVlXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKG8uc3RhdGUgPT09ICd1cCcpIHtcbiAgICAgIGlmIChvLnByZXNzZWQpIHtcbiAgICAgICAgaWYgKG8ucmVsZWFzZSkgby5yZWxlYXNlKClcbiAgICAgICAgby5wcmVzc2VkID0gZmFsc2VcbiAgICAgICAgby5hY3Rpb24gPSAncmVsZWFzZWQnXG4gICAgICB9XG5cbiAgICAgIGlmIChvLmhvdmVyT3Zlcikge1xuICAgICAgICBpZiAoby5vdXQpIG8ub3V0KClcbiAgICAgICAgby5ob3Zlck92ZXIgPSBmYWxzZVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBhZGRTdGF0ZVBsYXllciAoc3ByaXRlKSB7XG4gIGxldCBmcmFtZUNvdW50ZXIgPSAwXG4gIGxldCBudW1iZXJPZkZyYW1lcyA9IDBcbiAgbGV0IHN0YXJ0RnJhbWUgPSAwXG4gIGxldCBlbmRGcmFtZSA9IDBcbiAgbGV0IHRpbWVJbnRlcnZhbFxuXG4gIGZ1bmN0aW9uIHNob3cgKGZyYW1lTnVtYmVyKSB7XG4gICAgcmVzZXQoKVxuICAgIHNwcml0ZS5nb3RvQW5kU3RvcChmcmFtZU51bWJlcilcbiAgfVxuXG4gIGZ1bmN0aW9uIHBsYXkgKCkge1xuICAgIHBsYXlTZXF1ZW5jZShbMCwgc3ByaXRlLmZyYW1lcy5sZW5ndGggLSAxXSlcbiAgfVxuXG4gIGZ1bmN0aW9uIHN0b3AgKCkge1xuICAgIHJlc2V0KClcbiAgICBzcHJpdGUuZ290b0FuZFN0b3Aoc3ByaXRlLmN1cnJlbnRGcmFtZSlcbiAgfVxuXG4gIGZ1bmN0aW9uIHBsYXlTZXF1ZW5jZSAoc2VxdWVuY2VBcnJheSkge1xuICAgIHJlc2V0KClcblxuICAgIHN0YXJ0RnJhbWUgPSBzZXF1ZW5jZUFycmF5WzBdXG4gICAgZW5kRnJhbWUgPSBzZXF1ZW5jZUFycmF5WzFdXG4gICAgbnVtYmVyT2ZGcmFtZXMgPSBlbmRGcmFtZSAtIHN0YXJ0RnJhbWVcblxuICAgIGlmIChzdGFydEZyYW1lID09PSAwKSB7XG4gICAgICBudW1iZXJPZkZyYW1lcyArPSAxXG4gICAgICBmcmFtZUNvdW50ZXIgKz0gMVxuICAgIH1cblxuICAgIGlmIChudW1iZXJPZkZyYW1lcyA9PT0gMSkge1xuICAgICAgbnVtYmVyT2ZGcmFtZXMgPSAyXG4gICAgICBmcmFtZUNvdW50ZXIgKz0gMVxuICAgIH1cblxuICAgIGlmICghc3ByaXRlLmZwcykgc3ByaXRlLmZwcyA9IDEyXG4gICAgbGV0IGZyYW1lUmF0ZSA9IDEwMDAgLyBzcHJpdGUuZnBzXG5cbiAgICBzcHJpdGUuZ290b0FuZFN0b3Aoc3RhcnRGcmFtZSlcblxuICAgIGlmICghc3ByaXRlLnBsYXlpbmcpIHtcbiAgICAgIHRpbWVJbnRlcnZhbCA9IHNldEludGVydmFsKGFkdmFuY2VGcmFtZS5iaW5kKHRoaXMpLCBmcmFtZVJhdGUpXG4gICAgICBzcHJpdGUucGxheWluZyA9IHRydWVcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBhZHZhbmNlRnJhbWUgKCkge1xuICAgIGlmIChmcmFtZUNvdW50ZXIgPCBudW1iZXJPZkZyYW1lcykge1xuICAgICAgc3ByaXRlLmdvdG9BbmRTdG9wKHNwcml0ZS5jdXJyZW50RnJhbWUgKyAxKVxuICAgICAgZnJhbWVDb3VudGVyICs9IDFcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHNwcml0ZS5sb29wKSB7XG4gICAgICAgIHNwcml0ZS5nb3RvQW5kU3RvcChzdGFydEZyYW1lKVxuICAgICAgICBmcmFtZUNvdW50ZXIgPSAxXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gcmVzZXQgKCkge1xuICAgIGlmICh0aW1lSW50ZXJ2YWwgIT09IHVuZGVmaW5lZCAmJiBzcHJpdGUucGxheWluZyA9PT0gdHJ1ZSkge1xuICAgICAgc3ByaXRlLnBsYXlpbmcgPSBmYWxzZVxuICAgICAgZnJhbWVDb3VudGVyID0gMFxuICAgICAgc3RhcnRGcmFtZSA9IDBcbiAgICAgIGVuZEZyYW1lID0gMFxuICAgICAgbnVtYmVyT2ZGcmFtZXMgPSAwXG4gICAgICBjbGVhckludGVydmFsKHRpbWVJbnRlcnZhbClcbiAgICB9XG4gIH1cblxuICBzcHJpdGUuc2hvdyA9IHNob3dcbiAgc3ByaXRlLnBsYXkgPSBwbGF5XG4gIHNwcml0ZS5zdG9wID0gc3RvcFxuICBzcHJpdGUucGxheVNlcXVlbmNlID0gcGxheVNlcXVlbmNlXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJ0aWNsZUVmZmVjdCAoXG4gICAgeCA9IDAsXG4gICAgeSA9IDAsXG4gICAgc3ByaXRlRnVuY3Rpb24gPSAoKSA9PiBjaXJjbGUoMTAsICdyZWQnKSxcbiAgICBudW1iZXJPZlBhcnRpY2xlcyA9IDEwLFxuICAgIGdyYXZpdHkgPSAwLFxuICAgIHJhbmRvbVNwYWNpbmcgPSB0cnVlLFxuICAgIG1pbkFuZ2xlID0gMCwgbWF4QW5nbGUgPSA2LjI4LFxuICAgIG1pblNpemUgPSA0LCBtYXhTaXplID0gMTYsXG4gICAgbWluU3BlZWQgPSAwLjEsIG1heFNwZWVkID0gMSxcbiAgICBtaW5TY2FsZVNwZWVkID0gMC4wMSwgbWF4U2NhbGVTcGVlZCA9IDAuMDUsXG4gICAgbWluQWxwaGFTcGVlZCA9IDAuMDIsIG1heEFscGhhU3BlZWQgPSAwLjAyLFxuICAgIG1pblJvdGF0aW9uU3BlZWQgPSAwLjAxLCBtYXhSb3RhdGlvblNwZWVkID0gMC4wM1xuKSB7XG4gIGxldCByYW5kb21GbG9hdCA9IChtaW4sIG1heCkgPT4gbWluICsgTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4pXG4gIGxldCByYW5kb21JbnQgPSAobWluLCBtYXgpID0+IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4gKyAxKSkgKyBtaW5cblxuICBsZXQgYW5nbGVzID0gW11cbiAgbGV0IGFuZ2xlXG5cbiAgbGV0IHNwYWNpbmcgPSAobWF4QW5nbGUgLSBtaW5BbmdsZSkgLyAobnVtYmVyT2ZQYXJ0aWNsZXMgLSAxKVxuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbnVtYmVyT2ZQYXJ0aWNsZXM7IGkrKykge1xuICAgIGlmIChyYW5kb21TcGFjaW5nKSB7XG4gICAgICBhbmdsZSA9IHJhbmRvbUZsb2F0KG1pbkFuZ2xlLCBtYXhBbmdsZSlcbiAgICAgIGFuZ2xlcy5wdXNoKGFuZ2xlKVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoYW5nbGUgPT09IHVuZGVmaW5lZCkgYW5nbGUgPSBtaW5BbmdsZVxuICAgICAgYW5nbGVzLnB1c2goYW5nbGUpXG4gICAgICBhbmdsZSArPSBzcGFjaW5nXG4gICAgfVxuICB9XG5cbiAgYW5nbGVzLmZvckVhY2goYW5nbGUgPT4gbWFrZVBhcnRpY2xlKGFuZ2xlKSlcblxuICBmdW5jdGlvbiBtYWtlUGFydGljbGUgKGFuZ2xlKSB7XG4gICAgbGV0IHBhcnRpY2xlID0gc3ByaXRlRnVuY3Rpb24oKVxuXG4gICAgaWYgKHBhcnRpY2xlLmZyYW1lcy5sZW5ndGggPiAwKSB7XG4gICAgICBwYXJ0aWNsZS5nb3RvQW5kU3RvcChyYW5kb21JbnQoMCwgcGFydGljbGUuZnJhbWVzLmxlbmd0aCAtIDEpKVxuICAgIH1cblxuICAgIHBhcnRpY2xlLnggPSB4IC0gcGFydGljbGUuaGFsZkhlaWdodFxuICAgIHBhcnRpY2xlLnkgPSB5IC0gcGFydGljbGUuaGFsZkhlaWdodFxuXG4gICAgbGV0IHNpemUgPSByYW5kb21JbnQobWluU2l6ZSwgbWF4U2l6ZSlcbiAgICBwYXJ0aWNsZS53aWR0aCA9IHNpemVcbiAgICBwYXJ0aWNsZS5oZWlnaHQgPSBzaXplXG5cbiAgICBwYXJ0aWNsZS5zY2FsZVNwZWVkID0gcmFuZG9tRmxvYXQobWluU2NhbGVTcGVlZCwgbWF4U2NhbGVTcGVlZClcbiAgICBwYXJ0aWNsZS5hbHBoYVNwZWVkID0gcmFuZG9tRmxvYXQobWluQWxwaGFTcGVlZCwgbWF4QWxwaGFTcGVlZClcbiAgICBwYXJ0aWNsZS5yb3RhdGlvblNwZWVkID0gcmFuZG9tRmxvYXQobWluUm90YXRpb25TcGVlZCwgbWF4Um90YXRpb25TcGVlZClcblxuICAgIGxldCBzcGVlZCA9IHJhbmRvbUZsb2F0KG1pblNwZWVkLCBtYXhTcGVlZClcbiAgICBwYXJ0aWNsZS52eCA9IHNwZWVkICogTWF0aC5jb3MoYW5nbGUpXG4gICAgcGFydGljbGUudnkgPSBzcGVlZCAqIE1hdGguc2luKGFuZ2xlKVxuXG4gICAgcGFydGljbGUudXBkYXRlID0gKCkgPT4ge1xuICAgICAgcGFydGljbGUudnkgKz0gZ3Jhdml0eVxuXG4gICAgICBwYXJ0aWNsZS54ICs9IHBhcnRpY2xlLnZ4XG4gICAgICBwYXJ0aWNsZS55ICs9IHBhcnRpY2xlLnZ5XG5cbiAgICAgIGlmIChwYXJ0aWNsZS5zY2FsZVggLSBwYXJ0aWNsZS5zY2FsZVNwZWVkID4gMCkge1xuICAgICAgICBwYXJ0aWNsZS5zY2FsZVggLT0gcGFydGljbGUuc2NhbGVTcGVlZFxuICAgICAgfVxuICAgICAgaWYgKHBhcnRpY2xlLnNjYWxlWSAtIHBhcnRpY2xlLnNjYWxlU3BlZWQgPiAwKSB7XG4gICAgICAgIHBhcnRpY2xlLnNjYWxlWSAtPSBwYXJ0aWNsZS5zY2FsZVNwZWVkXG4gICAgICB9XG5cbiAgICAgIHBhcnRpY2xlLnJvdGF0aW9uICs9IHBhcnRpY2xlLnJvdGF0aW9uU3BlZWRcblxuICAgICAgcGFydGljbGUuYWxwaGEgLT0gcGFydGljbGUuYWxwaGFTcGVlZFxuXG4gICAgICBpZiAocGFydGljbGUuYWxwaGEgPD0gMCkge1xuICAgICAgICByZW1vdmUocGFydGljbGUpXG4gICAgICAgIHBhcnRpY2xlcy5zcGxpY2UocGFydGljbGVzLmluZGV4T2YocGFydGljbGUpLCAxKVxuICAgICAgfVxuICAgIH1cblxuICAgIHBhcnRpY2xlcy5wdXNoKHBhcnRpY2xlKVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBlbWl0dGVyIChpbnRlcnZhbCwgcGFydGljbGVGdW5jdGlvbikge1xuICBsZXQgZW1pdHRlciA9IHt9XG4gIGxldCB0aW1lckludGVydmFsXG5cbiAgZW1pdHRlci5wbGF5aW5nID0gZmFsc2VcblxuICBmdW5jdGlvbiBwbGF5ICgpIHtcbiAgICBpZiAoIWVtaXR0ZXIucGxheWluZykge1xuICAgICAgcGFydGljbGVGdW5jdGlvbigpXG4gICAgICB0aW1lckludGVydmFsID0gc2V0SW50ZXJ2YWwoZW1pdFBhcnRpY2xlLmJpbmQodGhpcyksIGludGVydmFsKVxuICAgICAgZW1pdHRlci5wbGF5aW5nID0gdHJ1ZVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHN0b3AgKCkge1xuICAgIGlmIChlbWl0dGVyLnBsYXlpbmcpIHtcbiAgICAgIGNsZWFySW50ZXJ2YWwodGltZXJJbnRlcnZhbClcbiAgICAgIGVtaXR0ZXIucGxheWluZyA9IGZhbHNlXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZW1pdFBhcnRpY2xlICgpIHtcbiAgICBwYXJ0aWNsZUZ1bmN0aW9uKClcbiAgfVxuXG4gIGVtaXR0ZXIucGxheSA9IHBsYXlcbiAgZW1pdHRlci5zdG9wID0gc3RvcFxuXG4gIHJldHVybiBlbWl0dGVyXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBncmlkIChcbiAgICBjb2x1bW5zID0gMCwgcm93cyA9IDAsIGNlbGxXaWR0aCA9IDMyLCBjZWxsSGVpZ2h0ID0gMzIsXG4gICAgY2VudGVyQ2VsbCA9IGZhbHNlLCB4T2Zmc2V0ID0gMCwgeU9mZnNldCA9IDAsXG4gICAgbWFrZVNwcml0ZSA9IHVuZGVmaW5lZCxcbiAgICBleHRyYSA9IHVuZGVmaW5lZFxuICApIHtcbiAgbGV0IGNvbnRhaW5lciA9IGdyb3VwKClcbiAgbGV0IGNyZWF0ZUdyaWQgPSAoKSA9PiB7XG4gICAgbGV0IGxlbmd0aCA9IGNvbHVtbnMgKiByb3dzXG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBsZXQgeCA9IChpICUgY29sdW1ucykgKiBjZWxsV2lkdGhcbiAgICAgIGxldCB5ID0gTWF0aC5mbG9vcihpIC8gY29sdW1ucykgKiBjZWxsSGVpZ2h0XG5cbiAgICAgIGxldCBzcHJpdGUgPSBtYWtlU3ByaXRlKClcbiAgICAgIGNvbnRhaW5lci5hZGRDaGlsZChzcHJpdGUpXG5cbiAgICAgIGlmICghY2VudGVyQ2VsbCkge1xuICAgICAgICBzcHJpdGUueCA9IHggKyB4T2Zmc2V0XG4gICAgICAgIHNwcml0ZS55ID0geSArIHlPZmZzZXRcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNwcml0ZS54ID0geCArIChjZWxsV2lkdGggLyAyKSAtIHNwcml0ZS5oYWxmV2lkdGggKyB4T2Zmc2V0XG4gICAgICAgIHNwcml0ZS55ID0geSArIChjZWxsSGVpZ2h0IC8gMikgLSBzcHJpdGUuaGFsZkhlaWdodCArIHlPZmZzZXRcbiAgICAgIH1cblxuICAgICAgaWYgKGV4dHJhKSBleHRyYShzcHJpdGUpXG4gICAgfVxuICB9XG5cbiAgY3JlYXRlR3JpZCgpXG5cbiAgcmV0dXJuIGNvbnRhaW5lclxufVxuXG5leHBvcnQgZnVuY3Rpb24gdGlsaW5nU3ByaXRlICh3aWR0aCwgaGVpZ2h0LCBzb3VyY2UsIHggPSAwLCB5ID0gMCkge1xuICBsZXQgdGlsZVdpZHRoLCB0aWxlSGVpZ2h0XG5cbiAgaWYgKHNvdXJjZS5mcmFtZSkge1xuICAgIHRpbGVXaWR0aCA9IHNvdXJjZS5mcmFtZS53XG4gICAgdGlsZUhlaWdodCA9IHNvdXJjZS5mcmFtZS5oXG4gIH0gZWxzZSB7XG4gICAgdGlsZVdpZHRoID0gc291cmNlLndpZHRoXG4gICAgdGlsZUhlaWdodCA9IHNvdXJjZS5oZWlnaHRcbiAgfVxuXG4gIGxldCBjb2x1bW5zLCByb3dzXG5cbiAgaWYgKHdpZHRoID49IHRpbGVXaWR0aCkge1xuICAgIGNvbHVtbnMgPSBNYXRoLnJvdW5kKHdpZHRoIC8gdGlsZVdpZHRoKSArIDFcbiAgfSBlbHNlIHtcbiAgICBjb2x1bW5zID0gMlxuICB9XG5cbiAgaWYgKGhlaWdodCA+PSB0aWxlSGVpZ2h0KSB7XG4gICAgcm93cyA9IE1hdGgucm91bmQoaGVpZ2h0IC8gdGlsZUhlaWdodCkgKyAxXG4gIH0gZWxzZSB7XG4gICAgcm93cyA9IDJcbiAgfVxuXG4gIGxldCB0aWxlR3JpZCA9IGdyaWQoXG4gICAgICAgIGNvbHVtbnMsIHJvd3MsIHRpbGVXaWR0aCwgdGlsZUhlaWdodCwgZmFsc2UsIDAsIDAsXG4gICAgICAgICgpID0+IHtcbiAgICAgICAgICBsZXQgdGlsZSA9IHNwcml0ZShzb3VyY2UpXG4gICAgICAgICAgcmV0dXJuIHRpbGVcbiAgICAgICAgfVxuICAgIClcblxuICB0aWxlR3JpZC5fdGlsZVggPSAwXG4gIHRpbGVHcmlkLl90aWxlWSA9IDBcblxuICBsZXQgY29udGFpbmVyID0gcmVjdGFuZ2xlKHdpZHRoLCBoZWlnaHQsICdub25lJywgJ25vbmUnKVxuICBjb250YWluZXIueCA9IHhcbiAgY29udGFpbmVyLnkgPSB5XG5cbiAgY29udGFpbmVyLm1hc2sgPSB0cnVlXG5cbiAgY29udGFpbmVyLmFkZENoaWxkKHRpbGVHcmlkKVxuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKGNvbnRhaW5lciwge1xuICAgIHRpbGVYOiB7XG4gICAgICBnZXQgKCkge1xuICAgICAgICByZXR1cm4gdGlsZUdyaWQuX3RpbGVYXG4gICAgICB9LFxuICAgICAgc2V0ICh2YWx1ZSkge1xuICAgICAgICB0aWxlR3JpZC5jaGlsZHJlbi5mb3JFYWNoKGNoaWxkID0+IHtcbiAgICAgICAgICBsZXQgZGlmZmVyZW5jZSA9IHZhbHVlIC0gdGlsZUdyaWQuX3RpbGVYXG4gICAgICAgICAgY2hpbGQueCArPSBkaWZmZXJlbmNlXG5cbiAgICAgICAgICBpZiAoY2hpbGQueCA+IChjb2x1bW5zIC0gMSkgKiB0aWxlV2lkdGgpIHtcbiAgICAgICAgICAgIGNoaWxkLnggPSAwIC0gdGlsZVdpZHRoICsgZGlmZmVyZW5jZVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChjaGlsZC54IDwgMCAtIHRpbGVXaWR0aCAtIGRpZmZlcmVuY2UpIHtcbiAgICAgICAgICAgIGNoaWxkLnggPSAoY29sdW1ucyAtIDEpICogdGlsZVdpZHRoXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuXG4gICAgICAgIHRpbGVHcmlkLl90aWxlWCA9IHZhbHVlXG4gICAgICB9LFxuICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0sXG4gICAgdGlsZVk6IHtcbiAgICAgIGdldCAoKSB7XG4gICAgICAgIHJldHVybiB0aWxlR3JpZC5fdGlsZVlcbiAgICAgIH0sXG4gICAgICBzZXQgKHZhbHVlKSB7XG4gICAgICAgIHRpbGVHcmlkLmNoaWxkcmVuLmZvckVhY2goY2hpbGQgPT4ge1xuICAgICAgICAgIGxldCBkaWZmZXJlbmNlID0gdmFsdWUgLSB0aWxlR3JpZC5fdGlsZVlcbiAgICAgICAgICBjaGlsZC55ICs9IGRpZmZlcmVuY2VcbiAgICAgICAgICBpZiAoY2hpbGQueSA+IChyb3dzIC0gMSkgKiB0aWxlSGVpZ2h0KSB7XG4gICAgICAgICAgICBjaGlsZC55ID0gMCAtIHRpbGVIZWlnaHQgKyBkaWZmZXJlbmNlXG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChjaGlsZC55IDwgMCAtIHRpbGVIZWlnaHQgLSBkaWZmZXJlbmNlKSB7XG4gICAgICAgICAgICBjaGlsZC55ID0gKHJvd3MgLSAxKSAqIHRpbGVIZWlnaHRcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIHRpbGVHcmlkLl90aWxlWSA9IHZhbHVlXG4gICAgICB9LFxuICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH1cbiAgfSlcblxuICByZXR1cm4gY29udGFpbmVyXG59XG5cbmxldCBzdGFnZUJhY2tncm91bmRcblxuY2xhc3MgQmFja2dyb3VuZCB7XG4gIGNvbnN0cnVjdG9yIChzb3VyY2UsIHdpZHRoLCBoZWlnaHQsIHggPSAwLCB5ID0gMCkge1xuICAgIHRoaXMuc291cmNlID0gc291cmNlXG5cbiAgICB0aGlzLndpZHRoID0gd2lkdGhcbiAgICB0aGlzLmhlaWdodCA9IGhlaWdodFxuICAgIHRoaXMueCA9IHhcbiAgICB0aGlzLnkgPSB5XG4gIH1cblxuICByZW5kZXIgKGN0eCkge1xuICAgIGlmICghdGhpcy5wYXR0ZXJuKSB7XG4gICAgICB0aGlzLnBhdHRlcm4gPSBjdHguY3JlYXRlUGF0dGVybih0aGlzLnNvdXJjZSwgJ3JlcGVhdCcpXG4gICAgfVxuICAgIGN0eC5maWxsU3R5bGUgPSB0aGlzLnBhdHRlcm5cblxuICAgIGN0eC50cmFuc2xhdGUodGhpcy54LCB0aGlzLnkpXG4gICAgY3R4LmZpbGxSZWN0KC10aGlzLngsIC10aGlzLnksIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KVxuICAgIGN0eC50cmFuc2xhdGUoLXRoaXMueCwgLXRoaXMueSlcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gYmFja2dyb3VuZCAoc291cmNlLCB3aWR0aCwgaGVpZ2h0LCB4LCB5KSB7XG4gIHN0YWdlQmFja2dyb3VuZCA9IG5ldyBCYWNrZ3JvdW5kKHNvdXJjZSwgd2lkdGgsIGhlaWdodCwgeCwgeSlcbiAgcmV0dXJuIHN0YWdlQmFja2dyb3VuZFxufVxuIiwiaW1wb3J0IGRyYWdnYWJsZVNwcml0ZXMgZnJvbSAnLi9kaXNwbGF5J1xuXG5leHBvcnQgZnVuY3Rpb24ga2V5Ym9hcmQgKGtleUNvZGUpIHtcbiAgbGV0IGtleSA9IHt9XG4gIGtleS5jb2RlID0ga2V5Q29kZVxuICBrZXkuaXNEb3duID0gZmFsc2VcbiAga2V5LmlzVXAgPSB0cnVlXG4gIGtleS5wcmVzcyA9IHVuZGVmaW5lZFxuICBrZXkucmVsZWFzZSA9IHVuZGVmaW5lZFxuXG4gIGtleS5kb3duSGFuZGxlciA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgIGlmIChldmVudC5rZXlDb2RlID09PSBrZXkuY29kZSkge1xuICAgICAgaWYgKGtleS5pc1VwICYmIGtleS5wcmVzcykga2V5LnByZXNzKClcbiAgICAgIGtleS5pc0Rvd24gPSB0cnVlXG4gICAgICBrZXkuaXNVcCA9IGZhbHNlXG4gICAgfVxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgfVxuXG4gIGtleS51cEhhbmRsZXIgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICBpZiAoZXZlbnQua2V5Q29kZSA9PT0ga2V5LmNvZGUpIHtcbiAgICAgIGlmIChrZXkuaXNEb3duICYmIGtleS5yZWxlYXNlKSBrZXkucmVsZWFzZSgpXG4gICAgICBrZXkuaXNEb3duID0gZmFsc2VcbiAgICAgIGtleS5pc1VwID0gdHJ1ZVxuICAgIH1cbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gIH1cblxuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGtleS5kb3duSGFuZGxlci5iaW5kKGtleSksIGZhbHNlKVxuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBrZXkudXBIYW5kbGVyLmJpbmQoa2V5KSwgZmFsc2UpXG5cbiAgcmV0dXJuIGtleVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFrZVBvaW50ZXIgKGVsZW1lbnQsIHNjYWxlID0gMSkge1xuICBsZXQgcG9pbnRlciA9IHtcbiAgICBlbGVtZW50OiBlbGVtZW50LFxuICAgIHNjYWxlOiBzY2FsZSxcblxuICAgIF94OiAwLFxuICAgIF95OiAwLFxuXG4gICAgZ2V0IHggKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX3ggLyB0aGlzLnNjYWxlXG4gICAgfSxcbiAgICBnZXQgeSAoKSB7XG4gICAgICByZXR1cm4gdGhpcy5feSAvIHRoaXMuc2NhbGVcbiAgICB9LFxuXG4gICAgZ2V0IGNlbnRlclggKCkge1xuICAgICAgcmV0dXJuIHRoaXMueFxuICAgIH0sXG4gICAgZ2V0IGNlbnRlclkgKCkge1xuICAgICAgcmV0dXJuIHRoaXMueVxuICAgIH0sXG5cbiAgICBnZXQgcG9zaXRpb24gKCkge1xuICAgICAgcmV0dXJuIHt4OiB0aGlzLngsIHk6IHRoaXMueX1cbiAgICB9LFxuXG4gICAgaXNEb3duOiBmYWxzZSxcbiAgICBpc1VwOiB0cnVlLFxuICAgIHRhcHBlZDogZmFsc2UsXG5cbiAgICBkb3duVGltZTogMCxcbiAgICBlbGFwc2VkVGltZTogMCxcblxuICAgIHByZXNzOiB1bmRlZmluZWQsXG4gICAgcmVsZWFzZTogdW5kZWZpbmVkLFxuICAgIHRhcDogdW5kZWZpbmVkLFxuXG4gICAgZHJhZ1Nwcml0ZTogbnVsbCxcbiAgICBkcmFnT2Zmc2V0WDogMCxcbiAgICBkcmFnT2Zmc2V0WTogMCxcblxuICAgIG1vdmVIYW5kbGVyIChldmVudCkge1xuICAgICAgbGV0IGVsZW1lbnQgPSBldmVudC50YXJnZXRcblxuICAgICAgdGhpcy5feCA9IChldmVudC5wYWdlWCAtIGVsZW1lbnQub2Zmc2V0TGVmdClcbiAgICAgIHRoaXMuX3kgPSAoZXZlbnQucGFnZVkgLSBlbGVtZW50Lm9mZnNldFRvcClcblxuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgIH0sXG5cbiAgICB0b3VjaE1vdmVIYW5kbGVyIChldmVudCkge1xuICAgICAgbGV0IGVsZW1lbnQgPSBldmVudC50YXJnZXRcblxuICAgICAgdGhpcy5feCA9IChldmVudC50YXJnZXRUb3VjaGVzWzBdLnBhZ2VYIC0gZWxlbWVudC5vZmZzZXRMZWZ0KVxuICAgICAgdGhpcy5feSA9IChldmVudC50YXJnZXRUb3VjaGVzWzBdLnBhZ2VZIC0gZWxlbWVudC5vZmZzZXRUb3ApXG5cbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICB9LFxuXG4gICAgZG93bkhhbmRsZXIgKGV2ZW50KSB7XG4gICAgICB0aGlzLmlzRG93biA9IHRydWVcbiAgICAgIHRoaXMuaXNVcCA9IGZhbHNlXG4gICAgICB0aGlzLnRhcHBlZCA9IGZhbHNlXG5cbiAgICAgIHRoaXMuZG93blRpbWUgPSBEYXRlLm5vdygpXG5cbiAgICAgIGlmICh0aGlzLnByZXNzKSB0aGlzLnByZXNzKClcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICB9LFxuXG4gICAgdG91Y2hTdGFydEhhbmRsZXIgKGV2ZW50KSB7XG4gICAgICBsZXQgZWxlbWVudCA9IGV2ZW50LnRhcmdldFxuXG4gICAgICB0aGlzLl94ID0gZXZlbnQudGFyZ2V0VG91Y2hlc1swXS5wYWdlWCAtIGVsZW1lbnQub2Zmc2V0TGVmdFxuICAgICAgdGhpcy5feSA9IGV2ZW50LnRhcmdldFRvdWNoZXNbMF0ucGFnZVkgLSBlbGVtZW50Lm9mZnNldFRvcFxuXG4gICAgICB0aGlzLmlzRG93biA9IHRydWVcbiAgICAgIHRoaXMuaXNVcCA9IGZhbHNlXG4gICAgICB0aGlzLnRhcHBlZCA9IGZhbHNlXG5cbiAgICAgIHRoaXMuZG93blRpbWUgPSBEYXRlLm5vdygpXG5cbiAgICAgIGlmICh0aGlzLnByZXNzKSB0aGlzLnByZXNzKClcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICB9LFxuXG4gICAgdXBIYW5kbGVyIChldmVudCkge1xuICAgICAgdGhpcy5lbGFwc2VkVGltZSA9IE1hdGguYWJzKHRoaXMuZG93blRpbWUgLSBEYXRlLm5vdygpKVxuICAgICAgaWYgKHRoaXMuZWxhcHNlZFRpbWUgPD0gMjAwICYmIHRoaXMudGFwcGVkID09PSBmYWxzZSkge1xuICAgICAgICB0aGlzLnRhcHBlZCA9IHRydWVcbiAgICAgICAgaWYgKHRoaXMudGFwKSB0aGlzLnRhcCgpXG4gICAgICB9XG5cbiAgICAgIHRoaXMuaXNVcCA9IHRydWVcbiAgICAgIHRoaXMuaXNEb3duID0gZmFsc2VcblxuICAgICAgaWYgKHRoaXMucmVsZWFzZSkgdGhpcy5yZWxlYXNlKClcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICB9LFxuXG4gICAgdG91Y2hFbmRIYW5kbGVyIChldmVudCkge1xuICAgICAgdGhpcy5lbGFwc2VkVGltZSA9IE1hdGguYWJzKHRoaXMuZG93blRpbWUgLSBEYXRlLm5vdygpKVxuXG4gICAgICBpZiAodGhpcy5lbGFwc2VkVGltZSA8PSAyMDAgJiYgdGhpcy50YXBwZWQgPT09IGZhbHNlKSB7XG4gICAgICAgIHRoaXMudGFwcGVkID0gdHJ1ZVxuICAgICAgICBpZiAodGhpcy50YXApIHRoaXMudGFwKClcbiAgICAgIH1cblxuICAgICAgdGhpcy5pc1VwID0gdHJ1ZVxuICAgICAgdGhpcy5pc0Rvd24gPSBmYWxzZVxuXG4gICAgICBpZiAodGhpcy5yZWxlYXNlKSB0aGlzLnJlbGVhc2UoKVxuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgIH0sXG5cbiAgICBoaXRUZXN0U3ByaXRlIChzcHJpdGUpIHtcbiAgICAgIGxldCBoaXQgPSBmYWxzZVxuXG4gICAgICBpZiAoIXNwcml0ZS5jaXJjdWxhcikge1xuICAgICAgICBsZXQgbGVmdCA9IHNwcml0ZS5neFxuICAgICAgICBsZXQgcmlnaHQgPSBzcHJpdGUuZ3ggKyBzcHJpdGUud2lkdGhcbiAgICAgICAgbGV0IHRvcCA9IHNwcml0ZS5neVxuICAgICAgICBsZXQgYm90dG9tID0gc3ByaXRlLmd5ICsgc3ByaXRlLmhlaWdodFxuXG4gICAgICAgIGhpdCA9IHRoaXMueCA+IGxlZnQgJiYgdGhpcy54IDwgcmlnaHQgJiZcbiAgICAgICAgICAgICAgICAgICAgdGhpcy55ID4gdG9wICYmIHRoaXMueSA8IGJvdHRvbVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGV0IHZ4ID0gdGhpcy54IC0gKHNwcml0ZS5neCArIHNwcml0ZS5yYWRpdXMpXG4gICAgICAgIGxldCB2eSA9IHRoaXMueSAtIChzcHJpdGUuZ3kgKyBzcHJpdGUucmFkaXVzKVxuICAgICAgICBsZXQgZGlzdGFuY2UgPSBNYXRoLnNxcnQodnggKiB2eCArIHZ5ICogdnkpXG5cbiAgICAgICAgaGl0ID0gZGlzdGFuY2UgPCBzcHJpdGUucmFkaXVzXG4gICAgICB9XG5cbiAgICAgIHJldHVybiBoaXRcbiAgICB9LFxuXG4gICAgdXBkYXRlRHJhZ0FuZERyb3AgKHNwcml0ZSkge1xuICAgICAgaWYgKHRoaXMuaXNEb3duKSB7XG4gICAgICAgIGlmICh0aGlzLmRyYWdTcHJpdGUgPT09IG51bGwpIHtcbiAgICAgICAgICBmb3IgKGxldCBpID0gZHJhZ2dhYmxlU3ByaXRlcy5sZW5ndGggLSAxOyBpID4gLTE7IGktLSkge1xuICAgICAgICAgICAgbGV0IHNwcml0ZSA9IGRyYWdnYWJsZVNwcml0ZXNbaV1cblxuICAgICAgICAgICAgaWYgKHRoaXMuaGl0VGVzdFNwcml0ZShzcHJpdGUpICYmIHNwcml0ZS5kcmFnZ2FibGUpIHtcbiAgICAgICAgICAgICAgdGhpcy5kcmFnT2Zmc2V0WCA9IHRoaXMueCAtIHNwcml0ZS5neFxuICAgICAgICAgICAgICB0aGlzLmRyYWdPZmZzZXRZID0gdGhpcy55IC0gc3ByaXRlLmd5XG5cbiAgICAgICAgICAgICAgdGhpcy5kcmFnU3ByaXRlID0gc3ByaXRlXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyByZW9yZGVyIHNwcml0ZXMgdG8gZGlzcGxheSBkcmFnZ2VkIHNwcml0ZSBhYm92ZSBhbGxcbiAgICAgICAgICAgICAgbGV0IGNoaWxkcmVuID0gc3ByaXRlLnBhcmVudC5jaGlsZHJlblxuICAgICAgICAgICAgICBjaGlsZHJlbi5zcGxpY2UoY2hpbGRyZW4uaW5kZXhPZihzcHJpdGUpLCAxKVxuICAgICAgICAgICAgICBjaGlsZHJlbi5wdXNoKHNwcml0ZSlcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJlb3JkZXIgZHJhZ2dhYmxlU3ByaXRlcyBpbiB0aGUgc2FtZSB3YXlcbiAgICAgICAgICAgICAgZHJhZ2dhYmxlU3ByaXRlcy5zcGxpY2UoZHJhZ2dhYmxlU3ByaXRlcy5pbmRleE9mKHNwcml0ZSksIDEpXG4gICAgICAgICAgICAgIGRyYWdnYWJsZVNwcml0ZXMucHVzaChzcHJpdGUpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuZHJhZ1Nwcml0ZS54ID0gdGhpcy54IC0gdGhpcy5kcmFnT2Zmc2V0WFxuICAgICAgICAgIHRoaXMuZHJhZ1Nwcml0ZS55ID0gdGhpcy55IC0gdGhpcy5kcmFnT2Zmc2V0WVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLmlzVXApIHtcbiAgICAgICAgdGhpcy5kcmFnU3ByaXRlID0gbnVsbFxuICAgICAgfVxuXG4gICAgICAgICAgICAvLyBjaGFuZ2UgY3Vyc29yIHRvIGhhbmQgaWYgaXQncyBvdmVyIGRyYWdnYWJsZSBzcHJpdGVzXG4gICAgICBkcmFnZ2FibGVTcHJpdGVzLnNvbWUoc3ByaXRlID0+IHtcbiAgICAgICAgaWYgKHRoaXMuaGl0VGVzdFNwcml0ZShzcHJpdGUpICYmIHNwcml0ZS5kcmFnZ2FibGUpIHtcbiAgICAgICAgICB0aGlzLmVsZW1lbnQuc3R5bGUuY3Vyc29yID0gJ3BvaW50ZXInXG4gICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLmVsZW1lbnQuc3R5bGUuY3Vyc29yID0gJ2F1dG8nXG4gICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICAnbW91c2Vtb3ZlJywgcG9pbnRlci5tb3ZlSGFuZGxlci5iaW5kKHBvaW50ZXIpLCBmYWxzZVxuICAgIClcblxuICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICAgICdtb3VzZWRvd24nLCBwb2ludGVyLmRvd25IYW5kbGVyLmJpbmQocG9pbnRlciksIGZhbHNlXG4gICAgKVxuXG4gIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgJ21vdXNldXAnLCBwb2ludGVyLnVwSGFuZGxlci5iaW5kKHBvaW50ZXIpLCBmYWxzZVxuICAgIClcblxuICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICAgICd0b3VjaG1vdmUnLCBwb2ludGVyLnRvdWNoTW92ZUhhbmRsZXIuYmluZChwb2ludGVyKSwgZmFsc2VcbiAgICApXG5cbiAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICAndG91Y2hzdGFydCcsIHBvaW50ZXIudG91Y2hTdGFydEhhbmRsZXIuYmluZChwb2ludGVyKSwgZmFsc2VcbiAgICApXG5cbiAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICAndG91Y2hlbmQnLCBwb2ludGVyLnRvdWNoRW5kSGFuZGxlci5iaW5kKHBvaW50ZXIpLCBmYWxzZVxuICAgIClcblxuICBlbGVtZW50LnN0eWxlLnRvdWNoQWN0aW9uID0gJ25vbmUnXG5cbiAgcmV0dXJuIHBvaW50ZXJcbn1cbiIsImxldCBhY3R4ID0gbmV3IEF1ZGlvQ29udGV4dCgpXHJcblxyXG5jbGFzcyBTb3VuZCB7XHJcbiAgY29uc3RydWN0b3IgKHNvdXJjZSwgbG9hZEhhbmRsZXIpIHtcclxuICAgIHRoaXMuc291cmNlID0gc291cmNlXHJcbiAgICB0aGlzLmxvYWRIYW5kbGVyID0gbG9hZEhhbmRsZXJcclxuXHJcbiAgICB0aGlzLmFjdHggPSBhY3R4XHJcbiAgICB0aGlzLnZvbHVtZU5vZGUgPSB0aGlzLmFjdHguY3JlYXRlR2FpbigpXHJcbiAgICB0aGlzLnBhbk5vZGUgPSB0aGlzLmFjdHguY3JlYXRlU3RlcmVvUGFubmVyKClcclxuICAgIHRoaXMuc291bmROb2RlID0gbnVsbFxyXG4gICAgdGhpcy5idWZmZXIgPSBudWxsXHJcbiAgICB0aGlzLmxvb3AgPSBmYWxzZVxyXG4gICAgdGhpcy5wbGF5aW5nID0gZmFsc2VcclxuXHJcbiAgICB0aGlzLnBhblZhbHVlID0gMFxyXG4gICAgdGhpcy52b2x1bWVWYWx1ZSA9IDFcclxuXHJcbiAgICB0aGlzLnN0YXJ0VGltZSA9IDBcclxuICAgIHRoaXMuc3RhcnRPZmZzZXQgPSAwXHJcblxyXG4gICAgdGhpcy5sb2FkKClcclxuICB9XHJcblxyXG4gIGxvYWQgKCkge1xyXG4gICAgbGV0IHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpXHJcbiAgICB4aHIub3BlbignR0VUJywgdGhpcy5zb3VyY2UsIHRydWUpXHJcbiAgICB4aHIucmVzcG9uc2VUeXBlID0gJ2FycmF5YnVmZmVyJ1xyXG4gICAgeGhyLmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCAoKSA9PiB7XHJcbiAgICAgIHRoaXMuYWN0eC5kZWNvZGVBdWRpb0RhdGEoXHJcbiAgICAgICAgICAgICAgICB4aHIucmVzcG9uc2UsXHJcbiAgICAgICAgICAgICAgICBidWZmZXIgPT4ge1xyXG4gICAgICAgICAgICAgICAgICB0aGlzLmJ1ZmZlciA9IGJ1ZmZlclxyXG4gICAgICAgICAgICAgICAgICB0aGlzLmhhc0xvYWRlZCA9IHRydWVcclxuXHJcbiAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmxvYWRIYW5kbGVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2FkSGFuZGxlcigpXHJcbiAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBlcnJvciA9PiB7XHJcbiAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQXVkaW8gY291bGQgbm90IGJlIGRlY29kZWQ6ICcgKyBlcnJvcilcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgKVxyXG4gICAgfSlcclxuXHJcbiAgICB4aHIuc2VuZCgpXHJcbiAgfVxyXG5cclxuICBwbGF5ICgpIHtcclxuICAgIHRoaXMuc3RhcnRUaW1lID0gdGhpcy5hY3R4LmN1cnJlbnRUaW1lXHJcbiAgICB0aGlzLnNvdW5kTm9kZSA9IHRoaXMuYWN0eC5jcmVhdGVCdWZmZXJTb3VyY2UoKVxyXG5cclxuICAgIHRoaXMuc291bmROb2RlLmJ1ZmZlciA9IHRoaXMuYnVmZmVyXHJcblxyXG4gICAgdGhpcy5zb3VuZE5vZGUuY29ubmVjdCh0aGlzLnZvbHVtZU5vZGUpXHJcbiAgICB0aGlzLnZvbHVtZU5vZGUuY29ubmVjdCh0aGlzLnBhbk5vZGUpXHJcbiAgICB0aGlzLnBhbk5vZGUuY29ubmVjdCh0aGlzLmFjdHguZGVzdGluYXRpb24pXHJcblxyXG4gICAgdGhpcy5zb3VuZE5vZGUubG9vcCA9IHRoaXMubG9vcFxyXG5cclxuICAgIHRoaXMuc291bmROb2RlLnN0YXJ0KFxyXG4gICAgICAgICAgICB0aGlzLnN0YXJ0VGltZSxcclxuICAgICAgICAgICAgdGhpcy5zdGFydE9mZnNldCAlIHRoaXMuYnVmZmVyLmR1cmF0aW9uXHJcbiAgICAgICAgKVxyXG5cclxuICAgIHRoaXMucGxheWluZyA9IHRydWVcclxuICB9XHJcblxyXG4gIHBhdXNlICgpIHtcclxuICAgIGlmICh0aGlzLnBsYXlpbmcpIHtcclxuICAgICAgdGhpcy5zb3VuZE5vZGUuc3RvcCh0aGlzLmFjdHguY3VycmVudFRpbWUpXHJcbiAgICAgIHRoaXMuc3RhcnRPZmZzZXQgKz0gdGhpcy5hY3R4LmN1cnJlbnRUaW1lIC0gdGhpcy5zdGFydFRpbWVcclxuICAgICAgdGhpcy5wbGF5aW5nID0gZmFsc2VcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJlc3RhcnQgKCkge1xyXG4gICAgaWYgKHRoaXMucGxheWluZykge1xyXG4gICAgICB0aGlzLnNvdW5kTm9kZS5zdG9wKHRoaXMuYWN0eC5jdXJyZW50VGltZSlcclxuICAgIH1cclxuICAgIHRoaXMuc3RhcnRPZmZzZXQgPSAwXHJcbiAgICB0aGlzLnBsYXkoKVxyXG4gIH1cclxuXHJcbiAgcGxheUZyb20gKHZhbHVlKSB7XHJcbiAgICBpZiAodGhpcy5wbGF5aW5nKSB7XHJcbiAgICAgIHRoaXMuc291bmROb2RlLnN0b3AodGhpcy5hY3R4LmN1cnJlbnRUaW1lKVxyXG4gICAgfVxyXG4gICAgdGhpcy5zdGFydE9mZnNldCA9IHZhbHVlXHJcbiAgICB0aGlzLnBsYXkoKVxyXG4gIH1cclxuXHJcbiAgZ2V0IHZvbHVtZSAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy52b2x1bWVWYWx1ZVxyXG4gIH1cclxuICBzZXQgdm9sdW1lICh2YWx1ZSkge1xyXG4gICAgdGhpcy52b2x1bWVOb2RlLmdhaW4udmFsdWUgPSB2YWx1ZVxyXG4gICAgdGhpcy52b2x1bWVWYWx1ZSA9IHZhbHVlXHJcbiAgfVxyXG5cclxuICBnZXQgcGFuICgpIHtcclxuICAgIHJldHVybiB0aGlzLnBhblZhbHVlXHJcbiAgfVxyXG4gIHNldCBwYW4gKHZhbHVlKSB7XHJcbiAgICB0aGlzLnBhbk5vZGUucGFuLnZhbHVlID0gdmFsdWVcclxuICAgIHRoaXMucGFuVmFsdWUgPSB2YWx1ZVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIG1ha2VTb3VuZCAoc291cmNlLCBsb2FkSGFuZGxlcikge1xyXG4gIHJldHVybiBuZXcgU291bmQoc291cmNlLCBsb2FkSGFuZGxlcilcclxufVxyXG4iLCJpbXBvcnQge21ha2VTb3VuZH0gZnJvbSAnLi9zb3VuZCdcblxuZXhwb3J0IGxldCBhc3NldHMgPSB7XG4gIHRvTG9hZDogMCxcbiAgbG9hZGVkOiAwLFxuXG4gIGltYWdlRXh0ZW5zaW9uczogWydwbmcnLCAnanBnJywgJ2dpZiddLFxuICBmb250RXh0ZW5zaW9uczogWyd0dGYnLCAnb3RmJywgJ3R0YycsICd3b2ZmJ10sXG4gIGpzb25FeHRlbnNpb25zOiBbJ2pzb24nXSxcbiAgYXVkaW9FeHRlbnNpb25zOiBbJ21wMycsICdvZ2cnLCAnd2F2JywgJ3dlYm0nXSxcblxuICAgIC8vIEFQSVxuICBsb2FkIChzb3VyY2VzKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgbGV0IGxvYWRIYW5kbGVyID0gKCkgPT4ge1xuICAgICAgICB0aGlzLmxvYWRlZCArPSAxXG4gICAgICAgIGNvbnNvbGUubG9nKHRoaXMubG9hZGVkKVxuXG4gICAgICAgIGlmICh0aGlzLnRvTG9hZCA9PT0gdGhpcy5sb2FkZWQpIHtcbiAgICAgICAgICB0aGlzLmxvYWRlZCA9IDBcbiAgICAgICAgICB0aGlzLnRvTG9hZCA9IDBcbiAgICAgICAgICBjb25zb2xlLmxvZygnQXNzZXRzIGxvYWRlZCEnKVxuXG4gICAgICAgICAgcmVzb2x2ZSgpXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgY29uc29sZS5sb2coJ0xvYWRpbmcgYXNzZXRzLi4uJylcblxuICAgICAgdGhpcy50b0xvYWQgPSBzb3VyY2VzLmxlbmd0aFxuXG4gICAgICBzb3VyY2VzLmZvckVhY2goc291cmNlID0+IHtcbiAgICAgICAgbGV0IGV4dGVuc2lvbiA9IHNvdXJjZS5zcGxpdCgnLicpLnBvcCgpXG5cbiAgICAgICAgaWYgKHRoaXMuaW1hZ2VFeHRlbnNpb25zLmluZGV4T2YoZXh0ZW5zaW9uKSAhPT0gLTEpIHtcbiAgICAgICAgICB0aGlzLmxvYWRJbWFnZShzb3VyY2UsIGxvYWRIYW5kbGVyKVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuZm9udEV4dGVuc2lvbnMuaW5kZXhPZihleHRlbnNpb24pICE9PSAtMSkge1xuICAgICAgICAgIHRoaXMubG9hZEZvbnQoc291cmNlLCBsb2FkSGFuZGxlcilcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmpzb25FeHRlbnNpb25zLmluZGV4T2YoZXh0ZW5zaW9uKSAhPT0gLTEpIHtcbiAgICAgICAgICB0aGlzLmxvYWRKc29uKHNvdXJjZSwgbG9hZEhhbmRsZXIpXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5hdWRpb0V4dGVuc2lvbnMuaW5kZXhPZihleHRlbnNpb24pICE9PSAtMSkge1xuICAgICAgICAgIHRoaXMubG9hZFNvdW5kKHNvdXJjZSwgbG9hZEhhbmRsZXIpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ0ZpbGUgdHlwZSBub3QgcmVjb2duaXplZDogJyArIHNvdXJjZSlcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9KVxuICB9LFxuXG4gIGxvYWRJbWFnZSAoc291cmNlLCBsb2FkSGFuZGxlcikge1xuICAgIGxldCBpbWFnZSA9IG5ldyBJbWFnZSgpXG4gICAgaW1hZ2UuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGxvYWRIYW5kbGVyLCBmYWxzZSlcbiAgICB0aGlzW3NvdXJjZV0gPSBpbWFnZVxuICAgIGltYWdlLnNyYyA9IHNvdXJjZVxuICB9LFxuXG4gIGxvYWRGb250IChzb3VyY2UsIGxvYWRIYW5kbGVyKSB7XG4gICAgbGV0IGZvbnRGYW1pbHkgPSBzb3VyY2Uuc3BsaXQoJy8nKS5wb3AoKS5zcGxpdCgnLicpWzBdXG5cbiAgICBsZXQgbmV3U3R5bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpXG4gICAgbGV0IGZvbnRGYWNlID1cbiAgICAgICAgICAgICAgICBcIkBmb250LWZhY2Uge2ZvbnQtZmFtaWx5OiAnXCIgKyBmb250RmFtaWx5ICsgXCInOyBzcmM6IHVybCgnXCIgKyBzb3VyY2UgKyBcIicpO31cIlxuXG4gICAgbmV3U3R5bGUuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoZm9udEZhY2UpKVxuICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQobmV3U3R5bGUpXG5cbiAgICBsb2FkSGFuZGxlcigpXG4gIH0sXG5cbiAgbG9hZEpzb24gKHNvdXJjZSwgbG9hZEhhbmRsZXIpIHtcbiAgICBsZXQgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcbiAgICB4aHIub3BlbignR0VUJywgc291cmNlLCB0cnVlKVxuICAgIHhoci5yZXNwb25zZVR5cGUgPSAndGV4dCdcblxuICAgIHhoci5vbmxvYWQgPSBldmVudCA9PiB7XG4gICAgICBpZiAoeGhyLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgIGxldCBmaWxlID0gSlNPTi5wYXJzZSh4aHIucmVzcG9uc2VUZXh0KVxuICAgICAgICBmaWxlLm5hbWUgPSBzb3VyY2VcbiAgICAgICAgdGhpc1tmaWxlLm5hbWVdID0gZmlsZVxuXG4gICAgICAgIGlmIChmaWxlLnNwcml0ZXMpIHtcbiAgICAgICAgICB0aGlzLmNyZWF0ZVNwcml0ZVNoZWV0KGZpbGUsIHNvdXJjZSwgbG9hZEhhbmRsZXIpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbG9hZEhhbmRsZXIoKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgeGhyLnNlbmQoKVxuICB9LFxuXG4gIGNyZWF0ZVNwcml0ZVNoZWV0IChmaWxlLCBzb3VyY2UsIGxvYWRIYW5kbGVyKSB7XG4gICAgbGV0IGJhc2VVcmwgPSBzb3VyY2UucmVwbGFjZSgvW14vXSokLywgJycpXG4gICAgbGV0IGltYWdlU291cmNlID0gYmFzZVVybCArIGZpbGUuaW1hZ2VQYXRoXG5cbiAgICBsZXQgaW1hZ2VMb2FkSGFuZGxlciA9ICgpID0+IHtcbiAgICAgIHRoaXNbaW1hZ2VTb3VyY2VdID0gaW1hZ2VcblxuICAgICAgT2JqZWN0LmtleXMoZmlsZS5zcHJpdGVzKS5mb3JFYWNoKHNwcml0ZSA9PiB7XG4gICAgICAgIHRoaXNbc3ByaXRlXSA9IGZpbGUuc3ByaXRlc1tzcHJpdGVdXG4gICAgICAgIHRoaXNbc3ByaXRlXS5zb3VyY2UgPSBpbWFnZVxuICAgICAgfSlcblxuICAgICAgbG9hZEhhbmRsZXIoKVxuICAgIH1cblxuICAgIGxldCBpbWFnZSA9IG5ldyBJbWFnZSgpXG4gICAgaW1hZ2UuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGltYWdlTG9hZEhhbmRsZXIsIGZhbHNlKVxuICAgIGltYWdlLnNyYyA9IGltYWdlU291cmNlXG4gIH0sXG5cbiAgbG9hZFNvdW5kIChzb3VyY2UsIGxvYWRIYW5kbGVyKSB7XG4gICAgbGV0IHNvdW5kID0gbWFrZVNvdW5kKHNvdXJjZSwgbG9hZEhhbmRsZXIpXG5cbiAgICBzb3VuZC5uYW1lID0gc291cmNlXG4gICAgdGhpc1tzb3VuZC5uYW1lXSA9IHNvdW5kXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbnRhaW4gKHNwcml0ZSwgYm91bmRzLCBib3VuY2UgPSBmYWxzZSwgZXh0cmEgPSB1bmRlZmluZWQpIHtcbiAgbGV0IHggPSBib3VuZHMueFxuICBsZXQgeSA9IGJvdW5kcy55XG4gIGxldCB3aWR0aCA9IGJvdW5kcy53aWR0aFxuICBsZXQgaGVpZ2h0ID0gYm91bmRzLmhlaWdodFxuXG4gIGxldCBjb2xsaXNpb25cblxuICBpZiAoc3ByaXRlLnggPCB4KSB7XG4gICAgaWYgKGJvdW5jZSkgc3ByaXRlLnZ4ICo9IC0xXG4gICAgaWYgKHNwcml0ZS5tYXNzKSBzcHJpdGUudnggLz0gc3ByaXRlLm1hc3NcblxuICAgIHNwcml0ZS54ID0geFxuICAgIGNvbGxpc2lvbiA9ICdsZWZ0J1xuICB9XG5cbiAgaWYgKHNwcml0ZS55IDwgeSkge1xuICAgIGlmIChib3VuY2UpIHNwcml0ZS52eSAqPSAtMVxuICAgIGlmIChzcHJpdGUubWFzcykgc3ByaXRlLnZ5IC89IHNwcml0ZS5tYXNzXG5cbiAgICBzcHJpdGUueSA9IHlcbiAgICBjb2xsaXNpb24gPSAndG9wJ1xuICB9XG5cbiAgaWYgKHNwcml0ZS54ICsgc3ByaXRlLndpZHRoID4gd2lkdGgpIHtcbiAgICBpZiAoYm91bmNlKSBzcHJpdGUudnggKj0gLTFcbiAgICBpZiAoc3ByaXRlLm1hc3MpIHNwcml0ZS52eCAvPSBzcHJpdGUubWFzc1xuXG4gICAgc3ByaXRlLnggPSB3aWR0aCAtIHNwcml0ZS53aWR0aFxuICAgIGNvbGxpc2lvbiA9ICdyaWdodCdcbiAgfVxuXG4gIGlmIChzcHJpdGUueSArIHNwcml0ZS5oZWlnaHQgPiBoZWlnaHQpIHtcbiAgICBpZiAoYm91bmNlKSBzcHJpdGUudnkgKj0gLTFcbiAgICBpZiAoc3ByaXRlLm1hc3MpIHNwcml0ZS52eSAvPSBzcHJpdGUubWFzc1xuXG4gICAgc3ByaXRlLnkgPSBoZWlnaHQgLSBzcHJpdGUuaGVpZ2h0XG4gICAgY29sbGlzaW9uID0gJ2JvdHRvbSdcbiAgfVxuXG4gIGlmIChjb2xsaXNpb24gJiYgZXh0cmEpIGV4dHJhKGNvbGxpc2lvbilcblxuICByZXR1cm4gY29sbGlzaW9uXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBvdXRzaWRlQm91bmRzIChzcHJpdGUsIGJvdW5kcywgZXh0cmEgPSB1bmRlZmluZWQpIHtcbiAgbGV0IHggPSBib3VuZHMueFxuICBsZXQgeSA9IGJvdW5kcy55XG4gIGxldCB3aWR0aCA9IGJvdW5kcy53aWR0aFxuICBsZXQgaGVpZ2h0ID0gYm91bmRzLmhlaWdodFxuXG4gIGxldCBjb2xsaXNpb25cblxuICBpZiAoc3ByaXRlLnggPCB4IC0gc3ByaXRlLndpZHRoKSB7XG4gICAgY29sbGlzaW9uID0gJ2xlZnQnXG4gIH1cbiAgaWYgKHNwcml0ZS55IDwgeSAtIHNwcml0ZS5oZWlnaHQpIHtcbiAgICBjb2xsaXNpb24gPSAndG9wJ1xuICB9XG4gIGlmIChzcHJpdGUueCA+IHdpZHRoKSB7XG4gICAgY29sbGlzaW9uID0gJ3JpZ2h0J1xuICB9XG4gIGlmIChzcHJpdGUueSA+IGhlaWdodCkge1xuICAgIGNvbGxpc2lvbiA9ICdib3R0b20nXG4gIH1cblxuICBpZiAoY29sbGlzaW9uICYmIGV4dHJhKSBleHRyYShjb2xsaXNpb24pXG5cbiAgcmV0dXJuIGNvbGxpc2lvblxufVxuXG5leHBvcnQgZnVuY3Rpb24gd3JhcCAoc3ByaXRlLCBib3VuZHMpIHtcbiAgbGV0IHdpZHRoID0gYm91bmRzLndpZHRoXG4gIGxldCBoZWlnaHQgPSBib3VuZHMuaGVpZ2h0XG5cbiAgaWYgKHNwcml0ZS54ICsgc3ByaXRlLndpZHRoIDwgMCkge1xuICAgIHNwcml0ZS54ID0gd2lkdGhcbiAgfVxuICBpZiAoc3ByaXRlLnkgKyBzcHJpdGUuaGVpZ2h0IDwgMCkge1xuICAgIHNwcml0ZS55ID0gaGVpZ2h0XG4gIH1cbiAgaWYgKHNwcml0ZS54IC0gc3ByaXRlLndpZHRoID4gd2lkdGgpIHtcbiAgICBzcHJpdGUueCA9IC1zcHJpdGUud2lkdGhcbiAgfVxuICBpZiAoc3ByaXRlLnkgLSBzcHJpdGUuaGVpZ2h0ID4gaGVpZ2h0KSB7XG4gICAgc3ByaXRlLnkgPSAtc3ByaXRlLmhlaWdodFxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjYXB0dXJlUHJldmlvdXNQb3NpdGlvbnMgKHN0YWdlKSB7XG4gIHN0YWdlLmNoaWxkcmVuLmZvckVhY2goc3ByaXRlID0+IHtcbiAgICBzZXRQcmV2aW91c1Bvc2l0aW9uKHNwcml0ZSlcbiAgfSlcblxuICBmdW5jdGlvbiBzZXRQcmV2aW91c1Bvc2l0aW9uIChzcHJpdGUpIHtcbiAgICBzcHJpdGUucHJldmlvdXNYID0gc3ByaXRlLnhcbiAgICBzcHJpdGUucHJldmlvdXNZID0gc3ByaXRlLnlcblxuICAgIGlmIChzcHJpdGUuY2hpbGRyZW4gJiYgc3ByaXRlLmNoaWxkcmVuLmxlbmd0aCA+IDApIHtcbiAgICAgIHNwcml0ZS5jaGlsZHJlbi5mb3JFYWNoKGNoaWxkID0+IHtcbiAgICAgICAgc2V0UHJldmlvdXNQb3NpdGlvbihjaGlsZClcbiAgICAgIH0pXG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkaXN0YW5jZSAoczEsIHMyKSB7XG4gIGxldCB2eCA9IHMyLmNlbnRlclggLSBzMS5jZW50ZXJYXG4gIGxldCB2eSA9IHMyLmNlbnRlclkgLSBzMS5jZW50ZXJZXG5cbiAgcmV0dXJuIE1hdGguc3FydCh2eCAqIHZ4ICsgdnkgKiB2eSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZvbGxvd0Vhc2UgKGZvbGxvd2VyLCBsZWFkZXIsIHNwZWVkKSB7XG4gIGxldCB2eCA9IGxlYWRlci5jZW50ZXJYIC0gZm9sbG93ZXIuY2VudGVyWFxuICBsZXQgdnkgPSBsZWFkZXIuY2VudGVyWSAtIGZvbGxvd2VyLmNlbnRlcllcbiAgbGV0IGRpc3RhbmNlID0gTWF0aC5zcXJ0KHZ4ICogdnggKyB2eSAqIHZ5KVxuICBpZiAoZGlzdGFuY2UgPj0gMSkge1xuICAgIGZvbGxvd2VyLnggKz0gdnggKiBzcGVlZFxuICAgIGZvbGxvd2VyLnkgKz0gdnkgKiBzcGVlZFxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmb2xsb3dDb25zdGFudCAoZm9sbG93ZXIsIGxlYWRlciwgc3BlZWQpIHtcbiAgbGV0IHZ4ID0gbGVhZGVyLmNlbnRlclggLSBmb2xsb3dlci5jZW50ZXJYXG4gIGxldCB2eSA9IGxlYWRlci5jZW50ZXJZIC0gZm9sbG93ZXIuY2VudGVyWVxuICBsZXQgZGlzdGFuY2UgPSBNYXRoLnNxcnQodnggKiB2eCArIHZ5ICogdnkpXG4gIGlmIChkaXN0YW5jZSA+PSBzcGVlZCkge1xuICAgIGZvbGxvd2VyLnggKz0gKHZ4IC8gZGlzdGFuY2UpICogc3BlZWRcbiAgICBmb2xsb3dlci55ICs9ICh2eSAvIGRpc3RhbmNlKSAqIHNwZWVkXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFuZ2xlIChzMSwgczIpIHtcbiAgcmV0dXJuIE1hdGguYXRhbjIoXG4gICAgICAgIHMyLmNlbnRlclggLSBzMS5jZW50ZXJYLFxuICAgICAgICBzMi5jZW50ZXJZIC0gczEuY2VudGVyWVxuICAgIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJvdGF0ZVNwcml0ZSAocm90YXRpbmdTcHJpdGUsIGNlbnRlclNwcml0ZSwgZGlzdGFuY2UsIGFuZ2xlKSB7XG4gIHJvdGF0aW5nU3ByaXRlLnggPSBjZW50ZXJTcHJpdGUuY2VudGVyWCAtIHJvdGF0aW5nU3ByaXRlLnBhcmVudC54ICtcbiAgICAgICAgICAgICAgICAgICAgICAgIChkaXN0YW5jZSAqIE1hdGguY29zKGFuZ2xlKSkgLVxuICAgICAgICAgICAgICAgICAgICAgICAgcm90YXRpbmdTcHJpdGUuaGFsZldpZHRoXG4gIHJvdGF0aW5nU3ByaXRlLnkgPSBjZW50ZXJTcHJpdGUuY2VudGVyWSAtIHJvdGF0aW5nU3ByaXRlLnBhcmVudC55ICtcbiAgICAgICAgICAgICAgICAgICAgICAgIChkaXN0YW5jZSAqIE1hdGguc2luKGFuZ2xlKSkgLVxuICAgICAgICAgICAgICAgICAgICAgICAgcm90YXRpbmdTcHJpdGUuaGFsZldpZHRoXG59XG5cbmV4cG9ydCBmdW5jdGlvbiByb3RhdGVQb2ludCAocG9pbnRYLCBwb2ludFksIGRpc3RhbmNlWCwgZGlzdGFuY2VZLCBhbmdsZSkge1xuICBsZXQgcG9pbnQgPSB7fVxuXG4gIHBvaW50LnggPSBwb2ludFggKyBNYXRoLmNvcyhhbmdsZSkgKiBkaXN0YW5jZVhcbiAgcG9pbnQueSA9IHBvaW50WSArIE1hdGguc2luKGFuZ2xlKSAqIGRpc3RhbmNlWVxuXG4gIHJldHVybiBwb2ludFxufVxuXG4vLyBSYW5kb20gcmFuZ2VcbmV4cG9ydCBsZXQgcmFuZG9tSW50ID0gKG1pbiwgbWF4KSA9PiB7XG4gIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluICsgMSkpICsgbWluXG59XG5cbmV4cG9ydCBsZXQgcmFuZG9tRmxvYXQgPSAobWluLCBtYXgpID0+IHtcbiAgcmV0dXJuIG1pbiArIE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluKVxufVxuIiwiaW1wb3J0IHttYWtlQ2FudmFzLCByZW1vdmUsIHJlbmRlciwgc3RhZ2UsIHNwcml0ZSwgdGV4dCwgYmFja2dyb3VuZCwgcGFydGljbGVzLCBwYXJ0aWNsZUVmZmVjdH0gZnJvbSAnLi9lbmdpbmUvZGlzcGxheSdcbmltcG9ydCB7YXNzZXRzLCB3cmFwLCBvdXRzaWRlQm91bmRzLCByYW5kb21JbnQsIHJhbmRvbUZsb2F0fSBmcm9tICcuL2VuZ2luZS91dGlsaXRpZXMnXG5pbXBvcnQge2tleWJvYXJkfSBmcm9tICcuL2VuZ2luZS9pbnRlcmFjdGl2ZSdcbmltcG9ydCB7bW92aW5nQ2lyY2xlQ29sbGlzaW9uLCBjaXJjbGVSZWN0YW5nbGVDb2xsaXNpb259IGZyb20gJy4vZW5naW5lL2NvbGxpc2lvbidcblxuYXNzZXRzLmxvYWQoW1xuICAnYmdzL2RhcmtQdXJwbGUucG5nJyxcbiAgJ2ZvbnRzL2tlbnZlY3Rvcl9mdXR1cmVfdGhpbi50dGYnLFxuICAnc291bmRzL3NmeF9sYXNlcjEubXAzJyxcbiAgJ3Nwcml0ZXMvc2hlZXQuanNvbidcbl0pLnRoZW4oKCkgPT4gc2V0dXAoKSlcblxubGV0IGNhbnZhcywgc2hpcCwgbWVzc2FnZSwgc2hvb3RTZngsIGJnXG5sZXQgYnVsbGV0cyA9IFtdXG5sZXQgYXN0ZXJvaWRzID0gW11cblxubGV0IHNjb3JlID0gMFxuXG5mdW5jdGlvbiBzaG9vdCAoXG4gICAgICAgICAgICBzaG9vdGVyLCBhbmdsZSwgb2Zmc2V0RnJvbUNlbnRlcixcbiAgICAgICAgICAgIGJ1bGxldFNwZWVkLCBidWxsZXRzQXJyYXksIGJ1bGxldFNwcml0ZSkge1xuICBsZXQgYnVsbGV0ID0gYnVsbGV0U3ByaXRlKClcblxuICBidWxsZXQueCA9IHNob290ZXIuY2VudGVyWCAtIGJ1bGxldC5oYWxmV2lkdGggKyAob2Zmc2V0RnJvbUNlbnRlciAqIE1hdGguY29zKGFuZ2xlKSlcbiAgYnVsbGV0LnkgPSBzaG9vdGVyLmNlbnRlclkgLSBidWxsZXQuaGFsZkhlaWdodCArIChvZmZzZXRGcm9tQ2VudGVyICogTWF0aC5zaW4oYW5nbGUpKVxuXG4gIGJ1bGxldC52eCA9IE1hdGguc2luKGFuZ2xlKSAqIGJ1bGxldFNwZWVkXG4gIGJ1bGxldC52eSA9IC1NYXRoLmNvcyhhbmdsZSkgKiBidWxsZXRTcGVlZFxuXG4gIGJ1bGxldC5yb3RhdGlvbiA9IGFuZ2xlXG5cbiAgYnVsbGV0c0FycmF5LnB1c2goYnVsbGV0KVxuXG4gIHBhcnRpY2xlRWZmZWN0KGJ1bGxldC54LCBidWxsZXQueSlcbiAgc2hvb3RTZngucGxheSgpXG59XG5cbmZ1bmN0aW9uIHNwYXduQXN0ZXJvaWQgKCkge1xuICBsZXQgeCA9IHJhbmRvbUludCgwLCBzdGFnZS5sb2NhbEJvdW5kcy53aWR0aClcbiAgbGV0IHkgPSByYW5kb21JbnQoMCwgc3RhZ2UubG9jYWxCb3VuZHMuaGVpZ2h0KVxuXG4gIGxldCBhc3Rlcm9pZCA9IHNwcml0ZShhc3NldHNbJ21ldGVvckJyb3duX2JpZzEucG5nJ10sIHgsIHkpXG4gIGFzdGVyb2lkLmNpcmN1bGFyID0gdHJ1ZVxuICBhc3Rlcm9pZC5kaWFtZXRlciA9IDkwXG5cbiAgYXN0ZXJvaWQudnggPSByYW5kb21GbG9hdCgtNSwgNSlcbiAgYXN0ZXJvaWQudnkgPSByYW5kb21GbG9hdCgtNSwgNSlcblxuICBhc3Rlcm9pZC5yb3RhdGlvblNwZWVkID0gcmFuZG9tRmxvYXQoMC4wMSwgMC4wNylcblxuICBhc3Rlcm9pZHMucHVzaChhc3Rlcm9pZClcbn1cblxuZnVuY3Rpb24gc2V0dXAgKCkge1xuICBjYW52YXMgPSBtYWtlQ2FudmFzKDEyODAsIDcyMCwgJ25vbmUnKVxuICBzdGFnZS53aWR0aCA9IGNhbnZhcy53aWR0aFxuICBzdGFnZS5oZWlnaHQgPSBjYW52YXMuaGVpZ2h0XG5cbiAgc2hvb3RTZnggPSBhc3NldHNbJ3NvdW5kcy9zZnhfbGFzZXIxLm1wMyddXG5cbiAgYmcgPSBiYWNrZ3JvdW5kKGFzc2V0c1snYmdzL2RhcmtQdXJwbGUucG5nJ10sIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodClcblxuICBzaGlwID0gc3ByaXRlKGFzc2V0c1sncGxheWVyU2hpcDJfcmVkLnBuZyddKVxuICBzaGlwLnNjYWxlWCA9IDAuNVxuICBzaGlwLnNjYWxlWSA9IDAuNVxuICBzdGFnZS5wdXRDZW50ZXIoc2hpcClcblxuICBzaGlwLnZ4ID0gMFxuICBzaGlwLnZ5ID0gMFxuICBzaGlwLmFjY2VsZXJhdGlvblggPSAwLjJcbiAgc2hpcC5hY2NlbGVyYXRpb25ZID0gMC4yXG4gIHNoaXAuZnJpY3Rpb24gPSAwLjk2XG4gIHNoaXAuc3BlZWQgPSAwXG5cbiAgc2hpcC5yb3RhdGlvblNwZWVkID0gMFxuXG4gIHNoaXAubW92ZUZvcndhcmQgPSBmYWxzZVxuXG4gIHNoaXAubGl2ZXMgPSAzXG4gIHNoaXAuZGVzdHJveWVkID0gZmFsc2VcblxuICBsZXQgbGVmdEFycm93ID0ga2V5Ym9hcmQoMzcpXG4gIGxldCByaWdodEFycm93ID0ga2V5Ym9hcmQoMzkpXG4gIGxldCB1cEFycm93ID0ga2V5Ym9hcmQoMzgpXG4gIGxldCBzcGFjZSA9IGtleWJvYXJkKDMyKVxuXG4gIGxlZnRBcnJvdy5wcmVzcyA9ICgpID0+IHsgc2hpcC5yb3RhdGlvblNwZWVkID0gLTAuMSB9XG4gIGxlZnRBcnJvdy5yZWxlYXNlID0gKCkgPT4ge1xuICAgIGlmICghcmlnaHRBcnJvdy5pc0Rvd24pIHNoaXAucm90YXRpb25TcGVlZCA9IDBcbiAgfVxuXG4gIHJpZ2h0QXJyb3cucHJlc3MgPSAoKSA9PiB7IHNoaXAucm90YXRpb25TcGVlZCA9IDAuMSB9XG4gIHJpZ2h0QXJyb3cucmVsZWFzZSA9ICgpID0+IHtcbiAgICBpZiAoIWxlZnRBcnJvdy5pc0Rvd24pIHNoaXAucm90YXRpb25TcGVlZCA9IDBcbiAgfVxuXG4gIHVwQXJyb3cucHJlc3MgPSAoKSA9PiB7IHNoaXAubW92ZUZvcndhcmQgPSB0cnVlIH1cbiAgdXBBcnJvdy5yZWxlYXNlID0gKCkgPT4geyBzaGlwLm1vdmVGb3J3YXJkID0gZmFsc2UgfVxuXG4gIHNwYWNlLnByZXNzID0gKCkgPT4ge1xuICAgIHNob290KFxuICAgICAgICAgICAgc2hpcCwgc2hpcC5yb3RhdGlvbiwgMTQsIDEwLCBidWxsZXRzLFxuICAgICAgICAgICAgKCkgPT4gc3ByaXRlKGFzc2V0c1snbGFzZXJSZWQwNy5wbmcnXSlcbiAgICAgICAgKVxuICAgIHNob290KFxuICAgICAgICAgICAgc2hpcCwgc2hpcC5yb3RhdGlvbiwgLTE0LCAxMCwgYnVsbGV0cyxcbiAgICAgICAgICAgICgpID0+IHNwcml0ZShhc3NldHNbJ2xhc2VyUmVkMDcucG5nJ10pXG4gICAgICAgIClcbiAgfVxuXG4gIG1lc3NhZ2UgPSB0ZXh0KCdIZWxsbyEnLCAnMTZweCBrZW52ZWN0b3JfZnV0dXJlX3RoaW4nLCAnd2hpdGUnLCA4LCA4KVxuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgNTsgaSsrKSB7XG4gICAgc3Bhd25Bc3Rlcm9pZCgpXG4gIH1cblxuICBnYW1lTG9vcCgpXG59XG5cbmZ1bmN0aW9uIGdhbWVMb29wICgpIHtcbiAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGdhbWVMb29wKVxuXG4gIGlmIChwYXJ0aWNsZXMubGVuZ3RoID4gMCkge1xuICAgIHBhcnRpY2xlcy5mb3JFYWNoKHBhcnRpY2xlID0+IHtcbiAgICAgIHBhcnRpY2xlLnVwZGF0ZSgpXG4gICAgfSlcbiAgfVxuXG4gIGJ1bGxldHMgPSBidWxsZXRzLmZpbHRlcihidWxsZXQgPT4ge1xuICAgIGJ1bGxldC54ICs9IGJ1bGxldC52eFxuICAgIGJ1bGxldC55ICs9IGJ1bGxldC52eVxuXG4gICAgbGV0IGNvbGxpc2lvbiA9IG91dHNpZGVCb3VuZHMoYnVsbGV0LCBzdGFnZS5sb2NhbEJvdW5kcylcblxuICAgIGlmIChjb2xsaXNpb24pIHtcbiAgICAgIHJlbW92ZShidWxsZXQpXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZVxuICB9KVxuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgYXN0ZXJvaWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgbGV0IGExID0gYXN0ZXJvaWRzW2ldXG5cbiAgICAvLyB1cGRhdGUgYXN0ZXJvaWRcbiAgICBhMS5yb3RhdGlvbiArPSBhMS5yb3RhdGlvblNwZWVkXG4gICAgYTEueCArPSBhMS52eFxuICAgIGExLnkgKz0gYTEudnlcblxuICAgIHdyYXAoYTEsIHN0YWdlLmxvY2FsQm91bmRzKVxuXG4gICAgLy8gY2hlY2sgY29sbGlzaXNvbnNcbiAgICAvLyBiZXR3ZWVuIGFzdGVyb2lkc1xuICAgIGZvciAobGV0IGogPSBpICsgMTsgaiA8IGFzdGVyb2lkcy5sZW5ndGg7IGorKykge1xuICAgICAgbGV0IGEyID0gYXN0ZXJvaWRzW2pdXG5cbiAgICAgIG1vdmluZ0NpcmNsZUNvbGxpc2lvbihhMSwgYTIpXG4gICAgfVxuICAgICAgICAvLyBhbmQgd2l0aCBwbGF5ZXJcbiAgICBsZXQgcGxheWVySGl0ID0gY2lyY2xlUmVjdGFuZ2xlQ29sbGlzaW9uKGExLCBzaGlwLCB0cnVlKVxuICAgIGlmIChwbGF5ZXJIaXQpIHtcbiAgICAgIHNoaXAubGl2ZXMgLT0gMVxuICAgICAgLy8gZGVzdHJveSBzaGlwXG4gICAgICBzaGlwLmRlc3Ryb3llZCA9IHRydWVcbiAgICAgIC8vIHN0YWdlLnJlbW92ZUNoaWxkKHNoaXApO1xuICAgICAgcGFydGljbGVFZmZlY3Qoc2hpcC54LCBzaGlwLnkpXG5cbiAgICAgIC8vIHJlc3Bhd24gc2hpcFxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIC8vIHN0YWdlLmFkZENoaWxkKHNoaXApO1xuICAgICAgICBzdGFnZS5wdXRDZW50ZXIoc2hpcClcbiAgICAgICAgc2hpcC5yb3RhdGlvbiA9IDBcbiAgICAgICAgc2hpcC5kZXN0cm95ZWQgPSBmYWxzZVxuICAgICAgfSwgMTAwMClcbiAgICB9XG4gIH1cblxuICBpZiAoIXNoaXAuZGVzdHJveWVkKSB7XG4gICAgc2hpcC5yb3RhdGlvbiArPSBzaGlwLnJvdGF0aW9uU3BlZWRcblxuICAgIGlmIChzaGlwLm1vdmVGb3J3YXJkKSB7XG4gICAgICBzaGlwLnZ4ICs9IHNoaXAuYWNjZWxlcmF0aW9uWCAqIE1hdGguc2luKHNoaXAucm90YXRpb24pXG4gICAgICBzaGlwLnZ5ICs9IC1zaGlwLmFjY2VsZXJhdGlvblkgKiBNYXRoLmNvcyhzaGlwLnJvdGF0aW9uKVxuICAgIH0gZWxzZSB7XG4gICAgICBzaGlwLnZ4ICo9IHNoaXAuZnJpY3Rpb25cbiAgICAgIHNoaXAudnkgKj0gc2hpcC5mcmljdGlvblxuICAgIH1cblxuICAgIHNoaXAueCArPSBzaGlwLnZ4XG4gICAgc2hpcC55ICs9IHNoaXAudnlcblxuICAgIHdyYXAoc2hpcCwgc3RhZ2UubG9jYWxCb3VuZHMpXG4gIH1cblxuICBiZy54IC09IE1hdGguZmxvb3Ioc2hpcC52eClcbiAgYmcueSAtPSBNYXRoLmZsb29yKHNoaXAudnkpXG5cbiAgbWVzc2FnZS5jb250ZW50ID0gJ1Njb3JlczogJyArIHNjb3JlXG5cbiAgcmVuZGVyKGNhbnZhcylcbn1cbiJdfQ==
