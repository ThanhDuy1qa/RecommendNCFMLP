const mongoose = require('mongoose');

const NewProductSupportSchema = new mongoose.Schema({}, { 
    strict: false, 
    collection: 'new_product_support' 
});

module.exports = mongoose.model('NewProductSupport', NewProductSupportSchema);