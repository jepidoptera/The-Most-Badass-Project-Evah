// jshint esversion: 6
let pause = null;
let unPause = null;

var hunter = {
    x: 50,
    y: ($(window).height() / $(window).width()) * 50,
    direction: 0,
    motion: 0,
    // percent of the screen you can move with one keypress
    speed: 0.37,
    img: null
};

class pokeball {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.speed = 0;
        this.topSpeed = 0.75;
        this.direction = 0;
        this.maxRange = 23;
        this.range = 0;
        this.motion = 1;
        this.active = false;
        this.size = 10;
        this.img = $("<img>")
            .attr('src', './assets/images/pokeball.png')
            .css({"position": "absolute", "height": this.size + "px", "width": this.size + "px", "transform": "translate (-50%, -50%)"})
            .hide();
    }
    throw (direction) {
        if (this.active) return;
        if (player.mokeballs <= 0) {
            message('You are out of mokeballs!');
            return;
        }
        player.mokeballs --;
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
        this.img
            .css({'left': this.x + "vw", 'top': (this.y - this.z) + "vw", 'height': this.size + this.z / 3 + "px", 'width': this.size + this.z / 3 + "px"})
            .show();
        // catch pokemon
        var x = parseInt(this.img.css('left'));
        var y = parseInt(this.img.css('top'));
        if (this.motion) activeCreatures.forEach((creature) => {
            if (creature.caught) return;
            var xdist = x - parseInt(creature.img.css('left'));
            var ydist = y - parseInt(creature.img.css('top'));
            if (Math.sqrt(xdist * xdist + ydist * ydist) < creature.size / 2 + this.size) {
                this.catch(creature);
            }
        });
        // range limit
        this.range--;
        if (this.range <= 3) this.img.hide();
        if (this.range <= 0) this.active = false;
    }
    catch (creature) {
        // catch em
        console.log('caught one!');
        message ("You caught " + creature.type);
        this.motion = 0;
        creature.img.animate({height: 0, width: 0, transform: "translate(-50%, -50%)"}, {duration: 2000});
        creature.img.rotate({angle: 0, center: ["50%", "50%"], animateTo: 360, duration: 2000});
        setTimeout(() => {
            creature.active = false;
        }, 2000);
        creature.motion = 0;
        creature.caught = true;
        var food = 0;
        switch (creature.type) {
        case "squirrel":
            food = 1;
            break;
        case "deer":
            food = parseInt(Math.random() * 80 + 60);
            break;
        case "bison":
            food = parseInt(Math.random() * 600 + 600);
            break;
        default:
            // must be a pokemon
            player.pokemon.add(creature.type, null);
            break;
        }
        if (food) {
            player.food += food;
            message("You gained " + food + " food.");
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
            .attr('src', './assets/images/tree' + parseInt(Math.random() * numTrees) + ".png")
            .css({'position': 'absolute', 'left': this.x + "vw", 'top': this.y + "vw", 'height': this.size + 'px', 'width': this.size + 'px', "transform": "translate(-0%, -100%)"})
            .addClass('ordered');
        $("#huntingField").append(this.img);
    }
}

var activeCreatures = [];

class creature {
    constructor (type) {
        this.type = type;
        this.size = 50;
        this.x = (Math.random() < 0.5) ? (Math.random() > 0.5 ? -this.size : xbound + this.size) : Math.random() * xbound;
        this.y = (this.x < 0 || this.x > xbound) ? Math.random() * ybound : (Math.random() > 0.5 ? -this.size : this.size + ybound);
        // face within 45 degrees of the center
        var xdist = xbound/2 - this.x;
        var ydist = ybound/2 - this.y;
        this.direction = Math.atan(xdist/ydist) * 180 / Math.PI;
        this.speed = 0.25;
        this.motion = 1;
        this.active = true;
        this.caught = false;
        var imgName = './assets/images/' + type + ".png";

        if (['deer', 'bison', 'squirrel'].includes(this.type)) {
            this.x = Math.random() < 0.5 ? -this.size : xbound + this.size;
            this.y = Math.random() * ybound;
            this.direction =  75 + Math.random() * 30;
            this.direction *= -Math.sign(this.x); // *= parseInt(Math.random() * 2) * 2 - 1;
            if (this.type == 'deer') this.size = 50;
            if (this.type == 'bison') {this.height = 80; this.width = 100; this.size = 80;}
            if (this.type == 'squirrel') this.size = 25;
            imgName = "./assets/images/animals/" + 
                type + ['_left', '_right'][parseInt((Math.sign(this.direction) + 1) / 2)] + '.png';
        }
        this.img = $("<img>")
            .attr('src', imgName)
            .css({'position': 'absolute', 'left': this.x + "vw", 'top': this.y + "vw", 'height': (this.height || this.size) + 'px', 'width': (this.width || this.size) + 'px', 'transform': 'translate(-50%, -50%)'})
            .addClass('ordered')
            .attr('z-offset', this.size * 0.75)
            .on('click', () => {console.log('x: ', this.x, 'y, ', this.y, 'speed: ', this.speed, 'motion: ', this.motion, 'direction: ', this.direction);});
        $("#huntingField").append(this.img);
    }
    move () {
        this.x += Math.sin(this.direction * Math.PI / 180.0) * this.speed * this.motion;
        this.y -= Math.cos(this.direction * Math.PI / 180.0) * this.speed * this.motion;
        // delete if it leaves bounds
        if (this.x < -this.size * 2 || this.y < -this.size * 2 || this.x > xbound + this.size * 2 || this.y > ybound + this.size * 2) {
            this.img.remove();
            this.active = false;
        }
        this.display();
    }
    display() {
        this.img
        .css({'left': this.x + "vw", 'top': this.y + "vw"})
        .show();
    }
}

// you can face 12 different directions - 4 better than Oregon Trail's 8
var turnPositions = 12;
var ybound = 100;
var xbound = 100;

function message(text) {
    var msg = $('<p>').text(text).addClass('msg').addClass('outline');
    $('#huntingField').append(msg);
    setTimeout(() => {
        msg.remove();
    }, 3000);
}

$(document).ready(() => {
    loadPlayer();

    // load images
    var ball = new pokeball();
    hunter.img = $("<img>")
        .attr('src', './assets/images/hunter.png')
        .css({"position": "absolute", "height": "50px", "width": "50px", "transform": "translate(-25%, -25%)"})
        .addClass('ordered')
        .attr('id', 'you')
        .attr('z-offset', 37);
    hunter.img2 = $("<img>")
        .attr('src', './assets/images/arrow.png')
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

    // count down til dark
    function timeDown() {
        player.time += 1;
        saveGame();
        hoursTilDark = parseInt((24 - player.time) / 2);
        $("#time").text('Hours til dark: '+ hoursTilDark);
        if (hoursTilDark == 0) {
            msgBox('darkness', "The sun has gone down.  You head back to camp with your day's catch.",
            [{text: "ok", function: () => {
                window.location.href = `/journey?username=${player.name}&authtoken=${player.authtoken}`;
            }}]);
            clearInterval(gameLoop);
        }
        else {
            setTimeout(timeDown, 4000);
        }
    }    
    timeDown();

    var gameLoop = setInterval(() => {
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
        var stillActiveCreatures = [];
        activeCreatures.forEach((pokemon) => {
            pokemon.move();
            if (pokemon.active) stillActiveCreatures.push(pokemon);
        });
        activeCreatures = stillActiveCreatures;

        // apply position and rotation for player
        hunter.img.css({'left': hunter.x + "vw", 'top': hunter.y + "vw"});
        hunter.img2.rotate({angle: hunter.direction, center: ["50%", "50%"]});
        hunter.img2.css({
            'left': hunter.x + Math.sin(hunter.direction * Math.PI / 180.0) * 3 + "vw",
            'top': hunter.y - Math.cos(hunter.direction * Math.PI / 180.0) * 3 + "vw"});
        
        $("#bullets").text("mokeballs remaining: " + player.mokeballs);
        // keep things ordered    
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

    // sometimes send out a pokemon or animal
    function newPokemon () {
        // wait for next one
        setTimeout(newPokemon, parseInt(Math.random() * 10000) + 100);

        // but don't appear if the window isn't focused
        if (!document.hasFocus()) return;

        var preys = [
            {name: 'snorlax',
            chance: 1},
            {name: 'charizard',
            chance: 1},
            {name: 'ninetales',
            chance: 1},
            {name: 'jigglypuff',
            chance: 1},
            {name: 'articuno',
            chance: 1},
            {name: 'bison',
            chance: 6},
            {name: 'deer',
            chance: 11},
            {name: 'squirrel',
            chance: 32},
        ];
        // cast the die
        var totalChance = preys
            .map((prey) => {return prey.chance;})
            .reduce((sum, nextChance, i) => {
                sum += nextChance; 
                preys[i].chance = sum; 
                return sum;
            });
        var chance = Math.random() * totalChance;
        // see which one we picked
        for (i = 0; i < preys.length; i++) {
            if (preys[i].chance > chance) {
                activeCreatures.push(new creature(preys[i].name));
                break;
            }
        }
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
})
