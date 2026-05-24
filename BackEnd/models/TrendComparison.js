const mongoose = require('mongoose');

const TrendComparisonSchema = new mongoose.Schema({}, { 
    strict: false, 
    collection: 'trend_comparison' 
});

module.exports = mongoose.model('TrendComparison', TrendComparisonSchema);