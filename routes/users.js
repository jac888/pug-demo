var express = require("express");
var router = express.Router();

/* GET users listing. */
router.get("/", function(req, res, next) {
  res.send("respond with a resource");
});

router.get("/register", function(req, res, next) {
  res.render("register", { title: "註冊" });
});

router.get("/login", function(req, res, next) {
  res.render("login", { title: "登入" });
});

module.exports = router;
