const Product = require('../models/Product');
const Recommendation = require('../models/Recommendation'); // Đưa tất cả import lên trên cùng

// 1. Hàm lấy danh sách toàn bộ danh mục (ĐÃ TÍCH HỢP BỘ LỌC LÀM SẠCH)
const getCategories = async (req, res) => {
    try {
        const rawCategories = await Product.distinct("main_cat");

        const cleanedCategories = rawCategories
            .filter(cat => cat != null && cat.trim() !== "") 
            .filter(cat => !cat.includes("<img") && !cat.includes("<a") && !cat.startsWith("<")) 
            .map(cat => cat.replace(/&amp;/g, '&').trim()); 

        const uniqueCategories = [...new Set(cleanedCategories)];
        uniqueCategories.sort();

        res.json(uniqueCategories);
    } catch (error) {
        console.error("Lỗi lấy danh mục:", error);
        res.status(500).json({ message: "Lỗi Server" });
    }
};

// 2. Hàm lấy danh sách sản phẩm (có phân trang, tìm kiếm, lọc)
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
                query.item_id = search; 
            } else {
                query.title = { $regex: search, $options: 'i' }; 
            }
        }

        if (category) {
            const catNormal = category.replace(/&amp;/g, '&');
            const catWithAmp = catNormal.replace(/&/g, '&amp;'); 
            query.main_cat = { $in: [catNormal, catWithAmp] };
        }

        const products = await Product.find(query).skip(skip).limit(limit);

        const formattedProducts = products.map(prod => {
            return {
                _id: prod._id, // Tránh lỗi thiếu key của React
                asin: prod.item_id,
                title: prod.title || "Chưa có tiêu đề",
                price: prod.price ? `$${prod.price}` : "Liên hệ",
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
        const product = await Product.findOne({ item_id: asin });

        if (!product) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
        }

        const productDetail = {
            ...product._doc,
            asin: product.item_id,
            price: product.price ? `$${product.price}` : "Liên hệ",
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
                { item_id: { $regex: keyword, $options: 'i' } }
            ]
        };

        const suggestions = await Product.find(query).select('title item_id image_url_high image_url').limit(5);

        const formattedSuggestions = suggestions.map(prod => {
            return {
                asin: prod.item_id,
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
        const { reviewerId } = req.params;

        const recData = await Recommendation.findOne({ reviewerID: reviewerId });

        if (!recData || !recData.recommendations || recData.recommendations.length === 0) {
            return res.json([]); 
        }

        const asins = recData.recommendations;
        const products = await Product.find({ item_id: { $in: asins } });

        // Phải format lại cấu trúc để React (ProductCard) đọc được ảnh, tên, giá
        const formattedProducts = products.map(prod => {
            return {
                _id: prod._id,
                asin: prod.item_id,
                title: prod.title || "Chưa có tiêu đề",
                price: prod.price ? `$${prod.price}` : "Liên hệ",
                brand: prod.brand || "N/A",
                image: prod.image_url_high || prod.image_url || null,
                category: "Điện tử",
                main_cat: prod.main_cat || "Electronics"
            };
        });

        const sortedProducts = asins
            .map(asin => formattedProducts.find(p => p.asin === asin))
            .filter(p => p != null);

        res.json(sortedProducts);
    } catch (error) {
        console.error("Lỗi lấy gợi ý từ Database:", error);
        res.status(500).json({ message: "Lỗi Server Backend" });
    }
};
// Hàm thêm sản phẩm mới
const addProduct = async (req, res) => {
    try {
        // Lấy dữ liệu từ form React gửi lên
        const { item_id, title, brand, price, main_cat, category, description, image_url_high } = req.body;
        
        if (parseFloat(price) < 0) {
            return res.status(400).json({ message: "Lỗi: Giá sản phẩm không được là số âm!" });
        }
        // Kiểm tra xem mã ASIN (item_id) đã tồn tại chưa
        const existingProduct = await Product.findOne({ item_id });
        if (existingProduct) {
            return res.status(400).json({ message: "Mã ASIN này đã tồn tại trong hệ thống!" });
        }

        // Tạo sản phẩm mới
        const newProduct = new Product({
            item_id,
            title,
            brand,
            price: parseFloat(price) || 0,
            main_cat,
            category: category || "[]", // Lưu dạng chuỗi array giống DB của bạn
            description,
            image_url_high // Thêm link ảnh để ra trang chủ có hình
        });

        // Lưu vào MongoDB
        await newProduct.save();

        res.status(201).json({ message: "Thêm sản phẩm thành công!", product: newProduct });
    } catch (error) {
        console.error("Lỗi khi thêm sản phẩm:", error);
        res.status(500).json({ message: "Lỗi Server khi thêm sản phẩm" });
    }
};

const getMyProducts = async (req, res) => {
    try {
        // req.user.id được lấy từ Token sau khi đi qua lính gác verifyToken
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

        // KIỂM TRA QUYỀN: Nếu không phải Admin (role 2) VÀ không phải chủ sở hữu
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
const updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Không tìm thấy sản phẩm!" });

        // KIỂM TRA QUYỀN
        if (req.user.role !== 2 && product.seller_id.toString() !== req.user.id) {
            return res.status(403).json({ message: "Bạn không có quyền sửa sản phẩm này!" });
        }

        // Cập nhật dữ liệu mới
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id, 
            { $set: req.body }, 
            { new: true } // Trả về data mới sau khi sửa
        );

        res.json({ message: "Cập nhật thành công!", product: updatedProduct });
    } catch (error) {
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

// Hàm thống kê Top 5 sản phẩm bán chạy (dựa trên lượt đánh giá/tương tác)
const getTopSellingProducts = async (req, res) => {
    try {
        const sellerId = req.user.id; // Lấy từ thẻ token của Seller

        // 1. Tìm tất cả sản phẩm của Seller này để lấy mã ASIN
        const sellerProducts = await Product.find({ seller_id: sellerId }).select('item_id title image_url_high price');
        
        if (sellerProducts.length === 0) {
            return res.json([]); // Nếu chưa có sản phẩm nào thì trả về rỗng
        }

        const sellerAsins = sellerProducts.map(p => p.item_id);

        // 2. Dùng Aggregate để đếm số lượng Review cho các ASIN này
        // Lưu ý: Tuyệt đối chỉ dùng { asin: ... } để tận dụng Index siêu tốc
        const topStats = await require('../models/Review').aggregate([
            { $match: { asin: { $in: sellerAsins } } },
            { 
                $group: { 
                    _id: "$asin", 
                    totalSales: { $sum: 1 }, // Mỗi lần xuất hiện tính là 1 lượt mua
                    avgRating: { $avg: "$overall" } // Tiện tay tính luôn điểm đánh giá trung bình
                } 
            },
            { $sort: { totalSales: -1 } }, // Sắp xếp giảm dần theo lượt mua
            { $limit: 20 } // Chỉ lấy Top 20`
        ]);

        // 3. Lắp ghép dữ liệu Thống kê với Thông tin Sản phẩm để gửi về React
        const topProducts = topStats.map(stat => {
            const productInfo = sellerProducts.find(p => p.item_id === stat._id);
            return {
                asin: stat._id,
                title: productInfo?.title || "Sản phẩm không xác định",
                image: productInfo?.image_url_high || null,
                price: productInfo?.price,
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
// Nhớ thêm getProductById vào module.exports nhé
module.exports = {
    getCategories,
    getProducts,
    getProductByAsin,
    getSearchSuggestions,
    getAiRecommendations,
    addProduct,
    getMyProducts,
    deleteProduct,
    updateProduct,
    getProductById,
    getTopSellingProducts
};