
// jshint esversion: 6
// var inventory = [];
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

    var pokeBalls = 0;
    var money = 0;
    var kibble = 0;
    var food = 0;

    // $('.main-menu').hide();

    $('#submit').on('click', function(e){
        e.preventDefault();
   