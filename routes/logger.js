const mongoose = require("mongoose");
const { userSchema } = require("../models/auth");
const UserModel = mongoose.model("user", userSchema);

const { secirutygroupSchema, SGModel } = require("../models/secirutygroup");

const SecurityGroupModel = mongoose.model("secirutygroup", secirutygroupSchema);

const loggerSchema = mongoose.Schema({
  method: { type: String, required: true },
  hostname: { type: String, required: true },
  path: { type: String, required: true },
  time: { type: String, required: true },
  ip: { type: String, required: true },
});

const LoggerModel = mongoose.model("logger", loggerSchema);

module.exports.loggerMiddleware = async function (req, res, next) {
  await UserModel.findOne({
    rememberToken: req.query.token,
  })
    .then(async function (existsUser) {
      const urlPath = req.path.split("/");
      SecurityGroupModel.findOne({
        _id: existsUser.securityGroup,
      }).then(async function (ss) {
        req.time = new Date(Date.now()).toString();
        console.log(req.method, req.hostname, req.path, req.time);
        const colte = {
          method: req.method,
          hostname: req.hostname,
          path: req.path,
          time: req.time,
          ip: req.ip,
        };
        await LoggerModel.create(colte);
        ss.schema.map((ss) => {
          ss.sitemap.map((s) => {
            if (s.urlPath === urlPath[0]) {
              if (s.access === true) {
                return next();
              } else {
                const err = new Error("Not authorized!");
                err.status = 400;
                return next(err);
              }
            }
          });
        });
      });
      // console.log(req)
      next();
    })
    .catch(function (err) {});
};
