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
        firebase.database().ref('users/' + playerID + "/gameInfo/money").set(this._money);
    },
    get food() {return this._food;},
    set food(value) {
        if (value == undefined) return;
        this._food = value;
        firebase.database().ref('users/' + playerID + "/gameInfo/food").set(this._food);
    },
    get kibble() {return this._kibble;},
    set kibble(value) {
        if (value == undefined) return;
        this._kibble = value;
        firebase.database().ref('users/' + playerID + "/gameInfo/kibble").set(this._kibble);
    },
    get pokeballs() {return this._pokeballs;},
    set pokeballs(value) {
        if (value == undefined) return;
        this._pokeballs = value;
        firebase.database().ref('users/' + playerID + "/gameInfo/pokeballs").set(this._pokeballs);
    },
    get speed() {return this._pokeballs;},
    set speed(value) {
        if (value == undefined) return;
        this._speed = value;
        scrollSpeed = value / 5;
        firebase.database().ref('users/' + playerID + "/gameInfo/speed").set(this._speed);
    },
    get time() {return this._time;},
    set time(value) {
        if (value == undefined) return;
        this._time = value;
        firebase.database().ref('users/' + playerID + "/gameInfo/time").set(this._time);
    },
    get day() {return this._day;},
    set day(value) {
        if (value == undefined) return;
        this._day = value;
        firebase.database().ref('users/' + playerID + "/gameInfo/day").set(this._day);
    },
    pokemon: {
        _pokes: [],
        add (pokename, pokestats) {
            this._pokes.push({name: pokename, stats: pokestats});
            // set to database
            firebase.database().ref('users/' + playerID + "/gameInfo/pokemon").set(this._pokes);
        },
        remove (index) {
            // remove at index
            this._pokes.slice(index, 1);
            // set to database
            firebase.database().ref('users/' + playerID + "/gameInfo/pokemon").set(this._pokes);
        },
        get list() {
            return this._pokes;
        },
        set list(listOfPokemon) {
            if (listOfPokemon) this._pokes = listOfPokemon;
        }
    },
};

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
    playerID = getUrlParameter('playerID');
    playerRef = firebase.database().ref('users/' + playerID + "/gameInfo");
    // listen for player value (download entire player object every time anything changes)
    playerRef.on('value', (value) => {
        if (!value.val()) return;
        player._food = value.val().food;
        player._kibble = value.val().kibble;
        player._money = value.val().money;
        player._pokeballs = value.val().pokeballs;
        player.pokemon._pokes = value.val().pokemon;
        player._speed = value.val().speed;
        player._time = value.val().time;
        player._day = value.val().day;
        console.log(player);
    });
});

function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

