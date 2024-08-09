const express = require("express");
const mongoose = require("mongoose");
const { customerSchema } = require("../../models/customer");
const {
  planSchema,
  investmentSchema,
  orderSchema,
  transactionSchema,
  withdrawSchema,
} = require("../../models/investment");
const bcrypt = require("bcrypt");

const agentDashboardRoute = express.Router();

const { userSchema } = require("../../models/auth");

const PlanModel = mongoose.model("plan", planSchema);
const UserModel = mongoose.model("user", userSchema);
const CustomerModel = mongoose.model("customer", customerSchema);
const InvestmentModel = mongoose.model("investment", investmentSchema);
const WithdrawModel = mongoose.model("withdraw", withdrawSchema);
const TransactionModel = mongoose.model("transaction", transactionSchema);

const getPreviousRecord = async (referralCode, fromDate, toDate) => {
  let leads = [];
  let customer = [];
  let invest = [];
  let conversion = 0;
  const from = new Date(fromDate);
  const to = new Date(toDate);

  const givenDate = new Date(from);
  givenDate.setDate(1);
  givenDate.setMonth(givenDate.getMonth() - 1);

  return await CustomerModel.find({
    referralCode: referralCode,
    created_at: {
      $gte: givenDate,
      $lte: from,
    },
  })
    .sort({ created_at: -1 })
    .populate({ path: "profilePhoto.docId", select: ["path"] })
    .select([
      "_id",
      "firstName",
      "email",
      "lastName",
      "applicationSubmitted",
      "profilePhoto",
      "created_at",
    ])
    .then(async (cus) => {
      for (let i = 0; i < cus.length; i++) {
        const c = cus[i];
        if (c.applicationSubmitted === false) {
          leads.push(c);
        } else if (c.applicationSubmitted === true) {
          customer.push(c);
        }
        invest.push(c._id);
      }
      const customerIds = cus.map((c) => c._id);

      // Step 2: Get all investments for these customers
      const investments = await InvestmentModel.aggregate([
        { $match: { customerId: { $in: customerIds } } },
        {
          $group: {
            _id: "$customerId",
            totalInvestment: { $sum: "$investmentAmount" },
          },
        },
        // { $match: { applicationSubmitted: true } },
      ]);

      // Step 3: Calculate conversion rate
      const totalCustomers = cus.length;
      const convertedCustomers = investments.length;
      const conversion = (convertedCustomers / totalCustomers) * 100;

      const inst = await getInvestment(givenDate, from);
      const withd = await getWithdraw(givenDate, from);
      const commision = await getCommision(invest, from, to);
      const ref = commision.reduce((acc, curr) => acc + curr, 0);
      const colte = {
        leads: leads,
        customer: customer,
        commision: (2 / 100) * ref,
        investment: inst.length > 0 ? inst[inst.length - 1] : [],
        payout: withd.length > 0 ? withd[withd.length - 1] : [],
        conversion: conversion,
      };

      // Return colte after all async operations are complete
      return colte;
    })
    .catch((error) => {
      return { status: false, message: error };
    });
};

agentDashboardRoute.post("/dashboard", async (req, res) => {
  await UserModel.findOne({ rememberToken: req.query.token })
    .then(async (user) => {
      // console.log(user);
      let leads = [];
      let customer = [];
      let invest = [];
      let conversion = 0;
      let from = req.body.from;
      let to = req.body.to;

      var today = new Date();
      if (from === "" && to === "") {
        from = new Date(today.getFullYear(), today.getMonth(), 1);
        to = new Date();
      } else {
        from = new Date(req.body.from);
        to = new Date(req.body.to);
      }
      await CustomerModel.find({
        referralCode: user.referralCode,
        created_at: {
          $gte: from,
          $lte: to,
        },
      })
        .sort({ created_at: -1 })
        .populate({ path: "profilePhoto.docId", select: ["path"] })
        .select([
          "_id",
          "firstName",
          "email",
          "lastName",
          "applicationSubmitted",
          "profilePhoto",
          "created_at",
        ])
        .then((cus) => {
          if (cus.length === 0) {
            const colte = {
              leads: [],
              customer: [],
              commision: 0,
              investment: [],
              payout: [],
              conversion: 0,
              previous: {
                leads: "0.00",
                customer: "0.00",
                commision: "0.00",
                investment: "0.00",
                payout: "0.00",
                conversion: "0.00",
              },
            };
            res.send({ status: true, data: colte });
          }
          cus.map(async (c, i) => {
            customer.push(c);

            // console.log(cus);
            invest.push(c._id);
            if (i === cus.length - 1) {
              let compare = {};

              const customerIds = cus.map((c) => c._id);

              // Step 2: Get all investments for these customers
              const investments = await InvestmentModel.aggregate([
                { $match: { customerId: { $in: customerIds } } },
                {
                  $group: {
                    _id: "$customerId",
                    totalInvestment: { $sum: "$investmentAmount" },
                  },
                },
                // { $match: { applicationSubmitted: true } },
              ]);

              // Step 3: Calculate conversion rate
              const totalCustomers = customerIds.length;
              const convertedCustomers = investments.length;
              const conversion = (
                (convertedCustomers / totalCustomers) *
                100
              ).toFixed(2);
              console.log(totalCustomers, convertedCustomers);
              const inst = await getInvestment(from, to);
              const withd = await getWithdraw(from, to);
              const commision = await getCommision(invest, from, to);
              const ref = commision.reduce((acc, curr) => acc + curr, 0);
              const previous = await getPreviousRecord(
                user.referralCode,
                from,
                to
              )
                .then((result) => {
                  // console.log(result);
                  const inv =
                    inst.length > 0
                      ? inst[inst.length - 1].amount.reduce(
                          (acc, curr) => acc + curr,
                          0
                        )
                      : 0;
                  const inv_c =
                    result.investment.length > 0
                      ? result.investment.amount.reduce(
                          (acc, curr) => acc + curr,
                          0
                        )
                      : 0;

                  const pay =
                    withd.length > 0
                      ? withd[withd.length - 1].amount.reduce(
                          (acc, curr) => acc + curr,
                          0
                        )
                      : 0;
                  const pay_c =
                    result.payout.length > 0
                      ? result.payout.amount.reduce(
                          (acc, curr) => acc + curr,
                          0
                        )
                      : 0;

                  compare = {
                    customer: getProgressPercentage(
                      customer.length,
                      result.customer.length
                    ).toFixed(2),
                    leads: getProgressPercentage(
                      leads.length,
                      result.leads.length
                    ).toFixed(2),
                    commision: getProgressPercentage(
                      (2 / 100) * ref,
                      result.commision
                    ).toFixed(2),
                    investment: getProgressPercentage(inv, inv_c).toFixed(2),
                    payout: getProgressPercentage(pay, pay_c).toFixed(2),
                    conversion: getProgressPercentage(
                      conversion,
                      result.conversion
                    ).toFixed(2),
                  };
                })
                .catch((error) => {
                  res.send({ status: false, message: error });
                });
              const colte = {
                leads: investments,
                customer: customer,
                commision: (2 / 100) * ref,
                investment: inst.length > 0 ? inst[inst.length - 1] : [],
                payout: withd.length > 0 ? withd[withd.length - 1] : [],
                conversion: conversion,
                previous: compare,
              };
              res.send({ status: true, data: colte });
            }
          });
        })
        .catch((error) => {
          res.send({ status: false, message: error, type: 1 });
        });
    })
    .catch((error) => {
      res.send({ status: false, message: error, type: 2 });
    });
});

async function getCommision(customers, from, to) {
  let amount = [];

  const promises = customers.map(async (cus) => {
    const inv = await InvestmentModel.findOne({
      customerId: cus,
      created_at: {
        $gte: from,
        $lte: to,
      },
    })
      .select(["investmentAmount", "created_at"])
      .sort({ created_at: 1 });

    if (inv !== null) {
      amount.push(inv.investmentAmount);
    }
  });

  // Wait for all promises to resolve
  await Promise.all(promises);

  return amount;
}

async function getInvestment(from, to) {
  return await InvestmentModel.find({
    created_at: {
      $gte: from,
      $lte: to,
    },
  })
    .select(["investmentAmount", "created_at"])
    .then((inv) => {
      let date = [];
      let amount = [];
      if (inv.length > 0) {
        return inv.map((inn, i) => {
          date.push(formatDateToDDMMYYYY(inn.created_at));
          amount.push(inn.investmentAmount);
          if (i === inv.length - 1) {
            return { amount: amount, date: date };
          }
        });
      } else {
        return { amount: [], date: [] };
      }
    });
}

async function getWithdraw(from, to) {
  return await WithdrawModel.find({
    created_at: {
      $gte: from,
      $lte: to,
    },
  })
    .select(["paidAmount", "created_at"])
    .then((inv) => {
      let date = [];
      let amount = [];
      if (inv.length > 0) {
        return inv.map((inn, i) => {
          date.push(formatDateToDDMMYYYY(inn.created_at));
          amount.push(inn.paidAmount);
          if (i === inv.length - 1) {
            return { amount: amount, date: date };
          }
        });
      } else {
        return { amount: [], date: [] };
      }
    });
}

function formatDateToDDMMYYYY(mongoDate) {
  const date = new Date(mongoDate);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

function getProgressPercentage(currentValue, previousValue) {
  // Handle cases where previous value is 0 or undefined
  if (previousValue === 0 || previousValue === undefined) {
    return 0; // No progress if previous value is 0 or not available
  }

  // Calculate the difference between current and previous value
  const difference = currentValue - previousValue;

  // Calculate the percentage change relative to the previous value
  const progress = (difference / previousValue) * 100;

  // Ensure progress is a non-negative value (progress can't go backwards)
  return Math.max(0, progress);
}

module.exports = agentDashboardRoute;
