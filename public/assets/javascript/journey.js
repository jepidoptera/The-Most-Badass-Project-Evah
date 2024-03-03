// jshint esversion: 6
// jshint multistr: true
var trailHeight
var horizonHeight

var timeSpeed = 0.05
var canvas
var gameInterval
const playerName = "{{name}}"
const daysTilEclipse = 99
var sunup = false

var trail
var mokeInfo

class SceneObject {
    constructor(params) {
        this.type = params.type
        this.frequency = params.frequency
        this.lastPosition = -Infinity
        this.index = 0
        this.solid = params.solid
        if (params.height && params.width) {
            this.sizeRange = {
                min: {x: params.width, y: params.height}, 
                max: {x: params.width, y: params.height}
            }
        }
        else this.sizeRange = params.sizeRange;
        this.distance = params.distance || (() => 1);
        this.images = [];
        this.offset = params.offset;
        if (params.image) {
            this.images = [$("<img>").attr("src", params.image)[0]];
        }
        else {
            for (let n = params.imgRange.min; n <= params.imgRange.max; n++) {
                this.images.push($("<img>").attr("src", './assets/images/scenery/' + this.type + n + ".png")[0])
            }
        }
        return this
    }
    /**
     * @returns {number}
     */
    get distance() {return this._distance(this.index)}
    set distance(newFunction) {this._distance = newFunction}
}

const SceneObjects = {
    "rock": {
        type: "rock",
        spacing: 0,
        sizeRange: { min: { x: 10, y: 5 }, max: { x: 100, y: 50 } },
        imgRange: { min: 0, max: 3 },
        distance: () => Math.random() * canvas.north_horizon,
    },
    "mountain": {
        type: "mountain",
        sizeRange: { min: { x: 400, y: 300 }, max: { x: 800, y: 500 } },
        imgRange: { min: 0, max: 4 },
        distance: (y) => y % 7 == 0 ? -300 : Math.random() * canvas.north_horizon
    },
    "mountain range": {
        type: "mountain range",
        height: 350,
        width: 1600,
        image: './assets/images/scenery/big mountain.png',
        distance: () => Math.random() * canvas.north_horizon,
    },
    "first mountain": {
        type: "mountain range",
        height: 350,
        width: 1600,
        image: './assets/images/scenery/big mountain.png',
        distance: () => 2,
    },
    "pokegonemon": {
        type: "city",
        image: './assets/images/scenery/pokegonemon.png',
        height: 500,
        width: 1500,
        distance: () => 0
    },
    "palm tree": {
        type: "palm tree",
        sizeRange: {min: {x: 80, y: 160}, max: {x: 240, y: 360}},
        imgRange: {min: 0, max: 4},
        distance: () => canvas.south_horizon + Math.sqrt(Math.random()) * (canvas.north_horizon - canvas.south_horizon),
    },
    "fern": {
        type: "fern",
        sizeRange: {min: {x: 60, y: 60}, max: {x: 100, y: 100}},
        imgRange: {min: 0, max: 4},
        distance: () => canvas.south_horizon + Math.random() * (canvas.north_horizon / 2 - canvas.south_horizon),
    },
    "cactus": {
        type: "cactus",
        sizeRange: {min: {x: 25, y: 25}, max: {x: 100, y: 100}},
        imgRange: {min: 0, max: 4},
        distance: () => canvas.south_horizon + Math.random() * (canvas.north_horizon - canvas.south_horizon)
    },
    "house": {
        type: "house",
        sizeRange: {min: {x: 40, y: 40}, max: {x: 65, y: 65}},
        imgRange: {min: 0, max: 4},
        distance: () => canvas.south_horizon + Math.random() * (canvas.north_horizon / 2 - canvas.south_horizon),
    },
    "tree": {
        type: 'tree',
        sizeRange: {min: {x: 80, y: 160}, max: {x: 360, y: 360}},
        imgRange: {min: 0, max: 5},
        distance: (y) => {
            return y % 17 == 0 ? (((y % 51) / 17 + 1) * -100) : Math.random() * canvas.north_horizon 
        }
    },
    "distant tree": {
        type: 'tree',
        sizeRange: {min: {x: 80, y: 160}, max: {x: 360, y: 360}},
        imgRange: {min: 0, max: 4},
        distance: () => canvas.north_horizon * (0.7 + Math.random() * 0.3)
    },
    "dead tree": {
        type: 'dead tree',
        sizeRange: {min: {x: 80, y: 160}, max: {x: 360, y: 360}},
        imgRange: {min: 0, max: 8},
        distance: () => canvas.south_horizon + Math.random() * (canvas.north_horizon - canvas.south_horizon)
    },
    "cattails": {
        type: 'cattails',
        sizeRange: {min: {x: 80, y: 50}, max: {x: 150, y: 100}},
        imgRange: {min: 1, max: 4},
        distance: () => canvas.south_horizon + Math.random() * (canvas.north_horizon - canvas.south_horizon)
    },
    "pine tree": {
        type: 'pine tree',
        sizeRange: {min: {x: 60, y: 120}, max: {x: 270, y: 270}},
        imgRange: {min: 0, max: 4},
        distance: () => Math.max((Math.random() * 1.1 - 0.1) * canvas.north_horizon, 0)
    },
    "signpost": {
        type: 'signpost',
        height: 50,
        width: 50,
        image: './assets/images/scenery/signpost0.png',
        distance: () => 1,
    },
    "orepoke": {
        type: 'city',
        image: './assets/images/scenery/city0.png',
        height: 300,
        width: 800,
        distance: () => 0,
        solid: true
    },
    "trading post": {
        type: 'trading post',
        image: './assets/images/scenery/trading post.png',
        height: 150,
        width: 150,
        distance: () => 1,
    },
    "oasis": {
        type: 'trading post',
        image: './assets/images/scenery/oasis.png',
        height: 150,
        width: 150,
        distance: () => 1,
    }
}

class Trail {
    constructor(locations) {
        this.locations = locations.map((location, i) => {
            return {
                ...location,
                progress: 0,
                length: location.length || 0,
                scenery: (location.scenery ? location.scenery.map(scenery => 
                        new SceneObject({
                            ...SceneObjects[scenery.type], 
                            frequency: scenery.frequency
                        })
                ) : [])
            }
        })

        this.locations.forEach((location, n) => {
            location.next = this.locations[n+1]
        })
        this.scenery = []
        this.landscapeSegments = []
        this.currentLocation = this.locations[0]
        this.onScreenLocations = []
    }
    loadImages() {
        return Promise.all(this.locations.map(location => {
            return Promise.all([
                new Promise((resolve) => {
                    var source_image = $("<img>")
                    source_image.attr("src", './assets/images/backgrounds/' + location.type + '_intro.png')
                    .on('load' , () => {
                        location.intro_pic = canvas.perspectiveTransform(source_image[0])
                        resolve()
                    })
                    .on('error', () => {
                        resolve()
                    })
                }),
                new Promise((resolve) => {
                    var source_image = $("<img>")
                    source_image.attr("src", './assets/images/backgrounds/' + location.type + '.png')
                    .on('load' , () => {
                        location.landscape = canvas.perspectiveTransform(source_image[0])
                        resolve()
                    })
                    .on('error', () => {
                        resolve()
                    })
                }),
            ])
        }))
    }
    updateLocation() {
        this.atHorizon = this.locationAt(player.progress + canvas.east_horizon / canvas.x_per_hour)
        if (!this.onScreenLocations.includes(this.atHorizon)) {
            this.onScreenLocations.push(this.atHorizon)          
        }
        this.currentLocation = this.locationAt(player.progress)
        this.nextLocation = this.currentLocation.next
        if (this.onScreenLocations[0].x < -this.onScreenLocations[0].length / canvas.metrics.screen_length * canvas.width / canvas.distance_factor) {
            this.onScreenLocations.shift()
        }
    }
    locationAt(progress) {
        let progressTotal = 0
        let location = this.locations[0]
        for (let n in this.locations) {
            progressTotal += this.locations[n].length
            if (progressTotal >= progress) {
                location = this.locations[n]
                location.progress = (this.locations[n].length - progressTotal + progress)
                break
            }
        }
        return location
    }
    travel() {
        const horizon = this.atHorizon
        player.progress += 1 / canvas.metrics.frameRate
        this.updateLocation()
        if (this.atHorizon != horizon) {
            if (this.atHorizon.intro_pic) {
                this.landscapeSegments.push(new landscapeSegment(this.atHorizon.intro_pic, canvas.east_horizon))  
            }
            else if (this.atHorizon.landscape) {
                this.landscapeSegments.push(new landscapeSegment(this.atHorizon.landscape, canvas.east_horizon))
            }
        }
        const lastLand = this.landscapeSegments[this.landscapeSegments.length - 1]
        if (lastLand) {
            if (lastLand.x + lastLand.img.width < canvas.west_horizon) {
                this.landscapeSegments.shift()
            }
            else if (lastLand.x + lastLand.effectiveWidth < canvas.east_horizon && this.atHorizon.landscape) {
                this.landscapeSegments.push(new landscapeSegment(
                    this.atHorizon.landscape, 
                    lastLand.x + lastLand.effectiveWidth / canvas.distance_factor - 1
                ))
            }
        }

        // make new scenery
        this.atHorizon.scenery.forEach(element => {
            if (!element.frequency) {
                // one-off item (sign, trading post)
                if (this.atHorizon != this.currentLocation && this.atHorizon.progress <= 1 / canvas.metrics.frameRate) {
                    this.scenery.push(new backgroundImage(element))
                }
            }
            else {
                // repeating item (trees, rocks, etc.)
                while (
                    Math.random() * element.frequency > Math.random() * 100
                ) {
                    element.lastPosition = player.progress
                    element.index += 1
                    this.scenery.push(new backgroundImage(element))
                }
            }
        })
        // move along existing scenery
        let remainingSceneItems = []
        let scrollSpeed = canvas.width / canvas.metrics.screen_length / canvas.metrics.frameRate
        for (let n in this.landscapeSegments) {
            this.landscapeSegments[n].x -= scrollSpeed // * canvas.scale_at(canvas.south_horizon) 
        }
        for (let n in this.scenery) {
            this.scenery[n].x -= scrollSpeed
            this.scenery[n].scale = canvas.scale_at(this.scenery[n].y)
            if (this.scenery[n].x + this.scenery[n].width > canvas.west_horizon * canvas.distance_factor / this.scenery[n].scale) {
                remainingSceneItems.push(this.scenery[n])
            }
        }
        this.scenery = remainingSceneItems.sort((a, b) => {
            return b.y - a.y
        })
    }
    loadFrom(startingPoint) {
        // this.locations.forEach(location => {if (location.scenery) location.scenery.forEach(item => {item.appeared = false})})
        player.progress = startingPoint - canvas.metrics.screen_length * 3
        while (player.progress < startingPoint) {
            this.travel()
        }
    }
}

class Canvas {
    constructor () {
        // the coordinate system used by this canvas is:
        // player in the center at 0, 0
        // north is positive y
        // this is neat because the player is at the center of our perspective, and we're doing a lot with perspective.
        this._canvas = document.getElementById("canvas")
        this._canvas.width = Math.max(screen.width, screen.height)
        this._canvas.height = this._canvas.width * 0.618
        this.height = this._canvas.height
        this.width = this._canvas.width
        this.trail_height = this.height * 0.05
        this.ctx = this._canvas.getContext('2d')
        this.distance_factor = 1/3  // the ratio in size between an object at trail_y vs one at north_horizon
        this.origin_y = this.height * 0.8
        this.origin_x = this.width / 2
        this.trail_bottom = this.height * 0.85
        this.east_horizon = this.width / this.distance_factor / 2
        this.west_horizon = this.width / this.distance_factor / -2
        this.north_horizon = this.height * 0.4
        this.south_horizon = this.height * -0.2
        this.x_per_hour = this.width / 20
    }
    metrics = {
        frameRate: 30,
        screen_length: 20, // seconds
    }
    draw = () => {
        this.ctx.globalAlpha = 1
        this.origin_x = this._canvas.width / 2
        this.ctx.clearRect(0, 0, this.width, this.height)
        trail.landscapeSegments.forEach(seg => {
            this.paralaxDraw(seg.img, seg.x)
        })

        let mokesDrawn = false
        let processionLength = canvas.width / 100

        trail.scenery.forEach((sceneObject, n) => {
            let scale = this.scale_at(sceneObject.y)
            let {x, y} = this.translate_coordinates(sceneObject.x, sceneObject.y)
            if (!mokesDrawn && (y > this.origin_y || n === trail.scenery.length - 1)) {
                player.posse.forEach((mokemon, n) => {
                    processionLength += mokemon.width + canvas.width/200
                    this.ctx.drawImage(
                        mokemon.img,
                        // 0, 0, // source x, y
                        // mokemon.img.naturalWidth / mokemon.frameCount.x, mokemon.img.naturalHeight / mokemon.frameCount.y, // source width, height
                        parseInt(canvas.origin_x - processionLength), // x
                        parseInt(mokemon.y - mokemon.z), // y
                        mokemon.width, mokemon.height
                    )
                })
                this.ctx.drawImage(
                    player.img,
                    0, player.img.height * parseInt(player.frame) / 5,
                    player.img.width, player.img.height / 5,
                    canvas.origin_x, canvas.origin_y - player.height / 2,
                    player.width, player.height,
                )
                mokesDrawn = true
            }
            let draw_y = y - sceneObject.height * scale
            if (
                // object is in front of the player, so make it transparent
                draw_y < this.origin_y && sceneObject.y < 0 && x < this.origin_x + player.width + 100
                && x + sceneObject.width * scale > this.origin_x - processionLength - 100
                && !sceneObject.solid
            ) {
                // this.ctx.globalAlpha = 0.5
                let margin = 100
                let closeness = Math.min(
                    this.origin_x + player.width + margin - x, 
                    x + sceneObject.width * scale - this.origin_x + processionLength + margin
                )
                this.ctx.globalAlpha = Math.max(0.25, 1 - closeness / margin / 2)
            }
            else { this.ctx.globalAlpha = 1 }
            this.ctx.drawImage(
                sceneObject.img,
                x, draw_y,
                sceneObject.width * scale, sceneObject.height * scale
            )
        })
        requestAnimationFrame(this.draw)
    }
    scale_at(y) {
        // this is y in the trail coordinate system
        return 1 - (1 - this.distance_factor) * y / this.north_horizon
    }
    translate_coordinates(x, y) {
        // translate from trail coordinates (origin at the player, perspective toward horizon) 
        // to canvas coordinates (flat, origin at the top left corner of the canvas)
        if (y < 0) {y -= this.trail_height}
        let scale = this.scale_at(y)
        let return_x = x * scale + this.origin_x
        let return_y = this.origin_y - this.north_horizon + (this.north_horizon - y) // * scale
        // if (return_y < this.north_horizon) {
        //     return_y = this.north_horizon * 2 - return_y
        // }
        return {x: return_x, y: return_y}
    }
    perspectiveTransform(source_image) {
        // warp an image to give it a perspective effect
        var fxcanvas = fx.canvas()
        var texture = fxcanvas.texture(source_image)
        let distance_factor = this.scale_at(this.north_horizon) / this.scale_at(this.south_horizon)
        fxcanvas.draw(texture).perspective(
            [
                -source_image.width * (1 / distance_factor - 1) / 2, 0,
                source_image.width * (1 + (1 / distance_factor - 1) / 2), 0,
                source_image.width, source_image.height,
                0, source_image.height
            ], [
                0, 0,
                source_image.width, 0,
                source_image.width, source_image.height,
                0, source_image.height
            ]
        ).update()
        return fxcanvas
    }
    paralaxDraw(img, x) {
        // this.ctx.drawImage(img, 0, 0, img.width, img.height)
        // return 
        this.ctx.save()
        const draw_height = this.north_horizon - this.south_horizon
        const draw_width = img.width / this.distance_factor  // draw_height * img.width / img.height
        const top_x = x * this.distance_factor + this.origin_x
        const bottom_x = x * this.scale_at(this.south_horizon) + this.origin_x
        // x = ax + cy + e
        this.ctx.translate(0, this.height - draw_height)
        this.ctx.transform(
            1, 0, (1 - this.distance_factor) / 2 * draw_width / draw_height - ((top_x - bottom_x) / draw_height), 
            1, -draw_width * (1 - this.distance_factor) / 2, 0
        )
        // ctx.transform(1, 0, 0.25 * draw_width / draw_height - ((this.top_x - this.bottom_x) / draw_height), 1, -draw_width / 4, 0)

        this.ctx.drawImage(img, top_x, 0, draw_width, draw_height)
        this.ctx.restore()
        // ctx.beginPath()
        // ctx.strokeStyle = 'red'
        // ctx.moveTo(this.top_x, ch / 2)
        // ctx.lineTo(this.bottom_x, ch / 2 + draw_height)
        // ctx.stroke()
    }
}

class mokePosse {
    constructor (name, health = 0, conditions = []) {
        this._hop = player.posse.length * .37;
        this.name = name.slice(0, 1).toUpperCase() + name.slice(1).toLowerCase();
        this.conditions = conditions;
        this.alive = true;
        this.height = mokeInfo[this.name].height
        this.width = mokeInfo[this.name].thumbnailWidth || mokeInfo[this.name].width
        this.frameCount = mokeInfo[this.name].frameCount
        this.foodValue = mokeInfo[this.name].foodValue
        this.hunger = mokeInfo[this.name].hunger
        this.max_hp = mokeInfo[this.name].max_hp
        this.immuneResponse = mokeInfo[this.name].immuneResponse
        this.description = mokeInfo[this.name].description
        this.width *= canvas.width / 48;
        this.height *= canvas.width / 48;
        this.y = trailHeight * canvas.height - this.height;
        this.z = 0;
        this.hp = health || this.max_hp;

        if (!this.img) this.img = $("<img>").attr('src', './assets/images/mokemon/thumbnails/' + name.toLowerCase() + ".png")[0];
        this.bounceHeight = this.height / 2;
        this.index = player.posse.length;
    }
    hop() {
        // hoppin' down the trail
        this.z = (Math.cos(Math.PI * (0.5 + (player.time + this._hop % 0.5))) - 0.5) * this.bounceHeight;
    }
    doConditions() {
        // process any conditions this mokemon may have
        var activeConditions = [];
        this.conditions.forEach((condition) => {
            if (condition.timeRemaining > 0) {
                condition.timeRemaining --;
                if (effects[condition.name]) effects[condition.name](this);
                if (condition.timeRemaining > 0) activeConditions.push(condition);
                else if (condition.timeRemaining <= 0 && condition.type === 'disease') {
                    player.messages.push(`${this.name} recovered from ${condition.name}.`)
                }
            }
        });
        this.conditions = activeConditions;
    }
    die(cause) {
        msgBox('tragedy', `${this.name} ${cause || "has died"}.`, [{
            text: 'ok',
            function: () => {
            } // not much you can do here
        }]);
        player.messages.push(`${this.name} ${cause || "died"}.`)
        player.posse.splice(this.index, 1);
        this.alive = false;
        player.posse.forEach((moke, n) => {
            moke.index = n;
        })        
    }
}

class backgroundImage {
    constructor (prototype) {
        this.x = canvas.east_horizon
        this.img = prototype.images[Math.floor(Math.random() * prototype.images.length)]
        this.distance = prototype.distance
        this.type = prototype.type
        this.size = Math.random()
        this.width = (prototype.sizeRange.min.x + this.size * (prototype.sizeRange.max.x - prototype.sizeRange.min.x))
        this.height = (prototype.sizeRange.min.y + this.size * (prototype.sizeRange.max.y - prototype.sizeRange.min.y))
        this.width *= canvas.width / 1920
        this.height *= canvas.width / 1920
        this.y = this.distance
    }
}
class landscapeSegment {
    constructor (img, x) {
        this.img = img
        this.width = img.width
        this.effectiveWidth = img.width / canvas.scale_at(canvas.south_horizon)
        this.x = x
    }
}

$(document).ready(() => {
    console.log("ready!");
    canvas = new Canvas();

    trailHeight = 4/5 // $("#path").position().top / $("#canvasArea").height();
    horizonHeight = $("#ground").position().top / $("#canvasArea").height();

    loadPlayer((playerData) => {
        if (playerData.finalScore) {
            window.location.href = `/highscores/${playerData.name}`
        }
        loadTrail(trailData =>{
            trail = new Trail(trailData)
            trail.loadImages().then(() => {
                Object.keys(playerData).forEach(key => {
                    player[key] = playerData[key]
                })
                if (!player.progress) { 
                    newGame()
                }
                else {
                    player.currentLocation = trail.locationAt(player.progress)
                    trail.loadFrom(player.progress)
                }
                player.img = $('<img>').attr('src', '/assets/images/wagon.png')[0]
                player.width = 150
                player.height = 75
                player.frame = 0
                loadMokemon((mokesData) => {
                    mokeInfo = mokesData
                    // construct mokePosse from saved data
                    let posse = player.posse;
                    player.posse = [];
                    // add them one at a time so they can be indexed
                    posse.forEach(moke => player.posse.push(new mokePosse(moke.name, moke.hp, moke.conditions)));
                
                    gameInterval = setInterval(gameLoop, 1000 / canvas.metrics.frameRate)
                    requestAnimationFrame(canvas.draw)
                })
            })
        });
    })

})

function newGame() {
    player = new Player($("#playerName").text())
    Player.currentLocation = trail.locations[1];
    player.progress = 3
    // // remove all background objects
    trail.scenery = [];
    trail.loadFrom(player.progress);
}

function gameLoop () {
    // time does pass
    if (!player.isLoaded) {
        canvas.draw();
        player.isLoaded = true;
    }
    if (paused) return;

    player.time += timeSpeed;
    timelyEvents();

    trail.travel();
    // canvas.draw();

    // mokemon hop
    player.posse.forEach((mokemon) =>{
        mokemon.hop();
    })
    player.frame = (player.frame + 0.25) % 4

    // are we there yet?
    if (player.currentLocation != trail.currentLocation) {
        // we are here!
        arriveAt(trail.currentLocation);
    }
}

function timelyEvents() {
    if (player.hour != Math.floor(player.time)) {
        // hourly events
        player.hour = Math.floor(player.time);
        // random disasters
        Object.keys(events).forEach((key) => {
            if (events[key].occurs) events[key].function();
        });
        // mokemon conditions (ebola and so forth)
        player.posse.forEach((mokemon) =>{
            mokemon.doConditions();
        });            
    }
    // move the sun
    astralMovements();
    // a new dawn
    if (player.time >= 24) nextDay();

    // narrate the journey
    narrate();
}

function astralMovements() {
    if (player.day === daysTilEclipse && player.hour === 12) {
        lose()
        return
    }
    var sun_x = -Math.sin(Math.PI * (0.5 + player.time / 24)) * 50 + 50
    var sun_y = Math.cos(Math.PI * (0.5 + player.time / 24)) * 100 + 105
    $("#sun").css({'top': sun_y + '%', 'left': (sun_x) + '%', 'border-color': `rgb(255, ${255 - sun_y ** 2 / 10}, ${150 - sun_y * 10})`})
    sunglow = Math.max(Math.min(sun_y - 32, 15), 0) / 12
    $('#glow').css({'opacity': `${sunglow}`})
    const lightness = 1 - Math.abs(player.time - 12) / 10
    $('#sky').css({
        'backgroundColor': `rgb(${Math.min(1500 * lightness, 87)}, ${Math.min(800 * lightness, 206)}, ${Math.min(1000 * lightness, 235)})`,
        'opacity': `${Math.min(lightness * 10, 1)}`
    })
    $('#stars').css({
        'left': `-${($('#stars').width() - $('#sky').width()) * (player.day + player.time / 24 - 0.5) / daysTilEclipse}px`
    })
    $("#canvas").css({"filter": `brightness(${Math.max(Math.min(lightness * 10, 1), 0.5)})`})
    $("#ground").css({"filter": `brightness(${Math.max(Math.min(lightness * 10, 1), 0.5)})`})
    // the dark moon. should be at the same place as the sun on Februne 12th at noon
    // so moon_z will be exactly 1 at the time of the eclipse
    const moon_z = (player.day * 24 + player.time) / (daysTilEclipse * 24 + 12) // 571536;
    // moon rises and sets every third day
    // moon_x = -Math.sin(Math.PI * (0.333333 + (player.time + 12) / 72 + (player.day % 3) / 3)) * (25 + 25 * moon_z) + 50
    const moon_x = Math.sin(Math.PI * ((player.time - 12) / 72 + (player.day - daysTilEclipse) / 3)) * (25 + 25 * moon_z) + 50
    // moon_y = Math.cos(Math.PI * (0.333333 + (player.time + 12) / 72 + (player.day % 3) / 3)) * (40 * moon_z) + 45
    const moon_y = Math.cos(Math.PI + Math.PI * ((player.time - 12) / 72 +  (player.day - daysTilEclipse) / 3)) * (40 * moon_z) + 45
    $("#darkMoon").css({
        'top': moon_y + '%', 
        'left': (moon_x) + '%', 
        'width': `${2+3*moon_z}vmin`, 
        'height': `${2+3*+moon_z}vmin`, 
        'border-width': `${1+moon_z*1.5}vmin`, 
        'border-radius': `${1+moon_z*1.5}vmin`
    })
}

function nextDay() {
    // reset time
    player.time = 0; 
    player.day += 1;
    // eat
    player.food -= player.foodPerDay;
}

function narrate() {
    // measure the distance to out next location
    var distanceTo = parseInt(trail.currentLocation.length - trail.currentLocation.progress);
    let arrived = distanceTo === 0;
    if (arrived) distanceTo = trail.nextLocation.length;
    starting_month = "Novembruary"
    starting_day = 73
    month_lengths = {
        'Novembruary': 79,
        'Octember': 81,
        'Februne': 12
    }
    // figure out which day of which month it is
    let month = starting_month;
    let day = starting_day + player.day;
    while (day > month_lengths[month]) {
        day -= month_lengths[month];
        month = (month === "Novembruary") ? "Octember" : "Februne";
    }
    suffix = (day) => {return parseInt(day / 10) == 1 ? "th" : ((day % 10 === 1) ? "st" : ((day % 10 === 2) ? "nd" : (day % 10 === 3) ? "rd" : "th"))}
    let calendarDay = `${month}${month == 'Februne'? ' the ' : ''} ${day}${suffix(day)}`;
    $("#narrative").html(
        '<span style="color: yellow">tap here or press enter for options</span> <br>' + 
        'Day: ' + calendarDay +
        ((arrived)  
        ? (`<br>You have reached: ${trail.nextLocation.name}. <br>${distanceTo} miles until ${trail.currentLocation.next.next.name}.`)
        : (`<br>Location: ${trail.currentLocation.name}<br>${distanceTo} miles to ${trail.currentLocation.next.name}.`)) + '<br>' +
        (player.messages.length ? player.messages[player.messages.length - 1] : "")
    )
}

function arriveAt(location) {
    player.currentLocation = location;
    player.nextLocation = location.next;
    player.messages.push(`You have reached ${player.currentLocation.name}.`)
    // execute this location's function, if it has one
    if (location.message) {
        msgBox(location.message.title, location.message.text, [{text: location.message.button}])
    };
    if (location.shop) {
        msgBox("Buy stuff?", `You have reached: ${location.name}.  Stop and buy supplies?`, [
            {text: "yes, of course", function: () => {
                shopDialog(location.shop.items);
            }},
            {text: "no, I'm good"}
        ])
    }
    if (location.name === "Pokegonemon") {
        win();
    }
}

let waitInterval = null;
function killTime(days = 0, hours = 0, callback) {
    hours += days * 24;
    days = hours / 24;
    waitInterval = setInterval(() => {
        if (msgBoxActive) return;
        pause();

        hours --;
        player.time ++;
        timelyEvents();

        if (hours <= 1) {
            clearInterval(waitInterval);
            unpause();
            if (callback) callback();
        }    
    }, 43 - days * 2);
}

let restInterval = null;
let restingHours = 0;
let totalRest = 0;
function rest(days, showPosse, whileCondition, callback) {
    pause();
    whileCondition = whileCondition || (() => true);
    restingHours = Math.max(days * 24, restingHours);
    player.resting = true;
    $(".healthMonitor").remove();
    let mokePosseHealthMonitor = $("<div>").addClass('healthMonitor').css({"z-index": 4});
    if (showPosse) mokePosseHealthMonitor.appendTo($("#canvasArea"));
    if (restInterval) clearInterval(restInterval);
    restInterval = setInterval(() => {
        if (msgBoxActive) return;
        pause();
        if (showPosse) mokePosseHealthMonitor.empty().append(
            player.posse.map(moke => mokePortrait(moke))
        )

        restingHours --;
        totalRest ++;
        player.time ++;
        timelyEvents();

        // heal mokes
        player.posse.forEach(moke => {
            moke.hp = Math.min(moke.hp + moke.max_hp / 240, moke.max_hp) 
        })

        if (restingHours <= 1 || !whileCondition()) {
            player.messages.push(`After ${Math.floor(totalRest / 24)} ${totalRest > 48 ? 'days' : 'day'} of rest and recovery, you continue on the trail.`)
            clearInterval(restInterval);
            mokePosseHealthMonitor.remove();
            player.resting = false;
            if (!msgBoxActive) unpause();
            if (callback) callback();
        }    
    }, 43 - days * 2);
}

function restDialog() {
    // how long?
    pause();
    clearDialogs();

    let restingDialog = $("<div>").attr('id', 'restingDialog').addClass('dialogBox').appendTo($('#sidebar'))
    let restParameters = {text: "rest for how many days?", name: "rest", min: 0, max: Math.min(Math.floor(player.food / player.foodPerDay), 10), number: 0}
    restingDialog.append(
        $("<form>")
            .attr("id", "restForm")
            .append(numberInput(restParameters))
            .append($("<div>")
                .attr('id', 'msgbuttons')
                .append(        
                    $("<button>")
                        .attr("type", "submit")
                        .text("ok")
                        .addClass('msgbutton')
                    )
                )    
    )
    if (Math.floor(player.food / player.foodPerDay) < 10) {
        restingDialog.append($("<span style='color:red'></span>").text(`You have enough food to rest for ${Math.floor(player.food / player.foodPerDay)} days.`))
    }
    $("#restForm").submit((event) => {
        event.preventDefault();
        restingDialog.remove();
        rest(restParameters.number, true)
    });
}

function shopDialog(shopItems) {
    let shoppingDialog = $("<div>").attr('id', 'shoppingDialog').addClass('dialogBox').appendTo($('#canvasArea'))

    shoppingDialog.prepend($("<div>").addClass('msgTitle').text(player.currentLocation.shop.title || `Shopping at ${player.currentLocation.name}`))
        .append(
            $("<div>")
                .attr('id', 'shoppingText')
                .html((player.currentLocation.shop.text || "Welcome! Here's what you can buy."))
                .append(
                    "<br><br><hr>",
                    ...shopItems.map(item => {
                        item.min = 0
                        item.max = Math.floor(player.money / item.price)
                        item.number = 0
                        item.increment = item.increment || 1
                        item.text = `You have: ${player[item.name]} ${item.name}.  Buy ${item.increment} for $${parseInt(item.increment * item.price)}:`
                        item.onChange = () => {
                            // calculate the maximum number of each item you can still afford
                            let cost = parseInt(shopItems.reduce((sum, item) => sum + item.number * item.price, 0))
                            shopItems.forEach(item => {
                                item.max = Math.floor((player.money - cost) / item.price) + item.number
                            })
                            $("p#available").text(`Available: $${player.money - cost}`)
                            $("p#totalCost").text(`Total: $${cost}`)
                        }
                        item.onRejectChange = () => {
                            if (item.number < item.min) return;
                            $("p#available").css({color: "red"});
                            setTimeout(() => {
                                $("p#available").css({color: "white"})
                            }, 100);
                        }
                        return numberInput(item)
                    }),
                    "<hr><br>",
                    $("<p>").attr('id', "totalCost").text("Total: $0"),
                    $("<p>").attr('id', "available").text(`Available: $${player.money}`)
                ),
            $("<div>")
                .attr('id', 'msgbuttons')
                .append(
                    $("<div>").attr('id', 'msgButtons').append(
                        $("<button>")
                            .addClass('msgbutton')
                            .text("done, pay up")
                            .click(() => {
                                let msg = "Bought ";
                                Object.keys(shopItems).forEach((key, i) => {
                                    let item = shopItems[key]
                                    player[item.name] = (player[item.name] || 0) + item.number
                                    player.money -= item.number * item.price
                                    if (i > 0) {
                                        if (i < Object.keys(shopItems).length - 1) {
                                            msg += ", "
                                        }
                                        else {
                                            msg += " and "
                                        }
                                    }
                                    msg += item.number + " " + item.name
                                })
                                msg += " from " + player.currentLocation.name + ".";
                                player.messages.push(msg)
                                unpause()
                                shoppingDialog.remove();
                            })
                            .attr("type", "submit")
                    )
                )
        )
    pause();
}

$(document).on('keypress', (event) => {
    if (event.key === "Enter") {
        options();
    }
})

function options() {
    $("#optionsMenu").show()
}

function mokemon() {
    $("#mokePosse").empty().append(player.posse.map(moke => 
        mokePortrait(moke)
    ))
    $("#mokeStats").empty()
    $("#mokemonMenu").show()
}

function infoPanel() {
    $("#foodInfo").text(`food: ${player.food} (-${player.foodPerDay}/day)`)
    $("#moneyInfo").text(`money: ${player.money}`)
    $("#ammoInfo").text(`mokeballs: ${player.mokeballs}, grenades: ${player.grenades}`)
    $("#playerInfo").show()
}

function closeOptions() {
    $("#optionsMenu").hide();
}

function win () {
    msgBox("glorious victory", `You have reached the legendary city!  Let us count the survivors and give you some points! <br> You have: ${player.posse.length} surviving Mokemon.`, 
        [{
            text: "sweet",
            function: () => {    // DONE
                window.location.href = `/highscores/${player.name}`
            }
        }]);
    let pointsValue = {
        food: .4,
        mokeballs: 4,
        grenades: 10,
        money: .5
    }
    player.finalScore = Object.keys(pointsValue).reduce((sum, item) => sum + Math.floor(player[item] * pointsValue[item]), 0);
    $("#msgText").append(
        ...player.posse.map(moke => {
            let mokePoints = Math.floor(200 * moke.hp / moke.max_hp + 100);
            player.finalScore += mokePoints;
            return $("<p>").append(
                mokePortrait(moke),
                `${moke.name}: ${Math.floor(moke.hp * 10) / 10}/${moke.max_hp} hp = ${mokePoints}`,
            )
        }),
        ...Object.keys(pointsValue).map(item => 
            $("<p>").text(`leftover ${item} x ${player[item]} = ${Math.floor(player[item] * pointsValue[item])}`),
        ),
        $("<p>").text(`total: ${player.finalScore}`)
    )
    saveGame()
}

function lose() {
    clearInterval(restInterval)
    clearInterval(waitInterval)
    $(".dialogBox").hide()
    pause()
    $("#sky").css({"transition": "opacity 5s", "opacity": "0"})
    $("#darkMoon").css({"box-shadow": "0 0 2.5vmin 2.5vmin white", 'left': $('#sun').css('left'), 'top': $('#sun').css('top')})
    $("#canvasArea").css({filter: 'contrast(150%) grayscale(50%'})

    setTimeout(() => {
        $("#sky").css({"background-image": "url('./assets/images/thunderstorm.jpg')", "opacity": "1", "transition": "none"})
    }, 6000);
    setTimeout(() => {
        msgBox("The End", `The day turns to night.  Madness sweeps over the land.  From across the ${player.currentLocation.type}, wild Mokemon come screaming from all directions.  They fall upon you and tear your hapless corpse to shreds.  You did not reach the legendary city.  You did not survive.`, 
        [{text: "¯\\_(ツ)_/¯", function: () => {window.location.href = "/"}}])
    }, 9370);
}

function weightedRandom(nums) {
    // takes an array of numbers and chooses among them, with bigger numbers having higher odds
    let r = Math.random() * nums.reduce((sum, n) => n + sum);
    let s = 0, n = 0;
    while (s < r) {
        s += nums[n++];
    }
    return n-1;
}


const events = {
    disease: {
        pathogens: [
            {
                name: "ebola",
                get rarity() {return player.currentLocation.type === 'jungle' ? 100 : 10000},
                duration: {
                    base: 50,
                    random: 10,
                    immuneDependent: 70
                },
                damage: 0.01,
                get contagionLevel() {player.posse.reduce((sum, moke) => 
                    sum + moke.conditions.reduce((sum, condition) => 
                        sum + (condition.name === "ebola" ? 1: 0) + (condition.name === "quarantine" ? -.92: 0), 0), 0
                    )
                }
            }, {
                name: "sars",
                rarity: 150,
                duration: { // in hours
                    base: 80,
                    random: 20,
                    immuneDependent: 100
                },
                damage: 0.005,
                get contagionLevel() {return player.posse.reduce((sum, moke) => 
                    sum + moke.conditions.reduce((sum, condition) => 
                        sum + (condition.name === "sars" ? 1: 0) + (condition.name === "quarantine" ? -.96: 0), 0), 1
                    )                 
                }   
            }, {
                name: "the plague",
                rarity: 300,
                duration: { // in hours
                    base: 90,
                    random: 20,
                    immuneDependent: 50
                },
                damage: 0.015,
                get contagionLevel() {return player.posse.reduce((sum, moke) => {
                    return sum + (moke.conditions.includes("the plague") ? (moke.conditions.includes("quarantine") ? .133: 1) : 0)}, 1
                )}
            }
        ],
        get occurs() {
            events.disease.name = "";
            events.disease.pathogens.forEach(disease => {
                if (disease.contagionLevel > Math.random() * disease.rarity) {
                    events.disease.name = disease.name
                    events.disease.duration = disease.duration
                    events.disease.damage = disease.damage
                }
            })
            return events.disease.name
        },
        function: () => {
            // strikes randomly
            let victim = player.posse[weightedRandom(player.posse.map(moke => 1 / moke.immuneResponse))];
            if (victim.conditions.map(c => c.name).includes(events.disease.name)) {
                // can't get it twice
                // console.log(`prevented double occurrence of ${events.disease.name}.`);
                return
            }
            let illnessLength = events.disease.duration.base 
                + Math.random() * events.disease.duration.random 
                + Math.random() * events.disease.duration.immuneDependent / victim.immuneResponse
            let illnessName = events.disease.name

            victim.conditions.push ({
                name: illnessName,
                type: 'disease', 
                timeRemaining: illnessLength,
                effect: () => {
                    victim.hp -= events.disease.damage
                }
            })
            player.messages.push(`${victim.name} caught ${illnessName}.`)
            msgBox ("Outbreak!", `${victim.name} has ${illnessName}.`, [{
                text: "euthanize",
                    function: () => victim.die("had to be put down")
            },{
                text: "rest and quarantine",
                function: () => {
                    player.messages.push("The posse enters lockdown.")
                    player.posse.forEach(moke => moke.conditions.push({name: 'quarantine', timeRemaining: illnessLength}))
                    rest(illnessLength / 24, true, () => victim.alive, () => {
                        if (victim.alive) {
                            msgBox(`${victim.name} has recovered from ${illnessName}.`)
                            player.messages.push(`${victim.name} survived ${illnessName}.`)
                        }
                    });
                }
            },{
                text: "ruthlessly carry forward" // do nothing, so there is no function
            }]);
        }
    },
    bear: {
        get occurs() {
            return player.posse.length > 0 && trail.currentLocation.type === "forest" && parseInt(Math.random() * 200) == 0;
        },
        function: () => {
            // most often eats the weakest one
            let victim = player.posse[weightedRandom(player.posse.map(moke => 1 / moke.hp))];
            victim.die("was slain by a hungry bear");
            msgBox ("Death", victim.name + " was eaten by a bear.", "damn")
        }
    },
    berries: {
        get occurs() {
            return trail.currentLocation.type === "forest" && !player.resting && parseInt(Math.random() * 100) == 0;
        },
        function: () => {
            let berries = Math.floor(Math.random() * 50 + 25)
            player.messages.push("You scored some berries.")
            msgBox ("Free food!", `You found some random berries worth ${berries} food!`, [{text: "sweet"}, {text: "carry on, then"}]);
            player.food += berries
        }
    },
    yeti: {
        get occurs() {
            return player.posse.length > 0 && trail.currentLocation.type === "mountains" && parseInt(Math.random() * 250) == 0;
        },
        function: () => {
            // most often eats the weakest one
            let victim = player.posse[weightedRandom(player.posse.map(moke => 1 / moke.hp))];
            victim.die("was devoured by a monstrous yeti")
            msgBox ("Death", victim.name + " was eaten by a yeti.", "damn")
        }
    },
    falling_object: {
        get occurs() {
            return player.posse.length > 0 && !player.resting && (
                trail.currentLocation.type == "forest" && parseInt(Math.random() * 100) == 0
                || trail.currentLocation.type == "desert" && parseInt(Math.random() * 200) == 0
            )
        },
        function: () => {
            victim = player.posse[parseInt(Math.random() * player.posse.length)]
            if (trail.currentLocation.type === "forest") {
                let damage = Math.floor(Math.random() * 11 + 1)
                fallingObject = damage > 7 ? "tree" : (damage > 3 ? "branch" : "stick")
            }
            else if (trail.currentLocation.type === "desert") {
                let damage = Math.floor(Math.random() * 6 + 6)
                fallingObject = "cactus"
            }
            player.messages.push(`${victim.name} suffered ${damage} damage from a falling ${fallingObject}.`)
            victim.hp = Math.max(victim.hp - damage, 0)
            msgBox ("Ouch", `A ${fallingObject} fell on ${victim.name}.`, [{text: ":_(", function: () => {
                if (victim.hp <= 0) victim.die(`Was crushed by a ${fallingObject}`)
            }}])
            // put a picture of the victim in there so we can see how bad they're hurt
            $("#msgText").append(mokePortrait(victim))
        }
    },
    scorpion: {
        get occurs() {
            return player.posse.length > 0 && trail.currentLocation.type === "desert" && parseInt(Math.random() * 200) == 0;
        },
        function: () => {
            victim = player.posse[parseInt(Math.random() * player.posse.length)]
            victim.hurt(1)
            message = `${victim.name} was stung by a scorpion${victim.alive ? "" : " and died"}.`
            player.messages.push(message);
            msgBox ("Venemous wildlife", message, "That's how it goes sometimes")
            // put a picture of the victim in there so we can see how bad they're hurt
            $("#msgText").append(mokePortrait(victim));
        }
    },
    sandstorm: {
        get occurs() {
            return trail.currentLocation.type === "desert" && parseInt(Math.random() * 200) == 0;
        },
        function: () => {
            $("#canvasArea").css({"filter": "sepia(0.5) brightness(1.5)", "transition:": "filter 5s"})
            msgBox('delays', "Sandstorm.  Lose one day.", [{
                text: "ok", 
                function: () => {
                    killTime(1, 0, () => {$("#canvasArea").css({"filter": "none", "transition:": "none"})}) 
                }
            }]);
        }
    },
    thief: {
        get occurs() {
            return player.day > 0 && player.hour === 0 && Math.random() * 10 < 1 && !events.thief.alreadyHappening;
        },
        // don't allow a thief to come while you're in the middle of chasing a thief
        // would just be messy
        alreadyHappening: false,
        function: () => {
            let theftType = ["food", "mokeballs", "money", "mokemon"][Math.floor(Math.random() * 4)];
            let lossAmount = 0;
            let loss = "";
            let victim = null;
            let daysChase = 0;
            if (theftType === "mokemon") {
                victim = player.posse[parseInt(Math.random() * player.posse.length)];
                if (!victim) return;
                loss = victim.name;
            }
            else {
                lossAmount = Math.floor(Math.random() * player[theftType]);
                if (lossAmount < 2) return;
                loss = lossAmount + " " + theftType;
            }
            player.messages.push(`A thief stole ${loss}.`)
            msgBox ("Theft", "A thief comes in the night and makes off with: " + loss + ".", [
                {text: "how unfortunate", function: concludeChase},
                {text: "give chase!", function: () => {
                    events.thief.alreadyHappening = true;
                    giveChase();
                }}
            ])
            function giveChase() {
                killTime(1, 0, () => {
                    pause();
                    let caught = Math.floor(Math.random() * 1.5);
                    let escaped = Math.floor(Math.random() * 1.2);
                    daysChase ++;
                    if (caught) {
                        msgBox('gotcha', `You caught the thief and administered swift justice!  ${loss} returned!`)
                        player.messages.push(`After ${daysChase} ${daysChase > 1 ? "days'" : "day's"} chase, you caught the thief and recovered ${loss}.`)
                        loss = 0;
                        concludeChase();
                    }
                    else if (escaped) {
                        msgBox('the trail has gone cold', 'The thief escaped your pursuit.');
                        player.messages.push(`After ${daysChase} ${daysChase > 1 ? "days'" : "day's"} chase, the thief escaped with ${loss}.`)
                        concludeChase();
                    }
                    else {
                        msgBox('no dice', 'The thief has evaded you!  Continue pursuit?', [
                            {text: "yes!", function: giveChase},
                            {text: "no :(", function: concludeChase}
                        ])
                    }
                });
            }
            function concludeChase() {
                events.thief.alreadyHappening = false;
                if (loss) {
                    if (theftType === "mokemon") {
                        victim.die("was stolen by a villainous thief");    
                    }
                    else {
                        player[theftType] -= lossAmount;
                    }
                }
            }
        }
    },
    trader: {
        get occurs() {
            return player.day > 0 && Math.random() * 360  < 1;
        },
        function: () => {
            let mokeNames = player.posse.map(moke => moke.name.toLowerCase());
            let offer = Object.keys(mokeInfo)
                .filter(moke => !mokeNames.includes(moke));
            if (offer.length > 0) offer = offer[Math.floor(Math.random() * offer.length)];
            else return;
            let minPrice = {food: 100, mokeballs: 12, grenades: 5, money: 200}
            let possibleTrades = Object.keys(minPrice).filter(item => player[item] >= minPrice[item])
            if (possibleTrades.length == 0) {
                // you have nothing to offer :(
                return;
            }
            let trade = {
                item: possibleTrades[Math.floor(Math.random() * possibleTrades.length)],
            }
            trade.quantity = Math.min(player[trade.item], minPrice[trade.item] + Math.floor(Math.random() * minPrice[trade.item] * 3));
            msgBox("Can you refuse this offer?", `A wandering Mokemon trader passes by with a ${offer} for sale, asking ${trade.quantity} ${trade.item} in exchange.  Do you accept?`, [
                {text: "yes, please",
                function: () => {
                    player.posse.push(new mokePosse(offer));
                    player[trade.item] -= trade.quantity;
                    player.messages.push(`Bought ${offer} from a trader for the price of ${trade.quantity} ${trade.item}.`)
                }},
                {text: "nope"}
            ])
        }
    },
    abandonedVehicle: {
        get occurs() {
            return player.day > 3 && !player.resting && Math.random() * 360  < 1;
        },
        function: () => {
            let mokesYouHave = player.posse.map(moke => moke.name.toLowerCase());
            let mokesYouDontHave = Object.keys(mokeInfo).map(moke => moke.toLowerCase())
                .filter(moke => !mokesYouHave.includes(moke))
            let possibleScores = [
                {type: 'food', quantity: 200}, 
                {type: 'money', quantity: 300}, 
                {type: 'mokeballs', quantity: 9}, 
                {type: 'grenades', quantity: 9}, 
                {type: 'arrows', quantity: 100},
                {type: 'mokemon', quantity: "a"}
            ]
            if (mokesYouDontHave.length === 0) possibleScores.pop()
            let loot = possibleScores[Math.floor(Math.random() * possibleScores.length)]
            let msgTitle = "score!"
            if (loot.type === "mokemon") {
                loot.type = mokesYouDontHave[Math.floor(Math.random() * mokesYouDontHave.length)]
                loot.quantity = ['a', 'e', 'i', 'o', 'u'].includes(loot.type[0]) ? "an" : "a"
                player.posse.push(new mokePosse(loot.type))
                loot.type += [
                    ' chained to it',
                    ' standing nearby, looking lost'
                ][Math.floor(Math.random() * 2)]
                msgTitle = "a new friend"
            }
            else {
                loot.quantity = Math.floor(Math.random() * loot.quantity)
                if (loot.quantity == 1) loot.quantity = 0 // so we don't have to deal with singular/plural
                player[loot.type] += loot.quantity
            }
            let vehicle = ["segway", 'shopping cart', 'tricycle', 'RV', 'dirt bike', 'go-kart', 'car'][Math.floor(Math.random() * 7)]
            if (loot.quantity) {
                msgBox(msgTitle, `You find an abandoned ${vehicle} with ${loot.quantity} ${loot.type}.`)
                player.messages.push(`Scored ${loot.quantity} ${loot.type} from an abandoned ${vehicle}.`)
            }
            else {
                msgBox('nothing to see here', `You find an abandoned ${vehicle}, but it is empty.`)
                player.messages.push(`Passed an empty, abandoned ${vehicle}.`)
            }
        }
    },
    foodLow: {
        get occurs() {
            return player.hour === 0 && player.food < player.foodPerDay * 3;
        },
        function: () => {
            let daysRemaining = parseInt(player.food / player.foodPerDay) + 1;
            player.foodLow = true;
            player.messages.push(`You are low on food.  It will be gone in: ${daysRemaining} days.`)
        }
    },
    starve: {
        get occurs() {
            return player.food <= 0;
        },
        function: () => {
            if (player.posse.length === 0) {
                msgBox("death by starvation", "You have no food and no Mokemon.  You have starved to death!", [
                    {text: "awwwwwww", function: () => window.location.href="/"}
                ])
            }
            else {
                // msgBox("starvation", "You are out of food! Who will you eat to survive?", player.posse.map(moke => {
                //     return {
                //         text: `${moke.name} (${moke.foodValue} food, eats ${moke.hunger}/day)`,
                //         function: () => {
                //             player.food += moke.foodValue;
                //             moke.die("had to be sacrificed for the greater good"); 
                //         }
                //     }
                // }))
                if (player.currentMessage != "You have no food!") {
                    player.messages.push("You have no food!");
                }
                player.posse.forEach(moke => {
                    moke.hurt(moke.hunger / 100)
                })
                player.food = 0;
            }
        }
    },
    dontStarve: {
        get occurs() {
            return player.lowFood && player.food >= player.foodPerDay * 3;
        },
        function () {
            player.lowFood = false;
            player.messages.push("You're doing ok on food for now.")
        }
    }
};
