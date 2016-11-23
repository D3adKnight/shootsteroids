let assets = {
    toLoad: 0,
    loaded: 0,

    imageExtensions: ["png", "jpg", "gif"],
    fontExtensions: ["ttf", "otf", "ttc", "woff"],
    jsonExtensions: ["json"],
    audioExtensions: ["mp3", "ogg", "webm"],

    // API
    load(sources) {
        return new Promise(resolve => {
            let loadHandler = () => {
                this.loaded += 1;
                console.log(this.loaded);

                if(this.toLoad === this.loaded) {
                    this.loaded = 0;
                    this.toLoad = 0;
                    console.log("Assets loaded!");

                    resolve();
                }
            };

            console.log("Loading assets...");

            this.toLoad = sources.length;

            sources.forEach(source => {
                let extension = source.split('.').pop();

                if(this.imageExtensions.indexOf(extension) !== -1) {
                    this.loadImage(source, loadHandler);
                }
                else if(this.fontExtensions.indexOf(extension) !== -1) {
                    this.loadFont(source, loadHandler);
                }
                else if(this.jsonExtensions.indexOf(extension) !== -1) {
                    this.loadJson(source, loadHandler);
                }
                else if(this.audioExtensions.indexOf(extension) !== -1) {
                    this.loadSound(source, loadHandler);
                }
                else {
                    console.log("File type not recognized: " + source);
                }
            });
        });
    },

    loadImage(source, loadHandler) {
        let image = new Image();
        image.addEventListener("load", loadHandler, false);
        this[source] = image;
        image.src = source;
    },

    loadFont(source, loadHandler) {
        let fontFamily = source.split('/').pop().split('.')[0];

        let newStyle = document.createElement("style");
        let fontFace = 
                "@font-face {font-family: '" + fontFamily + "'; src: url('" + source + "');}";
        
        newStyle.appendChild(document.createTextNode(fontFace));
        document.head.appendChild(newStyle);

        loadHandler();
    },

    loadJson(source, loadHandler) {
        let xhr = new XMLHttpRequest();
        xhr.open("GET", source, true);
        xhr.responseType = "text";

        xhr.onload = event => {
            if(xhr.status === 200) {
                let file = JSON.parse(xhr.responseText);
                file.name = source;
                this[file.name] = file;

                if(file.sprites) {
                    this.createSpriteSheet(file, source, loadHandler);
                } else {
                    loadHandler();
                }
            }
        };

        xhr.send();
    },

    createSpriteSheet(file, source, loadHandler) {
        let baseUrl = source.replace(/[^/]*$/, "");
        let imageSource = baseUrl + file.imagePath;

        let imageLoadHandler = () => {
            this[imageSource] = image;

            Object.keys(file.sprites).forEach(sprite => {
                this[sprite] = file.sprites[sprite];
                this[sprite].source = image;
            });

            loadHandler();
        };

        let image = new Image();
        image.addEventListener("load", imageLoadHandler, false);
        image.src = imageSource;
    },

    loadSound(source, loadHandler) {
        console.log("Not yet implemented!");

        loadHandler();
    }
}

function contain(sprite, bounds, bounce = false, extra = undefined) {
    let x = bounds.x,
        y = bounds.y,
        width = bounds.width,
        height = bounds.height;

    let collision;

    if(sprite.x < x) {
        if(bounce) sprite.vx *= -1;
        if(sprite.mass) sprite.vx /= sprite.mass;

        sprite.x = x;
        collision = "left";
    }

    if(sprite.y < y) {
        if(bounce) sprite.vy *= -1;
        if(sprite.mass) sprite.vy /= sprite.mass;

        sprite.y = y;
        collision = "top";
    }

    if(sprite.x + sprite.width > width) {
        if(bounce) sprite.vx *= -1;
        if(sprite.mass) sprite.vx /= sprite.mass;

        sprite.x = width - sprite.width;
        collision = "right";
    }

    if(sprite.y + sprite.height > height) {
        if(bounce) sprite.vy *= -1;
        if(sprite.mass) sprite.vy /= sprite.mass;

        sprite.y = height - sprite.height;
        collision = "bottom";
    }

    if(collision && extra) extra(collision);

    return collision;
}

function capturePreviousPositions(stage) {
    stage.children.forEach(sprite => {
        setPreviousPosition(sprite);
    });

    function setPreviousPosition(sprite) {
        sprite.previousX = sprite.x;
        sprite.previousY = sprite.y;

        if(sprite.children && sprite.children.length > 0) {
            sprite.children.forEach(child => {
                setPreviousPosition(child);
            });
        }
    }
}

function distance(s1, s2) {
    let vx = s2.centerX - s1.centerX,
        vy = s2.centerY - s1.centerY;
    
    return Math.sqrt(vx * vx + vy * vy);
}

function followEase(follower, leader, speed) {
    let vx = leader.centerX - follower.centerX,
        vy = leader.centerY - follower.centerY,
        distance = Math.sqrt(vx * vx + vy * vy);
    if(distance >= 1) {
        follower.x += vx * speed;
        follower.y += vy * speed;
    }
}

function followConstant(follower, leader, speed) {
    let vx = leader.centerX - follower.centerX,
        vy = leader.centerY - follower.centerY,
        distance = Math.sqrt(vx * vx + vy * vy);
    if(distance >= speed) {
        follower.x += (vx / distance) * speed;
        follower.y += (vy / distance) * speed;
    }
}

function angle(s1, s2) {
    return Math.atan2(
        s2.centerX - s1.centerX,
        s2.centerY - s1.centerY
    );
}

function rotateSprite(rotatingSprite, centerSprite, distance, angle) {
    rotatingSprite.x = centerSprite.centerX - rotatingSprite.parent.x
                        + (distance * Math.cos(angle))
                        - rotatingSprite.halfWidth;
    rotatingSprite.y = centerSprite.centerY - rotatingSprite.parent.y
                        + (distance * Math.sin(angle))
                        - rotatingSprite.halfWidth;
}

function rotatePoint(pointX, pointY, distanceX, distanceY, angle) {
    let point = {};

    point.x = pointX + Math.cos(angle) * distanceX;
    point.y = pointY + Math.sin(angle) * distanceY;

    return point;
}