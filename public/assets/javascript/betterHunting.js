const mapWidth = 500;
const mapHeight = 500;
let frameRate = 60;

let viewport = {width: 0, height: 0, innerWindow: {width: 1/4, height: 1/4}, x: 488, y: 494}
let map = {};
let hunter = {};
let mokeballs = [];
let animals = [];
var canvas;
var ctx;
var mapHexWidth, mapHexHeight;

class Mokeball {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.image = document.createElement('img');
        this.image.src = "./assets/images/mokeball.png";
        this.size = 6;
        this.apparentSize = 16;
        this.speed = 7;
        this.range = 8;
        this.bounced = 0;
        this.bounces = 2;
        this.gravity = .5;
        this.bounceFactor = 1/3;
    }
    throw(target) {
        clearInterval(this.throwInterval);
        clearTimeout(this.vanishTimeout);
        this.visible = true;
        this.target = target;
        this.x = hunter.x + hunter.offset.x + 0.5;
        this.y = hunter.realY;
        this.z = -0.5;
        let xdist = (this.target.x - this.x) * .75;
        let ydist = this.target.y - this.y;
        let dist = Math.sqrt(xdist ** 2 + ydist ** 2);
        if (dist > this.range) {
            let fraction = this.range / dist;
            ydist *= fraction;
            xdist *= fraction;
            dist = this.range;
        }
        this.movement = {
            x: (xdist * 1.333) / dist * this.speed / frameRate,
            y: ydist / dist * this.speed / frameRate,
            z: dist / this.speed / 2 * this.gravity,
            perFrame: this.speed / frameRate,
            total: 0,
            max: dist
        }

        this.throwInterval = setInterval(() => {
            this.x += this.movement.x;
            this.y += this.movement.y;
            this.z += this.movement.z;
            this.movement.z -= this.gravity / frameRate;

            this.movement.total += this.movement.perFrame;

            // this.z = Math.sqrt((this.movement.max / 2  - Math.abs(this.movement.max / 2 - this.movement.total)) / 2) || 0 ;
            this.apparentSize = (this.size * (this.z + 1) / 2 + 10) * Math.max($(document).width(), $(document).height()) / 1280;

            if (this.movement.total > this.movement.max) {
                this.land();
                this.bounce();
            }
        }, 1000 / frameRate);
        return this;
    }
    bounce() {
        if (this.bounced < this.bounces) {
            this.movement = {
                ...this.movement,
                x: this.movement.x * this.bounceFactor,
                y: this.movement.y * this.bounceFactor,
                z: -this.movement.z * this.bounceFactor,
                max: this.movement.max * this.bounceFactor,
                total: 0,
            }
            this.bounced += 1;
        }
        else {
            this.vanishTimeout = setTimeout(() => {
                this.visible = false;
            }, 1000);
            clearInterval(this.throwInterval);
        }
    }
    land() {
        animals.forEach((animal, n) => {
            let margin = 1 / (animal.width + animal.height) * 2 - .75;
            if (animal._onScreen) {
                if (animal.x + animal.offset.x < this.x + margin && animal.realY < this.y + margin) {
                    if (animal.x + animal.offset.x + animal.width > this.x - margin && animal.realY + animal.height > this.realY - margin) {
                        console.log("you caught: ", animal.type + "!", `(${n})`)
                    }
                }
            }
        })
    }
    get realX() {
        return this.x * .866;
    }
    get realY() {
        return this.y;
    }
}

class Character {
    constructor(type, x, y) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.destination = {x: this.x, y: this.y};
        this.offset = {x: 0, y: 0};
        this.realX = map.nodes[this.x][this.y].x;
        this.realY = map.nodes[this.x][this.y].y;
        this.travelFrames = 0;
        this.moving = false;
    }
    move() {
        if (this.x !== this.destination.x || this.y !== this.destination.y) {
            this.moving = true;
            if (this.travelFrames === 0) {
                this.offset = {x: 0, y: 0};
                this.throwing = false;
                // console.log(this.x, this.y);

                if (this.nextNode) {
                    this.x = this.nextNode.xindex;
                    this.y = this.nextNode.yindex;
                    this.realX = map.nodes[this.x][this.y].x;
                    this.realY = map.nodes[this.x][this.y].y;
                }
                if (this.y === this.destination.y && this.x === this.destination.x) return;
                else {
                    // let currentDirection = this.direction || {index: -10};
                    this.direction = findPath(this, this.destination);
                    // don't do a 180 course reversal. just don't. it looks stupid and gets you stuck in a loop.
                    // if (Math.abs(this.direction.index - currentDirection.index) === 3) {
                    //     this.direction = currentDirection;
                    // }
                    if (this.direction.x === 0 && this.direction.y === 0) {
                        this.destination = {x: this.x, y: this.y}
                        return;
                    }
                    this.nextNode = map.nodes[this.x + this.direction.x][this.y + this.direction.y];
                    let xdist = this.nextNode.x - map.nodes[this.x][this.y].x;
                    let ydist = this.nextNode.y - map.nodes[this.x][this.y].y;
                    let direction_distance = Math.sqrt(xdist ** 2 + ydist ** 2);
                    this.travelFrames = Math.ceil(direction_distance / this.speed * this.frameRate);
                    this.travelX = xdist / this.travelFrames / .866;
                    this.travelY = ydist / this.travelFrames;
                }
            }
            this.travelFrames --;
            this.offset.x += this.travelX;
            this.offset.y += this.travelY;
            this.realY += this.travelY;
            this.realX += this.travelX;
        }
        else {
            this.moving = false;
            if (this.direction) this.direction.index = -10;
        }
    }
}

class Hunter extends Character {
    constructor(x, y) {
        super('human', x, y);
        this.speed = 2.5;
        this.frameRate = 60;
        this.image = $("<img>").attr('src', './assets/images/hunter.png')[0];
        this.moveInterval = setInterval(() => {this.move()}, 1000 / this.frameRate);
    }
    move() {
        super.move();
        viewport.upperbound = {
            x: this.x + this.offset.x - viewport.width / 2 + viewport.width * viewport.innerWindow.width / 2,
            y: this.realY - viewport.height / 2 + viewport.height * viewport.innerWindow.height / 2
        }
        viewport.lowerbound = {
            x: this.x + this.offset.x - viewport.width / 2 - viewport.width * viewport.innerWindow.width / 2,
            y: this.realY - viewport.height / 2 - viewport.height * viewport.innerWindow.height / 2
        }
        viewport.x = Math.min(Math.max(Math.min(viewport.x, viewport.upperbound.x), viewport.lowerbound.x, 0), mapWidth - viewport.width - 1)
        viewport.y = Math.min(Math.max(Math.min(viewport.y, viewport.upperbound.y), viewport.lowerbound.y, 0), mapHeight - viewport.height - 1)
    }
}

class Animal extends Character {
    constructor(type, x, y) {
        super(type, x, y);
        this.frameRate = 60;
        this.image = $("<img>").attr('src', `./assets/images/animals/${type}.png`)[0];
        this.imageFrame = {x: 0, y: 0};
        if (type === "deer") {
            this.imageHeight = 300;
            this.imageWidth = 300;
            this.width = 1;
            this.height = 1;
            this.speed = 3.5;
        }
        this._onScreen = false;
        this.rotation = 0;
        this.frameRate = this.onScreen ? 30 : 1; // keep it here until the animal comes on screen
        this.move();
    }
    move() {
        // wander around
        if (!this.moving) {
            this.destination.x = Math.floor(Math.random() * mapWidth);
            this.destination.y = Math.floor(Math.random() * mapHeight);
        }

        super.move();
        // maintain a reasonable framerate only when visible
        if (this.travelFrames === 0) {
            this.frameRate = this.onScreen ? 30 : this.speed;
        }
        setTimeout(() => {
            this.move();
        }, 1000 / this.frameRate);

        // face the correct direction
        if (this.direction.x > 0 || this.direction.x === 0 && this.direction.y > 0) {
            this.imageFrame.y = 1;
        }
        else {
            this.imageFrame.y = 0;
        }
    }
    get onScreen() {
        this._onScreen = false;
        if (this.x + this.width > viewport.x && this.y + this.height > viewport.y) {
            if (this.x < viewport.x + viewport.width && this.y < viewport.y + viewport.height) {
                this._onScreen = true;
            }
        }
        return this._onScreen;
    }
}

$(document).ready(() => {
    canvas = $("#canvas");
    ctx = canvas[0].getContext("2d");
    canvas[0].width = canvas.width();
    canvas[0].height = canvas.height();
    mapHexHeight = canvas.width() / viewport.width;
    mapHexWidth = mapHexHeight * .866;

    function sizeCanvas() {
        canvas[0].width = canvas.width();
        canvas[0].height = canvas.height();
        playerWithinViewport = {
            x: (hunter.x - viewport.x) / viewport.width,
            y: (hunter.y - viewport.y) / viewport.height
        }
        if (canvas.width() > canvas.height()) {
            viewport.width = 32;
            viewport.height = 17;
        }
        else {
            viewport.height = 28;
            viewport.width = 20;
        }
        // viewport.width /= .866;

        viewport.x = Math.min(Math.max(0, hunter.x - playerWithinViewport.x * viewport.width), mapWidth - 1);
        viewport.y = Math.min(Math.max(0, hunter.y - playerWithinViewport.y * viewport.height), mapHeight - 1);
        mapHexHeight = canvas.width() / viewport.width * 1.1547;
        mapHexWidth = mapHexHeight * .866;
    }


    loadTrail(trail => {
        loadPlayer(player => {
            let location = trail[trail.map(location => location.name).indexOf(player.currentLocation || "The Forest of Doom")];
            map = genMap(location, () => {
                if (Math.max(canvas.width(), canvas.height()) > 1000 ) requestAnimationFrame(drawCanvas);
                else {
                    frameRate = 30
                    setInterval(() => {
                        drawCanvas();
                    }, 1000 / frameRate);
                }
            });

            hunter = new Hunter(mapWidth/2, mapHeight/2);
            location.prey.forEach(prey => {
                for (let n = 0; n < prey.frequency; n++) {
                    animals.push(new Animal(prey.type, Math.floor(Math.random() * mapWidth), Math.floor(Math.random() * mapHeight)));
                }
            })
            window.addEventListener('resize', sizeCanvas);
            sizeCanvas();
        
            // set player controls

            $(document).click(event => {
                // console.log(event);
                hunter.destination.x = Math.floor((event.clientX - canvas.position().left) / mapHexWidth + viewport.x);
                hunter.destination.y = Math.floor((event.clientY - canvas.position().top) / mapHexHeight + viewport.y - (hunter.destination.x % 2 === 0 ? 0.5 : 0))
    
                // console.log("x", hunter.destination.x, "y", hunter.destination.y);
                if (map.nodes[hunter.destination.x][hunter.destination.y].object) console.log(map.nodes[hunter.destination.x][hunter.destination.y].object.type, "x", hunter.destination.x, "y", hunter.destination.y);
    
                // console.log(findPath(hunter, hunter.destination));
            })
        
            $(document).dblclick(event => {
                mokeballs.push(new Mokeball().throw({
                    x: (event.clientX - canvas.position().left) / mapHexWidth + viewport.x,
                    y: (event.clientY - canvas.position().top) / mapHexHeight + viewport.y
                }))
                hunter.throwing = true;
                hunter.destination.x = hunter.nextNode.xindex;
                hunter.destination.y = hunter.nextNode.yindex;
            })        
        })
    })
})

function drawCanvas() {
    ctx.clearRect(0,0,canvas.width(), canvas.height())

    for (let x = -1; x < viewport.width + 1; x++) {
        for (let y = -1; y < viewport.height + 1; y++) {
            ctx.drawImage(map.nodes[x + Math.floor(viewport.x)][y + Math.floor(viewport.y)].land.image, 
                (x - viewport.x % 1) * mapHexWidth, 
                (y + (map.nodes[x + Math.floor(viewport.x)][y + Math.floor(viewport.y)].xindex % 2 === 0 ? 0.5 : 0) - viewport.y % 1) * mapHexHeight, 
                mapHexHeight * 1.1547, mapHexHeight)
        }
    }

    for (let y = Math.floor(viewport.y) - 1; y < Math.min(viewport.y + viewport.height + 3, mapHeight); y++) {
        for (let x = Math.floor(viewport.x / 2) * 2 - 1; x < viewport.x + viewport.width + 1; x+= 2) {
            if (map.nodes[x][y].object) {
                drawMapObject(map.nodes[x][y].object);
            }
        }
        for (let x = Math.floor(viewport.x / 2) * 2 - 2; x < viewport.x + viewport.width + 1; x+= 2) {
            if (map.nodes[x]) {
                if (map.nodes[x][y].object) {
                    drawMapObject(map.nodes[x][y].object);
                }
            }
        }
    }
    drawHunter();
    drawMokeballs();
    drawAnimals();
    if (frameRate >= 60) requestAnimationFrame(drawCanvas);

}

function drawHunter() {
    let hunterImgSize = 360;
    let hunterFrame = 0;
    if (hunter.travelFrames)  hunterFrame = ((hunter.travelFrames % 10 < 5) ? 1 : 2)
    if (hunter.throwing) hunterFrame = 3
    ctx.drawImage(hunter.image, hunterFrame * hunterImgSize, 0, hunterImgSize, hunterImgSize,
        (hunter.x - viewport.x + hunter.offset.x) * mapHexWidth, 
        (hunter.y - viewport.y + hunter.offset.y + (hunter.x % 2 === 0 ? 0.25 : -0.25)) * mapHexHeight,
        mapHexHeight * 1.1547, mapHexHeight);
}

function drawMapObject(mapObject) {
    if (mapObject.image) {
        if (mapObject.realX - mapObject.imageWidth / 2 < hunter.realX && mapObject.realX + mapObject.imageWidth / 2 > hunter.realX) {
            if (mapObject.realY > hunter.realY && mapObject.realY - mapObject.imageHeight < hunter.realY) {
                ctx.globalAlpha = 0.5;
            }
        }
        ctx.drawImage(mapObject.image, 
            (mapObject.x - viewport.x - mapObject.imageWidth/ 2 + 0.5) * mapHexWidth, 
            (mapObject.y - viewport.y - mapObject.imageHeight + (mapObject.x % 2 === 0 ? 1.25 : 0.75)) * mapHexHeight, 
            mapHexHeight * mapObject.imageWidth, mapHexHeight * mapObject.imageHeight)
        ctx.globalAlpha = 1;
    }
}

function drawAnimals() {
    animals.forEach(animal => {
        if (animal.onScreen) {
            ctx.drawImage(animal.image, animal.imageFrame.x * animal.imageWidth, animal.imageFrame.y * animal.imageHeight, animal.imageWidth, animal.imageHeight,
                (animal.x - viewport.x + animal.offset.x) * mapHexWidth, 
                (animal.y - viewport.y + animal.offset.y + (animal.x % 2 === 0 ? 0.25 : -0.25)) * mapHexHeight,
                animal.width * mapHexHeight, animal.height * mapHexHeight);
        }
    })
}

function drawMokeballs() {
    remainingBalls = [];
    mokeballs.forEach(ball => {
        if (!ball.visible) return;
        ctx.drawImage(ball.image, 
            (ball.x - viewport.x) * mapHexWidth - ball.apparentSize/2, 
            (ball.y - ball.z - viewport.y) * mapHexHeight - ball.apparentSize/2, 
            ball.apparentSize, ball.apparentSize)
        remainingBalls.push(ball)
    })
    mokeballs = remainingBalls;
}

function genMap(terrain, callback) {
    let map = {scenery: {}, backgrounds: [], nodes: []};
    terrain.scenery.forEach((item, i) => {
        if (item.frequency > 0) {
            map.scenery[item.type] = [];
            try {
                map.scenery[item.type] = {type: item.type, images: [], frequency: item.frequency};
                for (let n = 0; n < 5; n++) {
                    map.scenery[item.type].images[n] = $("<img>").attr("src", `/assets/images/${item.type}${n}.png`)[0];
                }
            }
            catch{
                map.images[item.type] = undefined;
            }
        }
    })

    // loading background images
    for (let n =0; n < 3; n++) {
        map.backgrounds[n] = $("<img>").attr("src", `/assets/images/land tiles/${terrain.type}${n}.png`)[0]
    }
    // debug image with clear hex borders
    let landImage = $("<img>").attr('src', './assets/images/land tiles/image1.png')[0];


    for (let x = -1; x < mapWidth; x++) {
        map.nodes[x] = [];
        for (let y = -1; y < mapHeight; y++) {
            map.nodes[x][y] = {
                land: {
                    image: map.backgrounds[Math.floor(Math.random() * map.backgrounds.length)]
                },
                x: x * .866,
                y: y + (x % 2 === 0 ? 0.5 : 0),
                xindex: x,
                yindex: y
            };

            Object.keys(map.scenery).forEach(index => {
                let item = map.scenery[index];
                if (!map.nodes[Math.max(x-1, -1)][y].object 
                && !map.nodes[x][Math.max(y-1,-1)].object 
                && !map.nodes[Math.max(x-1, -1)][Math.max(x-1, -1)].object 
                && Math.random() * 100 < item.frequency) {
                    map.nodes[x][y].object = {
                        image: item.images[Math.floor(Math.random() * 5)],
                        type: item.type,
                        imageWidth: 4,
                        imageHeight: 4,
                        x: x,
                        y: y,
                        realX: map.nodes[x][y].x,
                        realY: map.nodes[x][y].y
                    }
    
                    if (item.type === "rock") {
                        map.nodes[x][y].object.imageHeight = .25 + Math.random() * .5;
                        map.nodes[x][y].object.imageWidth = .25 + Math.random() * .5;
                    }
                    else if (item.type === "cactus") {
                        map.nodes[x][y].object.imageHeight = 2;
                        map.nodes[x][y].object.imageWidth = 1;
                    }
                }
            })
        }
    }
    console.log(map.images);
    if (callback) setTimeout(() => callback(map), 100 );
    return map;
}


function findPath(startingNode, destinationNode) {
    let directions = [];
    let startingPoint = {x: map.nodes[startingNode.x][startingNode.y].x, y: map.nodes[startingNode.x][startingNode.y].y};
    let destinationPoint = {x: map.nodes[destinationNode.x][destinationNode.y].x, y: map.nodes[destinationNode.x][destinationNode.y].y};
    if (startingNode.x % 2 === 0) {
        directions = [
            {x: 0, y: -1},
            {x: 1, y: 0},
            {x: 1, y: 1},
            {x: 0, y: 1},
            {x: -1, y: 1},
            {x: -1, y: 0},

            {x: 1, y: -1},
            {x: 2, y: 0},
            {x: 1, y: 2},
            {x: -1, y: 2},
            {x: -2, y: 0},
            {x: -1, y: -1},
        ]
    }
    else {
        directions = [
            {x: 0, y: -1},
            {x: 1, y: -1},
            {x: 1, y: 0},
            {x: 0, y: 1},
            {x: -1, y: 0},
            {x: -1, y: -1},

            {x: 1, y: -2},
            {x: 2, y: 0},
            {x: 1, y: 1},
            {x: -1, y: 1},
            {x: -2, y: 0},
            {x: -1, y: -2}
        ]
    }
    for (let n = 0; n < 12; n++) {
        if (n > 5) {
            directions[n].blockers = [n - 6, (n - 5) % 6]
            directions[n].distFactor = .577;
        }
    }
    // find the available direction which gets us closest
    let bestDistance = Infinity;
    let bestDirection = -1;
    for (let n = 0; n < directions.length; n++) {
        let x = startingNode.x + directions[n].x;
        let y = startingNode.y + directions[n].y;
        if (x >= 0 && x < mapWidth && y >= 0 && y < mapHeight) {
            if (!map.nodes[x][y].object) {
                let blocked = false;
                if (directions[n].blockers) {
                    directions[n].blockers.forEach(d => {
                        let x = startingNode.x + directions[d].x;
                        let y = startingNode.y + directions[d].y;
                        if (x >= 0 && x < mapWidth && y >= 0 && y < mapHeight) {
                            if (map.nodes[startingNode.x + directions[d].x][startingNode.y + directions[d].y].object){
                                blocked = true;
                            }
                        }
                    })
                }
                if (!blocked) {
                    let moveToPoint = {
                        x: map.nodes[x][y].x,
                        y: map.nodes[x][y].y
                    }
                    let xdist = destinationPoint.x - startingPoint.x - (moveToPoint.x - startingPoint.x) * (directions[n].distFactor || 1);
                    let ydist = destinationPoint.y - startingPoint.y - (moveToPoint.y - startingPoint.y) * (directions[n].distFactor || 1);
            
                    let dist = xdist ** 2 + ydist ** 2;
                    if (dist < bestDistance) {
                        bestDistance = dist;
                        bestDirection = n;
                    }
                }
            }
            else if (x === destinationNode.x && y === destinationNode.y && n < 6) {
                return {x: 0, y: 0}
            }
        }
    }
    return {...directions[bestDirection], index: bestDirection};
}