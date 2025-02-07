const mongoose = require('mongoose');

const containerSchema = new mongoose.Schema({
    dockerId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    image: { type: String },
});

const Container = mongoose.model('Container', containerSchema);

module.exports = Container;
