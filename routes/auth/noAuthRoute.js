const express = require('express');
const mongoose = require('mongoose');
const {userSchema} = require('../../models/auth');
const bcrypt = require("bcrypt");

const noAuthRouter = express.Router();

const UserModel = mongoose.model('user', userSchema);

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

noAuthRouter.post('/login', async function (req, res) {

    await UserModel.findOne(
        {
          email: req.body.email,
        }).then(async function ( existsUser) {
            // console.log(req.body.passowrd, existsUser.password);
          if (existsUser !== null) {
            await bcrypt
              .compare(req.body.password, existsUser.password)
              .then(function (result) {
                  console.log(result);
                if (( result)) {
                    const token = makeid(20);
                    UserModel.findByIdAndUpdate(
                    existsUser._id, {rememberToken: token}).then(function (mdata) {
                        res.send({
                        status: true,
                        message: "User Login Successfully",
                        token: token,
                        });
                    }
                  );
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
        }
      )
});

module.exports = noAuthRouter;