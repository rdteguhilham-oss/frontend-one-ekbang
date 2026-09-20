import React, { useState, useEffect } from 'react';
import './DataPetugas.css';
import Swal from 'sweetalert2';
import { getPetugas, tambahPetugas } from '../services/api';

export default function DataPetugas () {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [petugasList, setPetugasList] = useState([]);
  const [kataKunci,setKataKunci] = useState('');
  const [namaPetugas, setNamaPetugas] = useState('');
  const [kategoriPetugas, setKategoriPetugas] = useState('');
  const [wilayah, setWilayah] = useState('');
  const [noSk, setNoSk] = useState('');
  const [fileSk, setFileSk] = useState(null);

  const fetchPetugas = async () => {
    try {
      const data = await getPetugas();
      setPetugasList(data);
    } catch (error) {
      console.error("Error dari server:", error);
    }
  };

  useEffect(() => {
    fetchPetugas();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('nama_petugas', namaPetugas);
    formData.append('kategori_petugas', kategoriPetugas);
    formData.append('wilayah', wilayah);
    formData.append('no_sk', noSk);
    formData.append('file_sk', fileSk);

    try {
      const result = await tambahPetugas(formData);
      if (result.status === 'sukses') {
        Swal.fire('Data Petugas berhasil disimpan!');
        fetchPetugas();
        setNamaPetugas('');
        setKategoriPetugas('');
        setWilayah('');
        setNoSk('');
        setFileSk(null);
        document.getElementById('fileInput').value = '';
        
        setIsModalOpen(false);
      } else {
        Swal.fire('Gagal: ' + result.pesan);
      }

    } catch (error) {
      console.error("Error submit:", error);
      Swal.fire("Terjadi kesalahan sistem saat menyimpan data.");
    }
  };

  const hasilFilter = petugasList.filter((petugas) => {
    const teksCari = kataKunci.toLocaleLowerCase();
    return petugas.nama_petugas && petugas.nama_petugas.toLowerCase().includes(teksCari);
  });

  return (
    <div className="petugas-container">
      <h2 className="petugas-title">Kelola Data Petugas Ekbang</h2>
      
      <button className="btn-tambah-utama" onClick={() => setIsModalOpen(true)}>
        + Tambah Petugas Baru
      </button>

      <div className="petugas-table-card">
        
        <div className="header-tabel-petugas">
            <h3>Daftar Petugas Aktif</h3>
            <div className="search-petugas-group">
                <label>Cari Nama Petugas:</label>
                <input 
                    type="text" 
                    placeholder="Ketik nama petugas..." 
                    value={kataKunci}
                    onChange={(e) => setKataKunci(e.target.value)}
                />
            </div>
        </div>
        <div className="table-responsive">
            <table className="tabel-utama">
            <thead>
                <tr>
                <th>No</th>
                <th>Nama Petugas</th>
                <th>Kategori</th>
                <th>Wilayah</th>
                <th>No. SK</th>
                <th>File SK</th>
                </tr>
            </thead>
            <tbody>
                {hasilFilter.length > 0 ? (
                hasilFilter.map((petugas, index) => (
                    <tr key={petugas.id}>
                    <td>{index + 1}</td>
                    <td>{petugas.nama_petugas}</td>
                    <td>{petugas.kategori_petugas}</td>
                    <td>{petugas.wilayah}</td>
                    <td>{petugas.no_sk}</td>
                    <td>
                        <a href={`https://backend-one-ekbang-production.up.railway.app/uploads/${petugas.file_sk}`} target="_blank" rel="noreferrer" className="btn-lihat">
                        Lihat SK
                        </a>
                    </td>
                    </tr>
                ))
                ) : (
                <tr>
                    <td colSpan="6" className="text-center">Belum ada data petugas.</td>
                </tr>
                )}
            </tbody>
            </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="btn-tutup-modal" onClick={() => setIsModalOpen(false)}>X</button>
            
            {/* Judul Modal Tidak Dikunci Warnanya Lagi Agar Ikut Dark Mode */}
            <h3 style={{ marginTop: '0', marginBottom: '20px' }}>Tambah Petugas Baru</h3>
            
            <form onSubmit={handleSubmit} className="petugas-form">
              <div className="form-group">
                <label>Nama Petugas</label>
                <input type="text" placeholder='Contoh: Bpk. Budi' value={namaPetugas} onChange={(e) => setNamaPetugas(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Kategori Petugas</label>
                <select value={kategoriPetugas} onChange={(e) => setKategoriPetugas(e.target.value)} required>
                  <option value="">-- Pilih Kategori --</option>
                  <option value="Gober">Gober</option>
                  <option value="Gorong-gorong">Gorong-gorong</option>
                  <option value="Taman">Taman</option>
                  <option value="Petugas Magot">Petugas Magot</option>
                  <option value="Gaslah">Gaslah</option>
                </select>
              </div>
              <div className="form-group">
                <label>Wilayah / RW</label>
                <input type="text" placeholder='Contoh: Jl. Anyelir 2 RT 02/RW 14' value={wilayah} onChange={(e) => setWilayah(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Nomor SK</label>
                <input type="text" placeholder='Masukan No. Sk'value={noSk} onChange={(e) => setNoSk(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Upload SK (PDF/Gambar)</label>
                <input id="fileInput" type="file" accept=".pdf, image/*" onChange={(e) => setFileSk(e.target.files[0])} required />
                {/* TEKS PERINGATAN 5MB DITAMBAHKAN DI SINI */}
                <small style={{ color: '#ef4444', marginTop: '6px', display: 'block', fontWeight: 'bold' }}>
                    *Ukuran file maksimal 5 MB
                </small>
              </div>
              <button type="submit" className="btn-simpan">Simpan Data</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};