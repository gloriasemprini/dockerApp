const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    name: { type: String },
    surname: { type: String },
    groups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }],
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;
