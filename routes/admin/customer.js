const express = require("express");
const mongoose = require("mongoose");
const { customerSchema, numCount } = require("../../models/customer");
const { agentRequestForm, planSchema } = require("../../models/investment");
const bcrypt = require("bcrypt");

const customerRoute = express.Router();

const { userSchema } = require("../../models/auth");
const { attachmentSchema } = require("../../models/customer");

const PlanModel = mongoose.model("plan", planSchema);
const UserModel = mongoose.model("user", userSchema);
const CustomerModel = mongoose.model("customer", customerSchema);
const AgentFormModel = mongoose.model("agent_form", agentRequestForm);
const NumCountModel = mongoose.model("numcount", numCount);
const UploadModel = mongoose.model("upload", attachmentSchema);

customerRoute.get("/list-customer", function (req, res) {
  CustomerModel.find({}).then(function (user) {
    res.send({ status: true, message: "Customer List", data: user });
  });
});

customerRoute.get("/list-page-customer", function (req, res) {
  CustomerModel.find({})
    .select([
      "firstName",
      "lastName",
      "phone",
      "email",
      "currentPlan",
      "_id",
      "created_at",
    ])
    .populate({ path: "currentPlan", select: ["packageName"] })
    .then(function (user) {
      res.send({ status: true, message: "Customer List", data: user });
    });
});

async function getUserCount() {
  return await NumCountModel.countDocuments({ type: "customer" }).then(
    async (count) => {
      if (count > 0) {
        return await NumCountModel.findOne({ type: "customer" })
          .sort({ newId: -1 })
          .then(async function (customer) {
            return await NumCountModel.create({
              type: "customer",
              numCount: customer.numCount + 1,
            }).then(function (numCount) {
              return customer.numCount + 1;
            });
          });
      } else {
        return await NumCountModel.create({
          type: "customer",
          numCount: 1,
        }).then(function (numCount) {
          return 1;
        });
      }
    }
  );
}

customerRoute.post("/create-customer", async function (req, res) {
  let colte = req.body;
  await getUserCount().then(function (userCount) {
    colte.customerId = "KKBK000" + userCount;
  });
  await UserModel.findOne({
    rememberToken: req.query.token,
  }).then(async function (existsUser) {
    colte.createdBy = existsUser._id;
    colte.branch = existsUser.branch;
    colte.franchise = existsUser.franchise;
    delete colte._id;
    await bcrypt.hash(colte.password, 10).then(async function (hash) {
      // Store hash in your password DB.
      colte.password = hash;
      await CustomerModel.countDocuments({
        email: req.body.email,
        phone: req.body.phone,
      }).then((count) => {
        if (count !== 0) {
          res.send({ status: false, message: "Customer already exists" });
        } else {
          CustomerModel.create(colte)
            .then((user) => {
              res.send({
                status: true,
                message: "Customer created successfully",
              });
            })
            .catch((error) => {
              res.send({ status: false, message: "Error", data: error });
            });
        }
      });
    });
  });
});

customerRoute.post("/edit-customer", async function (req, res) {
  await CustomerModel.countDocuments({ _id: req.body._id }).then((count) => {
    if (count === 0) {
      res.send({ status: false, message: "Customer not found" });
    } else {
      PlanModel.find({}).then((plan) => {
        CustomerModel.find({ referralEligibility: true }).then((customer) => {
          CustomerModel.findOne({ _id: req.body._id }).then((user) => {
            res.send({
              status: true,
              message: "Customer find",
              data: { customer: customer, user: user, plan: plan },
            });
          });
        });
      });
    }
  });
});

customerRoute.post("/update-customer", async function (req, res) {
  await CustomerModel.countDocuments({ _id: req.body._id }).then(
    async (count) => {
      if (count === 0) {
        res.send({ status: false, message: "Customer not found" });
      } else {
        const alldata = req.body;
        await bcrypt.hash(alldata.password, 10).then(function (hash) {
          // Store hash in your password DB.
          if (alldata.password !== undefined && alldata.password !== "") {
            alldata.password = hash;
          } else {
            delete alldata.password;
          }
        });
        CustomerModel.findOneAndUpdate({ _id: req.body._id }, alldata)
          .then((user) => {
            res.send({
              status: true,
              message: "Customer updated successfully",
            });
          })
          .catch((error) => {
            res.send({ status: false, message: "Error", data: error });
          });
      }
    }
  );
});

customerRoute.post("/delete-customer", async function (req, res) {
  await CustomerModel.countDocuments({ _id: req.body._id }).then((count) => {
    if (count === 0) {
      res.send({ status: false, message: "Customer not found" });
    } else {
      CustomerModel.findOneAndDelete({ _id: req.body._id }).then((user) => {
        res.send({ status: true, message: "Customer deleted successfully" });
      });
    }
  });
});

customerRoute.post("/change-customer-password", async function (req, res) {
  const alldata = req.body;
  await CustomerModel.findOne({
    _id: req.body._id,
  }).then(async function (existsUser) {
    // console.log(req.body.passowrd, existsUser.password);
    if (existsUser !== null) {
      await bcrypt
        .compare(req.body.oldpassword, existsUser.password)
        .then(async function (result) {
          console.log(result);
          if (result) {
            await bcrypt.hash(alldata.password, 10).then(function (hash) {
              // Store hash in your password DB.
              if (alldata.password !== undefined && alldata.password !== "") {
                alldata.password = hash;
                CustomerModel.findOneAndUpdate(
                  { _id: req.body._id },
                  { password: alldata.password }
                )
                  .then((user) => {
                    res.send({
                      status: true,
                      message: "Password changed successfully",
                    });
                  })
                  .catch((error) => {
                    res.send({ status: false, message: "Error", data: error });
                  });
              }
            });
          } else {
            res.send({
              status: false,
              message: "Username or Password Incorrect!",
            });
          }
        });
    }
  });
});

customerRoute.post("/customer-detail", async function (req, res) {
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

customerRoute.post(
  "/update-other-document/:customerId",
  async function (req, res) {
    await CustomerModel.countDocuments({ _id: req.body._id }).then((count) => {
      if (count === 0) {
        res.send({ status: false, message: "Customer not found" });
      } else {
        CustomerModel.findOneAndUpdate(
          { _id: req.params.customerId },
          { otherDocument: req.body.otherDocument }
        )
          .then((user) => {
            res.send({ status: true, message: "Customer updated" });
          })
          .catch((error) => {
            res.send({ status: false, message: "Error", data: error });
          });
      }
    });
  }
);

customerRoute.post("/update-customer-status", async function (req, res) {
  await UserModel.findOne({ rememberToken: req.query.token })
    .then(async (count) => {
      CustomerModel.findOneAndUpdate(
        { _id: req.body._id },
        {
          approvedBy: count._id,
          status: req.body.status,
        }
      )
        .then((user) => {
          res.send({ status: true, message: "Customer updated" });
        })
        .catch((error) => {
          res.send({ status: false, message: "Error", data: error });
        });
    })
    .catch(() => {
      res.send({ status: false, message: "Customer not found" });
    });
});

customerRoute.post(
  "/update-customer-application-status",
  async function (req, res) {
    await UserModel.findOne({ rememberToken: req.query.token })
      .then(async (count) => {
        CustomerModel.findOneAndUpdate(
          { _id: req.body._id },
          {
            applicationStatus: req.body.applicationStatus,
            applicationReason: req.body.applicationReason,
          }
        )
          .then((user) => {
            res.send({ status: true, message: "Customer updated" });
          })
          .catch((error) => {
            res.send({ status: false, message: "Error", data: error });
          });
      })
      .catch(() => {
        res.send({ status: false, message: "Customer not found" });
      });
  }
);

customerRoute.post("/update-profilePhoto-status", async function (req, res) {
  await UserModel.findOne({ _id: req.body._id })
    .then((count) => {
      UploadModel.findOneAndUpdate(
        { _id: count.profilePhoto.docId },
        {
          approvedBy: count._id,
          docStatus: req.body.docStatus,
          status: req.body.status,
        }
      )
        .then((user) => {
          res.send({ status: true, message: "Customer updated" });
        })
        .catch((error) => {
          res.send({ status: false, message: "Error", data: error });
        });
    })
    .catch(() => {
      res.send({ status: false, message: "Customer not found" });
    });
});

customerRoute.post("/update-panDetails-status", async function (req, res) {
  await UserModel.findOne({ _id: req.body._id })
    .then((count) => {
      UploadModel.findOneAndUpdate(
        { _id: count.panDetails.docId },
        {
          approvedBy: count._id,
          docStatus: req.body.docStatus,
          status: req.body.status,
        }
      )
        .then((user) => {
          res.send({ status: true, message: "Customer updated" });
        })
        .catch((error) => {
          res.send({ status: false, message: "Error", data: error });
        });
    })
    .catch((err) => {
      res.send({ status: false, message: "Customer not found", data: err });
    });
});

customerRoute.post("/update-aadharDetails-status", async function (req, res) {
  await UserModel.findOne({ _id: req.body._id })
    .then((count) => {
      UploadModel.findOneAndUpdate(
        { _id: count.aadharDetails.docId },
        {
          approvedBy: count._id,
          docStatus: req.body.docStatus,
          status: req.body.status,
        }
      )
        .then((user) => {
          res.send({ status: true, message: "Customer updated" });
        })
        .catch((error) => {
          res.send({ status: false, message: "Error", data: error });
        });
    })
    .catch(() => {
      res.send({ status: false, message: "Customer not found" });
    });
});

customerRoute.post(
  "/update-bankAccountDetails-status",
  async function (req, res) {
    await UserModel.findOne({ _id: req.body._id })
      .then((count) => {
        UploadModel.findOneAndUpdate(
          { _id: count.bankAccountDetails.docId },
          {
            approvedBy: count._id,
            docStatus: req.body.docStatus,
            status: req.body.status,
          }
        )
          .then((user) => {
            res.send({ status: true, message: "Customer updated" });
          })
          .catch((error) => {
            res.send({ status: false, message: "Error", data: error });
          });
      })
      .catch(() => {
        res.send({ status: false, message: "Customer not found" });
      });
  }
);

customerRoute.post("/customer-rejected", async function (req, res) {
  await CustomerModel.countDocuments({ _id: req.body._id }).then((count) => {
    if (count === 0) {
      res.send({ status: false, message: "Customer not found" });
    } else {
      CustomerModel.findOneAndUpdate(
        { _id: req.body._id },
        { applicationReason: req.body.applicationReason, applicationStatus: 2 }
      )
        .then((user) => {
          res.send({ status: true, message: "Customer updated" });
        })
        .catch((error) => {
          res.send({ status: false, message: "Error", data: error });
        });
    }
  });
});

customerRoute.post("/customer-approved", async function (req, res) {
  await CustomerModel.countDocuments({ _id: req.body._id }).then((count) => {
    if (count === 0) {
      res.send({ status: false, message: "Customer not found" });
    } else {
      CustomerModel.findOneAndUpdate(
        { _id: req.body._id },
        {
          applicationReason: req.body.applicationReason,
          applicationStatus: 1,
          status: true,
        }
      )
        .then((user) => {
          res.send({ status: true, message: "Customer updated" });
        })
        .catch((error) => {
          res.send({ status: false, message: "Error", data: error });
        });
    }
  });
});

customerRoute.post("/customer-pending", async function (req, res) {
  await CustomerModel.countDocuments({ _id: req.body._id }).then((count) => {
    if (count === 0) {
      res.send({ status: false, message: "Customer not found" });
    } else {
      CustomerModel.findOneAndUpdate(
        { _id: req.body._id },
        { applicationStatus: 0 }
      )
        .then((user) => {
          res.send({ status: true, message: "Customer updated" });
        })
        .catch((error) => {
          res.send({ status: false, message: "Error", data: error });
        });
    }
  });
});

customerRoute.post("/customer-deleted", async function (req, res) {
  await CustomerModel.countDocuments({ _id: req.body._id }).then((count) => {
    if (count === 0) {
      res.send({ status: false, message: "Customer not found" });
    } else {
      CustomerModel.findOneAndUpdate(
        { _id: req.body._id },
        {
          applicationReason: req.body.applicationReason,
          applicationStatus: 3,
          status: false,
        }
      )
        .then((user) => {
          res.send({ status: true, message: "Customer updated" });
        })
        .catch((error) => {
          res.send({ status: false, message: "Error", data: error });
        });
    }
  });
});

customerRoute.get("/list-customer-status/:status", async function (req, res) {
  await CustomerModel.find({ applicationStatus: req.params.status })
    .then((user) => {
      res.send({ status: true, message: "Customer list", data: user });
    })
    .catch((error) => {
      res.send({ status: false, message: "Error", data: error });
    });
});

customerRoute.post("/customer-assign-package", async function (req, res) {
  await CustomerModel.countDocuments({ _id: req.body._id }).then((count) => {
    if (count === 0) {
      res.send({ status: false, message: "Customer not found" });
    } else {
      CustomerModel.findOneAndUpdate(
        { _id: req.body._id },
        { currentPlan: req.body.currentPlan }
      )
        .then((user) => {
          res.send({ status: true, message: "Customer updated" });
        })
        .catch((error) => {
          res.send({ status: false, message: "Error", data: error });
        });
    }
  });
});

customerRoute.post("/agent-request-form", async function (req, res) {
  await AgentFormModel.create(req.body)
    .then((user) => {
      res.send({ status: true, message: "Form submitted successfully" });
    })
    .catch((error) => {
      res.send({ status: false, message: "Error", data: error });
    });
});

customerRoute.get("/list-agent-request-form", async function (req, res) {
  await AgentFormModel.find({})
    .then((user) => {
      res.send({
        status: true,
        message: "Agent form request list",
        data: user,
      });
    })
    .catch((error) => {
      res.send({ status: false, message: "Error", data: error });
    });
});

customerRoute.post("/update-agent-request-form", async function (req, res) {
  const colte = req.body;
  delete colte._id;
  await AgentFormModel.findByIdAndUpdate(req.body._id, colte)
    .then((user) => {
      res.send({ status: true, message: "Agent form request updated" });
    })
    .catch((error) => {
      res.send({ status: false, message: "Error", data: error });
    });
});

module.exports = customerRoute;
