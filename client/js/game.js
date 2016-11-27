(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

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
/* 
collision.js
============

This JavaScript file contains 6 collision functions:

- hitTestPoint
- hitTestCircle
- rectangleCollision
- circleCollision
- movingCircleCollision
- bounceOffSurface

To use them you'll need sprite objects with these minimum properties:

    x, y, center.x, center.y, width, height

For rectangular sprites, you need these additional properties:

    halfWidth, halfHeight

For circular sprites, you need these additional properties:

    diameter, radius

Optionally the sprites can include a mass property:

    mass

Mass should have a value greater than 1.

See the `sprite.js` file for an example of sprite prototype objects
that use these properties.

*/

/*
hitTestPoint
------------

Use it to find out if a point is touching a circlular or rectangular sprite.
Parameters: 
a. An object with `x` and `y` properties.
b. A sprite object with `x`, `y`, `centerX` and `centerY` properties.
If the sprite has a `radius` property, the function will interpret
the shape as a circle.
*/

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

  //Find out if the sprite is rectangular or circular depending
  //on whether it has a `radius` property
  if (sprite.radius) {
    shape = "circle";
  } else {
    shape = "rectangle";
  }

  //Rectangle
  if (shape === "rectangle") {
    //Get the position of the sprite's edges
    left = sprite.x;
    right = sprite.x + sprite.width;
    top = sprite.y;
    bottom = sprite.y + sprite.height;

    //Find out if the point is intersecting the rectangle
    hit = point.x > left && point.x < right && point.y > top && point.y < bottom;
  }

  //Circle
  if (shape === "circle") {
    //Find the distance between the point and the
    //center of the circle
    vx = point.x - sprite.centerX, vy = point.y - sprite.centerY, magnitude = Math.sqrt(vx * vx + vy * vy);

    //The point is intersecting the circle if the magnitude
    //(distance) is less than the circle's radius
    hit = magnitude < sprite.radius;
  }

  //`hit` will be either `true` or `false`
  return hit;
}

/*
hitTestCircle
-------------

Use it to find out if two circular sprites are touching.
Parameters: 
a. A sprite object with `centerX`, `centerY` and `radius` properties.
b. A sprite object with `centerX`, `centerY` and `radius`.
*/

function hitTestCircle(c1, c2) {
  var global = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

  var vx = void 0,
      vy = void 0,
      magnitude = void 0,
      combinedRadii = void 0,
      hit = void 0;

  //Calculate the vector between the circles’ center points
  if (global) {
    //Use global coordinates
    vx = c2.gx + c2.radius - (c1.gx + c1.radius);
    vy = c2.gy + c2.radius - (c1.gy + c1.radius);
  } else {
    //Use local coordinates
    vx = c2.centerX - c1.centerX;
    vy = c2.centerY - c1.centerY;
  }

  //Find the distance between the circles by calculating
  //the vector's magnitude (how long the vector is)
  magnitude = Math.sqrt(vx * vx + vy * vy);

  //Add together the circles' total radii
  combinedRadii = c1.radius + c2.radius;

  //Set `hit` to `true` if the distance between the circles is
  //less than their `combinedRadii`
  hit = magnitude < combinedRadii;

  //`hit` will be either `true` or `false`
  return hit;
};

/*
circleCollision
---------------

Use it to prevent a moving circular sprite from overlapping and optionally
bouncing off a non-moving circular sprite.
Parameters: 
a. A sprite object with `x`, `y` `centerX`, `centerY` and `radius` properties.
b. A sprite object with `x`, `y` `centerX`, `centerY` and `radius` properties.
c. Optional: true or false to indicate whether or not the first sprite
should bounce off the second sprite.
The sprites can contain an optional mass property that should be greater than 1.

*/

function circleCollision(c1, c2) {
  var bounce = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  var global = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;


  var magnitude = void 0,
      combinedRadii = void 0,
      overlap = void 0,
      vx = void 0,
      vy = void 0,
      dx = void 0,
      dy = void 0,
      s = {},
      hit = false;

  //Calculate the vector between the circles’ center points

  if (global) {
    //Use global coordinates
    vx = c2.gx + c2.radius - (c1.gx + c1.radius);
    vy = c2.gy + c2.radius - (c1.gy + c1.radius);
  } else {
    //Use local coordinates
    vx = c2.centerX - c1.centerX;
    vy = c2.centerY - c1.centerY;
  }

  //Find the distance between the circles by calculating
  //the vector's magnitude (how long the vector is)
  magnitude = Math.sqrt(vx * vx + vy * vy);

  //Add together the circles' combined half-widths
  combinedRadii = c1.radius + c2.radius;

  //Figure out if there's a collision
  if (magnitude < combinedRadii) {

    //Yes, a collision is happening
    hit = true;

    //Find the amount of overlap between the circles
    overlap = combinedRadii - magnitude;

    //Add some "quantum padding". This adds a tiny amount of space
    //between the circles to reduce their surface tension and make
    //them more slippery. "0.3" is a good place to start but you might
    //need to modify this slightly depending on the exact behaviour
    //you want. Too little and the balls will feel sticky, too much
    //and they could start to jitter if they're jammed together
    var quantumPadding = 0.3;
    overlap += quantumPadding;

    //Normalize the vector
    //These numbers tell us the direction of the collision
    dx = vx / magnitude;
    dy = vy / magnitude;

    //Move circle 1 out of the collision by multiplying
    //the overlap with the normalized vector and subtract it from
    //circle 1's position
    c1.x -= overlap * dx;
    c1.y -= overlap * dy;

    //Bounce
    if (bounce) {
      //Create a collision vector object, `s` to represent the bounce "surface".
      //Find the bounce surface's x and y properties
      //(This represents the normal of the distance vector between the circles)
      s.x = vy;
      s.y = -vx;

      //Bounce c1 off the surface
      bounceOffSurface(c1, s);
    }
  }
  return hit;
}

/*
movingCircleCollision
---------------------

Use it to make two moving circles bounce off each other.
Parameters: 
a. A sprite object with `x`, `y` `centerX`, `centerY` and `radius` properties.
b. A sprite object with `x`, `y` `centerX`, `centerY` and `radius` properties.
The sprites can contain an optional mass property that should be greater than 1.

*/

function movingCircleCollision(c1, c2) {
  var global = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;


  var combinedRadii = void 0,
      overlap = void 0,
      xSide = void 0,
      ySide = void 0,

  //`s` refers to the distance vector between the circles
  s = {},
      p1A = {},
      p1B = {},
      p2A = {},
      p2B = {},
      hit = false;

  //Apply mass, if the circles have mass properties
  c1.mass = c1.mass || 1;
  c2.mass = c2.mass || 1;

  //Calculate the vector between the circles’ center points
  if (global) {
    //Use global coordinates
    s.vx = c2.gx + c2.radius - (c1.gx + c1.radius);
    s.vy = c2.gy + c2.radius - (c1.gy + c1.radius);
  } else {
    //Use local coordinates
    s.vx = c2.centerX - c1.centerX;
    s.vy = c2.centerY - c1.centerY;
  }

  //Find the distance between the circles by calculating
  //the vector's magnitude (how long the vector is)
  s.magnitude = Math.sqrt(s.vx * s.vx + s.vy * s.vy);

  //Add together the circles' combined half-widths
  combinedRadii = c1.radius + c2.radius;

  //Figure out if there's a collision
  if (s.magnitude < combinedRadii) {

    //Yes, a collision is happening
    hit = true;

    //Find the amount of overlap between the circles
    overlap = combinedRadii - s.magnitude;

    //Add some "quantum padding" to the overlap
    overlap += 0.3;

    //Normalize the vector.
    //These numbers tell us the direction of the collision
    s.dx = s.vx / s.magnitude;
    s.dy = s.vy / s.magnitude;

    //Find the collision vector.
    //Divide it in half to share between the circles, and make it absolute
    s.vxHalf = Math.abs(s.dx * overlap / 2);
    s.vyHalf = Math.abs(s.dy * overlap / 2);

    //Find the side that the collision is occurring on
    c1.x > c2.x ? xSide = 1 : xSide = -1;
    c1.y > c2.y ? ySide = 1 : ySide = -1;

    //Move c1 out of the collision by multiplying
    //the overlap with the normalized vector and adding it to
    //the circles' positions
    c1.x = c1.x + s.vxHalf * xSide;
    c1.y = c1.y + s.vyHalf * ySide;

    //Move c2 out of the collision
    c2.x = c2.x + s.vxHalf * -xSide;
    c2.y = c2.y + s.vyHalf * -ySide;

    //1. Calculate the collision surface's properties

    //Find the surface vector's left normal
    s.lx = s.vy;
    s.ly = -s.vx;

    //2. Bounce c1 off the surface (s)

    //Find the dot product between c1 and the surface
    var dp1 = c1.vx * s.dx + c1.vy * s.dy;

    //Project c1's velocity onto the collision surface
    p1A.x = dp1 * s.dx;
    p1A.y = dp1 * s.dy;

    //Find the dot product of c1 and the surface's left normal (s.lx and s.ly)
    var dp2 = c1.vx * (s.lx / s.magnitude) + c1.vy * (s.ly / s.magnitude);

    //Project the c1's velocity onto the surface's left normal
    p1B.x = dp2 * (s.lx / s.magnitude);
    p1B.y = dp2 * (s.ly / s.magnitude);

    //3. Bounce c2 off the surface (s)

    //Find the dot product between c2 and the surface
    var dp3 = c2.vx * s.dx + c2.vy * s.dy;

    //Project c2's velocity onto the collision surface
    p2A.x = dp3 * s.dx;
    p2A.y = dp3 * s.dy;

    //Find the dot product of c2 and the surface's left normal (s.lx and s.ly)
    var dp4 = c2.vx * (s.lx / s.magnitude) + c2.vy * (s.ly / s.magnitude);

    //Project c2's velocity onto the surface's left normal
    p2B.x = dp4 * (s.lx / s.magnitude);
    p2B.y = dp4 * (s.ly / s.magnitude);

    //4. Calculate the bounce vectors

    //Bounce c1
    //using p1B and p2A
    c1.bounce = {};
    c1.bounce.x = p1B.x + p2A.x;
    c1.bounce.y = p1B.y + p2A.y;

    //Bounce c2
    //using p1A and p2B
    c2.bounce = {};
    c2.bounce.x = p1A.x + p2B.x;
    c2.bounce.y = p1A.y + p2B.y;

    //Add the bounce vector to the circles' velocity
    //and add mass if the circle has a mass property
    c1.vx = c1.bounce.x / c1.mass;
    c1.vy = c1.bounce.y / c1.mass;
    c2.vx = c2.bounce.x / c2.mass;
    c2.vy = c2.bounce.y / c2.mass;
  }
  return hit;
}

/*
multipleCircleCollision
-----------------------

Checks all the circles in an array for a collision against
all the other circles in an array, using `movingCircleCollision` (above)
*/

function multipleCircleCollision(arrayOfCircles) {
  var global = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  //marble collisions
  for (var i = 0; i < arrayOfCircles.length; i++) {
    //The first marble to use in the collision check
    var c1 = arrayOfCircles[i];
    for (var j = i + 1; j < arrayOfCircles.length; j++) {
      //The second marble to use in the collision check
      var c2 = arrayOfCircles[j];
      //Check for a collision and bounce the marbles apart if
      //they collide. Use an optional mass property on the sprite
      //to affect the bounciness of each marble
      movingCircleCollision(c1, c2, global);
    }
  }
}

/*
hitTestRectangle
----------------

Use it to find out if two rectangular sprites are touching.
Parameters: 
a. A sprite object with `centerX`, `centerY`, `halfWidth` and `halfHeight` properties.
b. A sprite object with `centerX`, `centerY`, `halfWidth` and `halfHeight` properties.

*/

function hitTestRectangle(r1, r2) {
  var global = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

  var hit = void 0,
      combinedHalfWidths = void 0,
      combinedHalfHeights = void 0,
      vx = void 0,
      vy = void 0;

  //A variable to determine whether there's a collision
  hit = false;

  //Calculate the distance vector
  if (global) {
    vx = r1.gx + r1.halfWidth - (r2.gx + r2.halfWidth);
    vy = r1.gy + r1.halfHeight - (r2.gy + r2.halfHeight);
  } else {
    vx = r1.centerX - r2.centerX;
    vy = r1.centerY - r2.centerY;
  }

  //Figure out the combined half-widths and half-heights
  combinedHalfWidths = r1.halfWidth + r2.halfWidth;
  combinedHalfHeights = r1.halfHeight + r2.halfHeight;

  //Check for a collision on the x axis
  if (Math.abs(vx) < combinedHalfWidths) {

    //A collision might be occuring. Check for a collision on the y axis
    if (Math.abs(vy) < combinedHalfHeights) {

      //There's definitely a collision happening
      hit = true;
    } else {

      //There's no collision on the y axis
      hit = false;
    }
  } else {

    //There's no collision on the x axis
    hit = false;
  }

  //`hit` will be either `true` or `false`
  return hit;
}

/*
rectangleCollision
------------------

Use it to prevent two rectangular sprites from overlapping. 
Optionally, make the first rectangle bounce off the second rectangle.
Parameters: 
a. A sprite object with `x`, `y` `centerX`, `centerY`, `halfWidth` and `halfHeight` properties.
b. A sprite object with `x`, `y` `centerX`, `centerY`, `halfWidth` and `halfHeight` properties.
c. Optional: true or false to indicate whether or not the first sprite
should bounce off the second sprite.
*/

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

  //Calculate the distance vector
  if (global) {
    vx = r1.gx + r1.halfWidth - (r2.gx + r2.halfWidth);
    vy = r1.gy + r1.halfHeight - (r2.gy + r2.halfHeight);
  } else {
    vx = r1.centerX - r2.centerX;
    vy = r1.centerY - r2.centerY;
  }

  //Figure out the combined half-widths and half-heights
  combinedHalfWidths = r1.halfWidth + r2.halfWidth;
  combinedHalfHeights = r1.halfHeight + r2.halfHeight;

  //Check whether vx is less than the combined half widths
  if (Math.abs(vx) < combinedHalfWidths) {

    //A collision might be occurring!
    //Check whether vy is less than the combined half heights
    if (Math.abs(vy) < combinedHalfHeights) {

      //A collision has occurred! This is good!
      //Find out the size of the overlap on both the X and Y axes
      overlapX = combinedHalfWidths - Math.abs(vx);
      overlapY = combinedHalfHeights - Math.abs(vy);

      //The collision has occurred on the axis with the
      //*smallest* amount of overlap. Let's figure out which
      //axis that is

      if (overlapX >= overlapY) {
        //The collision is happening on the X axis
        //But on which side? vy can tell us

        if (vy > 0) {
          collision = "top";
          //Move the rectangle out of the collision
          r1.y = r1.y + overlapY;
        } else {
          collision = "bottom";
          //Move the rectangle out of the collision
          r1.y = r1.y - overlapY;
        }

        //Bounce
        if (bounce) {
          r1.vy *= -1;

          /*Alternative
          //Find the bounce surface's vx and vy properties
          var s = {};
          s.vx = r2.x - r2.x + r2.width;
          s.vy = 0;
           //Bounce r1 off the surface
          //bounceOffSurface(r1, s);
          */
        }
      } else {
        //The collision is happening on the Y axis
        //But on which side? vx can tell us

        if (vx > 0) {
          collision = "left";
          //Move the rectangle out of the collision
          r1.x = r1.x + overlapX;
        } else {
          collision = "right";
          //Move the rectangle out of the collision
          r1.x = r1.x - overlapX;
        }

        //Bounce
        if (bounce) {
          r1.vx *= -1;

          /*Alternative
          //Find the bounce surface's vx and vy properties
          var s = {};
          s.vx = 0;
          s.vy = r2.y - r2.y + r2.height;
           //Bounce r1 off the surface
          bounceOffSurface(r1, s);
          */
        }
      }
    } else {
        //No collision
      }
  } else {}
    //No collision


    //Return the collision string. it will be either "top", "right",
    //"bottom", or "left" depending on which side of r1 is touching r2.
  return collision;
}

/*
hitTestCircleRectangle
----------------

Use it to find out if a circular shape is touching a rectangular shape
Parameters: 
a. A sprite object with `centerX`, `centerY`, `halfWidth` and `halfHeight` properties.
b. A sprite object with `centerX`, `centerY`, `halfWidth` and `halfHeight` properties.

*/

function hitTestCircleRectangle(c1, r1) {
  var global = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;


  var region = void 0,
      collision = void 0,
      c1x = void 0,
      c1y = void 0,
      r1x = void 0,
      r1y = void 0;

  //Use either global or local coordinates
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

  //Is the circle above the rectangle's top edge?
  if (c1y < r1y - r1.halfHeight) {

    //If it is, we need to check whether it's in the 
    //top left, top center or top right
    //(Increasing the size of the region by 2 pixels slightly weights
    //the text in favor of a rectangle vs. rectangle collision test.
    //This gives a more natural looking result with corner collisions
    //when physics is added)
    if (c1x < r1x - 1 - r1.halfWidth) {
      region = "topLeft";
    } else if (c1x > r1x + 1 + r1.halfWidth) {
      region = "topRight";
    } else {
      region = "topMiddle";
    }
  }

  //The circle isn't above the top edge, so it might be
  //below the bottom edge
  else if (c1y > r1y + r1.halfHeight) {

      //If it is, we need to check whether it's in the bottom left,
      //bottom center, or bottom right
      if (c1x < r1x - 1 - r1.halfWidth) {
        region = "bottomLeft";
      } else if (c1x > r1x + 1 + r1.halfWidth) {
        region = "bottomRight";
      } else {
        region = "bottomMiddle";
      }
    }

    //The circle isn't above the top edge or below the bottom edge,
    //so it must be on the left or right side
    else {
        if (c1x < r1x - r1.halfWidth) {
          region = "leftMiddle";
        } else {
          region = "rightMiddle";
        }
      }

  //Is this the circle touching the flat sides
  //of the rectangle?
  if (region === "topMiddle" || region === "bottomMiddle" || region === "leftMiddle" || region === "rightMiddle") {

    //Yes, it is, so do a standard rectangle vs. rectangle collision test
    collision = hitTestRectangle(c1, r1, global);
  }

  //The circle is touching one of the corners, so do a
  //circle vs. point collision test
  else {
      var point = {};

      switch (region) {
        case "topLeft":
          point.x = r1x;
          point.y = r1y;
          break;

        case "topRight":
          point.x = r1x + r1.width;
          point.y = r1y;
          break;

        case "bottomLeft":
          point.x = r1x;
          point.y = r1y + r1.height;
          break;

        case "bottomRight":
          point.x = r1x + r1.width;
          point.y = r1y + r1.height;
      }

      //Check for a collision between the circle and the point
      collision = hitTestCirclePoint(c1, point, global);
    }

  //Return the result of the collision.
  //The return value will be `undefined` if there's no collision
  if (collision) {
    return region;
  } else {
    return collision;
  }
}

/*
hitTestCirclePoint
------------------

Use it to find out if a circular shape is touching a point
Parameters: 
a. A sprite object with `centerX`, `centerY`, and `radius` properties.
b. A point object with `x` and `y` properties.

*/

function hitTestCirclePoint(c1, point) {
  var global = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

  //A point is just a circle with a diameter of
  //1 pixel, so we can cheat. All we need to do is an ordinary circle vs. circle
  //Collision test. Just supply the point with the properties
  //it needs
  point.diameter = 1;
  point.radius = 0.5;
  point.centerX = point.x;
  point.centerY = point.y;
  point.gx = point.x;
  point.gy = point.y;
  return hitTestCircle(c1, point, global);
}

/*
circleRectangleCollision
------------------------

Use it to bounce a circular shape off a rectangular shape
Parameters: 
a. A sprite object with `centerX`, `centerY`, `halfWidth` and `halfHeight` properties.
b. A sprite object with `centerX`, `centerY`, `halfWidth` and `halfHeight` properties.

*/

function circleRectangleCollision(c1, r1) {
  var bounce = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  var global = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;


  var region = void 0,
      collision = void 0,
      c1x = void 0,
      c1y = void 0,
      r1x = void 0,
      r1y = void 0;

  //Use either the global or local coordinates
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

  //Is the circle above the rectangle's top edge?
  if (c1y < r1y - r1.halfHeight) {
    //If it is, we need to check whether it's in the 
    //top left, top center or top right
    if (c1x < r1x - 1 - r1.halfWidth) {
      region = "topLeft";
    } else if (c1x > r1x + 1 + r1.halfWidth) {
      region = "topRight";
    } else {
      region = "topMiddle";
    }
  }

  //The circle isn't above the top edge, so it might be
  //below the bottom edge
  else if (c1y > r1y + r1.halfHeight) {
      //If it is, we need to check whether it's in the bottom left,
      //bottom center, or bottom right
      if (c1x < r1x - 1 - r1.halfWidth) {
        region = "bottomLeft";
      } else if (c1x > r1x + 1 + r1.halfWidth) {
        region = "bottomRight";
      } else {
        region = "bottomMiddle";
      }
    }

    //The circle isn't above the top edge or below the bottom edge,
    //so it must be on the left or right side
    else {
        if (c1x < r1x - r1.halfWidth) {
          region = "leftMiddle";
        } else {
          region = "rightMiddle";
        }
      }

  //Is this the circle touching the flat sides
  //of the rectangle?
  if (region === "topMiddle" || region === "bottomMiddle" || region === "leftMiddle" || region === "rightMiddle") {

    //Yes, it is, so do a standard rectangle vs. rectangle collision test
    collision = rectangleCollision(c1, r1, bounce, global);
  }

  //The circle is touching one of the corners, so do a
  //circle vs. point collision test
  else {
      var point = {};

      switch (region) {
        case "topLeft":
          point.x = r1x;
          point.y = r1y;
          break;

        case "topRight":
          point.x = r1x + r1.width;
          point.y = r1y;
          break;

        case "bottomLeft":
          point.x = r1x;
          point.y = r1y + r1.height;
          break;

        case "bottomRight":
          point.x = r1x + r1.width;
          point.y = r1y + r1.height;
      }

      //Check for a collision between the circle and the point
      collision = circlePointCollision(c1, point, bounce, global);
    }

  if (collision) {
    return region;
  } else {
    return collision;
  }
}

/*
circlePointCollision
--------------------

Use it to boucnce a circle off a point.
Parameters: 
a. A sprite object with `centerX`, `centerY`, and `radius` properties.
b. A point object with `x` and `y` properties.

*/

function circlePointCollision(c1, point) {
  var bounce = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  var global = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

  //A point is just a circle with a diameter of
  //1 pixel, so we can cheat. All we need to do is an ordinary circle vs. circle
  //Collision test. Just supply the point with the properties
  //it needs
  point.diameter = 1;
  point.radius = 0.5;
  point.centerX = point.x;
  point.centerY = point.y;
  point.gx = point.x;
  point.gy = point.y;
  return circleCollision(c1, point, bounce, global);
}
/*
bounceOffSurface
----------------

Use this to bounce an object off another object.
Parameters: 
a. An object with `v.x` and `v.y` properties. This represents the object that is colliding
with a surface.
b. An object with `x` and `y` properties. This represents the surface that the object
is colliding into.
The first object can optionally have a mass property that's greater than 1. The mass will
be used to dampen the bounce effect.
*/

function bounceOffSurface(o, s) {
  var dp1 = void 0,
      dp2 = void 0,
      p1 = {},
      p2 = {},
      bounce = {},
      mass = o.mass || 1;

  //1. Calculate the collision surface's properties
  //Find the surface vector's left normal
  s.lx = s.y;
  s.ly = -s.x;

  //Find its magnitude
  s.magnitude = Math.sqrt(s.x * s.x + s.y * s.y);

  //Find its normalized values
  s.dx = s.x / s.magnitude;
  s.dy = s.y / s.magnitude;

  //2. Bounce the object (o) off the surface (s)

  //Find the dot product between the object and the surface
  dp1 = o.vx * s.dx + o.vy * s.dy;

  //Project the object's velocity onto the collision surface
  p1.vx = dp1 * s.dx;
  p1.vy = dp1 * s.dy;

  //Find the dot product of the object and the surface's left normal (s.lx and s.ly)
  dp2 = o.vx * (s.lx / s.magnitude) + o.vy * (s.ly / s.magnitude);

  //Project the object's velocity onto the surface's left normal
  p2.vx = dp2 * (s.lx / s.magnitude);
  p2.vy = dp2 * (s.ly / s.magnitude);

  //Reverse the projection on the surface's left normal
  p2.vx *= -1;
  p2.vy *= -1;

  //Add up the projections to create a new bounce vector
  bounce.x = p1.vx + p2.vx;
  bounce.y = p1.vy + p2.vy;

  //Assign the bounce vector to the object's velocity
  //with optional mass to dampen the effect
  o.vx = bounce.x / mass;
  o.vy = bounce.y / mass;
}

/*
hit
---
A convenient universal collision function to test for collisions
between rectangles, circles, and points.
*/

function hit(a, b) {
  var react = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  var bounce = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
  var global = arguments[4];
  var extra = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : undefined;

  var collision = void 0,
      aIsASprite = a.parent !== undefined,
      bIsASprite = b.parent !== undefined;

  //Check to make sure one of the arguments isn't an array
  if (aIsASprite && b instanceof Array || bIsASprite && a instanceof Array) {
    //If it is, check for a collision between a sprite and an array
    spriteVsArray();
  } else {
    //If one of the arguments isn't an array, find out what type of
    //collision check to run
    collision = findCollisionType(a, b);
    if (collision && extra) extra(collision);
  }

  //Return the result of the collision.
  //It will be `undefined` if there's no collision and `true` if 
  //there is a collision. `rectangleCollision` sets `collsision` to
  //"top", "bottom", "left" or "right" depeneding on which side the
  //collision is occuring on
  return collision;

  function findCollisionType(a, b) {
    //Are `a` and `b` both sprites?
    //(We have to check again if this function was called from
    //`spriteVsArray`)
    var aIsASprite = a.parent !== undefined;
    var bIsASprite = b.parent !== undefined;

    if (aIsASprite && bIsASprite) {
      //Yes, but what kind of sprites?
      if (a.diameter && b.diameter) {
        //They're circles
        return circleVsCircle(a, b);
      } else if (a.diameter && !b.diameter) {
        //The first one is a circle and the second is a rectangle
        return circleVsRectangle(a, b);
      } else {
        //They're rectangles
        return rectangleVsRectangle(a, b);
      }
    }
    //They're not both sprites, so what are they?
    //Is `a` not a sprite and does it have x and y properties?
    else if (bIsASprite && !(a.x === undefined) && !(a.y === undefined)) {
        //Yes, so this is a point vs. sprite collision test
        return hitTestPoint(a, b);
      } else {
        //The user is trying to test some incompatible objects
        throw new Error("I'm sorry, " + a + " and " + b + " cannot be use together in a collision test.'");
      }
  }

  function spriteVsArray() {
    //If `a` happens to be the array, flip it around so that it becomes `b`
    if (a instanceof Array) {
      var _ref = [_b, _a],
          _a = _ref[0],
          _b = _ref[1];
    }
    //Loop through the array in reverse
    for (var i = b.length - 1; i >= 0; i--) {
      var sprite = b[i];
      collision = findCollisionType(a, sprite);
      if (collision && extra) extra(collision, sprite);
    }
  }

  function circleVsCircle(a, b) {
    //If the circles shouldn't react to the collision,
    //just test to see if they're touching
    if (!react) {
      return hitTestCircle(a, b);
    }
    //Yes, the circles should react to the collision
    else {
        //Are they both moving?
        if (a.vx + a.vy !== 0 && b.vx + b.vy !== 0) {
          //Yes, they are both moving
          //(moving circle collisions always bounce apart so there's
          //no need for the third, `bounce`, argument)
          return movingCircleCollision(a, b, global);
        } else {
          //No, they're not both moving
          return circleCollision(a, b, bounce, global);
        }
      }
  }

  function rectangleVsRectangle(a, b) {
    //If the rectangles shouldn't react to the collision, just
    //test to see if they're touching
    if (!react) {
      return hitTestRectangle(a, b, global);
    } else {
      return rectangleCollision(a, b, bounce, global);
    }
  }

  function circleVsRectangle(a, b) {
    //If the rectangles shouldn't react to the collision, just
    //test to see if they're touching
    if (!react) {
      return hitTestCircleRectangle(a, b, global);
    } else {
      return circleRectangleCollision(a, b, bounce, global);
    }
  }
}

},{}],2:[function(require,module,exports){
"use strict";

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
        this.shadowColor = "rgba(100, 100, 100, 0.5)";
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
        key: "addChild",


        // Children manipulation
        value: function addChild(sprite) {
            if (sprite.parent) {
                sprite.parent.removeChild(sprite);
            }
            sprite.parent = this;
            this.children.push(sprite);
        }
    }, {
        key: "removeChild",
        value: function removeChild(sprite) {
            if (sprite.parent === this) {
                this.children.splice(this.children.indexOf(sprite), 1);
            } else {
                throw new Error(sprite + " is not a child of " + this);
            }
        }
    }, {
        key: "swapChildren",
        value: function swapChildren(child1, child2) {
            var index1 = this.children.indexOf(child1),
                index2 = this.children.indexOf(child2);

            if (index1 !== -1 && index2 !== -1) {
                child1.childIndex = index2;
                child2.childIndex = index1;

                this.children[index1] = child2;
                this.children[index2] = child1;
            } else {
                throw new Error("Both objects must be a child of the caller " + this);
            }
        }
    }, {
        key: "add",
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
        key: "remove",
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
        key: "setPosition",
        value: function setPosition(x, y) {
            this.x = x;
            this.y = y;
        }
    }, {
        key: "putCenter",


        // position helpers
        value: function putCenter(b) {
            var xOffset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
            var yOffset = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

            var a = this;
            b.x = a.x + a.halfWidth - b.halfWidth + xOffset;
            b.y = a.y + a.halfHeight - b.halfHeight + yOffset;
        }
    }, {
        key: "putTop",
        value: function putTop(b) {
            var xOffset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
            var yOffset = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

            var a = this;
            b.x = a.x + a.halfWidth - b.halfWidth + xOffset;
            b.y = a.y - b.height + yOffset;
        }
    }, {
        key: "putBottom",
        value: function putBottom(b) {
            var xOffset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
            var yOffset = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

            var a = this;
            b.x = a.x + a.halfWidth - b.halfWidth + xOffset;
            b.y = a.y + a.height + yOffset;
        }
    }, {
        key: "putRight",
        value: function putRight(b) {
            var xOffset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
            var yOffset = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

            var a = this;
            b.x = a.x + a.width + xOffset;
            b.y = a.y + a.halfHeight - b.halfHeight + yOffset;
        }
    }, {
        key: "putLeft",
        value: function putLeft(b) {
            var xOffset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
            var yOffset = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

            var a = this;
            b.x = a.x - b.width + xOffset;
            b.y = a.y + a.halfHeight - b.halfHeight + yOffset;
        }

        // animation helpers

    }, {
        key: "gx",
        get: function get() {
            if (this.parent) {
                return this.x + this.parent.gx;
            } else {
                return this.x;
            }
        }
    }, {
        key: "gy",
        get: function get() {
            if (this.parent) {
                return this.y + this.parent.gy;
            } else {
                return this.y;
            }
        }

        // Depth layer

    }, {
        key: "layer",
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
        key: "empty",
        get: function get() {
            if (this.children.length === 0) {
                return true;
            } else {
                return false;
            }
        }
    }, {
        key: "halfWidth",
        get: function get() {
            return this.width / 2;
        }
    }, {
        key: "halfHeight",
        get: function get() {
            return this.height / 2;
        }
    }, {
        key: "centerX",
        get: function get() {
            return this.x + this.halfWidth;
        }
    }, {
        key: "centerY",
        get: function get() {
            return this.y + this.halfHeight;
        }

        // ...

    }, {
        key: "position",
        get: function get() {
            return { x: this.x, y: this.y };
        }
    }, {
        key: "localBounds",
        get: function get() {
            return {
                x: 0,
                y: 0,
                width: this.width,
                height: this.height
            };
        }
    }, {
        key: "globalBounds",
        get: function get() {
            return {
                x: this.gx,
                y: this.gy,
                width: this.gx + this.width,
                height: this.gy + this.height
            };
        }
    }, {
        key: "currentFrame",
        get: function get() {
            return this._currentFrame;
        }

        // circular

    }, {
        key: "circular",
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

                        enumerable: true, configurable: true
                    },
                    radius: {
                        get: function get() {
                            return this.halfWidth;
                        },
                        set: function set(value) {
                            this.width = value * 2;
                            this.height = value * 2;
                        },

                        enumerable: true, configurable: true
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
        key: "draggable",
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
        key: "interactive",
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
    var border = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "1px dashed black";
    var backgroundColor = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "white";

    var canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    canvas.style.border = border;
    canvas.style.backgroundColor = backgroundColor;
    document.body.appendChild(canvas);

    canvas.ctx = canvas.getContext("2d");

    return canvas;
}

function render(canvas) {
    var ctx = canvas.ctx;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //draw background
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

            if (sprite.render) sprite.render(ctx);

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

            if (sprite.render) sprite.render(ctx);

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
        var fillStyle = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "gray";
        var strokeStyle = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "none";
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
        key: "render",
        value: function render(ctx) {
            ctx.strokeStyle = this.strokeStyle;
            ctx.lineWidth = this.lineWidth;
            ctx.fillStyle = this.fillStyle;

            ctx.beginPath();
            ctx.rect(-this.width * this.pivotX, -this.height * this.pivotY, this.width, this.height);

            if (this.strokeStyle !== "none") ctx.stroke();
            if (this.fillStyle !== "none") ctx.fill();
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
        var fillStyle = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "gray";
        var strokeStyle = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "none";
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
        key: "render",
        value: function render(ctx) {
            ctx.strokeStyle = this.strokeStyle;
            ctx.lineWidth = this.lineWidth;
            ctx.fillStyle = this.fillStyle;

            ctx.beginPath();
            ctx.arc(this.radius + -this.diameter * this.pivotX, this.radius + -this.diameter * this.pivotY, this.radius, 0, 2 * Math.PI, false);

            if (this.strokeStyle !== "none") ctx.stroke();
            if (this.fillStyle !== "none") ctx.fill();
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
        var strokeStyle = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "none";
        var lineWidth = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
        var ax = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
        var ay = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
        var bx = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 32;
        var by = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 32;

        _classCallCheck(this, Line);

        var _this5 = _possibleConstructorReturn(this, (Line.__proto__ || Object.getPrototypeOf(Line)).call(this));

        Object.assign(_this5, { strokeStyle: strokeStyle, lineWidth: lineWidth, ax: ax, ay: ay, bx: bx, by: by });

        _this5.lineJoin = "round";
        return _this5;
    }

    _createClass(Line, [{
        key: "render",
        value: function render(ctx) {
            ctx.strokeStyle = this.strokeStyle;
            ctx.lineWidth = this.lineWidth;

            ctx.beginPath();
            ctx.moveTo(this.ax, this.ay);
            ctx.lineTo(this.bx, this.by);

            if (this.strokeStyle !== "none") ctx.stroke();
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
        var content = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "Hello!";
        var font = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "12px sans-serif";
        var fillStyle = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "red";
        var x = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
        var y = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;

        _classCallCheck(this, Text);

        var _this6 = _possibleConstructorReturn(this, (Text.__proto__ || Object.getPrototypeOf(Text)).call(this));

        Object.assign(_this6, { content: content, font: font, fillStyle: fillStyle, x: x, y: y });

        _this6.textBaseline = "top";
        _this6.strokeText = "none";
        return _this6;
    }

    _createClass(Text, [{
        key: "render",
        value: function render(ctx) {
            ctx.font = this.font;
            ctx.strokeStyle = this.strokeStyle;
            ctx.lineWidth = this.lineWidth;
            ctx.fillStyle = this.fillStyle;

            if (this.width === 0) this.width = ctx.measureText(this.content).width;
            if (this.height === 0) this.height = ctx.measureText("M").width;

            ctx.translate(-this.width * this.pivotX, -this.height * this.pivotY);

            ctx.textBaseline = this.textBaseline;

            ctx.fillText(this.content, 0, 0);

            if (this.strokeText !== "none") ctx.stroke();
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
        key: "addChild",
        value: function addChild(sprite) {
            if (sprite.parent) {
                sprite.parent.removeChild(sprite);
            }
            sprite.parent = this;
            this.children.push(sprite);

            this.calculateSize();
        }
    }, {
        key: "removeChild",
        value: function removeChild(sprite) {
            if (sprite.parent === this) {
                this.children.splice(this.children.indexOf(sprite), 1);
                this.calculateSize();
            } else {
                throw new Error(sprite + " is not child of " + this);
            }
        }
    }, {
        key: "calculateSize",
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
                throw new Error("The image sources in " + source + " are not recognized");
            }
        } else {
            throw new Error("The image source " + source + " is not recognized");
        }
        return _this9;
    }

    _createClass(Sprite, [{
        key: "createFromImage",
        value: function createFromImage(source) {
            if (!(source instanceof Image)) {
                throw new Error(source + " is not an image object");
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
        key: "createFromAtlas",
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
        key: "createFromTileset",
        value: function createFromTileset(source) {
            if (!(source.image instanceof Image)) {
                throw new Error(source.image + " is not an image object");
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
        key: "createFromTilesetFrames",
        value: function createFromTilesetFrames(source) {
            if (!(source.image instanceof Image)) {
                throw new Error(source.image + " is not an image object");
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
        key: "createFromAtlasFrames",
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
        key: "createFromImages",
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
        key: "gotoAndStop",
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
                throw new Error("Frame number " + frameNumber + " does not exists!");
            }
        }
    }, {
        key: "render",
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

    var columns = image.width / frameWidth,
        rows = image.height / frameHeight;

    var numberOfFrames = columns * rows;

    for (var i = 0; i < numberOfFrames; i++) {
        var x = i % columns * frameWidth,
            y = Math.floor(i / columns) * frameHeight;

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

    o.state = "up";

    o.action = "";

    o.pressed = false;
    o.hoverOver = false;

    o.update = function (pointer) {
        var hit = pointer.hitTestSprite(o);

        if (pointer.isUp) {
            o.state = "up";
            if (o instanceof Button) o.gotoAndStop(0);
        }

        if (hit) {
            o.state = "over";

            if (o.frames && o.frames.length === 3 && o instanceof Button) {
                o.gotoAndStop(1);
            }

            if (pointer.isDown) {
                o.state = "down";

                if (o instanceof Button) {
                    if (o.frames.length === 3) {
                        o.gotoAndStop(2);
                    } else {
                        o.gotoAndStop(1);
                    }
                }
            }
        }

        if (o.state === "down") {
            if (!o.pressed) {
                if (o.press) o.press();
                o.pressed = true;
                o.action = "pressed";
            }
        }

        if (o.state === "over") {
            if (o.pressed) {
                if (o.release) o.release();
                o.pressed = false;
                o.action = "released";

                if (pointer.tapped && o.tap) o.tap();
            }

            if (!o.hoverOver) {
                if (o.over) o.over();
                o.hoverOver = true;
            }
        }

        if (o.state === "up") {
            if (o.pressed) {
                if (o.release) o.release();
                o.pressed = false;
                o.action = "released";
            }

            if (o.hoverOver) {
                if (o.out) o.out();
                o.hoverOver = false;
            }
        }
    };
}

function addStatePlayer(sprite) {
    var frameCounter = 0,
        numberOfFrames = 0,
        startFrame = 0,
        endFrame = 0,
        timeInterval = undefined;

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
        return circle(10, "red");
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
    },
        randomInt = function randomInt(min, max) {
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
    var emitter = {},
        timerInterval = undefined;

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
            var x = i % columns * cellWidth,
                y = Math.floor(i / columns) * cellHeight;

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

    var container = rectangle(width, height, "none", "none");
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

            enumerable: true, configurable: true
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

            enumerable: true, configurable: true
        }
    });

    return container;
}

var stageBackground = undefined;

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
        key: "render",
        value: function render(ctx) {
            if (!this.pattern) {
                this.pattern = ctx.createPattern(this.source, "repeat");
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
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.keyboard = keyboard;
exports.makePointer = makePointer;
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

    window.addEventListener("keydown", key.downHandler.bind(key), false);
    window.addEventListener("keyup", key.upHandler.bind(key), false);

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
                var left = sprite.gx,
                    right = sprite.gx + sprite.width,
                    top = sprite.gy,
                    bottom = sprite.gy + sprite.height;

                hit = this.x > left && this.x < right && this.y > top && this.y < bottom;
            } else {
                var vx = this.x - (sprite.gx + sprite.radius),
                    vy = this.y - (sprite.gy + sprite.radius),
                    distance = Math.sqrt(vx * vx + vy * vy);

                hit = distance < sprite.radius;
            }

            return hit;
        },
        updateDragAndDrop: function updateDragAndDrop(sprite) {
            var _this = this;

            if (this.isDown) {
                if (this.dragSprite === null) {
                    for (var i = draggableSprites.length - 1; i > -1; i--) {
                        var _sprite = draggableSprites[i];

                        if (this.hitTestSprite(_sprite) && _sprite.draggable) {
                            this.dragOffsetX = this.x - _sprite.gx;
                            this.dragOffsetY = this.y - _sprite.gy;

                            this.dragSprite = _sprite;

                            // reorder sprites to display dragged sprite above all
                            var children = _sprite.parent.children;
                            children.splice(children.indexOf(_sprite), 1);
                            children.push(_sprite);

                            // reorder draggableSprites in the same way
                            draggableSprites.splice(draggableSprites.indexOf(_sprite), 1);
                            draggableSprites.push(_sprite);
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
            draggableSprites.some(function (sprite) {
                if (_this.hitTestSprite(sprite) && sprite.draggable) {
                    _this.element.style.cursor = "pointer";
                    return true;
                } else {
                    _this.element.style.cursor = "auto";
                    return false;
                }
            });
        }
    };

    element.addEventListener("mousemove", pointer.moveHandler.bind(pointer), false);

    element.addEventListener("mousedown", pointer.downHandler.bind(pointer), false);

    element.addEventListener("mouseup", pointer.upHandler.bind(pointer), false);

    element.addEventListener("touchmove", pointer.touchMoveHandler.bind(pointer), false);

    element.addEventListener("touchstart", pointer.touchStartHandler.bind(pointer), false);

    element.addEventListener("touchend", pointer.touchEndHandler.bind(pointer), false);

    element.style.touchAction = "none";

    return pointer;
}

},{}],4:[function(require,module,exports){
"use strict";

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
        key: "load",
        value: function load() {
            var _this = this;

            var xhr = new XMLHttpRequest();
            xhr.open("GET", this.source, true);
            xhr.responseType = "arraybuffer";
            xhr.addEventListener("load", function () {
                _this.actx.decodeAudioData(xhr.response, function (buffer) {
                    _this.buffer = buffer;
                    _this.hasLoaded = true;

                    if (_this.loadHandler) {
                        _this.loadHandler();
                    }
                }, function (error) {
                    throw new Error("Audio could not be decoded: " + error);
                });
            });

            xhr.send();
        }
    }, {
        key: "play",
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
        key: "pause",
        value: function pause() {
            if (this.playing) {
                this.soundNode.stop(this.actx.currentTime);
                this.startOffset += this.actx.currentTime - this.startTime;
                this.playing = false;
            }
        }
    }, {
        key: "restart",
        value: function restart() {
            if (this.playing) {
                this.soundNode.stop(this.actx.currentTime);
            }
            this.startOffset = 0;
            this.play();
        }
    }, {
        key: "playFrom",
        value: function playFrom(value) {
            if (this.playing) {
                this.soundNode.stop(this.actx.currentTime);
            }
            this.startOffset = value;
            this.play();
        }
    }, {
        key: "volume",
        get: function get() {
            return this.volumeValue;
        },
        set: function set(value) {
            this.volumeNode.gain.value = value;
            this.volumeValue = value;
        }
    }, {
        key: "pan",
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
"use strict";

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

var _sound = require("./sound");

var assets = exports.assets = {
    toLoad: 0,
    loaded: 0,

    imageExtensions: ["png", "jpg", "gif"],
    fontExtensions: ["ttf", "otf", "ttc", "woff"],
    jsonExtensions: ["json"],
    audioExtensions: ["mp3", "ogg", "wav", "webm"],

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
                    console.log("Assets loaded!");

                    resolve();
                }
            };

            console.log("Loading assets...");

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
                    console.log("File type not recognized: " + source);
                }
            });
        });
    },
    loadImage: function loadImage(source, loadHandler) {
        var image = new Image();
        image.addEventListener("load", loadHandler, false);
        this[source] = image;
        image.src = source;
    },
    loadFont: function loadFont(source, loadHandler) {
        var fontFamily = source.split('/').pop().split('.')[0];

        var newStyle = document.createElement("style");
        var fontFace = "@font-face {font-family: '" + fontFamily + "'; src: url('" + source + "');}";

        newStyle.appendChild(document.createTextNode(fontFace));
        document.head.appendChild(newStyle);

        loadHandler();
    },
    loadJson: function loadJson(source, loadHandler) {
        var _this2 = this;

        var xhr = new XMLHttpRequest();
        xhr.open("GET", source, true);
        xhr.responseType = "text";

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

        var baseUrl = source.replace(/[^/]*$/, "");
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
        image.addEventListener("load", imageLoadHandler, false);
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

    var x = bounds.x,
        y = bounds.y,
        width = bounds.width,
        height = bounds.height;

    var collision = void 0;

    if (sprite.x < x) {
        if (bounce) sprite.vx *= -1;
        if (sprite.mass) sprite.vx /= sprite.mass;

        sprite.x = x;
        collision = "left";
    }

    if (sprite.y < y) {
        if (bounce) sprite.vy *= -1;
        if (sprite.mass) sprite.vy /= sprite.mass;

        sprite.y = y;
        collision = "top";
    }

    if (sprite.x + sprite.width > width) {
        if (bounce) sprite.vx *= -1;
        if (sprite.mass) sprite.vx /= sprite.mass;

        sprite.x = width - sprite.width;
        collision = "right";
    }

    if (sprite.y + sprite.height > height) {
        if (bounce) sprite.vy *= -1;
        if (sprite.mass) sprite.vy /= sprite.mass;

        sprite.y = height - sprite.height;
        collision = "bottom";
    }

    if (collision && extra) extra(collision);

    return collision;
}

function outsideBounds(sprite, bounds) {
    var extra = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;

    var x = bounds.x,
        y = bounds.y,
        width = bounds.width,
        height = bounds.height;

    var collision = void 0;

    if (sprite.x < x - sprite.width) {
        collision = "left";
    }
    if (sprite.y < y - sprite.height) {
        collision = "top";
    }
    if (sprite.x > width) {
        collision = "right";
    }
    if (sprite.y > height) {
        collision = "bottom";
    }

    if (collision && extra) extra(collision);

    return collision;
}

function wrap(sprite, bounds) {
    var width = bounds.width,
        height = bounds.height;

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
    var vx = s2.centerX - s1.centerX,
        vy = s2.centerY - s1.centerY;

    return Math.sqrt(vx * vx + vy * vy);
}

function followEase(follower, leader, speed) {
    var vx = leader.centerX - follower.centerX,
        vy = leader.centerY - follower.centerY,
        distance = Math.sqrt(vx * vx + vy * vy);
    if (distance >= 1) {
        follower.x += vx * speed;
        follower.y += vy * speed;
    }
}

function followConstant(follower, leader, speed) {
    var vx = leader.centerX - follower.centerX,
        vy = leader.centerY - follower.centerY,
        distance = Math.sqrt(vx * vx + vy * vy);
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
"use strict";

var _display = require("./engine/display");

var _utilities = require("./engine/utilities");

var _interactive = require("./engine/interactive");

var _collision = require("./engine/collision");

_utilities.assets.load(["bgs/darkPurple.png", "fonts/kenvector_future_thin.ttf", "sounds/sfx_laser1.mp3", "sprites/sheet.json"]).then(function () {
    return setup();
});

var canvas = void 0,
    ship = void 0,
    message = void 0,
    shootSfx = void 0,
    bg = void 0;
var bullets = [];
var asteroids = [];
var pointer = void 0;

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
    var x = (0, _utilities.randomInt)(0, _display.stage.localBounds.width),
        y = (0, _utilities.randomInt)(0, _display.stage.localBounds.height);

    var asteroid = (0, _display.sprite)(_utilities.assets["meteorBrown_big1.png"], x, y);
    asteroid.circular = true;
    asteroid.diameter = 90;

    asteroid.vx = (0, _utilities.randomFloat)(-5, 5);
    asteroid.vy = (0, _utilities.randomFloat)(-5, 5);

    asteroid.rotationSpeed = (0, _utilities.randomFloat)(0.01, 0.07);

    asteroids.push(asteroid);
}

function setup() {
    canvas = (0, _display.makeCanvas)(1280, 720, "none");
    _display.stage.width = canvas.width;
    _display.stage.height = canvas.height;

    pointer = (0, _interactive.makePointer)(canvas);
    shootSfx = _utilities.assets["sounds/sfx_laser1.mp3"];

    bg = (0, _display.background)(_utilities.assets["bgs/darkPurple.png"], canvas.width, canvas.height);

    ship = (0, _display.sprite)(_utilities.assets["playerShip2_red.png"]);
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

    var leftArrow = (0, _interactive.keyboard)(37),
        rightArrow = (0, _interactive.keyboard)(39),
        upArrow = (0, _interactive.keyboard)(38),
        space = (0, _interactive.keyboard)(32);

    leftArrow.press = function () {
        return ship.rotationSpeed = -0.1;
    };
    leftArrow.release = function () {
        if (!rightArrow.isDown) ship.rotationSpeed = 0;
    };

    rightArrow.press = function () {
        return ship.rotationSpeed = 0.1;
    };
    rightArrow.release = function () {
        if (!leftArrow.isDown) ship.rotationSpeed = 0;
    };

    upArrow.press = function () {
        return ship.moveForward = true;
    };
    upArrow.release = function () {
        return ship.moveForward = false;
    };

    space.press = function () {
        shoot(ship, ship.rotation, 14, 10, bullets, function () {
            return (0, _display.sprite)(_utilities.assets["laserRed07.png"]);
        });
        shoot(ship, ship.rotation, -14, 10, bullets, function () {
            return (0, _display.sprite)(_utilities.assets["laserRed07.png"]);
        });
    };

    message = (0, _display.text)("Hello!", "16px kenvector_future_thin", "white", 8, 8);

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
            //stage.removeChild(ship);
            (0, _display.particleEffect)(ship.x, ship.y);

            // respawn ship
            setTimeout(function () {
                //stage.addChild(ship);
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

    message.content = "Scores: " + score;

    (0, _display.render)(canvas);
}

},{"./engine/collision":1,"./engine/display":2,"./engine/interactive":3,"./engine/utilities":5}]},{},[6])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnRcXGpzXFxzcmNcXGVuZ2luZVxcY29sbGlzaW9uLmpzIiwiY2xpZW50XFxqc1xcc3JjXFxlbmdpbmVcXGRpc3BsYXkuanMiLCJjbGllbnRcXGpzXFxzcmNcXGVuZ2luZVxcaW50ZXJhY3RpdmUuanMiLCJjbGllbnRcXGpzXFxzcmNcXGVuZ2luZVxcc291bmQuanMiLCJjbGllbnRcXGpzXFxzcmNcXGVuZ2luZVxcdXRpbGl0aWVzLmpzIiwiY2xpZW50XFxqc1xcc3JjXFxnYW1lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7UUNpRFMsWSxHQUFBLFk7UUFxREEsYSxHQUFBLGE7UUE4Q0EsZSxHQUFBLGU7UUFvRkEscUIsR0FBQSxxQjtRQTRJQSx1QixHQUFBLHVCO1FBOEJBLGdCLEdBQUEsZ0I7UUF3REEsa0IsR0FBQSxrQjtRQXVIQSxzQixHQUFBLHNCO1FBdUhBLGtCLEdBQUEsa0I7UUEwQkEsd0IsR0FBQSx3QjtRQWlIQSxvQixHQUFBLG9CO1FBb0ZBLEcsR0FBQSxHO0FBdjVCVDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBb0NBOzs7Ozs7Ozs7Ozs7QUFhQSxTQUFTLFlBQVQsQ0FBc0IsS0FBdEIsRUFBNkIsTUFBN0IsRUFBcUM7O0FBRW5DLE1BQUksY0FBSjtBQUFBLE1BQVcsYUFBWDtBQUFBLE1BQWlCLGNBQWpCO0FBQUEsTUFBd0IsWUFBeEI7QUFBQSxNQUE2QixlQUE3QjtBQUFBLE1BQXFDLFdBQXJDO0FBQUEsTUFBeUMsV0FBekM7QUFBQSxNQUE2QyxrQkFBN0M7QUFBQSxNQUF3RCxZQUF4RDs7QUFFQTtBQUNBO0FBQ0EsTUFBSSxPQUFPLE1BQVgsRUFBbUI7QUFDakIsWUFBUSxRQUFSO0FBQ0QsR0FGRCxNQUVPO0FBQ0wsWUFBUSxXQUFSO0FBQ0Q7O0FBRUQ7QUFDQSxNQUFJLFVBQVUsV0FBZCxFQUEyQjtBQUN6QjtBQUNBLFdBQU8sT0FBTyxDQUFkO0FBQ0EsWUFBUSxPQUFPLENBQVAsR0FBVyxPQUFPLEtBQTFCO0FBQ0EsVUFBTSxPQUFPLENBQWI7QUFDQSxhQUFTLE9BQU8sQ0FBUCxHQUFXLE9BQU8sTUFBM0I7O0FBRUE7QUFDQSxVQUFNLE1BQU0sQ0FBTixHQUFVLElBQVYsSUFBa0IsTUFBTSxDQUFOLEdBQVUsS0FBNUIsSUFBcUMsTUFBTSxDQUFOLEdBQVUsR0FBL0MsSUFBc0QsTUFBTSxDQUFOLEdBQVUsTUFBdEU7QUFDRDs7QUFFRDtBQUNBLE1BQUksVUFBVSxRQUFkLEVBQXdCO0FBQ3RCO0FBQ0E7QUFDQSxTQUFLLE1BQU0sQ0FBTixHQUFVLE9BQU8sT0FBdEIsRUFDQSxLQUFLLE1BQU0sQ0FBTixHQUFVLE9BQU8sT0FEdEIsRUFFQSxZQUFZLEtBQUssSUFBTCxDQUFVLEtBQUssRUFBTCxHQUFVLEtBQUssRUFBekIsQ0FGWjs7QUFJQTtBQUNBO0FBQ0EsVUFBTSxZQUFZLE9BQU8sTUFBekI7QUFDRDs7QUFFRDtBQUNBLFNBQU8sR0FBUDtBQUNEOztBQUdEOzs7Ozs7Ozs7O0FBV0EsU0FBUyxhQUFULENBQXVCLEVBQXZCLEVBQTJCLEVBQTNCLEVBQStDO0FBQUEsTUFBaEIsTUFBZ0IsdUVBQVAsS0FBTzs7QUFDN0MsTUFBSSxXQUFKO0FBQUEsTUFBUSxXQUFSO0FBQUEsTUFBWSxrQkFBWjtBQUFBLE1BQXVCLHNCQUF2QjtBQUFBLE1BQXNDLFlBQXRDOztBQUVBO0FBQ0EsTUFBSSxNQUFKLEVBQVk7QUFDVjtBQUNBLFNBQU0sR0FBRyxFQUFILEdBQVEsR0FBRyxNQUFaLElBQXVCLEdBQUcsRUFBSCxHQUFRLEdBQUcsTUFBbEMsQ0FBTDtBQUNBLFNBQU0sR0FBRyxFQUFILEdBQVEsR0FBRyxNQUFaLElBQXVCLEdBQUcsRUFBSCxHQUFRLEdBQUcsTUFBbEMsQ0FBTDtBQUNELEdBSkQsTUFJTztBQUNMO0FBQ0EsU0FBSyxHQUFHLE9BQUgsR0FBYSxHQUFHLE9BQXJCO0FBQ0EsU0FBSyxHQUFHLE9BQUgsR0FBYSxHQUFHLE9BQXJCO0FBQ0Q7O0FBRUQ7QUFDQTtBQUNBLGNBQVksS0FBSyxJQUFMLENBQVUsS0FBSyxFQUFMLEdBQVUsS0FBSyxFQUF6QixDQUFaOztBQUVBO0FBQ0Esa0JBQWdCLEdBQUcsTUFBSCxHQUFZLEdBQUcsTUFBL0I7O0FBRUE7QUFDQTtBQUNBLFFBQU0sWUFBWSxhQUFsQjs7QUFFQTtBQUNBLFNBQU8sR0FBUDtBQUNEOztBQUdEOzs7Ozs7Ozs7Ozs7Ozs7QUFnQkEsU0FBUyxlQUFULENBQXlCLEVBQXpCLEVBQTZCLEVBQTdCLEVBQWlFO0FBQUEsTUFBaEMsTUFBZ0MsdUVBQXZCLEtBQXVCO0FBQUEsTUFBaEIsTUFBZ0IsdUVBQVAsS0FBTzs7O0FBRS9ELE1BQUksa0JBQUo7QUFBQSxNQUFlLHNCQUFmO0FBQUEsTUFBOEIsZ0JBQTlCO0FBQUEsTUFDRSxXQURGO0FBQUEsTUFDTSxXQUROO0FBQUEsTUFDVSxXQURWO0FBQUEsTUFDYyxXQURkO0FBQUEsTUFDa0IsSUFBSSxFQUR0QjtBQUFBLE1BRUUsTUFBTSxLQUZSOztBQUlBOztBQUVBLE1BQUksTUFBSixFQUFZO0FBQ1Y7QUFDQSxTQUFNLEdBQUcsRUFBSCxHQUFRLEdBQUcsTUFBWixJQUF1QixHQUFHLEVBQUgsR0FBUSxHQUFHLE1BQWxDLENBQUw7QUFDQSxTQUFNLEdBQUcsRUFBSCxHQUFRLEdBQUcsTUFBWixJQUF1QixHQUFHLEVBQUgsR0FBUSxHQUFHLE1BQWxDLENBQUw7QUFDRCxHQUpELE1BSU87QUFDTDtBQUNBLFNBQUssR0FBRyxPQUFILEdBQWEsR0FBRyxPQUFyQjtBQUNBLFNBQUssR0FBRyxPQUFILEdBQWEsR0FBRyxPQUFyQjtBQUNEOztBQUVEO0FBQ0E7QUFDQSxjQUFZLEtBQUssSUFBTCxDQUFVLEtBQUssRUFBTCxHQUFVLEtBQUssRUFBekIsQ0FBWjs7QUFFQTtBQUNBLGtCQUFnQixHQUFHLE1BQUgsR0FBWSxHQUFHLE1BQS9COztBQUVBO0FBQ0EsTUFBSSxZQUFZLGFBQWhCLEVBQStCOztBQUU3QjtBQUNBLFVBQU0sSUFBTjs7QUFFQTtBQUNBLGNBQVUsZ0JBQWdCLFNBQTFCOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQUksaUJBQWlCLEdBQXJCO0FBQ0EsZUFBVyxjQUFYOztBQUVBO0FBQ0E7QUFDQSxTQUFLLEtBQUssU0FBVjtBQUNBLFNBQUssS0FBSyxTQUFWOztBQUVBO0FBQ0E7QUFDQTtBQUNBLE9BQUcsQ0FBSCxJQUFRLFVBQVUsRUFBbEI7QUFDQSxPQUFHLENBQUgsSUFBUSxVQUFVLEVBQWxCOztBQUVBO0FBQ0EsUUFBSSxNQUFKLEVBQVk7QUFDVjtBQUNBO0FBQ0E7QUFDQSxRQUFFLENBQUYsR0FBTSxFQUFOO0FBQ0EsUUFBRSxDQUFGLEdBQU0sQ0FBQyxFQUFQOztBQUVBO0FBQ0EsdUJBQWlCLEVBQWpCLEVBQXFCLENBQXJCO0FBQ0Q7QUFDRjtBQUNELFNBQU8sR0FBUDtBQUNEOztBQUlEOzs7Ozs7Ozs7Ozs7QUFhQSxTQUFTLHFCQUFULENBQStCLEVBQS9CLEVBQW1DLEVBQW5DLEVBQXVEO0FBQUEsTUFBaEIsTUFBZ0IsdUVBQVAsS0FBTzs7O0FBRXJELE1BQUksc0JBQUo7QUFBQSxNQUFtQixnQkFBbkI7QUFBQSxNQUE0QixjQUE1QjtBQUFBLE1BQW1DLGNBQW5DOztBQUNFO0FBQ0EsTUFBSSxFQUZOO0FBQUEsTUFHRSxNQUFNLEVBSFI7QUFBQSxNQUlFLE1BQU0sRUFKUjtBQUFBLE1BS0UsTUFBTSxFQUxSO0FBQUEsTUFNRSxNQUFNLEVBTlI7QUFBQSxNQU9FLE1BQU0sS0FQUjs7QUFTQTtBQUNBLEtBQUcsSUFBSCxHQUFVLEdBQUcsSUFBSCxJQUFXLENBQXJCO0FBQ0EsS0FBRyxJQUFILEdBQVUsR0FBRyxJQUFILElBQVcsQ0FBckI7O0FBRUE7QUFDQSxNQUFJLE1BQUosRUFBWTtBQUNWO0FBQ0EsTUFBRSxFQUFGLEdBQVEsR0FBRyxFQUFILEdBQVEsR0FBRyxNQUFaLElBQXVCLEdBQUcsRUFBSCxHQUFRLEdBQUcsTUFBbEMsQ0FBUDtBQUNBLE1BQUUsRUFBRixHQUFRLEdBQUcsRUFBSCxHQUFRLEdBQUcsTUFBWixJQUF1QixHQUFHLEVBQUgsR0FBUSxHQUFHLE1BQWxDLENBQVA7QUFDRCxHQUpELE1BSU87QUFDTDtBQUNBLE1BQUUsRUFBRixHQUFPLEdBQUcsT0FBSCxHQUFhLEdBQUcsT0FBdkI7QUFDQSxNQUFFLEVBQUYsR0FBTyxHQUFHLE9BQUgsR0FBYSxHQUFHLE9BQXZCO0FBQ0Q7O0FBRUQ7QUFDQTtBQUNBLElBQUUsU0FBRixHQUFjLEtBQUssSUFBTCxDQUFVLEVBQUUsRUFBRixHQUFPLEVBQUUsRUFBVCxHQUFjLEVBQUUsRUFBRixHQUFPLEVBQUUsRUFBakMsQ0FBZDs7QUFFQTtBQUNBLGtCQUFnQixHQUFHLE1BQUgsR0FBWSxHQUFHLE1BQS9COztBQUVBO0FBQ0EsTUFBSSxFQUFFLFNBQUYsR0FBYyxhQUFsQixFQUFpQzs7QUFFL0I7QUFDQSxVQUFNLElBQU47O0FBRUE7QUFDQSxjQUFVLGdCQUFnQixFQUFFLFNBQTVCOztBQUVBO0FBQ0EsZUFBVyxHQUFYOztBQUVBO0FBQ0E7QUFDQSxNQUFFLEVBQUYsR0FBTyxFQUFFLEVBQUYsR0FBTyxFQUFFLFNBQWhCO0FBQ0EsTUFBRSxFQUFGLEdBQU8sRUFBRSxFQUFGLEdBQU8sRUFBRSxTQUFoQjs7QUFFQTtBQUNBO0FBQ0EsTUFBRSxNQUFGLEdBQVcsS0FBSyxHQUFMLENBQVMsRUFBRSxFQUFGLEdBQU8sT0FBUCxHQUFpQixDQUExQixDQUFYO0FBQ0EsTUFBRSxNQUFGLEdBQVcsS0FBSyxHQUFMLENBQVMsRUFBRSxFQUFGLEdBQU8sT0FBUCxHQUFpQixDQUExQixDQUFYOztBQUVBO0FBQ0MsT0FBRyxDQUFILEdBQU8sR0FBRyxDQUFYLEdBQWdCLFFBQVEsQ0FBeEIsR0FBNEIsUUFBUSxDQUFDLENBQXJDO0FBQ0MsT0FBRyxDQUFILEdBQU8sR0FBRyxDQUFYLEdBQWdCLFFBQVEsQ0FBeEIsR0FBNEIsUUFBUSxDQUFDLENBQXJDOztBQUVBO0FBQ0E7QUFDQTtBQUNBLE9BQUcsQ0FBSCxHQUFPLEdBQUcsQ0FBSCxHQUFRLEVBQUUsTUFBRixHQUFXLEtBQTFCO0FBQ0EsT0FBRyxDQUFILEdBQU8sR0FBRyxDQUFILEdBQVEsRUFBRSxNQUFGLEdBQVcsS0FBMUI7O0FBRUE7QUFDQSxPQUFHLENBQUgsR0FBTyxHQUFHLENBQUgsR0FBUSxFQUFFLE1BQUYsR0FBVyxDQUFDLEtBQTNCO0FBQ0EsT0FBRyxDQUFILEdBQU8sR0FBRyxDQUFILEdBQVEsRUFBRSxNQUFGLEdBQVcsQ0FBQyxLQUEzQjs7QUFFQTs7QUFFQTtBQUNBLE1BQUUsRUFBRixHQUFPLEVBQUUsRUFBVDtBQUNBLE1BQUUsRUFBRixHQUFPLENBQUMsRUFBRSxFQUFWOztBQUVBOztBQUVBO0FBQ0EsUUFBSSxNQUFNLEdBQUcsRUFBSCxHQUFRLEVBQUUsRUFBVixHQUFlLEdBQUcsRUFBSCxHQUFRLEVBQUUsRUFBbkM7O0FBRUE7QUFDQSxRQUFJLENBQUosR0FBUSxNQUFNLEVBQUUsRUFBaEI7QUFDQSxRQUFJLENBQUosR0FBUSxNQUFNLEVBQUUsRUFBaEI7O0FBRUE7QUFDQSxRQUFJLE1BQU0sR0FBRyxFQUFILElBQVMsRUFBRSxFQUFGLEdBQU8sRUFBRSxTQUFsQixJQUErQixHQUFHLEVBQUgsSUFBUyxFQUFFLEVBQUYsR0FBTyxFQUFFLFNBQWxCLENBQXpDOztBQUVBO0FBQ0EsUUFBSSxDQUFKLEdBQVEsT0FBTyxFQUFFLEVBQUYsR0FBTyxFQUFFLFNBQWhCLENBQVI7QUFDQSxRQUFJLENBQUosR0FBUSxPQUFPLEVBQUUsRUFBRixHQUFPLEVBQUUsU0FBaEIsQ0FBUjs7QUFFQTs7QUFFQTtBQUNBLFFBQUksTUFBTSxHQUFHLEVBQUgsR0FBUSxFQUFFLEVBQVYsR0FBZSxHQUFHLEVBQUgsR0FBUSxFQUFFLEVBQW5DOztBQUVBO0FBQ0EsUUFBSSxDQUFKLEdBQVEsTUFBTSxFQUFFLEVBQWhCO0FBQ0EsUUFBSSxDQUFKLEdBQVEsTUFBTSxFQUFFLEVBQWhCOztBQUVBO0FBQ0EsUUFBSSxNQUFNLEdBQUcsRUFBSCxJQUFTLEVBQUUsRUFBRixHQUFPLEVBQUUsU0FBbEIsSUFBK0IsR0FBRyxFQUFILElBQVMsRUFBRSxFQUFGLEdBQU8sRUFBRSxTQUFsQixDQUF6Qzs7QUFFQTtBQUNBLFFBQUksQ0FBSixHQUFRLE9BQU8sRUFBRSxFQUFGLEdBQU8sRUFBRSxTQUFoQixDQUFSO0FBQ0EsUUFBSSxDQUFKLEdBQVEsT0FBTyxFQUFFLEVBQUYsR0FBTyxFQUFFLFNBQWhCLENBQVI7O0FBRUE7O0FBRUE7QUFDQTtBQUNBLE9BQUcsTUFBSCxHQUFZLEVBQVo7QUFDQSxPQUFHLE1BQUgsQ0FBVSxDQUFWLEdBQWMsSUFBSSxDQUFKLEdBQVEsSUFBSSxDQUExQjtBQUNBLE9BQUcsTUFBSCxDQUFVLENBQVYsR0FBYyxJQUFJLENBQUosR0FBUSxJQUFJLENBQTFCOztBQUVBO0FBQ0E7QUFDQSxPQUFHLE1BQUgsR0FBWSxFQUFaO0FBQ0EsT0FBRyxNQUFILENBQVUsQ0FBVixHQUFjLElBQUksQ0FBSixHQUFRLElBQUksQ0FBMUI7QUFDQSxPQUFHLE1BQUgsQ0FBVSxDQUFWLEdBQWMsSUFBSSxDQUFKLEdBQVEsSUFBSSxDQUExQjs7QUFFQTtBQUNBO0FBQ0EsT0FBRyxFQUFILEdBQVEsR0FBRyxNQUFILENBQVUsQ0FBVixHQUFjLEdBQUcsSUFBekI7QUFDQSxPQUFHLEVBQUgsR0FBUSxHQUFHLE1BQUgsQ0FBVSxDQUFWLEdBQWMsR0FBRyxJQUF6QjtBQUNBLE9BQUcsRUFBSCxHQUFRLEdBQUcsTUFBSCxDQUFVLENBQVYsR0FBYyxHQUFHLElBQXpCO0FBQ0EsT0FBRyxFQUFILEdBQVEsR0FBRyxNQUFILENBQVUsQ0FBVixHQUFjLEdBQUcsSUFBekI7QUFDRDtBQUNELFNBQU8sR0FBUDtBQUNEOztBQUVEOzs7Ozs7OztBQVNBLFNBQVMsdUJBQVQsQ0FBaUMsY0FBakMsRUFBaUU7QUFBQSxNQUFoQixNQUFnQix1RUFBUCxLQUFPOztBQUMvRDtBQUNBLE9BQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsSUFBSSxlQUFlLE1BQW5DLEVBQTJDLEdBQTNDLEVBQWdEO0FBQzlDO0FBQ0EsUUFBSSxLQUFLLGVBQWUsQ0FBZixDQUFUO0FBQ0EsU0FBSyxJQUFJLElBQUksSUFBSSxDQUFqQixFQUFvQixJQUFJLGVBQWUsTUFBdkMsRUFBK0MsR0FBL0MsRUFBb0Q7QUFDbEQ7QUFDQSxVQUFJLEtBQUssZUFBZSxDQUFmLENBQVQ7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0QkFBc0IsRUFBdEIsRUFBMEIsRUFBMUIsRUFBOEIsTUFBOUI7QUFDRDtBQUNGO0FBQ0Y7O0FBSUQ7Ozs7Ozs7Ozs7O0FBWUEsU0FBUyxnQkFBVCxDQUEwQixFQUExQixFQUE4QixFQUE5QixFQUFrRDtBQUFBLE1BQWhCLE1BQWdCLHVFQUFQLEtBQU87O0FBQ2hELE1BQUksWUFBSjtBQUFBLE1BQVMsMkJBQVQ7QUFBQSxNQUE2Qiw0QkFBN0I7QUFBQSxNQUFrRCxXQUFsRDtBQUFBLE1BQXNELFdBQXREOztBQUVBO0FBQ0EsUUFBTSxLQUFOOztBQUVBO0FBQ0EsTUFBSSxNQUFKLEVBQVk7QUFDVixTQUFNLEdBQUcsRUFBSCxHQUFRLEdBQUcsU0FBWixJQUEwQixHQUFHLEVBQUgsR0FBUSxHQUFHLFNBQXJDLENBQUw7QUFDQSxTQUFNLEdBQUcsRUFBSCxHQUFRLEdBQUcsVUFBWixJQUEyQixHQUFHLEVBQUgsR0FBUSxHQUFHLFVBQXRDLENBQUw7QUFDRCxHQUhELE1BR087QUFDTCxTQUFLLEdBQUcsT0FBSCxHQUFhLEdBQUcsT0FBckI7QUFDQSxTQUFLLEdBQUcsT0FBSCxHQUFhLEdBQUcsT0FBckI7QUFDRDs7QUFFRDtBQUNBLHVCQUFxQixHQUFHLFNBQUgsR0FBZSxHQUFHLFNBQXZDO0FBQ0Esd0JBQXNCLEdBQUcsVUFBSCxHQUFnQixHQUFHLFVBQXpDOztBQUVBO0FBQ0EsTUFBSSxLQUFLLEdBQUwsQ0FBUyxFQUFULElBQWUsa0JBQW5CLEVBQXVDOztBQUVyQztBQUNBLFFBQUksS0FBSyxHQUFMLENBQVMsRUFBVCxJQUFlLG1CQUFuQixFQUF3Qzs7QUFFdEM7QUFDQSxZQUFNLElBQU47QUFDRCxLQUpELE1BSU87O0FBRUw7QUFDQSxZQUFNLEtBQU47QUFDRDtBQUNGLEdBWkQsTUFZTzs7QUFFTDtBQUNBLFVBQU0sS0FBTjtBQUNEOztBQUVEO0FBQ0EsU0FBTyxHQUFQO0FBQ0Q7O0FBRUQ7Ozs7Ozs7Ozs7Ozs7QUFjQSxTQUFTLGtCQUFULENBQ0UsRUFERixFQUNNLEVBRE4sRUFFRTtBQUFBLE1BRFEsTUFDUix1RUFEaUIsS0FDakI7QUFBQSxNQUR3QixNQUN4Qix1RUFEaUMsSUFDakM7OztBQUVBLE1BQUksa0JBQUo7QUFBQSxNQUFlLDJCQUFmO0FBQUEsTUFBbUMsNEJBQW5DO0FBQUEsTUFDRSxpQkFERjtBQUFBLE1BQ1ksaUJBRFo7QUFBQSxNQUNzQixXQUR0QjtBQUFBLE1BQzBCLFdBRDFCOztBQUdBO0FBQ0EsTUFBSSxNQUFKLEVBQVk7QUFDVixTQUFNLEdBQUcsRUFBSCxHQUFRLEdBQUcsU0FBWixJQUEwQixHQUFHLEVBQUgsR0FBUSxHQUFHLFNBQXJDLENBQUw7QUFDQSxTQUFNLEdBQUcsRUFBSCxHQUFRLEdBQUcsVUFBWixJQUEyQixHQUFHLEVBQUgsR0FBUSxHQUFHLFVBQXRDLENBQUw7QUFDRCxHQUhELE1BR087QUFDTCxTQUFLLEdBQUcsT0FBSCxHQUFhLEdBQUcsT0FBckI7QUFDQSxTQUFLLEdBQUcsT0FBSCxHQUFhLEdBQUcsT0FBckI7QUFDRDs7QUFFRDtBQUNBLHVCQUFxQixHQUFHLFNBQUgsR0FBZSxHQUFHLFNBQXZDO0FBQ0Esd0JBQXNCLEdBQUcsVUFBSCxHQUFnQixHQUFHLFVBQXpDOztBQUVBO0FBQ0EsTUFBSSxLQUFLLEdBQUwsQ0FBUyxFQUFULElBQWUsa0JBQW5CLEVBQXVDOztBQUVyQztBQUNBO0FBQ0EsUUFBSSxLQUFLLEdBQUwsQ0FBUyxFQUFULElBQWUsbUJBQW5CLEVBQXdDOztBQUV0QztBQUNBO0FBQ0EsaUJBQVcscUJBQXFCLEtBQUssR0FBTCxDQUFTLEVBQVQsQ0FBaEM7QUFDQSxpQkFBVyxzQkFBc0IsS0FBSyxHQUFMLENBQVMsRUFBVCxDQUFqQzs7QUFFQTtBQUNBO0FBQ0E7O0FBRUEsVUFBSSxZQUFZLFFBQWhCLEVBQTBCO0FBQ3hCO0FBQ0E7O0FBRUEsWUFBSSxLQUFLLENBQVQsRUFBWTtBQUNWLHNCQUFZLEtBQVo7QUFDQTtBQUNBLGFBQUcsQ0FBSCxHQUFPLEdBQUcsQ0FBSCxHQUFPLFFBQWQ7QUFDRCxTQUpELE1BSU87QUFDTCxzQkFBWSxRQUFaO0FBQ0E7QUFDQSxhQUFHLENBQUgsR0FBTyxHQUFHLENBQUgsR0FBTyxRQUFkO0FBQ0Q7O0FBRUQ7QUFDQSxZQUFJLE1BQUosRUFBWTtBQUNWLGFBQUcsRUFBSCxJQUFTLENBQUMsQ0FBVjs7QUFFQTs7Ozs7Ozs7QUFVRDtBQUNGLE9BN0JELE1BNkJPO0FBQ0w7QUFDQTs7QUFFQSxZQUFJLEtBQUssQ0FBVCxFQUFZO0FBQ1Ysc0JBQVksTUFBWjtBQUNBO0FBQ0EsYUFBRyxDQUFILEdBQU8sR0FBRyxDQUFILEdBQU8sUUFBZDtBQUNELFNBSkQsTUFJTztBQUNMLHNCQUFZLE9BQVo7QUFDQTtBQUNBLGFBQUcsQ0FBSCxHQUFPLEdBQUcsQ0FBSCxHQUFPLFFBQWQ7QUFDRDs7QUFFRDtBQUNBLFlBQUksTUFBSixFQUFZO0FBQ1YsYUFBRyxFQUFILElBQVMsQ0FBQyxDQUFWOztBQUVBOzs7Ozs7OztBQVVEO0FBQ0Y7QUFDRixLQXRFRCxNQXNFTztBQUNMO0FBQ0Q7QUFDRixHQTdFRCxNQTZFTyxDQUVOO0FBREM7OztBQUdGO0FBQ0E7QUFDQSxTQUFPLFNBQVA7QUFDRDs7QUFFRDs7Ozs7Ozs7Ozs7QUFZQSxTQUFTLHNCQUFULENBQWdDLEVBQWhDLEVBQW9DLEVBQXBDLEVBQXdEO0FBQUEsTUFBaEIsTUFBZ0IsdUVBQVAsS0FBTzs7O0FBRXRELE1BQUksZUFBSjtBQUFBLE1BQVksa0JBQVo7QUFBQSxNQUF1QixZQUF2QjtBQUFBLE1BQTRCLFlBQTVCO0FBQUEsTUFBaUMsWUFBakM7QUFBQSxNQUFzQyxZQUF0Qzs7QUFFQTtBQUNBLE1BQUksTUFBSixFQUFZO0FBQ1YsVUFBTSxHQUFHLEVBQVQ7QUFDQSxVQUFNLEdBQUcsRUFBVDtBQUNBLFVBQU0sR0FBRyxFQUFUO0FBQ0EsVUFBTSxHQUFHLEVBQVQ7QUFDRCxHQUxELE1BS087QUFDTCxVQUFNLEdBQUcsQ0FBVDtBQUNBLFVBQU0sR0FBRyxDQUFUO0FBQ0EsVUFBTSxHQUFHLENBQVQ7QUFDQSxVQUFNLEdBQUcsQ0FBVDtBQUNEOztBQUVEO0FBQ0EsTUFBSSxNQUFNLE1BQU0sR0FBRyxVQUFuQixFQUErQjs7QUFFN0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBSSxNQUFNLE1BQU0sQ0FBTixHQUFVLEdBQUcsU0FBdkIsRUFBa0M7QUFDaEMsZUFBUyxTQUFUO0FBQ0QsS0FGRCxNQUVPLElBQUksTUFBTSxNQUFNLENBQU4sR0FBVSxHQUFHLFNBQXZCLEVBQWtDO0FBQ3ZDLGVBQVMsVUFBVDtBQUNELEtBRk0sTUFFQTtBQUNMLGVBQVMsV0FBVDtBQUNEO0FBQ0Y7O0FBRUQ7QUFDQTtBQWxCQSxPQW1CSyxJQUFJLE1BQU0sTUFBTSxHQUFHLFVBQW5CLEVBQStCOztBQUVsQztBQUNBO0FBQ0EsVUFBSSxNQUFNLE1BQU0sQ0FBTixHQUFVLEdBQUcsU0FBdkIsRUFBa0M7QUFDaEMsaUJBQVMsWUFBVDtBQUNELE9BRkQsTUFFTyxJQUFJLE1BQU0sTUFBTSxDQUFOLEdBQVUsR0FBRyxTQUF2QixFQUFrQztBQUN2QyxpQkFBUyxhQUFUO0FBQ0QsT0FGTSxNQUVBO0FBQ0wsaUJBQVMsY0FBVDtBQUNEO0FBQ0Y7O0FBRUQ7QUFDQTtBQWRLLFNBZUE7QUFDSCxZQUFJLE1BQU0sTUFBTSxHQUFHLFNBQW5CLEVBQThCO0FBQzVCLG1CQUFTLFlBQVQ7QUFDRCxTQUZELE1BRU87QUFDTCxtQkFBUyxhQUFUO0FBQ0Q7QUFDRjs7QUFFRDtBQUNBO0FBQ0EsTUFBSSxXQUFXLFdBQVgsSUFBMEIsV0FBVyxjQUFyQyxJQUF1RCxXQUFXLFlBQWxFLElBQWtGLFdBQVcsYUFBakcsRUFBZ0g7O0FBRTlHO0FBQ0EsZ0JBQVksaUJBQWlCLEVBQWpCLEVBQXFCLEVBQXJCLEVBQXlCLE1BQXpCLENBQVo7QUFDRDs7QUFFRDtBQUNBO0FBUEEsT0FRSztBQUNILFVBQUksUUFBUSxFQUFaOztBQUVBLGNBQVEsTUFBUjtBQUNFLGFBQUssU0FBTDtBQUNFLGdCQUFNLENBQU4sR0FBVSxHQUFWO0FBQ0EsZ0JBQU0sQ0FBTixHQUFVLEdBQVY7QUFDQTs7QUFFRixhQUFLLFVBQUw7QUFDRSxnQkFBTSxDQUFOLEdBQVUsTUFBTSxHQUFHLEtBQW5CO0FBQ0EsZ0JBQU0sQ0FBTixHQUFVLEdBQVY7QUFDQTs7QUFFRixhQUFLLFlBQUw7QUFDRSxnQkFBTSxDQUFOLEdBQVUsR0FBVjtBQUNBLGdCQUFNLENBQU4sR0FBVSxNQUFNLEdBQUcsTUFBbkI7QUFDQTs7QUFFRixhQUFLLGFBQUw7QUFDRSxnQkFBTSxDQUFOLEdBQVUsTUFBTSxHQUFHLEtBQW5CO0FBQ0EsZ0JBQU0sQ0FBTixHQUFVLE1BQU0sR0FBRyxNQUFuQjtBQWxCSjs7QUFxQkE7QUFDQSxrQkFBWSxtQkFBbUIsRUFBbkIsRUFBdUIsS0FBdkIsRUFBOEIsTUFBOUIsQ0FBWjtBQUNEOztBQUVEO0FBQ0E7QUFDQSxNQUFJLFNBQUosRUFBZTtBQUNiLFdBQU8sTUFBUDtBQUNELEdBRkQsTUFFTztBQUNMLFdBQU8sU0FBUDtBQUNEO0FBQ0Y7O0FBRUQ7Ozs7Ozs7Ozs7O0FBWUEsU0FBUyxrQkFBVCxDQUE0QixFQUE1QixFQUFnQyxLQUFoQyxFQUF1RDtBQUFBLE1BQWhCLE1BQWdCLHVFQUFQLEtBQU87O0FBQ3JEO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBTSxRQUFOLEdBQWlCLENBQWpCO0FBQ0EsUUFBTSxNQUFOLEdBQWUsR0FBZjtBQUNBLFFBQU0sT0FBTixHQUFnQixNQUFNLENBQXRCO0FBQ0EsUUFBTSxPQUFOLEdBQWdCLE1BQU0sQ0FBdEI7QUFDQSxRQUFNLEVBQU4sR0FBVyxNQUFNLENBQWpCO0FBQ0EsUUFBTSxFQUFOLEdBQVcsTUFBTSxDQUFqQjtBQUNBLFNBQU8sY0FBYyxFQUFkLEVBQWtCLEtBQWxCLEVBQXlCLE1BQXpCLENBQVA7QUFDRDs7QUFFRDs7Ozs7Ozs7Ozs7QUFZQSxTQUFTLHdCQUFULENBQ0UsRUFERixFQUNNLEVBRE4sRUFFRTtBQUFBLE1BRFEsTUFDUix1RUFEaUIsS0FDakI7QUFBQSxNQUR3QixNQUN4Qix1RUFEaUMsS0FDakM7OztBQUVBLE1BQUksZUFBSjtBQUFBLE1BQVksa0JBQVo7QUFBQSxNQUF1QixZQUF2QjtBQUFBLE1BQTRCLFlBQTVCO0FBQUEsTUFBaUMsWUFBakM7QUFBQSxNQUFzQyxZQUF0Qzs7QUFFQTtBQUNBLE1BQUksTUFBSixFQUFZO0FBQ1YsVUFBTSxHQUFHLEVBQVQ7QUFDQSxVQUFNLEdBQUcsRUFBVDtBQUNBLFVBQU0sR0FBRyxFQUFUO0FBQ0EsVUFBTSxHQUFHLEVBQVQ7QUFDRCxHQUxELE1BS087QUFDTCxVQUFNLEdBQUcsQ0FBVDtBQUNBLFVBQU0sR0FBRyxDQUFUO0FBQ0EsVUFBTSxHQUFHLENBQVQ7QUFDQSxVQUFNLEdBQUcsQ0FBVDtBQUNEOztBQUVEO0FBQ0EsTUFBSSxNQUFNLE1BQU0sR0FBRyxVQUFuQixFQUErQjtBQUM3QjtBQUNBO0FBQ0EsUUFBSSxNQUFNLE1BQU0sQ0FBTixHQUFVLEdBQUcsU0FBdkIsRUFBa0M7QUFDaEMsZUFBUyxTQUFUO0FBQ0QsS0FGRCxNQUVPLElBQUksTUFBTSxNQUFNLENBQU4sR0FBVSxHQUFHLFNBQXZCLEVBQWtDO0FBQ3ZDLGVBQVMsVUFBVDtBQUNELEtBRk0sTUFFQTtBQUNMLGVBQVMsV0FBVDtBQUNEO0FBQ0Y7O0FBRUQ7QUFDQTtBQWJBLE9BY0ssSUFBSSxNQUFNLE1BQU0sR0FBRyxVQUFuQixFQUErQjtBQUNsQztBQUNBO0FBQ0EsVUFBSSxNQUFNLE1BQU0sQ0FBTixHQUFVLEdBQUcsU0FBdkIsRUFBa0M7QUFDaEMsaUJBQVMsWUFBVDtBQUNELE9BRkQsTUFFTyxJQUFJLE1BQU0sTUFBTSxDQUFOLEdBQVUsR0FBRyxTQUF2QixFQUFrQztBQUN2QyxpQkFBUyxhQUFUO0FBQ0QsT0FGTSxNQUVBO0FBQ0wsaUJBQVMsY0FBVDtBQUNEO0FBQ0Y7O0FBRUQ7QUFDQTtBQWJLLFNBY0E7QUFDSCxZQUFJLE1BQU0sTUFBTSxHQUFHLFNBQW5CLEVBQThCO0FBQzVCLG1CQUFTLFlBQVQ7QUFDRCxTQUZELE1BRU87QUFDTCxtQkFBUyxhQUFUO0FBQ0Q7QUFDRjs7QUFFRDtBQUNBO0FBQ0EsTUFBSSxXQUFXLFdBQVgsSUFBMEIsV0FBVyxjQUFyQyxJQUF1RCxXQUFXLFlBQWxFLElBQWtGLFdBQVcsYUFBakcsRUFBZ0g7O0FBRTlHO0FBQ0EsZ0JBQVksbUJBQW1CLEVBQW5CLEVBQXVCLEVBQXZCLEVBQTJCLE1BQTNCLEVBQW1DLE1BQW5DLENBQVo7QUFDRDs7QUFFRDtBQUNBO0FBUEEsT0FRSztBQUNILFVBQUksUUFBUSxFQUFaOztBQUVBLGNBQVEsTUFBUjtBQUNFLGFBQUssU0FBTDtBQUNFLGdCQUFNLENBQU4sR0FBVSxHQUFWO0FBQ0EsZ0JBQU0sQ0FBTixHQUFVLEdBQVY7QUFDQTs7QUFFRixhQUFLLFVBQUw7QUFDRSxnQkFBTSxDQUFOLEdBQVUsTUFBTSxHQUFHLEtBQW5CO0FBQ0EsZ0JBQU0sQ0FBTixHQUFVLEdBQVY7QUFDQTs7QUFFRixhQUFLLFlBQUw7QUFDRSxnQkFBTSxDQUFOLEdBQVUsR0FBVjtBQUNBLGdCQUFNLENBQU4sR0FBVSxNQUFNLEdBQUcsTUFBbkI7QUFDQTs7QUFFRixhQUFLLGFBQUw7QUFDRSxnQkFBTSxDQUFOLEdBQVUsTUFBTSxHQUFHLEtBQW5CO0FBQ0EsZ0JBQU0sQ0FBTixHQUFVLE1BQU0sR0FBRyxNQUFuQjtBQWxCSjs7QUFxQkE7QUFDQSxrQkFBWSxxQkFBcUIsRUFBckIsRUFBeUIsS0FBekIsRUFBZ0MsTUFBaEMsRUFBd0MsTUFBeEMsQ0FBWjtBQUNEOztBQUVELE1BQUksU0FBSixFQUFlO0FBQ2IsV0FBTyxNQUFQO0FBQ0QsR0FGRCxNQUVPO0FBQ0wsV0FBTyxTQUFQO0FBQ0Q7QUFDRjs7QUFFRDs7Ozs7Ozs7Ozs7QUFZQSxTQUFTLG9CQUFULENBQThCLEVBQTlCLEVBQWtDLEtBQWxDLEVBQXlFO0FBQUEsTUFBaEMsTUFBZ0MsdUVBQXZCLEtBQXVCO0FBQUEsTUFBaEIsTUFBZ0IsdUVBQVAsS0FBTzs7QUFDdkU7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFNLFFBQU4sR0FBaUIsQ0FBakI7QUFDQSxRQUFNLE1BQU4sR0FBZSxHQUFmO0FBQ0EsUUFBTSxPQUFOLEdBQWdCLE1BQU0sQ0FBdEI7QUFDQSxRQUFNLE9BQU4sR0FBZ0IsTUFBTSxDQUF0QjtBQUNBLFFBQU0sRUFBTixHQUFXLE1BQU0sQ0FBakI7QUFDQSxRQUFNLEVBQU4sR0FBVyxNQUFNLENBQWpCO0FBQ0EsU0FBTyxnQkFBZ0IsRUFBaEIsRUFBb0IsS0FBcEIsRUFBMkIsTUFBM0IsRUFBbUMsTUFBbkMsQ0FBUDtBQUNEO0FBQ0Q7Ozs7Ozs7Ozs7Ozs7O0FBY0EsU0FBUyxnQkFBVCxDQUEwQixDQUExQixFQUE2QixDQUE3QixFQUFnQztBQUM5QixNQUFJLFlBQUo7QUFBQSxNQUFTLFlBQVQ7QUFBQSxNQUNFLEtBQUssRUFEUDtBQUFBLE1BRUUsS0FBSyxFQUZQO0FBQUEsTUFHRSxTQUFTLEVBSFg7QUFBQSxNQUlFLE9BQU8sRUFBRSxJQUFGLElBQVUsQ0FKbkI7O0FBTUE7QUFDQTtBQUNBLElBQUUsRUFBRixHQUFPLEVBQUUsQ0FBVDtBQUNBLElBQUUsRUFBRixHQUFPLENBQUMsRUFBRSxDQUFWOztBQUVBO0FBQ0EsSUFBRSxTQUFGLEdBQWMsS0FBSyxJQUFMLENBQVUsRUFBRSxDQUFGLEdBQU0sRUFBRSxDQUFSLEdBQVksRUFBRSxDQUFGLEdBQU0sRUFBRSxDQUE5QixDQUFkOztBQUVBO0FBQ0EsSUFBRSxFQUFGLEdBQU8sRUFBRSxDQUFGLEdBQU0sRUFBRSxTQUFmO0FBQ0EsSUFBRSxFQUFGLEdBQU8sRUFBRSxDQUFGLEdBQU0sRUFBRSxTQUFmOztBQUVBOztBQUVBO0FBQ0EsUUFBTSxFQUFFLEVBQUYsR0FBTyxFQUFFLEVBQVQsR0FBYyxFQUFFLEVBQUYsR0FBTyxFQUFFLEVBQTdCOztBQUVBO0FBQ0EsS0FBRyxFQUFILEdBQVEsTUFBTSxFQUFFLEVBQWhCO0FBQ0EsS0FBRyxFQUFILEdBQVEsTUFBTSxFQUFFLEVBQWhCOztBQUVBO0FBQ0EsUUFBTSxFQUFFLEVBQUYsSUFBUSxFQUFFLEVBQUYsR0FBTyxFQUFFLFNBQWpCLElBQThCLEVBQUUsRUFBRixJQUFRLEVBQUUsRUFBRixHQUFPLEVBQUUsU0FBakIsQ0FBcEM7O0FBRUE7QUFDQSxLQUFHLEVBQUgsR0FBUSxPQUFPLEVBQUUsRUFBRixHQUFPLEVBQUUsU0FBaEIsQ0FBUjtBQUNBLEtBQUcsRUFBSCxHQUFRLE9BQU8sRUFBRSxFQUFGLEdBQU8sRUFBRSxTQUFoQixDQUFSOztBQUVBO0FBQ0EsS0FBRyxFQUFILElBQVMsQ0FBQyxDQUFWO0FBQ0EsS0FBRyxFQUFILElBQVMsQ0FBQyxDQUFWOztBQUVBO0FBQ0EsU0FBTyxDQUFQLEdBQVcsR0FBRyxFQUFILEdBQVEsR0FBRyxFQUF0QjtBQUNBLFNBQU8sQ0FBUCxHQUFXLEdBQUcsRUFBSCxHQUFRLEdBQUcsRUFBdEI7O0FBRUE7QUFDQTtBQUNBLElBQUUsRUFBRixHQUFPLE9BQU8sQ0FBUCxHQUFXLElBQWxCO0FBQ0EsSUFBRSxFQUFGLEdBQU8sT0FBTyxDQUFQLEdBQVcsSUFBbEI7QUFDRDs7QUFFRDs7Ozs7OztBQVFBLFNBQVMsR0FBVCxDQUFhLENBQWIsRUFBZ0IsQ0FBaEIsRUFBNkU7QUFBQSxNQUExRCxLQUEwRCx1RUFBbEQsS0FBa0Q7QUFBQSxNQUEzQyxNQUEyQyx1RUFBbEMsS0FBa0M7QUFBQSxNQUEzQixNQUEyQjtBQUFBLE1BQW5CLEtBQW1CLHVFQUFYLFNBQVc7O0FBQzNFLE1BQUksa0JBQUo7QUFBQSxNQUNFLGFBQWEsRUFBRSxNQUFGLEtBQWEsU0FENUI7QUFBQSxNQUVFLGFBQWEsRUFBRSxNQUFGLEtBQWEsU0FGNUI7O0FBSUE7QUFDQSxNQUFJLGNBQWMsYUFBYSxLQUEzQixJQUFvQyxjQUFjLGFBQWEsS0FBbkUsRUFBMEU7QUFDeEU7QUFDQTtBQUNELEdBSEQsTUFHTztBQUNMO0FBQ0E7QUFDQSxnQkFBWSxrQkFBa0IsQ0FBbEIsRUFBcUIsQ0FBckIsQ0FBWjtBQUNBLFFBQUksYUFBYSxLQUFqQixFQUF3QixNQUFNLFNBQU47QUFDekI7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQU8sU0FBUDs7QUFFQSxXQUFTLGlCQUFULENBQTJCLENBQTNCLEVBQThCLENBQTlCLEVBQWlDO0FBQy9CO0FBQ0E7QUFDQTtBQUNBLFFBQUksYUFBYSxFQUFFLE1BQUYsS0FBYSxTQUE5QjtBQUNBLFFBQUksYUFBYSxFQUFFLE1BQUYsS0FBYSxTQUE5Qjs7QUFFQSxRQUFJLGNBQWMsVUFBbEIsRUFBOEI7QUFDNUI7QUFDQSxVQUFJLEVBQUUsUUFBRixJQUFjLEVBQUUsUUFBcEIsRUFBOEI7QUFDNUI7QUFDQSxlQUFPLGVBQWUsQ0FBZixFQUFrQixDQUFsQixDQUFQO0FBQ0QsT0FIRCxNQUdPLElBQUksRUFBRSxRQUFGLElBQWMsQ0FBQyxFQUFFLFFBQXJCLEVBQStCO0FBQ3BDO0FBQ0EsZUFBTyxrQkFBa0IsQ0FBbEIsRUFBcUIsQ0FBckIsQ0FBUDtBQUNELE9BSE0sTUFHQTtBQUNMO0FBQ0EsZUFBTyxxQkFBcUIsQ0FBckIsRUFBd0IsQ0FBeEIsQ0FBUDtBQUNEO0FBQ0Y7QUFDRDtBQUNBO0FBZEEsU0FlSyxJQUFJLGNBQWMsRUFBRSxFQUFFLENBQUYsS0FBUSxTQUFWLENBQWQsSUFBc0MsRUFBRSxFQUFFLENBQUYsS0FBUSxTQUFWLENBQTFDLEVBQWdFO0FBQ25FO0FBQ0EsZUFBTyxhQUFhLENBQWIsRUFBZ0IsQ0FBaEIsQ0FBUDtBQUNELE9BSEksTUFHRTtBQUNMO0FBQ0EsY0FBTSxJQUFJLEtBQUosaUJBQXdCLENBQXhCLGFBQWlDLENBQWpDLG1EQUFOO0FBQ0Q7QUFDRjs7QUFFRCxXQUFTLGFBQVQsR0FBeUI7QUFDdkI7QUFDQSxRQUFJLGFBQWEsS0FBakIsRUFBd0I7QUFBQSxpQkFDVCxDQUFDLEVBQUQsRUFBSSxFQUFKLENBRFM7QUFBQSxVQUNqQixFQURpQjtBQUFBLFVBQ2QsRUFEYztBQUV2QjtBQUNEO0FBQ0EsU0FBSyxJQUFJLElBQUksRUFBRSxNQUFGLEdBQVcsQ0FBeEIsRUFBMkIsS0FBSyxDQUFoQyxFQUFtQyxHQUFuQyxFQUF3QztBQUN0QyxVQUFJLFNBQVMsRUFBRSxDQUFGLENBQWI7QUFDQSxrQkFBWSxrQkFBa0IsQ0FBbEIsRUFBcUIsTUFBckIsQ0FBWjtBQUNBLFVBQUksYUFBYSxLQUFqQixFQUF3QixNQUFNLFNBQU4sRUFBaUIsTUFBakI7QUFDekI7QUFDRjs7QUFFRCxXQUFTLGNBQVQsQ0FBd0IsQ0FBeEIsRUFBMkIsQ0FBM0IsRUFBOEI7QUFDNUI7QUFDQTtBQUNBLFFBQUksQ0FBQyxLQUFMLEVBQVk7QUFDVixhQUFPLGNBQWMsQ0FBZCxFQUFpQixDQUFqQixDQUFQO0FBQ0Q7QUFDRDtBQUhBLFNBSUs7QUFDSDtBQUNBLFlBQUksRUFBRSxFQUFGLEdBQU8sRUFBRSxFQUFULEtBQWdCLENBQWhCLElBQXFCLEVBQUUsRUFBRixHQUFPLEVBQUUsRUFBVCxLQUFnQixDQUF6QyxFQUE0QztBQUMxQztBQUNBO0FBQ0E7QUFDQSxpQkFBTyxzQkFBc0IsQ0FBdEIsRUFBeUIsQ0FBekIsRUFBNEIsTUFBNUIsQ0FBUDtBQUNELFNBTEQsTUFLTztBQUNMO0FBQ0EsaUJBQU8sZ0JBQWdCLENBQWhCLEVBQW1CLENBQW5CLEVBQXNCLE1BQXRCLEVBQThCLE1BQTlCLENBQVA7QUFDRDtBQUNGO0FBQ0Y7O0FBRUQsV0FBUyxvQkFBVCxDQUE4QixDQUE5QixFQUFpQyxDQUFqQyxFQUFvQztBQUNsQztBQUNBO0FBQ0EsUUFBSSxDQUFDLEtBQUwsRUFBWTtBQUNWLGFBQU8saUJBQWlCLENBQWpCLEVBQW9CLENBQXBCLEVBQXVCLE1BQXZCLENBQVA7QUFDRCxLQUZELE1BRU87QUFDTCxhQUFPLG1CQUFtQixDQUFuQixFQUFzQixDQUF0QixFQUF5QixNQUF6QixFQUFpQyxNQUFqQyxDQUFQO0FBQ0Q7QUFDRjs7QUFFRCxXQUFTLGlCQUFULENBQTJCLENBQTNCLEVBQThCLENBQTlCLEVBQWlDO0FBQy9CO0FBQ0E7QUFDQSxRQUFJLENBQUMsS0FBTCxFQUFZO0FBQ1YsYUFBTyx1QkFBdUIsQ0FBdkIsRUFBMEIsQ0FBMUIsRUFBNkIsTUFBN0IsQ0FBUDtBQUNELEtBRkQsTUFFTztBQUNMLGFBQU8seUJBQXlCLENBQXpCLEVBQTRCLENBQTVCLEVBQStCLE1BQS9CLEVBQXVDLE1BQXZDLENBQVA7QUFDRDtBQUNGO0FBQ0Y7Ozs7Ozs7Ozs7O1FDenVCZSxVLEdBQUEsVTtRQWlCQSxNLEdBQUEsTTtRQTBEQSx1QixHQUFBLHVCO1FBaUVBLE0sR0FBQSxNO1FBNkNBLFMsR0FBQSxTO1FBNENBLE0sR0FBQSxNO1FBa0NBLEksR0FBQSxJO1FBOENBLEksR0FBQSxJO1FBb0RBLEssR0FBQSxLO1FBMEtBLE0sR0FBQSxNO1FBT0EsSyxHQUFBLEs7UUFVQSxNLEdBQUEsTTtRQVNBLFMsR0FBQSxTO1FBOEJBLE0sR0FBQSxNO1FBb0tBLGMsR0FBQSxjO1FBb0ZBLE8sR0FBQSxPO1FBK0JBLEksR0FBQSxJO1FBa0NBLFksR0FBQSxZO1FBcUhBLFUsR0FBQSxVOzs7Ozs7OztBQWx4Q1QsSUFBSSw4Q0FBbUIsRUFBdkI7QUFDQSxJQUFJLDRCQUFVLEVBQWQ7QUFDQSxJQUFJLGdDQUFZLEVBQWhCOztJQUVELGE7QUFDRiw2QkFBYztBQUFBOztBQUNWO0FBQ0EsYUFBSyxDQUFMLEdBQVMsQ0FBVDtBQUNBLGFBQUssQ0FBTCxHQUFTLENBQVQ7QUFDQSxhQUFLLEtBQUwsR0FBYSxDQUFiO0FBQ0EsYUFBSyxNQUFMLEdBQWMsQ0FBZDs7QUFFQTtBQUNBLGFBQUssUUFBTCxHQUFnQixDQUFoQjtBQUNBLGFBQUssS0FBTCxHQUFhLENBQWI7QUFDQSxhQUFLLE9BQUwsR0FBZSxJQUFmO0FBQ0EsYUFBSyxNQUFMLEdBQWMsQ0FBZDtBQUNBLGFBQUssTUFBTCxHQUFjLENBQWQ7O0FBRUE7QUFDQTtBQUNBLGFBQUssTUFBTCxHQUFjLEdBQWQ7QUFDQSxhQUFLLE1BQUwsR0FBYyxHQUFkOztBQUVBO0FBQ0EsYUFBSyxFQUFMLEdBQVUsQ0FBVjtBQUNBLGFBQUssRUFBTCxHQUFVLENBQVY7O0FBRUE7QUFDQSxhQUFLLE1BQUwsR0FBYyxDQUFkOztBQUVBLGFBQUssUUFBTCxHQUFnQixFQUFoQjtBQUNBLGFBQUssTUFBTCxHQUFjLFNBQWQ7O0FBRUE7QUFDQSxhQUFLLE1BQUwsR0FBYyxLQUFkO0FBQ0EsYUFBSyxXQUFMLEdBQW1CLDBCQUFuQjtBQUNBLGFBQUssYUFBTCxHQUFxQixDQUFyQjtBQUNBLGFBQUssYUFBTCxHQUFxQixDQUFyQjtBQUNBLGFBQUssVUFBTCxHQUFrQixDQUFsQjs7QUFFQSxhQUFLLFNBQUwsR0FBaUIsU0FBakI7O0FBRUE7QUFDQTtBQUNBLGFBQUssTUFBTCxHQUFjLEVBQWQ7QUFDQSxhQUFLLElBQUwsR0FBWSxJQUFaO0FBQ0EsYUFBSyxhQUFMLEdBQXFCLENBQXJCO0FBQ0EsYUFBSyxPQUFMLEdBQWUsS0FBZjs7QUFFQTtBQUNBLGFBQUssVUFBTCxHQUFrQixTQUFsQjs7QUFFQTtBQUNBLGFBQUssU0FBTCxHQUFpQixLQUFqQjs7QUFFQTtBQUNBLGFBQUssWUFBTCxHQUFvQixLQUFwQjtBQUNIOztBQUVEOzs7Ozs7O0FBMkJBO2lDQUNTLE0sRUFBUTtBQUNiLGdCQUFHLE9BQU8sTUFBVixFQUFrQjtBQUNkLHVCQUFPLE1BQVAsQ0FBYyxXQUFkLENBQTBCLE1BQTFCO0FBQ0g7QUFDRCxtQkFBTyxNQUFQLEdBQWdCLElBQWhCO0FBQ0EsaUJBQUssUUFBTCxDQUFjLElBQWQsQ0FBbUIsTUFBbkI7QUFDSDs7O29DQUVXLE0sRUFBUTtBQUNoQixnQkFBRyxPQUFPLE1BQVAsS0FBa0IsSUFBckIsRUFBMkI7QUFDdkIscUJBQUssUUFBTCxDQUFjLE1BQWQsQ0FBcUIsS0FBSyxRQUFMLENBQWMsT0FBZCxDQUFzQixNQUF0QixDQUFyQixFQUFvRCxDQUFwRDtBQUNILGFBRkQsTUFFTztBQUNILHNCQUFNLElBQUksS0FBSixDQUFVLFNBQVMscUJBQVQsR0FBaUMsSUFBM0MsQ0FBTjtBQUNIO0FBQ0o7OztxQ0FVWSxNLEVBQVEsTSxFQUFRO0FBQ3pCLGdCQUFJLFNBQVMsS0FBSyxRQUFMLENBQWMsT0FBZCxDQUFzQixNQUF0QixDQUFiO0FBQUEsZ0JBQ0ksU0FBUyxLQUFLLFFBQUwsQ0FBYyxPQUFkLENBQXNCLE1BQXRCLENBRGI7O0FBR0EsZ0JBQUcsV0FBVyxDQUFDLENBQVosSUFBaUIsV0FBVyxDQUFDLENBQWhDLEVBQW1DO0FBQy9CLHVCQUFPLFVBQVAsR0FBb0IsTUFBcEI7QUFDQSx1QkFBTyxVQUFQLEdBQW9CLE1BQXBCOztBQUVBLHFCQUFLLFFBQUwsQ0FBYyxNQUFkLElBQXdCLE1BQXhCO0FBQ0EscUJBQUssUUFBTCxDQUFjLE1BQWQsSUFBd0IsTUFBeEI7QUFDSCxhQU5ELE1BTU87QUFDSCxzQkFBTSxJQUFJLEtBQUosaURBQXdELElBQXhELENBQU47QUFDSDtBQUNKOzs7OEJBRW9CO0FBQUE7O0FBQUEsOENBQWQsWUFBYztBQUFkLDRCQUFjO0FBQUE7O0FBQ2pCLHlCQUFhLE9BQWIsQ0FBcUI7QUFBQSx1QkFBVSxNQUFLLFFBQUwsQ0FBYyxNQUFkLENBQVY7QUFBQSxhQUFyQjtBQUNIOzs7aUNBQzBCO0FBQUE7O0FBQUEsK0NBQWpCLGVBQWlCO0FBQWpCLCtCQUFpQjtBQUFBOztBQUN2Qiw0QkFBZ0IsT0FBaEIsQ0FBd0I7QUFBQSx1QkFBVSxPQUFLLFdBQUwsQ0FBaUIsTUFBakIsQ0FBVjtBQUFBLGFBQXhCO0FBQ0g7O0FBRUQ7Ozs7b0NBbUJZLEMsRUFBRyxDLEVBQUc7QUFDZCxpQkFBSyxDQUFMLEdBQVMsQ0FBVDtBQUNBLGlCQUFLLENBQUwsR0FBUyxDQUFUO0FBQ0g7Ozs7O0FBbUJEO2tDQUNVLEMsRUFBNkI7QUFBQSxnQkFBMUIsT0FBMEIsdUVBQWhCLENBQWdCO0FBQUEsZ0JBQWIsT0FBYSx1RUFBSCxDQUFHOztBQUNuQyxnQkFBSSxJQUFJLElBQVI7QUFDQSxjQUFFLENBQUYsR0FBTyxFQUFFLENBQUYsR0FBTSxFQUFFLFNBQVIsR0FBb0IsRUFBRSxTQUF2QixHQUFvQyxPQUExQztBQUNBLGNBQUUsQ0FBRixHQUFPLEVBQUUsQ0FBRixHQUFNLEVBQUUsVUFBUixHQUFxQixFQUFFLFVBQXhCLEdBQXNDLE9BQTVDO0FBQ0g7OzsrQkFDTSxDLEVBQTZCO0FBQUEsZ0JBQTFCLE9BQTBCLHVFQUFoQixDQUFnQjtBQUFBLGdCQUFiLE9BQWEsdUVBQUgsQ0FBRzs7QUFDaEMsZ0JBQUksSUFBSSxJQUFSO0FBQ0EsY0FBRSxDQUFGLEdBQU8sRUFBRSxDQUFGLEdBQU0sRUFBRSxTQUFSLEdBQW9CLEVBQUUsU0FBdkIsR0FBb0MsT0FBMUM7QUFDQSxjQUFFLENBQUYsR0FBTyxFQUFFLENBQUYsR0FBTSxFQUFFLE1BQVQsR0FBbUIsT0FBekI7QUFDSDs7O2tDQUNTLEMsRUFBNkI7QUFBQSxnQkFBMUIsT0FBMEIsdUVBQWhCLENBQWdCO0FBQUEsZ0JBQWIsT0FBYSx1RUFBSCxDQUFHOztBQUNuQyxnQkFBSSxJQUFJLElBQVI7QUFDQSxjQUFFLENBQUYsR0FBTyxFQUFFLENBQUYsR0FBTSxFQUFFLFNBQVIsR0FBb0IsRUFBRSxTQUF2QixHQUFvQyxPQUExQztBQUNBLGNBQUUsQ0FBRixHQUFPLEVBQUUsQ0FBRixHQUFNLEVBQUUsTUFBVCxHQUFtQixPQUF6QjtBQUNIOzs7aUNBQ1EsQyxFQUE2QjtBQUFBLGdCQUExQixPQUEwQix1RUFBaEIsQ0FBZ0I7QUFBQSxnQkFBYixPQUFhLHVFQUFILENBQUc7O0FBQ2xDLGdCQUFJLElBQUksSUFBUjtBQUNBLGNBQUUsQ0FBRixHQUFPLEVBQUUsQ0FBRixHQUFNLEVBQUUsS0FBVCxHQUFrQixPQUF4QjtBQUNBLGNBQUUsQ0FBRixHQUFPLEVBQUUsQ0FBRixHQUFNLEVBQUUsVUFBUixHQUFxQixFQUFFLFVBQXhCLEdBQXNDLE9BQTVDO0FBQ0g7OztnQ0FDTyxDLEVBQTZCO0FBQUEsZ0JBQTFCLE9BQTBCLHVFQUFoQixDQUFnQjtBQUFBLGdCQUFiLE9BQWEsdUVBQUgsQ0FBRzs7QUFDakMsZ0JBQUksSUFBSSxJQUFSO0FBQ0EsY0FBRSxDQUFGLEdBQU8sRUFBRSxDQUFGLEdBQU0sRUFBRSxLQUFULEdBQWtCLE9BQXhCO0FBQ0EsY0FBRSxDQUFGLEdBQU8sRUFBRSxDQUFGLEdBQU0sRUFBRSxVQUFSLEdBQXFCLEVBQUUsVUFBeEIsR0FBc0MsT0FBNUM7QUFDSDs7QUFFRDs7Ozs0QkE3SVM7QUFDTCxnQkFBRyxLQUFLLE1BQVIsRUFBZ0I7QUFDWix1QkFBTyxLQUFLLENBQUwsR0FBUyxLQUFLLE1BQUwsQ0FBWSxFQUE1QjtBQUNILGFBRkQsTUFFTztBQUNILHVCQUFPLEtBQUssQ0FBWjtBQUNIO0FBQ0o7Ozs0QkFDUTtBQUNMLGdCQUFHLEtBQUssTUFBUixFQUFnQjtBQUNaLHVCQUFPLEtBQUssQ0FBTCxHQUFTLEtBQUssTUFBTCxDQUFZLEVBQTVCO0FBQ0gsYUFGRCxNQUVPO0FBQ0gsdUJBQU8sS0FBSyxDQUFaO0FBQ0g7QUFDSjs7QUFFRDs7Ozs0QkFDWTtBQUNSLG1CQUFPLEtBQUssTUFBWjtBQUNILFM7MEJBQ1MsSyxFQUFPO0FBQ2IsaUJBQUssTUFBTCxHQUFjLEtBQWQ7QUFDQSxnQkFBRyxLQUFLLE1BQVIsRUFBZ0I7QUFDWixxQkFBSyxNQUFMLENBQVksUUFBWixDQUFxQixJQUFyQixDQUEwQixVQUFDLENBQUQsRUFBSSxDQUFKO0FBQUEsMkJBQVUsRUFBRSxLQUFGLEdBQVUsRUFBRSxLQUF0QjtBQUFBLGlCQUExQjtBQUNIO0FBQ0o7Ozs0QkFtQlc7QUFDUixnQkFBRyxLQUFLLFFBQUwsQ0FBYyxNQUFkLEtBQXlCLENBQTVCLEVBQStCO0FBQzNCLHVCQUFPLElBQVA7QUFDSCxhQUZELE1BRU87QUFDSCx1QkFBTyxLQUFQO0FBQ0g7QUFDSjs7OzRCQXlCZTtBQUNaLG1CQUFPLEtBQUssS0FBTCxHQUFhLENBQXBCO0FBQ0g7Ozs0QkFDZ0I7QUFDYixtQkFBTyxLQUFLLE1BQUwsR0FBYyxDQUFyQjtBQUNIOzs7NEJBRWE7QUFDVixtQkFBTyxLQUFLLENBQUwsR0FBUyxLQUFLLFNBQXJCO0FBQ0g7Ozs0QkFDYTtBQUNWLG1CQUFPLEtBQUssQ0FBTCxHQUFTLEtBQUssVUFBckI7QUFDSDs7QUFFRDs7Ozs0QkFDZTtBQUNYLG1CQUFPLEVBQUMsR0FBRyxLQUFLLENBQVQsRUFBWSxHQUFHLEtBQUssQ0FBcEIsRUFBUDtBQUNIOzs7NEJBTWlCO0FBQ2QsbUJBQU87QUFDSCxtQkFBRyxDQURBO0FBRUgsbUJBQUcsQ0FGQTtBQUdILHVCQUFPLEtBQUssS0FIVDtBQUlILHdCQUFRLEtBQUs7QUFKVixhQUFQO0FBTUg7Ozs0QkFDa0I7QUFDZixtQkFBTztBQUNILG1CQUFHLEtBQUssRUFETDtBQUVILG1CQUFHLEtBQUssRUFGTDtBQUdILHVCQUFPLEtBQUssRUFBTCxHQUFVLEtBQUssS0FIbkI7QUFJSCx3QkFBUSxLQUFLLEVBQUwsR0FBVSxLQUFLO0FBSnBCLGFBQVA7QUFNSDs7OzRCQThCa0I7QUFDZixtQkFBTyxLQUFLLGFBQVo7QUFDSDs7QUFFRDs7Ozs0QkFDZTtBQUNYLG1CQUFPLEtBQUssU0FBWjtBQUNILFM7MEJBQ1ksSyxFQUFPO0FBQ2hCLGdCQUFHLFVBQVUsSUFBVixJQUFrQixLQUFLLFNBQUwsS0FBbUIsS0FBeEMsRUFBK0M7QUFDM0MsdUJBQU8sZ0JBQVAsQ0FBd0IsSUFBeEIsRUFBOEI7QUFDMUIsOEJBQVU7QUFDTiwyQkFETSxpQkFDQztBQUNILG1DQUFPLEtBQUssS0FBWjtBQUNILHlCQUhLO0FBSU4sMkJBSk0sZUFJRCxLQUpDLEVBSU07QUFDUixpQ0FBSyxLQUFMLEdBQWEsS0FBYjtBQUNBLGlDQUFLLE1BQUwsR0FBYyxLQUFkO0FBQ0gseUJBUEs7O0FBUU4sb0NBQVksSUFSTixFQVFZLGNBQWM7QUFSMUIscUJBRGdCO0FBVzFCLDRCQUFRO0FBQ0osMkJBREksaUJBQ0c7QUFDSCxtQ0FBTyxLQUFLLFNBQVo7QUFDSCx5QkFIRztBQUlKLDJCQUpJLGVBSUMsS0FKRCxFQUlRO0FBQ1IsaUNBQUssS0FBTCxHQUFhLFFBQVEsQ0FBckI7QUFDQSxpQ0FBSyxNQUFMLEdBQWMsUUFBUSxDQUF0QjtBQUNILHlCQVBHOztBQVFKLG9DQUFZLElBUlIsRUFRYyxjQUFjO0FBUjVCO0FBWGtCLGlCQUE5Qjs7QUF1QkEscUJBQUssU0FBTCxHQUFpQixJQUFqQjtBQUNIOztBQUVELGdCQUFHLFVBQVUsS0FBVixJQUFtQixLQUFLLFNBQUwsS0FBbUIsSUFBekMsRUFBK0M7QUFDM0MsdUJBQU8sS0FBSyxRQUFaO0FBQ0EsdUJBQU8sS0FBSyxNQUFaO0FBQ0EscUJBQUssU0FBTCxHQUFpQixLQUFqQjtBQUNIO0FBQ0o7O0FBRUQ7Ozs7NEJBQ2dCO0FBQ1osbUJBQU8sS0FBSyxVQUFaO0FBQ0gsUzswQkFDYSxLLEVBQU87QUFDakIsZ0JBQUcsVUFBVSxJQUFiLEVBQW1CO0FBQ2YsaUNBQWlCLElBQWpCLENBQXNCLElBQXRCO0FBQ0EscUJBQUssVUFBTCxHQUFrQixJQUFsQjtBQUNIOztBQUVELGdCQUFHLFVBQVUsS0FBYixFQUFvQjtBQUNoQixpQ0FBaUIsTUFBakIsQ0FBd0IsaUJBQWlCLE9BQWpCLENBQXlCLElBQXpCLENBQXhCLEVBQXdELENBQXhEO0FBQ0EscUJBQUssVUFBTCxHQUFrQixLQUFsQjtBQUNIO0FBQ0o7Ozs0QkFFaUI7QUFDZCxtQkFBTyxLQUFLLFlBQVo7QUFDSCxTOzBCQUNlLEssRUFBTztBQUNuQixnQkFBRyxVQUFVLElBQWIsRUFBbUI7QUFDZixnQ0FBZ0IsSUFBaEI7QUFDQSx3QkFBUSxJQUFSLENBQWEsSUFBYjs7QUFFQSxxQkFBSyxZQUFMLEdBQW9CLElBQXBCO0FBQ0g7QUFDRCxnQkFBRyxVQUFVLEtBQWIsRUFBb0I7QUFDaEIsd0JBQVEsTUFBUixDQUFlLFFBQVEsT0FBUixDQUFnQixJQUFoQixDQUFmLEVBQXNDLENBQXRDO0FBQ0EscUJBQUssWUFBTCxHQUFvQixLQUFwQjtBQUNIO0FBQ0o7Ozs7OztBQUdFLElBQUksd0JBQVEsSUFBSSxhQUFKLEVBQVo7O0FBRUEsU0FBUyxVQUFULEdBSUw7QUFBQSxRQUhFLEtBR0YsdUVBSFUsR0FHVjtBQUFBLFFBSGUsTUFHZix1RUFId0IsR0FHeEI7QUFBQSxRQUZFLE1BRUYsdUVBRlcsa0JBRVg7QUFBQSxRQURFLGVBQ0YsdUVBRG9CLE9BQ3BCOztBQUNFLFFBQUksU0FBUyxTQUFTLGFBQVQsQ0FBdUIsUUFBdkIsQ0FBYjtBQUNBLFdBQU8sS0FBUCxHQUFlLEtBQWY7QUFDQSxXQUFPLE1BQVAsR0FBZ0IsTUFBaEI7QUFDQSxXQUFPLEtBQVAsQ0FBYSxNQUFiLEdBQXNCLE1BQXRCO0FBQ0EsV0FBTyxLQUFQLENBQWEsZUFBYixHQUErQixlQUEvQjtBQUNBLGFBQVMsSUFBVCxDQUFjLFdBQWQsQ0FBMEIsTUFBMUI7O0FBRUEsV0FBTyxHQUFQLEdBQWEsT0FBTyxVQUFQLENBQWtCLElBQWxCLENBQWI7O0FBRUEsV0FBTyxNQUFQO0FBQ0g7O0FBRU0sU0FBUyxNQUFULENBQWdCLE1BQWhCLEVBQXdCO0FBQzNCLFFBQUksTUFBTSxPQUFPLEdBQWpCOztBQUVBLFFBQUksU0FBSixDQUFjLENBQWQsRUFBaUIsQ0FBakIsRUFBb0IsT0FBTyxLQUEzQixFQUFrQyxPQUFPLE1BQXpDOztBQUVBO0FBQ0EsUUFBRyxlQUFILEVBQW9CO0FBQ2hCLHdCQUFnQixNQUFoQixDQUF1QixHQUF2QjtBQUNIOztBQUVELFVBQU0sUUFBTixDQUFlLE9BQWYsQ0FBdUIsa0JBQVU7QUFDN0Isc0JBQWMsTUFBZDtBQUNILEtBRkQ7O0FBSUEsYUFBUyxhQUFULENBQXVCLE1BQXZCLEVBQStCO0FBQzNCLFlBQ0ksT0FBTyxPQUFQLElBQ0csT0FBTyxFQUFQLEdBQVksT0FBTyxLQUFQLEdBQWUsT0FBTyxLQURyQyxJQUVHLE9BQU8sRUFBUCxHQUFZLE9BQU8sS0FBbkIsSUFBNEIsQ0FBQyxPQUFPLEtBRnZDLElBR0csT0FBTyxFQUFQLEdBQVksT0FBTyxNQUFQLEdBQWdCLE9BQU8sTUFIdEMsSUFJRyxPQUFPLEVBQVAsR0FBWSxPQUFPLE1BQW5CLElBQTZCLENBQUMsT0FBTyxNQUw1QyxFQU1FO0FBQ0UsZ0JBQUksSUFBSjs7QUFFQSxnQkFBSSxTQUFKLENBQ0ksT0FBTyxDQUFQLEdBQVksT0FBTyxLQUFQLEdBQWUsT0FBTyxNQUR0QyxFQUVJLE9BQU8sQ0FBUCxHQUFZLE9BQU8sTUFBUCxHQUFnQixPQUFPLE1BRnZDOztBQUtBLGdCQUFJLE1BQUosQ0FBVyxPQUFPLFFBQWxCO0FBQ0EsZ0JBQUksV0FBSixHQUFrQixPQUFPLEtBQVAsR0FBZSxPQUFPLE1BQVAsQ0FBYyxLQUEvQztBQUNBLGdCQUFJLEtBQUosQ0FBVSxPQUFPLE1BQWpCLEVBQXlCLE9BQU8sTUFBaEM7O0FBRUEsZ0JBQUcsT0FBTyxNQUFWLEVBQWtCO0FBQ2Qsb0JBQUksV0FBSixHQUFrQixPQUFPLFdBQXpCO0FBQ0Esb0JBQUksYUFBSixHQUFvQixPQUFPLGFBQTNCO0FBQ0Esb0JBQUksYUFBSixHQUFvQixPQUFPLGFBQTNCO0FBQ0Esb0JBQUksVUFBSixHQUFpQixPQUFPLFVBQXhCO0FBQ0g7O0FBRUQsZ0JBQUcsT0FBTyxTQUFWLEVBQXFCLElBQUksd0JBQUosR0FBK0IsT0FBTyxTQUF0Qzs7QUFFckIsZ0JBQUcsT0FBTyxNQUFWLEVBQ0ksT0FBTyxNQUFQLENBQWMsR0FBZDs7QUFFSixnQkFBRyxPQUFPLFFBQVAsSUFBbUIsT0FBTyxRQUFQLENBQWdCLE1BQWhCLEdBQXlCLENBQS9DLEVBQWtEO0FBQzlDLG9CQUFJLFNBQUosQ0FBYyxDQUFDLE9BQU8sS0FBUixHQUFnQixPQUFPLE1BQXJDLEVBQTZDLENBQUMsT0FBTyxNQUFSLEdBQWlCLE9BQU8sTUFBckU7O0FBRUEsdUJBQU8sUUFBUCxDQUFnQixPQUFoQixDQUF3QixpQkFBUztBQUM3QixrQ0FBYyxLQUFkO0FBQ0gsaUJBRkQ7QUFHSDs7QUFFRCxnQkFBSSxPQUFKO0FBQ0g7QUFDSjtBQUNKOztBQUVNLFNBQVMsdUJBQVQsQ0FBaUMsTUFBakMsRUFBeUMsU0FBekMsRUFBb0Q7QUFDdkQsUUFBSSxNQUFNLE9BQU8sR0FBakI7O0FBRUEsUUFBSSxTQUFKLENBQWMsQ0FBZCxFQUFpQixDQUFqQixFQUFvQixPQUFPLEtBQTNCLEVBQWtDLE9BQU8sTUFBekM7O0FBRUEsVUFBTSxRQUFOLENBQWUsT0FBZixDQUF1QixrQkFBVTtBQUM3QixzQkFBYyxNQUFkO0FBQ0gsS0FGRDs7QUFJQSxhQUFTLGFBQVQsQ0FBdUIsTUFBdkIsRUFBK0I7QUFDM0IsWUFDSSxPQUFPLE9BQVAsSUFDRyxPQUFPLEVBQVAsR0FBWSxPQUFPLEtBQVAsR0FBZSxPQUFPLEtBRHJDLElBRUcsT0FBTyxFQUFQLEdBQVksT0FBTyxLQUFuQixJQUE0QixDQUFDLE9BQU8sS0FGdkMsSUFHRyxPQUFPLEVBQVAsR0FBWSxPQUFPLE1BQVAsR0FBZ0IsT0FBTyxNQUh0QyxJQUlHLE9BQU8sRUFBUCxHQUFZLE9BQU8sTUFBbkIsSUFBNkIsQ0FBQyxPQUFPLE1BTDVDLEVBTUU7QUFDRSxnQkFBSSxJQUFKOztBQUVBLGdCQUFHLE9BQU8sU0FBUCxLQUFxQixTQUF4QixFQUFtQztBQUMvQix1QkFBTyxPQUFQLEdBQWlCLENBQUMsT0FBTyxDQUFQLEdBQVcsT0FBTyxTQUFuQixJQUFnQyxTQUFoQyxHQUE0QyxPQUFPLFNBQXBFO0FBQ0gsYUFGRCxNQUVPO0FBQ0gsdUJBQU8sT0FBUCxHQUFpQixPQUFPLENBQXhCO0FBQ0g7O0FBRUQsZ0JBQUcsT0FBTyxTQUFQLEtBQXFCLFNBQXhCLEVBQW1DO0FBQy9CLHVCQUFPLE9BQVAsR0FBaUIsQ0FBQyxPQUFPLENBQVAsR0FBVyxPQUFPLFNBQW5CLElBQWdDLFNBQWhDLEdBQTRDLE9BQU8sU0FBcEU7QUFDSCxhQUZELE1BRU87QUFDSCx1QkFBTyxPQUFQLEdBQWlCLE9BQU8sQ0FBeEI7QUFDSDs7QUFFRCxnQkFBSSxTQUFKLENBQ0ksT0FBTyxPQUFQLEdBQWtCLE9BQU8sS0FBUCxHQUFlLE9BQU8sTUFENUMsRUFFSSxPQUFPLE9BQVAsR0FBa0IsT0FBTyxNQUFQLEdBQWdCLE9BQU8sTUFGN0M7O0FBS0EsZ0JBQUksTUFBSixDQUFXLE9BQU8sUUFBbEI7QUFDQSxnQkFBSSxXQUFKLEdBQWtCLE9BQU8sS0FBUCxHQUFlLE9BQU8sTUFBUCxDQUFjLEtBQS9DO0FBQ0EsZ0JBQUksS0FBSixDQUFVLE9BQU8sTUFBakIsRUFBeUIsT0FBTyxNQUFoQzs7QUFFQSxnQkFBRyxPQUFPLE1BQVYsRUFBa0I7QUFDZCxvQkFBSSxXQUFKLEdBQWtCLE9BQU8sV0FBekI7QUFDQSxvQkFBSSxhQUFKLEdBQW9CLE9BQU8sYUFBM0I7QUFDQSxvQkFBSSxhQUFKLEdBQW9CLE9BQU8sYUFBM0I7QUFDQSxvQkFBSSxVQUFKLEdBQWlCLE9BQU8sVUFBeEI7QUFDSDs7QUFFRCxnQkFBRyxPQUFPLFNBQVYsRUFBcUIsSUFBSSx3QkFBSixHQUErQixPQUFPLFNBQXRDOztBQUVyQixnQkFBRyxPQUFPLE1BQVYsRUFDSSxPQUFPLE1BQVAsQ0FBYyxHQUFkOztBQUVKLGdCQUFHLE9BQU8sUUFBUCxJQUFtQixPQUFPLFFBQVAsQ0FBZ0IsTUFBaEIsR0FBeUIsQ0FBL0MsRUFBa0Q7QUFDOUMsb0JBQUksU0FBSixDQUFjLENBQUMsT0FBTyxLQUFSLEdBQWdCLE9BQU8sTUFBckMsRUFBNkMsQ0FBQyxPQUFPLE1BQVIsR0FBaUIsT0FBTyxNQUFyRTs7QUFFQSx1QkFBTyxRQUFQLENBQWdCLE9BQWhCLENBQXdCLGlCQUFTO0FBQzdCLGtDQUFjLEtBQWQ7QUFDSCxpQkFGRDtBQUdIOztBQUVELGdCQUFJLE9BQUo7QUFDSDtBQUNKO0FBQ0o7O0FBRU0sU0FBUyxNQUFULEdBQW9DO0FBQUEsdUNBQWpCLGVBQWlCO0FBQWpCLHVCQUFpQjtBQUFBOztBQUN2QyxvQkFBZ0IsT0FBaEIsQ0FBd0Isa0JBQVU7QUFDOUIsZUFBTyxNQUFQLENBQWMsV0FBZCxDQUEwQixNQUExQjtBQUNILEtBRkQ7QUFHSDs7SUFFSyxTOzs7QUFDRix5QkFRRTtBQUFBLFlBUEUsS0FPRix1RUFQVSxFQU9WO0FBQUEsWUFORSxNQU1GLHVFQU5XLEVBTVg7QUFBQSxZQUxFLFNBS0YsdUVBTGMsTUFLZDtBQUFBLFlBSkUsV0FJRix1RUFKZ0IsTUFJaEI7QUFBQSxZQUhFLFNBR0YsdUVBSGMsQ0FHZDtBQUFBLFlBRkUsQ0FFRix1RUFGTSxDQUVOO0FBQUEsWUFERSxDQUNGLHVFQURNLENBQ047O0FBQUE7O0FBQUE7O0FBR0UsZUFBTyxNQUFQLFNBQ1UsRUFBQyxZQUFELEVBQVEsY0FBUixFQUFnQixvQkFBaEIsRUFBMkIsd0JBQTNCLEVBQXdDLG9CQUF4QyxFQUFtRCxJQUFuRCxFQUFzRCxJQUF0RCxFQURWOztBQUlBLGVBQUssSUFBTCxHQUFZLEtBQVo7QUFQRjtBQVFEOzs7OytCQUVNLEcsRUFBSztBQUNSLGdCQUFJLFdBQUosR0FBa0IsS0FBSyxXQUF2QjtBQUNBLGdCQUFJLFNBQUosR0FBZ0IsS0FBSyxTQUFyQjtBQUNBLGdCQUFJLFNBQUosR0FBZ0IsS0FBSyxTQUFyQjs7QUFFQSxnQkFBSSxTQUFKO0FBQ0EsZ0JBQUksSUFBSixDQUNJLENBQUMsS0FBSyxLQUFOLEdBQWMsS0FBSyxNQUR2QixFQUVJLENBQUMsS0FBSyxNQUFOLEdBQWUsS0FBSyxNQUZ4QixFQUdJLEtBQUssS0FIVCxFQUlJLEtBQUssTUFKVDs7QUFPQSxnQkFBRyxLQUFLLFdBQUwsS0FBcUIsTUFBeEIsRUFBZ0MsSUFBSSxNQUFKO0FBQ2hDLGdCQUFHLEtBQUssU0FBTCxLQUFtQixNQUF0QixFQUE4QixJQUFJLElBQUo7QUFDOUIsZ0JBQUcsS0FBSyxJQUFMLElBQWEsS0FBSyxJQUFMLEtBQWMsSUFBOUIsRUFBb0MsSUFBSSxJQUFKO0FBQ3ZDOzs7O0VBbkNtQixhOztBQXNDeEI7OztBQUNPLFNBQVMsU0FBVCxDQUFtQixLQUFuQixFQUEwQixNQUExQixFQUFrQyxTQUFsQyxFQUE2QyxXQUE3QyxFQUEwRCxTQUExRCxFQUFxRSxDQUFyRSxFQUF3RSxDQUF4RSxFQUEyRTtBQUM5RSxRQUFJLFNBQVMsSUFBSSxTQUFKLENBQWMsS0FBZCxFQUFxQixNQUFyQixFQUE2QixTQUE3QixFQUF3QyxXQUF4QyxFQUFxRCxTQUFyRCxFQUFnRSxDQUFoRSxFQUFtRSxDQUFuRSxDQUFiO0FBQ0EsVUFBTSxRQUFOLENBQWUsTUFBZjtBQUNBLFdBQU8sTUFBUDtBQUNIOztJQUVLLE07OztBQUNGLHNCQU9FO0FBQUEsWUFORSxRQU1GLHVFQU5hLEVBTWI7QUFBQSxZQUxFLFNBS0YsdUVBTGMsTUFLZDtBQUFBLFlBSkUsV0FJRix1RUFKZ0IsTUFJaEI7QUFBQSxZQUhFLFNBR0YsdUVBSGMsQ0FHZDtBQUFBLFlBRkUsQ0FFRix1RUFGTSxDQUVOO0FBQUEsWUFERSxDQUNGLHVFQURNLENBQ047O0FBQUE7O0FBQUE7O0FBRUUsZUFBSyxRQUFMLEdBQWdCLElBQWhCOztBQUVBLGVBQU8sTUFBUCxTQUFvQixFQUFDLGtCQUFELEVBQVcsb0JBQVgsRUFBc0Isd0JBQXRCLEVBQW1DLG9CQUFuQyxFQUE4QyxJQUE5QyxFQUFpRCxJQUFqRCxFQUFwQjs7QUFFQSxlQUFLLElBQUwsR0FBWSxLQUFaO0FBTkY7QUFPRDs7OzsrQkFFTyxHLEVBQUs7QUFDVCxnQkFBSSxXQUFKLEdBQWtCLEtBQUssV0FBdkI7QUFDQSxnQkFBSSxTQUFKLEdBQWdCLEtBQUssU0FBckI7QUFDQSxnQkFBSSxTQUFKLEdBQWdCLEtBQUssU0FBckI7O0FBRUEsZ0JBQUksU0FBSjtBQUNBLGdCQUFJLEdBQUosQ0FDSSxLQUFLLE1BQUwsR0FBZSxDQUFDLEtBQUssUUFBTixHQUFpQixLQUFLLE1BRHpDLEVBRUksS0FBSyxNQUFMLEdBQWUsQ0FBQyxLQUFLLFFBQU4sR0FBaUIsS0FBSyxNQUZ6QyxFQUdJLEtBQUssTUFIVCxFQUlJLENBSkosRUFJTyxJQUFJLEtBQUssRUFKaEIsRUFLSSxLQUxKOztBQVFBLGdCQUFHLEtBQUssV0FBTCxLQUFxQixNQUF4QixFQUFnQyxJQUFJLE1BQUo7QUFDaEMsZ0JBQUcsS0FBSyxTQUFMLEtBQW1CLE1BQXRCLEVBQThCLElBQUksSUFBSjtBQUM5QixnQkFBRyxLQUFLLElBQUwsSUFBYSxLQUFLLElBQUwsS0FBYyxJQUE5QixFQUFvQyxJQUFJLElBQUo7QUFDdkM7Ozs7RUFsQ2dCLGE7O0FBcUNyQjs7O0FBQ08sU0FBUyxNQUFULENBQWdCLFFBQWhCLEVBQTBCLFNBQTFCLEVBQXFDLFdBQXJDLEVBQWtELFNBQWxELEVBQTZELENBQTdELEVBQWdFLENBQWhFLEVBQW1FO0FBQ3RFLFFBQUksU0FBUyxJQUFJLE1BQUosQ0FBVyxRQUFYLEVBQXFCLFNBQXJCLEVBQWdDLFdBQWhDLEVBQTZDLFNBQTdDLEVBQXdELENBQXhELEVBQTJELENBQTNELENBQWI7QUFDQSxVQUFNLFFBQU4sQ0FBZSxNQUFmO0FBQ0EsV0FBTyxNQUFQO0FBQ0g7O0lBRUssSTs7O0FBQ0Ysb0JBT0U7QUFBQSxZQU5FLFdBTUYsdUVBTmdCLE1BTWhCO0FBQUEsWUFMRSxTQUtGLHVFQUxjLENBS2Q7QUFBQSxZQUpFLEVBSUYsdUVBSk8sQ0FJUDtBQUFBLFlBSEUsRUFHRix1RUFITyxDQUdQO0FBQUEsWUFGRSxFQUVGLHVFQUZPLEVBRVA7QUFBQSxZQURFLEVBQ0YsdUVBRE8sRUFDUDs7QUFBQTs7QUFBQTs7QUFHRSxlQUFPLE1BQVAsU0FBb0IsRUFBQyx3QkFBRCxFQUFjLG9CQUFkLEVBQXlCLE1BQXpCLEVBQTZCLE1BQTdCLEVBQWlDLE1BQWpDLEVBQXFDLE1BQXJDLEVBQXBCOztBQUVBLGVBQUssUUFBTCxHQUFnQixPQUFoQjtBQUxGO0FBTUQ7Ozs7K0JBRU8sRyxFQUFLO0FBQ1QsZ0JBQUksV0FBSixHQUFrQixLQUFLLFdBQXZCO0FBQ0EsZ0JBQUksU0FBSixHQUFnQixLQUFLLFNBQXJCOztBQUVBLGdCQUFJLFNBQUo7QUFDQSxnQkFBSSxNQUFKLENBQVcsS0FBSyxFQUFoQixFQUFvQixLQUFLLEVBQXpCO0FBQ0EsZ0JBQUksTUFBSixDQUFXLEtBQUssRUFBaEIsRUFBb0IsS0FBSyxFQUF6Qjs7QUFFQSxnQkFBRyxLQUFLLFdBQUwsS0FBcUIsTUFBeEIsRUFBZ0MsSUFBSSxNQUFKO0FBQ25DOzs7O0VBekJjLGE7O0FBNEJaLFNBQVMsSUFBVCxDQUFjLFdBQWQsRUFBMkIsU0FBM0IsRUFBc0MsRUFBdEMsRUFBMEMsRUFBMUMsRUFBOEMsRUFBOUMsRUFBa0QsRUFBbEQsRUFBc0Q7QUFDekQsUUFBSSxTQUFTLElBQUksSUFBSixDQUFTLFdBQVQsRUFBc0IsU0FBdEIsRUFBaUMsRUFBakMsRUFBcUMsRUFBckMsRUFBeUMsRUFBekMsRUFBNkMsRUFBN0MsQ0FBYjtBQUNBLFVBQU0sUUFBTixDQUFlLE1BQWY7QUFDQSxXQUFPLE1BQVA7QUFDSDs7SUFFSyxJOzs7QUFDRixvQkFNRTtBQUFBLFlBTEUsT0FLRix1RUFMWSxRQUtaO0FBQUEsWUFKRSxJQUlGLHVFQUpTLGlCQUlUO0FBQUEsWUFIRSxTQUdGLHVFQUhjLEtBR2Q7QUFBQSxZQUZFLENBRUYsdUVBRk0sQ0FFTjtBQUFBLFlBREUsQ0FDRix1RUFETSxDQUNOOztBQUFBOztBQUFBOztBQUdFLGVBQU8sTUFBUCxTQUFvQixFQUFDLGdCQUFELEVBQVUsVUFBVixFQUFnQixvQkFBaEIsRUFBMkIsSUFBM0IsRUFBOEIsSUFBOUIsRUFBcEI7O0FBRUEsZUFBSyxZQUFMLEdBQW9CLEtBQXBCO0FBQ0EsZUFBSyxVQUFMLEdBQWtCLE1BQWxCO0FBTkY7QUFPRDs7OzsrQkFFTyxHLEVBQUs7QUFDVCxnQkFBSSxJQUFKLEdBQVcsS0FBSyxJQUFoQjtBQUNBLGdCQUFJLFdBQUosR0FBa0IsS0FBSyxXQUF2QjtBQUNBLGdCQUFJLFNBQUosR0FBZ0IsS0FBSyxTQUFyQjtBQUNBLGdCQUFJLFNBQUosR0FBZ0IsS0FBSyxTQUFyQjs7QUFFQSxnQkFBRyxLQUFLLEtBQUwsS0FBZSxDQUFsQixFQUFxQixLQUFLLEtBQUwsR0FBYSxJQUFJLFdBQUosQ0FBZ0IsS0FBSyxPQUFyQixFQUE4QixLQUEzQztBQUNyQixnQkFBRyxLQUFLLE1BQUwsS0FBZ0IsQ0FBbkIsRUFBc0IsS0FBSyxNQUFMLEdBQWMsSUFBSSxXQUFKLENBQWdCLEdBQWhCLEVBQXFCLEtBQW5DOztBQUV0QixnQkFBSSxTQUFKLENBQ0ksQ0FBQyxLQUFLLEtBQU4sR0FBYyxLQUFLLE1BRHZCLEVBRUksQ0FBQyxLQUFLLE1BQU4sR0FBZSxLQUFLLE1BRnhCOztBQUtBLGdCQUFJLFlBQUosR0FBbUIsS0FBSyxZQUF4Qjs7QUFFQSxnQkFBSSxRQUFKLENBQ0ksS0FBSyxPQURULEVBQ2tCLENBRGxCLEVBQ3FCLENBRHJCOztBQUlBLGdCQUFHLEtBQUssVUFBTCxLQUFvQixNQUF2QixFQUErQixJQUFJLE1BQUo7QUFDbEM7Ozs7RUFyQ2MsYTs7QUF3Q1osU0FBUyxJQUFULENBQWMsT0FBZCxFQUF1QixJQUF2QixFQUE2QixTQUE3QixFQUF3QyxDQUF4QyxFQUEyQyxDQUEzQyxFQUE4QztBQUNqRCxRQUFJLFNBQVMsSUFBSSxJQUFKLENBQVMsT0FBVCxFQUFrQixJQUFsQixFQUF3QixTQUF4QixFQUFtQyxDQUFuQyxFQUFzQyxDQUF0QyxDQUFiO0FBQ0EsVUFBTSxRQUFOLENBQWUsTUFBZjtBQUNBLFdBQU8sTUFBUDtBQUNIOztJQUVLLEs7OztBQUNGLHFCQUErQjtBQUFBOztBQUFBOztBQUFBLDJDQUFoQixjQUFnQjtBQUFoQiwwQkFBZ0I7QUFBQTs7QUFHM0IsdUJBQWUsT0FBZixDQUF1QjtBQUFBLG1CQUFVLE9BQUssUUFBTCxDQUFjLE1BQWQsQ0FBVjtBQUFBLFNBQXZCO0FBSDJCO0FBSTlCOzs7O2lDQUVTLE0sRUFBUTtBQUNkLGdCQUFHLE9BQU8sTUFBVixFQUFrQjtBQUNkLHVCQUFPLE1BQVAsQ0FBYyxXQUFkLENBQTBCLE1BQTFCO0FBQ0g7QUFDRCxtQkFBTyxNQUFQLEdBQWdCLElBQWhCO0FBQ0EsaUJBQUssUUFBTCxDQUFjLElBQWQsQ0FBbUIsTUFBbkI7O0FBRUEsaUJBQUssYUFBTDtBQUNIOzs7b0NBRVksTSxFQUFRO0FBQ2pCLGdCQUFHLE9BQU8sTUFBUCxLQUFrQixJQUFyQixFQUEyQjtBQUN2QixxQkFBSyxRQUFMLENBQWMsTUFBZCxDQUFxQixLQUFLLFFBQUwsQ0FBYyxPQUFkLENBQXNCLE1BQXRCLENBQXJCLEVBQW9ELENBQXBEO0FBQ0EscUJBQUssYUFBTDtBQUNILGFBSEQsTUFHTztBQUNILHNCQUFNLElBQUksS0FBSixDQUFhLE1BQWIseUJBQXVDLElBQXZDLENBQU47QUFDSDtBQUNKOzs7d0NBRWdCO0FBQUE7O0FBQ2IsZ0JBQUcsS0FBSyxRQUFMLENBQWMsTUFBZCxHQUF1QixDQUExQixFQUE2QjtBQUN6QixxQkFBSyxTQUFMLEdBQWlCLENBQWpCO0FBQ0EscUJBQUssVUFBTCxHQUFrQixDQUFsQjs7QUFFQSxxQkFBSyxRQUFMLENBQWMsT0FBZCxDQUFzQixpQkFBUztBQUMzQix3QkFBRyxNQUFNLENBQU4sR0FBVSxNQUFNLEtBQWhCLEdBQXdCLE9BQUssU0FBaEMsRUFBMkM7QUFDdkMsK0JBQUssU0FBTCxHQUFpQixNQUFNLENBQU4sR0FBVSxNQUFNLEtBQWpDO0FBQ0g7QUFDRCx3QkFBRyxNQUFNLENBQU4sR0FBVSxNQUFNLE1BQWhCLEdBQXlCLE9BQUssVUFBakMsRUFBNkM7QUFDekMsK0JBQUssVUFBTCxHQUFrQixNQUFNLENBQU4sR0FBVSxNQUFNLE1BQWxDO0FBQ0g7QUFDSixpQkFQRDs7QUFTQSxxQkFBSyxLQUFMLEdBQWEsS0FBSyxTQUFsQjtBQUNBLHFCQUFLLE1BQUwsR0FBYyxLQUFLLFVBQW5CO0FBQ0g7QUFDSjs7OztFQTNDZSxhOztBQThDYixTQUFTLEtBQVQsR0FBa0M7QUFBQSx1Q0FBaEIsY0FBZ0I7QUFBaEIsc0JBQWdCO0FBQUE7O0FBQ3JDLFFBQUksNENBQWEsS0FBYixnQkFBc0IsY0FBdEIsS0FBSjtBQUNBLFVBQU0sUUFBTixDQUFlLE1BQWY7QUFDQSxXQUFPLE1BQVA7QUFDSDs7SUFFSyxNOzs7QUFDRixvQkFDSSxNQURKLEVBSUU7QUFBQSxZQUZFLENBRUYsdUVBRk0sQ0FFTjtBQUFBLFlBREUsQ0FDRix1RUFETSxDQUNOOztBQUFBOztBQUFBOztBQUdFLGVBQU8sTUFBUCxTQUFvQixFQUFDLElBQUQsRUFBSSxJQUFKLEVBQXBCOztBQUVBLFlBQUcsa0JBQWtCLEtBQXJCLEVBQTRCO0FBQ3hCLG1CQUFLLGVBQUwsQ0FBcUIsTUFBckI7QUFDSCxTQUZELE1BR0ssSUFBRyxPQUFPLElBQVYsRUFBZ0I7QUFDakIsbUJBQUssZUFBTCxDQUFxQixNQUFyQjtBQUNILFNBRkksTUFHQSxJQUFHLE9BQU8sS0FBUCxJQUFnQixDQUFDLE9BQU8sSUFBM0IsRUFBaUM7QUFDbEMsbUJBQUssaUJBQUwsQ0FBdUIsTUFBdkI7QUFDSCxTQUZJLE1BR0EsSUFBRyxPQUFPLEtBQVAsSUFBZ0IsT0FBTyxJQUExQixFQUFnQztBQUNqQyxtQkFBSyx1QkFBTCxDQUE2QixNQUE3QjtBQUNILFNBRkksTUFHQSxJQUFHLGtCQUFrQixLQUFyQixFQUE0QjtBQUM3QixnQkFBRyxPQUFPLENBQVAsS0FBYSxPQUFPLENBQVAsRUFBVSxNQUExQixFQUFrQztBQUM5Qix1QkFBSyxxQkFBTCxDQUEyQixNQUEzQjtBQUNILGFBRkQsTUFHSyxJQUFHLE9BQU8sQ0FBUCxhQUFxQixLQUF4QixFQUErQjtBQUNoQyx1QkFBSyxnQkFBTCxDQUFzQixNQUF0QjtBQUNILGFBRkksTUFHQTtBQUNELHNCQUFNLElBQUksS0FBSiwyQkFBa0MsTUFBbEMseUJBQU47QUFDSDtBQUNKLFNBVkksTUFXQTtBQUNELGtCQUFNLElBQUksS0FBSix1QkFBOEIsTUFBOUIsd0JBQU47QUFDSDtBQTlCSDtBQStCRDs7Ozt3Q0FFZ0IsTSxFQUFRO0FBQ3JCLGdCQUFHLEVBQUUsa0JBQWtCLEtBQXBCLENBQUgsRUFBK0I7QUFDM0Isc0JBQU0sSUFBSSxLQUFKLENBQWEsTUFBYiw2QkFBTjtBQUNILGFBRkQsTUFFTztBQUNILHFCQUFLLE1BQUwsR0FBYyxNQUFkO0FBQ0EscUJBQUssT0FBTCxHQUFlLENBQWY7QUFDQSxxQkFBSyxPQUFMLEdBQWUsQ0FBZjtBQUNBLHFCQUFLLFdBQUwsR0FBbUIsT0FBTyxLQUExQjtBQUNBLHFCQUFLLFlBQUwsR0FBb0IsT0FBTyxNQUEzQjs7QUFFQSxxQkFBSyxLQUFMLEdBQWEsT0FBTyxLQUFwQjtBQUNBLHFCQUFLLE1BQUwsR0FBYyxPQUFPLE1BQXJCO0FBQ0g7QUFDSjs7O3dDQUVnQixNLEVBQVE7QUFDckIsaUJBQUssWUFBTCxHQUFvQixNQUFwQjtBQUNBLGlCQUFLLE1BQUwsR0FBYyxLQUFLLFlBQUwsQ0FBa0IsTUFBaEM7QUFDQSxpQkFBSyxPQUFMLEdBQWUsS0FBSyxZQUFMLENBQWtCLEVBQWpDO0FBQ0EsaUJBQUssT0FBTCxHQUFlLEtBQUssWUFBTCxDQUFrQixFQUFqQztBQUNBLGlCQUFLLFdBQUwsR0FBbUIsT0FBTyxLQUExQjtBQUNBLGlCQUFLLFlBQUwsR0FBb0IsT0FBTyxLQUEzQjs7QUFFQSxpQkFBSyxLQUFMLEdBQWEsS0FBSyxZQUFMLENBQWtCLENBQS9CO0FBQ0EsaUJBQUssTUFBTCxHQUFjLEtBQUssWUFBTCxDQUFrQixDQUFoQztBQUNIOzs7MENBRWtCLE0sRUFBUTtBQUN2QixnQkFBRyxFQUFFLE9BQU8sS0FBUCxZQUF3QixLQUExQixDQUFILEVBQXFDO0FBQ2pDLHNCQUFNLElBQUksS0FBSixDQUFhLE9BQU8sS0FBcEIsNkJBQU47QUFDSCxhQUZELE1BRU87QUFDSCxxQkFBSyxNQUFMLEdBQWMsT0FBTyxLQUFyQjs7QUFFQSxxQkFBSyxPQUFMLEdBQWUsT0FBTyxDQUF0QjtBQUNBLHFCQUFLLE9BQUwsR0FBZSxPQUFPLENBQXRCO0FBQ0EscUJBQUssV0FBTCxHQUFtQixPQUFPLEtBQTFCO0FBQ0EscUJBQUssWUFBTCxHQUFvQixPQUFPLE1BQTNCOztBQUVBLHFCQUFLLEtBQUwsR0FBYSxPQUFPLEtBQXBCO0FBQ0EscUJBQUssTUFBTCxHQUFjLE9BQU8sTUFBckI7QUFDSDtBQUNKOzs7Z0RBRXdCLE0sRUFBUTtBQUM3QixnQkFBRyxFQUFFLE9BQU8sS0FBUCxZQUF3QixLQUExQixDQUFILEVBQXFDO0FBQ2pDLHNCQUFNLElBQUksS0FBSixDQUFhLE9BQU8sS0FBcEIsNkJBQU47QUFDSCxhQUZELE1BRU87QUFDSCxxQkFBSyxNQUFMLEdBQWMsT0FBTyxLQUFyQjtBQUNBLHFCQUFLLE1BQUwsR0FBYyxPQUFPLElBQXJCOztBQUVBLHFCQUFLLE9BQUwsR0FBZSxLQUFLLE1BQUwsQ0FBWSxDQUFaLEVBQWUsQ0FBZixDQUFmO0FBQ0EscUJBQUssT0FBTCxHQUFlLEtBQUssTUFBTCxDQUFZLENBQVosRUFBZSxDQUFmLENBQWY7QUFDQSxxQkFBSyxXQUFMLEdBQW1CLE9BQU8sS0FBMUI7QUFDQSxxQkFBSyxZQUFMLEdBQW9CLE9BQU8sTUFBM0I7O0FBRUEscUJBQUssS0FBTCxHQUFhLE9BQU8sS0FBcEI7QUFDQSxxQkFBSyxNQUFMLEdBQWMsT0FBTyxNQUFyQjtBQUNIO0FBQ0o7Ozs4Q0FFc0IsTSxFQUFRO0FBQzNCLGlCQUFLLE1BQUwsR0FBYyxNQUFkO0FBQ0EsaUJBQUssTUFBTCxHQUFjLE9BQU8sQ0FBUCxFQUFVLE1BQXhCO0FBQ0EsaUJBQUssT0FBTCxHQUFlLE9BQU8sQ0FBUCxFQUFVLEtBQVYsQ0FBZ0IsQ0FBL0I7QUFDQSxpQkFBSyxPQUFMLEdBQWUsT0FBTyxDQUFQLEVBQVUsS0FBVixDQUFnQixDQUEvQjtBQUNBLGlCQUFLLFdBQUwsR0FBbUIsT0FBTyxDQUFQLEVBQVUsS0FBVixDQUFnQixDQUFuQztBQUNBLGlCQUFLLFlBQUwsR0FBb0IsT0FBTyxDQUFQLEVBQVUsS0FBVixDQUFnQixDQUFwQzs7QUFFQSxpQkFBSyxLQUFMLEdBQWEsT0FBTyxDQUFQLEVBQVUsS0FBVixDQUFnQixDQUE3QjtBQUNBLGlCQUFLLE1BQUwsR0FBYyxPQUFPLENBQVAsRUFBVSxLQUFWLENBQWdCLENBQTlCO0FBQ0g7Ozt5Q0FFaUIsTSxFQUFRO0FBQ3RCLGlCQUFLLE1BQUwsR0FBYyxNQUFkO0FBQ0EsaUJBQUssTUFBTCxHQUFjLE9BQU8sQ0FBUCxDQUFkO0FBQ0EsaUJBQUssT0FBTCxHQUFlLENBQWY7QUFDQSxpQkFBSyxPQUFMLEdBQWUsQ0FBZjtBQUNBLGlCQUFLLFdBQUwsR0FBbUIsT0FBTyxDQUFQLEVBQVUsS0FBN0I7QUFDQSxpQkFBSyxZQUFMLEdBQW9CLE9BQU8sQ0FBUCxFQUFVLE1BQTlCOztBQUVBLGlCQUFLLEtBQUwsR0FBYSxPQUFPLENBQVAsRUFBVSxLQUF2QjtBQUNBLGlCQUFLLE1BQUwsR0FBYyxPQUFPLENBQVAsRUFBVSxNQUF4QjtBQUNIOzs7b0NBRVksVyxFQUFhO0FBQ3RCLGdCQUFHLEtBQUssTUFBTCxDQUFZLE1BQVosR0FBcUIsQ0FBckIsSUFBMEIsY0FBYyxLQUFLLE1BQUwsQ0FBWSxNQUF2RCxFQUErRDtBQUMzRCxvQkFBRyxLQUFLLE1BQUwsQ0FBWSxDQUFaLGFBQTBCLEtBQTdCLEVBQW9DO0FBQ2hDLHlCQUFLLE9BQUwsR0FBZSxLQUFLLE1BQUwsQ0FBWSxXQUFaLEVBQXlCLENBQXpCLENBQWY7QUFDQSx5QkFBSyxPQUFMLEdBQWUsS0FBSyxNQUFMLENBQVksV0FBWixFQUF5QixDQUF6QixDQUFmO0FBQ0gsaUJBSEQsTUFJSyxJQUFHLEtBQUssTUFBTCxDQUFZLFdBQVosRUFBeUIsS0FBNUIsRUFBbUM7QUFDcEMseUJBQUssT0FBTCxHQUFlLEtBQUssTUFBTCxDQUFZLFdBQVosRUFBeUIsS0FBekIsQ0FBK0IsQ0FBOUM7QUFDQSx5QkFBSyxPQUFMLEdBQWUsS0FBSyxNQUFMLENBQVksV0FBWixFQUF5QixLQUF6QixDQUErQixDQUE5QztBQUNBLHlCQUFLLFdBQUwsR0FBbUIsS0FBSyxNQUFMLENBQVksV0FBWixFQUF5QixLQUF6QixDQUErQixDQUFsRDtBQUNBLHlCQUFLLFlBQUwsR0FBb0IsS0FBSyxNQUFMLENBQVksV0FBWixFQUF5QixLQUF6QixDQUErQixDQUFuRDtBQUNBLHlCQUFLLEtBQUwsR0FBYSxLQUFLLE1BQUwsQ0FBWSxXQUFaLEVBQXlCLEtBQXpCLENBQStCLENBQTVDO0FBQ0EseUJBQUssTUFBTCxHQUFjLEtBQUssTUFBTCxDQUFZLFdBQVosRUFBeUIsS0FBekIsQ0FBK0IsQ0FBN0M7QUFDSCxpQkFQSSxNQVFBO0FBQ0QseUJBQUssTUFBTCxHQUFjLEtBQUssTUFBTCxDQUFZLFdBQVosQ0FBZDtBQUNBLHlCQUFLLE9BQUwsR0FBZSxDQUFmO0FBQ0EseUJBQUssT0FBTCxHQUFlLENBQWY7QUFDQSx5QkFBSyxXQUFMLEdBQW1CLEtBQUssTUFBTCxDQUFZLEtBQS9CO0FBQ0EseUJBQUssWUFBTCxHQUFvQixLQUFLLE1BQUwsQ0FBWSxNQUFoQztBQUNBLHlCQUFLLEtBQUwsR0FBYSxLQUFLLE1BQUwsQ0FBWSxLQUF6QjtBQUNBLHlCQUFLLE1BQUwsR0FBYyxLQUFLLE1BQUwsQ0FBWSxNQUExQjtBQUNIOztBQUVELHFCQUFLLGFBQUwsR0FBcUIsV0FBckI7QUFDSCxhQXhCRCxNQXdCTztBQUNILHNCQUFNLElBQUksS0FBSixtQkFBMEIsV0FBMUIsdUJBQU47QUFDSDtBQUNKOzs7K0JBRU8sRyxFQUFLO0FBQ1QsZ0JBQUksU0FBSixDQUNJLEtBQUssTUFEVCxFQUVJLEtBQUssT0FGVCxFQUVrQixLQUFLLE9BRnZCLEVBR0ksS0FBSyxXQUhULEVBR3NCLEtBQUssWUFIM0IsRUFJSSxDQUFDLEtBQUssS0FBTixHQUFjLEtBQUssTUFKdkIsRUFLSSxDQUFDLEtBQUssTUFBTixHQUFlLEtBQUssTUFMeEIsRUFNSSxLQUFLLEtBTlQsRUFNZ0IsS0FBSyxNQU5yQjtBQVFIOzs7O0VBaktnQixhOztBQW9LZCxTQUFTLE1BQVQsQ0FBZ0IsTUFBaEIsRUFBd0IsQ0FBeEIsRUFBMkIsQ0FBM0IsRUFBOEI7QUFDakMsUUFBSSxTQUFTLElBQUksTUFBSixDQUFXLE1BQVgsRUFBbUIsQ0FBbkIsRUFBc0IsQ0FBdEIsQ0FBYjtBQUNBLFFBQUcsT0FBTyxNQUFQLENBQWMsTUFBZCxHQUF1QixDQUExQixFQUE2QixlQUFlLE1BQWY7QUFDN0IsVUFBTSxRQUFOLENBQWUsTUFBZjtBQUNBLFdBQU8sTUFBUDtBQUNIOztBQUVNLFNBQVMsS0FBVCxDQUFlLE1BQWYsRUFBdUIsQ0FBdkIsRUFBMEIsQ0FBMUIsRUFBNkIsS0FBN0IsRUFBb0MsTUFBcEMsRUFBNEM7QUFDL0MsUUFBSSxJQUFJLEVBQVI7QUFDQSxNQUFFLEtBQUYsR0FBVSxNQUFWO0FBQ0EsTUFBRSxDQUFGLEdBQU0sQ0FBTjtBQUNBLE1BQUUsQ0FBRixHQUFNLENBQU47QUFDQSxNQUFFLEtBQUYsR0FBVSxLQUFWO0FBQ0EsTUFBRSxNQUFGLEdBQVcsTUFBWDtBQUNBLFdBQU8sQ0FBUDtBQUNIOztBQUVNLFNBQVMsTUFBVCxDQUFnQixNQUFoQixFQUF3QixnQkFBeEIsRUFBMEMsS0FBMUMsRUFBaUQsTUFBakQsRUFBeUQ7QUFDNUQsUUFBSSxJQUFJLEVBQVI7QUFDQSxNQUFFLEtBQUYsR0FBVSxNQUFWO0FBQ0EsTUFBRSxJQUFGLEdBQVMsZ0JBQVQ7QUFDQSxNQUFFLEtBQUYsR0FBVSxLQUFWO0FBQ0EsTUFBRSxNQUFGLEdBQVcsTUFBWDtBQUNBLFdBQU8sQ0FBUDtBQUNIOztBQUVNLFNBQVMsU0FBVCxDQUFtQixLQUFuQixFQUEwQixVQUExQixFQUFzQyxXQUF0QyxFQUFnRTtBQUFBLFFBQWIsT0FBYSx1RUFBSCxDQUFHOztBQUNuRSxRQUFJLFlBQVksRUFBaEI7O0FBRUEsUUFBSSxVQUFVLE1BQU0sS0FBTixHQUFjLFVBQTVCO0FBQUEsUUFDSSxPQUFPLE1BQU0sTUFBTixHQUFlLFdBRDFCOztBQUdBLFFBQUksaUJBQWlCLFVBQVUsSUFBL0I7O0FBRUEsU0FBSSxJQUFJLElBQUksQ0FBWixFQUFlLElBQUksY0FBbkIsRUFBbUMsR0FBbkMsRUFBd0M7QUFDcEMsWUFBSSxJQUFLLElBQUksT0FBTCxHQUFnQixVQUF4QjtBQUFBLFlBQ0ksSUFBSSxLQUFLLEtBQUwsQ0FBVyxJQUFJLE9BQWYsSUFBMEIsV0FEbEM7O0FBR0EsWUFBRyxXQUFXLFVBQVUsQ0FBeEIsRUFBMkI7QUFDdkIsaUJBQUssVUFBVyxVQUFVLENBQVYsR0FBYyxPQUE5QjtBQUNBLGlCQUFLLFVBQVcsVUFBVSxLQUFLLEtBQUwsQ0FBVyxJQUFJLE9BQWYsQ0FBMUI7QUFDSDs7QUFFRCxrQkFBVSxJQUFWLENBQWUsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFmO0FBQ0g7O0FBRUQsV0FBTyxPQUFPLEtBQVAsRUFBYyxTQUFkLEVBQXlCLFVBQXpCLEVBQXFDLFdBQXJDLENBQVA7QUFDSDs7SUFFSyxNOzs7QUFDRixvQkFBYSxNQUFiLEVBQW1DO0FBQUEsWUFBZCxDQUFjLHVFQUFWLENBQVU7QUFBQSxZQUFQLENBQU8sdUVBQUgsQ0FBRzs7QUFBQTs7QUFBQSxzSEFDekIsTUFEeUIsRUFDakIsQ0FEaUIsRUFDZCxDQURjOztBQUUvQixnQkFBSyxXQUFMLEdBQW1CLElBQW5CO0FBRitCO0FBR2xDOzs7RUFKZ0IsTTs7QUFPZCxTQUFTLE1BQVQsQ0FBZ0IsTUFBaEIsRUFBd0IsQ0FBeEIsRUFBMkIsQ0FBM0IsRUFBOEI7QUFDakMsUUFBSSxTQUFTLElBQUksTUFBSixDQUFXLE1BQVgsRUFBbUIsQ0FBbkIsRUFBc0IsQ0FBdEIsQ0FBYjtBQUNBLFVBQU0sUUFBTixDQUFlLE1BQWY7QUFDQSxXQUFPLE1BQVA7QUFDSDs7QUFFRCxTQUFTLGVBQVQsQ0FBeUIsQ0FBekIsRUFBNEI7QUFDeEIsTUFBRSxLQUFGLEdBQVUsRUFBRSxLQUFGLElBQVcsU0FBckI7QUFDQSxNQUFFLE9BQUYsR0FBWSxFQUFFLE9BQUYsSUFBYSxTQUF6QjtBQUNBLE1BQUUsSUFBRixHQUFTLEVBQUUsSUFBRixJQUFVLFNBQW5CO0FBQ0EsTUFBRSxHQUFGLEdBQVEsRUFBRSxHQUFGLElBQVMsU0FBakI7QUFDQSxNQUFFLEdBQUYsR0FBUSxFQUFFLEdBQUYsSUFBUyxTQUFqQjs7QUFFQSxNQUFFLEtBQUYsR0FBVSxJQUFWOztBQUVBLE1BQUUsTUFBRixHQUFXLEVBQVg7O0FBRUEsTUFBRSxPQUFGLEdBQVksS0FBWjtBQUNBLE1BQUUsU0FBRixHQUFjLEtBQWQ7O0FBRUEsTUFBRSxNQUFGLEdBQVcsVUFBQyxPQUFELEVBQWE7QUFDcEIsWUFBSSxNQUFNLFFBQVEsYUFBUixDQUFzQixDQUF0QixDQUFWOztBQUVBLFlBQUcsUUFBUSxJQUFYLEVBQWlCO0FBQ2IsY0FBRSxLQUFGLEdBQVUsSUFBVjtBQUNBLGdCQUFHLGFBQWEsTUFBaEIsRUFBd0IsRUFBRSxXQUFGLENBQWMsQ0FBZDtBQUMzQjs7QUFFRCxZQUFHLEdBQUgsRUFBUTtBQUNKLGNBQUUsS0FBRixHQUFVLE1BQVY7O0FBRUEsZ0JBQUcsRUFBRSxNQUFGLElBQVksRUFBRSxNQUFGLENBQVMsTUFBVCxLQUFvQixDQUFoQyxJQUFxQyxhQUFhLE1BQXJELEVBQTZEO0FBQ3pELGtCQUFFLFdBQUYsQ0FBYyxDQUFkO0FBQ0g7O0FBRUQsZ0JBQUcsUUFBUSxNQUFYLEVBQW1CO0FBQ2Ysa0JBQUUsS0FBRixHQUFVLE1BQVY7O0FBRUEsb0JBQUcsYUFBYSxNQUFoQixFQUF3QjtBQUNwQix3QkFBRyxFQUFFLE1BQUYsQ0FBUyxNQUFULEtBQW9CLENBQXZCLEVBQTBCO0FBQ3RCLDBCQUFFLFdBQUYsQ0FBYyxDQUFkO0FBQ0gscUJBRkQsTUFFTztBQUNILDBCQUFFLFdBQUYsQ0FBYyxDQUFkO0FBQ0g7QUFDSjtBQUNKO0FBQ0o7O0FBRUQsWUFBRyxFQUFFLEtBQUYsS0FBWSxNQUFmLEVBQXVCO0FBQ25CLGdCQUFHLENBQUMsRUFBRSxPQUFOLEVBQWU7QUFDWCxvQkFBRyxFQUFFLEtBQUwsRUFBWSxFQUFFLEtBQUY7QUFDWixrQkFBRSxPQUFGLEdBQVksSUFBWjtBQUNBLGtCQUFFLE1BQUYsR0FBVyxTQUFYO0FBQ0g7QUFDSjs7QUFFRCxZQUFHLEVBQUUsS0FBRixLQUFZLE1BQWYsRUFBdUI7QUFDbkIsZ0JBQUcsRUFBRSxPQUFMLEVBQWM7QUFDVixvQkFBRyxFQUFFLE9BQUwsRUFBYyxFQUFFLE9BQUY7QUFDZCxrQkFBRSxPQUFGLEdBQVksS0FBWjtBQUNBLGtCQUFFLE1BQUYsR0FBVyxVQUFYOztBQUVBLG9CQUFHLFFBQVEsTUFBUixJQUFrQixFQUFFLEdBQXZCLEVBQTRCLEVBQUUsR0FBRjtBQUMvQjs7QUFFRCxnQkFBRyxDQUFDLEVBQUUsU0FBTixFQUFpQjtBQUNiLG9CQUFHLEVBQUUsSUFBTCxFQUFXLEVBQUUsSUFBRjtBQUNYLGtCQUFFLFNBQUYsR0FBYyxJQUFkO0FBQ0g7QUFDSjs7QUFFRCxZQUFHLEVBQUUsS0FBRixLQUFZLElBQWYsRUFBcUI7QUFDakIsZ0JBQUcsRUFBRSxPQUFMLEVBQWM7QUFDVixvQkFBRyxFQUFFLE9BQUwsRUFBYyxFQUFFLE9BQUY7QUFDZCxrQkFBRSxPQUFGLEdBQVksS0FBWjtBQUNBLGtCQUFFLE1BQUYsR0FBVyxVQUFYO0FBQ0g7O0FBRUQsZ0JBQUcsRUFBRSxTQUFMLEVBQWdCO0FBQ1osb0JBQUcsRUFBRSxHQUFMLEVBQVUsRUFBRSxHQUFGO0FBQ1Ysa0JBQUUsU0FBRixHQUFjLEtBQWQ7QUFDSDtBQUNKO0FBQ0osS0EvREQ7QUFnRUg7O0FBRUQsU0FBUyxjQUFULENBQXdCLE1BQXhCLEVBQWdDO0FBQzVCLFFBQUksZUFBZSxDQUFuQjtBQUFBLFFBQ0ksaUJBQWlCLENBRHJCO0FBQUEsUUFFSSxhQUFhLENBRmpCO0FBQUEsUUFHSSxXQUFXLENBSGY7QUFBQSxRQUlJLGVBQWUsU0FKbkI7O0FBTUEsYUFBUyxJQUFULENBQWUsV0FBZixFQUE0QjtBQUN4QjtBQUNBLGVBQU8sV0FBUCxDQUFtQixXQUFuQjtBQUNIOztBQUVELGFBQVMsSUFBVCxHQUFnQjtBQUNaLHFCQUFhLENBQUMsQ0FBRCxFQUFJLE9BQU8sTUFBUCxDQUFjLE1BQWQsR0FBdUIsQ0FBM0IsQ0FBYjtBQUNIOztBQUVELGFBQVMsSUFBVCxHQUFnQjtBQUNaO0FBQ0EsZUFBTyxXQUFQLENBQW1CLE9BQU8sWUFBMUI7QUFDSDs7QUFFRCxhQUFTLFlBQVQsQ0FBc0IsYUFBdEIsRUFBcUM7QUFDakM7O0FBRUEscUJBQWEsY0FBYyxDQUFkLENBQWI7QUFDQSxtQkFBVyxjQUFjLENBQWQsQ0FBWDtBQUNBLHlCQUFpQixXQUFXLFVBQTVCOztBQUVBLFlBQUcsZUFBZSxDQUFsQixFQUFxQjtBQUNqQiw4QkFBa0IsQ0FBbEI7QUFDQSw0QkFBZ0IsQ0FBaEI7QUFDSDs7QUFFRCxZQUFHLG1CQUFtQixDQUF0QixFQUF5QjtBQUNyQiw2QkFBaUIsQ0FBakI7QUFDQSw0QkFBZ0IsQ0FBaEI7QUFDSDs7QUFFRCxZQUFHLENBQUMsT0FBTyxHQUFYLEVBQWdCLE9BQU8sR0FBUCxHQUFhLEVBQWI7QUFDaEIsWUFBSSxZQUFZLE9BQU8sT0FBTyxHQUE5Qjs7QUFFQSxlQUFPLFdBQVAsQ0FBbUIsVUFBbkI7O0FBRUEsWUFBRyxDQUFDLE9BQU8sT0FBWCxFQUFvQjtBQUNoQiwyQkFBZSxZQUFZLGFBQWEsSUFBYixDQUFrQixJQUFsQixDQUFaLEVBQXFDLFNBQXJDLENBQWY7QUFDQSxtQkFBTyxPQUFQLEdBQWlCLElBQWpCO0FBQ0g7QUFDSjs7QUFFRCxhQUFTLFlBQVQsR0FBd0I7QUFDcEIsWUFBRyxlQUFlLGNBQWxCLEVBQWtDO0FBQzlCLG1CQUFPLFdBQVAsQ0FBbUIsT0FBTyxZQUFQLEdBQXNCLENBQXpDO0FBQ0EsNEJBQWdCLENBQWhCO0FBQ0gsU0FIRCxNQUdPO0FBQ0gsZ0JBQUcsT0FBTyxJQUFWLEVBQWdCO0FBQ1osdUJBQU8sV0FBUCxDQUFtQixVQUFuQjtBQUNBLCtCQUFlLENBQWY7QUFDSDtBQUNKO0FBQ0o7O0FBRUQsYUFBUyxLQUFULEdBQWlCO0FBQ2IsWUFBRyxpQkFBaUIsU0FBakIsSUFBOEIsT0FBTyxPQUFQLEtBQW1CLElBQXBELEVBQTBEO0FBQ3RELG1CQUFPLE9BQVAsR0FBaUIsS0FBakI7QUFDQSwyQkFBZSxDQUFmO0FBQ0EseUJBQWEsQ0FBYjtBQUNBLHVCQUFXLENBQVg7QUFDQSw2QkFBaUIsQ0FBakI7QUFDQSwwQkFBYyxZQUFkO0FBQ0g7QUFDSjs7QUFFRCxXQUFPLElBQVAsR0FBYyxJQUFkO0FBQ0EsV0FBTyxJQUFQLEdBQWMsSUFBZDtBQUNBLFdBQU8sSUFBUCxHQUFjLElBQWQ7QUFDQSxXQUFPLFlBQVAsR0FBc0IsWUFBdEI7QUFDSDs7QUFFTSxTQUFTLGNBQVQsR0FhTDtBQUFBLFFBWkUsQ0FZRix1RUFaTSxDQVlOO0FBQUEsUUFYRSxDQVdGLHVFQVhNLENBV047QUFBQSxRQVZFLGNBVUYsdUVBVm1CO0FBQUEsZUFBTSxPQUFPLEVBQVAsRUFBVyxLQUFYLENBQU47QUFBQSxLQVVuQjtBQUFBLFFBVEUsaUJBU0YsdUVBVHNCLEVBU3RCO0FBQUEsUUFSRSxPQVFGLHVFQVJZLENBUVo7QUFBQSxRQVBFLGFBT0YsdUVBUGtCLElBT2xCO0FBQUEsUUFORSxRQU1GLHVFQU5hLENBTWI7QUFBQSxRQU5nQixRQU1oQix1RUFOMkIsSUFNM0I7QUFBQSxRQUxFLE9BS0YsdUVBTFksQ0FLWjtBQUFBLFFBTGUsT0FLZix1RUFMeUIsRUFLekI7QUFBQSxRQUpFLFFBSUYsMEVBSmEsR0FJYjtBQUFBLFFBSmtCLFFBSWxCLDBFQUo2QixDQUk3QjtBQUFBLFFBSEUsYUFHRiwwRUFIa0IsSUFHbEI7QUFBQSxRQUh3QixhQUd4QiwwRUFId0MsSUFHeEM7QUFBQSxRQUZFLGFBRUYsMEVBRmtCLElBRWxCO0FBQUEsUUFGd0IsYUFFeEIsMEVBRndDLElBRXhDO0FBQUEsUUFERSxnQkFDRiwwRUFEcUIsSUFDckI7QUFBQSxRQUQyQixnQkFDM0IsMEVBRDhDLElBQzlDOztBQUNFLFFBQUksY0FBYyxTQUFkLFdBQWMsQ0FBQyxHQUFELEVBQU0sR0FBTjtBQUFBLGVBQWMsTUFBTSxLQUFLLE1BQUwsTUFBaUIsTUFBTSxHQUF2QixDQUFwQjtBQUFBLEtBQWxCO0FBQUEsUUFDSSxZQUFZLFNBQVosU0FBWSxDQUFDLEdBQUQsRUFBTSxHQUFOO0FBQUEsZUFBYyxLQUFLLEtBQUwsQ0FBVyxLQUFLLE1BQUwsTUFBaUIsTUFBTSxHQUFOLEdBQVksQ0FBN0IsQ0FBWCxJQUE4QyxHQUE1RDtBQUFBLEtBRGhCOztBQUdBLFFBQUksU0FBUyxFQUFiO0FBQ0EsUUFBSSxjQUFKOztBQUVBLFFBQUksVUFBVSxDQUFDLFdBQVcsUUFBWixLQUF5QixvQkFBb0IsQ0FBN0MsQ0FBZDs7QUFFQSxTQUFJLElBQUksSUFBSSxDQUFaLEVBQWUsSUFBSSxpQkFBbkIsRUFBc0MsR0FBdEMsRUFBMkM7QUFDdkMsWUFBRyxhQUFILEVBQWtCO0FBQ2Qsb0JBQVEsWUFBWSxRQUFaLEVBQXNCLFFBQXRCLENBQVI7QUFDQSxtQkFBTyxJQUFQLENBQVksS0FBWjtBQUNILFNBSEQsTUFHTztBQUNILGdCQUFHLFVBQVUsU0FBYixFQUF3QixRQUFRLFFBQVI7QUFDeEIsbUJBQU8sSUFBUCxDQUFZLEtBQVo7QUFDQSxxQkFBUyxPQUFUO0FBQ0g7QUFDSjs7QUFFRCxXQUFPLE9BQVAsQ0FBZTtBQUFBLGVBQVMsYUFBYSxLQUFiLENBQVQ7QUFBQSxLQUFmOztBQUVBLGFBQVMsWUFBVCxDQUFzQixLQUF0QixFQUE2QjtBQUN6QixZQUFJLFdBQVcsZ0JBQWY7O0FBRUEsWUFBRyxTQUFTLE1BQVQsQ0FBZ0IsTUFBaEIsR0FBeUIsQ0FBNUIsRUFBK0I7QUFDM0IscUJBQVMsV0FBVCxDQUFxQixVQUFVLENBQVYsRUFBYSxTQUFTLE1BQVQsQ0FBZ0IsTUFBaEIsR0FBeUIsQ0FBdEMsQ0FBckI7QUFDSDs7QUFFRCxpQkFBUyxDQUFULEdBQWEsSUFBSSxTQUFTLFVBQTFCO0FBQ0EsaUJBQVMsQ0FBVCxHQUFhLElBQUksU0FBUyxVQUExQjs7QUFFQSxZQUFJLE9BQU8sVUFBVSxPQUFWLEVBQW1CLE9BQW5CLENBQVg7QUFDQSxpQkFBUyxLQUFULEdBQWlCLElBQWpCO0FBQ0EsaUJBQVMsTUFBVCxHQUFrQixJQUFsQjs7QUFFQSxpQkFBUyxVQUFULEdBQXNCLFlBQVksYUFBWixFQUEyQixhQUEzQixDQUF0QjtBQUNBLGlCQUFTLFVBQVQsR0FBc0IsWUFBWSxhQUFaLEVBQTJCLGFBQTNCLENBQXRCO0FBQ0EsaUJBQVMsYUFBVCxHQUF5QixZQUFZLGdCQUFaLEVBQThCLGdCQUE5QixDQUF6Qjs7QUFFQSxZQUFJLFFBQVEsWUFBWSxRQUFaLEVBQXNCLFFBQXRCLENBQVo7QUFDQSxpQkFBUyxFQUFULEdBQWMsUUFBUSxLQUFLLEdBQUwsQ0FBUyxLQUFULENBQXRCO0FBQ0EsaUJBQVMsRUFBVCxHQUFjLFFBQVEsS0FBSyxHQUFMLENBQVMsS0FBVCxDQUF0Qjs7QUFFQSxpQkFBUyxNQUFULEdBQWtCLFlBQU07QUFDcEIscUJBQVMsRUFBVCxJQUFlLE9BQWY7O0FBRUEscUJBQVMsQ0FBVCxJQUFjLFNBQVMsRUFBdkI7QUFDQSxxQkFBUyxDQUFULElBQWMsU0FBUyxFQUF2Qjs7QUFFQSxnQkFBRyxTQUFTLE1BQVQsR0FBa0IsU0FBUyxVQUEzQixHQUF3QyxDQUEzQyxFQUE4QztBQUMxQyx5QkFBUyxNQUFULElBQW1CLFNBQVMsVUFBNUI7QUFDSDtBQUNELGdCQUFHLFNBQVMsTUFBVCxHQUFrQixTQUFTLFVBQTNCLEdBQXdDLENBQTNDLEVBQThDO0FBQzFDLHlCQUFTLE1BQVQsSUFBbUIsU0FBUyxVQUE1QjtBQUNIOztBQUVELHFCQUFTLFFBQVQsSUFBcUIsU0FBUyxhQUE5Qjs7QUFFQSxxQkFBUyxLQUFULElBQWtCLFNBQVMsVUFBM0I7O0FBRUEsZ0JBQUcsU0FBUyxLQUFULElBQWtCLENBQXJCLEVBQXdCO0FBQ3BCLHVCQUFPLFFBQVA7QUFDQSwwQkFBVSxNQUFWLENBQWlCLFVBQVUsT0FBVixDQUFrQixRQUFsQixDQUFqQixFQUE4QyxDQUE5QztBQUNIO0FBQ0osU0FyQkQ7O0FBdUJBLGtCQUFVLElBQVYsQ0FBZSxRQUFmO0FBQ0g7QUFDSjs7QUFFTSxTQUFTLE9BQVQsQ0FBaUIsUUFBakIsRUFBMkIsZ0JBQTNCLEVBQTZDO0FBQ2hELFFBQUksVUFBVSxFQUFkO0FBQUEsUUFDSSxnQkFBZ0IsU0FEcEI7O0FBR0EsWUFBUSxPQUFSLEdBQWtCLEtBQWxCOztBQUVBLGFBQVMsSUFBVCxHQUFnQjtBQUNaLFlBQUcsQ0FBQyxRQUFRLE9BQVosRUFBcUI7QUFDakI7QUFDQSw0QkFBZ0IsWUFBWSxhQUFhLElBQWIsQ0FBa0IsSUFBbEIsQ0FBWixFQUFxQyxRQUFyQyxDQUFoQjtBQUNBLG9CQUFRLE9BQVIsR0FBa0IsSUFBbEI7QUFDSDtBQUNKOztBQUVELGFBQVMsSUFBVCxHQUFnQjtBQUNaLFlBQUcsUUFBUSxPQUFYLEVBQW9CO0FBQ2hCLDBCQUFjLGFBQWQ7QUFDQSxvQkFBUSxPQUFSLEdBQWtCLEtBQWxCO0FBQ0g7QUFDSjs7QUFFRCxhQUFTLFlBQVQsR0FBd0I7QUFDcEI7QUFDSDs7QUFFRCxZQUFRLElBQVIsR0FBZSxJQUFmO0FBQ0EsWUFBUSxJQUFSLEdBQWUsSUFBZjs7QUFFQSxXQUFPLE9BQVA7QUFDSDs7QUFFTSxTQUFTLElBQVQsR0FLSjtBQUFBLFFBSkMsT0FJRCx1RUFKVyxDQUlYO0FBQUEsUUFKYyxJQUlkLHVFQUpxQixDQUlyQjtBQUFBLFFBSndCLFNBSXhCLHVFQUpvQyxFQUlwQztBQUFBLFFBSndDLFVBSXhDLHVFQUpxRCxFQUlyRDtBQUFBLFFBSEMsVUFHRCx1RUFIYyxLQUdkO0FBQUEsUUFIcUIsT0FHckIsdUVBSCtCLENBRy9CO0FBQUEsUUFIa0MsT0FHbEMsdUVBSDRDLENBRzVDO0FBQUEsUUFGQyxVQUVELHVFQUZjLFNBRWQ7QUFBQSxRQURDLEtBQ0QsdUVBRFMsU0FDVDs7QUFDQyxRQUFJLFlBQVksT0FBaEI7QUFDQSxRQUFJLGFBQWEsU0FBYixVQUFhLEdBQU07QUFDbkIsWUFBSSxTQUFTLFVBQVUsSUFBdkI7O0FBRUEsYUFBSSxJQUFJLElBQUksQ0FBWixFQUFlLElBQUksTUFBbkIsRUFBMkIsR0FBM0IsRUFBZ0M7QUFDNUIsZ0JBQUksSUFBSyxJQUFJLE9BQUwsR0FBZ0IsU0FBeEI7QUFBQSxnQkFDSSxJQUFJLEtBQUssS0FBTCxDQUFXLElBQUksT0FBZixJQUEwQixVQURsQzs7QUFHQSxnQkFBSSxVQUFTLFlBQWI7QUFDQSxzQkFBVSxRQUFWLENBQW1CLE9BQW5COztBQUVBLGdCQUFJLENBQUMsVUFBTCxFQUFpQjtBQUNiLHdCQUFPLENBQVAsR0FBVyxJQUFJLE9BQWY7QUFDQSx3QkFBTyxDQUFQLEdBQVcsSUFBSSxPQUFmO0FBQ0gsYUFIRCxNQUdPO0FBQ0gsd0JBQU8sQ0FBUCxHQUFXLElBQUssWUFBWSxDQUFqQixHQUFzQixRQUFPLFNBQTdCLEdBQXlDLE9BQXBEO0FBQ0Esd0JBQU8sQ0FBUCxHQUFXLElBQUssYUFBYSxDQUFsQixHQUF1QixRQUFPLFVBQTlCLEdBQTJDLE9BQXREO0FBQ0g7O0FBRUQsZ0JBQUksS0FBSixFQUFXLE1BQU0sT0FBTjtBQUNkO0FBQ0osS0FwQkQ7O0FBc0JBOztBQUVBLFdBQU8sU0FBUDtBQUNIOztBQUVNLFNBQVMsWUFBVCxDQUFzQixLQUF0QixFQUE2QixNQUE3QixFQUFxQyxNQUFyQyxFQUEyRDtBQUFBLFFBQWQsQ0FBYyx1RUFBVixDQUFVO0FBQUEsUUFBUCxDQUFPLHVFQUFILENBQUc7O0FBQzlELFFBQUksa0JBQUo7QUFBQSxRQUFlLG1CQUFmOztBQUVBLFFBQUcsT0FBTyxLQUFWLEVBQWlCO0FBQ2Isb0JBQVksT0FBTyxLQUFQLENBQWEsQ0FBekI7QUFDQSxxQkFBYSxPQUFPLEtBQVAsQ0FBYSxDQUExQjtBQUNILEtBSEQsTUFHTztBQUNILG9CQUFZLE9BQU8sS0FBbkI7QUFDQSxxQkFBYSxPQUFPLE1BQXBCO0FBQ0g7O0FBRUQsUUFBSSxnQkFBSjtBQUFBLFFBQWEsYUFBYjs7QUFFQSxRQUFJLFNBQVMsU0FBYixFQUF3QjtBQUNwQixrQkFBVSxLQUFLLEtBQUwsQ0FBVyxRQUFRLFNBQW5CLElBQWdDLENBQTFDO0FBQ0gsS0FGRCxNQUVPO0FBQ0gsa0JBQVUsQ0FBVjtBQUNIOztBQUVELFFBQUksVUFBVSxVQUFkLEVBQTBCO0FBQ3RCLGVBQU8sS0FBSyxLQUFMLENBQVcsU0FBUyxVQUFwQixJQUFrQyxDQUF6QztBQUNILEtBRkQsTUFFTztBQUNILGVBQU8sQ0FBUDtBQUNIOztBQUVELFFBQUksV0FBVyxLQUNYLE9BRFcsRUFDRixJQURFLEVBQ0ksU0FESixFQUNlLFVBRGYsRUFDMkIsS0FEM0IsRUFDa0MsQ0FEbEMsRUFDcUMsQ0FEckMsRUFFWCxZQUFNO0FBQ0YsWUFBSSxPQUFPLE9BQU8sTUFBUCxDQUFYO0FBQ0EsZUFBTyxJQUFQO0FBQ0gsS0FMVSxDQUFmOztBQVFBLGFBQVMsTUFBVCxHQUFrQixDQUFsQjtBQUNBLGFBQVMsTUFBVCxHQUFrQixDQUFsQjs7QUFFQSxRQUFJLFlBQVksVUFBVSxLQUFWLEVBQWlCLE1BQWpCLEVBQXlCLE1BQXpCLEVBQWlDLE1BQWpDLENBQWhCO0FBQ0EsY0FBVSxDQUFWLEdBQWMsQ0FBZDtBQUNBLGNBQVUsQ0FBVixHQUFjLENBQWQ7O0FBRUEsY0FBVSxJQUFWLEdBQWlCLElBQWpCOztBQUVBLGNBQVUsUUFBVixDQUFtQixRQUFuQjs7QUFHQSxXQUFPLGdCQUFQLENBQXdCLFNBQXhCLEVBQW1DO0FBQy9CLGVBQU87QUFDSCxlQURHLGlCQUNJO0FBQ0gsdUJBQU8sU0FBUyxNQUFoQjtBQUNILGFBSEU7QUFJSCxlQUpHLGVBSUUsS0FKRixFQUlTO0FBQ1IseUJBQVMsUUFBVCxDQUFrQixPQUFsQixDQUEwQixpQkFBUztBQUMvQix3QkFBSSxhQUFhLFFBQVEsU0FBUyxNQUFsQztBQUNBLDBCQUFNLENBQU4sSUFBVyxVQUFYOztBQUVBLHdCQUFJLE1BQU0sQ0FBTixHQUFVLENBQUMsVUFBVSxDQUFYLElBQWdCLFNBQTlCLEVBQXlDO0FBQ3JDLDhCQUFNLENBQU4sR0FBVSxJQUFJLFNBQUosR0FBZ0IsVUFBMUI7QUFDSDs7QUFFRCx3QkFBSSxNQUFNLENBQU4sR0FBVSxJQUFJLFNBQUosR0FBZ0IsVUFBOUIsRUFBMEM7QUFDdEMsOEJBQU0sQ0FBTixHQUFVLENBQUMsVUFBVSxDQUFYLElBQWdCLFNBQTFCO0FBQ0g7QUFDSixpQkFYRDs7QUFjQSx5QkFBUyxNQUFULEdBQWtCLEtBQWxCO0FBQ0gsYUFwQkU7O0FBcUJILHdCQUFZLElBckJULEVBcUJlLGNBQWM7QUFyQjdCLFNBRHdCO0FBd0IvQixlQUFPO0FBQ0gsZUFERyxpQkFDRztBQUNGLHVCQUFPLFNBQVMsTUFBaEI7QUFDSCxhQUhFO0FBSUgsZUFKRyxlQUlDLEtBSkQsRUFJUTtBQUNQLHlCQUFTLFFBQVQsQ0FBa0IsT0FBbEIsQ0FBMEIsaUJBQVM7QUFDL0Isd0JBQUksYUFBYSxRQUFRLFNBQVMsTUFBbEM7QUFDQSwwQkFBTSxDQUFOLElBQVcsVUFBWDtBQUNBLHdCQUFJLE1BQU0sQ0FBTixHQUFVLENBQUMsT0FBTyxDQUFSLElBQWEsVUFBM0IsRUFBdUM7QUFDbkMsOEJBQU0sQ0FBTixHQUFVLElBQUksVUFBSixHQUFpQixVQUEzQjtBQUNIO0FBQ0Qsd0JBQUksTUFBTSxDQUFOLEdBQVUsSUFBSSxVQUFKLEdBQWlCLFVBQS9CLEVBQTJDO0FBQ3ZDLDhCQUFNLENBQU4sR0FBVSxDQUFDLE9BQU8sQ0FBUixJQUFhLFVBQXZCO0FBQ0g7QUFDSixpQkFURDtBQVVBLHlCQUFTLE1BQVQsR0FBa0IsS0FBbEI7QUFDSCxhQWhCRTs7QUFpQkgsd0JBQVksSUFqQlQsRUFpQmUsY0FBYztBQWpCN0I7QUF4QndCLEtBQW5DOztBQTZDQSxXQUFPLFNBQVA7QUFDSDs7QUFFRCxJQUFJLGtCQUFrQixTQUF0Qjs7SUFFTSxVO0FBQ0Ysd0JBQVksTUFBWixFQUFvQixLQUFwQixFQUEyQixNQUEzQixFQUFpRDtBQUFBLFlBQWQsQ0FBYyx1RUFBVixDQUFVO0FBQUEsWUFBUCxDQUFPLHVFQUFILENBQUc7O0FBQUE7O0FBQzdDLGFBQUssTUFBTCxHQUFjLE1BQWQ7O0FBRUEsYUFBSyxLQUFMLEdBQWEsS0FBYjtBQUNBLGFBQUssTUFBTCxHQUFjLE1BQWQ7QUFDQSxhQUFLLENBQUwsR0FBUyxDQUFUO0FBQ0EsYUFBSyxDQUFMLEdBQVMsQ0FBVDtBQUNIOzs7OytCQUVNLEcsRUFBSztBQUNSLGdCQUFHLENBQUMsS0FBSyxPQUFULEVBQWtCO0FBQ2QscUJBQUssT0FBTCxHQUFlLElBQUksYUFBSixDQUFrQixLQUFLLE1BQXZCLEVBQStCLFFBQS9CLENBQWY7QUFDSDtBQUNELGdCQUFJLFNBQUosR0FBZ0IsS0FBSyxPQUFyQjs7QUFFQSxnQkFBSSxTQUFKLENBQWMsS0FBSyxDQUFuQixFQUFzQixLQUFLLENBQTNCO0FBQ0EsZ0JBQUksUUFBSixDQUFhLENBQUMsS0FBSyxDQUFuQixFQUFzQixDQUFDLEtBQUssQ0FBNUIsRUFBK0IsS0FBSyxLQUFwQyxFQUEyQyxLQUFLLE1BQWhEO0FBQ0EsZ0JBQUksU0FBSixDQUFjLENBQUMsS0FBSyxDQUFwQixFQUF1QixDQUFDLEtBQUssQ0FBN0I7QUFDSDs7Ozs7O0FBR0UsU0FBUyxVQUFULENBQW9CLE1BQXBCLEVBQTRCLEtBQTVCLEVBQW1DLE1BQW5DLEVBQTJDLENBQTNDLEVBQThDLENBQTlDLEVBQWlEO0FBQ3BELHNCQUFrQixJQUFJLFVBQUosQ0FBZSxNQUFmLEVBQXVCLEtBQXZCLEVBQThCLE1BQTlCLEVBQXNDLENBQXRDLEVBQXlDLENBQXpDLENBQWxCO0FBQ0EsV0FBTyxlQUFQO0FBQ0g7Ozs7Ozs7O1FDcnhDZSxRLEdBQUEsUTtRQWdDQSxXLEdBQUEsVztBQWhDVCxTQUFTLFFBQVQsQ0FBa0IsT0FBbEIsRUFBMkI7QUFDOUIsUUFBSSxNQUFNLEVBQVY7QUFDQSxRQUFJLElBQUosR0FBVyxPQUFYO0FBQ0EsUUFBSSxNQUFKLEdBQWEsS0FBYjtBQUNBLFFBQUksSUFBSixHQUFXLElBQVg7QUFDQSxRQUFJLEtBQUosR0FBWSxTQUFaO0FBQ0EsUUFBSSxPQUFKLEdBQWMsU0FBZDs7QUFFQSxRQUFJLFdBQUosR0FBa0IsVUFBUyxLQUFULEVBQWdCO0FBQzlCLFlBQUcsTUFBTSxPQUFOLEtBQWtCLElBQUksSUFBekIsRUFBK0I7QUFDM0IsZ0JBQUcsSUFBSSxJQUFKLElBQVksSUFBSSxLQUFuQixFQUEwQixJQUFJLEtBQUo7QUFDMUIsZ0JBQUksTUFBSixHQUFhLElBQWI7QUFDQSxnQkFBSSxJQUFKLEdBQVcsS0FBWDtBQUNIO0FBQ0QsY0FBTSxjQUFOO0FBQ0gsS0FQRDs7QUFTQSxRQUFJLFNBQUosR0FBZ0IsVUFBUyxLQUFULEVBQWdCO0FBQzVCLFlBQUcsTUFBTSxPQUFOLEtBQWtCLElBQUksSUFBekIsRUFBK0I7QUFDM0IsZ0JBQUcsSUFBSSxNQUFKLElBQWMsSUFBSSxPQUFyQixFQUE4QixJQUFJLE9BQUo7QUFDOUIsZ0JBQUksTUFBSixHQUFhLEtBQWI7QUFDQSxnQkFBSSxJQUFKLEdBQVcsSUFBWDtBQUNIO0FBQ0QsY0FBTSxjQUFOO0FBQ0gsS0FQRDs7QUFTQSxXQUFPLGdCQUFQLENBQXdCLFNBQXhCLEVBQW1DLElBQUksV0FBSixDQUFnQixJQUFoQixDQUFxQixHQUFyQixDQUFuQyxFQUE4RCxLQUE5RDtBQUNBLFdBQU8sZ0JBQVAsQ0FBd0IsT0FBeEIsRUFBaUMsSUFBSSxTQUFKLENBQWMsSUFBZCxDQUFtQixHQUFuQixDQUFqQyxFQUEwRCxLQUExRDs7QUFFQSxXQUFPLEdBQVA7QUFDSDs7QUFFTSxTQUFTLFdBQVQsQ0FBcUIsT0FBckIsRUFBeUM7QUFBQSxRQUFYLEtBQVcsdUVBQUgsQ0FBRzs7QUFDNUMsUUFBSSxVQUFVO0FBQ1YsaUJBQVMsT0FEQztBQUVWLGVBQU8sS0FGRzs7QUFJVixZQUFJLENBSk07QUFLVixZQUFJLENBTE07O0FBT1YsWUFBSSxDQUFKLEdBQVE7QUFDSixtQkFBTyxLQUFLLEVBQUwsR0FBVSxLQUFLLEtBQXRCO0FBQ0gsU0FUUztBQVVWLFlBQUksQ0FBSixHQUFRO0FBQ0osbUJBQU8sS0FBSyxFQUFMLEdBQVUsS0FBSyxLQUF0QjtBQUNILFNBWlM7O0FBY1YsWUFBSSxPQUFKLEdBQWM7QUFDVixtQkFBTyxLQUFLLENBQVo7QUFDSCxTQWhCUztBQWlCVixZQUFJLE9BQUosR0FBYztBQUNWLG1CQUFPLEtBQUssQ0FBWjtBQUNILFNBbkJTOztBQXFCVixZQUFJLFFBQUosR0FBZTtBQUNYLG1CQUFPLEVBQUMsR0FBRyxLQUFLLENBQVQsRUFBWSxHQUFHLEtBQUssQ0FBcEIsRUFBUDtBQUNILFNBdkJTOztBQXlCVixnQkFBUSxLQXpCRTtBQTBCVixjQUFNLElBMUJJO0FBMkJWLGdCQUFRLEtBM0JFOztBQTZCVixrQkFBVSxDQTdCQTtBQThCVixxQkFBYSxDQTlCSDs7QUFnQ1YsZUFBTyxTQWhDRztBQWlDVixpQkFBUyxTQWpDQztBQWtDVixhQUFLLFNBbENLOztBQW9DVixvQkFBWSxJQXBDRjtBQXFDVixxQkFBYSxDQXJDSDtBQXNDVixxQkFBYSxDQXRDSDs7QUF3Q1YsbUJBeENVLHVCQXdDRyxLQXhDSCxFQXdDVTtBQUNoQixnQkFBSSxVQUFVLE1BQU0sTUFBcEI7O0FBRUEsaUJBQUssRUFBTCxHQUFXLE1BQU0sS0FBTixHQUFjLFFBQVEsVUFBakM7QUFDQSxpQkFBSyxFQUFMLEdBQVcsTUFBTSxLQUFOLEdBQWMsUUFBUSxTQUFqQzs7QUFFQSxrQkFBTSxjQUFOO0FBQ0gsU0EvQ1M7QUFpRFYsd0JBakRVLDRCQWlEUSxLQWpEUixFQWlEZTtBQUNyQixnQkFBSSxVQUFVLE1BQU0sTUFBcEI7O0FBRUEsaUJBQUssRUFBTCxHQUFXLE1BQU0sYUFBTixDQUFvQixDQUFwQixFQUF1QixLQUF2QixHQUErQixRQUFRLFVBQWxEO0FBQ0EsaUJBQUssRUFBTCxHQUFXLE1BQU0sYUFBTixDQUFvQixDQUFwQixFQUF1QixLQUF2QixHQUErQixRQUFRLFNBQWxEOztBQUVBLGtCQUFNLGNBQU47QUFDSCxTQXhEUztBQTBEVixtQkExRFUsdUJBMERHLEtBMURILEVBMERVO0FBQ2hCLGlCQUFLLE1BQUwsR0FBYyxJQUFkO0FBQ0EsaUJBQUssSUFBTCxHQUFZLEtBQVo7QUFDQSxpQkFBSyxNQUFMLEdBQWMsS0FBZDs7QUFFQSxpQkFBSyxRQUFMLEdBQWdCLEtBQUssR0FBTCxFQUFoQjs7QUFFQSxnQkFBRyxLQUFLLEtBQVIsRUFBZSxLQUFLLEtBQUw7QUFDZixrQkFBTSxjQUFOO0FBQ0gsU0FuRVM7QUFxRVYseUJBckVVLDZCQXFFUyxLQXJFVCxFQXFFZ0I7QUFDdEIsZ0JBQUksVUFBVSxNQUFNLE1BQXBCOztBQUVBLGlCQUFLLEVBQUwsR0FBVSxNQUFNLGFBQU4sQ0FBb0IsQ0FBcEIsRUFBdUIsS0FBdkIsR0FBK0IsUUFBUSxVQUFqRDtBQUNBLGlCQUFLLEVBQUwsR0FBVSxNQUFNLGFBQU4sQ0FBb0IsQ0FBcEIsRUFBdUIsS0FBdkIsR0FBK0IsUUFBUSxTQUFqRDs7QUFFQSxpQkFBSyxNQUFMLEdBQWMsSUFBZDtBQUNBLGlCQUFLLElBQUwsR0FBWSxLQUFaO0FBQ0EsaUJBQUssTUFBTCxHQUFjLEtBQWQ7O0FBRUEsaUJBQUssUUFBTCxHQUFnQixLQUFLLEdBQUwsRUFBaEI7O0FBRUEsZ0JBQUcsS0FBSyxLQUFSLEVBQWUsS0FBSyxLQUFMO0FBQ2Ysa0JBQU0sY0FBTjtBQUNILFNBbkZTO0FBcUZWLGlCQXJGVSxxQkFxRkMsS0FyRkQsRUFxRlE7QUFDZCxpQkFBSyxXQUFMLEdBQW1CLEtBQUssR0FBTCxDQUFTLEtBQUssUUFBTCxHQUFnQixLQUFLLEdBQUwsRUFBekIsQ0FBbkI7QUFDQSxnQkFBRyxLQUFLLFdBQUwsSUFBb0IsR0FBcEIsSUFBMkIsS0FBSyxNQUFMLEtBQWdCLEtBQTlDLEVBQXFEO0FBQ2pELHFCQUFLLE1BQUwsR0FBYyxJQUFkO0FBQ0Esb0JBQUcsS0FBSyxHQUFSLEVBQWEsS0FBSyxHQUFMO0FBQ2hCOztBQUVELGlCQUFLLElBQUwsR0FBWSxJQUFaO0FBQ0EsaUJBQUssTUFBTCxHQUFjLEtBQWQ7O0FBRUEsZ0JBQUcsS0FBSyxPQUFSLEVBQWlCLEtBQUssT0FBTDtBQUNqQixrQkFBTSxjQUFOO0FBQ0gsU0FqR1M7QUFtR1YsdUJBbkdVLDJCQW1HTyxLQW5HUCxFQW1HYztBQUNwQixpQkFBSyxXQUFMLEdBQW1CLEtBQUssR0FBTCxDQUFTLEtBQUssUUFBTCxHQUFnQixLQUFLLEdBQUwsRUFBekIsQ0FBbkI7O0FBRUEsZ0JBQUcsS0FBSyxXQUFMLElBQW9CLEdBQXBCLElBQTJCLEtBQUssTUFBTCxLQUFnQixLQUE5QyxFQUFxRDtBQUNqRCxxQkFBSyxNQUFMLEdBQWMsSUFBZDtBQUNBLG9CQUFHLEtBQUssR0FBUixFQUFhLEtBQUssR0FBTDtBQUNoQjs7QUFFRCxpQkFBSyxJQUFMLEdBQVksSUFBWjtBQUNBLGlCQUFLLE1BQUwsR0FBYyxLQUFkOztBQUVBLGdCQUFHLEtBQUssT0FBUixFQUFpQixLQUFLLE9BQUw7QUFDakIsa0JBQU0sY0FBTjtBQUNILFNBaEhTO0FBa0hWLHFCQWxIVSx5QkFrSEssTUFsSEwsRUFrSGE7QUFDbkIsZ0JBQUksTUFBTSxLQUFWOztBQUVBLGdCQUFHLENBQUMsT0FBTyxRQUFYLEVBQXFCO0FBQ2pCLG9CQUFJLE9BQU8sT0FBTyxFQUFsQjtBQUFBLG9CQUNJLFFBQVEsT0FBTyxFQUFQLEdBQVksT0FBTyxLQUQvQjtBQUFBLG9CQUVJLE1BQU0sT0FBTyxFQUZqQjtBQUFBLG9CQUdJLFNBQVMsT0FBTyxFQUFQLEdBQVksT0FBTyxNQUhoQzs7QUFLQSxzQkFBTSxLQUFLLENBQUwsR0FBUyxJQUFULElBQWlCLEtBQUssQ0FBTCxHQUFTLEtBQTFCLElBQ0MsS0FBSyxDQUFMLEdBQVMsR0FEVixJQUNpQixLQUFLLENBQUwsR0FBUyxNQURoQztBQUVILGFBUkQsTUFRTztBQUNILG9CQUFJLEtBQUssS0FBSyxDQUFMLElBQVUsT0FBTyxFQUFQLEdBQVksT0FBTyxNQUE3QixDQUFUO0FBQUEsb0JBQ0ksS0FBSyxLQUFLLENBQUwsSUFBVSxPQUFPLEVBQVAsR0FBWSxPQUFPLE1BQTdCLENBRFQ7QUFBQSxvQkFFSSxXQUFXLEtBQUssSUFBTCxDQUFVLEtBQUssRUFBTCxHQUFVLEtBQUssRUFBekIsQ0FGZjs7QUFJQSxzQkFBTSxXQUFXLE9BQU8sTUFBeEI7QUFDSDs7QUFFRCxtQkFBTyxHQUFQO0FBQ0gsU0F0SVM7QUF3SVYseUJBeElVLDZCQXdJUyxNQXhJVCxFQXdJaUI7QUFBQTs7QUFDdkIsZ0JBQUcsS0FBSyxNQUFSLEVBQWdCO0FBQ1osb0JBQUcsS0FBSyxVQUFMLEtBQW9CLElBQXZCLEVBQTZCO0FBQ3pCLHlCQUFJLElBQUksSUFBSSxpQkFBaUIsTUFBakIsR0FBd0IsQ0FBcEMsRUFBdUMsSUFBSSxDQUFDLENBQTVDLEVBQStDLEdBQS9DLEVBQW9EO0FBQ2hELDRCQUFJLFVBQVMsaUJBQWlCLENBQWpCLENBQWI7O0FBRUEsNEJBQUcsS0FBSyxhQUFMLENBQW1CLE9BQW5CLEtBQThCLFFBQU8sU0FBeEMsRUFBbUQ7QUFDL0MsaUNBQUssV0FBTCxHQUFtQixLQUFLLENBQUwsR0FBUyxRQUFPLEVBQW5DO0FBQ0EsaUNBQUssV0FBTCxHQUFtQixLQUFLLENBQUwsR0FBUyxRQUFPLEVBQW5DOztBQUVBLGlDQUFLLFVBQUwsR0FBa0IsT0FBbEI7O0FBRUE7QUFDQSxnQ0FBSSxXQUFXLFFBQU8sTUFBUCxDQUFjLFFBQTdCO0FBQ0EscUNBQVMsTUFBVCxDQUFnQixTQUFTLE9BQVQsQ0FBaUIsT0FBakIsQ0FBaEIsRUFBMEMsQ0FBMUM7QUFDQSxxQ0FBUyxJQUFULENBQWMsT0FBZDs7QUFFQTtBQUNBLDZDQUFpQixNQUFqQixDQUF3QixpQkFBaUIsT0FBakIsQ0FBeUIsT0FBekIsQ0FBeEIsRUFBMEQsQ0FBMUQ7QUFDQSw2Q0FBaUIsSUFBakIsQ0FBc0IsT0FBdEI7QUFDSDtBQUNKO0FBQ0osaUJBcEJELE1Bb0JPO0FBQ0gseUJBQUssVUFBTCxDQUFnQixDQUFoQixHQUFvQixLQUFLLENBQUwsR0FBUyxLQUFLLFdBQWxDO0FBQ0EseUJBQUssVUFBTCxDQUFnQixDQUFoQixHQUFvQixLQUFLLENBQUwsR0FBUyxLQUFLLFdBQWxDO0FBQ0g7QUFDSjs7QUFFRCxnQkFBRyxLQUFLLElBQVIsRUFBYztBQUNWLHFCQUFLLFVBQUwsR0FBa0IsSUFBbEI7QUFDSDs7QUFFRDtBQUNBLDZCQUFpQixJQUFqQixDQUFzQixrQkFBVTtBQUM1QixvQkFBRyxNQUFLLGFBQUwsQ0FBbUIsTUFBbkIsS0FBOEIsT0FBTyxTQUF4QyxFQUFtRDtBQUMvQywwQkFBSyxPQUFMLENBQWEsS0FBYixDQUFtQixNQUFuQixHQUE0QixTQUE1QjtBQUNBLDJCQUFPLElBQVA7QUFDSCxpQkFIRCxNQUdPO0FBQ0gsMEJBQUssT0FBTCxDQUFhLEtBQWIsQ0FBbUIsTUFBbkIsR0FBNEIsTUFBNUI7QUFDQSwyQkFBTyxLQUFQO0FBQ0g7QUFDSixhQVJEO0FBU0g7QUFsTFMsS0FBZDs7QUFxTEEsWUFBUSxnQkFBUixDQUNJLFdBREosRUFDaUIsUUFBUSxXQUFSLENBQW9CLElBQXBCLENBQXlCLE9BQXpCLENBRGpCLEVBQ29ELEtBRHBEOztBQUlBLFlBQVEsZ0JBQVIsQ0FDSSxXQURKLEVBQ2lCLFFBQVEsV0FBUixDQUFvQixJQUFwQixDQUF5QixPQUF6QixDQURqQixFQUNvRCxLQURwRDs7QUFJQSxZQUFRLGdCQUFSLENBQ0ksU0FESixFQUNlLFFBQVEsU0FBUixDQUFrQixJQUFsQixDQUF1QixPQUF2QixDQURmLEVBQ2dELEtBRGhEOztBQUlBLFlBQVEsZ0JBQVIsQ0FDSSxXQURKLEVBQ2lCLFFBQVEsZ0JBQVIsQ0FBeUIsSUFBekIsQ0FBOEIsT0FBOUIsQ0FEakIsRUFDeUQsS0FEekQ7O0FBSUEsWUFBUSxnQkFBUixDQUNJLFlBREosRUFDa0IsUUFBUSxpQkFBUixDQUEwQixJQUExQixDQUErQixPQUEvQixDQURsQixFQUMyRCxLQUQzRDs7QUFJQSxZQUFRLGdCQUFSLENBQ0ksVUFESixFQUNnQixRQUFRLGVBQVIsQ0FBd0IsSUFBeEIsQ0FBNkIsT0FBN0IsQ0FEaEIsRUFDdUQsS0FEdkQ7O0FBSUEsWUFBUSxLQUFSLENBQWMsV0FBZCxHQUE0QixNQUE1Qjs7QUFFQSxXQUFPLE9BQVA7QUFDSDs7Ozs7Ozs7Ozs7UUNwSWUsUyxHQUFBLFM7Ozs7QUE3R2hCLElBQUksT0FBTyxJQUFJLFlBQUosRUFBWDs7SUFFTSxLO0FBQ0YsbUJBQVksTUFBWixFQUFvQixXQUFwQixFQUFpQztBQUFBOztBQUM3QixhQUFLLE1BQUwsR0FBYyxNQUFkO0FBQ0EsYUFBSyxXQUFMLEdBQW1CLFdBQW5COztBQUVBLGFBQUssSUFBTCxHQUFZLElBQVo7QUFDQSxhQUFLLFVBQUwsR0FBa0IsS0FBSyxJQUFMLENBQVUsVUFBVixFQUFsQjtBQUNBLGFBQUssT0FBTCxHQUFlLEtBQUssSUFBTCxDQUFVLGtCQUFWLEVBQWY7QUFDQSxhQUFLLFNBQUwsR0FBaUIsSUFBakI7QUFDQSxhQUFLLE1BQUwsR0FBYyxJQUFkO0FBQ0EsYUFBSyxJQUFMLEdBQVksS0FBWjtBQUNBLGFBQUssT0FBTCxHQUFlLEtBQWY7O0FBRUEsYUFBSyxRQUFMLEdBQWdCLENBQWhCO0FBQ0EsYUFBSyxXQUFMLEdBQW1CLENBQW5COztBQUVBLGFBQUssU0FBTCxHQUFpQixDQUFqQjtBQUNBLGFBQUssV0FBTCxHQUFtQixDQUFuQjs7QUFFQSxhQUFLLElBQUw7QUFDSDs7OzsrQkFFTTtBQUFBOztBQUNILGdCQUFJLE1BQU0sSUFBSSxjQUFKLEVBQVY7QUFDQSxnQkFBSSxJQUFKLENBQVMsS0FBVCxFQUFnQixLQUFLLE1BQXJCLEVBQTZCLElBQTdCO0FBQ0EsZ0JBQUksWUFBSixHQUFtQixhQUFuQjtBQUNBLGdCQUFJLGdCQUFKLENBQXFCLE1BQXJCLEVBQTZCLFlBQU07QUFDL0Isc0JBQUssSUFBTCxDQUFVLGVBQVYsQ0FDSSxJQUFJLFFBRFIsRUFFSSxrQkFBVTtBQUNOLDBCQUFLLE1BQUwsR0FBYyxNQUFkO0FBQ0EsMEJBQUssU0FBTCxHQUFpQixJQUFqQjs7QUFFQSx3QkFBRyxNQUFLLFdBQVIsRUFBcUI7QUFDakIsOEJBQUssV0FBTDtBQUNIO0FBQ0osaUJBVEwsRUFVSSxpQkFBUztBQUNMLDBCQUFNLElBQUksS0FBSixDQUFVLGlDQUErQixLQUF6QyxDQUFOO0FBQ0gsaUJBWkw7QUFjSCxhQWZEOztBQWlCQSxnQkFBSSxJQUFKO0FBQ0g7OzsrQkFFTTtBQUNILGlCQUFLLFNBQUwsR0FBaUIsS0FBSyxJQUFMLENBQVUsV0FBM0I7QUFDQSxpQkFBSyxTQUFMLEdBQWlCLEtBQUssSUFBTCxDQUFVLGtCQUFWLEVBQWpCOztBQUVBLGlCQUFLLFNBQUwsQ0FBZSxNQUFmLEdBQXdCLEtBQUssTUFBN0I7O0FBRUEsaUJBQUssU0FBTCxDQUFlLE9BQWYsQ0FBdUIsS0FBSyxVQUE1QjtBQUNBLGlCQUFLLFVBQUwsQ0FBZ0IsT0FBaEIsQ0FBd0IsS0FBSyxPQUE3QjtBQUNBLGlCQUFLLE9BQUwsQ0FBYSxPQUFiLENBQXFCLEtBQUssSUFBTCxDQUFVLFdBQS9COztBQUVBLGlCQUFLLFNBQUwsQ0FBZSxJQUFmLEdBQXNCLEtBQUssSUFBM0I7O0FBRUEsaUJBQUssU0FBTCxDQUFlLEtBQWYsQ0FDSSxLQUFLLFNBRFQsRUFFSSxLQUFLLFdBQUwsR0FBbUIsS0FBSyxNQUFMLENBQVksUUFGbkM7O0FBS0EsaUJBQUssT0FBTCxHQUFlLElBQWY7QUFDSDs7O2dDQUVPO0FBQ0osZ0JBQUcsS0FBSyxPQUFSLEVBQWlCO0FBQ2IscUJBQUssU0FBTCxDQUFlLElBQWYsQ0FBb0IsS0FBSyxJQUFMLENBQVUsV0FBOUI7QUFDQSxxQkFBSyxXQUFMLElBQW9CLEtBQUssSUFBTCxDQUFVLFdBQVYsR0FBd0IsS0FBSyxTQUFqRDtBQUNBLHFCQUFLLE9BQUwsR0FBZSxLQUFmO0FBQ0g7QUFDSjs7O2tDQUVTO0FBQ04sZ0JBQUcsS0FBSyxPQUFSLEVBQWlCO0FBQ2IscUJBQUssU0FBTCxDQUFlLElBQWYsQ0FBb0IsS0FBSyxJQUFMLENBQVUsV0FBOUI7QUFDSDtBQUNELGlCQUFLLFdBQUwsR0FBbUIsQ0FBbkI7QUFDQSxpQkFBSyxJQUFMO0FBQ0g7OztpQ0FFUSxLLEVBQU87QUFDWixnQkFBRyxLQUFLLE9BQVIsRUFBaUI7QUFDYixxQkFBSyxTQUFMLENBQWUsSUFBZixDQUFvQixLQUFLLElBQUwsQ0FBVSxXQUE5QjtBQUNIO0FBQ0QsaUJBQUssV0FBTCxHQUFtQixLQUFuQjtBQUNBLGlCQUFLLElBQUw7QUFDSDs7OzRCQUVZO0FBQ1QsbUJBQU8sS0FBSyxXQUFaO0FBQ0gsUzswQkFDVSxLLEVBQU87QUFDZCxpQkFBSyxVQUFMLENBQWdCLElBQWhCLENBQXFCLEtBQXJCLEdBQTZCLEtBQTdCO0FBQ0EsaUJBQUssV0FBTCxHQUFtQixLQUFuQjtBQUNIOzs7NEJBRVM7QUFDTixtQkFBTyxLQUFLLFFBQVo7QUFDSCxTOzBCQUNPLEssRUFBTztBQUNYLGlCQUFLLE9BQUwsQ0FBYSxHQUFiLENBQWlCLEtBQWpCLEdBQXlCLEtBQXpCO0FBQ0EsaUJBQUssUUFBTCxHQUFnQixLQUFoQjtBQUNIOzs7Ozs7QUFHRSxTQUFTLFNBQVQsQ0FBbUIsTUFBbkIsRUFBMkIsV0FBM0IsRUFBd0M7QUFDM0MsV0FBTyxJQUFJLEtBQUosQ0FBVSxNQUFWLEVBQWtCLFdBQWxCLENBQVA7QUFDSDs7Ozs7Ozs7O1FDWWUsTyxHQUFBLE87UUE2Q0EsYSxHQUFBLGE7UUEwQkEsSSxHQUFBLEk7UUFrQkEsd0IsR0FBQSx3QjtRQWlCQSxRLEdBQUEsUTtRQU9BLFUsR0FBQSxVO1FBVUEsYyxHQUFBLGM7UUFVQSxLLEdBQUEsSztRQU9BLFksR0FBQSxZO1FBU0EsVyxHQUFBLFc7O0FBaFJoQjs7QUFFTyxJQUFJLDBCQUFTO0FBQ2hCLFlBQVEsQ0FEUTtBQUVoQixZQUFRLENBRlE7O0FBSWhCLHFCQUFpQixDQUFDLEtBQUQsRUFBUSxLQUFSLEVBQWUsS0FBZixDQUpEO0FBS2hCLG9CQUFnQixDQUFDLEtBQUQsRUFBUSxLQUFSLEVBQWUsS0FBZixFQUFzQixNQUF0QixDQUxBO0FBTWhCLG9CQUFnQixDQUFDLE1BQUQsQ0FOQTtBQU9oQixxQkFBaUIsQ0FBQyxLQUFELEVBQVEsS0FBUixFQUFlLEtBQWYsRUFBc0IsTUFBdEIsQ0FQRDs7QUFTaEI7QUFDQSxRQVZnQixnQkFVWCxPQVZXLEVBVUY7QUFBQTs7QUFDVixlQUFPLElBQUksT0FBSixDQUFZLG1CQUFXO0FBQzFCLGdCQUFJLGNBQWMsU0FBZCxXQUFjLEdBQU07QUFDcEIsc0JBQUssTUFBTCxJQUFlLENBQWY7QUFDQSx3QkFBUSxHQUFSLENBQVksTUFBSyxNQUFqQjs7QUFFQSxvQkFBRyxNQUFLLE1BQUwsS0FBZ0IsTUFBSyxNQUF4QixFQUFnQztBQUM1QiwwQkFBSyxNQUFMLEdBQWMsQ0FBZDtBQUNBLDBCQUFLLE1BQUwsR0FBYyxDQUFkO0FBQ0EsNEJBQVEsR0FBUixDQUFZLGdCQUFaOztBQUVBO0FBQ0g7QUFDSixhQVhEOztBQWFBLG9CQUFRLEdBQVIsQ0FBWSxtQkFBWjs7QUFFQSxrQkFBSyxNQUFMLEdBQWMsUUFBUSxNQUF0Qjs7QUFFQSxvQkFBUSxPQUFSLENBQWdCLGtCQUFVO0FBQ3RCLG9CQUFJLFlBQVksT0FBTyxLQUFQLENBQWEsR0FBYixFQUFrQixHQUFsQixFQUFoQjs7QUFFQSxvQkFBRyxNQUFLLGVBQUwsQ0FBcUIsT0FBckIsQ0FBNkIsU0FBN0IsTUFBNEMsQ0FBQyxDQUFoRCxFQUFtRDtBQUMvQywwQkFBSyxTQUFMLENBQWUsTUFBZixFQUF1QixXQUF2QjtBQUNILGlCQUZELE1BR0ssSUFBRyxNQUFLLGNBQUwsQ0FBb0IsT0FBcEIsQ0FBNEIsU0FBNUIsTUFBMkMsQ0FBQyxDQUEvQyxFQUFrRDtBQUNuRCwwQkFBSyxRQUFMLENBQWMsTUFBZCxFQUFzQixXQUF0QjtBQUNILGlCQUZJLE1BR0EsSUFBRyxNQUFLLGNBQUwsQ0FBb0IsT0FBcEIsQ0FBNEIsU0FBNUIsTUFBMkMsQ0FBQyxDQUEvQyxFQUFrRDtBQUNuRCwwQkFBSyxRQUFMLENBQWMsTUFBZCxFQUFzQixXQUF0QjtBQUNILGlCQUZJLE1BR0EsSUFBRyxNQUFLLGVBQUwsQ0FBcUIsT0FBckIsQ0FBNkIsU0FBN0IsTUFBNEMsQ0FBQyxDQUFoRCxFQUFtRDtBQUNwRCwwQkFBSyxTQUFMLENBQWUsTUFBZixFQUF1QixXQUF2QjtBQUNILGlCQUZJLE1BR0E7QUFDRCw0QkFBUSxHQUFSLENBQVksK0JBQStCLE1BQTNDO0FBQ0g7QUFDSixhQWxCRDtBQW1CSCxTQXJDTSxDQUFQO0FBc0NILEtBakRlO0FBbURoQixhQW5EZ0IscUJBbUROLE1BbkRNLEVBbURFLFdBbkRGLEVBbURlO0FBQzNCLFlBQUksUUFBUSxJQUFJLEtBQUosRUFBWjtBQUNBLGNBQU0sZ0JBQU4sQ0FBdUIsTUFBdkIsRUFBK0IsV0FBL0IsRUFBNEMsS0FBNUM7QUFDQSxhQUFLLE1BQUwsSUFBZSxLQUFmO0FBQ0EsY0FBTSxHQUFOLEdBQVksTUFBWjtBQUNILEtBeERlO0FBMERoQixZQTFEZ0Isb0JBMERQLE1BMURPLEVBMERDLFdBMURELEVBMERjO0FBQzFCLFlBQUksYUFBYSxPQUFPLEtBQVAsQ0FBYSxHQUFiLEVBQWtCLEdBQWxCLEdBQXdCLEtBQXhCLENBQThCLEdBQTlCLEVBQW1DLENBQW5DLENBQWpCOztBQUVBLFlBQUksV0FBVyxTQUFTLGFBQVQsQ0FBdUIsT0FBdkIsQ0FBZjtBQUNBLFlBQUksV0FDSSwrQkFBK0IsVUFBL0IsR0FBNEMsZUFBNUMsR0FBOEQsTUFBOUQsR0FBdUUsTUFEL0U7O0FBR0EsaUJBQVMsV0FBVCxDQUFxQixTQUFTLGNBQVQsQ0FBd0IsUUFBeEIsQ0FBckI7QUFDQSxpQkFBUyxJQUFULENBQWMsV0FBZCxDQUEwQixRQUExQjs7QUFFQTtBQUNILEtBckVlO0FBdUVoQixZQXZFZ0Isb0JBdUVQLE1BdkVPLEVBdUVDLFdBdkVELEVBdUVjO0FBQUE7O0FBQzFCLFlBQUksTUFBTSxJQUFJLGNBQUosRUFBVjtBQUNBLFlBQUksSUFBSixDQUFTLEtBQVQsRUFBZ0IsTUFBaEIsRUFBd0IsSUFBeEI7QUFDQSxZQUFJLFlBQUosR0FBbUIsTUFBbkI7O0FBRUEsWUFBSSxNQUFKLEdBQWEsaUJBQVM7QUFDbEIsZ0JBQUcsSUFBSSxNQUFKLEtBQWUsR0FBbEIsRUFBdUI7QUFDbkIsb0JBQUksT0FBTyxLQUFLLEtBQUwsQ0FBVyxJQUFJLFlBQWYsQ0FBWDtBQUNBLHFCQUFLLElBQUwsR0FBWSxNQUFaO0FBQ0EsdUJBQUssS0FBSyxJQUFWLElBQWtCLElBQWxCOztBQUVBLG9CQUFHLEtBQUssT0FBUixFQUFpQjtBQUNiLDJCQUFLLGlCQUFMLENBQXVCLElBQXZCLEVBQTZCLE1BQTdCLEVBQXFDLFdBQXJDO0FBQ0gsaUJBRkQsTUFFTztBQUNIO0FBQ0g7QUFDSjtBQUNKLFNBWkQ7O0FBY0EsWUFBSSxJQUFKO0FBQ0gsS0EzRmU7QUE2RmhCLHFCQTdGZ0IsNkJBNkZFLElBN0ZGLEVBNkZRLE1BN0ZSLEVBNkZnQixXQTdGaEIsRUE2RjZCO0FBQUE7O0FBQ3pDLFlBQUksVUFBVSxPQUFPLE9BQVAsQ0FBZSxRQUFmLEVBQXlCLEVBQXpCLENBQWQ7QUFDQSxZQUFJLGNBQWMsVUFBVSxLQUFLLFNBQWpDOztBQUVBLFlBQUksbUJBQW1CLFNBQW5CLGdCQUFtQixHQUFNO0FBQ3pCLG1CQUFLLFdBQUwsSUFBb0IsS0FBcEI7O0FBRUEsbUJBQU8sSUFBUCxDQUFZLEtBQUssT0FBakIsRUFBMEIsT0FBMUIsQ0FBa0Msa0JBQVU7QUFDeEMsdUJBQUssTUFBTCxJQUFlLEtBQUssT0FBTCxDQUFhLE1BQWIsQ0FBZjtBQUNBLHVCQUFLLE1BQUwsRUFBYSxNQUFiLEdBQXNCLEtBQXRCO0FBQ0gsYUFIRDs7QUFLQTtBQUNILFNBVEQ7O0FBV0EsWUFBSSxRQUFRLElBQUksS0FBSixFQUFaO0FBQ0EsY0FBTSxnQkFBTixDQUF1QixNQUF2QixFQUErQixnQkFBL0IsRUFBaUQsS0FBakQ7QUFDQSxjQUFNLEdBQU4sR0FBWSxXQUFaO0FBQ0gsS0EvR2U7QUFpSGhCLGFBakhnQixxQkFpSE4sTUFqSE0sRUFpSEUsV0FqSEYsRUFpSGU7QUFDM0IsWUFBSSxRQUFRLHNCQUFVLE1BQVYsRUFBa0IsV0FBbEIsQ0FBWjs7QUFFQSxjQUFNLElBQU4sR0FBYSxNQUFiO0FBQ0EsYUFBSyxNQUFNLElBQVgsSUFBbUIsS0FBbkI7QUFDSDtBQXRIZSxDQUFiOztBQXlIQSxTQUFTLE9BQVQsQ0FBaUIsTUFBakIsRUFBeUIsTUFBekIsRUFBb0U7QUFBQSxRQUFuQyxNQUFtQyx1RUFBMUIsS0FBMEI7QUFBQSxRQUFuQixLQUFtQix1RUFBWCxTQUFXOztBQUN2RSxRQUFJLElBQUksT0FBTyxDQUFmO0FBQUEsUUFDSSxJQUFJLE9BQU8sQ0FEZjtBQUFBLFFBRUksUUFBUSxPQUFPLEtBRm5CO0FBQUEsUUFHSSxTQUFTLE9BQU8sTUFIcEI7O0FBS0EsUUFBSSxrQkFBSjs7QUFFQSxRQUFHLE9BQU8sQ0FBUCxHQUFXLENBQWQsRUFBaUI7QUFDYixZQUFHLE1BQUgsRUFBVyxPQUFPLEVBQVAsSUFBYSxDQUFDLENBQWQ7QUFDWCxZQUFHLE9BQU8sSUFBVixFQUFnQixPQUFPLEVBQVAsSUFBYSxPQUFPLElBQXBCOztBQUVoQixlQUFPLENBQVAsR0FBVyxDQUFYO0FBQ0Esb0JBQVksTUFBWjtBQUNIOztBQUVELFFBQUcsT0FBTyxDQUFQLEdBQVcsQ0FBZCxFQUFpQjtBQUNiLFlBQUcsTUFBSCxFQUFXLE9BQU8sRUFBUCxJQUFhLENBQUMsQ0FBZDtBQUNYLFlBQUcsT0FBTyxJQUFWLEVBQWdCLE9BQU8sRUFBUCxJQUFhLE9BQU8sSUFBcEI7O0FBRWhCLGVBQU8sQ0FBUCxHQUFXLENBQVg7QUFDQSxvQkFBWSxLQUFaO0FBQ0g7O0FBRUQsUUFBRyxPQUFPLENBQVAsR0FBVyxPQUFPLEtBQWxCLEdBQTBCLEtBQTdCLEVBQW9DO0FBQ2hDLFlBQUcsTUFBSCxFQUFXLE9BQU8sRUFBUCxJQUFhLENBQUMsQ0FBZDtBQUNYLFlBQUcsT0FBTyxJQUFWLEVBQWdCLE9BQU8sRUFBUCxJQUFhLE9BQU8sSUFBcEI7O0FBRWhCLGVBQU8sQ0FBUCxHQUFXLFFBQVEsT0FBTyxLQUExQjtBQUNBLG9CQUFZLE9BQVo7QUFDSDs7QUFFRCxRQUFHLE9BQU8sQ0FBUCxHQUFXLE9BQU8sTUFBbEIsR0FBMkIsTUFBOUIsRUFBc0M7QUFDbEMsWUFBRyxNQUFILEVBQVcsT0FBTyxFQUFQLElBQWEsQ0FBQyxDQUFkO0FBQ1gsWUFBRyxPQUFPLElBQVYsRUFBZ0IsT0FBTyxFQUFQLElBQWEsT0FBTyxJQUFwQjs7QUFFaEIsZUFBTyxDQUFQLEdBQVcsU0FBUyxPQUFPLE1BQTNCO0FBQ0Esb0JBQVksUUFBWjtBQUNIOztBQUVELFFBQUcsYUFBYSxLQUFoQixFQUF1QixNQUFNLFNBQU47O0FBRXZCLFdBQU8sU0FBUDtBQUNIOztBQUVNLFNBQVMsYUFBVCxDQUF1QixNQUF2QixFQUErQixNQUEvQixFQUEwRDtBQUFBLFFBQW5CLEtBQW1CLHVFQUFYLFNBQVc7O0FBQzdELFFBQUksSUFBSSxPQUFPLENBQWY7QUFBQSxRQUNJLElBQUksT0FBTyxDQURmO0FBQUEsUUFFSSxRQUFRLE9BQU8sS0FGbkI7QUFBQSxRQUdJLFNBQVMsT0FBTyxNQUhwQjs7QUFLQSxRQUFJLGtCQUFKOztBQUVBLFFBQUcsT0FBTyxDQUFQLEdBQVcsSUFBSSxPQUFPLEtBQXpCLEVBQWdDO0FBQzVCLG9CQUFZLE1BQVo7QUFDSDtBQUNELFFBQUcsT0FBTyxDQUFQLEdBQVcsSUFBSSxPQUFPLE1BQXpCLEVBQWlDO0FBQzdCLG9CQUFZLEtBQVo7QUFDSDtBQUNELFFBQUcsT0FBTyxDQUFQLEdBQVcsS0FBZCxFQUFxQjtBQUNqQixvQkFBWSxPQUFaO0FBQ0g7QUFDRCxRQUFHLE9BQU8sQ0FBUCxHQUFXLE1BQWQsRUFBc0I7QUFDbEIsb0JBQVksUUFBWjtBQUNIOztBQUVELFFBQUcsYUFBYSxLQUFoQixFQUF1QixNQUFNLFNBQU47O0FBRXZCLFdBQU8sU0FBUDtBQUNIOztBQUVNLFNBQVMsSUFBVCxDQUFjLE1BQWQsRUFBc0IsTUFBdEIsRUFBOEI7QUFDakMsUUFBSSxRQUFRLE9BQU8sS0FBbkI7QUFBQSxRQUNJLFNBQVMsT0FBTyxNQURwQjs7QUFHQSxRQUFHLE9BQU8sQ0FBUCxHQUFXLE9BQU8sS0FBbEIsR0FBMEIsQ0FBN0IsRUFBZ0M7QUFDNUIsZUFBTyxDQUFQLEdBQVcsS0FBWDtBQUNIO0FBQ0QsUUFBRyxPQUFPLENBQVAsR0FBVyxPQUFPLE1BQWxCLEdBQTJCLENBQTlCLEVBQWlDO0FBQzdCLGVBQU8sQ0FBUCxHQUFXLE1BQVg7QUFDSDtBQUNELFFBQUcsT0FBTyxDQUFQLEdBQVcsT0FBTyxLQUFsQixHQUEwQixLQUE3QixFQUFvQztBQUNoQyxlQUFPLENBQVAsR0FBVyxDQUFDLE9BQU8sS0FBbkI7QUFDSDtBQUNELFFBQUcsT0FBTyxDQUFQLEdBQVcsT0FBTyxNQUFsQixHQUEyQixNQUE5QixFQUFzQztBQUNsQyxlQUFPLENBQVAsR0FBVyxDQUFDLE9BQU8sTUFBbkI7QUFDSDtBQUNKOztBQUVNLFNBQVMsd0JBQVQsQ0FBa0MsS0FBbEMsRUFBeUM7QUFDNUMsVUFBTSxRQUFOLENBQWUsT0FBZixDQUF1QixrQkFBVTtBQUM3Qiw0QkFBb0IsTUFBcEI7QUFDSCxLQUZEOztBQUlBLGFBQVMsbUJBQVQsQ0FBNkIsTUFBN0IsRUFBcUM7QUFDakMsZUFBTyxTQUFQLEdBQW1CLE9BQU8sQ0FBMUI7QUFDQSxlQUFPLFNBQVAsR0FBbUIsT0FBTyxDQUExQjs7QUFFQSxZQUFHLE9BQU8sUUFBUCxJQUFtQixPQUFPLFFBQVAsQ0FBZ0IsTUFBaEIsR0FBeUIsQ0FBL0MsRUFBa0Q7QUFDOUMsbUJBQU8sUUFBUCxDQUFnQixPQUFoQixDQUF3QixpQkFBUztBQUM3QixvQ0FBb0IsS0FBcEI7QUFDSCxhQUZEO0FBR0g7QUFDSjtBQUNKOztBQUVNLFNBQVMsUUFBVCxDQUFrQixFQUFsQixFQUFzQixFQUF0QixFQUEwQjtBQUM3QixRQUFJLEtBQUssR0FBRyxPQUFILEdBQWEsR0FBRyxPQUF6QjtBQUFBLFFBQ0ksS0FBSyxHQUFHLE9BQUgsR0FBYSxHQUFHLE9BRHpCOztBQUdBLFdBQU8sS0FBSyxJQUFMLENBQVUsS0FBSyxFQUFMLEdBQVUsS0FBSyxFQUF6QixDQUFQO0FBQ0g7O0FBRU0sU0FBUyxVQUFULENBQW9CLFFBQXBCLEVBQThCLE1BQTlCLEVBQXNDLEtBQXRDLEVBQTZDO0FBQ2hELFFBQUksS0FBSyxPQUFPLE9BQVAsR0FBaUIsU0FBUyxPQUFuQztBQUFBLFFBQ0ksS0FBSyxPQUFPLE9BQVAsR0FBaUIsU0FBUyxPQURuQztBQUFBLFFBRUksV0FBVyxLQUFLLElBQUwsQ0FBVSxLQUFLLEVBQUwsR0FBVSxLQUFLLEVBQXpCLENBRmY7QUFHQSxRQUFHLFlBQVksQ0FBZixFQUFrQjtBQUNkLGlCQUFTLENBQVQsSUFBYyxLQUFLLEtBQW5CO0FBQ0EsaUJBQVMsQ0FBVCxJQUFjLEtBQUssS0FBbkI7QUFDSDtBQUNKOztBQUVNLFNBQVMsY0FBVCxDQUF3QixRQUF4QixFQUFrQyxNQUFsQyxFQUEwQyxLQUExQyxFQUFpRDtBQUNwRCxRQUFJLEtBQUssT0FBTyxPQUFQLEdBQWlCLFNBQVMsT0FBbkM7QUFBQSxRQUNJLEtBQUssT0FBTyxPQUFQLEdBQWlCLFNBQVMsT0FEbkM7QUFBQSxRQUVJLFdBQVcsS0FBSyxJQUFMLENBQVUsS0FBSyxFQUFMLEdBQVUsS0FBSyxFQUF6QixDQUZmO0FBR0EsUUFBRyxZQUFZLEtBQWYsRUFBc0I7QUFDbEIsaUJBQVMsQ0FBVCxJQUFlLEtBQUssUUFBTixHQUFrQixLQUFoQztBQUNBLGlCQUFTLENBQVQsSUFBZSxLQUFLLFFBQU4sR0FBa0IsS0FBaEM7QUFDSDtBQUNKOztBQUVNLFNBQVMsS0FBVCxDQUFlLEVBQWYsRUFBbUIsRUFBbkIsRUFBdUI7QUFDMUIsV0FBTyxLQUFLLEtBQUwsQ0FDSCxHQUFHLE9BQUgsR0FBYSxHQUFHLE9BRGIsRUFFSCxHQUFHLE9BQUgsR0FBYSxHQUFHLE9BRmIsQ0FBUDtBQUlIOztBQUVNLFNBQVMsWUFBVCxDQUFzQixjQUF0QixFQUFzQyxZQUF0QyxFQUFvRCxRQUFwRCxFQUE4RCxLQUE5RCxFQUFxRTtBQUN4RSxtQkFBZSxDQUFmLEdBQW1CLGFBQWEsT0FBYixHQUF1QixlQUFlLE1BQWYsQ0FBc0IsQ0FBN0MsR0FDSSxXQUFXLEtBQUssR0FBTCxDQUFTLEtBQVQsQ0FEZixHQUVHLGVBQWUsU0FGckM7QUFHQSxtQkFBZSxDQUFmLEdBQW1CLGFBQWEsT0FBYixHQUF1QixlQUFlLE1BQWYsQ0FBc0IsQ0FBN0MsR0FDSSxXQUFXLEtBQUssR0FBTCxDQUFTLEtBQVQsQ0FEZixHQUVHLGVBQWUsU0FGckM7QUFHSDs7QUFFTSxTQUFTLFdBQVQsQ0FBcUIsTUFBckIsRUFBNkIsTUFBN0IsRUFBcUMsU0FBckMsRUFBZ0QsU0FBaEQsRUFBMkQsS0FBM0QsRUFBa0U7QUFDckUsUUFBSSxRQUFRLEVBQVo7O0FBRUEsVUFBTSxDQUFOLEdBQVUsU0FBUyxLQUFLLEdBQUwsQ0FBUyxLQUFULElBQWtCLFNBQXJDO0FBQ0EsVUFBTSxDQUFOLEdBQVUsU0FBUyxLQUFLLEdBQUwsQ0FBUyxLQUFULElBQWtCLFNBQXJDOztBQUVBLFdBQU8sS0FBUDtBQUNIOztBQUVEO0FBQ08sSUFBSSxnQ0FBWSxTQUFaLFNBQVksQ0FBQyxHQUFELEVBQU0sR0FBTixFQUFjO0FBQ2pDLFdBQU8sS0FBSyxLQUFMLENBQVcsS0FBSyxNQUFMLE1BQWlCLE1BQU0sR0FBTixHQUFZLENBQTdCLENBQVgsSUFBOEMsR0FBckQ7QUFDSCxDQUZNOztBQUlBLElBQUksb0NBQWMsU0FBZCxXQUFjLENBQUMsR0FBRCxFQUFNLEdBQU4sRUFBYztBQUNuQyxXQUFPLE1BQU0sS0FBSyxNQUFMLE1BQWlCLE1BQU0sR0FBdkIsQ0FBYjtBQUNILENBRk07Ozs7O0FDOVJQOztBQUdBOztBQUVBOztBQUNBOztBQUVBLGtCQUFPLElBQVAsQ0FBWSxDQUNSLG9CQURRLEVBRVIsaUNBRlEsRUFHUix1QkFIUSxFQUlSLG9CQUpRLENBQVosRUFLRyxJQUxILENBS1E7QUFBQSxXQUFNLE9BQU47QUFBQSxDQUxSOztBQU9BLElBQUksZUFBSjtBQUFBLElBQVksYUFBWjtBQUFBLElBQWtCLGdCQUFsQjtBQUFBLElBQTJCLGlCQUEzQjtBQUFBLElBQXFDLFdBQXJDO0FBQ0EsSUFBSSxVQUFVLEVBQWQ7QUFDQSxJQUFJLFlBQVksRUFBaEI7QUFDQSxJQUFJLGdCQUFKOztBQUVBLElBQUksUUFBUSxDQUFaOztBQUVBLFNBQVMsS0FBVCxDQUNZLE9BRFosRUFDcUIsS0FEckIsRUFDNEIsZ0JBRDVCLEVBRVksV0FGWixFQUV5QixZQUZ6QixFQUV1QyxZQUZ2QyxFQUVxRDtBQUNqRCxRQUFJLFNBQVMsY0FBYjs7QUFFQSxXQUFPLENBQVAsR0FBVyxRQUFRLE9BQVIsR0FBa0IsT0FBTyxTQUF6QixHQUFzQyxtQkFBbUIsS0FBSyxHQUFMLENBQVMsS0FBVCxDQUFwRTtBQUNBLFdBQU8sQ0FBUCxHQUFXLFFBQVEsT0FBUixHQUFrQixPQUFPLFVBQXpCLEdBQXVDLG1CQUFtQixLQUFLLEdBQUwsQ0FBUyxLQUFULENBQXJFOztBQUVBLFdBQU8sRUFBUCxHQUFZLEtBQUssR0FBTCxDQUFTLEtBQVQsSUFBa0IsV0FBOUI7QUFDQSxXQUFPLEVBQVAsR0FBWSxDQUFDLEtBQUssR0FBTCxDQUFTLEtBQVQsQ0FBRCxHQUFtQixXQUEvQjs7QUFFQSxXQUFPLFFBQVAsR0FBa0IsS0FBbEI7O0FBRUEsaUJBQWEsSUFBYixDQUFrQixNQUFsQjs7QUFFQSxpQ0FBZSxPQUFPLENBQXRCLEVBQXlCLE9BQU8sQ0FBaEM7QUFDQSxhQUFTLElBQVQ7QUFDSDs7QUFFRCxTQUFTLGFBQVQsR0FBeUI7QUFDckIsUUFBSSxJQUFJLDBCQUFVLENBQVYsRUFBYSxlQUFNLFdBQU4sQ0FBa0IsS0FBL0IsQ0FBUjtBQUFBLFFBQ0ksSUFBSSwwQkFBVSxDQUFWLEVBQWEsZUFBTSxXQUFOLENBQWtCLE1BQS9CLENBRFI7O0FBR0EsUUFBSSxXQUFXLHFCQUFPLGtCQUFPLHNCQUFQLENBQVAsRUFBdUMsQ0FBdkMsRUFBMEMsQ0FBMUMsQ0FBZjtBQUNBLGFBQVMsUUFBVCxHQUFvQixJQUFwQjtBQUNBLGFBQVMsUUFBVCxHQUFvQixFQUFwQjs7QUFFQSxhQUFTLEVBQVQsR0FBYyw0QkFBWSxDQUFDLENBQWIsRUFBZ0IsQ0FBaEIsQ0FBZDtBQUNBLGFBQVMsRUFBVCxHQUFjLDRCQUFZLENBQUMsQ0FBYixFQUFnQixDQUFoQixDQUFkOztBQUVBLGFBQVMsYUFBVCxHQUF5Qiw0QkFBWSxJQUFaLEVBQWtCLElBQWxCLENBQXpCOztBQUVBLGNBQVUsSUFBVixDQUFlLFFBQWY7QUFDSDs7QUFFRCxTQUFTLEtBQVQsR0FBaUI7QUFDYixhQUFTLHlCQUFXLElBQVgsRUFBaUIsR0FBakIsRUFBc0IsTUFBdEIsQ0FBVDtBQUNBLG1CQUFNLEtBQU4sR0FBYyxPQUFPLEtBQXJCO0FBQ0EsbUJBQU0sTUFBTixHQUFlLE9BQU8sTUFBdEI7O0FBRUEsY0FBVSw4QkFBWSxNQUFaLENBQVY7QUFDQSxlQUFXLGtCQUFPLHVCQUFQLENBQVg7O0FBRUEsU0FBSyx5QkFBVyxrQkFBTyxvQkFBUCxDQUFYLEVBQXlDLE9BQU8sS0FBaEQsRUFBdUQsT0FBTyxNQUE5RCxDQUFMOztBQUVBLFdBQU8scUJBQU8sa0JBQU8scUJBQVAsQ0FBUCxDQUFQO0FBQ0EsU0FBSyxNQUFMLEdBQWMsR0FBZDtBQUNBLFNBQUssTUFBTCxHQUFjLEdBQWQ7QUFDQSxtQkFBTSxTQUFOLENBQWdCLElBQWhCOztBQUVBLFNBQUssRUFBTCxHQUFVLENBQVY7QUFDQSxTQUFLLEVBQUwsR0FBVSxDQUFWO0FBQ0EsU0FBSyxhQUFMLEdBQXFCLEdBQXJCO0FBQ0EsU0FBSyxhQUFMLEdBQXFCLEdBQXJCO0FBQ0EsU0FBSyxRQUFMLEdBQWdCLElBQWhCO0FBQ0EsU0FBSyxLQUFMLEdBQWEsQ0FBYjs7QUFFQSxTQUFLLGFBQUwsR0FBcUIsQ0FBckI7O0FBRUEsU0FBSyxXQUFMLEdBQW1CLEtBQW5COztBQUVBLFNBQUssS0FBTCxHQUFhLENBQWI7QUFDQSxTQUFLLFNBQUwsR0FBaUIsS0FBakI7O0FBRUEsUUFBSSxZQUFZLDJCQUFTLEVBQVQsQ0FBaEI7QUFBQSxRQUNJLGFBQWEsMkJBQVMsRUFBVCxDQURqQjtBQUFBLFFBRUksVUFBVSwyQkFBUyxFQUFULENBRmQ7QUFBQSxRQUdJLFFBQVEsMkJBQVMsRUFBVCxDQUhaOztBQUtBLGNBQVUsS0FBVixHQUFrQjtBQUFBLGVBQU0sS0FBSyxhQUFMLEdBQXFCLENBQUMsR0FBNUI7QUFBQSxLQUFsQjtBQUNBLGNBQVUsT0FBVixHQUFvQixZQUFNO0FBQ3RCLFlBQUcsQ0FBQyxXQUFXLE1BQWYsRUFBdUIsS0FBSyxhQUFMLEdBQXFCLENBQXJCO0FBQzFCLEtBRkQ7O0FBSUEsZUFBVyxLQUFYLEdBQW1CO0FBQUEsZUFBTSxLQUFLLGFBQUwsR0FBcUIsR0FBM0I7QUFBQSxLQUFuQjtBQUNBLGVBQVcsT0FBWCxHQUFxQixZQUFNO0FBQ3ZCLFlBQUcsQ0FBQyxVQUFVLE1BQWQsRUFBc0IsS0FBSyxhQUFMLEdBQXFCLENBQXJCO0FBQ3pCLEtBRkQ7O0FBSUEsWUFBUSxLQUFSLEdBQWdCO0FBQUEsZUFBTSxLQUFLLFdBQUwsR0FBbUIsSUFBekI7QUFBQSxLQUFoQjtBQUNBLFlBQVEsT0FBUixHQUFrQjtBQUFBLGVBQU0sS0FBSyxXQUFMLEdBQW1CLEtBQXpCO0FBQUEsS0FBbEI7O0FBRUEsVUFBTSxLQUFOLEdBQWMsWUFBTTtBQUNoQixjQUNJLElBREosRUFDVSxLQUFLLFFBRGYsRUFDeUIsRUFEekIsRUFDNkIsRUFEN0IsRUFDaUMsT0FEakMsRUFFSTtBQUFBLG1CQUFNLHFCQUFPLGtCQUFPLGdCQUFQLENBQVAsQ0FBTjtBQUFBLFNBRko7QUFJQSxjQUNJLElBREosRUFDVSxLQUFLLFFBRGYsRUFDeUIsQ0FBQyxFQUQxQixFQUM4QixFQUQ5QixFQUNrQyxPQURsQyxFQUVJO0FBQUEsbUJBQU0scUJBQU8sa0JBQU8sZ0JBQVAsQ0FBUCxDQUFOO0FBQUEsU0FGSjtBQUlILEtBVEQ7O0FBV0EsY0FBVSxtQkFBSyxRQUFMLEVBQWUsNEJBQWYsRUFBNkMsT0FBN0MsRUFBc0QsQ0FBdEQsRUFBeUQsQ0FBekQsQ0FBVjs7QUFFQSxTQUFJLElBQUksSUFBSSxDQUFaLEVBQWUsSUFBSSxDQUFuQixFQUFzQixHQUF0QixFQUEwQjtBQUN0QjtBQUNIOztBQUVEO0FBQ0g7O0FBRUQsU0FBUyxRQUFULEdBQW9CO0FBQ2hCLDBCQUFzQixRQUF0Qjs7QUFFQSxRQUFHLG1CQUFVLE1BQVYsR0FBbUIsQ0FBdEIsRUFBeUI7QUFDckIsMkJBQVUsT0FBVixDQUFrQixvQkFBWTtBQUMxQixxQkFBUyxNQUFUO0FBQ0gsU0FGRDtBQUdIOztBQUVELGNBQVUsUUFBUSxNQUFSLENBQWUsa0JBQVU7QUFDL0IsZUFBTyxDQUFQLElBQVksT0FBTyxFQUFuQjtBQUNBLGVBQU8sQ0FBUCxJQUFZLE9BQU8sRUFBbkI7O0FBRUEsWUFBSSxZQUFZLDhCQUFjLE1BQWQsRUFBc0IsZUFBTSxXQUE1QixDQUFoQjs7QUFFQSxZQUFHLFNBQUgsRUFBYztBQUNWLGlDQUFPLE1BQVA7QUFDQSxtQkFBTyxLQUFQO0FBQ0g7O0FBRUQsZUFBTyxJQUFQO0FBQ0gsS0FaUyxDQUFWOztBQWNBLFNBQUksSUFBSSxJQUFJLENBQVosRUFBZSxJQUFJLFVBQVUsTUFBN0IsRUFBcUMsR0FBckMsRUFBMEM7QUFDdEMsWUFBSSxLQUFLLFVBQVUsQ0FBVixDQUFUOztBQUVBO0FBQ0EsV0FBRyxRQUFILElBQWUsR0FBRyxhQUFsQjtBQUNBLFdBQUcsQ0FBSCxJQUFRLEdBQUcsRUFBWDtBQUNBLFdBQUcsQ0FBSCxJQUFRLEdBQUcsRUFBWDs7QUFFQSw2QkFBSyxFQUFMLEVBQVMsZUFBTSxXQUFmOztBQUVBO0FBQ0E7QUFDQSxhQUFJLElBQUksSUFBSSxJQUFJLENBQWhCLEVBQW1CLElBQUksVUFBVSxNQUFqQyxFQUF5QyxHQUF6QyxFQUE4QztBQUMxQyxnQkFBSSxLQUFLLFVBQVUsQ0FBVixDQUFUOztBQUVBLGtEQUFzQixFQUF0QixFQUEwQixFQUExQjtBQUNIO0FBQ0Q7QUFDQSxZQUFJLFlBQVkseUNBQXlCLEVBQXpCLEVBQTZCLElBQTdCLEVBQW1DLElBQW5DLENBQWhCO0FBQ0EsWUFBRyxTQUFILEVBQWM7QUFDVixpQkFBSyxLQUFMLElBQWMsQ0FBZDtBQUNBO0FBQ0EsaUJBQUssU0FBTCxHQUFpQixJQUFqQjtBQUNBO0FBQ0EseUNBQWUsS0FBSyxDQUFwQixFQUF1QixLQUFLLENBQTVCOztBQUVBO0FBQ0EsdUJBQVcsWUFBTTtBQUNiO0FBQ0EsK0JBQU0sU0FBTixDQUFnQixJQUFoQjtBQUNBLHFCQUFLLFFBQUwsR0FBZ0IsQ0FBaEI7QUFDQSxxQkFBSyxTQUFMLEdBQWlCLEtBQWpCO0FBQ0gsYUFMRCxFQUtHLElBTEg7QUFNSDtBQUNKOztBQUVELFFBQUcsQ0FBQyxLQUFLLFNBQVQsRUFBb0I7QUFDaEIsYUFBSyxRQUFMLElBQWlCLEtBQUssYUFBdEI7O0FBRUEsWUFBRyxLQUFLLFdBQVIsRUFBcUI7QUFDakIsaUJBQUssRUFBTCxJQUFXLEtBQUssYUFBTCxHQUFxQixLQUFLLEdBQUwsQ0FBUyxLQUFLLFFBQWQsQ0FBaEM7QUFDQSxpQkFBSyxFQUFMLElBQVcsQ0FBQyxLQUFLLGFBQU4sR0FBc0IsS0FBSyxHQUFMLENBQVMsS0FBSyxRQUFkLENBQWpDO0FBQ0gsU0FIRCxNQUdPO0FBQ0gsaUJBQUssRUFBTCxJQUFXLEtBQUssUUFBaEI7QUFDQSxpQkFBSyxFQUFMLElBQVcsS0FBSyxRQUFoQjtBQUNIOztBQUVELGFBQUssQ0FBTCxJQUFVLEtBQUssRUFBZjtBQUNBLGFBQUssQ0FBTCxJQUFVLEtBQUssRUFBZjs7QUFFQSw2QkFBSyxJQUFMLEVBQVcsZUFBTSxXQUFqQjtBQUNIOztBQUVELE9BQUcsQ0FBSCxJQUFRLEtBQUssS0FBTCxDQUFXLEtBQUssRUFBaEIsQ0FBUjtBQUNBLE9BQUcsQ0FBSCxJQUFRLEtBQUssS0FBTCxDQUFXLEtBQUssRUFBaEIsQ0FBUjs7QUFFQSxZQUFRLE9BQVIsR0FBa0IsYUFBYSxLQUEvQjs7QUFFQSx5QkFBTyxNQUFQO0FBQ0giLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyogXG5jb2xsaXNpb24uanNcbj09PT09PT09PT09PVxuXG5UaGlzIEphdmFTY3JpcHQgZmlsZSBjb250YWlucyA2IGNvbGxpc2lvbiBmdW5jdGlvbnM6XG5cbi0gaGl0VGVzdFBvaW50XG4tIGhpdFRlc3RDaXJjbGVcbi0gcmVjdGFuZ2xlQ29sbGlzaW9uXG4tIGNpcmNsZUNvbGxpc2lvblxuLSBtb3ZpbmdDaXJjbGVDb2xsaXNpb25cbi0gYm91bmNlT2ZmU3VyZmFjZVxuXG5UbyB1c2UgdGhlbSB5b3UnbGwgbmVlZCBzcHJpdGUgb2JqZWN0cyB3aXRoIHRoZXNlIG1pbmltdW0gcHJvcGVydGllczpcblxuICAgIHgsIHksIGNlbnRlci54LCBjZW50ZXIueSwgd2lkdGgsIGhlaWdodFxuXG5Gb3IgcmVjdGFuZ3VsYXIgc3ByaXRlcywgeW91IG5lZWQgdGhlc2UgYWRkaXRpb25hbCBwcm9wZXJ0aWVzOlxuXG4gICAgaGFsZldpZHRoLCBoYWxmSGVpZ2h0XG5cbkZvciBjaXJjdWxhciBzcHJpdGVzLCB5b3UgbmVlZCB0aGVzZSBhZGRpdGlvbmFsIHByb3BlcnRpZXM6XG5cbiAgICBkaWFtZXRlciwgcmFkaXVzXG5cbk9wdGlvbmFsbHkgdGhlIHNwcml0ZXMgY2FuIGluY2x1ZGUgYSBtYXNzIHByb3BlcnR5OlxuXG4gICAgbWFzc1xuXG5NYXNzIHNob3VsZCBoYXZlIGEgdmFsdWUgZ3JlYXRlciB0aGFuIDEuXG5cblNlZSB0aGUgYHNwcml0ZS5qc2AgZmlsZSBmb3IgYW4gZXhhbXBsZSBvZiBzcHJpdGUgcHJvdG90eXBlIG9iamVjdHNcbnRoYXQgdXNlIHRoZXNlIHByb3BlcnRpZXMuXG5cbiovXG5cbi8qXG5oaXRUZXN0UG9pbnRcbi0tLS0tLS0tLS0tLVxuXG5Vc2UgaXQgdG8gZmluZCBvdXQgaWYgYSBwb2ludCBpcyB0b3VjaGluZyBhIGNpcmNsdWxhciBvciByZWN0YW5ndWxhciBzcHJpdGUuXG5QYXJhbWV0ZXJzOiBcbmEuIEFuIG9iamVjdCB3aXRoIGB4YCBhbmQgYHlgIHByb3BlcnRpZXMuXG5iLiBBIHNwcml0ZSBvYmplY3Qgd2l0aCBgeGAsIGB5YCwgYGNlbnRlclhgIGFuZCBgY2VudGVyWWAgcHJvcGVydGllcy5cbklmIHRoZSBzcHJpdGUgaGFzIGEgYHJhZGl1c2AgcHJvcGVydHksIHRoZSBmdW5jdGlvbiB3aWxsIGludGVycHJldFxudGhlIHNoYXBlIGFzIGEgY2lyY2xlLlxuKi9cblxuZXhwb3J0XG5mdW5jdGlvbiBoaXRUZXN0UG9pbnQocG9pbnQsIHNwcml0ZSkge1xuXG4gIGxldCBzaGFwZSwgbGVmdCwgcmlnaHQsIHRvcCwgYm90dG9tLCB2eCwgdnksIG1hZ25pdHVkZSwgaGl0O1xuXG4gIC8vRmluZCBvdXQgaWYgdGhlIHNwcml0ZSBpcyByZWN0YW5ndWxhciBvciBjaXJjdWxhciBkZXBlbmRpbmdcbiAgLy9vbiB3aGV0aGVyIGl0IGhhcyBhIGByYWRpdXNgIHByb3BlcnR5XG4gIGlmIChzcHJpdGUucmFkaXVzKSB7XG4gICAgc2hhcGUgPSBcImNpcmNsZVwiO1xuICB9IGVsc2Uge1xuICAgIHNoYXBlID0gXCJyZWN0YW5nbGVcIjtcbiAgfVxuXG4gIC8vUmVjdGFuZ2xlXG4gIGlmIChzaGFwZSA9PT0gXCJyZWN0YW5nbGVcIikge1xuICAgIC8vR2V0IHRoZSBwb3NpdGlvbiBvZiB0aGUgc3ByaXRlJ3MgZWRnZXNcbiAgICBsZWZ0ID0gc3ByaXRlLng7XG4gICAgcmlnaHQgPSBzcHJpdGUueCArIHNwcml0ZS53aWR0aDtcbiAgICB0b3AgPSBzcHJpdGUueTtcbiAgICBib3R0b20gPSBzcHJpdGUueSArIHNwcml0ZS5oZWlnaHQ7XG5cbiAgICAvL0ZpbmQgb3V0IGlmIHRoZSBwb2ludCBpcyBpbnRlcnNlY3RpbmcgdGhlIHJlY3RhbmdsZVxuICAgIGhpdCA9IHBvaW50LnggPiBsZWZ0ICYmIHBvaW50LnggPCByaWdodCAmJiBwb2ludC55ID4gdG9wICYmIHBvaW50LnkgPCBib3R0b207XG4gIH1cblxuICAvL0NpcmNsZVxuICBpZiAoc2hhcGUgPT09IFwiY2lyY2xlXCIpIHtcbiAgICAvL0ZpbmQgdGhlIGRpc3RhbmNlIGJldHdlZW4gdGhlIHBvaW50IGFuZCB0aGVcbiAgICAvL2NlbnRlciBvZiB0aGUgY2lyY2xlXG4gICAgdnggPSBwb2ludC54IC0gc3ByaXRlLmNlbnRlclgsXG4gICAgdnkgPSBwb2ludC55IC0gc3ByaXRlLmNlbnRlclksXG4gICAgbWFnbml0dWRlID0gTWF0aC5zcXJ0KHZ4ICogdnggKyB2eSAqIHZ5KTtcblxuICAgIC8vVGhlIHBvaW50IGlzIGludGVyc2VjdGluZyB0aGUgY2lyY2xlIGlmIHRoZSBtYWduaXR1ZGVcbiAgICAvLyhkaXN0YW5jZSkgaXMgbGVzcyB0aGFuIHRoZSBjaXJjbGUncyByYWRpdXNcbiAgICBoaXQgPSBtYWduaXR1ZGUgPCBzcHJpdGUucmFkaXVzO1xuICB9XG5cbiAgLy9gaGl0YCB3aWxsIGJlIGVpdGhlciBgdHJ1ZWAgb3IgYGZhbHNlYFxuICByZXR1cm4gaGl0O1xufVxuXG5cbi8qXG5oaXRUZXN0Q2lyY2xlXG4tLS0tLS0tLS0tLS0tXG5cblVzZSBpdCB0byBmaW5kIG91dCBpZiB0d28gY2lyY3VsYXIgc3ByaXRlcyBhcmUgdG91Y2hpbmcuXG5QYXJhbWV0ZXJzOiBcbmEuIEEgc3ByaXRlIG9iamVjdCB3aXRoIGBjZW50ZXJYYCwgYGNlbnRlcllgIGFuZCBgcmFkaXVzYCBwcm9wZXJ0aWVzLlxuYi4gQSBzcHJpdGUgb2JqZWN0IHdpdGggYGNlbnRlclhgLCBgY2VudGVyWWAgYW5kIGByYWRpdXNgLlxuKi9cblxuZXhwb3J0XG5mdW5jdGlvbiBoaXRUZXN0Q2lyY2xlKGMxLCBjMiwgZ2xvYmFsID0gZmFsc2UpIHtcbiAgbGV0IHZ4LCB2eSwgbWFnbml0dWRlLCBjb21iaW5lZFJhZGlpLCBoaXQ7XG5cbiAgLy9DYWxjdWxhdGUgdGhlIHZlY3RvciBiZXR3ZWVuIHRoZSBjaXJjbGVz4oCZIGNlbnRlciBwb2ludHNcbiAgaWYgKGdsb2JhbCkge1xuICAgIC8vVXNlIGdsb2JhbCBjb29yZGluYXRlc1xuICAgIHZ4ID0gKGMyLmd4ICsgYzIucmFkaXVzKSAtIChjMS5neCArIGMxLnJhZGl1cyk7XG4gICAgdnkgPSAoYzIuZ3kgKyBjMi5yYWRpdXMpIC0gKGMxLmd5ICsgYzEucmFkaXVzKTtcbiAgfSBlbHNlIHtcbiAgICAvL1VzZSBsb2NhbCBjb29yZGluYXRlc1xuICAgIHZ4ID0gYzIuY2VudGVyWCAtIGMxLmNlbnRlclg7XG4gICAgdnkgPSBjMi5jZW50ZXJZIC0gYzEuY2VudGVyWTtcbiAgfVxuXG4gIC8vRmluZCB0aGUgZGlzdGFuY2UgYmV0d2VlbiB0aGUgY2lyY2xlcyBieSBjYWxjdWxhdGluZ1xuICAvL3RoZSB2ZWN0b3IncyBtYWduaXR1ZGUgKGhvdyBsb25nIHRoZSB2ZWN0b3IgaXMpXG4gIG1hZ25pdHVkZSA9IE1hdGguc3FydCh2eCAqIHZ4ICsgdnkgKiB2eSk7XG5cbiAgLy9BZGQgdG9nZXRoZXIgdGhlIGNpcmNsZXMnIHRvdGFsIHJhZGlpXG4gIGNvbWJpbmVkUmFkaWkgPSBjMS5yYWRpdXMgKyBjMi5yYWRpdXM7XG5cbiAgLy9TZXQgYGhpdGAgdG8gYHRydWVgIGlmIHRoZSBkaXN0YW5jZSBiZXR3ZWVuIHRoZSBjaXJjbGVzIGlzXG4gIC8vbGVzcyB0aGFuIHRoZWlyIGBjb21iaW5lZFJhZGlpYFxuICBoaXQgPSBtYWduaXR1ZGUgPCBjb21iaW5lZFJhZGlpO1xuXG4gIC8vYGhpdGAgd2lsbCBiZSBlaXRoZXIgYHRydWVgIG9yIGBmYWxzZWBcbiAgcmV0dXJuIGhpdDtcbn07XG5cblxuLypcbmNpcmNsZUNvbGxpc2lvblxuLS0tLS0tLS0tLS0tLS0tXG5cblVzZSBpdCB0byBwcmV2ZW50IGEgbW92aW5nIGNpcmN1bGFyIHNwcml0ZSBmcm9tIG92ZXJsYXBwaW5nIGFuZCBvcHRpb25hbGx5XG5ib3VuY2luZyBvZmYgYSBub24tbW92aW5nIGNpcmN1bGFyIHNwcml0ZS5cblBhcmFtZXRlcnM6IFxuYS4gQSBzcHJpdGUgb2JqZWN0IHdpdGggYHhgLCBgeWAgYGNlbnRlclhgLCBgY2VudGVyWWAgYW5kIGByYWRpdXNgIHByb3BlcnRpZXMuXG5iLiBBIHNwcml0ZSBvYmplY3Qgd2l0aCBgeGAsIGB5YCBgY2VudGVyWGAsIGBjZW50ZXJZYCBhbmQgYHJhZGl1c2AgcHJvcGVydGllcy5cbmMuIE9wdGlvbmFsOiB0cnVlIG9yIGZhbHNlIHRvIGluZGljYXRlIHdoZXRoZXIgb3Igbm90IHRoZSBmaXJzdCBzcHJpdGVcbnNob3VsZCBib3VuY2Ugb2ZmIHRoZSBzZWNvbmQgc3ByaXRlLlxuVGhlIHNwcml0ZXMgY2FuIGNvbnRhaW4gYW4gb3B0aW9uYWwgbWFzcyBwcm9wZXJ0eSB0aGF0IHNob3VsZCBiZSBncmVhdGVyIHRoYW4gMS5cblxuKi9cblxuZXhwb3J0XG5mdW5jdGlvbiBjaXJjbGVDb2xsaXNpb24oYzEsIGMyLCBib3VuY2UgPSBmYWxzZSwgZ2xvYmFsID0gZmFsc2UpIHtcblxuICBsZXQgbWFnbml0dWRlLCBjb21iaW5lZFJhZGlpLCBvdmVybGFwLFxuICAgIHZ4LCB2eSwgZHgsIGR5LCBzID0ge30sXG4gICAgaGl0ID0gZmFsc2U7XG5cbiAgLy9DYWxjdWxhdGUgdGhlIHZlY3RvciBiZXR3ZWVuIHRoZSBjaXJjbGVz4oCZIGNlbnRlciBwb2ludHNcblxuICBpZiAoZ2xvYmFsKSB7XG4gICAgLy9Vc2UgZ2xvYmFsIGNvb3JkaW5hdGVzXG4gICAgdnggPSAoYzIuZ3ggKyBjMi5yYWRpdXMpIC0gKGMxLmd4ICsgYzEucmFkaXVzKTtcbiAgICB2eSA9IChjMi5neSArIGMyLnJhZGl1cykgLSAoYzEuZ3kgKyBjMS5yYWRpdXMpO1xuICB9IGVsc2Uge1xuICAgIC8vVXNlIGxvY2FsIGNvb3JkaW5hdGVzXG4gICAgdnggPSBjMi5jZW50ZXJYIC0gYzEuY2VudGVyWDtcbiAgICB2eSA9IGMyLmNlbnRlclkgLSBjMS5jZW50ZXJZO1xuICB9XG5cbiAgLy9GaW5kIHRoZSBkaXN0YW5jZSBiZXR3ZWVuIHRoZSBjaXJjbGVzIGJ5IGNhbGN1bGF0aW5nXG4gIC8vdGhlIHZlY3RvcidzIG1hZ25pdHVkZSAoaG93IGxvbmcgdGhlIHZlY3RvciBpcylcbiAgbWFnbml0dWRlID0gTWF0aC5zcXJ0KHZ4ICogdnggKyB2eSAqIHZ5KTtcblxuICAvL0FkZCB0b2dldGhlciB0aGUgY2lyY2xlcycgY29tYmluZWQgaGFsZi13aWR0aHNcbiAgY29tYmluZWRSYWRpaSA9IGMxLnJhZGl1cyArIGMyLnJhZGl1cztcblxuICAvL0ZpZ3VyZSBvdXQgaWYgdGhlcmUncyBhIGNvbGxpc2lvblxuICBpZiAobWFnbml0dWRlIDwgY29tYmluZWRSYWRpaSkge1xuXG4gICAgLy9ZZXMsIGEgY29sbGlzaW9uIGlzIGhhcHBlbmluZ1xuICAgIGhpdCA9IHRydWU7XG5cbiAgICAvL0ZpbmQgdGhlIGFtb3VudCBvZiBvdmVybGFwIGJldHdlZW4gdGhlIGNpcmNsZXNcbiAgICBvdmVybGFwID0gY29tYmluZWRSYWRpaSAtIG1hZ25pdHVkZTtcblxuICAgIC8vQWRkIHNvbWUgXCJxdWFudHVtIHBhZGRpbmdcIi4gVGhpcyBhZGRzIGEgdGlueSBhbW91bnQgb2Ygc3BhY2VcbiAgICAvL2JldHdlZW4gdGhlIGNpcmNsZXMgdG8gcmVkdWNlIHRoZWlyIHN1cmZhY2UgdGVuc2lvbiBhbmQgbWFrZVxuICAgIC8vdGhlbSBtb3JlIHNsaXBwZXJ5LiBcIjAuM1wiIGlzIGEgZ29vZCBwbGFjZSB0byBzdGFydCBidXQgeW91IG1pZ2h0XG4gICAgLy9uZWVkIHRvIG1vZGlmeSB0aGlzIHNsaWdodGx5IGRlcGVuZGluZyBvbiB0aGUgZXhhY3QgYmVoYXZpb3VyXG4gICAgLy95b3Ugd2FudC4gVG9vIGxpdHRsZSBhbmQgdGhlIGJhbGxzIHdpbGwgZmVlbCBzdGlja3ksIHRvbyBtdWNoXG4gICAgLy9hbmQgdGhleSBjb3VsZCBzdGFydCB0byBqaXR0ZXIgaWYgdGhleSdyZSBqYW1tZWQgdG9nZXRoZXJcbiAgICBsZXQgcXVhbnR1bVBhZGRpbmcgPSAwLjM7XG4gICAgb3ZlcmxhcCArPSBxdWFudHVtUGFkZGluZztcblxuICAgIC8vTm9ybWFsaXplIHRoZSB2ZWN0b3JcbiAgICAvL1RoZXNlIG51bWJlcnMgdGVsbCB1cyB0aGUgZGlyZWN0aW9uIG9mIHRoZSBjb2xsaXNpb25cbiAgICBkeCA9IHZ4IC8gbWFnbml0dWRlO1xuICAgIGR5ID0gdnkgLyBtYWduaXR1ZGU7XG5cbiAgICAvL01vdmUgY2lyY2xlIDEgb3V0IG9mIHRoZSBjb2xsaXNpb24gYnkgbXVsdGlwbHlpbmdcbiAgICAvL3RoZSBvdmVybGFwIHdpdGggdGhlIG5vcm1hbGl6ZWQgdmVjdG9yIGFuZCBzdWJ0cmFjdCBpdCBmcm9tXG4gICAgLy9jaXJjbGUgMSdzIHBvc2l0aW9uXG4gICAgYzEueCAtPSBvdmVybGFwICogZHg7XG4gICAgYzEueSAtPSBvdmVybGFwICogZHk7XG5cbiAgICAvL0JvdW5jZVxuICAgIGlmIChib3VuY2UpIHtcbiAgICAgIC8vQ3JlYXRlIGEgY29sbGlzaW9uIHZlY3RvciBvYmplY3QsIGBzYCB0byByZXByZXNlbnQgdGhlIGJvdW5jZSBcInN1cmZhY2VcIi5cbiAgICAgIC8vRmluZCB0aGUgYm91bmNlIHN1cmZhY2UncyB4IGFuZCB5IHByb3BlcnRpZXNcbiAgICAgIC8vKFRoaXMgcmVwcmVzZW50cyB0aGUgbm9ybWFsIG9mIHRoZSBkaXN0YW5jZSB2ZWN0b3IgYmV0d2VlbiB0aGUgY2lyY2xlcylcbiAgICAgIHMueCA9IHZ5O1xuICAgICAgcy55ID0gLXZ4O1xuXG4gICAgICAvL0JvdW5jZSBjMSBvZmYgdGhlIHN1cmZhY2VcbiAgICAgIGJvdW5jZU9mZlN1cmZhY2UoYzEsIHMpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gaGl0O1xufVxuXG5cblxuLypcbm1vdmluZ0NpcmNsZUNvbGxpc2lvblxuLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblVzZSBpdCB0byBtYWtlIHR3byBtb3ZpbmcgY2lyY2xlcyBib3VuY2Ugb2ZmIGVhY2ggb3RoZXIuXG5QYXJhbWV0ZXJzOiBcbmEuIEEgc3ByaXRlIG9iamVjdCB3aXRoIGB4YCwgYHlgIGBjZW50ZXJYYCwgYGNlbnRlcllgIGFuZCBgcmFkaXVzYCBwcm9wZXJ0aWVzLlxuYi4gQSBzcHJpdGUgb2JqZWN0IHdpdGggYHhgLCBgeWAgYGNlbnRlclhgLCBgY2VudGVyWWAgYW5kIGByYWRpdXNgIHByb3BlcnRpZXMuXG5UaGUgc3ByaXRlcyBjYW4gY29udGFpbiBhbiBvcHRpb25hbCBtYXNzIHByb3BlcnR5IHRoYXQgc2hvdWxkIGJlIGdyZWF0ZXIgdGhhbiAxLlxuXG4qL1xuXG5leHBvcnRcbmZ1bmN0aW9uIG1vdmluZ0NpcmNsZUNvbGxpc2lvbihjMSwgYzIsIGdsb2JhbCA9IGZhbHNlKSB7XG5cbiAgbGV0IGNvbWJpbmVkUmFkaWksIG92ZXJsYXAsIHhTaWRlLCB5U2lkZSxcbiAgICAvL2BzYCByZWZlcnMgdG8gdGhlIGRpc3RhbmNlIHZlY3RvciBiZXR3ZWVuIHRoZSBjaXJjbGVzXG4gICAgcyA9IHt9LFxuICAgIHAxQSA9IHt9LFxuICAgIHAxQiA9IHt9LFxuICAgIHAyQSA9IHt9LFxuICAgIHAyQiA9IHt9LFxuICAgIGhpdCA9IGZhbHNlO1xuXG4gIC8vQXBwbHkgbWFzcywgaWYgdGhlIGNpcmNsZXMgaGF2ZSBtYXNzIHByb3BlcnRpZXNcbiAgYzEubWFzcyA9IGMxLm1hc3MgfHwgMTtcbiAgYzIubWFzcyA9IGMyLm1hc3MgfHwgMTtcblxuICAvL0NhbGN1bGF0ZSB0aGUgdmVjdG9yIGJldHdlZW4gdGhlIGNpcmNsZXPigJkgY2VudGVyIHBvaW50c1xuICBpZiAoZ2xvYmFsKSB7XG4gICAgLy9Vc2UgZ2xvYmFsIGNvb3JkaW5hdGVzXG4gICAgcy52eCA9IChjMi5neCArIGMyLnJhZGl1cykgLSAoYzEuZ3ggKyBjMS5yYWRpdXMpO1xuICAgIHMudnkgPSAoYzIuZ3kgKyBjMi5yYWRpdXMpIC0gKGMxLmd5ICsgYzEucmFkaXVzKTtcbiAgfSBlbHNlIHtcbiAgICAvL1VzZSBsb2NhbCBjb29yZGluYXRlc1xuICAgIHMudnggPSBjMi5jZW50ZXJYIC0gYzEuY2VudGVyWDtcbiAgICBzLnZ5ID0gYzIuY2VudGVyWSAtIGMxLmNlbnRlclk7XG4gIH1cblxuICAvL0ZpbmQgdGhlIGRpc3RhbmNlIGJldHdlZW4gdGhlIGNpcmNsZXMgYnkgY2FsY3VsYXRpbmdcbiAgLy90aGUgdmVjdG9yJ3MgbWFnbml0dWRlIChob3cgbG9uZyB0aGUgdmVjdG9yIGlzKVxuICBzLm1hZ25pdHVkZSA9IE1hdGguc3FydChzLnZ4ICogcy52eCArIHMudnkgKiBzLnZ5KTtcblxuICAvL0FkZCB0b2dldGhlciB0aGUgY2lyY2xlcycgY29tYmluZWQgaGFsZi13aWR0aHNcbiAgY29tYmluZWRSYWRpaSA9IGMxLnJhZGl1cyArIGMyLnJhZGl1cztcblxuICAvL0ZpZ3VyZSBvdXQgaWYgdGhlcmUncyBhIGNvbGxpc2lvblxuICBpZiAocy5tYWduaXR1ZGUgPCBjb21iaW5lZFJhZGlpKSB7XG5cbiAgICAvL1llcywgYSBjb2xsaXNpb24gaXMgaGFwcGVuaW5nXG4gICAgaGl0ID0gdHJ1ZTtcblxuICAgIC8vRmluZCB0aGUgYW1vdW50IG9mIG92ZXJsYXAgYmV0d2VlbiB0aGUgY2lyY2xlc1xuICAgIG92ZXJsYXAgPSBjb21iaW5lZFJhZGlpIC0gcy5tYWduaXR1ZGU7XG5cbiAgICAvL0FkZCBzb21lIFwicXVhbnR1bSBwYWRkaW5nXCIgdG8gdGhlIG92ZXJsYXBcbiAgICBvdmVybGFwICs9IDAuMztcblxuICAgIC8vTm9ybWFsaXplIHRoZSB2ZWN0b3IuXG4gICAgLy9UaGVzZSBudW1iZXJzIHRlbGwgdXMgdGhlIGRpcmVjdGlvbiBvZiB0aGUgY29sbGlzaW9uXG4gICAgcy5keCA9IHMudnggLyBzLm1hZ25pdHVkZTtcbiAgICBzLmR5ID0gcy52eSAvIHMubWFnbml0dWRlO1xuXG4gICAgLy9GaW5kIHRoZSBjb2xsaXNpb24gdmVjdG9yLlxuICAgIC8vRGl2aWRlIGl0IGluIGhhbGYgdG8gc2hhcmUgYmV0d2VlbiB0aGUgY2lyY2xlcywgYW5kIG1ha2UgaXQgYWJzb2x1dGVcbiAgICBzLnZ4SGFsZiA9IE1hdGguYWJzKHMuZHggKiBvdmVybGFwIC8gMik7XG4gICAgcy52eUhhbGYgPSBNYXRoLmFicyhzLmR5ICogb3ZlcmxhcCAvIDIpO1xuXG4gICAgLy9GaW5kIHRoZSBzaWRlIHRoYXQgdGhlIGNvbGxpc2lvbiBpcyBvY2N1cnJpbmcgb25cbiAgICAoYzEueCA+IGMyLngpID8geFNpZGUgPSAxIDogeFNpZGUgPSAtMTtcbiAgICAoYzEueSA+IGMyLnkpID8geVNpZGUgPSAxIDogeVNpZGUgPSAtMTtcblxuICAgIC8vTW92ZSBjMSBvdXQgb2YgdGhlIGNvbGxpc2lvbiBieSBtdWx0aXBseWluZ1xuICAgIC8vdGhlIG92ZXJsYXAgd2l0aCB0aGUgbm9ybWFsaXplZCB2ZWN0b3IgYW5kIGFkZGluZyBpdCB0b1xuICAgIC8vdGhlIGNpcmNsZXMnIHBvc2l0aW9uc1xuICAgIGMxLnggPSBjMS54ICsgKHMudnhIYWxmICogeFNpZGUpO1xuICAgIGMxLnkgPSBjMS55ICsgKHMudnlIYWxmICogeVNpZGUpO1xuXG4gICAgLy9Nb3ZlIGMyIG91dCBvZiB0aGUgY29sbGlzaW9uXG4gICAgYzIueCA9IGMyLnggKyAocy52eEhhbGYgKiAteFNpZGUpO1xuICAgIGMyLnkgPSBjMi55ICsgKHMudnlIYWxmICogLXlTaWRlKTtcblxuICAgIC8vMS4gQ2FsY3VsYXRlIHRoZSBjb2xsaXNpb24gc3VyZmFjZSdzIHByb3BlcnRpZXNcblxuICAgIC8vRmluZCB0aGUgc3VyZmFjZSB2ZWN0b3IncyBsZWZ0IG5vcm1hbFxuICAgIHMubHggPSBzLnZ5O1xuICAgIHMubHkgPSAtcy52eDtcblxuICAgIC8vMi4gQm91bmNlIGMxIG9mZiB0aGUgc3VyZmFjZSAocylcblxuICAgIC8vRmluZCB0aGUgZG90IHByb2R1Y3QgYmV0d2VlbiBjMSBhbmQgdGhlIHN1cmZhY2VcbiAgICBsZXQgZHAxID0gYzEudnggKiBzLmR4ICsgYzEudnkgKiBzLmR5O1xuXG4gICAgLy9Qcm9qZWN0IGMxJ3MgdmVsb2NpdHkgb250byB0aGUgY29sbGlzaW9uIHN1cmZhY2VcbiAgICBwMUEueCA9IGRwMSAqIHMuZHg7XG4gICAgcDFBLnkgPSBkcDEgKiBzLmR5O1xuXG4gICAgLy9GaW5kIHRoZSBkb3QgcHJvZHVjdCBvZiBjMSBhbmQgdGhlIHN1cmZhY2UncyBsZWZ0IG5vcm1hbCAocy5seCBhbmQgcy5seSlcbiAgICBsZXQgZHAyID0gYzEudnggKiAocy5seCAvIHMubWFnbml0dWRlKSArIGMxLnZ5ICogKHMubHkgLyBzLm1hZ25pdHVkZSk7XG5cbiAgICAvL1Byb2plY3QgdGhlIGMxJ3MgdmVsb2NpdHkgb250byB0aGUgc3VyZmFjZSdzIGxlZnQgbm9ybWFsXG4gICAgcDFCLnggPSBkcDIgKiAocy5seCAvIHMubWFnbml0dWRlKTtcbiAgICBwMUIueSA9IGRwMiAqIChzLmx5IC8gcy5tYWduaXR1ZGUpO1xuXG4gICAgLy8zLiBCb3VuY2UgYzIgb2ZmIHRoZSBzdXJmYWNlIChzKVxuXG4gICAgLy9GaW5kIHRoZSBkb3QgcHJvZHVjdCBiZXR3ZWVuIGMyIGFuZCB0aGUgc3VyZmFjZVxuICAgIGxldCBkcDMgPSBjMi52eCAqIHMuZHggKyBjMi52eSAqIHMuZHk7XG5cbiAgICAvL1Byb2plY3QgYzIncyB2ZWxvY2l0eSBvbnRvIHRoZSBjb2xsaXNpb24gc3VyZmFjZVxuICAgIHAyQS54ID0gZHAzICogcy5keDtcbiAgICBwMkEueSA9IGRwMyAqIHMuZHk7XG5cbiAgICAvL0ZpbmQgdGhlIGRvdCBwcm9kdWN0IG9mIGMyIGFuZCB0aGUgc3VyZmFjZSdzIGxlZnQgbm9ybWFsIChzLmx4IGFuZCBzLmx5KVxuICAgIGxldCBkcDQgPSBjMi52eCAqIChzLmx4IC8gcy5tYWduaXR1ZGUpICsgYzIudnkgKiAocy5seSAvIHMubWFnbml0dWRlKTtcblxuICAgIC8vUHJvamVjdCBjMidzIHZlbG9jaXR5IG9udG8gdGhlIHN1cmZhY2UncyBsZWZ0IG5vcm1hbFxuICAgIHAyQi54ID0gZHA0ICogKHMubHggLyBzLm1hZ25pdHVkZSk7XG4gICAgcDJCLnkgPSBkcDQgKiAocy5seSAvIHMubWFnbml0dWRlKTtcblxuICAgIC8vNC4gQ2FsY3VsYXRlIHRoZSBib3VuY2UgdmVjdG9yc1xuXG4gICAgLy9Cb3VuY2UgYzFcbiAgICAvL3VzaW5nIHAxQiBhbmQgcDJBXG4gICAgYzEuYm91bmNlID0ge307XG4gICAgYzEuYm91bmNlLnggPSBwMUIueCArIHAyQS54O1xuICAgIGMxLmJvdW5jZS55ID0gcDFCLnkgKyBwMkEueTtcblxuICAgIC8vQm91bmNlIGMyXG4gICAgLy91c2luZyBwMUEgYW5kIHAyQlxuICAgIGMyLmJvdW5jZSA9IHt9O1xuICAgIGMyLmJvdW5jZS54ID0gcDFBLnggKyBwMkIueDtcbiAgICBjMi5ib3VuY2UueSA9IHAxQS55ICsgcDJCLnk7XG5cbiAgICAvL0FkZCB0aGUgYm91bmNlIHZlY3RvciB0byB0aGUgY2lyY2xlcycgdmVsb2NpdHlcbiAgICAvL2FuZCBhZGQgbWFzcyBpZiB0aGUgY2lyY2xlIGhhcyBhIG1hc3MgcHJvcGVydHlcbiAgICBjMS52eCA9IGMxLmJvdW5jZS54IC8gYzEubWFzcztcbiAgICBjMS52eSA9IGMxLmJvdW5jZS55IC8gYzEubWFzcztcbiAgICBjMi52eCA9IGMyLmJvdW5jZS54IC8gYzIubWFzcztcbiAgICBjMi52eSA9IGMyLmJvdW5jZS55IC8gYzIubWFzcztcbiAgfVxuICByZXR1cm4gaGl0O1xufVxuXG4vKlxubXVsdGlwbGVDaXJjbGVDb2xsaXNpb25cbi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbkNoZWNrcyBhbGwgdGhlIGNpcmNsZXMgaW4gYW4gYXJyYXkgZm9yIGEgY29sbGlzaW9uIGFnYWluc3RcbmFsbCB0aGUgb3RoZXIgY2lyY2xlcyBpbiBhbiBhcnJheSwgdXNpbmcgYG1vdmluZ0NpcmNsZUNvbGxpc2lvbmAgKGFib3ZlKVxuKi9cblxuZXhwb3J0XG5mdW5jdGlvbiBtdWx0aXBsZUNpcmNsZUNvbGxpc2lvbihhcnJheU9mQ2lyY2xlcywgZ2xvYmFsID0gZmFsc2UpIHtcbiAgLy9tYXJibGUgY29sbGlzaW9uc1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGFycmF5T2ZDaXJjbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgLy9UaGUgZmlyc3QgbWFyYmxlIHRvIHVzZSBpbiB0aGUgY29sbGlzaW9uIGNoZWNrXG4gICAgdmFyIGMxID0gYXJyYXlPZkNpcmNsZXNbaV07XG4gICAgZm9yIChsZXQgaiA9IGkgKyAxOyBqIDwgYXJyYXlPZkNpcmNsZXMubGVuZ3RoOyBqKyspIHtcbiAgICAgIC8vVGhlIHNlY29uZCBtYXJibGUgdG8gdXNlIGluIHRoZSBjb2xsaXNpb24gY2hlY2tcbiAgICAgIGxldCBjMiA9IGFycmF5T2ZDaXJjbGVzW2pdO1xuICAgICAgLy9DaGVjayBmb3IgYSBjb2xsaXNpb24gYW5kIGJvdW5jZSB0aGUgbWFyYmxlcyBhcGFydCBpZlxuICAgICAgLy90aGV5IGNvbGxpZGUuIFVzZSBhbiBvcHRpb25hbCBtYXNzIHByb3BlcnR5IG9uIHRoZSBzcHJpdGVcbiAgICAgIC8vdG8gYWZmZWN0IHRoZSBib3VuY2luZXNzIG9mIGVhY2ggbWFyYmxlXG4gICAgICBtb3ZpbmdDaXJjbGVDb2xsaXNpb24oYzEsIGMyLCBnbG9iYWwpO1xuICAgIH1cbiAgfVxufVxuXG5cblxuLypcbmhpdFRlc3RSZWN0YW5nbGVcbi0tLS0tLS0tLS0tLS0tLS1cblxuVXNlIGl0IHRvIGZpbmQgb3V0IGlmIHR3byByZWN0YW5ndWxhciBzcHJpdGVzIGFyZSB0b3VjaGluZy5cblBhcmFtZXRlcnM6IFxuYS4gQSBzcHJpdGUgb2JqZWN0IHdpdGggYGNlbnRlclhgLCBgY2VudGVyWWAsIGBoYWxmV2lkdGhgIGFuZCBgaGFsZkhlaWdodGAgcHJvcGVydGllcy5cbmIuIEEgc3ByaXRlIG9iamVjdCB3aXRoIGBjZW50ZXJYYCwgYGNlbnRlcllgLCBgaGFsZldpZHRoYCBhbmQgYGhhbGZIZWlnaHRgIHByb3BlcnRpZXMuXG5cbiovXG5cbmV4cG9ydFxuZnVuY3Rpb24gaGl0VGVzdFJlY3RhbmdsZShyMSwgcjIsIGdsb2JhbCA9IGZhbHNlKSB7XG4gIGxldCBoaXQsIGNvbWJpbmVkSGFsZldpZHRocywgY29tYmluZWRIYWxmSGVpZ2h0cywgdngsIHZ5O1xuXG4gIC8vQSB2YXJpYWJsZSB0byBkZXRlcm1pbmUgd2hldGhlciB0aGVyZSdzIGEgY29sbGlzaW9uXG4gIGhpdCA9IGZhbHNlO1xuXG4gIC8vQ2FsY3VsYXRlIHRoZSBkaXN0YW5jZSB2ZWN0b3JcbiAgaWYgKGdsb2JhbCkge1xuICAgIHZ4ID0gKHIxLmd4ICsgcjEuaGFsZldpZHRoKSAtIChyMi5neCArIHIyLmhhbGZXaWR0aCk7XG4gICAgdnkgPSAocjEuZ3kgKyByMS5oYWxmSGVpZ2h0KSAtIChyMi5neSArIHIyLmhhbGZIZWlnaHQpO1xuICB9IGVsc2Uge1xuICAgIHZ4ID0gcjEuY2VudGVyWCAtIHIyLmNlbnRlclg7XG4gICAgdnkgPSByMS5jZW50ZXJZIC0gcjIuY2VudGVyWTtcbiAgfVxuXG4gIC8vRmlndXJlIG91dCB0aGUgY29tYmluZWQgaGFsZi13aWR0aHMgYW5kIGhhbGYtaGVpZ2h0c1xuICBjb21iaW5lZEhhbGZXaWR0aHMgPSByMS5oYWxmV2lkdGggKyByMi5oYWxmV2lkdGg7XG4gIGNvbWJpbmVkSGFsZkhlaWdodHMgPSByMS5oYWxmSGVpZ2h0ICsgcjIuaGFsZkhlaWdodDtcblxuICAvL0NoZWNrIGZvciBhIGNvbGxpc2lvbiBvbiB0aGUgeCBheGlzXG4gIGlmIChNYXRoLmFicyh2eCkgPCBjb21iaW5lZEhhbGZXaWR0aHMpIHtcblxuICAgIC8vQSBjb2xsaXNpb24gbWlnaHQgYmUgb2NjdXJpbmcuIENoZWNrIGZvciBhIGNvbGxpc2lvbiBvbiB0aGUgeSBheGlzXG4gICAgaWYgKE1hdGguYWJzKHZ5KSA8IGNvbWJpbmVkSGFsZkhlaWdodHMpIHtcblxuICAgICAgLy9UaGVyZSdzIGRlZmluaXRlbHkgYSBjb2xsaXNpb24gaGFwcGVuaW5nXG4gICAgICBoaXQgPSB0cnVlO1xuICAgIH0gZWxzZSB7XG5cbiAgICAgIC8vVGhlcmUncyBubyBjb2xsaXNpb24gb24gdGhlIHkgYXhpc1xuICAgICAgaGl0ID0gZmFsc2U7XG4gICAgfVxuICB9IGVsc2Uge1xuXG4gICAgLy9UaGVyZSdzIG5vIGNvbGxpc2lvbiBvbiB0aGUgeCBheGlzXG4gICAgaGl0ID0gZmFsc2U7XG4gIH1cblxuICAvL2BoaXRgIHdpbGwgYmUgZWl0aGVyIGB0cnVlYCBvciBgZmFsc2VgXG4gIHJldHVybiBoaXQ7XG59XG5cbi8qXG5yZWN0YW5nbGVDb2xsaXNpb25cbi0tLS0tLS0tLS0tLS0tLS0tLVxuXG5Vc2UgaXQgdG8gcHJldmVudCB0d28gcmVjdGFuZ3VsYXIgc3ByaXRlcyBmcm9tIG92ZXJsYXBwaW5nLiBcbk9wdGlvbmFsbHksIG1ha2UgdGhlIGZpcnN0IHJlY3RhbmdsZSBib3VuY2Ugb2ZmIHRoZSBzZWNvbmQgcmVjdGFuZ2xlLlxuUGFyYW1ldGVyczogXG5hLiBBIHNwcml0ZSBvYmplY3Qgd2l0aCBgeGAsIGB5YCBgY2VudGVyWGAsIGBjZW50ZXJZYCwgYGhhbGZXaWR0aGAgYW5kIGBoYWxmSGVpZ2h0YCBwcm9wZXJ0aWVzLlxuYi4gQSBzcHJpdGUgb2JqZWN0IHdpdGggYHhgLCBgeWAgYGNlbnRlclhgLCBgY2VudGVyWWAsIGBoYWxmV2lkdGhgIGFuZCBgaGFsZkhlaWdodGAgcHJvcGVydGllcy5cbmMuIE9wdGlvbmFsOiB0cnVlIG9yIGZhbHNlIHRvIGluZGljYXRlIHdoZXRoZXIgb3Igbm90IHRoZSBmaXJzdCBzcHJpdGVcbnNob3VsZCBib3VuY2Ugb2ZmIHRoZSBzZWNvbmQgc3ByaXRlLlxuKi9cblxuZXhwb3J0XG5mdW5jdGlvbiByZWN0YW5nbGVDb2xsaXNpb24oXG4gIHIxLCByMiwgYm91bmNlID0gZmFsc2UsIGdsb2JhbCA9IHRydWVcbikge1xuXG4gIGxldCBjb2xsaXNpb24sIGNvbWJpbmVkSGFsZldpZHRocywgY29tYmluZWRIYWxmSGVpZ2h0cyxcbiAgICBvdmVybGFwWCwgb3ZlcmxhcFksIHZ4LCB2eTtcblxuICAvL0NhbGN1bGF0ZSB0aGUgZGlzdGFuY2UgdmVjdG9yXG4gIGlmIChnbG9iYWwpIHtcbiAgICB2eCA9IChyMS5neCArIHIxLmhhbGZXaWR0aCkgLSAocjIuZ3ggKyByMi5oYWxmV2lkdGgpO1xuICAgIHZ5ID0gKHIxLmd5ICsgcjEuaGFsZkhlaWdodCkgLSAocjIuZ3kgKyByMi5oYWxmSGVpZ2h0KTtcbiAgfSBlbHNlIHtcbiAgICB2eCA9IHIxLmNlbnRlclggLSByMi5jZW50ZXJYO1xuICAgIHZ5ID0gcjEuY2VudGVyWSAtIHIyLmNlbnRlclk7XG4gIH1cblxuICAvL0ZpZ3VyZSBvdXQgdGhlIGNvbWJpbmVkIGhhbGYtd2lkdGhzIGFuZCBoYWxmLWhlaWdodHNcbiAgY29tYmluZWRIYWxmV2lkdGhzID0gcjEuaGFsZldpZHRoICsgcjIuaGFsZldpZHRoO1xuICBjb21iaW5lZEhhbGZIZWlnaHRzID0gcjEuaGFsZkhlaWdodCArIHIyLmhhbGZIZWlnaHQ7XG5cbiAgLy9DaGVjayB3aGV0aGVyIHZ4IGlzIGxlc3MgdGhhbiB0aGUgY29tYmluZWQgaGFsZiB3aWR0aHNcbiAgaWYgKE1hdGguYWJzKHZ4KSA8IGNvbWJpbmVkSGFsZldpZHRocykge1xuXG4gICAgLy9BIGNvbGxpc2lvbiBtaWdodCBiZSBvY2N1cnJpbmchXG4gICAgLy9DaGVjayB3aGV0aGVyIHZ5IGlzIGxlc3MgdGhhbiB0aGUgY29tYmluZWQgaGFsZiBoZWlnaHRzXG4gICAgaWYgKE1hdGguYWJzKHZ5KSA8IGNvbWJpbmVkSGFsZkhlaWdodHMpIHtcblxuICAgICAgLy9BIGNvbGxpc2lvbiBoYXMgb2NjdXJyZWQhIFRoaXMgaXMgZ29vZCFcbiAgICAgIC8vRmluZCBvdXQgdGhlIHNpemUgb2YgdGhlIG92ZXJsYXAgb24gYm90aCB0aGUgWCBhbmQgWSBheGVzXG4gICAgICBvdmVybGFwWCA9IGNvbWJpbmVkSGFsZldpZHRocyAtIE1hdGguYWJzKHZ4KTtcbiAgICAgIG92ZXJsYXBZID0gY29tYmluZWRIYWxmSGVpZ2h0cyAtIE1hdGguYWJzKHZ5KTtcblxuICAgICAgLy9UaGUgY29sbGlzaW9uIGhhcyBvY2N1cnJlZCBvbiB0aGUgYXhpcyB3aXRoIHRoZVxuICAgICAgLy8qc21hbGxlc3QqIGFtb3VudCBvZiBvdmVybGFwLiBMZXQncyBmaWd1cmUgb3V0IHdoaWNoXG4gICAgICAvL2F4aXMgdGhhdCBpc1xuXG4gICAgICBpZiAob3ZlcmxhcFggPj0gb3ZlcmxhcFkpIHtcbiAgICAgICAgLy9UaGUgY29sbGlzaW9uIGlzIGhhcHBlbmluZyBvbiB0aGUgWCBheGlzXG4gICAgICAgIC8vQnV0IG9uIHdoaWNoIHNpZGU/IHZ5IGNhbiB0ZWxsIHVzXG5cbiAgICAgICAgaWYgKHZ5ID4gMCkge1xuICAgICAgICAgIGNvbGxpc2lvbiA9IFwidG9wXCI7XG4gICAgICAgICAgLy9Nb3ZlIHRoZSByZWN0YW5nbGUgb3V0IG9mIHRoZSBjb2xsaXNpb25cbiAgICAgICAgICByMS55ID0gcjEueSArIG92ZXJsYXBZO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbGxpc2lvbiA9IFwiYm90dG9tXCI7XG4gICAgICAgICAgLy9Nb3ZlIHRoZSByZWN0YW5nbGUgb3V0IG9mIHRoZSBjb2xsaXNpb25cbiAgICAgICAgICByMS55ID0gcjEueSAtIG92ZXJsYXBZO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9Cb3VuY2VcbiAgICAgICAgaWYgKGJvdW5jZSkge1xuICAgICAgICAgIHIxLnZ5ICo9IC0xO1xuXG4gICAgICAgICAgLypBbHRlcm5hdGl2ZVxuICAgICAgICAgIC8vRmluZCB0aGUgYm91bmNlIHN1cmZhY2UncyB2eCBhbmQgdnkgcHJvcGVydGllc1xuICAgICAgICAgIHZhciBzID0ge307XG4gICAgICAgICAgcy52eCA9IHIyLnggLSByMi54ICsgcjIud2lkdGg7XG4gICAgICAgICAgcy52eSA9IDA7XG5cbiAgICAgICAgICAvL0JvdW5jZSByMSBvZmYgdGhlIHN1cmZhY2VcbiAgICAgICAgICAvL2JvdW5jZU9mZlN1cmZhY2UocjEsIHMpO1xuICAgICAgICAgICovXG5cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy9UaGUgY29sbGlzaW9uIGlzIGhhcHBlbmluZyBvbiB0aGUgWSBheGlzXG4gICAgICAgIC8vQnV0IG9uIHdoaWNoIHNpZGU/IHZ4IGNhbiB0ZWxsIHVzXG5cbiAgICAgICAgaWYgKHZ4ID4gMCkge1xuICAgICAgICAgIGNvbGxpc2lvbiA9IFwibGVmdFwiO1xuICAgICAgICAgIC8vTW92ZSB0aGUgcmVjdGFuZ2xlIG91dCBvZiB0aGUgY29sbGlzaW9uXG4gICAgICAgICAgcjEueCA9IHIxLnggKyBvdmVybGFwWDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb2xsaXNpb24gPSBcInJpZ2h0XCI7XG4gICAgICAgICAgLy9Nb3ZlIHRoZSByZWN0YW5nbGUgb3V0IG9mIHRoZSBjb2xsaXNpb25cbiAgICAgICAgICByMS54ID0gcjEueCAtIG92ZXJsYXBYO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9Cb3VuY2VcbiAgICAgICAgaWYgKGJvdW5jZSkge1xuICAgICAgICAgIHIxLnZ4ICo9IC0xO1xuXG4gICAgICAgICAgLypBbHRlcm5hdGl2ZVxuICAgICAgICAgIC8vRmluZCB0aGUgYm91bmNlIHN1cmZhY2UncyB2eCBhbmQgdnkgcHJvcGVydGllc1xuICAgICAgICAgIHZhciBzID0ge307XG4gICAgICAgICAgcy52eCA9IDA7XG4gICAgICAgICAgcy52eSA9IHIyLnkgLSByMi55ICsgcjIuaGVpZ2h0O1xuXG4gICAgICAgICAgLy9Cb3VuY2UgcjEgb2ZmIHRoZSBzdXJmYWNlXG4gICAgICAgICAgYm91bmNlT2ZmU3VyZmFjZShyMSwgcyk7XG4gICAgICAgICAgKi9cblxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vTm8gY29sbGlzaW9uXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIC8vTm8gY29sbGlzaW9uXG4gIH1cblxuICAvL1JldHVybiB0aGUgY29sbGlzaW9uIHN0cmluZy4gaXQgd2lsbCBiZSBlaXRoZXIgXCJ0b3BcIiwgXCJyaWdodFwiLFxuICAvL1wiYm90dG9tXCIsIG9yIFwibGVmdFwiIGRlcGVuZGluZyBvbiB3aGljaCBzaWRlIG9mIHIxIGlzIHRvdWNoaW5nIHIyLlxuICByZXR1cm4gY29sbGlzaW9uO1xufVxuXG4vKlxuaGl0VGVzdENpcmNsZVJlY3RhbmdsZVxuLS0tLS0tLS0tLS0tLS0tLVxuXG5Vc2UgaXQgdG8gZmluZCBvdXQgaWYgYSBjaXJjdWxhciBzaGFwZSBpcyB0b3VjaGluZyBhIHJlY3Rhbmd1bGFyIHNoYXBlXG5QYXJhbWV0ZXJzOiBcbmEuIEEgc3ByaXRlIG9iamVjdCB3aXRoIGBjZW50ZXJYYCwgYGNlbnRlcllgLCBgaGFsZldpZHRoYCBhbmQgYGhhbGZIZWlnaHRgIHByb3BlcnRpZXMuXG5iLiBBIHNwcml0ZSBvYmplY3Qgd2l0aCBgY2VudGVyWGAsIGBjZW50ZXJZYCwgYGhhbGZXaWR0aGAgYW5kIGBoYWxmSGVpZ2h0YCBwcm9wZXJ0aWVzLlxuXG4qL1xuXG5leHBvcnRcbmZ1bmN0aW9uIGhpdFRlc3RDaXJjbGVSZWN0YW5nbGUoYzEsIHIxLCBnbG9iYWwgPSBmYWxzZSkge1xuXG4gIGxldCByZWdpb24sIGNvbGxpc2lvbiwgYzF4LCBjMXksIHIxeCwgcjF5O1xuXG4gIC8vVXNlIGVpdGhlciBnbG9iYWwgb3IgbG9jYWwgY29vcmRpbmF0ZXNcbiAgaWYgKGdsb2JhbCkge1xuICAgIGMxeCA9IGMxLmd4O1xuICAgIGMxeSA9IGMxLmd5XG4gICAgcjF4ID0gcjEuZ3g7XG4gICAgcjF5ID0gcjEuZ3k7XG4gIH0gZWxzZSB7XG4gICAgYzF4ID0gYzEueDtcbiAgICBjMXkgPSBjMS55XG4gICAgcjF4ID0gcjEueDtcbiAgICByMXkgPSByMS55O1xuICB9XG5cbiAgLy9JcyB0aGUgY2lyY2xlIGFib3ZlIHRoZSByZWN0YW5nbGUncyB0b3AgZWRnZT9cbiAgaWYgKGMxeSA8IHIxeSAtIHIxLmhhbGZIZWlnaHQpIHtcblxuICAgIC8vSWYgaXQgaXMsIHdlIG5lZWQgdG8gY2hlY2sgd2hldGhlciBpdCdzIGluIHRoZSBcbiAgICAvL3RvcCBsZWZ0LCB0b3AgY2VudGVyIG9yIHRvcCByaWdodFxuICAgIC8vKEluY3JlYXNpbmcgdGhlIHNpemUgb2YgdGhlIHJlZ2lvbiBieSAyIHBpeGVscyBzbGlnaHRseSB3ZWlnaHRzXG4gICAgLy90aGUgdGV4dCBpbiBmYXZvciBvZiBhIHJlY3RhbmdsZSB2cy4gcmVjdGFuZ2xlIGNvbGxpc2lvbiB0ZXN0LlxuICAgIC8vVGhpcyBnaXZlcyBhIG1vcmUgbmF0dXJhbCBsb29raW5nIHJlc3VsdCB3aXRoIGNvcm5lciBjb2xsaXNpb25zXG4gICAgLy93aGVuIHBoeXNpY3MgaXMgYWRkZWQpXG4gICAgaWYgKGMxeCA8IHIxeCAtIDEgLSByMS5oYWxmV2lkdGgpIHtcbiAgICAgIHJlZ2lvbiA9IFwidG9wTGVmdFwiO1xuICAgIH0gZWxzZSBpZiAoYzF4ID4gcjF4ICsgMSArIHIxLmhhbGZXaWR0aCkge1xuICAgICAgcmVnaW9uID0gXCJ0b3BSaWdodFwiO1xuICAgIH0gZWxzZSB7XG4gICAgICByZWdpb24gPSBcInRvcE1pZGRsZVwiO1xuICAgIH1cbiAgfVxuXG4gIC8vVGhlIGNpcmNsZSBpc24ndCBhYm92ZSB0aGUgdG9wIGVkZ2UsIHNvIGl0IG1pZ2h0IGJlXG4gIC8vYmVsb3cgdGhlIGJvdHRvbSBlZGdlXG4gIGVsc2UgaWYgKGMxeSA+IHIxeSArIHIxLmhhbGZIZWlnaHQpIHtcblxuICAgIC8vSWYgaXQgaXMsIHdlIG5lZWQgdG8gY2hlY2sgd2hldGhlciBpdCdzIGluIHRoZSBib3R0b20gbGVmdCxcbiAgICAvL2JvdHRvbSBjZW50ZXIsIG9yIGJvdHRvbSByaWdodFxuICAgIGlmIChjMXggPCByMXggLSAxIC0gcjEuaGFsZldpZHRoKSB7XG4gICAgICByZWdpb24gPSBcImJvdHRvbUxlZnRcIjtcbiAgICB9IGVsc2UgaWYgKGMxeCA+IHIxeCArIDEgKyByMS5oYWxmV2lkdGgpIHtcbiAgICAgIHJlZ2lvbiA9IFwiYm90dG9tUmlnaHRcIjtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVnaW9uID0gXCJib3R0b21NaWRkbGVcIjtcbiAgICB9XG4gIH1cblxuICAvL1RoZSBjaXJjbGUgaXNuJ3QgYWJvdmUgdGhlIHRvcCBlZGdlIG9yIGJlbG93IHRoZSBib3R0b20gZWRnZSxcbiAgLy9zbyBpdCBtdXN0IGJlIG9uIHRoZSBsZWZ0IG9yIHJpZ2h0IHNpZGVcbiAgZWxzZSB7XG4gICAgaWYgKGMxeCA8IHIxeCAtIHIxLmhhbGZXaWR0aCkge1xuICAgICAgcmVnaW9uID0gXCJsZWZ0TWlkZGxlXCI7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlZ2lvbiA9IFwicmlnaHRNaWRkbGVcIjtcbiAgICB9XG4gIH1cblxuICAvL0lzIHRoaXMgdGhlIGNpcmNsZSB0b3VjaGluZyB0aGUgZmxhdCBzaWRlc1xuICAvL29mIHRoZSByZWN0YW5nbGU/XG4gIGlmIChyZWdpb24gPT09IFwidG9wTWlkZGxlXCIgfHwgcmVnaW9uID09PSBcImJvdHRvbU1pZGRsZVwiIHx8IHJlZ2lvbiA9PT0gXCJsZWZ0TWlkZGxlXCIgfHwgcmVnaW9uID09PSBcInJpZ2h0TWlkZGxlXCIpIHtcblxuICAgIC8vWWVzLCBpdCBpcywgc28gZG8gYSBzdGFuZGFyZCByZWN0YW5nbGUgdnMuIHJlY3RhbmdsZSBjb2xsaXNpb24gdGVzdFxuICAgIGNvbGxpc2lvbiA9IGhpdFRlc3RSZWN0YW5nbGUoYzEsIHIxLCBnbG9iYWwpO1xuICB9XG5cbiAgLy9UaGUgY2lyY2xlIGlzIHRvdWNoaW5nIG9uZSBvZiB0aGUgY29ybmVycywgc28gZG8gYVxuICAvL2NpcmNsZSB2cy4gcG9pbnQgY29sbGlzaW9uIHRlc3RcbiAgZWxzZSB7XG4gICAgbGV0IHBvaW50ID0ge307XG5cbiAgICBzd2l0Y2ggKHJlZ2lvbikge1xuICAgICAgY2FzZSBcInRvcExlZnRcIjpcbiAgICAgICAgcG9pbnQueCA9IHIxeDtcbiAgICAgICAgcG9pbnQueSA9IHIxeTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgXCJ0b3BSaWdodFwiOlxuICAgICAgICBwb2ludC54ID0gcjF4ICsgcjEud2lkdGg7XG4gICAgICAgIHBvaW50LnkgPSByMXk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIFwiYm90dG9tTGVmdFwiOlxuICAgICAgICBwb2ludC54ID0gcjF4O1xuICAgICAgICBwb2ludC55ID0gcjF5ICsgcjEuaGVpZ2h0O1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBcImJvdHRvbVJpZ2h0XCI6XG4gICAgICAgIHBvaW50LnggPSByMXggKyByMS53aWR0aDtcbiAgICAgICAgcG9pbnQueSA9IHIxeSArIHIxLmhlaWdodDtcbiAgICB9XG5cbiAgICAvL0NoZWNrIGZvciBhIGNvbGxpc2lvbiBiZXR3ZWVuIHRoZSBjaXJjbGUgYW5kIHRoZSBwb2ludFxuICAgIGNvbGxpc2lvbiA9IGhpdFRlc3RDaXJjbGVQb2ludChjMSwgcG9pbnQsIGdsb2JhbCk7XG4gIH1cblxuICAvL1JldHVybiB0aGUgcmVzdWx0IG9mIHRoZSBjb2xsaXNpb24uXG4gIC8vVGhlIHJldHVybiB2YWx1ZSB3aWxsIGJlIGB1bmRlZmluZWRgIGlmIHRoZXJlJ3Mgbm8gY29sbGlzaW9uXG4gIGlmIChjb2xsaXNpb24pIHtcbiAgICByZXR1cm4gcmVnaW9uO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBjb2xsaXNpb247XG4gIH1cbn1cblxuLypcbmhpdFRlc3RDaXJjbGVQb2ludFxuLS0tLS0tLS0tLS0tLS0tLS0tXG5cblVzZSBpdCB0byBmaW5kIG91dCBpZiBhIGNpcmN1bGFyIHNoYXBlIGlzIHRvdWNoaW5nIGEgcG9pbnRcblBhcmFtZXRlcnM6IFxuYS4gQSBzcHJpdGUgb2JqZWN0IHdpdGggYGNlbnRlclhgLCBgY2VudGVyWWAsIGFuZCBgcmFkaXVzYCBwcm9wZXJ0aWVzLlxuYi4gQSBwb2ludCBvYmplY3Qgd2l0aCBgeGAgYW5kIGB5YCBwcm9wZXJ0aWVzLlxuXG4qL1xuXG5leHBvcnRcbmZ1bmN0aW9uIGhpdFRlc3RDaXJjbGVQb2ludChjMSwgcG9pbnQsIGdsb2JhbCA9IGZhbHNlKSB7XG4gIC8vQSBwb2ludCBpcyBqdXN0IGEgY2lyY2xlIHdpdGggYSBkaWFtZXRlciBvZlxuICAvLzEgcGl4ZWwsIHNvIHdlIGNhbiBjaGVhdC4gQWxsIHdlIG5lZWQgdG8gZG8gaXMgYW4gb3JkaW5hcnkgY2lyY2xlIHZzLiBjaXJjbGVcbiAgLy9Db2xsaXNpb24gdGVzdC4gSnVzdCBzdXBwbHkgdGhlIHBvaW50IHdpdGggdGhlIHByb3BlcnRpZXNcbiAgLy9pdCBuZWVkc1xuICBwb2ludC5kaWFtZXRlciA9IDE7XG4gIHBvaW50LnJhZGl1cyA9IDAuNTtcbiAgcG9pbnQuY2VudGVyWCA9IHBvaW50Lng7XG4gIHBvaW50LmNlbnRlclkgPSBwb2ludC55O1xuICBwb2ludC5neCA9IHBvaW50Lng7XG4gIHBvaW50Lmd5ID0gcG9pbnQueTtcbiAgcmV0dXJuIGhpdFRlc3RDaXJjbGUoYzEsIHBvaW50LCBnbG9iYWwpO1xufVxuXG4vKlxuY2lyY2xlUmVjdGFuZ2xlQ29sbGlzaW9uXG4tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuVXNlIGl0IHRvIGJvdW5jZSBhIGNpcmN1bGFyIHNoYXBlIG9mZiBhIHJlY3Rhbmd1bGFyIHNoYXBlXG5QYXJhbWV0ZXJzOiBcbmEuIEEgc3ByaXRlIG9iamVjdCB3aXRoIGBjZW50ZXJYYCwgYGNlbnRlcllgLCBgaGFsZldpZHRoYCBhbmQgYGhhbGZIZWlnaHRgIHByb3BlcnRpZXMuXG5iLiBBIHNwcml0ZSBvYmplY3Qgd2l0aCBgY2VudGVyWGAsIGBjZW50ZXJZYCwgYGhhbGZXaWR0aGAgYW5kIGBoYWxmSGVpZ2h0YCBwcm9wZXJ0aWVzLlxuXG4qL1xuXG5leHBvcnRcbmZ1bmN0aW9uIGNpcmNsZVJlY3RhbmdsZUNvbGxpc2lvbihcbiAgYzEsIHIxLCBib3VuY2UgPSBmYWxzZSwgZ2xvYmFsID0gZmFsc2Vcbikge1xuXG4gIGxldCByZWdpb24sIGNvbGxpc2lvbiwgYzF4LCBjMXksIHIxeCwgcjF5O1xuXG4gIC8vVXNlIGVpdGhlciB0aGUgZ2xvYmFsIG9yIGxvY2FsIGNvb3JkaW5hdGVzXG4gIGlmIChnbG9iYWwpIHtcbiAgICBjMXggPSBjMS5neDtcbiAgICBjMXkgPSBjMS5neVxuICAgIHIxeCA9IHIxLmd4O1xuICAgIHIxeSA9IHIxLmd5O1xuICB9IGVsc2Uge1xuICAgIGMxeCA9IGMxLng7XG4gICAgYzF5ID0gYzEueVxuICAgIHIxeCA9IHIxLng7XG4gICAgcjF5ID0gcjEueTtcbiAgfVxuXG4gIC8vSXMgdGhlIGNpcmNsZSBhYm92ZSB0aGUgcmVjdGFuZ2xlJ3MgdG9wIGVkZ2U/XG4gIGlmIChjMXkgPCByMXkgLSByMS5oYWxmSGVpZ2h0KSB7XG4gICAgLy9JZiBpdCBpcywgd2UgbmVlZCB0byBjaGVjayB3aGV0aGVyIGl0J3MgaW4gdGhlIFxuICAgIC8vdG9wIGxlZnQsIHRvcCBjZW50ZXIgb3IgdG9wIHJpZ2h0XG4gICAgaWYgKGMxeCA8IHIxeCAtIDEgLSByMS5oYWxmV2lkdGgpIHtcbiAgICAgIHJlZ2lvbiA9IFwidG9wTGVmdFwiO1xuICAgIH0gZWxzZSBpZiAoYzF4ID4gcjF4ICsgMSArIHIxLmhhbGZXaWR0aCkge1xuICAgICAgcmVnaW9uID0gXCJ0b3BSaWdodFwiO1xuICAgIH0gZWxzZSB7XG4gICAgICByZWdpb24gPSBcInRvcE1pZGRsZVwiO1xuICAgIH1cbiAgfVxuXG4gIC8vVGhlIGNpcmNsZSBpc24ndCBhYm92ZSB0aGUgdG9wIGVkZ2UsIHNvIGl0IG1pZ2h0IGJlXG4gIC8vYmVsb3cgdGhlIGJvdHRvbSBlZGdlXG4gIGVsc2UgaWYgKGMxeSA+IHIxeSArIHIxLmhhbGZIZWlnaHQpIHtcbiAgICAvL0lmIGl0IGlzLCB3ZSBuZWVkIHRvIGNoZWNrIHdoZXRoZXIgaXQncyBpbiB0aGUgYm90dG9tIGxlZnQsXG4gICAgLy9ib3R0b20gY2VudGVyLCBvciBib3R0b20gcmlnaHRcbiAgICBpZiAoYzF4IDwgcjF4IC0gMSAtIHIxLmhhbGZXaWR0aCkge1xuICAgICAgcmVnaW9uID0gXCJib3R0b21MZWZ0XCI7XG4gICAgfSBlbHNlIGlmIChjMXggPiByMXggKyAxICsgcjEuaGFsZldpZHRoKSB7XG4gICAgICByZWdpb24gPSBcImJvdHRvbVJpZ2h0XCI7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlZ2lvbiA9IFwiYm90dG9tTWlkZGxlXCI7XG4gICAgfVxuICB9XG5cbiAgLy9UaGUgY2lyY2xlIGlzbid0IGFib3ZlIHRoZSB0b3AgZWRnZSBvciBiZWxvdyB0aGUgYm90dG9tIGVkZ2UsXG4gIC8vc28gaXQgbXVzdCBiZSBvbiB0aGUgbGVmdCBvciByaWdodCBzaWRlXG4gIGVsc2Uge1xuICAgIGlmIChjMXggPCByMXggLSByMS5oYWxmV2lkdGgpIHtcbiAgICAgIHJlZ2lvbiA9IFwibGVmdE1pZGRsZVwiO1xuICAgIH0gZWxzZSB7XG4gICAgICByZWdpb24gPSBcInJpZ2h0TWlkZGxlXCI7XG4gICAgfVxuICB9XG5cbiAgLy9JcyB0aGlzIHRoZSBjaXJjbGUgdG91Y2hpbmcgdGhlIGZsYXQgc2lkZXNcbiAgLy9vZiB0aGUgcmVjdGFuZ2xlP1xuICBpZiAocmVnaW9uID09PSBcInRvcE1pZGRsZVwiIHx8IHJlZ2lvbiA9PT0gXCJib3R0b21NaWRkbGVcIiB8fCByZWdpb24gPT09IFwibGVmdE1pZGRsZVwiIHx8IHJlZ2lvbiA9PT0gXCJyaWdodE1pZGRsZVwiKSB7XG5cbiAgICAvL1llcywgaXQgaXMsIHNvIGRvIGEgc3RhbmRhcmQgcmVjdGFuZ2xlIHZzLiByZWN0YW5nbGUgY29sbGlzaW9uIHRlc3RcbiAgICBjb2xsaXNpb24gPSByZWN0YW5nbGVDb2xsaXNpb24oYzEsIHIxLCBib3VuY2UsIGdsb2JhbCk7XG4gIH1cblxuICAvL1RoZSBjaXJjbGUgaXMgdG91Y2hpbmcgb25lIG9mIHRoZSBjb3JuZXJzLCBzbyBkbyBhXG4gIC8vY2lyY2xlIHZzLiBwb2ludCBjb2xsaXNpb24gdGVzdFxuICBlbHNlIHtcbiAgICBsZXQgcG9pbnQgPSB7fTtcblxuICAgIHN3aXRjaCAocmVnaW9uKSB7XG4gICAgICBjYXNlIFwidG9wTGVmdFwiOlxuICAgICAgICBwb2ludC54ID0gcjF4O1xuICAgICAgICBwb2ludC55ID0gcjF5O1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBcInRvcFJpZ2h0XCI6XG4gICAgICAgIHBvaW50LnggPSByMXggKyByMS53aWR0aDtcbiAgICAgICAgcG9pbnQueSA9IHIxeTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgXCJib3R0b21MZWZ0XCI6XG4gICAgICAgIHBvaW50LnggPSByMXg7XG4gICAgICAgIHBvaW50LnkgPSByMXkgKyByMS5oZWlnaHQ7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIFwiYm90dG9tUmlnaHRcIjpcbiAgICAgICAgcG9pbnQueCA9IHIxeCArIHIxLndpZHRoO1xuICAgICAgICBwb2ludC55ID0gcjF5ICsgcjEuaGVpZ2h0O1xuICAgIH1cblxuICAgIC8vQ2hlY2sgZm9yIGEgY29sbGlzaW9uIGJldHdlZW4gdGhlIGNpcmNsZSBhbmQgdGhlIHBvaW50XG4gICAgY29sbGlzaW9uID0gY2lyY2xlUG9pbnRDb2xsaXNpb24oYzEsIHBvaW50LCBib3VuY2UsIGdsb2JhbCk7XG4gIH1cblxuICBpZiAoY29sbGlzaW9uKSB7XG4gICAgcmV0dXJuIHJlZ2lvbjtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gY29sbGlzaW9uO1xuICB9XG59XG5cbi8qXG5jaXJjbGVQb2ludENvbGxpc2lvblxuLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuVXNlIGl0IHRvIGJvdWNuY2UgYSBjaXJjbGUgb2ZmIGEgcG9pbnQuXG5QYXJhbWV0ZXJzOiBcbmEuIEEgc3ByaXRlIG9iamVjdCB3aXRoIGBjZW50ZXJYYCwgYGNlbnRlcllgLCBhbmQgYHJhZGl1c2AgcHJvcGVydGllcy5cbmIuIEEgcG9pbnQgb2JqZWN0IHdpdGggYHhgIGFuZCBgeWAgcHJvcGVydGllcy5cblxuKi9cblxuZXhwb3J0XG5mdW5jdGlvbiBjaXJjbGVQb2ludENvbGxpc2lvbihjMSwgcG9pbnQsIGJvdW5jZSA9IGZhbHNlLCBnbG9iYWwgPSBmYWxzZSkge1xuICAvL0EgcG9pbnQgaXMganVzdCBhIGNpcmNsZSB3aXRoIGEgZGlhbWV0ZXIgb2ZcbiAgLy8xIHBpeGVsLCBzbyB3ZSBjYW4gY2hlYXQuIEFsbCB3ZSBuZWVkIHRvIGRvIGlzIGFuIG9yZGluYXJ5IGNpcmNsZSB2cy4gY2lyY2xlXG4gIC8vQ29sbGlzaW9uIHRlc3QuIEp1c3Qgc3VwcGx5IHRoZSBwb2ludCB3aXRoIHRoZSBwcm9wZXJ0aWVzXG4gIC8vaXQgbmVlZHNcbiAgcG9pbnQuZGlhbWV0ZXIgPSAxO1xuICBwb2ludC5yYWRpdXMgPSAwLjU7XG4gIHBvaW50LmNlbnRlclggPSBwb2ludC54O1xuICBwb2ludC5jZW50ZXJZID0gcG9pbnQueTtcbiAgcG9pbnQuZ3ggPSBwb2ludC54O1xuICBwb2ludC5neSA9IHBvaW50Lnk7XG4gIHJldHVybiBjaXJjbGVDb2xsaXNpb24oYzEsIHBvaW50LCBib3VuY2UsIGdsb2JhbCk7XG59XG4vKlxuYm91bmNlT2ZmU3VyZmFjZVxuLS0tLS0tLS0tLS0tLS0tLVxuXG5Vc2UgdGhpcyB0byBib3VuY2UgYW4gb2JqZWN0IG9mZiBhbm90aGVyIG9iamVjdC5cblBhcmFtZXRlcnM6IFxuYS4gQW4gb2JqZWN0IHdpdGggYHYueGAgYW5kIGB2LnlgIHByb3BlcnRpZXMuIFRoaXMgcmVwcmVzZW50cyB0aGUgb2JqZWN0IHRoYXQgaXMgY29sbGlkaW5nXG53aXRoIGEgc3VyZmFjZS5cbmIuIEFuIG9iamVjdCB3aXRoIGB4YCBhbmQgYHlgIHByb3BlcnRpZXMuIFRoaXMgcmVwcmVzZW50cyB0aGUgc3VyZmFjZSB0aGF0IHRoZSBvYmplY3RcbmlzIGNvbGxpZGluZyBpbnRvLlxuVGhlIGZpcnN0IG9iamVjdCBjYW4gb3B0aW9uYWxseSBoYXZlIGEgbWFzcyBwcm9wZXJ0eSB0aGF0J3MgZ3JlYXRlciB0aGFuIDEuIFRoZSBtYXNzIHdpbGxcbmJlIHVzZWQgdG8gZGFtcGVuIHRoZSBib3VuY2UgZWZmZWN0LlxuKi9cblxuZnVuY3Rpb24gYm91bmNlT2ZmU3VyZmFjZShvLCBzKSB7XG4gIGxldCBkcDEsIGRwMixcbiAgICBwMSA9IHt9LFxuICAgIHAyID0ge30sXG4gICAgYm91bmNlID0ge30sXG4gICAgbWFzcyA9IG8ubWFzcyB8fCAxO1xuXG4gIC8vMS4gQ2FsY3VsYXRlIHRoZSBjb2xsaXNpb24gc3VyZmFjZSdzIHByb3BlcnRpZXNcbiAgLy9GaW5kIHRoZSBzdXJmYWNlIHZlY3RvcidzIGxlZnQgbm9ybWFsXG4gIHMubHggPSBzLnk7XG4gIHMubHkgPSAtcy54O1xuXG4gIC8vRmluZCBpdHMgbWFnbml0dWRlXG4gIHMubWFnbml0dWRlID0gTWF0aC5zcXJ0KHMueCAqIHMueCArIHMueSAqIHMueSk7XG5cbiAgLy9GaW5kIGl0cyBub3JtYWxpemVkIHZhbHVlc1xuICBzLmR4ID0gcy54IC8gcy5tYWduaXR1ZGU7XG4gIHMuZHkgPSBzLnkgLyBzLm1hZ25pdHVkZTtcblxuICAvLzIuIEJvdW5jZSB0aGUgb2JqZWN0IChvKSBvZmYgdGhlIHN1cmZhY2UgKHMpXG5cbiAgLy9GaW5kIHRoZSBkb3QgcHJvZHVjdCBiZXR3ZWVuIHRoZSBvYmplY3QgYW5kIHRoZSBzdXJmYWNlXG4gIGRwMSA9IG8udnggKiBzLmR4ICsgby52eSAqIHMuZHk7XG5cbiAgLy9Qcm9qZWN0IHRoZSBvYmplY3QncyB2ZWxvY2l0eSBvbnRvIHRoZSBjb2xsaXNpb24gc3VyZmFjZVxuICBwMS52eCA9IGRwMSAqIHMuZHg7XG4gIHAxLnZ5ID0gZHAxICogcy5keTtcblxuICAvL0ZpbmQgdGhlIGRvdCBwcm9kdWN0IG9mIHRoZSBvYmplY3QgYW5kIHRoZSBzdXJmYWNlJ3MgbGVmdCBub3JtYWwgKHMubHggYW5kIHMubHkpXG4gIGRwMiA9IG8udnggKiAocy5seCAvIHMubWFnbml0dWRlKSArIG8udnkgKiAocy5seSAvIHMubWFnbml0dWRlKTtcblxuICAvL1Byb2plY3QgdGhlIG9iamVjdCdzIHZlbG9jaXR5IG9udG8gdGhlIHN1cmZhY2UncyBsZWZ0IG5vcm1hbFxuICBwMi52eCA9IGRwMiAqIChzLmx4IC8gcy5tYWduaXR1ZGUpO1xuICBwMi52eSA9IGRwMiAqIChzLmx5IC8gcy5tYWduaXR1ZGUpO1xuXG4gIC8vUmV2ZXJzZSB0aGUgcHJvamVjdGlvbiBvbiB0aGUgc3VyZmFjZSdzIGxlZnQgbm9ybWFsXG4gIHAyLnZ4ICo9IC0xO1xuICBwMi52eSAqPSAtMTtcblxuICAvL0FkZCB1cCB0aGUgcHJvamVjdGlvbnMgdG8gY3JlYXRlIGEgbmV3IGJvdW5jZSB2ZWN0b3JcbiAgYm91bmNlLnggPSBwMS52eCArIHAyLnZ4O1xuICBib3VuY2UueSA9IHAxLnZ5ICsgcDIudnk7XG5cbiAgLy9Bc3NpZ24gdGhlIGJvdW5jZSB2ZWN0b3IgdG8gdGhlIG9iamVjdCdzIHZlbG9jaXR5XG4gIC8vd2l0aCBvcHRpb25hbCBtYXNzIHRvIGRhbXBlbiB0aGUgZWZmZWN0XG4gIG8udnggPSBib3VuY2UueCAvIG1hc3M7XG4gIG8udnkgPSBib3VuY2UueSAvIG1hc3M7XG59XG5cbi8qXG5oaXRcbi0tLVxuQSBjb252ZW5pZW50IHVuaXZlcnNhbCBjb2xsaXNpb24gZnVuY3Rpb24gdG8gdGVzdCBmb3IgY29sbGlzaW9uc1xuYmV0d2VlbiByZWN0YW5nbGVzLCBjaXJjbGVzLCBhbmQgcG9pbnRzLlxuKi9cblxuZXhwb3J0XG5mdW5jdGlvbiBoaXQoYSwgYiwgcmVhY3QgPSBmYWxzZSwgYm91bmNlID0gZmFsc2UsIGdsb2JhbCwgZXh0cmEgPSB1bmRlZmluZWQpIHtcbiAgbGV0IGNvbGxpc2lvbixcbiAgICBhSXNBU3ByaXRlID0gYS5wYXJlbnQgIT09IHVuZGVmaW5lZCxcbiAgICBiSXNBU3ByaXRlID0gYi5wYXJlbnQgIT09IHVuZGVmaW5lZDtcblxuICAvL0NoZWNrIHRvIG1ha2Ugc3VyZSBvbmUgb2YgdGhlIGFyZ3VtZW50cyBpc24ndCBhbiBhcnJheVxuICBpZiAoYUlzQVNwcml0ZSAmJiBiIGluc3RhbmNlb2YgQXJyYXkgfHwgYklzQVNwcml0ZSAmJiBhIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAvL0lmIGl0IGlzLCBjaGVjayBmb3IgYSBjb2xsaXNpb24gYmV0d2VlbiBhIHNwcml0ZSBhbmQgYW4gYXJyYXlcbiAgICBzcHJpdGVWc0FycmF5KCk7XG4gIH0gZWxzZSB7XG4gICAgLy9JZiBvbmUgb2YgdGhlIGFyZ3VtZW50cyBpc24ndCBhbiBhcnJheSwgZmluZCBvdXQgd2hhdCB0eXBlIG9mXG4gICAgLy9jb2xsaXNpb24gY2hlY2sgdG8gcnVuXG4gICAgY29sbGlzaW9uID0gZmluZENvbGxpc2lvblR5cGUoYSwgYik7XG4gICAgaWYgKGNvbGxpc2lvbiAmJiBleHRyYSkgZXh0cmEoY29sbGlzaW9uKTtcbiAgfVxuXG4gIC8vUmV0dXJuIHRoZSByZXN1bHQgb2YgdGhlIGNvbGxpc2lvbi5cbiAgLy9JdCB3aWxsIGJlIGB1bmRlZmluZWRgIGlmIHRoZXJlJ3Mgbm8gY29sbGlzaW9uIGFuZCBgdHJ1ZWAgaWYgXG4gIC8vdGhlcmUgaXMgYSBjb2xsaXNpb24uIGByZWN0YW5nbGVDb2xsaXNpb25gIHNldHMgYGNvbGxzaXNpb25gIHRvXG4gIC8vXCJ0b3BcIiwgXCJib3R0b21cIiwgXCJsZWZ0XCIgb3IgXCJyaWdodFwiIGRlcGVuZWRpbmcgb24gd2hpY2ggc2lkZSB0aGVcbiAgLy9jb2xsaXNpb24gaXMgb2NjdXJpbmcgb25cbiAgcmV0dXJuIGNvbGxpc2lvbjtcblxuICBmdW5jdGlvbiBmaW5kQ29sbGlzaW9uVHlwZShhLCBiKSB7XG4gICAgLy9BcmUgYGFgIGFuZCBgYmAgYm90aCBzcHJpdGVzP1xuICAgIC8vKFdlIGhhdmUgdG8gY2hlY2sgYWdhaW4gaWYgdGhpcyBmdW5jdGlvbiB3YXMgY2FsbGVkIGZyb21cbiAgICAvL2BzcHJpdGVWc0FycmF5YClcbiAgICBsZXQgYUlzQVNwcml0ZSA9IGEucGFyZW50ICE9PSB1bmRlZmluZWQ7XG4gICAgbGV0IGJJc0FTcHJpdGUgPSBiLnBhcmVudCAhPT0gdW5kZWZpbmVkO1xuXG4gICAgaWYgKGFJc0FTcHJpdGUgJiYgYklzQVNwcml0ZSkge1xuICAgICAgLy9ZZXMsIGJ1dCB3aGF0IGtpbmQgb2Ygc3ByaXRlcz9cbiAgICAgIGlmIChhLmRpYW1ldGVyICYmIGIuZGlhbWV0ZXIpIHtcbiAgICAgICAgLy9UaGV5J3JlIGNpcmNsZXNcbiAgICAgICAgcmV0dXJuIGNpcmNsZVZzQ2lyY2xlKGEsIGIpO1xuICAgICAgfSBlbHNlIGlmIChhLmRpYW1ldGVyICYmICFiLmRpYW1ldGVyKSB7XG4gICAgICAgIC8vVGhlIGZpcnN0IG9uZSBpcyBhIGNpcmNsZSBhbmQgdGhlIHNlY29uZCBpcyBhIHJlY3RhbmdsZVxuICAgICAgICByZXR1cm4gY2lyY2xlVnNSZWN0YW5nbGUoYSwgYik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvL1RoZXkncmUgcmVjdGFuZ2xlc1xuICAgICAgICByZXR1cm4gcmVjdGFuZ2xlVnNSZWN0YW5nbGUoYSwgYik7XG4gICAgICB9XG4gICAgfVxuICAgIC8vVGhleSdyZSBub3QgYm90aCBzcHJpdGVzLCBzbyB3aGF0IGFyZSB0aGV5P1xuICAgIC8vSXMgYGFgIG5vdCBhIHNwcml0ZSBhbmQgZG9lcyBpdCBoYXZlIHggYW5kIHkgcHJvcGVydGllcz9cbiAgICBlbHNlIGlmIChiSXNBU3ByaXRlICYmICEoYS54ID09PSB1bmRlZmluZWQpICYmICEoYS55ID09PSB1bmRlZmluZWQpKSB7XG4gICAgICAvL1llcywgc28gdGhpcyBpcyBhIHBvaW50IHZzLiBzcHJpdGUgY29sbGlzaW9uIHRlc3RcbiAgICAgIHJldHVybiBoaXRUZXN0UG9pbnQoYSwgYik7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vVGhlIHVzZXIgaXMgdHJ5aW5nIHRvIHRlc3Qgc29tZSBpbmNvbXBhdGlibGUgb2JqZWN0c1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBJJ20gc29ycnksICR7YX0gYW5kICR7Yn0gY2Fubm90IGJlIHVzZSB0b2dldGhlciBpbiBhIGNvbGxpc2lvbiB0ZXN0LidgKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBzcHJpdGVWc0FycmF5KCkge1xuICAgIC8vSWYgYGFgIGhhcHBlbnMgdG8gYmUgdGhlIGFycmF5LCBmbGlwIGl0IGFyb3VuZCBzbyB0aGF0IGl0IGJlY29tZXMgYGJgXG4gICAgaWYgKGEgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgbGV0IFthLCBiXSA9IFtiLCBhXTtcbiAgICB9XG4gICAgLy9Mb29wIHRocm91Z2ggdGhlIGFycmF5IGluIHJldmVyc2VcbiAgICBmb3IgKGxldCBpID0gYi5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgbGV0IHNwcml0ZSA9IGJbaV07XG4gICAgICBjb2xsaXNpb24gPSBmaW5kQ29sbGlzaW9uVHlwZShhLCBzcHJpdGUpO1xuICAgICAgaWYgKGNvbGxpc2lvbiAmJiBleHRyYSkgZXh0cmEoY29sbGlzaW9uLCBzcHJpdGUpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGNpcmNsZVZzQ2lyY2xlKGEsIGIpIHtcbiAgICAvL0lmIHRoZSBjaXJjbGVzIHNob3VsZG4ndCByZWFjdCB0byB0aGUgY29sbGlzaW9uLFxuICAgIC8vanVzdCB0ZXN0IHRvIHNlZSBpZiB0aGV5J3JlIHRvdWNoaW5nXG4gICAgaWYgKCFyZWFjdCkge1xuICAgICAgcmV0dXJuIGhpdFRlc3RDaXJjbGUoYSwgYik7XG4gICAgfVxuICAgIC8vWWVzLCB0aGUgY2lyY2xlcyBzaG91bGQgcmVhY3QgdG8gdGhlIGNvbGxpc2lvblxuICAgIGVsc2Uge1xuICAgICAgLy9BcmUgdGhleSBib3RoIG1vdmluZz9cbiAgICAgIGlmIChhLnZ4ICsgYS52eSAhPT0gMCAmJiBiLnZ4ICsgYi52eSAhPT0gMCkge1xuICAgICAgICAvL1llcywgdGhleSBhcmUgYm90aCBtb3ZpbmdcbiAgICAgICAgLy8obW92aW5nIGNpcmNsZSBjb2xsaXNpb25zIGFsd2F5cyBib3VuY2UgYXBhcnQgc28gdGhlcmUnc1xuICAgICAgICAvL25vIG5lZWQgZm9yIHRoZSB0aGlyZCwgYGJvdW5jZWAsIGFyZ3VtZW50KVxuICAgICAgICByZXR1cm4gbW92aW5nQ2lyY2xlQ29sbGlzaW9uKGEsIGIsIGdsb2JhbCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvL05vLCB0aGV5J3JlIG5vdCBib3RoIG1vdmluZ1xuICAgICAgICByZXR1cm4gY2lyY2xlQ29sbGlzaW9uKGEsIGIsIGJvdW5jZSwgZ2xvYmFsKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiByZWN0YW5nbGVWc1JlY3RhbmdsZShhLCBiKSB7XG4gICAgLy9JZiB0aGUgcmVjdGFuZ2xlcyBzaG91bGRuJ3QgcmVhY3QgdG8gdGhlIGNvbGxpc2lvbiwganVzdFxuICAgIC8vdGVzdCB0byBzZWUgaWYgdGhleSdyZSB0b3VjaGluZ1xuICAgIGlmICghcmVhY3QpIHtcbiAgICAgIHJldHVybiBoaXRUZXN0UmVjdGFuZ2xlKGEsIGIsIGdsb2JhbCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiByZWN0YW5nbGVDb2xsaXNpb24oYSwgYiwgYm91bmNlLCBnbG9iYWwpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGNpcmNsZVZzUmVjdGFuZ2xlKGEsIGIpIHtcbiAgICAvL0lmIHRoZSByZWN0YW5nbGVzIHNob3VsZG4ndCByZWFjdCB0byB0aGUgY29sbGlzaW9uLCBqdXN0XG4gICAgLy90ZXN0IHRvIHNlZSBpZiB0aGV5J3JlIHRvdWNoaW5nXG4gICAgaWYgKCFyZWFjdCkge1xuICAgICAgcmV0dXJuIGhpdFRlc3RDaXJjbGVSZWN0YW5nbGUoYSwgYiwgZ2xvYmFsKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGNpcmNsZVJlY3RhbmdsZUNvbGxpc2lvbihhLCBiLCBib3VuY2UsIGdsb2JhbCk7XG4gICAgfVxuICB9XG59IiwiZXhwb3J0IGxldCBkcmFnZ2FibGVTcHJpdGVzID0gW107XG5leHBvcnQgbGV0IGJ1dHRvbnMgPSBbXTtcbmV4cG9ydCBsZXQgcGFydGljbGVzID0gW107XG5cbmNsYXNzIERpc3BsYXlPYmplY3Qge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICAvLyBUaGUgc3ByaXRlIHBvc2l0aW9uIGFuZCBzaXplXG4gICAgICAgIHRoaXMueCA9IDA7XG4gICAgICAgIHRoaXMueSA9IDA7XG4gICAgICAgIHRoaXMud2lkdGggPSAwO1xuICAgICAgICB0aGlzLmhlaWdodCA9IDA7XG5cbiAgICAgICAgLy8gdHJhbnNmb3JtYXRpb24gcHJvcGVydGllc1xuICAgICAgICB0aGlzLnJvdGF0aW9uID0gMDtcbiAgICAgICAgdGhpcy5hbHBoYSA9IDE7XG4gICAgICAgIHRoaXMudmlzaWJsZSA9IHRydWU7XG4gICAgICAgIHRoaXMuc2NhbGVYID0gMTtcbiAgICAgICAgdGhpcy5zY2FsZVkgPSAxO1xuXG4gICAgICAgIC8vIHBpdm90IHBvaW50XG4gICAgICAgIC8vICgwLjUgaXMgY2VudGVyIHBvaW50KVxuICAgICAgICB0aGlzLnBpdm90WCA9IDAuNTtcbiAgICAgICAgdGhpcy5waXZvdFkgPSAwLjU7XG5cbiAgICAgICAgLy8gVmVsb2NpdHlcbiAgICAgICAgdGhpcy52eCA9IDA7XG4gICAgICAgIHRoaXMudnkgPSAwO1xuXG4gICAgICAgIC8vICdwcml2YXRlJyBsYXllciBwcm9wZXJ0eVxuICAgICAgICB0aGlzLl9sYXllciA9IDA7XG5cbiAgICAgICAgdGhpcy5jaGlsZHJlbiA9IFtdO1xuICAgICAgICB0aGlzLnBhcmVudCA9IHVuZGVmaW5lZDtcblxuICAgICAgICAvLyBPcHRpb25hbCBzaGFkb3dcbiAgICAgICAgdGhpcy5zaGFkb3cgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5zaGFkb3dDb2xvciA9IFwicmdiYSgxMDAsIDEwMCwgMTAwLCAwLjUpXCI7XG4gICAgICAgIHRoaXMuc2hhZG93T2Zmc2V0WCA9IDM7XG4gICAgICAgIHRoaXMuc2hhZG93T2Zmc2V0WSA9IDM7XG4gICAgICAgIHRoaXMuc2hhZG93Qmx1ciA9IDM7XG5cbiAgICAgICAgdGhpcy5ibGVuZE1vZGUgPSB1bmRlZmluZWQ7XG5cbiAgICAgICAgLy8gYWR2YW5jZWQgZmVhdHVyZXNcbiAgICAgICAgLy8gYW5pbWF0aW9uXG4gICAgICAgIHRoaXMuZnJhbWVzID0gW107XG4gICAgICAgIHRoaXMubG9vcCA9IHRydWU7XG4gICAgICAgIHRoaXMuX2N1cnJlbnRGcmFtZSA9IDA7XG4gICAgICAgIHRoaXMucGxheWluZyA9IGZhbHNlO1xuXG4gICAgICAgIC8vIGNhbiBiZSBkcmFnZ2VkXG4gICAgICAgIHRoaXMuX2RyYWdnYWJsZSA9IHVuZGVmaW5lZDtcblxuICAgICAgICAvLyB1c2VkIGZvciAncmFkaXVzJyBhbmQgJ2RpYW1ldGVyJyBwcm9wc1xuICAgICAgICB0aGlzLl9jaXJjdWxhciA9IGZhbHNlO1xuXG4gICAgICAgIC8vIGlzIGludGVyYWN0aXZlPyAoY2xpY2thYmxlL3RvdWNoYWJsZSlcbiAgICAgICAgdGhpcy5faW50ZXJhY3RpdmUgPSBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBHbG9iYWwgcG9zaXRpb25cbiAgICBnZXQgZ3goKSB7XG4gICAgICAgIGlmKHRoaXMucGFyZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy54ICsgdGhpcy5wYXJlbnQuZ3g7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy54O1xuICAgICAgICB9XG4gICAgfVxuICAgIGdldCBneSgpIHtcbiAgICAgICAgaWYodGhpcy5wYXJlbnQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnkgKyB0aGlzLnBhcmVudC5neTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBEZXB0aCBsYXllclxuICAgIGdldCBsYXllcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2xheWVyO1xuICAgIH1cbiAgICBzZXQgbGF5ZXIodmFsdWUpIHtcbiAgICAgICAgdGhpcy5fbGF5ZXIgPSB2YWx1ZTtcbiAgICAgICAgaWYodGhpcy5wYXJlbnQpIHtcbiAgICAgICAgICAgIHRoaXMucGFyZW50LmNoaWxkcmVuLnNvcnQoKGEsIGIpID0+IGEubGF5ZXIgLSBiLmxheWVyKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIENoaWxkcmVuIG1hbmlwdWxhdGlvblxuICAgIGFkZENoaWxkKHNwcml0ZSkge1xuICAgICAgICBpZihzcHJpdGUucGFyZW50KSB7XG4gICAgICAgICAgICBzcHJpdGUucGFyZW50LnJlbW92ZUNoaWxkKHNwcml0ZSk7XG4gICAgICAgIH1cbiAgICAgICAgc3ByaXRlLnBhcmVudCA9IHRoaXM7XG4gICAgICAgIHRoaXMuY2hpbGRyZW4ucHVzaChzcHJpdGUpO1xuICAgIH1cblxuICAgIHJlbW92ZUNoaWxkKHNwcml0ZSkge1xuICAgICAgICBpZihzcHJpdGUucGFyZW50ID09PSB0aGlzKSB7XG4gICAgICAgICAgICB0aGlzLmNoaWxkcmVuLnNwbGljZSh0aGlzLmNoaWxkcmVuLmluZGV4T2Yoc3ByaXRlKSwgMSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3Ioc3ByaXRlICsgXCIgaXMgbm90IGEgY2hpbGQgb2YgXCIgKyB0aGlzKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldCBlbXB0eSgpIHtcbiAgICAgICAgaWYodGhpcy5jaGlsZHJlbi5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3dhcENoaWxkcmVuKGNoaWxkMSwgY2hpbGQyKSB7XG4gICAgICAgIGxldCBpbmRleDEgPSB0aGlzLmNoaWxkcmVuLmluZGV4T2YoY2hpbGQxKSxcbiAgICAgICAgICAgIGluZGV4MiA9IHRoaXMuY2hpbGRyZW4uaW5kZXhPZihjaGlsZDIpO1xuXG4gICAgICAgIGlmKGluZGV4MSAhPT0gLTEgJiYgaW5kZXgyICE9PSAtMSkge1xuICAgICAgICAgICAgY2hpbGQxLmNoaWxkSW5kZXggPSBpbmRleDI7XG4gICAgICAgICAgICBjaGlsZDIuY2hpbGRJbmRleCA9IGluZGV4MTtcblxuICAgICAgICAgICAgdGhpcy5jaGlsZHJlbltpbmRleDFdID0gY2hpbGQyO1xuICAgICAgICAgICAgdGhpcy5jaGlsZHJlbltpbmRleDJdID0gY2hpbGQxO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBCb3RoIG9iamVjdHMgbXVzdCBiZSBhIGNoaWxkIG9mIHRoZSBjYWxsZXIgJHt0aGlzfWApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgYWRkKC4uLnNwcml0ZXNUb0FkZCkge1xuICAgICAgICBzcHJpdGVzVG9BZGQuZm9yRWFjaChzcHJpdGUgPT4gdGhpcy5hZGRDaGlsZChzcHJpdGUpKTtcbiAgICB9XG4gICAgcmVtb3ZlKC4uLnNwcml0ZXNUb1JlbW92ZSkge1xuICAgICAgICBzcHJpdGVzVG9SZW1vdmUuZm9yRWFjaChzcHJpdGUgPT4gdGhpcy5yZW1vdmVDaGlsZChzcHJpdGUpKTtcbiAgICB9XG5cbiAgICAvLyBIZWxwZXJzXG4gICAgZ2V0IGhhbGZXaWR0aCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMud2lkdGggLyAyO1xuICAgIH1cbiAgICBnZXQgaGFsZkhlaWdodCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaGVpZ2h0IC8gMjtcbiAgICB9XG5cbiAgICBnZXQgY2VudGVyWCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMueCArIHRoaXMuaGFsZldpZHRoO1xuICAgIH1cbiAgICBnZXQgY2VudGVyWSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMueSArIHRoaXMuaGFsZkhlaWdodDtcbiAgICB9XG5cbiAgICAvLyAuLi5cbiAgICBnZXQgcG9zaXRpb24oKSB7XG4gICAgICAgIHJldHVybiB7eDogdGhpcy54LCB5OiB0aGlzLnl9O1xuICAgIH1cbiAgICBzZXRQb3NpdGlvbih4LCB5KSB7XG4gICAgICAgIHRoaXMueCA9IHg7XG4gICAgICAgIHRoaXMueSA9IHk7XG4gICAgfVxuXG4gICAgZ2V0IGxvY2FsQm91bmRzKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgeDogMCxcbiAgICAgICAgICAgIHk6IDAsXG4gICAgICAgICAgICB3aWR0aDogdGhpcy53aWR0aCxcbiAgICAgICAgICAgIGhlaWdodDogdGhpcy5oZWlnaHRcbiAgICAgICAgfTtcbiAgICB9XG4gICAgZ2V0IGdsb2JhbEJvdW5kcygpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHg6IHRoaXMuZ3gsXG4gICAgICAgICAgICB5OiB0aGlzLmd5LFxuICAgICAgICAgICAgd2lkdGg6IHRoaXMuZ3ggKyB0aGlzLndpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0OiB0aGlzLmd5ICsgdGhpcy5oZWlnaHRcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyBwb3NpdGlvbiBoZWxwZXJzXG4gICAgcHV0Q2VudGVyKGIsIHhPZmZzZXQgPSAwLCB5T2Zmc2V0ID0gMCkge1xuICAgICAgICBsZXQgYSA9IHRoaXM7XG4gICAgICAgIGIueCA9IChhLnggKyBhLmhhbGZXaWR0aCAtIGIuaGFsZldpZHRoKSArIHhPZmZzZXQ7XG4gICAgICAgIGIueSA9IChhLnkgKyBhLmhhbGZIZWlnaHQgLSBiLmhhbGZIZWlnaHQpICsgeU9mZnNldDtcbiAgICB9XG4gICAgcHV0VG9wKGIsIHhPZmZzZXQgPSAwLCB5T2Zmc2V0ID0gMCkge1xuICAgICAgICBsZXQgYSA9IHRoaXM7XG4gICAgICAgIGIueCA9IChhLnggKyBhLmhhbGZXaWR0aCAtIGIuaGFsZldpZHRoKSArIHhPZmZzZXQ7XG4gICAgICAgIGIueSA9IChhLnkgLSBiLmhlaWdodCkgKyB5T2Zmc2V0O1xuICAgIH1cbiAgICBwdXRCb3R0b20oYiwgeE9mZnNldCA9IDAsIHlPZmZzZXQgPSAwKSB7XG4gICAgICAgIGxldCBhID0gdGhpcztcbiAgICAgICAgYi54ID0gKGEueCArIGEuaGFsZldpZHRoIC0gYi5oYWxmV2lkdGgpICsgeE9mZnNldDtcbiAgICAgICAgYi55ID0gKGEueSArIGEuaGVpZ2h0KSArIHlPZmZzZXQ7XG4gICAgfVxuICAgIHB1dFJpZ2h0KGIsIHhPZmZzZXQgPSAwLCB5T2Zmc2V0ID0gMCkge1xuICAgICAgICBsZXQgYSA9IHRoaXM7XG4gICAgICAgIGIueCA9IChhLnggKyBhLndpZHRoKSArIHhPZmZzZXQ7XG4gICAgICAgIGIueSA9IChhLnkgKyBhLmhhbGZIZWlnaHQgLSBiLmhhbGZIZWlnaHQpICsgeU9mZnNldDtcbiAgICB9XG4gICAgcHV0TGVmdChiLCB4T2Zmc2V0ID0gMCwgeU9mZnNldCA9IDApIHtcbiAgICAgICAgbGV0IGEgPSB0aGlzO1xuICAgICAgICBiLnggPSAoYS54IC0gYi53aWR0aCkgKyB4T2Zmc2V0O1xuICAgICAgICBiLnkgPSAoYS55ICsgYS5oYWxmSGVpZ2h0IC0gYi5oYWxmSGVpZ2h0KSArIHlPZmZzZXQ7XG4gICAgfVxuXG4gICAgLy8gYW5pbWF0aW9uIGhlbHBlcnNcbiAgICBnZXQgY3VycmVudEZyYW1lKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fY3VycmVudEZyYW1lO1xuICAgIH1cblxuICAgIC8vIGNpcmN1bGFyXG4gICAgZ2V0IGNpcmN1bGFyKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fY2lyY3VsYXI7XG4gICAgfVxuICAgIHNldCBjaXJjdWxhcih2YWx1ZSkge1xuICAgICAgICBpZih2YWx1ZSA9PT0gdHJ1ZSAmJiB0aGlzLl9jaXJjdWxhciA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHRoaXMsIHtcbiAgICAgICAgICAgICAgICBkaWFtZXRlcjoge1xuICAgICAgICAgICAgICAgICAgICBnZXQgKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMud2lkdGg7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHNldCAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMud2lkdGggPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaGVpZ2h0ID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgcmFkaXVzOiB7XG4gICAgICAgICAgICAgICAgICAgIGdldCAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5oYWxmV2lkdGg7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHNldCAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMud2lkdGggPSB2YWx1ZSAqIDI7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmhlaWdodCA9IHZhbHVlICogMjtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMuX2NpcmN1bGFyID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKHZhbHVlID09PSBmYWxzZSAmJiB0aGlzLl9jaXJjdWxhciA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgZGVsZXRlIHRoaXMuZGlhbWV0ZXI7XG4gICAgICAgICAgICBkZWxldGUgdGhpcy5yYWRpdXM7XG4gICAgICAgICAgICB0aGlzLl9jaXJjdWxhciA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gZHJhZ2dhYmxlXG4gICAgZ2V0IGRyYWdnYWJsZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RyYWdnYWJsZTtcbiAgICB9XG4gICAgc2V0IGRyYWdnYWJsZSh2YWx1ZSkge1xuICAgICAgICBpZih2YWx1ZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgZHJhZ2dhYmxlU3ByaXRlcy5wdXNoKHRoaXMpO1xuICAgICAgICAgICAgdGhpcy5fZHJhZ2dhYmxlID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKHZhbHVlID09PSBmYWxzZSkge1xuICAgICAgICAgICAgZHJhZ2dhYmxlU3ByaXRlcy5zcGxpY2UoZHJhZ2dhYmxlU3ByaXRlcy5pbmRleE9mKHRoaXMpLCAxKTtcbiAgICAgICAgICAgIHRoaXMuX2RyYWdnYWJsZSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0IGludGVyYWN0aXZlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5faW50ZXJhY3RpdmU7XG4gICAgfVxuICAgIHNldCBpbnRlcmFjdGl2ZSh2YWx1ZSkge1xuICAgICAgICBpZih2YWx1ZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgbWFrZUludGVyYWN0aXZlKHRoaXMpO1xuICAgICAgICAgICAgYnV0dG9ucy5wdXNoKHRoaXMpO1xuXG4gICAgICAgICAgICB0aGlzLl9pbnRlcmFjdGl2ZSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYodmFsdWUgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICBidXR0b25zLnNwbGljZShidXR0b25zLmluZGV4T2YodGhpcyksIDEpO1xuICAgICAgICAgICAgdGhpcy5faW50ZXJhY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IGxldCBzdGFnZSA9IG5ldyBEaXNwbGF5T2JqZWN0KCk7XG5cbmV4cG9ydCBmdW5jdGlvbiBtYWtlQ2FudmFzKFxuICAgIHdpZHRoID0gMjU2LCBoZWlnaHQgPSAyNTYsXG4gICAgYm9yZGVyID0gXCIxcHggZGFzaGVkIGJsYWNrXCIsXG4gICAgYmFja2dyb3VuZENvbG9yID0gXCJ3aGl0ZVwiXG4pIHtcbiAgICBsZXQgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtcbiAgICBjYW52YXMud2lkdGggPSB3aWR0aDtcbiAgICBjYW52YXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgIGNhbnZhcy5zdHlsZS5ib3JkZXIgPSBib3JkZXI7XG4gICAgY2FudmFzLnN0eWxlLmJhY2tncm91bmRDb2xvciA9IGJhY2tncm91bmRDb2xvcjtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGNhbnZhcyk7XG5cbiAgICBjYW52YXMuY3R4ID0gY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcblxuICAgIHJldHVybiBjYW52YXM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXIoY2FudmFzKSB7XG4gICAgbGV0IGN0eCA9IGNhbnZhcy5jdHg7XG5cbiAgICBjdHguY2xlYXJSZWN0KDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XG5cbiAgICAvL2RyYXcgYmFja2dyb3VuZFxuICAgIGlmKHN0YWdlQmFja2dyb3VuZCkge1xuICAgICAgICBzdGFnZUJhY2tncm91bmQucmVuZGVyKGN0eCk7XG4gICAgfVxuXG4gICAgc3RhZ2UuY2hpbGRyZW4uZm9yRWFjaChzcHJpdGUgPT4ge1xuICAgICAgICBkaXNwbGF5U3ByaXRlKHNwcml0ZSk7XG4gICAgfSk7XG5cbiAgICBmdW5jdGlvbiBkaXNwbGF5U3ByaXRlKHNwcml0ZSkge1xuICAgICAgICBpZihcbiAgICAgICAgICAgIHNwcml0ZS52aXNpYmxlXG4gICAgICAgICAgICAmJiBzcHJpdGUuZ3ggPCBjYW52YXMud2lkdGggKyBzcHJpdGUud2lkdGhcbiAgICAgICAgICAgICYmIHNwcml0ZS5neCArIHNwcml0ZS53aWR0aCA+PSAtc3ByaXRlLndpZHRoXG4gICAgICAgICAgICAmJiBzcHJpdGUuZ3kgPCBjYW52YXMuaGVpZ2h0ICsgc3ByaXRlLmhlaWdodFxuICAgICAgICAgICAgJiYgc3ByaXRlLmd5ICsgc3ByaXRlLmhlaWdodCA+PSAtc3ByaXRlLmhlaWdodFxuICAgICAgICApIHtcbiAgICAgICAgICAgIGN0eC5zYXZlKCk7XG5cbiAgICAgICAgICAgIGN0eC50cmFuc2xhdGUoXG4gICAgICAgICAgICAgICAgc3ByaXRlLnggKyAoc3ByaXRlLndpZHRoICogc3ByaXRlLnBpdm90WCksXG4gICAgICAgICAgICAgICAgc3ByaXRlLnkgKyAoc3ByaXRlLmhlaWdodCAqIHNwcml0ZS5waXZvdFkpXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICBjdHgucm90YXRlKHNwcml0ZS5yb3RhdGlvbik7XG4gICAgICAgICAgICBjdHguZ2xvYmFsQWxwaGEgPSBzcHJpdGUuYWxwaGEgKiBzcHJpdGUucGFyZW50LmFscGhhO1xuICAgICAgICAgICAgY3R4LnNjYWxlKHNwcml0ZS5zY2FsZVgsIHNwcml0ZS5zY2FsZVkpO1xuXG4gICAgICAgICAgICBpZihzcHJpdGUuc2hhZG93KSB7XG4gICAgICAgICAgICAgICAgY3R4LnNoYWRvd0NvbG9yID0gc3ByaXRlLnNoYWRvd0NvbG9yO1xuICAgICAgICAgICAgICAgIGN0eC5zaGFkb3dPZmZzZXRYID0gc3ByaXRlLnNoYWRvd09mZnNldFg7XG4gICAgICAgICAgICAgICAgY3R4LnNoYWRvd09mZnNldFkgPSBzcHJpdGUuc2hhZG93T2Zmc2V0WTtcbiAgICAgICAgICAgICAgICBjdHguc2hhZG93Qmx1ciA9IHNwcml0ZS5zaGFkb3dCbHVyO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZihzcHJpdGUuYmxlbmRNb2RlKSBjdHguZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gc3ByaXRlLmJsZW5kTW9kZTtcblxuICAgICAgICAgICAgaWYoc3ByaXRlLnJlbmRlcilcbiAgICAgICAgICAgICAgICBzcHJpdGUucmVuZGVyKGN0eCk7XG5cbiAgICAgICAgICAgIGlmKHNwcml0ZS5jaGlsZHJlbiAmJiBzcHJpdGUuY2hpbGRyZW4ubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGN0eC50cmFuc2xhdGUoLXNwcml0ZS53aWR0aCAqIHNwcml0ZS5waXZvdFgsIC1zcHJpdGUuaGVpZ2h0ICogc3ByaXRlLnBpdm90WSk7XG5cbiAgICAgICAgICAgICAgICBzcHJpdGUuY2hpbGRyZW4uZm9yRWFjaChjaGlsZCA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXlTcHJpdGUoY2hpbGQpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjdHgucmVzdG9yZSgpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyV2l0aEludGVycG9sYXRpb24oY2FudmFzLCBsYWdPZmZzZXQpIHtcbiAgICBsZXQgY3R4ID0gY2FudmFzLmN0eDtcblxuICAgIGN0eC5jbGVhclJlY3QoMCwgMCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcblxuICAgIHN0YWdlLmNoaWxkcmVuLmZvckVhY2goc3ByaXRlID0+IHtcbiAgICAgICAgZGlzcGxheVNwcml0ZShzcHJpdGUpO1xuICAgIH0pO1xuXG4gICAgZnVuY3Rpb24gZGlzcGxheVNwcml0ZShzcHJpdGUpIHtcbiAgICAgICAgaWYoXG4gICAgICAgICAgICBzcHJpdGUudmlzaWJsZVxuICAgICAgICAgICAgJiYgc3ByaXRlLmd4IDwgY2FudmFzLndpZHRoICsgc3ByaXRlLndpZHRoXG4gICAgICAgICAgICAmJiBzcHJpdGUuZ3ggKyBzcHJpdGUud2lkdGggPj0gLXNwcml0ZS53aWR0aFxuICAgICAgICAgICAgJiYgc3ByaXRlLmd5IDwgY2FudmFzLmhlaWdodCArIHNwcml0ZS5oZWlnaHRcbiAgICAgICAgICAgICYmIHNwcml0ZS5neSArIHNwcml0ZS5oZWlnaHQgPj0gLXNwcml0ZS5oZWlnaHRcbiAgICAgICAgKSB7XG4gICAgICAgICAgICBjdHguc2F2ZSgpO1xuXG4gICAgICAgICAgICBpZihzcHJpdGUucHJldmlvdXNYICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBzcHJpdGUucmVuZGVyWCA9IChzcHJpdGUueCAtIHNwcml0ZS5wcmV2aW91c1gpICogbGFnT2Zmc2V0ICsgc3ByaXRlLnByZXZpb3VzWDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc3ByaXRlLnJlbmRlclggPSBzcHJpdGUueDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYoc3ByaXRlLnByZXZpb3VzWSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgc3ByaXRlLnJlbmRlclkgPSAoc3ByaXRlLnkgLSBzcHJpdGUucHJldmlvdXNZKSAqIGxhZ09mZnNldCArIHNwcml0ZS5wcmV2aW91c1k7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNwcml0ZS5yZW5kZXJZID0gc3ByaXRlLnk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGN0eC50cmFuc2xhdGUoXG4gICAgICAgICAgICAgICAgc3ByaXRlLnJlbmRlclggKyAoc3ByaXRlLndpZHRoICogc3ByaXRlLnBpdm90WCksXG4gICAgICAgICAgICAgICAgc3ByaXRlLnJlbmRlclkgKyAoc3ByaXRlLmhlaWdodCAqIHNwcml0ZS5waXZvdFkpXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICBjdHgucm90YXRlKHNwcml0ZS5yb3RhdGlvbik7XG4gICAgICAgICAgICBjdHguZ2xvYmFsQWxwaGEgPSBzcHJpdGUuYWxwaGEgKiBzcHJpdGUucGFyZW50LmFscGhhO1xuICAgICAgICAgICAgY3R4LnNjYWxlKHNwcml0ZS5zY2FsZVgsIHNwcml0ZS5zY2FsZVkpO1xuXG4gICAgICAgICAgICBpZihzcHJpdGUuc2hhZG93KSB7XG4gICAgICAgICAgICAgICAgY3R4LnNoYWRvd0NvbG9yID0gc3ByaXRlLnNoYWRvd0NvbG9yO1xuICAgICAgICAgICAgICAgIGN0eC5zaGFkb3dPZmZzZXRYID0gc3ByaXRlLnNoYWRvd09mZnNldFg7XG4gICAgICAgICAgICAgICAgY3R4LnNoYWRvd09mZnNldFkgPSBzcHJpdGUuc2hhZG93T2Zmc2V0WTtcbiAgICAgICAgICAgICAgICBjdHguc2hhZG93Qmx1ciA9IHNwcml0ZS5zaGFkb3dCbHVyO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZihzcHJpdGUuYmxlbmRNb2RlKSBjdHguZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gc3ByaXRlLmJsZW5kTW9kZTtcblxuICAgICAgICAgICAgaWYoc3ByaXRlLnJlbmRlcilcbiAgICAgICAgICAgICAgICBzcHJpdGUucmVuZGVyKGN0eCk7XG5cbiAgICAgICAgICAgIGlmKHNwcml0ZS5jaGlsZHJlbiAmJiBzcHJpdGUuY2hpbGRyZW4ubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGN0eC50cmFuc2xhdGUoLXNwcml0ZS53aWR0aCAqIHNwcml0ZS5waXZvdFgsIC1zcHJpdGUuaGVpZ2h0ICogc3ByaXRlLnBpdm90WSk7XG5cbiAgICAgICAgICAgICAgICBzcHJpdGUuY2hpbGRyZW4uZm9yRWFjaChjaGlsZCA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXlTcHJpdGUoY2hpbGQpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjdHgucmVzdG9yZSgpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVtb3ZlKC4uLnNwcml0ZXNUb1JlbW92ZSkge1xuICAgIHNwcml0ZXNUb1JlbW92ZS5mb3JFYWNoKHNwcml0ZSA9PiB7XG4gICAgICAgIHNwcml0ZS5wYXJlbnQucmVtb3ZlQ2hpbGQoc3ByaXRlKTtcbiAgICB9KTtcbn1cblxuY2xhc3MgUmVjdGFuZ2xlIGV4dGVuZHMgRGlzcGxheU9iamVjdCB7XG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHdpZHRoID0gMzIsXG4gICAgICAgIGhlaWdodCA9IDMyLFxuICAgICAgICBmaWxsU3R5bGUgPSBcImdyYXlcIixcbiAgICAgICAgc3Ryb2tlU3R5bGUgPSBcIm5vbmVcIixcbiAgICAgICAgbGluZVdpZHRoID0gMCxcbiAgICAgICAgeCA9IDAsXG4gICAgICAgIHkgPSAwXG4gICAgKSB7XG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgT2JqZWN0LmFzc2lnbihcbiAgICAgICAgICAgIHRoaXMsIHt3aWR0aCwgaGVpZ2h0LCBmaWxsU3R5bGUsIHN0cm9rZVN0eWxlLCBsaW5lV2lkdGgsIHgsIHl9XG4gICAgICAgICk7XG5cbiAgICAgICAgdGhpcy5tYXNrID0gZmFsc2U7XG4gICAgfVxuXG4gICAgcmVuZGVyKGN0eCkge1xuICAgICAgICBjdHguc3Ryb2tlU3R5bGUgPSB0aGlzLnN0cm9rZVN0eWxlO1xuICAgICAgICBjdHgubGluZVdpZHRoID0gdGhpcy5saW5lV2lkdGg7XG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSB0aGlzLmZpbGxTdHlsZTtcblxuICAgICAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgICAgIGN0eC5yZWN0KFxuICAgICAgICAgICAgLXRoaXMud2lkdGggKiB0aGlzLnBpdm90WCxcbiAgICAgICAgICAgIC10aGlzLmhlaWdodCAqIHRoaXMucGl2b3RZLFxuICAgICAgICAgICAgdGhpcy53aWR0aCxcbiAgICAgICAgICAgIHRoaXMuaGVpZ2h0XG4gICAgICAgICk7XG5cbiAgICAgICAgaWYodGhpcy5zdHJva2VTdHlsZSAhPT0gXCJub25lXCIpIGN0eC5zdHJva2UoKTtcbiAgICAgICAgaWYodGhpcy5maWxsU3R5bGUgIT09IFwibm9uZVwiKSBjdHguZmlsbCgpO1xuICAgICAgICBpZih0aGlzLm1hc2sgJiYgdGhpcy5tYXNrID09PSB0cnVlKSBjdHguY2xpcCgpO1xuICAgIH1cbn1cblxuLy8gcmVjdGFuZ2xlIHdyYXBwZXJcbmV4cG9ydCBmdW5jdGlvbiByZWN0YW5nbGUod2lkdGgsIGhlaWdodCwgZmlsbFN0eWxlLCBzdHJva2VTdHlsZSwgbGluZVdpZHRoLCB4LCB5KSB7XG4gICAgbGV0IHNwcml0ZSA9IG5ldyBSZWN0YW5nbGUod2lkdGgsIGhlaWdodCwgZmlsbFN0eWxlLCBzdHJva2VTdHlsZSwgbGluZVdpZHRoLCB4LCB5KTtcbiAgICBzdGFnZS5hZGRDaGlsZChzcHJpdGUpO1xuICAgIHJldHVybiBzcHJpdGU7XG59XG5cbmNsYXNzIENpcmNsZSBleHRlbmRzIERpc3BsYXlPYmplY3Qge1xuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBkaWFtZXRlciA9IDMyLFxuICAgICAgICBmaWxsU3R5bGUgPSBcImdyYXlcIixcbiAgICAgICAgc3Ryb2tlU3R5bGUgPSBcIm5vbmVcIixcbiAgICAgICAgbGluZVdpZHRoID0gMCxcbiAgICAgICAgeCA9IDAsXG4gICAgICAgIHkgPSAwXG4gICAgKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMuY2lyY3VsYXIgPSB0cnVlO1xuXG4gICAgICAgIE9iamVjdC5hc3NpZ24odGhpcywge2RpYW1ldGVyLCBmaWxsU3R5bGUsIHN0cm9rZVN0eWxlLCBsaW5lV2lkdGgsIHgsIHl9KTtcblxuICAgICAgICB0aGlzLm1hc2sgPSBmYWxzZTtcbiAgICB9XG5cbiAgICByZW5kZXIgKGN0eCkge1xuICAgICAgICBjdHguc3Ryb2tlU3R5bGUgPSB0aGlzLnN0cm9rZVN0eWxlO1xuICAgICAgICBjdHgubGluZVdpZHRoID0gdGhpcy5saW5lV2lkdGg7XG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSB0aGlzLmZpbGxTdHlsZTtcblxuICAgICAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgICAgIGN0eC5hcmMoXG4gICAgICAgICAgICB0aGlzLnJhZGl1cyArICgtdGhpcy5kaWFtZXRlciAqIHRoaXMucGl2b3RYKSxcbiAgICAgICAgICAgIHRoaXMucmFkaXVzICsgKC10aGlzLmRpYW1ldGVyICogdGhpcy5waXZvdFkpLFxuICAgICAgICAgICAgdGhpcy5yYWRpdXMsXG4gICAgICAgICAgICAwLCAyICogTWF0aC5QSSxcbiAgICAgICAgICAgIGZhbHNlXG4gICAgICAgICk7XG5cbiAgICAgICAgaWYodGhpcy5zdHJva2VTdHlsZSAhPT0gXCJub25lXCIpIGN0eC5zdHJva2UoKTtcbiAgICAgICAgaWYodGhpcy5maWxsU3R5bGUgIT09IFwibm9uZVwiKSBjdHguZmlsbCgpO1xuICAgICAgICBpZih0aGlzLm1hc2sgJiYgdGhpcy5tYXNrID09PSB0cnVlKSBjdHguY2xpcCgpO1xuICAgIH1cbn1cblxuLy8gY2lyY2xlIHdyYXBwZXJcbmV4cG9ydCBmdW5jdGlvbiBjaXJjbGUoZGlhbWV0ZXIsIGZpbGxTdHlsZSwgc3Ryb2tlU3R5bGUsIGxpbmVXaWR0aCwgeCwgeSkge1xuICAgIGxldCBzcHJpdGUgPSBuZXcgQ2lyY2xlKGRpYW1ldGVyLCBmaWxsU3R5bGUsIHN0cm9rZVN0eWxlLCBsaW5lV2lkdGgsIHgsIHkpO1xuICAgIHN0YWdlLmFkZENoaWxkKHNwcml0ZSk7XG4gICAgcmV0dXJuIHNwcml0ZTtcbn1cblxuY2xhc3MgTGluZSBleHRlbmRzIERpc3BsYXlPYmplY3Qge1xuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBzdHJva2VTdHlsZSA9IFwibm9uZVwiLFxuICAgICAgICBsaW5lV2lkdGggPSAxLFxuICAgICAgICBheCA9IDAsXG4gICAgICAgIGF5ID0gMCxcbiAgICAgICAgYnggPSAzMixcbiAgICAgICAgYnkgPSAzMlxuICAgICkge1xuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIE9iamVjdC5hc3NpZ24odGhpcywge3N0cm9rZVN0eWxlLCBsaW5lV2lkdGgsIGF4LCBheSwgYngsIGJ5fSk7XG5cbiAgICAgICAgdGhpcy5saW5lSm9pbiA9IFwicm91bmRcIjtcbiAgICB9XG5cbiAgICByZW5kZXIgKGN0eCkge1xuICAgICAgICBjdHguc3Ryb2tlU3R5bGUgPSB0aGlzLnN0cm9rZVN0eWxlO1xuICAgICAgICBjdHgubGluZVdpZHRoID0gdGhpcy5saW5lV2lkdGg7XG5cbiAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICBjdHgubW92ZVRvKHRoaXMuYXgsIHRoaXMuYXkpO1xuICAgICAgICBjdHgubGluZVRvKHRoaXMuYngsIHRoaXMuYnkpO1xuXG4gICAgICAgIGlmKHRoaXMuc3Ryb2tlU3R5bGUgIT09IFwibm9uZVwiKSBjdHguc3Ryb2tlKCk7XG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbGluZShzdHJva2VTdHlsZSwgbGluZVdpZHRoLCBheCwgYXksIGJ4LCBieSkge1xuICAgIGxldCBzcHJpdGUgPSBuZXcgTGluZShzdHJva2VTdHlsZSwgbGluZVdpZHRoLCBheCwgYXksIGJ4LCBieSk7XG4gICAgc3RhZ2UuYWRkQ2hpbGQoc3ByaXRlKTtcbiAgICByZXR1cm4gc3ByaXRlO1xufVxuXG5jbGFzcyBUZXh0IGV4dGVuZHMgRGlzcGxheU9iamVjdCB7XG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIGNvbnRlbnQgPSBcIkhlbGxvIVwiLFxuICAgICAgICBmb250ID0gXCIxMnB4IHNhbnMtc2VyaWZcIixcbiAgICAgICAgZmlsbFN0eWxlID0gXCJyZWRcIixcbiAgICAgICAgeCA9IDAsXG4gICAgICAgIHkgPSAwXG4gICAgKSB7XG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLCB7Y29udGVudCwgZm9udCwgZmlsbFN0eWxlLCB4LCB5fSk7XG5cbiAgICAgICAgdGhpcy50ZXh0QmFzZWxpbmUgPSBcInRvcFwiO1xuICAgICAgICB0aGlzLnN0cm9rZVRleHQgPSBcIm5vbmVcIjtcbiAgICB9XG5cbiAgICByZW5kZXIgKGN0eCkge1xuICAgICAgICBjdHguZm9udCA9IHRoaXMuZm9udDtcbiAgICAgICAgY3R4LnN0cm9rZVN0eWxlID0gdGhpcy5zdHJva2VTdHlsZTtcbiAgICAgICAgY3R4LmxpbmVXaWR0aCA9IHRoaXMubGluZVdpZHRoO1xuICAgICAgICBjdHguZmlsbFN0eWxlID0gdGhpcy5maWxsU3R5bGU7XG5cbiAgICAgICAgaWYodGhpcy53aWR0aCA9PT0gMCkgdGhpcy53aWR0aCA9IGN0eC5tZWFzdXJlVGV4dCh0aGlzLmNvbnRlbnQpLndpZHRoO1xuICAgICAgICBpZih0aGlzLmhlaWdodCA9PT0gMCkgdGhpcy5oZWlnaHQgPSBjdHgubWVhc3VyZVRleHQoXCJNXCIpLndpZHRoO1xuXG4gICAgICAgIGN0eC50cmFuc2xhdGUoXG4gICAgICAgICAgICAtdGhpcy53aWR0aCAqIHRoaXMucGl2b3RYLFxuICAgICAgICAgICAgLXRoaXMuaGVpZ2h0ICogdGhpcy5waXZvdFlcbiAgICAgICAgKTtcblxuICAgICAgICBjdHgudGV4dEJhc2VsaW5lID0gdGhpcy50ZXh0QmFzZWxpbmU7XG5cbiAgICAgICAgY3R4LmZpbGxUZXh0KFxuICAgICAgICAgICAgdGhpcy5jb250ZW50LCAwLCAwXG4gICAgICAgICk7XG5cbiAgICAgICAgaWYodGhpcy5zdHJva2VUZXh0ICE9PSBcIm5vbmVcIikgY3R4LnN0cm9rZSgpO1xuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRleHQoY29udGVudCwgZm9udCwgZmlsbFN0eWxlLCB4LCB5KSB7XG4gICAgbGV0IHNwcml0ZSA9IG5ldyBUZXh0KGNvbnRlbnQsIGZvbnQsIGZpbGxTdHlsZSwgeCwgeSk7XG4gICAgc3RhZ2UuYWRkQ2hpbGQoc3ByaXRlKTtcbiAgICByZXR1cm4gc3ByaXRlO1xufVxuXG5jbGFzcyBHcm91cCBleHRlbmRzIERpc3BsYXlPYmplY3Qge1xuICAgIGNvbnN0cnVjdG9yKC4uLnNwcml0ZXNUb0dyb3VwKSB7XG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgc3ByaXRlc1RvR3JvdXAuZm9yRWFjaChzcHJpdGUgPT4gdGhpcy5hZGRDaGlsZChzcHJpdGUpKTtcbiAgICB9XG5cbiAgICBhZGRDaGlsZCAoc3ByaXRlKSB7XG4gICAgICAgIGlmKHNwcml0ZS5wYXJlbnQpIHtcbiAgICAgICAgICAgIHNwcml0ZS5wYXJlbnQucmVtb3ZlQ2hpbGQoc3ByaXRlKTtcbiAgICAgICAgfVxuICAgICAgICBzcHJpdGUucGFyZW50ID0gdGhpcztcbiAgICAgICAgdGhpcy5jaGlsZHJlbi5wdXNoKHNwcml0ZSk7XG5cbiAgICAgICAgdGhpcy5jYWxjdWxhdGVTaXplKCk7XG4gICAgfVxuXG4gICAgcmVtb3ZlQ2hpbGQgKHNwcml0ZSkge1xuICAgICAgICBpZihzcHJpdGUucGFyZW50ID09PSB0aGlzKSB7XG4gICAgICAgICAgICB0aGlzLmNoaWxkcmVuLnNwbGljZSh0aGlzLmNoaWxkcmVuLmluZGV4T2Yoc3ByaXRlKSwgMSk7XG4gICAgICAgICAgICB0aGlzLmNhbGN1bGF0ZVNpemUoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgJHtzcHJpdGV9IGlzIG5vdCBjaGlsZCBvZiAke3RoaXN9YCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjYWxjdWxhdGVTaXplICgpIHtcbiAgICAgICAgaWYodGhpcy5jaGlsZHJlbi5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICB0aGlzLl9uZXdXaWR0aCA9IDA7XG4gICAgICAgICAgICB0aGlzLl9uZXdIZWlnaHQgPSAwO1xuXG4gICAgICAgICAgICB0aGlzLmNoaWxkcmVuLmZvckVhY2goY2hpbGQgPT4ge1xuICAgICAgICAgICAgICAgIGlmKGNoaWxkLnggKyBjaGlsZC53aWR0aCA+IHRoaXMuX25ld1dpZHRoKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX25ld1dpZHRoID0gY2hpbGQueCArIGNoaWxkLndpZHRoO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZihjaGlsZC55ICsgY2hpbGQuaGVpZ2h0ID4gdGhpcy5fbmV3SGVpZ2h0KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX25ld0hlaWdodCA9IGNoaWxkLnkgKyBjaGlsZC5oZWlnaHQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMud2lkdGggPSB0aGlzLl9uZXdXaWR0aDtcbiAgICAgICAgICAgIHRoaXMuaGVpZ2h0ID0gdGhpcy5fbmV3SGVpZ2h0O1xuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ3JvdXAoLi4uc3ByaXRlc1RvR3JvdXApIHtcbiAgICBsZXQgc3ByaXRlID0gbmV3IEdyb3VwKC4uLnNwcml0ZXNUb0dyb3VwKTtcbiAgICBzdGFnZS5hZGRDaGlsZChzcHJpdGUpO1xuICAgIHJldHVybiBzcHJpdGU7XG59XG5cbmNsYXNzIFNwcml0ZSBleHRlbmRzIERpc3BsYXlPYmplY3Qge1xuICAgIGNvbnN0cnVjdG9yIChcbiAgICAgICAgc291cmNlLFxuICAgICAgICB4ID0gMCxcbiAgICAgICAgeSA9IDBcbiAgICApIHtcbiAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMsIHt4LCB5fSk7XG5cbiAgICAgICAgaWYoc291cmNlIGluc3RhbmNlb2YgSW1hZ2UpIHtcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlRnJvbUltYWdlKHNvdXJjZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZihzb3VyY2UubmFtZSkge1xuICAgICAgICAgICAgdGhpcy5jcmVhdGVGcm9tQXRsYXMoc291cmNlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmKHNvdXJjZS5pbWFnZSAmJiAhc291cmNlLmRhdGEpIHtcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlRnJvbVRpbGVzZXQoc291cmNlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmKHNvdXJjZS5pbWFnZSAmJiBzb3VyY2UuZGF0YSkge1xuICAgICAgICAgICAgdGhpcy5jcmVhdGVGcm9tVGlsZXNldEZyYW1lcyhzb3VyY2UpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYoc291cmNlIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgICAgIGlmKHNvdXJjZVswXSAmJiBzb3VyY2VbMF0uc291cmNlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jcmVhdGVGcm9tQXRsYXNGcmFtZXMoc291cmNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYoc291cmNlWzBdIGluc3RhbmNlb2YgSW1hZ2UpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZUZyb21JbWFnZXMoc291cmNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVGhlIGltYWdlIHNvdXJjZXMgaW4gJHtzb3VyY2V9IGFyZSBub3QgcmVjb2duaXplZGApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBUaGUgaW1hZ2Ugc291cmNlICR7c291cmNlfSBpcyBub3QgcmVjb2duaXplZGApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY3JlYXRlRnJvbUltYWdlIChzb3VyY2UpIHtcbiAgICAgICAgaWYoIShzb3VyY2UgaW5zdGFuY2VvZiBJbWFnZSkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgJHtzb3VyY2V9IGlzIG5vdCBhbiBpbWFnZSBvYmplY3RgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc291cmNlID0gc291cmNlO1xuICAgICAgICAgICAgdGhpcy5zb3VyY2VYID0gMDtcbiAgICAgICAgICAgIHRoaXMuc291cmNlWSA9IDA7XG4gICAgICAgICAgICB0aGlzLnNvdXJjZVdpZHRoID0gc291cmNlLndpZHRoO1xuICAgICAgICAgICAgdGhpcy5zb3VyY2VIZWlnaHQgPSBzb3VyY2UuaGVpZ2h0O1xuXG4gICAgICAgICAgICB0aGlzLndpZHRoID0gc291cmNlLndpZHRoO1xuICAgICAgICAgICAgdGhpcy5oZWlnaHQgPSBzb3VyY2UuaGVpZ2h0O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY3JlYXRlRnJvbUF0bGFzIChzb3VyY2UpIHtcbiAgICAgICAgdGhpcy50aWxlc2V0RnJhbWUgPSBzb3VyY2U7XG4gICAgICAgIHRoaXMuc291cmNlID0gdGhpcy50aWxlc2V0RnJhbWUuc291cmNlO1xuICAgICAgICB0aGlzLnNvdXJjZVggPSB0aGlzLnRpbGVzZXRGcmFtZS5zeDtcbiAgICAgICAgdGhpcy5zb3VyY2VZID0gdGhpcy50aWxlc2V0RnJhbWUuc3k7XG4gICAgICAgIHRoaXMuc291cmNlV2lkdGggPSBzb3VyY2UudGlsZXc7XG4gICAgICAgIHRoaXMuc291cmNlSGVpZ2h0ID0gc291cmNlLnRpbGVoO1xuXG4gICAgICAgIHRoaXMud2lkdGggPSB0aGlzLnRpbGVzZXRGcmFtZS53O1xuICAgICAgICB0aGlzLmhlaWdodCA9IHRoaXMudGlsZXNldEZyYW1lLmg7XG4gICAgfVxuXG4gICAgY3JlYXRlRnJvbVRpbGVzZXQgKHNvdXJjZSkge1xuICAgICAgICBpZighKHNvdXJjZS5pbWFnZSBpbnN0YW5jZW9mIEltYWdlKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGAke3NvdXJjZS5pbWFnZX0gaXMgbm90IGFuIGltYWdlIG9iamVjdGApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zb3VyY2UgPSBzb3VyY2UuaW1hZ2U7XG5cbiAgICAgICAgICAgIHRoaXMuc291cmNlWCA9IHNvdXJjZS54O1xuICAgICAgICAgICAgdGhpcy5zb3VyY2VZID0gc291cmNlLnk7XG4gICAgICAgICAgICB0aGlzLnNvdXJjZVdpZHRoID0gc291cmNlLndpZHRoO1xuICAgICAgICAgICAgdGhpcy5zb3VyY2VIZWlnaHQgPSBzb3VyY2UuaGVpZ2h0O1xuXG4gICAgICAgICAgICB0aGlzLndpZHRoID0gc291cmNlLndpZHRoO1xuICAgICAgICAgICAgdGhpcy5oZWlnaHQgPSBzb3VyY2UuaGVpZ2h0O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY3JlYXRlRnJvbVRpbGVzZXRGcmFtZXMgKHNvdXJjZSkge1xuICAgICAgICBpZighKHNvdXJjZS5pbWFnZSBpbnN0YW5jZW9mIEltYWdlKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGAke3NvdXJjZS5pbWFnZX0gaXMgbm90IGFuIGltYWdlIG9iamVjdGApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zb3VyY2UgPSBzb3VyY2UuaW1hZ2U7XG4gICAgICAgICAgICB0aGlzLmZyYW1lcyA9IHNvdXJjZS5kYXRhO1xuXG4gICAgICAgICAgICB0aGlzLnNvdXJjZVggPSB0aGlzLmZyYW1lc1swXVswXTtcbiAgICAgICAgICAgIHRoaXMuc291cmNlWSA9IHRoaXMuZnJhbWVzWzBdWzFdO1xuICAgICAgICAgICAgdGhpcy5zb3VyY2VXaWR0aCA9IHNvdXJjZS53aWR0aDtcbiAgICAgICAgICAgIHRoaXMuc291cmNlSGVpZ2h0ID0gc291cmNlLmhlaWdodDtcblxuICAgICAgICAgICAgdGhpcy53aWR0aCA9IHNvdXJjZS53aWR0aDtcbiAgICAgICAgICAgIHRoaXMuaGVpZ2h0ID0gc291cmNlLmhlaWdodDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNyZWF0ZUZyb21BdGxhc0ZyYW1lcyAoc291cmNlKSB7XG4gICAgICAgIHRoaXMuZnJhbWVzID0gc291cmNlO1xuICAgICAgICB0aGlzLnNvdXJjZSA9IHNvdXJjZVswXS5zb3VyY2U7XG4gICAgICAgIHRoaXMuc291cmNlWCA9IHNvdXJjZVswXS5mcmFtZS54O1xuICAgICAgICB0aGlzLnNvdXJjZVkgPSBzb3VyY2VbMF0uZnJhbWUueTtcbiAgICAgICAgdGhpcy5zb3VyY2VXaWR0aCA9IHNvdXJjZVswXS5mcmFtZS53O1xuICAgICAgICB0aGlzLnNvdXJjZUhlaWdodCA9IHNvdXJjZVswXS5mcmFtZS5oO1xuXG4gICAgICAgIHRoaXMud2lkdGggPSBzb3VyY2VbMF0uZnJhbWUudztcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBzb3VyY2VbMF0uZnJhbWUuaDtcbiAgICB9XG5cbiAgICBjcmVhdGVGcm9tSW1hZ2VzIChzb3VyY2UpIHtcbiAgICAgICAgdGhpcy5mcmFtZXMgPSBzb3VyY2U7XG4gICAgICAgIHRoaXMuc291cmNlID0gc291cmNlWzBdO1xuICAgICAgICB0aGlzLnNvdXJjZVggPSAwO1xuICAgICAgICB0aGlzLnNvdXJjZVkgPSAwO1xuICAgICAgICB0aGlzLnNvdXJjZVdpZHRoID0gc291cmNlWzBdLndpZHRoO1xuICAgICAgICB0aGlzLnNvdXJjZUhlaWdodCA9IHNvdXJjZVswXS5oZWlnaHQ7XG5cbiAgICAgICAgdGhpcy53aWR0aCA9IHNvdXJjZVswXS53aWR0aDtcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBzb3VyY2VbMF0uaGVpZ2h0O1xuICAgIH1cblxuICAgIGdvdG9BbmRTdG9wIChmcmFtZU51bWJlcikge1xuICAgICAgICBpZih0aGlzLmZyYW1lcy5sZW5ndGggPiAwICYmIGZyYW1lTnVtYmVyIDwgdGhpcy5mcmFtZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICBpZih0aGlzLmZyYW1lc1swXSBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zb3VyY2VYID0gdGhpcy5mcmFtZXNbZnJhbWVOdW1iZXJdWzBdO1xuICAgICAgICAgICAgICAgIHRoaXMuc291cmNlWSA9IHRoaXMuZnJhbWVzW2ZyYW1lTnVtYmVyXVsxXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYodGhpcy5mcmFtZXNbZnJhbWVOdW1iZXJdLmZyYW1lKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zb3VyY2VYID0gdGhpcy5mcmFtZXNbZnJhbWVOdW1iZXJdLmZyYW1lLng7XG4gICAgICAgICAgICAgICAgdGhpcy5zb3VyY2VZID0gdGhpcy5mcmFtZXNbZnJhbWVOdW1iZXJdLmZyYW1lLnk7XG4gICAgICAgICAgICAgICAgdGhpcy5zb3VyY2VXaWR0aCA9IHRoaXMuZnJhbWVzW2ZyYW1lTnVtYmVyXS5mcmFtZS53O1xuICAgICAgICAgICAgICAgIHRoaXMuc291cmNlSGVpZ2h0ID0gdGhpcy5mcmFtZXNbZnJhbWVOdW1iZXJdLmZyYW1lLmg7XG4gICAgICAgICAgICAgICAgdGhpcy53aWR0aCA9IHRoaXMuZnJhbWVzW2ZyYW1lTnVtYmVyXS5mcmFtZS53O1xuICAgICAgICAgICAgICAgIHRoaXMuaGVpZ2h0ID0gdGhpcy5mcmFtZXNbZnJhbWVOdW1iZXJdLmZyYW1lLmg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNvdXJjZSA9IHRoaXMuZnJhbWVzW2ZyYW1lTnVtYmVyXTtcbiAgICAgICAgICAgICAgICB0aGlzLnNvdXJjZVggPSAwO1xuICAgICAgICAgICAgICAgIHRoaXMuc291cmNlWSA9IDA7XG4gICAgICAgICAgICAgICAgdGhpcy5zb3VyY2VXaWR0aCA9IHRoaXMuc291cmNlLndpZHRoO1xuICAgICAgICAgICAgICAgIHRoaXMuc291cmNlSGVpZ2h0ID0gdGhpcy5zb3VyY2UuaGVpZ2h0O1xuICAgICAgICAgICAgICAgIHRoaXMud2lkdGggPSB0aGlzLnNvdXJjZS53aWR0aDtcbiAgICAgICAgICAgICAgICB0aGlzLmhlaWdodCA9IHRoaXMuc291cmNlLmhlaWdodDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5fY3VycmVudEZyYW1lID0gZnJhbWVOdW1iZXI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEZyYW1lIG51bWJlciAke2ZyYW1lTnVtYmVyfSBkb2VzIG5vdCBleGlzdHMhYCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZW5kZXIgKGN0eCkge1xuICAgICAgICBjdHguZHJhd0ltYWdlKFxuICAgICAgICAgICAgdGhpcy5zb3VyY2UsXG4gICAgICAgICAgICB0aGlzLnNvdXJjZVgsIHRoaXMuc291cmNlWSxcbiAgICAgICAgICAgIHRoaXMuc291cmNlV2lkdGgsIHRoaXMuc291cmNlSGVpZ2h0LFxuICAgICAgICAgICAgLXRoaXMud2lkdGggKiB0aGlzLnBpdm90WCxcbiAgICAgICAgICAgIC10aGlzLmhlaWdodCAqIHRoaXMucGl2b3RZLFxuICAgICAgICAgICAgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHRcbiAgICAgICAgKTtcbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzcHJpdGUoc291cmNlLCB4LCB5KSB7XG4gICAgbGV0IHNwcml0ZSA9IG5ldyBTcHJpdGUoc291cmNlLCB4LCB5KTtcbiAgICBpZihzcHJpdGUuZnJhbWVzLmxlbmd0aCA+IDApIGFkZFN0YXRlUGxheWVyKHNwcml0ZSk7XG4gICAgc3RhZ2UuYWRkQ2hpbGQoc3ByaXRlKTtcbiAgICByZXR1cm4gc3ByaXRlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZnJhbWUoc291cmNlLCB4LCB5LCB3aWR0aCwgaGVpZ2h0KSB7XG4gICAgdmFyIG8gPSB7fTtcbiAgICBvLmltYWdlID0gc291cmNlO1xuICAgIG8ueCA9IHg7XG4gICAgby55ID0geTtcbiAgICBvLndpZHRoID0gd2lkdGg7XG4gICAgby5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgcmV0dXJuIG87XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmcmFtZXMoc291cmNlLCBhcnJheU9mUG9zaXRpb25zLCB3aWR0aCwgaGVpZ2h0KSB7XG4gICAgdmFyIG8gPSB7fTtcbiAgICBvLmltYWdlID0gc291cmNlO1xuICAgIG8uZGF0YSA9IGFycmF5T2ZQb3NpdGlvbnM7XG4gICAgby53aWR0aCA9IHdpZHRoO1xuICAgIG8uaGVpZ2h0ID0gaGVpZ2h0O1xuICAgIHJldHVybiBvO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZmlsbXN0cmlwKGltYWdlLCBmcmFtZVdpZHRoLCBmcmFtZUhlaWdodCwgc3BhY2luZyA9IDApIHtcbiAgICBsZXQgcG9zaXRpb25zID0gW107XG5cbiAgICBsZXQgY29sdW1ucyA9IGltYWdlLndpZHRoIC8gZnJhbWVXaWR0aCxcbiAgICAgICAgcm93cyA9IGltYWdlLmhlaWdodCAvIGZyYW1lSGVpZ2h0O1xuXG4gICAgbGV0IG51bWJlck9mRnJhbWVzID0gY29sdW1ucyAqIHJvd3M7XG5cbiAgICBmb3IobGV0IGkgPSAwOyBpIDwgbnVtYmVyT2ZGcmFtZXM7IGkrKykge1xuICAgICAgICBsZXQgeCA9IChpICUgY29sdW1ucykgKiBmcmFtZVdpZHRoLFxuICAgICAgICAgICAgeSA9IE1hdGguZmxvb3IoaSAvIGNvbHVtbnMpICogZnJhbWVIZWlnaHQ7XG5cbiAgICAgICAgaWYoc3BhY2luZyAmJiBzcGFjaW5nID4gMCkge1xuICAgICAgICAgICAgeCArPSBzcGFjaW5nICsgKHNwYWNpbmcgKiBpICUgY29sdW1ucyk7XG4gICAgICAgICAgICB5ICs9IHNwYWNpbmcgKyAoc3BhY2luZyAqIE1hdGguZmxvb3IoaSAvIGNvbHVtbnMpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHBvc2l0aW9ucy5wdXNoKFt4LCB5XSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZyYW1lcyhpbWFnZSwgcG9zaXRpb25zLCBmcmFtZVdpZHRoLCBmcmFtZUhlaWdodCk7XG59XG5cbmNsYXNzIEJ1dHRvbiBleHRlbmRzIFNwcml0ZSB7XG4gICAgY29uc3RydWN0b3IgKHNvdXJjZSwgeCA9IDAsIHkgPSAwKSB7XG4gICAgICAgIHN1cGVyKHNvdXJjZSwgeCwgeSk7XG4gICAgICAgIHRoaXMuaW50ZXJhY3RpdmUgPSB0cnVlO1xuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJ1dHRvbihzb3VyY2UsIHgsIHkpIHtcbiAgICBsZXQgc3ByaXRlID0gbmV3IEJ1dHRvbihzb3VyY2UsIHgsIHkpO1xuICAgIHN0YWdlLmFkZENoaWxkKHNwcml0ZSk7XG4gICAgcmV0dXJuIHNwcml0ZTtcbn1cblxuZnVuY3Rpb24gbWFrZUludGVyYWN0aXZlKG8pIHtcbiAgICBvLnByZXNzID0gby5wcmVzcyB8fCB1bmRlZmluZWQ7XG4gICAgby5yZWxlYXNlID0gby5yZWxlYXNlIHx8IHVuZGVmaW5lZDtcbiAgICBvLm92ZXIgPSBvLm92ZXIgfHwgdW5kZWZpbmVkO1xuICAgIG8ub3V0ID0gby5vdXQgfHwgdW5kZWZpbmVkO1xuICAgIG8udGFwID0gby50YXAgfHwgdW5kZWZpbmVkO1xuXG4gICAgby5zdGF0ZSA9IFwidXBcIjtcblxuICAgIG8uYWN0aW9uID0gXCJcIjtcblxuICAgIG8ucHJlc3NlZCA9IGZhbHNlO1xuICAgIG8uaG92ZXJPdmVyID0gZmFsc2U7XG5cbiAgICBvLnVwZGF0ZSA9IChwb2ludGVyKSA9PiB7XG4gICAgICAgIGxldCBoaXQgPSBwb2ludGVyLmhpdFRlc3RTcHJpdGUobyk7XG5cbiAgICAgICAgaWYocG9pbnRlci5pc1VwKSB7XG4gICAgICAgICAgICBvLnN0YXRlID0gXCJ1cFwiO1xuICAgICAgICAgICAgaWYobyBpbnN0YW5jZW9mIEJ1dHRvbikgby5nb3RvQW5kU3RvcCgwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKGhpdCkge1xuICAgICAgICAgICAgby5zdGF0ZSA9IFwib3ZlclwiO1xuXG4gICAgICAgICAgICBpZihvLmZyYW1lcyAmJiBvLmZyYW1lcy5sZW5ndGggPT09IDMgJiYgbyBpbnN0YW5jZW9mIEJ1dHRvbikge1xuICAgICAgICAgICAgICAgIG8uZ290b0FuZFN0b3AoMSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKHBvaW50ZXIuaXNEb3duKSB7XG4gICAgICAgICAgICAgICAgby5zdGF0ZSA9IFwiZG93blwiO1xuXG4gICAgICAgICAgICAgICAgaWYobyBpbnN0YW5jZW9mIEJ1dHRvbikge1xuICAgICAgICAgICAgICAgICAgICBpZihvLmZyYW1lcy5sZW5ndGggPT09IDMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG8uZ290b0FuZFN0b3AoMik7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvLmdvdG9BbmRTdG9wKDEpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYoby5zdGF0ZSA9PT0gXCJkb3duXCIpIHtcbiAgICAgICAgICAgIGlmKCFvLnByZXNzZWQpIHtcbiAgICAgICAgICAgICAgICBpZihvLnByZXNzKSBvLnByZXNzKCk7XG4gICAgICAgICAgICAgICAgby5wcmVzc2VkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBvLmFjdGlvbiA9IFwicHJlc3NlZFwiO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYoby5zdGF0ZSA9PT0gXCJvdmVyXCIpIHtcbiAgICAgICAgICAgIGlmKG8ucHJlc3NlZCkge1xuICAgICAgICAgICAgICAgIGlmKG8ucmVsZWFzZSkgby5yZWxlYXNlKCk7XG4gICAgICAgICAgICAgICAgby5wcmVzc2VkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgby5hY3Rpb24gPSBcInJlbGVhc2VkXCI7XG5cbiAgICAgICAgICAgICAgICBpZihwb2ludGVyLnRhcHBlZCAmJiBvLnRhcCkgby50YXAoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYoIW8uaG92ZXJPdmVyKSB7XG4gICAgICAgICAgICAgICAgaWYoby5vdmVyKSBvLm92ZXIoKTtcbiAgICAgICAgICAgICAgICBvLmhvdmVyT3ZlciA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZihvLnN0YXRlID09PSBcInVwXCIpIHtcbiAgICAgICAgICAgIGlmKG8ucHJlc3NlZCkge1xuICAgICAgICAgICAgICAgIGlmKG8ucmVsZWFzZSkgby5yZWxlYXNlKCk7XG4gICAgICAgICAgICAgICAgby5wcmVzc2VkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgby5hY3Rpb24gPSBcInJlbGVhc2VkXCI7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKG8uaG92ZXJPdmVyKSB7XG4gICAgICAgICAgICAgICAgaWYoby5vdXQpIG8ub3V0KCk7XG4gICAgICAgICAgICAgICAgby5ob3Zlck92ZXIgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG59XG5cbmZ1bmN0aW9uIGFkZFN0YXRlUGxheWVyKHNwcml0ZSkge1xuICAgIGxldCBmcmFtZUNvdW50ZXIgPSAwLFxuICAgICAgICBudW1iZXJPZkZyYW1lcyA9IDAsXG4gICAgICAgIHN0YXJ0RnJhbWUgPSAwLFxuICAgICAgICBlbmRGcmFtZSA9IDAsXG4gICAgICAgIHRpbWVJbnRlcnZhbCA9IHVuZGVmaW5lZDtcblxuICAgIGZ1bmN0aW9uIHNob3cgKGZyYW1lTnVtYmVyKSB7XG4gICAgICAgIHJlc2V0KCk7XG4gICAgICAgIHNwcml0ZS5nb3RvQW5kU3RvcChmcmFtZU51bWJlcik7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcGxheSgpIHtcbiAgICAgICAgcGxheVNlcXVlbmNlKFswLCBzcHJpdGUuZnJhbWVzLmxlbmd0aCAtIDFdKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzdG9wKCkge1xuICAgICAgICByZXNldCgpO1xuICAgICAgICBzcHJpdGUuZ290b0FuZFN0b3Aoc3ByaXRlLmN1cnJlbnRGcmFtZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcGxheVNlcXVlbmNlKHNlcXVlbmNlQXJyYXkpIHtcbiAgICAgICAgcmVzZXQoKTtcblxuICAgICAgICBzdGFydEZyYW1lID0gc2VxdWVuY2VBcnJheVswXTtcbiAgICAgICAgZW5kRnJhbWUgPSBzZXF1ZW5jZUFycmF5WzFdO1xuICAgICAgICBudW1iZXJPZkZyYW1lcyA9IGVuZEZyYW1lIC0gc3RhcnRGcmFtZTtcblxuICAgICAgICBpZihzdGFydEZyYW1lID09PSAwKSB7XG4gICAgICAgICAgICBudW1iZXJPZkZyYW1lcyArPSAxO1xuICAgICAgICAgICAgZnJhbWVDb3VudGVyICs9IDE7XG4gICAgICAgIH1cblxuICAgICAgICBpZihudW1iZXJPZkZyYW1lcyA9PT0gMSkge1xuICAgICAgICAgICAgbnVtYmVyT2ZGcmFtZXMgPSAyO1xuICAgICAgICAgICAgZnJhbWVDb3VudGVyICs9IDE7XG4gICAgICAgIH1cblxuICAgICAgICBpZighc3ByaXRlLmZwcykgc3ByaXRlLmZwcyA9IDEyO1xuICAgICAgICBsZXQgZnJhbWVSYXRlID0gMTAwMCAvIHNwcml0ZS5mcHM7XG5cbiAgICAgICAgc3ByaXRlLmdvdG9BbmRTdG9wKHN0YXJ0RnJhbWUpO1xuXG4gICAgICAgIGlmKCFzcHJpdGUucGxheWluZykge1xuICAgICAgICAgICAgdGltZUludGVydmFsID0gc2V0SW50ZXJ2YWwoYWR2YW5jZUZyYW1lLmJpbmQodGhpcyksIGZyYW1lUmF0ZSk7XG4gICAgICAgICAgICBzcHJpdGUucGxheWluZyA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBhZHZhbmNlRnJhbWUoKSB7XG4gICAgICAgIGlmKGZyYW1lQ291bnRlciA8IG51bWJlck9mRnJhbWVzKSB7XG4gICAgICAgICAgICBzcHJpdGUuZ290b0FuZFN0b3Aoc3ByaXRlLmN1cnJlbnRGcmFtZSArIDEpO1xuICAgICAgICAgICAgZnJhbWVDb3VudGVyICs9IDE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZihzcHJpdGUubG9vcCkge1xuICAgICAgICAgICAgICAgIHNwcml0ZS5nb3RvQW5kU3RvcChzdGFydEZyYW1lKTtcbiAgICAgICAgICAgICAgICBmcmFtZUNvdW50ZXIgPSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVzZXQoKSB7XG4gICAgICAgIGlmKHRpbWVJbnRlcnZhbCAhPT0gdW5kZWZpbmVkICYmIHNwcml0ZS5wbGF5aW5nID09PSB0cnVlKSB7XG4gICAgICAgICAgICBzcHJpdGUucGxheWluZyA9IGZhbHNlO1xuICAgICAgICAgICAgZnJhbWVDb3VudGVyID0gMDtcbiAgICAgICAgICAgIHN0YXJ0RnJhbWUgPSAwO1xuICAgICAgICAgICAgZW5kRnJhbWUgPSAwO1xuICAgICAgICAgICAgbnVtYmVyT2ZGcmFtZXMgPSAwO1xuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbCh0aW1lSW50ZXJ2YWwpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3ByaXRlLnNob3cgPSBzaG93O1xuICAgIHNwcml0ZS5wbGF5ID0gcGxheTtcbiAgICBzcHJpdGUuc3RvcCA9IHN0b3A7XG4gICAgc3ByaXRlLnBsYXlTZXF1ZW5jZSA9IHBsYXlTZXF1ZW5jZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnRpY2xlRWZmZWN0KFxuICAgIHggPSAwLFxuICAgIHkgPSAwLFxuICAgIHNwcml0ZUZ1bmN0aW9uID0gKCkgPT4gY2lyY2xlKDEwLCBcInJlZFwiKSxcbiAgICBudW1iZXJPZlBhcnRpY2xlcyA9IDEwLFxuICAgIGdyYXZpdHkgPSAwLFxuICAgIHJhbmRvbVNwYWNpbmcgPSB0cnVlLFxuICAgIG1pbkFuZ2xlID0gMCwgbWF4QW5nbGUgPSA2LjI4LFxuICAgIG1pblNpemUgPSA0LCBtYXhTaXplID0gMTYsXG4gICAgbWluU3BlZWQgPSAwLjEsIG1heFNwZWVkID0gMSxcbiAgICBtaW5TY2FsZVNwZWVkID0gMC4wMSwgbWF4U2NhbGVTcGVlZCA9IDAuMDUsXG4gICAgbWluQWxwaGFTcGVlZCA9IDAuMDIsIG1heEFscGhhU3BlZWQgPSAwLjAyLFxuICAgIG1pblJvdGF0aW9uU3BlZWQgPSAwLjAxLCBtYXhSb3RhdGlvblNwZWVkID0gMC4wM1xuKSB7XG4gICAgbGV0IHJhbmRvbUZsb2F0ID0gKG1pbiwgbWF4KSA9PiBtaW4gKyBNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbiksXG4gICAgICAgIHJhbmRvbUludCA9IChtaW4sIG1heCkgPT4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbiArIDEpKSArIG1pbjtcblxuICAgIGxldCBhbmdsZXMgPSBbXTtcbiAgICBsZXQgYW5nbGU7XG5cbiAgICBsZXQgc3BhY2luZyA9IChtYXhBbmdsZSAtIG1pbkFuZ2xlKSAvIChudW1iZXJPZlBhcnRpY2xlcyAtIDEpO1xuXG4gICAgZm9yKGxldCBpID0gMDsgaSA8IG51bWJlck9mUGFydGljbGVzOyBpKyspIHtcbiAgICAgICAgaWYocmFuZG9tU3BhY2luZykge1xuICAgICAgICAgICAgYW5nbGUgPSByYW5kb21GbG9hdChtaW5BbmdsZSwgbWF4QW5nbGUpO1xuICAgICAgICAgICAgYW5nbGVzLnB1c2goYW5nbGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYoYW5nbGUgPT09IHVuZGVmaW5lZCkgYW5nbGUgPSBtaW5BbmdsZTtcbiAgICAgICAgICAgIGFuZ2xlcy5wdXNoKGFuZ2xlKTtcbiAgICAgICAgICAgIGFuZ2xlICs9IHNwYWNpbmc7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhbmdsZXMuZm9yRWFjaChhbmdsZSA9PiBtYWtlUGFydGljbGUoYW5nbGUpKTtcblxuICAgIGZ1bmN0aW9uIG1ha2VQYXJ0aWNsZShhbmdsZSkge1xuICAgICAgICBsZXQgcGFydGljbGUgPSBzcHJpdGVGdW5jdGlvbigpO1xuXG4gICAgICAgIGlmKHBhcnRpY2xlLmZyYW1lcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBwYXJ0aWNsZS5nb3RvQW5kU3RvcChyYW5kb21JbnQoMCwgcGFydGljbGUuZnJhbWVzLmxlbmd0aCAtIDEpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHBhcnRpY2xlLnggPSB4IC0gcGFydGljbGUuaGFsZkhlaWdodDtcbiAgICAgICAgcGFydGljbGUueSA9IHkgLSBwYXJ0aWNsZS5oYWxmSGVpZ2h0O1xuXG4gICAgICAgIGxldCBzaXplID0gcmFuZG9tSW50KG1pblNpemUsIG1heFNpemUpO1xuICAgICAgICBwYXJ0aWNsZS53aWR0aCA9IHNpemU7XG4gICAgICAgIHBhcnRpY2xlLmhlaWdodCA9IHNpemU7XG5cbiAgICAgICAgcGFydGljbGUuc2NhbGVTcGVlZCA9IHJhbmRvbUZsb2F0KG1pblNjYWxlU3BlZWQsIG1heFNjYWxlU3BlZWQpO1xuICAgICAgICBwYXJ0aWNsZS5hbHBoYVNwZWVkID0gcmFuZG9tRmxvYXQobWluQWxwaGFTcGVlZCwgbWF4QWxwaGFTcGVlZCk7XG4gICAgICAgIHBhcnRpY2xlLnJvdGF0aW9uU3BlZWQgPSByYW5kb21GbG9hdChtaW5Sb3RhdGlvblNwZWVkLCBtYXhSb3RhdGlvblNwZWVkKTtcblxuICAgICAgICBsZXQgc3BlZWQgPSByYW5kb21GbG9hdChtaW5TcGVlZCwgbWF4U3BlZWQpO1xuICAgICAgICBwYXJ0aWNsZS52eCA9IHNwZWVkICogTWF0aC5jb3MoYW5nbGUpO1xuICAgICAgICBwYXJ0aWNsZS52eSA9IHNwZWVkICogTWF0aC5zaW4oYW5nbGUpO1xuXG4gICAgICAgIHBhcnRpY2xlLnVwZGF0ZSA9ICgpID0+IHtcbiAgICAgICAgICAgIHBhcnRpY2xlLnZ5ICs9IGdyYXZpdHk7XG5cbiAgICAgICAgICAgIHBhcnRpY2xlLnggKz0gcGFydGljbGUudng7XG4gICAgICAgICAgICBwYXJ0aWNsZS55ICs9IHBhcnRpY2xlLnZ5O1xuXG4gICAgICAgICAgICBpZihwYXJ0aWNsZS5zY2FsZVggLSBwYXJ0aWNsZS5zY2FsZVNwZWVkID4gMCkge1xuICAgICAgICAgICAgICAgIHBhcnRpY2xlLnNjYWxlWCAtPSBwYXJ0aWNsZS5zY2FsZVNwZWVkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYocGFydGljbGUuc2NhbGVZIC0gcGFydGljbGUuc2NhbGVTcGVlZCA+IDApIHtcbiAgICAgICAgICAgICAgICBwYXJ0aWNsZS5zY2FsZVkgLT0gcGFydGljbGUuc2NhbGVTcGVlZDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcGFydGljbGUucm90YXRpb24gKz0gcGFydGljbGUucm90YXRpb25TcGVlZDtcblxuICAgICAgICAgICAgcGFydGljbGUuYWxwaGEgLT0gcGFydGljbGUuYWxwaGFTcGVlZDtcblxuICAgICAgICAgICAgaWYocGFydGljbGUuYWxwaGEgPD0gMCkge1xuICAgICAgICAgICAgICAgIHJlbW92ZShwYXJ0aWNsZSk7XG4gICAgICAgICAgICAgICAgcGFydGljbGVzLnNwbGljZShwYXJ0aWNsZXMuaW5kZXhPZihwYXJ0aWNsZSksIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHBhcnRpY2xlcy5wdXNoKHBhcnRpY2xlKTtcbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBlbWl0dGVyKGludGVydmFsLCBwYXJ0aWNsZUZ1bmN0aW9uKSB7XG4gICAgbGV0IGVtaXR0ZXIgPSB7fSxcbiAgICAgICAgdGltZXJJbnRlcnZhbCA9IHVuZGVmaW5lZDtcblxuICAgIGVtaXR0ZXIucGxheWluZyA9IGZhbHNlO1xuXG4gICAgZnVuY3Rpb24gcGxheSgpIHtcbiAgICAgICAgaWYoIWVtaXR0ZXIucGxheWluZykge1xuICAgICAgICAgICAgcGFydGljbGVGdW5jdGlvbigpO1xuICAgICAgICAgICAgdGltZXJJbnRlcnZhbCA9IHNldEludGVydmFsKGVtaXRQYXJ0aWNsZS5iaW5kKHRoaXMpLCBpbnRlcnZhbCk7XG4gICAgICAgICAgICBlbWl0dGVyLnBsYXlpbmcgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc3RvcCgpIHtcbiAgICAgICAgaWYoZW1pdHRlci5wbGF5aW5nKSB7XG4gICAgICAgICAgICBjbGVhckludGVydmFsKHRpbWVySW50ZXJ2YWwpO1xuICAgICAgICAgICAgZW1pdHRlci5wbGF5aW5nID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBlbWl0UGFydGljbGUoKSB7XG4gICAgICAgIHBhcnRpY2xlRnVuY3Rpb24oKTtcbiAgICB9XG5cbiAgICBlbWl0dGVyLnBsYXkgPSBwbGF5O1xuICAgIGVtaXR0ZXIuc3RvcCA9IHN0b3A7XG5cbiAgICByZXR1cm4gZW1pdHRlcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdyaWQoXG4gICAgY29sdW1ucyA9IDAsIHJvd3MgPSAwLCBjZWxsV2lkdGggPSAzMiwgY2VsbEhlaWdodCA9IDMyLFxuICAgIGNlbnRlckNlbGwgPSBmYWxzZSwgeE9mZnNldCA9IDAsIHlPZmZzZXQgPSAwLFxuICAgIG1ha2VTcHJpdGUgPSB1bmRlZmluZWQsXG4gICAgZXh0cmEgPSB1bmRlZmluZWRcbiAgKXtcbiAgICBsZXQgY29udGFpbmVyID0gZ3JvdXAoKTtcbiAgICBsZXQgY3JlYXRlR3JpZCA9ICgpID0+IHtcbiAgICAgICAgbGV0IGxlbmd0aCA9IGNvbHVtbnMgKiByb3dzO1xuXG4gICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgbGV0IHggPSAoaSAlIGNvbHVtbnMpICogY2VsbFdpZHRoLFxuICAgICAgICAgICAgICAgIHkgPSBNYXRoLmZsb29yKGkgLyBjb2x1bW5zKSAqIGNlbGxIZWlnaHQ7XG5cbiAgICAgICAgICAgIGxldCBzcHJpdGUgPSBtYWtlU3ByaXRlKCk7XG4gICAgICAgICAgICBjb250YWluZXIuYWRkQ2hpbGQoc3ByaXRlKTtcblxuICAgICAgICAgICAgaWYgKCFjZW50ZXJDZWxsKSB7XG4gICAgICAgICAgICAgICAgc3ByaXRlLnggPSB4ICsgeE9mZnNldDtcbiAgICAgICAgICAgICAgICBzcHJpdGUueSA9IHkgKyB5T2Zmc2V0O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzcHJpdGUueCA9IHggKyAoY2VsbFdpZHRoIC8gMikgLSBzcHJpdGUuaGFsZldpZHRoICsgeE9mZnNldDtcbiAgICAgICAgICAgICAgICBzcHJpdGUueSA9IHkgKyAoY2VsbEhlaWdodCAvIDIpIC0gc3ByaXRlLmhhbGZIZWlnaHQgKyB5T2Zmc2V0O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZXh0cmEpIGV4dHJhKHNwcml0ZSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgY3JlYXRlR3JpZCgpO1xuXG4gICAgcmV0dXJuIGNvbnRhaW5lcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRpbGluZ1Nwcml0ZSh3aWR0aCwgaGVpZ2h0LCBzb3VyY2UsIHggPSAwLCB5ID0gMCkge1xuICAgIGxldCB0aWxlV2lkdGgsIHRpbGVIZWlnaHQ7XG5cbiAgICBpZihzb3VyY2UuZnJhbWUpIHtcbiAgICAgICAgdGlsZVdpZHRoID0gc291cmNlLmZyYW1lLnc7XG4gICAgICAgIHRpbGVIZWlnaHQgPSBzb3VyY2UuZnJhbWUuaDtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aWxlV2lkdGggPSBzb3VyY2Uud2lkdGg7XG4gICAgICAgIHRpbGVIZWlnaHQgPSBzb3VyY2UuaGVpZ2h0O1xuICAgIH1cblxuICAgIGxldCBjb2x1bW5zLCByb3dzO1xuXG4gICAgaWYgKHdpZHRoID49IHRpbGVXaWR0aCkge1xuICAgICAgICBjb2x1bW5zID0gTWF0aC5yb3VuZCh3aWR0aCAvIHRpbGVXaWR0aCkgKyAxO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbHVtbnMgPSAyO1xuICAgIH1cblxuICAgIGlmIChoZWlnaHQgPj0gdGlsZUhlaWdodCkge1xuICAgICAgICByb3dzID0gTWF0aC5yb3VuZChoZWlnaHQgLyB0aWxlSGVpZ2h0KSArIDE7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm93cyA9IDI7IFxuICAgIH1cblxuICAgIGxldCB0aWxlR3JpZCA9IGdyaWQoXG4gICAgICAgIGNvbHVtbnMsIHJvd3MsIHRpbGVXaWR0aCwgdGlsZUhlaWdodCwgZmFsc2UsIDAsIDAsXG4gICAgICAgICgpID0+IHtcbiAgICAgICAgICAgIGxldCB0aWxlID0gc3ByaXRlKHNvdXJjZSk7XG4gICAgICAgICAgICByZXR1cm4gdGlsZTtcbiAgICAgICAgfVxuICAgICk7XG5cbiAgICB0aWxlR3JpZC5fdGlsZVggPSAwO1xuICAgIHRpbGVHcmlkLl90aWxlWSA9IDA7XG5cbiAgICBsZXQgY29udGFpbmVyID0gcmVjdGFuZ2xlKHdpZHRoLCBoZWlnaHQsIFwibm9uZVwiLCBcIm5vbmVcIik7XG4gICAgY29udGFpbmVyLnggPSB4O1xuICAgIGNvbnRhaW5lci55ID0geTtcblxuICAgIGNvbnRhaW5lci5tYXNrID0gdHJ1ZTtcblxuICAgIGNvbnRhaW5lci5hZGRDaGlsZCh0aWxlR3JpZCk7XG5cblxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKGNvbnRhaW5lciwge1xuICAgICAgICB0aWxlWDoge1xuICAgICAgICAgICAgZ2V0ICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGlsZUdyaWQuX3RpbGVYO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNldCAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICB0aWxlR3JpZC5jaGlsZHJlbi5mb3JFYWNoKGNoaWxkID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGRpZmZlcmVuY2UgPSB2YWx1ZSAtIHRpbGVHcmlkLl90aWxlWDtcbiAgICAgICAgICAgICAgICAgICAgY2hpbGQueCArPSBkaWZmZXJlbmNlO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkLnggPiAoY29sdW1ucyAtIDEpICogdGlsZVdpZHRoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjaGlsZC54ID0gMCAtIHRpbGVXaWR0aCArIGRpZmZlcmVuY2U7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAoY2hpbGQueCA8IDAgLSB0aWxlV2lkdGggLSBkaWZmZXJlbmNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjaGlsZC54ID0gKGNvbHVtbnMgLSAxKSAqIHRpbGVXaWR0aDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuXG5cbiAgICAgICAgICAgICAgICB0aWxlR3JpZC5fdGlsZVggPSB2YWx1ZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSxcbiAgICAgICAgdGlsZVk6IHtcbiAgICAgICAgICAgIGdldCgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGlsZUdyaWQuX3RpbGVZO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNldCh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHRpbGVHcmlkLmNoaWxkcmVuLmZvckVhY2goY2hpbGQgPT4ge1xuICAgICAgICAgICAgICAgICAgICBsZXQgZGlmZmVyZW5jZSA9IHZhbHVlIC0gdGlsZUdyaWQuX3RpbGVZO1xuICAgICAgICAgICAgICAgICAgICBjaGlsZC55ICs9IGRpZmZlcmVuY2U7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZC55ID4gKHJvd3MgLSAxKSAqIHRpbGVIZWlnaHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkLnkgPSAwIC0gdGlsZUhlaWdodCArIGRpZmZlcmVuY2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkLnkgPCAwIC0gdGlsZUhlaWdodCAtIGRpZmZlcmVuY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkLnkgPSAocm93cyAtIDEpICogdGlsZUhlaWdodDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHRpbGVHcmlkLl90aWxlWSA9IHZhbHVlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gY29udGFpbmVyO1xufVxuXG5sZXQgc3RhZ2VCYWNrZ3JvdW5kID0gdW5kZWZpbmVkO1xuXG5jbGFzcyBCYWNrZ3JvdW5kIHtcbiAgICBjb25zdHJ1Y3Rvcihzb3VyY2UsIHdpZHRoLCBoZWlnaHQsIHggPSAwLCB5ID0gMCkge1xuICAgICAgICB0aGlzLnNvdXJjZSA9IHNvdXJjZTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMud2lkdGggPSB3aWR0aDtcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgICAgIHRoaXMueCA9IHg7XG4gICAgICAgIHRoaXMueSA9IHk7XG4gICAgfVxuXG4gICAgcmVuZGVyKGN0eCkge1xuICAgICAgICBpZighdGhpcy5wYXR0ZXJuKSB7XG4gICAgICAgICAgICB0aGlzLnBhdHRlcm4gPSBjdHguY3JlYXRlUGF0dGVybih0aGlzLnNvdXJjZSwgXCJyZXBlYXRcIik7XG4gICAgICAgIH1cbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9IHRoaXMucGF0dGVybjtcblxuICAgICAgICBjdHgudHJhbnNsYXRlKHRoaXMueCwgdGhpcy55KTtcbiAgICAgICAgY3R4LmZpbGxSZWN0KC10aGlzLngsIC10aGlzLnksIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcbiAgICAgICAgY3R4LnRyYW5zbGF0ZSgtdGhpcy54LCAtdGhpcy55KTtcbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiYWNrZ3JvdW5kKHNvdXJjZSwgd2lkdGgsIGhlaWdodCwgeCwgeSkge1xuICAgIHN0YWdlQmFja2dyb3VuZCA9IG5ldyBCYWNrZ3JvdW5kKHNvdXJjZSwgd2lkdGgsIGhlaWdodCwgeCwgeSk7XG4gICAgcmV0dXJuIHN0YWdlQmFja2dyb3VuZDtcbn0iLCJleHBvcnQgZnVuY3Rpb24ga2V5Ym9hcmQoa2V5Q29kZSkge1xuICAgIGxldCBrZXkgPSB7fTtcbiAgICBrZXkuY29kZSA9IGtleUNvZGU7XG4gICAga2V5LmlzRG93biA9IGZhbHNlO1xuICAgIGtleS5pc1VwID0gdHJ1ZTtcbiAgICBrZXkucHJlc3MgPSB1bmRlZmluZWQ7XG4gICAga2V5LnJlbGVhc2UgPSB1bmRlZmluZWQ7XG5cbiAgICBrZXkuZG93bkhhbmRsZXIgPSBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBpZihldmVudC5rZXlDb2RlID09PSBrZXkuY29kZSkge1xuICAgICAgICAgICAgaWYoa2V5LmlzVXAgJiYga2V5LnByZXNzKSBrZXkucHJlc3MoKTtcbiAgICAgICAgICAgIGtleS5pc0Rvd24gPSB0cnVlO1xuICAgICAgICAgICAga2V5LmlzVXAgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH07XG5cbiAgICBrZXkudXBIYW5kbGVyID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgaWYoZXZlbnQua2V5Q29kZSA9PT0ga2V5LmNvZGUpIHtcbiAgICAgICAgICAgIGlmKGtleS5pc0Rvd24gJiYga2V5LnJlbGVhc2UpIGtleS5yZWxlYXNlKCk7XG4gICAgICAgICAgICBrZXkuaXNEb3duID0gZmFsc2U7XG4gICAgICAgICAgICBrZXkuaXNVcCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICB9O1xuXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIGtleS5kb3duSGFuZGxlci5iaW5kKGtleSksIGZhbHNlKTtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImtleXVwXCIsIGtleS51cEhhbmRsZXIuYmluZChrZXkpLCBmYWxzZSk7XG5cbiAgICByZXR1cm4ga2V5O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFrZVBvaW50ZXIoZWxlbWVudCwgc2NhbGUgPSAxKSB7XG4gICAgbGV0IHBvaW50ZXIgPSB7XG4gICAgICAgIGVsZW1lbnQ6IGVsZW1lbnQsXG4gICAgICAgIHNjYWxlOiBzY2FsZSxcblxuICAgICAgICBfeDogMCxcbiAgICAgICAgX3k6IDAsXG5cbiAgICAgICAgZ2V0IHgoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5feCAvIHRoaXMuc2NhbGU7XG4gICAgICAgIH0sXG4gICAgICAgIGdldCB5KCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3kgLyB0aGlzLnNjYWxlO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldCBjZW50ZXJYKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMueDtcbiAgICAgICAgfSxcbiAgICAgICAgZ2V0IGNlbnRlclkoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy55O1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldCBwb3NpdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB7eDogdGhpcy54LCB5OiB0aGlzLnl9O1xuICAgICAgICB9LFxuXG4gICAgICAgIGlzRG93bjogZmFsc2UsXG4gICAgICAgIGlzVXA6IHRydWUsXG4gICAgICAgIHRhcHBlZDogZmFsc2UsXG5cbiAgICAgICAgZG93blRpbWU6IDAsXG4gICAgICAgIGVsYXBzZWRUaW1lOiAwLFxuXG4gICAgICAgIHByZXNzOiB1bmRlZmluZWQsXG4gICAgICAgIHJlbGVhc2U6IHVuZGVmaW5lZCxcbiAgICAgICAgdGFwOiB1bmRlZmluZWQsXG5cbiAgICAgICAgZHJhZ1Nwcml0ZTogbnVsbCxcbiAgICAgICAgZHJhZ09mZnNldFg6IDAsXG4gICAgICAgIGRyYWdPZmZzZXRZOiAwLFxuXG4gICAgICAgIG1vdmVIYW5kbGVyIChldmVudCkge1xuICAgICAgICAgICAgbGV0IGVsZW1lbnQgPSBldmVudC50YXJnZXQ7XG5cbiAgICAgICAgICAgIHRoaXMuX3ggPSAoZXZlbnQucGFnZVggLSBlbGVtZW50Lm9mZnNldExlZnQpO1xuICAgICAgICAgICAgdGhpcy5feSA9IChldmVudC5wYWdlWSAtIGVsZW1lbnQub2Zmc2V0VG9wKTtcblxuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfSxcblxuICAgICAgICB0b3VjaE1vdmVIYW5kbGVyIChldmVudCkge1xuICAgICAgICAgICAgbGV0IGVsZW1lbnQgPSBldmVudC50YXJnZXQ7XG5cbiAgICAgICAgICAgIHRoaXMuX3ggPSAoZXZlbnQudGFyZ2V0VG91Y2hlc1swXS5wYWdlWCAtIGVsZW1lbnQub2Zmc2V0TGVmdCk7XG4gICAgICAgICAgICB0aGlzLl95ID0gKGV2ZW50LnRhcmdldFRvdWNoZXNbMF0ucGFnZVkgLSBlbGVtZW50Lm9mZnNldFRvcCk7XG5cbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZG93bkhhbmRsZXIgKGV2ZW50KSB7XG4gICAgICAgICAgICB0aGlzLmlzRG93biA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLmlzVXAgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMudGFwcGVkID0gZmFsc2U7XG5cbiAgICAgICAgICAgIHRoaXMuZG93blRpbWUgPSBEYXRlLm5vdygpO1xuXG4gICAgICAgICAgICBpZih0aGlzLnByZXNzKSB0aGlzLnByZXNzKCk7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHRvdWNoU3RhcnRIYW5kbGVyIChldmVudCkge1xuICAgICAgICAgICAgbGV0IGVsZW1lbnQgPSBldmVudC50YXJnZXQ7XG5cbiAgICAgICAgICAgIHRoaXMuX3ggPSBldmVudC50YXJnZXRUb3VjaGVzWzBdLnBhZ2VYIC0gZWxlbWVudC5vZmZzZXRMZWZ0O1xuICAgICAgICAgICAgdGhpcy5feSA9IGV2ZW50LnRhcmdldFRvdWNoZXNbMF0ucGFnZVkgLSBlbGVtZW50Lm9mZnNldFRvcDtcblxuICAgICAgICAgICAgdGhpcy5pc0Rvd24gPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5pc1VwID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLnRhcHBlZCA9IGZhbHNlO1xuXG4gICAgICAgICAgICB0aGlzLmRvd25UaW1lID0gRGF0ZS5ub3coKTtcblxuICAgICAgICAgICAgaWYodGhpcy5wcmVzcykgdGhpcy5wcmVzcygpO1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfSxcblxuICAgICAgICB1cEhhbmRsZXIgKGV2ZW50KSB7XG4gICAgICAgICAgICB0aGlzLmVsYXBzZWRUaW1lID0gTWF0aC5hYnModGhpcy5kb3duVGltZSAtIERhdGUubm93KCkpO1xuICAgICAgICAgICAgaWYodGhpcy5lbGFwc2VkVGltZSA8PSAyMDAgJiYgdGhpcy50YXBwZWQgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50YXBwZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGlmKHRoaXMudGFwKSB0aGlzLnRhcCgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLmlzVXAgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5pc0Rvd24gPSBmYWxzZTtcblxuICAgICAgICAgICAgaWYodGhpcy5yZWxlYXNlKSB0aGlzLnJlbGVhc2UoKVxuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfSxcblxuICAgICAgICB0b3VjaEVuZEhhbmRsZXIgKGV2ZW50KSB7XG4gICAgICAgICAgICB0aGlzLmVsYXBzZWRUaW1lID0gTWF0aC5hYnModGhpcy5kb3duVGltZSAtIERhdGUubm93KCkpO1xuXG4gICAgICAgICAgICBpZih0aGlzLmVsYXBzZWRUaW1lIDw9IDIwMCAmJiB0aGlzLnRhcHBlZCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRhcHBlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgaWYodGhpcy50YXApIHRoaXMudGFwKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuaXNVcCA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLmlzRG93biA9IGZhbHNlO1xuXG4gICAgICAgICAgICBpZih0aGlzLnJlbGVhc2UpIHRoaXMucmVsZWFzZSgpO1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBoaXRUZXN0U3ByaXRlIChzcHJpdGUpIHtcbiAgICAgICAgICAgIGxldCBoaXQgPSBmYWxzZTtcblxuICAgICAgICAgICAgaWYoIXNwcml0ZS5jaXJjdWxhcikge1xuICAgICAgICAgICAgICAgIGxldCBsZWZ0ID0gc3ByaXRlLmd4LFxuICAgICAgICAgICAgICAgICAgICByaWdodCA9IHNwcml0ZS5neCArIHNwcml0ZS53aWR0aCxcbiAgICAgICAgICAgICAgICAgICAgdG9wID0gc3ByaXRlLmd5LFxuICAgICAgICAgICAgICAgICAgICBib3R0b20gPSBzcHJpdGUuZ3kgKyBzcHJpdGUuaGVpZ2h0O1xuXG4gICAgICAgICAgICAgICAgaGl0ID0gdGhpcy54ID4gbGVmdCAmJiB0aGlzLnggPCByaWdodFxuICAgICAgICAgICAgICAgICAgICAmJiB0aGlzLnkgPiB0b3AgJiYgdGhpcy55IDwgYm90dG9tO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsZXQgdnggPSB0aGlzLnggLSAoc3ByaXRlLmd4ICsgc3ByaXRlLnJhZGl1cyksXG4gICAgICAgICAgICAgICAgICAgIHZ5ID0gdGhpcy55IC0gKHNwcml0ZS5neSArIHNwcml0ZS5yYWRpdXMpLFxuICAgICAgICAgICAgICAgICAgICBkaXN0YW5jZSA9IE1hdGguc3FydCh2eCAqIHZ4ICsgdnkgKiB2eSk7XG5cbiAgICAgICAgICAgICAgICBoaXQgPSBkaXN0YW5jZSA8IHNwcml0ZS5yYWRpdXM7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBoaXQ7XG4gICAgICAgIH0sXG5cbiAgICAgICAgdXBkYXRlRHJhZ0FuZERyb3AgKHNwcml0ZSkge1xuICAgICAgICAgICAgaWYodGhpcy5pc0Rvd24pIHtcbiAgICAgICAgICAgICAgICBpZih0aGlzLmRyYWdTcHJpdGUgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yKGxldCBpID0gZHJhZ2dhYmxlU3ByaXRlcy5sZW5ndGgtMTsgaSA+IC0xOyBpLS0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBzcHJpdGUgPSBkcmFnZ2FibGVTcHJpdGVzW2ldO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZih0aGlzLmhpdFRlc3RTcHJpdGUoc3ByaXRlKSAmJiBzcHJpdGUuZHJhZ2dhYmxlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmFnT2Zmc2V0WCA9IHRoaXMueCAtIHNwcml0ZS5neDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYWdPZmZzZXRZID0gdGhpcy55IC0gc3ByaXRlLmd5O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmFnU3ByaXRlID0gc3ByaXRlO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmVvcmRlciBzcHJpdGVzIHRvIGRpc3BsYXkgZHJhZ2dlZCBzcHJpdGUgYWJvdmUgYWxsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNoaWxkcmVuID0gc3ByaXRlLnBhcmVudC5jaGlsZHJlbjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZHJlbi5zcGxpY2UoY2hpbGRyZW4uaW5kZXhPZihzcHJpdGUpLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZHJlbi5wdXNoKHNwcml0ZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyByZW9yZGVyIGRyYWdnYWJsZVNwcml0ZXMgaW4gdGhlIHNhbWUgd2F5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZHJhZ2dhYmxlU3ByaXRlcy5zcGxpY2UoZHJhZ2dhYmxlU3ByaXRlcy5pbmRleE9mKHNwcml0ZSksIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRyYWdnYWJsZVNwcml0ZXMucHVzaChzcHJpdGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmFnU3ByaXRlLnggPSB0aGlzLnggLSB0aGlzLmRyYWdPZmZzZXRYO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYWdTcHJpdGUueSA9IHRoaXMueSAtIHRoaXMuZHJhZ09mZnNldFk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZih0aGlzLmlzVXApIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRyYWdTcHJpdGUgPSBudWxsO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBjaGFuZ2UgY3Vyc29yIHRvIGhhbmQgaWYgaXQncyBvdmVyIGRyYWdnYWJsZSBzcHJpdGVzXG4gICAgICAgICAgICBkcmFnZ2FibGVTcHJpdGVzLnNvbWUoc3ByaXRlID0+IHtcbiAgICAgICAgICAgICAgICBpZih0aGlzLmhpdFRlc3RTcHJpdGUoc3ByaXRlKSAmJiBzcHJpdGUuZHJhZ2dhYmxlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVudC5zdHlsZS5jdXJzb3IgPSBcInBvaW50ZXJcIjtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbGVtZW50LnN0eWxlLmN1cnNvciA9IFwiYXV0b1wiO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICBcIm1vdXNlbW92ZVwiLCBwb2ludGVyLm1vdmVIYW5kbGVyLmJpbmQocG9pbnRlciksIGZhbHNlXG4gICAgKTtcblxuICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgXCJtb3VzZWRvd25cIiwgcG9pbnRlci5kb3duSGFuZGxlci5iaW5kKHBvaW50ZXIpLCBmYWxzZVxuICAgICk7XG5cbiAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICAgIFwibW91c2V1cFwiLCBwb2ludGVyLnVwSGFuZGxlci5iaW5kKHBvaW50ZXIpLCBmYWxzZVxuICAgICk7XG5cbiAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICAgIFwidG91Y2htb3ZlXCIsIHBvaW50ZXIudG91Y2hNb3ZlSGFuZGxlci5iaW5kKHBvaW50ZXIpLCBmYWxzZVxuICAgICk7XG5cbiAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICAgIFwidG91Y2hzdGFydFwiLCBwb2ludGVyLnRvdWNoU3RhcnRIYW5kbGVyLmJpbmQocG9pbnRlciksIGZhbHNlXG4gICAgKTtcblxuICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgXCJ0b3VjaGVuZFwiLCBwb2ludGVyLnRvdWNoRW5kSGFuZGxlci5iaW5kKHBvaW50ZXIpLCBmYWxzZVxuICAgICk7XG5cbiAgICBlbGVtZW50LnN0eWxlLnRvdWNoQWN0aW9uID0gXCJub25lXCI7XG5cbiAgICByZXR1cm4gcG9pbnRlcjtcbn0iLCJsZXQgYWN0eCA9IG5ldyBBdWRpb0NvbnRleHQoKTtcclxuXHJcbmNsYXNzIFNvdW5kIHtcclxuICAgIGNvbnN0cnVjdG9yKHNvdXJjZSwgbG9hZEhhbmRsZXIpIHtcclxuICAgICAgICB0aGlzLnNvdXJjZSA9IHNvdXJjZTtcclxuICAgICAgICB0aGlzLmxvYWRIYW5kbGVyID0gbG9hZEhhbmRsZXI7XHJcblxyXG4gICAgICAgIHRoaXMuYWN0eCA9IGFjdHg7XHJcbiAgICAgICAgdGhpcy52b2x1bWVOb2RlID0gdGhpcy5hY3R4LmNyZWF0ZUdhaW4oKTtcclxuICAgICAgICB0aGlzLnBhbk5vZGUgPSB0aGlzLmFjdHguY3JlYXRlU3RlcmVvUGFubmVyKCk7XHJcbiAgICAgICAgdGhpcy5zb3VuZE5vZGUgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuYnVmZmVyID0gbnVsbDtcclxuICAgICAgICB0aGlzLmxvb3AgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLnBsYXlpbmcgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy5wYW5WYWx1ZSA9IDA7XHJcbiAgICAgICAgdGhpcy52b2x1bWVWYWx1ZSA9IDE7XHJcblxyXG4gICAgICAgIHRoaXMuc3RhcnRUaW1lID0gMDtcclxuICAgICAgICB0aGlzLnN0YXJ0T2Zmc2V0ID0gMDtcclxuXHJcbiAgICAgICAgdGhpcy5sb2FkKCk7XHJcbiAgICB9XHJcblxyXG4gICAgbG9hZCgpIHtcclxuICAgICAgICBsZXQgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XHJcbiAgICAgICAgeGhyLm9wZW4oXCJHRVRcIiwgdGhpcy5zb3VyY2UsIHRydWUpO1xyXG4gICAgICAgIHhoci5yZXNwb25zZVR5cGUgPSBcImFycmF5YnVmZmVyXCI7XHJcbiAgICAgICAgeGhyLmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5hY3R4LmRlY29kZUF1ZGlvRGF0YShcclxuICAgICAgICAgICAgICAgIHhoci5yZXNwb25zZSxcclxuICAgICAgICAgICAgICAgIGJ1ZmZlciA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5idWZmZXIgPSBidWZmZXI7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5oYXNMb2FkZWQgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZih0aGlzLmxvYWRIYW5kbGVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubG9hZEhhbmRsZXIoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZXJyb3IgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkF1ZGlvIGNvdWxkIG5vdCBiZSBkZWNvZGVkOiBcIitlcnJvcik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIClcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgeGhyLnNlbmQoKTtcclxuICAgIH1cclxuXHJcbiAgICBwbGF5KCkge1xyXG4gICAgICAgIHRoaXMuc3RhcnRUaW1lID0gdGhpcy5hY3R4LmN1cnJlbnRUaW1lO1xyXG4gICAgICAgIHRoaXMuc291bmROb2RlID0gdGhpcy5hY3R4LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpO1xyXG5cclxuICAgICAgICB0aGlzLnNvdW5kTm9kZS5idWZmZXIgPSB0aGlzLmJ1ZmZlcjtcclxuXHJcbiAgICAgICAgdGhpcy5zb3VuZE5vZGUuY29ubmVjdCh0aGlzLnZvbHVtZU5vZGUpO1xyXG4gICAgICAgIHRoaXMudm9sdW1lTm9kZS5jb25uZWN0KHRoaXMucGFuTm9kZSk7XHJcbiAgICAgICAgdGhpcy5wYW5Ob2RlLmNvbm5lY3QodGhpcy5hY3R4LmRlc3RpbmF0aW9uKTtcclxuXHJcbiAgICAgICAgdGhpcy5zb3VuZE5vZGUubG9vcCA9IHRoaXMubG9vcDtcclxuXHJcbiAgICAgICAgdGhpcy5zb3VuZE5vZGUuc3RhcnQoXHJcbiAgICAgICAgICAgIHRoaXMuc3RhcnRUaW1lLFxyXG4gICAgICAgICAgICB0aGlzLnN0YXJ0T2Zmc2V0ICUgdGhpcy5idWZmZXIuZHVyYXRpb25cclxuICAgICAgICApO1xyXG5cclxuICAgICAgICB0aGlzLnBsYXlpbmcgPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIHBhdXNlKCkge1xyXG4gICAgICAgIGlmKHRoaXMucGxheWluZykge1xyXG4gICAgICAgICAgICB0aGlzLnNvdW5kTm9kZS5zdG9wKHRoaXMuYWN0eC5jdXJyZW50VGltZSk7XHJcbiAgICAgICAgICAgIHRoaXMuc3RhcnRPZmZzZXQgKz0gdGhpcy5hY3R4LmN1cnJlbnRUaW1lIC0gdGhpcy5zdGFydFRpbWU7XHJcbiAgICAgICAgICAgIHRoaXMucGxheWluZyA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXN0YXJ0KCkge1xyXG4gICAgICAgIGlmKHRoaXMucGxheWluZykge1xyXG4gICAgICAgICAgICB0aGlzLnNvdW5kTm9kZS5zdG9wKHRoaXMuYWN0eC5jdXJyZW50VGltZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc3RhcnRPZmZzZXQgPSAwO1xyXG4gICAgICAgIHRoaXMucGxheSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHBsYXlGcm9tKHZhbHVlKSB7XHJcbiAgICAgICAgaWYodGhpcy5wbGF5aW5nKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc291bmROb2RlLnN0b3AodGhpcy5hY3R4LmN1cnJlbnRUaW1lKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zdGFydE9mZnNldCA9IHZhbHVlO1xyXG4gICAgICAgIHRoaXMucGxheSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCB2b2x1bWUoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudm9sdW1lVmFsdWU7XHJcbiAgICB9XHJcbiAgICBzZXQgdm9sdW1lKHZhbHVlKSB7XHJcbiAgICAgICAgdGhpcy52b2x1bWVOb2RlLmdhaW4udmFsdWUgPSB2YWx1ZTtcclxuICAgICAgICB0aGlzLnZvbHVtZVZhbHVlID0gdmFsdWU7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHBhbigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5wYW5WYWx1ZTtcclxuICAgIH1cclxuICAgIHNldCBwYW4odmFsdWUpIHtcclxuICAgICAgICB0aGlzLnBhbk5vZGUucGFuLnZhbHVlID0gdmFsdWU7XHJcbiAgICAgICAgdGhpcy5wYW5WYWx1ZSA9IHZhbHVlO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gbWFrZVNvdW5kKHNvdXJjZSwgbG9hZEhhbmRsZXIpIHtcclxuICAgIHJldHVybiBuZXcgU291bmQoc291cmNlLCBsb2FkSGFuZGxlcik7XHJcbn0iLCJpbXBvcnQge21ha2VTb3VuZH0gZnJvbSBcIi4vc291bmRcIjtcblxuZXhwb3J0IGxldCBhc3NldHMgPSB7XG4gICAgdG9Mb2FkOiAwLFxuICAgIGxvYWRlZDogMCxcblxuICAgIGltYWdlRXh0ZW5zaW9uczogW1wicG5nXCIsIFwianBnXCIsIFwiZ2lmXCJdLFxuICAgIGZvbnRFeHRlbnNpb25zOiBbXCJ0dGZcIiwgXCJvdGZcIiwgXCJ0dGNcIiwgXCJ3b2ZmXCJdLFxuICAgIGpzb25FeHRlbnNpb25zOiBbXCJqc29uXCJdLFxuICAgIGF1ZGlvRXh0ZW5zaW9uczogW1wibXAzXCIsIFwib2dnXCIsIFwid2F2XCIsIFwid2VibVwiXSxcblxuICAgIC8vIEFQSVxuICAgIGxvYWQoc291cmNlcykge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICAgICAgICBsZXQgbG9hZEhhbmRsZXIgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2FkZWQgKz0gMTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh0aGlzLmxvYWRlZCk7XG5cbiAgICAgICAgICAgICAgICBpZih0aGlzLnRvTG9hZCA9PT0gdGhpcy5sb2FkZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2FkZWQgPSAwO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRvTG9hZCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiQXNzZXRzIGxvYWRlZCFcIik7XG5cbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiTG9hZGluZyBhc3NldHMuLi5cIik7XG5cbiAgICAgICAgICAgIHRoaXMudG9Mb2FkID0gc291cmNlcy5sZW5ndGg7XG5cbiAgICAgICAgICAgIHNvdXJjZXMuZm9yRWFjaChzb3VyY2UgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBleHRlbnNpb24gPSBzb3VyY2Uuc3BsaXQoJy4nKS5wb3AoKTtcblxuICAgICAgICAgICAgICAgIGlmKHRoaXMuaW1hZ2VFeHRlbnNpb25zLmluZGV4T2YoZXh0ZW5zaW9uKSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2FkSW1hZ2Uoc291cmNlLCBsb2FkSGFuZGxlcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYodGhpcy5mb250RXh0ZW5zaW9ucy5pbmRleE9mKGV4dGVuc2lvbikgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9hZEZvbnQoc291cmNlLCBsb2FkSGFuZGxlcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYodGhpcy5qc29uRXh0ZW5zaW9ucy5pbmRleE9mKGV4dGVuc2lvbikgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9hZEpzb24oc291cmNlLCBsb2FkSGFuZGxlcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYodGhpcy5hdWRpb0V4dGVuc2lvbnMuaW5kZXhPZihleHRlbnNpb24pICE9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvYWRTb3VuZChzb3VyY2UsIGxvYWRIYW5kbGVyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRmlsZSB0eXBlIG5vdCByZWNvZ25pemVkOiBcIiArIHNvdXJjZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBsb2FkSW1hZ2Uoc291cmNlLCBsb2FkSGFuZGxlcikge1xuICAgICAgICBsZXQgaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgaW1hZ2UuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgbG9hZEhhbmRsZXIsIGZhbHNlKTtcbiAgICAgICAgdGhpc1tzb3VyY2VdID0gaW1hZ2U7XG4gICAgICAgIGltYWdlLnNyYyA9IHNvdXJjZTtcbiAgICB9LFxuXG4gICAgbG9hZEZvbnQoc291cmNlLCBsb2FkSGFuZGxlcikge1xuICAgICAgICBsZXQgZm9udEZhbWlseSA9IHNvdXJjZS5zcGxpdCgnLycpLnBvcCgpLnNwbGl0KCcuJylbMF07XG5cbiAgICAgICAgbGV0IG5ld1N0eWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInN0eWxlXCIpO1xuICAgICAgICBsZXQgZm9udEZhY2UgPSBcbiAgICAgICAgICAgICAgICBcIkBmb250LWZhY2Uge2ZvbnQtZmFtaWx5OiAnXCIgKyBmb250RmFtaWx5ICsgXCInOyBzcmM6IHVybCgnXCIgKyBzb3VyY2UgKyBcIicpO31cIjtcbiAgICAgICAgXG4gICAgICAgIG5ld1N0eWxlLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGZvbnRGYWNlKSk7XG4gICAgICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQobmV3U3R5bGUpO1xuXG4gICAgICAgIGxvYWRIYW5kbGVyKCk7XG4gICAgfSxcblxuICAgIGxvYWRKc29uKHNvdXJjZSwgbG9hZEhhbmRsZXIpIHtcbiAgICAgICAgbGV0IHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgICAgICB4aHIub3BlbihcIkdFVFwiLCBzb3VyY2UsIHRydWUpO1xuICAgICAgICB4aHIucmVzcG9uc2VUeXBlID0gXCJ0ZXh0XCI7XG5cbiAgICAgICAgeGhyLm9ubG9hZCA9IGV2ZW50ID0+IHtcbiAgICAgICAgICAgIGlmKHhoci5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICAgICAgICAgIGxldCBmaWxlID0gSlNPTi5wYXJzZSh4aHIucmVzcG9uc2VUZXh0KTtcbiAgICAgICAgICAgICAgICBmaWxlLm5hbWUgPSBzb3VyY2U7XG4gICAgICAgICAgICAgICAgdGhpc1tmaWxlLm5hbWVdID0gZmlsZTtcblxuICAgICAgICAgICAgICAgIGlmKGZpbGUuc3ByaXRlcykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZVNwcml0ZVNoZWV0KGZpbGUsIHNvdXJjZSwgbG9hZEhhbmRsZXIpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGxvYWRIYW5kbGVyKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHhoci5zZW5kKCk7XG4gICAgfSxcblxuICAgIGNyZWF0ZVNwcml0ZVNoZWV0KGZpbGUsIHNvdXJjZSwgbG9hZEhhbmRsZXIpIHtcbiAgICAgICAgbGV0IGJhc2VVcmwgPSBzb3VyY2UucmVwbGFjZSgvW14vXSokLywgXCJcIik7XG4gICAgICAgIGxldCBpbWFnZVNvdXJjZSA9IGJhc2VVcmwgKyBmaWxlLmltYWdlUGF0aDtcblxuICAgICAgICBsZXQgaW1hZ2VMb2FkSGFuZGxlciA9ICgpID0+IHtcbiAgICAgICAgICAgIHRoaXNbaW1hZ2VTb3VyY2VdID0gaW1hZ2U7XG5cbiAgICAgICAgICAgIE9iamVjdC5rZXlzKGZpbGUuc3ByaXRlcykuZm9yRWFjaChzcHJpdGUgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXNbc3ByaXRlXSA9IGZpbGUuc3ByaXRlc1tzcHJpdGVdO1xuICAgICAgICAgICAgICAgIHRoaXNbc3ByaXRlXS5zb3VyY2UgPSBpbWFnZTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBsb2FkSGFuZGxlcigpO1xuICAgICAgICB9O1xuXG4gICAgICAgIGxldCBpbWFnZSA9IG5ldyBJbWFnZSgpO1xuICAgICAgICBpbWFnZS5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCBpbWFnZUxvYWRIYW5kbGVyLCBmYWxzZSk7XG4gICAgICAgIGltYWdlLnNyYyA9IGltYWdlU291cmNlO1xuICAgIH0sXG5cbiAgICBsb2FkU291bmQoc291cmNlLCBsb2FkSGFuZGxlcikge1xuICAgICAgICBsZXQgc291bmQgPSBtYWtlU291bmQoc291cmNlLCBsb2FkSGFuZGxlcik7XG5cbiAgICAgICAgc291bmQubmFtZSA9IHNvdXJjZTtcbiAgICAgICAgdGhpc1tzb3VuZC5uYW1lXSA9IHNvdW5kO1xuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbnRhaW4oc3ByaXRlLCBib3VuZHMsIGJvdW5jZSA9IGZhbHNlLCBleHRyYSA9IHVuZGVmaW5lZCkge1xuICAgIGxldCB4ID0gYm91bmRzLngsXG4gICAgICAgIHkgPSBib3VuZHMueSxcbiAgICAgICAgd2lkdGggPSBib3VuZHMud2lkdGgsXG4gICAgICAgIGhlaWdodCA9IGJvdW5kcy5oZWlnaHQ7XG5cbiAgICBsZXQgY29sbGlzaW9uO1xuXG4gICAgaWYoc3ByaXRlLnggPCB4KSB7XG4gICAgICAgIGlmKGJvdW5jZSkgc3ByaXRlLnZ4ICo9IC0xO1xuICAgICAgICBpZihzcHJpdGUubWFzcykgc3ByaXRlLnZ4IC89IHNwcml0ZS5tYXNzO1xuXG4gICAgICAgIHNwcml0ZS54ID0geDtcbiAgICAgICAgY29sbGlzaW9uID0gXCJsZWZ0XCI7XG4gICAgfVxuXG4gICAgaWYoc3ByaXRlLnkgPCB5KSB7XG4gICAgICAgIGlmKGJvdW5jZSkgc3ByaXRlLnZ5ICo9IC0xO1xuICAgICAgICBpZihzcHJpdGUubWFzcykgc3ByaXRlLnZ5IC89IHNwcml0ZS5tYXNzO1xuXG4gICAgICAgIHNwcml0ZS55ID0geTtcbiAgICAgICAgY29sbGlzaW9uID0gXCJ0b3BcIjtcbiAgICB9XG5cbiAgICBpZihzcHJpdGUueCArIHNwcml0ZS53aWR0aCA+IHdpZHRoKSB7XG4gICAgICAgIGlmKGJvdW5jZSkgc3ByaXRlLnZ4ICo9IC0xO1xuICAgICAgICBpZihzcHJpdGUubWFzcykgc3ByaXRlLnZ4IC89IHNwcml0ZS5tYXNzO1xuXG4gICAgICAgIHNwcml0ZS54ID0gd2lkdGggLSBzcHJpdGUud2lkdGg7XG4gICAgICAgIGNvbGxpc2lvbiA9IFwicmlnaHRcIjtcbiAgICB9XG5cbiAgICBpZihzcHJpdGUueSArIHNwcml0ZS5oZWlnaHQgPiBoZWlnaHQpIHtcbiAgICAgICAgaWYoYm91bmNlKSBzcHJpdGUudnkgKj0gLTE7XG4gICAgICAgIGlmKHNwcml0ZS5tYXNzKSBzcHJpdGUudnkgLz0gc3ByaXRlLm1hc3M7XG5cbiAgICAgICAgc3ByaXRlLnkgPSBoZWlnaHQgLSBzcHJpdGUuaGVpZ2h0O1xuICAgICAgICBjb2xsaXNpb24gPSBcImJvdHRvbVwiO1xuICAgIH1cblxuICAgIGlmKGNvbGxpc2lvbiAmJiBleHRyYSkgZXh0cmEoY29sbGlzaW9uKTtcblxuICAgIHJldHVybiBjb2xsaXNpb247XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBvdXRzaWRlQm91bmRzKHNwcml0ZSwgYm91bmRzLCBleHRyYSA9IHVuZGVmaW5lZCkge1xuICAgIGxldCB4ID0gYm91bmRzLngsXG4gICAgICAgIHkgPSBib3VuZHMueSxcbiAgICAgICAgd2lkdGggPSBib3VuZHMud2lkdGgsXG4gICAgICAgIGhlaWdodCA9IGJvdW5kcy5oZWlnaHQ7XG5cbiAgICBsZXQgY29sbGlzaW9uO1xuXG4gICAgaWYoc3ByaXRlLnggPCB4IC0gc3ByaXRlLndpZHRoKSB7XG4gICAgICAgIGNvbGxpc2lvbiA9IFwibGVmdFwiO1xuICAgIH1cbiAgICBpZihzcHJpdGUueSA8IHkgLSBzcHJpdGUuaGVpZ2h0KSB7XG4gICAgICAgIGNvbGxpc2lvbiA9IFwidG9wXCI7XG4gICAgfVxuICAgIGlmKHNwcml0ZS54ID4gd2lkdGgpIHtcbiAgICAgICAgY29sbGlzaW9uID0gXCJyaWdodFwiO1xuICAgIH1cbiAgICBpZihzcHJpdGUueSA+IGhlaWdodCkge1xuICAgICAgICBjb2xsaXNpb24gPSBcImJvdHRvbVwiO1xuICAgIH1cblxuICAgIGlmKGNvbGxpc2lvbiAmJiBleHRyYSkgZXh0cmEoY29sbGlzaW9uKTtcblxuICAgIHJldHVybiBjb2xsaXNpb247XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3cmFwKHNwcml0ZSwgYm91bmRzKSB7XG4gICAgbGV0IHdpZHRoID0gYm91bmRzLndpZHRoLFxuICAgICAgICBoZWlnaHQgPSBib3VuZHMuaGVpZ2h0O1xuXG4gICAgaWYoc3ByaXRlLnggKyBzcHJpdGUud2lkdGggPCAwKSB7XG4gICAgICAgIHNwcml0ZS54ID0gd2lkdGg7XG4gICAgfVxuICAgIGlmKHNwcml0ZS55ICsgc3ByaXRlLmhlaWdodCA8IDApIHtcbiAgICAgICAgc3ByaXRlLnkgPSBoZWlnaHQ7XG4gICAgfVxuICAgIGlmKHNwcml0ZS54IC0gc3ByaXRlLndpZHRoID4gd2lkdGgpIHtcbiAgICAgICAgc3ByaXRlLnggPSAtc3ByaXRlLndpZHRoO1xuICAgIH1cbiAgICBpZihzcHJpdGUueSAtIHNwcml0ZS5oZWlnaHQgPiBoZWlnaHQpIHtcbiAgICAgICAgc3ByaXRlLnkgPSAtc3ByaXRlLmhlaWdodDtcbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjYXB0dXJlUHJldmlvdXNQb3NpdGlvbnMoc3RhZ2UpIHtcbiAgICBzdGFnZS5jaGlsZHJlbi5mb3JFYWNoKHNwcml0ZSA9PiB7XG4gICAgICAgIHNldFByZXZpb3VzUG9zaXRpb24oc3ByaXRlKTtcbiAgICB9KTtcblxuICAgIGZ1bmN0aW9uIHNldFByZXZpb3VzUG9zaXRpb24oc3ByaXRlKSB7XG4gICAgICAgIHNwcml0ZS5wcmV2aW91c1ggPSBzcHJpdGUueDtcbiAgICAgICAgc3ByaXRlLnByZXZpb3VzWSA9IHNwcml0ZS55O1xuXG4gICAgICAgIGlmKHNwcml0ZS5jaGlsZHJlbiAmJiBzcHJpdGUuY2hpbGRyZW4ubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgc3ByaXRlLmNoaWxkcmVuLmZvckVhY2goY2hpbGQgPT4ge1xuICAgICAgICAgICAgICAgIHNldFByZXZpb3VzUG9zaXRpb24oY2hpbGQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkaXN0YW5jZShzMSwgczIpIHtcbiAgICBsZXQgdnggPSBzMi5jZW50ZXJYIC0gczEuY2VudGVyWCxcbiAgICAgICAgdnkgPSBzMi5jZW50ZXJZIC0gczEuY2VudGVyWTtcbiAgICBcbiAgICByZXR1cm4gTWF0aC5zcXJ0KHZ4ICogdnggKyB2eSAqIHZ5KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZvbGxvd0Vhc2UoZm9sbG93ZXIsIGxlYWRlciwgc3BlZWQpIHtcbiAgICBsZXQgdnggPSBsZWFkZXIuY2VudGVyWCAtIGZvbGxvd2VyLmNlbnRlclgsXG4gICAgICAgIHZ5ID0gbGVhZGVyLmNlbnRlclkgLSBmb2xsb3dlci5jZW50ZXJZLFxuICAgICAgICBkaXN0YW5jZSA9IE1hdGguc3FydCh2eCAqIHZ4ICsgdnkgKiB2eSk7XG4gICAgaWYoZGlzdGFuY2UgPj0gMSkge1xuICAgICAgICBmb2xsb3dlci54ICs9IHZ4ICogc3BlZWQ7XG4gICAgICAgIGZvbGxvd2VyLnkgKz0gdnkgKiBzcGVlZDtcbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmb2xsb3dDb25zdGFudChmb2xsb3dlciwgbGVhZGVyLCBzcGVlZCkge1xuICAgIGxldCB2eCA9IGxlYWRlci5jZW50ZXJYIC0gZm9sbG93ZXIuY2VudGVyWCxcbiAgICAgICAgdnkgPSBsZWFkZXIuY2VudGVyWSAtIGZvbGxvd2VyLmNlbnRlclksXG4gICAgICAgIGRpc3RhbmNlID0gTWF0aC5zcXJ0KHZ4ICogdnggKyB2eSAqIHZ5KTtcbiAgICBpZihkaXN0YW5jZSA+PSBzcGVlZCkge1xuICAgICAgICBmb2xsb3dlci54ICs9ICh2eCAvIGRpc3RhbmNlKSAqIHNwZWVkO1xuICAgICAgICBmb2xsb3dlci55ICs9ICh2eSAvIGRpc3RhbmNlKSAqIHNwZWVkO1xuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFuZ2xlKHMxLCBzMikge1xuICAgIHJldHVybiBNYXRoLmF0YW4yKFxuICAgICAgICBzMi5jZW50ZXJYIC0gczEuY2VudGVyWCxcbiAgICAgICAgczIuY2VudGVyWSAtIHMxLmNlbnRlcllcbiAgICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcm90YXRlU3ByaXRlKHJvdGF0aW5nU3ByaXRlLCBjZW50ZXJTcHJpdGUsIGRpc3RhbmNlLCBhbmdsZSkge1xuICAgIHJvdGF0aW5nU3ByaXRlLnggPSBjZW50ZXJTcHJpdGUuY2VudGVyWCAtIHJvdGF0aW5nU3ByaXRlLnBhcmVudC54XG4gICAgICAgICAgICAgICAgICAgICAgICArIChkaXN0YW5jZSAqIE1hdGguY29zKGFuZ2xlKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC0gcm90YXRpbmdTcHJpdGUuaGFsZldpZHRoO1xuICAgIHJvdGF0aW5nU3ByaXRlLnkgPSBjZW50ZXJTcHJpdGUuY2VudGVyWSAtIHJvdGF0aW5nU3ByaXRlLnBhcmVudC55XG4gICAgICAgICAgICAgICAgICAgICAgICArIChkaXN0YW5jZSAqIE1hdGguc2luKGFuZ2xlKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC0gcm90YXRpbmdTcHJpdGUuaGFsZldpZHRoO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcm90YXRlUG9pbnQocG9pbnRYLCBwb2ludFksIGRpc3RhbmNlWCwgZGlzdGFuY2VZLCBhbmdsZSkge1xuICAgIGxldCBwb2ludCA9IHt9O1xuXG4gICAgcG9pbnQueCA9IHBvaW50WCArIE1hdGguY29zKGFuZ2xlKSAqIGRpc3RhbmNlWDtcbiAgICBwb2ludC55ID0gcG9pbnRZICsgTWF0aC5zaW4oYW5nbGUpICogZGlzdGFuY2VZO1xuXG4gICAgcmV0dXJuIHBvaW50O1xufVxuXG4vLyBSYW5kb20gcmFuZ2VcbmV4cG9ydCBsZXQgcmFuZG9tSW50ID0gKG1pbiwgbWF4KSA9PiB7XG4gICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4gKyAxKSkgKyBtaW47XG59O1xuXG5leHBvcnQgbGV0IHJhbmRvbUZsb2F0ID0gKG1pbiwgbWF4KSA9PiB7XG4gICAgcmV0dXJuIG1pbiArIE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluKTtcbn0iLCJpbXBvcnQge21ha2VDYW52YXMsIHJlbW92ZSwgcmVuZGVyfSAgZnJvbSBcIi4vZW5naW5lL2Rpc3BsYXlcIjtcbmltcG9ydCB7c3RhZ2UsIHNwcml0ZSwgdGV4dCwgYmFja2dyb3VuZH0gZnJvbSBcIi4vZW5naW5lL2Rpc3BsYXlcIjtcbmltcG9ydCB7cGFydGljbGVzLCBwYXJ0aWNsZUVmZmVjdH0gZnJvbSBcIi4vZW5naW5lL2Rpc3BsYXlcIjtcbmltcG9ydCB7YXNzZXRzLCB3cmFwLCBvdXRzaWRlQm91bmRzfSBmcm9tIFwiLi9lbmdpbmUvdXRpbGl0aWVzXCI7XG5pbXBvcnQge3JhbmRvbUludCwgcmFuZG9tRmxvYXR9IGZyb20gXCIuL2VuZ2luZS91dGlsaXRpZXNcIjtcbmltcG9ydCB7a2V5Ym9hcmQsIG1ha2VQb2ludGVyfSBmcm9tIFwiLi9lbmdpbmUvaW50ZXJhY3RpdmVcIjtcbmltcG9ydCB7bW92aW5nQ2lyY2xlQ29sbGlzaW9uLCBjaXJjbGVSZWN0YW5nbGVDb2xsaXNpb259IGZyb20gXCIuL2VuZ2luZS9jb2xsaXNpb25cIjtcblxuYXNzZXRzLmxvYWQoW1xuICAgIFwiYmdzL2RhcmtQdXJwbGUucG5nXCIsXG4gICAgXCJmb250cy9rZW52ZWN0b3JfZnV0dXJlX3RoaW4udHRmXCIsXG4gICAgXCJzb3VuZHMvc2Z4X2xhc2VyMS5tcDNcIixcbiAgICBcInNwcml0ZXMvc2hlZXQuanNvblwiXG5dKS50aGVuKCgpID0+IHNldHVwKCkpO1xuXG5sZXQgY2FudmFzLCBzaGlwLCBtZXNzYWdlLCBzaG9vdFNmeCwgYmc7XG5sZXQgYnVsbGV0cyA9IFtdO1xubGV0IGFzdGVyb2lkcyA9IFtdO1xubGV0IHBvaW50ZXI7XG5cbmxldCBzY29yZSA9IDA7XG5cbmZ1bmN0aW9uIHNob290KFxuICAgICAgICAgICAgc2hvb3RlciwgYW5nbGUsIG9mZnNldEZyb21DZW50ZXIsXG4gICAgICAgICAgICBidWxsZXRTcGVlZCwgYnVsbGV0c0FycmF5LCBidWxsZXRTcHJpdGUpIHtcbiAgICBsZXQgYnVsbGV0ID0gYnVsbGV0U3ByaXRlKCk7XG5cbiAgICBidWxsZXQueCA9IHNob290ZXIuY2VudGVyWCAtIGJ1bGxldC5oYWxmV2lkdGggKyAob2Zmc2V0RnJvbUNlbnRlciAqIE1hdGguY29zKGFuZ2xlKSk7XG4gICAgYnVsbGV0LnkgPSBzaG9vdGVyLmNlbnRlclkgLSBidWxsZXQuaGFsZkhlaWdodCArIChvZmZzZXRGcm9tQ2VudGVyICogTWF0aC5zaW4oYW5nbGUpKTtcblxuICAgIGJ1bGxldC52eCA9IE1hdGguc2luKGFuZ2xlKSAqIGJ1bGxldFNwZWVkO1xuICAgIGJ1bGxldC52eSA9IC1NYXRoLmNvcyhhbmdsZSkgKiBidWxsZXRTcGVlZDtcblxuICAgIGJ1bGxldC5yb3RhdGlvbiA9IGFuZ2xlO1xuXG4gICAgYnVsbGV0c0FycmF5LnB1c2goYnVsbGV0KTtcblxuICAgIHBhcnRpY2xlRWZmZWN0KGJ1bGxldC54LCBidWxsZXQueSk7XG4gICAgc2hvb3RTZngucGxheSgpO1xufVxuXG5mdW5jdGlvbiBzcGF3bkFzdGVyb2lkKCkge1xuICAgIGxldCB4ID0gcmFuZG9tSW50KDAsIHN0YWdlLmxvY2FsQm91bmRzLndpZHRoKSxcbiAgICAgICAgeSA9IHJhbmRvbUludCgwLCBzdGFnZS5sb2NhbEJvdW5kcy5oZWlnaHQpO1xuXG4gICAgbGV0IGFzdGVyb2lkID0gc3ByaXRlKGFzc2V0c1tcIm1ldGVvckJyb3duX2JpZzEucG5nXCJdLCB4LCB5KTtcbiAgICBhc3Rlcm9pZC5jaXJjdWxhciA9IHRydWU7XG4gICAgYXN0ZXJvaWQuZGlhbWV0ZXIgPSA5MDtcbiAgICBcbiAgICBhc3Rlcm9pZC52eCA9IHJhbmRvbUZsb2F0KC01LCA1KTtcbiAgICBhc3Rlcm9pZC52eSA9IHJhbmRvbUZsb2F0KC01LCA1KTtcblxuICAgIGFzdGVyb2lkLnJvdGF0aW9uU3BlZWQgPSByYW5kb21GbG9hdCgwLjAxLCAwLjA3KTtcblxuICAgIGFzdGVyb2lkcy5wdXNoKGFzdGVyb2lkKTtcbn1cblxuZnVuY3Rpb24gc2V0dXAoKSB7XG4gICAgY2FudmFzID0gbWFrZUNhbnZhcygxMjgwLCA3MjAsIFwibm9uZVwiKTtcbiAgICBzdGFnZS53aWR0aCA9IGNhbnZhcy53aWR0aDtcbiAgICBzdGFnZS5oZWlnaHQgPSBjYW52YXMuaGVpZ2h0O1xuXG4gICAgcG9pbnRlciA9IG1ha2VQb2ludGVyKGNhbnZhcyk7XG4gICAgc2hvb3RTZnggPSBhc3NldHNbXCJzb3VuZHMvc2Z4X2xhc2VyMS5tcDNcIl07XG5cbiAgICBiZyA9IGJhY2tncm91bmQoYXNzZXRzW1wiYmdzL2RhcmtQdXJwbGUucG5nXCJdLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xuXG4gICAgc2hpcCA9IHNwcml0ZShhc3NldHNbXCJwbGF5ZXJTaGlwMl9yZWQucG5nXCJdKTtcbiAgICBzaGlwLnNjYWxlWCA9IDAuNTtcbiAgICBzaGlwLnNjYWxlWSA9IDAuNTtcbiAgICBzdGFnZS5wdXRDZW50ZXIoc2hpcCk7XG5cbiAgICBzaGlwLnZ4ID0gMDtcbiAgICBzaGlwLnZ5ID0gMDtcbiAgICBzaGlwLmFjY2VsZXJhdGlvblggPSAwLjI7XG4gICAgc2hpcC5hY2NlbGVyYXRpb25ZID0gMC4yO1xuICAgIHNoaXAuZnJpY3Rpb24gPSAwLjk2O1xuICAgIHNoaXAuc3BlZWQgPSAwO1xuXG4gICAgc2hpcC5yb3RhdGlvblNwZWVkID0gMDtcblxuICAgIHNoaXAubW92ZUZvcndhcmQgPSBmYWxzZTtcblxuICAgIHNoaXAubGl2ZXMgPSAzO1xuICAgIHNoaXAuZGVzdHJveWVkID0gZmFsc2U7XG5cbiAgICBsZXQgbGVmdEFycm93ID0ga2V5Ym9hcmQoMzcpLFxuICAgICAgICByaWdodEFycm93ID0ga2V5Ym9hcmQoMzkpLFxuICAgICAgICB1cEFycm93ID0ga2V5Ym9hcmQoMzgpLFxuICAgICAgICBzcGFjZSA9IGtleWJvYXJkKDMyKTtcblxuICAgIGxlZnRBcnJvdy5wcmVzcyA9ICgpID0+IHNoaXAucm90YXRpb25TcGVlZCA9IC0wLjE7XG4gICAgbGVmdEFycm93LnJlbGVhc2UgPSAoKSA9PiB7XG4gICAgICAgIGlmKCFyaWdodEFycm93LmlzRG93bikgc2hpcC5yb3RhdGlvblNwZWVkID0gMDtcbiAgICB9XG5cbiAgICByaWdodEFycm93LnByZXNzID0gKCkgPT4gc2hpcC5yb3RhdGlvblNwZWVkID0gMC4xO1xuICAgIHJpZ2h0QXJyb3cucmVsZWFzZSA9ICgpID0+IHtcbiAgICAgICAgaWYoIWxlZnRBcnJvdy5pc0Rvd24pIHNoaXAucm90YXRpb25TcGVlZCA9IDA7XG4gICAgfVxuXG4gICAgdXBBcnJvdy5wcmVzcyA9ICgpID0+IHNoaXAubW92ZUZvcndhcmQgPSB0cnVlO1xuICAgIHVwQXJyb3cucmVsZWFzZSA9ICgpID0+IHNoaXAubW92ZUZvcndhcmQgPSBmYWxzZTtcblxuICAgIHNwYWNlLnByZXNzID0gKCkgPT4ge1xuICAgICAgICBzaG9vdChcbiAgICAgICAgICAgIHNoaXAsIHNoaXAucm90YXRpb24sIDE0LCAxMCwgYnVsbGV0cyxcbiAgICAgICAgICAgICgpID0+IHNwcml0ZShhc3NldHNbXCJsYXNlclJlZDA3LnBuZ1wiXSlcbiAgICAgICAgKTtcbiAgICAgICAgc2hvb3QoXG4gICAgICAgICAgICBzaGlwLCBzaGlwLnJvdGF0aW9uLCAtMTQsIDEwLCBidWxsZXRzLFxuICAgICAgICAgICAgKCkgPT4gc3ByaXRlKGFzc2V0c1tcImxhc2VyUmVkMDcucG5nXCJdKVxuICAgICAgICApO1xuICAgIH1cblxuICAgIG1lc3NhZ2UgPSB0ZXh0KFwiSGVsbG8hXCIsIFwiMTZweCBrZW52ZWN0b3JfZnV0dXJlX3RoaW5cIiwgXCJ3aGl0ZVwiLCA4LCA4KTtcblxuICAgIGZvcihsZXQgaSA9IDA7IGkgPCA1OyBpKyspe1xuICAgICAgICBzcGF3bkFzdGVyb2lkKCk7XG4gICAgfVxuXG4gICAgZ2FtZUxvb3AoKTtcbn1cblxuZnVuY3Rpb24gZ2FtZUxvb3AoKSB7XG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGdhbWVMb29wKTtcblxuICAgIGlmKHBhcnRpY2xlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHBhcnRpY2xlcy5mb3JFYWNoKHBhcnRpY2xlID0+IHtcbiAgICAgICAgICAgIHBhcnRpY2xlLnVwZGF0ZSgpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBidWxsZXRzID0gYnVsbGV0cy5maWx0ZXIoYnVsbGV0ID0+IHtcbiAgICAgICAgYnVsbGV0LnggKz0gYnVsbGV0LnZ4O1xuICAgICAgICBidWxsZXQueSArPSBidWxsZXQudnk7XG5cbiAgICAgICAgbGV0IGNvbGxpc2lvbiA9IG91dHNpZGVCb3VuZHMoYnVsbGV0LCBzdGFnZS5sb2NhbEJvdW5kcyk7XG5cbiAgICAgICAgaWYoY29sbGlzaW9uKSB7XG4gICAgICAgICAgICByZW1vdmUoYnVsbGV0KTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0pO1xuXG4gICAgZm9yKGxldCBpID0gMDsgaSA8IGFzdGVyb2lkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBsZXQgYTEgPSBhc3Rlcm9pZHNbaV07XG5cbiAgICAgICAgLy8gdXBkYXRlIGFzdGVyb2lkXG4gICAgICAgIGExLnJvdGF0aW9uICs9IGExLnJvdGF0aW9uU3BlZWQ7XG4gICAgICAgIGExLnggKz0gYTEudng7XG4gICAgICAgIGExLnkgKz0gYTEudnk7XG5cbiAgICAgICAgd3JhcChhMSwgc3RhZ2UubG9jYWxCb3VuZHMpO1xuXG4gICAgICAgIC8vIGNoZWNrIGNvbGxpc2lzb25zXG4gICAgICAgIC8vIGJldHdlZW4gYXN0ZXJvaWRzXG4gICAgICAgIGZvcihsZXQgaiA9IGkgKyAxOyBqIDwgYXN0ZXJvaWRzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICBsZXQgYTIgPSBhc3Rlcm9pZHNbal07XG5cbiAgICAgICAgICAgIG1vdmluZ0NpcmNsZUNvbGxpc2lvbihhMSwgYTIpO1xuICAgICAgICB9XG4gICAgICAgIC8vIGFuZCB3aXRoIHBsYXllclxuICAgICAgICBsZXQgcGxheWVySGl0ID0gY2lyY2xlUmVjdGFuZ2xlQ29sbGlzaW9uKGExLCBzaGlwLCB0cnVlKTtcbiAgICAgICAgaWYocGxheWVySGl0KSB7XG4gICAgICAgICAgICBzaGlwLmxpdmVzIC09IDE7XG4gICAgICAgICAgICAvLyBkZXN0cm95IHNoaXBcbiAgICAgICAgICAgIHNoaXAuZGVzdHJveWVkID0gdHJ1ZTtcbiAgICAgICAgICAgIC8vc3RhZ2UucmVtb3ZlQ2hpbGQoc2hpcCk7XG4gICAgICAgICAgICBwYXJ0aWNsZUVmZmVjdChzaGlwLngsIHNoaXAueSk7XG5cbiAgICAgICAgICAgIC8vIHJlc3Bhd24gc2hpcFxuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgLy9zdGFnZS5hZGRDaGlsZChzaGlwKTtcbiAgICAgICAgICAgICAgICBzdGFnZS5wdXRDZW50ZXIoc2hpcCk7XG4gICAgICAgICAgICAgICAgc2hpcC5yb3RhdGlvbiA9IDA7XG4gICAgICAgICAgICAgICAgc2hpcC5kZXN0cm95ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIH0sIDEwMDApO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGlmKCFzaGlwLmRlc3Ryb3llZCkge1xuICAgICAgICBzaGlwLnJvdGF0aW9uICs9IHNoaXAucm90YXRpb25TcGVlZDtcbiAgICAgICAgXG4gICAgICAgIGlmKHNoaXAubW92ZUZvcndhcmQpIHtcbiAgICAgICAgICAgIHNoaXAudnggKz0gc2hpcC5hY2NlbGVyYXRpb25YICogTWF0aC5zaW4oc2hpcC5yb3RhdGlvbik7XG4gICAgICAgICAgICBzaGlwLnZ5ICs9IC1zaGlwLmFjY2VsZXJhdGlvblkgKiBNYXRoLmNvcyhzaGlwLnJvdGF0aW9uKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNoaXAudnggKj0gc2hpcC5mcmljdGlvbjtcbiAgICAgICAgICAgIHNoaXAudnkgKj0gc2hpcC5mcmljdGlvbjtcbiAgICAgICAgfVxuXG4gICAgICAgIHNoaXAueCArPSBzaGlwLnZ4O1xuICAgICAgICBzaGlwLnkgKz0gc2hpcC52eTtcblxuICAgICAgICB3cmFwKHNoaXAsIHN0YWdlLmxvY2FsQm91bmRzKTtcbiAgICB9XG5cbiAgICBiZy54IC09IE1hdGguZmxvb3Ioc2hpcC52eCk7XG4gICAgYmcueSAtPSBNYXRoLmZsb29yKHNoaXAudnkpO1xuXG4gICAgbWVzc2FnZS5jb250ZW50ID0gXCJTY29yZXM6IFwiICsgc2NvcmU7XG5cbiAgICByZW5kZXIoY2FudmFzKTtcbn1cbiJdfQ==
