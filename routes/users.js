var express = require("express");
var bodyParser = require("body-parser");
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var router = express.Router();

var multer = require("multer");
var upload = multer({ dest: "./uploads" });

/* GET users listing. */
router.get("/", function(req, res, next) {
  res.send("respond with a resource");
});

router.get("/register", function(req, res, next) {
  res.render("register", { title: "註冊" });
});

// ...rest of the initial code omitted for simplicity.
const { check, validationResult } = require("express-validator/check");

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
    console.log(req.file.originalname);
    console.log(req.body.username);
    console.log(req.body.password);
    next();
  },
  [
    // username must be an email
    check("username")
      .not()
      .isEmpty()
      .withMessage("username empty!"),
    // password must be at least 5 chars long
    check("password")
      .not()
      .isEmpty()
      .withMessage("password empty!")
  ],
  (req, res, next) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    console.log(errors.isEmpty().toString());
    const arr = [];
    if (!errors.isEmpty()) {
      //
      console.log("got errors!");
      errors.array().forEach(error => {
        console.log(error.msg);
        arr.push(error.msg);
      });
      res.render("register", {
        errors: arr
      });
    }
  }
);

// router.post("/register", upload.single("profileimage"), (req, res, next) => {
//   var usrname = req.body.username;
//   var email = req.body.email;
//   var pass = req.body.password;
//   var pass2 = req.body.password2;
//   var profileimage = req.body.profileimage;

//   if (validator.isEmpty(usrname)) {
//     //alert("username is empty");
//     return false;
//   }
//   if (validator.isEmpty(email)) console.log("email is empty");

//   if (validator.isEmpty(pass)) console.log("pass is empty");

//   if (validator.isEmpty(pass2)) console.log("pass2 is empty");

//   console.log("username : " + usrname);
//   console.log("email :" + email);
//   console.log("pass : " + pass);
//   console.log("cpass : " + pass2);

//   if (req.file) {
//     console.log("uploading file...");
//     var profileimage = req.file.filename;
//     console.log("uploaded file : " + profileimage);
//   } else {
//     console.log("no file!");
//     var profileimage = "noimage.png";
//     console.log("profileimage is : " + profileimage);
//   }
// });

router.get("/login", function(req, res, next) {
  res.render("login", { title: "登入" });
});

module.exports = router;
