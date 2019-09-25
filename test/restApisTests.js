var assert = require("assert");
let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../app");
const User = require("../models/User");

let should = chai.should();
chai.use(chaiHttp);

/**
 * User Tests
 */
describe("Add Employees", () => {
  describe("HR assisstant can be the only one to add new employee", () => {
    it("HR assisstant should be able to add", done => {
      // Login first with hr assistant account to get access token
      chai
        .request(server)
        .post("/user/login")
        .send({
          email: "ahmedashraf@gmail.com",
          password: "12345678"
        })
        .end((err, res) => {
          if (err) console.log(err);

          const token = res.body.user.token;
          chai
            .request(server)
            .post("/hr-assistant/add-employee/")
            .set("x-access-token", token)
            .set("Content-Type", "application/json")
            .send({
              email: "ahmedashrafTestEmployee1@gmail.com",
              username: "Ahmed2 Ashraf2",
              password: "12345678",
              confirmPassword: "12345678",
              department: "QA Testing",
              manager: "Mohamed Ashraf"
            })
            .end((err, res) => {
              if (err) console.log(err);

              res.should.have.status(200);
              done();
            });
        });
    });

    it("Employee should not be able to add new employee", done => {
      // Login first with hr assistant account to get access token
      chai
        .request(server)
        .post("/user/login")
        .send({
          email: "ahmedashraf2@gmail.com",
          password: "12345678"
        })
        .end((err, res) => {
          if (err) console.log(err);

          const token = res.body.user.token;
          chai
            .request(server)
            .post("/hr-assistant/add-employee/")
            .set("x-access-token", token)
            .set("Content-Type", "application/json")
            .send({
              email: "ahmedashrafTestEmployee2@gmail.com",
              username: "Ahmed2 Ashraf2",
              password: "12345678",
              confirmPassword: "12345678",
              department: "QA Testing",
              manager: "Mohamed Ashraf"
            })
            .end((err, res) => {
              if (err) console.log(err);

              // SHould return not authorized
              res.should.have.status(401);

              done();
            });
        });
    });
  });
});

/**
 * Edit Employees Tests
 */
describe("Edit Employees", function() {
  describe("Both HR assisstant and employees can edit the employ's data", function() {
    it("HR assistant Should be able to edit employees data", done => {
      // Login first as hr assisstant to get access token
      chai
        .request(server)
        .post("/user/login")
        .send({
          email: "ahmedashraf@gmail.com",
          password: "12345678"
        })
        .end((err, res) => {
          if (err) console.log(err);

          const token = res.body.user.token;
          // Get the test employee user
          User.findOne({ email: "ahmedashraf2@gmail.com" }, (err, doc) => {
            if (err) console.log(err);
            console.log("we got the employee id:", doc._id);
            // write an article
            chai
              .request(server)
              .put("/hr-assistant/edit-employee/" + doc._id)
              .set("x-access-token", token)
              .set("Content-Type", "application/json")
              .send({
                username: "NewUpdatedTestName",
                department: "TESTDEPARTMENT",
                manager: "ANYMANAGER"
              })
              .end((err, res) => {
                //console.log (res)
                // console.log("err",err);
                res.should.have.status(200);

                // console.log (result);
                done();
              });
          });
        });
    });

    it("Employees Should be able to edit his data", done => {
      // Login First as employee
      chai
        .request(server)
        .post("/user/login")
        .send({
          email: "ahmedashraf2@gmail.com",
          password: "12345678"
        })
        .end((err, res) => {
          if (err) console.log(err);

          const token = res.body.user.token;

          // write an article
          chai
            .request(server)
            .put("/employee/edit/" + res.body.user._id)
            .set("x-access-token", token)
            .set("Content-Type", "application/json")
            .send({
              username: "NewUpdatedTestName",
              department: "TESTDEPARTMENT",
              manager: "ANYMANAGER"
            })
            .end((err, res) => {
              //console.log (res)
              // console.log("err",err);
              // Check role
              User.findOne({ email: "ahmedashraf2@gmail.com" }, (err, doc) => {
                if (err) console.log(err);

                // check the role
                chai.expect(doc.username).to.equal("NewUpdatedTestName");
                chai.expect(doc.department).to.equal("TESTDEPARTMENT");
                chai.expect(doc.manager).to.equal("ANYMANAGER");
              });

              res.should.have.status(200);

              // console.log (result);
              done();
            });
        });
    });
  });
});

// delete test users for restart tests
// as we are not exporting the app object
// any created doc during this test can't be affected with the updates
// so deleteOne updateOne won't work here
// must be deleted manualy from the mongodb using robo3t for example
after(done => {
  // delete the employee created
  User.deleteOne(
    {
      email: "ahmedashrafTestEmployee1@gmail.com"
    },
    err => {
      if (err) console.log(err);

      // finish the test when deleting finishes
      done();
    }
  );
});
