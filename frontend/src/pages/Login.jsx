import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import loginImg from "../assets/login-img.png";
import logo from "../assets/logo.svg";
import { login } from "../services/api";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    const response = await fetch("http://127.0.0.1:8000/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: form.email,
        password: form.password,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Identifiants incorrects");
    }

    // Stockage du token et de l'utilisateur
    login(result.user, result.access_token, form.remember);

    //  REDIRECTION DYNAMIQUE SELON LE RÔLE
    const role_id = result.user.role_id;
    if (role_id === 1) {
      navigate("/employee-dashboard");
    } else if (role_id === 2) {
      navigate("/manager-dashboard");
    } else if (role_id === 3) {
      navigate("/technician-dashboard");
    } else if (role_id === 4) {
      navigate("/admin-users");
    } else {
      navigate("/employee-dashboard");
    }

  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "linear-gradient(135deg, #0a0f1e 0%, #0d1b3e 50%, #0a0f1e 100%)" }}>
      <div className="w-full max-w-4xl rounded-2xl overflow-hidden flex" style={{ background: "#111827", boxShadow: "0 25px 60px rgba(0,0,0,0.6)" }}>
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#0d1b3e] to-[#1a3a8a] flex-col items-center justify-center p-12 relative">
          <div className="absolute -top-10 -right-14 w-48 h-48 bg-blue-500/20 rounded-full" />
          <div className="absolute bottom-8 -left-10 w-40 h-40 bg-blue-500/20 rounded-full" />
          <img src={loginImg} alt="Illustration" className="max-w-full object-contain" />
        </div>

        <div className="flex-1 p-8 sm:p-12 flex flex-col justify-center" style={{ background: "#111827" }}>
          <div className="flex justify-center mb-4">
            <img src={logo} alt="ModulOps" className="w-[250px]" />
          </div>
          <h2 className="text-center text-xl font-bold text-white mb-2">Connexion</h2>
          <p className="text-center text-gray-500 text-sm mb-8">Entrez vos identifiants pour accéder à votre espace</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Adresse e-mail</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-gray-700 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-white"
                style={{ background: "#1f2937" }}
                placeholder="gest.info@gmail.com"
              />
            </div>

            <div>
              <div className="flex justify-between">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mot de passe</label>
                <Link to="/forgot-password" className="text-xs text-blue-600 hover:underline">Mot de passe oublié ?</Link>
              </div>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full border border-gray-700 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-white"
                  style={{ background: "#1f2937" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPwd ? <VisibilityOff /> : <Visibility />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="remember"
                name="remember"
                type="checkbox"
                checked={form.remember}
                onChange={(e) => setForm({ ...form, remember: e.target.checked })}
                className="w-4 h-4 accent-blue-600 cursor-pointer"
              />
              <label htmlFor="remember" className="text-xs text-gray-500 cursor-pointer select-none">
                Se souvenir de moi
              </label>
            </div>

            {error && <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all"
            >
              {loading ? "Connexion..." : "SE CONNECTER"}
            </button>
          </form>

          <p className="text-center text-xs text-gray-600 mt-8">© 2024 ModulOps. Tous droits réservés.</p>
        </div>
      </div>
    </div>
  );
}