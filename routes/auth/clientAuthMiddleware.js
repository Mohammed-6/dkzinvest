const mongoose = require("mongoose");
const { customerSchema } = require("../../models/customer");

const CustomerModel = mongoose.model("customer", customerSchema);

module.exports.clientAuthMiddleware = async function (req, res, next) {
  // console.log(req.query.token)
  await CustomerModel.findOne({
    rememberToken: req.query.token,
  }).then(async function (existsUser) {
    if (existsUser !== null) {
      return next();
    } else {
      const err = new Error("Not authorized!");
      err.status = 400;
      return next(err);
    }
  });
};
