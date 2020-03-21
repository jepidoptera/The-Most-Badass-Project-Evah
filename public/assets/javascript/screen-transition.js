// jshint esversion: 6
var users = [];
var username;
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

    $('.main-menu').hide();

    var userRef = database.ref('/users');
    userRef.on('child_added', (user) => {
        if (user.val().username) {
            // don't include entries that don't have a username
            users[user.val().username] = {username: user.val().username, password: user.val().password, key: user.key};
        }
    });

    $('#submit').on('click', function(e){
        e.preventDefault();
        
        $('.login-form').validate();
        if (!$('.login-form').validate().checkForm()) return;

        // var email = $('#email').val().trim();
        username = $('#username').val().trim();
        var password = $('#password').val().trim();
        
        // does this user exist?
        if (users[username]) {
            // is the password right?
            if (password != users[username].password) {
                // nope
                var nope = $('<p>').text('wrong password').css({'color': 'red'});
                $('body').append(nope);
                setTimeout(() => {
                    nope.remove();
                }, 5000);
                return;
            }
        }
        else if (confirm("User " + username + " does not exist.  Create new?")){
            // push this new user to the database
            users[username] = {username: username, 
                password: password, 
                key: database.ref("/users").push({
                    username: username,
                    password: password})
            };
        }
        else return;
        // successful login
        $('.title').html("Main Menu" + '<img class="pokeball" src="assets/Images/pokeball.png">');
        $('.login-form').hide();
        $('.main-menu').show();

    });

    $("#startGame").on('click', () => {
        // start game
        window.location.assign('journey.html?playerID=' + users[username].key);
    });
});

