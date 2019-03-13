// jshint esversion: 6

var player = {
    x: 50,
    y: ($(window).height() / $(window).width()) * 50,
    direction: 0,
    motion: 0,
    // percent of the screen you can move with one keypress
    speed: 0.5,
    img: null
};

class tree {

}

class pokeball {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.speed = 0;
        this.topSpeed = 0.75;
        this.direction = 0;
        this.maxRange = 20;
        this.range = 0;
        this.active = false;
        this.img = $("<img>").attr('src', 'assets/images/pokeball.png').css({"position": "absolute", "height": "25px", "width": "25px"});
    }
    throw (direction) {
        if (this.active) return;
        this.img.show();
        this.speed = this.topSpeed + player.motion * player.speed;
        this.x = player.x;
        this.y = player.y;
        this.direction = direction;
        this.range = this.maxRange;
        this.img.css({'left': this.x + "vw", 'top': this.y + "vw"});
        this.active = true;
    }
    fly () {
        this.x += Math.sin(this.direction * Math.PI / 180.0) * this.speed;
        this.y -= Math.cos(this.direction * Math.PI / 180.0) * this.speed;
        this.z = Math.sqrt((this.maxRange / 2  - Math.abs(this.maxRange / 2 - this.range)) * 10 / this.maxRange);
        this.img.css({'left': this.x + "vw", 'top': (this.y - this.z) + "vw"});
        this.range--;
        if (this.range <= 0) {
            this.active = false;
            this.img.hide();
        }
    }
}

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

// you can only face 12 different directions - 4 better than Oregon Trail's 8
var turnPositions = 12;

$(document).ready(() => {
    var ball = new pokeball();
    player.img = $("<img>").attr('src', 'assets/images/hunter.png').css({"position": "absolute", "height": "50px", "width": "50px", "transform": "translate(-25%, -25%)"});
    player.img2 = $("<img>").attr('src', 'assets/images/arrow.png').css({"position": "absolute", "height": "25px", "width": "25px", "transform": "translate(-50%, -50%)"});
    $('#huntingField').append(player.img);
    $('#huntingField').append(player.img2);
    $('#huntingField').append(ball.img.hide());

    setInterval(() => {
        // move if key is down
        if (player.motion != 0) {
            player.x += Math.sin(player.direction * Math.PI / 180.0) * player.speed * player.motion;
            player.y -= Math.cos(player.direction * Math.PI / 180.0) * player.speed * player.motion;
            // stay in bounds
            var ybound = ($(window).height() - player.img.height()) / ($(window).width() - player.img.width()) * 100 ;
            var xbound = (1 - player.img.width() / $(window).width()) * 100;
            player.x = Math.min(Math.max(player.x, 0), xbound);
            player.y = Math.min(Math.max(player.y, 0), ybound);
        }
        if (ball.active) {
            ball.fly();
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
            // turn left
            player.direction -= (360 / turnPositions);
            break;
        case "ArrowRight":
            // turn right
            player.direction += (360 / turnPositions);
            break;
        case "ArrowUp":
            // forward
            player.motion = 1;
            break;
        case "ArrowDown":
            // down
            player.motion = -1;
            break;
        }
    });
    $(document).on('keyup', (event) => {
        switch (event.key) {
        case "ArrowUp":
        case "ArrowDown":
            // stop
            player.motion = 0;
            break;
        case " ":
            ball.throw(player.direction);
        }
    });
});