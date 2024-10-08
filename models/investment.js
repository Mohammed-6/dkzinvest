const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const currencySchema = new Schema(
  {
    currencyCode: { type: String, required: true },
    country: { type: String, required: true },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);
const CurrencyModel = mongoose.model("currency", currencySchema);
const planSchema = new Schema(
  {
    packageName: { type: String, required: true },
    duration: { type: Number, required: true },
    percentage: { type: Number, required: true },
    payoutPeriod: { type: String, required: true },
    capitalReturn: { type: Boolean, required: true },
    withdrawInstallment: { type: Number, required: true },
    minAmount: { type: Number, required: true },
    maxAmount: { type: Number, required: true },
    terms: { type: String, required: false },
    offerClaim: { type: String, required: false },
    banner: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "upload",
      required: false,
    },
    status: { type: Boolean, required: true, default: true },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

const agentRequestForm = new Schema(
  {
    clientId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "customers",
      required: true,
    },
    newInvestmentBonus: { type: Number, required: true },
    topupBonus: { type: Number, required: true },
    renewalBonus: { type: Number, required: true },
    comment: { type: String, required: false },
    rejectStatus: { type: Boolean, required: false, default: false },
    status: { type: Boolean, required: false, default: false },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

const transactionSchema = new Schema(
  {
    clientId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "customer",
      required: true,
    },
    planId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "plan",
      required: true,
    },
    txnNo: { type: Number, required: true },
    txnId: { type: String, required: true },
    particular: { type: String, required: true },
    type: { type: String, required: true },
    currencyId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: CurrencyModel,
      required: true,
    },
    amount: { type: Number, required: true },
    balance: { type: Number, required: true },
    description: { type: String, required: false },
    modeOfPayment: { type: String, required: true },
    maturityDate: { type: Date, required: false },
    balanceExpire: { type: Boolean, required: false, default: false },
    invested: { type: Boolean, required: false, default: false }, // make sure the transaction is invested
    reInvest: { type: Boolean, required: false, default: false }, // is this new transaction or re-invested?
    branch: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "branch",
      required: true,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

const investmentSchema = new Schema(
  {
    investmentId: { type: String, required: true }, // dummy string
    transRefId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "transaction",
      required: true,
    }, // reference to transaction
    customerId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "customer",
      required: true,
    },
    planId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "plan",
      required: true,
    },
    currencyId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: CurrencyModel,
      required: true,
    },
    investmentAmount: { type: Number, required: true },
    investmentCurrency: { type: String, required: true },
    totalAmountInvested: { type: Number, required: true },
    percentOfAmountTarget: { type: Number, required: true },
    status: { type: Boolean, required: true, default: true }, // investment status
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

const withdrawSchema = new Schema(
  {
    withdrawId: { type: String, required: true }, // dummy string
    investmentRefId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "investment",
      required: true,
    }, // reference to investment
    transRefId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "transaction",
      required: true,
    }, // reference to transaction
    customerId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "customer",
      required: true,
    },
    planId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "plan",
      required: true,
    },
    currencyId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: CurrencyModel,
      required: true,
    },
    initiateBy: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "user",
      required: false,
    },
    adminBy: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "user",
      required: false,
    },
    paidAmount: { type: Number, required: true },
    withdrawRef: { type: String, required: false },
    withdrawDesc: { type: String, required: false },
    supervisorApprove: { type: Boolean, required: false, default: false },
    adminApprove: { type: Boolean, required: false, default: false },
    paymentStatus: { type: Boolean, required: false, default: false },
    paymentReference: { type: String, required: false },
    status: { type: Boolean, required: true, default: false }, // withdraw status
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

const orderSchema = new Schema({
  orderId: { type: String, required: true },
  clientId: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "customer",
    required: true,
  },
  planId: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "plan",
    required: true,
  },
  amount: { type: String, required: true },
  currency: { type: String, required: true },
  orderStatus: { type: Boolean, required: false },
});

const slotbookSchema = new Schema(
  {
    userid: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "customer",
      required: true,
    },
    dateofinvestment: { type: Date, required: true },
    investmentamount: { type: Number, required: true },
    investortype: { type: String, required: false },
    plan: { type: mongoose.SchemaTypes.ObjectId, ref: "plan", required: true },
    slot_no: { type: String, required: false },
    agent: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "user",
      required: true,
    },
    completed_at: { type: Date, required: false },
    roleid: { type: String, required: false },
    order_id: { type: String, required: false },
    paymentStatus: { type: Boolean, required: false, default: false },
    status: { type: Boolean, required: false, default: true },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

module.exports.planSchema = planSchema;
module.exports.agentRequestForm = agentRequestForm;
module.exports.transactionSchema = transactionSchema;
module.exports.currencySchema = currencySchema;
module.exports.investmentSchema = investmentSchema;
module.exports.withdrawSchema = withdrawSchema;
module.exports.orderSchema = orderSchema;
module.exports.slotbookSchema = slotbookSchema;
