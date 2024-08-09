const express = require("express");
const mongoose = require("mongoose");
const { userSchema } = require("../../models/auth");
const bcrypt = require("bcrypt");

const userRouter = express.Router();
const { secirutygroupSchema, SGModel } = require("../../models/secirutygroup");
const SecurityGroupModel = mongoose.model("secirutygroup", secirutygroupSchema);

const { branchSchema } = require("../../models/branch");
const BranchModel = mongoose.model("branch", branchSchema);

const { franchiseSchema } = require("../../models/franchise");
const FranchiseModel = mongoose.model("franchise", franchiseSchema);

const UserModel = mongoose.model("user", userSchema);

userRouter.get("/list-user", function (req, res) {
  UserModel.find({}).then(function (user) {
    res.send({ status: true, message: "User List", data: user });
  });
});

async function getUserCount() {
  return await UserModel.countDocuments({}).then(async (count) => {
    if (count > 0) {
      return await UserModel.findOne({})
        .sort({ newId: -1 })
        .then(function (user) {
          // console.log(user);
          return user.newId;
        });
    } else {
      return 0;
    }
  });
}

async function loadUserPrep() {
  return await SecurityGroupModel.find({})
    .select(["_id", "name"])
    .then(async function (sg) {
      return await BranchModel.find({})
        .select(["_id", "name"])
        .then(async function (br) {
          return await FranchiseModel.find({})
            .select(["_id", "name"])
            .then(async function (fr) {
              return { sg: sg, br: br, fr: fr };
            });
        });
    });
}

userRouter.get("/load-user-props", async function (req, res) {
  await loadUserPrep().then(function (preUser) {
    res.send({ status: true, message: "User schema", data: preUser });
  });
});

userRouter.post("/create-user", async function (req, res) {
  let colte = req.body;

  colte.referralCode = "AGT" + makeid(6).toUpperCase();
  getUserCount().then(function (userCount) {
    console.log(userCount);
    if (userCount === 0) {
      colte.newId = 1;
    } else {
      colte.newId = userCount + 1;
    }
  });

  await bcrypt.hash(colte.password, 10).then(async function (hash) {
    // Store hash in your password DB.
    colte.password = hash;
    delete colte._id;
    await UserModel.countDocuments({
      email: req.body.email,
      phone: req.body.phone,
    }).then((count) => {
      if (count !== 0) {
        res.send({ status: false, message: "User already exists" });
      } else {
        UserModel.create(colte)
          .then((user) => {
            res.send({ status: true, message: "User created successfully" });
          })
          .catch((error) => {
            res.send({
              status: false,
              message: "Error",
              data: error,
              dd: colte,
            });
          });
      }
    });
  });
});

userRouter.post("/edit-user", async function (req, res) {
  await UserModel.countDocuments({ _id: req.body._id }).then((count) => {
    if (count === 0) {
      res.send({ status: false, message: "User not found" });
    } else {
      UserModel.findOne({ _id: req.body._id }).then((user) => {
        const colte = user;
        colte.password = "";
        res.send({ status: true, message: "User find", data: colte });
      });
    }
  });
});

userRouter.post("/update-user", async function (req, res) {
  await UserModel.countDocuments({ _id: req.body._id }).then(async (count) => {
    if (count === 0) {
      res.send({ status: false, message: "User not found" });
    } else {
      const alldata = req.body;
      await bcrypt.hash(alldata.password, 10).then(function (hash) {
        // Store hash in your password DB.
        if (alldata.password !== undefined && alldata.password !== "") {
          alldata.password = hash;
        } else {
          delete alldata.password;
        }
      });
      UserModel.findOneAndUpdate({ _id: req.body._id }, alldata).then(
        (user) => {
          res.send({ status: true, message: "User updated successfully" });
        }
      );
    }
  });
});

userRouter.post("/delete-user", async function (req, res) {
  await UserModel.countDocuments({ _id: req.body._id }).then((count) => {
    if (count === 0) {
      res.send({ status: false, message: "User not found" });
    } else {
      UserModel.findOneAndDelete({ _id: req.body._id }).then((user) => {
        res.send({ status: true, message: "User deleted successfully" });
      });
    }
  });
});

userRouter.post("/change-password", async function (req, res) {
  await UserModel.findOne({ rememberToken: req.query.token })
    .then(async (count) => {
      const alldata = req.body;

      await UserModel.findOne({
        _id: count._id,
      }).then(async function (existsUser) {
        // console.log(req.body.password, existsUser.password);
        if (existsUser !== null) {
          await bcrypt
            .compare(req.body.oldpassword, existsUser.password)
            .then(async function (result) {
              // console.log(result);
              if (result) {
                if (req.body.password === req.body.conpassword) {
                  await bcrypt.hash(alldata.password, 10).then(function (hash) {
                    // Store hash in your password DB.
                    if (
                      alldata.password !== undefined &&
                      alldata.password !== ""
                    ) {
                      alldata.password = hash;
                    }
                  });
                  UserModel.findByIdAndUpdate(existsUser._id, {
                    password: alldata.password,
                  }).then(function (mdata) {
                    res.send({
                      status: true,
                      message: "Password Changed Successfully",
                    });
                  });
                } else {
                  res.send({
                    status: false,
                    message: "Both password doesn't match!",
                  });
                }
              } else {
                res.send({
                  status: false,
                  message: "Password Incorrect!",
                });
              }
            });
        } else {
          res.send({
            status: false,
            message: "Password Incorrect",
          });
        }
      });
    })
    .catch(function (err) {
      res.send({ status: false, message: "User not found" });
    });
});

module.exports = userRouter;
