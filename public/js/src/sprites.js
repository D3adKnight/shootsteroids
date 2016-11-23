let children = [];

let stage = {
    x: 0,
    y: 0,
    gx: 0,
    gy: 0,
    alpha: 1,
    width: canvas.width,
    height: canvas.height,
    parent: undefined,

    children: [],

    addChild(sprite) {
        this.children.push(sprite);
        sprite.parent = this;
    },

    removeChild(sprite) {
        this.children.splice(this.children.indexOf(sprite), 1);
    }
};

let rectangle = function(
    width = 32,
    height = 32,
    fillStyle = "gray",
    strokeStyle = "none",
    lineWidth = 0,
    x = 0,
    y = 0
) {
    let o = {width, height, fillStyle, strokeStyle, lineWidth, x, y};

    o._layer = 0;

    o.rotation = 0;
    o.alpha = 1;
    o.visible = true;
    o.scaleX = 1;
    o.scaleY = 1;

    o.vx = 0;
    o.vy = 0;

    o.children = [];

    o.parent = undefined;

    o.addChild = sprite => {
        if(sprite.parent) {
            sprite.parent.removeChild(sprite);
        }

        sprite.parent = o;
        o.children.push(sprite);
    };

    o.removeChild = sprite => {
        if(sprite.parent === o) {
            o.children.splice(o.children.indexOf(sprite), 1);
        } else {
            throw new Error(sprite + " is not a child of " + o);
        }
    };

    o.render = ctx => {
        ctx.strokeStyle = o.strokeStyle;
        ctx.lineWidth = o.lineWidth;
        ctx.fillStyle = o.fillStyle;

        ctx.beginPath();
        ctx.rect(-o.width / 2, -o.height / 2, o.width, o.height);
        if(o.strokeStyle !== "none") ctx.stroke();
        ctx.fill();
    };

    Object.defineProperties(o, {
        gx: {
            get() {
                if(o.parent) {
                    return o.x + o.parent.gx;
                } else {
                    return o.x;
                }
            },
            enumerable: true, configurable: true
        },
        gy: {
            get() {
                if(o.parent) {
                    return o.y + o.parent.gy;
                } else {
                    return o.y;
                }
            },
            enumerable: true, configurable: true
        },
        layer: {
            get() {
                return o._layer;
            },
            set(value) {
                o._layer = value;
                if(o.parent) {
                    o.parent.children.sort((a, b) => a.layer - b.layer);
                }
            },
            enumerable: true, configurable: true
        }
    });

    if(stage) stage.addChild(o);
    
    return o;
}