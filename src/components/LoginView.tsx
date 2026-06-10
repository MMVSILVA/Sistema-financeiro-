import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Key, Sparkles, CheckCircle, AlertCircle, LogIn, Lock } from 'lucide-react';
// @ts-expect-error - image asset
import lionIcon from '../assets/images/lion_icon_1781116211738.png';

interface LoginViewProps {
  onLoginSuccess: (token: string) => void;
}

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [token, setToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const sanitizedToken = token.trim().toUpperCase();

    if (!sanitizedToken) {
      setError('Por favor, informe seu token de acesso.');
      return;
    }

    setIsLoading(true);

    // Simulate a secure verification
    setTimeout(() => {
      // Accept 'LEAO', 'LEÃO', 'PROSPERIDADE', or '1234'
      if (
        sanitizedToken === 'LEAO' ||
        sanitizedToken === 'LEÃO' ||
        sanitizedToken === 'PROSPERIDADE' ||
        sanitizedToken === '1234'
      ) {
        onLoginSuccess(sanitizedToken);
      } else {
        setError('Token inválido ou não autorizado. Verifique e tente novamente.');
      }
      setIsLoading(false);
    }, 850);
  };

  return (
    <div id="login-layout-container" className="min-h-screen w-full bg-[#050507] text-white flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Visual background ambient lighting */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/[0.08] rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-500/[0.04] rounded-full blur-[120px] pointer-events-none"></div>
      
      {/* Grid Pattern Background overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-20"></div>

      <motion.div 
        id="login-card"
        initial={{ opacity: 0, y: 15, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md bg-[#0b0a14]/85 border border-white/10 p-8 rounded-3xl relative shadow-[0_24px_64px_-16px_rgba(0,0,0,0.8)] backdrop-blur-xl z-10"
      >
        {/* Card golden boundary glow */}
        <div className="absolute -inset-px bg-gradient-to-r from-amber-500/20 via-transparent to-purple-500/10 rounded-3xl pointer-events-none opacity-70"></div>

        {/* Content Box */}
        <div className="flex flex-col items-center text-center">
          {/* Majestic Lion Icon */}
          <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/35 rounded-2xl flex items-center justify-center shadow-2xl shadow-amber-500/10 overflow-hidden mb-5">
            <img 
              src={lionIcon} 
              alt="Logo Leão" 
              className="w-full h-full object-cover p-1 scale-[1.05]"
            />
          </div>

          <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-amber-500 font-extrabold px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 mb-3">
             Controle Autoritativo
          </span>

          <h2 className="text-2xl md:text-3xl font-extrabold font-display tracking-tight text-white">
            Finance Control
          </h2>
          
          <p className="text-amber-100/60 text-xs italic font-semibold mt-1">
            "Prosperidade e riquezas haverá na sua casa..."
          </p>

          <form onSubmit={handleSubmit} className="w-full mt-8 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5 text-left">
              <label htmlFor="token-input" className="text-[10px] font-bold uppercase tracking-widest text-white/50 ml-1">
                Token de Acesso
              </label>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
                  <Lock className="w-4 h-4" />
                </div>
                
                <input 
                  id="token-input"
                  type="password"
                  placeholder="Informe o seu token"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 bg-black/65 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 tracking-widest outline-none focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20 transition-all font-mono"
                  disabled={isLoading}
                  autoFocus
                />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl flex items-start gap-2 text-xs text-left leading-relaxed mt-1"
              >
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs tracking-wider uppercase rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Verificando...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 stroke-[2.5]" />
                  <span>Entrar com Token</span>
                </>
              )}
            </button>
          </form>

          {/* Footer Copyright/Notice */}
          <div className="mt-8 pt-6 border-t border-white/5 w-full">
            <div className="flex items-center gap-1.5 justify-center py-1">
              <span className="text-[10px] text-white/30 uppercase font-mono tracking-widest font-bold">
                Acesso Seguro &bull; Todos os direitos reservados
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
