const express = require("express");
const mongoose = require("mongoose");
const {
  planSchema,
  transactionSchema,
  investmentSchema,
} = require("../../models/investment");
const { customerSchema } = require("../../models/customer");
const { branchSchema } = require("../../models/branch");

const reportRouter = express.Router();

const PlanModel = mongoose.model("plan", planSchema);
const TransactionModel = mongoose.model("transaction", transactionSchema);
const InvestmentModel = mongoose.model("investment", investmentSchema);
const CustomerModel = mongoose.model("customer", customerSchema);
const BranchModel = mongoose.model("branch", branchSchema);

reportRouter.get("/report-plan", async function (req, res) {
  await PlanModel.find({})
    .then(function (plans) {
      let colte = [];
      plans.map(async function (plan, i) {
        let balance = 0;
        let cusCount = 0;
        await CustomerModel.find({ currentPlan: plan._id }).then(
          async function (cus) {
            cus.map(async (cc, x) => {
              await TransactionModel.findOne({ clientId: cc._id })
                .sort({ created_at: -1 })
                .then(async function (trans) {
                  balance += trans.balance;
                  cusCount += 1;
                });
              const bb = {
                planId: plan._id,
                planName: plan.packageName,
                balance: balance,
                customerCount: cusCount,
              };
              colte.push(bb);
              if (x === cus.length - 1) {
                res.send({ status: true, message: "Plan count", data: colte });
              }
            });
          }
        );
      });
    })
    .catch(function (err) {
      res.send({ status: false, message: "Error", data: err });
    });
});

reportRouter.post("/plan-wise-users", async function (req, res) {
  let colte = [];
  let packagee = "";
  await CustomerModel.find({ currentPlan: req.body.currentPlan })
    .populate({ path: "franchise", select: "name" })
    .populate({ path: "branch", select: "name" })
    .populate({ path: "currentPlan", select: "packageName" })
    .populate({ path: "createdBy", select: "name" })
    .sort({ updated_at: -1 })
    .exec()
    .then(async (result) => {
      // console.log(result);
      result.map(async (cc, i) => {
        await TransactionModel.findOne({ clientId: cc._id })
          .sort({ created_at: -1 })
          .then(async function (trans1) {
            await TransactionModel.findOne({ clientId: cc._id })
              .sort({ created_at: 1 })
              .then(async function (trans) {
                const bb = {
                  clientId: cc._id,
                  customerId: cc.customerId,
                  clientName: cc.firstName + " " + cc.lastName,
                  capitalInvested: trans1.balance,
                  capitalDate: trans.created_at,
                  maturityDate: trans.maturityDate,
                  payoutOutTimePeriod: "1 Month",
                  branch: cc?.franchise?.name,
                  createdBy: cc.createdBy.name,
                  createdAt: trans.created_at,
                };
                packagee = cc.currentPlan.packageName;
                colte.push(bb);
              });
          });
        if (i === result.length - 1) {
          res.send({
            status: true,
            message: "Fetch Successfully",
            data: colte,
            package: packagee,
          });
        }
      });
    });
});

reportRouter.post("/individual-ledger", async function (req, res) {
  let colte = [];
  const selectedDate = new Date(req.body.toDate);
  const fromDate = new Date(req.body.fromDate);
  const toDate = new Date(req.body.toDate);
  toDate.setHours(23, 59, 59, 999);

  const previousDate = new Date(selectedDate);
  previousDate.setHours(23, 59, 59, 999);
  previousDate.setDate(selectedDate.getDate() - 1);
  await CustomerModel.findOne({ _id: req.body.clientId })
    .populate({ path: "branch", select: "name" })
    .populate({ path: "franchise", select: "name" })
    .populate({ path: "createdBy", select: "name" })
    .sort({ updated_at: -1 })
    .exec()
    .then(async (cc) => {
      await TransactionModel.findOne({
        clientId: cc._id,
        created_at: { $lte: previousDate },
      })
        .sort({ created_at: -1 })
        .then(async function (trans1) {
          await TransactionModel.find({
            clientId: cc._id,
            created_at: { $gte: fromDate, $lte: toDate },
          })
            .sort({ created_at: 1 })
            .then(async function (trans) {
              trans.map((tr, i) => {
                const formattedDate = tr.created_at.toLocaleDateString(
                  "en-GB",
                  { day: "2-digit", month: "short", year: "numeric" }
                );

                const bb = {
                  date: formattedDate,
                  particular: tr.particular,
                  txnNo: tr.txnNo,
                  txnId: tr.txnId,
                  type: tr.type,
                  amount: tr.amount,
                  balance: tr.balance,
                  description: tr.description,
                };
                // console.log(colte);
                colte.push(bb);
                if (i === trans.length - 1) {
                  res.send({
                    status: true,
                    message: "Fetch Successfully",
                    data: colte,
                    customer: {
                      name: cc.firstName + " " + cc.lastName,
                      customerId: cc.customerId,
                    },
                    openingBalance: trans1.balance,
                  });
                }
              });
            });
        });
    });
});

reportRouter.post("/list-plan-expires", async function (req, res) {
  let colte = [];
  const previousDate = new Date();
  //   previousDate.setHours(23, 59, 59, 999);
  await TransactionModel.find({
    maturityDate: { $lt: previousDate },
    // maturityDate: { $ne: null },
    balanceExpire: false,
    invested: true,
  })
    .populate({ path: "branch", select: "name" })
    .populate({
      path: "clientId",
      select: ["firstName", "lastName", "phone", "customerId"],
    })
    .sort({ updated_at: -1 })
    .exec()
    .then(async (result) => {
      //   console.log(result);
      result.map(async (cc, i) => {
        await InvestmentModel.findOne({ customerId: cc.clientId })
          .sort({ created_at: -1 })
          .then(async function (trans) {
            const bb = {
              investmentId: trans._id,
              customerId: cc.clientId.customerId,
              clientName: cc.clientId.firstName + " " + cc.clientId.lastName,
              capitalInvested: trans.totalAmountInvested,
              phone: cc.clientId.phone,
              maturityDate: cc.maturityDate,
              branch: cc?.branch?.name,
            };
            colte.push(bb);
          });
        if (i === result.length - 1) {
          res.send({
            status: true,
            message: "Fetch Successfully",
            data: colte,
          });
        }
      });
    })
    .catch(function (err) {
      console.error(err);
    });
});

module.exports = reportRouter;
