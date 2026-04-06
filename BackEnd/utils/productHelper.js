export const formatProduct = (prod) => {
  return {
    asin: prod.asin,
    title: prod.title || "Sản phẩm không có tiêu đề",
    brand: prod.brand || "N/A",
    // Làm sạch giá: ưu tiên trường price, nếu rỗng thì báo Liên hệ
    price: (prod.price && prod.price.trim() !== "") ? prod.price : "Liên hệ",
    // Lấy ảnh: Ưu tiên ảnh chất lượng cao, nếu không có lấy ảnh thường
    image: (prod.imageURLHighRes && prod.imageURLHighRes.length > 0) 
           ? prod.imageURLHighRes[0] 
           : (prod.imageURL && prod.imageURL.length > 0) 
             ? prod.imageURL[0] 
             : null,
    category: prod.category ? prod.category.slice(-2).join(" > ") : "Điện tử",
    main_cat: prod.main_cat || "Electronics"
  };
};