// jshint esversion: 6
// jshint multistr: true
var trail = [
    {
        type: 'nowhere',
        name: 'the beginning of infinity',
        length: 1000000000001
    },
    {
        type: 'city',
        name: 'Orepoke',
        scenery: [{
            image: 'https://raw.githubusercontent.com/jepidoptera/The-Most-Badass-Project-Evah/master/assets/images/city0.png',
            height: 150,
            width: 250,
            distance: 1,
        }],
    },
    {
        type: 'suburb',
        name: 'The Outskirts of Orepoke',
        scenery: [
            {
                type: 'house',
                spacing: 28,
                sizeRange: {min: {x: 25, y: 25}, max: {x: 50, y: 50}},
                imgRange: {min: 0, max: 2},
                get distance() {return Math.sqrt(Math.random()) * 20 - 5;}
            }
        ],
        length: 10
    },
    {
        type: 'forest',
        name: 'The Forest of Doom',
        scenery: [
            {
                type: 'tree',
                spacing: 8,
                sizeRange: {min: {x: 25, y: 50}, max: {x: 200, y: 200}},
                imgRange: {min: 0, max: 4},
                get distance() {return Math.sqrt(Math.random()) * 20 - 5;}
            }
        ],
        length: 45 // seconds

    },
    {
        type: 'desert',
        name: 'The Desert of Dryness',
        scenery: [
            {
                type: 'cactus',
                spacing: 100,
                sizeRange: {min: {x: 25, y: 25}, max: {x: 100, y: 100}},
                get distance() {return Math.random() * 20 - 2;},
                imgRange: {min: 0, max: 1}
            },
            {
                type: 'rock',
                spacing: 145,
                sizeRange: {min: {x: 10, y: 5}, max: {x: 50, y: 25}},
                imgRange: {min: 0, max: 3},
                get distance() {return Math.random() * 20 - 2;}
            }
        ],
        length: 36 // seconds

    },
    {
        type: 'mountains',
        name: 'The Mainstay Mountains',
        scenery: [
            {
                type: 'mountain',
                spacing: 75,
                sizeRange: {min: {x: 200, y: 150}, max: {x: 400, y: 300}},
                imgRange: {min: 0, max: 5},
                offset: ["-100%", "-75%"],
                get distance() {return Math.sqrt(Math.random()) * 50;}
            },
            {
                type: 'rock',
                spacing: 145,
                sizeRange: {min: {x: 10, y: 5}, max: {x: 50, y: 25}},
                imgRange: {min: 0, max: 3},
                get distance() {return Math.random() * 5 - 2;}
            }
        ],
        length: 32 // seconds

    },
    {
        type: 'forest',
        name: 'The Great Palm Jungle',
        scenery: [
            {
                type: 'palmtree',
                spacing: 8,
                sizeRange: {min: {x: 25, y: 50}, max: {x: 200, y: 200}},
                imgRange: {min: 0, max: 4},
                get distance() {return Math.random() * 50 - 2;}
            }
        ],
        length: 75 // seconds

    },
    {
        type: 'city',
        name: 'Pokegonemon',
        scenery: [{
            image: 'https://raw.githubusercontent.com/jepidoptera/The-Most-Badass-Project-Evah/master/assets/images/pokegonemon.png',
            height: 150,
            width: 250,
            distance: 1,
            offset: ['-50%', '-100%']
        }],
        function: () => {
            // you won
            msgBox("Yay", "You have reached the legendary city!  Rejoice!", 
            dialogButtons([{
                text: "Celebrate",
                function: win // TODO
            }]));
        }
    },
    {
        type: 'nothing',
        name: 'the Great Beyond',
        length: 1000000000001
    },
    {
        type: 'the end',
        name: 'infinity',
        length: 0
    }
];
// default params
for (i = 0; i < trail.length; i ++) {
    trail[i].frames = 0; 
    trail[i].length = trail[i].length || 0;
    if (i < trail.length) trail[i].next = trail[i+1];
    if (trail[i].scenery) {
        trail[i].scenery.forEach(item => {
            item.spacing = item.spacing || 0;
            item.next = Math.random() * item.spacing;
        });
    }
}

var events = {
    ebola: {
        name: "ebola",
        occurrences: 0,
        get occurs() {
            // occasionally
            return player.day == events.ebola.occurrences + 1 || Math.random() * 1000;
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
                    victim.health -= 3;
            }});
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
        this.img = $("<img>").
            attr('src', 'https://raw.githubusercontent.com/jepidoptera/The-Most-Badass-Project-Evah/master/assets/images/' + this.name + ".png")
            .css({
                'position': 'absolute', 
                'height': this.height + 'px', 
                'width': this.width + 'px', 
                'left': this.x + "%", 
                'top': this.y + "%", 
                "transform": "translate(-50%, -50%)"})
            .addClass('ordered');
        $("#walkingPath").append(this.img);
        setTimeout(() => {
            // zorder
            orderZIndex(this.img);            
        }, 100);
    }
    hop() {
        // hoppin' down the trail
        var y = Math.cos(Math.PI * (0.5 + (player.time + this._hop % 0.5))) * 4;
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

class backGroundImage {
    constructor (prototype) {
        // position
        this.x = 110;
        var maxDistance = trailHeight - 45;
        var distance = prototype.distance;
        if (distance > maxDistance) distance = maxDistance;
        this.y = trailHeight - distance;
        // keep the road clear
        if (this.y > trailHeight) this.y += 10;
        // construct image
        var size = Math.random() / (2 ** (distance / maxDistance));
        var offset = prototype.offset || ["-100%", "-100%"];
        var height = prototype.height || prototype.sizeRange.min.y + size * (prototype.sizeRange.max.y - prototype.sizeRange.min.y);
        var width = prototype.width || prototype.sizeRange.min.x + size * (prototype.sizeRange.max.x - prototype.sizeRange.min.x);
        var imgName = prototype.image || 'https://raw.githubusercontent.com/jepidoptera/The-Most-Badass-Project-Evah/master/assets/images/' + prototype.type + parseInt(Math.random() * (prototype.imgRange.max - prototype.imgRange.min + 1) + prototype.imgRange.min) + ".png";
        this.img = $('<img>')
            .attr('src', imgName)
            .css({
                'position': 'absolute', 
                'left': this.x + "%", 
                'top': this.y + "%", 
                'height': height + 'px', 
                'width': width + 'px', 
                "transform": "translate(" + offset[0] + ", " + offset[1] + ")"})
            .addClass('ordered');
        $('#walkingPath').append(this.img);
        this.active = true;
        this.ordered = false;
    }
    move() {
        // move one frame
        this.x -= scrollSpeed * 5 / frameRate;
        if (!pause) this.calcPosition();
        // delete when off screen
        if (this.x < 0) {
            this.remove();
        }
    }
    remove() {
        this.img.remove();
        this.active = false;
    }
    calcPosition() {
        // position on screen according to object coordinates
        this.img.css({'left': this.x + "%", 'top': this.y + "%"});
    }
}
var backgroundImages = [];

var you = $('<img>')
    .attr('src', 'https://raw.githubusercontent.com/jepidoptera/The-Most-Badass-Project-Evah/master/assets/images/walking.gif')
    .css({'top': "65%", 'left': '25%', 'position': 'absolute', 'height': '50px', 'width': '50px', 'transform': 'translate(-50%, -50%)'})
    .addClass('ordered')
    .attr('z-offset', 25);
var frameRate = 30;
var pause = false;
var exit = false;
var trailHeight = 65;
// how many frames does it take for a thing from the right side of the screen
// to reach your stick figure animation?
// when frames / framerate * speed = 75
// so frames / framerate / speed = 1%, * 75 = ...whatever.  it works, right?
var yourPosition = 15 * frameRate;
var atHorizon = 1;
var activeLocations;
var currentLocation;
var nextLocation;
var scrollSpeed = 1;
var timeSpeed = 0.05;
var posse = [];

function firebaseReady() {
    // here we can append permanent objects to the DOM, after the document has loaded
    $('#walkingPath').append(you);
    // ground segments, so we can have different terrain colors
    for (i=0; i<12; i++) {
        // TODO
    }
    pause = true;
    orderZIndex(you);
    if (player.location) {
        // pick up where we left off
        loadGame();
    }
    else {
        newGame();
        // say hi
        msgBox('your journey begins', 
        'Leaving behind your beleaguered home city of Orepoke, \
        you look ahead, over many obstacles, to your legendary destination: Pokegonemon.',
        dialogButtons([{
            text: "let's go",
            function: () => {
                unPause();
                gameLoop();    
            }
        }]));
    }
}

function newGame() {
    // give player initial stats
    player.food = 99;
    player.money = 1000;
    player.kibble = 450;
    player.pokeballs = 27;
    player.speed = 4;
    player.pokemon.clear();
    // reset to beginning of trail
    player.location = trail[1];
    atHorizon = 1;
    currentLocation = trail[atHorizon];
    // this is the only active location to start with
    activeLocations = [currentLocation];
    nextLocation = trail[atHorizon + 1];
    // remove any existing pokemon
    posse.forEach((pokemon) => {pokemon.remove();});
    // remove all background objects
    backgroundImages.forEach((image) => {image.remove();});
    // reset frame count
    trail.forEach((location) => {location.frames = 0;});
    // construct a new party from scratch
    posse = ['charizard', 'jigglypuff', 'articuno', 'ninetales', 'snorlax'].map((name, i) => {
        return new pokePosse(name, 10, [], 25 - i * 4 - 4, 65, i * 0.2);
    });
    player.posse = posse;
    player.time = 0;
    player.day = 0;

    // fast-forward to player's location
    pause = true;
    var walkTo = 18 * frameRate; // so scenery almost takes up the screen
    for (i = 0; i < walkTo; i++) {
        // un-pause it on the last round - so it will draw the scenery
        if (i == walkTo - 1) unPause();
        gameLoop();
    }
    // re-pause
    pause = true;
}

function loadGame() {
    // create posse
    posse = player.posse.map((poke, i) => {
        return new pokePosse(poke.name, poke.health, poke.conditions, 25 - i * 4 - 4, 65, i * 0.2);
    });
    // where were we?
    atHorizon = trail.map((location) => 
    {return location.name;}).indexOf(player.location.name);
    currentLocation = trail[atHorizon];
    activeLocations = [currentLocation];
    // rewind
    var screenWidth = 20 * frameRate;
    currentLocation.frames = player.location.frames - screenWidth;
    while (currentLocation.frames < 0 && atHorizon > 0) {
        // rewound past the beginning of the current location - go back by one
        atHorizon --;
        currentLocation = trail[atHorizon];
        currentLocation.frames = currentLocation.length * frameRate + trail[atHorizon + 1].frames;
        trail[atHorizon + 1].frames = 0;
        activeLocations = [currentLocation];
    }
    nextLocation = trail[atHorizon + 1];
    // play forward
    pause = true;
    for (i = 0; i < screenWidth; i++) {
        gameLoop();
    }
    unPause();
    gameLoop();
}

function gameLoop () {
    // time the processing time per frame
    var frameStarted = now();

    // move along (for each on-screen location)
    activeLocations.forEach(location => {
        location.frames += scrollSpeed;
    });
    // time does pass
    if (!pause) {
        player.time += timeSpeed;
        // move the sun
        moveSun();
        // a new dawn
        if (player.time >= 24) nextDay();
    }

    // bring in new scenery from the location which is currently at the edge of the screen
    if (trail[atHorizon].scenery) {
        trail[atHorizon].scenery.forEach (item => {
            // insert a scenery item of this type
            if (item.next <= 0) {
                backgroundImages.push(new backGroundImage(item));
                item.next = parseInt(item.spacing * Math.random());
            }
            // count down to the next one
            else item.next -= scrollSpeed;
        });
    }
    // switch edge location when it's run out
    if (trail[atHorizon].frames > (trail[atHorizon].length - 1) * frameRate) {
        atHorizon ++;
        activeLocations.push(trail[atHorizon]);
        console.log(trail[atHorizon].name + " appears on the horizon");
    }
    // keep player info updated
    player.location = currentLocation;
    // image animation and garbage collection
    var activeImages = [];
    backgroundImages.forEach((image) => {
        image.move();
        // give it a z-index according to its y attribute (if that hasn't been done yet)
        // jquery seems to take one frame to change the css value from 'percent' to 'px'
        // so it has to be done here, this was, instead of by the constructor
        if (!image.ordered) orderZIndex(image.img);
        // still active - keep it on the list
        if (image.active) activeImages.push(image);
    });
    backgroundImages = activeImages;

    // pokemon hop
    posse.forEach((pokemon) =>{
        pokemon.hop();
    });

    // do random events
    $.each(events, (event) => {
        // if (event.occurs) event.function();
    });

    // narrate the journey
    narrate();

    // are we there yet?
    if (currentLocation.frames >= currentLocation.length * frameRate + yourPosition) {
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
    if (trail[atHorizon] == nextLocation) {
        // a new location is on the horizon, but you aren't there yet
        distanceTo = parseInt((yourPosition - trail[atHorizon].frames) / frameRate) + 1;
    }
    //                         measured in seconds        in frames      in frames         ---> convert to seconds (miles)    
    else {
        distanceTo = parseInt(currentLocation.length + (yourPosition - currentLocation.frames) / frameRate) + 1;
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
