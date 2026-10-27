import { useState, useEffect, useRef } from 'react';
import { 
    getDataLayanan, getPetugas, getKegiatanAgenda, getTitikPeta, getKegiatanGober, getDataAdmin, BASE_URL 
} from '../services/api';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Link, useNavigate } from 'react-router-dom';
import { 
    FaUsers, FaClipboardList, FaLeaf, FaUserShield, FaBell,
    FaCalendarAlt, FaHome, FaTree, FaHandsHelping,
    FaMapMarkedAlt, FaSignOutAlt, FaTools,
    FaNewspaper, FaDownload, FaRecycle, FaWater, FaRoad, FaStore, FaFileAlt
} from 'react-icons/fa';
import './Dashboard.css';

export default function Dashboard() {
    const navigate = useNavigate();
    const [dataLayanan, setDataLayanan] = useState([]);
    const [dataPetugas, setDataPetugas] = useState([]);
    const [dataAgenda, setDataAgenda] = useState([]);
    const [dataPeta, setDataPeta] = useState([]);
    const [dataGober, setDataGober] = useState([]);
    const [dataAdmin, setDataAdmin] = useState([]);

    // DATA ADMIN DINAMIS DARI LOCALSTORAGE & TOKEN
    const [namaAdmin, setNamaAdmin] = useState(() => {
        try {
            const stored = JSON.parse(localStorage.getItem('dataAdmin'));
            if (stored && (stored.nama_lengkap || stored.username)) {
                return stored.nama_lengkap || stored.username;
            }
        } catch { /* ignore */ }
        return 'Admin';
    });

    // STATE NOTIFIKASI INTERAKTIF
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const notifRef = useRef(null);

    const handleLogout = () => {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('token');
        localStorage.removeItem('dataAdmin');
        navigate('/login');
    };

    // Tutup notifikasi saat klik di luar
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setIsNotifOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('token');
        let tokenUsername = null;
        if (token) {
            try {
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(
                    atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
                );
                tokenUsername = JSON.parse(jsonPayload).username;
            } catch {
                try {
                    tokenUsername = JSON.parse(atob(token.split('.')[1])).username;
                } catch (err) {
                    console.debug('Gagal parse token:', err);
                }
            }
        }

        const fetchAll = async () => {
            try {
                const [lay, pet, age, petGis, gob, adm] = await Promise.all([
                    getDataLayanan(),
                    getPetugas(),
                    getKegiatanAgenda(),
                    getTitikPeta(),
                    getKegiatanGober(),
                    getDataAdmin()
                ]);
                setDataLayanan(lay);
                setDataPetugas(pet);
                setDataAgenda(age);
                setDataPeta(petGis);
                setDataGober(gob);
                setDataAdmin(adm);

                if (adm && adm.length > 0) {
                    const match = adm.find(a => a.username === (tokenUsername || 'user')) || adm[0];
                    if (match) {
                        setNamaAdmin(match.nama_lengkap || match.username || 'Admin');
                        localStorage.setItem('dataAdmin', JSON.stringify(match));
                    }
                }
            } catch (error) {
                console.error(error);
            }
        };
        fetchAll();
    }, []);

    // ── STATISTIK PETUGAS ──────────────────────────────────────
    const petugasGober   = dataPetugas.filter(p => p.kategori_petugas === 'Gober').length;
    const petugasTaman   = dataPetugas.filter(p => p.kategori_petugas === 'Taman').length;
    const petugasMagot   = dataPetugas.filter(p => ['Magot','Petugas Magot'].includes(p.kategori_petugas)).length;
    const petugasGaslah  = dataPetugas.filter(p => p.kategori_petugas === 'Gaslah').length;
    const petugasGorong  = dataPetugas.filter(p => p.kategori_petugas === 'Gorong-gorong').length;
    const jumlahAdmin    = dataAdmin.length;

    // ── STATUS PENGAJUAN ───────────────────────────────────────
    const jmlRutilahu   = dataLayanan.filter(d => d.jenis_layanan === 'RUTILAHU').length;
    const jmlPohon      = dataLayanan.filter(d => d.jenis_layanan === 'POHON TUMBANG').length;
    const jmlBuruan     = dataLayanan.filter(d => d.jenis_layanan === 'BURUAN SAE').length;
    const jmlMusrenbang = dataLayanan.filter(d => d.jenis_layanan === 'MUSRENBANG').length;
    const jmlDau        = dataLayanan.filter(d => d.jenis_layanan === 'DAU DAN PRAKARSA').length;
    const jmlSarpras    = dataLayanan.filter(d => d.jenis_layanan === 'SARPRAS DLH').length;
    const jmlKirmir     = dataLayanan.filter(d => d.jenis_layanan === 'KIRMIR / DRAINASE').length;
    const jmlJalan      = dataLayanan.filter(d => d.jenis_layanan === 'PERBAIKAN JALAN').length;
    const jmlUmkm       = dataLayanan.filter(d => d.jenis_layanan === 'UMKM').length;
    const jmlLainnya    = dataLayanan.filter(d => d.jenis_layanan && (d.jenis_layanan.startsWith('LAINNYA') || d.jenis_layanan === 'PENGAJUAN LAINNYA')).length;

    // ── NOTIFIKASI ─────────────────────────────────────────────
    const daftarNotifBaru = dataLayanan.filter(i => !i.status || i.status === 'Baru');
    const jumlahNotifBaru = daftarNotifBaru.length;

    const [sekarang, setSekarang] = useState(() => new Date());

    useEffect(() => {
        // Update waktu setiap 10 detik agar pergantian status jadwal dan jam sangat responsif
        const timer = setInterval(() => {
            setSekarang(new Date());
        }, 10000);
        return () => clearInterval(timer);
    }, []);

    // ── HELPER PARSING TANGGAL ────────────────────────────────
    const parseDate = (val) => {
        if (!val) return null;
        const str = typeof val === 'string' && !val.includes('T') ? val.replace(' ', 'T') : val;
        return new Date(str);
    };

    // ── STATUS DINAMIS AGENDA (MURNI MENGIKUTI WAKTU JADWAL ACARA) ──────
    const getStatusAgenda = (tanggalWaktuStr, waktuSelesaiStr) => {
        if (!tanggalWaktuStr) return { label: 'Terjadwal', cls: 'badge-sch' };
        const tglMulai = parseDate(tanggalWaktuStr);
        if (!tglMulai || isNaN(tglMulai.getTime())) return { label: 'Terjadwal', cls: 'badge-sch' };

        const now = sekarang.getTime();
        const start = tglMulai.getTime();

        if (now < start) {
            return { label: 'Terjadwal', cls: 'badge-sch' };
        }

        if (waktuSelesaiStr) {
            const tglSelesai = parseDate(waktuSelesaiStr);
            if (tglSelesai && !isNaN(tglSelesai.getTime())) {
                if (now >= tglSelesai.getTime()) {
                    return { label: 'Selesai', cls: 'badge-done' };
                }
                return { label: 'Berlangsung', cls: 'badge-on' };
            }
        }

        // Jika waktu_selesai belum diatur, fallback estimasi durasi 2 jam (120 menit)
        const selisihMenit = (now - start) / (1000 * 60);
        if (selisihMenit <= 120) {
            return { label: 'Berlangsung', cls: 'badge-on' };
        }
        return { label: 'Selesai', cls: 'badge-done' };
    };

    // ── AGENDA HARI INI (Khusus Hari Ini) ───────────────────────
    const agendaHariIni = [...dataAgenda]
        .filter(a => {
            if (!a.tanggal_waktu) return false;
            const tgl = parseDate(a.tanggal_waktu);
            if (!tgl || isNaN(tgl.getTime())) return false;
            return tgl.getDate() === sekarang.getDate() &&
                   tgl.getMonth() === sekarang.getMonth() &&
                   tgl.getFullYear() === sekarang.getFullYear();
        })
        .sort((a, b) => parseDate(a.tanggal_waktu) - parseDate(b.tanggal_waktu));

    const agendaDensityClass = agendaHariIni.length <= 2 
        ? 'db-density-few' 
        : agendaHariIni.length <= 4 
            ? 'db-density-medium' 
            : 'db-density-many';

    // ── BERITA DARI AGENDA (Terbaru) ───────────────────────────
    const agendaFoto = [...dataAgenda].filter(a => a.foto_dokumentasi || a.foto_kegiatan);
    const beritaList = (agendaFoto.length >= 3 ? agendaFoto : [...dataAgenda])
        .sort((a, b) => (parseDate(b.tanggal_waktu) || 0) - (parseDate(a.tanggal_waktu) || 0))
        .slice(0, 3);

    // ── CHART DATA ─────────────────────────────────────────────
    const bulanList = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
    const dataGrafikBulanan = bulanList.map((bulan, i) => ({
        bulan,
        'Gober': dataGober.filter(d => d.tanggal_kegiatan && new Date(d.tanggal_kegiatan).getMonth() === i).length,
        'Agenda': dataAgenda.filter(d => d.tanggal_waktu && new Date(d.tanggal_waktu).getMonth() === i).length,
        'Layanan': dataLayanan.filter(d => d.tanggal_pengajuan && new Date(d.tanggal_pengajuan).getMonth() === i).length,
    }));

    // ── MENU UTAMA ─────────────────────────────────────────────
    const menuUtama = [
        { label: 'Data Petugas',    path: '/data_petugas',      icon: <FaUsers />,        bg: '#0284C7' },
        { label: 'Pengajuan Warga', path: '/pengajuan_layanan', icon: <FaClipboardList />, bg: '#10B981' },
        { label: 'Peta Wilayah',    path: '/peta_gis',          icon: <FaMapMarkedAlt />, bg: '#F97316' },
        { label: 'Kegiatan Harian', path: '/kegiatan_harian',   icon: <FaTools />,        bg: '#8B5CF6' },
        { label: 'Agenda Kegiatan', path: '/agenda_kegiatan',   icon: <FaCalendarAlt />,  bg: '#EF4444' },
        { label: 'Data Admin',      path: '/admin',             icon: <FaUserShield />,   bg: '#F59E0B' },
    ];

    return (
        <div className="db-wrapper">

            {/* ══════════════════════════════════════════
                HEADER PANORAMA + OMBAK + JUDUL + KONTROL
            ═══════════════════════════════════════════ */}
            <div className="db-header">
                {/* Latar kota */}
                <div className="db-header-bg" style={{ backgroundImage: 'url(/bg-city.jpg)' }}>
                    <div className="db-header-overlay"></div>
                    {/* Lambang Kota Bandung - tengah */}
                    <img src={`${import.meta.env.BASE_URL}rb-logo-bdg.png`} alt="Lambang Bandung" className="db-emblem" />
                    {/* Slogan kanan */}
                    <div className="db-slogan">
                        <em>Wilayah Lebih Bersih,</em><br />
                        <span>Masyarakat Lebih Sejahtera</span>
                        <svg viewBox="0 0 160 14" className="db-slogan-line" fill="none">
                            <path d="M4,10 Q80,2 156,10" stroke="#1E40AF" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                    </div>
                    {/* Ombak putih */}
                    <svg className="db-wave" viewBox="0 0 1200 60" preserveAspectRatio="none">
                        <path d="M0,25 Q300,58 600,30 T1200,42 L1200,60 L0,60 Z" fill="rgba(16,185,129,0.18)" />
                        <path d="M0,36 Q280,60 580,38 T1200,52 L1200,60 L0,60 Z" className="db-wave-fill" />
                    </svg>
                    {/* Judul sistem info */}
                    <div className="db-title-area">
                        <h1>Sistem Informasi Data Ekonomi Pembangunan Terintegrasi</h1>
                        <p>Kelurahan Pasteur – Kecamatan Sukajadi – Kota Bandung</p>
                    </div>
                </div>

                {/* Kontrol kanan atas (absolut, di atas bg) */}
                <div className="db-top-controls">
                    {/* Notifikasi */}
                    <div className="db-notif-wrap" ref={notifRef}>
                        <button
                            className={`db-bell ${isNotifOpen ? 'db-bell-active' : ''}`}
                            onClick={() => setIsNotifOpen(v => !v)}
                            title="Notifikasi"
                        >
                            <FaBell />
                            {jumlahNotifBaru > 0 && <span className="db-bell-badge">{jumlahNotifBaru}</span>}
                        </button>
                        {isNotifOpen && (
                            <div className="db-notif-card">
                                <div className="db-notif-head">
                                    <span><FaBell style={{marginRight:4}}/> Pengajuan Baru</span>
                                    <span className="db-notif-pill">{jumlahNotifBaru} Baru</span>
                                </div>
                                <div className="db-notif-body">
                                    {daftarNotifBaru.length > 0 ? daftarNotifBaru.slice(0, 4).map((item, idx) => (
                                        <div key={idx} className="db-notif-item" onClick={() => { setIsNotifOpen(false); navigate('/pengajuan_layanan'); }}>
                                            <span className="db-notif-emoji">📋</span>
                                            <div>
                                                <strong>{item.nama_pemohon || 'Warga'}</strong>
                                                <p>{item.jenis_layanan || 'Pengajuan Layanan'}</p>
                                                <small>{item.tanggal_pengajuan ? new Date(item.tanggal_pengajuan).toLocaleDateString('id-ID', {day:'numeric', month:'short'}) : 'Menunggu'}</small>
                                            </div>
                                        </div>
                                    )) : <div className="db-notif-empty">Semua pengajuan telah diverifikasi.</div>}
                                </div>
                                <button className="db-notif-btn" onClick={() => { setIsNotifOpen(false); navigate('/pengajuan_layanan'); }}>
                                    Buka & Verifikasi Pengajuan →
                                </button>
                            </div>
                        )}
                    </div>
                    {/* Profil admin */}
                    <div className="db-profile">
                        <div className="db-avatar">{namaAdmin.charAt(0).toUpperCase()}</div>
                        <div className="db-profile-info">
                            <strong>{namaAdmin}</strong>
                            <small>Kelurahan Pasteur</small>
                        </div>
                        <button className="db-logout" onClick={handleLogout} title="Keluar"><FaSignOutAlt /></button>
                    </div>
                </div>
            </div>

            {/* ══════════════════════════════════════════
                ROW 1 — 6 KARTU STATISTIK PETUGAS
            ═══════════════════════════════════════════ */}
            <div className="db-stat-row">
                {[
                    { label: 'Gober Lapangan',  val: petugasGober,  unit: 'Orang', color: '#10B981', icon: <FaUsers /> },
                    { label: 'Petugas Taman',   val: petugasTaman,  unit: 'Orang', color: '#0284C7', icon: <FaLeaf /> },
                    { label: 'Pengelola Magot',  val: petugasMagot,  unit: 'Orang', color: '#F97316', icon: <FaRecycle /> },
                    { label: 'Tim Gas-Lah',      val: petugasGaslah, unit: 'Orang', color: '#8B5CF6', icon: <FaWater /> },
                    { label: 'Gorong-gorong',    val: petugasGorong, unit: 'Orang', color: '#F59E0B', icon: <FaTools /> },
                    { label: 'Akun Admin Aktif', val: jumlahAdmin,   unit: 'Akun',  color: '#EF4444', icon: <FaUserShield /> },
                ].map((s, i) => (
                    <div key={i} className="db-stat-card" style={{ background: s.color }}>
                        <div className="db-stat-icon">{s.icon}</div>
                        <div className="db-stat-text">
                            <span>{s.label}</span>
                            <strong>{s.val} <em>{s.unit}</em></strong>
                        </div>
                    </div>
                ))}
            </div>

            {/* ══════════════════════════════════════════
                ROW 2 — AGENDA | PENGAJUAN | PETA
            ═══════════════════════════════════════════ */}
            <div className="db-row-2">

                {/* AGENDA KEGIATAN HARI INI */}
                <div className="db-box">
                    <div className="db-box-head">
                        <span><FaCalendarAlt className="db-hdr-icon"/> Agenda Kegiatan Hari Ini</span>
                        <Link to="/agenda_kegiatan" className="db-link-more">Lihat Semua &gt;</Link>
                    </div>
                    <div className={`db-box-body db-agenda-list ${agendaDensityClass}`}>
                        {agendaHariIni.length > 0 ? agendaHariIni.map((ag) => {
                            const status = getStatusAgenda(ag.tanggal_waktu, ag.waktu_selesai);
                            const tglMulai = parseDate(ag.tanggal_waktu);
                            const tglSelesai = ag.waktu_selesai ? parseDate(ag.waktu_selesai) : null;
                            const jamMulai = tglMulai ? tglMulai.toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'}) : '';
                            const jamSelesai = tglSelesai ? tglSelesai.toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'}) : null;
                            const waktuLabel = jamSelesai ? `${jamMulai} - ${jamSelesai}` : jamMulai;

                            return (
                                <div key={ag.id} className="db-agenda-item">
                                    <span className="db-agenda-time">
                                        {waktuLabel}
                                    </span>
                                    <span className={`db-agenda-dot ${status.cls === 'badge-on' ? 'dot-active' : ''}`}></span>
                                    <div className="db-agenda-content">
                                        <strong>{ag.judul_agenda}</strong>
                                        <small>{ag.lokasi || ''}</small>
                                    </div>
                                    <span className={`db-badge ${status.cls}`}>
                                        {status.label}
                                    </span>
                                </div>
                            );
                        }) : (
                            <div className="db-empty db-empty-center">Belum ada agenda hari ini.</div>
                        )}
                    </div>
                </div>

                {/* STATUS PENGAJUAN MASYARAKAT */}
                <div className="db-box">
                    <div className="db-box-head">
                        <span><FaClipboardList className="db-hdr-icon"/> Status Pengajuan Masyarakat</span>
                        <Link to="/pengajuan_layanan" className="db-link-more">Lihat Semua &gt;</Link>
                    </div>
                    <div className="db-box-body db-pengajuan-grid">
                        {[
                            { name:'Rutilahu',       val: jmlRutilahu,   icon: <FaHome />,         color:'#EA580C' },
                            { name:'Pohon',          val: jmlPohon,      icon: <FaTree />,         color:'#16A34A' },
                            { name:'Buruan Sae',     val: jmlBuruan,     icon: <FaLeaf />,         color:'#0D9488' },
                            { name:'Musrenbang',     val: jmlMusrenbang, icon: <FaUsers />,        color:'#8B5CF6' },
                            { name:'DAU & Prakarsa', val: jmlDau,        icon: <FaHandsHelping />, color:'#0284C7' },
                            { name:'Sarpras DLH',    val: jmlSarpras,    icon: <FaTools />,        color:'#0891B2' },
                            { name:'Kirmir/Drainase',val: jmlKirmir,     icon: <FaWater />,        color:'#06B6D4' },
                            { name:'Perbaikan Jalan',val: jmlJalan,      icon: <FaRoad />,         color:'#475569' },
                            { name:'UMKM',           val: jmlUmkm,       icon: <FaStore />,        color:'#F59E0B' },
                            { name:'Lainnya',        val: jmlLainnya,    icon: <FaFileAlt />,      color:'#EC4899' },
                        ].map((t, i) => (
                            <div key={i} className="db-pengajuan-tile">
                                <div className="db-ptile-icon" style={{ color: t.color }}>{t.icon}</div>
                                <span className="db-ptile-name">{t.name}</span>
                                <strong className="db-ptile-num">{t.val}</strong>
                                <small>Pengajuan</small>
                                <div className="db-ptile-bar" style={{ background: t.color }}></div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* PETA WILAYAH */}
                <div className="db-box">
                    <div className="db-box-head">
                        <span><FaMapMarkedAlt className="db-hdr-icon"/> Peta Wilayah Kelurahan Pasteur</span>
                        <Link to="/peta_gis" className="db-link-more">Lihat Peta Lengkap &gt;</Link>
                    </div>
                    <div className="db-box-body db-peta-wrap">
                        <div className="db-map-canvas">
                            <MapContainer center={[-6.891226, 107.601757]} zoom={13} scrollWheelZoom={false} className="db-leaflet">
                                <TileLayer 
                                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
                                    attribution="Tiles &copy; Esri &mdash; Sumber: Esri, DeLorme, NAVTEQ, USGS"
                                />
                                {dataPeta.map(titik => (
                                    <Marker key={titik.id} position={[titik.latitude, titik.longitude]}>
                                        <Popup>{titik.nama_lokasi}</Popup>
                                    </Marker>
                                ))}
                            </MapContainer>
                        </div>
                    </div>
                </div>

            </div>

            {/* ══════════════════════════════════════════
                ROW 3 — GRAFIK | BERITA | UNDUH
            ═══════════════════════════════════════════ */}
            <div className="db-row-3">

                {/* REKAP KEGIATAN EKBANG */}
                <div className="db-box">
                    <div className="db-box-head">
                        <span>📊 Rekap Kegiatan Ekbang</span>
                        <span className="db-year-pill">Tahun 2026 ▾</span>
                    </div>
                    <div className="db-box-body db-chart-body">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dataGrafikBulanan} margin={{ top: 4, right: 8, left: -28, bottom: -6 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                                <XAxis dataKey="bulan" tick={{ fontSize: 8 }} />
                                <YAxis tick={{ fontSize: 8 }} />
                                <Tooltip />
                                <Legend wrapperStyle={{ fontSize: '8px' }} />
                                <Bar dataKey="Gober"   fill="#0284C7" radius={[2,2,0,0]} />
                                <Bar dataKey="Agenda"  fill="#10B981" radius={[2,2,0,0]} />
                                <Bar dataKey="Layanan" fill="#F97316" radius={[2,2,0,0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* BERITA & PENGUMUMAN */}
                <div className="db-box">
                    <div className="db-box-head">
                        <span><FaNewspaper className="db-hdr-icon"/> Berita &amp; Pengumuman</span>
                        <Link to="/agenda_kegiatan" className="db-link-more">Lihat Semua &gt;</Link>
                    </div>
                    <div className="db-box-body db-berita-list">
                        {beritaList.length > 0 ? beritaList.map((item, idx) => (
                            <div key={item.id || idx} className="db-berita-item">
                                <div className="db-berita-thumb">
                                    {(item.foto_dokumentasi || item.foto_kegiatan) ? (
                                        <img 
                                            src={(item.foto_dokumentasi || item.foto_kegiatan).startsWith('http') 
                                                ? (item.foto_dokumentasi || item.foto_kegiatan) 
                                                : `${BASE_URL}/uploads/${item.foto_dokumentasi || item.foto_kegiatan}`} 
                                            alt={item.judul_agenda || "kegiatan"} 
                                        />
                                    ) : (
                                        <div className="db-berita-no-img"><FaCalendarAlt /></div>
                                    )}
                                </div>
                                <div className="db-berita-text">
                                    <strong>{item.judul_agenda || 'Kegiatan Kelurahan Pasteur'}</strong>
                                    <small>
                                        {item.tanggal_waktu && parseDate(item.tanggal_waktu) ? parseDate(item.tanggal_waktu).toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'}) : '-'}
                                    </small>
                                </div>
                            </div>
                        )) : (
                            <div className="db-empty db-empty-center">
                                <FaNewspaper className="db-empty-icon" />
                                <p>Belum ada berita atau pengumuman.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* UNDUH LAPORAN */}
                <div className="db-box">
                    <div className="db-box-head">
                        <span>📥 Unduh Laporan</span>
                    </div>
                    <div className="db-box-body db-unduh-grid">
                        <Link to="/pengajuan_layanan" className="db-unduh-tile" style={{ background:'#16A34A' }}>
                            <div className="db-unduh-ico">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" /></svg>
                            </div>
                            <strong>Data Pengajuan</strong>
                            <span><FaDownload /> Download</span>
                        </Link>
                        <Link to="/kegiatan_harian" className="db-unduh-tile" style={{ background:'#DC2626' }}>
                            <div className="db-unduh-ico">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M10,19H8L10,15H8L11,10L14,15H12L14,19Z" /></svg>
                            </div>
                            <strong>Laporan Kegiatan</strong>
                            <span><FaDownload /> Download</span>
                        </Link>
                    </div>
                </div>

            </div>

            {/* ══════════════════════════════════════════
                ROW 4 — MENU UTAMA
            ═══════════════════════════════════════════ */}
            <div className="db-row-4">
                <div className="db-menu-header">Menu Utama</div>
                <div className="db-menu-tiles">
                    {menuUtama.map((m, i) => (
                        <Link key={i} to={m.path} className="db-menu-tile">
                            <div className="db-menu-thumb" style={{ background: m.bg }}>
                                <div className="db-menu-ico">{m.icon}</div>
                            </div>
                            <div className="db-menu-ico-row" style={{ color: m.bg }}>{m.icon}</div>
                            <span>{m.label}</span>
                        </Link>
                    ))}
                </div>
            </div>

        </div>
    );
}
