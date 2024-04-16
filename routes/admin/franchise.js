const express = require('express');
const mongoose = require('mongoose');
const {franchiseSchema} = require('../../models/franchise');

const franchiseRouter = express.Router();

const FranchiseModel = mongoose.model('franchise', franchiseSchema);

franchiseRouter.get('/list-franchise', function (req, res) {
    FranchiseModel.find({}).then(function (franchise) {
        res.send({status: true, message: "Franchise List", data: franchise});
    });
});

franchiseRouter.post('/create-franchise', async function (req, res) {
    let colte = req.body;
    await FranchiseModel.countDocuments({code: req.body.code, contactMail: req.body.contactMail}).then((count) => {
        if(count!==0){
            res.send({status: false, message: "Franchise already exists"});
        }else{
            FranchiseModel.create(colte).then((franchise) => {
                res.send({status: true, message: "Franchise created successfully"});
            }).catch((error) => {
                res.send({status: false, message: "Error", data: error});
            });
        }
    })
});

franchiseRouter.post('/edit-franchise', async function (req, res) {

    await FranchiseModel.countDocuments({_id: req.body._id}).then((count) => {
        if(count===0){
            res.send({status: false, message: "Franchise not found"});
        }else{
            FranchiseModel.findOne({_id: req.body._id}).then((franchise) => {
                res.send({status: true, message: "Franchise find", data: franchise});
            })
        }
    })
});

franchiseRouter.post('/update-franchise', async function (req, res) {

    await FranchiseModel.countDocuments({_id: req.body._id}).then(async (count) => {
        if(count===0){
            res.send({status: false, message: "Franchise not found"});
        }else{
            FranchiseModel.findOneAndUpdate({_id: req.body._id}, req.body).then((franchise) => {
                res.send({status: true, message: "Franchise updated successfully"});
            })
        }
    })
});

franchiseRouter.post('/delete-franchise', async function (req, res) {

    await FranchiseModel.countDocuments({_id: req.body._id}).then((count) => {
        if(count===0){
            res.send({status: false, message: "Franchise not found"});
        }else{
            FranchiseModel.findOneAndDelete({_id: req.body._id}).then((franchise) => {
                res.send({status: true, message: "Franchise deleted successfully"});
            })
        }
    })
});


module.exports = franchiseRouter;