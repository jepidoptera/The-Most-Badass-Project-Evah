// jshint esversion: 6
// jshint multistr: true
var backgroundImages = [];

const you = $('<img>')
    .attr('src', './assets/images/walking.gif')
    .addClass('you');
var paused = false;
var exit = false;
var trailHeight;
var horizonHeight;

var timeSpeed = 0.05;
var posse = [];
var canvas;
var gameInterval;

class SceneObject {
    constructor(params) {
        this.type = params.type;
        this.spacing = params.spacing;
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
                this.images.push($("<img>").attr("src", './assets/images/' + this.type + n + ".png")[0])
            }
        }
        this.isForeground = params.isForeground || (() => false);
        this.foregroundDistance = params.foregroundDistance || (() => -1);
        return this;
    }
    /**
     * @returns {number}
     */
    get distance() {return this._distance()}
    set distance(newFunction) {this._distance = newFunction}
    /**
     * @returns {number}
     */
    get isForeground() {return this._isForeGround()}
    set isForeground(newFunction) {this._isForeGround = newFunction}
    /**
     * @returns {number}
     */
    get foregroundDistance() {return this._foregroundDistance()}
    set foregroundDistance(newFunction) {this._foregroundDistance = newFunction}
}

const SceneObjects = {
    rock: new SceneObject ({
        type: "rock",
        spacing: 145,
        sizeRange: { min: { x: 10, y: 5 }, max: { x: 50, y: 25 } },
        imgRange: { min: 0, max: 3 },
        distance: () => { return Math.random() * 100 },
    }),
    moutain: new SceneObject ({
        type: "mountain",
        spacing: 31,
        sizeRange: { min: { x: 400, y: 225 }, max: { x: 900, y: 600 } },
        imgRange: { min: 0, max: 4 },
        distance: () => 100 - Math.random() * Math.random() * 100,
    }),
    mountainRange: new SceneObject ({
        type: "mountain range",
        spacing: 100,
        height: 290,
        width: 1280,
        image: './assets/images/big mountain.png',
        distance: () => Math.random() * 100,
    }),
    pokegonemon: new SceneObject ({
        type: "city",
        image: './assets/images/pokegonemon.png',
        height: 500,
        width: 1500,
        isForeground: () => true
    }),
    palm_tree: new SceneObject ({
        type: "palmtree",
        spacing: 4,
        sizeRange: {min: {x: 25, y: 50}, max: {x: 200, y: 200}},
        imgRange: {min: 0, max: 4},
        isForeground: () => (Math.random() * 100 < 1.5) ? true : false,
        distance: () => Math.max(100 - Math.random() * Math.random() * 110, 0),
        foregroundDistance: () => Math.random() * -50
    }),
    cactus: new SceneObject ({
        type: "cactus",
        spacing: 100,
        sizeRange: {min: {x: 25, y: 25}, max: {x: 100, y: 100}},
        imgRange: {min: 0, max: 1},
        isForeground: () => (Math.random() * 100 < 1.5) ? true : false,
        distance: () => 100 - Math.random() * Math.random() * 100
    }),
    house: new SceneObject ({
        type: "house",
        spacing: 5,
        sizeRange: {min: {x: 25, y: 25}, max: {x: 50, y: 50}},
        imgRange: {min: 0, max: 2},
        isForeground: () => (Math.random() * 100 < 40) ? true : false,
        distance: () => Math.random() * 50,
        foregroundDistance: () => Math.random() * -50
    }),
    tree: new SceneObject ({
        type: 'tree',
        spacing: 1.5,
        sizeRange: {min: {x: 80, y: 160}, max: {x: 360, y: 360}},
        imgRange: {min: 0, max: 4},
        isForeground: () => (Math.random() * 100 < 2) ? true : false,
        distance: () => Math.max(100 - Math.random() * Math.random() * 110, 0),
        foregroundDistance: () => Math.random() > .5 ? -20 : -50 
    }),
    distantTree: new SceneObject ({
        type: 'tree',
        spacing: 2,
        sizeRange: {min: {x: 80, y: 160}, max: {x: 360, y: 360}},
        imgRange: {min: 0, max: 4},
        distance: () => 100 - Math.random() * Math.random() * 30
    }),
    signpost: new SceneObject ({
        type: 'signpost',
        height: 50,
        width: 50,
        spacing: 0,
        image: './assets/images/signpost0.png',
        distance: () => 1,
    }),
    orepoke: new SceneObject ({
        type: 'city',
        spacing: 0,
        image: './assets/images/city0.png',
        height: 300,
        width: 600,
        isForeground: () => true
    })
}

class Trail {
    constructor(locations) {
        this.locations = locations;
        this.locations.forEach((location, n) => {
            location.next = this.locations[n+1];
        })
        this.scenery = [];
        this.currentLocation = this.locations[0]
    }
    updateLocation() {
        this.atHorizon = this.locationAt(player.progress + canvas.metrics.screen_length *.8);
        this.nextLocation = this.currentLocation.next;
        this.currentLocation = this.locationAt(player.progress);
    }
    locationAt(progress) {
        let progressTotal = 0;
        let location = this.locations[0];
        for (let n in this.locations) {
            progressTotal += this.locations[n].length;
            if (progressTotal >= progress) {
                location = this.locations[n];
                location.progress = (this.locations[n].length - progressTotal + progress);
                break;
            }
        }
        return location;
    }
    travel() {
        this.updateLocation();
        player.progress += 1/ canvas.metrics.frameRate;
        // make new scenery
        this.atHorizon.scenery.forEach(element => {
            if (!element.spacing) {
                // one-off item
                if (this.atHorizon != this.currentLocation && this.atHorizon.progress <= 1 / canvas.metrics.frameRate) {
                    this.scenery.push(new backgroundImage(element));
                }
            }
            else if (Math.random() * element.spacing < 1) {
                this.scenery.push(new backgroundImage(element));
            }
        });
        // move along existing scenery
        let remainingSceneItems = [];
        let scrollSpeed = canvas.width / canvas.metrics.screen_length / canvas.metrics.frameRate;
        for (let n in this.scenery) {
            this.scenery[n].x -= scrollSpeed * (150 - this.scenery[n].distance) / 150;
            if (this.scenery[n].x > -this.scenery[n].width) remainingSceneItems.push(this.scenery[n]);
        }
        this.scenery = remainingSceneItems.sort((a, b) => {
            if (a.foreground) {
                if (b.foreground) {
                    return a.distance > b.distance ? -1 : 1
                }
                return 1;
            }
            if (b.foreground) return -1;
            return a.distance > b.distance ? -1 : 1
        })
    }
    loadFrom(startingPoint) {
        this.scenery = [];
        let progressRate = 1/ canvas.metrics.frameRate;
        for (let n = 0; n < canvas.metrics.screen_length * canvas.metrics.frameRate; n ++) {
            this.currentLocation = this.locationAt(startingPoint - canvas.metrics.screen_length * .2 + n * progressRate);
            this.atHorizon = this.locationAt(startingPoint + canvas.metrics.screen_length * .8 + n * progressRate);
            this.currentLocation.scenery.forEach(element => {
                let newElement = null;
                if (!element.spacing) {
                    if (this.currentLocation.progress <= 1 / canvas.metrics.frameRate) {
                        newElement = new backgroundImage(element);
                    }
                } 
                else if (element.spacing && Math.random() * element.spacing < 1) {
                    newElement = new backgroundImage(element);
                }
                if (newElement) {
                    newElement.x = n * progressRate / canvas.metrics.screen_length * canvas.width;
                    this.scenery.push(newElement);
                }
            });
        }
        player.progress = startingPoint;
        canvas.draw();
        this.travel();
    }
}

const trail = new Trail ([
        TrailLocation({
            type: 'nowhere',
            name: 'what you leave behind',
            length: -3,
            scenery: [
                SceneObjects.house,
                SceneObjects.distantTree
            ],
        }),
        TrailLocation({
            type: 'city',
            name: 'Orepoke',
            length: 1,
            scenery: [
                SceneObjects.orepoke,
                SceneObjects.house,
                SceneObjects.distantTree
            ],
        }),
        TrailLocation({
            type: 'suburb',
            name: 'The Outskirts of Orepoke',
            scenery: [
                SceneObjects.house,
                SceneObjects.distantTree
            ],
            length: 20,
            function: () => {
                msgBox('Your journey begins', "Orepoke, once the world's greatest city, is now wracked by devastating epidemics of cholera and dysentery, as well as terrible shortages of food, wagon axles, and bullets.  Taking your surviving Mokemon, you set off on the road, in search of the legendary city of Pokegonemon - hoping to find a better life there.",
                    [{
                        text: "begin",
                        function: () => {}
                    }]
                )
            }
        }),
        TrailLocation({
            type: 'forest',
            name: 'The Forest of Doom',
            scenery: [
                SceneObjects.signpost,
                SceneObjects.tree
            ],
            length: 75 // seconds

        }),
        TrailLocation({
            type: 'desert',
            name: 'The Desert of Dryness',
            scenery: [
                SceneObjects.signpost,
                SceneObjects.cactus,
                SceneObjects.rock
            ],
            length: 56 // seconds

        }),
        TrailLocation({
            type: 'mountains',
            name: 'The Mainstay Mountains',
            scenery: [
                SceneObjects.signpost,
                SceneObjects.mountainRange,
                SceneObjects.rock,
                SceneObjects.moutain
            ],
            length: 82 // seconds

        }),
        TrailLocation({
            type: 'forest',
            name: 'The Great Palm Jungle',
            scenery: [
                SceneObjects.signpost,
                SceneObjects.palm_tree
            ],
            length: 100 // seconds

        }),
        TrailLocation({
            type: 'city',
            name: 'pokegonemon',
            length: 1,
            scenery: [
                SceneObjects.pokegonemon
            ],
            function: () => {
                // you won
                msgBox("Yay", "You have reached the legendary city!  Rejoice!", 
                [{
                    text: "Celebrate",
                    function: win // TODO
                }]);
            }
        }),
        TrailLocation({
            type: 'nothing',
            name: 'the Great Beyond',
            scenery: [
                SceneObjects.house,
                SceneObjects.palm_tree
            ],
            length: 1000000000001
        }),
        TrailLocation({
            type: 'the end',
            name: 'infinity',
            length: 0
        })
    ])

class Canvas {
    constructor () {
        this._canvas = document.getElementById("canvas");
        this.height = this._canvas.height;
        this.width = this._canvas.width;
        this.ctx = this._canvas.getContext('2d');
    }
    metrics = {
        frameRate: 30,
        screen_width: 1000, // arbitrary units
        screen_length: 20 // seconds
    }

    draw = () => {
        this.ctx.globalAlpha = 1;
        this.ctx.clearRect(0, 0, this.width, this.height);
        let mokesDrawn = false;
        trail.scenery.forEach((sceneObject, n) => {
            if (sceneObject.foreground) {
                this.ctx.globalAlpha = (200 + sceneObject.distance) / 200;
            }
            this.ctx.drawImage(sceneObject.img, 
                sceneObject.x, sceneObject.y,
                sceneObject.width, sceneObject.height)

            if (!mokesDrawn && (n == trail.scenery.length - 1 || trail.scenery[n+1].foreground)) {
                this.ctx.globalAlpha = 1;
                posse.forEach((mokeMon, n) => {
                    this.ctx.drawImage(mokeMon.img, canvas.width / 4.5 - n * 60 - mokeMon.width/2, mokeMon.y - mokeMon.z, mokeMon.width, mokeMon.height);
                })
                mokesDrawn = true;
            }
        })
    }
}

function TrailLocation(params) {
    trailLocation = params;
    trailLocation.progress= 0;
        trailLocation.length = params.length || 0;
        trailLocation.scenery = params.scenery 
            ? params.scenery.map(item => {
                    let sceneItem = item;
                    sceneItem.spacing = item.spacing || 0;
                    sceneItem.next = Math.random() * item.spacing;
                    return sceneItem;
                })
            : undefined
    return trailLocation;
}

const events = [
    {
        name: "ebola",
        occurrences: 0,
        get occurs() {
            // every morning at dawn
            // return posse.length > 0 && player.time === 0;
            // occasionally
            return posse.length > 0 && trail.currentLocation.type != "suburb" && parseInt(Math.random() * 5000) == 0;
        },
        function: () => {
            // strikes randomly
            victim = posse[parseInt(Math.random() * posse.length)];
            if (victim.conditions.map(c => c.name).includes('ebola')) {
                // can't get it twice
                console.log('prevented double occurrence of ebola.');
                return;
            } 
            victim.conditions.push ({
                name: 'ebola', 
                function: () => {
                victim.health -= 3;},
                length: parseInt(Math.random() * 5)
            });
            // there's not much you can do but rest and hope
            msgBox ("Outbreak!", victim.name + " has ebola.", [{
                text: "stop to rest",
                function: rest
            },{
                // or ruthlessly carry forward
                text: "keep going",
                function: () => {
                    // which cuts their chances of survival from 2/3 to 1/3, incidentally
                    victim.health -= 1;
                }
            }]);
        }
    }
];

class mokePosse {
    constructor (name) {
        this._hop = posse.length * .37;
        this.name = name;
        this.health = 10;
        this.conditions = [];
        // this.x = posse.length * 60 + canvas.width / 12;
        this.y = (trailHeight - .03) * canvas.height;
        this.z = 0;
        switch (name) {
        case "articuno":
            this.height = 40;
            this.width = 40;
            break;
        case "charizard":
            this.height = 40;
            this.width = 50;
            break;
        case "snorlax":
            this.height = 40;
            this.width = 40;
            break;
        case "jigglypuff":
            this.height = 30;
            this.width = 30;
            break;
        case "ninetales":
            this.height = 40;
            this.width = 50;
            break;
        }
        this.img = $("<img>").attr('src', './assets/images/' + this.name + ".png")[0];
        this.bounceHeight = this.height / 2;
        this.index = posse.length;
    }
    hop() {
        // hoppin' down the trail
        
        this.z = (Math.cos(Math.PI * (0.5 + (player.time + this._hop % 0.5))) - 0.5) * this.bounceHeight;
        // position on screen according to object coordinates
    }
    doConditions() {
        // process any conditions this mokemon may have
        var activeConditions = [];
        this.conditions.forEach((condition) => {
            if (condition.length > 0) {
                condition.length --;
                condition.function();
                activeConditions.push(condition);
            }
        });
        this.conditions = activeConditions;
        if (this.health <= 0) this.die();
    }
    die() {
        msgBox('tragedy', this.name + " has died.", [{
            text: 'ok',
            function: () => {} // not much you can do here
        }]);
        posse.splice(this.index, 1);
        posse.forEach((moke, n) => {
            moke.index = n;
        })
    }
    remove() {
        posse.slice(posse.indexOf(this), 1);
        this.img.remove();
    }
}

class backgroundImage {
    constructor (prototype) {
        this.x = canvas.width;
        this.img = prototype.images[Math.floor(Math.random() * prototype.images.length)];
        this.distance = prototype.distance;
        this.foreground = prototype.isForeground;
        this.type = prototype.type;
        if (this.foreground) {
            this.distance = prototype.foregroundDistance;
        }

        let distanceFactor = (100 - this.distance) / 100;
        this.size = Math.random();
        this.width = 20 + (prototype.sizeRange.min.x + this.size * (prototype.sizeRange.max.x - prototype.sizeRange.min.x)) * distanceFactor;
        this.height = 20 + (prototype.sizeRange.min.y + this.size * (prototype.sizeRange.max.y - prototype.sizeRange.min.y)) * distanceFactor;

        let floor = (this.foreground) ? canvas.height * 1.1 : canvas.height * trailHeight;
        let ceiling = this.foreground ? canvas.height * (trailHeight + .05) : canvas.height * horizonHeight ;
        if (this.foreground) distanceFactor -= 1;
        this.y = ceiling + distanceFactor * (floor - ceiling) - this.height;
    }
}

$(document).ready(() => {
    console.log("ready!");
    canvas = new Canvas();

    $('#walkingPath').append(you);
    trailHeight = $("#path").position().top / $("#walkingPath").height();
    horizonHeight = $("#ground").position().top / $("#walkingPath").height();

    newGame();
    gameLoop();
})

function newGame() {
    // give player initial stats
    player.food = 99;
    player.money = 1000;
    player.kibble = 450;
    player.mokeballs = 27;
    player.speed = 4;
    player.mokemon.clear();
    // reset to beginning of trail
    player.progress = 1;
    // remove any existing mokemon
    posse.forEach((mokemon) => {mokemon.remove();});
    // // remove all background objects
    trail.scenery = [];
    // construct a new party from scratch
    ['charizard', 'jigglypuff', 'articuno', 'ninetales', 'snorlax'].forEach( name => {
        posse.push(new mokePosse(name))
    })
    player.posse = posse;
    player.time = 0;
    player.day = 0;
    trail.loadFrom(player.progress);
    gameInterval = setInterval(gameLoop, 1000 / canvas.metrics.frameRate);
}

function gameLoop () {
    // time does pass
    if (!paused) {
        player.time += timeSpeed;
        // move the sun
        moveSun();
        // a new dawn
        if (player.time >= 24) nextDay();
    }

    trail.travel();
    canvas.draw();

    // mokemon hop
    posse.forEach((mokemon) =>{
        mokemon.hop();
    });

    // do random events
    events.forEach((event) => {
        if (!paused && event.occurs) event.function();
    });

    // narrate the journey
    narrate();

    // are we there yet?
    if (player.currentLocation != trail.currentLocation) {
        // we are here!
        arriveAt(trail.currentLocation);
    }
}

function moveSun() {
    var x = -Math.sin(Math.PI * (0.5 + player.time / 24)) * 50 + 50;
    var y = Math.cos(Math.PI * (0.5 + player.time / 24)) * 45 + 45;
    $("#sun").css({'top': y + '%', 'left': x + '%'});
}

function nextDay() {
    // reset time
    player.time = 0; 
    player.day += 1;
    // eat
    player.food -= 10;
    player.kibble -= 5 * posse.length;
    // mokemon conditions (ebola and so forth)
    posse.forEach((mokemon) =>{
        mokemon.doConditions();
    });    
}

function narrate() {
    // measure the distance to out next location
    var distanceTo = parseInt(trail.currentLocation.length - trail.currentLocation.progress);

    $("#narrative").html(
        'Day: ' + player.day + 
        ((distanceTo == 0)  
        ? ('<br>' + 'You have reached: ' + trail.nextLocation.name + '.')
        : ('<br>Location: ' + trail.currentLocation.name +
            '<br>' + distanceTo + ' miles to ' + trail.nextLocation.name + '.')));
}

function arriveAt(location) {
    player.currentLocation = location;
    // execute this location's function, if it has one
    if (location.function) location.function();
}

function pause() {
    paused = true;
    clearInterval(gameInterval);
}

function unpause() {
    if (paused) {
        paused = false;
        gameInterval = setInterval(gameLoop, 1000 / canvas.metrics.frameRate);
    }
}

function hunt() {
    window.location.href = ('poke-hunt.html?playerID=' + player.ID);
}

function rest() {
    // how long?
    if (paused) return;
    pause();
    $("#rest").show();
    $("#restform").submit((event) => {
        event.preventDefault();
        player.day += parseInt($("#restLength").val());
        $("#rest").hide();
        unpause();
        gameLoop();
    });
}

function inventory() {
    // show your items
    if (paused) return;
    pause();
    $("#inventory").empty().html('<h1>Your Items:</h1>').show()
        .append("Money: " + player.money + "<br>")
        .append("mokeballs: " + player.mokeballs + "<br>")
        .append("Food: " + player.food + "<br>")
        .append("Kibble: " + player.kibble + "<br>")
        .append("Extra mokemon:");
    if (player.mokemon.list.length > 0) {
        $("#inventory").append("<br> <ul>");
        player.mokemon.list.forEach((mokemon) => {
            $("#inventory").append(mokemon.name + "<br>");
        });
        $("#inventory").append("</ul>");
    }
    else $("#inventory").append('none<br>');
    $("#inventory").append($("<button>").text('close').addClass('closeButton').on('click', closeInventory));
}

function partyStats() {
    // show posse stats
    if (paused) return;
    pause();
    $("#posse").empty();
    $("#posse").html('<h1>Your mokemon Posse:</h1>');
    posse.forEach((mokemon) => {
        var health = 'excellent';
        if (mokemon.health <= 9) health = 'good';
        if (mokemon.health <= 7) health = 'fair';
        if (mokemon.health <= 5) health = 'poor';
        if (mokemon.health <= 3) health = 'terrible';
        var html = "name: " + mokemon.name +
        '<br>' + 'health: ' + health + '<br>';
        if (mokemon.conditions.length > 0) {
            mokemon.conditions.forEach((condition) => {
                html += 'has ' + condition.name + '<br>'; 
            });
        }
        var item = $('<p>').html(html).addClass('mokestats');
        $("#posse").append(item);
    });
    $("#posse").append($("<button>").text('close').addClass('closeButton').on('click', closePosse));
    $("#posse").show();
}

function options () {
    pause();
    $("#options").show();
}

function closeOptions() {
    $("#options").hide();
    unpause();
}

function closePosse() {
    $("#posse").hide();
    unpause();
}
function closeInventory() {
    $("#inventory").hide();
    unpause();
}

function win () {
    pause();
    // TODO
}

function msgBox(title, text, buttons) {
    pause();
    $("#msgbox").empty().show()
        .text(text)
        .prepend($("<div>").addClass('msgTitle').text(title))
        .append($("<div>").attr('id', 'msgbuttons'));
    buttons.forEach(button => {
        $("#msgbuttons").append($("<button>")
            .addClass('msgbutton')
            .text(button.text)
            .click(() => {button.function(); $("#msgbox").hide(); unpause();})
        )
    })
}