const express = require("express");
const mongoose = require("mongoose");
const { secirutygroupSchema, SGModel } = require("../../models/secirutygroup");

const securityGroupRouter = express.Router();

const SecurityGroupModel = mongoose.model("secirutygroup", secirutygroupSchema);

securityGroupRouter.get("/list-security-group", function (req, res) {
  SecurityGroupModel.find({})
    .select(["name", "code", "_id"])
    .then(function (SG) {
      res.send({ status: true, message: "Security group List", data: SG });
    });
});

securityGroupRouter.get("/load-security-group-schema", function (req, res) {
  res.send({ status: true, message: "Security group schema", data: SGModel });
});

securityGroupRouter.post("/create-security-group", async function (req, res) {
  let colte = req.body;
  delete colte._id;
  await SecurityGroupModel.countDocuments({
    code: req.body.code,
    name: req.body.name,
  }).then((count) => {
    if (count !== 0) {
      res.send({ status: false, message: "Security group already exists" });
    } else {
      SecurityGroupModel.create(colte)
        .then((SG) => {
          res.send({
            status: true,
            message: "Security group created successfully",
          });
        })
        .catch((error) => {
          res.send({ status: false, message: "Error", data: error });
        });
    }
  });
});

securityGroupRouter.post("/edit-security-group", async function (req, res) {
  await SecurityGroupModel.countDocuments({ _id: req.body._id }).then(
    (count) => {
      if (count === 0) {
        res.send({ status: false, message: "Security group not found" });
      } else {
        SecurityGroupModel.findOne({ _id: req.body._id }).then((SG) => {
          res.send({
            status: true,
            message: "Security group find",
            data: SG,
          });
        });
      }
    }
  );
});

securityGroupRouter.post("/update-security-group", async function (req, res) {
  await SecurityGroupModel.countDocuments({ _id: req.body._id }).then(
    async (count) => {
      if (count === 0) {
        res.send({ status: false, message: "Security group not found" });
      } else {
        SecurityGroupModel.findOneAndUpdate(
          { _id: req.body._id },
          req.body
        ).then((SG) => {
          res.send({
            status: true,
            message: "Security group updated successfully",
          });
        });
      }
    }
  );
});

securityGroupRouter.post("/delete-security-group", async function (req, res) {
  await SecurityGroupModel.countDocuments({ _id: req.body._id }).then(
    (count) => {
      if (count === 0) {
        res.send({ status: false, message: "Security group not found" });
      } else {
        SecurityGroupModel.findOneAndDelete({ _id: req.body._id }).then(
          (SG) => {
            SecurityGroupModel.find({})
              .select(["name", "code", "_id"])
              .then(function (SG) {
                res.send({
                  status: true,
                  message: "Security group deleted successfully",
                  data: SG,
                });
              });
          }
        );
      }
    }
  );
});

module.exports = securityGroupRouter;
