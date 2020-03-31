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
        name: 'The Outskirts of Orepoke',
        scenery: [
            {type: "house", frequency: 5},
            {type: "distant tree", frequency: 10}
        ],
        length: 20,
        message: {
            title: 'Your journey begins', 
            text: "Orepoke, once the world's greatest city, is now wracked by devastating epidemics of cholera and dysentery, as well as terrible shortages of food, wagon axles, and bullets.  Taking your surviving Mokemon, you set off on the road, in search of the legendary city of Pokegonemon - hoping to find a better life there.",
            button: "begin"
        }
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
            {type: "squirrel", frequency: 300}
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
            {type: "coyote", frequency: 20}
        ],
        length: 96 // seconds

    },
    {
        type: 'mountains',
        name: 'The Mainstay Mountains',
        scenery: [
            {type: "first mountain", frequency: 0},
            {type: "mountain range", frequency: 0.05},
            {type: "rock", frequency: 1},
            {type: "far moutain", frequency: 1},
            {type: "near moutain", frequency: 0.2}
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
        length: 100 // seconds

    },
    {
        type: 'city',
        name: 'pokegonemon',
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