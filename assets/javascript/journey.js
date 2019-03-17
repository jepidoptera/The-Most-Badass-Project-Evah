// jshint esversion: 6
var trail = [
    {
        type: 'city',
        name: 'Pokemon City',
        text: 'you have arrived at Pokemon City.'
    },
    {
        type: 'forest',
        name: 'The Forest of Doom',
        scenery: [
            {
                type: 'tree',
                spacing: 15,
                sizeRange: {min: {x: 25, y: 50}, max: {x: 200, y: 200}},
                imgRange: {min: 0, max: 4}
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
                imgRange: {min: 0, max: 1}
            },
            {
                type: 'rock',
                spacing: 145,
                sizeRange: {min: {x: 10, y: 5}, max: {x: 50, y: 25}},
                imgRange: {min: 0, max: 3}
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
                spacing: 35,
                sizeRange: {min: {x: 75, y: 50}, max: {x: 200, y: 150}},
                imgRange: {min: 0, max: 5}
            },
            {
                type: 'rock',
                spacing: 145,
                sizeRange: {min: {x: 10, y: 5}, max: {x: 50, y: 25}},
                imgRange: {min: 0, max: 3}
            }
        ],
        length: 32 // seconds

    },
    {
        type: 'city',
        name: 'Pokegonemon'
    },
    {
        type: 'nothing',
        name: 'the Great Beyond',
        length: 1000000000001
    }
];
// default params
for (i = 0; i < trail.length; i ++) {
    trail[i].frames = 0; 
    trail[i].length = trail[i].length || 0;
    if (i < trail.length) trail[i].next = trail[i+1];
    if (trail[i].scenery) {
        trail[i].scenery.forEach(item => {
            item.next = Math.random() * item.spacing;
        });
    }
}
var frameRate = 30;
var pause = false;
var exit = false;
var speed = 5;
class backGroundImage {
    constructor (prototype) {
        // position
        this.x = 110;
        var distance = Math.random() * Math.random() * 20;
        this.y = 52 + distance;
        // choose size 
        this.size = Math.random() * 150 + 50;
        // keep the trail clear
        if (this.y > 65) this.y += 10;
        // construct image
        var size = Math.random();
        var height = prototype.sizeRange.min.y + size * (prototype.sizeRange.max.y - prototype.sizeRange.min.y);
        var width = prototype.sizeRange.min.x + size * (prototype.sizeRange.max.x - prototype.sizeRange.min.x);
        this.img = $('<img>')
            .attr('src', 'assets/images/' + prototype.type + parseInt(Math.random() * (prototype.imgRange.max - prototype.imgRange.min + 1) + prototype.imgRange.min) + ".png")
            .css({
                'position': 'absolute', 
                'left': this.x + "%", 
                'top': this.y + "%", 
                'height': height + 'px', 
                'width': width + 'px', 
                "transform": "translate(-50%, -100%)"})
            .addClass('ordered');
        $('#walkingPath').append(this.img);
        this.active = true;
        this.ordered = false;
    }
    move() {
        // move one frame
        this.x -= speed / frameRate;
        this.calcPosition();
        // delete when off screen
        if (this.x < 0) {
            this.img.remove();
            this.active = false;
        }
    }
    calcPosition() {
        // position on screen according to object coordinates
        this.img.css({'left': this.x + "%", 'top': this.y + "%"});
    }
}
var backgroundImages = [];

var you = $('<img>')
    .attr('src', 'assets/images/walking.gif')
    .css({'top': "65%", 'left': '25%', 'position': 'absolute', 'height': '50px', 'width': '50px', 'transform': 'translate(-50%, -50%)'})
    .addClass('ordered')
    .attr('z-offset', 50);
var nextTree = 0;
// how many frames does it take for a thing from the right side of the screen
// to reach your stick figure animation?
// when frames / framerate * speed = 75
// so frames / framerate / speed = 1%, * 75 = ...whatever.  it works, right?
var yourPosition = 75 / speed * frameRate;
var atHorizon = 0;
// this is the only active location to start with
var activeLocations = [trail[atHorizon]];
var currentLocation = trail[0];
var nextLocation = trail[1];

$(document).ready(() => {
    // here we can append permanent objects to the DOM, after the document has loaded
    $('#walkingPath').append(you);
    // ground segments, so we can have different terrain colors
    for (i=0; i<12; i++) {
        // TODO
    }
    orderZIndex(you);
    // fast-forward to player's location
    pause = true;
    for (i = 0; i < yourPosition; i++) {
        gameLoop();
    }
    pause = false;
});

function gameLoop () {
    // move along (for each on-screen location)
    activeLocations.forEach(location => {
        location.frames++;
        if (location.frames >= yourPosition) {
            // arrived at this thing
            arriveAt(location);
        }
    });
    console.log(trail[atHorizon].name + ": " + trail[atHorizon].frames);
    // bring in new scenery from the location which is currently at the edge of the screen
    if (trail[atHorizon].scenery) {
        trail[atHorizon].scenery.forEach (item => {
            // insert a scenery item of this type
            if (item.next <= 0) {
                backgroundImages.push(new backGroundImage(item));
                item.next = parseInt(item.spacing * Math.random());
            }
            // count down to the next one
            else item.next --;
        });
    }
    // switch edge location when it's run out
    if (trail[atHorizon].frames > trail[atHorizon].length * frameRate) {
        atHorizon ++;
        activeLocations.push(trail[atHorizon]);
        console.log(trail[atHorizon].name + " appears on the horizon");
    }
    // image animation and garbage collection
    var activeImages = [];
    backgroundImages.forEach((image) => {
        image.move();
        // give it a z-index according to its y attribute (if that hasn't been done yet)
        // jquery seems to take one frame to change the css value from 'percent' to 'px'
        // so it has to be done here, this was, instead of by the constructor
        if (!image.ordered) orderZIndex(image.img);
        if (image.active) {
            activeImages.push(image);
        }
    });
    backgroundImages = activeImages;

    // narrate the journey
    var distanceTo;
    if (trail[atHorizon] == nextLocation) {
        distanceTo = parseInt((yourPosition - trail[atHorizon].frames) / frameRate);
    }
    else distanceTo = parseInt((yourPosition - trail[atHorizon].frames) / frameRate);
    $("#narrative").html('Location: ' + currentLocation.name + '<br>' + distanceTo + ' miles to ' + nextLocation.name + '.');

    if (!pause && !exit) {
        // set up next frame
        setTimeout(() => {
            gameLoop();
        }, 1000 / frameRate);
    } 
}

function arriveAt(location) {
    currentLocation = location;
    nextLocation = currentLocation.next;
    switch (location.name) {
        case "Pokegonemon":
            // city menu screen
            msgBox("You have reached the legendary city!  Rejoice!")
            break;
        }
    }

function orderZIndex(element) {
    // order z-coordinate by y coordinate and optional offset value
    var zindex = parseInt($(element).css('top'));
    var offset =  parseInt($(element).attr('z-offset')) || 0;
    element.css({"z-index": zindex + offset});
}

function hunt() {
    window.open('poke-hunt.html');
}

gameLoop();