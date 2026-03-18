// Làm sạch giá tương đương clean_price trong Python
export const cleanPrice = (price) => {
    if (!price) return "------------";
    const priceStr = String(price).trim();
    if (priceStr.includes('{') || priceStr.includes('margin') || priceStr.includes('font-size')) {
        return "------------";
    }
    return priceStr;
};

// Lấy ảnh tương đương get_valid_image trong Python
export const getValidImage = (prod) => {
    let imgList = prod.imageURLHighRes || prod.image || [];
    
    if (Array.isArray(imgList) && imgList.length > 0) {
        return imgList[0];
    }
    if (typeof imgList === 'string' && imgList.trim() !== '') {
        return imgList;
    }
    return null; // Không trả về placeholder ở server để client tự xử lý
};