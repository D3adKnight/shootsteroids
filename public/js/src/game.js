/*
    Init globals
*/
let canvas = makeCanvas(512, 512);
stage.width = canvas.width;
stage.height = canvas.height;

let fps = 30,
    previous = 0,
    lag = 0,
    frameDuration = 1000 / fps;

let ship;
let hor_speed = 5;

assets.load(["/assets/sprites/sheet.json"])
.then(() => setup());

function setup() {
    ship = sprite(assets["playerShip1_red.png"], 256, 256);
    
    stage.putCenter(ship);

    ship.vx = 0;
    ship.vy = 0;
    ship.accelerationX = 0.2;
    ship.accelerationY = 0.2;
    ship.frictionX = 0.96;
    ship.frictionY = 0.96;

    ship.rotationSpeed = 0;

    ship.moveForward = false;

    let leftArrow = keyboard(37),
        rightArrow = keyboard(39),
        upArrow = keyboard(38);

    leftArrow.press = () => ship.rotationSpeed = -0.1;
    leftArrow.release = () => {
        if(!rightArrow.isDown) ship.rotationSpeed = 0;
    };
    rightArrow.press = () => ship.rotationSpeed = 0.1;
    rightArrow.release = () => {
        if(!leftArrow.isDown) ship.rotationSpeed = 0;
    };

    upArrow.press = () => ship.moveForward = true;
    upArrow.release = () => ship.moveForward = false;

    gameLoop();
}

function update() {
    ship.rotation += ship.rotationSpeed;

    if(ship.moveForward) {
        ship.vx += ship.accelerationX * Math.cos(ship.rotation);
        ship.vy += ship.accelerationY * Math.sin(ship.rotation);
    } else {
        ship.vx *= ship.frictionX;
        ship.vy *= ship.frictionY;
    }

    ship.x += ship.vx;
    ship.y += ship.vy;

    contain(ship, stage.localBounds);
}

function gameLoop(timestamp) {
    requestAnimationFrame(gameLoop);

    if(!timestamp) timestamp = 0;
    let elapsed = timestamp - previous;

    if(elapsed > 1000) elapsed = frameDuration;
    lag += elapsed;

    while (lag >= frameDuration) {
        capturePreviousPositions(stage);
        update();

        lag -= frameDuration;
    }

    let lagOffset = lag / frameDuration;
    renderWithInterpolation(canvas, lagOffset);

    previous = timestamp;
}