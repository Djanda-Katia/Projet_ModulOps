import { useState } from "react";
import loginImg from "../assets/login-img.png";

// ── CONFIGURATION BACKEND ───────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

// ── ICONS ────────────────────────────────────────────────────────────────────
const EyeOpen = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeClosed = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94
             M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19
             m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

{/* TON SVG STRICTEMENT INTÉGRAL ET NON MODIFIÉ */}
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
        <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#040814" flood-opacity="0.15"/>
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

    <text 
      x="210" 
      y="112" 
      font-family="ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
      font-size="52" 
      letter-spacing="-0.03em"
    >
      <tspan font-weight="800" fill="#040814">Modul</tspan><tspan font-weight="300" fill="#0055ff">Ops</tspan>
    </text>
  </svg>
);

// ── COMPONENT ─────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "", remember: true });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email.trim() || !form.password.trim()) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          remember: form.remember,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg =
          data?.errors?.email?.[0] ||
          data?.errors?.password?.[0] ||
          data?.message ||
          "Identifiants incorrects.";
        setError(msg);
        return;
      }

      if (data.token) {
        localStorage.setItem("auth_token", data.token);
      }

      window.location.href = "/dashboard";
    } catch {
      setError("Impossible de contacter le serveur. Réessaie plus tard.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-[Poppins]">
      <div className="flex w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl min-h-[620px]">

        {/* ── LEFT PANEL ──────────────────────────────────────────────────── */}
        <div
          className="hidden md:flex md:w-[45%] flex-col justify-center p-6 relative overflow-hidden"
          style={{
            background: "linear-gradient(160deg, #0d1b3e 0%, #0e2254 40%, #112b6e 70%, #1a3a8a 100%)",
          }}
        >
          <div className="absolute -top-10 -right-14 w-48 h-48 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(60,90,220,0.35) 0%, transparent 70%)" }} />
          <div className="absolute bottom-8 -left-10 w-40 h-40 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(80,100,255,0.22) 0%, transparent 70%)" }} />

          <div className="w-full flex items-center justify-center relative z-10">
            <img 
              src={loginImg} 
              alt="Login illustration" 
              className="max-w-[105%] object-contain"
            />
          </div>
        </div>

        {/* ── RIGHT PANEL ─────────────────────────────────────────────────── */}
        <div className="flex-1 bg-white px-6 sm:px-14 pt-4 pb-12 flex flex-col justify-center relative">
          
          <div className="absolute -top-8 right-16 w-28 h-28 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(30,60,180,0.08) 0%, transparent 70%)" }} />

          <div className="max-w-md mx-auto w-full flex flex-col">
            
            {/* FORCE LE BLOC EXTÉRIEUR À SE CENTRER SANS MODIFIER LE SVG */}
            <div className="w-full flex justify-center mb-4">
              <div className="w-[290px] h-auto flex items-center justify-center -ml-4">
                <ModulOpsLogo />
              </div>
            </div>

            {/* TITRE */}
            <h1 className="text-2xl font-normal text-gray-900 leading-snug mb-7 text-center sm:text-left">
              <span className="font-bold">Log In</span> to your account
              <br />to continue
            </h1>

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-0 w-full">

              {/* Email */}
              <div className="mb-4">
                <label htmlFor="email" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Username or Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="yourmail@mail.com"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full h-11 bg-slate-50 border border-slate-200 rounded-lg px-3.5
                             text-[13px] text-gray-800 placeholder-gray-300
                             outline-none focus:border-blue-500 focus:bg-white transition"
                />
              </div>

              {/* Password */}
              <div className="mb-4 relative">
                <label htmlFor="password" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type={showPwd ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••••"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full h-11 bg-slate-50 border border-slate-200 rounded-lg px-3.5 pr-10
                             text-[13px] text-gray-800 placeholder-gray-300
                             outline-none focus:border-blue-500 focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 bottom-3 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Afficher / masquer le mot de passe"
                >
                  {showPwd ? <EyeClosed /> : <EyeOpen />}
                </button>
              </div>

              {/* Remember me */}
              <div className="flex items-center gap-2 mb-5">
                <input
                  id="remember"
                  name="remember"
                  type="checkbox"
                  checked={form.remember}
                  onChange={handleChange}
                  className="w-4 h-4 accent-blue-600 cursor-pointer"
                />
                <label htmlFor="remember" className="text-xs text-gray-500 cursor-pointer select-none">
                  Remember Me
                </label>
              </div>

              {/* Error message */}
              {error && (
                <p className="text-red-500 text-xs mb-4 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-lg text-white text-sm font-semibold tracking-widest uppercase
                           transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5
                           active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: loading
                    ? "#6b8dd6"
                    : "linear-gradient(135deg, #1c3fbb 0%, #2252d4 50%, #3568ef 100%)",
                }}
              >
                {loading ? "Connexion…" : "LOG IN"}
              </button>
            </form>

            <a href="/forgot-password"
              className="block text-center sm:text-right text-xs text-blue-500 italic mt-4 hover:text-blue-700 transition-colors">
              forgot password?
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}