import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
// ── IMPORT DE L'IMAGE DE LOGIN ───────────────────────────────────────────────────
// Nécessaire pour que React trouve l'image dans le dossier assets
import loginImg from "../assets/login-img.png"; 
// ── IMPORT DES ICÔNES MUI ──────────────────────────────────────────────────────
// On utilise les icônes officielles Material UI qui sont plus propres
import { Visibility, VisibilityOff } from "@mui/icons-material";

// ── CONFIGURATION BACKEND ───────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

// ── LOGO ──────────────────────────────────────────────────────────────────
// Ton logo SVG original, complet et identique à tes maquettes
const ModulOpsLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 650 220" width="100%" height="100%">
    <defs>
      <linearGradient id="boxBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0055ff" />
        <stop offset="100%" stop-color="#10b3ef" />
      </linearGradient>
      <linearGradient id="boxDarkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#040814" />
        <stop offset="100%" stop-color="#111a33" />
      </linearGradient>
      <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#040814" flood-opacity="0.15" />
      </filter>
    </defs>
    <g transform="translate(10, 10)">
      <rect x="10" y="30" width="42" height="115" rx="14" fill="url(#boxBlueGrad)" filter="url(#softShadow)"/>
      <rect x="42" y="32" width="42" height="85" rx="14" transform="rotate(-28 42 32)" fill="url(#boxBlueGrad)"/>
      <rect x="110" y="30" width="42" height="85" rx="14" transform="rotate(28 110 30)" fill="url(#boxDarkGrad)"/>
      <rect x="125" y="30" width="42" height="115" rx="14" fill="url(#boxDarkGrad)" filter="url(#softShadow)"/>
      <circle cx="88" cy="80" r="13" fill="#FFFFFF" filter="url(#softShadow)"/>
      <circle cx="88" cy="80" r="7" fill="#10b3ef"/>
    </g>
    <text x="210" y="112" fontFamily="ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" fontSize="52" letterSpacing="-0.03em">
      <tspan fontWeight="800" fill="#040814">Modul</tspan><tspan fontWeight="300" fill="#0055ff">Ops</tspan>
    </text>
  </svg>
);

// ── COMPOSANT PRINCIPAL ─────────────────────────────────────────────────────
export default function Login() {
  // ── ÉTAT LOCAL DU FORMULAIRE ─────────────────────────────────────────────
  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const [showPwd, setShowPwd] = useState(false); // Afficher/masquer le mot de passe
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // ── CONTEXTE D'AUTHENTIFICATION ──────────────────────────────────────────
  const { login } = useAuth();
  const navigate = useNavigate();

  // ── GESTIONNAIRE DE SOUMISSION ───────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault(); // Empêche le rechargement de la page
    if (!form.email.trim() || !form.password.trim()) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
    setLoading(true);
    try {
      // Appel à l'API Laravel (backend)
      const res = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Identifiants incorrects");
      // Si tout est bon, on stocke l'utilisateur et le token dans le contexte
      login(data.user, data.access_token);
      navigate("/dashboard"); // Redirection vers le tableau de bord
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "linear-gradient(135deg, #0a0f1e 0%, #0d1b3e 50%, #0a0f1e 100%)" }}>
      <div className="w-full max-w-4xl rounded-2xl overflow-hidden flex" style={{ background: "#111827", boxShadow: "0 25px 60px rgba(0,0,0,0.6)" }}>
        {/* ── PANEL GAUCHE (ILLUSTRATION) ──────────────────────────────────── */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#0d1b3e] to-[#1a3a8a] flex-col justify-center p-12 relative">
          {/* Décoration arrière-plan */}
          <div className="absolute -top-10 -right-14 w-48 h-48 bg-blue-500/20 rounded-full" />
          <div className="absolute bottom-8 -left-10 w-40 h-40 bg-blue-500/20 rounded-full" />
          
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
            PLATEFORME DE<br />GESTION DE<br /><span className="text-blue-400">RESSOURCES<br />HUMAINES</span>
          </h2>
          <p className="text-blue-200 text-sm">Bon retour sur votre outil de gestion centralisé.</p>
          
          {/* L'image login-img.png importée */}
          <img src={loginImg} alt="Illustration" className="mt-8 max-w-full object-contain" />
        </div>

        {/* ── PANEL DROIT (FORMULAIRE) ─────────────────────────────────────── */}
       <div className="flex-1 p-8 sm:p-12 flex flex-col justify-center" style={{ background: "#111827" }}>
          <div className="flex justify-center mb-4">
            <div className="w-[250px]"><ModulOpsLogo /></div>
          </div>
          <h2 className="text-center text-xl font-bold text-white mb-2">Connexion</h2>
          <p className="text-center text-gray-500 text-sm mb-8">Entrez vos identifiants pour accéder à votre espace</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Adresse e-mail</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-gray-700 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-white" style={{ background: "#1f2937" }}
                placeholder="gest.info@gmail.com"
              />
            </div>

            {/* Password */}
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
                 className="w-full border border-gray-700 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-white" style={{ background: "#1f2937" }}
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

            {/* Remember me */}
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

            {/* Message d'erreur */}
            {error && <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

            {/* Bouton de connexion */}
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