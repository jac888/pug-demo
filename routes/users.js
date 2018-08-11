var express = require("express");
var bodyParser = require("body-parser");
var urlencodedParser = bodyParser.urlencoded({ extended: true });
var router = express.Router();
var User = require("../model/user");
var multer = require("multer");
var upload = multer({ dest: "./uploads" });
var passport = require("passport"),
  LocalStrategy = require("passport-local").Strategy;
/* GET users listing. */
router.get("/", function(req, res, next) {
  res.send("respond with a resource");
});

router.get("/register", function(req, res, next) {
  res.render("register", { title: "註冊" });
});

// ...rest of the initial code omitted for simplicity.
const { check, validationResult } = require("express-validator/check");
var fileNotUpped = true;
// 使用硬盘存储模式设置存放接收到的文件的路径以及文件名
var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    // 接收到文件后输出的保存路径（若不存在则需要创建）
    cb(null, "upload/");
  },
  filename: function(req, file, cb) {
    // 将保存文件名设置为 时间戳 + 文件原始名，比如 151342376785-123.jpg
    cb(null, Date.now() + "-" + file.originalname);
  }
});

router.post(
  "/register",
  upload.single("profileimage"),
  (req, res, next) => {
    if (req.file) {
      fileNotUpped = false;
      image = req.file;
      console.log(req.file.originalname);
    }
    next();
  },
  [
    check("username", "帳號不能為空！")
      .not()
      .isEmpty(),
    check("email", "電子郵件不能為空！")
      .not()
      .isEmpty(),
    check("password", "密碼不能為空！")
      .not()
      .isEmpty()
      .custom((value, { req, loc, path }) => {
        // console.log("loc: " + loc);
        // console.log("path: " + path);
        // console.log("value: " + value);
        console.log("password : " + value);
        console.log("password2 : " + req.body.password2);
        if (value !== req.body.password2) {
          throw new Error("您輸入的兩組密碼不相同！");
        } else {
          return value;
        }
      }),
    check("password2", "確認密碼不能為空！")
      .not()
      .isEmpty()
  ],
  (req, res, next) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    //console.log(errors.isEmpty().toString());
    const arr = [];
    if (!errors.isEmpty()) {
      console.log("有錯誤! ： ");
      errors.array().forEach(error => {
        //console.log(error.msg);
        arr.push(error.msg);
      });
      //if (fileNotUpped) arr.push("檔案必須上傳");
      res.render("register", {
        errors: arr
      });
    } else {
      var newUser = new User({
        username: req.body.username,
        password: req.body.password,
        email: req.body.email
      });

      if (!fileNotUpped) newUser.profileimage = profileimage;

      User.createUser(newUser, (err, user) => {
        if (err) throw err;
        console.log(user);
      });

      req.flash("success", "註冊成功！請至登入頁面進行登入！");
      res.location("/");
      res.redirect("/");
    }
  }
);

router.get("/memberArea", function(req, res, next) {
  res.render("memberArea", { title: "會員專區" });
});

router.get("/login", function(req, res, next) {
  res.render("login", { title: "登入" });
});

passport.use(
  new LocalStrategy(function(username, password, done) {
    User.getUserByUsername(username, function(err, user) {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, { message: "使用者或密碼錯誤" });
      }
      User.comparePassword(password, user.password, function(err, isMatch) {
        if (err) throw err;
        if (isMatch) {
          return done(null, user);
        } else {
          return done(null, false, { message: "密碼錯誤！" });
        }
      });
    });
  })
);

router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/users/login",
    failureFlash: true
  }),
  (req, res, next) => {
    if (!req.user.isactive) {
      req.flash(
        "success",
        "您尚未認證您的電子信箱，請至您的郵箱查詢認證信並認證！"
      );
      req.logout();
      res.redirect("/users/login");
    } else {
      res.redirect("/users/memberArea");
    }
  }
);

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

module.exports = router;
