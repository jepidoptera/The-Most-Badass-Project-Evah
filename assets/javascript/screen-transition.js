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

    $('#submit').on('click', function(e){
        e.preventDefault();
        var username = $('#username').val().trim();
        var password = $('#password').val().trim();

        var ref = database.ref();
        var rootRef = firebase.database().ref();

        rootRef.once("value")
            .then(function(snapshot) {
                var key = snapshot.key;
                var childKey = snapshot.child("users/" + username).key;
                console.log(childKey)
            });

                // console.log(a);
                // console.log(b);
                // console.log(c);
                // console.log(d);



        // database.ref("/users").push({
        //     username: username,
        //     password: password
        // });

        // $('.login').hide();
    });
});