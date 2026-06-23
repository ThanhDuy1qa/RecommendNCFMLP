const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  bankInfo: {
    bankName: String,
    accountNumber: String,
    accountName: String
  },
  status: { 
    type: String, 
    enum: ['Chờ duyệt', 'Đã chuyển', 'Từ chối'], 
    default: 'Chờ duyệt' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Payout', payoutSchema);