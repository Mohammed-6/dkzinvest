
const mongoose = require('mongoose');
const {userSchema} = require('../models/auth');
const UserModel = mongoose.model('user', userSchema);

const loggerSchema = mongoose.Schema({
    method: {type: String, required: true},
    hostname: {type: String, required: true},
    path: {type: String, required: true},
    time: {type: String, required: true},
    ip: {type: String, required: true}
})

const LoggerModel = mongoose.model('logger', loggerSchema);

module.exports.loggerMiddleware = async function (req, res, next) {
    await UserModel.findOne(
        {
          rememberToken: req.query.token,
        }).then(async function ( existsUser) {
            // console.log(req)
            req.time = new Date(Date.now()).toString();
            console.log(req.method,req.hostname, req.path, req.time);
            const colte = {
                method: req.method,
                hostname: req.hostname,
                path: req.path,
                time: req.time,
                ip: req.ip,
            }
            await LoggerModel.create(colte)
            next();
        }).catch(function (err) {

        });
}