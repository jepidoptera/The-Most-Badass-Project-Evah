const express = require('express');
const app = express();
require('dotenv').config();
// const trail = require('trail');

const port = process.env.PORT || 8080;
// const apiKey = process.env.APIKEY || "no_api_key";

// Serve static files
app.use(express.static(__dirname + '/public'));

// use handlebars
// var exphbs = require("express-handlebars");
// app.engine(".hbs", exphbs({
//     defaultLayout: "main",
//     extname: ".hbs",
//     helpers: {
//     // capitalize words on request
//         'Capitalize': function(string)
//         {
//             return string.charAt(0).toUpperCase() + string.slice(1);
//         }
//     }
// }));

// app.set("view engine", ".hbs");

// Serve app
console.log('Listening on: http://localhost:' + port);

app.get ("/", (req, res) => {
    res.sendFile("index");
})

app.listen(port);
