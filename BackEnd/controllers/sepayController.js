const Order = require('../models/Order');
const Payout = require('../models/Payout'); 
const User = require('../models/User'); // 🌟 IMPORT THÊM MODEL USER

const handlePaymentWebhook = async (req, res) => {
    try {
        const mySepayToken = process.env.SEPAY_API_KEY;
        const authHeader = req.headers['authorization'];
        
        if (!authHeader || authHeader !== `Apikey ${mySepayToken}`) {
            return res.status(403).json({ message: 'Fake webhook detected!' });
        }

        const { transferAmount, content, transferType, referenceCode } = req.body;
        const description = String(content).toUpperCase();

        // ==========================================
        // 🟢 LUỒNG 1: TIỀN VÀO (NẠP VÍ HOẶC MUA HÀNG)
        // ==========================================
        if (transferType === 'in') {
            
            // 🌟 TRƯỜNG HỢP 1A: KHÁCH NẠP TIỀN VÀO VÍ
            const depositMatch = description.match(/NAPTIEN\s+([A-F0-9]{24})/i);
            if (depositMatch) {
                const userId = depositMatch[1].toLowerCase();
                const targetUser = await User.findById(userId);

                if (!targetUser) {
                    return res.status(200).json({ success: true, message: 'Không tìm thấy người dùng để nạp tiền' });
                }

                // Cộng tiền thẳng vào ví của người dùng
                targetUser.walletBalance = (targetUser.walletBalance || 0) + transferAmount;
                await targetUser.save();

                return res.status(200).json({ success: true, message: `Đã cộng ${transferAmount}đ vào ví thành công` });
            }

            // 🌟 TRƯỜNG HỢP 1B: KHÁCH MUA HÀNG (Thanh toán trực tiếp đơn)
            const orderMatch = description.match(/DON HANG\s+([A-F0-9]{24})/i);
            if (orderMatch) {
                const orderId = orderMatch[1].toLowerCase();
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
                    targetOrder.paidAmountVND = transferAmount; 
                    await targetOrder.save();
                    return res.status(200).json({ success: true, message: 'Thanh toán thiếu tiền' });
                }

                if (transferAmount > realRequiredAmount && transferAmount !== testRequiredAmount) {
                    targetOrder.status = 'Thanh toán thừa';
                    targetOrder.bankTransactionId = referenceCode;
                    targetOrder.paidAmountVND = transferAmount; 
                    await targetOrder.save();
                    return res.status(200).json({ success: true, message: 'Thanh toán thừa tiền' });
                }

                // GIAO DỊCH CHUẨN XÁC
                targetOrder.status = 'Đang xử lý'; 
                targetOrder.bankTransactionId = referenceCode; 
                targetOrder.paidAmountVND = transferAmount; 
                await targetOrder.save();
                return res.status(200).json({ success: true, message: 'Duyệt đơn mua thành công' });
            }

            // Nếu không khớp chữ NAPTIEN cũng không khớp DON HANG
            return res.status(200).json({ success: true, message: 'Bỏ qua giao dịch tiền vào không đúng cú pháp' });
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
                    const requiredRefundVND = targetOrder.paidAmountVND || Math.round(targetOrder.totalAmount * 25000);
                    const actualRefund = Math.abs(transferAmount); 

                    if (actualRefund < requiredRefundVND) {
                        targetOrder.status = 'Hoàn tiền thiếu';
                        targetOrder.bankTransactionId = referenceCode; 
                        await targetOrder.save();
                        return res.status(200).json({ success: true, message: 'Admin hoàn tiền THIẾU cho khách' });
                    }

                    if (actualRefund > requiredRefundVND) {
                        targetOrder.status = 'Hoàn tiền thừa'; 
                        targetOrder.bankTransactionId = referenceCode; 
                        await targetOrder.save();
                        return res.status(200).json({ success: true, message: 'Admin hoàn tiền THỪA cho khách' });
                    }

                    targetOrder.status = 'Đã hủy';
                    if (targetOrder.refundInfo) targetOrder.refundInfo.isRefunded = true;
                    targetOrder.bankTransactionId = referenceCode; 
                    await targetOrder.save();
                    return res.status(200).json({ success: true, message: 'Tự động duyệt hoàn tiền THÀNH CÔNG' });
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

        return res.status(200).json({ success: true, message: 'Loại giao dịch không hỗ trợ' });

    } catch (error) {
        console.error('Lỗi Webhook SePay:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = { handlePaymentWebhook };