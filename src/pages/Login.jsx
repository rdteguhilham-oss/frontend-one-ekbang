import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { loginAdmin, kirimLupaPassword } from "../services/api";
import logoBandung from "../assets/logo-bandung.jpg"; 
import { FaUser, FaKey, FaSignInAlt } from "react-icons/fa"; // Memanggil ikon
import './Login.css';

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
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
                    confirmButtonColor: '#2980b9' 
                });
                localStorage.setItem("isLoggedIn","true");
                localStorage.setItem("token", respons.token);
                navigate("/admin"); 
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
        <div className="login-wrapper-portal">
            
            <div className="login-card-portal">
                
                {/* HEADER LOGO ALA PORTAL */}
                <div className="portal-logo-area">
                    <img src={logoBandung} alt="Logo Bandung" className="portal-logo-img" />
                    <div className="portal-logo-text">
                        <h1>ONE EKBANG</h1>
                        <p>TATA KELOLA KELURAHAN</p>
                    </div>
                </div>

                <p className="portal-subtext">Silakan masuk ke Panel Admin</p>

                <form onSubmit={handleLogin}>
                    
                    {/* INPUT USERNAME BER-IKON */}
                    <div className="input-group-portal">
                        <span className="input-icon-portal">
                            <FaUser />
                        </span>
                        <input 
                            type="text" 
                            className="input-field-portal"
                            placeholder="Username.."
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            required 
                        />
                    </div>
                    
                    {/* INPUT PASSWORD BER-IKON */}
                    <div className="input-group-portal">
                        <span className="input-icon-portal">
                            <FaKey />
                        </span>
                        <input 
                            type="password" 
                            className="input-field-portal"
                            placeholder="Password.."
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                        />
                    </div>

                    <span className="link-forgot-portal" onClick={() => setIsModalOpen(true)}>
                        Lupa Password?
                    </span>

                    <button type="submit" className="btn-login-portal">
                        <FaSignInAlt /> Login
                    </button>
                </form>
            </div>

            {/* MODAL LUPA PASSWORD */}
            {isModalOpen && (
                <div className="login-modal-overlay">
                    <div className="login-modal-content">
                        <button className="btn-tutup-modal" onClick={() => setIsModalOpen(false)}>X</button>
                        
                        <h3 style={{ marginTop: 0, color: 'var(--text-utama)' }}>Lupa Password?</h3>
                        <p style={{ color: 'var(--text-redup)', fontSize: '14px', marginBottom: '20px' }}>
                            Masukkan username Anda. Sistem akan mengirimkan notifikasi ke Master Admin untuk mereset password akun Anda.
                        </p>
                        
                        <form onSubmit={handleLupaPassword}>
                            <input 
                                type="text" 
                                className="input-field-portal"
                                style={{ border: '1px solid #cbd5e1', marginBottom: '15px' }}
                                placeholder="Masukkan username Anda..." 
                                value={resetUsername}
                                onChange={(e) => setResetUsername(e.target.value)}
                                required
                            />
                            <button type="submit" className="btn-login-portal">Kirim Permintaan Reset</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}