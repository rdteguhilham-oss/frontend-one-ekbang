import Swal from "sweetalert2";

// URL Backend API: Prioritaskan VITE_API_BASE_URL dari .env jika ada, default ke http://localhost:5000
export const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// 1. Tambahkan gembok penahan di luar fungsi
let sedangLogout = false; 

// MESIN DETEKTOR AUTO-LOGOUT
const tanganiRespons = async (respons) => {
    if (respons.status === 401 || respons.status === 403) {
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("token");
        
        // 2. Cek apakah gembok masih terbuka
        if (!sedangLogout) {
            sedangLogout = true; // Kunci gemboknya agar API lain yang gagal tidak memicu popup lagi
            
            // 3. Gunakan await seperti tebakanmu!
            await Swal.fire({
                title: 'Sesi Berakhir!',
                text: 'Sesi login Anda telah habis demi keamanan. Silakan login kembali.',
                icon: 'warning',
                confirmButtonColor: '#f59e0b'
            });

            // 4. Baris ini baru akan berjalan SETELAH kamu menekan tombol OK
            window.location.href = `${import.meta.env.BASE_URL}login`; 
        }
        
        return Promise.reject("Sesi Habis"); 
    }

    const text = await respons.text();
    try {
        return JSON.parse(text);
    } catch {
        if (!respons.ok) {
            throw new Error(text || `Permintaan gagal dengan status ${respons.status}`);
        }
        return text;
    }
};

const parsePublicJson = async (response) => {
    const text = await response.text();
    try {
        return JSON.parse(text);
    } catch {
        return { 
            status: "error", 
            pesan: text || `Terjadi kesalahan pada server (Status ${response.status})` 
        };
    }
};

export const getDataAdmin = async () => {
    try {
        const respons = await fetch(`${BASE_URL}/admin`, {
            headers: { ...getAuthHeader() } 
        });
        const res = await tanganiRespons(respons);
        return Array.isArray(res) ? res : [];
    } catch (error) {
        console.error('Gagal mengambil data admin:', error);
        throw error;
    }
};

export const tambahAdmin = async (dataAdmin) => {
    try {
        const response = await fetch(`${BASE_URL}/admin`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                ...getAuthHeader() 
            },
            body: JSON.stringify(dataAdmin)
        });
        return await tanganiRespons(response);
    } catch (error) {
        console.error("Gagal menambah admin:", error);
        throw error;
    }
};

export const hapusAdmin = async (id) => {
    try {
        const response = await fetch(`${BASE_URL}/admin/${id}`, {
            method: 'DELETE',
            headers: { ...getAuthHeader() }
        });
        return await tanganiRespons(response);
    } catch (error) {
        console.error("Gagal menghapus admin:", error);
        throw error;
    }
};

export const getDataLayanan = async () => {
    try {
        const respons = await fetch(`${BASE_URL}/layanan`, {
            headers: { ...getAuthHeader() }
        });
        const hasil = await tanganiRespons(respons);
        return (hasil && Array.isArray(hasil.data)) ? hasil.data : [];
    } catch (error) {
        console.error('Gagal mengambil data layanan:', error);
        throw error; 
    }
};

// Warga Tambah Layanan (Jalur Publik - Tidak pakai tanganiRespons)
export const tambahLayanan = async (dataPaket) => {
    try {
        const isFormData = dataPaket instanceof FormData;
        const pengaturanFetch = {
            method: "POST",
            headers: { ...getAuthHeader() },
            body: isFormData ? dataPaket : JSON.stringify(dataPaket)
        };

        if (!isFormData) {
            pengaturanFetch.headers['Content-Type'] = 'application/json';
        }

        const response = await fetch(`${BASE_URL}/layanan`, pengaturanFetch);
        return await parsePublicJson(response);
    } catch (error) {
        console.error("Gagal mengirim data:", error);
        throw error; 
    }
};

export const updateStatusLayanan = async (id, status) => {
    try {
        let response = await fetch(`${BASE_URL}/layanan/${id}/status`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify({ status: status })
        });

        // Fallback jika backend lawas belum memiliki sub-rute /status
        if (response.status === 404) {
            response = await fetch(`${BASE_URL}/layanan/${id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
                body: JSON.stringify({ status: status })
            });
        }

        return await tanganiRespons(response);
    } catch (error) {
        console.error("Gagal update status:", error);
        throw error;
    }
};

export const updateDataLayanan = async (id, dataEdit) => {
    try {
        const isFormData = dataEdit instanceof FormData;
        const config = {
            method: 'PUT',
            headers: { ...getAuthHeader() },
            body: isFormData ? dataEdit : JSON.stringify(dataEdit)
        };
        if (!isFormData) {
            config.headers['Content-Type'] = 'application/json';
        }
        const response = await fetch(`${BASE_URL}/layanan/${id}`, config);
        return await tanganiRespons(response);
    } catch (error) {
        console.error("Gagal memperbarui data layanan:", error);
        throw error; 
    }
};

export const hapusLayanan = async (id) => {
    try {
        const response = await fetch(`${BASE_URL}/layanan/${id}`, {
            method: 'DELETE',
            headers: { ...getAuthHeader() }
        });
        return await tanganiRespons(response);
    } catch (error) {
        console.error("Gagal menghapus data layanan:", error);
        throw error;
    }
};

// Login (Jalur Publik - Tidak pakai tanganiRespons)
export const loginAdmin = async (username, password) => {
    try {
        const response = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: username, password: password })
        });
        return await parsePublicJson(response); 
    } catch (error) {
        console.error("Gagal melakukan login (Koneksi Mati):", error);
        throw error; 
    }
};

export const getPetugas = async () => {
    try {
        const response = await fetch(`${BASE_URL}/petugas`, {
            headers: { ...getAuthHeader() }
        });
        const res = await tanganiRespons(response);
        return Array.isArray(res) ? res : [];
    } catch (error) {
        console.error("Gagal mengambil data petugas:", error);
        throw error;
    }
};

export const tambahPetugas = async (formData) => {
    try {
        const response = await fetch(`${BASE_URL}/petugas`, {
            method: 'POST',
            headers: { ...getAuthHeader() },
            body: formData, 
        });
        return await tanganiRespons(response);
    } catch (error) {
        console.error("Gagal menyimpan data petugas:", error);
        throw error;
    }
};

export const updatePetugas = async (id, formData) => {
    try {
        const response = await fetch(`${BASE_URL}/petugas/${id}`, {
            method: 'PUT',
            headers: { ...getAuthHeader() },
            body: formData, 
        });
        return await tanganiRespons(response);
    } catch (error) {
        console.error("Gagal memperbarui data petugas:", error);
        throw error;
    }
};

export const hapusPetugas = async (id) => {
    try {
        const response = await fetch(`${BASE_URL}/petugas/${id}`, {
            method: 'DELETE',
            headers: { ...getAuthHeader() }
        });
        return await tanganiRespons(response);
    } catch (error) {
        console.error("Gagal menghapus data petugas:", error);
        throw error;
    }
};

export const updateStatusPetugas = async (id, status) => {
    try {
        const response = await fetch(`${BASE_URL}/petugas/${id}/status`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                ...getAuthHeader() 
            },
            body: JSON.stringify({ status })
        });
        return await tanganiRespons(response);
    } catch (error) {
        console.error("Gagal mengubah status petugas:", error);
        throw error;
    }
};

export const getKegiatanGober = async () => {
    try {
        const response = await fetch(`${BASE_URL}/kegiatan-gober`, {
            headers: { ...getAuthHeader() }
        });
        const res = await tanganiRespons(response);
        return Array.isArray(res) ? res : [];
    } catch (error) {
        console.error("Gagal mengambil data Gober:", error);
        throw error;
    }
};

export const tambahKegiatanGober = async (formData) => {
    try {
        const response = await fetch(`${BASE_URL}/kegiatan-gober`, {
            method: 'POST',
            headers: { ...getAuthHeader() },
            body: formData, 
        });
        return await tanganiRespons(response);
    } catch (error) {
        console.error("Gagal menyimpan data Gober:", error);
        throw error;
    }
};

export const updateKegiatanGober = async (id, formData) => {
    try {
        const response = await fetch(`${BASE_URL}/kegiatan-gober/${id}`, {
            method: 'PUT',
            headers: { ...getAuthHeader() },
            body: formData, 
        });
        return await tanganiRespons(response);
    } catch (error) {
        console.error("Gagal memperbarui data Gober:", error);
        throw error;
    }
};

export const hapusKegiatanGober = async (id) => {
    try {
        const response = await fetch(`${BASE_URL}/kegiatan-gober/${id}`, {
            method: 'DELETE',
            headers: { ...getAuthHeader() }
        });
        return await tanganiRespons(response);
    } catch (error) {
        console.error("Gagal menghapus data Gober:", error);
        throw error;
    }
};

export const getKegiatanSampah = async () => {
    try {
        const response = await fetch(`${BASE_URL}/kegiatan-sampah`, {
            headers: { ...getAuthHeader() }
        });
        const res = await tanganiRespons(response);
        return Array.isArray(res) ? res : [];
    } catch (error) {
        console.error("Gagal mengambil data Sampah:", error);
        throw error;
    }
};

export const tambahKegiatanSampah = async (formData) => {
    try {
        const response = await fetch(`${BASE_URL}/kegiatan-sampah`, {
            method: 'POST',
            headers: { ...getAuthHeader() }, 
            body: formData, 
        });
        return await tanganiRespons(response);
    } catch (error) {
        console.error("Gagal menyimpan data Sampah:", error);
        throw error;
    }
};

export const updateKegiatanSampah = async (id, formData) => {
    try {
        const response = await fetch(`${BASE_URL}/kegiatan-sampah/${id}`, {
            method: 'PUT',
            headers: { ...getAuthHeader() }, 
            body: formData, 
        });
        return await tanganiRespons(response);
    } catch (error) {
        console.error("Gagal memperbarui data Sampah:", error);
        throw error;
    }
};

export const hapusKegiatanSampah = async (id) => {
    try {
        const response = await fetch(`${BASE_URL}/kegiatan-sampah/${id}`, {
            method: 'DELETE',
            headers: { ...getAuthHeader() }
        });
        return await tanganiRespons(response);
    } catch (error) {
        console.error("Gagal menghapus data Sampah:", error);
        throw error;
    }
};

export const getKegiatanAgenda = async () => {
    try {
        const response = await fetch(`${BASE_URL}/kegiatan-agenda`, {
            headers: { ...getAuthHeader() }
        });
        const res = await tanganiRespons(response);
        return Array.isArray(res) ? res : [];
    } catch (error) {
        console.error("Gagal mengambil data agenda:", error);
        throw error;
    }
};

export const tambahKegiatanAgenda = async (formData) => {
    try {
        const response = await fetch(`${BASE_URL}/kegiatan-agenda`, {
            method: 'POST',
            headers: { ...getAuthHeader() },
            body: formData, 
        });
        return await tanganiRespons(response);
    } catch (error) {
        console.error("Gagal menyimpan agenda:", error);
        throw error;
    }
};

export const uploadFotoAgenda = async (id, formData) => {
    try {
        const response = await fetch(`${BASE_URL}/kegiatan-agenda/${id}/foto`, {
            method: 'PUT',
            headers: { ...getAuthHeader() },
            body: formData, 
        });
        return await tanganiRespons(response);
    } catch (error) {
        console.error("Gagal mengunggah foto susulan:", error);
        throw error;
    }
};

export const updateKegiatanAgenda = async (id, formData) => {
    try {
        const response = await fetch(`${BASE_URL}/kegiatan-agenda/${id}`, {
            method: 'PUT',
            headers: { ...getAuthHeader() },
            body: formData,
        });
        return await tanganiRespons(response);
    } catch (error) {
        console.error("Gagal memperbarui agenda kegiatan:", error);
        throw error;
    }
};

export const hapusKegiatanAgenda = async (id) => {
    try {
        const response = await fetch(`${BASE_URL}/kegiatan-agenda/${id}`, {
            method: 'DELETE', 
            headers: { ...getAuthHeader() } 
        });
        return await tanganiRespons(response);
    } catch (error) {
        console.error("Gagal menghapus agenda:", error);
        throw error;
    }
};

export const getTitikPeta = async () => {
    try {
        const response = await fetch(`${BASE_URL}/peta-gis`, {
            headers: { ...getAuthHeader() }
        });
        const res = await tanganiRespons(response);
        return Array.isArray(res) ? res : [];
    } catch (error) {
        console.error("Gagal mengambil data peta:", error);
        throw error;
    }
};

export const tambahTitikPeta = async (formData) => {
    try {
        const response = await fetch(`${BASE_URL}/peta-gis`, {
            method: 'POST',
            headers: { ...getAuthHeader() },
            body: formData, 
        });
        return await tanganiRespons(response);
    } catch (error) {
        console.error("Gagal menyimpan titik peta:", error);
        throw error;
    }
};

export const updateTitikPeta = async (id, formData) => {
    try {
        const response = await fetch(`${BASE_URL}/peta-gis/${id}`, {
            method: 'PUT',
            headers: { ...getAuthHeader() },
            body: formData, 
        });
        return await tanganiRespons(response);
    } catch (error) {
        console.error("Gagal memperbarui titik peta:", error);
        throw error;
    }
};

export const updateStatusPeta = async (id, statusBaru) => {
    try {
        const response = await fetch(`${BASE_URL}/peta-gis/${id}/status`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                ...getAuthHeader() 
            },
            body: JSON.stringify({ status: statusBaru })
        });
        return await tanganiRespons(response);
    } catch (error) {
        throw error;
    }
};

export const hapusTitikPeta = async (id) => {
    try {
        const response = await fetch(`${BASE_URL}/peta-gis/${id}`, {
            method: 'DELETE', 
            headers: { ...getAuthHeader() } 
        });
        return await tanganiRespons(response);
    } catch (error) {
        console.error("Gagal menghapus titik peta:", error);
        throw error;
    }
};

// Lupa Password (Jalur Publik - Tidak pakai tanganiRespons)
export const kirimLupaPassword = async (username) => {
    try {
        const response = await fetch(`${BASE_URL}/lupa-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username })
        });
        return await parsePublicJson(response);
    } catch (error) {
        throw error;
    }
};

export const getNotifikasi = async () => {
    try {
        const response = await fetch(`${BASE_URL}/notifikasi`, {
            headers: { ...getAuthHeader() }
        });
        const result = await tanganiRespons(response);
        return (result && Array.isArray(result.data)) ? result.data : []; 
    } catch (error) {
        throw error;
    }
};

export const tandaiNotifikasiDibaca = async (id) => {
    try {
        const response = await fetch(`${BASE_URL}/notifikasi/${id}`, {
            method: 'PUT',
            headers: { ...getAuthHeader() }
        });
        return await tanganiRespons(response);
    } catch (error) {
        throw error;
    }
};
