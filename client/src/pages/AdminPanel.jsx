import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import { adminAPI } from '../services/api'; // Bu dosyanın oluşturulması/güncellenmesi gerekiyor
import { HiUsers, HiTrash, HiKey, HiChevronLeft, HiChevronRight, HiDocumentText, HiClock, HiAcademicCap } from 'react-icons/hi';

const AdminPanel = () => {
  const { user } = useContext(AuthContext);
  const { showToast } = useContext(NotificationContext);

  const [users, setUsers] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalUsers: 0, currentPage: 1, totalPages: 1 });
  const [page, setPage] = useState(1);

  const fetchUsers = async (currentPage) => {
    setLoading(true);
    try {
      const res = await adminAPI.getUsers(currentPage);
      setUsers(res.data.users);
      setStats({
        totalUsers: res.data.totalUsers,
        currentPage: res.data.currentPage,
        totalPages: res.data.totalPages
      });
    } catch (err) {
      showToast('Kullanıcılar yüklenemedi', 'duzeltme');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(page);
  }, [page]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminAPI.getStats();
        setDashboardStats(res.data);
      } catch (err) {
        showToast('Genel istatistikler yüklenemedi', 'duzeltme');
      }
    };
    fetchStats();
  }, []);

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`'${userName}' adlı kullanıcıyı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve kullanıcının tüm raporları silinir.`)) {
      try {
        await adminAPI.deleteUser(userId);
        showToast('Kullanıcı başarıyla silindi', 'onay');
        fetchUsers(page); // Listeyi yenile
      } catch (err) {
        showToast(err.response?.data?.mesaj || 'Kullanıcı silinemedi', 'duzeltme');
      }
    }
  };

  const handleResetPassword = async (userId, userName) => {
    if (window.confirm(`'${userName}' adlı kullanıcının şifresini sıfırlamak istediğinizden emin misiniz? Yeni şifre oluşturulacak.`)) {
      try {
        const res = await adminAPI.resetPassword(userId);
        showToast('Şifre başarıyla sıfırlandı', 'onay');
        // Geliştirme kolaylığı için yeni şifreyi admin'e göster
        alert(`Yeni şifre: ${res.data.yeniSifre}\nLütfen bu şifreyi güvenli bir şekilde kullanıcıya iletin.`);
      } catch (err) {
        showToast(err.response?.data?.mesaj || 'Şifre sıfırlanamadı', 'duzeltme');
      }
    }
  };

  if (loading && users.length === 0) {
    return <div style={{ textAlign: 'center', padding: '4rem' }}>Yükleniyor...</div>;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem' }}>Admin Paneli</h1>
        <p>Kullanıcı yönetimi ve sistem genel durumu.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <HiUsers size={24} style={{ color: 'var(--primary-color)', marginBottom: '1rem' }} />
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.totalUsers}</div>
          <div style={{ color: 'var(--text-muted)' }}>Toplam Kullanıcı</div>
        </div>
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <HiDocumentText size={24} style={{ color: '#3b82f6', marginBottom: '1rem' }} />
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{dashboardStats?.totalReports ?? '...'}</div>
          <div style={{ color: 'var(--text-muted)' }}>Toplam Rapor</div>
        </div>
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <HiClock size={24} style={{ color: '#f59e0b', marginBottom: '1rem' }} />
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{dashboardStats?.pendingReports ?? '...'}</div>
          <div style={{ color: 'var(--text-muted)' }}>Onay Bekleyen Rapor</div>
        </div>
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <HiAcademicCap size={24} style={{ color: '#10b981', marginBottom: '1rem' }} />
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{dashboardStats?.totalAdvisors ?? '...'}</div>
          <div style={{ color: 'var(--text-muted)' }}>Toplam Danışman</div>
        </div>
      </div>

      <div className="glass-card">
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>İsim</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Kayıt Tarihi</th>
                <th style={{ textAlign: 'right' }}>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>{u.isim}</td>
                  <td>{u.email}</td>
                  <td><span className={`badge badge-${u.rol}`}>{u.rol}</span></td>
                  <td>{new Date(u.createdAt).toLocaleDateString('tr-TR')}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button className="btn-icon" title="Şifre Sıfırla" onClick={() => handleResetPassword(u._id, u.isim)} disabled={u._id === user?._id}>
                        <HiKey />
                      </button>
                      <button className="btn-icon btn-icon-danger" title="Kullanıcıyı Sil" onClick={() => handleDeleteUser(u._id, u.isim)} disabled={u._id === user?._id}>
                        <HiTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', padding: '0 1rem' }}>
            <span style={{fontSize: '0.9rem', color: 'var(--text-muted)'}}>
                Sayfa {stats.currentPage} / {stats.totalPages || 1}
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-secondary" onClick={() => setPage(p => p - 1)} disabled={page === 1}>
                    <HiChevronLeft /> Önceki
                </button>
                <button className="btn btn-secondary" onClick={() => setPage(p => p + 1)} disabled={page >= stats.totalPages}>
                    Sonraki <HiChevronRight />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;