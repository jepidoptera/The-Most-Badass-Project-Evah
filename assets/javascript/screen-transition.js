// jshint esversion: 6
var users = [];
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

    var userRef = database.ref('/users');
    userRef.on('child_added', (user) => {
        if (user.val().username) {
            // don't include entries that don't have a username
            users[user.val().username] = {username: user.val().username, password: user.val().password, key: user.key};
        }
    });
    // return the cleaned array to the database
    // userRef.set(users);
    

    $('#submit').on('click', function(e){
        e.preventDefault();
        
        $('.login-form').validate();
        if (!$('.login-form').validate().checkForm()) return;

        // $('.title').hide();
        // $('.login-form').hide();
        // $('.game-panel').show();

        var username = $('#username').val().trim();
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

        window.open('journey.html?playerID=' + users[username].key);
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