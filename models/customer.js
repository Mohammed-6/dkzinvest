const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const {franchiseSchema} = require('./franchise');
const FranchiseModel = mongoose.model('franchise', franchiseSchema);
const {branchSchema} = require('./branch');
const BranchModel = mongoose.model('branch', branchSchema);
const {planSchema} = require('./investment');
const PlanModel = mongoose.model('plan', planSchema);
const {userSchema} = require('./auth');
const UserModel = mongoose.model('user', userSchema);

const bankAccountSchema = new Schema({
    fileName: {type: String, required: false},
    fileLocation: {type: String, required: false},
    uploadedBy: {type: String, required: false},
    bankName: {type: String, required: false},
    accountHolderName: {type: String, required: false},
    bankACnumber: {type: String, required: false},
    ifscCode: {type: String, required: false},
    accountType: {type: String, required: false},
    isJointAccount: {type: Boolean, required: false, default: false},
    docStatus: {type: Boolean, required: false, default: false},
})

const panCardSchema = new Schema({
    fileName: {type: String, required: false},
    fileLocation: {type: String, required: false},
    uploadedBy: {type: String, required: false},
    panNo: {type: String, required: false},
    nameOnPan: {type: String, required: false},
    fatherName: {type: String, required: false},
    dob: {type: String, required: false},
    docStatus: {type: Boolean, required: false, default: false},
})

const aadharCardSchema = new Schema({
    fileName: {type: String, required: false},
    fileLocation: {type: String, required: false},
    aadharNo: {type: String, required: false},
    currentAddress: {type: String, required: false},
    permanentAddress: {type: String, required: false},
    uploadedBy: {type: String, required: false},
    docStatus: {type: Boolean, required: false, default: false},
})

const aadharBackSchema = new Schema({
    fileName: {type: String, required: false},
    fileLocation: {type: String, required: false},
    uploadedBy: {type: String, required: false},
    docStatus: {type: Boolean, required: false, default: false},
})

const otherDocsSchema = new Schema({
    docName: {type: String, required: false},
    fileName: {type: String, required: false},
    fileLocation: {type: String, required: false},
    uploadedBy: {type: String, required: false},
    docStatus: {type: Boolean, required: false, default: false},
})

const profileSchema = new Schema({
    fileName: {type: String, required: false},
    fileLocation: {type: String, required: false},
    uploadedBy: {type: String, required: false},
    docStatus: {type: Boolean, required: false, default: false},
})

const customerSchema = new Schema({
    customerId: {type: String, required: false},
    firstName: {type: String, required: true},
    lastName: {type: String, required: false},
    email: {type: String, required: false},
    phone: {type: String, required: false},
    password: {type: String, required: true},
    nominee: {type: String, required: false},
    referredBy: {type: String, required: false},
    branch: {type: mongoose.SchemaTypes.ObjectId, ref: BranchModel, required: false},
    currentPlan: {type: mongoose.SchemaTypes.ObjectId, ref: PlanModel, required: false},
    payoutDuration: {type: String, required: false},
    referralEligibility: {type: Boolean, required: false, default: false},
    franchise: {type: mongoose.SchemaTypes.ObjectId, ref: FranchiseModel, required: true},
    profilePhoto: profileSchema,
    panDetails: panCardSchema,
    aadharDetails: aadharCardSchema,
    aadharBack: aadharBackSchema,
    bankAccountDetails: bankAccountSchema,
    otherDocument: [otherDocsSchema],
    applicationReason: {type: String, required: false},
    applicationStatus: {type: Number, required: false, default: 0},
    createdBy: {type: mongoose.SchemaTypes.ObjectId, ref: UserModel, required: false},
    status: {type: Boolean, required: true, default: false},
},
{
    timestamps: {'createdAt': 'created_at', 'updatedAt': 'updated_at'}
}
)

module.exports.customerSchema = customerSchema;