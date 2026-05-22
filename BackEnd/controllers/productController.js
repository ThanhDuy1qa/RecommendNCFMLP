const Product = require('../models/Product');
const Recommendation = require('../models/Recommendation'); 
const TrainData = require('../models/TrainData');
const User = require('../models/User');
const InventoryAdvice = require('../models/InventoryAdvice');
const ScenarioSummary = require('../models/ScenarioSummary');
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
        const recs = await Recommendation.find({ user_id: userId }).sort({ rank: 1 }).limit(60);
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
        const finalValidProducts = sortedProducts.slice(0, 24);

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

const getMyProducts = async (req, res) => {
    try {
        const sellerId = req.user.id; 
        const products = await Product.find({ seller_id: sellerId }).sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
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
const getTopSellingProducts = async (req, res) => {
    try {
        let matchStage = {};
        let sellerProducts = [];

        // Nếu là Seller, lọc để chỉ lấy ID các sản phẩm của họ
        if (req.user.role !== 2) {
            const sellerId = req.user.id; 
            // ĐÃ SỬA: Lấy thêm trường image_url để đề phòng image_url_high bị rỗng
            sellerProducts = await Product.find({ seller_id: sellerId }).select('asin title image_url_high image_url price');
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
            // ĐÃ SỬA: Lấy thêm trường image_url
            sellerProducts = await Product.find({ asin: { $in: topAsins } }).select('asin title image_url_high image_url price');
        }

        const topProducts = topStats.map(stat => {
            const productInfo = sellerProducts.find(p => p.asin === stat._id);
            
            // ĐÃ FIX LỖI 1 & 2 TẠI ĐÂY
            return {
                asin: stat._id,
                title: productInfo?.title || "Sản phẩm không xác định",
                // Ưu tiên image_url_high, nếu không có thì lấy image_url
                image: productInfo?.image_url_high || productInfo?.image_url || null,
                // Ép thành số, làm tròn 2 chữ số (Frontend không cần tự gắn $ nữa)
                price: productInfo?.price ? parseFloat(productInfo.price).toFixed(2) : null,
                totalSales: stat.totalSales,
                avgRating: stat.avgRating ? stat.avgRating.toFixed(1) : 0
            };
        });

        res.json(topProducts);
    } catch (error) {
        console.error("Lỗi lấy top sản phẩm bán chạy:", error);
        res.status(500).json({ message: "Lỗi Server khi thống kê" });
    }
};

// Hàm tổng hợp dữ liệu phân tích hệ thống gợi ý AI dành cho Admin (ĐÃ TỐI ƯU HIỆU NĂNG)
const getAdminAiAnalytics = async (req, res) => {
    try {
        if (req.user.role !== 2) {
            return res.status(403).json({ message: "Từ chối truy cập! Quyền hạn không đủ." });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 15;
        const search = req.query.search || "";

        // --- 1. TẠO BỘ LỌC TÌM KIẾM ---
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
        // TỐI ƯU 1: CHẠY SONG SONG (PARALLEL EXECUTION) 2 TÁC VỤ NẶNG NHẤT
        // =====================================================================
        const [topRecommendedStats, uniqueUserIds] = await Promise.all([
            // Tác vụ A: Tính Top 10 sản phẩm (Chạy trên background)
            Recommendation.aggregate([
                { $group: { _id: "$item_id", totalUsersTargeted: { $sum: 1 }, avgAiScore: { $avg: "$hybrid_score" } } },
                { $sort: { totalUsersTargeted: -1 } },
                { $limit: 10 }
            ]),
            // Tác vụ B: Lấy danh sách ID người dùng (Chỉ lấy ID nên siêu nhanh)
            Recommendation.distinct('user_id', matchStage)
        ]);

        // --- XỬ LÝ KẾT QUẢ TÁC VỤ A (TOP 10 SẢN PHẨM) ---
        const aiItemIds = topRecommendedStats.map(item => item._id);
        const itemMappings = await TrainData.find({ item: { $in: aiItemIds } });
        const asinList = itemMappings.map(m => m.item_id);
        const rawProducts = await Product.find({ asin: { $in: asinList } }, 'asin title image_url_high image_url price');
        
        const topProductsFormatted = topRecommendedStats.map(stat => {
            const mapObj = itemMappings.find(m => m.item === stat._id);
            if (!mapObj) return null;
            const prod = rawProducts.find(p => p.asin === mapObj.item_id);
            return {
                asin: mapObj.item_id,
                title: prod?.title || "Sản phẩm đã bị xóa khỏi kho hàng",
                image: prod?.image_url_high || prod?.image_url || null,
                price: prod?.price ? `$${parseFloat(prod.price).toFixed(2)}` : "N/A",
                frequency: stat.totalUsersTargeted,
                score: stat.avgAiScore ? stat.avgAiScore.toFixed(4) : 0
            };
        }).filter(p => p !== null);

        // =====================================================================
        // TỐI ƯU 2: KỸ THUẬT PHÂN TRANG "PRE-FILTERING" TRONG RAM
        // =====================================================================
        const totalUsers = uniqueUserIds.length;
        
        // Sắp xếp ID và CẮT RA ĐÚNG 15 NGƯỜI cho trang hiện tại (Thao tác trong RAM tốn 0.001s)
        uniqueUserIds.sort((a, b) => a - b);
        const paginatedUserIds = uniqueUserIds.slice((page - 1) * limit, page * limit);

        // Chạy Aggregate NHƯNG CHỈ TRÊN ĐÚNG 15 NGƯỜI ĐÓ (Tránh phải gom nhóm hàng vạn người)
        const bulkUserRecommendations = await Recommendation.aggregate([
            { $match: { user_id: { $in: paginatedUserIds } } }, // <--- Chìa khóa tăng tốc độ ở đây!
            { $sort: { user_id: 1, rank: 1 } },
            {
                $group: {
                    _id: "$user_id",
                    recommendedItems: { $push: "$item_id" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Đổ ngược thông tin từ bảng User
        // Đổ ngược thông tin từ bảng User
        const currentAiUserIds = bulkUserRecommendations.map(u => u._id.toString());
        const appUsers = await User.find({ username: { $in: currentAiUserIds } }, 'name email amazon_id username');

        // =====================================================================
        // TỐI ƯU 3: DỊCH MÃ SẢN PHẨM HÀNG LOẠT (TỪ SỐ SANG HÌNH ẢNH & TÊN)
        // =====================================================================
        // 1. Gom tất cả ID số của 5 sản phẩm xem trước từ 15 khách hàng (tránh truy vấn lặp)
        const allPreviewItemIds = [...new Set(bulkUserRecommendations.flatMap(u => u.recommendedItems.slice(0, 5)))];
        
        // 2. Tra cứu TrainData 1 lần duy nhất để lấy mã ASIN
        const previewItemMappings = await TrainData.find({ item: { $in: allPreviewItemIds } });
        const previewAsinList = previewItemMappings.map(m => m.item_id);

        // 3. Tra cứu Product 1 lần duy nhất để lấy Tên và Ảnh
        const previewProducts = await Product.find({ asin: { $in: previewAsinList } }, 'asin title image_url_high image_url price');

        // Format lại dữ liệu đầu ra cho Admin
        const userAnalyticsFormatted = bulkUserRecommendations.map(u => {
            const userInfo = appUsers.find(usr => usr.username === u._id.toString());

            // 4. Lắp ráp dữ liệu chi tiết cho 5 sản phẩm xem trước
            const detailedPreviewItems = u.recommendedItems.slice(0, 5).map(numericId => {
                const mapObj = previewItemMappings.find(m => m.item === numericId);
                const prodInfo = mapObj ? previewProducts.find(p => p.asin === mapObj.item_id) : null;
                
                return {
                    aiItemId: numericId, // Vẫn giữ số ID cũ để Admin đối soát nếu cần
                    asin: mapObj ? mapObj.item_id : "N/A",
                    title: prodInfo?.title || "Sản phẩm không xác định (Bị xóa)",
                    image: prodInfo?.image_url_high || prodInfo?.image_url || null,
                    price: prodInfo?.price ? `$${parseFloat(prodInfo.price).toFixed(2)}` : "N/A"
                };
            });

            return {
                aiUserId: u._id,
                amazonId: userInfo?.amazon_id || "Khuyết mã gốc",
                name: userInfo?.name || `Khách hàng AI #${u._id}`,
                email: userInfo?.email || `user${u._id}@datn.com`,
                totalCount: u.recommendedItems.length,
                previewItems: detailedPreviewItems // Trả về mảng Object chi tiết thay vì mảng số
            };
        });

        // Trả kết quả
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
// =========================================================
// API 1: Tải danh sách Trợ lý Nhập hàng (Có tìm kiếm & phân trang)
// =========================================================
// =========================================================
// API 1: Tải danh sách Trợ lý Nhập hàng (ĐÃ THÊM PHÂN QUYỀN SELLER / ADMIN)
// =========================================================
const getInventoryAdvice = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const scenario = req.query.scenario || "users500_topk20_user_focus"; 
        const decision = req.query.decision || "";
        const search = req.query.search || "";

        // Tạo bộ lọc truy vấn gốc
        let query = { scenario: scenario };
        if (decision) query.inventory_decision = decision;
        
        // ===============================================================
        // 🔒 CƠ CHẾ PHÂN QUYỀN CÁCH LY DỮ LIỆU (DATA ISOLATION)
        // ===============================================================
        // req.user.role === 2 là Admin. Nếu khác 2 thì chắc chắn là Seller
       if (req.user && req.user.role !== 2) {
            // 1. Quét bảng Product tìm tất cả sản phẩm mà Seller này ĐANG SỞ HỮU
            // Dùng select('item_id') để query chạy siêu nhẹ, chỉ lấy đúng cột mã AI
            const myProducts = await Product.find({ seller_id: req.user.id }).select('item_id');
            
            // 2. Rút trích ra một mảng chỉ chứa các con số item_id
            const myItemIds = myProducts.map(p => p.item_id).filter(id => id != null);
            
            // 3. Ép điều kiện: Bảng gợi ý AI chỉ được hiển thị những item_id nằm trong kho của Seller này
            // Nếu Seller chưa có sản phẩm nào (myItemIds rỗng), MongoDB sẽ tự hiểu và trả về mảng rỗng (Không cho xem gì cả)
            query.item_id = { $in: myItemIds };
        }
        // ===============================================================

        if (search) {
            const searchRegex = { $regex: search, $options: 'i' };
            if (!isNaN(search)) {
                query.$or = [
                    { title: searchRegex },
                    { item_id: Number(search) }
                ];
            } else {
                query.$or = [
                    { title: searchRegex },
                    { brand: searchRegex }
                ];
            }
        }

        const totalItems = await InventoryAdvice.countDocuments(query);
        const items = await InventoryAdvice.find(query)
            .sort({ user_based_inventory_rank: 1 }) 
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(); 

        res.json({
            items,
            pagination: {
                totalItems,
                currentPage: page,
                totalPages: Math.ceil(totalItems / limit)
            }
        });
    } catch (error) {
        console.error("Lỗi lấy dữ liệu nhập hàng:", error);
        res.status(500).json({ message: "Lỗi lấy dữ liệu nhập hàng" });
    }
};
// API 2: Lấy danh sách tổng hợp kịch bản thuật toán phục vụ vẽ biểu đồ so sánh
const getScenarioSummary = async (req, res) => {
    try {
        const summaries = await ScenarioSummary.find().sort({ final_rank: 1 });
        res.json(summaries);
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy tóm tắt thuật toán" });
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
    getInventoryAdvice,
    getScenarioSummary
};