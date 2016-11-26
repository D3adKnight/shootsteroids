const KEY_CODES = {
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down'
};

let KEY_STATUS = {};
for(let code in KEY_CODES) {
    KEY_STATUS[KEY_CODES[code]] = false;
}

let canvas = document.getElementById("game");
let ctx = canvas.getContext('2d');

let bg = new Image();
//bg.addEventListener("load", start, false);
bg.src = "/bgs/black.png";

tilesheet.load("/sprites/sheet.json").then(() => start());

function start() {
    setup();
    gameLoop();
}

let ship;

let bg_offset_x = 0;
let bg_offset_y = 0;

function createShip(img, x, y, width, height) {
    let self = new Sprite(img, x, y, width, height);

    // add ship-only props
    self.vx = 0;
    self.vy = 0;
    self.acceleration = 0.2;
    self.friction = 0.98;
    self.moveForward = false;

    self.update = function() {
        if(self.moveForward) {
            self.vx += self.acceleration * Math.sin(self.rotation);
            self.vy += -self.acceleration * Math.cos(self.rotation);
        } else {
            self.vx *= self.friction;
            self.vy *= self.friction;
        }

        self.x += self.vx;
        self.y += self.vy;
    };

    return self;
}

let asteroids = [];
function createAsteroid(x, y, vx, vy) {
    // TODO: add random selection
    let img = tilesheet["meteorBrown_big1.png"];
    let self = new Sprite(img, x, y, img.w, img.h);

    self.vx = vx;
    self.vy = vy;
    self.acceleration = 0.02;
    self.rotationSpeed = 0.05;

    self.update = function() {
        self.rotation += self.rotationSpeed;
/*
        self.vx += self.acceleration;
        self.vy += self.acceleration;
*/
        self.x += self.vx;
        self.y += self.vy;
    };

    asteroids.push(self);

    return self;
}

function setup() {
    let ship_img = tilesheet["playerShip2_red.png"];
    let ship_w = ship_img.w * 0.5;
    let ship_h = ship_img.h * 0.5;
    let ship_x = (canvas.width - ship_w) * 0.5;
    let ship_y = (canvas.height - ship_h) * 0.5;
    
    ship = createShip(ship_img, ship_x, ship_y, ship_w, ship_h);

    createAsteroid(0, 0, -2, -2);
    createAsteroid(canvas.width, canvas.height, 2, 2);

    document.onkeydown = function(e) {
        let keyCode = (e.keyCode) ? e.keyCode : e.charCode;
        if(KEY_CODES[keyCode]) {
            e.preventDefault();
            KEY_STATUS[KEY_CODES[keyCode]] = true;
        }
    };

    document.onkeyup = function(e) {
        let keyCode = (e.keyCode) ? e.keyCode : e.charCode;
        if(KEY_CODES[keyCode]) {
            e.preventDefault();
            KEY_STATUS[KEY_CODES[keyCode]] = false;
        }
    };
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // draw background
    let pattern = ctx.createPattern(bg, "repeat");
    ctx.fillStyle = pattern;

    ctx.translate(bg_offset_x, bg_offset_y);
    ctx.fillRect(-bg_offset_x, -bg_offset_y, canvas.width, canvas.height);
    ctx.translate(-bg_offset_x, -bg_offset_y);

    let drawSprite = sprite => {
        ctx.save();
        ctx.translate(
            sprite.x + sprite.width * 0.5,
            sprite.y + sprite.height * 0.5
        );
        ctx.rotate(sprite.rotation);
        ctx.scale(sprite.scaleX, sprite.scaleY);

        if(sprite.render) sprite.render(ctx);
        ctx.restore();
    };

    // draw ship
    drawSprite(ship);

    // draw asteroids
    asteroids.forEach(ast => {
        drawSprite(ast);
    });

    ctx.fillStyle = "red";
    ctx.fillRect(
        canvas.width * 0.5 - 2,
        canvas.height * 0.5 - 2,
        4, 4
    );
}

function wrap(drawable) {
    if(drawable.x + drawable.width < 0) {
        drawable.x = canvas.width - drawable.width;
    }
    if(drawable.y + drawable.height < 0) {
        drawable.y = canvas.height - drawable.height;
    }
    if(drawable.x - drawable.width > canvas.width) {
        drawable.x = 0;
    }
    if(drawable.y - drawable.height > canvas.height) {
        drawable.y = 0;
    }
}

function gameLoop() {
    requestAnimationFrame(gameLoop);

    // update ship position
    if(KEY_STATUS.left) {
        ship.rotation -= 0.1;
    }
    if(KEY_STATUS.right) {
        ship.rotation += 0.1;
    }
    if(KEY_STATUS.up) {
        ship.moveForward = true;
    }
    if(ship.moveForward && !KEY_STATUS.up) {
        ship.moveForward = false;
    }

    ship.update();
    
    bg_offset_x += ship.vx * 0.2;
    bg_offset_y += ship.vy * 0.2;

    wrap(ship);

    asteroids.forEach(ast => {
        ast.update();
        wrap(ast);
    });

    // rendering
    render();
}