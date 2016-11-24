var express = require("express");
var app = express();
var server = require("http").Server(app);
var io = require("socket.io")(server);

app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/assets"));
//app.use(express.static(__dirname + "/views"));

app.set("port", (process.env.PORT | 3000));
app.set("view engine", 'ejs');
app.set("views", __dirname + "/views");

app.get('/', function(req, res){
	res.render("pages/index.ejs");
});

server.listen(3000);
console.log("Server listening on port 3000");