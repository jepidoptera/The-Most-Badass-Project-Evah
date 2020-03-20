// jshint esversion: 6
// jshint multistr: true
var backgroundImages = [];

var you = $('<img>')
    .attr('src', './assets/images/walking.gif')
    .addClass('ordered')
    .attr('z-offset', 25)
    .appendTo('walkingPath')
var frameRate = 30;
var pause = false;
var exit = false;
var trailHeight = 30;

var yourPosition = 15 * frameRate;
var atHorizon = 1;
var activeLocations;
var currentLocation;
var nextLocation;
var scrollSpeed = 1;
var timeSpeed = 0.05;
var posse = [];
var canvas;

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
        this.distance = params.distance;
        this.images = [];
        this.offset = params.offset;
        if (params.image) {
            this.image = [$("<img>").attr("src", params.image).appendTo($("body")).hide()[0]];
        }
        else {
            for (let n = params.imgRange.min; n <= params.imgRange.max; n++) {
                this.images.push($("<img>").attr("src", './assets/images/' + this.type + n + ".png")[0])
            }
        }
        this.isForeground = params.isForeground || (() => false);
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
        spacing: 25,
        sizeRange: { min: { x: 300, y: 225 }, max: { x: 600, y: 600 } },
        imgRange: { min: 0, max: 5 },
        distance: () => 100 - Math.random() * Math.random() * 100,
    }),
    pokegonemon: new SceneObject ({
        type: "pokegonemon",
        image: './assets/images/pokegonemon.png',
        height: 150,
        width: 250,
        distance: () => 1,
        offset: {x: -50, y: -100},
    }),
    palm_tree: new SceneObject ({
        type: "palmtree",
        spacing: 8,
        sizeRange: {min: {x: 25, y: 50}, max: {x: 200, y: 200}},
        imgRange: {min: 0, max: 4},
        foreground: (Math.random() * 100 < 1.5) ? true : false,
        distance: () => 100 - Math.random() * Math.random() * 100
    }),
    cactus: new SceneObject ({
        type: "cactus",
        spacing: 100,
        sizeRange: {min: {x: 25, y: 25}, max: {x: 100, y: 100}},
        imgRange: {min: 0, max: 1},
        foreground: (Math.random() * 100 < 1.5) ? true : false,
        distance: () => 100 - Math.random() * Math.random() * 100
    }),
    house: new SceneObject ({
        type: "house",
        spacing: 28,
        sizeRange: {min: {x: 25, y: 25}, max: {x: 50, y: 50}},
        imgRange: {min: 0, max: 2},
        foreground: (Math.random() * 100 < 1.5) ? true : false,
        distance: () => 100 - Math.random() * Math.random() * 100
    }),
    tree: new SceneObject ({
        type: 'tree',
        spacing: 1,
        sizeRange: {min: {x: 80, y: 160}, max: {x: 360, y: 360}},
        imgRange: {min: 0, max: 4},
        isForeground: () => (Math.random() * 100 < 1.5) ? true : false,
        distance: () => 100 - Math.random() * Math.random() * Math.random() * 100
    }),
    orepoke: new SceneObject ({
        image: './assets/images/city0.png',
        height: 150,
        width: 250,
        distance: () => trailHeight - 1,
    })
}

class Trail {
    constructor(locations) {
        this.locations = locations;
        this.scenery = [];
        this.currentLocation = this.locations[0]
    }
    updateLocation() {
        this.currentLocation = this.locationAt(player.progress);
        this.atHorizon = this.locationAt(player.progress + canvas.metrics.screen_length);
    }
    locationAt(progress) {
        let progressTotal = 0;
        let location = this.locations[0];
        for (let n in this.locations) {
            progressTotal += this.locations[n].length;
            if (progressTotal > progress) {
                location = this.locations[n];
                break;
            }
        }
        return location;
    }
    travel() {
        player.progress += 1/ canvas.metrics.frameRate;
        this.updateLocation();
        // make new scenery
        this.atHorizon.scenery.forEach(element => {
            if (Math.random() * element.spacing < 1) {
                this.scenery.push(new backgroundImage(element));
            }
        });
        // move along existing scenery
        let remainingSceneItems = [];
        let scrollSpeed = canvas.foreground.width / canvas.metrics.screen_length / canvas.metrics.frameRate;
        for (let n in this.scenery) {
            this.scenery[n].x -= scrollSpeed * (150 - this.scenery[n].distance) / 150;
            if (this.scenery[n].x > -this.scenery[n].width) remainingSceneItems.push(this.scenery[n]);
        }
        this.scenery = remainingSceneItems.sort((a, b) => {return a.distance > b.distance ? -1 : 1})
    }
}

const trail = new Trail ([
        TrailLocation({
            type: 'nowhere',
            name: 'what you leave behind',
            length: 2.5,
            scenery: [
                SceneObjects.house
            ],
        }),
        TrailLocation({
            type: 'city',
            name: 'Orepoke',
            scenery: [
                SceneObjects.orepoke
            ],
        }),
        TrailLocation({
            type: 'suburb',
            name: 'The Outskirts of Orepoke',
            scenery: [
                SceneObjects.house
            ],
            length: 10
        }),
        TrailLocation({
            type: 'forest',
            name: 'The Forest of Doom',
            scenery: [
                SceneObjects.tree
            ],
            length: 45 // seconds

        }),
        TrailLocation({
            type: 'desert',
            name: 'The Desert of Dryness',
            scenery: [
                SceneObjects.cactus,
                SceneObjects.rock
            ],
            length: 36 // seconds

        }),
        TrailLocation({
            type: 'mountains',
            name: 'The Mainstay Mountains',
            scenery: [
                SceneObjects.rock,
                SceneObjects.moutain
            ],
            length: 32 // seconds

        }),
        TrailLocation({
            type: 'forest',
            name: 'The Great Palm Jungle',
            scenery: [
                SceneObjects.palm_tree
            ],
            length: 75 // seconds

        }),
        TrailLocation({
            type: 'city',
            name: 'Pokegonemon',
            scenery: [
                SceneObjects.pokegonemon
            ],
            function: () => {
                // you won
                msgBox("Yay", "You have reached the legendary city!  Rejoice!", 
                dialogButtons([{
                    text: "Celebrate",
                    function: win // TODO
                }]));
            }
        }),
        TrailLocation({
            type: 'nothing',
            name: 'the Great Beyond',
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
        this.foreground = document.getElementById("foregroundCanvas");
        this.foregroundCtx = this.foreground.getContext('2d');
        this.background = document.getElementById("backgroundCanvas");
        this.backgroundCtx = this.background.getContext('2d');
    }
    metrics = {
        frameRate: 30,
        screen_width: 1000, // arbitrary units
        screen_length: 10, // seconds
    }

    draw = () => {
        this.foregroundCtx.clearRect(0, 0, this.foreground.width, this.foreground.height);
        this.backgroundCtx.clearRect(0, 0, this.background.width, this.background.height);
        trail.scenery.forEach(sceneObject => {
            if (sceneObject.foreground) {
                this.foregroundCtx.drawImage(sceneObject.img, 
                    sceneObject.x, sceneObject.y,
                    sceneObject.width, sceneObject.height)
            }
            else {
                this.backgroundCtx.drawImage(sceneObject.img, 
                    sceneObject.x, sceneObject.y,
                    sceneObject.width, sceneObject.height)
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

const events = {
    ebola: {
        name: "ebola",
        occurrences: 0,
        get occurs() {
            // every morning at dawn
            // occasionally
            return parseInt(Math.random() * 5000) == 0;
        },
        function: () => {
            var self = events.ebola;
            // it happens again
            self.occurences ++;
            self.length = Math.random() * 5;
            pause = true;
            // strikes randomly
            victim = posse[parseInt(Math.random() * posse.length)];
            if ($.inArray(self, victim.conditions)) {
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
            msgBox ("Outbreak!", victim.name + " has ebola.", dialogButtons([{
                text: "stop to rest",
                function: rest
            },{
                // or ruthlessly carry forward
                text: "keep going",
                function: () => {
                    // which cuts their chances of survival from 2/3 to 1/3, incidentally
                    victim.health -= 1;
                    pause = false;
                    gameLoop();
                }
            }]));
        }
    }
};

class pokePosse {
    constructor (name, health, conditions, x, y, hop) {
        this._hop = hop;
        this.name = name;
        this.health = health;
        this.conditions = conditions;
        this.x = x;
        this.y = y;
        switch (name) {
        case "articuno":
            this.height = 4;
            this.width = 4;
            break;
        case "charizard":
            this.height = 4;
            this.width = 5;
            break;
        case "snorlax":
            this.height = 4;
            this.width = 4;
            break;
        case "jigglypuff":
            this.height = 3;
            this.width = 3;
            break;
        case "ninetales":
            this.height = 4;
            this.width = 5;
            break;
        }
        this.img = $("<img>").
            attr('src', './assets/images/' + this.name + ".png")
            .css({
                'position': 'absolute', 
                'height': this.height + 'vh', 
                'width': this.width + 'vh', 
                'left': this.x + "%", 
                'top': this.y + "%", 
                "transform": "translate(-50%, -50%)"})
            .addClass('ordered');
        $("#walkingPath").append(this.img);
        // setTimeout(() => {
        //     // zorder
        //     orderZIndex(this.img);            
        // }, 100);
    }
    hop() {
        // hoppin' down the trail
        var y = Math.cos(Math.PI * (0.5 + (player.time + this._hop % 0.5))) * 3;
        // position on screen according to object coordinates
        this.img.css({'left': this.x + "%", 'top': (this.y - y) + "%"});
    }
    doConditions() {
        // process any conditions this Pokemon may have
        var activeConditions = {};
        $.each(this.conditions, (condition) => {
            if (condition.active) {
                condition.length --;
                activeConditions[condition.name] = condition;
            }
        });
        this.conditions = activeConditions;
    }
    die() {
        msgBox('tragedy', this.name + " has died.", dialogButtons([{
            text: 'ok',
            function: null
        }]));
        this.remove();
    }
    remove() {
        posse.slice(posse.indexOf(this), 1);
        this.img.remove();
    }
}

class backgroundImage {
    constructor (prototype) {
        this.x = canvas.foreground.width;
        this.img = prototype.images[Math.floor(Math.random() * prototype.images.length)];
        this.distance = prototype.distance;
        this.foreground = prototype.isForeground;
        if (this.foreground) {
            this.distance -= this.distance / .666;
        }

        let distanceFactor = (100 - this.distance) / 100;
        this.size = Math.random();
        this.width = 10 + (prototype.sizeRange.min.x + this.size * (prototype.sizeRange.max.x - prototype.sizeRange.min.x)) * distanceFactor;
        this.height = 10 + (prototype.sizeRange.min.y + this.size * (prototype.sizeRange.max.y - prototype.sizeRange.min.y)) * distanceFactor;

        let floor = (this.foreground) ? canvas.foreground.height * 2 : canvas.background.height;
        if (this.foreground) distanceFactor -= 1;
        this.y = distanceFactor * (floor - this.height);
    }

}

$(document).ready(() => {
    console.log("ready!");
    canvas = new Canvas();

    $('#walkingPath').append(you);

    newGame();
    gameLoop();
})

function newGame() {
    // give player initial stats
    player.food = 99;
    player.money = 1000;
    player.kibble = 450;
    player.pokeballs = 27;
    player.speed = 4;
    player.pokemon.clear();
    // reset to beginning of trail
    player.progress = 0;
    atHorizon = 1;
    currentLocation = trail.locations[atHorizon];
    // this is the only active location to start with
    activeLocations = [currentLocation];
    nextLocation = trail.locations[atHorizon + 1];
    // remove any existing pokemon
    posse.forEach((pokemon) => {pokemon.remove();});
    // // remove all background objects
    trail.scenery = [];
    // construct a new party from scratch
    posse = ['charizard', 'jigglypuff', 'articuno', 'ninetales', 'snorlax'].map((name, i) => {
        return new pokePosse(name, 10, [], 25 - i * 4 - 4, 78, i * 0.2);
    });
    player.posse = posse;
    player.time = 0;
    player.day = 0;

    // // fast-forward to player's location
    // pause = true;
    // var walkTo = 18 * frameRate; // so scenery almost takes up the screen
    // for (i = 0; i < walkTo; i++) {
    //     // un-pause it on the last round - so it will draw the scenery
    //     if (i == walkTo - 1) unPause();
    //     gameLoop();
    // }
    // // re-pause
    // pause = true;
}

// function loadGame() {
//     // create posse
//     posse = player.posse.map((poke, i) => {
//         return new pokePosse(poke.name, poke.health, poke.conditions, 25 - i * 4 - 4, 65, i * 0.2);
//     });
//     // where were we?
//     atHorizon = trail.map((location) => 
//     {return location.name}).indexOf(player.location.name);
//     currentLocation = trail.locations[atHorizon];
//     activeLocations = [currentLocation];
//     // rewind
//     var screenWidth = 20 * frameRate;
//     currentLocation.progress = player.location.progress - screenWidth;
//     while (currentLocation.progress < 0 && atHorizon > 0) {
//         // rewound past the beginning of the current location - go back by one
//         atHorizon --;
//         currentLocation = trail.locations[atHorizon];
//         currentLocation.progress = currentLocation.length * frameRate + trail.locations[atHorizon + 1].progress;
//         trail.locations[atHorizon + 1].progress = 0;
//         activeLocations = [currentLocation];
//     }
//     nextLocation = trail.locations[atHorizon + 1];
//     // play forward
//     pause = true;
//     for (i = 0; i < screenWidth; i++) {
//         gameLoop();
//     }
//     unPause();
//     gameLoop();
// }

function gameLoop () {
    // time the processing time per frame
    var frameStarted = now();

    // // move along (for each on-screen location)
    // activeLocations.forEach(location => {
    //     location.progress += scrollSpeed;
    // });
    // time does pass
    if (!pause) {
        player.time += timeSpeed;
        // move the sun
        moveSun();
        // a new dawn
        if (player.time >= 24) nextDay();
    }

    trail.travel();
    canvas.draw();

    // pokemon hop
    posse.forEach((pokemon) =>{
        pokemon.hop();
    });

    // do random events
    $.each(events, (event) => {
        if (!pause && event.occurs == true) event.function();
    });

    // narrate the journey
    narrate();

    // are we there yet?
    if (currentLocation.progress >= currentLocation.length * frameRate + yourPosition) {
        // we are here!
        arriveAt(nextLocation);
    }
    // set up next iteration here for consistent framerate
    var frameLength = now() - frameStarted;
    if (!pause && !exit) {
        // set up next frame
        setTimeout(() => {
            gameLoop();
        }, 1000 / frameRate - frameLength);
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
    // pokemon conditions (ebola and so forth)
    posse.forEach((pokemon) =>{
        pokemon.doConditions();
    });    
}

function narrate() {
    // measure the distance to out next location
    var distanceTo;
    if (trail.locations[atHorizon] == nextLocation) {
        // a new location is on the horizon, but you aren't there yet
        distanceTo = parseInt((yourPosition - trail.locations[atHorizon].progress) / frameRate) + 1;
    }
    //                         measured in seconds        in frames      in frames         ---> convert to seconds (miles)    
    else {
        distanceTo = parseInt(currentLocation.length + (yourPosition - currentLocation.progress) / frameRate) + 1;
        if (distanceTo == 1) distanceTo = 0;
    }
    $("#narrative").html(
        'Day: ' + player.day + 
        ((distanceTo == 0)  
        ? ('<br>' + 'You have reached: ' + nextLocation.name + '.')
        : ('<br>Location: ' + currentLocation.name +
            '<br>' + distanceTo + ' miles to ' + nextLocation.name + '.')));
}

function arriveAt(location) {
    currentLocation = location;
    nextLocation = currentLocation.next;
    // execute this location's function, if it has one
    if (currentLocation.function) currentLocation.function();
}

function orderZIndex(element) {
    // order z-coordinate by y coordinate and optional offset value
    var zindex = parseInt($(element).css('top'));
    var offset =  parseInt($(element).attr('z-offset')) || 0;
    element.css({"z-index": zindex + offset});
}

function unPause() {
    if (pause) {
        pause = false;
        gameLoop();
    }
}

function hunt() {
    if (pause) return;
    pause = true;
    window.open('poke-hunt.html?playerID=' + player.ID);
    window.onfocus = () => {
        unPause();
        window.onfocus = null;
        gameLoop();
    };
}

function rest() {
    // how long?
    if (pause) return;
    pause = true;
    $("#rest").show();
    $("#restform").submit((event) => {
        event.preventDefault();
        player.day += parseInt($("#restLength").val());
        $("#rest").hide();
        unPause();
        gameLoop();
    });
}

function inventory() {
    // show your items
    if (pause) return;
    pause = true;
    $("#inventory").empty().html('<h1>Your Items:</h1>').show();
    $("#inventory").append("Money: " + player.money + "<br>");
    $("#inventory").append("Pokeballs: " + player.pokeballs + "<br>");
    $("#inventory").append("Food: " + player.food + "<br>");
    $("#inventory").append("Kibble: " + player.kibble + "<br>");
    $("#inventory").append("Extra Pokemon:");
    if (player.pokemon.list.length > 0) {
        $("#inventory").append("<br> <ul>");
        player.pokemon.list.forEach((pokemon) => {
            $("#inventory").append(pokemon.name + "<br>");
        });
        $("#inventory").append("</ul>");
    }
    else $("#inventory").append('none<br>');
    $("#inventory").append($("<button>").text('close').addClass('closeButton').on('click', closeInventory));
}

function partyStats() {
    // show posse stats
    if (pause) return;
    pause = true;
    $("#posse").empty();
    $("#posse").html('<h1>Your Pokemon Posse:</h1>');
    posse.forEach((pokemon) => {
        var health = 'excellent';
        if (pokemon.health <= 9) health = 'good';
        if (pokemon.health <= 7) health = 'fair';
        if (pokemon.health <= 5) health = 'poor';
        if (pokemon.health <= 3) health = 'terrible';
        var html = "name: " + pokemon.name +
        '<br>' + 'health: ' + health + '<br>';
        if (pokemon.conditions.length > 0) {
            pokemon.conditions.forEach((condition) => {
                html += 'has ' + condition.name + '<br>'; 
            });
        }
        var item = $('<p>').html(html).addClass('pokestats');
        $("#posse").append(item);
    });
    $("#posse").append($("<button>").text('close').addClass('closeButton').on('click', closePosse));
    $("#posse").show();
}

function options () {
    pause = true;
    $("#options").show();
}

function closeOptions() {
    $("#options").hide();
    unPause();
}

function closePosse() {
    $("#posse").hide();
    unPause();
}
function closeInventory() {
    $("#inventory").hide();
    unPause();
}

function win () {
    pause = true;
    // TODO
}
