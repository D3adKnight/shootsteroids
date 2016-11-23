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

function remove(...spritesToRemove) {
    spritesToRemove.forEach(sprite => {
        sprite.parent.removeChild(sprite);
    });
}