export const formatProduct = (prod) => {
  if (!prod) return null;

  // 1. LÀM SẠCH GIÁ
  const getFormattedPrice = (rawPrice) => {
    if (!rawPrice) return "Liên hệ";
    if (typeof rawPrice === 'string' && rawPrice.startsWith('$')) return rawPrice;
    
    const numPrice = Number(rawPrice);
    return (!isNaN(numPrice) && numPrice > 0) ? `$${numPrice.toFixed(2)}` : "Liên hệ";
  };

  // 2. LẤY ẢNH CHUẨN
  const getBestImage = () => {
    if (prod.image && typeof prod.image === 'string' && prod.image.trim() !== '') return prod.image;

    const highRes = prod.image_url_high || prod.imageURLHighRes;
    const normal = prod.image_url || prod.imageURL;
    
    if (Array.isArray(highRes) && highRes.length > 0) return highRes[0];
    if (typeof highRes === 'string' && highRes.trim() !== '') return highRes;
    
    if (Array.isArray(normal) && normal.length > 0) return normal[0];
    if (typeof normal === 'string' && normal.trim() !== '') return normal;
    
    return null;
  };

  // 3. LÀM SẠCH DANH MỤC
  const getCategory = () => {
    if (!prod.category) return "Điện tử";
    if (Array.isArray(prod.category)) return prod.category.slice(-2).join(" > ");
    return String(prod.category); 
  };

  // 4. TRẢ VỀ OBJECT CHUẨN HÓA
  return {
    ...prod, // 🌟 QUAN TRỌNG NHẤT: Bê toàn bộ dữ liệu gốc (bao gồm điểm AI) vào đây trước!
    _id: prod._id || null, 
    asin: prod.asin || prod.item_id || "N/A", 
    title: prod.title || "Sản phẩm không có tiêu đề",
    brand: prod.brand || "NO BRAND",
    price: getFormattedPrice(prod.price),
    image: getBestImage(),
    category: getCategory(),
    main_cat: prod.main_cat || "Electronics"
  };
};