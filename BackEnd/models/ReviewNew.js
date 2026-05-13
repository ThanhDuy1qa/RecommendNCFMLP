const mongoose = require('mongoose');

const reviewSchemac = new mongoose.Schema({
    rating: Number,       
    timestamp: Number,    
    user_id: String,      
    item_id: String,      
}, { collection: 'full_interactions' });

module.exports = mongoose.model('Review', reviewSchemac);