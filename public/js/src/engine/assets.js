let tilesheet = {
    load(url) {
        return new Promise(resolve => {
            let loadHandler = () => {
                resolve();
            };

            this.loadJSON(url, loadHandler);
        });
    },

    loadJSON(url, loadHandler){
        let xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.responseType = "text";

        xhr.onload = e => {
            if(xhr.status === 200) {
                let file = JSON.parse(xhr.responseText);
                file.name = url;
                this[file.name] = file;

                if(file.sprites) {
                    this.createTileset(file, url, loadHandler);
                } else {
                    loadHandler();
                }
            }
        };

        xhr.send();
    },

    createTileset(file, url, loadHandler) {
        let baseUrl = url.replace(/[^\/]*$/, "");
        let imgSrc = baseUrl + file.imagePath;

        let imageLoadHandler = () => {
            this[imgSrc] = image;

            Object.keys(file.sprites).forEach(sprite => {
                this[sprite] = file.sprites[sprite];
                this[sprite].source = image;
            });

            loadHandler();
        };

        let image = new Image();
        image.addEventListener("load", imageLoadHandler, false);
        image.src = imgSrc;
    }
};