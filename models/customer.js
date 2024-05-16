const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { franchiseSchema } = require("./franchise");
const FranchiseModel = mongoose.model("franchise", franchiseSchema);
const { branchSchema } = require("./branch");
const BranchModel = mongoose.model("branch", branchSchema);
const { planSchema } = require("./investment");
const PlanModel = mongoose.model("plan", planSchema);
const { userSchema } = require("./auth");
const UserModel = mongoose.model("user", userSchema);

const bankAccountSchema = new Schema({
  docId: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "upload",
    required: false,
  },
  bankName: { type: String, required: false },
  accountHolderName: { type: String, required: false },
  bankACnumber: { type: String, required: false },
  ifscCode: { type: String, required: false },
  accountType: { type: String, required: false },
  isJointAccount: { type: Boolean, required: false, default: false },
});

const panCardSchema = new Schema({
  docId: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "upload",
    required: false,
  },
  panNo: { type: String, required: false },
  nameOnPan: { type: String, required: false },
  fatherName: { type: String, required: false },
  dob: { type: String, required: false },
});

const aadharCardSchema = new Schema({
  docId: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "upload",
    required: false,
  },
  aadharNo: { type: String, required: false },
  currentAddress: { type: String, required: false },
  permanentAddress: { type: String, required: false },
});

const aadharBackSchema = new Schema({
  docId: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "upload",
    required: false,
  },
});

const profileSchema = new Schema({
  docId: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "upload",
    required: false,
  },
});

const customerSchema = new Schema(
  {
    customerId: { type: String, required: false },
    firstName: { type: String, required: false },
    lastName: { type: String, required: false },
    fatherName: { type: String, required: false },
    motherName: { type: String, required: false },
    dob: { type: String, required: false },
    gender: { type: String, required: false },
    qualification: { type: String, required: false },
    maritalStatus: { type: String, required: false },
    referenceValue: { type: String, required: false },
    email: { type: String, required: false },
    phone: { type: Number, required: false },
    password: { type: String, required: false },
    nominee: { type: String, required: false },
    rememberToken: { type: String, required: false },
    phoneVerified: { type: Boolean, required: false },
    referredBy: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "customer",
      required: false,
    },
    branch: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: BranchModel,
      required: false,
    },
    currentPlan: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: PlanModel,
      required: false,
    },
    payoutDuration: { type: String, required: false },
    referralEligibility: { type: Boolean, required: false, default: false },
    franchise: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: FranchiseModel,
      required: false,
    },
    profilePhoto: profileSchema,
    panDetails: panCardSchema,
    aadharDetails: aadharCardSchema,
    aadharBack: aadharBackSchema,
    bankAccountDetails: bankAccountSchema,
    otherDocument: [{ type: mongoose.SchemaTypes.ObjectId, ref: "upload" }],
    applicationSubmitted: { type: Boolean, required: false, default: false },
    applicationReason: { type: String, required: false },
    applicationStatus: { type: Number, required: false, default: 0 },
    approvedBy: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: UserModel,
      required: false,
    },
    createdBy: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: UserModel,
      required: false,
    },
    status: { type: Boolean, required: false, default: false },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

const attachmentSchema = new Schema({
  destination: { type: String },
  encoding: { type: String },
  fieldname: { type: String },
  filename: { type: String },
  mimetype: { type: String },
  originalname: { type: String },
  path: { type: String },
  size: { type: Number },
  uploadedBy: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "user",
    required: true,
  },
  approvedBy: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "user",
    required: false,
  },
  docStatus: { type: String, required: false, default: "pending" },
  status: { type: Boolean, required: false, default: false },
});

const numCount = new Schema({
  type: { type: String, required: true },
  numCount: { type: Number, required: true },
});

module.exports.customerSchema = customerSchema;
module.exports.attachmentSchema = attachmentSchema;
module.exports.numCount = numCount;
