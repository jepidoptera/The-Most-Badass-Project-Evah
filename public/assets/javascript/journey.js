// jshint esversion: 6
// jshint multistr: true
var backgroundImages = [];

const you = $('<img>')
    .attr('src', './assets/images/walking.gif')
    .addClass('you');
var exit = false;
var trailHeight;
var horizonHeight;

var timeSpeed = 0.05;
var canvas;
var gameInterval;
const playerName = "{{name}}"

var trail;

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
    far_moutain: new SceneObject ({
        type: "mountain",
        spacing: 31,
        sizeRange: { min: { x: 400, y: 225 }, max: { x: 900, y: 600 } },
        imgRange: { min: 0, max: 4 },
        distance: () => 100 - Math.random() * Math.random() * 100,
    }),
    near_moutain: new SceneObject ({
        type: "mountain",
        spacing: 71,
        sizeRange: { min: { x: 200, y: 112 }, max: { x: 450, y: 300 } },
        imgRange: { min: 0, max: 4 },
        isForeground: () => true,
        foregroundDistance: () => -100,
    }),
    mountain_range: new SceneObject ({
        type: "mountain range",
        spacing: 100,
        height: 290,
        width: 1280,
        image: './assets/images/big mountain.png',
        distance: () => Math.random() * 100,
    }),
    first_mountain: new SceneObject ({
        type: "mountain range",
        spacing: 0,
        height: 290,
        width: 1280,
        image: './assets/images/big mountain.png',
        distance: () => 2,
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
        imgRange: {min: 0, max: 4},
        isForeground: () => (Math.random() * 100 < 40) ? true : false,
        distance: () => Math.random() * 50,
        foregroundDistance: () => Math.random() * -50
    }),
    tree: new SceneObject ({
        type: 'tree',
        spacing: 1.5,
        sizeRange: {min: {x: 80, y: 160}, max: {x: 360, y: 360}},
        imgRange: {min: 0, max: 5},
        isForeground: () => (Math.random() * 100 < 2) ? true : false,
        distance: () => Math.max(100 - Math.random() * Math.random() * 110, 0),
        foregroundDistance: () => Math.random() > .5 ? -20 : -50 
    }),
    distant_tree: new SceneObject ({
        type: 'tree',
        spacing: 2,
        sizeRange: {min: {x: 80, y: 160}, max: {x: 360, y: 360}},
        imgRange: {min: 0, max: 4},
        distance: () => 100 - Math.random() * Math.random() * 30
    }),
    pine_tree: new SceneObject ({
        type: 'pinetree',
        spacing: 12,
        sizeRange: {min: {x: 60, y: 120}, max: {x: 270, y: 270}},
        imgRange: {min: 0, max: 4},
        distance: () => Math.max(100 - Math.random() * Math.random() * 110, 0),
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
    }),
    trading_post: new SceneObject ({
        type: 'trading post',
        spacing: 0,
        image: './assets/images/trading post.png',
        height: 150,
        width: 150,
        distance: () => 1,
    })
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
        // this.locations.forEach(location => {if (location.scenery) location.scenery.forEach(item => {item.appeared = false})})
        this.scenery = [];
        let progressRate = 1/ canvas.metrics.frameRate;
        for (let n = 0; n < canvas.metrics.screen_length * canvas.metrics.frameRate; n ++) {
            this.currentLocation = this.locationAt(startingPoint - canvas.metrics.screen_length * .2 + n * progressRate);
            this.currentLocation.scenery.forEach(element => {
                let newElement = null;
                if (!element.spacing) {
                    if (this.currentLocation.progress <= 1 / canvas.metrics.frameRate) {
                        newElement = new backgroundImage(element);
                        element.appeared = true;
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
        this.travel();
    }
}

class Canvas {
    constructor () {
        this._canvas = document.getElementById("canvas");
        this._canvas.width = Math.max(screen.width, screen.height);
        this._canvas.height = this._canvas.width * 0.618;
        this.height = this._canvas.height;
        this.width = this._canvas.width;
        this.ctx = this._canvas.getContext('2d');
    }
    metrics = {
        frameRate: 30,
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
                let totalWidth = canvas.width/100;
                player.posse.forEach((mokemon, n) => {
                    totalWidth += mokemon.width + canvas.width/200;
                    this.ctx.drawImage(mokemon.img, canvas.width / 4 - totalWidth, mokemon.y - mokemon.z, mokemon.width, mokemon.height);
                })
                mokesDrawn = true;
            }
        })
    }
}


const events = {
    ebola: {
        contagion: 0,
        get occurs() {
            // every morning at dawn
            // return posse.length > 0 && player.time === 0;
            // occasionally
            events.ebola.contagion = player.posse.reduce((sum, moke) => 
                sum + moke.conditions.reduce((sum, condition) => 
                    sum + condition.name === "ebola" ? 1: 0 + condition.name === "quarantine" ? -0.8: 0, 0), 0
                ) + (trail.currentLocation.type === "jungle" ? 1 : 0)
            return player.posse.length > 0 && Math.random() * 100 <= events.ebola.contagion;
        },
        function: () => {
            // strikes randomly
            victim = player.posse[weightedRandom(player.posse.map(moke => 1 / moke.immuneResponse))];
            if (victim.conditions.map(c => c.name).includes('ebola')) {
                // can't get it twice
                console.log('prevented double occurrence of ebola.');
                return;
            } 
            victim.conditions.push ({
                name: 'ebola', 
                timeRemaining: 50 + parseInt(Math.random() * 70 / victim.immuneResponse)
            });
            // there's not much you can do but rest and hope
            msgBox ("Outbreak!", victim.name + " has ebola.", [{
                text: "stop to rest",
                function: nextDay
            },{
                // or ruthlessly carry forward
                text: "keep going",
                function: () => {
                    // which cuts their chances of survival from 2/3 to 1/3, incidentally
                    victim.health -= 2;
                }
            }]);
        }
    },
    sars: {
        get occurs() {
            // every morning at dawn
            // return posse.length > 0 && player.time === 0;
            // occasionally
            return player.posse.length > 0 && parseInt(Math.random() * 500) == 0;
        },
        function: () => {
            // strikes randomly
            victim = player.posse[parseInt(Math.random() * player.posse.length)];
            if (victim.conditions.map(c => c.name).includes('sars')) {
                // can't get it twice
                console.log('prevented double occurrence of sars.');
                return;
            } 
            victim.conditions.push ({
                name: 'sars', 
                timeRemaining: 60 + parseInt(Math.random() * 80 / victim.immuneResponse)
            });
            // there's not much you can do but rest and hope
            msgBox ("Outbreak!", victim.name + " has sars.", [{
                text: "stop to rest",
                function: nextDay
            },{
                // or ruthlessly carry forward
                text: "keep going",
                function: () => {
                    // which cuts their chances of survival from 2/3 to 1/3, incidentally
                    victim.health -= 2;
                }
            }]);
        }
    },
    bear: {
        get occurs() {
            return player.posse.length > 0 && trail.currentLocation.type === "forest" && parseInt(Math.random() * 100) == 0;
        },
        function: () => {
            // most often eats the weakest one
            victim = player.posse[weightedRandom(player.posse.map(moke => 1 / moke.health))];
            victim.die();
            msgBox ("Death", victim.name + " was eaten by a bear.", "damn")
        }
    },
    yeti: {
        get occurs() {
            // most often eats the weakest one
            return player.posse.length > 0 && trail.currentLocation.type === "mountains" && parseInt(Math.random() * 200) == 0;
        },
        function: () => {
            victim = player.posse[parseInt(Math.random() * player.posse.length)];
            victim.die();
            msgBox ("Death", victim.name + " was eaten by a yeti.", "damn")
        }
    },
    tree: {
        get occurs() {
            return player.posse.length > 0 && trail.currentLocation.type === "forest" && parseInt(Math.random() * 100) == 0;
        },
        function: () => {
            victim = player.posse[parseInt(Math.random() * player.posse.length)];
            victim.hurt(Math.random() * 11);
            msgBox ("Ouch", `A tree fell on ${victim.name}.`, ":_(")
            // put a picture of the victim in there so we can see how bad they're hurt
            $("#msgText").append(mokePortrait(victim));
        }
    },
    cactus: {
        get occurs() {
            return player.posse.length > 0 && trail.currentLocation.type === "desert" && parseInt(Math.random() * 200) == 0;
        },
        function: () => {
            victim = player.posse[parseInt(Math.random() * player.posse.length)];
            victim.hurt(Math.random() * 11);
            msgBox ("Ouch", `A cactus fell on ${victim.name}.`, ":_(")
            // put a picture of the victim in there so we can see how bad they're hurt
            $("#msgText").append(mokePortrait(victim));
        }
    },
    thief: {
        get occurs() {
            return player.day > 0 && player.hour === 0 && Math.random() * 10 < 1;
        },
        function: () => {
            let theftType = ["food", "mokeballs", "money", "mokemon"][Math.floor(Math.random() * 4)];
            let loss = "";
            if (theftType === "mokemon") {
                victim = player.posse[parseInt(Math.random() * player.posse.length)];
                victim.die();    
                loss = victim.name;
            }
            else {
                lossAmount = Math.floor(Math.random() * player[theftType]);
                if (lossAmount < 2) return;
                player[theftType] -= lossAmount;
                loss = lossAmount + " " + theftType;
            }
            msgBox ("Theft", "A thief comes in the night and makes off with: " + loss + ".", [
                {text: "how unfortunate"}
            ])
            player.messages.push(`${loss} was lost to a thief.`)
        }
    },
    foodLow: {
        get occurs() {
            return player.hour === 0 && player.food < player.foodPerDay * 3;
        },
        function: () => {
            let daysRemaining = parseInt(player.food / player.foodPerDay) + 1;
            player.lowFood = true;
            player.messages.push(`You are low on food.  You will starve in: ${daysRemaining} days.`)
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
                msgBox("starvation", "You are out of food! Who will you eat to survive?", player.posse.map(moke => {
                    return {
                        text: `${moke.name} (${moke.foodValue} food, eats ${moke.hunger}/day)`,
                        function: () => {
                            player.food += moke.foodValue;
                            moke.die(); 
                        }
                    }
                }))
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

const effects = {
    ebola: (victim) => { victim.hurt(.1) },
    sars: (victim) => { victim.hurt(.05) },
    rest: (moke) => { 
        moke.health = Math.min(moke.health + moke.maxHealth / 240, moke.maxHealth) 
    } // ten days to fully heal
}

class mokePosse {
    constructor (name, health = 0, conditions = []) {
        this._hop = player.posse.length * .37;
        this.name = name.slice(0, 1).toUpperCase() + name.slice(1).toLowerCase();
        this.conditions = conditions;
        // this.x = posse.length * 60 + canvas.width / 12;
        switch (this.name) {
        case "Dezzy":
            this.height = 50;
            this.width = 30;
            this.foodValue = 160;
            this.hunger = 4;
            this.maxHealth = 9;
            this.immuneResponse = 2;
            this.description = "A fun-loving flipper-flopper, hardy and disease resistant.  Doesn't eat a whole lot."
            break;
        case "Mallowbear":
            this.height = 50;
            this.width = 40;
            this.foodValue = 200;
            this.hunger = 10;
            this.maxHealth = 20;
            this.immuneResponse = .3;
            this.description = "Strong, sturdy, and stoic.  Eats voraciously.  Susceptible to disease."
            break;
        case "Apismanion":
            this.height = 40;
            this.width = 35;
            this.foodValue = 160;
            this.hunger = 8;
            this.maxHealth = 10;
            this.immuneResponse = 1;
            this.description = "Everyone's first go-to Mokemon.  This guy's been with you a long time.  Its legs don't make sense, but it's cute."
            break;
        case "Marlequin":
            this.height = 40;
            this.width = 30;
            this.foodValue = 90;
            this.hunger = 5;
            this.maxHealth = 11;
            this.immuneResponse = .9;
            this.description = "Enigmatic and rare.  Might have special powers, or maybe it just wants you to think that."
            break;
        case "Wingmat":
            this.height = 40;
            this.width = 70;
            this.foodValue = 210;
            this.hunger = 8;
            this.maxHealth = 10;
            this.immuneResponse = 2;
            this.description = "Looks like it could maybe fly, but can't.  Pretty good to eat in a pinch."
            break;
        case "Zyant":
            this.height = 50;
            this.width = 50;
            this.foodValue = 160;
            this.hunger = 7;
            this.maxHealth = 15;
            this.immuneResponse = 2;
            this.description = "This mysterious deer-thing is found in the woods, lurking behind a tree.  Has antlers and doesn't talk much."
            break;
        case "Shadowdragon":
            this.height = 70;
            this.width = 70;
            this.foodValue = 350;
            this.hunger = 20;
            this.maxHealth = 20;
            this.immuneResponse = 1;
            this.description = "Part dragon, part dog, part mantis, pretty big, definitely worth a lot of money.  Eats a crapload, so make sure you've got food."
            break;

        }
        this.width *= canvas.width / 1920;
        this.height *= canvas.width / 1920;
        this.y = trailHeight * canvas.height - this.height;
        this.z = 0;
        this.health = health || this.maxHealth;

        this.img = $("<img>").attr('src', './assets/images/mokemon/' + name.toLowerCase() + ".png")[0];
        this.bounceHeight = this.height / 2;
        this.index = player.posse.length;
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
            if (condition.timeRemaining > 0) {
                condition.timeRemaining --;
                if (effects[condition.name]) effects[condition.name](this);
                if (condition.timeRemaining > 0) activeConditions.push(condition);
            }
        });
        this.conditions = activeConditions;
    }
    hurt(damage) {
        this.health -= damage;
        if (this.health <= 0) this.die();
    }
    die() {
        msgBox('tragedy', this.name + " has died.", [{
            text: 'ok',
            function: () => {
            } // not much you can do here
        }]);
        player.posse.splice(this.index, 1);
        player.posse.forEach((moke, n) => {
            moke.index = n;
        })        
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
            if (prototype.foregroundDistance) this.distance = prototype.foregroundDistance;
        }

        let distanceFactor = (100 - this.distance) / 100;
        this.size = Math.random();
        this.width = 25 + (prototype.sizeRange.min.x + this.size * (prototype.sizeRange.max.x - prototype.sizeRange.min.x)) * distanceFactor;
        this.height = 25 + (prototype.sizeRange.min.y + this.size * (prototype.sizeRange.max.y - prototype.sizeRange.min.y)) * distanceFactor;
        this.width *= canvas.width / 1920;
        this.height *= canvas.width / 1920;

        let floor = (this.foreground) ? canvas.height * 1.1 : canvas.height * trailHeight;
        let ceiling = this.foreground ? canvas.height * (trailHeight + .05) : canvas.height * horizonHeight ;
        if (this.foreground) distanceFactor -= 1;
        this.y = ceiling + distanceFactor * (floor - ceiling) - this.height;
    }
}

$(document).ready(() => {
    console.log("ready!");
    canvas = new Canvas();

    $('#canvasArea').append(you);
    trailHeight = $("#path").position().top / $("#canvasArea").height();
    horizonHeight = $("#ground").position().top / $("#canvasArea").height();

    loadPlayer((playerData) => {
        loadTrail(trailData =>{

            trail = new Trail(trailData.map(location => {
                // console.log(location.name)
                return new TrailLocation({
                    ...location,
                    scenery: (location.scenery ? location.scenery.map(scenery => 
                            SceneObjects[scenery.type.replace(' ', '_')]
                        ) : [])
                })
            }))
            player = playerData;
            if (!player.progress) { 
                newGame();
            }
            else {
                player.currentLocation = trail.locationAt(player.progress);
                trail.loadFrom(player.progress);
            }
            // construct mokemon class from simplified objects
            let posse = player.posse;
            player.posse = [];
            posse.forEach(moke => {
                player.posse.push(new mokePosse(moke.name, moke.health, moke.conditions));
            })
        
            player = {
                ...player,
                get foodPerDay() {
                    return 5 + player.posse.reduce((sum, moke) => sum + moke.hunger, 0)
                },
                get currentMessage() {
                    return player.messages[player.messages.length - 1]
                }
            }
            gameInterval = setInterval(gameLoop, 1000 / canvas.metrics.frameRate);
        });
    })

})

function newGame() {
    // give player initial stats
    player.food = 99;
    player.money = 1000;
    player.mokeballs = 27;
    player.grenades = 9;
    player.speed = 4;
    player.name = player.name || 'simone';
    // reset to beginning of trail
    player.progress = 1;
    player.messages = ["You set off on the trail! Next stop: the forest of doom."];
    player.currentLocation = trail.locations[1];
    // construct a new party 
    player.posse = [{name: 'dezzy'}, {name: 'apismanion'}, {name: 'mallowbear'}, {name: 'marlequin'}, {name: 'wingmat'}];
    // // remove all background objects
    trail.scenery = [];
    player.time = 0;
    player.day = 0;
    trail.loadFrom(player.progress);
    // wait a fraction of a second because canvas doesn't work right away
    setTimeout(() => {
        canvas.draw()
    }, 100);
}

function gameLoop () {
    // time does pass
    if (paused) return;

    player.time += timeSpeed;
    if (player.hour != Math.floor(player.time)) {
        // hourly events
        player.hour = Math.floor(player.time);
        // random disasters
        Object.keys(events).forEach((key) => {
            if (!paused && events[key].occurs) events[key].function();
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

    trail.travel();
    canvas.draw();

    // mokemon hop
    player.posse.forEach((mokemon) =>{
        mokemon.hop();
    });

    // narrate the journey
    narrate();

    // are we there yet?
    if (player.currentLocation != trail.currentLocation) {
        // we are here!
        arriveAt(trail.currentLocation);
    }
}

function astralMovements() {
    var x = -Math.sin(Math.PI * (0.5 + player.time / 24)) * 50 + 50;
    var y = Math.cos(Math.PI * (0.5 + player.time / 24)) * 40 + 40;
    $("#sun").css({'top': y + '%', 'left': x + '%'});
    // the dark moon. should be at the same place as the sun on day 30 at noon
    let z = (player.day * 24 + player.time) ** 2 / 571536;
    x = -Math.sin(Math.PI * (0.333333 + (player.time + 12) / 72 + (player.day % 3) / 3)) * (25 + 25 * z) + 50;
    y = Math.cos(Math.PI * (0.333333 + (player.time + 12) / 72 + (player.day % 3) / 3)) * (40 * z) + 40;
    $("#darkMoon").css({'top': y + '%', 'left': x + '%', 'width': `${2+3*z}vmin`, 'height': `${2+3*+z}vmin`, 'border-width': `${1+z*1.5}vmin`, 'border-radius': `${1+z*1.5}vmin`});
    if (player.day === 31 && player.hour === 12) {
        lose();
    }
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
    let calendarDay = player.day < 26 
        ? 'Novembruary ' + (74 + player.day) + ((74 + player.day) % 10 === 1 ? "st" : ((74 + player.day) % 10 === 2 ? "nd" : ((74 + player.day) % 10 === 3 ? "rd" : "th")))
        : 'Februne ' + (player.day - 25) + ((player.day - 25) % 10 === 1 ? "st" : ((player.day - 25) % 10 === 2 ? "nd" : ((player.day - 25) % 10 === 3 ? "rd" : "th")))
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
    // execute this location's function, if it has one
    if (location.message) {
        msgBox(location.message.title, location.message.text, [{text: location.message.button}])
    };
    if (location.shop) {
        msgBox("Buy stuff?", `You have reached: ${location.name}.  Stop and buy supplies?`, [
            {text: "yes, of course", function: () => {
                shop(location.shop.items);
            }},
            {text: "no, I'm good"}
        ])
    }
    if (location.name === "Pokegonemon") {
        win();
    }
}

function rest() {
    // how long?
    pause();
    clearDialogs();

    let restingDialog = $("<div>").attr('id', 'restingDialog').addClass('dialogBox').appendTo($('#canvasArea'))
    let restParameters = {text: "rest for how long?", name: "rest", min: 0, max: Math.min(Math.floor(player.food / player.foodPerDay), 10), value: 1}
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
        player.posse.forEach(moke => {
            moke.conditions.push({name: "rest", timeRemaining: restParameters.value * 24})
        })
        let mokePosseHealthMonitor = $("<div>").addClass("dialogBox").appendTo($("#canvasArea"));
        let restInterval = setInterval(() => {
            mokePosseHealthMonitor.empty().append(
                player.posse.map(moke => mokePortrait(moke))
            )
            restParameters.value --;
            player.time ++;
            astralMovements();
            player.posse.forEach(moke => {moke.doConditions()});
            if (player.time >= 24) nextDay();
            if (restParameters.value <= 1) {
                clearInterval(restInterval);
                mokePosseHealthMonitor.remove();
                unpause();
            }    
        }, 43 - restParameters.value * 2);
        restParameters.value *= 24;
    });
}

function shop(shopItems) {
    let buyItems = {};
    let cost = 0;
    let shoppingDialog = $("<div>").attr('id', 'shoppingDialog').addClass('dialogBox').appendTo($('#canvasArea'))

    shoppingDialog.prepend($("<div>").addClass('msgTitle').text(player.currentLocation.shop.title || `Shopping at ${player.currentLocation.name}`))
        .append(
            $("<div>")
                .attr('id', 'shoppingText')
                .html((player.currentLocation.shop.text || "Welcome! Here's what you can buy."))
                .append(
                    "<br><br><hr>",
                    ...shopItems.map(item => {
                        return $("<div>").append(
                            $("<span>").html(`You have: ${player[item.name]} ${item.name}.  Buy @ $${item.price}:`),
                            $("<span>").addClass('quantity').attr('id', item.name).text("   0   "),
                            $("<span>").append(
                                $("<button>").text("+").click(() => {
                                    if (!(buyItems[item.name] > item.max) && cost + item.price <= player.money) {
                                        buyItems[item.name] = (buyItems[item.name] || 0) + 1;
                                        cost += item.price;
                                        $(`span#${item.name}.quantity`).text(`   ${buyItems[item.name]}   `);
                                        $("p#totalCost").text(`Total: $${cost}`);
                                        $("p#available").text(`Available: $${player.money - cost}`)
                                    }
                                    else if (cost + item.price > player.money) {
                                        $("p#available").css({color: "red"});
                                        setTimeout(() => {
                                            $("p#available").css({color: "white"})
                                        }, 100);
                                    }
                                }),
                                $("<button>").text("-").click(() => {
                                    if (buyItems[item.name] > 0) {
                                        buyItems[item.name] -= 1;
                                        cost -= item.price;
                                        $(`span#${item.name}.quantity`).text(buyItems[item.name]);
                                        $("p#totalCost").text(`Total: $${cost}`);
                                        $("p#available").text(`Available: $${player.money - cost}`)
                                    }
                                })
                            )
            
                        )
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
                                Object.keys(buyItems).forEach(item => {
                                    player[item] = (player[item] || 0) + buyItems[item];
                                })
                                player.money -= cost;
                                unpause();
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

function options () {
    if (paused) return;
    pause();
    $("#optionsMenu").show(); 
    $("#mokePosse").empty().append(player.posse.map(moke => 
        mokePortrait(moke)
    ))
    $("#mokeStats").empty();
    $("#foodInfo").text(`food: ${player.food} (-${player.foodPerDay}/day)`);
    $("#moneyInfo").text(`money: ${player.money}`);
    $("#ammoInfo").text(`mokeballs: ${player.mokeballs}, grenades: ${player.grenades}`);
    if (player.currentLocation.prey)
        $("#huntButton").show();
    else
        $("#huntButton").hide()
    if (player.currentLocation.shop)
        $("#shopButton").show();
    else
        $("#shopButton").hide()
}

function mokePortrait (moke) {
    let healthColor = `rgb(${768 - moke.health / (moke.maxHealth || 10) * 768}, ${(moke.health / (moke.maxHealth || 10) - 1/3) * 768}, 0)`
    let portrait = $("<div>").addClass('thumbnailContainer').append(
        $("<div>")
            .addClass('mokeIcon')
            .append(
                $(moke.img).css({
                    width: `${(moke.width > moke.height ? 1 : moke.width / moke.height) * 4.5}vmin`, 
                    height: `${(moke.height > moke.width ? 1 : moke.height / moke.width) * 4.5}vmin`,
                    display: "block",
                    position: "relative",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)"
                }))
            .click((event) => {
                $("#mokeStats").empty();
                if (!$(event.currentTarget).hasClass("selected")){
                    $("#mokeStats").append(mokeStats(moke));
                    $(".mokeIcon").removeClass("selected");
                    $(event.currentTarget).addClass("selected");
                }
                else {
                    $(".mokeIcon").removeClass("selected");
                }
            })
            .hover(() => {
                    // mouseenter
                        $("#mokeStats").empty().append(mokeStats(moke));
                        if (!$(event.currentTarget).hasClass("selected")) $(".mokeIcon").removeClass("selected");
                    }, (event) => {
                    // mouseleave
                        if (!$(event.currentTarget).hasClass("selected")) $("#mokeStats").empty();
                }),
        $("<div>").css({
            width: `${moke.health / (moke.maxHealth || 10) * 4.5}vmin`,
            height: "5px",
            position: "relative",
            bottom: 0,
            "background-color": healthColor,
        }))
    return portrait;
}

function mokeStats (moke) {
    return [
        $("<p>").text(moke.name),
        $("<p>").text(`Health: ${Math.floor(moke.health * 10) / 10}/${moke.maxHealth}`),
        ...moke.conditions.map(condition => $("<p>").html("<span style='color:red'> has " + condition.name + "</span>")),
        $("<p>").text(moke.description)
    ]
}

function numberInput(inputParams) {
    let numberInput = $("<div>").html(`${inputParams.text}: `)
        .addClass("numberInputLine")
        .append($("<span>")
            .addClass("numberInput")
            .append($("<input>")
                .attr("id", `${inputParams.name}Input`)
                .addClass("numberInput_text")
                .val(inputParams.value))
                .change(() => {
                    let self = $(`#${inputParams.name}Input`)
                    if (self.val() > inputParams.max) self.val(inputParams.max);
                    if (self.val() < inputParams.min) self.val(inputParams.min);
                    inputParams.value = self.val();
                })
            .append($("<span>")
                .addClass("numberInput_buttonContainer")
                .append(
                    $("<div>")
                        .attr("id", `${inputParams.name}Up`)
                        .addClass("numberInput_button")
                        .append($("<span>").addClass("numberInput_button_text").text("▲"))
                        .click(() => {
                            inputParams.value = Math.min(parseInt(inputParams.value) + 1, inputParams.max);
                            $(`#${inputParams.name}Input`).val(inputParams.value);
                        }),
                    $("<div>")
                    .attr("id", `${inputParams.name}Up`)
                        .addClass("numberInput_button")
                        .append($("<span>").addClass("numberInput_button_text").text("▼"))
                        .click(() => {
                            inputParams.value = Math.max(parseInt(inputParams.value) - 1, inputParams.min);
                            $(`#${inputParams.name}Input`).val(inputParams.value);
                        })
                )
            )
        )
    return numberInput;
// `<span class="numberInput">
//     <span class="numberInput_text" id="${inputTo.name}"></span>
//     <span class="numberInput_buttonContainer">
//         <div class="numberInput_button" id="${inputTo.name}Up"><span class="numberInput_button_text">▲</span></div>
//         <div class="numberInput_button" id="${inputTo.name}Down"><span class="numberInput_button_text">▼</span></div>
//     </span>
// </span>
// `
}

function closeOptions() {
    $("#optionsMenu").hide();
    unpause();
}

function win () {
    msgBox("glorious victory", `Let us count the survivors and give you some points! <br> You have: ${player.posse.length} surviving Mokemon.`, "sweet");
    let pointsValue = {
        food: .75,
        mokeballs: 15,
        grenades: 25
    }
    player.finalScore = Object.keys(pointsValue).reduce((sum, item) => sum + Math.floor(player[item] * pointsValue[item]), 0);
    $("#msgText").append(
        ...player.posse.map(moke => {
            let mokePoints = Math.floor(50 * moke.health / moke.maxHealth + 50);
            player.finalScore += mokePoints;
            return $("<p>").append(
                mokePortrait(moke),
                `${moke.name}: ${Math.floor(moke.health * 10) / 10}/${moke.maxHealth} hp = ${mokePoints}`,
            )
        }),
        ...Object.keys(pointsValue).map(item => 
            $("<p>").text(`leftover ${item} x ${player[item]} = ${Math.floor(player[item] * pointsValue[item])}`),
        ),
        $("<p>").text(`total: ${player.finalScore}`)
    )
    saveGame()
    // TODO
}

function lose() {
    pause();
    $("#sky").css({"background-color": "black"});
    setTimeout(() => {
        $("#sky").css("background-image", "url('./assets/images/thunderstorm.jpg')")
    }, 6000);
    setTimeout(() => {
        msgBox("The End", `The day turns to night.  Madness sweeps over the land.  From across the ${player.currentLocation.type}, wild Mokemon come screaming from all directions.  They fall upon you and tear your hapless corpse to shreds.  You did not reach the legendary city.  You did not survive.`, 
        [{text: "¯\\_(ツ)_/¯", function: () => {window.location.href = "/"}}])
    }, 8000);
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