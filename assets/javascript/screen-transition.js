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

    $('.login-form').validate();

    $('#submit').on('click', function(e){
        e.preventDefault();

        $('.title').html("Main Menu" + '<img class="pokeball" src="assets/Images/pokeball.png">');
        $('.login-form').hide();
        $('.main-menu').show();

        var email = $('#email').val().trim();
        var username = $('#username').val().trim();
        var password = $('#password').val().trim();

        var ref = database.ref();
        var rootRef = firebase.database().ref();

        database.ref("/users").push({
            email: email,
            username: username,
            password: password
        });
    });

});