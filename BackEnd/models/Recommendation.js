const mongoose = require('mongoose');

const RecommendationSchema = new mongoose.Schema({
    user_id: { type: Number, required: true, index: true },
    item_id: { type: Number, required: true },
    rank: Number,
    hybrid_score: Number,
    ae_norm: Number,
    ncf_norm: Number,
    mlp_norm: Number,
    density: String
}, { 
    collection: 'recommendations',
    timestamps: false 
});

module.exports = mongoose.model('Recommendation', RecommendationSchema);