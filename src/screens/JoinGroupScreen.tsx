import React, { useState } from 'react';
import { ArrowLeft, Users, Key } from 'lucide-react';
import { TopBar } from '../components/layout/TopBar';
import { joinGroup } from '../lib/db';
import { useAuth } from '../contexts/AuthContext';

interface JoinGroupScreenProps {
  onBack: () => void;
  onJoin: (groupId: string) => void;
}

export function JoinGroupScreen({ onBack, onJoin }: JoinGroupScreenProps) {
  const { user } = useAuth();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      setLoading(true);
      setError('');
      const groupId = await joinGroup(code, user.uid);
      onJoin(groupId);
    } catch (err: any) {
      setError(err.message || 'Failed to join group. Check the code.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-28 pt-16">
      <header className="fixed top-0 w-full z-50 bg-surface/60 backdrop-blur-xl border-b border-white/5 shadow-md flex justify-between items-center px-4 md:px-8 py-3 h-16">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-primary-light hover:bg-white/5 transition-colors p-2 rounded-full active:scale-95 duration-150">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-on-surface">
            Join Group
          </h1>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 md:px-8 py-8 flex flex-col gap-8">
        
        <section className="text-center">
          <div className="inline-flex items-center justify-center p-4 bg-secondary-container rounded-full mb-6 shadow-glow">
            <Key className="text-secondary w-8 h-8" />
          </div>
          <h2 className="text-3xl font-extrabold text-on-surface mb-2">Enter Invite Code</h2>
          <p className="text-on-surface-variant font-medium">
            Got an invite code from your friends or box? Enter it below to join the squad.
          </p>
        </section>

        <form className="space-y-6 glass-panel p-6 md:p-8 rounded-3xl" onSubmit={handleJoin}>
          {error && <div className="text-error text-center text-sm font-bold">{error}</div>}
          <div className="space-y-2">
            <input 
              type="text" 
              placeholder="e.g. XF-VALHALLA-99"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-16 text-center bg-surface-container-low rounded-2xl border-2 border-outline-variant focus:border-secondary focus:ring-0 text-on-surface placeholder:text-outline-variant/40 transition-all outline-none font-extrabold text-2xl tracking-widest uppercase"
              required
            />
          </div>

          <button 
            type="submit"
            disabled={loading || code.length === 0}
            className="w-full h-14 bg-secondary text-on-secondary font-bold text-lg rounded-full shadow-glow hover:scale-[1.02] active:scale-95 transition-all duration-200 uppercase tracking-wide disabled:opacity-50"
          >
            {loading ? 'Joining...' : 'Join Squad'}
          </button>
        </form>
      </main>
    </div>
  );
}
