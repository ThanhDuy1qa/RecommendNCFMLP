const cron = require('node-cron');
const axios = require('axios');
const Papa = require('papaparse');
const Product = require('../models/Product');

// Chạy 30 phút 1 lần
cron.schedule('*/30 * * * *', async () => {
    console.log("Đang quét Google Sheets (CSV) cập nhật Khảo sát...");
    
    try {
        // ⚠️ THAY LINK CSV PUBLISH TO WEB CỦA BẠN VÀO ĐÂY
        const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQHGJWq4lH_BSB6ThV_FC50ADv7NZ07f-MHzHf2HmdloF81_JUUJO12JWMn9Poyz4eVdJ385bGc97Vm/pub?gid=1328405960&single=true&output=csv'; 
        
        const response = await axios.get(SHEET_CSV_URL);
        const result = Papa.parse(response.data, { header: true, skipEmptyLines: true });
        const rows = result.data;
        
        let surveyStats = {};

        rows.forEach(row => {
            // ⚠️ THAY TÊN CỘT TRONG FILE SHEET CỦA BẠN VÀO ĐÂY
            const prodId = row['Product ID']; 
            const intent = row['Bạn sẽ mua hàng này chứ'];

            if (!prodId) return;

            if (!surveyStats[prodId]) {
                surveyStats[prodId] = { total: 0, positive: 0 };
            }

            surveyStats[prodId].total += 1;
            if (intent === 'Có' || intent === 'Chắc chắn mua') { // Thay bằng text của bạn
                surveyStats[prodId].positive += 1;
            }
        });

        for (const [prodId, stats] of Object.entries(surveyStats)) {
            // Kiểm tra xem ID có hợp lệ chuẩn MongoDB không
            if (prodId.length === 24) { 
                await Product.findByIdAndUpdate(prodId, {
                    surveyStats: {
                        totalResponses: stats.total,
                        positiveResponses: stats.positive
                    }
                });
            }
        }
        console.log("✅ Cập nhật dữ liệu khảo sát hoàn tất!");

    } catch (error) {
        console.error("❌ Lỗi đọc CSV:", error.message);
    }
});