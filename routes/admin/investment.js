const express = require('express');
const mongoose = require('mongoose');
const {planSchema,transactionSchema,currencySchema,investmentSchema,withdrawSchema} = require('../../models/investment');
const {customerSchema} = require('../../models/customer');

const investmentRouter = express.Router();

const CurrencyModel = mongoose.model('currency', currencySchema);
const InvestmentModel = mongoose.model('investment', investmentSchema);
const WithdrawModel = mongoose.model('withdraw', withdrawSchema);

const PlanModel = mongoose.model('plan', planSchema);
const TransactionModel = mongoose.model('transaction', transactionSchema);
const CustomerModel = mongoose.model('customer', customerSchema);

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

investmentRouter.get('/list-plan', function (req, res) {
    PlanModel.find({}).then(function (Branch) {
        res.send({status: true, message: "Plan List", data: Branch});
    });
});

investmentRouter.post('/create-plan', async function (req, res) {
    let colte = req.body;
    await PlanModel.countDocuments({packageName: req.body.packageName}).then((count) => {
        if(count!==0){
            res.send({status: false, message: "Plan already exists"});
        }else{
            PlanModel.create(colte).then((Branch) => {
                res.send({status: true, message: "Plan created successfully"});
            }).catch((error) => {
                res.send({status: false, message: "Error", data: error});
            });
        }
    })
});

investmentRouter.post('/edit-plan', async function (req, res) {

    await PlanModel.countDocuments({_id: req.body._id}).then((count) => {
        if(count===0){
            res.send({status: false, message: "Plan not found"});
        }else{
            PlanModel.findOne({_id: req.body._id}).then((Branch) => {
                res.send({status: true, message: "Plan find", data: Branch});
            })
        }
    })
});

investmentRouter.post('/update-plan', async function (req, res) {

    await PlanModel.countDocuments({_id: req.body._id}).then(async (count) => {
        if(count===0){
            res.send({status: false, message: "Plan not found"});
        }else{
            PlanModel.findOneAndUpdate({_id: req.body._id}, req.body).then((Branch) => {
                res.send({status: true, message: "Plan updated successfully"});
            })
        }
    })
});

investmentRouter.post('/delete-plan', async function (req, res) {

    await PlanModel.countDocuments({_id: req.body._id}).then((count) => {
        if(count===0){
            res.send({status: false, message: "Plan not found"});
        }else{
            PlanModel.findOneAndDelete({_id: req.body._id}).then((Branch) => {
                res.send({status: true, message: "Plan deleted successfully"});
            })
        }
    })
});

investmentRouter.post('/assign-plan', async function (req, res) {

    await PlanModel.countDocuments({_id: req.body._id}).then((count) => {
        if(count===0){
            res.send({status: false, message: "Plan not found"});
        }else{
            PlanModel.findOneAndDelete({_id: req.body._id}).then((Branch) => {
                res.send({status: true, message: "Plan deleted successfully"});
            })
        }
    })
});

investmentRouter.post('/customer-transaction', async function (req, res) {
    const colte = req.body;
    colte.txnId = makeid(15);

    await TransactionModel.countDocuments({}).then(async function (count) {
        colte.txnNo = count+1;
        if(count==0){
            colte.balance = req.body.amount;
            colte.maturityDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1));
        }else{
            await TransactionModel.findOne({clientId: req.body.clientId}).sort({"created_at": -1}).then(async function (trans) {
                if(req.body.type === "debit"){
                    colte.balance = trans.balance-req.body.amount;
                }else if(req.body.type === "credit") {
                    colte.balance = trans.balance+req.body.amount;
                }
            })
        }
        await TransactionModel.create(colte).then( function (transaction) {
            res.send({status: true, message: "Transaction created successfully"});
        }).catch( function (error) {
            res.send({status: false, message: "Error creating transaction", data: error});
        })
    })
})


investmentRouter.post('/assign-plan-customer', async function (req, res) {

    await CustomerModel.findByIdAndUpdate({_id: req.body._id}, {currentPlan: req.body.planId}).then( function (customer) {
        res.send({status: true, message: "Plan assign successfully"});
    }).catch( function (error) {
        res.send({status: false, message: "Error assigning plan", data: error});
    })
})


investmentRouter.get('/list-currency', async function (req, res) {
    
    CurrencyModel.find({}).then((currency) => {
        res.send({status: true, message: "Currency list", data: currency});
    }).catch((error) => {
        res.send({status: false, message: "Error", data: error});
    })
});


investmentRouter.post('/create-currency', async function (req, res) {
    let colte = req.body;
    await CurrencyModel.countDocuments({currencyCode: req.body.currencyCode, country: req.body.country}).then((count) => {
        if(count!==0){
            res.send({status: false, message: "Currency already exists"});
        }else{
            CurrencyModel.create(colte).then((Currency) => {
                res.send({status: true, message: "Currency created successfully"});
            }).catch((error) => {
                res.send({status: false, message: "Error", data: error});
            });
        }
    })
});


investmentRouter.post('/update-currency', async function (req, res) {
    let colte = req.body;
    await CurrencyModel.countDocuments({currencyCode: req.body.currencyCode, country: req.body.country, _id: {$ne: req.body._id}}).then((count) => {
        if(count!==0){
            res.send({status: false, message: "Currency already exists"});
        }else{
            CurrencyModel.findOneAndUpdate({_id: req.body._id}, colte).then((Currency) => {
                res.send({status: true, message: "Currency updated successfully"});
            }).catch((error) => {
                res.send({status: false, message: "Error", data: error});
            });
        }
    })
});


investmentRouter.post('/delete-currency', async function (req, res) {
    CurrencyModel.findOneAndDelete(req.body._id).then(async (currency) => {
        await CurrencyModel.find({}).then((currency) => {
            res.send({status: true, message: "Currency list", data: currency});
        })
    }).catch((error) => {
        res.send({status: false, message: "Error", data: error});
    });
});


investmentRouter.post('/push-to-investment', async function (req, res) {
    
    await TransactionModel.countDocuments({_id: req.body._id, invested: false}).then(async function (count) {
        if(count==0){
            res.send({status: false, message: "Error! No transaction found"});
        }else{
            await TransactionModel.findOne({_id: req.body._id}).populate({path: "currencyId", select: "currencyCode"}).populate({path: "clientId", select: "currentPlan"}).populate({path: "planId", select: "percentage"}).sort({created_at: -1}).then(async function (trans) {
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
                }
                await InvestmentModel.create(colte).then(async () => {
                    await TransactionModel.findByIdAndUpdate(req.body._id, {invested: true}).then(() => {
                        res.send({status: true, message: "Investment successfull", data: colte});
                    });
                })
            })
        }
    })
})

async function createTransaction(req){
    const colte = req;
    colte.txnId = makeid(15);
    
    return await TransactionModel.countDocuments({}).then(async function (count) {
        colte.txnNo = count+1;
        if(count==0 && colte.balance==0){
            // colte.balance = req.amount;
        }else{
            await TransactionModel.findOne({clientId: req.clientId}).sort({"created_at": -1}).then(async function (trans) {
                colte.maturityDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1));
                colte.branch = trans.branch;
                colte.balance = req.amount;
            })
        }
        return await TransactionModel.create(colte);
    })
}

investmentRouter.post('/push-to-reinvestment', async function (req, res) {
    
    await InvestmentModel.countDocuments({_id: req.body._id, status: true}).then(async function (count) {
        if(count==0){
            res.send({status: false, message: "Error! No transaction found"});
        }else{
            await InvestmentModel.findOne({_id: req.body._id}).then(async function (inv) {
                await InvestmentModel.findByIdAndUpdate(req.body._id, {status: false});
                await TransactionModel.updateMany({clientId: inv.customerId}, {$set: {balanceExpire: true}});
                // create new transaction for reinvestment
                const colte = {
                    "clientId": inv.customerId,
                    "planId": inv.planId,
                    "txnNo": "",
                    "txnId": "",
                    "particular": "Money reinvested",
                    "type": "credit",
                    "currencyId": inv.currencyId,
                    "amount": inv.totalAmountInvested,
                    "balance": inv.totalAmountInvested,
                    "description": "reinvest",
                    "modeOfPayment": "Internal",
                    "maturityDate": "",
                    "branch": "",
                    "invested": true,
                    "reInvest": true
                };
                return createTransaction(colte).then(async function(result) {
                    // console.log(result);return;
                    await TransactionModel.findOne({txnId: result.txnId}).populate({path: "currencyId", select: "currencyCode"}).populate({path: "clientId", select: "currentPlan"}).populate({path: "planId", select: "percentage"}).sort({created_at: -1}).then(async function (trans) {
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
                        }
                        await InvestmentModel.create(colte).then(async () => {
                            res.send({status: true, message: "Investment successfull", data: colte});
                        })
                    })
                })
            })
        }
    })
})

investmentRouter.post('/push-to-partial-reinvestment', async function (req, res) {
    
    await InvestmentModel.countDocuments({_id: req.body._id, status: true}).then(async function (count) {
        if(count==0){
            res.send({status: false, message: "Error! No transaction found"});
        }else{
            await InvestmentModel.findOne({_id: req.body._id}).then(async function (inv) {
                if(req.body.withdrawAmount > inv.totalAmountInvested){
                    res.send({status: false, message: "Error! Withdraw amount is greater than invested amount"});
                    return;
                }else if(inv.totalAmountInvested-req.body.withdrawAmount< 80000){
                    res.send({status: false, message: "Error! Withdraw amount has to be greater than one lakh"});
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
                    withdrawRef: "Partial investment amount"
                };
                await WithdrawModel.create(withdrawData);
                const coltew = {
                    "clientId": inv.customerId,
                    "planId": inv.planId,
                    "txnNo": "",
                    "txnId": "",
                    "particular": "Money withdraw and reinvested",
                    "type": "debit",
                    "currencyId": inv.currencyId,
                    "amount": req.body.withdrawAmount,
                    "balance": inv.totalAmountInvested-req.body.withdrawAmount,
                    "description": "patial withdraw",
                    "modeOfPayment": "Internal",
                    "branch": "",
                };
                await createTransaction(coltew);
                await InvestmentModel.findByIdAndUpdate(req.body._id, {status: false});
                await TransactionModel.updateMany({clientId: inv.customerId}, {$set: {balanceExpire: true}});
                // create new transaction for reinvestment
                const colte = {
                    "clientId": inv.customerId,
                    "planId": inv.planId,
                    "txnNo": "",
                    "txnId": "",
                    "particular": "Money reinvested",
                    "type": "credit",
                    "currencyId": inv.currencyId,
                    "amount": inv.totalAmountInvested-req.body.withdrawAmount,
                    "balance": 0,
                    "description": "reinvest",
                    "modeOfPayment": "Internal",
                    "maturityDate": "",
                    "branch": "",
                    "invested": true,
                    "reInvest": true
                };
                return createTransaction(colte).then(async function(result) {
                    // console.log(result);return;
                    await TransactionModel.findOne({txnId: result.txnId}).populate({path: "currencyId", select: "currencyCode"}).populate({path: "clientId", select: "currentPlan"}).populate({path: "planId", select: "percentage"}).sort({created_at: -1}).then(async function (trans) {
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
                        }
                        await InvestmentModel.create(colte).then(async () => {
                            res.send({status: true, message: "Investment successfull", data: colte});
                        })
                    })
                })
            })
        }
    })
})


investmentRouter.post('/push-to-investment-withdraw', async function (req, res) {
    
    await InvestmentModel.countDocuments({_id: req.body._id, status: true}).then(async function (count) {
        if(count==0){
            res.send({status: false, message: "Error! No transaction found"});
        }else{
            await InvestmentModel.findOne({_id: req.body._id}).then(async function (inv) {
                // create new transaction for withdraw reinvestment
                const withdrawData = {
                    withdrawId: makeid(13),
                    investmentRefId: inv._id,
                    transRefId: inv.transRefId,
                    customerId: inv.customerId,
                    planId: inv.planId,
                    currencyId: inv.currencyId,
                    paidAmount: inv.totalAmountInvested,
                    withdrawRef: "Investment full amount"
                };
                await WithdrawModel.create(withdrawData);
                const coltew = {
                    "clientId": inv.customerId,
                    "planId": inv.planId,
                    "txnNo": "",
                    "txnId": "",
                    "particular": "Investment withdraw",
                    "type": "debit",
                    "currencyId": inv.currencyId,
                    "amount": inv.totalAmountInvested,
                    "balance": 0,
                    "description": "full withdraw",
                    "modeOfPayment": "Internal",
                    "branch": "",
                };
                await createTransaction(coltew);
                await InvestmentModel.findByIdAndUpdate(req.body._id, {status: false});
                await TransactionModel.updateMany({clientId: inv.customerId}, {$set: {balanceExpire: true}});
                res.send({status: true, message: "Investment has been updated"});
            })
        }
    })
})

module.exports = investmentRouter;