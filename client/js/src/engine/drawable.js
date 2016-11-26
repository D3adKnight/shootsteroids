/*function Drawable() {
    this.init = function(x, y) {
        this.x = x;
        this.y = y;
    };

    this.speed = 0;
    this.canvasWidth = 0;
    this.canvasHeight = 0;

    this.draw = function(){};
}*/

class Drawable {
    constructor () {
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;

        this.rotation = 0;
        this.scaleX = 1;
        this.scaleY = 1;
        this.alpha = 1;
    }
}

class Sprite extends Drawable {
    constructor(source, x, y, width, height) {
        super();
        Object.assign(this, {x, y, width, height});

        if(source instanceof Image) {
            this.createFromImage(source);
        }
        else if(source.name) {
            this.createFromAtlas(source);
        }
    }

    createFromImage(source) {
        if(!(source instanceof Image)) {
            // ...
        } else {
            this.source = source;
            this.sourceX = 0;
            this.sourceY = 0;
            this.sourceWidth = source.width;
            this.sourceHeight = source.height;
        }
    }

    createFromAtlas(source) {
        this.tile = source;
        this.source = source.source;
        this.sourceX = source.sx;
        this.sourceY = source.sy;
        this.sourceWidth = source.w;
        this.sourceHeight = source.h;
    }

    render(ctx) {
        ctx.drawImage(
            this.source,
            this.sourceX, this.sourceY,
            this.sourceWidth, this.sourceHeight,
            -this.width * 0.5,
            -this.height * 0.5,
            this.width, this.height
        );
    }
}