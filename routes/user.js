/**
 * Contains the main user managment functions (login, hr-assistant register ,logout)
 */

const { promisify } = require("util");
const crypto = require("crypto");
const passport = require("passport");
const routes = require("express").Router();
const User = require("../models/User");

const randomBytesAsync = promisify(crypto.randomBytes);

/**
 * POST /login
 * Sign in using email and password.
 */
routes.post("/login", (req, res, next) => {
  req.assert("email", "Email field cannot be blank").notEmpty();
  req.assert("email", "Email is not valid").isEmail();
  req.assert("password", "Password field cannot be blank").notEmpty();

  const errors = req.validationErrors();

  // return validation errors
  if (errors) {
    return res.status(401).json({ message: errors });
  }

  // Removes dots from the local part of the email address, as GMail ignores them
  req.sanitize("email").normalizeEmail({ gmail_remove_dots: true });

  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      // Keep the same error format as express validator for easier error handeling in the native app
      return res.status(401).json({ message: [{ msg: "Wrong Credentials" }] });
    }

    // User found generate authToken and login
    user.token = user.generateAuthToken();

    req.logIn(user, err => {
      if (err) {
        return next(err);
      }
      return res.status(200).json({ user: user.toAuthJSON() });
    });
  })(req, res, next);
});

/**
 * GET /logout
 * Log out.
 */
routes.get("logout", (req, res) => {
  req.logout();
  req.session.destroy(err => {
    if (err)
      console.log("Error : Failed to destroy the session during logout.", err);
    req.user = null;
    res.status(200).json({ message: [{ msg: "logged out successfully" }] });
  });
});

/**
 * POST /signup
 * Create a new local account.
 */
routes.post("/signup", (req, res, next) => {
  // validators
  req.assert("email", "Email is not valid").isEmail();

  req
    .assert("email", "please fill up the email field")
    .not()
    .isEmpty();

  req
    .assert("username", "please fill up the username field")
    .not()
    .isEmpty();

  req.assert("password", "Password must be at least 4 characters long").len(4);
  req
    .assert("confirmPassword", "Passwords do not match")
    .equals(req.body.password);

  req
    .assert(
      "hrAssisstantCode",
      "Wrong HR Assisstant secret code, please ask the manager for the right code"
    )
    .equals(process.env.hr_assisstant_code);

  req.sanitize("email").normalizeEmail({ gmail_remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    //req.flash('errors', errors);
    return res.status(401).json({ message: errors });
  }

  const user = new User({
    email: req.body.email,
    password: req.body.password,
    username: req.body.username,
    role: "hr-assisstant"
  });

  // let's check if the user have an account with this email
  User.findOne({ email: req.body.email }, (err, existingUser) => {
    if (err) {
      return next(err);
    }
    // Check if existing user
    if (existingUser) {
      return res
        .status(500)
        .json({ message: [{ msg: "User email already Exists" }] });
    }

    // Save a new user
    user.save(err => {
      if (err) {
        return next(err);
      }

      // return success message
      res.status(200).json({ messsage: "Signed up Successfully" });
    });
  });
});
module.exports = routes;
