const express = require('express');
const mongoose = require('mongoose');
const {branchSchema} = require('../../models/branch');

const branchRouter = express.Router();

const BranchModel = mongoose.model('branch', branchSchema);

branchRouter.get('/list-branch', function (req, res) {
    BranchModel.find({}).then(function (Branch) {
        res.send({status: true, message: "Branch List", data: Branch});
    });
});

branchRouter.post('/create-branch', async function (req, res) {
    let colte = req.body;
    await BranchModel.countDocuments({code: req.body.code, contactMail: req.body.contactMail}).then((count) => {
        if(count!==0){
            res.send({status: false, message: "Branch already exists"});
        }else{
            BranchModel.create(colte).then((Branch) => {
                res.send({status: true, message: "Branch created successfully"});
            }).catch((error) => {
                res.send({status: false, message: "Error", data: error});
            });
        }
    })
});

branchRouter.post('/edit-branch', async function (req, res) {

    await BranchModel.countDocuments({_id: req.body._id}).then((count) => {
        if(count===0){
            res.send({status: false, message: "Branch not found"});
        }else{
            BranchModel.findOne({_id: req.body._id}).then((Branch) => {
                res.send({status: true, message: "Branch find", data: Branch});
            })
        }
    })
});

branchRouter.post('/update-branch', async function (req, res) {

    await BranchModel.countDocuments({_id: req.body._id}).then(async (count) => {
        if(count===0){
            res.send({status: false, message: "Branch not found"});
        }else{
            BranchModel.findOneAndUpdate({_id: req.body._id}, req.body).then((Branch) => {
                res.send({status: true, message: "Branch updated successfully"});
            })
        }
    })
});

branchRouter.post('/delete-branch', async function (req, res) {

    await BranchModel.countDocuments({_id: req.body._id}).then((count) => {
        if(count===0){
            res.send({status: false, message: "Branch not found"});
        }else{
            BranchModel.findOneAndDelete({_id: req.body._id}).then((Branch) => {
                res.send({status: true, message: "Branch deleted successfully"});
            })
        }
    })
});


module.exports = branchRouter;