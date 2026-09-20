import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { getDataAdmin, tambahAdmin, hapusAdmin, getDataLayanan, getPetugas, getKegiatanAgenda, getNotifikasi, tandaiNotifikasiDibaca } from '../services/api';
import './DaftarAdmin.css'; 

export default function DaftarAdmin() {
  const [dataAdmin, setDataAdmin] = useState([]);
  const [dataNotif, setDataNotif] = useState([]);

  const [totalLayanan, setTotalLayanan] = useState(0);
  const [totalPetugas, setTotalPetugas] = useState(0);
  const [totalAgenda, setTotalAgenda] = useState(0);

  const [nik, setNik] = useState('');
  const [namaLengkap, setNamaLengkap] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const fetchAdmin = async () => {
    try {
      const hasil = await getDataAdmin();
      setDataAdmin(hasil);
    } catch (error) {
      setDataAdmin([]); 
    }
  };

  const fetchStatistik = async () => {
      try {
          const resLayanan = await getDataLayanan();
          setTotalLayanan(resLayanan.length); 

          const resPetugas = await getPetugas();
          setTotalPetugas(resPetugas.length);

          const resAgenda = await getKegiatanAgenda();
          setTotalAgenda(resAgenda.length);
      } catch (error) {
          console.error("Gagal menarik data statistik.");
      }
  };

  const fetchNotifikasi = async () => {
      try {
          const hasil = await getNotifikasi();
          setDataNotif(hasil);
      } catch (error) {
          console.error("Gagal menarik data notifikasi.");
      }
  };

  const handleTandaiDibaca = async (id) => {
      try {
          await tandaiNotifikasiDibaca(id);
          fetchNotifikasi(); // Refresh data notifikasi setelah diklik
      } catch (error) {
          Swal.fire("Gagal memperbarui status notifikasi.");
      }
  };

  useEffect(() => {
    fetchAdmin();
    fetchStatistik(); 
    fetchNotifikasi();
  }, []);

  const handleSubmit = async (e) => {
      e.preventDefault();
      
      const dataBaru = {
          nik: nik,
          nama_lengkap: namaLengkap,
          username: username,
          password: password
      };

      try {
          const result = await tambahAdmin(dataBaru);
          if (result.status === 'sukses') {
              Swal.fire(result.pesan);
              fetchAdmin(); 
              setNik(''); setNamaLengkap(''); setUsername(''); setPassword('');
          } else {
              Swal.fire("Gagal: " + result.pesan);
          }
      } catch (error) {
          Swal.fire("Terjadi kesalahan sistem saat membuat akun.");
      }
    };

    const handleHapus = async (id) => {
        if (dataAdmin.length <= 1) {
            Swal.fire({
                icon: 'error',
                title: 'Akses Ditolak!',
                text: 'Harus ada minimal 1 akun Master Admin yang tersisa agar sistem tidak terkunci.',
                confirmButtonColor: '#3C50E0'
            });
            return; 
        }

        Swal.fire({
            title: 'Cabut Akses Staf?',
            text: "Yakin ingin mencabut akses akun staf ini secara permanen?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Ya, Cabut Akses!',
            cancelButtonText: 'Batal'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const resultApi = await hapusAdmin(id);
                    if (resultApi.status === 'sukses') {
                        Swal.fire({ title: 'Terhapus!', text: resultApi.pesan, icon: 'success', confirmButtonColor: '#3C50E0' });
                        fetchAdmin(); 
                    } else {
                        Swal.fire({ title: 'Gagal!', text: resultApi.pesan, icon: 'error' });
                    }
                } catch (error) {
                    Swal.fire({ title: 'Error', text: "Terjadi kesalahan sistem saat menghapus akun.", icon: 'error' });
                }
            }
        });
    };

  return (
    <div className="admin-container">
      
      {/* JUDUL DASBOR KINI BERDIRI SENDIRI TANPA TOMBOL LOGOUT */}
      <div className="header-admin">
        <h2>Dasbor Utama & Manajemen Akun</h2>
      </div>

      {/* KOTAK NOTIFIKASI LUPA PASSWORD */}
      {dataNotif.length > 0 && (
          <div className="notif-container">
              <h3 className="notif-header">
                  ⚠️ Ada {dataNotif.length} Permintaan Reset Password!
              </h3>
              {dataNotif.map((notif) => (
                  <div key={notif.id} className="notif-item">
                      <span className="notif-text">
                          <strong>{notif.username_staf}</strong> meminta reset password (Dikirim: {new Date(notif.tanggal).toLocaleString('id-ID')})
                      </span>
                      <button 
                          onClick={() => handleTandaiDibaca(notif.id)}
                          className="btn-tandai-selesai"
                      >
                          Tandai Selesai (Hapus Notif)
                      </button>
                  </div>
              ))}
          </div>
      )}
    
      <div className="statistik-container">
          <div className="kartu-statistik">
              <h3>{totalLayanan}</h3>
              <p>Total Pengajuan</p>
          </div>
          <div className="kartu-statistik">
              <h3>{totalPetugas}</h3>
              <p>Total Petugas</p>
          </div>
          <div className="kartu-statistik">
              <h3>{totalAgenda}</h3>
              <p>Agenda Ekbang</p>
          </div>
          <div className="kartu-statistik" style={{borderBottomColor: '#ef4444'}}>
              <h3>{dataAdmin.length}</h3>
              <p>Akun Staf Aktif</p>
          </div>
      </div>
      
      <div className="admin-form-card">
        <h3 style={{marginTop: '0'}}>Buat Akun Staf Baru</h3>
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-group">
            <label>NIK Staf</label>
            <input type="text" placeholder="Masukkan NIK KTP..." value={nik} onChange={(e) => setNik(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Nama Lengkap</label>
            <input type="text" placeholder="Nama sesuai KTP..." value={namaLengkap} onChange={(e) => setNamaLengkap(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Username</label>
            <input type="text" placeholder="Contoh: asep_ekbang" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="Masukkan password rahasia..." value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn-simpan-admin">Buat Akun Sekarang</button>
        </form>
      </div>

      <div className="admin-table-card">
        <h3 style={{marginTop: '0'}}>Daftar Akun Aktif</h3>
        <div className="table-responsive">
            <table className='tabel-utama'>
            <thead>
                <tr>
                <th>ID</th>
                <th>NIK</th>
                <th>Nama Lengkap</th>
                <th>Username</th>
                <th>Status Akses</th>
                <th>Aksi</th>
                </tr>
            </thead>
            <tbody>
                {dataAdmin.map((data) => (
                <tr key={data.id}>
                    <td>{data.id}</td>
                    <td>{data.nik || '-'}</td>
                    <td>{data.nama_lengkap}</td> 
                    <td>{data.username}</td>
                    <td><span className="teks-aktif">Aktif</span></td>
                    <td>
                        <button className="btn-hapus-admin" onClick={() => handleHapus(data.id)}>
                            Hapus Akses
                        </button>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
      </div>

    </div>
  );
}