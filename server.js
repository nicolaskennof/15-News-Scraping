//Dependencies
var express = require("express");
var exphbs = require("express-handlebars");
var routes = require("./controllers/scrapingController.js");

//Express Config
var app = express();
var PORT = process.env.PORT || 8080;
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(express.static("public"));

//Handlebars Config
app.engine(
  "handlebars",
  exphbs({
    defaultLayout: "main"
  })
);
app.set("view engine", "handlebars");

//Routing
app.use(routes);

//Port Listening
app.listen(PORT, function() {
    console.log("Server listening on: http://localhost:" + PORT);
})