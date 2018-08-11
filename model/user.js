const mongoose = require("mongoose");
var bcrypt = require("bcryptjs");
mongoose
  .connect(
    "mongodb://localhost:27017/nodeauth",
    { useNewUrlParser: true }
  )
  .then(() => {
    console.log("connected to mongodb");
  })
  .catch(err => {
    console.log(err.message);
  });

//define schema

var userSchema = mongoose.Schema({
  username: {
    type: String,
    index: true
  },
  password: {
    type: String
  },
  email: {
    type: String
  },
  profileimage: {
    type: String
  },
  isactive: {
    type: Boolean,
    default: false
  }
});

var User = (module.exports = mongoose.model("user", userSchema, "users"));

// module.exports.getUserById = function(id, cb) {
//   User.findById(id, cb);
// };

// module.exports.getUserByUsername = function(username, cb) {
//   var query = {
//     username: username
//   };
//   User.findOne(query, cb);
// };

// module.exports.comparePassword = function(password, hash, cb) {
//   bcrypt.compare(password, hash, function(err, isMatch) {
//     cb(null, isMatch);
//   });
// };

// getUserByUsername, 用username來找使用者
module.exports.getUserByUsername = function(username, callback) {
  var query = { username: username };
  User.findOne(query, callback);
};

// getUserById, 用id來找使用者
module.exports.getUserById = function(id, callback) {
  User.findById(id, callback);
};

// comparePassword, 當使用者登入的時候我們要比對登入密碼跟我們資料庫密碼相同
module.exports.comparePassword = function(candidatePassword, hash, callback) {
  bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    if (err) throw err;
    callback(null, isMatch);
  });
};

module.exports.createUser = function(newUser, cb) {
  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(newUser.password, salt, function(err, hash) {
      newUser.password = hash;
      newUser.save(cb);
    });
  });
};
