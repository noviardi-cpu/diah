
import React, { useState } from 'react';
import { Lock, User, LogIn, Database, Zap } from 'lucide-react';
import { login } from '../services/authService';
import { UserAccount } from '../types';
import { DEFAULT_ADMIN } from '../services/db';

interface Props {
  onLoginSuccess: (user: UserAccount) => void;
}

const LoginScreen: React.FC<Props> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = await login(username, password);
    if (user) onLoginSuccess(user);
    else setError('Username atau password salah.');
  };

  const handleQuickAccess = () => {
    onLoginSuccess(DEFAULT_ADMIN);
  };

  return (
    <div className="min-h-screen bg-pink-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden opacity-30 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-tcm-primary blur-[120px] rounded-full animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-400 blur-[120px] rounded-full animate-pulse delay-1000"></div>
      </div>

      <div className="bg-pink-900/80 backdrop-blur-xl border border-pink-400 w-full max-w-md rounded-3xl shadow-2xl p-8 relative z-10">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-pink-800 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-pink-200">
             <Database className="w-8 h-8 text-tcm-primary" />
          </div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tighter">TCM WuXing PRO</h1>
          <p className="text-white text-xs font-bold uppercase tracking-widest mt-1">Clinical Decision Support System</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white" />
            <input 
              type="text" value={username} onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-pink-950 border border-pink-400 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-tcm-primary focus:bg-pink-900 outline-none transition-all"
              placeholder="Username"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white" />
            <input 
              type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-pink-950 border border-pink-400 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-tcm-primary focus:bg-pink-900 outline-none transition-all"
              placeholder="Password"
            />
          </div>
          {error && <p className="text-rose-500 text-xs font-bold text-center">{error}</p>}
          
          <button type="submit" className="w-full bg-tcm-primary text-white font-black py-4 rounded-2xl shadow-lg shadow-pink-200 hover:brightness-110 active:scale-95 transition-all">
             MASUK SISTEM
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-pink-400">
           <button 
             onClick={handleQuickAccess}
             className="w-full flex items-center justify-center gap-2 py-4 bg-fuchsia-950 border border-fuchsia-200 text-fuchsia-600 font-black rounded-2xl hover:bg-fuchsia-600 hover:text-white transition-all group shadow-sm"
           >
              <Zap className="w-5 h-5 group-hover:animate-bounce" /> AKSES CEPAT (ADMIN)
           </button>
           <p className="text-[10px] text-white text-center mt-4 uppercase font-black tracking-widest">Aplikasi ini menyimpan data secara lokal di browser Anda.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
