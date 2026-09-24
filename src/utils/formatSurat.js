export const FORMAT_SURAT = {
    "RUTILAHU": {
        judul: "SURAT KETERANGAN REKOMENDASI RUTILAHU",
        kodeFormat: "400", // Contoh kode klasifikasi surat (bisa disesuaikan dengan kelurahan)
        redaksiTengah: (jenisLayanan) => 
            `Bahwa nama tersebut di atas benar merupakan warga Kelurahan Pasteur yang mengajukan permohonan layanan Bantuan Perbaikan Rumah Tidak Layak Huni (RUTILAHU) melalui Sistem Informasi ONE EKBANG.`
    },
    "POHON TUMBANG": {
        judul: "SURAT PENGANTAR PENANGANAN POHON TUMBANG",
        kodeFormat: "660", 
        redaksiTengah: (jenisLayanan) => 
            `Bahwa warga tersebut di atas telah melaporkan permohonan penanganan/pemangkasan Pohon Tumbang/Rindang melalui Sistem Informasi ONE EKBANG agar dapat segera ditindaklanjuti.`
    },
    "BURUAN SAE": {
        judul: "SURAT KETERANGAN PROGRAM BURUAN SAE",
        kodeFormat: "520",
        redaksiTengah: (jenisLayanan) => 
            `Bahwa warga/kelompok tersebut di atas benar mengajukan permohonan layanan dan pendaftaran Program Ketahanan Pangan Buruan Sae melalui Sistem Informasi ONE EKBANG.`
    },
    "MUSRENBANG": {
        judul: "SURAT PENGANTAR USULAN MUSRENBANG",
        kodeFormat: "050",
        redaksiTengah: (jenisLayanan) => 
            `Bahwa perwakilan warga tersebut di atas telah menyerahkan berkas kelengkapan administrasi untuk usulan Musyawarah Perencanaan Pembangunan (Musrenbang) melalui Sistem Informasi ONE EKBANG.`
    },
    "DAU DAN PRAKARSA": {
        judul: "SURAT KETERANGAN USULAN DAU & PRAKARSA",
        kodeFormat: "900",
        redaksiTengah: (jenisLayanan) => 
            `Bahwa perwakilan warga tersebut di atas mengajukan kelengkapan usulan kegiatan yang bersumber dari Dana Alokasi Umum (DAU) dan Prakarsa Masyarakat melalui Sistem Informasi ONE EKBANG.`
    },
    "SARPRAS DLH": {
        judul: "SURAT PENGANTAR PENGAJUAN SARPRAS DLH",
        kodeFormat: "660", // 660 adalah kode surat birokrasi umum untuk Lingkungan Hidup
        redaksiTengah: (jenisLayanan) => 
            `Bahwa warga/kelompok tersebut di atas mengajukan permohonan bantuan Sarana dan Prasarana (Sarpras) Dinas Lingkungan Hidup melalui Sistem Informasi ONE EKBANG guna mendukung kawasan bebas sampah di Kelurahan Pasteur.`
    },
    // Cadangan jika sewaktu-waktu ada layanan yang tidak terdaftar
    "DEFAULT": {
        judul: "SURAT KETERANGAN PENGAJUAN LAYANAN",
        kodeFormat: "000",
        redaksiTengah: (jenisLayanan) => 
            `Bahwa nama tersebut di atas benar warga Kelurahan Pasteur yang telah mengajukan permohonan layanan ${jenisLayanan} melalui Sistem Informasi Tata Kelola Ekbang (ONE EKBANG).`
    }
};