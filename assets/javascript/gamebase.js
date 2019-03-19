// jshint esversion:6
var playerID;
var player = {
    /**
     * @param {number} amount
     */
    get money() {return this._money;},
    set money(amount) {
        this._money = amount;
        if (amount) firebase.database().ref('users/' + playerID + "/gameInfo/money").set(this._money);
    },
    get food() {return this._food;},
    set food(amount) {
        this._food = amount;
        if (amount) firebase.database().ref('users/' + playerID + "/gameInfo/food").set(this._food);
    },
    get kibble() {return this._kibble;},
    set kibble(amount) {
        this._kibble = amount;
        if (amount) firebase.database().ref('users/' + playerID + "/gameInfo/kibble").set(this._kibble);
    },
    get pokeballs() {return this._pokeballs;},
    set pokeballs(amount) {
        this._pokeballs = amount;
        if (amount) firebase.database().ref('users/' + playerID + "/gameInfo/pokeballs").set(this._pokeballs);
    },
    pokemon: {
        pokes: [],
        add (pokename, pokestats) {
            this.pokes.push({name: pokename, stats: pokestats});
            // set to database
            firebase.database().ref('users/' + playerID + "/gameInfo/pokemon").set(this.pokes);
        },
        remove (index) {
            // remove at index
            this.pokes.slice(index, 1);
            // set to database
            firebase.database().ref('users/' + playerID + "/gameInfo/pokemon").set(this.pokes);
        },
        get list() {
            return this.pokes;
        },
        set list(listOfPokemon) {
            if (listOfPokemon) this.pokes = listOfPokemon;
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
        player.food = value.val().food;
        player.kibble = value.val().kibble;
        player.money = value.val().money;
        player.pokeballs = value.val().pokeballs;
        player.pokemon.list = value.val().pokemon;
        console.log(player);
    });
});

function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

