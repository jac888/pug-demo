var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", ensureAuthenticated, function(req, res, next) {
  res.render("index", { title: "Express" });
  //register jquery animated page
  //res.render("test1", { title: "Express" });
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticted) {
    return next();
  } else {
    res.redirect("/users/login");
  }
}
module.exports = router;
