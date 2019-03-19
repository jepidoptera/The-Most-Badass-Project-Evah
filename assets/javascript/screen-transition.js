$(document).ready(function(){

    var config = {
        apiKey: "AIzaSyAqd2f2a2iFdzSMNqsGzt8ShzjJ_VxSG9w",
        authDomain: "pokemon-trail.firebaseapp.com",
        databaseURL: "https://pokemon-trail.firebaseio.com",
        projectId: "pokemon-trail",
        storageBucket: "",
        messagingSenderId: "726250890927"
    };
    firebase.initializeApp(config);

    var database = firebase.database();

    $('.game-panel').hide();
    $('.instructions-panel').hide();
    $('.pokemon-panel').hide();

    $('.login-form').validate();

    $('#submit').on('click', function(e){
        e.preventDefault();

        $('.title').hide();
        $('.login-form').hide();
        $('.game-panel').show();

        var username = $('#username').val().trim();
        var password = $('#password').val().trim();

        var ref = database.ref();
        var rootRef = firebase.database().ref();

        var gameref = database.ref("/users").push({
            username: username,
            password: password
        });
        window.open('journey.html?playerID=' + gameref.key);
    });

    $('.instructions').on('click', function(e){
        e.preventDefault();
        $('.game-panel').hide();
        $('.instructions-panel').show();
    });

    $('.pokemon').on('click', function(e){
        e.preventDefault();
        $('.game-panel').hide();
        $('.pokemon-panel').show();
    });

    $('.ok-btn').on('click', function(){
        $('.instructions-panel').hide();
        $('.pokemon-panel').hide();
        $('.game-panel').show();
    })
});






// var email = 'kitcat1216@yahoo.com';
// function validate(email) {

// apiKey = 'b33ac48d72msh60d9b7f861e0a6ep1512f6jsn2dbe2a0cc93c';

//     var queryURL = "https://pozzad-email-validator.p.rapidapi.com/emailvalidator/validateEmail/" + email;

//     $.ajax({
//         headers: {
//             'X-RapidAPI-Key': 'b33ac48d72msh60d9b7f861e0a6ep1512f6jsn2dbe2a0cc93c'
//         },
//         url: queryURL,
//         method: "GET"
//       }).then(function(response) {
//           console.log(response);
//         });
//   };      
//     $('#submit').on("click",function(){
        
//     }
    
// });
