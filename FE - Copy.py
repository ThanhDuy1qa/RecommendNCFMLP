import streamlit as st
import json
import pandas as pd

# Cấu hình trang
st.set_page_config(page_title="Hệ thống Gợi ý Điện tử", layout="wide")

# 1. Dữ liệu giả lập từ file của bạn (Trong thực tế bạn sẽ load file 10GB tại đây)
products_raw = [
    {"asin": "1059998173", "title": "Samsung Galaxy Note 4 (OTG) Micro-USB to USB 2.0 Adapter", "price": "$8.77", "brand": "Wireless Solutions", "image": "https://images-na.ssl-images-amazon.com/images/I/41PBTpFD9cL.jpg", "description": "Professional Samsung Galaxy Note 4 Lossless Data Charging Cable..."},
    {"asin": "1060067463", "title": "Amazon Kindle Fire HDX 8.9 Tablet OTG Adapter", "price": "N/A", "brand": "Factory Direct", "image": "https://images-na.ssl-images-amazon.com/images/I/31VdPzVjhNL.jpg", "description": "Factory Direct product from actual manufacturer..."},
    {"asin": "0511189877", "title": "Time Warner Cable Remote CLIKR-5", "price": "$12.50", "brand": "Universal", "image": "https://images-na.ssl-images-amazon.com/images/I/81XYkHdfrjL._SY88.jpg", "description": "Replacement remote for TWC/Spectrum boxes."}
]

reviews_raw = [
    {"asin": "0511189877", "reviewerName": "EJ Honda", "overall": 2.0, "summary": "Ergonomic nightmare", "reviewText": "This remote, for whatever reason, was chosen by Time Warner..."},
    {"asin": "0511189877", "reviewerName": "CK", "overall": 5.0, "summary": "Works Great", "reviewText": "Dog got the old remote and destroyed it. Saw price on Amazon and chose it."},
    {"asin": "1059998173", "reviewerName": "Online Shopper", "overall": 5.0, "summary": "Five Stars", "reviewText": "Worked out of the box with my cable box in northern California."}
]

# Giao diện chính
st.title("🔌 Hệ thống Quản lý Sản phẩm Điện tử (AI Recommender)")
st.markdown("---")

# Sidebar để lọc
st.sidebar.header("Bộ lọc tìm kiếm")
selected_brand = st.sidebar.selectbox("Chọn thương hiệu", ["Tất cả"] + list(set(p["brand"] for p in products_raw)))

# Hiển thị danh sách sản phẩm
# Hiển thị danh sách sản phẩm
st.subheader("📦 Danh sách sản phẩm từ dữ liệu")

cols = st.columns(3)
for idx, prod in enumerate(products_raw):
    # Lọc theo thương hiệu nếu có chọn
    if selected_brand != "Tất cả" and prod["brand"] != selected_brand:
        continue
        
    with cols[idx % 3]:
        # Dùng st.container để bọc các phần tử cho gọn
        with st.container():
            st.image(prod["image"], use_container_width=True)
            # THAY THẾ st.bold BẰNG st.markdown
            st.markdown(f"**{prod['title']}**") 
            st.write(f"💰 Giá: {prod['price']}")
            st.caption(f"🏢 Hãng: {prod['brand']}") # Dùng caption cho chữ nhỏ hơn
            
            # Nút xem chi tiết
            if st.button(f"Xem đánh giá", key=prod['asin']):
                st.session_state.selected_asin = prod['asin']
st.markdown("---")

# Khu vực hiển thị chi tiết và Đánh giá
if 'selected_asin' in st.session_state:
    asin = st.session_state.selected_asin
    curr_prod = next(p for p in products_raw if p["asin"] == asin)
    
    st.header(f"Chi tiết: {curr_prod['title']}")
    
    tab1, tab2 = st.tabs(["Thông tin kỹ thuật", "⭐ Đánh giá từ khách hàng"])
    
    with tab1:
        st.info(f"**Mô tả:** {curr_prod['description']}")
        st.json(curr_prod) # Hiển thị dữ liệu thô cho đồ án
        
    with tab2:
        prod_reviews = [r for r in reviews_raw if r["asin"] == asin]
        if prod_reviews:
            for rev in prod_reviews:
                with st.chat_message("user"):
                    st.write(f"**{rev['reviewerName']}** - {rev['overall']} ⭐")
                    st.write(f"*{rev['summary']}*")
                    st.write(rev['reviewText'])
        else:
            st.warning("Chưa có đánh giá nào cho sản phẩm này trong file dữ liệu.")

# Chân trang cho đồ án
st.sidebar.markdown("---")
st.sidebar.info("**Thesis Tech Stack:**\n- Python Only\n- Autoencoder\n- NCF & MLP")