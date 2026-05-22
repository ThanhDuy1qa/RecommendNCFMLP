const mongoose = require('mongoose');

const ScenarioSummarySchema = new mongoose.Schema({
    scenario: String,
    top_n_users: Number,
    top_k_per_user: Number,
    weight_config: String,
    avg_stability_jaccard: Number,
    top20_avg_inventory_score: Number,
    final_user_based_score: Number,
    final_rank: Number
});

module.exports = mongoose.model('ScenarioSummary', ScenarioSummarySchema, 'ScenarioSummary');