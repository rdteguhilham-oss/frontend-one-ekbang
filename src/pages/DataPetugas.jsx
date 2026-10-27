import { useState, useEffect, useRef } from 'react';
import './DataPetugas.css';
import Swal from 'sweetalert2';
import { getPetugas, tambahPetugas, updatePetugas, updateStatusPetugas, hapusPetugas, BASE_URL } from '../services/api';

export default function DataPetugas () {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [petugasList, setPetugasList] = useState([]);
  const [kataKunci, setKataKunci] = useState('');
  const [namaPetugas, setNamaPetugas] = useState('');
  const [kategoriPetugas, setKategoriPetugas] = useState('');
  const [wilayah, setWilayah] = useState('');
  const [noSk, setNoSk] = useState('');
  const [fileSk, setFileSk] = useState(null);
  const fileInputRef = useRef(null);
  const [loadingSimpan, setLoadingSimpan] = useState(false);
  // STATE UNTUK EDIT PETUGAS
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editNamaPetugas, setEditNamaPetugas] = useState('');
  const [editKategoriPetugas, setEditKategoriPetugas] = useState('');
  const [editWilayah, setEditWilayah] = useState('');
  const [editNoSk, setEditNoSk] = useState('');
  const [editFileSk, setEditFileSk] = useState(null);
  const [existingFileSk, setExistingFileSk] = useState(null);
  const editFileInputRef = useRef(null);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [editStatusPetugas, setEditStatusPetugas] = useState('Aktif');

  const fetchPetugas = async () => {
    try {
      const data = await getPetugas();
      setPetugasList(data);
    } catch {
      Swal.fire({ title: 'Gagal Memuat Petugas', text: 'Koneksi ke server terputus.', icon: 'error' });
    }
  };

  useEffect(() => {
    fetchPetugas();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingSimpan(true);

    const formData = new FormData();
    formData.append('nama_petugas', namaPetugas);
    formData.append('kategori_petugas', kategoriPetugas);
    formData.append('wilayah', wilayah);
    formData.append('no_sk', noSk);
    formData.append('file_sk', fileSk);

    try {
      const result = await tambahPetugas(formData);
      if (result.status === 'sukses') {
        Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Data Petugas berhasil disimpan!', confirmButtonColor: '#3C50E0' });
        fetchPetugas();
        setNamaPetugas('');
        setKategoriPetugas('');
        setWilayah('');
        setNoSk('');
        setFileSk(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        
        setIsModalOpen(false);
      } else {
        Swal.fire({ icon: 'error', title: 'Gagal!', text: result.pesan || 'Gagal menyimpan data petugas.', confirmButtonColor: '#3C50E0' });
      }
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Terjadi kesalahan sistem saat menyimpan data petugas.', confirmButtonColor: '#3C50E0' });
    } finally {
      setLoadingSimpan(false);
    }
  };

  const bukaModalEdit = (petugas) => {
    setEditId(petugas.id);
    setEditNamaPetugas(petugas.nama_petugas || '');
    setEditKategoriPetugas(petugas.kategori_petugas || '');
    setEditWilayah(petugas.wilayah || '');
    setEditNoSk(petugas.no_sk || '');
    setEditStatusPetugas(petugas.status || 'Aktif');
    setEditFileSk(null);
    setExistingFileSk(petugas.file_sk || null);
    if (editFileInputRef.current) editFileInputRef.current.value = '';
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoadingEdit(true);

    const formData = new FormData();
    formData.append('nama_petugas', editNamaPetugas);
    formData.append('kategori_petugas', editKategoriPetugas);
    formData.append('wilayah', editWilayah);
    formData.append('no_sk', editNoSk);
    formData.append('status', editStatusPetugas);
    if (editFileSk) {
      formData.append('file_sk', editFileSk);
    }

    try {
      const result = await updatePetugas(editId, formData);
      if (result.status === 'sukses') {
        Swal.fire({
          title: 'Berhasil!',
          text: result.pesan || 'Data Petugas berhasil diperbarui!',
          icon: 'success',
          confirmButtonColor: '#3C50E0'
        });
        fetchPetugas();
        setIsEditModalOpen(false);
      } else {
        Swal.fire({
          title: 'Gagal!',
          text: result.pesan || 'Gagal memperbarui data petugas.',
          icon: 'error'
        });
      }
    } catch {
      Swal.fire({
        title: 'Error',
        text: 'Terjadi kesalahan sistem saat memperbarui data petugas.',
        icon: 'error'
      });
    } finally {
      setLoadingEdit(false);
    }
  };

  const handleToggleStatus = async (id, statusBaru, nama) => {
    try {
      const res = await updateStatusPetugas(id, statusBaru);
      if (res.status === 'sukses') {
        Swal.fire({
          title: 'Status Diperbarui!',
          text: `Status petugas "${nama}" berhasil diubah menjadi ${statusBaru}.`,
          icon: 'success',
          confirmButtonColor: '#3C50E0'
        });
        fetchPetugas();
      } else {
        Swal.fire({
          title: 'Gagal',
          text: res.pesan || 'Gagal mengubah status petugas.',
          icon: 'error'
        });
      }
    } catch {
      Swal.fire({
        title: 'Error',
        text: 'Terjadi kesalahan saat menghubungi server.',
        icon: 'error'
      });
    }
  };

  const handleHapusPetugas = (id, nama) => {
    Swal.fire({
      title: 'Hapus Petugas?',
      text: `Apakah Anda yakin ingin menghapus data petugas "${nama}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await hapusPetugas(id);
          if (res.status === 'sukses') {
            Swal.fire({
              title: 'Terhapus!',
              text: res.pesan || 'Data Petugas berhasil dihapus.',
              icon: 'success',
              confirmButtonColor: '#3C50E0'
            });
            fetchPetugas();
          } else {
            // Jika ada riwayat laporan harian -> beri opsi langsung nonaktifkan petugas!
            Swal.fire({
              title: 'Petugas Memiliki Riwayat Kerja',
              text: res.pesan || 'Petugas ini tercatat pada laporan kegiatan harian. Anda dapat menonaktifkan statusnya agar tidak muncul di laporan baru tanpa menghilangkan riwayat kerjanya.',
              icon: 'info',
              showCancelButton: true,
              confirmButtonColor: '#f59e0b',
              cancelButtonColor: '#64748b',
              confirmButtonText: 'Nonaktifkan Petugas Saja',
              cancelButtonText: 'Tutup'
            }).then(async (pilihan) => {
              if (pilihan.isConfirmed) {
                await handleToggleStatus(id, 'Non-Aktif', nama);
              }
            });
          }
        } catch {
          Swal.fire({
            title: 'Error',
            text: 'Terjadi kesalahan saat menghubungi server.',
            icon: 'error'
          });
        }
      }
    });
  };

  const hasilFilter = petugasList.filter((petugas) => {
    const teksCari = kataKunci.toLowerCase().trim();
    if (!teksCari) return true;
    return (
      (petugas.nama_petugas && petugas.nama_petugas.toLowerCase().includes(teksCari)) ||
      (petugas.kategori_petugas && petugas.kategori_petugas.toLowerCase().includes(teksCari)) ||
      (petugas.wilayah && petugas.wilayah.toLowerCase().includes(teksCari)) ||
      (petugas.no_sk && String(petugas.no_sk).toLowerCase().includes(teksCari))
    );
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
                <label>Cari Data Petugas:</label>
                <input 
                    type="text" 
                    placeholder="Ketik nama, kategori, wilayah, atau no SK..." 
                    value={kataKunci}
                    onChange={(e) => setKataKunci(e.target.value)}
                />
            </div>
        </div>
        <div className="table-responsive">
            <table className="tabel-utama">
            <thead>
                <tr>
                <th className="kolom-no-petugas">No</th>
                <th className="kolom-nama-petugas">Nama Petugas</th>
                <th className="kolom-kategori-petugas">Kategori</th>
                <th className="kolom-wilayah-petugas">Wilayah</th>
                <th className="kolom-nosk-petugas">No. SK</th>
                <th className="kolom-filesk-petugas">File SK</th>
                <th className="kolom-status-petugas">Status</th>
                <th className="kolom-aksi-petugas">Aksi</th>
                </tr>
            </thead>
            <tbody>
                {hasilFilter.length > 0 ? (
                hasilFilter.map((petugas, index) => (
                    <tr key={petugas.id}>
                    <td className="kolom-no-petugas">{index + 1}</td>
                    <td className="kolom-nama-petugas">{petugas.nama_petugas}</td>
                    <td className="kolom-kategori-petugas">{petugas.kategori_petugas}</td>
                    <td className="kolom-wilayah-petugas">{petugas.wilayah}</td>
                    <td className="kolom-nosk-petugas">{petugas.no_sk || '-'}</td>
                    <td className="kolom-filesk-petugas">
                        {petugas.file_sk ? (
                          <a href={petugas.file_sk.startsWith('http') ? petugas.file_sk : `${BASE_URL}/uploads/${petugas.file_sk}`} target="_blank" rel="noreferrer" className="btn-lihat">
                            Lihat SK
                          </a>
                        ) : '-'}
                    </td>
                    <td className="kolom-status-petugas" style={{ verticalAlign: 'middle' }}>
                      <span className={`badge-petugas-status ${petugas.status === 'Non-Aktif' ? 'badge-nonaktif' : 'badge-aktif'}`}>
                        {petugas.status || 'Aktif'}
                      </span>
                    </td>
                    <td className="kolom-aksi-petugas" style={{ verticalAlign: 'middle' }}>
                      <div className="grup-aksi-petugas">
                        <button className="btn-edit-petugas" onClick={() => bukaModalEdit(petugas)} title="Edit Data Petugas">
                          ✏️ Edit
                        </button>
                        {petugas.status === 'Non-Aktif' ? (
                          <button 
                            className="btn-status-toggle btn-aktifkan" 
                            onClick={() => handleToggleStatus(petugas.id, 'Aktif', petugas.nama_petugas)}
                            title="Aktifkan Kembali Petugas"
                          >
                            ✅ Aktifkan
                          </button>
                        ) : (
                          <button 
                            className="btn-status-toggle btn-nonaktifkan" 
                            onClick={() => handleToggleStatus(petugas.id, 'Non-Aktif', petugas.nama_petugas)}
                            title="Nonaktifkan Petugas (Purna Tugas)"
                          >
                            ⛔ Nonaktifkan
                          </button>
                        )}
                        <button className="btn-hapus-petugas" onClick={() => handleHapusPetugas(petugas.id, petugas.nama_petugas)} title="Hapus Petugas">
                          🗑️ Hapus
                        </button>
                      </div>
                    </td>
                    </tr>
                ))
                ) : (
                <tr>
                    <td colSpan="8" className="text-center">Belum ada data petugas.</td>
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
                <input type="text" placeholder='Masukan No. Sk' value={noSk} onChange={(e) => setNoSk(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Upload SK (PDF/Gambar)</label>
                <input ref={fileInputRef} type="file" accept=".pdf, image/*" onChange={(e) => setFileSk(e.target.files[0])} required />
                <small style={{ color: '#ef4444', marginTop: '6px', display: 'block', fontWeight: 'bold' }}>
                    *Ukuran file maksimal 5 MB
                </small>
              </div>
              <button type="submit" className="btn-simpan" disabled={loadingSimpan} style={loadingSimpan ? { opacity: 0.7, cursor: 'not-allowed' } : {}}>{loadingSimpan ? '⏳ Menyimpan Data...' : 'Simpan Data'}</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT PETUGAS */}
      {isEditModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="btn-tutup-modal" onClick={() => setIsEditModalOpen(false)}>✕</button>
            
            <h3 style={{ marginTop: '0', marginBottom: '20px' }}>✏️ Edit Data Petugas</h3>
            
            <form onSubmit={handleEditSubmit} className="petugas-form">
              <div className="form-group">
                <label>Nama Petugas</label>
                <input 
                  type="text" 
                  placeholder='Contoh: Bpk. Budi' 
                  value={editNamaPetugas} 
                  onChange={(e) => setEditNamaPetugas(e.target.value)} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Kategori Petugas</label>
                <select value={editKategoriPetugas} onChange={(e) => setEditKategoriPetugas(e.target.value)} required>
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
                <input 
                  type="text" 
                  placeholder='Contoh: Jl. Anyelir 2 RT 02/RW 14' 
                  value={editWilayah} 
                  onChange={(e) => setEditWilayah(e.target.value)} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Nomor SK</label>
                <input 
                  type="text" 
                  placeholder='Masukan No. Sk' 
                  value={editNoSk} 
                  onChange={(e) => setEditNoSk(e.target.value)} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Status Petugas</label>
                <select value={editStatusPetugas} onChange={(e) => setEditStatusPetugas(e.target.value)} required>
                  <option value="Aktif">Aktif (Bertugas)</option>
                  <option value="Non-Aktif">Non-Aktif (Purna Tugas)</option>
                </select>
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Ganti File SK (Opsional)</label>
                {existingFileSk && (
                  <div style={{ marginBottom: '8px' }}>
                    <small style={{ color: 'var(--text-redup)', display: 'block', marginBottom: '4px' }}>SK Terdaftar Saat Ini:</small>
                    <a 
                      href={existingFileSk.startsWith('http') ? existingFileSk : `${BASE_URL}/uploads/${existingFileSk}`} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="btn-lihat"
                      style={{ display: 'inline-block' }}
                    >
                      📄 Lihat SK Saat Ini
                    </a>
                  </div>
                )}
                <input 
                  ref={editFileInputRef} 
                  type="file" 
                  accept=".pdf, image/*" 
                  onChange={(e) => setEditFileSk(e.target.files[0])} 
                />
                <small style={{ color: 'var(--text-redup)', marginTop: '6px', display: 'block' }}>
                  *Biarkan kosong jika tidak ingin mengubah file SK yang ada
                </small>
              </div>

              <div className="modal-edit-petugas-actions">
                <button type="button" className="btn-batal-modal" onClick={() => setIsEditModalOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="btn-simpan-modal" disabled={loadingEdit}>
                  {loadingEdit ? '⏳ Menyimpan...' : '💾 Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}