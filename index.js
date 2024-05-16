const express = require("express");
const userRouter = require("./routes/admin/userRoute");
const noAuthRouter = require("./routes/auth/noAuthRoute");
const { authMiddleware } = require("./routes/auth/authMiddleware");
const { clientAuthMiddleware } = require("./routes/auth/clientAuthMiddleware");
const { loggerMiddleware } = require("./routes/logger");

const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const franchiseRouter = require("./routes/admin/franchise");
const branchRouter = require("./routes/admin/branch");
const customerRouter = require("./routes/admin/customer");
const investmentRouter = require("./routes/admin/investment");
const reportRouter = require("./routes/admin/report");
const uploadRouter = require("./routes/admin/upload");
const securityGroupRouter = require("./routes/admin/security-group");

const onboardRoute = require("./routes/client/onboard");
const clientUploadRouter = require("./routes/client/upload");
const dashboardRoute = require("./routes/client/dashboard");
const profileRoute = require("./routes/client/profile");

const app = express();

app.use("/public", express.static("public"));

mongoose.connect(
  "mongodb+srv://rehankhan:B7uzwg8DlkIUJ9xb@cluster0.yimbm.mongodb.net/dkz?retryWrites=true&w=majority"
);

app.use(bodyParser.json());
app.use(cors());

app.use(noAuthRouter);
// client
// app.use(clientAuthMiddleware);
app.use("/c1", onboardRoute);
app.use("/c1", clientUploadRouter);
app.use("/c1", dashboardRoute);
app.use("/c1", profileRoute);
// admin
// app.use(authMiddleware);
// logger
app.use(loggerMiddleware);
app.use(userRouter);
app.use(franchiseRouter);
app.use(branchRouter);
app.use(customerRouter);
app.use(investmentRouter);
app.use(reportRouter);
app.use(securityGroupRouter);
app.use(uploadRouter);

app.listen(process.env.PORT | 4004, function () {
  console.log("listening on port 4004");
});
