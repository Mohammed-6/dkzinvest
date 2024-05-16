const express = require("express");
const mongoose = require("mongoose");
const { customerSchema, numCount } = require("../../models/customer");
const {
  agentRequestForm,
  planSchema,
  investmentSchema,
  orderSchema,
  transactionSchema,
} = require("../../models/investment");
const bcrypt = require("bcrypt");

const dashboardRoute = express.Router();

const { userSchema } = require("../../models/auth");
const { attachmentSchema } = require("../../models/customer");

const PlanModel = mongoose.model("plan", planSchema);
const UserModel = mongoose.model("user", userSchema);
const CustomerModel = mongoose.model("customer", customerSchema);
const InvestmentModel = mongoose.model("investment", investmentSchema);
const OrderModel = mongoose.model("order", orderSchema);
const TransactionModel = mongoose.model("transaction", transactionSchema);

const Razorpay = require("razorpay");
var instance = new Razorpay({
  key_id: "rzp_test_s7rXzSSkEG43th",
  key_secret: "s1jHaXqUDzoUqfZVHNnm9zbX",
});

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

dashboardRoute.get("/dashboard", async function (req, res) {
  PlanModel.find()
    .populate({ path: "banner", select: ["path"] })
    .then(async (response) => {
      res.send({ status: true, message: "Plan List", data: response });
    });
});

dashboardRoute.post("/investNow", async (req, res) => {
  CustomerModel.findOne({ rememberToken: req.query.token })
    .select(["firstName", "lastName", "email", "phone", "_id"])
    .then(async (detail) => {
      const receipt = "order_rcptid_" + Date.now();
      var options = {
        amount: req.body.amount * 100, // amount in the smallest currency unit
        currency: "INR",
        receipt: receipt,
      };
      instance.orders.create(options, async function (err, order) {
        const order1 = {
          clientId: detail._id,
          planId: req.body.planId,
          amount: req.body.amount, // amount in the smallest currency unit
          currency: "INR",
          orderId: order.id,
        };
        await OrderModel.create(order1).then(function () {
          res.send({
            type: "success",
            data: order,
            amount: req.body.amount,
            detail: detail,
          });
        });
      });
    });
});

async function createTransaction(req) {
  const colte = req;
  //   colte.txnId = makeid(15);

  return await TransactionModel.countDocuments({}).then(async function (count) {
    colte.txnNo = count + 1;
    if (count == 0 && colte.balance == 0) {
      // colte.balance = req.amount;
    } else {
      await TransactionModel.findOne({ clientId: req.clientId })
        .sort({ created_at: -1 })
        .then(async function (trans) {
          colte.maturityDate = new Date(
            new Date().setFullYear(new Date().getFullYear() + 1)
          );
          //   colte.branch = trans.branch;
          //   colte.balance = req.balance;
          //   colte.balance = req.amount;
        });
    }
    return await TransactionModel.create(colte);
  });
}

dashboardRoute.post("/confirmOrder", async (req, res) => {
  await OrderModel.findOne({ orderId: req.body.razorpay_order_id }).then(
    async (detail) => {
      //   console.log(detail);
      await InvestmentModel.countDocuments({ _id: detail.clientId }).then(
        async function (count) {
          if (count === 0) {
            const colte = {
              clientId: detail.clientId,
              planId: detail.planId,
              txnNo: "",
              txnId: req.body.razorpay_order_id,
              particular: "Money invested",
              type: "credit",
              currencyId: "661cd090064cc0d478b47b77",
              amount: detail.amount,
              balance: detail.amount,
              description: "Money invested",
              modeOfPayment: "Online",
              maturityDate: "",
              branch: "661118deadf383b5266eeaf5",
              invested: true,
              reInvest: false,
            };
            // console.log(colte);
            createTransaction(colte).then(async function (result) {
              await TransactionModel.findOne({ txnId: result.txnId })
                .populate({ path: "currencyId", select: "currencyCode" })
                .populate({ path: "clientId", select: "currentPlan" })
                .populate({ path: "planId", select: "percentage" })
                .sort({ created_at: -1 })
                .then(async function (trans) {
                  const colte = {
                    investmentId: makeid(16),
                    transRefId: trans._id,
                    customerId: trans.clientId._id,
                    planId: detail.planId,
                    currencyId: trans.currencyId._id,
                    investmentAmount: trans.amount,
                    investmentCurrency: trans.currencyId.currencyCode,
                    totalAmountInvested: trans.balance,
                    percentOfAmountTarget: trans.planId.percentage,
                  };
                  await InvestmentModel.create(colte).then(async () => {
                    res.send({
                      status: true,
                      message: "Investment successfull",
                      data: colte,
                    });
                  });
                });
            });
          } else {
          }
        }
      );
    }
  );
});
module.exports = dashboardRoute;
