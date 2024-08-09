const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    userName: { type: String, required: true },
    photo: { type: String, required: false },
    zip: { type: Number, required: false },
    city: { type: String, required: false },
    address: { type: String, required: false },
    phone: { type: Number, required: false },
    dob: { type: String, required: false },
    panNo: { type: String, required: false },
    aadharNo: { type: Number, required: false },
    state: { type: String, required: false },
    email: { type: String, required: true },
    password: { type: String, required: true },
    securityGroup: { type: mongoose.SchemaTypes.ObjectId, required: true },
    branch: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "branch",
      required: true,
    },
    franchise: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "franchise",
      required: true,
    },
    rememberToken: { type: String, required: false },
    status: { type: Boolean, required: false },
    verificationLink: { type: String, required: false },
    emailVerified: { type: Boolean, required: false },
    affiliateCode: { type: String, required: false },
    referralCode: { type: String, required: false },
    referralId: { type: String, required: false },
    verified: { type: Boolean, required: false },
    details: { type: String, required: false },
    kycStatus: { type: Number, required: false },
    kycInfo: { type: String, required: false },
    kycRejectReason: { type: String, required: false },
    isBanned: { type: Boolean, required: false },
    relationship: { type: String, required: false },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

module.exports.userSchema = userSchema;
