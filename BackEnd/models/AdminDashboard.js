const mongoose = require('mongoose');

const AdminDashboardSchema = new mongoose.Schema({}, { 
    strict: false, 
    collection: 'admin_dashboard' 
});

module.exports = mongoose.model('AdminDashboard', AdminDashboardSchema);