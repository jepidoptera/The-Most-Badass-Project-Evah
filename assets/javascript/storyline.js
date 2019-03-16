// jshint esversion: 6
// var currentTime = new Date()
// var month = currentTime.getMonth() + 1
// var day = currentTime.getDate()
// var year = currentTime.getFullYear()
// var dateString= month + "/" + day + "/" + year
var player = GetPlayer();
// player.SetVar("SystemDate",dateString);

var pokeCharacter = [{
    pokemon: ["Snorlax", "Jigglypuff", "Charzard", "Articuno", "Ninetails"],
    imgSrc: "assets/images/mulan.jpg"

}
];

var trail = [
    {
        type: 'city',
        name: 'Pokemon City'
    },
    {
        type: 'forest',
        name: 'The Forest of Doom',
        length: 14 // seconds
    },
    {
        type: 'city',
        name: 'Pokegonemon'
    }
];

function gameLoop () {
    var currentLocation = 0;
    switch (trail[currentLocation].type) {
    case "city":
        // city menu screen
        break;
    default: 
        
    }
}




