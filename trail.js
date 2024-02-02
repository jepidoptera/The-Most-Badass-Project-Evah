const trail = [
    {
        type: 'nowhere',
        name: 'what you leave behind',
        length: -3
    },
    {
        type: 'city',
        name: 'Orepoke',
        length: 1,
        scenery: [
            {type: "orepoke", frequency: 0},
            {type: "house", frequency: 5},
            {type: "distant tree", frequency: 10}
        ],
    },
    {
        type: 'suburb',
        name: 'Orepoke',
        scenery: [
            {type: "house", frequency: 5},
            {type: "distant tree", frequency: 10}
        ],
        length: 15,
        message: {
            title: 'Your journey begins', 
            text: "Orepoke, once the world's greatest city, is now wracked by devastating epidemics of cholera and dysentery, as well as terrible shortages of food, wagon axles, and bullets.  Furthermore, the prophets foretell that on Februne the twelfth, the Sun will be eclipsed by the dark moon Plutanus, and madness will grip the land.  Only the legendary city of Pokegonemon has the technology to weather the coming storm.  So taking your surviving Mokemon™, you set off on the road...",
            button: "begin"
        }
    },
    {
        type: 'shop',
        name: "Trader Moe's",
        scenery: [
            {type: "trading post", frequency: 0},
            {type: "house", frequency: 5},
            {type: "distant tree", frequency: 10}
        ],
        length: 1,
        shop: {
            title: "Trader Moe's trading post", 
            text: "Heading out, eh?  I don't blame you. <br><br>  Don't forget to stock up on grenades.  There are bears in those woods up ahead.",
            items: [
                {name: "mokeballs", price: 20},
                {name: "grenades", price: 50},
                {name: "food", price: 1, increment: 10}
            ]
        }
    },
    {
        type: 'suburb',
        name: 'The Outskirts of Orepoke',
        scenery: [
            {type: "house", frequency: 5},
            {type: "distant tree", frequency: 10}
        ],
        length: 15,
    },
    {
        type: 'forest',
        name: 'The Forest of Doom',
        scenery: [
            {type: "signpost", frequency: 0},
            {type: "tree", frequency: 5}
        ],
        prey: [
            {type: "deer", frequency: 100},
            {type: "bear", frequency: 20},
            {type: "squirrel", frequency: 300},
            {type: "Zyant", isMokemon: true, frequency: 10}
        ],
        length: 75 // seconds

    },
    {
        type: 'desert',
        name: 'The Desert of Dryness',
        scenery: [
            {type: "signpost", frequency: 0},
            {type: "cactus", frequency: 2},
            {type: "rock", frequency: 2}
        ],
        prey: [
            {type: "scorpion", frequency: 100},
            {type: "armadillo", frequency: 50},
            {type: "coyote", frequency: 20},
            {type: "Dezzy", isMokemon: true, frequency: 10}
        ],
        length: 57 // seconds

    },
    {
        type: 'shop',
        name: "The Oasis",
        scenery: [
            {type: "oasis", frequency: 0},
            {type: "rock", frequency: 5},
            {type: "cactus", frequency: 10}
        ],
        length: 1,
        shop: {
            title: "The Desert Oasis", 
            text: "Welcome, welcome.  Hope you haven't had to eat too many of your Mokemon.  The moon's getting bigger, isn't it?  Please buy some stuff. ",
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
            {type: "cactus", frequency: 2},
            {type: "rock", frequency: 2}
        ],
        prey: [
            {type: "scorpion", frequency: 100},
            {type: "armadillo", frequency: 50},
            {type: "coyote", frequency: 20},
            {type: "Dezzy", isMokemon: true, frequency: 10}
        ],
        length: 39 // seconds

    },
    {
        type: 'mountains',
        name: 'The Mainstay Mountains',
        scenery: [
            {type: "first mountain", frequency: 0},
            {type: "mountain range", frequency: 0},
            {type: "rock", frequency: 10},
            {type: "far moutain", frequency: 0},
            {type: "near moutain", frequency: 0},
            {type: "pine tree", frequency: 5}
        ],
        prey: [
            {type: "goat", frequency: 85},
            {type: "porcupine", frequency: 85},
            {type: "yeti", frequency: 10},
            {type: "Apismanion", isMokemon: true, frequency: 10},
            {type: "Marlequin", isMokemon: true, frequency: 10}
        ],
        length: 82 // seconds

    },
    {
        type: 'jungle',
        name: 'The Great Palm Jungle',
        scenery: [
            {type: "signpost", frequency: 0},
            {type: "palm tree", frequency: 10}
        ],
        prey: [
            {type: "deer", frequency: 100},
            {type: "goat", frequency: 85},
            {type: "Wingmat", isMokemon: true, frequency: 10},
            {type: "Mallowbear", isMokemon: true, frequency: 10},
            {type: "Shadowdragon", isMokemon: true, frequency: 10}
        ],
        length: 100 // seconds

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