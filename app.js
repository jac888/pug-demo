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
var app = express();

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

module.exports = app;
