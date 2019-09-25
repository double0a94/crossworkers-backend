/**
 *   HR assisstants are responsible for all employees CRUD operations
 *
 */

const routes = require("express").Router();
const User = require("../models/User");
var ObjectId = require("mongoose").Types.ObjectId;

/**
 * GET /get-employee/{id}
 * get an Employee with ID.
 */
routes.get("/get-employee/:employeeId", (req, res) => {
  if (req.user) {
    if (req.user.role == "hr-assisstant") {
      User.findOne({ _id: ObjectId(req.params.employeeId) }, (err, doc) => {
        if (err) {
          res.status(404).json({ message: "Error finding the employee" });
        }

        if (doc) {
          res.contentType("json");
          res.status(200).json({
            message: "Successfully retrieved the user's articles",
            data: doc
          });
        }
      });
    } else {
      // The user is not an hr assisstant
      return res.status(401).json({ message: ["UnAuthorized access"] });
    }
  }
});

/**
 * PUT /edit-employee/{id}
 * edit an Employee personal data with ID.
 */
routes.put("/edit-employee/:employeeId", (req, res) => {
  if (req.user) {
    if (req.user.role == "hr-assisstant") {
      if (req.body) {
        User.findOneAndUpdate(
          { _id: ObjectId(req.params.employeeId) },
          req.body,
          (err, doc) => {
            if (err) {
              console.log(err);
              res.status(404).json({ message: "Error updating the employee" });
            }

            if (doc) {
              res.contentType("json");
              res.status(200).json({
                message: "Successfully Edited the employee's data"
              });
            }
          }
        );
      } else {
        return res
          .status(422)
          .json({ message: "Worng Employee data were sent" });
      }
    } else {
      // The user is not an hr assisstant
      return res.status(401).json({ message: "An unauthorized user" });
    }
  }
});

/**
 * DELETE /remove-employee/{id}
 * remove an Employee personal data with ID.
 */
routes.delete("/remove-employee/:employeeId", (req, res) => {
  if (req.user) {
    if (req.user.role == "hr-assisstant") {
      User.deleteOne({ _id: ObjectId(req.params.employeeId) }, (err, doc) => {
        if (err) {
          res.status(404).send({
            message: "An error occured removing the employee please try again"
          });
        } else if (doc.deletedCount == 0) {
          res.status(404).send({
            message: "No employee have been removed !!"
          });
        } else {
          // Successfully Deleted
          res.status(200).send({ message: "Employee Removed Successfully" });
        }
      });
    } else {
      // The user is not an hr assisstant
      return res.status(401).json({ message: ["UnAuthorized access"] });
    }
  }
});

/**
 * POST /add-employee
 * Add a new Employee account.
 */
routes.post("/add-employee", (req, res, next) => {
  if (req.user) {
    if (req.user.role == "hr-assisstant") {
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

      req
        .assert("manager", "please fill up the username field")
        .not()
        .isEmpty();

      req
        .assert("department", "please fill up the username field")
        .not()
        .isEmpty();

      req
        .assert("password", "Password must be at least 4 characters long")
        .len(4);
      req
        .assert("confirmPassword", "Passwords do not match")
        .equals(req.body.password);

      req.sanitize("email").normalizeEmail({ gmail_remove_dots: false });

      const errors = req.validationErrors();

      if (errors) {
        //req.flash('errors', errors);
        return res.status(422).json({ message: errors });
      }

      // Get the Body Paramter and save it in Mongoose Schema Object
      const sentUser = req.body;
      const { email, password, username, department, manager } = sentUser;

      const user = new User({
        email,
        password,
        username,
        department,
        manager,
        role: "employee"
      });

      // let's check if the user have an account with this email
      User.findOne({ email: req.body.email }, (err, existingUser) => {
        if (err) {
          return next(err);
        }
        // Check if existing user
        if (existingUser) {
          return res
            .status(409)
            .json({ message: [{ msg: "Employee email already Exists" }] });
        }

        // Save a new user
        user.save(err => {
          if (err) {
            return next(err);
          }

          // return success message
          res.status(200).json({ messsage: "Employee Added Successfully" });
        });
      });
    } else {
      // The user is not an hr assisstant
      return res.status(401).json({ message: ["UnAuthorized access"] });
    }
  }
});
module.exports = routes;
