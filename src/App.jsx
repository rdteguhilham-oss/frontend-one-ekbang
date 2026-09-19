import PengajuanLayanan from './pages/PengajuanLayanan';
import TambahLayanan from './pages/TambahLayanan';
import DaftarAdmin from './pages/DaftarAdmin';
import Login from './pages/Login';
import DataPetugas from './pages/DataPetugas';
import KegiatanHarian from './pages/KegiatanHarian';
import AgendaKegiatan from './pages/AgendaKegiatan';
import PetaGIS from './pages/PetaGis';
import ProtectedRoute from './components/ProtectedRoute';
import { Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { FaUserShield, FaClipboardList, FaUsers, FaClipboardCheck, FaCalendarAlt, FaMapMarkedAlt } from "react-icons/fa";
import React, { useState, useEffect } from 'react';
import { getDataLayanan } from './services/api'; 
import './App.css';

export default function App() {
  const location = useLocation(); 
  const navigate = useNavigate(); 
  const isHalamanPublik = location.pathname === '/tambah_layanan' || location.pathname === '/login';

  const [jumlahNotif, setJumlahNotif] = useState(0);
  
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
      navigate("/login");
  };

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
                  <h2>ONE EKBANG 🚀</h2>
                  <button className="btn-hamburger-dalam" onClick={() => setIsSidebarOpen(false)}>
                      ☰
                  </button>
              </div>

              <Link to="/admin" className="nav-link">
                  <FaUserShield className="nav-icon" /> Data Admin
              </Link> 
              
              <Link to="/pengajuan_layanan" className="nav-link menu-pengajuan">
                  <div className="nav-kiri">
                      <FaClipboardList className="nav-icon" /> Pengajuan Layanan
                  </div>
                  {jumlahNotif > 0 && (
                      <span className="badge-notif">{jumlahNotif}</span>
                  )}
              </Link>
              
              <Link to="/data_petugas" className="nav-link">
                  <FaUsers className="nav-icon" /> Data Ekbang
              </Link>
              
              <Link to="/kegiatan_harian" className="nav-link">
                  <FaClipboardCheck className="nav-icon" /> Kegiatan Harian
              </Link>
              
              <Link to="/agenda_kegiatan" className="nav-link">
                  <FaCalendarAlt className="nav-icon" /> Agenda Kegiatan
              </Link>
              
              <Link to="/peta_gis" className="nav-link">
                  <FaMapMarkedAlt className="nav-icon" /> Peta Interaktif GIS
              </Link>

              <button className="btn-tema" onClick={() => setIsDarkMode(!isDarkMode)}>
                  {isDarkMode ? '☀️ Mode Terang' : '🌙 Mode Gelap'}
              </button>
            </nav>
        </>
      )}

      <main className="main-content" style={{ 
            width: isHalamanPublik ? '100%' : 'auto',
            padding: isHalamanPublik ? 0 : '' 
        }}>
        
        {!isHalamanPublik && (
            <div className="header-top">
                {!isSidebarOpen && (
                    <button className="btn-hamburger-luar" onClick={() => setIsSidebarOpen(true)}>
                        ☰
                    </button>
                )}
                
                <button className="btn-logout-global" onClick={handleLogout}>
                    Keluar
                </button>
            </div>
        )}

        <Routes>
            <Route path="/" element={<Navigate to="/admin" replace />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/tambah_layanan" element={<TambahLayanan />} />
          
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