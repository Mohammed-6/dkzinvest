const express = require("express");
const mongoose = require("mongoose");
const {
  planSchema,
  transactionSchema,
  currencySchema,
  investmentSchema,
  withdrawSchema,
} = require("../../models/investment");
const { userSchema } = require("../../models/auth");
const { customerSchema } = require("../../models/customer");

const investmentRouter = express.Router();

const CurrencyModel = mongoose.model("currency", currencySchema);
const InvestmentModel = mongoose.model("investment", investmentSchema);
const WithdrawModel = mongoose.model("withdraw", withdrawSchema);

const PlanModel = mongoose.model("plan", planSchema);
const TransactionModel = mongoose.model("transaction", transactionSchema);
const CustomerModel = mongoose.model("customer", customerSchema);

const UserModel = mongoose.model("user", userSchema);
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

investmentRouter.get("/list-plan", function (req, res) {
  PlanModel.find({}).then(function (Branch) {
    res.send({ status: true, message: "Plan List", data: Branch });
  });
});

investmentRouter.post("/create-plan", async function (req, res) {
  let colte = req.body;
  await PlanModel.countDocuments({ packageName: req.body.packageName }).then(
    (count) => {
      if (count !== 0) {
        res.send({ status: false, message: "Plan already exists" });
      } else {
        PlanModel.create(colte)
          .then((Branch) => {
            res.send({ status: true, message: "Plan created successfully" });
          })
          .catch((error) => {
            res.send({ status: false, message: "Error", data: error });
          });
      }
    }
  );
});

investmentRouter.post("/edit-plan", async function (req, res) {
  await PlanModel.countDocuments({ _id: req.body._id }).then((count) => {
    if (count === 0) {
      res.send({ status: false, message: "Plan not found" });
    } else {
      PlanModel.findOne({ _id: req.body._id }).then((Branch) => {
        res.send({ status: true, message: "Plan find", data: Branch });
      });
    }
  });
});

investmentRouter.post("/update-plan", async function (req, res) {
  await PlanModel.countDocuments({ _id: req.body._id }).then(async (count) => {
    if (count === 0) {
      res.send({ status: false, message: "Plan not found" });
    } else {
      PlanModel.findOneAndUpdate({ _id: req.body._id }, req.body).then(
        (Branch) => {
          res.send({ status: true, message: "Plan updated successfully" });
        }
      );
    }
  });
});

investmentRouter.post("/delete-plan", async function (req, res) {
  await PlanModel.countDocuments({ _id: req.body._id }).then((count) => {
    if (count === 0) {
      res.send({ status: false, message: "Plan not found" });
    } else {
      PlanModel.findOneAndDelete({ _id: req.body._id }).then((Branch) => {
        res.send({ status: true, message: "Plan deleted successfully" });
      });
    }
  });
});

investmentRouter.post("/assign-plan", async function (req, res) {
  await PlanModel.countDocuments({ _id: req.body._id }).then((count) => {
    if (count === 0) {
      res.send({ status: false, message: "Plan not found" });
    } else {
      PlanModel.findOneAndDelete({ _id: req.body._id }).then((Branch) => {
        res.send({ status: true, message: "Plan deleted successfully" });
      });
    }
  });
});

investmentRouter.post("/investment-customer-list", async function (req, res) {
  await CustomerModel.find({})
    .select(["_id", "firstName", "lastName", "franchise", "currentPlan"])
    .then(async (cus) => {
      CurrencyModel.find({}).then((curr) => {
        res.send({
          status: true,
          message: "Customer list",
          data: { currency: curr, customer: cus },
        });
      });
    });
});

investmentRouter.post("/customer-transaction", async function (req, res) {
  const colte = req.body;
  //   console.log(colte);
  //   return;
  colte.txnId = makeid(15);
  delete colte._id;

  await TransactionModel.countDocuments({}).then(async function (count) {
    colte.txnNo = count + 1;
    if (count == 0) {
      colte.balance = req.body.amount;
      colte.maturityDate = new Date(
        new Date().setFullYear(new Date().getFullYear() + 1)
      );
    } else {
      await TransactionModel.countDocuments({
        clientId: req.body.clientId,
      }).then(async (count) => {
        if (count > 0) {
          await TransactionModel.findOne({ clientId: req.body.clientId })
            .sort({ created_at: -1 })
            .then(async function (trans) {
              if (req.body.type === "debit") {
                colte.balance = trans.balance - req.body.amount;
              } else if (req.body.type === "credit") {
                colte.balance = trans.balance + req.body.amount;
              }
            });
        } else {
          if (req.body.type === "debit") {
            colte.balance = req.body.amount;
          } else if (req.body.type === "credit") {
            colte.balance = req.body.amount;
            colte.maturityDate = new Date(
              new Date().setFullYear(new Date().getFullYear() + 1)
            );
          }
        }
      });
    }
    await TransactionModel.create(colte)
      .then(function (transaction) {
        if (req.body.type === "credit") {
          pushToInvestment(transaction._id);
          res.send({
            status: true,
            message: "Transaction created successfully",
          });
        } else {
          res.send({
            status: true,
            message: "Transaction created successfully",
          });
        }
      })
      .catch(function (error) {
        res.send({
          status: false,
          message: "Error creating transaction",
          data: error,
        });
      });
  });
});

investmentRouter.post("/list-transaction", async function (req, res) {
  const fromDate = new Date(req.body.fromDate);
  fromDate.setHours(0, 0, 0, 0); // Set to the beginning of the day
  const toDate = new Date(req.body.toDate);
  toDate.setHours(23, 59, 59, 999); // Set to the end of the day

  const query = { $or: [] };
  if (req.body.clientId !== "") {
    query.$or.push({ clientId: req.body.clientId });
  }
  query.$or.push({
    created_at: {
      $gte: new Date(fromDate),
      $lte: new Date(toDate),
    },
  });

  TransactionModel.find(query)
    .populate({ path: "clientId", select: ["firstName", "lastName"] })
    .sort({ created_at: 1 })
    .then((trans) => {
      res.send({ status: true, message: "Transaction list", data: trans });
    })
    .catch((error) => {
      res.send({ status: false, message: "Error", data: error });
    });
});

investmentRouter.post("/assign-plan-customer", async function (req, res) {
  await CustomerModel.findByIdAndUpdate(
    { _id: req.body._id },
    { currentPlan: req.body.planId }
  )
    .then(function (customer) {
      res.send({ status: true, message: "Plan assign successfully" });
    })
    .catch(function (error) {
      res.send({ status: false, message: "Error assigning plan", data: error });
    });
});

investmentRouter.get("/list-currency", async function (req, res) {
  CurrencyModel.find({})
    .then((currency) => {
      res.send({ status: true, message: "Currency list", data: currency });
    })
    .catch((error) => {
      res.send({ status: false, message: "Error", data: error });
    });
});

investmentRouter.post("/create-currency", async function (req, res) {
  let colte = req.body;
  delete colte._id;
  await CurrencyModel.countDocuments({
    currencyCode: req.body.currencyCode,
    country: req.body.country,
  }).then((count) => {
    if (count !== 0) {
      res.send({ status: false, message: "Currency already exists" });
    } else {
      CurrencyModel.create(colte)
        .then((Currency) => {
          res.send({ status: true, message: "Currency created successfully" });
        })
        .catch((error) => {
          res.send({ status: false, message: "Error", data: error });
        });
    }
  });
});

investmentRouter.post("/update-currency", async function (req, res) {
  let colte = req.body;
  await CurrencyModel.countDocuments({
    currencyCode: req.body.currencyCode,
    country: req.body.country,
    _id: { $ne: req.body._id },
  }).then((count) => {
    if (count !== 0) {
      res.send({ status: false, message: "Currency already exists" });
    } else {
      CurrencyModel.findOneAndUpdate({ _id: req.body._id }, colte)
        .then((Currency) => {
          res.send({ status: true, message: "Currency updated successfully" });
        })
        .catch((error) => {
          res.send({ status: false, message: "Error", data: error });
        });
    }
  });
});

investmentRouter.post("/delete-currency", async function (req, res) {
  CurrencyModel.findOneAndDelete(req.body._id)
    .then(async (currency) => {
      await CurrencyModel.find({}).then((currency) => {
        res.send({ status: true, message: "Currency list", data: currency });
      });
    })
    .catch((error) => {
      res.send({ status: false, message: "Error", data: error });
    });
});

async function pushToInvestment(_id) {
  await TransactionModel.countDocuments({
    _id: _id,
    invested: false,
  }).then(async function (count) {
    if (count == 0) {
      res.send({ status: false, message: "Error! No transaction found" });
    } else {
      await TransactionModel.findOne({ _id: _id })
        .populate({ path: "currencyId", select: "currencyCode" })
        .populate({ path: "clientId", select: "currentPlan" })
        .populate({ path: "planId", select: "percentage" })
        .sort({ created_at: -1 })
        .then(async function (trans) {
          const colte = {
            investmentId: makeid(16),
            transRefId: trans._id,
            customerId: trans.clientId._id,
            planId: trans.clientId.currentPlan,
            currencyId: trans.currencyId._id,
            investmentAmount: trans.amount,
            investmentCurrency: trans.currencyId.currencyCode,
            totalAmountInvested: trans.balance,
            percentOfAmountTarget: trans.planId.percentage,
          };
          await InvestmentModel.create(colte).then(async () => {
            await TransactionModel.findByIdAndUpdate(_id, {
              invested: true,
            }).then(() => {
              //   res.send({
              //     status: true,
              //     message: "Investment successfull",
              //     data: colte,
              //   });
            });
          });
        });
    }
  });
}

async function createTransaction(req) {
  const colte = req;
  colte.txnId = makeid(15);

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
          colte.branch = trans.branch;
          //   colte.balance = req.balance;
          //   colte.balance = req.amount;
        });
    }
    return await TransactionModel.create(colte);
  });
}

investmentRouter.post("/push-to-reinvestment", async function (req, res) {
  await InvestmentModel.countDocuments({
    _id: req.body._id,
    status: true,
  }).then(async function (count) {
    if (count == 0) {
      res.send({ status: false, message: "Error! No transaction found" });
    } else {
      await InvestmentModel.findOne({ _id: req.body._id }).then(async function (
        inv
      ) {
        await InvestmentModel.updateMany(
          { clientId: inv.clientId },
          {
            status: false,
          }
        );
        await TransactionModel.updateMany(
          { clientId: inv.customerId },
          { $set: { balanceExpire: true } }
        );
        // create new transaction for reinvestment
        const colte = {
          clientId: inv.customerId,
          planId: inv.planId,
          txnNo: "",
          txnId: "",
          particular: "Money reinvested",
          type: "credit",
          currencyId: inv.currencyId,
          amount: inv.totalAmountInvested,
          balance: inv.totalAmountInvested,
          description: "reinvest",
          modeOfPayment: "Internal",
          maturityDate: "",
          branch: "",
          invested: true,
          reInvest: true,
        };
        return createTransaction(colte).then(async function (result) {
          // console.log(result);return;
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
                planId: trans.clientId.currentPlan,
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
      });
    }
  });
});

investmentRouter.post(
  "/push-to-partial-reinvestment",
  async function (req, res) {
    await InvestmentModel.countDocuments({
      _id: req.body._id,
      status: true,
    }).then(async function (count) {
      if (count == 0) {
        res.send({ status: false, message: "Error! No transaction found" });
      } else {
        await InvestmentModel.findOne({ _id: req.body._id }).then(
          async function (inv) {
            if (req.body.withdrawAmount > inv.totalAmountInvested) {
              res.send({
                status: false,
                message:
                  "Error! Withdraw amount is greater than invested amount",
              });
              return;
            } else if (
              inv.totalAmountInvested - req.body.withdrawAmount <
              80000
            ) {
              res.send({
                status: false,
                message:
                  "Error! Withdraw amount has to be greater than one lakh",
              });
              return;
            }
            // create new transaction for withdraw reinvestment
            const withdrawData = {
              withdrawId: makeid(13),
              investmentRefId: inv._id,
              transRefId: inv.transRefId,
              customerId: inv.customerId,
              planId: inv.planId,
              currencyId: inv.currencyId,
              paidAmount: req.body.withdrawAmount,
              withdrawRef: "Partial investment amount",
            };
            await WithdrawModel.create(withdrawData);
            const coltew = {
              clientId: inv.customerId,
              planId: inv.planId,
              txnNo: "",
              txnId: "",
              particular: "Money withdraw and reinvested",
              type: "debit",
              currencyId: inv.currencyId,
              amount: req.body.withdrawAmount,
              balance:
                parseInt(inv.totalAmountInvested) -
                parseInt(req.body.withdrawAmount),
              description: "patial withdraw",
              modeOfPayment: "Internal",
              branch: "",
            };
            await createTransaction(coltew);
            await InvestmentModel.findByIdAndUpdate(req.body._id, {
              status: false,
            });
            await TransactionModel.updateMany(
              { clientId: inv.customerId },
              { $set: { balanceExpire: true } }
            );
            // create new transaction for reinvestment
            const colte = {
              clientId: inv.customerId,
              planId: inv.planId,
              txnNo: "",
              txnId: "",
              particular: "Money reinvested",
              type: "credit",
              currencyId: inv.currencyId,
              amount:
                parseInt(inv.totalAmountInvested) -
                parseInt(req.body.withdrawAmount),
              balance: 0,
              description: "reinvest",
              modeOfPayment: "Internal",
              maturityDate: "",
              branch: "",
              invested: true,
              reInvest: true,
            };
            return createTransaction(colte).then(async function (result) {
              // console.log(result);return;
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
                    planId: trans.clientId.currentPlan,
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
          }
        );
      }
    });
  }
);

investmentRouter.post(
  "/push-to-investment-withdraw",
  async function (req, res) {
    await InvestmentModel.countDocuments({
      _id: req.body._id,
      status: true,
    }).then(async function (count) {
      if (count == 0) {
        res.send({ status: false, message: "Error! No transaction found" });
      } else {
        await InvestmentModel.findOne({ _id: req.body._id }).then(
          async function (inv) {
            // create new transaction for withdraw reinvestment
            const withdrawData = {
              withdrawId: makeid(13),
              investmentRefId: inv._id,
              transRefId: inv.transRefId,
              customerId: inv.customerId,
              planId: inv.planId,
              currencyId: inv.currencyId,
              paidAmount: inv.totalAmountInvested,
              withdrawRef: "Investment full amount",
            };
            await WithdrawModel.create(withdrawData);
            const coltew = {
              clientId: inv.customerId,
              planId: inv.planId,
              txnNo: "",
              txnId: "",
              particular: "Investment withdraw",
              type: "debit",
              currencyId: inv.currencyId,
              amount: inv.totalAmountInvested,
              balance: 0,
              description: "full withdraw",
              modeOfPayment: "Internal",
              branch: "",
            };
            await createTransaction(coltew);
            await InvestmentModel.findByIdAndUpdate(req.body._id, {
              status: false,
            });
            await TransactionModel.updateMany(
              { clientId: inv.customerId },
              { $set: { balanceExpire: true } }
            );
            res.send({ status: true, message: "Investment has been updated" });
          }
        );
      }
    });
  }
);

function calculateProfit(investment, monthlyProfitRate, startDate, endDate) {
  // Calculate the number of days between the start and end dates
  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  const days = Math.round(Math.abs((endDate - startDate) / oneDay));

  // Calculate the total profit based on the number of months
  const months = days / 30; // Assuming 30 days per month for simplicity
  const totalProfit = investment * (monthlyProfitRate / 100) * months;

  return { totalProfit: totalProfit, days: days };
}

investmentRouter.post("/list-profit-sharing", async function (req, res) {
  let colte = [];
  await CustomerModel.find({})
    .populate({ path: "franchise", select: "name" })
    .populate({ path: "currentPlan", select: "packageName" })
    .sort({ updated_at: -1 })
    .exec()
    .then(async (result) => {
      //   console.log(result);
      let pp = [];
      let profitAmount = 0;
      result.length > 0 &&
        result.map(async (cc, i) => {
          await InvestmentModel.findOne({ customerId: cc._id, status: true })
            .sort({ created_at: -1 })
            .then(async function (inv1) {
              if (inv1 !== null) {
                await WithdrawModel.countDocuments({
                  investmentRefId: inv1._id,
                }).then(async function (cnt) {
                  if (cnt !== 0) {
                    await WithdrawModel.findOne({
                      investmentRefId: inv1._id,
                    })
                      .sort({ created_at: -1 })
                      .then(async function (withdraw) {
                        await InvestmentModel.find({
                          customerId: cc._id,
                          status: true,
                        })
                          .sort({ created_at: 1 })
                          .then(async function (invest) {
                            invest.length > 0 &&
                              invest.map((inv) => {
                                const investmentAmount =
                                  inv.totalAmountInvested;
                                const monthlyProfitRate =
                                  inv.percentOfAmountTarget;
                                const startDate = new Date(withdraw.created_at);
                                const endDate = new Date();

                                const profit = calculateProfit(
                                  investmentAmount,
                                  monthlyProfitRate,
                                  startDate,
                                  endDate
                                );
                                profitAmount += parseFloat(
                                  profit.totalProfit.toFixed(2)
                                );
                                const bb = {
                                  investmentId: inv.investmentId,
                                  days: profit.days,
                                  payAmount: profit.totalProfit.toFixed(2),
                                  investmentAmount: inv.totalAmountInvested,
                                };
                                pp.push(bb);
                              });
                          });
                        const bb = {
                          clientId: cc._id,
                          customerId: cc.customerId,
                          clientName: cc.firstName + " " + cc.lastName,
                          capitalInvested: inv1.totalAmountInvested,
                          capitalDate: inv1.created_at,
                          packageName: cc.currentPlan.packageName,
                          branch: cc?.franchise?.name,
                          createdAt: inv1.created_at,
                          investments: pp,
                          profitAmount: profitAmount,
                        };
                        colte.push(bb);
                      });
                  } else {
                    await InvestmentModel.find({
                      customerId: cc._id,
                      status: true,
                    })
                      .sort({ created_at: 1 })
                      .then(async function (invest) {
                        invest.length > 0 &&
                          invest.map((inv) => {
                            // Example usage:
                            const investmentAmount = inv.totalAmountInvested; // Investment amount
                            const monthlyProfitRate = inv.percentOfAmountTarget; // Monthly profit rate in percentage
                            const startDate = new Date(inv.created_at); // Start date of investment
                            const endDate = new Date(); // End date for calculating profit

                            const profit = calculateProfit(
                              investmentAmount,
                              monthlyProfitRate,
                              startDate,
                              endDate
                            );
                            // console.log("Total profit:", profit.toFixed(2)); // Print the total profit
                            //   const payAmt =
                            //     (inv.percentOfAmountTarget / 100) *
                            //     inv.totalAmountInvested;
                            profitAmount += parseFloat(
                              profit.totalProfit.toFixed(2)
                            );
                            const bb = {
                              investmentId: inv.investmentId,
                              days: profit.days,
                              payAmount: profit.totalProfit.toFixed(2),
                              investmentAmount: inv.totalAmountInvested,
                            };
                            pp.push(bb);
                          });
                      });
                    const bb = {
                      clientId: cc._id,
                      customerId: cc.customerId,
                      clientName: cc.firstName + " " + cc.lastName,
                      capitalInvested: inv1.totalAmountInvested,
                      capitalDate: inv1.created_at,
                      packageName: cc.currentPlan.packageName,
                      branch: cc?.franchise?.name,
                      createdAt: inv1.created_at,
                      investments: pp,
                      profitAmount: profitAmount,
                    };
                    colte.push(bb);
                  }
                });
              }
            });
          if (i === result.length - 1) {
            res.send({
              status: true,
              message: "Fetch Successfully",
              data: colte,
            });
          }
        });
    });
});

investmentRouter.post("/disburse-profit", async function (req, res) {
  let profitAmount = 0;
  await InvestmentModel.findOne({ customerId: req.body.clientId, status: true })
    .sort({ created_at: -1 })
    .then(async function (inv1) {
      if (inv1 !== null) {
        await WithdrawModel.countDocuments({
          investmentRefId: inv1._id,
        }).then(async function (cnt) {
          if (cnt !== 0) {
            await WithdrawModel.findOne({
              investmentRefId: inv1._id,
            })
              .sort({ created_at: -1 })
              .then(async function (withdraw) {
                await InvestmentModel.find({
                  customerId: req.body.clientId,
                  status: true,
                })
                  .sort({ created_at: 1 })
                  .then(async function (invest) {
                    invest.length > 0 &&
                      invest.map(async (inv, i) => {
                        const investmentAmount = inv.totalAmountInvested;
                        const monthlyProfitRate = inv.percentOfAmountTarget;
                        const startDate = new Date(withdraw.created_at);
                        const endDate = new Date();

                        const profit = calculateProfit(
                          investmentAmount,
                          monthlyProfitRate,
                          startDate,
                          endDate
                        );

                        profitAmount += parseFloat(
                          profit.totalProfit.toFixed(2)
                        );

                        const withdrawDesc =
                          "Withdraw No. " +
                          cnt +
                          " , invested amount: " +
                          inv.totalAmountInvested +
                          " , profit percentage: " +
                          inv.percentOfAmountTarget +
                          " , last withdraw date: " +
                          startDate +
                          " , profit amount: " +
                          profitAmount;
                        if (i === invest.length - 1) {
                          if (profitAmount > 1) {
                            await UserModel.findOne({
                              rememberToken: req.query.token,
                            }).then(async function (user) {
                              const coltewp = {
                                clientId: inv.customerId,
                                planId: inv.planId,
                                txnNo: "",
                                txnId: "",
                                particular: "Investment profit amount",
                                type: "credit",
                                currencyId: inv.currencyId,
                                amount: profitAmount,
                                balance:
                                  parseInt(profitAmount) +
                                  parseInt(inv.totalAmountInvested),
                                description: "investment profit amount",
                                modeOfPayment: "Internal",
                                branch: "",
                              };
                              await createTransaction(coltewp);
                              const withdrawData = {
                                withdrawId: makeid(13),
                                investmentRefId: inv._id,
                                transRefId: inv.transRefId,
                                customerId: inv.customerId,
                                planId: inv.planId,
                                currencyId: inv.currencyId,
                                initiateBy: user._id,
                                withdrawDesc: withdrawDesc,
                                paidAmount: profitAmount,
                                withdrawRef: "Investment profit amount",
                                supervisorApprove: true,
                              };
                              await WithdrawModel.create(withdrawData);
                              const coltew = {
                                clientId: inv.customerId,
                                planId: inv.planId,
                                txnNo: "",
                                txnId: "",
                                particular: "Investment profit withdraw",
                                type: "debit",
                                currencyId: inv.currencyId,
                                amount: profitAmount,
                                balance:
                                  parseInt(profitAmount) +
                                  parseInt(inv.totalAmountInvested) -
                                  parseInt(profitAmount),
                                description: "investment profit",
                                modeOfPayment: "Internal",
                                branch: "",
                              };
                              await createTransaction(coltew);
                              res.send({
                                status: true,
                                message: "Withdraw transaction initiated",
                                data: profitAmount,
                              });
                            });
                          } else {
                            res.send({
                              status: false,
                              message: "Withdraw amount was not sufficient",
                              data: profitAmount,
                            });
                          }
                        }
                      });
                  });
              });
          } else {
            await InvestmentModel.find({
              customerId: req.body.clientId,
              status: true,
            })
              .sort({ created_at: 1 })
              .then(async function (invest) {
                invest.length > 0 &&
                  invest.map(async (inv, i) => {
                    const investmentAmount = inv.totalAmountInvested;
                    const monthlyProfitRate = inv.percentOfAmountTarget;
                    const startDate = new Date(inv.created_at);
                    const endDate = new Date();

                    const profit = calculateProfit(
                      investmentAmount,
                      monthlyProfitRate,
                      startDate,
                      endDate
                    );

                    profitAmount += parseFloat(profit.totalProfit.toFixed(2));
                    const withdrawDesc =
                      "Withdraw No. 1 , invested amount: " +
                      inv.totalAmountInvested +
                      " , profit percentage: " +
                      inv.percentOfAmountTarget +
                      " , last withdraw date: " +
                      startDate +
                      " , profit amount: " +
                      profitAmount;
                    if (i === invest.length - 1) {
                      if (profitAmount > 1) {
                        await UserModel.findOne({
                          rememberToken: req.query.token,
                        }).then(async function (user) {
                          const coltewp = {
                            clientId: inv.customerId,
                            planId: inv.planId,
                            txnNo: "",
                            txnId: "",
                            particular: "Investment profit amount",
                            type: "credit",
                            currencyId: inv.currencyId,
                            amount: profitAmount,
                            balance:
                              parseInt(profitAmount) +
                              parseInt(inv.totalAmountInvested),
                            description: "investment profit amount",
                            modeOfPayment: "Internal",
                            branch: "",
                          };
                          // console.log(coltewp);
                          await createTransaction(coltewp);
                          const withdrawData = {
                            withdrawId: makeid(13),
                            investmentRefId: inv._id,
                            transRefId: inv.transRefId,
                            customerId: inv.customerId,
                            planId: inv.planId,
                            initiateBy: user._id,
                            withdrawDesc: withdrawDesc,
                            currencyId: inv.currencyId,
                            paidAmount: profitAmount,
                            withdrawRef: "Investment profit amount",
                            supervisorApprove: true,
                          };
                          await WithdrawModel.create(withdrawData);
                          const coltew = {
                            clientId: inv.customerId,
                            planId: inv.planId,
                            txnNo: "",
                            txnId: "",
                            particular: "Investment profit withdraw",
                            type: "debit",
                            currencyId: inv.currencyId,
                            amount: profitAmount,
                            balance:
                              parseInt(profitAmount) +
                              parseInt(inv.totalAmountInvested) -
                              parseInt(profitAmount),
                            description: "investment profit",
                            modeOfPayment: "Internal",
                            branch: "",
                          };
                          await createTransaction(coltew);
                          // return;
                          res.send({
                            status: true,
                            message: "Withdraw transaction initiated",
                            data: profitAmount,
                          });
                        });
                      } else {
                        res.send({
                          status: false,
                          message: "Withdraw amount was not sufficient",
                          data: profitAmount,
                        });
                      }
                    }
                  });
              });
          }
        });
      }
    });
});

investmentRouter.post("/list-disburse-profit", async function (req, res) {
  const fromDate = new Date(req.body.fromDate);
  fromDate.setHours(0, 0, 0, 0); // Set to the beginning of the day
  const toDate = new Date(req.body.toDate);
  toDate.setHours(23, 59, 59, 999); // Set to the end of the day

  const query = { $or: [] };
  if (req.body.clientId !== "") {
    query.$or.push({ clientId: req.body.clientId });
  }
  query.$or.push({
    created_at: {
      $gte: new Date(fromDate),
      $lte: new Date(toDate),
    },
  });
  await WithdrawModel.find(query)
    .populate({ path: "initiateBy", select: "name" })
    .populate({ path: "adminBy", select: "name" })
    .populate({
      path: "customerId",
      select: ["firstName", "lastName", "customerId"],
    })
    .then(function (withdraw) {
      let colte = [];
      withdraw.map(async (wth, i) => {
        const bb = {
          initiatedOn: wth.created_at,
          initiatedBy: wth.initiateBy.name,
          clientName: wth.customerId.firstName + " " + wth.customerId.lastName,
          clientId: wth.customerId.customerId,
          withdrawDesc: wth.withdrawDesc,
          withdrawAmount: wth.paidAmount,
          withdrawId: wth._id,
          adminStatus: wth.adminApprove,
          paymentStatus: wth.paymentStatus,
        };
        colte.push(bb);
        if (i === withdraw.length - 1) {
          res.send({ status: true, message: "Disburse list", data: colte });
        }
      });
    });
});

investmentRouter.post("/admin-profit-approve", async function (req, res) {
  WithdrawModel.countDocuments({ _id: req.body.id }).then(function (
    countDocuments
  ) {
    if (countDocuments === 0) {
      res.send({ status: false, message: "No records found" });
    } else {
      WithdrawModel.findByIdAndUpdate(req.body.id, {
        $set: { adminApprove: true },
      })
        .then(function (result) {
          res.send({
            status: true,
            message: "Profit disburse request approved",
          });
        })
        .catch(function (error) {
          res.send({ status: false, message: "Error!", data: error });
        });
    }
  });
});

module.exports = investmentRouter;
