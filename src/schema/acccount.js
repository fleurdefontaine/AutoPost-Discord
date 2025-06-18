const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
    token: { type: String, required: true, unique: true },
    message: { type: String, required: true },
    channelId: { type: String, required: true },
    delay: { type: Number, required: true },
    isPosting: { type: Boolean, default: false }
});

const Account = mongoose.model('Account', accountSchema);
module.exports = Account;