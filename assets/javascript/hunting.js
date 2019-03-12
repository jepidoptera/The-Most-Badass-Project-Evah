// jshint esversion: 6

var player = {
    x: 50,
    y: ($(window).height() / $(window).width()) * 50,
    direction: 0,
    // percent of the screen you can move with one keypress
    speed: 0.5,
    img: null
};

var pokeball = {
    x: 0,
    y: 0,
    speed: 0.75,
    img: null,
    img2: null,
    direction: 0,
    maxRange: 20,
    range: 0,
    active: false
};

class pokemon_prey {
    constructor (type, img, x, y, direction) {
        this.type = type;
        this.img = img;
        this.x = x;
        this.y = y;
        this.direction = direction;
    }
}

function newPokemon (x, y) {
    if (x != 0 && y != 0) {
        // no good

    }
}

function throwPokeball (direction) {
    if (pokeball.active) return;
    pokeball.img.show();
    pokeball.x = player.x;
    pokeball.y = player.y;
    pokeball.direction = direction;
    pokeball.range = pokeball.maxRange;
    pokeball.img.css({'left': pokeball.x + "vw", 'top': pokeball.y + "vw"});
    pokeball.active = true;
}

// you can only face 12 different directions 
var turnPositions = 12;

$(document).ready(() => {
    var move = 0;

    player.img = $("<img>").attr('src', 'assets/images/hunter.png').css({"position": "absolute", "height": "50px", "width": "50px", "transform": "translate(-25%, -25%)"});
    player.img2 = $("<img>").attr('src', 'assets/images/arrow.jpg').css({"position": "absolute", "height": "25px", "width": "25px", "transform": "translate(-50%, -50%)"});
    pokeball.img = $("<img>").attr('src', 'assets/images/pokeball.png').css({"position": "absolute", "height": "25px", "width": "25px"});
    $('#huntingField').append(player.img);
    $('#huntingField').append(player.img2);
    $('#huntingField').append(pokeball.img.hide());

    setInterval(() => {
        // move if key is down
        if (move != 0) {
            player.x += Math.sin(player.direction * Math.PI / 180.0) * player.speed * move;
            player.y -= Math.cos(player.direction * Math.PI / 180.0) * player.speed * move;
            // stay in bounds
            var ybound = ($(window).height() / $(window).width()) * 100;
            player.x = Math.min(Math.max(player.x, 0), 100);
            player.y = Math.min(Math.max(player.y, 0), ybound);
        }
        if (pokeball.active) {
            pokeball.x += Math.sin(pokeball.direction * Math.PI / 180.0) * pokeball.speed;
            pokeball.y -= Math.cos(pokeball.direction * Math.PI / 180.0) * pokeball.speed;
            pokeball.img.css({'left': pokeball.x + "vw", 'top': pokeball.y + "vw"});
            // pokeball.img.css({'left': pokeball.x + "vw", 'top': pokeball.y + "vw"});
            pokeball.range--;
            if (pokeball.range <= 0) {
                pokeball.active = false;
                pokeball.img.hide();
            }
        }
        // apply position and rotation
        player.img.css({'left': player.x + "vw", 'top': player.y + "vw"});
        player.img2.rotate({angle: player.direction, center: ["50%", "50%"]});
        player.img2.css({
            'left': player.x + Math.sin(player.direction * Math.PI / 180.0) * 3 + "vw",
            'top': player.y - Math.cos(player.direction * Math.PI / 180.0) * 3 + "vw"});
    }, 30);

    // keyboard input
    $(document).on('keydown', (event) => {
        switch (event.key) {
        case "ArrowLeft":
            // left
            player.direction -= (360 / turnPositions);
            break;
        case "ArrowRight":
            // right
            player.direction += (360 / turnPositions);
            break;
        case "ArrowUp":
            // up
            move = 1;
            break;
        case "ArrowDown":
            // down
            move = -1;
            break;
        }
    });
    $(document).on('keyup', (event) => {
        switch (event.key) {
        case "ArrowUp":
            // up
            move = 0;
            break;
        case "ArrowDown":
            // down
            move = 0;
            break;
        case " ":
            throwPokeball(player.direction);
        }
    });
});