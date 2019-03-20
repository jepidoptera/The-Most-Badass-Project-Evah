// jshint esversion: 6

var hunter = {
    x: 50,
    y: ($(window).height() / $(window).width()) * 50,
    direction: 0,
    motion: 0,
    // percent of the screen you can move with one keypress
    speed: 0.5,
    img: null
};

class pokeball {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.speed = 0;
        this.topSpeed = 0.75;
        this.direction = 0;
        this.maxRange = 20;
        this.range = 0;
        this.motion = 1;
        this.active = false;
        this.img = $("<img>").attr('src', 'assets/images/pokeball.png').css({"position": "absolute", "height": "25px", "width": "25px"});
    }
    throw (direction) {
        if (this.active) return;
        this.img.show();
        this.speed = this.topSpeed + hunter.motion * hunter.speed;
        this.x = hunter.x;
        this.y = hunter.y;
        this.direction = direction;
        this.range = this.maxRange;
        this.img.css({'left': this.x + "vw", 'top': (this.y - this.z) + "vw"});
        this.motion = 1;
        this.active = true;
    }
    fly () {
        // do some math
        this.x += Math.sin(this.direction * Math.PI / 180.0) * this.speed * this.motion;
        this.y -= Math.cos(this.direction * Math.PI / 180.0) * this.speed * this.motion;
        this.z = Math.sqrt((this.maxRange / 2  - Math.abs(this.maxRange / 2 - this.range)) * 10 / this.maxRange) * this.motion;
        // set position on the page
        this.img.css({'left': this.x + "vw", 'top': "Calc(" + (this.y - this.z) + "vw - 37px)"});
        // catch pokemon
        var x = parseInt(this.img.css('left'));
        var y = parseInt(this.img.css('top'));
        if (this.motion) activeCreatures.forEach((pokemon) => {
            if (pokemon.caught) return;
            var xdist = x - parseInt(pokemon.img.css('left'));
            var ydist = y - parseInt(pokemon.img.css('top'));
            if (Math.sqrt(xdist * xdist + ydist * ydist) < pokemon.size) {
                // catch em
                console.log('caught one!');
                $("#msg").text("You caught " + pokemon.name)
                this.motion = 0;
                pokemon.img.animate({height: 0, width: 0}, {duration: 2000});
                pokemon.img.rotate(180);
                setTimeout(() => {
                    pokemon.active = false;
                }, 2000);
                pokemon.motion = 0;
                pokemon.caught = true;
            }
        });
        // range limit
        this.range--;
        if (this.range <= 0) {
            this.active = false;
            this.img.hide();
        }
    }
}

class tree {
    constructor (x, y) {
        // place it randomly
        this.x = x;
        this.y = y;
        // how many pictures of trees do we have on file?
        var numTrees = 2;
        // choose size
        this.size = Math.random() * 150 + 50;
        // construct tree image
        this.img = $('<img>')
            .attr('src', 'assets/images/tree' + parseInt(Math.random() * numTrees) + ".png")
            .css({'position': 'absolute', 'left': this.x + "vw", 'top': this.y + "vw", 'height': this.size + 'px', 'width': this.size + 'px', "transform": "translate(-50%, -100%)"})
            .addClass('ordered');
        $("#huntingField").append(this.img);
    }
}

var activeCreatures = [];

class creature {
    constructor (type) {
        this.type = type;
        this.size = 50;
        this.img = $("<img>")
            .attr('src', 'assets/images/' + type + ".png")
            .css({'position': 'absolute', 'left': this.x + "vw", 'top': this.y + "vw", 'height': this.size + 'px', 'width': this.size + 'px'})
            .addClass('ordered')
            .attr('z-offset', this.size * 0.75)
            .on('click', () => {console.log('x: ', this.x, 'y, ', this.y, 'speed: ', this.speed, 'motion: ', this.motion, 'direction: ', this.direction);});
        $("#huntingField").append(this.img);
        this.x = (Math.random() < 0.5) ? (Math.random() > 0.5 ? 0 : xbound) : Math.random() * xbound;
        this.y = (this.x == 0 || this.x == xbound) ? Math.random() * ybound : (Math.random() > 0.5 ? 0 : ybound);
        // initial position
        this.calcPosition();
        // face within 45 degrees of the center
        var xdist = xbound/2 - this.x;
        var ydist = ybound/2 - this.y;
        this.direction = Math.atan(xdist/ydist) * 180 / Math.PI;
        this.speed = 0.25;
        this.motion = 1;
        this.active = true;
        this.caught = false;
    }
    move () {
        this.x += Math.sin(this.direction * Math.PI / 180.0) * this.speed * this.motion;
        this.y -= Math.cos(this.direction * Math.PI / 180.0) * this.speed * this.motion;
        this.calcPosition();
        // delete if it leaves bounds
        if (this.x < 0 || this.y < 0 || this.x > xbound || this.y > ybound) {
            this.img.remove();
            this.active = false;
        }
    }
    calcPosition() {
        this.img.css({'left': this.x + "vw", 'top': this.y + "vw"});
    }
}

// you can face 12 different directions - 4 better than Oregon Trail's 8
var turnPositions = 12;
var ybound = 100;
var xbound = 100;

$(document).ready(() => {
    // load images
    var ball = new pokeball();
    hunter.img = $("<img>")
        .attr('src', 'assets/images/hunter.png')
        .css({"position": "absolute", "height": "50px", "width": "50px", "transform": "translate(-25%, -25%)"})
        .addClass('ordered')
        .attr('id', 'you')
        .attr('z-offset', 37);
    hunter.img2 = $("<img>")
        .attr('src', 'assets/images/arrow.png')
        .css({"position": "absolute", "height": "25px", "width": "25px", "transform": "translate(-50%, -50%)"})
        .addClass('ordered');
    $('#huntingField').append(hunter.img);
    $('#huntingField').append(hunter.img2);
    $('#huntingField').append(ball.img.hide());

    // make a few trees
    var totalTrees = parseInt(Math.random() * 10) + 5;
    calculateBounds();
    for (i = 0; i < totalTrees; i++) {
        new tree(Math.random() * xbound, (i / totalTrees) * ybound);
    }

    setInterval(() => {
        // move if key is down
        if (hunter.motion != 0) {
            hunter.x += Math.sin(hunter.direction * Math.PI / 180.0) * hunter.speed * hunter.motion;
            hunter.y -= Math.cos(hunter.direction * Math.PI / 180.0) * hunter.speed * hunter.motion;
            // stay in bounds
            calculateBounds();
            hunter.x = Math.min(Math.max(hunter.x, 0), xbound);
            hunter.y = Math.min(Math.max(hunter.y, 0), ybound);
        }
        // move pokeball
        if (ball.active) {
            ball.fly();
        }
        // pokemon processing and garbage collection
        var stillActivePokemon = [];
        activeCreatures.forEach((pokemon) => {
            pokemon.move();
            if (pokemon.active) stillActivePokemon.push(pokemon);
        });
        activeCreatures = stillActivePokemon;

        // apply position and rotation for player
        hunter.img.css({'left': hunter.x + "vw", 'top': hunter.y + "vw"});
        hunter.img2.rotate({angle: hunter.direction, center: ["50%", "50%"]});
        hunter.img2.css({
            'left': hunter.x + Math.sin(hunter.direction * Math.PI / 180.0) * 3 + "vw",
            'top': hunter.y - Math.cos(hunter.direction * Math.PI / 180.0) * 3 + "vw"});
    
        orderZIndex();
    }, 30);

    // keyboard input
    $(document).on('keydown', (event) => {
        switch (event.key) {
        case "ArrowLeft":
            // turn left
            hunter.direction -= (360 / turnPositions);
            break;
        case "ArrowRight":
            // turn right
            hunter.direction += (360 / turnPositions);
            break;
        case "ArrowUp":
            // forward
            hunter.motion = 1;
            break;
        case "ArrowDown":
            // down
            hunter.motion = -1;
            break;
        }
    });

    $(document).on('keyup', (event) => {
        switch (event.key) {
        case "ArrowUp":
        case "ArrowDown":
            // stop
            hunter.motion = 0;
            break;
        case " ":
            ball.throw(hunter.direction);
        }
    });

    // sometimes send out a pokemon
    function newPokemon () {
        var preys = 
        [
            {name: 'snorlax',
            chance: 1},
            {name: 'bison',
            chance: 6},
            {name: 'deer',
            chance: 11},
            {name: 'squirrel',
            chance: 32},
        ];
        // cast the die
        var totalChance = preys.reduce((sum, nextPrey) => {sum += nextPrey.chance; nextPrey.chance = sum; return sum;});
        var chance = Math.random() * totalChance;
        // see which one we picked
        for (i = 0; i < preys.length; i++) {
            if (preys[i].chance > chance) {
                activeCreatures.push(new creature(preys[i].name));
                break;
            }
        }
        // wait for next one
        setTimeout(newPokemon, parseInt(Math.random() * 1000) + 100);
    }
    newPokemon();

    function calculateBounds() {
        ybound = ($(window).height() - hunter.img.height()) / ($(window).width() - hunter.img.width()) * 100 ;
        xbound = (1 - hunter.img.width() / $(window).width()) * 100;
    }

    function orderZIndex() {
        // order things by y coordinate
        $.each($(".ordered"), (i, element) => {
            var zindex = parseInt($(element).css('top'));
            var offset =  parseInt($(element).attr('z-offset')) || 0;
            $(element).css({"z-index": zindex + offset});
        });
    }
});
