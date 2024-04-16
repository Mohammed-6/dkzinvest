const express = require('express');
const userRouter = require('./routes/admin/userRoute');
const noAuthRouter = require('./routes/auth/noAuthRoute');
const {authMiddleware} = require('./routes/auth/authMiddleware');
const {loggerMiddleware} = require('./routes/logger');

const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const franchiseRouter = require('./routes/admin/franchise');
const branchRouter = require('./routes/admin/branch');
const customerRouter = require('./routes/admin/customer');
const investmentRouter = require('./routes/admin/investment');
const reportRouter = require('./routes/admin/report');

const app = express();

mongoose.connect("mongodb+srv://rehankhan:B7uzwg8DlkIUJ9xb@cluster0.yimbm.mongodb.net/dkz?retryWrites=true&w=majority")

app.use(bodyParser.json());
app.use(cors());

app.use(noAuthRouter);
app.use(authMiddleware);
// logger
app.use(loggerMiddleware);
app.use(userRouter);
app.use(franchiseRouter);
app.use(branchRouter);
app.use(customerRouter);
app.use(investmentRouter);
app.use(reportRouter);

app.listen(process.env.PORT | 4004, function() {
    console.log('listening on port 4004');
})