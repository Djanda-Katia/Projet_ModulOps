import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.svg";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!email.trim()) {
      setError("Veuillez saisir votre adresse e-mail.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/password/forgot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Une erreur est survenue.");
      setMessage("Un lien de réinitialisation a été envoyé à votre adresse e-mail.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    // ← SEULE MODIFICATION : Le bg-slate-100 devient le fond bleu foncé
    <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center p-4">
      {/* ← Le reste est exactement comme ton code original : bg-white, text-gray-900, etc. */}
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex">
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#0d1b3e] to-[#1a3a8a] flex-col justify-center p-12 relative">
          <div className="absolute -top-10 -right-14 w-48 h-48 bg-blue-500/20 rounded-full" />
          <div className="absolute bottom-8 -left-10 w-40 h-40 bg-blue-500/20 rounded-full" />
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
            PLATEFORME DE<br />GESTION DE<br /><span className="text-blue-400">RESSOURCES<br />HUMAINES</span>
          </h2>
          <p className="text-blue-200 text-sm">Bon retour sur votre outil de gestion centralisé.</p>
          <img src="/src/assets/login-img.png" alt="Illustration" className="mt-8 max-w-full object-contain" />
        </div>

        <div className="flex-1 p-8 sm:p-12 flex flex-col justify-center">
          <div className="flex justify-center mb-4">
            <img src={logo} alt="ModulOps" className="w-[250px]" />
          </div>
          <h2 className="text-center text-xl font-bold text-gray-900 mb-2">Mot de passe oublié</h2>
          <p className="text-center text-gray-400 text-sm mb-8">Saisissez votre email, nous vous enverrons un lien de réinitialisation</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Adresse e-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="nom@entreprise.com"
              />
            </div>

            {error && <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
            {message && <p className="text-green-500 text-sm bg-green-50 border border-green-200 rounded-lg px-3 py-2">{message}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all"
            >
              {loading ? "Envoi..." : "ENVOYER LE LIEN DE RÉINITIALISATION"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-blue-600 hover:underline text-sm inline-flex items-center gap-1">
              <span className="material-symbols-outlined text-base">arrow_back</span> Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}