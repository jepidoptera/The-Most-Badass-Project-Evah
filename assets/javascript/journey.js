// jshint esversion: 6
var trail = [
    {
        type: 'city',
        name: 'Pokemon City'
    },
    {
        type: 'forest',
        name: 'The Forest of Doom',
        treeSpacing: 15,
        length: 14 // seconds
    },
    {
        type: 'city',
        name: 'Pokegonemon'
    }
];

var frameRate = 30;
var pause = false;
var exit = false;
var speed = 5;
class backGroundImage {
    constructor (type) {
        var treeRange = {min: 0, max: 1};
        this.x = 110;
        var distance = Math.random() * Math.random() * 20;
        this.y = 52 + distance;
        // choose size 
        this.size = Math.random() * 150 + 50;
        // keep the trail clear
        if (this.y > 65) this.y += 10;
        // construct tree image
        this.img = $('<img>')
            .attr('src', 'assets/images/tree' + parseInt(Math.random() * (treeRange.max - treeRange.min + 1) + treeRange.min) + ".png")
            .css({'position': 'absolute', 'left': this.x + "%", 'top': this.y + "%", 'height': this.size + 'px', 'width': this.size + 'px', "transform": "translate(-50%, -100%)"})
            .addClass('ordered');
        $('#walkingPath').append(this.img);
        this.active = true;
    }
    move() {
        // move one frame
        this.x -= speed * frameRate / 1000;
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
    .addClass('ordered');
$(document).ready(() => {
    $('#walkingPath').append(you);
});
var nextTree = 0;

var currentLocation = 0;
function gameLoop () {
    var location = trail[currentLocation];
    var rightScreen = getFutureLocation(75 * frameRate / 1000 / speed);
    // move along
    currentLocation.frames ++;
    if (currentLocation.frames == yourPosition) {
        // arrived
        updateLocation();
    }
    switch (location.type) {
    case "city":
        // city menu screen
        currentLocation++;
        break;
    case "forest": 
        // add trees sometimes
        if (nextTree <= 0) {
            // add a tree
            backgroundImages.push(new backGroundImage('tree'));
            nextTree = parseInt(Math.random() * location.treeSpacing);
        }
        else nextTree--;
    }

    // image animation and garbage collection
    var activeImages = [];
    backgroundImages.forEach((image) => {
        image.move();
        if (image.active) {
            activeImages.push(image);
        }
    });
    backgroundImages = activeImages;

    // make things move 
    orderZIndex();
    if (!pause && !exit) setTimeout(() => {
        gameLoop();
    }, 1000 / frameRate);
}

function getFutureLocation(framesAhead) {

}

function orderZIndex() {
    // order things by y coordinate
    $.each($(".ordered"), (i, element) => {
        var zindex = parseInt($(element).css('top'));
        var offset =  parseInt($(element).attr('z-offset')) || 0;
        $(element).css({"z-index": zindex + offset});
    });
}

function hunt() {
    window.open('poke-hunt.html');
}

gameLoop();