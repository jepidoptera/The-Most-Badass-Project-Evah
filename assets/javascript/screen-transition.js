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

        database.ref("/users").push({
            username: username,
            password: password
        });
    });

    $('.instructions').on('click', function(e){
        e.preventDefault();
        $('.game-panel').hide();
        $('.instructions-panel').show();
    })

    $('.pokemon').on('click', function(e){
        e.preventDefault();
        $('.game-panel').hide();
        $('.pokemon-panel').show();
    })

    $('.ok-btn').on('click', function(){
        $('.instructions-panel').hide();
        $('.pokemon-panel').hide();
        $('.game-panel').show();
    })
});