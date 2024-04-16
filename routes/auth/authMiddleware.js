const mongoose = require('mongoose');
const {userSchema} = require('../../models/auth');

const UserModel = mongoose.model('user', userSchema);

module.exports.authMiddleware = async function (req, res, next) {
    // console.log(req.query.token)
    await UserModel.findOne(
        {
          rememberToken: req.query.token,
        }).then(async function ( existsUser) {
          if (existsUser !== null) {
            return next();
          } else {
            const err = new Error("Not authorized!");
            err.status = 400;
            return next(err);
          }
        }
      )
}