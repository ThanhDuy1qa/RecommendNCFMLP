const User = require('../models/User');
const bcrypt = require('bcryptjs');

// =======================================================
// 1. USER PROFILE FUNCTIONS
// Các hàm dành cho user đang đăng nhập
// =======================================================

/**
 * Cập nhật tên hiển thị của user hiện tại.
 * Chỉ cập nhật trường name, không đổi email / role.
 */
/**
 * Cập nhật thông tin profile của user hiện tại.
 * Cập nhật: name, phone, address. Không đổi email / role.
 */
const updateProfile = async (req, res) => {
  try {
    // 1. Lấy thêm phone và address từ request body
    const { name, phone, address } = req.body;
    const userId = req.user.id;

    if (!name || name.trim() === '') {
      return res.status(400).json({
        message: 'Tên không được để trống!'
      });
    }

    // 2. Cập nhật thêm phone và address vào DB
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        name: name.trim(),
        phone: phone ? phone.trim() : '',
        address: address ? address.trim() : ''
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        message: 'Không tìm thấy người dùng!'
      });
    }

    // 3. Trả về thông tin user ĐẦY ĐỦ để Frontend lưu vào Local Storage
    res.json({
      message: 'Cập nhật thông tin thành công!',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,       // Trả về phone
        address: updatedUser.address    // Trả về address
      }
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật profile:', error);
    res.status(500).json({
      message: 'Lỗi máy chủ khi cập nhật thông tin!'
    });
  }
};

/**
 * Đổi mật khẩu cho user hiện tại.
 * Kiểm tra mật khẩu cũ, độ dài mật khẩu mới và tránh trùng mật khẩu cũ.
 */
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        message: 'Vui lòng nhập đầy đủ mật khẩu cũ và mới!'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: 'Mật khẩu mới phải có ít nhất 6 ký tự!'
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: 'Không tìm thấy tài khoản!'
      });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: 'Mật khẩu hiện tại không chính xác!'
      });
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);

    if (isSamePassword) {
      return res.status(400).json({
        message: 'Mật khẩu mới không được trùng với mật khẩu cũ!'
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.json({
      message: 'Đổi mật khẩu thành công!'
    });
  } catch (error) {
    console.error('Lỗi khi đổi mật khẩu:', error);
    res.status(500).json({
      message: 'Lỗi máy chủ khi đổi mật khẩu!'
    });
  }
};
const getWalletBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy user' });
    
    // Trả về đúng object có key là 'balance'
    res.json({ balance: user.walletBalance || 0 });
  } catch (error) {
    console.error("Lỗi getWalletBalance:", error);
    res.status(500).json({ message: 'Lỗi Server' });
  }
};

// Trong file userController.js
const savePreferences = async (req, res) => {
    try {
        const { preferences } = req.body; // Mảng các danh mục
        
        if (!Array.isArray(preferences) || preferences.length === 0) {
            return res.status(400).json({ message: 'Vui lòng chọn ít nhất 1 danh mục!' });
        }

        await User.findByIdAndUpdate(req.user.id, { preferences }, { new: true });

        res.json({ success: true, message: 'Đã lưu sở thích, chuẩn bị trải nghiệm!' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server khi lưu sở thích' });
    }
};
// Nhớ export và thêm vào userRoutes.js: router.put('/preferences', verifyToken, savePreferences);
// Nhớ export và thêm vào userRoutes.js: router.put('/preferences', verifyToken, savePreferences);
// =======================================================
// 2. ADMIN USER MANAGEMENT FUNCTIONS
// Các hàm dành riêng cho admin role 2
// =======================================================

/**
 * Admin lấy danh sách user.
 * Hỗ trợ:
 * - Phân trang
 * - Tìm kiếm theo name, email, username, amazon_id
 * - Lọc theo role
 * - Thống kê số lượng từng role
 */
const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const search = req.query.search || '';
    const role = req.query.role || 'all';
    const skip = (page - 1) * limit;

    let baseSearchQuery = {};

    if (search.trim() !== '') {
      const searchKeyword = search.trim();

      // 🌟 BƯỚC 1: XÂY DỰNG ĐIỀU KIỆN TÌM KIẾM CHÍNH XÁC (Exact Match)
      const exactQuery = {
        $or: [
          { name: { $regex: `^${searchKeyword}$`, $options: 'i' } },
          { email: { $regex: `^${searchKeyword}$`, $options: 'i' } },
          { username: { $regex: `^${searchKeyword}$`, $options: 'i' } },
          { amazon_id: { $regex: `^${searchKeyword}$`, $options: 'i' } },
          // Xử lý thông minh: Gõ "47828" tự động khớp với "Khách hàng #47828"
          { name: { $regex: `^Khách hàng #${searchKeyword}$`, $options: 'i' } }
        ]
      };

      // Query nhanh xem có người dùng nào khớp 100% không
      const exactCount = await User.countDocuments(exactQuery);

      if (exactCount > 0) {
        // Nếu TÌM THẤY đích danh -> Gán thành điều kiện tìm kiếm chính
        baseSearchQuery = exactQuery;
      } else {
        // 🌟 BƯỚC 2: NẾU KHÔNG CÓ -> QUAY VỀ TÌM KIẾM 1 PHẦN (Partial Match)
        baseSearchQuery = {
          $or: [
            { name: { $regex: searchKeyword, $options: 'i' } },
            { email: { $regex: searchKeyword, $options: 'i' } },
            { username: { $regex: searchKeyword, $options: 'i' } },
            { amazon_id: { $regex: searchKeyword, $options: 'i' } }
          ]
        };
      }
    }

    let listQuery = { ...baseSearchQuery };

    if (role !== 'all' && role !== '') {
      listQuery.role = Number(role);
    }

    // 🌟 BƯỚC 3: TRUY VẤN DỮ LIỆU ĐA LUỒNG & SẮP XẾP A-Z
    const [
      users,
      totalInCurrentFilter,
      totalAll,
      totalCustomers,
      totalSellers,
      totalAdmins
    ] = await Promise.all([
      User.find(listQuery)
        .select('-password')
        .collation({ locale: "vi", numericOrdering: true })
        .sort({ username: 1 }) 
        .skip(skip)
        .limit(limit),

      User.countDocuments(listQuery),

      User.countDocuments(baseSearchQuery),

      User.countDocuments({
        ...baseSearchQuery,
        role: 0
      }),

      User.countDocuments({
        ...baseSearchQuery,
        role: 1
      }),

      User.countDocuments({
        ...baseSearchQuery,
        role: 2
      })
    ]);

    res.json({
      users,
      pagination: {
        page,
        limit,
        total: totalInCurrentFilter,
        totalPages: Math.ceil(totalInCurrentFilter / limit),
        hasMore: skip + users.length < totalInCurrentFilter
      },
      roleCounts: {
        all: totalAll,
        customer: totalCustomers,
        seller: totalSellers,
        admin: totalAdmins
      }
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách người dùng:', error);
    res.status(500).json({
      message: 'Lỗi khi lấy danh sách người dùng'
    });
  }
};

/**
 * Admin thay đổi phân quyền user.
 * Role hợp lệ:
 * - 0: Khách hàng
 * - 1: Người bán
 * - 2: Admin
 *
 * Không cho phép admin tự giáng cấp chính mình.
 */
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const newRole = Number(role);

    if (![0, 1, 2].includes(newRole)) {
      return res.status(400).json({
        message: 'Role không hợp lệ!'
      });
    }

    if (req.user.id === req.params.id && newRole !== 2) {
      return res.status(400).json({
        message: 'Bạn không thể tự giáng cấp chính mình!'
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { role: newRole },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        message: 'Không tìm thấy người dùng!'
      });
    }

    res.json({
      message: 'Cập nhật phân quyền thành công!',
      user: updatedUser
    });
  } catch (error) {
    console.error('Lỗi cập nhật quyền:', error);
    res.status(500).json({
      message: 'Lỗi hệ thống khi cập nhật quyền'
    });
  }
};

/**
 * Admin xóa vĩnh viễn một user.
 * Không cho phép admin tự xóa tài khoản của chính mình.
 */
const deleteUser = async (req, res) => {
  try {
    if (req.user.id === req.params.id) {
      return res.status(400).json({
        message: 'Bạn không thể tự xóa tài khoản của mình!'
      });
    }

    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({
        message: 'Không tìm thấy người dùng!'
      });
    }

    res.json({
      message: 'Đã xóa tài khoản vĩnh viễn!'
    });
  } catch (error) {
    console.error('Lỗi xóa người dùng:', error);
    res.status(500).json({
      message: 'Lỗi hệ thống khi xóa người dùng'
    });
  }
};

// =======================================================
// 3. EXPORT CONTROLLER FUNCTIONS
// Xuất các hàm để route sử dụng
// =======================================================

module.exports = {
  // User profile
  updateProfile,
  changePassword,
  getWalletBalance,
  savePreferences,

  // Admin user management
  getAllUsers,
  updateUserRole,
  deleteUser
};