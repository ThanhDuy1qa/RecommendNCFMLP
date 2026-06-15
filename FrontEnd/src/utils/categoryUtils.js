import defaultIcon from '../assets/no-image.png';

/**
 * Hàm chuẩn hóa chuỗi: Chuyển thành chữ thường và xóa sạch mọi ký tự đặc biệt, khoảng trắng
 * VD: "Cell Phones & Accessories" -> "cellphonesaccessories"
 * VD: "cell phones accessories"   -> "cellphonesaccessories"
 */
const normalizeString = (str) => {
    if (!str) return '';
    return str.toLowerCase().replace(/&amp;/g, '').replace(/[^a-z0-9]/g, '');
};

/**
 * Hàm dò tìm danh mục chuẩn
 * @param {string} catName - Tên danh mục thô từ sản phẩm
 * @param {Array} categories - Danh sách danh mục chuẩn từ DB
 * @returns {Object} - Trả về object chứa tên chuẩn (name) và link ảnh đã xử lý (image)
 */
export const getMatchedCategory = (catName, categories) => {
    if (!catName || !categories || !categories.length) {
        return { name: catName, image: defaultIcon };
    }

    const normalizedInput = normalizeString(catName);

    // 1. Tìm kiếm tuyệt đối trước (Trường hợp dữ liệu đã chuẩn)
    let found = categories.find(c => c.name?.trim().toLowerCase() === catName.trim().toLowerCase());

    // 2. Nếu không khớp, tìm kiếm tương đối (Bỏ qua ký tự đặc biệt)
    if (!found) {
        found = categories.find(c => normalizeString(c.name) === normalizedInput);
    }

    if (found) {
        // Xử lý link ảnh (Local vs Online)
        const imageUrl = found.image_url
            ? (found.image_url.startsWith('http')
                ? found.image_url
                : `http://localhost:5000/${found.image_url.replace(/\\/g, '/')}`)
            : defaultIcon;

        return {
            name: found.name, // Lấy tên đẹp, có viết hoa và dấu & chuẩn từ DB
            image: imageUrl
        };
    }

    // 3. Nếu hoàn toàn không tìm thấy, trả về dữ liệu gốc
    return { name: catName, image: defaultIcon };
};