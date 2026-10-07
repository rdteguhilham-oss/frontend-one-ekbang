import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaUsers, FaDesktop, FaRecycle, FaLeaf, FaClipboardList, 
  FaCalendarAlt, FaMapMarkedAlt, FaChevronRight, FaFileExcel, 
  FaFilePdf, FaDownload, FaHome, FaTree, FaHandsHelping, FaFileAlt, FaCog
} from 'react-icons/fa';
import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import 'leaflet/dist/leaflet.css';
import './Dashboard.css';

const Dashboard = () => {
  // Placeholder data for chart
  const dataChart = [
    { name: 'Jan', jalan: 150, drainase: 200, bankSampah: 100, maggot: 80, gaslah: 50 },
    { name: 'Feb', jalan: 220, drainase: 180, bankSampah: 120, maggot: 90, gaslah: 60 },
    { name: 'Mar', jalan: 200, drainase: 250, bankSampah: 150, maggot: 100, gaslah: 70 },
    { name: 'Apr', jalan: 180, drainase: 210, bankSampah: 130, maggot: 110, gaslah: 65 },
    { name: 'Mei', jalan: 250, drainase: 280, bankSampah: 180, maggot: 130, gaslah: 85 },
    { name: 'Jun', jalan: 190, drainase: 230, bankSampah: 140, maggot: 95, gaslah: 55 },
  ];

  // Placeholder polygon for Map
  const pasteurPolygon = [
    [-6.892, 107.595],
    [-6.895, 107.605],
    [-6.902, 107.602],
    [-6.900, 107.590]
  ];

  return (
    <div className="dashboard-container">
      {/* Banner & Header */}
      <div className="dashboard-banner">
        <div className="banner-content">
          <h1>Sistem Informasi Data Ekonomi Pembangunan Terintegrasi</h1>
          <p>Kelurahan Pasteur - Kecamatan Sukajadi - Kota Bandung</p>
        </div>
      </div>

      {/* Top Cards */}
      <div className="top-cards-grid">
        <div className="top-card admin">
          <div className="card-icon"><FaDesktop /></div>
          <div className="card-info">
            <h4>Data Admin</h4>
            <div className="card-value">5 <span>Orang</span></div>
          </div>
        </div>
        <div className="top-card layanan">
          <div className="card-icon"><FaClipboardList /></div>
          <div className="card-info">
            <h4>Pengajuan Layanan</h4>
            <div className="card-value">24 <span>Pengajuan</span></div>
          </div>
        </div>
        <div className="top-card lapangan">
          <div className="card-icon"><FaUsers /></div>
          <div className="card-info">
            <h4>Petugas Lapangan (Gober, dll)</h4>
            <div className="card-value">15 <span>Orang</span></div>
          </div>
        </div>
        <div className="top-card sampah">
          <div className="card-icon"><FaRecycle /></div>
          <div className="card-info">
            <h4>Petugas Magot & Gaslah</h4>
            <div className="card-value">8 <span>Orang</span></div>
          </div>
        </div>
      </div>

      {/* Middle Grid */}
      <div className="middle-grid">
        {/* Agenda Kegiatan */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <h3><FaCalendarAlt /> Agenda Kegiatan Hari Ini</h3>
            <Link to="/agenda_kegiatan" className="lihat-semua">Lihat Semua <FaChevronRight/></Link>
          </div>
          <div className="agenda-list">
            <div className="agenda-item">
              <span className="agenda-time">07:00</span>
              <div className="agenda-detail">
                <strong>Pemeliharaan Jalan</strong>
                <span>Jl. Kesehatan</span>
              </div>
              <span className="badge-status berlangsung">Berlangsung</span>
            </div>
            <div className="agenda-item">
              <span className="agenda-time">09:00</span>
              <div className="agenda-detail">
                <strong>Monitoring Bank Sampah</strong>
                <span>RW 05</span>
              </div>
              <span className="badge-status terjadwal">Terjadwal</span>
            </div>
            <div className="agenda-item">
              <span className="agenda-time">11:00</span>
              <div className="agenda-detail">
                <strong>Pemapasan Pohon</strong>
                <span>Jl. Prof. Eyckman</span>
              </div>
              <span className="badge-status terjadwal">Terjadwal</span>
            </div>
          </div>
        </div>

        {/* Status Pengajuan */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <h3><FaClipboardList /> Status Pengajuan Masyarakat</h3>
            <Link to="/pengajuan_layanan" className="lihat-semua">Lihat Semua <FaChevronRight/></Link>
          </div>
          <div className="status-grid">
            <div className="status-item rutilahu">
              <FaHome className="status-icon" />
              <span>Rutilahu</span>
              <strong>12</strong>
              <small>Pengajuan</small>
            </div>
            <div className="status-item pohon">
              <FaTree className="status-icon" />
              <span>Pemapasan Pohon</span>
              <strong>8</strong>
              <small>Pengajuan</small>
            </div>
            <div className="status-item buruan">
              <FaLeaf className="status-icon" />
              <span>Buruan Sae</span>
              <strong>15</strong>
              <small>Pengajuan</small>
            </div>
            <div className="status-item musrenbang">
              <FaUsers className="status-icon" />
              <span>Musrenbang</span>
              <strong>5</strong>
              <small>Pengajuan</small>
            </div>
            <div className="status-item dau">
              <FaHandsHelping className="status-icon" />
              <span>DAU & Prakarsa</span>
              <strong>7</strong>
              <small>Pengajuan</small>
            </div>
          </div>
        </div>

        {/* Peta Wilayah */}
        <div className="dashboard-panel map-panel">
          <div className="panel-header">
            <h3><FaMapMarkedAlt /> Peta Wilayah Kelurahan Pasteur</h3>
            <Link to="/peta_gis" className="lihat-semua">Lihat Peta Lengkap <FaChevronRight/></Link>
          </div>
          <div className="map-container">
            <MapContainer center={[-6.897, 107.598]} zoom={15} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              <Polygon positions={pasteurPolygon} color="blue" />
            </MapContainer>
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="bottom-grid">
        {/* Chart */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <h3><FaFileAlt /> Rekap Kegiatan Ekbang</h3>
            <select className="tahun-select"><option>Tahun 2026</option></select>
          </div>
          <div className="chart-container" style={{height: 250}}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="jalan" fill="#2ecc71" name="Jalan (m)" />
                <Bar dataKey="drainase" fill="#3498db" name="Drainase (m)" />
                <Bar dataKey="bankSampah" fill="#9b59b6" name="Bank Sampah (kg)" />
                <Bar dataKey="maggot" fill="#f1c40f" name="Maggot (kg)" />
                <Bar dataKey="gaslah" fill="#e67e22" name="Gaslah (kg)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Berita */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <h3>Berita & Pengumuman</h3>
            <a href="#" className="lihat-semua">Lihat Semua <FaChevronRight/></a>
          </div>
          <div className="berita-list">
            <div className="berita-item">
              <div className="berita-img placeholder-img"></div>
              <div className="berita-detail">
                <h4>Kegiatan SASAPU Bandung Jilid V</h4>
                <span>17 Mei 2026</span>
              </div>
            </div>
            <div className="berita-item">
              <div className="berita-img placeholder-img"></div>
              <div className="berita-detail">
                <h4>Sosialisasi Pengelolaan Sampah</h4>
                <span>10 Mei 2026</span>
              </div>
            </div>
            <div className="berita-item">
              <div className="berita-img placeholder-img"></div>
              <div className="berita-detail">
                <h4>Monitoring Buruan Sae RW 03</h4>
                <span>5 Mei 2026</span>
              </div>
            </div>
          </div>
        </div>

        {/* Laporan */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <h3><FaDownload /> Unduh Laporan</h3>
          </div>
          <div className="laporan-grid">
            <div className="laporan-item">
              <FaFileExcel className="laporan-icon excel" />
              <span>Rekap Data Ekbang</span>
              <button className="btn-download">Download</button>
            </div>
            <div className="laporan-item">
              <FaFilePdf className="laporan-icon pdf" />
              <span>Laporan Kegiatan</span>
              <button className="btn-download">Download</button>
            </div>
            <div className="laporan-item">
              <FaClipboardList className="laporan-icon doc" />
              <span>Data Pengajuan</span>
              <button className="btn-download">Download</button>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Utama (Carousel-like) */}
      <div className="dashboard-panel menu-utama-panel">
        <div className="panel-header">
          <h3>Menu Utama</h3>
        </div>
        <div className="menu-utama-grid">
          <Link to="/admin" className="menu-utama-item">
            <div className="menu-icon"><FaUsers className="text-primary"/></div>
            <span>Data Personel</span>
          </Link>
          <Link to="/data_petugas" className="menu-utama-item">
            <div className="menu-icon"><FaDesktop className="text-info"/></div>
            <span>Data Ekbang</span>
          </Link>
          <Link to="/pengajuan_layanan" className="menu-utama-item">
            <div className="menu-icon"><FaClipboardList className="text-primary"/></div>
            <span>Pengajuan Masyarakat</span>
          </Link>
          <Link to="/peta_gis" className="menu-utama-item">
            <div className="menu-icon"><FaMapMarkedAlt className="text-info"/></div>
            <span>Pemetaan Wilayah</span>
          </Link>
          <Link to="#" className="menu-utama-item">
            <div className="menu-icon"><FaRecycle className="text-success"/></div>
            <span>Bank Sampah</span>
          </Link>
          <Link to="#" className="menu-utama-item">
            <div className="menu-icon"><FaUsers className="text-success"/></div>
            <span>Gober & Gaslah</span>
          </Link>
          <Link to="#" className="menu-utama-item">
            <div className="menu-icon"><FaLeaf className="text-success"/></div>
            <span>Buruan Sae</span>
          </Link>
          <Link to="#" className="menu-utama-item">
            <div className="menu-icon"><FaFileAlt className="text-primary"/></div>
            <span>Laporan</span>
          </Link>
        </div>
      </div>
      
    </div>
  );
};

export default Dashboard;
