"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#121212] absolute inset-0 z-50">
      <div className="w-full max-w-md p-8 card-glass border border-white/10 rounded-2xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full bg-[#1DB954] flex items-center justify-center mx-auto mb-4">
            <span className="font-bold text-white text-xl">P</span>
          </div>
          <h2 className="text-2xl font-bold text-white">Sign in to Pulse AI</h2>
          <p className="text-zinc-400 mt-2">Enter your details to access the dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Email</label>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#1DB954] transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Password</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#1DB954] transition-colors"
            />
          </div>
          
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#1DB954] hover:bg-[#1ed760] text-black font-semibold py-2.5 rounded-lg transition-all mt-6 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
