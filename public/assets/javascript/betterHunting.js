const mapWidth = 1000;
const mapHeight = 1000;
const frameRate = 60;

let viewport = {width: 26, height: 14, x: 488, y: 494}
let map = {};
let hunter = {x: 500, y: 500}

class Mokeball {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.image = document.createElement('img');
        this.image.src = "./assets/images/mokeball.png";
        this.width = 16;
        this.height = 16;
        this.speed = 7;
        this.range = 10;
    }
    throw(target) {
        clearInterval(this.throwInterval);
        this.target = target;
        this.x = hunter.x + hunter.offset.x + 0.5;
        this.y = hunter.realY - 0.5;
        let xdist = this.target.x - this.x;
        let ydist = this.target.y - this.y;
        let dist = Math.sqrt(xdist ** 2 + ydist ** 2);
        if (dist > this.range) {
            let fraction = this.range / dist;
            ydist *= fraction;
            xdist *= fraction;
            dist = this.range;
        }
        this.movement = {
            x: xdist / dist * this.speed / frameRate,
            y: ydist / dist * this.speed / frameRate,
            perFrame: this.speed / frameRate,
            total: 0,
            max: dist
        }

        this.throwInterval = setInterval(() => {
            this.x += this.movement.x;
            this.y += this.movement.y;
            this.movement.total += this.movement.perFrame;
            if (this.movement.total > this.movement.max) {
                clearInterval(this.throwInterval);
            }
        }, 1000 / frameRate);
    }
}
const mokeball = new Mokeball(-1, -1);

$(document).ready(() => {
    const canvas = $("#canvas");
    const ctx = canvas[0].getContext("2d");
    canvas[0].width = canvas.width();
    canvas[0].height = canvas.height();
    let mapHexHeight = canvas.width() / viewport.width;
    let mapHexWidth = mapHexHeight * .866;


    function sizeCanvas() {
        canvas[0].width = canvas.width();
        canvas[0].height = canvas.height();
        playerWithinViewport = {
            x: (hunter.x - viewport.x) / viewport.width,
            y: (hunter.y - viewport.y) / viewport.height
        }
        if (canvas.width() > canvas.height()) {
            viewport.width = 39;
            viewport.height = 21;
        }
        else {
            viewport.height = 39;
            viewport.width = 24;
        }
        // viewport.width /= .866;

        viewport.x = Math.min(Math.max(0, hunter.x - playerWithinViewport.x * viewport.width), mapWidth - 1);
        viewport.y = Math.min(Math.max(0, hunter.y - playerWithinViewport.y * viewport.height), mapHeight - 1);
        mapHexHeight = canvas.width() / viewport.width * 1.1547;
        mapHexWidth = mapHexHeight * .866;
    }
    window.addEventListener('resize', sizeCanvas);
    sizeCanvas();


    loadTrail(trail => {
        loadPlayer(player => {
            hunter.currentLocation = "The Forest of Doom";
            hunter.destination = {x: hunter.x, y: hunter.y};
            hunter.speed = 2.5;
            hunter.offset = {x: 0, y: 0};
            hunter.travelFrames = 0;
            hunter.image = $("<img>").attr('src', './assets/images/hunter.png')[0];

            map = genMap(trail[trail.map(location => location.name).indexOf(hunter.currentLocation)]);
    
            hunter.realX = map.nodes[hunter.x][hunter.y].x;
            hunter.realY = map.nodes[hunter.x][hunter.y].y;

            $(document).click(event => {
                // console.log(event);
                hunter.destination.x = Math.floor((event.clientX - canvas.position().left) / mapHexWidth + viewport.x);
                hunter.destination.y = Math.floor((event.clientY - canvas.position().top) / mapHexHeight + viewport.y - (hunter.destination.x % 2 === 0 ? 0.5 : 0))

                // directions.push({x: player.destination.x - player.x, y: player.destination.y - player.y})

                console.log("x", hunter.destination.x, "y", hunter.destination.y);
                if (map.nodes[hunter.destination.x][hunter.destination.y].object) console.log(map.nodes[hunter.destination.x][hunter.destination.y].object.type);

                // console.log(findPath(hunter, hunter.destination));
            })
        
            $(document).dblclick(event => {
                mokeball.throw({
                    x: (event.clientX - canvas.position().left) / mapHexWidth + viewport.x,
                    y: (event.clientY - canvas.position().top) / mapHexHeight + viewport.y
                })
                hunter.throwing = true;
                hunter.destination.x = hunter.nextNode.xindex;
                hunter.destination.y = hunter.nextNode.yindex;
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

                for (let y = Math.floor(viewport.y) - 1; y < Math.min(viewport.y + viewport.height + 2, mapHeight); y++) {
                    for (let x = Math.floor(viewport.x / 2) * 2 - 1; x < viewport.x + viewport.width + 1; x+= 2) {
                        if (map.nodes[x][y].object) {
                            drawMapObject(map.nodes[x][y].object);
                        }
                    }
                    for (let x = Math.floor(viewport.x / 2) * 2; x < viewport.x + viewport.width + 1; x+= 2) {
                        if (map.nodes[x][y].object) {
                            drawMapObject(map.nodes[x][y].object);
                        }
                    }
                }
                drawHunter();
                drawMokeball();
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
                    requestAnimationFrame(drawCanvas);
            }

            function drawMapObject(mapObject) {
                if (mapObject.image) {
                    if (mapObject.realX - mapObject.width / 2 < hunter.realX && mapObject.realX + mapObject.width / 2 > hunter.realX) {
                        if (mapObject.realY > hunter.realY && mapObject.realY - mapObject.height < hunter.realY) {
                            ctx.globalAlpha = 0.5;
                        }
                    }
                    ctx.drawImage(mapObject.image, 
                        (mapObject.x - viewport.x - mapObject.width/ 2 + 0.5) * mapHexWidth, 
                        (mapObject.y - viewport.y - mapObject.height + (mapObject.x % 2 === 0 ? 1.25 : 0.75)) * mapHexHeight, 
                        mapHexHeight * mapObject.width, mapHexHeight * mapObject.height)
                    ctx.globalAlpha = 1;
                }
            }

            function drawMokeball() {
                ctx.drawImage(mokeball.image, 
                    (mokeball.x - viewport.x) * mapHexWidth - mokeball.width/2, 
                    (mokeball.y - viewport.y) * mapHexHeight - mokeball.height/2, 
                    mokeball.width, mokeball.height)
            }

            requestAnimationFrame(drawCanvas);

            setInterval(() => {
                if (hunter.x !== hunter.destination.x || hunter.y !== hunter.destination.y) {
                    if (hunter.travelFrames === 0) {
                        hunter.offset = {x: 0, y: 0};
                        hunter.throwing = false;
                        if (hunter.nextNode) {
                            hunter.x = hunter.nextNode.xindex;
                            hunter.y = hunter.nextNode.yindex;
                            hunter.realX = map.nodes[hunter.x][hunter.y].x;
                            hunter.realY = map.nodes[hunter.x][hunter.y].y;
                        }
                        if (hunter.y === hunter.destination.y && hunter.x === hunter.destination.x) return;
                        else {
                            hunter.direction = findPath(hunter, hunter.destination);
                            if (hunter.direction.x === 0 && hunter.direction.y === 0) {
                                hunter.destination = {x: hunter.x, y: hunter.y}
                                return;
                            }
                            hunter.nextNode = map.nodes[hunter.x + hunter.direction.x][hunter.y + hunter.direction.y];
                            let xdist = hunter.nextNode.x - map.nodes[hunter.x][hunter.y].x;
                            let ydist = hunter.nextNode.y - map.nodes[hunter.x][hunter.y].y;
                            let direction_distance = Math.sqrt(xdist ** 2 + ydist ** 2);
                            hunter.travelFrames = Math.ceil(direction_distance / hunter.speed * frameRate);
                            hunter.travelX = xdist / hunter.travelFrames / .866;
                            hunter.travelY = ydist / hunter.travelFrames;
                        }
                    }
                    hunter.travelFrames --;
                    hunter.offset.x += hunter.travelX;
                    hunter.offset.y += hunter.travelY;
                    hunter.realY += hunter.travelY;
                    hunter.realX += hunter.travelX;
                    if (hunter.x + hunter.offset.x < viewport.x + viewport.width / 3) {
                        viewport.x = Math.max(hunter.x + hunter.offset.x - viewport.width / 3, 1);
                    }
                    if (hunter.x + hunter.offset.x > viewport.x + viewport.width * .666) {
                        viewport.x = Math.min(hunter.x + hunter.offset.x - viewport.width * .666, mapWidth - 1 - viewport.width);
                    }
                    if (hunter.realY < viewport.y + viewport.height / 3) {
                        viewport.y = Math.max(hunter.realY - viewport.height / 3, 1);
                    }
                    if (hunter.realY > viewport.y + viewport.height * .666) {
                        viewport.y = Math.min(hunter.realY - viewport.height * .666, mapHeight - 1 - viewport.height);
                    }
                }
            }, 1000 / frameRate);
        
        })
    })
})

function genMap(terrain) {
    let map = {scenery: {}, backgrounds: [], nodes: []};
    terrain.scenery.forEach((item, i) => {
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
                if (Math.random() * 100 < item.frequency) {
                    map.nodes[x][y].object = {
                        image: item.images[Math.floor(Math.random() * 5)],
                        type: item.type,
                        width: 3,
                        height: 3,
                        x: x,
                        y: y,
                        realX: map.nodes[x][y].x,
                        realY: map.nodes[x][y].y
                    }
    
                    if (item.type === "rock") {
                        map.nodes[x][y].object.height = .75;
                        map.nodes[x][y].object.width = .75;
                    }
                    else if (item.type === "cactus") {
                        map.nodes[x][y].object.height = 2;
                        map.nodes[x][y].object.width = 1;
                    }
                }
            })
        }
    }
    console.log(map.images);
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
                        if (map.nodes[startingNode.x + directions[d].x][startingNode.y + directions[d].y].object){
                            blocked = true;
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
    return directions[bestDirection];
}