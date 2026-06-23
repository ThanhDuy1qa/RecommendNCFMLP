const Product = require('../models/Product');
const Recommendation = require('../models/Recommendation');
const User = require('../models/User');
const SmartCatalog = require('../models/SmartCatalog');
const Review = require('../models/Review');
const Order = require('../models/Order'); 
const { transporter } = require('./emailController');
const axios = require('axios');
const nodemailer = require('nodemailer');
const cloudinary = require('cloudinary').v2;
// =======================================================
// HÀM BỔ TRỢ: CHUẨN HÓA GIÁ TIỀN
// Loại bỏ mọi ký tự thừa (như dấu $), chỉ trả về con số sạch (VD: "17.99")
// =======================================================
const formatPrice = (price) => {
    if (price === undefined || price === null || price === '') return 'Liên hệ';
    // Lọc bỏ mọi thứ không phải là số và dấu chấm thập phân
    const parsed = parseFloat(String(price).replace(/[^0-9.]/g, ''));
    return isNaN(parsed) ? 'Liên hệ' : parsed.toFixed(2);
};

/**
 * Hàm hỗ trợ: Tách Public ID từ URL của Cloudinary để lấy mã định danh ảnh
 * VD URL: https://res.cloudinary.com/dcaqccq0j/image/upload/v1712345/DATN_Products/abc123.png
 * Sẽ tách ra được: DATN_Products/abc123
 */
const getPublicIdFromUrl = (url) => {
    if (!url || !url.includes('cloudinary.com')) return null;
    try {
        const regex = /upload\/(?:v\d+\/)?([^\.]+)/;
        const match = url.match(regex);
        return match ? match[1] : null;
    } catch (error) {
        return null;
    }
};
const escapeRegex = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};
// =======================================================
// 1. PUBLIC / CUSTOMER FUNCTIONS
// Các hàm dùng cho khách hàng hoặc trang công khai
// =======================================================

/**
 * Lấy danh sách sản phẩm công khai.
 * Hỗ trợ phân trang, tìm kiếm theo tên / ASIN và lọc theo danh mục.
 */
const getProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 45;
        const search = req.query.search || '';
        const category = decodeURIComponent(req.query.category || '');
        const skip = (page - 1) * limit;

        let query = {};

        if (search) {
            if (search.length === 10 && !search.includes(' ')) {
                query.asin = search;
            } else {
                // 🌟 BẢO MẬT: Làm sạch từ khóa trước khi tìm kiếm
                query.title = { $regex: escapeRegex(search), $options: 'i' };
            }
        }

        if (category) {
            let safeName = category.replace(/&amp;/g, '&').trim();

            const regexPattern = `^\\s*${safeName.replace(/\s*&\s*/g, '\\s*.*\\s*')}\\s*$`;

            query.main_cat = {
                $regex: new RegExp(regexPattern, 'i')
            };
        }

        const products = await Product.find(query)
            .skip(skip)
            .limit(limit);

        const formattedProducts = products.map((prod) => {
            return {
                _id: prod._id,
                asin: prod.asin,
                item_id: prod.item_id,
                title: prod.title || 'Chưa có tiêu đề',
                price: formatPrice(prod.price), // ĐÃ FIX
                brand: prod.brand || 'N/A',
                image: prod.image_url_high || prod.image_url || null,
                category: 'Điện tử',
                main_cat: prod.main_cat || 'Electronics'
            };
        });

        res.json(formattedProducts);
    } catch (error) {
        console.error('Lỗi lấy sản phẩm:', error);
        res.status(500).json({ message: 'Lỗi Server' });
    }
};

/**
 * Lấy chi tiết sản phẩm theo ASIN.
 * Dùng cho trang ProductDetail.
 */
const getProductByAsin = async (req, res) => {
    try {
        const { asin } = req.params;

        const product = await Product.findOne({ asin });

        if (!product) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }

        const productDetail = {
            ...product._doc,
            asin: product.asin,
            price: formatPrice(product.price), // ĐÃ FIX
            imageURLHighRes: product.image_url_high ? [product.image_url_high] : [],
            imageURL: product.image_url ? [product.image_url] : [],
            description: product.description ? [product.description] : []
        };

        res.json(productDetail);
    } catch (error) {
        console.error('Lỗi lấy chi tiết sản phẩm:', error);
        res.status(500).json({ message: 'Lỗi Server' });
    }
};

/**
 * Gợi ý tìm kiếm sản phẩm.
 * Tìm theo title hoặc ASIN, trả về tối đa 5 kết quả.
 */
const getSearchSuggestions = async (req, res) => {
    try {
        const keyword = req.query.q || '';

        if (!keyword) {
            return res.json([]);
        }

        // 🌟 BẢO MẬT: Làm sạch từ khóa trước khi đưa vào Regex
        const safeKeyword = escapeRegex(keyword);

        const query = {
            $or: [
                { title: { $regex: safeKeyword, $options: 'i' } },
                { asin: { $regex: safeKeyword, $options: 'i' } }
            ]
        };

        const suggestions = await Product.find(query)
            .select('title asin image_url_high image_url')
            .limit(5);

        const formattedSuggestions = suggestions.map((prod) => {
            return {
                asin: prod.asin,
                title: prod.title || 'Chưa có tiêu đề',
                image: prod.image_url_high || prod.image_url || null
            };
        });

        res.json(formattedSuggestions);
    } catch (error) {
        console.error('Lỗi lấy gợi ý:', error);
        res.status(500).json({ message: 'Lỗi Server' });
    }
};

/**
 * Lấy chi tiết sản phẩm theo MongoDB _id hoặc ASIN.
 * Dùng cho trang sửa sản phẩm.
 */
const getProductById = async (req, res) => {
    try {
        const idParam = req.params.id;
        let product;

        // 🌟 KIỂM TRA ĐỊNH DẠNG THÔNG MINH
        // Nếu là ObjectId chuẩn của MongoDB (24 ký tự hex)
        if (idParam.match(/^[0-9a-fA-F]{24}$/)) {
            product = await Product.findById(idParam);
        } else {
            // Nếu không phải, tự động chuyển sang tìm bằng mã ASIN
            product = await Product.findOne({ asin: idParam });
        }

        if (!product) {
            return res.status(404).json({
                message: 'Không tìm thấy sản phẩm trong Database!'
            });
        }

        res.json(product);
    } catch (error) {
        console.error('Lỗi lấy chi tiết sản phẩm:', error);
        res.status(500).json({
            message: 'ID sản phẩm không hợp lệ hoặc lỗi Server'
        });
    }
};

// =======================================================
// 2. AI RECOMMENDATION FUNCTIONS
// Các hàm gợi ý sản phẩm bằng AI cho khách hàng
// =======================================================

/**
 * Lấy danh sách sản phẩm gợi ý AI cho một user.
 * Hỗ trợ thuật toán hybrid, ae, ncf, mlp.
 * Có thể nhận reviewerId dạng số, amazon_id hoặc từ khóa "me".
 */
const getAiRecommendations = async (req, res) => {
    try {
        const rawId = req.params.reviewerId;
        const algo = req.query.algo || 'hybrid';

        let userId = Number(rawId);

        if (isNaN(userId)) {
            let targetId = rawId;

            if (rawId === 'me' && req.user) {
                targetId = req.user.username || req.user.amazon_id;
            }

            if (!isNaN(Number(targetId))) {
                userId = Number(targetId);
            } else {
                const userDoc = await User.findOne({ amazon_id: targetId });

                if (userDoc && !isNaN(Number(userDoc.username))) {
                    userId = Number(userDoc.username);
                } else {
                    const reviewMapping = await Review.findOne({
                        reviewerID: targetId
                    });

                    if (!reviewMapping || reviewMapping.user_id === undefined) {
                        return res.json([]);
                    }

                    userId = Number(reviewMapping.user_id);
                }
            }
        }

        let sortStage = { rank: 1 };
        let matchStage = { user_id: userId };

        if (algo === 'ae') {
            sortStage = { ae_norm: -1 };
            matchStage.ae_norm = { $exists: true, $ne: null };
        } else if (algo === 'ncf') {
            sortStage = { ncf_norm: -1 };
            matchStage.ncf_norm = { $exists: true, $ne: null };
        } else if (algo === 'mlp') {
            sortStage = { mlp_norm: -1 };
            matchStage.mlp_norm = { $exists: true, $ne: null };
        }

        const recs = await Recommendation.find(matchStage)
            .sort(sortStage)
            .limit(1500);

        if (recs.length === 0) {
            return res.json([]);
        }

        const aiItemIds = recs.map((rec) => rec.item_id);

        const products = await Product.find({
            item_id: { $in: aiItemIds }
        });

        const sortedProducts = aiItemIds
            .map((aiId) => {
                let prod = products.find(
                    (p) => Number(p.item_id) === Number(aiId)
                );

                if (!prod) {
                    prod = {
                        _id: `dummy_${aiId}`,
                        asin: 'N/A',
                        title: '⚠️ [Sản phẩm đã bị xóa khỏi CSDL]',
                        price: 0,
                        brand: 'Hàng cũ',
                        image_url_high: null,
                        image_url: null,
                        main_cat: 'Đã xóa'
                    };
                }

                const recInfo = recs.find((r) => r.item_id === aiId) || {};

                return {
                    _id: prod._id,
                    asin: prod.asin,
                    title: prod.title || 'Chưa có tiêu đề',
                    price: formatPrice(prod.price), // ĐÃ FIX
                    brand: prod.brand || 'N/A',
                    image: prod.image_url_high || prod.image_url || null,
                    category: 'Điện tử',
                    main_cat: prod.main_cat || 'Electronics',

                    hybrid_score: recInfo.hybrid_score,
                    rank: recInfo.rank,
                    ae_norm: recInfo.ae_norm,
                    ae_rank: recInfo.ae_rank,
                    ncf_norm: recInfo.ncf_norm,
                    ncf_rank: recInfo.ncf_rank,
                    mlp_norm: recInfo.mlp_norm,
                    mlp_rank: recInfo.mlp_rank
                };
            })
            .filter((p) => p !== null && p !== undefined);

        const finalValidProducts = sortedProducts.slice(0, 100);

        res.json(finalValidProducts);
    } catch (error) {
        console.error('Lỗi lấy gợi ý:', error);
        res.status(500).json({ message: 'Lỗi hệ thống gợi ý AI' });
    }
};

// =======================================================
// 3. SELLER FUNCTIONS
// Các hàm dành cho người bán, role 1
// Admin role 2 cũng có thể dùng một số hàm này
// =======================================================

/**
 * Thêm sản phẩm mới.
 * Gắn seller_id theo tài khoản đang đăng nhập.
 * Nếu có upload ảnh thì lưu URL ảnh từ Cloudinary.
 */
const addProduct = async (req, res) => {
    try {
        const {
            asin,
            title,
            brand,
            price,
            main_cat,
            category,
            description
        } = req.body;

        const image_url_high = req.file ? req.file.path : '';

        if (parseFloat(price) < 0) {
            return res.status(400).json({
                message: 'Giá không được âm!'
            });
        }

        const existingProduct = await Product.findOne({ asin });

        if (existingProduct) {
            return res.status(400).json({
                message: 'Mã ASIN này đã tồn tại trong hệ thống!'
            });
        }

        const newProduct = new Product({
            asin,
            title,
            brand,
            main_cat,
            description,
            image_url_high,
            price: parseFloat(price) || 0,
            category: category || '[]',
            seller_id: req.user.id
        });

        await newProduct.save();

        res.status(201).json({
            message: 'Thêm sản phẩm thành công!',
            product: newProduct
        });
    } catch (error) {
        console.error('Lỗi khi thêm sản phẩm:', error);
        res.status(500).json({
            message: 'Lỗi Server khi thêm sản phẩm'
        });
    }
};

/**
 * Lấy danh sách sản phẩm của seller đang đăng nhập.
 * Có gộp thêm dữ liệu AI: ưu tiên nhập hàng, khách hàng dự đoán, tệp marketing.
 */
const getMyProducts = async (req, res) => {
    try {
        const sellerId = req.user.id;

        const products = await Product.find({ seller_id: sellerId })
            .sort({ createdAt: -1 })
            .lean();

        const aiInventoryDoc = await SmartCatalog.findOne({
            $or: [
                { inventory: { $exists: true } },
                { best_inventory_items: { $exists: true } },
                { explainable_procurement: { $exists: true } }
            ]
        }).lean();

        let aiInventoryItems = [];

        if (aiInventoryDoc) {
            const invObject = aiInventoryDoc.inventory || aiInventoryDoc;

            aiInventoryItems =
                invObject.best_inventory_items ||
                invObject.explainable_procurement ||
                [];
        }

        const aiMarketingDoc = await SmartCatalog.findOne({
            $or: [
                { marketing: { $exists: true } },
                { best_marketing_targets: { $exists: true } }
            ]
        }).lean();

        let aiMarketingItems = [];

        if (aiMarketingDoc) {
            const mktObject = aiMarketingDoc.marketing || aiMarketingDoc;

            aiMarketingItems =
                aiMarketingDoc.best_marketing_targets ||
                mktObject.best_marketing_targets ||
                [];
        }

        const enrichedProducts = products.map((prod) => {
            const invMatch = aiInventoryItems.find(
                (ai) =>
                    ai.asin === prod.asin ||
                    String(ai.item_id) === String(prod.item_id)
            );

            const mktMatch = aiMarketingItems.find(
                (ai) =>
                    ai.asin === prod.asin ||
                    String(ai.item_id) === String(prod.item_id)
            );

            let inventoryAction = 'monitor';
            let predictedUsers = 0;
            let isMarketing = false;

            if (invMatch) {
                const rawAction = String(
                    invMatch.inventory_action ||
                    invMatch.inventory_decision ||
                    invMatch.procurement_decision_type ||
                    ''
                ).toLowerCase();

                if (rawAction.includes('high') || rawAction.includes('ưu tiên')) {
                    inventoryAction = 'priority_import';
                } else if (
                    rawAction.includes('medium') ||
                    rawAction.includes('cân nhắc') ||
                    rawAction.includes('nhập thử')
                ) {
                    inventoryAction = 'consider_import';
                } else if (
                    rawAction.includes('over') ||
                    rawAction.includes('tránh') ||
                    rawAction.includes('low') ||
                    rawAction.includes('hạn chế')
                ) {
                    inventoryAction = 'avoid_import';
                }

                predictedUsers =
                    invMatch.predicted_user_count ||
                    invMatch.historical_unique_users ||
                    0;
            }

            if (mktMatch) {
                isMarketing = true;

                const mktUsers =
                    mktMatch.target_user_count ||
                    mktMatch.predicted_user_count ||
                    0;

                predictedUsers = Math.max(predictedUsers, mktUsers);
            }

            return {
                ...prod,
                ai_inventory_action: inventoryAction,
                ai_predicted_users: predictedUsers,
                ai_is_marketing: isMarketing
            };
        });

        res.json(enrichedProducts);
    } catch (error) {
        console.error('Lỗi lấy danh sách sản phẩm AI của seller:', error);
        res.status(500).json({
            message: 'Lỗi khi lấy danh sách sản phẩm của bạn'
        });
    }
};

/**
 * Cập nhật sản phẩm.
 * Seller chỉ được sửa sản phẩm của chính mình.
 * Admin có thể sửa tất cả sản phẩm.
 */
const updateProduct = async (req, res) => {
    try {
        // 🌟 ĐÃ SỬA: Tìm kiếm sản phẩm bằng mã ASIN thay vì _id
        const product = await Product.findOne({ asin: req.params.id });

        if (!product) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm!' });
        }

        if (req.user.role !== 2 && product.seller_id.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Bạn không có quyền sửa sản phẩm này!' });
        }

        const updateData = { ...req.body };

        // Logic dọn rác Cloudinary (giữ nguyên của bạn)
        if (req.file) {
            const oldImageUrl = product.image_url_high || product.image_url;
            if (oldImageUrl) {
                const publicId = getPublicIdFromUrl(oldImageUrl);
                if (publicId) await cloudinary.uploader.destroy(publicId);
            }
            updateData.image_url_high = req.file.path;
            updateData.image_url = req.file.path;
        }

        // 🌟 ĐÃ SỬA: Cập nhật dữ liệu bằng ASIN
        const updatedProduct = await Product.findOneAndUpdate(
            { asin: req.params.id },
            { $set: updateData },
            { new: true }
        );

        res.json({ message: 'Cập nhật thành công!', product: updatedProduct });
    } catch (error) {
        console.error('Lỗi hệ thống khi cập nhật sản phẩm:', error);
        res.status(500).json({ message: 'Lỗi Server khi cập nhật sản phẩm' });
    }
};
/**
 * Xóa sản phẩm.
 * Seller chỉ được xóa sản phẩm của chính mình.
 * Admin có thể xóa tất cả sản phẩm.
 */
const deleteProduct = async (req, res) => {
    try {
        // 🌟 ĐÃ SỬA: Tìm bằng mã ASIN
        const product = await Product.findOne({ asin: req.params.id });

        if (!product) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm!' });
        }

        if (req.user.role !== 2 && product.seller_id.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Bạn không có quyền xóa sản phẩm này!' });
        }

        // Logic dọn rác Cloudinary (giữ nguyên của bạn)
        const imageUrl = product.image_url_high || product.image_url;
        if (imageUrl) {
            const publicId = getPublicIdFromUrl(imageUrl);
            if (publicId) await cloudinary.uploader.destroy(publicId);
        }

        // 🌟 ĐÃ SỬA: Xóa bằng ASIN
        await Product.findOneAndDelete({ asin: req.params.id });

        res.json({ message: 'Đã xóa sản phẩm và dọn dẹp bộ nhớ thành công!' });
    } catch (error) {
        console.error('Lỗi hệ thống khi xóa sản phẩm:', error);
        res.status(500).json({ message: 'Lỗi Server khi xóa sản phẩm' });
    }
};
/**
 * Thống kê top sản phẩm bán chạy.
 * Seller: chỉ thống kê sản phẩm của chính seller.
 * Admin: thống kê toàn hệ thống.
 */
const getTopSellingProducts = async (req, res) => {
    try {
        let matchStage = {};
        let sellerProducts = [];

        if (req.user.role !== 2) {
            const sellerId = req.user.id;

            sellerProducts = await Product.find({ seller_id: sellerId })
                .select('asin title image_url_high image_url price main_cat');

            if (sellerProducts.length === 0) {
                return res.json([]);
            }

            const sellerAsins = sellerProducts.map((p) => p.asin);

            matchStage = {
                asin: { $in: sellerAsins }
            };
        }

        const topStats = await Review.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: '$asin',
                    totalSales: { $sum: 1 },
                    avgRating: { $avg: '$overall' }
                }
            },
            { $sort: { totalSales: -1 } },
            { $limit: 20 }
        ]);

        if (req.user.role === 2) {
            const topAsins = topStats.map((stat) => stat._id);

            sellerProducts = await Product.find({
                asin: { $in: topAsins }
            }).select('asin title image_url_high image_url price main_cat');
        }

        const topProducts = topStats.map((stat) => {
            const productInfo = sellerProducts.find(
                (p) => p.asin === stat._id
            );

            return {
                asin: stat._id,
                title: productInfo?.title || 'Sản phẩm không xác định',
                image: productInfo?.image_url_high || productInfo?.image_url || null,
                price: formatPrice(productInfo?.price), // ĐÃ FIX
                totalSales: stat.totalSales,
                avgRating: stat.avgRating ? stat.avgRating.toFixed(1) : 0,
                main_cat: productInfo?.main_cat || 'Chưa phân loại'
            };
        });

        res.json(topProducts);
    } catch (error) {
        console.error('Lỗi lấy top sản phẩm bán chạy:', error);
        res.status(500).json({
            message: 'Lỗi Server khi thống kê'
        });
    }
};

// =======================================================
// 4. ADMIN FUNCTIONS
// Các hàm dành riêng cho admin, role 2
// =======================================================

// =======================================================
// 5. SMART CATALOG / AI SCENARIO FUNCTIONS
// Các hàm lấy dữ liệu kịch bản phân tích AI
// =======================================================

/**
 * Lấy danh sách kịch bản Smart Catalog.
 * Dùng để hiển thị các nhóm chiến lược / scenario do AI phân tích.
 */
const getScenarioSummary = async (req, res) => {
    try {
        const allData =
            await SmartCatalog.findOne({
                $or: [
                    { scenario: { $exists: true } },
                    { page: 'compact' }
                ]
            }).lean() ||
            await SmartCatalog.findOne({}).lean();

        if (!allData) {
            return res.status(404).json({
                message: 'Không tìm thấy dữ liệu kịch bản trong hệ thống'
            });
        }

        const scenarioObj = allData.scenario || allData;
        const list = scenarioObj.scenario_selection || [];

        const sortedList = list.sort(
            (a, b) => (a.final_rank || 1) - (b.final_rank || 1)
        );

        res.json(sortedList);
    } catch (error) {
        console.error('Lỗi lấy tóm tắt kịch bản:', error);
        res.status(500).json({
            message: 'Lỗi hệ thống khi tải kịch bản đối soát'
        });
    }
};



const createProductAndSurvey = async (req, res) => {
    try {
        const { title, brand, category, description, price } = req.body;

        // 1. Lưu sản phẩm vào DB với trạng thái Đang Khảo Sát
        const newProduct = await Product.create({
            title, brand, category, description, price,
            status: 'Đang khảo sát',
            stock: 0 
        });

        // 2. Gọi API Python
        const aiResponse = await axios.post('http://localhost:8000/predict_cold_start', {
            product_id: newProduct._id.toString(),
            title, brand, category, description, price
        });

        const { similar_items, business_summary } = aiResponse.data;

        // 3. LOGIC TÌM USER TIỀM NĂNG TỪ DANH SÁCH ASIN CŨ
        const targetAsins = similar_items.map(item => item.asin);
        
        // Tìm các đơn hàng đã từng mua các sản phẩm giống với sản phẩm mới
        const relatedOrders = await Order.find({ 'items.asin': { $in: targetAsins } });
        
        // Lấy ra danh sách UserID không trùng lặp
        const userIds = [...new Set(relatedOrders.map(order => order.userId.toString()))];

        // Nếu hệ thống test chưa có nhiều đơn hàng, LẤY TẠM 10 USER BẤT KỲ để test Đồ án
        let finalUsersToSurvey = userIds;
        if (finalUsersToSurvey.length === 0) {
            const randomUsers = await User.find({ role: 0 }).limit(10);
            finalUsersToSurvey = randomUsers.map(u => u._id.toString());
        }

        // 4. GỬI EMAIL
        // ⚠️ THAY CÁC LINK VÀ ENTRY ID CỦA BẠN VÀO ĐÂY
        const FORM_BASE_URL = "https://docs.google.com/forms/d/e/1FAIpQLSei5NONE-B-qp7gieotlF2Uf4yUDzf23eZ8W7XLt0a-ccoYLg/viewform";
        const ENTRY_USER_ID = "entry.1153674438"; // Mã ô tương ứng với số 1111 (User ID)
        const ENTRY_PROD_ID = "entry.1266707340";

        for (let userId of finalUsersToSurvey) {
            const userInfo = await User.findById(userId);
            if (!userInfo || !userInfo.email) continue;

            const prefilledLink = `${FORM_BASE_URL}?${ENTRY_USER_ID}=${userInfo._id}&${ENTRY_PROD_ID}=${newProduct._id}`;

            await transporter.sendMail({
                from: '"Kho Điện Tử" <no-reply@khodientu.com>',
                to: userInfo.email,
                subject: 'Sản phẩm mới thiết kế riêng cho bạn!',
                html: `
                    <div style="font-family: Arial; padding: 20px; background: #f0f9ff; border-radius: 8px;">
                        <h2 style="color: #0284c7;">Chào ${userInfo.name || userInfo.username},</h2>
                        <p>Dựa trên sở thích mua sắm của bạn, chúng tôi chuẩn bị ra mắt: <b>${title}</b>.</p>
                        <p>Bạn có hứng thú với sản phẩm này với mức giá <b>${price}$</b> không?</p>
                        <div style="margin: 30px 0; text-align: center;">
                            <a href="${prefilledLink}" style="padding:12px 24px; background: #0284c7; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold;">
                                Điền Khảo Sát Nhanh
                            </a>
                        </div>
                        <p style="font-size: 12px; color: #64748b;">(Hệ thống AI đã tự động phân tích độ phù hợp của bạn với sản phẩm này).</p>
                    </div>
                `
            });
        }

        res.json({ 
            message: 'Đã lưu sản phẩm và gửi email khảo sát thành công!', 
            ai_summary: business_summary,
            usersMailed: finalUsersToSurvey.length
        });

    } catch (error) {
        console.error("Lỗi:", error);
        res.status(500).json({ message: 'Lỗi server khi phân tích AI' });
    }
};

// =======================================================
// 6. EXPORT CONTROLLER FUNCTIONS
// Xuất các hàm để route sử dụng
// =======================================================

module.exports = {
    // Public / Customer
    getProducts,
    getProductByAsin,
    getProductById,
    getSearchSuggestions,

    // AI Recommendation
    getAiRecommendations,

    // Seller
    addProduct,
    getMyProducts,
    updateProduct,
    deleteProduct,
    getTopSellingProducts,

    // Admin

    // Smart Catalog
    getScenarioSummary,
    // Survey
    createProductAndSurvey
};