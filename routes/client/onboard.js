const express = require("express");
const mongoose = require("mongoose");
const { customerSchema, numCount } = require("../../models/customer");
const { agentRequestForm, planSchema } = require("../../models/investment");
const bcrypt = require("bcrypt");

const onboardRoute = express.Router();

const { userSchema } = require("../../models/auth");
const { attachmentSchema } = require("../../models/customer");

const PlanModel = mongoose.model("plan", planSchema);
const UserModel = mongoose.model("user", userSchema);
const CustomerModel = mongoose.model("customer", customerSchema);
const AgentFormModel = mongoose.model("agent_form", agentRequestForm);
const NumCountModel = mongoose.model("numcount", numCount);
const UploadModel = mongoose.model("upload", attachmentSchema);

onboardRoute.get("/onboardStatus", function (req, res) {
  CustomerModel.findOne({ rememberToken: req.query.token }).then(function (
    response
  ) {
    res.send({ status: true, message: "Updated", data: response });
  });
});

onboardRoute.post("/onboardBI", function (req, res) {
  CustomerModel.findOneAndUpdate(
    { rememberToken: req.query.token },
    {
      $set: {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        motherName: req.body.motherName,
        fatherName: req.body.fatherName,
        email: req.body.email,
        dob: req.body.dob,
        gender: req.body.gender,
        qualification: req.body.qualification,
        maritalStatus: req.body.maritalStatus,
        referenceValue: req.body.referenceValue,
      },
    }
  ).then(function (response) {
    res.send({ status: true, message: "Updated" });
  });
});

onboardRoute.post("/onboardAI", function (req, res) {
  CustomerModel.findOneAndUpdate(
    { rememberToken: req.query.token },
    {
      $set: {
        aadharDetails: req.body,
      },
    }
  ).then(function (response) {
    res.send({ status: true, message: "Updated" });
  });
});

onboardRoute.post("/onboardPI", function (req, res) {
  CustomerModel.findOneAndUpdate(
    { rememberToken: req.query.token },
    {
      $set: {
        panDetails: req.body,
      },
    }
  ).then(function (response) {
    res.send({ status: true, message: "Updated" });
  });
});

onboardRoute.post("/onboardBankI", function (req, res) {
  CustomerModel.findOneAndUpdate(
    { rememberToken: req.query.token },
    {
      $set: {
        bankAccountDetails: req.body,
      },
    }
  ).then(function (response) {
    res.send({ status: true, message: "Updated" });
  });
});

onboardRoute.post("/onboardProfileI", function (req, res) {
  CustomerModel.findOneAndUpdate(
    { rememberToken: req.query.token },
    {
      $set: {
        profilePhoto: req.body,
        applicationSubmitted: true,
        applicationStatus: 0,
      },
    }
  ).then(function (response) {
    res.send({ status: true, message: "Updated" });
  });
});

module.exports = onboardRoute;
