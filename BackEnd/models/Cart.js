const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [{
        asin: String,
        title: String,
        price: Number,
        image: String,
        quantity: { type: Number, default: 1 }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);