import PengajuanLayanan from './pages/PengajuanLayanan';
import TambahLayanan from './pages/TambahLayanan';
import DaftarAdmin from './pages/DaftarAdmin';
import Login from './pages/Login';
import DataPetugas from './pages/DataPetugas';
import KegiatanHarian from './pages/KegiatanHarian';
import AgendaKegiatan from './pages/AgendaKegiatan';
import PetaGIS from './pages/PetaGis';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { FaUserShield, FaClipboardList, FaUsers, FaClipboardCheck, FaCalendarAlt, FaMapMarkedAlt, FaSignOutAlt, FaBars, FaTimes } from "react-icons/fa";
import { useState, useEffect } from 'react';
import { getDataLayanan } from './services/api'; 
import './App.css';

export default function App() {
  const location = useLocation(); 
  const navigate = useNavigate(); 
  const isHalamanPublik = location.pathname === '/tambah_layanan' || location.pathname === '/login';

  const [jumlahNotif, setJumlahNotif] = useState(0);

  // DATA NAMA ADMIN DINAMIS
  const [namaAdmin, setNamaAdmin] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('dataAdmin'));
      if (stored && (stored.nama_lengkap || stored.username)) {
        return stored.nama_lengkap || stored.username;
      }
    } catch { /* ignore */ }
    return 'Admin';
  });

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('dataAdmin'));
      if (stored && (stored.nama_lengkap || stored.username)) {
        setNamaAdmin(stored.nama_lengkap || stored.username);
        return;
      }
      const token = localStorage.getItem('token');
      if (token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
        );
        const parsed = JSON.parse(jsonPayload);
        if (parsed.username) {
          setNamaAdmin(parsed.username);
        }
      }
    } catch { /* ignore */ }
  }, [location.pathname]);
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
      return localStorage.getItem('tema_gelap') === 'true';
  });

  useEffect(() => {
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('tema_gelap', 'true');
    } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('tema_gelap', 'false');
    }
  }, [isDarkMode]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth > 768);

  useEffect(() => {
      if (window.innerWidth <= 768) {
          setIsSidebarOpen(false);
      }
  }, [location.pathname]);

  const hitungNotifikasi = async () => {
    try {
        if (!isHalamanPublik) {
            const data = await getDataLayanan();
            const pengajuanBaru = data.filter(item => !item.status || item.status === 'Baru');
            setJumlahNotif(pengajuanBaru.length); 
        }
    } catch (error) {
        console.error("Gagal menghitung notifikasi", error);
    }
  };

  useEffect(() => {
      hitungNotifikasi();
  }, [location.pathname]);

  const handleLogout = () => {
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("token");
      localStorage.removeItem("dataAdmin");
      navigate("/login");
  };

  const isHalamanDashboard = location.pathname === '/dashboard';

  return (
    <div className="app-container">
      
      {!isHalamanPublik && (
        <>
            <div 
                className={`sidebar-overlay ${isSidebarOpen ? 'tampil' : ''}`} 
                onClick={() => setIsSidebarOpen(false)}
            ></div>

            <nav className={`sidebar ${isSidebarOpen ? '' : 'sembunyi'}`}>
              <div className="sidebar-header">
                  <div className="sidebar-mobile-close-bar">
                      <span className="sidebar-mobile-label">Navigasi Menu</span>
                      <button 
                          type="button"
                          className="btn-sidebar-close" 
                          onClick={() => setIsSidebarOpen(false)}
                          aria-label="Tutup Menu"
                          title="Tutup Menu"
                      >
                          <FaTimes />
                      </button>
                  </div>
                  <div className="sidebar-logo-card">
                      <img src={`${import.meta.env.BASE_URL}rb-logo-oneEkbang.png`} alt="Logo ONE EKBANG" className="sidebar-logo-img" />
                  </div>
              </div>

              <div className="sidebar-menu-list">
                  <Link to="/dashboard" className={`nav-link ${location.pathname === '/dashboard' ? 'nav-active' : ''}`}>
                      <FaUserShield className="nav-icon" /> Dashboard Utama
                  </Link>

                  <Link to="/admin" className={`nav-link ${location.pathname === '/admin' ? 'nav-active' : ''}`}>
                      <FaUserShield className="nav-icon" /> Data Admin
                  </Link> 
                  
                  <Link to="/pengajuan_layanan" className={`nav-link menu-pengajuan ${location.pathname === '/pengajuan_layanan' ? 'nav-active' : ''}`}>
                      <div className="nav-kiri">
                          <FaClipboardList className="nav-icon" /> Pengajuan Layanan
                      </div>
                      {jumlahNotif > 0 && (
                          <span className="badge-notif">{jumlahNotif}</span>
                      )}
                  </Link>
                  
                  <Link to="/data_petugas" className={`nav-link ${location.pathname === '/data_petugas' ? 'nav-active' : ''}`}>
                      <FaUsers className="nav-icon" /> Data Petugas Ekbang
                  </Link>
                  
                  <Link to="/kegiatan_harian" className={`nav-link ${location.pathname === '/kegiatan_harian' ? 'nav-active' : ''}`}>
                      <FaClipboardCheck className="nav-icon" /> Kegiatan Harian Petugas
                  </Link>
                  
                  <Link to="/agenda_kegiatan" className={`nav-link ${location.pathname === '/agenda_kegiatan' ? 'nav-active' : ''}`}>
                      <FaCalendarAlt className="nav-icon" /> Agenda Kegiatan
                  </Link>
                  
                  <Link to="/peta_gis" className={`nav-link ${location.pathname === '/peta_gis' ? 'nav-active' : ''}`}>
                      <FaMapMarkedAlt className="nav-icon" /> Peta Interaktif GIS
                  </Link>
              </div>

              {/* FOOTER SIDEBAR: SILUET GEDUNG SATE & LOGO KOTA BANDUNG */}
              <div className="sidebar-footer">
                  <div className="gedung-sate-siluet">
                      <svg viewBox="0 0 200 60" fill="currentColor">
                          <path d="M100 2 L100 12 M96 12 L104 12 M98 12 L98 22 L93 22 L93 26 L80 26 L80 34 L60 34 L60 45 L20 45 L20 58 L180 58 L180 45 L140 45 L140 34 L120 34 L120 26 L107 26 L107 22 L102 22 L102 12 Z M98 2 L102 2 L100 0 Z" opacity="0.35"/>
                      </svg>
                  </div>
                  <div className="sidebar-footer-brand">
                      <img src={`${import.meta.env.BASE_URL}rb-logo-bdg.png`} alt="Logo Pemkot Bandung" className="sidebar-footer-logo" />
                      <div className="sidebar-footer-text">
                          <strong>Kelurahan Pasteur</strong>
                          <span>Kota Bandung</span>
                      </div>
                  </div>
              </div>

              <button className="btn-tema" onClick={() => setIsDarkMode(!isDarkMode)}>
                  {isDarkMode ? '☀️ Mode Terang' : '🌙 Mode Gelap'}
              </button>
            </nav>
        </>
      )}

      <main className={`main-content ${isHalamanDashboard ? 'main-dashboard' : ''}`} style={{ 
            width: isHalamanPublik ? '100%' : 'auto',
            padding: isHalamanPublik ? 0 : (isHalamanDashboard ? '0' : '') 
        }}>
        
        {!isHalamanPublik && (
            <div className={`header-top ${isHalamanDashboard ? 'header-top-dashboard-mobile' : ''}`}>
                {!isSidebarOpen && (
                    <button 
                        type="button"
                        className="btn-hamburger-luar" 
                        onClick={() => setIsSidebarOpen(true)}
                        aria-label="Buka Menu"
                        title="Buka Menu"
                    >
                        <FaBars />
                    </button>
                )}
                
                {!isHalamanDashboard && (
                    <div className="db-profile">
                        <div className="db-avatar">{namaAdmin.charAt(0).toUpperCase()}</div>
                        <div className="db-profile-info">
                            <strong>{namaAdmin}</strong>
                            <small>Kelurahan Pasteur</small>
                        </div>
                        <button className="db-logout" onClick={handleLogout} title="Keluar">
                            <FaSignOutAlt />
                        </button>
                    </div>
                )}
            </div>
        )}

        <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/tambah_layanan" element={<TambahLayanan />} />
          
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><DaftarAdmin /></ProtectedRoute>} />
            <Route path="/pengajuan_layanan" element={<ProtectedRoute><PengajuanLayanan/></ProtectedRoute>} />
            <Route path="/data_petugas" element={<ProtectedRoute><DataPetugas/></ProtectedRoute>} />
            <Route path="/kegiatan_harian" element={<ProtectedRoute><KegiatanHarian/></ProtectedRoute>} />
            <Route path="/agenda_kegiatan" element={<ProtectedRoute><AgendaKegiatan/></ProtectedRoute>} />
            <Route path="/peta_gis" element={<ProtectedRoute><PetaGIS/></ProtectedRoute>} />
        </Routes>
      </main>
      
    </div>
  );
}
