let actx = new AudioContext();

class Sound {
    constructor(source, loadHandler) {
        this.source = source;
        this.loadHandler = loadHandler;

        this.actx = actx;
        this.volumeNode = this.actx.createGain();
        this.panNode = this.actx.createStereoPanner();
        this.soundNode = null;
        this.buffer = null;
        this.loop = false;
        this.playing = false;

        this.panValue = 0;
        this.volumeValue = 1;

        this.startTime = 0;
        this.startOffset = 0;

        this.load();
    }

    load() {
        let xhr = new XMLHttpRequest();
        xhr.open("GET", this.source, true);
        xhr.responseType = "arraybuffer";
        xhr.addEventListener("load", () => {
            this.actx.decodeAudioData(
                xhr.response,
                buffer => {
                    this.buffer = buffer;
                    this.hasLoaded = true;

                    if(this.loadHandler) {
                        this.loadHandler();
                    }
                },
                error => {
                    throw new Error("Audio could not be decoded: "+error);
                }
            )
        });

        xhr.send();
    }

    play() {
        this.startTime = this.actx.currentTime;
        this.soundNode = this.actx.createBufferSource();

        this.soundNode.buffer = this.buffer;

        this.soundNode.connect(this.volumeNode);
        this.volumeNode.connect(this.panNode);
        this.panNode.connect(this.actx.destination);

        this.soundNode.loop = this.loop;

        this.soundNode.start(
            this.startTime,
            this.startOffset % this.buffer.duration
        );

        this.playing = true;
    }

    pause() {
        if(this.playing) {
            this.soundNode.stop(this.actx.currentTime);
            this.startOffset += this.actx.currentTime - this.startTime;
            this.playing = false;
        }
    }

    restart() {
        if(this.playing) {
            this.soundNode.stop(this.actx.currentTime);
        }
        this.startOffset = 0;
        this.play();
    }

    playFrom(value) {
        if(this.playing) {
            this.soundNode.stop(this.actx.currentTime);
        }
        this.startOffset = value;
        this.play();
    }

    get volume() {
        return this.volumeValue;
    }
    set volume(value) {
        this.volumeNode.gain.value = value;
        this.volumeValue = value;
    }

    get pan() {
        return this.panValue;
    }
    set pan(value) {
        this.panNode.pan.value = value;
        this.panValue = value;
    }
}

export function makeSound(source, loadHandler) {
    return new Sound(source, loadHandler);
}