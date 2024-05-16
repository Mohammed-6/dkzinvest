const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const sitemapModel = new Schema({
  name: { type: String, required: true },
  urlPath: { type: String, required: true },
  access: { type: Boolean, required: true },
});

const schemaModel = new Schema({
  name: { type: String, required: true },
  sitemap: { type: [sitemapModel], required: true },
});

const secirutygroupSchema = new Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true },
    schema: { type: [schemaModel] },
    status: { type: Boolean, required: true },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

const SGModelSchema = [
  {
    name: "Security Group",
    sitemap: [
      {
        name: "List",
        urlPath: "list-security-group",
        access: false,
      },
      {
        name: "Load",
        urlPath: "load-security-group-schema",
        access: false,
      },
      {
        name: "Add",
        urlPath: "create-security-group",
        access: false,
      },
      {
        name: "Edit",
        urlPath: "edit-security-group",
        access: false,
      },
      {
        name: "Update",
        urlPath: "update-security-group",
        access: false,
      },
      {
        name: "Delete",
        urlPath: "delete-security-group",
        access: false,
      },
    ],
  },
  {
    name: "Users",
    sitemap: [
      {
        name: "List",
        urlPath: "list-user",
        access: false,
      },
      {
        name: "Load User Props",
        urlPath: "load-user-props",
        access: false,
      },
      {
        name: "Add",
        urlPath: "create-user",
        access: false,
      },
      {
        name: "Edit",
        urlPath: "edit-user",
        access: false,
      },
      {
        name: "Update",
        urlPath: "update-user",
        access: false,
      },
      {
        name: "Delete",
        urlPath: "delete-user",
        access: false,
      },
      {
        name: "Change Password",
        urlPath: "change-password",
        access: false,
      },
    ],
  },
  {
    name: "Franchise",
    sitemap: [
      {
        name: "List",
        urlPath: "list-franchise",
        access: false,
      },
      {
        name: "Add",
        urlPath: "create-franchise",
        access: false,
      },
      {
        name: "Edit",
        urlPath: "edit-franchise",
        access: false,
      },
      {
        name: "Update",
        urlPath: "update-franchise",
        access: false,
      },
      {
        name: "Delete",
        urlPath: "delete-franchise",
        access: false,
      },
    ],
  },
  {
    name: "Branch",
    sitemap: [
      {
        name: "List",
        urlPath: "list-branch",
        access: false,
      },
      {
        name: "Add",
        urlPath: "create-branch",
        access: false,
      },
      {
        name: "Edit",
        urlPath: "edit-branch",
        access: false,
      },
      {
        name: "Update",
        urlPath: "update-branch",
        access: false,
      },
      {
        name: "Delete",
        urlPath: "delete-branch",
        access: false,
      },
    ],
  },
  {
    name: "Plan",
    sitemap: [
      {
        name: "List",
        urlPath: "list-plan",
        access: false,
      },
      {
        name: "Add",
        urlPath: "create-plan",
        access: false,
      },
      {
        name: "Edit",
        urlPath: "edit-plan",
        access: false,
      },
      {
        name: "Update",
        urlPath: "update-plan",
        access: false,
      },
      {
        name: "Delete",
        urlPath: "delete-plan",
        access: false,
      },
      {
        name: "Assing Plan",
        urlPath: "assign-plan-customer",
        access: false,
      },
    ],
  },
  {
    name: "Customer",
    sitemap: [
      {
        name: "List",
        urlPath: "list-customer",
        access: false,
      },
      {
        name: "List Page Customer",
        urlPath: "list-page-customer",
        access: false,
      },
      {
        name: "Add",
        urlPath: "create-customer",
        access: false,
      },
      {
        name: "Edit",
        urlPath: "edit-customer",
        access: false,
      },
      {
        name: "Update",
        urlPath: "update-customer",
        access: false,
      },
      {
        name: "Delete",
        urlPath: "delete-customer",
        access: false,
      },
      {
        name: "Change Password",
        urlPath: "change-password",
        access: false,
      },
      {
        name: "Customer Detail",
        urlPath: "customer-detail",
        access: false,
      },
      {
        name: "Update Other Document",
        urlPath: "update-other-document",
        access: false,
      },
      {
        name: "Update Profile Phone Status",
        urlPath: "update-profilePhoto-status",
        access: false,
      },
      {
        name: "Update pan details status",
        urlPath: "update-panDetails-status",
        access: false,
      },
      {
        name: "Update aadhar details status",
        urlPath: "update-aadharDetails-status",
        access: false,
      },
      {
        name: "Update bank account details status",
        urlPath: "update-bankAccountDetails-status",
        access: false,
      },
      {
        name: "Update Customer Application status",
        urlPath: "update-customer-application-status",
        access: false,
      },
      {
        name: "Update Customer status",
        urlPath: "update-customer-status",
        access: false,
      },
      {
        name: "Customer rejected",
        urlPath: "customer-rejected",
        access: false,
      },
      {
        name: "Customer approved",
        urlPath: "customer-approved",
        access: false,
      },
      {
        name: "Customer pending",
        urlPath: "customer-pending",
        access: false,
      },
      {
        name: "Customer deleted",
        urlPath: "customer-deleted",
        access: false,
      },
      {
        name: "list customer base on status",
        urlPath: "list-customer-status/0",
        access: false,
      },
      {
        name: "Customer assign package",
        urlPath: "customer-assign-package",
        access: false,
      },
      {
        name: "Agent request form",
        urlPath: "agent-request-form",
        access: false,
      },
      {
        name: "List agent request form",
        urlPath: "list-agent-request-form",
        access: false,
      },
      {
        name: "Update agent request form",
        urlPath: "update-agent-request-form",
        access: false,
      },
    ],
  },
  {
    name: "Currency",
    sitemap: [
      {
        name: "List currency",
        urlPath: "list-currency",
        access: false,
      },
      {
        name: "Add currency",
        urlPath: "create-currency",
        access: false,
      },
      {
        name: "Update currency",
        urlPath: "update-currency",
        access: false,
      },
      {
        name: "Delete currency",
        urlPath: "delete-currency",
        access: false,
      },
    ],
  },
  {
    name: "Investment",
    sitemap: [
      {
        name: "List Transaction",
        urlPath: "list-transaction",
        access: false,
      },
      {
        name: "Investment Customer List",
        urlPath: "investment-customer-list",
        access: false,
      },
      {
        name: "Push to investment",
        urlPath: "push-to-investment",
        access: false,
      },
      {
        name: "Push to reinvestment",
        urlPath: "push-to-reinvestment",
        access: false,
      },
      {
        name: "Push to partial reinvestment",
        urlPath: "push-to-partial-reinvestment",
        access: false,
      },
      {
        name: "Push to investment withdraw",
        urlPath: "push-to-investment-withdraw",
        access: false,
      },
      {
        name: "List Profit sharing",
        urlPath: "list-profit-sharing",
        access: false,
      },
      {
        name: "Disburse profit",
        urlPath: "disburse-profit",
        access: false,
      },
      {
        name: "List disburse profit",
        urlPath: "list-disburse-profit",
        access: false,
      },
      {
        name: "Admin profit approve",
        urlPath: "admin-profit-approve",
        access: false,
      },
    ],
  },
  {
    name: "Report",
    sitemap: [
      {
        name: "List plan report",
        urlPath: "report-plan",
        access: false,
      },
      {
        name: "Plan wise users",
        urlPath: "plan-wise-users",
        access: false,
      },
      {
        name: "Individual ledger",
        urlPath: "individual-ledger",
        access: false,
      },
      {
        name: "List plan expires",
        urlPath: "list-plan-expires",
        access: false,
      },
    ],
  },
];

const SGModel = {
  name: "",
  code: "",
  schema: SGModelSchema,
  status: true,
};

module.exports.secirutygroupSchema = secirutygroupSchema;
module.exports.SGModel = SGModel;
