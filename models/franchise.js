const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const franchiseSchema = new Schema({
    name: {type: String, required: true},
    code: {type: String, required: true},
    location: {type: String, required: true},
    contactPerson: {type: String, required: true},
    landline: {type: String, required: false},
    contactMail: {type: String, required: true},
    address: {type: String, required: true},
    status: {type: Boolean, required: true},
},
{
    timestamps: {'createdAt': 'created_at', 'updatedAt': 'updated_at'}
}
)

module.exports.franchiseSchema = franchiseSchema;