const express = require("express");
const mongoose = require("mongoose");
const { customerSchema, numCount } = require("../../models/customer");
const {
  transactionSchema,
  planSchema,
  investmentSchema,
  slotbookSchema,
} = require("../../models/investment");
const bcrypt = require("bcrypt");

const standardRoute = express.Router();

const { userSchema } = require("../../models/auth");
const { attachmentSchema } = require("../../models/customer");

const PlanModel = mongoose.model("plan", planSchema);
const UserModel = mongoose.model("user", userSchema);
const CustomerModel = mongoose.model("customer", customerSchema);
const TransactionModel = mongoose.model("transaction", transactionSchema);
const InvestmentModel = mongoose.model("investment", investmentSchema);
const SlotModel = mongoose.model("slot", slotbookSchema);

const Razorpay = require("razorpay");
var instance = new Razorpay({
  key_id: "rzp_test_s7rXzSSkEG43th",
  key_secret: "s1jHaXqUDzoUqfZVHNnm9zbX",
});

standardRoute.post("/list-page-customer", async function (req, res) {
  let from = req.body.from;
  let to = req.body.to;

  var today = new Date();
  if (req.body.from === "" && req.body.to === "") {
    from = new Date();
    to = new Date();
  } else {
    from = new Date(req.body.from);
    to = new Date(req.body.to);
  }

  const query = { $and: [], $or: [] };
  if (req.body.from !== "") {
    query.$and.push({ created_at: { $gte: from } });
  }
  if (req.body.to !== "") {
    query.$and.push({ created_at: { $lte: to } });
  }

  if (req.body.submit !== "") {
    query.$and.push({ applicationSubmitted: req.body.submit });
  }
  if (req.body.status !== "") {
    query.$and.push({ applicationStatus: req.body.status });
  }
  if (req.body.search !== "") {
    query.$or.push({ firstName: { $regex: req.body.search, $options: "i" } });
    if (!isNaN(req.body.search)) {
      query.$or.push({ phone: req.body.search });
    }
    query.$or.push({ email: req.body.search });
  }
  if (query.$or.length === 0) {
    delete query.$or;
  }
  await UserModel.findOne({ rememberToken: req.query.token })
    .then(async (user) => {
      query.$and.push({ referralCode: user.referralCode });
      //   console.log(query);
      await CustomerModel.find(query)
        .select([
          "firstName",
          "lastName",
          "phone",
          "email",
          "applicationSubmitted",
          "applicationStatus",
          "currentPlan",
          "_id",
          "created_at",
        ])
        .populate({ path: "currentPlan", select: ["packageName"] })
        .then(function (user) {
          res.send({ status: true, message: "Customer List", data: user });
        });
    })
    .catch((error) => {
      res.send({ status: false, message: error });
    });
});

standardRoute.post("/customer-detail", async function (req, res) {
  await CustomerModel.countDocuments({ _id: req.body._id }).then((count) => {
    if (count === 0) {
      res.send({ status: false, message: "Customer not found" });
    } else {
      CustomerModel.findOne({ _id: req.body._id })
        .populate({ path: "referredBy", select: ["firstName", "lastName"] })
        .populate({ path: "branch", select: ["name"] })
        .populate({
          path: "createdBy",
          select: ["name"],
        })
        .populate({
          path: "currentPlan",
          select: ["packageName", "payoutPeriod"],
        })
        .populate({ path: "franchise", select: ["name"] })
        .populate({
          path: "profilePhoto.docId",
          select: [
            "path",
            "uploadedBy",
            "mimetype",
            "approvedBy",
            "docStatus",
            "status",
          ],
        })
        .populate({
          path: "panDetails.docId",
          select: [
            "path",
            "uploadedBy",
            "mimetype",
            "approvedBy",
            "docStatus",
            "status",
          ],
        })
        .populate({
          path: "aadharDetails.docId",
          select: [
            "path",
            "uploadedBy",
            "mimetype",
            "approvedBy",
            "docStatus",
            "status",
          ],
        })
        .populate({
          path: "aadharBack.docId",
          select: [
            "path",
            "uploadedBy",
            "mimetype",
            "approvedBy",
            "docStatus",
            "status",
          ],
        })
        .populate({
          path: "bankAccountDetails.docId",
          select: [
            "path",
            "uploadedBy",
            "mimetype",
            "approvedBy",
            "docStatus",
            "status",
          ],
        })
        .populate({
          path: "otherDocument",
          select: [
            "path",
            "uploadedBy",
            "mimetype",
            "approvedBy",
            "docStatus",
            "status",
          ],
        })
        .then((user) => {
          res.send({ status: true, message: "Customer find", data: user });
        });
    }
  });
});

standardRoute.post("/investment-customer-list", async function (req, res) {
  await UserModel.findOne({ rememberToken: req.query.token }).then(
    async (user) => {
      await CustomerModel.find({
        referralCode: user.referralCode,
        applicationSubmitted: true,
      })
        .select(["_id", "firstName", "lastName", "franchise", "currentPlan"])
        .then(async (cus) => {
          PlanModel.find({})
            .select(["packageName"])
            .then((plan) => {
              res.send({
                status: true,
                message: "Customer list",
                data: { plan: plan, customer: cus },
              });
            });
        });
    }
  );
});

standardRoute.post("/list-transaction", async function (req, res) {
  const fromDate = new Date(req.body.fromDate);
  fromDate.setHours(0, 0, 0, 0); // Set to the beginning of the day
  const toDate = new Date(req.body.toDate);
  toDate.setHours(23, 59, 59, 999); // Set to the end of the day

  const query = { $or: [], $and: [] };
  if (req.body.clientId !== "") {
    query.$or.push({ clientId: req.body.clientId });
  }
  if (req.body.fromDate !== "") {
    query.$and.push({ created_at: { $gte: fromDate } });
  }
  if (req.body.toDate !== "") {
    query.$and.push({ created_at: { $lte: toDate } });
  }

  await UserModel.findOne({ rememberToken: req.query.token }).then(
    async (user) => {
      //   query.$and.push({ clientId: user._id });
      if (query.$or.length === 0) {
        delete query.$or;
      }
      if (query.$and.length === 0) {
        delete query.$and;
      }
      TransactionModel.find(query)
        .populate({ path: "clientId", select: ["firstName", "lastName"] })
        .sort({ created_at: 1 })
        .then((trans) => {
          res.send({ status: true, message: "Transaction list", data: trans });
        })
        .catch((error) => {
          res.send({
            status: false,
            message: "Error",
            data: error,
            qur: query,
          });
        });
    }
  );
});

standardRoute.post("/list-investment", async function (req, res) {
  const fromDate = new Date(req.body.fromDate);
  fromDate.setHours(0, 0, 0, 0); // Set to the beginning of the day
  const toDate = new Date(req.body.toDate);
  toDate.setHours(23, 59, 59, 999); // Set to the end of the day

  const query = { $or: [], $and: [] };
  if (req.body.clientId !== "") {
    query.$or.push({ customerId: req.body.clientId });
  }
  if (req.body.planId !== "") {
    query.$or.push({ planId: req.body.planId });
  }
  if (req.body.fromDate !== "") {
    query.$and.push({ created_at: { $gte: fromDate } });
  }
  if (req.body.toDate !== "") {
    query.$and.push({ created_at: { $lte: toDate } });
  }

  await UserModel.findOne({ rememberToken: req.query.token }).then(
    async (user) => {
      //   query.$and.push({ clientId: user._id });
      if (query.$or.length === 0) {
        delete query.$or;
      }
      if (query.$and.length === 0) {
        delete query.$and;
      }
      InvestmentModel.find(query)
        .populate({ path: "customerId", select: ["firstName", "lastName"] })
        .populate({ path: "planId", select: ["packageName"] })
        .sort({ created_at: 1 })
        .then((trans) => {
          res.send({ status: true, message: "Transaction list", data: trans });
        })
        .catch((error) => {
          res.send({
            status: false,
            message: "Error",
            data: error,
            qur: query,
          });
        });
    }
  );
});

standardRoute.get("/report-plan", async function (req, res) {
  await UserModel.findOne({ rememberToken: req.query.token }).then(
    async (user) => {
      await PlanModel.find({})
        .then(function (plans) {
          let colte = [];
          plans.map(async function (plan, x) {
            let balance = 0;
            let cusCount = [];
            await InvestmentModel.find({
              planId: plan._id,
            })
              .populate({ path: "customerId", select: ["referralCode"] })
              .then(async function (invest) {
                invest.map((inv, i) => {
                  if (
                    inv.customerId.referralCode !== undefined &&
                    inv.customerId.referralCode === user.referralCode
                  ) {
                    balance += inv.investmentAmount;
                    cusCount.push(inv.customerId);
                  }
                  if (i === invest.length - 1) {
                    const unique = [...new Set(cusCount)];
                    const bb = {
                      planId: plan._id,
                      planName: plan.packageName,
                      balance: balance,
                      customerCount: cusCount.length,
                    };
                    // console.log(bb);
                    colte.push(bb);
                  }
                });
              });
            if (x === plans.length - 1) {
              //   console.log(colte);
              res.send({ status: true, message: "Plan count", data: colte });
            }
          });
        })
        .catch(function (err) {
          res.send({ status: false, message: "Error", data: err });
        });
    }
  );
});

const getInvestmentData = async (customerId, req) => {
  //   console.log(customerId, req);
  //   return;
  const fromDate = new Date(req.fromDate);
  fromDate.setHours(0, 0, 0, 0); // Set to the beginning of the day
  const toDate = new Date(req.toDate);
  toDate.setHours(23, 59, 59, 999); // Set to the end of the day
  const query = { $or: [], $and: [] };
  if (req.clientId !== "") {
    query.$and.push({ customerId: req.clientId });
  }
  if (req.planId !== "" && req.planId !== undefined) {
    query.$and.push({ planId: req.planId });
  }
  if (req.fromDate !== "") {
    query.$and.push({ created_at: { $gte: fromDate } });
  }
  if (req.toDate !== "") {
    query.$and.push({ created_at: { $lte: toDate } });
  }
  query.$and.push({ customerId: customerId });
  if (query.$or.length === 0) {
    delete query.$or;
  }
  if (query.$and.length === 0) {
    delete query.$and;
  }
  console.log(query);
  const inv = await InvestmentModel.find(query)
    .populate({ path: "transRefId", select: ["maturityDate"] })
    .populate({ path: "planId", select: ["packageName"] })
    .populate({
      path: "customerId",
      select: ["firstName", "lastName", "_id", "customerId"],
    });

  const make = [];
  for (let i = 0; i < inv.length; i++) {
    const invest = inv[i];
    const ss = {
      clientId: invest.customerId._id,
      customerId: invest.customerId.customerId,
      clientName:
        invest.customerId.firstName + " " + invest.customerId.lastName,
      capitalDate: invest.created_at,
      maturityDate: invest.transRefId.maturityDate,
      capitalInvested: invest.investmentAmount,
      payoutOutTimePeriod: "1 Month",
      branch: "",
      createdBy: "",
      createdAt: invest.created_at,
      packageName: invest.planId.packageName,
    };
    make.push(ss);
  }
  return make;
};

standardRoute.post("/plan-wise-users", async function (req, res) {
  //   console.log(req.body);
  //   return;
  if (req.body.currentPlan !== "") {
    await UserModel.findOne({ rememberToken: req.query.token }).then(
      async (user) => {
        await CustomerModel.find({ referralCode: user.referralCode })
          .sort({ updated_at: -1 })
          .then(async (result) => {
            let colte = [];
            for (let x = 0; x < result.length; x++) {
              const cc = result[x];
              const make = await getInvestmentData(cc._id, req.body.filter); // Call the async function
              colte = colte.concat(make);

              if (x === result.length - 1) {
                //   console.log(colte);
                res.send({
                  status: true,
                  message: "Fetch Successfully",
                  data: colte,
                  package: colte.length > 0 ? colte[0].packageName : "", // Access package from first element
                });
              }
            }
          });
      }
    );
  }
});

const getInvestmentExpireData = async (customerId, req) => {
  const fromDate = new Date(req.fromDate);
  //   fromDate.setHours(0, 0, 0, 0); // Set to the beginning of the day
  const toDate = new Date(req.toDate);
  //   toDate.setHours(23, 59, 59, 999); // Set to the end of the day
  const query = { $or: [], $and: [] };
  if (req.clientId !== "") {
    query.$and.push({ customerId: req.clientId });
  }
  if (req.planId !== "" && req.planId !== undefined) {
    query.$and.push({ planId: req.planId });
  }
  query.$and.push({ customerId: customerId });
  if (query.$or.length === 0) {
    delete query.$or;
  }
  if (query.$and.length === 0) {
    delete query.$and;
  }
  console.log(fromDate, toDate);
  const inv = await InvestmentModel.find(query)
    .populate({
      path: "transRefId",
      select: ["maturityDate"],
      match: {
        maturityDate: { $gte: fromDate, $lte: toDate },
        maturityDate: { $exists: true },
      },
    })
    .populate({ path: "planId", select: ["packageName"] })
    .populate({
      path: "customerId",
      select: ["firstName", "lastName", "_id", "customerId", "phone"],
    });

  const make = [];
  for (let i = 0; i < inv.length; i++) {
    const invest = inv[i];
    const ss = {
      clientId: invest.customerId._id,
      customerId: invest.customerId.customerId,
      clientName:
        invest.customerId.firstName + " " + invest.customerId.lastName,
      phone: invest.customerId.phone,
      capitalDate: invest.created_at,
      maturityDate: invest.transRefId.maturityDate,
      capitalInvested: invest.investmentAmount,
      payoutOutTimePeriod: "1 Month",
      branch: "",
      createdBy: "",
      createdAt: invest.created_at,
      packageName: invest.planId.packageName,
    };
    if (
      invest.transRefId.maturityDate > fromDate &&
      invest.transRefId.maturityDate < toDate
    ) {
      make.push(ss);
    }
  }
  return make;
};

standardRoute.post("/list-plan-expires", async function (req, res) {
  //   console.log(req.body);
  //   return;
  if (req.body.currentPlan !== "") {
    await UserModel.findOne({ rememberToken: req.query.token }).then(
      async (user) => {
        await CustomerModel.find({ referralCode: user.referralCode })
          .sort({ updated_at: -1 })
          .then(async (result) => {
            let colte = [];
            for (let x = 0; x < result.length; x++) {
              const cc = result[x];
              const make = await getInvestmentExpireData(
                cc._id,
                req.body.filter
              );
              colte = colte.concat(make);

              if (x === result.length - 1) {
                //   console.log(colte);
                res.send({
                  status: true,
                  message: "Fetch Successfully",
                  data: colte,
                  package: colte.length > 0 ? colte[0].packageName : "", // Access package from first element
                });
              }
            }
          });
      }
    );
  }
});

standardRoute.post("/book-slot", async (req, res) => {
  CustomerModel.findById(req.body.userid)
    .select(["firstName", "lastName", "email", "phone", "_id"])
    .then(async (detail) => {
      console.log(detail);
      const receipt = "order_rcptid_" + Date.now();
      var options = {
        amount: 500 * 100, // amount in the smallest currency unit
        currency: "INR",
        receipt: receipt,
      };
      instance.orders.create(options, async function (err, order) {
        res.send({
          type: "success",
          data: order,
          amount: 500,
          detail: detail,
        });
      });
    });
});

standardRoute.post("/confirm-book-slot", async (req, res) => {
  await UserModel.findOne({ rememberToken: req.query.token }).then(
    async (user) => {
      const colte = req.body;
      colte.agent = user._id;
      delete colte._id;
      SlotModel.create(colte)
        .then((slot) => {
          SlotModel.find({ agent: user._id })
            .populate({
              path: "userid",
              select: [
                "firstName",
                "lastName",
                "email",
                "referralCode",
                "customerId",
                "_id",
              ],
            })
            .populate({
              path: "agent",
              select: ["name"],
            })
            .populate({
              path: "plan",
              select: ["packageName"],
            })
            .then((slots) => {
              res.send({
                type: true,
                message: "Slot booked successfully",
                data: slots,
              });
            });
        })
        .catch((error) => {
          res.send({
            type: false,
            message: error?.message,
            data: error,
          });
        });
    }
  );
});

standardRoute.post("/search-investor", async (req, res) => {
  const query = { $or: [] };

  query.$or.push({ email: req.body.search });
  query.$or.push({ customerId: req.body.search });
  if (!isNaN(req.body.search)) {
    query.$or.push({ phone: req.body.search });
  }
  CustomerModel.findOne(query)
    .select([
      "firstName",
      "lastName",
      "email",
      "referralCode",
      "customerId",
      "_id",
    ])
    .then((result) => {
      res.send({
        type: true,
        message: "Record found",
        data: result,
      });
    })
    .catch((error) => {
      res.send({
        type: false,
        message: error?.message,
        data: error,
      });
    });
});

standardRoute.post("/list-slot", async (req, res) => {
  await UserModel.findOne({ rememberToken: req.query.token }).then(
    async (user) => {
      SlotModel.find({ agent: user._id })
        .populate({
          path: "userid",
          select: [
            "firstName",
            "lastName",
            "email",
            "referralCode",
            "customerId",
            "_id",
          ],
        })
        .populate({
          path: "agent",
          select: ["name"],
        })
        .populate({
          path: "plan",
          select: ["packageName"],
        })
        .then((slots) => {
          res.send({
            type: true,
            message: "Slot list found",
            data: slots,
          });
        });
    }
  );
});

standardRoute.post("/slot-complete", async (req, res) => {
  await UserModel.findOne({ rememberToken: req.query.token }).then(
    async (user) => {
      SlotModel.findOneAndUpdate(
        { _id: req.body.id },
        { $set: { completed_at: new Date() } }
      ).then((slot) => {
        SlotModel.find({ agent: user._id })
          .populate({
            path: "userid",
            select: [
              "firstName",
              "lastName",
              "email",
              "referralCode",
              "customerId",
              "_id",
            ],
          })
          .populate({
            path: "agent",
            select: ["name"],
          })
          .populate({
            path: "plan",
            select: ["packageName"],
          })
          .then((slots) => {
            res.send({
              type: true,
              message: "Slot updated successfully",
              data: slots,
            });
          });
      });
    }
  );
});
standardRoute.post("/update-slot", async (req, res) => {
  await UserModel.findOne({ rememberToken: req.query.token }).then(
    async (user) => {
      const colte = req.body;
      delete colte._id;
      SlotModel.findByIdAndUpdate(req.body._id, { $set: colte })
        .then((slot) => {
          SlotModel.find({ agent: user._id })
            .populate({
              path: "userid",
              select: [
                "firstName",
                "lastName",
                "email",
                "referralCode",
                "customerId",
                "_id",
              ],
            })
            .populate({
              path: "agent",
              select: ["name"],
            })
            .populate({
              path: "plan",
              select: ["packageName"],
            })
            .then((slots) => {
              res.send({
                type: true,
                message: "Slot booked successfully",
                data: slots,
              });
            });
        })
        .catch((error) => {
          res.send({
            type: false,
            message: error?.message,
            data: error,
          });
        });
    }
  );
});

module.exports = standardRoute;
