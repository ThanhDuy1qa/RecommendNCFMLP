const Product = require('../models/Product');

// 1. Hàm lấy danh sách toàn bộ danh mục
const getCategories = async (req, res) => {
    try {
        const categories = await Product.distinct("main_cat");
        const cleanCategories = categories.filter(cat => cat != null && cat !== "");
        res.json(cleanCategories);
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
        
        const rawCategory = req.query.category || "";
        const category = decodeURIComponent(rawCategory); 

        const skip = (page - 1) * limit;

        let query = {};
        
        // Lọc theo chữ (Tìm kiếm)
        if (search) {
            if (search.length === 10 && !search.includes(' ')) {
                query.asin = search; 
            } else {
                query.title = { $regex: search, $options: 'i' }; 
            }
        }

        // Lọc theo Danh mục
        if (category) {
            const catNormal = category.replace(/&amp;/g, '&');
            const catWithAmp = catNormal.replace(/&/g, '&amp;'); 
            query.main_cat = { $in: [catNormal, catWithAmp] };
        }

        const products = await Product.find(query).skip(skip).limit(limit);

        const formattedProducts = products.map(prod => {
            let cleanPrice = "Liên hệ";
            if (prod.price && 
                !prod.price.includes('{') && 
                !prod.price.includes('margin') && 
                !prod.price.includes('<div') &&
                !prod.price.includes('<span')) {
                cleanPrice = prod.price;
            }

            let img = null;
            if (prod.imageURLHighRes && prod.imageURLHighRes.length > 0) {
                img = prod.imageURLHighRes[0];
            } else if (prod.imageURL && prod.imageURL.length > 0) {
                img = prod.imageURL[0];
            }

            return {
                asin: prod.asin,
                title: prod.title || "Chưa có tiêu đề",
                price: cleanPrice,
                brand: prod.brand || "N/A",
                image: img,
                category: prod.category && prod.category.length > 0 ? prod.category[prod.category.length - 1] : "Điện tử",
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

        let cleanPrice = "Liên hệ";
        if (product.price && !product.price.includes('{') && !product.price.includes('margin')) {
            cleanPrice = product.price;
        }

        const productDetail = {
            ...product._doc,
            price: cleanPrice
        };

        res.json(productDetail);
    } catch (error) {
        console.error("Lỗi lấy chi tiết sản phẩm:", error);
        res.status(500).json({ message: "Lỗi Server" });
    }
};
const getSearchSuggestions = async (req, res) => {
    try {
        const keyword = req.query.q || "";
        if (!keyword) return res.json([]);

        // Tìm tương đối theo tên hoặc mã ASIN
        const query = {
            $or: [
                { title: { $regex: keyword, $options: 'i' } },
                { asin: { $regex: keyword, $options: 'i' } }
            ]
        };

        // Chỉ lấy 5 sản phẩm và chọn đúng 3 trường cần thiết cho nhẹ
        const suggestions = await Product.find(query)
            .select('title asin imageURLHighRes imageURL')
            .limit(5);

        const formattedSuggestions = suggestions.map(prod => {
            let img = null;
            if (prod.imageURLHighRes && prod.imageURLHighRes.length > 0) img = prod.imageURLHighRes[0];
            else if (prod.imageURL && prod.imageURL.length > 0) img = prod.imageURL[0];

            return {
                asin: prod.asin,
                title: prod.title || "Chưa có tiêu đề",
                image: img
            };
        });

        res.json(formattedSuggestions);
    } catch (error) {
        console.error("Lỗi lấy gợi ý:", error);
        res.status(500).json({ message: "Lỗi Server" });
    }
};
// Xuất các hàm ra để file routes có thể sử dụng
module.exports = {
    getCategories,
    getProducts,
    getProductByAsin,
    getSearchSuggestions
};
