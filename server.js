const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const firebase = require('firebase/app');
const trail = require('./trail');

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
const players = [];

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
        },
        'Plusone': function(number) {
            return number + 1;
        }
    }
}));

app.set("view engine", ".hbs");

// Serve app
console.log('Listening on: http://localhost:' + port);

app.get('/', (req, res) => {
    res.render('login', {});
})

app.post("/login", (req, res) => {
    console.log("logging in as...", req.body.username);
    let username = req.body.username;
    let password = req.body.password;
    // console.log(req.body);
    if (!players[username]) {
        res.status(404).send('Player not found.')
        return;
    }
    else if ((players[username].password || password) && password != players[username].password) {
        res.status(403).send('Wrong password.');
        return;
    }
    authtokens[username] = generateToken();
    // console.log(authtokens[username])
    console.log(`${username} logged in.`)
    res.json({authtoken: authtokens[username]});
    res.end();
})

app.get("/logout", (req, res) => {
    res.render("logout");
    console.log(`${username} was automatically logged out.`)
})

app.get ("/journey", (req, res) => {
    let username = req.query.name;
    let authtoken = req.query.auth;
    console.log(`let's go ${username} ${authtoken}`)
    if (!validateAuth(username, authtoken, res)) return;

    if (!players[username]) {
        // new player
        res.render("journey", {name: username})
        return;
    }
    res.render("journey", {...players[username], authtoken: authtoken});

})

app.get ("/hunt", (req, res) => {
    console.log(`${req.query.name} is going hunting.`)
    let username = req.query.name;
    let authtoken = req.query.auth;
    if (validateAuth(username, authtoken,res)) {
        res.render("hunt", {...players[username], authtoken: authtoken});
    }
})

app.get("/betterhunting", (req, res) => {
    res.render("hunt");
})

app.get("/highscores/:username?", (req, res) => {
    let selectedUser = req.params.username || "";
    let scores = Object.keys(players)
        .map(key => players[key])
        .filter(player => player ? player.finalScore : false)
        .map(player => {return {name: player.name, score: player.finalScore, selected: player.name === selectedUser}})
        .sort((a, b) => a.score < b.score ? 1 : -1);
    console.log('Showing high scores');
    res.render("highscore", {highscores: scores});
})

app.post("/save", (req, res) => {
    req.body = JSON.parse(req.body.data);
    console.log("***saving***", req.body);
    let username = req.body.name;
    let authtoken = req.body.authtoken;

    // console.log(`authtoken = ${authtoken}`)

    if (validateAuth(username, authtoken, res)) {
        players[username] = {...players[username], ...req.body}
        firebase.database().ref(`users/${username}`).set(players[username])
        res.status(200).send("saved.");
    }
})
 
app.post("/new", (req, res) => {
    console.log("creating new player...", req.body.name);
    let username = req.body.username;
    let password = req.body.password;
    if (players[username]) {
        res.status(403).send('Username already exists.')
    }
    else {
        firebase.database().ref('users/' + username).set({name: username, password: password, progress: 0})
        authtokens[username] = generateToken();
        res.json({authtoken: authtokens[username]});
    }
    res.end();
})

app.get('/load/:username/:authtoken', (req, res) => {
    console.log('loading', req.params['username'])
    let username = req.params['username'];
    let authtoken = req.params['authtoken'];
    console.log({...players[username], authtoken: authtokens[username]});

    if (!validateAuth(username, authtoken, res)) return;

    if (!players[username]) {
        console.log('not found.');
        res.sendStatus(404);
        return;
    }
    res.json({...players[username], authtoken: authtokens[username]});

})

app.get("/load/trail", (req, res) => {
    res.json(trail);
})
app.listen(port);

function generateToken() {
    let chars = "abcdefghijklmnopqrstuvwxyz123456789";
    // string some random numbers and letters together
    return [1, 2, 3, 4, 5, 6, 7].map(n => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// keep up to date with firebase
firebase.database().ref('users').on('child_added', (child) => {
    player = child.val();
    let playerName = player.name;
    players[playerName] = player;
    firebase.database().ref('users/' + playerName).on('value', value => {
        players[playerName] = value.val();
        console.log("loaded player: ", playerName);
    })
})

function validateAuth(username, authtoken, res) {
    if (authtoken !== authtokens[username]) {
        console.log(`got auth token ${authtoken} vs expected ${authtokens[username]}`);
        res.render('logout');
        return false;
    }
    else return true;
}