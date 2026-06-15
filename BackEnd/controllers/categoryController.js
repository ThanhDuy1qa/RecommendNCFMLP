const Category = require('../models/Category');
const Product = require('../models/Product');
const cloudinary = require('cloudinary').v2;

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
// 1. Lấy danh sách toàn bộ danh mục từ bảng Category mới
const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort();
        
        const categoriesWithCount = await Promise.all(categories.map(async (cat) => {
            // THUẬT TOÁN REGEX THÔNG MINH:
            let safeName = (cat.name || '').replace(/&amp;/g, '&').trim();
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
const updateCategory = async (req, res) => {
    try {
        const { name, description, isActive } = req.body;
        const categoryId = req.params.id;
        
        const oldCategory = await Category.findById(categoryId);
        if (!oldCategory) {
            return res.status(404).json({ message: "Không tìm thấy danh mục!" });
        }
        const oldName = oldCategory.name;

        // 🌟 NẾU CÓ ẢNH MỚI: Dọn dẹp ảnh danh mục cũ trên mây
        let image_url = req.body.image_url;
        if (req.file) {
            if (oldCategory.image_url) {
                const publicId = getPublicIdFromUrl(oldCategory.image_url);
                if (publicId) await cloudinary.uploader.destroy(publicId);
            }
            image_url = req.file.path;
        }
        
        const updatedCategory = await Category.findByIdAndUpdate(
            categoryId,
            { name, image_url, description, isActive },
            { new: true }
        );

        if (name && oldName !== name) {
            const oldNameRegex = new RegExp(`^\\s*${oldName.trim()}\\s*$`, 'i');
            const result = await Product.updateMany(
                { main_cat: { $regex: oldNameRegex } }, 
                { $set: { main_cat: name } }
            );
        }

        res.json({ message: "Cập nhật danh mục và đồng bộ sản phẩm thành công!", category: updatedCategory });
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

        const productCount = await Product.countDocuments({ main_cat: category.name });
        if (productCount > 0) {
            return res.status(400).json({ 
                message: `Không thể xóa! Đang có ${productCount} sản phẩm thuộc danh mục [${category.name}]. Vui lòng chuyển các sản phẩm sang danh mục khác hoặc xóa chúng trước.` 
            });
        }

        // 🌟 BƯỚC 1: Dọn dẹp Icon Danh mục trên Cloudinary
        if (category.image_url) {
            const publicId = getPublicIdFromUrl(category.image_url);
            if (publicId) await cloudinary.uploader.destroy(publicId);
        }

        // 🌟 BƯỚC 2: Xóa Database
        await Category.findByIdAndDelete(req.params.id);
        res.json({ message: "Đã xóa danh mục và Icon thành công!" });
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