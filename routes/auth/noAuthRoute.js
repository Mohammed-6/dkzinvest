const express = require("express");
const mongoose = require("mongoose");
const { userSchema } = require("../../models/auth");
const { customerSchema } = require("../../models/customer");
const bcrypt = require("bcrypt");
const axios = require("axios");

const noAuthRouter = express.Router();

const UserModel = mongoose.model("user", userSchema);
const CustomerModel = mongoose.model("customer", customerSchema);

function makeid(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

noAuthRouter.post("/login", async function (req, res) {
  await UserModel.findOne({
    email: req.body.email,
  }).then(async function (existsUser) {
    // console.log(req.body.passowrd, existsUser.password);
    if (existsUser !== null) {
      await bcrypt
        .compare(req.body.password, existsUser.password)
        .then(function (result) {
          console.log(result);
          if (result) {
            const token = makeid(20);
            UserModel.findByIdAndUpdate(existsUser._id, {
              rememberToken: token,
            }).then(function (mdata) {
              res.send({
                status: true,
                message: "User Login Successfully",
                token: token,
              });
            });
          } else {
            res.send({
              status: false,
              message: "Username or Password Incorrect!",
            });
          }
        });
    } else {
      res.send({
        status: false,
        message: "Username or Password Incorrect",
      });
    }
  });
});

function generateOTP(length) {
  // Define characters that can be used in the OTP
  const chars = "0123456789";
  let otp = "";
  for (let i = 0; i < length; i++) {
    // Generate a random index to select a character from chars
    const randomIndex = Math.floor(Math.random() * chars.length);
    // Append the selected character to the OTP
    otp += chars[randomIndex];
  }
  return otp;
}

noAuthRouter.post("/c1/login", async function (req, res) {
  const otp = generateOTP(6);
  // console.log(otp);
  await CustomerModel.findOne({
    phone: req.body.phone,
  }).then(async function (existsUser) {
    if (existsUser !== null) {
      CustomerModel.findOneAndUpdate(
        { phone: req.body.phone },
        { $set: { rememberToken: otp } }
      ).then(async function () {
        const smsData = {
          sender_id: "DKZINV",
          message: "168960",
          // "message":$text,
          // "messege_id": 160043,
          language: "english",
          route: "dlt",
          entity_id: "1201160714810173527",
          numbers: req.body.phone, // comma separated numbers
          variables_values: otp,
        };
        axios.post("https://www.fast2sms.com/dev/bulkV2", smsData, {
          headers: {
            accept: "*/*",
            "cache-control": "no-cache",
            "content-type": "application/json",
            authorization:
              "f9htlY0aujVGR6MQ2x5PzkNo3dTJbCqDBEp4XgiIWU7vncr1eA6jC3i01KZkqM7tETz9wrYoIh2aQdpm",
          },
        });
        res.send({
          status: true,
          message: "OTP send to mobile number",
        });
      });
    } else {
      CustomerModel.create({
        phone: req.body.phone,
        rememberToken: otp,
        referralCode: "CUS" + makeid(6).toUpperCase(),
      }).then(async function () {
        res.send({
          status: true,
          message: "OTP send to mobile number",
        });
      });
    }
  });
});

noAuthRouter.post("/c1/verifyotp", async function (req, res) {
  const otp = generateOTP(6);
  // console.log(otp);
  await CustomerModel.findOne({
    phone: req.body.phone,
    rememberToken: req.body.rememberToken,
  }).then(async function (existsUser) {
    if (existsUser !== null) {
      const token = makeid(20);
      CustomerModel.findOneAndUpdate(
        { phone: req.body.phone },
        { $set: { rememberToken: token, phoneVerified: true } }
      ).then(async function () {
        res.send({
          status: true,
          message: "OTP validated!",
          token: token,
        });
      });
    } else {
      res.send({
        status: false,
        message: "OTP not valid!",
      });
    }
  });
});

module.exports = noAuthRouter;
