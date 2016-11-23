let draggableSprites = [];

class DisplayObject {
    constructor() {
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
    get gx() {
        if(this.parent) {
            return this.x + this.parent.gx;
        } else {
            return this.x;
        }
    }
    get gy() {
        if(this.parent) {
            return this.y + this.parent.gy;
        } else {
            return this.y;
        }
    }

    // Depth layer
    get layer() {
        return this._layer;
    }
    set layer(value) {
        this._layer = value;
        if(this.parent) {
            this.parent.children.sort((a, b) => a.layer - b.layer);
        }
    }

    // Children manipulation
    addChild(sprite) {
        if(sprite.parent) {
            sprite.parent.removeChild(sprite);
        }
        sprite.parent = this;
        this.children.push(sprite);
    }

    removeChild(sprite) {
        if(sprite.parent === this) {
            this.children.splice(this.children.indexOf(sprite), 1);
        } else {
            throw new Error(sprite + " is not a child of " + this);
        }
    }

    get empty() {
        if(this.children.length === 0) {
            return true;
        } else {
            return false;
        }
    }

    swapChildren(child1, child2) {
        let index1 = this.children.indexOf(child1),
            index2 = this.children.indexOf(child2);

        if(index1 !== -1 && index2 !== -1) {
            child1.childIndex = index2;
            child2.childIndex = index1;

            this.children[index1] = child2;
            this.children[index2] = child1;
        } else {
            throw new Error(`Both objects must be a child of the caller ${this}`);
        }
    }

    add(...spritesToAdd) {
        spritesToAdd.forEach(sprite => this.addChild(sprite));
    }
    remove(...spritesToRemove) {
        spritesToRemove.forEach(sprite => this.removeChild(sprite));
    }

    // Helpers
    get halfWidth() {
        return this.width / 2;
    }
    get halfHeight() {
        return this.height / 2;
    }

    get centerX() {
        return this.x + this.halfWidth;
    }
    get centerY() {
        return this.y + this.halfHeight;
    }

    // ...
    get position() {
        return {x: this.x, y: this.y};
    }
    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    get localBounds() {
        return {
            x: 0,
            y: 0,
            width: this.width,
            height: this.height
        };
    }
    get globalBounds() {
        return {
            x: this.gx,
            y: this.gy,
            width: this.gx + this.width,
            height: this.gy + this.height
        };
    }

    // position helpers
    putCenter(b, xOffset = 0, yOffset = 0) {
        let a = this;
        b.x = (a.x + a.halfWidth - b.halfWidth) + xOffset;
        b.y = (a.y + a.halfHeight - b.halfHeight) + yOffset;
    }
    putTop(b, xOffset = 0, yOffset = 0) {
        let a = this;
        b.x = (a.x + a.halfWidth - b.halfWidth) + xOffset;
        b.y = (a.y - b.height) + yOffset;
    }
    putBottom(b, xOffset = 0, yOffset = 0) {
        let a = this;
        b.x = (a.x + a.halfWidth - b.halfWidth) + xOffset;
        b.y = (a.y + a.height) + yOffset;
    }
    putRight(b, xOffset = 0, yOffset = 0) {
        let a = this;
        b.x = (a.x + a.width) + xOffset;
        b.y = (a.y + a.halfHeight - b.halfHeight) + yOffset;
    }
    putLeft(b, xOffset = 0, yOffset = 0) {
        let a = this;
        b.x = (a.x - b.width) + xOffset;
        b.y = (a.y + a.halfHeight - b.halfHeight) + yOffset;
    }

    // animation helpers
    get currentFrame() {
        return this._currentFrame;
    }

    // circular
    get circular() {
        return this._circular;
    }
    set circular(value) {
        if(value === true && this._circular === false) {
            Object.defineProperties(this, {
                diameter: {
                    get () {
                        return this.width;
                    },
                    set (value) {
                        this.width = value;
                        this.height = value;
                    },
                    enumerable: true, configurable: true
                },
                radius: {
                    get () {
                        return this.halfWidth;
                    },
                    set (value) {
                        this.width = value * 2;
                        this.height = value * 2;
                    },
                    enumerable: true, configurable: true
                }
            });

            this._circular = true;
        }

        if(value === false && this._circular === true) {
            delete this.diameter;
            delete this.radius;
            this._circular = false;
        }
    }

    // draggable
    get draggable() {
        return this._draggable;
    }
    set draggable(value) {
        if(value === true) {
            draggableSprites.push(this);
            this._draggable = true;
        }

        if(value === false) {
            draggableSprites.splice(draggableSprites.indexOf(this), 1);
            this._draggable = false;
        }
    }

    get interactive() {
        return this._interactive;
    }
    set interactive(value) {
        if(value === true) {
            // todo
            this._interactive = true;
        }
        if(value === false) {
            this._interactive = false;
        }
    }
}

let stage = new DisplayObject();

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

function renderWithInterpolation(canvas, lagOffset) {
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

            if(sprite.previousX !== undefined) {
                sprite.renderX = (sprite.x - sprite.previousX) * lagOffset + sprite.previousX;
            } else {
                sprite.renderX = sprite.x;
            }

            if(sprite.previousY !== undefined) {
                sprite.renderY = (sprite.y - sprite.previousY) * lagOffset + sprite.previousY;
            } else {
                sprite.renderY = sprite.y;
            }

            ctx.translate(
                sprite.renderX + (sprite.width * sprite.pivotX),
                sprite.renderY + (sprite.height * sprite.pivotY)
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

function remove(...spritesToRemove) {
    spritesToRemove.forEach(sprite => {
        sprite.parent.removeChild(sprite);
    });
}

class Rectangle extends DisplayObject {
    constructor(
        width = 32,
        height = 32,
        fillStyle = "gray",
        strokeStyle = "none",
        lineWidth = 0,
        x = 0,
        y = 0
    ) {
        super();

        Object.assign(
            this, {width, height, fillStyle, strokeStyle, lineWidth, x, y}
        );

        this.mask = false;
    }

    render(ctx) {
        ctx.strokeStyle = this.strokeStyle;
        ctx.lineWidth = this.lineWidth;
        ctx.fillStyle = this.fillStyle;

        ctx.beginPath();
        ctx.rect(
            -this.width * this.pivotX,
            -this.height * this.pivotY,
            this.width,
            this.height
        );

        if(this.strokeStyle !== "none") ctx.stroke();
        if(this.fillStyle !== "none") ctx.fill();
        if(this.mask && this.mask === true) ctx.clip();
    }
}

// rectangle wrapper
function rectangle(width, height, fillStyle, strokeStyle, lineWidth, x, y) {
    let sprite = new Rectangle(width, height, fillStyle, strokeStyle, lineWidth, x, y);
    stage.addChild(sprite);
    return sprite;
}

class Circle extends DisplayObject {
    constructor(
        diameter = 32,
        fillStyle = "gray",
        strokeStyle = "none",
        lineWidth = 0,
        x = 0,
        y = 0
    ) {
        super();
        this.circular = true;

        Object.assign(this, {diameter, fillStyle, strokeStyle, lineWidth, x, y});

        this.mask = false;
    }

    render (ctx) {
        ctx.strokeStyle = this.strokeStyle;
        ctx.lineWidth = this.lineWidth;
        ctx.fillStyle = this.fillStyle;

        ctx.beginPath();
        ctx.arc(
            this.radius + (-this.diameter * this.pivotX),
            this.radius + (-this.diameter * this.pivotY),
            this.radius,
            0, 2 * Math.PI,
            false
        );

        if(this.strokeStyle !== "none") ctx.stroke();
        if(this.fillStyle !== "none") ctx.fill();
        if(this.mask && this.mask === true) ctx.clip();
    }
}

// circle wrapper
function circle(diameter, fillStyle, strokeStyle, lineWidth, x, y) {
    let sprite = new Circle(diameter, fillStyle, strokeStyle, lineWidth, x, y);
    stage.addChild(sprite);
    return sprite;
}

class Line extends DisplayObject {
    constructor(
        strokeStyle = "none",
        lineWidth = 1,
        ax = 0,
        ay = 0,
        bx = 32,
        by = 32
    ) {
        super();

        Object.assign(this, {strokeStyle, lineWidth, ax, ay, bx, by});

        this.lineJoin = "round";
    }

    render (ctx) {
        ctx.strokeStyle = this.strokeStyle;
        ctx.lineWidth = this.lineWidth;

        ctx.beginPath();
        ctx.moveTo(this.ax, this.ay);
        ctx.lineTo(this.bx, this.by);

        if(this.strokeStyle !== "none") ctx.stroke();
    }
}

function line(strokeStyle, lineWidth, ax, ay, bx, by) {
    let sprite = new Line(strokeStyle, lineWidth, ax, ay, bx, by);
    stage.addChild(sprite);
    return sprite;
}

class Text extends DisplayObject {
    constructor(
        content = "Hello!",
        font = "12px sans-serif",
        fillStyle = "red",
        x = 0,
        y = 0
    ) {
        super();

        Object.assign(this, {content, font, fillStyle, x, y});

        this.textBaseline = "top";
        this.strokeText = "none";
    }

    render (ctx) {
        ctx.font = this.font;
        ctx.strokeStyle = this.strokeStyle;
        ctx.lineWidth = this.lineWidth;
        ctx.fillStyle = this.fillStyle;

        if(this.width === 0) this.width = ctx.measureText(this.content).width;
        if(this.height === 0) this.height = ctx.measureText(this.content).height;

        ctx.translate(
            -this.width * this.pivotX,
            -this.height * this.pivotY
        );

        ctx.textBaseline = this.textBaseline;

        ctx.fillText(
            this.content, 0, 0
        );

        if(this.strokeText !== "none") ctx.stroke();
    }
}

function text(content, font, fillStyle, x, y) {
    let sprite = new Text(content, font, fillStyle, x, y);
    stage.addChild(sprite);
    return sprite;
}

class Group extends DisplayObject {
    constructor(...spritesToGroup) {
        super();

        spritesToGroup.forEach(sprite => this.addChild(sprite));
    }

    addChild (sprite) {
        if(sprite.parent) {
            sprite.parent.removeChild(sprite);
        }
        sprite.parent = this;
        sprite.children.push(sprite);

        this.calculateSize();
    }

    removeChild (sprite) {
        if(sprite.parent === this) {
            this.children.splice(this.children.indexOf(sprite), 1);
            this.calculateSize();
        } else {
            throw new Error(`${sprite} is not child of ${this}`);
        }
    }

    calculateSize () {
        if(this.children.length > 0) {
            this._newWidth = 0;
            this._newHeight = 0;

            this.children.forEach(child => {
                if(child.x + child.width > this._newWidth) {
                    this._newWidth = child.x + child.width;
                }
                if(child.y + child.height > this._newHeight) {
                    this._newHeight = child.y + child.height;
                }
            });

            this.width = this._newWidth;
            this.height = this._newHeight;
        }
    }
}

function group(...spritesToGroup) {
    let sprite = new Group(...spritesToGroup);
    stage.addChild(sprite);
    return sprite;
}

class Sprite extends DisplayObject {
    constructor (
        source,
        x = 0,
        y = 0
    ) {
        super();

        Object.assign(this, {x, y});

        if(source instanceof Image) {
            this.createFromImage(source);
        }
        else if(source.name) {
            this.createFromAtlas(source);
        }
        else if(source.image && !source.data) {
            this.createFromTileset(source);
        }
        else if(source.image && source.data) {
            this.createFromTilesetFrames(source);
        }
        else if(source instanceof Array) {
            if(source[0] && source[0].source) {
                this.createFromAtlasFrames(source);
            }
            else if(source[0] instanceof Image) {
                this.createFromImages(source);
            }
            else {
                throw new Error(`The image sources in ${source} are not recognized`);
            }
        }
        else {
            throw new Error(`The image source ${source} is not recognized`);
        }
    }

    createFromImage (source) {
        if(!(source instanceof Image)) {
            throw new Error(`${source} is not an image object`);
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

    createFromAtlas (source) {
        this.tilesetFrame = source;
        this.source = this.tilesetFrame.source;
        this.sourceX = this.tilesetFrame.sx;
        this.sourceY = this.tilesetFrame.sy;
        this.sourceWidth = source.tilew;
        this.sourceHeight = source.tileh;

        this.width = this.tilesetFrame.w;
        this.height = this.tilesetFrame.h;
    }

    createFromTileset (source) {
        if(!(source.image instanceof Image)) {
            throw new Error(`${source.image} is not an image object`);
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

    createFromTilesetFrames (source) {
        if(!(source.image instanceof Image)) {
            throw new Error(`${source.image} is not an image object`);
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

    createFromAtlasFrames (source) {
        this.frames = source;
        this.source = source[0].source;
        this.sourceX = source[0].frame.x;
        this.sourceY = source[0].frame.y;
        this.sourceWidth = source[0].frame.w;
        this.sourceHeight = source[0].frame.h;

        this.width = source[0].frame.w;
        this.height = source[0].frame.h;
    }

    createFromImages (source) {
        this.frames = source;
        this.source = source[0];
        this.sourceX = 0;
        this.sourceY = 0;
        this.sourceWidth = source[0].width;
        this.sourceHeight = source[0].height;

        this.width = source[0].width;
        this.height = source[0].height;
    }

    gotoAndStop (frameNumber) {
        if(this.frames.length > 0 && frameNumber < this.frames.length) {
            if(this.frames[0] instanceof Array) {
                this.sourceX = this.frames[frameNumber][0];
                this.sourceY = this.frames[frameNumber][1];
            }
            else if(this.frames[frameNumber].frame) {
                this.sourceX = this.frames[frameNumber].frame.x;
                this.sourceY = this.frames[frameNumber].frame.y;
                this.sourceWidth = this.frames[frameNumber].frame.w;
                this.sourceHeight = this.frames[frameNumber].frame.h;
                this.width = this.frames[frameNumber].frame.w;
                this.height = this.frames[frameNumber].frame.h;
            }
            else {
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
            throw new Error(`Frame number ${frameNumber} does not exists!`);
        }
    }

    render (ctx) {
        ctx.drawImage(
            this.source,
            this.sourceX, this.sourceY,
            this.sourceWidth, this.sourceHeight,
            -this.width * this.pivotX,
            -this.height * this.pivotY,
            this.width, this.height
        );
    }
}

function sprite(source, x, y) {
    let sprite = new Sprite(source, x, y);
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