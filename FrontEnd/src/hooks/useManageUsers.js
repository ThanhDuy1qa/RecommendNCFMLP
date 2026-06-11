import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

export const useManageUsers = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [roleCounts, setRoleCounts] = useState({ all: 0, customer: 0, seller: 0, admin: 0 });
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // MÀU SẮC MỚI CHO LIGHT THEME
  const getRoleInfo = (role) => {
    const roleNum = Number(role);

    if (roleNum === 2) {
      return {
        label: 'Admin QTV',
        icon: '🛡️',
        row: 'hover:bg-purple-50/60',
        badge: 'bg-purple-100 text-purple-700 border-purple-200'
      };
    }

    if (roleNum === 1) {
      return {
        label: 'Người Bán',
        icon: '🏪',
        row: 'hover:bg-amber-50/60',
        badge: 'bg-amber-100 text-amber-700 border-amber-200'
      };
    }

    return {
      label: 'Khách Hàng',
      icon: '👤',
      row: 'hover:bg-sky-50/50',
      badge: 'bg-slate-100 text-slate-600 border-slate-200'
    };
  };

  const filterButtons = useMemo(() => {
    return [
      { key: 'all', label: 'Tất cả', count: roleCounts.all, icon: '📋' },
      { key: '0', label: 'Khách hàng', count: roleCounts.customer, icon: '👤' },
      { key: '1', label: 'Người bán', count: roleCounts.seller, icon: '🏪' },
      { key: '2', label: 'Admin', count: roleCounts.admin, icon: '🛡️' }
    ];
  }, [roleCounts]);

  const getFilterTitle = () => {
    if (roleFilter === '0') return 'Khách hàng';
    if (roleFilter === '1') return 'Người bán';
    if (roleFilter === '2') return 'Admin';
    return 'Tất cả';
  };

  const fetchUsers = async (pageNumber, searchQuery, roleQuery, isReset = false) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: String(pageNumber),
        limit: '50',
        search: searchQuery || '',
        role: roleQuery || 'all'
      });

      const res = await fetch(`http://localhost:5000/api/users?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi lấy danh sách user');

      const nextUsers = Array.isArray(data.users) ? data.users : [];
      if (isReset) {
        setUsers(nextUsers);
      } else {
        setUsers((prev) => [...prev, ...nextUsers]);
      }

      setRoleCounts(data.roleCounts || { all: 0, customer: 0, seller: 0, admin: 0 });
      setTotalUsers(data.pagination?.total || 0);
      setHasMore(Boolean(data.pagination?.hasMore));
    } catch (error) {
      console.error('Lỗi lấy danh sách user:', error);
      if (isReset) {
        setUsers([]);
        setTotalUsers(0);
        setHasMore(false);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setPage(1);
      fetchUsers(1, search, roleFilter, true);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search, roleFilter]);

  const loadMore = () => {
    if (!hasMore || loading) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchUsers(nextPage, search, roleFilter, false);
  };

  const handleRoleChange = async (userId, newRole) => {
    if (!window.confirm('Bạn có chắc muốn thay đổi quyền của người dùng này?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ role: Number(newRole) })
      });

      const data = await res.json();
      if (res.ok) {
        alert('✅ ' + data.message);
        setPage(1);
        fetchUsers(1, search, roleFilter, true);
      } else {
        alert('❌ ' + data.message);
      }
    } catch (error) {
      alert('Lỗi kết nối server!');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('CẢNH BÁO: Xóa tài khoản này là xóa vĩnh viễn! Bạn chắc chứ?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        alert('✅ Xóa tài khoản thành công!');
        setPage(1);
        fetchUsers(1, search, roleFilter, true);
      } else {
        alert('❌ ' + (data.message || 'Không thể xóa user'));
      }
    } catch (error) {
      alert('Lỗi kết nối server!');
    }
  };

  const handleViewInsight = (user) => {
    const insightId = user.amazon_id || user.username;
    if (!insightId) {
      alert('Người dùng này chưa có Amazon ID hoặc username để tra cứu Insight!');
      return;
    }
    navigate('/admin/customer-insight', {
      state: {
        autoSearchId: insightId,
        autoSearchName: user.name || user.email || 'Người dùng chưa cập nhật tên'
      }
    });
  };

  return {
    users, roleCounts, totalUsers, loading,
    search, setSearch, roleFilter, setRoleFilter,
    hasMore, loadMore, getRoleInfo, filterButtons, getFilterTitle,
    handleRoleChange, handleDeleteUser, handleViewInsight
  };
};