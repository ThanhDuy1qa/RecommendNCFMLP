const Product = require('../models/Product');
const Recommendation = require('../models/Recommendation'); 
const TrainData = require('../models/TrainData');
const User = require('../models/User');
const SmartCatalog = require('../models/SmartCatalog');
const InventoryAdvice = require('../models/InventoryAdvice');
const MarketingTarget = require('../models/MarketingTarget');

// 2. Hàm lấy danh sách sản phẩm 
const getProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 45;
        const search = req.query.search || ""; 
        const category = decodeURIComponent(req.query.category || ""); 
        const skip = (page - 1) * limit;

        let query = {};
        
        if (search) {
            if (search.length === 10 && !search.includes(' ')) {
                query.asin = search; 
            } else {
                query.title = { $regex: search, $options: 'i' }; 
            }
        }

        // ĐÃ SỬA Ở ĐÂY: Đồng bộ thuật toán tìm danh mục giống bên Category
        if (category) {
            let safeName = category.replace(/&amp;/g, '&').trim();
            safeName = safeName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); 
            const regexPattern = `^\\s*${safeName.replace(/\s*&\s*/g, '\\s*.*\\s*')}\\s*$`;
            
            query.main_cat = { $regex: new RegExp(regexPattern, 'i') };
        }

        const products = await Product.find(query).skip(skip).limit(limit);

        const formattedProducts = products.map(prod => {
            return {
                _id: prod._id, 
                asin: prod.asin, 
                item_id: prod.item_id, 
                title: prod.title || "Chưa có tiêu đề",
                price: prod.price ? `$${parseFloat(prod.price).toFixed(2)}` : "Liên hệ",
                brand: prod.brand || "N/A",
                image: prod.image_url_high || prod.image_url || null,
                category: "Điện tử",
                main_cat: prod.main_cat || "Electronics"
            };
        });

        res.json(formattedProducts);
    } catch (error) {
        console.error("Lỗi lấy sản phẩm:", error);
        res.status(500).json({ message: "Lỗi Server" });
    }
};

// 3. Hàm lấy chi tiết 1 sản phẩm theo ASIN
const getProductByAsin = async (req, res) => {
    try {
        const { asin } = req.params;
        const product = await Product.findOne({ asin: asin }); 

        if (!product) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
        }

        const productDetail = {
            ...product._doc,
            asin: product.asin, 
            // ĐÃ SỬA: Ép kiểu số và làm tròn 2 chữ số
            price: product.price ? `$${parseFloat(product.price).toFixed(2)}` : "Liên hệ",
            imageURLHighRes: product.image_url_high ? [product.image_url_high] : [],
            imageURL: product.image_url ? [product.image_url] : [],
            description: product.description ? [product.description] : []
        };

        res.json(productDetail);
    } catch (error) {
        console.error("Lỗi lấy chi tiết sản phẩm:", error);
        res.status(500).json({ message: "Lỗi Server" });
    }
};

// 4. Hàm gợi ý tìm kiếm
const getSearchSuggestions = async (req, res) => {
    try {
        const keyword = req.query.q || "";
        if (!keyword) return res.json([]);

        const query = {
            $or: [
                { title: { $regex: keyword, $options: 'i' } },
                { asin: { $regex: keyword, $options: 'i' } } 
            ]
        };

        const suggestions = await Product.find(query).select('title asin image_url_high image_url').limit(5); 

        const formattedSuggestions = suggestions.map(prod => {
            return {
                asin: prod.asin, 
                title: prod.title || "Chưa có tiêu đề",
                image: prod.image_url_high || prod.image_url || null
            };
        });

        res.json(formattedSuggestions);
    } catch (error) {
        console.error("Lỗi lấy gợi ý:", error);
        res.status(500).json({ message: "Lỗi Server" });
    }
};

// 5. Hàm lấy danh sách chi tiết sản phẩm gợi ý từ AI Fusion
const getAiRecommendations = async (req, res) => {
    try {
        const rawId = req.params.reviewerId; 
        let userId = Number(rawId); 

        if (isNaN(userId)) {
            const userMapping = await TrainData.findOne({ user_id: rawId });
            if (!userMapping || userMapping.user === undefined) {
                return res.json([]); 
            }
            userId = userMapping.user; 
        }

        // BƯỚC 1: Lấy dư ra 60 gợi ý từ AI để trừ hao các sản phẩm đã bị xóa
        const recs = await Recommendation.find({ user_id: userId }).sort({ rank: 1 }).limit(200);
        if (recs.length === 0) return res.json([]); 
        
        const aiItemIds = recs.map(rec => rec.item_id);

        const mappings = await TrainData.find({ item: { $in: aiItemIds } });
        const asinList = mappings.map(m => m.item_id); 

        const products = await Product.find({ asin: { $in: asinList } });

        // BƯỚC 2: Map và lọc bỏ ngay các sản phẩm bị null/undefined (hàng bị lỗi/xóa)
        const sortedProducts = aiItemIds.map(aiId => {
            const mapObj = mappings.find(m => m.item === aiId);
            if (!mapObj) return null;
            return products.find(p => p.asin === mapObj.item_id);
        }).filter(p => p !== null && p !== undefined);

        // BƯỚC 3: CHỐT SỔ - Cắt lấy chính xác 20 sản phẩm hợp lệ, điểm cao nhất
        // Dù Bước 2 còn lại 28 hay 59 sản phẩm, dòng này sẽ ép nó về đúng 20!
        const finalValidProducts = sortedProducts.slice(0, 100);

        // BƯỚC 4: Format dữ liệu trả về cho React
        const formattedRecommendations = finalValidProducts.map(prod => {
            return {
                _id: prod._id, 
                asin: prod.asin, 
                title: prod.title || "Chưa có tiêu đề",
                price: prod.price ? `$${parseFloat(prod.price).toFixed(2)}` : "Liên hệ",
                brand: prod.brand || "N/A",
                image: prod.image_url_high || prod.image_url || null, 
                category: "Điện tử",
                main_cat: prod.main_cat || "Electronics"
            };
        });

        res.json(formattedRecommendations);
    } catch (error) {
        console.error("Lỗi lấy gợi ý:", error);
        res.status(500).json({ message: "Lỗi hệ thống gợi ý AI" });
    }
};
// Hàm thêm sản phẩm mới
const addProduct = async (req, res) => {
    try {
        const { asin, title, brand, price, main_cat, category, description } = req.body;
        
        // MỚI: Lấy ảnh từ Cloudinary, nếu không có thì để rỗng
        const image_url_high = req.file ? req.file.path : "";
        
        if (parseFloat(price) < 0) return res.status(400).json({ message: "Giá không được âm!" });
        
        const existingProduct = await Product.findOne({ asin }); 
        if (existingProduct) {
            return res.status(400).json({ message: "Mã ASIN này đã tồn tại trong hệ thống!" });
        }

        const newProduct = new Product({
            asin, 
            title, brand, main_cat, description, image_url_high,
            price: parseFloat(price) || 0,
            category: category || "[]",
            seller_id: req.user.id // Đừng quên gắn seller_id để sản phẩm thuộc về người đăng
        });

        await newProduct.save();
        res.status(201).json({ message: "Thêm sản phẩm thành công!", product: newProduct });
    } catch (error) {
        console.error("Lỗi khi thêm sản phẩm:", error);
        res.status(500).json({ message: "Lỗi Server khi thêm sản phẩm" });
    }
};
// Hàm lấy danh sách sản phẩm của Seller (Đã gộp AI Data)
// Hàm lấy danh sách sản phẩm của Seller (Đã sửa logic bóc tách mảng lồng AI)
const getMyProducts = async (req, res) => {
    try {
        const sellerId = req.user.id; 
        
        // 1. Lấy toàn bộ sản phẩm của Shop
        const products = await Product.find({ seller_id: sellerId }).sort({ createdAt: -1 }).lean();
        const asinList = products.map(p => p.asin);

        // =====================================================================
        // ĐÃ SỬA: Bóc tách mảng lồng của InventoryAdvice y hệt bên AnalyticsController
        // =====================================================================
        const aiInventoryDoc = await InventoryAdvice.findOne({
            $or: [
                { inventory: { $exists: true } }, 
                { best_inventory_items: { $exists: true } }, 
                { explainable_procurement: { $exists: true } }
            ]
        }).lean();
        
        let aiInventoryItems = [];
        if (aiInventoryDoc) {
            const invObject = aiInventoryDoc.inventory || aiInventoryDoc;
            aiInventoryItems = invObject.best_inventory_items || invObject.explainable_procurement || [];
        }

        // =====================================================================
        // ĐÃ SỬA: Bóc tách mảng lồng của MarketingTarget y hệt bên AnalyticsController
        // =====================================================================
        const aiMarketingDoc = await MarketingTarget.findOne({
            $or: [
                { marketing: { $exists: true } }, 
                { best_marketing_targets: { $exists: true } }
            ]
        }).lean();
        
        let aiMarketingItems = [];
        if (aiMarketingDoc) {
            const mktObject = aiMarketingDoc.marketing || aiMarketingDoc;
            aiMarketingItems = aiMarketingDoc.best_marketing_targets || mktObject.best_marketing_targets || [];
        }

        // 3. Đắp dữ liệu AI vào Sản phẩm gốc bằng cách duyệt tìm trên mảng đã được giải phẳng
        const enrichedProducts = products.map(prod => {
            // Khớp nối thông minh qua cả ASIN lẫn numeric item_id để chống lệch kiểu dữ liệu
            const invMatch = aiInventoryItems.find(ai => ai.asin === prod.asin || String(ai.item_id) === String(prod.item_id));
            const mktMatch = aiMarketingItems.find(ai => ai.asin === prod.asin || String(ai.item_id) === String(prod.item_id));

            let inventoryAction = "monitor"; 
            let predictedUsers = 0;
            let isMarketing = false;

            if (invMatch) {
                const rawAction = String(invMatch.inventory_action || invMatch.inventory_decision || invMatch.procurement_decision_type || "").toLowerCase();
                
                if (rawAction.includes("high") || rawAction.includes("ưu tiên")) {
                    inventoryAction = "priority_import";
                } else if (rawAction.includes("medium") || rawAction.includes("cân nhắc") || rawAction.includes("nhập thử")) {
                    inventoryAction = "consider_import";
                } else if (rawAction.includes("over") || rawAction.includes("tránh") || rawAction.includes("low") || rawAction.includes("hạn chế")) {
                    inventoryAction = "avoid_import";
                }
                
                predictedUsers = invMatch.predicted_user_count || invMatch.historical_unique_users || 0;
            }

            if (mktMatch) {
                isMarketing = true;
                const mktUsers = mktMatch.target_user_count || mktMatch.predicted_user_count || 0;
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
        console.error("Lỗi lấy danh sách sản phẩm AI của seller:", error);
        res.status(500).json({ message: "Lỗi khi lấy danh sách sản phẩm của bạn" });
    }
};
// Hàm Xóa sản phẩm
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm!" });

        if (req.user.role !== 2 && product.seller_id.toString() !== req.user.id) {
            return res.status(403).json({ message: "Bạn không có quyền xóa sản phẩm này!" });
        }

        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: "Đã xóa sản phẩm thành công!" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi Server khi xóa sản phẩm" });
    }
};

// Hàm Cập nhật (Sửa) sản phẩm
// Hàm Cập nhật (Sửa) sản phẩm
const updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm!" });

        // Kiểm tra quyền sở hữu hoặc quyền quản trị viên
        if (req.user.role !== 2 && product.seller_id.toString() !== req.user.id) {
            return res.status(403).json({ message: "Bạn không có quyền sửa sản phẩm này!" });
        }

        // Tạo bản sao dữ liệu trường văn bản từ req.body
        const updateData = { ...req.body };

        // GIẢI QUYẾT GỐC RỄ LỖI KHÔNG LÊN DB:
        // Nếu req.file tồn tại nghĩa là hệ thống vừa tải thành công ảnh mới lên Cloudinary
        if (req.file) {
            updateData.image_url_high = req.file.path;
            updateData.image_url = req.file.path; // Đồng bộ cả hai cột ảnh trong mô hình dữ liệu
        }

        // Tiến hành cập nhật tập hợp dữ liệu mới đã được xử lý ảnh vào MongoDB
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id, 
            { $set: updateData }, 
            { new: true } 
        );

        res.json({ message: "Cập nhật thành công!", product: updatedProduct });
    } catch (error) {
        console.error("Lỗi hệ thống khi cập nhật sản phẩm:", error);
        res.status(500).json({ message: "Lỗi Server khi cập nhật sản phẩm" });
    }
};

// Lấy chi tiết 1 sản phẩm theo MongoDB _id (Dành cho trang Sửa)
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm trong Database!" });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: "ID sản phẩm không hợp lệ hoặc lỗi Server" });
    }
};

// Hàm thống kê Top 5 sản phẩm bán chạy
// Hàm thống kê Top 5 sản phẩm bán chạy
const getTopSellingProducts = async (req, res) => {
    try {
        let matchStage = {};
        let sellerProducts = [];

        // Nếu là Seller, lọc để chỉ lấy ID các sản phẩm của họ
        if (req.user.role !== 2) {
            const sellerId = req.user.id; 
            // 🌟 SỬA ĐIỂM 1: Bổ sung main_cat vào hàm select
            sellerProducts = await Product.find({ seller_id: sellerId })
                                          .select('asin title image_url_high image_url price main_cat');
            if (sellerProducts.length === 0) return res.json([]); 
            
            const sellerAsins = sellerProducts.map(p => p.asin);
            matchStage = { asin: { $in: sellerAsins } };
        }

        const topStats = await require('../models/Review').aggregate([
            { $match: matchStage }, 
            { 
                $group: { 
                    _id: "$asin", 
                    totalSales: { $sum: 1 }, 
                    avgRating: { $avg: "$overall" } 
                } 
            },
            { $sort: { totalSales: -1 } }, 
            { $limit: 20 } 
        ]);

        // Nếu là Admin, lấy tất cả
        if (req.user.role === 2) {
            const topAsins = topStats.map(stat => stat._id);
            // 🌟 SỬA ĐIỂM 2: Bổ sung main_cat vào hàm select
            sellerProducts = await Product.find({ asin: { $in: topAsins } })
                                          .select('asin title image_url_high image_url price main_cat');
        }

        const topProducts = topStats.map(stat => {
            const productInfo = sellerProducts.find(p => p.asin === stat._id);
            
            return {
                asin: stat._id,
                title: productInfo?.title || "Sản phẩm không xác định",
                image: productInfo?.image_url_high || productInfo?.image_url || null,
                price: productInfo?.price ? parseFloat(productInfo.price).toFixed(2) : null,
                totalSales: stat.totalSales,
                avgRating: stat.avgRating ? stat.avgRating.toFixed(1) : 0,
                // 🌟 SỬA ĐIỂM 3: Ánh xạ main_cat trả về cho Frontend
                main_cat: productInfo?.main_cat || "Chưa phân loại"
            };
        });

        res.json(topProducts);
    } catch (error) {
        console.error("Lỗi lấy top sản phẩm bán chạy:", error);
        res.status(500).json({ message: "Lỗi Server khi thống kê" });
    }
};
// Hàm tổng hợp dữ liệu phân tích hệ thống gợi ý AI dành cho Admin
// Hàm tổng hợp dữ liệu phân tích hệ thống gợi ý AI dành cho Admin
const getAdminAiAnalytics = async (req, res) => {
    try {

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 15;
        const search = req.query.search || "";

        // --- 1. TẠO BỘ LỌC TÌM KIẾM ---
        // [Giữ nguyên code phần này...]
        let matchStage = {};
        if (search) {
            if (!isNaN(search)) {
                matchStage = { user_id: Number(search) };
            } else {
                const matchedUsers = await User.find({
                    $or: [
                        { name: { $regex: search, $options: 'i' } },
                        { email: { $regex: search, $options: 'i' } },
                        { amazon_id: { $regex: search, $options: 'i' } }
                    ]
                }, 'username');

                const aiUserIds = matchedUsers.map(u => Number(u.username)).filter(id => !isNaN(id));
                matchStage = { user_id: { $in: aiUserIds } };
            }
        }

        // =====================================================================
        // TỐI ƯU 1: CHẠY SONG SONG 2 TÁC VỤ
        // =====================================================================
        const [topRecommendedStats, uniqueUserIds] = await Promise.all([
            Recommendation.aggregate([
                { $group: { _id: "$item_id", totalUsersTargeted: { $sum: 1 }, avgAiScore: { $avg: "$hybrid_score" } } },
                { $sort: { totalUsersTargeted: -1 } },
                // 🌟 SỬA ĐIỂM 1: TĂNG LIMIT LÊN 100 ĐỂ CÓ NHIỀU TRANG DỮ LIỆU
                { $limit: 300 } 
            ]),
            Recommendation.distinct('user_id', matchStage)
        ]);

        const aiItemIds = topRecommendedStats.map(s => s._id);
        const itemMappings = await TrainData.find({ item: { $in: aiItemIds } });
        const asinList = itemMappings.map(m => m.item_id);
        const rawProducts = await Product.find({ asin: { $in: asinList } }, 'asin title image_url_high image_url price');

        // --- XỬ LÝ KẾT QUẢ TÁC VỤ A ---
        const topProductsFormatted = topRecommendedStats.map(stat => {
            const statId = Number(stat._id);
            const mapObj = itemMappings.find(m => Number(m.item) === statId);
            if (!mapObj) return null;

            const prod = rawProducts.find(p => p.asin === mapObj.item_id);
            if (!prod || !prod.title || prod.title.toLowerCase().includes('xóa')) return null;

            return {
                asin: mapObj.item_id,
                title: prod.title,
                image: prod.image_url_high || prod.image_url || null,
                price: prod.price ? `$${parseFloat(prod.price).toFixed(2)}` : "N/A",
                count: Math.round(stat.totalUsersTargeted || 0), 
                score: typeof stat.avgAiScore === 'number' ? stat.avgAiScore : 0      
            };
        }).filter(p => p !== null).slice(0, 100);
        // 🌟 SỬA ĐIỂM 2: XÓA ĐOẠN ".slice(0, 10)" Ở ĐÂY ĐỂ TRẢ VỀ TOÀN BỘ TOP SẢN PHẨM HỢP LỆ (Lên tới 100 cái)

        // =====================================================================
        // TỐI ƯU 2 & 3: [Giữ nguyên toàn bộ code cũ bên dưới của bạn]
        // =====================================================================
        const totalUsers = uniqueUserIds.length;
        uniqueUserIds.sort((a, b) => a - b);
        const paginatedUserIds = uniqueUserIds.slice((page - 1) * limit, page * limit);

        const bulkUserRecommendations = await Recommendation.aggregate([
            { $match: { user_id: { $in: paginatedUserIds } } },
            { $sort: { user_id: 1, rank: 1 } },
            {
                $group: {
                    _id: "$user_id",
                    recommendedItems: { $push: "$item_id" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const currentAiUserIds = bulkUserRecommendations.map(u => u._id.toString());
        const appUsers = await User.find({ username: { $in: currentAiUserIds } }, 'name email amazon_id username');

        const allPreviewItemIds = [...new Set(bulkUserRecommendations.flatMap(u => u.recommendedItems.slice(0, 15)))];
        const previewItemMappings = await TrainData.find({ item: { $in: allPreviewItemIds } });
        const previewAsinList = previewItemMappings.map(m => m.item_id);
        const previewProducts = await Product.find({ asin: { $in: previewAsinList } }, 'asin title image_url_high image_url price');

        const userAnalyticsFormatted = bulkUserRecommendations.map(u => {
            const userInfo = appUsers.find(usr => usr.username === u._id.toString());
            const validPreviewItems = u.recommendedItems.slice(0, 15).map(numericId => {
                const mapObj = previewItemMappings.find(m => Number(m.item) === Number(numericId));
                const prodInfo = mapObj ? previewProducts.find(p => p.asin === mapObj.item_id) : null;
                if (!prodInfo || !prodInfo.title || prodInfo.title.toLowerCase().includes('xóa')) return null;
                return {
                    aiItemId: numericId,
                    asin: mapObj.item_id,
                    title: prodInfo.title,
                    image: prodInfo.image_url_high || prodInfo.image_url || null,
                    price: prodInfo.price ? `$${parseFloat(prodInfo.price).toFixed(2)}` : "N/A"
                };
            }).filter(item => item !== null).slice(0, 5);

            return {
                aiUserId: u._id,
                amazonId: userInfo?.amazon_id || "Khuyết mã gốc",
                name: userInfo?.name || `Khách hàng AI #${u._id}`,
                email: userInfo?.email || `user${u._id}@datn.com`,
                totalCount: u.recommendedItems.length,
                previewItems: validPreviewItems 
            };
        });

        res.json({
            topProducts: topProductsFormatted,
            userAnalytics: userAnalyticsFormatted,
            pagination: {
                totalUsers,
                currentPage: page,
                limit,
                totalPages: Math.ceil(totalUsers / limit)
            }
        });

    } catch (error) {
        console.error("Lỗi phân tích AI tổng hợp:", error);
        res.status(500).json({ message: "Lỗi nội bộ Server" });
    }
};

// BackEnd/controllers/productController.js (Hàm getScenarioSummary cập nhật)

const getScenarioSummary = async (req, res) => {
    try {
        const allData = await SmartCatalog.findOne({
            $or: [
                { scenario: { $exists: true } },
                { page: "compact" }
            ]
        }).lean() || await SmartCatalog.findOne({}).lean();

        if (!allData) {
            return res.status(404).json({ message: "Không tìm thấy dữ liệu kịch bản trong hệ thống" });
        }

        // Bóc tách đối tượng chứa scenario
        const scenarioObj = allData.scenario || allData;
        const list = scenarioObj.scenario_selection || [];

        // Sắp xếp thứ hạng kịch bản từ cao xuống thấp
        const sortedList = list.sort((a, b) => (a.final_rank || 1) - (b.final_rank || 1));
        
        res.json(sortedList);
    } catch (error) {
        console.error("Lỗi lấy tóm tắt kịch bản:", error);
        res.status(500).json({ message: "Lỗi hệ thống khi tải kịch bản đối soát" });
    }
};


module.exports = {
    getProducts,
    getProductByAsin,
    getSearchSuggestions,
    getAiRecommendations,
    addProduct,
    getMyProducts,
    deleteProduct,
    updateProduct,
    getProductById,
    getTopSellingProducts,
    getAdminAiAnalytics,
    getScenarioSummary
};