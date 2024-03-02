animals = require('./public/assets/javascript/animals.js');
const trail = [
    {
        type: 'city',
        name: 'what you leave behind',
        length: 0,
        scenery: [
            {type: "house", frequency: 50},
            {type: "distant tree", frequency: 50}
        ],
    },
    {
        type: 'city',
        name: 'Orepoke',
        length: 1,
        scenery: [
            {type: "orepoke", frequency: 0},
            {type: "house", frequency: 50},
            {type: "distant tree", frequency: 50}
        ],
    },
    {
        type: 'city',
        name: 'Orepoke',
        scenery: [
            {type: "house", frequency: 50},
            {type: "distant tree", frequency: 50}
        ],
        length: 15,
        message: {
            title: 'Your journey begins', 
            text: "Orepoke, once the world's greatest city, is now wracked by devastating epidemics of cholera and dysentery, as well as terrible shortages of food, wagon axles, and bullets. Furthermore, the prophets foretell that on Februne the twelfth, the Sun will be eclipsed by the dark moon Plunepiter, and madness will grip the land. Only the legendary city of Pokegonemon has the technology to weather the coming storm. So taking your surviving Mokemon™, you set off before dawn...",
            button: "begin"
        }
    },
    {
        type: 'city',
        name: "Trader Moe's",
        scenery: [
            {type: "trading post", frequency: 0},
            {type: "house", frequency: 40},
            {type: "distant tree", frequency: 50}
        ],
        length: 1,
        shop: {
            title: "Trader Moe's trading post", 
            text: "Heading out, eh? I don't blame you. <br><br> Don't forget to stock up on grenades. There are bears in those woods up ahead.",
            items: [
                {name: "mokeballs", price: 20},
                {name: "grenades", price: 50},
                {name: "arrows", price: 2.5, increment: 20},
                {name: "food", price: 1, increment: 10}
            ]
        }
    },
    {
        type: 'city',
        name: 'The Outskirts of Orepoke',
        scenery: [
            {type: "house", frequency: 35},
            {type: "distant tree", frequency: 50}
        ],
        length: 15,
    },
    {
        type: 'forest',
        name: 'The Forest of Doom',
        scenery: [
            {type: "signpost", frequency: 0},
            {type: "tree", frequency: 50},
            {type: "fern", frequency: 50}
            // {type: "near tree", frequency: 1}
        ],
        hunting_scenery: [
            {type: "tree", frequency: 5},
            {type: "fern", frequency: 5, passable: true}
        ],
        powerups: [
            {type: "berry bush", frequency: 50},
        ],
        animals: [
            {type: "deer", frequency: 100},
            {type: "bear", frequency: 20},
            {type: "squirrel", frequency: 300},
        ],
        mokemon: [
            {type: "Zyant", frequency: 10},
            {type: "Fragglegod", frequency: 5}
        ],
        length: 150 // seconds

    },
    {
        type: 'desert',
        name: 'The Desert of Dryness',
        scenery: [
            {type: "signpost", frequency: 0},
            {type: "cactus", frequency: 5},
            {type: "rock", frequency: 8}
        ],
        hunting_scenery: [
            {type: "cactus", frequency: 1},
            {type: "rock", frequency: 2}
        ],
        animals: [
            {type: "scorpion", frequency: 100},
            {type: "armadillo", frequency: 50},
            {type: "coyote", frequency: 20},
        ],
        mokemon: [
            {type: "Dezzy", frequency: 10},
            {type: "Fragglegod", frequency: 5}
        ],
        length: 57 // seconds

    },
    {
        type: 'shop',
        name: "The Oasis",
        scenery: [
            {type: "oasis", frequency: 0},
            {type: "rock", frequency: 8},
            {type: "cactus", frequency: 10}
        ],
        length: 1,
        shop: {
            title: "The Desert Oasis", 
            text: "Welcome, welcome. Hope you haven't had to eat too many of your Mokemon. The moon's getting bigger, isn't it? Please buy some stuff.",
            items: [
                {name: "mokeballs", price: 20},
                {name: "grenades", price: 50},
                {name: "food", price: 1, increment: 10}
            ]
        }
    },
    {
        type: 'desert',
        name: 'More Desert',
        scenery: [
            {type: "cactus", frequency: 10},
            {type: "rock", frequency: 8}
        ],
        hunting_scenery: [
            {type: "cactus", frequency: 2},
            {type: "rock", frequency: 2}
        ],
        animals: [
            {type: "scorpion", frequency: 100},
            {type: "armadillo", frequency: 50},
            {type: "coyote", frequency: 20},
        ],
        mokemon: [
            {type: "Dezzy", frequency: 10},
            {type: "Fragglegod", frequency: 5}

        ],
        length: 39 // seconds

    },
    {
        type: 'mountains',
        name: 'The Mainstay Mountains',
        scenery: [
            {type: "first mountain", frequency: 0},
            {type: "mountain range", frequency: 2},
            {type: "rock", frequency: 20},
            {type: "mountain", frequency: 4},
            {type: "pine tree", frequency: 25}
        ],
        hunting_scenery: [
            {type: "pine tree", frequency: 4},
            {type: "rock", frequency: 4}
        ],
        animals: [
            {type: "goat", frequency: 85},
            {type: "porcupine", frequency: 85},
            {type: "yeti", frequency: 10},
        ],
        mokemon: [
            {type: "Apismanion", frequency: 10},
            {type: "Marlequin", frequency: 10},
            {type: "Fragglegod", frequency: 5}
        ],
        powerups: [
            {type: "gold nugget", frequency: 50},
        ],
        length: 82 

    },
    {
        type: 'swamp',
        name: 'The Swamp of Despair',
        scenery: [
            {type: "signpost", frequency: 0},
            {type: "dead tree", frequency: 8},
            {type: "tree", frequency: 0.7},
            {type: "cattails", frequency: 40},
            {type: "distant tree", frequency: 1}
        ],
        hunting_scenery: [
            {type: "dead tree", frequency: 3},
            {type: "tree", frequency: 0.3},
            {type: "cattails", frequency: 10, passable: true}
        ],
        animals: [
            {type: "alligator", frequency: 30},
            {type: "heron", frequency: 85},
            {type: "beaver", frequency: 150},
        ],
        mokemon: [
            {type: "Apismanion", frequency: 10},
            {type: "Marlequin", frequency: 10},
            {type: "Fragglegod", frequency: 5}
        ],
        length: 170
    },
    {
        type: 'jungle',
        name: 'The Great Palm Jungle',
        scenery: [
            {type: "signpost", frequency: 0},
            {type: "palm tree", frequency: 50},
            {type: "fern", frequency: 40},
        ],
        hunting_scenery: [
            {type: "palm tree", frequency: 5},
            {type: "fern", frequency: 4, passable: true}
        ],
        animals: [
            {type: "deer", frequency: 100},
            {type: "goat", frequency: 85},
            {type: "tiger", frequency: 20},
        ],
        mokemon: [
            {type: "Wingmat", frequency: 10},
            {type: "Mallowbear", frequency: 10},
            {type: "Shadowdragon", frequency: 10},
            {type: "Fragglegod", frequency: 10}
        ],
        length: 210 // seconds

    },
    {
        type: 'city',
        name: 'Pokegonemon',
        length: 1,
        scenery: [
            {type: "pokegonemon", frequency: 0}
        ],
        message: {
            title: "Yay", 
            text: "You have reached the legendary city!  Rejoice!", 
            button: "Celebrate"
        }
    },
    {
        type: 'suburb',
        name: 'the Great Beyond',
        scenery: [
            {type: "house", frequency: 5},
            {type: "palm tree", frequency: 5}
        ],
        length: 1000000000001
    },
    {
        type: 'the end',
        name: 'infinity',
        length: 0
    }
]
module.exports = trail;