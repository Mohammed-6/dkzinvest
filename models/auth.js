const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {type: String, required: true},
    userName: {type: String, required: true},
    photo: {type: String, required: false},
    zip: {type: Number, required: false},
    city: {type: String, required: false},
    address: {type: String, required: false},
    phone: {type: Number, required: false},
    dob: {type: String, required: false},
    panNo: {type: String, required: false},
    aadharNo: {type: Number, required: false},
    state: {type: String, required: false},
    fax: {type: Number, required: false},
    email: {type: String, required: true},
    password: {type: String, required: true},
    rememberToken: {type: String, required: false},
    isProvider: {type: String, required: false},
    status: {type: Boolean, required: false},
    verificationLink: {type: String, required: false},
    emailVerified: {type: Boolean, required: false},
    balance: {type: Number, required: false},
    interestBalance: {type: Number, required: false},
    affiliateCode: {type: String, required: false},
    referralId: {type: String, required: false},
    twofa: {type: String, required: false},
    go: {type: String, required: false},
    verified: {type: Boolean, required: false},
    details: {type: String, required: false},
    kycStatus: {type: Number, required: false},
    kycInfo: {type: String, required: false},
    kycRejectReason: {type: String, required: false},
    isBanned: {type: Boolean, required: false},
    isDummy: {type: Boolean, required: false},
    newId: {type: Number, required: false},
    agentName: {type: String, required: false},
    recievedBankName: {type: String, required: false},
    utrNumber: {type: String, required: false},
    paymentDate: {type: String, required: false},
    relationship: {type: String, required: false},
},{timestamps: {'createdAt': 'created_at', 'updatedAt': 'updated_at'}}
)


module.exports.userSchema = userSchema;