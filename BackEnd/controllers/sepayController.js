const Order = require('../models/Order');
const Payout = require('../models/Payout'); // Nhớ import model Payout

const handlePaymentWebhook = async (req, res) => {
    try {
        const mySepayToken = "SIEU_CAP_VJP_PRO"; 
        const authHeader = req.headers['authorization'];
        
        if (!authHeader || authHeader !== `Apikey ${mySepayToken}`) {
            return res.status(403).json({ message: 'Fake webhook detected!' });
        }

        const { transferAmount, content, transferType, referenceCode } = req.body;
        
        // 🌟 ĐÃ XÓA DÒNG "if (transferType !== 'in')..." Ở ĐÂY ĐỂ CHO PHÉP TIỀN RA (OUT) ĐI TIẾP

        const description = String(content).toUpperCase();

        // ==========================================
        // 🟢 LUỒNG 1: TIỀN VÀO (KHÁCH MUA HÀNG)
        // ==========================================
        if (transferType === 'in') {
            // Dùng \s+ thay vì dấu cách cứng để đề phòng ngân hàng chèn nhiều dấu cách
            const match = description.match(/DON HANG\s+([A-F0-9]{24})/i);
            if (!match) return res.status(200).json({ success: true, message: 'Bỏ qua giao dịch tiền vào không đúng cú pháp' });

            const orderId = match[1].toLowerCase();
            const targetOrder = await Order.findById(orderId);
            
            if (!targetOrder || targetOrder.status !== 'Chờ xác nhận') {
                return res.status(200).json({ success: true, message: 'Đơn không hợp lệ' });
            }
            if (targetOrder.bankTransactionId === referenceCode) {
                return res.status(200).json({ success: true, message: 'Giao dịch đã xử lý' });
            }

            const exchangeRate = 25000; 
            const realRequiredAmount = Math.round(targetOrder.totalAmount * exchangeRate);
            const totalQuantity = targetOrder.items.reduce((sum, item) => sum + item.quantity, 0);
            const testRequiredAmount = totalQuantity * 2000; 

            if (transferAmount < realRequiredAmount && transferAmount !== testRequiredAmount) {
                targetOrder.status = 'Thanh toán thiếu';
                targetOrder.bankTransactionId = referenceCode;
                targetOrder.paidAmountVND = transferAmount; // 🌟 LƯU SỐ TIỀN ĐÃ CHUYỂN
                await targetOrder.save();
                return res.status(200).json({ success: true, message: 'Thanh toán thiếu tiền' });
            }

            if (transferAmount > realRequiredAmount && transferAmount !== testRequiredAmount) {
                targetOrder.status = 'Thanh toán thừa';
                targetOrder.bankTransactionId = referenceCode;
                targetOrder.paidAmountVND = transferAmount; // 🌟 LƯU SỐ TIỀN ĐÃ CHUYỂN
                await targetOrder.save();
                return res.status(200).json({ success: true, message: 'Thanh toán thừa tiền' });
            }

            // GIAO DỊCH CHUẨN XÁC
            targetOrder.status = 'Đang xử lý'; 
            targetOrder.bankTransactionId = referenceCode; 
            targetOrder.paidAmountVND = transferAmount; // 🌟 LƯU SỐ TIỀN ĐÃ CHUYỂN
            await targetOrder.save();
            return res.status(200).json({ success: true, message: 'Duyệt đơn mua thành công' });
        }

        // ==========================================
        // 🔴 LUỒNG 2: TIỀN RA (ADMIN HOÀN TIỀN / TRẢ SELLER)
        // ==========================================
        if (transferType === 'out') {
            
            // 2A: Tự động Xác nhận Hoàn Tiền cho Khách (Hủy đơn)
            const refundMatch = description.match(/HOAN TIEN\s+([A-F0-9]{24})/i);
            if (refundMatch) {
                const orderId = refundMatch[1].toLowerCase();
                const targetOrder = await Order.findById(orderId);
                
                if (targetOrder && targetOrder.status === 'Chờ hoàn tiền') {
                    targetOrder.status = 'Đã hủy';
                    if (targetOrder.refundInfo) targetOrder.refundInfo.isRefunded = true;
                    targetOrder.bankTransactionId = referenceCode; 
                    await targetOrder.save();
                    return res.status(200).json({ success: true, message: 'Tự động duyệt hoàn tiền thành công' });
                }
            }

            // 2B: Tự động Xác nhận Trả Tiền cho Seller (Rút tiền)
            const payoutMatch = description.match(/RUT TIEN\s+([A-F0-9]{24})/i);
            if (payoutMatch) {
                const payoutId = payoutMatch[1].toLowerCase();
                const targetPayout = await Payout.findById(payoutId);
                
                if (targetPayout && targetPayout.status === 'Chờ duyệt') {
                    targetPayout.status = 'Đã chuyển';
                    await targetPayout.save();
                    return res.status(200).json({ success: true, message: 'Tự động duyệt rút tiền Seller thành công' });
                }
            }

            return res.status(200).json({ success: true, message: 'Giao dịch tiền ra không khớp cú pháp hoặc đơn đã được xử lý' });
        }

        // Bỏ qua nếu có loại giao dịch khác
        return res.status(200).json({ success: true, message: 'Loại giao dịch không hỗ trợ' });

    } catch (error) {
        console.error('Lỗi Webhook SePay:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = { handlePaymentWebhook };