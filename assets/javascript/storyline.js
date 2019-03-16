// jshint esversion: 6
// var currentTime = new Date()
// var month = currentTime.getMonth() + 1
// var day = currentTime.getDate()
// var year = currentTime.getFullYear()
// var dateString= month + "/" + day + "/" + year
var player = GetPlayer();
// player.SetVar("SystemDate",dateString);
var instruct;
var clearDiv;

// Elements get populated by local storage data
txtUsername.value = sessionStorage.getItem('username');
txtEmail.value = sessionStorage.getItem('email');

// Data saved
txtUsername.addEventListener('input', function() {
    sessionStorage.setItem('username', txtUsername.value);
}, false);

txtEmail.addEventListener('input', function() {
    sessionStorage.setItem('email', txtEmail.value);
}, false);

if (window.sessionStorage) {
    //  Get form elements
    var txtUsername = document.getElementById('username'); 
    var txtEmail = document.getElementById('email');
}    

var instruct = function() {
    var instructions =  $('<button> Instructions </button>');
    instructions.attr('id', 'instructBtn');
    instructions.attr('class','btn btn-danger');
    instructions.appendTo('.mainDiv');
};

$('.mainDiv').empty();
$('.mainDiv').append(instruct);


var start = function() {
    var startBtn = $('<button> Start </button>');
    startBtn.attr('id', 'startBtn');
    startBtn.attr('class', 'btn btn-danger');
    startBtn.appendTo('.mainDiv');
};
$('.mainDiv').append(start);

var playerStats = function() {
    var statsBtn = $('<button> Player Stats </button>');
    statsBtn.attr('id', 'statsBtn');
    statsBtn.attr('class', 'btn btn-danger');
    statsBtn.appendTo('.mainDiv');
};
$('.mainDiv').append(playerStats);

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





    //     $(startButton).attr('class', 'btn btn-primary');
    //     $(startButton).attr('id', 'startButton')
    //     $(startButton).appendTo('#mainDiv');
    // $(document).on('click', '#startButton', letsGo);

           
//         ('.submit').click(function() {
//             var x = document.getElementsByClassName('mainDiv');
   
//             x.empty();
    
//     myFunction();
//    });

//    $('.submit').click(function(){
//     $('.mainDiv').addClass('hidden'); $('.mainDiv').empty();
//     auto_refresh = setInterval( function() { $('.mainDiv').load('body.php').fadeIn('slow'); }, 1000);
// });

//     $(document).on('click', '.submit', function(event) {
//       event.preventDefault();

// });

   




// var pokemon = ["Snorlax", "Jigglypuff", "Charzard", "Articuno", "Ninetails"];

// class pokeCharacter {
//     constructor(type) {
//         this.type = type;
//         this.image = $('<img>')
//             .attr('src', 'assets/images/' + type + '.png');
//         Ajax call
//         this.stats = null 
//     }
// }






  

    