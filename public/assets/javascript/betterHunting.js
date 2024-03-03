const mapWidth = 400;
const mapHeight = 400;
let frameRate = 60;

let viewport = {width: 0, height: 0, innerWindow: {width: 0, height: 0}, x: 488, y: 494}
let map = {}
let hunter = {}
let projectiles = []
let animals = []
let powerups = []
var canvas
var ctx
var mouseX, mouseY
var canvasScaleFactor = 1
var effectiveFrameRate
var lastFrame
var mapHexWidth, mapHexHeight
var messages = []
var landImage
var cursorImage
var mokeInfo
var hoursTilDark

class PowerUp {
    constructor(type, x, y, width, height, image, imageFrame, frameCount, rotation, offset) {
        this.type = type
        this.x = parseInt(x)
        this.y = parseInt(y)
        this.image = image
        this.height = height || img.height
        this.width = width || img.width
        this.imageFrame = imageFrame
        this.frameCount = frameCount
        this.offset = offset || {x: x - this.x, y: y - this.y}
        this.rotation = rotation || 0
        this.gone = false
    }
    get onScreen() {
        this._onScreen = false
        if (this.gone) return false
        if (this.x + this.width + 5 > viewport.x && this.y + this.height + 5 > viewport.y) {
            if (this.x - this.width - 5 < viewport.x + viewport.width && this.y - this.height - 5 < viewport.y + viewport.height) {
                this._onScreen = true;
            }
        }
        return this._onScreen;
    }
    get realY() {
        return this.y - this.z + this.offset.y
    }
    detect() {
        if (this.onScreen) {
            let dist = approxDist(this.x + this.offset.x, this.y + this.offset.y, hunter.x + hunter.offset.x, hunter.y + hunter.offset.y);
            if (dist < 1) {
                this.pickUp()
            }
        }
    }
    pickUp() {
        this.gone = true
    }
}

class BerryBush extends PowerUp {
    constructor(x, y) {
        super('berry bush', x, y, 1, 1, $('<img>').attr('src', './assets/images/scenery/berry_bush1.png')[0])
    }
    pickUp() {
        this.food = Math.floor(Math.random() * 25 + 25)
        message(`You picked some berries worth ${this.food} food.`)
        hunter.food += this.food
        this.gone = true
    }
}

class GoldNugget extends PowerUp {
    constructor(x, y) {
        super('gold nugget', x, y, 0.5, 0.5, $('<img>').attr('src', './assets/images/scenery/gold nugget0.png')[0])
    }
    pickUp() {
        this.money = Math.floor(Math.random() * 25 + 25)
        message(`You found a gold nugget worth $${this.money}.`)
        player.money += this.money
        this.gone = true
    }
}

class DeadAnimal extends PowerUp {
    constructor(animal) {
        super(
            'dead ' + animal.type, 
            animal.x, animal.y, 
            animal.width, animal.height, animal.image, 
            animal.imageFrame, animal.frameCount,
            animal.rotation, animal.offset
        )
        this.food = animal.foodValue
    }
    pickUp() {
        message(`You picked up a ${this.type} worth ${this.food} food.`)
        hunter.food += this.food
        this.gone = true
    }
}

powerupChart = {
    "berry bush": BerryBush,
    "gold nugget": GoldNugget,
}

class Projectile {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.image = document.createElement('img');
        this.image.src = "./assets/images/mokeball.png";
        this.size = 6;
        this.apparentSize = 16;
        this.speed = 7;
        this.range = 8;
        this.bounced = 0;
        this.bounces = 2;
        this.gravity = .5;
        this.bounceFactor = 1/3;
    }
    throw(target) {
        this.visible = true;
        this.target = target;
        this.x = hunter.center_x;
        this.y = hunter.center_y;
        this.z = 0;
        let xdist = (this.target.x - this.x) * 0.75;
        let ydist = this.target.y - this.y;
        let dist = Math.sqrt(xdist ** 2 + ydist ** 2);
        if (dist > this.range) {
            let fraction = this.range / dist;
            ydist *= fraction;
            xdist *= fraction;
            dist = this.range;
        }
        this.movement = {
            x: (xdist * 1.333) / dist * this.speed / frameRate,
            y: ydist / dist * this.speed / frameRate,
            z: (dist - 0.5) / this.speed / 2 * this.gravity,
        }

        this.throwInterval = setInterval(() => {
            if (paused) return;
            this.x += this.movement.x;
            this.y += this.movement.y;
            this.z += this.movement.z;
            this.movement.z -= this.gravity / frameRate;

            // this.z = Math.sqrt((this.movement.max / 2  - Math.abs(this.movement.max / 2 - this.movement.total)) / 2) || 0 ;
            this.apparentSize = (this.size * (this.z + 1) / 2 + 10) * Math.max($(document).width(), $(document).height()) / 1280;

            if (this.z <= 0) {
                this.z = 0;
                this.land();
                this.bounce();
            }
        }, 1000 / frameRate);
        return this;
    }
    bounce() {
        if (this.bounced < this.bounces) {
            this.movement = {
                x: this.movement.x * this.bounceFactor,
                y: this.movement.y * this.bounceFactor,
                z: -this.movement.z * this.bounceFactor,
            }
            this.bounced += 1;
        }
        else {
            this.vanishTimeout = setTimeout(() => {
                this.visible = false;
            }, 3000);
            clearInterval(this.throwInterval);
        }
    }
    land() {
        this.x = this.target.x
        this.y = this.target.y
    }
    hurt(animal, hp) {
        animal.hurt(hp)
        if (animal.hp <= 0) {
            // if (animal.foodValue > 0) messageText += `  You gain ${animal.foodValue} food.`
            animal.die()
            saveGame()
        }
        if (animal.fleeRadius > 0) {
            animal.flee()
        }
        else if (animal.chaseRadius > 0) {
            animal.attack()
        }
    }
}

class Mokeball extends Projectile {
    constructor(x, y) {
        super(x, y)
        this.image = document.createElement('img')
        this.image.src = "./assets/images/mokeball.png"
    }
    land() {
        animals.forEach((animal, n) => {
            let margin = 1
            if (animal._onScreen && !animal.dead) {
                let dist = approxDist(this.x, this.y, animal.x + animal.offset.x + animal.width/2, animal.realY + animal.width/2);
                if (dist < margin) {
                    if (animal.hp > 20) {
                        // that shit don't work on bears
                        animal.hp -= 10
                        this.movement.z = 1 / this.bounceFactor
                        this.movement.max = Infinity
                        this.bounced--
                        this.bounce()
                        if (animal.chaseRadius > 0) animal.attack()
                    }
                    else {
                        let messageText = `You caught: ${animal.type}!` 
                        if (animal.isMokemon) {
                            player.messages.push(`You caught a wild ${animal.type} while hunting!`)
                            setTimeout(() => {
                                player.posse.push({
                                    name: animal.type,
                                    health: animal.hp
                                })
                            }, 2000)
                        }
                        else if (animal.foodValue > 0) messageText += `  You gain ${animal.foodValue} food.`
                        message(messageText)
                        player.food += animal.foodValue
                        hunter.food += animal.foodValue
                        animal.catch(this.x, this.y - this.z)
                        // stop bouncing
                        this.bounced = this.bounces
                        this.visible = false
                        saveGame()
                    }
                }
            }
        })
    }
}

class Grenade extends Projectile {
    constructor(x, y) {
        super(x, y);
        this.image = document.createElement('img');
        this.image.src = "./assets/images/grenade.png";
        this.altimage = document.createElement('img');
        this.altimage.src = "./assets/images/explosion.png";
    }
    land() {
        if (this.bounced === this.bounces) setTimeout(() => {
            this.image = this.altimage;
            this.explodeInterval = setInterval(() => {
                if (paused) return;

                this.apparentSize += 5;
                if (this.apparentSize > 100) {
                    clearInterval(this.explodeInterval);
                    this.visible = false;
                }
            }, 5);
            this.apparentSize = 50;
            animals.forEach((animal, n) => {
                let margin = 4;
                if (animal._onScreen && !animal.dead) {
                    let dist = approxDist(this.x, this.y, animal.x + animal.offset.x + animal.width / 2, animal.realY + animal.height / 2);
                    if (dist < margin) {
                        console.log('blast radius: ', dist);
                        let damage = Math.min(50 / dist / Math.max(dist - 1, 1), 50);
                        console.log('damage: ', damage);
                        if (damage >= animal.hp) {
                            animal.explode(this.x, this.y)
                        }
                        else {
                            this.hurt(animal, damage)
                        }
                    }
                    // all visible animals flee
                    if (animal.fleeRadius != 0 && !animal.attacking) animal.flee();
                }
            })
        }, 500);
    }
}

class Rock extends Projectile {
    constructor(x, y) {
        super(x, y);
        this.image = document.createElement('img');
        this.image.src = `./assets/images/rock${Math.floor(Math.random() * 5)}.png`;
        this.range = 9
        this.damage = 4
        this.speed = 7
        if (player.inventory.includes('slingshot')) {
            this.speed = 10
            this.range = 11
            this.damage = 8
        }
    }
    land() {
        if (this.bounced === 0) {
            animals.forEach((animal, n) => {
                let margin = animal.size + .15
                if (animal._onScreen && !animal.dead) {
                    let dist = approxDist(this.x, this.y, animal.center_x, animal.center_y)
                    if (dist < margin) {
                        this.hurt(animal, this.damage)
                        if (animal.hp > 0) {
                            // didn't die
                            let xmove = this.movement.x
                            let ymove = this.movement.y
                            // bounce off at 90 degrees
                            if (Math.random() > .5) {
                                xmove = -this.movement.y
                                ymove = this.movement.x
                            }
                            else {
                                xmove = this.movement.y
                                ymove = -this.movement.x
                            }
                            this.movement.x = xmove * 2
                            this.movement.y = ymove * 2
                        }
                    }
                }
            })
        }
    }
}

class Arrow extends Projectile {
    constructor(x, y) {
        super(x, y);
        this.image = document.createElement('img');
        this.image.src = `./assets/images/pointy arrow.png`;
        this.range = 12
        this.speed = 15
        this.bounces = 0
        this.gravity = .5
        this.type = "arrow"
        this.size = 50
    }
    bounce () {}
    land() {
        super.land()
        clearInterval(this.throwInterval)
        animals.forEach((animal, n) => {
            let margin = animal.size
            if (animal._onScreen && !animal.dead) {
                let dist = approxDist(this.x, this.y, animal.center_x, animal.center_y);
                if (dist < margin) {
                    this.hurt(animal, 25 * (margin - dist) / margin)
                    this.x = animal.center_x
                    this.y = animal.center_y
                    if (animal.hp > 0) {
                        this.visible = false
                    }
                }
            }
        })
    }
}

class Character {
    constructor(type, x, y) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.z = 0;
        this.destination = {x: this.x, y: this.y};
        this.offset = {x: 0, y: 0};
        this.realX = map.nodes[this.x][this.y].x;
        this.realY = map.nodes[this.x][this.y].y;
        this.travelFrames = 0;
        this.moving = false;
        this.nextNode = map.nodes[this.x][this.y];
    }
    get center_x() {
        return this.x + this.offset.x + this.width / 2
    }
    get center_y() {
        return this.y - (this.z || 0) + this.offset.y + (this.x % 2 === 0 ? 0.25 : -0.25) + this.height / 2
    }
    hurt(hp) {
        this.hp = Math.max(this.hp - hp, 0)
        this.reelCounter = 0
        this.rotation = 0
        if (this.hp > 0) {
            this.healthBar = true
            this.rotation += 25
            setTimeout(() => {
                this.rotation -= 25
            }, Math.min(1000, hp / this.max_hp * 2000))
            setTimeout(() => {
                this.healthBar = false
            }, 3000)
        }
    }
    drawHealthBar() {
        ctx.fillStyle = "green"
        ctx.fillRect(0, -20, mapHexWidth * this.hp / this.max_hp, 5)
        ctx.fillStyle = "red"
        ctx.fillRect(mapHexWidth * this.hp / this.max_hp, -20, mapHexWidth * (1 - this.hp / this.max_hp), 5)
    }
    move() {
        if (this.stopped) return
        if (this.x !== this.destination.x || this.y !== this.destination.y) {
            this.moving = true;
            if (this.travelFrames === 0) {
                this.offset = {x: 0, y: 0};
                this.throwing = false;
                // console.log(this.x, this.y);

                if (this.nextNode) {
                    this.x = this.nextNode.xindex;
                    this.y = this.nextNode.yindex;
                    this.realX = map.nodes[this.x][this.y].x;
                    this.realY = map.nodes[this.x][this.y].y;
                }
                if (this.y === this.destination.y && this.x === this.destination.x) return;
                else {
                    // let currentDirection = this.direction || {index: -10};
                    this.direction = findPath(this, this.destination);
                    // don't do a 180 course reversal. just don't. it looks stupid and gets you stuck in a loop.
                    // if (Math.abs(this.direction.index - currentDirection.index) === 3) {
                    //     this.direction = currentDirection;
                    // }
                    if (this.direction.x === 0 && this.direction.y === 0) {
                        this.destination = {x: this.x, y: this.y}
                        return;
                    }
                    this.nextNode = map.nodes[this.x + this.direction.x][this.y + this.direction.y];
                    let xdist = this.nextNode.x - map.nodes[this.x][this.y].x;
                    let ydist = this.nextNode.y - map.nodes[this.x][this.y].y;
                    let direction_distance = Math.sqrt(xdist ** 2 + ydist ** 2);
                    this.travelFrames = Math.ceil(direction_distance / this.speed * this.frameRate);
                    this.travelX = xdist / this.travelFrames / .866;
                    this.travelY = ydist / this.travelFrames;
                }
            }
            this.travelFrames --;
            this.offset.x += this.travelX;
            this.offset.y += this.travelY;
            this.realY += this.travelY;
            this.realX += this.travelX;
        }
        else {
            this.moving = false;
            if (this.direction) this.direction.index = -10;
        }
    }
}

class Hunter extends Character {
    constructor(x, y) {
        super('human', x, y);
        this.speed = 2.5;
        this.frameRate = 30;
        this.ammo = "arrows";
        this.image = $("<img>").attr('src', './assets/images/hunter.png')[0];
        this.moveInterval = setInterval(() => {this.move()}, 1000 / this.frameRate);
        this.food = 0
        this.max_hp = 10000
        this.hp = this.max_hp
        this.stopped = true
        this.width = 1
        this.height = 1
        // this.centerScreen()
    }
    move() {
        if (paused) return;
        if (this.stopped || this.aiming) return
        super.move()
        this.centerScreen()
        powerups.forEach((powerup) => {
            powerup.detect()
        })
    }
    centerScreen() {
        viewport.upperbound = {
            x: this.x + this.offset.x - viewport.width / 2 + viewport.width * viewport.innerWindow.width / 2,
            y: this.realY - viewport.height / 2 + viewport.height * viewport.innerWindow.height / 2
        }
        viewport.lowerbound = {
            x: this.x + this.offset.x - viewport.width / 2 - viewport.width * viewport.innerWindow.width / 2,
            y: this.realY - viewport.height / 2 - viewport.height * viewport.innerWindow.height / 2
        }
        viewport.x = Math.min(Math.max(Math.min(viewport.x, viewport.upperbound.x), viewport.lowerbound.x, 0), mapWidth - viewport.width)
        viewport.y = Math.min(Math.max(Math.min(viewport.y, viewport.upperbound.y), viewport.lowerbound.y, 0), mapHeight - viewport.height)
    }
    throw(x, y) {
        if (this.throwDelay) return
        let projectile
        if (hunter.ammo === "mokeballs") {
            if (player.mokeballs <= 0) return
            player.mokeballs--
            projectile = new Mokeball()
            this.throwDelay = 1
        }
        else if (hunter.ammo === "grenades") {
            if (player.grenades <= 0) return
            player.grenades--
            projectile = new Grenade()
            this.throwDelay = 2
        }
        else if (hunter.ammo === "rocks") {
            projectile = new Rock()
            this.throwDelay = .5
        }
        else if (hunter.ammo === "arrows") {
            if (player.arrows <= 0) return
            player.arrows--
            projectile = new Arrow()
            this.throwDelay = 1
        }
        refreshWeapons()

        projectiles.push(projectile.throw({x, y}))
        hunter.throwing = true
        hunter.destination.x = hunter.nextNode.xindex || hunter.x
        hunter.destination.y = hunter.nextNode.yindex || hunter.y
        setTimeout(() => {
            this.throwDelay = 0
            this.throwing = false
        }, 1000 * this.throwDelay)
    }
    hurt(hp, attacker) {
        super.hurt(hp)
        if (this.hp <= 0) {
            this.dead = true
            msgBox(
                "You died.", 
                `While hunting, you were slain by ${['a', 'e', 'i', 'o', 'u'].includes(attacker.type[0]) ? 'an' : 'a'} ${attacker.type}. Game over.`,
                [{text: "ok :(", function: () => {location = '/'}}]
            )
        }
    }
}

class Animal extends Character {
    constructor(type, x, y) {
        super(type, x, y)
        this.frameRate = -1 // depends. Set in move function
        this.image = map.animalImages[type]
        this.imageFrame = {x: 0, y: 0}
        this.frameCount = {x: 1, y: 1}
        
        if (type === "deer") {
            this.frameCount = {x: 1, y: 2};
            this.size = Math.random() * .5 + .75;
            this.width = this.size;
            this.height = this.size;
            this.walkSpeed = 1;
            this.runSpeed = 3.5;
            this.fleeRadius = 9;
            this.foodValue = Math.floor(90 * this.size);
            this.max_hp = 10 * this.size;
        }
        else if (type === "bear") {
            this.frameCount = {x: 2, y: 2};
            this.size = Math.random() ** 2 * .8 + 1.2;
            this.width = this.size * 1.4;
            this.height = this.size;
            this.walkSpeed = 0.8;
            this.runSpeed = 2.5;
            this.chaseRadius = 9;
            this.fleeRadius = -1;
            this.attackVerb = "mauls";
            this.damage = 20 * this.size;
            this.foodValue = Math.floor(240 * this.size);
            this.max_hp = 30 * this.size // 36 - 60
        }
        else if (type === "squirrel") {
            this.frameCount = {x: 1, y: 2};
            this.size = Math.random() * .2 + .4;
            this.width = this.size;
            this.height = this.size;
            this.walkSpeed = 1.5;
            this.runSpeed = 3;
            this.fleeRadius = 6;
            this.foodValue = Math.floor(6 * this.size);
            this.max_hp = 1;
            this.randomMotion = 3;
        }
        else if (type === "scorpion") {
            this.frameCount = {x: 1, y: 2};
            this.size = Math.random() * .1 + .4;
            this.width = this.size;
            this.height = this.size;
            this.walkSpeed = .75;
            this.runSpeed = 1.5;
            this.chaseRadius = 4;
            this.attackVerb = "stings";
            this.damage = 1;
            this.foodValue = 1;
            this.max_hp = 1;
            this.randomMotion = 2;
        }
        else if (type === "armadillo") {
            this.frameCount = {x: 1, y: 2};
            this.size = Math.random() * .2 + .5;
            this.width = this.size;
            this.height = this.size;
            this.walkSpeed = 1;
            this.runSpeed = 2;
            this.fleeRadius = 7;
            this.foodValue = Math.floor(20 * this.size);
            this.max_hp = 10 * this.size;
            this.randomMotion = 3;
        }
        else if (type === "coyote") {
            this.frameCount = {x: 1, y: 2};
            this.size = Math.random() * .25 + .7;
            this.width = this.size * 1.75;
            this.height = this.size;
            this.walkSpeed = 1;
            this.runSpeed = 3.5;
            this.fleeRadius = 10;
            this.attackRadius = 3;
            this.attackVerb = "bites";
            this.foodValue = Math.floor(60 * this.size);
            this.max_hp = 15 * this.size;
            this.randomMotion = 6;
        }
        else if (type === "goat") {
            this.frameCount = {x: 1, y: 2};
            this.size = Math.random() * .25 + .7;
            this.width = this.size * 1.2;
            this.height = this.size;
            this.walkSpeed = 1;
            this.runSpeed = 2.5;
            this.fleeRadius = 8;
            this.foodValue = Math.floor(80 * this.size);
            this.max_hp = 12 * this.size;
            this.randomMotion = 6;
        }
        else if (type === "porcupine") {
            this.frameCount = {x: 2, y: 2};
            this.size = Math.random() * .2 + .5;
            this.width = this.size * 1.15;
            this.height = this.size;
            this.walkSpeed = 1;
            this.runSpeed = 2;
            this.fleeRadius = 7;
            this.chaseRadius = 4;
            this.damage = 3;
            this.attackVerb = "pokes";
            this.foodValue = Math.floor(20 * this.size);
            this.max_hp = 5 * this.size;
            this.randomMotion = 3;
        }
        else if (type === "yeti") {
            this.frameCount = {x: 2, y: 2};
            this.size = Math.random() * .5 + 1.5;
            this.width = this.size * 1.2;
            this.height = this.size;
            this.walkSpeed = 1;
            this.runSpeed = 2.75;
            this.chaseRadius = 6;
            this.attackVerb = "mauls";
            this.damage = 50;
            this.foodValue = Math.floor(275 * this.size);
            this.max_hp = 40 * this.size;
        }
        else if (type === "tiger") {
            this.frameCount = {x: 2, y: 2};
            this.size = Math.random() * .3 + 1;
            this.width = this.size * 1.7;
            this.height = this.size;
            this.walkSpeed = 1;
            this.runSpeed = 3;
            this.chaseRadius = 6;
            this.attackVerb = "mauls";
            this.damage = 50;
            this.foodValue = Math.floor(200 * this.size);
            this.max_hp = 30 * this.size;
        }
        else if (type === "alligator") {
            this.frameCount = {x: 1, y: 8};
            this.size = Math.random() ** 2 * 2 + .8;
            this.width = this.size * 1.7;
            this.height = this.size;
            this.walkSpeed = 1;
            this.runSpeed = 3;
            this.chaseRadius = 6;
            this.attackVerb = "bites";
            this.damage = 25 * this.size;
            this.foodValue = Math.floor(200 * this.size);
            this.max_hp = 30 * this.size;
        }
        else if (type === "beaver") {
            this.frameCount = {x: 1, y: 2};
            this.size = Math.random() * .3 + .5;
            this.width = this.size * 1.4;
            this.height = this.size;
            this.walkSpeed = 1;
            this.runSpeed = 2;
            this.fleeRadius = 7;
            this.foodValue = Math.floor(30 * this.size);
            this.max_hp = 5 * this.size;
        }
        else if (type === "heron") {
            this.frameCount = {x: 1, y: 2};
            this.size = Math.random() * .25 + .6;
            this.width = this.size;
            this.height = this.size * 1.2;
            this.walkSpeed = 1;
            this.runSpeed = 5;
            this.fleeRadius = 7;
            this.foodValue = Math.floor(9 * this.size);
            this.max_hp = 2 * this.size;
        }
        else {
            this.walkSpeed = 1;
        }
        this.running = false
        this.hp = this.max_hp
        this._onScreen = false
        this.rotation = 0
        this.dead = false
        this.frameRate = this.onScreen ? 30 : 0.5 // keep it here until the animal comes on screen
        this.move()
    }

    get speed() {
        return this.running ? this.runSpeed : this.walkSpeed
    }
    move() {
        // maintain a reasonable framerate only when visible
        if (this.travelFrames === 0) {
            this.frameRate = (this.onScreen || this.running) ? 30 : this.speed
            this.classtype = Character
        }
        setTimeout(() => {
            this.move()
        }, 1000 / this.frameRate)

        if (this.dead) return
        if (paused) return

        // wander around
        if (!this.moving || Math.random() * this.randomMotion * this.frameRate < 1 &! this.running) {
            this.destination.x = Math.min(Math.max(Math.floor(Math.random() * 50 - 25 + this.x), 0), mapWidth - 1)
            this.destination.y = Math.min(Math.max(Math.floor(Math.random() * 50 - 25 + this.y), 0), mapHeight - 1)
            this.running = false
        }

        super.move()

        // face the correct direction
        if (this.direction) {
            if (this.frameCount.y == 2) {
                // basic image with just left and right
                if (this.direction.x > 0 || this.direction.x === 0 && this.direction.y > 0) {
                    this.imageFrame.y = 1
                }
                else {
                    this.imageFrame.y = 0
                }
            }
            else if (this.frameCount.y == 4) {
                // image has 4 different directional frames
                if (Math.abs(this.direction.x) > Math.abs(this.direction.y) && this.direction.x > 0) {
                    this.imageFrame.y = 2
                }
                else if (Math.abs(this.direction.x) > Math.abs(this.direction.y) && this.direction.x < 0) {
                    this.imageFrame.y = 0
                }
                else if (this.direction.y < 0) {
                    this.imageFrame.y = 1
                }
                else {
                    this.imageFrame.y = 3
                }
            }
            else if (this.frameCount.y == 8) {
                // image has 8 different directional frames
                if (this.direction.y == 0 && this.direction.x > 0) {
                    this.imageFrame.y = 4
                }
                else if (this.direction.y == 0 && this.direction.x < 0) {
                    this.imageFrame.y = 0
                }
                else if (this.direction.y < 0) {
                    if (this.direction.x < 0) {
                        this.imageFrame.y = 1
                    }
                    if (this.direction.x == 0) {
                        this.imageFrame.y = 2
                    }
                    if (this.direction.x > 0) {
                        this.imageFrame.y = 3
                    }
                }
                else if (this.direction.y > 0) {
                    if (this.direction.x > 0) {
                        this.imageFrame.y = 5
                    }
                    if (this.direction.x == 0) {
                        this.imageFrame.y = 6
                    }
                    if (this.direction.x < 0) {
                        this.imageFrame.y = 7
                    }
                }
            }
        }
        let dist = approxDist(this.x, this.y, hunter.x, hunter.y);
        if (dist < this.chaseRadius) {
            this.attack();
        }
        else if (dist < this.fleeRadius) {
            this.flee()
        }
    }
    get onScreen() {
        this._onScreen = false
        if (this.gone) return
        if (this.x + this.width + 5 > viewport.x && this.y + this.height + 5 > viewport.y) {
            if (this.x - this.width - 5 < viewport.x + viewport.width && this.y - this.height - 5 < viewport.y + viewport.height) {
                this._onScreen = true;
            }
        }
        return this._onScreen;
    }
    flee() {
        // flee the player
        let dist = approxDist(this.x, this.y, hunter.x, hunter.y);

        let xdist = this.x - hunter.x;
        let ydist = this.y - hunter.y;
        this.destination.x = Math.floor(Math.max(Math.min(this.x + xdist / dist * 10, mapWidth - 1), 0));  
        this.destination.y = Math.floor(Math.max(Math.min(this.y + ydist / dist * 10, mapHeight - 1), 0));  
        this.running = true;
    }
    attack() {
        this.destination.x = hunter.x
        this.destination.y = hunter.y
        this.attacking = this.attacking || 1
        this.running = true
        let dist = approxDist(this.x, this.y, hunter.x, hunter.y);
        if (dist < (this.attackRange || 1) && this.attacking == 1) {
            this.attacking = 2
            if (this.frameCount.x > 1) this.imageFrame.x = 1
            this.imageFrame.y = (this.x + this.offset.x > hunter.x + hunter.offset.x) ? 0 : 1
            let damage = Math.floor((1 - Math.random() * Math.random()) * this.damage + 1)
            // slight delay before the damage hits, so the player can see the attack
            setTimeout(() => hunter.hurt(damage, this), 100)
            message(`${this.type} ${this.attackVerb} you for ${damage} damage!`)
            setTimeout(() => {
                if (this.dead) {return}
                this.imageFrame.x = 0
                this.attacking = 1
            }, 1000);
        }
    }
    catch(x, y) {
        this.dead = 1;
        // what we want is 
        // (this.y + this.offset.y) * mapHexHeight === y
        // and
        // (this.x + this.offset.x) * mapHexWidth === x
        // so
        this.dieAnimation = setInterval(() => {
            if (paused) return

            this.rotation -= 600 / this.frameRate
            this.dead ++
            this.height *= .96
            this.width *= .96
            if (this.dead > 100) {
                this.gone = true
                clearInterval(this.dieAnimation)
            }
            this.offset.y = this.offset.y * .95 + ((y - (this.x % 2 === 0 ? 0.25 : -0.25) - this.width/ 2) - this.y) * .05
            this.offset.x = this.offset.x * .95 + ((x - this.width / 2) - this.x) * .05
            }, 1000 / this.frameRate)
        this.rotation = 180
    }
    explode(x, y) {
        // this.rotation = 180;
        this.dead = true
        let xdist = this.x + this.offset.x - this.width/2 - x
        let ydist = this.realY - this.height/2 - y
        let dist = Math.max(approxDist(this.x + this.offset.x, this.realY, x, y), 1)
        this.z = 0
        this.motion = {
            x: xdist / Math.min(dist, 2) / this.size / this.frameRate * 1.155,
            y: ydist / Math.min(dist, 2) / this.size / this.frameRate,
            z: 5 / Math.min(dist, 1) / this.size / this.frameRate
        }
        this.dieAnimation = setInterval(() => {
            if (paused) return

            this.x += this.motion.x
            this.y += this.motion.y
            this.z += this.motion.z
            this.realY = this.y
            this.motion.z -= .5 / this.frameRate
            if (this.rotation < 180) this.rotation += 360/frameRate
            if (this.z <= 0) {
                this.z = 0
                this.die()
                clearInterval(this.dieAnimation)
            }
        }, 1000 / this.frameRate)
    }
    die() {
        this.dead = true
        this.rotation = 180
        this.gone = true
        powerups.push(new DeadAnimal(this))
        message(`You killed: ${this.type}!`)
    }
}

class Mokemon extends Animal {
    constructor(type, x, y) {
        super(type, x, y)
        this.isMokemon = true
        this.image = $("<img>").attr('src', `./assets/images/mokemon/${type.toLowerCase()}.png`)[0]
        this.frameCount = mokeInfo[this.type].frameCount
        this.width = mokeInfo[this.type].width
        this.height = mokeInfo[this.type].height
        this.walkSpeed = mokeInfo[this.type].walkSpeed
        this.runSpeed = mokeInfo[this.type].runSpeed
        this.fleeRadius = mokeInfo[this.type].fleeRadius
        this.chaseRadius = mokeInfo[this.type].chaseRadius
        this.attackVerb = mokeInfo[this.type].attackVerb
        this.damage = mokeInfo[this.type].damage
        this.foodValue = mokeInfo[this.type].foodValue
        this.hp = mokeInfo[this.type].max_hp
    }
    get onScreen() {
        // disappears if you already have one of this type
        return (player.posse.map(moke => moke.name).includes(this.type) ? false : super.onScreen)
    }
    attack() {
        if (!this.onScreen) return
        super.attack()
    }
}

$(document).ready(() => {
    canvas = $("#canvas")
    ctx = canvas[0].getContext("2d")
    canvas[0].width = canvas.width()
    canvas[0].height = canvas.height()
    mapHexHeight = canvas.width() / viewport.width
    mapHexWidth = mapHexHeight * .866
    cursorImage = $('<img>').attr('src', './assets/images/arrow3.png')[0]

    function sizeCanvas() {
        canvas[0].width = canvas.width() * canvasScaleFactor
        canvas[0].height = canvas.height() * canvasScaleFactor
        // canvasScaleFactor = 1;
        playerWithinViewport = {
            x: (hunter.x - viewport.x) / viewport.width,
            y: (hunter.y - viewport.y) / viewport.height
        }
        if (canvas.width() > canvas.height()) {
            viewport.width = 31
            viewport.height = 17
        }
        else {
            viewport.height = 28
            viewport.width = 20
        }
        // viewport.width /= .866;

        viewport.x = Math.min(Math.max(0, hunter.x - playerWithinViewport.x * viewport.width), mapWidth - viewport.width)
        viewport.y = Math.min(Math.max(0, hunter.y - playerWithinViewport.y * viewport.height), mapHeight - viewport.height)
        mapHexHeight = canvas[0].width / viewport.width * 1.1547
        mapHexWidth = mapHexHeight * .866
    }

    loadTrail(trail => {
        loadPlayer(p => {
            loadMokemon(mokemon => {
                Object.keys(p).forEach(key => {
                    player[key] = p[key];
                })
                if (player.mokeballs === undefined) player.mokeballs = 30
                if (player.grenades === undefined) player.grenades = 12
                if (player.time === undefined) player.time = 0
                if (player.food === undefined) player.food = 0

                mokeInfo = mokemon
                let location = trail[trail.map(location => location.name).indexOf(player.currentLocation || "The Forest of Doom")];
                landImage = $("<img>").attr('src', `./assets/images/land tiles/${location.type}.png`)[0]

                map = genMap(location, () => {
                    frameRate = 30
                    effectiveFrameRate = 30
                    lastFrame = Date.now()
                })
                day_length_ms = 135000
                day_length_hours = 13
                player.hour = 0
                // count down til dark
                function timeDown() {
                    player.time ++
                    player.hour ++
                    if (player.time > 24) {
                        player.time = 0
                        player.day ++
                    }
                    hoursTilDark = parseInt(day_length_hours - player.hour)
                    $("#canvas").css({'filter': `brightness(${Math.min(hoursTilDark ** (1/2) / day_length_hours ** (1/2) + 0.25, 1)})`})
                    $("#time").text('Hours til dark: '+ hoursTilDark)
                    if (hoursTilDark == 0) {
                        $("#canvas").css({'cursor': 'pointer'})
                        msgBox(
                            'darkness', `The sun has gone down and you have collected ${hunter.food} food. Do you want to head back or make camp and keep hunting tomorrow?`,
                            [
                                {text: "head back", function: () => {
                                    player.messages.push(`You scored ${hunter.food} food while hunting.`)
                                    player.food += hunter.food
                                    saveGame()
                                    msgBox('finished', `You head back to the wagon with your catch of ${hunter.food} food.`,
                                    [{text: "ok", function: () => {
                                        window.location.href = `/journey?name=${player.name}&auth=${player.authtoken}`
                                    }}])
                                }},
                                {text: "keep hunting", function: () => {
                                    player.time = 0
                                    player.hour = 0
                                    player.day += 1
                                    // go dark
                                    $('#blackout').css({'opacity': 1, 'display': 'block'})
                                    $('#blackout').animate({'opacity': 0}, 2000)
                                    $("#canvas").css({'cursor': 'none', 'filter': 'brightness(1)'})
                                    setTimeout(() => {
                                        $('#blackout').css({'display': 'none'})
                                        unpause()
                                        timeDown()
                                    }, 2000)
                                }}
                            ]
                        )
                    }
                    else {
                        setTimeout(timeDown, day_length_ms / day_length_hours)
                    }
                }
                if (player.time) timeDown()

                hunter = new Hunter(mapWidth / 2, mapHeight / 2)
                // add powerups, animals and Mokemon
                if (location.powerups) {
                    location.powerups.forEach(powerup => {
                        for (let n = 0; n < powerup.frequency; n++) {
                            powerups.push(new powerupChart[powerup.type](Math.floor(Math.random() * mapWidth), Math.floor(Math.random() * mapHeight)))
                        }
                    })
                }
                location.animals.forEach(animal => {
                    for (let n = 0; n < animal.frequency; n++) {
                        animals.push(new Animal(animal.type, Math.floor(Math.random() * mapWidth), Math.floor(Math.random() * mapHeight)))
                    }
                })
                location.mokemon.forEach(mokemon => {
                    for (let n = 0; n < mokemon.frequency; n++) {
                        animals.push(new Mokemon(mokemon.type, Math.floor(Math.random() * mapWidth), Math.floor(Math.random() * mapHeight)))
                    }
                })
                window.addEventListener('resize', sizeCanvas)
                sizeCanvas()
                hunter.centerScreen()
                requestAnimationFrame(drawCanvas)
            
                hunter.weapons = [
                    'mokeballs',
                    'grenades',
                    'rocks',
                    'arrows'
                ]
                hunter.ammo = "arrows";

                // set player weapons and controls
                hunter.weapons.forEach(weapon => {
                    $("#ammoSelect").append(
                        $("<div>")
                        .addClass("ammo")
                        .addClass("outline")
                        .attr('name', weapon)
                    )
                })
                refreshWeapons();
                $(".ammo").hide();
                $("#selectedAmmo").click(() => {
                    $(".ammo").show();
                })
                $(".ammo").click(event => {
                    hunter.ammo = $(event.target).attr('name');
                    refreshWeapons();
                    $(".ammo").hide();
                });
                $("#canvas").on("click", () => {$(".ammo").hide()})

                $("#canvas").mousemove(event => {
                    mouseX = event.clientX
                    mouseY = event.clientY
                    hunter.stopped = false                
                })
                $("#canvas").on('touchmove', event => {
                    mouseX = event.touches[0].clientX
                    mouseY = event.touches[0].clientY
                })
  
                $("#canvas").contextmenu(event => {
                    event.preventDefault();
                })        
                $("#msg").contextmenu(event => event.preventDefault())
                $(document).keypress(event => {
                    if (event.key === "g") {
                        hunter.ammo = "grenades"
                    }
                    if (event.key === "r") {
                        hunter.ammo = "rocks"
                    }
                    if (event.key === "a") {
                        hunter.ammo = "arrows"
                    }
                    if (event.key === "m") {
                        hunter.ammo = "mokeballs"
                    }
                    refreshWeapons()
                })
                $(document).keydown(event => {
                    if (event.key === " ") {
                        hunter.aiming = true
                    }
                    if (event.key === "Escape") {
                        msgBox("Leave early?", `Head back to the wagon with ${hunter.food} food?`, [
                            {text: "yes", function: () => {
                                player.messages.push(`You scored ${hunter.food} food while hunting.`)
                                saveGame()
                                window.location.href = `/journey?name=${player.name}&auth=${player.authtoken}`
                            }},
                            {text: "no", function: () => {}}
                        ])
                    }
                })
                $(document).keyup(event => {
                    if (event.key === " ") {
                        hunter.aiming = false
                    }
                })
                function mousedown(event) {
                    hunter.armed = true
                    setTimeout(() => {
                        hunter.armed = false
                    }, 250);
                    hunter.stopped = false
                }
                $(document).mouseup(event => {
                    // hunter.stopped = true
                    if (hunter.armed) {
                        hunter.throw(
                            (event.clientX - $("#canvasFrame").position().left) * canvasScaleFactor / mapHexWidth + viewport.x,
                            (event.clientY - $("#canvasFrame").position().top) * canvasScaleFactor / mapHexHeight + viewport.y
                        )
                    }
                })
                $(document).on('touchend', event => {
                    // hunter.stopped = true
                    if (hunter.armed) {
                        hunter.throw(
                            (event.touches[0].clientX - $("#canvasFrame").position().left) * canvasScaleFactor / mapHexWidth + viewport.x,
                            (event.touches[0].clientY - $("#canvasFrame").position().top) * canvasScaleFactor / mapHexHeight + viewport.y
                        )
                    }
                })
                $(document).mousedown(event => {mousedown(event)})
                $(document).on('touchstart', event => {mousedown(event)})
            })
        })
    })
})

function refreshWeapons() {
    hunter.weapons.forEach(weapon => {
        $(`div[name=${weapon}]`).html(`${weapon} (${player[weapon] !== undefined ? player[weapon] : '∞'})`)
    })
    $("#selectedAmmo").text($(`div[name="${hunter.ammo}"`).text() + " ▼")
}

function drawCanvas() {
    if (paused) return
    let textureOffset = {
        x: viewport.x * mapHexWidth % canvas[0].width,
        y: viewport.y * mapHexHeight % canvas[0].height,
    }
    ctx.drawImage(landImage, -textureOffset.x, -textureOffset.y, canvas[0].width, canvas[0].height);
    ctx.drawImage(landImage, -textureOffset.x, canvas[0].height - textureOffset.y, canvas[0].width, canvas[0].height);
    ctx.drawImage(landImage, canvas[0].width - textureOffset.x, -textureOffset.y, canvas[0].width, canvas[0].height);
    ctx.drawImage(landImage, canvas[0].width - textureOffset.x, canvas[0].height - textureOffset.y, canvas[0].width, canvas[0].height);

    let mapItems = [];
    for (let y = Math.floor(viewport.y) - 1; y < Math.min(viewport.y + viewport.height + 3, mapHeight); y++) {
        for (let x = Math.floor(viewport.x / 2) * 2 - 1; x < viewport.x + viewport.width + 2; x+= 2) {
            if (map.nodes[x]) {
                if (map.nodes[x][y].object) {
                    mapItems.push(map.nodes[x][y].object);
                }
            }
        }
        for (let x = Math.floor(viewport.x / 2) * 2 - 2; x < viewport.x + viewport.width + 2; x+= 2) {
            if (map.nodes[x]) {
                if (map.nodes[x][y].object) {
                    mapItems.push(map.nodes[x][y].object)
                }
            }
        }
    }
    animals.forEach(animal => {
        if (animal.onScreen && !animal.gone) {
            mapItems.push(animal)
        }
    })
    powerups.forEach(powerup => {
        if (powerup.onScreen && !powerup.gone) {
            mapItems.push(powerup)
        }
    })

    mapItems.sort((a, b) => a.realY > b.realY ? 1: -1)
    // draw all the stuff in sorted order
    for (let n = 0; n < mapItems.length; n++) {
        if (mapItems[n].image) {
            ctx.save();

            // things become semitransparent when they would obscure the hunter
            if (mapItems[n].realX - mapItems[n].width / 2 < hunter.realX && mapItems[n].realX + mapItems[n].width / 2 > hunter.realX) {
                if (mapItems[n].realY > hunter.realY && mapItems[n].realY - mapItems[n].height < hunter.realY) {
                    ctx.globalAlpha = 0.5;
                }
            }
 
            ctx.translate((mapItems[n].x - viewport.x + mapItems[n].offset.x) * mapHexWidth, 
            (mapItems[n].y - (mapItems[n].z || 0) - viewport.y + mapItems[n].offset.y + (mapItems[n].x % 2 === 0 ? 0.25 : -0.25)) * mapHexHeight);
    
            if (mapItems[n].healthBar) mapItems[n].drawHealthBar()
            
            if (mapItems[n].rotation) {
                ctx.translate(mapItems[n].width / 2 * mapHexHeight, mapItems[n].height / 2 * mapHexHeight);

                ctx.rotate(mapItems[n].rotation*Math.PI/180);

                ctx.translate(-mapItems[n].width / 2 * mapHexHeight, -mapItems[n].height / 2 * mapHexHeight)
            }

            if (mapItems[n].imageFrame) {
                // animated image   
                ctx.drawImage(
                    mapItems[n].image, 
                    mapItems[n].imageFrame.x * mapItems[n].image.naturalWidth / mapItems[n].frameCount.x, 
                    mapItems[n].imageFrame.y * mapItems[n].image.naturalHeight / mapItems[n].frameCount.y, 
                    mapItems[n].image.naturalWidth / mapItems[n].frameCount.x, mapItems[n].image.naturalHeight / mapItems[n].frameCount.y,
                    0, 0,
                    mapItems[n].width * mapHexHeight, mapItems[n].height * mapHexHeight
                )
            }
            else {
                // singleton image
                ctx.drawImage(mapItems[n].image, 
                    0, 0, 
                    // (mapItems[n].x - viewport.x - mapItems[n].width/ 2 + 0.5) * mapHexWidth, 
                    // (mapItems[n].y - viewport.y - mapItems[n].height + (mapItems[n].x % 2 === 0 ? 1.25 : 0.75)) * mapHexHeight
                    mapHexHeight * mapItems[n].width, mapHexHeight * mapItems[n].height)
            }
            ctx.restore();
        }
    }

    drawCursor();
    drawHunter();
    drawMokeballs();

    requestAnimationFrame(drawCanvas)
    $('#msg').html(messages.join("<br>"))
}

function drawHunter() {
    let hunterImgSize = 360
    let hunterFrame = 0
    if (hunter.travelFrames) hunterFrame = ((hunter.travelFrames % (frameRate / 3) < frameRate / 6) ? 1 : 2)
    if (hunter.throwing) hunterFrame = 3
    ctx.save()
    ctx.translate((hunter.x - viewport.x + hunter.offset.x) * mapHexWidth,
        (hunter.y - viewport.y + hunter.offset.y + (hunter.x % 2 === 0 ? 0.25 : -0.25)) * mapHexHeight)
    ctx.drawImage(hunter.image, hunterFrame * hunterImgSize, 0, hunterImgSize, hunterImgSize,
        0, 0, mapHexHeight * 1.1547, mapHexHeight)
    if (hunter.healthBar) {
        hunter.drawHealthBar()
    }
    ctx.restore()
    // steer
    hunter.destination.x = Math.floor((mouseX - $("#canvasFrame").position().left) * canvasScaleFactor / mapHexWidth + viewport.x)
    hunter.destination.y = Math.floor((mouseY - $("#canvasFrame").position().top) * canvasScaleFactor / mapHexHeight + viewport.y - (hunter.destination.x % 2 === 0 ? 0.5 : 0))
}

function drawMokeballs() {
    remainingBalls = [];
    projectiles.forEach(ball => {
        if (!ball.visible) return
        if (ball.type === "arrow") {
            ctx.save()
            ctx.translate((ball.x - viewport.x) * mapHexWidth, (ball.y - ball.z - viewport.y) * mapHexHeight)
            ctx.rotate(Math.atan2(ball.movement.y, ball.movement.x) + Math.PI * 0.5)
            ctx.drawImage(
                ball.image, -5, 0, 
                ball.apparentSize * ball.image.width / ball.image.height, ball.apparentSize    
            )
            ctx.restore()
        }
        else {
            ctx.drawImage(ball.image, 
            (ball.x - viewport.x) * mapHexWidth - ball.apparentSize/2, 
            (ball.y - ball.z - viewport.y) * mapHexHeight - ball.apparentSize/2, 
            ball.apparentSize, ball.apparentSize)
        }
        remainingBalls.push(ball)
    })
    projectiles = remainingBalls;
}

function drawCursor() {
    if (hoursTilDark < 1) return
    ctx.save()
    ctx.translate(mouseX - $('#canvas').offset().left, mouseY - $('#canvas').offset().top)
    ctx.rotate(Math.atan2(
        (hunter.y + hunter.offset.y + 0.5 - viewport.y) * mapHexHeight / canvasScaleFactor + $("#canvasFrame").position().top - mouseY, 
        (hunter.x + hunter.offset.x + 0.5 - viewport.x) * mapHexWidth / canvasScaleFactor + $("#canvasFrame").position().left - mouseX
    ) + Math.PI * 1.5)
    ctx.drawImage(cursorImage, -mapHexWidth / 4, 0, mapHexWidth / 2, mapHexHeight)
    ctx.restore()
}

function genMap(terrain, callback) {
    let map = {scenery: {}, animalImages: [], backgrounds: [], nodes: []};
    terrain.hunting_scenery.forEach((item, i) => {
        if (item.frequency > 0) {
            map.scenery[item.type] = [];
            try {
                map.scenery[item.type] = {type: item.type, images: [], frequency: item.frequency, passable: item.passable};
                for (let n = 0; n < 5; n++) {
                    map.scenery[item.type].images[n] = $("<img>").attr("src", `/assets/images/scenery/${item.type}${n}.png`)[0];
                }
            }
            catch{
                map.scenery[item.type] = undefined;
            }
        }
    })
    terrain.animals.forEach((animal, i) => {
        if (animal.frequency > 0) {
            map.animalImages[animal.type] = $("<img>").attr('src', `./assets/images/animals/${animal.type}.png`)[0]
        }
    })

    // loading background images
    // for (let n =0; n < 3; n++) {
    //     map.backgrounds[n] = $("<img>").attr("src", `/assets/images/land tiles/${terrain.type}${n}.png`)[0]
    // }
    // debug image with clear hex borders
    // let landImage = $("<img>").attr('src', `./assets/images/land tiles/image1.png`)[0];


    for (let x = -1; x < mapWidth; x++) {
        map.nodes[x] = [];
        for (let y = -1; y < mapHeight; y++) {
            map.nodes[x][y] = {
                land: {
                    image: map.backgrounds[Math.floor(Math.random() * map.backgrounds.length)]
                },
                x: x * .866,
                y: y + (x % 2 === 0 ? 0.5 : 0),
                xindex: x,
                yindex: y
            };

            Object.keys(map.scenery).forEach(index => {
                let item = map.scenery[index];
                if (!map.nodes[Math.max(x-1, -1)][y].object 
                && !map.nodes[x][Math.max(y-1,-1)].object 
                && !map.nodes[Math.max(x-1, -1)][Math.max(x-1, -1)].object 
                && Math.random() * 100 < item.frequency) {
                    let mapObject = {
                        image: item.images[Math.floor(Math.random() * 5)],
                        type: item.type,
                        width: 4,
                        height: 4,
                        x: x,
                        y: y,
                        realX: map.nodes[x][y].x,
                        realY: map.nodes[x][y].y,
                        passable: item.passable
                    }
    
                    if (item.type === "rock") {
                        mapObject.height = .25 + Math.random() * .5;
                        mapObject.width = .25 + Math.random() * .5;
                    }
                    else if (item.type === "cactus") {
                        mapObject.height = 2;
                        mapObject.width = 1;
                    }
                    else if (item.type == "cattails") {
                        mapObject.height = 1;
                        mapObject.width = 1;
                    }
                    else if (item.type == "fern") {
                        mapObject.height = 1;
                        mapObject.width = 1;
                    }
                    // (mapItems[n].x - viewport.x - mapItems[n].width/ 2 + 0.5) * mapHexWidth, 
                    // (mapItems[n].y - viewport.y - mapItems[n].height + (mapItems[n].x % 2 === 0 ? 1.25 : 0.75)) * mapHexHeight

                    mapObject.offset = {x: -mapObject.width / 2 + 0.25, y: -mapObject.height + 1}
                    map.nodes[x][y].object = mapObject;
                }
            })
        }
    }
    if (callback) setTimeout(() => callback(map), 100 );
    return map;
}

function findPath(startingNode, destinationNode) {
    let directions = [];
    let startingPoint = {x: map.nodes[startingNode.x][startingNode.y].x, y: map.nodes[startingNode.x][startingNode.y].y};
    let destinationPoint = {x: map.nodes[destinationNode.x][destinationNode.y].x, y: map.nodes[destinationNode.x][destinationNode.y].y};
    if (startingNode.x % 2 === 0) {
        directions = [
            {x: 0, y: -1},
            {x: 1, y: 0},
            {x: 1, y: 1},
            {x: 0, y: 1},
            {x: -1, y: 1},
            {x: -1, y: 0},

            {x: 1, y: -1},
            {x: 2, y: 0},
            {x: 1, y: 2},
            {x: -1, y: 2},
            {x: -2, y: 0},
            {x: -1, y: -1},
        ]
    }
    else {
        directions = [
            {x: 0, y: -1},
            {x: 1, y: -1},
            {x: 1, y: 0},
            {x: 0, y: 1},
            {x: -1, y: 0},
            {x: -1, y: -1},

            {x: 1, y: -2},
            {x: 2, y: 0},
            {x: 1, y: 1},
            {x: -1, y: 1},
            {x: -2, y: 0},
            {x: -1, y: -2}
        ]
    }
    for (let n = 0; n < 12; n++) {
        if (n > 5) {
            directions[n].blockers = [n - 6, (n - 5) % 6]
            directions[n].distFactor = .577;
        }
    }
    // find the available direction which gets us closest
    let bestDistance = Infinity;
    let bestDirection = -1;
    for (let n = 0; n < directions.length; n++) {
        let x = startingNode.x + directions[n].x;
        let y = startingNode.y + directions[n].y;
        if (x >= 0 && x < mapWidth && y >= 0 && y < mapHeight) {
            if (map.nodes[x][y].object) {
                if (!map.nodes[x][y].object.passable) {
                    continue
                }
            }
            let blocked = false;
            if (directions[n].blockers) {
                directions[n].blockers.forEach(d => {
                    let x = startingNode.x + directions[d].x;
                    let y = startingNode.y + directions[d].y;
                    if (x >= 0 && x < mapWidth && y >= 0 && y < mapHeight) {
                        let blockObject = map.nodes[startingNode.x + directions[d].x][startingNode.y + directions[d].y].object
                        if (blockObject) {
                            if (!blockObject.passable) {
                                blocked = true
                            }
                        }
                    }
                })
            }
            if (!blocked) {
                let moveToPoint = {
                    x: map.nodes[x][y].x,
                    y: map.nodes[x][y].y
                }
                let xdist = destinationPoint.x - startingPoint.x - (moveToPoint.x - startingPoint.x) * (directions[n].distFactor || 1);
                let ydist = destinationPoint.y - startingPoint.y - (moveToPoint.y - startingPoint.y) * (directions[n].distFactor || 1);
        
                let dist = xdist ** 2 + ydist ** 2;
                if (dist < bestDistance) {
                    bestDistance = dist;
                    bestDirection = n;
                }
            }
            else if (x === destinationNode.x && y === destinationNode.y && n < 6) {
                return {x: 0, y: 0}
            }
        }
    }
    return {...directions[bestDirection], index: bestDirection};
}

function approxDist (x1, y1, x2, y2) {
    return Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2), (Math.abs(x1 - x2) + Math.abs(y1 - y2)) * .707)
}

function message (text) {
    messages.push(text);
    setTimeout(() => {
        messages.shift();
    }, 8000);
}

// override unpause function
unpause = () => {
    paused = false
    requestAnimationFrame(drawCanvas)
}