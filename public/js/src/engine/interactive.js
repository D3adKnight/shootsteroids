function keyboard(keyCode) {
    let key = {};
    key.code = keyCode;
    key.isDown = false;
    key.isUp = true;
    key.press = undefined;
    key.release = undefined;

    key.downHandler = function(event) {
        if(event.keyCode === key.code) {
            if(key.isUp && key.press) key.press();
            key.isDown = true;
            key.isUp = false;
        }
        event.preventDefault();
    };

    key.upHandler = function(event) {
        if(event.keyCode === key.code) {
            if(key.isDown && key.release) key.release();
            key.isDown = false;
            key.isUp = true;
        }
        event.preventDefault();
    };

    window.addEventListener("keydown", key.downHandler.bind(key), false);
    window.addEventListener("keyup", key.upHandler.bind(key), false);

    return key;
}

function makePointer(element, scale = 1) {
    let pointer = {
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
            return {x: this.x, y: this.y};
        },

        isDown: false,
        isUp: true,
        tapped: false,

        downTime: 0,
        elapsedTime: 0,

        press: undefined,
        release: undefined,
        tap: undefined,

        moveHandler(event) {
            let element = event.target;

            this._x = (event.pageX - element.offsetLeft);
            this._y = (event.pageY - element.offsetTop);

            event.preventDefault();
        },

        touchMoveHandler(event) {
            let element = event.target;

            this._x = (event.targetTouches[0].pageX - element.offsetLeft);
            this._y = (event.targetTouches[0].pageY - element.offsetTop);

            event.preventDefault();
        },

        downHandler(event) {
            this.isDown = true;
            this.isUp = false;
            this.tapped = false;

            this.downTime = Date.now();

            if(this.press) this.press();
            event.preventDefault();
        },

        touchStartHandler(event) {
            let element = event.target;

            this._x = event.targetTouches[0].pageX - element.offsetLeft;
            this._y = event.targetTouches[0].pageY - element.offsetTop;

            this.isDown = true;
            this.isUp = false;
            this.tapped = false;

            this.downTime = Date.now();

            if(this.press) this.press();
            event.preventDefault();
        },

        upHandler(event) {
            this.elapsedTime = Math.abs(this.downTime - Date.now());
            if(this.elapsedTime <= 200 && this.tapped === false) {
                this.tapped = true;
                if(this.tap) this.tap();
            }

            this.isUp = true;
            this.isDown = false;

            if(this.release) this.release()
            event.preventDefault();
        },

        touchEndHandler(event) {
            this.elapsedTime = Math.abs(this.downTime - Date.now());

            if(this.elapsedTime <= 200 && this.tapped === false) {
                this.tapped = true;
                if(this.tap) this.tap();
            }

            this.isUp = true;
            this.isDown = false;

            if(this.release) this.release();
            event.preventDefault();
        },
    };

    element.addEventListener(
        "mousemove", pointer.moveHandler.bind(pointer), false
    );

    element.addEventListener(
        "mousedown", pointer.downHandler.bind(pointer), false
    );

    element.addEventListener(
        "mouseup", pointer.upHandler.bind(pointer), false
    );

    element.addEventListener(
        "touchmove", pointer.touchMoveHandler.bind(pointer), false
    );

    element.addEventListener(
        "touchstart", pointer.touchStartHandler.bind(pointer), false
    );

    element.addEventListener(
        "touchend", pointer.touchEndHandler.bind(pointer), false
    );

    element.style.touchAction = "none";

    return pointer;
}