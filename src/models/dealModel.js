const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema({
    DateTime: { type: Date, required: true }, 
    salesman: { type: String, required: true },
    customer: { type: String, required: true },
    items: { type: String, required: true },
    price: { type: Number, required: true }
});

module.exports = mongoose.model('Deal', dealSchema);