const KEY_CODES = {
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down'
};

var KEY_STATUS = {};
for(var code in KEY_CODES) {
    KEY_STATUS[KEY_CODES[code]] = false;
}

var bg = new Image();
bg.addEventListener("load", start, false);
bg.src = "/bgs/black.png";

var ship_img = new Image();
ship_img.src = "/images/playerShip1_red.png";

var canvas = document.getElementById("game");
var ctx = canvas.getContext('2d');

function start() {
    setup();
    gameLoop();
}

var ship;

var bg_offset_x = 0;
var bg_offset_y = 0;
var ship_w = ship_img.width / 2;
var ship_h = ship_img.height / 2;

var ship_x = 0;
var ship_y = 0;
var ship_vx = 0;
var ship_vy = 0;
var ship_rotation = 0;
var ship_acceleration = 0.2;
var ship_friction = 0.96;
var ship_moveForward = false;

function setup() {
    ship_x = (canvas.width - ship_w) / 2;
    ship_y = (canvas.height - ship_h) / 2;

    ship = new Sprite(ship_img, ship_x, ship_y, ship_w, ship_h);

    document.onkeydown = function(e) {
        var keyCode = (e.keyCode) ? e.keyCode : e.charCode;
        if(KEY_CODES[keyCode]) {
            e.preventDefault();
            KEY_STATUS[KEY_CODES[keyCode]] = true;
        }
    };

    document.onkeyup = function(e) {
        var keyCode = (e.keyCode) ? e.keyCode : e.charCode;
        if(KEY_CODES[keyCode]) {
            e.preventDefault();
            KEY_STATUS[KEY_CODES[keyCode]] = false;
        }
    };
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // draw background
    var pattern = ctx.createPattern(bg, "repeat");
    ctx.fillStyle = pattern;

    ctx.translate(bg_offset_x, bg_offset_y);
    ctx.fillRect(-bg_offset_x, -bg_offset_y, canvas.width, canvas.height);
    ctx.translate(-bg_offset_x, -bg_offset_y);

    // draw ship
    ctx.save();
    ctx.translate(
        ship_x + ship_w * 0.5,
        ship_y + ship_h * 0.5
    );
    ctx.rotate(ship_rotation);
    /*
    ctx.drawImage(ship, 0, 0,
                 ship.width, ship.height,
                 -ship_w * 0.5, -ship_h * 0.5,
                 ship_w, ship_h);
    */
    ship.render(ctx);
    ctx.restore();

    ctx.fillStyle = "red";
    ctx.fillRect(
        canvas.width * 0.5 - 2,
        canvas.height * 0.5 - 2,
        4, 4
    );
}

function wrap() {
    if(ship_x - ship_w * 2 < 0) {
        ship_x = canvas.width - ship_w;
    }
    if(ship_y - ship_h < 0) {
        ship_y = canvas.height - ship_h;
    }
    if(ship_x + ship_w * 2 > canvas.width) {
        ship_x = 0;
    }
    if(ship_y + ship_h > canvas.height) {
        ship_y = 0;
    }
}

function gameLoop() {
    requestAnimationFrame(gameLoop);

    // update ship position
    if(KEY_STATUS.left) {
        ship_rotation -= 0.1;
    }
    if(KEY_STATUS.right) {
        ship_rotation += 0.1;
    }
    if(KEY_STATUS.up) {
        ship_moveForward = true;
    }
    if(ship_moveForward && !KEY_STATUS.up) {
        ship_moveForward = false;
    }
    
    if(ship_moveForward) {
        ship_vx += ship_acceleration * Math.sin(ship_rotation);
        ship_vy += -ship_acceleration * Math.cos(ship_rotation);
    } else {
        ship_vx *= ship_friction;
        ship_vy *= ship_friction;
    }

    ship_x += ship_vx;
    ship_y += ship_vy;

    bg_offset_x += ship_vx * 0.2;
    bg_offset_y += ship_vy * 0.2;

    wrap();

    // rendering
    render();
}

/*
ctx.drawImage(
 this.source,
 this.sourceX, this.sourceY,
 this.sourceWidth, this.sourceHeight,
 -this.width * this.pivotX,
 -this.height * this.pivotY,
 this.width, this.height
 );
*/