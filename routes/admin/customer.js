const express = require('express');
const mongoose = require('mongoose');
const {customerSchema} = require('../../models/customer');
const {agentRequestForm} = require('../../models/investment');
const bcrypt = require("bcrypt");

const customerRoute = express.Router();

const CustomerModel = mongoose.model('customer', customerSchema);
const AgentFormModel = mongoose.model('agent_form', agentRequestForm);

customerRoute.get('/list-customer', function (req, res) {
    CustomerModel.find({}).then(function (user) {
        res.send({status: true, message: "Customer List", data: user});
    });
});

async function getUserCount() {
    
    return await CustomerModel.countDocuments({}).then(async (count) => {
        if(count > 0) {
        return await CustomerModel.findOne({}).sort({newId:-1}).then(function (user) {
            // console.log(user);
            return user.newId;
        });
        }else{
            return 0;
        }
    });
}

customerRoute.post('/create-customer', async function (req, res) {
    let colte = req.body;
    // getUserCount().then(function (userCount) {
    //     console.log(userCount);
    //     if(userCount===0){
    //         colte.newId = 1;
    //     }else{
    //         colte.newId = userCount+1;
    //     }
    // });

    await bcrypt.hash(colte.password, 10).then(async function (hash) {
        // Store hash in your password DB.
        colte.password = hash;
        await CustomerModel.countDocuments({email: req.body.email, phone: req.body.phone}).then((count) => {
            if(count!==0){
                res.send({status: false, message: "Customer already exists"});
            }else{
                CustomerModel.create(colte).then((user) => {
                    res.send({status: true, message: "Customer created successfully"});
                }).catch((error) => {
                    res.send({status: false, message: "Error", data: error});
                });
            }
        })
    })
});

customerRoute.post('/edit-customer', async function (req, res) {

    await CustomerModel.countDocuments({_id: req.body._id}).then((count) => {
        if(count===0){
            res.send({status: false, message: "Customer not found"});
        }else{
            CustomerModel.findOne({_id: req.body._id}).then((user) => {
                res.send({status: true, message: "Customer find", data: user});
            })
        }
    })
});

customerRoute.post('/update-customer', async function (req, res) {

    await CustomerModel.countDocuments({_id: req.body._id}).then(async (count) => {
        if(count===0){
            res.send({status: false, message: "Customer not found"});
        }else{
            const alldata = req.body;
            await bcrypt.hash(alldata.password, 10).then(function (hash) {
            // Store hash in your password DB.
            if (alldata.password !== undefined && alldata.password !== "") {
                alldata.password = hash;
            } else {
                delete alldata.password;
            }
            });
            CustomerModel.findOneAndUpdate({_id: req.body._id}, alldata).then((user) => {
                res.send({status: true, message: "Customer updated successfully"});
            }).catch((error) => {
                res.send({status: false, message: "Error", data: error});
            });
        }
    })
});

customerRoute.post('/delete-customer', async function (req, res) {

    await CustomerModel.countDocuments({_id: req.body._id}).then((count) => {
        if(count===0){
            res.send({status: false, message: "Customer not found"});
        }else{
            CustomerModel.findOneAndDelete({_id: req.body._id}).then((user) => {
                res.send({status: true, message: "Customer deleted successfully"});
            })
        }
    })
});


customerRoute.post('/change-password', async function (req, res) {
    const alldata = req.body;
    await CustomerModel.findOne(
        {
          _id: req.body._id,
        }).then(async function ( existsUser) {
            // console.log(req.body.passowrd, existsUser.password);
          if (existsUser !== null) {
            await bcrypt
              .compare(req.body.oldpassword, existsUser.password)
              .then(async function (result) {
                  console.log(result);
                if (( result)) {
                    await bcrypt.hash(alldata.password, 10).then(function (hash) {
                    // Store hash in your password DB.
                        if (alldata.password !== undefined && alldata.password !== "") {
                            alldata.password = hash;    
                            CustomerModel.findOneAndUpdate({_id: req.body._id}, {password: alldata.password}).then((user) => {
                                res.send({status: true, message: "Password changed successfully"});
                            }).catch((error) => {
                                res.send({status: false, message: "Error", data: error});
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
        }) 
});

customerRoute.post('/customer-detail', async function (req, res) {

    await CustomerModel.countDocuments({_id: req.body._id}).then((count) => {
        if(count===0){
            res.send({status: false, message: "Customer not found"});
        }else{
            CustomerModel.findOne({_id: req.body._id}).then((user) => {
                res.send({status: true, message: "Customer find", data: user});
            })
        }
    })
});

customerRoute.post('/update-other-document/:customerId', async function (req, res) {

    await CustomerModel.countDocuments({_id: req.body._id}).then((count) => {
        if(count===0){
            res.send({status: false, message: "Customer not found"});
        }else{
            CustomerModel.findOneAndUpdate({_id: req.params.customerId}, {otherDocument: req.body.otherDocument}).then((user) => {
                res.send({status: true, message: "Customer updated"});
            }).catch((error) => {
                res.send({status: false, message: "Error", data: error});
            });
        }
    })
});

customerRoute.post('/update-profilePhoto-status', async function (req, res) {

    await CustomerModel.countDocuments({_id: req.body._id}).then((count) => {
        if(count===0){
            res.send({status: false, message: "Customer not found"});
        }else{
            CustomerModel.findOneAndUpdate({_id: req.body._id}, {'profilePhoto.docStatus': req.body.status}).then((user) => {
                res.send({status: true, message: "Customer updated"});
            }).catch((error) => {
                res.send({status: false, message: "Error", data: error});
            });
        }
    })
});

customerRoute.post('/update-panDetails-status', async function (req, res) {

    await CustomerModel.countDocuments({_id: req.body._id}).then((count) => {
        if(count===0){
            res.send({status: false, message: "Customer not found"});
        }else{
            CustomerModel.findOneAndUpdate({_id: req.body._id}, {'panDetails.docStatus': req.body.status}).then((user) => {
                res.send({status: true, message: "Customer updated"});
            }).catch((error) => {
                res.send({status: false, message: "Error", data: error});
            });
        }
    })
});

customerRoute.post('/update-aadharDetails-status', async function (req, res) {

    await CustomerModel.countDocuments({_id: req.body._id}).then((count) => {
        if(count===0){
            res.send({status: false, message: "Customer not found"});
        }else{
            CustomerModel.findOneAndUpdate({_id: req.body._id}, {'aadharDetails.docStatus': req.body.status, 'aadharDetails.docStatus': req.body.status}).then((user) => {
                res.send({status: true, message: "Customer updated"});
            }).catch((error) => {
                res.send({status: false, message: "Error", data: error});
            });
        }
    })
});

customerRoute.post('/update-bankAccountDetails-status', async function (req, res) {

    await CustomerModel.countDocuments({_id: req.body._id}).then((count) => {
        if(count===0){
            res.send({status: false, message: "Customer not found"});
        }else{
            CustomerModel.findOneAndUpdate({_id: req.body._id}, {'bankAccountDetails.docStatus': req.body.status}).then((user) => {
                res.send({status: true, message: "Customer updated"});
            }).catch((error) => {
                res.send({status: false, message: "Error", data: error});
            });
        }
    })
});

customerRoute.post('/customer-rejected', async function (req, res) {

    await CustomerModel.countDocuments({_id: req.body._id}).then((count) => {
        if(count===0){
            res.send({status: false, message: "Customer not found"});
        }else{
            CustomerModel.findOneAndUpdate({_id: req.body._id}, {applicationReason: req.body.applicationReason, applicationStatus: 2}).then((user) => {
                res.send({status: true, message: "Customer updated"});
            }).catch((error) => {
                res.send({status: false, message: "Error", data: error});
            });
        }
    })
});

customerRoute.post('/customer-approved', async function (req, res) {

    await CustomerModel.countDocuments({_id: req.body._id}).then((count) => {
        if(count===0){
            res.send({status: false, message: "Customer not found"});
        }else{
            CustomerModel.findOneAndUpdate({_id: req.body._id}, {applicationReason: req.body.applicationReason, applicationStatus: 1, status: true}).then((user) => {
                res.send({status: true, message: "Customer updated"});
            }).catch((error) => {
                res.send({status: false, message: "Error", data: error});
            });
        }
    })
});

customerRoute.post('/customer-pending', async function (req, res) {

    await CustomerModel.countDocuments({_id: req.body._id}).then((count) => {
        if(count===0){
            res.send({status: false, message: "Customer not found"});
        }else{
            CustomerModel.findOneAndUpdate({_id: req.body._id}, {applicationStatus: 0}).then((user) => {
                res.send({status: true, message: "Customer updated"});
            }).catch((error) => {
                res.send({status: false, message: "Error", data: error});
            });
        }
    })
});

customerRoute.post('/customer-deleted', async function (req, res) {

    await CustomerModel.countDocuments({_id: req.body._id}).then((count) => {
        if(count===0){
            res.send({status: false, message: "Customer not found"});
        }else{
            CustomerModel.findOneAndUpdate({_id: req.body._id}, {applicationReason: req.body.applicationReason, applicationStatus: 3, status: false}).then((user) => {
                res.send({status: true, message: "Customer updated"});
            }).catch((error) => {
                res.send({status: false, message: "Error", data: error});
            });
        }
    })
});


customerRoute.get('/list-customer-status/:status', async function (req, res) {

    await CustomerModel.find({applicationStatus: req.params.status}).then((user) => {
        res.send({status: true, message: "Customer list", data: user});
    }).catch((error) => {
        res.send({status: false, message: "Error", data: error});
    });
});

customerRoute.post('/customer-assign-package', async function (req, res) {

    await CustomerModel.countDocuments({_id: req.body._id}).then((count) => {
        if(count===0){
            res.send({status: false, message: "Customer not found"});
        }else{
            CustomerModel.findOneAndUpdate({_id: req.body._id}, {currentPlan: req.body.currentPlan}).then((user) => {
                res.send({status: true, message: "Customer updated"});
            }).catch((error) => {
                res.send({status: false, message: "Error", data: error});
            });
        }
    })
});

customerRoute.post('/agent-request-form', async function (req, res) {
    await AgentFormModel.create(req.body).then((user) => {
        res.send({status: true, message: "Form submitted successfully"});
    }).catch((error) => {
        res.send({status: false, message: "Error", data: error});
    });
});

customerRoute.get('/list-agent-request-form', async function (req, res) {
    await AgentFormModel.find({}).then((user) => {
        res.send({status: true, message: "Agent form request list", data: user});
    }).catch((error) => {
        res.send({status: false, message: "Error", data: error});
    });
});


customerRoute.post('/update-agent-request-form', async function (req, res) {
    const colte = req.body;
    delete colte._id;
    await AgentFormModel.findByIdAndUpdate(req.body._id, colte).then((user) => {
        res.send({status: true, message: "Agent form request updated"});
    }).catch((error) => {
        res.send({status: false, message: "Error", data: error});
    });
});


module.exports = customerRoute;