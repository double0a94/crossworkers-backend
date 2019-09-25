/**
 * 1) HR Assistant is responsible for adding, editing and deleting benefits.
 * 2) Employee can Search for company's benfits (GET ALL)
 */

const routes = require("express").Router();
const Benefit = require("../models/Benefit");
var ObjectId = require("mongoose").Types.ObjectId;

/**
 *  Get all benefits
 */
routes.get("/all", (req, res) => {
  if (req.user) {
    Benefit.find({})
      .lean()
      .exec((err, benefits) => {
        if (err) {
          res.status(404).json({ message: "Error getting benefits" });
        } else {
          // Note: returned benefits will be in form of array
          if (benefits && benefits.length > 0) {
            res.contentType("json");
            res.status(200).json({
              message: "Successfully retrieved all the benefits",
              data: benefits
            });
          } else {
            res.status(200).json({
              message: "No benefits found",
              data: []
            });
          }
        }
      });
  } else {
    res.status(403).send({
      message: "You must be logged in"
    });
  }
});

/**
 *  Save a new benefit
 */
routes.post("/save", (req, res) => {
  if (req.user) {
    if (req.user.role == "hr-assisstant") {
      let newBenefit = req.body;
      console.log(newBenefit);
      req
        .assert("benefitType", "please fill up the Benefit Type field")
        .not()
        .isEmpty();

      req
        .assert("benefitName", "please fill up the Benefit Name field")
        .not()
        .isEmpty();

      const errors = req.validationErrors();

      if (errors) {
        //req.flash('errors', errors);
        return res.status(422).json({ message: errors });
      }

      if (newBenefit) {
        const benefit = new Benefit(newBenefit);
        benefit.userId = req.user._id;
        benefit.username = req.user.username;

        benefit.save(err => {
          if (err) {
            console.log(err);
            if (err.code == "11000") {
              res.status(422).json({ message: "Benefit id already exists!! " });
            } else {
              res.status(404).json({ message: "Error saving benefit" });
            }
          } else {
            res.status(200).json({
              message: "Benefit Saved Successfully",
              data: { id: benefit._id.toString() }
            });
          }
        });
      } else {
        res.status(422).send({
          message: "no benefit data were sent"
        });
      }
    } else {
      res.status(401).send({
        message: "Unauthorized access to this api"
      });
    }
  } else {
    res.status(403).send({
      message: "You must be logged in"
    });
  }
});

/**
 *  Update an existing benefit (benefit's text, image or isPublished)
 * todo add role checker
 */
routes.put("/edit/:benefitId", (req, res) => {
  let editedBenefit = req.body;

  if (req.user) {
    if (req.user.role == "hr-assisstant") {
      if (editedBenefit) {
        console.log(editedBenefit);
        Benefit.updateOne(
          { _id: ObjectId(req.params.benefitId) },
          editedBenefit,
          (err, result) => {
            if (err) {
              res.status(404).send({
                message:
                  "An error occured updating the benefit please try again"
              });
            } else if (result.nModified == 0) {
              res.status(404).send({
                message: "No benefit have been updated"
              });
            } else {
              //
              res.status(200).send({ message: "Benefit Updated Successfully" });
            }
          }
        );
      } else {
        res.status(404).send({
          message: "no Benefit data were sent"
        });
      }
    } else {
      res.status(401).send({
        message: "Unauthorized access to this api"
      });
    }
  } else {
    res.status(403).send({
      message: "You must be logged in"
    });
  }
});

/**
 * Delete one benefit
 * to do add role checker
 */
routes.delete("/delete/:benefitId", (req, res) => {
  if (req.user) {
    if (req.user.role == "hr-assisstant") {
      Benefit.deleteOne(
        { _id: ObjectId(req.params.benefitId) },
        (err, result) => {
          if (err) {
            res.status(404).send({
              message: "An error occured deleting the benefit please try again"
            });
          } else if (result.deletedCount == 0) {
            res.status(404).send({
              message: "No benefit have been deleted"
            });
          } else {
            // Successfully Deleted
            res.status(200).send({ message: "Benefit Deleted Successfully" });
          }
        }
      );
    } else {
      res.status(401).send({
        message: "Unauthorized access to this api"
      });
    }
  } else {
    res.status(403).send({
      message: "You must be logged in"
    });
  }
});

module.exports = routes;
