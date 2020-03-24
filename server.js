const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const firebase = require('firebase/app');
require ('firebase/database')
require('dotenv').config();
firebase.initializeApp({
    apiKey: "AIzaSyAqd2f2a2iFdzSMNqsGzt8ShzjJ_VxSG9w",
    authDomain: "pokemon-trail.firebaseapp.com",
    databaseURL: "https://pokemon-trail.firebaseio.com",
    projectId: "pokemon-trail",
    storageBucket: "",
    messagingSenderId: "726250890927"
});
// const trail = require('trail');

const port = process.env.PORT || 8080;
// const apiKey = process.env.APIKEY || "no_api_key";
const authtokens = {};

// Serve static files
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// use handlebars
var exphbs = require("express-handlebars");
app.engine(".hbs", exphbs({
    defaultLayout: "main",
    extname: ".hbs",
    helpers: {
    // capitalize words on request
        'Capitalize': function(string)
        {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }
    }
}));

app.set("view engine", ".hbs");

// Serve app
console.log('Listening on: http://localhost:' + port);

app.get('/', (req, res) => {
    res.render('login', {});
})

app.get("/login", (req, res) => {
    console.log("logging in as...", req.query.username);
    let username = req.query.username;
    let password = req.query.password;
    let playerRef = firebase.database().ref('users/' + username + "/gameInfo");
    console.log(req.body);
    res.query = null;
    playerRef.on('value', value => {
        if (!value.val()) {
            res.render("journey", {name: username})
            return;
        }
        if (value.val().password) {
            if (password != value.val().password) {
                res.sendStatus(403);
                return;
            }
        }
        authtokens[username] = generateToken();
        console.log(authtokens[username])
        res.redirect(`journey?username=${username}&authtoken=${authtokens[username]}`);
    })
})

app.get ("/journey", (req, res) => {
    console.log("let's go")
    let playerID = req.query.username;
    let authtoken = req.query.authtoken;
    if (!authtoken || authtokens[playerID] != authtoken) {
        res.sendStatus(403);
        return;
    }
    let playerRef = firebase.database().ref('users/' + playerID + "/gameInfo");
    console.log(req.body);
    res.query = null;
    playerRef.on('value', value => {
        if (!value.val()) {
            res.render("journey", {name: playerID})
            return;
        }
        if (value.val().password) {
            if (password != value.val().password) {
                res.sendStatus(403);
            }
        }
        res.render("journey", value.val());
    })
})

app.post("/save", (req, res) => {
    console.log('saving...');
    req.body = JSON.parse(req.body.player)
    console.log(req.body);
    let playerID = req.body.name;
    firebase.database().ref('users/' + playerID + "/gameInfo").set(req.body)
    res.sendStatus(200);
})

app.get('/load/:playerID', (req, res) => {
    console.log('loading', req.params['playerID'])
    let playerID = req.params['playerID'];
    let playerRef = firebase.database().ref('users/' + playerID + "/gameInfo");
    // listen for player value (download entire player object every time anything changes)
    playerRef.on('value', (value) => {
        if (!value.val()) {
            console.log('not found.');
            res.sendStatus(404);
            return;
        }
        let player = {};
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
        res.json(player);
    });
})
app.listen(port);

function generateToken() {
    let chars = "abcdefghijklmnopqrstuvwxyz123456789";
    // string some random numbers and letters together
    return [1, 2, 3, 4, 5, 6, 7].map(n => chars[Math.floor(Math.random() * chars.length)]).join('');
}