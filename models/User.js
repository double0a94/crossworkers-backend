const bcrypt = require("bcrypt");
const crypto = require("crypto");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true },
    username: String,
    password: String,
    passwordResetToken: String,
    passwordResetExpires: Date,
    tokens: Array,
    manager: {
      type: String,
      required: function() {
        return this.role == "employee" ? true : false;
      }
    },
    department: {
      type: String,
      required: function() {
        return this.role == "employee" ? true : false;
      }
    },
    role: String
  },
  { timestamps: true }
);

/**
 * Password hash middleware.
 */
userSchema.pre("save", function save(next) {
  const user = this;
  if (!user.isModified("password")) {
    return next();
  }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      return next(err);
    }
    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) {
        return next(err);
      }
      user.password = hash;
      next();
    });
  });
});

/**
 * Helper method for validating user's password.
 */
userSchema.methods.comparePassword = function comparePassword(
  candidatePassword,
  cb
) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    cb(err, isMatch);
  });
};

/**
 *  Generating an authToken with jwt
 */
userSchema.methods.generateAuthToken = function() {
  const token = jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      role: this.role
    },
    process.env.JWT_SECRET, //get the private key from the config file -> environment variable
    {
      expiresIn: "7d" // expires in 1 week
    }
  );
  return token;
};

/**
 *  Getting a token
 */
userSchema.methods.toAuthJSON = function() {
  return {
    _id: this._id,
    email: this.email,
    username: this.username,
    token: this.generateAuthToken(),
    role: this.role
  };
};

const User = mongoose.model("User", userSchema);

module.exports = User;
