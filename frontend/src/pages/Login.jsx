import React, { useState } from "react";

function ExactInput({ type, placeholder, value, onChange }) {
  return (
    <div className="w-full">
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
        className="w-full bg-transparent border-b border-zinc-800 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#9461e1] transition-colors"
      />
    </div>
  );
}

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    /* FOND GLOBAL : Divisé exactement en deux couleurs pour suivre la ligne de la carte */
    <div className="min-h-screen w-screen flex items-center justify-center p-6 font-sans antialiased relative overflow-hidden bg-[#19191b]">
      
      {/* Côté droit du fond en violet */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-[#9461e1] hidden md:block z-0"></div>

      {/* 
        CONTAINER CENTRAL 
        Regarde l'ombre : shadow-[0_0_100px_rgba(0,0,0,0.6)] récrée exactement le contour diffus que tu as entouré.
      */}
      <div className="w-full max-w-[960px] aspect-[1.3/1] bg-[#19191b] rounded-[32px] overflow-hidden flex flex-col md:flex-row z-10 
                      shadow-[0_0_100px_rgba(0,0,0,0.65)] border border-white/[0.03]">
        
        {/* ================= SECTION GAUCHE : FORMULAIRE SOMBRE ================= */}
        <div className="w-full md:w-[45%] p-10 lg:p-16 flex flex-col justify-between bg-[#19191b]">
          <div className="hidden md:block"></div>

          <div className="w-full max-w-[290px] mx-auto my-auto space-y-7">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-wide mb-2">
                Login
              </h1>
              <p className="text-xs text-zinc-400">
                Enter your account details
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <ExactInput
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />

              <div className="relative">
                <ExactInput
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button type="button" className="absolute right-0 bottom-3 text-zinc-500">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                </button>
              </div>

              <div className="text-left pt-1">
                <a href="#" className="text-xs text-zinc-500 hover:text-zinc-400 transition-colors">
                  Forgot Password?
                </a>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#9461e1] hover:bg-[#8352ce] text-white font-medium rounded-xl text-xs tracking-wide transition-all active:scale-[0.99]"
                >
                  Login
                </button>
              </div>
            </form>
          </div>

          <div className="w-full max-w-[290px] mx-auto flex items-center justify-between text-xs pt-4">
            <span className="text-zinc-600">Don't have an account?</span>
            <button className="px-3 py-1.5 bg-[#222224] hover:bg-[#2b2b2e] text-zinc-300 font-medium rounded-lg text-[11px] transition-colors">
              Sign up
            </button>
          </div>
        </div>

        {/* ================= SECTION DROITE : PANNEAU VISUEL VIOLET ================= */}
        <div className="w-full md:w-[55%] bg-[#9461e1] p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden">
          
          {/* Formes fluides d'arrière-plan */}
          <div className="absolute inset-0 z-0 opacity-15 pointer-events-none">
            <div className="absolute -top-12 -right-12 w-[400px] h-[400px] bg-white rounded-[40%] rotate-45"></div>
            <div className="absolute top-20 -left-20 w-[300px] h-[300px] bg-purple-200 rounded-[50%]"></div>
          </div>

          <div className="z-10 text-white mt-4 space-y-2">
            <h2 className="text-4xl lg:text-[44px] font-bold tracking-tight leading-none">
              Welcome to <br />student portal
            </h2>
            <p className="text-[11px] text-purple-100/70 font-normal">
              Login to access your account
            </p>
          </div>

          <div className="z-10 w-full flex justify-center items-end mt-auto">
            <img 
              src="https://illustrations.popsy.co/white/work-from-home.svg" 
              alt="Students Visual" 
              className="w-full max-w-[340px] h-auto max-h-[250px] object-contain"
            />
          </div>
        </div>

      </div>
    </div>
  );
}