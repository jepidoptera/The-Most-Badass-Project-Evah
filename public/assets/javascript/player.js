// jshint esversion:6
var playerID;
var player = {
    /**
     * @param {number} value
     */
    get money() {return this._money;},
    set money(value) {
        if (value == undefined) return;
        this._money = value;
        firebase.database().ref('users/' + player.ID + "/gameInfo/money").set(this._money);
    },
    get food() {return this._food;},
    set food(value) {
        if (value == undefined) return;
        this._food = value;
        firebase.database().ref('users/' + player.ID + "/gameInfo/food").set(this._food);
    },
    get kibble() {return this._kibble;},
    set kibble(value) {
        if (value == undefined) return;
        this._kibble = value;
        firebase.database().ref('users/' + player.ID + "/gameInfo/kibble").set(this._kibble);
    },
    get mokeballs() {return this._mokeballs;},
    set mokeballs(value) {
        if (value == undefined) return;
        this._mokeballs = value;
        firebase.database().ref('users/' + player.ID + "/gameInfo/mokeballs").set(this._mokeballs);
    },
    get speed() {return this._mokeballs;},
    set speed(value) {
        if (value == undefined) return;
        this._speed = value;
        scrollSpeed = value / 5;
        firebase.database().ref('users/' + player.ID + "/gameInfo/speed").set(this._speed);
    },
    get time() {return this._time;},
    set time(value) {
        if (value == undefined) return;
        this._time = value;
        firebase.database().ref('users/' + player.ID + "/gameInfo/time").set(this._time);
    },
    get day() {return this._day;},
    set day(value) {
        if (value == undefined) return;
        this._day = value;
        firebase.database().ref('users/' + player.ID + "/gameInfo/day").set(this._day);
    },
    get posse() {return this._posse;},
    set posse(value) {
        if (value == undefined) return;
        this._posse = value.map(value => {return {name: value.name, health: value.health, conditions: value.conditions || []};});
        firebase.database().ref('users/' + player.ID + "/gameInfo/posse").set(this._posse);
    },
    get location() {return this._location;},
    set location(value) {
        if (value == undefined) return;
        // copy just part of the object, the rest is hardcoded
        this._location = {name: value.name,
        progress: value.progress};
        firebase.database().ref('users/' + player.ID + "/gameInfo/location").set(this._location);
    },
    get progress() {return this._progress},
    set progress(value) {
        if (value == undefined) return;
        this._progress = value;
        firebase.database().ref('users/' + player.ID + "/gameInfo/progress").set(this._progress);
    },
    mokemon: {
        _mokes: [],
        add(mokename, mokestats) {
            player.mokemon._mokes.push({name: mokename, stats: mokestats});
            // set to database
            player.mokemon.updateMokes();
        },
        remove(index) {
            // remove at index
            player.mokemon._mokes.slice(index, 1);
            // set to database
            player.mokemon.updateMokes();
        },
        clear() {
            player.mokemon._mokes = [];
            player.mokemon.updateMokes();
        },
        updateMokes() {
            firebase.database().ref('users/' + player.ID + "/gameInfo/mokemon").set(player.mokemon._mokes);
        },
        get list() {
            return player.mokemon._mokes;
        },
        set list(listOfMokemon) {
            if (listOfMokemon) player.mokemon._mokes = listOfMokemon;
        }
    },
};

var loaded = false;

var playerRef;
$(document).ready(() => {
    // set up database connection
    var config = {
        apiKey: "AIzaSyAqd2f2a2iFdzSMNqsGzt8ShzjJ_VxSG9w",
        authDomain: "pokemon-trail.firebaseapp.com",
        databaseURL: "https://pokemon-trail.firebaseio.com",
        projectId: "pokemon-trail",
        storageBucket: "",
        messagingSenderId: "726250890927"
    };
    firebase.initializeApp(config);
    player.ID = getUrlParameter('playerID');
    playerRef = firebase.database().ref('users/' + player.ID + "/gameInfo");
    // listen for player value (download entire player object every time anything changes)
    playerRef.on('value', (value) => {
        if (!value.val()) return;
        player._food = value.val().food;
        player._kibble = value.val().kibble;
        player._money = value.val().money;
        player._mokeballs = value.val().mokeballs;
        player.mokemon._mokes = value.val().mokemon || [];
        player._speed = value.val().speed;
        player._time = value.val().time;
        player._day = value.val().day;
        player.posse = value.val().posse;
        player._location = value.val().location;
        if (firebaseReady && !loaded) {
            loaded = true;
            firebaseReady();
        }
    });
});

function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

function firebaseReady() {
    return;
}