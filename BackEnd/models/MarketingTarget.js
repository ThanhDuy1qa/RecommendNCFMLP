const mongoose = require('mongoose');

const MarketingTargetSchema = new mongoose.Schema({}, { 
    strict: false, 
    collection: 'marketing_targets' 
});

module.exports = mongoose.model('MarketingTarget', MarketingTargetSchema);