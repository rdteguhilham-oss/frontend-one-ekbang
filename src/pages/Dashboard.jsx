import React, { useState, useEffect } from 'react';
import { 
    getDataLayanan, getPetugas, getKegiatanAgenda, getTitikPeta, getKegiatanGober, getDataAdmin, BASE_URL 
} from '../services/api';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Link } from 'react-router-dom';
import { FaUsers, FaClipboardList, FaLeaf, FaUserShield } from 'react-icons/fa';
import './Dashboard.css';

export default function Dashboard() {
    const [dataLayanan, setDataLayanan] = useState([]);
    const [dataPetugas, setDataPetugas] = useState([]);
    const [dataAgenda, setDataAgenda] = useState([]);
    const [dataPeta, setDataPeta] = useState([]);
    const [dataGober, setDataGober] = useState([]);
    const [dataAdmin, setDataAdmin] = useState([]);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const lay = await getDataLayanan();
                setDataLayanan(lay);
                const pet = await getPetugas();
                setDataPetugas(pet);
                const age = await getKegiatanAgenda();
                setDataAgenda(age);
                const petGis = await getTitikPeta();
                setDataPeta(petGis);
                const gob = await getKegiatanGober();
                setDataGober(gob);
                const adm = await getDataAdmin();
                setDataAdmin(adm);
            } catch (error) {
                console.error(error);
            }
        };
        fetchAll();
    }, []);

    // 1. Data Chart (Rekap Layanan)
    const rekapLayanan = [
        { name: 'Rutilahu', jumlah: dataLayanan.filter(d => d.jenis_layanan === 'RUTILAHU').length },
        { name: 'Pohon', jumlah: dataLayanan.filter(d => d.jenis_layanan === 'POHON TUMBANG').length },
        { name: 'Buruan Sae', jumlah: dataLayanan.filter(d => d.jenis_layanan === 'BURUAN SAE').length },
        { name: 'Musrenbang', jumlah: dataLayanan.filter(d => d.jenis_layanan === 'MUSRENBANG').length },
        { name: 'DAU & Prakarsa', jumlah: dataLayanan.filter(d => d.jenis_layanan === 'DAU DAN PRAKARSA').length },
        { name: 'Sarpras DLH', jumlah: dataLayanan.filter(d => d.jenis_layanan === 'SARPRAS DLH').length }
    ];

    // 2. Data Petugas (Cards)
    const petugasGober = dataPetugas.filter(p => p.kategori_petugas === 'Gober').length;
    const petugasTaman = dataPetugas.filter(p => p.kategori_petugas === 'Taman').length;
    const petugasGorong = dataPetugas.filter(p => p.kategori_petugas === 'Gorong-gorong').length;
    const petugasGaslah = dataPetugas.filter(p => p.kategori_petugas === 'Gaslah').length;
    const petugasMagot = dataPetugas.filter(p => p.kategori_petugas === 'Petugas Magot').length;

    // 3. Agenda Mendatang (Ambil 4 teratas)
    const agendaMendatang = dataAgenda
        .filter(a => new Date(a.tanggal_waktu) >= new Date(new Date().setHours(0,0,0,0)))
        .sort((a,b) => new Date(a.tanggal_waktu) - new Date(b.tanggal_waktu))
        .slice(0, 4);

    return (
        <div className="dashboard-container">
            {/* HEADER BANNER */}
            <div className="dashboard-header-banner" style={{ backgroundImage: 'url(/bg-city.jpg)' }}>
                <div className="banner-overlay">
                    <h1>Sistem Informasi Data Ekonomi Pembangunan Terintegrasi</h1>
                    <p>Kelurahan Pasteur - Kecamatan Sukajadi - Kota Bandung</p>
                </div>
            </div>

            {/* ROW 1: SUMMARY CARDS PETUGAS */}
            <div className="summary-petugas-grid">
                <div className="card-petugas gober">
                    <div className="ikon-petugas"><FaUsers /></div>
                    <div className="teks-petugas">
                        <h4>Gober Lapangan</h4>
                        <h2>{petugasGober} <span>Orang</span></h2>
                    </div>
                </div>
                <div className="card-petugas taman">
                    <div className="ikon-petugas"><FaLeaf /></div>
                    <div className="teks-petugas">
                        <h4>Petugas Taman</h4>
                        <h2>{petugasTaman} <span>Orang</span></h2>
                    </div>
                </div>
                <div className="card-petugas gorong">
                    <div className="ikon-petugas"><FaClipboardList /></div>
                    <div className="teks-petugas">
                        <h4>Gorong-gorong</h4>
                        <h2>{petugasGorong} <span>Orang</span></h2>
                    </div>
                </div>
                <div className="card-petugas gaslah">
                    <div className="ikon-petugas"><FaLeaf /></div>
                    <div className="teks-petugas">
                        <h4>Tim Gas-Lah</h4>
                        <h2>{petugasGaslah} <span>Orang</span></h2>
                    </div>
                </div>
                <div className="card-petugas magot">
                    <div className="ikon-petugas"><FaLeaf /></div>
                    <div className="teks-petugas">
                        <h4>Petugas Magot</h4>
                        <h2>{petugasMagot} <span>Orang</span></h2>
                    </div>
                </div>
                <div className="card-petugas admin">
                    <div className="ikon-petugas"><FaUserShield /></div>
                    <div className="teks-petugas">
                        <h4>Akun Admin Aktif</h4>
                        <h2>{dataAdmin.length} <span>Akun</span></h2>
                    </div>
                </div>
            </div>

            {/* ROW 2: WIDGETS */}
            <div className="dashboard-grid-utama">
                
                {/* WIDGET AGENDA HARI INI */}
                <div className="widget-card">
                    <div className="widget-header">
                        <h3>📅 Agenda Kegiatan</h3>
                        <Link to="/agenda_kegiatan">Lihat Semua ➔</Link>
                    </div>
                    <div className="widget-body agenda-list">
                        {agendaMendatang.length > 0 ? agendaMendatang.map(ag => (
                            <div className="agenda-item" key={ag.id}>
                                <div className="agenda-waktu">
                                    {new Date(ag.tanggal_waktu).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}
                                </div>
                                <div className="agenda-info">
                                    <strong>{ag.judul_agenda}</strong>
                                    <span>{ag.lokasi}</span>
                                </div>
                                <div className="agenda-status berlangsung">Mendatang</div>
                            </div>
                        )) : <p className="text-muted" style={{textAlign: 'center', marginTop: '20px'}}>Belum ada agenda mendatang.</p>}
                    </div>
                </div>

                {/* WIDGET STATUS PENGAJUAN */}
                <div className="widget-card">
                    <div className="widget-header">
                        <h3>📝 Status Pengajuan</h3>
                        <Link to="/pengajuan_layanan">Lihat Semua ➔</Link>
                    </div>
                    <div className="widget-body grid-pengajuan">
                        {rekapLayanan.map((lay, idx) => (
                            <div className="item-pengajuan" key={idx}>
                                <h2>{lay.jumlah}</h2>
                                <p>Pengajuan</p>
                                <span>{lay.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* WIDGET PETA MINI */}
                <div className="widget-card map-widget">
                    <div className="widget-header">
                        <h3>🗺️ Peta Wilayah Kelurahan</h3>
                        <Link to="/peta_gis">Lihat Penuh ➔</Link>
                    </div>
                    <div className="widget-body p-0">
                        <MapContainer center={[-6.891226, 107.601757]} zoom={13} scrollWheelZoom={false} className="mini-map">
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            {dataPeta.map(titik => (
                                <Marker key={titik.id} position={[titik.latitude, titik.longitude]}>
                                    <Popup>{titik.nama_lokasi}</Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    </div>
                </div>

            </div>

            {/* ROW 3: CHARTS & BERITA */}
            <div className="dashboard-grid-bawah">
                
                {/* CHART REKAP */}
                <div className="widget-card span-2">
                    <div className="widget-header">
                        <h3>📊 Rekap Kegiatan Ekbang (Berdasarkan Layanan)</h3>
                    </div>
                    <div className="widget-body" style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={rekapLayanan}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="jumlah" fill="#10B981" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* KEGIATAN TERBARU */}
                <div className="widget-card">
                    <div className="widget-header">
                        <h3>📰 Laporan Lapangan Terbaru</h3>
                        <Link to="/kegiatan_harian">Lihat Semua ➔</Link>
                    </div>
                    <div className="widget-body berita-list">
                        {dataGober.slice(0, 4).map((gob, idx) => (
                            <div className="berita-item" key={idx}>
                                {gob.foto ? (
                                    <img src={gob.foto.startsWith('http') ? gob.foto : `${BASE_URL}/uploads/${gob.foto}`} alt="kegiatan" />
                                ) : (
                                    <div className="berita-placeholder">No Photo</div>
                                )}
                                <div className="berita-info">
                                    <strong>{gob.nama_petugas}</strong>
                                    <span>{new Date(gob.tanggal_kegiatan).toLocaleDateString('id-ID')} | {gob.lokasi}</span>
                                </div>
                            </div>
                        ))}
                        {dataGober.length === 0 && <p className="text-muted" style={{textAlign: 'center', marginTop: '20px'}}>Belum ada laporan.</p>}
                    </div>
                </div>

            </div>
        </div>
    );
}
