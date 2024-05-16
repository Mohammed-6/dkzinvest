const express = require("express");
const mongoose = require("mongoose");
const { customerSchema } = require("../../models/customer");
const {
  planSchema,
  investmentSchema,
  orderSchema,
  transactionSchema,
} = require("../../models/investment");

const profileRoute = express.Router();

const { userSchema } = require("../../models/auth");

const PlanModel = mongoose.model("plan", planSchema);
const UserModel = mongoose.model("user", userSchema);
const CustomerModel = mongoose.model("customer", customerSchema);
const InvestmentModel = mongoose.model("investment", investmentSchema);
const OrderModel = mongoose.model("order", orderSchema);
const TransactionModel = mongoose.model("transaction", transactionSchema);

profileRoute.get("/getInvestment", async function (req, res) {
  await CustomerModel.findOne({ rememberToken: req.query.token }).then(
    async function (result) {
      await InvestmentModel.find({ customerId: result._id, status: true })
        .populate({
          path: "planId",
          select: [
            "packageName",
            "duration",
            "percentage",
            "payoutPeriod",
            "withdrawInstallment",
          ],
          populate: { path: "banner", select: ["path"] },
        })
        .select([
          "_id",
          "investmentCurrency",
          "totalAmountInvested",
          "percentOfAmountTarget",
          "investmentId",
          "investmentAmount",
          "created_at",
        ])
        .sort({ created_at: -1 })
        .then(function (inv) {
          res.send({ status: true, message: "Success List", data: inv });
        });
    }
  );
});

module.exports = profileRoute;
