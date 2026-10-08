import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { loginAdmin, kirimLupaPassword } from "../services/api";
import { FaUser, FaLock, FaEye, FaEyeSlash, FaBuilding, FaClipboardList, FaMapMarkedAlt, FaChartBar, FaTasks } from 'react-icons/fa';
import './Login.css';

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    
    // Memori tambahan untuk fitur Lupa Password
    const [isModalOpen, setIsModalOpen] = useState(false); 
    const [resetUsername, setResetUsername] = useState("");
    
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault(); 
        
        try {
            const respons = await loginAdmin(username, password);

            if (respons && respons.status === 'sukses') {
                await Swal.fire({ 
                    title: 'Success', 
                    text: respons.pesan, 
                    icon: 'success', 
                    confirmButtonColor: '#0a58ca' });
                localStorage.setItem("isLoggedIn","true");
                localStorage.setItem("token", respons.token);
                navigate("/dashboard"); 
            } else {
                Swal.fire(respons?.pesan || "Login Gagal!");
            }
        } catch (error) {
            Swal.fire("Koneksi ke server gagal! Pastikan server menyala.");
        }
    };

    const handleLupaPassword = async (e) => {
        e.preventDefault();
        try {
            const result = await kirimLupaPassword(resetUsername);
            if (result.status === 'sukses') {
                Swal.fire(result.pesan);
                setIsModalOpen(false); 
                setResetUsername(""); 
            } else {
                Swal.fire("Gagal: " + result.pesan);
            }
        } catch (error) {
            Swal.fire("Koneksi ke server gagal saat mengirim permintaan.");
        }
    };

    return (
        <div className="login-v2-wrapper" style={{ backgroundImage: 'url(/bg-city.jpg)' }}>
            <div className="login-v2-overlay">
                
                {/* LOGO ATAS */}
                <div className="login-v2-logo">
                    <img src="/logo-one-ekbang.jpg" alt="ONE EKBANG" />
                </div>

                {/* FORM UTAMA */}
                <div className="login-v2-card">
                    <div className="login-v2-icon-top">
                        <FaBuilding />
                    </div>
                    <h2>Dashboard Internal</h2>
                    <p>Akses untuk seluruh pegawai Kelurahan Pasteur</p>

                    <form onSubmit={handleLogin} className="login-v2-form">
                        <div className="input-group-v2">
                            <FaUser className="input-icon-left" />
                            <input 
                                type="text" 
                                placeholder="Username / NIP"
                                value={username} 
                                onChange={(e) => setUsername(e.target.value)} 
                                required 
                            />
                        </div>
                        
                        <div className="input-group-v2">
                            <FaLock className="input-icon-left" />
                            <input 
                                type={showPassword ? "text" : "password"} 
                                placeholder="Password"
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                required 
                            />
                            <button type="button" className="btn-toggle-pass" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>

                        <div className="login-v2-options">
                            <label className="checkbox-ingat">
                                <input type="checkbox" defaultChecked />
                                Ingat saya
                            </label>
                            <span className="link-lupa-v2" onClick={() => setIsModalOpen(true)}>
                                Lupa password?
                            </span>
                        </div>

                        <button type="submit" className="btn-login-v2">
                            ➜ Masuk sebagai Pegawai
                        </button>
                    </form>
                </div>

                {/* FLOATING MENU BAWAH */}
                <div className="login-v2-floating-menu">
                    <div className="floating-item">
                        <FaClipboardList className="floating-icon" />
                        <span>Kelola Data<br/>Ekbang</span>
                    </div>
                    <div className="floating-item">
                        <FaTasks className="floating-icon" />
                        <span>Monitoring<br/>Kegiatan</span>
                    </div>
                    <div className="floating-item">
                        <FaMapMarkedAlt className="floating-icon" />
                        <span>Pemetaan<br/>Wilayah</span>
                    </div>
                    <div className="floating-item">
                        <FaChartBar className="floating-icon" />
                        <span>Laporan &<br/>Evaluasi</span>
                    </div>
                </div>

            </div>

            {/* KOTAK POP-UP (MODAL) LUPA PASSWORD */}
            {isModalOpen && (
                <div className="login-modal-overlay">
                    <div className="login-modal-content">
                        <button className="btn-tutup-modal" onClick={() => setIsModalOpen(false)}>X</button>
                        
                        <h3 style={{ marginTop: 0, color: '#1e293b' }}>Lupa Password?</h3>
                        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>
                            Masukkan username Anda. Sistem akan mengirimkan notifikasi ke Master Admin untuk mereset password akun Anda.
                        </p>
                        
                        <form onSubmit={handleLupaPassword}>
                            <input 
                                type="text" 
                                className="input-login-v2-modal"
                                placeholder="Masukkan username Anda..." 
                                value={resetUsername}
                                onChange={(e) => setResetUsername(e.target.value)}
                                required
                            />
                            <button type="submit" className="btn-login-v2 mt-3">Kirim Permintaan Reset</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}