import streamlit as st
import json
import os

# Cấu hình trang
st.set_page_config(page_title="Hệ thống Gợi ý Điện tử", layout="wide")

# --- PHẦN HÀM HỖ TRỢ (UTILITIES) ---

def clean_price(price):
    """Làm sạch dữ liệu giá nếu dính mã CSS hoặc rỗng"""
    price_str = str(price).strip()
    if not price or "{" in price_str or "margin" in price_str or "font-size" in price_str:
        return "------------"
    return price_str

def get_valid_image(prod):
    """Kiểm tra và lấy link ảnh hợp lệ từ nhiều nguồn trong dữ liệu"""
    # Thử lấy từ imageURLHighRes trước, sau đó tới image
    img_list = prod.get("imageURLHighRes", [])
    if not img_list:
        img_list = prod.get("image", [])
    
    # Nếu là danh sách, lấy phần tử đầu tiên
    if isinstance(img_list, list) and len(img_list) > 0:
        return img_list[0]
    # Nếu là chuỗi đơn lẻ
    if isinstance(img_list, str) and img_list.strip():
        return img_list
        
    # Ảnh mặc định nếu không tìm thấy link nào
    return "https://via.placeholder.com/300x400?text=No+Image+Available"

# --- PHẦN XỬ LÝ DỮ LIỆU LỚN ---

def load_data_limit(file_path, limit_mb=100):
    """Đọc file theo dòng cho đến khi đạt giới hạn dung lượng (MB)"""
    data_list = []
    limit_bytes = limit_mb * 1024 * 1024
    current_bytes = 0
    
    if not os.path.exists(file_path):
        return [] # Trả về list rỗng nếu không tìm thấy file

    with open(file_path, 'r', encoding='utf-8') as f:
        for line in f:
            line_encoded = line.encode('utf-8')
            current_bytes += len(line_encoded)
            
            try:
                data_list.append(json.loads(line))
            except:
                continue
                
            if current_bytes >= limit_bytes:
                break
    return data_list

# --- LOAD DỮ LIỆU ---

# Lưu ý: Hãy đảm bảo tên file khớp chính xác với file trong thư mục của bạn
PRODUCT_FILE = "meta_Electronics.json" 
REVIEW_FILE = "Electronics.json"

# Load 100MB sản phẩm và 50MB review để đảm bảo tốc độ web
products_raw = load_data_limit(PRODUCT_FILE, limit_mb=100)
reviews_raw = load_data_limit(REVIEW_FILE, limit_mb=50)

# Xử lý dự phòng nếu file trống hoặc không tồn tại
if not products_raw:
    st.sidebar.error(f"⚠️ Cảnh báo: Không tìm thấy hoặc file {PRODUCT_FILE} trống.")
    products_raw = [
        {"asin": "DEMO1", "title": "Sản phẩm Mẫu 1", "price": "$10.00", "brand": "AI Demo", "description": ["Dữ liệu demo"]},
        {"asin": "DEMO2", "title": "Sản phẩm Mẫu 2", "price": "$20.00", "brand": "AI Demo", "description": ["Dữ liệu demo"]}
    ]

# --- GIAO DIỆN CHÍNH ---

st.title("🔌 Hệ thống Gợi ý Sản phẩm Điện tử")
st.caption(f"Trạng thái: Đã nạp {len(products_raw)} sản phẩm (Giới hạn load 100MB)")
st.markdown("---")

# Sidebar
st.sidebar.header("🔍 Bộ lọc & Tìm kiếm")
brands = sorted(list(set(p.get("brand", "N/A") for p in products_raw if p.get("brand"))))
selected_brand = st.sidebar.selectbox("Lọc theo thương hiệu", ["Tất cả"] + brands)

# Lọc dữ liệu
filtered_products = [p for p in products_raw if selected_brand == "Tất cả" or p.get("brand") == selected_brand]

# --- HIỂN THỊ DANH SÁCH ---

st.subheader(f"📦 Danh sách sản phẩm {f'({selected_brand})' if selected_brand != 'Tất cả' else ''}")

# Hiển thị dạng lưới (Grid) - 4 cột
cols = st.columns(4)
# Chỉ hiện 40 sản phẩm đầu tiên để web mượt hơn
for idx, prod in enumerate(filtered_products[:40]):
    with cols[idx % 4]:
        with st.container(border=True):
            img_url = get_valid_image(prod)
            st.image(img_url, use_container_width=True)
            # Cách 1: Hiển thị chữ nhỏ bên dưới ảnh
            st.caption(f"🔗 Link: {img_url}") 
            
            # Cách 2: Nếu link quá dài, dùng text_area để dễ copy (tùy chọn)
            # st.text_area("URL gốc:", value=img_url, height=70, key=f"url_{idx}")
            # --------------------------------
            
            # Làm sạch Tiêu đề và Giá
            title = prod.get('title', 'Không có tiêu đề')
            price = clean_price(prod.get('price'))
            
            st.markdown(f"**{title[:60]}...**" if len(title) > 60 else f"**{title}**")
            st.write(f"💰 Giá: {price}")
            st.caption(f"🆔 ASIN: {prod.get('asin')}")
            
            if st.button("Chi tiết & Đánh giá", key=f"btn_{prod.get('asin')}_{idx}"):
                st.session_state.selected_asin = prod.get('asin')

st.markdown("---")

# --- CHI TIẾT SẢN PHẨM ---

if 'selected_asin' in st.session_state:
    asin = st.session_state.selected_asin
    curr_prod = next((p for p in products_raw if p.get("asin") == asin), None)
    
    if curr_prod:
        st.header(f"🔍 {curr_prod.get('title')}")
        
        t1, t2 = st.tabs(["📄 Thông tin kỹ thuật", "⭐ Đánh giá khách hàng"])
        
        with t1:
            col_img, col_info = st.columns([1, 2])
            with col_img:
                st.image(get_valid_image(curr_prod), use_container_width=True)
            with col_info:
                # Xử lý mô tả an toàn (tránh IndexError)
                desc = curr_prod.get("description", "Không có mô tả chi tiết.")
                if isinstance(desc, list):
                    display_desc = desc[0] if len(desc) > 0 else "Không có mô tả chi tiết."
                else:
                    display_desc = desc if desc else "Không có mô tả chi tiết."
                
                st.info(f"**Mô tả sản phẩm:**\n\n{display_desc}")
                st.write(f"**Thương hiệu:** {curr_prod.get('brand', 'N/A')}")
                st.write(f"**Danh mục:** {', '.join(curr_prod.get('category', []))}")
            
            with st.expander("Dữ liệu JSON gốc (Metadata)"):
                st.json(curr_prod)
        
        with t2:
            # Lọc review (tránh lỗi NoneType nếu reviews_raw trống)
            if reviews_raw:
                prod_reviews = [r for r in reviews_raw if r.get("asin") == asin]
                if prod_reviews:
                    for rev in prod_reviews:
                        with st.chat_message("user"):
                            st.write(f"**{rev.get('reviewerName', 'Người dùng ẩn danh')}**")
                            st.write(f"Rating: {rev.get('overall')} ⭐")
                            st.write(f"**{rev.get('summary', '')}**")
                            st.write(rev.get('reviewText', ''))
                else:
                    st.warning("Không tìm thấy đánh giá cho sản phẩm này trong phân đoạn dữ liệu đã load.")
            else:
                st.error("Dữ liệu đánh giá không khả dụng.")

# Sidebar Footer
st.sidebar.markdown("---")
st.sidebar.info(
    "**Đồ án tốt nghiệp**\n\n"
    "Hệ thống gợi ý kết hợp:\n"
    "- Autoencoder\n"
    "- NCF & MLP"
)