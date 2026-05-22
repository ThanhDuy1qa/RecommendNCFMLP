const Category = require('../models/Category');
const Product = require('../models/Product');

// 1. Lấy danh sách toàn bộ danh mục từ bảng Category mới
const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort();
        
        const categoriesWithCount = await Promise.all(categories.map(async (cat) => {
            // THUẬT TOÁN REGEX THÔNG MINH:
            let safeName = cat.name.replace(/&amp;/g, '&').trim();
            // 1. Bọc các ký tự đặc biệt (để tránh lỗi nếu tên có dấu ngoặc)
            safeName = safeName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); 
            // 2. Biến chữ '&' thành '.*' (có thể là khoảng trắng, chữ and, hoặc bị xóa mất)
            const regexPattern = `^\\s*${safeName.replace(/\s*&\s*/g, '\\s*.*\\s*')}\\s*$`;
            
            const count = await Product.countDocuments({ 
                main_cat: { $regex: new RegExp(regexPattern, 'i') } 
            });
            
            return {
                ...cat._doc,
                productCount: count
            };
        }));

        res.json(categoriesWithCount);
    } catch (error) {
        console.error("Lỗi lấy danh mục:", error);
        res.status(500).json({ message: "Lỗi Server khi lấy danh mục" });
    }
};
// 2. Thêm danh mục mới (Dành cho Admin)
const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        // Lấy link ảnh từ Cloudinary trả về, nếu không có file thì để rỗng
        const image_url = req.file ? req.file.path : ""; 

        const newCategory = new Category({ name, image_url, description });
        await newCategory.save();

        res.status(201).json({ message: "Thêm danh mục thành công!" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi Server" });
    }
};

// 3. Cập nhật danh mục (Dành cho Admin)
// 3. Cập nhật danh mục (Dành cho Admin)
const updateCategory = async (req, res) => {
    try {
        const { name, description, isActive } = req.body;
        
        // SỬA LỖI Ở ĐÂY: 
        // Lấy link ảnh mới từ Cloudinary nếu Admin có chọn file mới (req.file).
        // Nếu Admin KHÔNG chọn file mới, lấy lại link ảnh cũ từ req.body.image_url.
        const image_url = req.file ? req.file.path : req.body.image_url;
        
        const updatedCategory = await Category.findByIdAndUpdate(
            req.params.id,
            { name, image_url, description, isActive },
            { new: true }
        );

        if (!updatedCategory) {
            return res.status(404).json({ message: "Không tìm thấy danh mục!" });
        }

        res.json({ message: "Cập nhật thành công!", category: updatedCategory });
    } catch (error) {
        console.error("Lỗi cập nhật danh mục:", error);
        res.status(500).json({ message: "Lỗi Server khi cập nhật" });
    }
};
// 4. Xóa danh mục - THỰC HIỆN CÁCH 1 (Chặn đứng nếu còn sản phẩm)
const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: "Không tìm thấy danh mục" });
        }

        // BƯỚC BẢO VỆ: Đếm xem có sản phẩm nào đang dùng tên danh mục này không
        const productCount = await Product.countDocuments({ main_cat: category.name });
        
        if (productCount > 0) {
            // Trả về lỗi 400 (Bad Request) để chặn việc xóa
            return res.status(400).json({ 
                message: `Không thể xóa! Đang có ${productCount} sản phẩm thuộc danh mục [${category.name}]. Vui lòng chuyển các sản phẩm sang danh mục khác hoặc xóa chúng trước.` 
            });
        }

        // Nếu productCount === 0 thì mới cho phép xóa
        await Category.findByIdAndDelete(req.params.id);
        res.json({ message: "Đã xóa danh mục an toàn!" });
    } catch (error) {
        console.error("Lỗi xóa danh mục:", error);
        res.status(500).json({ message: "Lỗi Server khi xóa" });
    }
};

module.exports = {
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory
};