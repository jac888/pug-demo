var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var logger = require("morgan");
var favicon = require("serve-favicon");
const { body } = require("express-validator/check");
const { sanitizeBody } = require("express-validator/filter");
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var session = require("express-session");
var passport = require("passport");
var localStrategy = require("passport-local").Strategy;
var multer = require("multer");
var upload = multer({ dest: "./uploads" });
var connectFlash = require("connect-flash");
var mongodb = require("mongodb");
var mongoose = require("mongoose");
var bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
var app = express();

//socket io web socket
let users = [];
let connections = [];

app.use(express.static("public"));

//site favicon
app.use(favicon(path.join(__dirname, "public", "favicon.ico")));
// view engine setup with pug
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// handle sessions
app.use(
  session({
    secret: "secret",
    saveUninitialized: true,
    resave: true
  })
);

// passport
app.use(passport.initialize());
app.use(passport.session());

// validator changed usage...
// var ExpressValidator = require("express-validator");
// app.use(ExpressValidator);

// express-messages
app.use(require("connect-flash")());
app.use(function(req, res, next) {
  res.locals.messages = require("express-messages")(req, res);
  next();
});

//create global variable * means anypge
app.get("*", (req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/", indexRouter);
app.use("/users", usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

//avoid favicon.ico reloading....
// app.get("/favicon.ico", (req, res) => res.status(204));

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  //res.status(err.status || 500);
  //res.render("error");
});

app.set("port", process.env.PORT || 2000);
var server = app.listen(app.get("port"), function() {
  console.log("Express server listening on port " + server.address().port);
});
var io = require("socket.io")(server);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/");
});

io.sockets.on("connection", socket => {
  connections.push(socket);
  console.log(`connected : ${connections.length} sockets connected`);
  socket.on("send-nickname", function(nickname) {
    socket.nickname = nickname;
    users.push(socket.nickname);
    console.log(users);
  });

  //show how many socket left
  socket.on("disconnect", data => {
    console.log(data);
    connections.splice(connections.indexOf(socket), 1);
    console.log("disconnected : name :" + socket.username);
    users.splice(users.indexOf(socket.username), 1);
    updateUsernames();
    console.log(`Disconnected : ${connections.length} sockets connected`);
  });

  //send message
  socket.on("send message", (user, message) => {
    console.log(`data : ${message}`);
    console.log("username 2 : " + user);
    io.sockets.emit("new message", { msg: message, user: user });
  });

  //new user
  socket.on("new user", (data, cb) => {
    console.log(`new user : ${data}`);
    if (users.indexOf(data) >= 0) return cb(false);
    cb(true);
    //socket.username = data;
    users.push(data);
    socket.username = data;
    updateUsernames();
  });

  function updateUsernames() {
    io.sockets.emit("get users", users);
  }
});
const api = express();
api.get("/api", (req, res) => {
  res.json({
    message: "welcome to api!"
  });
});

api.post("/api/posts", verifyToken, (req, res) => {
  jwt.verify(req.token, "secret", (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      res.json({
        message: "welcome to posts!",
        authData
      });
    }
  });
});

api.post("/api/login", (req, res) => {
  const user = {
    id: 1,
    name: "jackson",
    email: "tekken1234@hotmail.com"
  };
  jwt.sign({ user: user }, "secret", { expiresIn: "30s" }, (err, token) => {
    res.json({ token: token });
  });
});

api.listen("5000", () => {
  console.log("api server starts");
});

//format token
//Authorization: Bearer <access_token>

//verfify token
function verifyToken(req, res, next) {
  //get auth header value
  const bearerHeader = req.headers["authorization"];
  //check bearer is undefined
  if (typeof bearerHeader !== "undefined") {
    //split with space
    const bearer = bearerHeader.split(" ");
    //get token from array
    console.log(bearer[0]);
    console.log(bearer[1]);
    const token = bearer[1];
    req.token = token;
    next();
  } else res.sendStatus(403);
}

module.exports = app;
