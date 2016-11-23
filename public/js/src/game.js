/*
    Init globals
*/
let canvas = makeCanvas(512, 512);
let stage = new DisplayObject();
stage.width = canvas.width;
stage.height = canvas.height;

function makeCanvas(
    width = 256, height = 256,
    border = "1px dashed black",
    backgroundColor = "white"
) {
    let canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    canvas.style.border = border;
    canvas.style.backgroundColor = backgroundColor;
    document.body.appendChild(canvas);

    canvas.ctx = canvas.getContext("2d");

    return canvas;
}

function render(canvas) {
    let ctx = canvas.ctx;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    stage.children.forEach(sprite => {
        displaySprite(sprite);
    });

    function displaySprite(sprite) {
        if(
            sprite.visible
            && sprite.gx < canvas.width + sprite.width
            && sprite.gx + sprite.width >= -sprite.width
            && sprite.gy < canvas.height + sprite.height
            && sprite.gy + sprite.height >= -sprite.height
        ) {
            ctx.save();

            ctx.translate(
                sprite.x + (sprite.width * sprite.pivotX),
                sprite.y + (sprite.height * sprite.pivotY)
            );

            ctx.rotate(sprite.rotation);
            ctx.globalAlpha = sprite.alpha * sprite.parent.alpha;
            ctx.scale(sprite.scaleX, sprite.scaleY);

            if(sprite.shadow) {
                ctx.shadowColor = sprite.shadowColor;
                ctx.shadowOffsetX = sprite.shadowOffsetX;
                ctx.shadowOffsetY = sprite.shadowOffsetY;
                ctx.shadowBlur = sprite.shadowBlur;
            }

            if(sprite.blendMode) ctx.globalCompositeOperation = sprite.blendMode;

            if(sprite.render)
                sprite.render(ctx);

            if(sprite.children && sprite.children.length > 0) {
                ctx.translate(-sprite.width * sprite.pivotX, -sprite.height * sprite.pivotY);

                sprite.children.forEach(child => {
                    displaySprite(child);
                });
            }

            ctx.restore();
        }
    }
}

assets.load(["/assets/sprites/sheet.json"]);

let blueBox = rectangle(64, 64, "blue", "none", 0, 32, 32);
blueBox.rotation = 0.2;

let redBox = rectangle(64, 64, "red", "black", 4, 160, 100);
redBox.alpha = 0.5;
redBox.scaleY = 2;

let greenBox = rectangle(64, 64, "yellowGreen", "black", 2, 50, 150);
greenBox.scaleX = 0.5;
greenBox.rotation = 0.8;

render(canvas, ctx);