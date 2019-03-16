// jshint esversion: 6
var instruct;
var clearDiv;

    //    $('.mainDiv').empty();

       if (window.sessionStorage) {
    //  Get form elements
    var txtUsername = document.getElementById('username'); 
    var txtEmail = document.getElementById('email');
    

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
    
 };


    var instruct = function() {
           var instructions =  $('<button> Instructions </button>');
           instructions.attr('id', 'instructBtn');
           instructions.attr('class','btn btn-danger');
           instructions.appendTo('.mainDiv');
        }
        $('.mainDiv').empty();
        $('.mainDiv').append(instruct);
      

        
        var start = function() {
            var startBtn = $('<button> Start </button>');
            startBtn.attr('id', 'startBtn');
            startBtn.attr('class', 'btn btn-danger');
            startBtn.appendTo('.mainDiv');
        }
            $('.mainDiv').append(start);



        var playerStats = function() {
            var statsBtn = $('<button> Player Stats </button>');
            statsBtn.attr('id', 'statsBtn');
            statsBtn.attr('class', 'btn btn-danger');
            statsBtn.appendTo('.mainDiv');
        }
            $('.mainDiv').append(playerStats);

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






  

    