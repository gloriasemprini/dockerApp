const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    containers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Container' }]
});

const Group = mongoose.model('Group', groupSchema);

module.exports = Group;
