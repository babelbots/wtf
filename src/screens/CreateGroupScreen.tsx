import React, { useState } from 'react';
import { ArrowLeft, Users, Building2, ShieldAlert } from 'lucide-react';
import { TopBar } from '../components/layout/TopBar';
import { createGroup } from '../lib/db';
import { useAuth } from '../contexts/AuthContext';

interface CreateGroupScreenProps {
  onBack: () => void;
  onCreate: (groupId: string) => void;
}

export function CreateGroupScreen({ onBack, onCreate }: CreateGroupScreenProps) {
  const { user } = useAuth();
  const [groupType, setGroupType] = useState<'private' | 'official'>('private');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      setLoading(true);
      setError('');
      const groupId = await createGroup(name, groupType, user.uid);
      onCreate(groupId);
    } catch (err: any) {
      setError(err.message || 'Failed to create group');
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
            Create Group
          </h1>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 md:px-8 py-8 flex flex-col gap-8">
        
        <section className="text-center">
          <div className="inline-flex items-center justify-center p-4 bg-primary/20 rounded-full mb-6">
            <Building2 className="text-primary-light w-8 h-8" />
          </div>
          <h2 className="text-3xl font-extrabold text-on-surface mb-2">Build Your Crew</h2>
          <p className="text-on-surface-variant font-medium">
            Setup a private circle for your friends, or an official Box for your gym.
          </p>
        </section>

        <form className="space-y-6 glass-panel p-6 md:p-8 rounded-3xl" onSubmit={handleCreate}>
          {error && <div className="text-error text-center text-sm font-bold">{error}</div>}
          <div className="space-y-2">
            <label className="text-xs font-bold text-primary-light ml-2 uppercase tracking-wider">Group Name</label>
            <input 
              type="text" 
              placeholder="e.g. Morning Crew 6AM"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-14 px-5 bg-surface-container rounded-xl border-2 border-transparent focus:border-secondary focus:ring-0 text-on-surface placeholder:text-outline-variant transition-all outline-none font-bold"
              required
            />
          </div>

          <div className="space-y-4">
            <label className="text-xs font-bold text-primary-light ml-2 uppercase tracking-wider">Group Type</label>
            
            <div className="grid grid-cols-2 gap-2 p-1 bg-surface-container rounded-2xl">
              <button
                type="button"
                onClick={() => setGroupType('private')}
                className={`py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-300 ${
                  groupType === 'private' 
                    ? 'bg-secondary text-on-secondary shadow-glow' 
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'
                }`}
              >
                Private
              </button>
              <button
                type="button"
                onClick={() => setGroupType('official')}
                className={`py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-300 ${
                  groupType === 'official' 
                    ? 'bg-secondary text-on-secondary shadow-glow' 
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'
                }`}
              >
                Official Box
              </button>
            </div>

            <div className="bg-surface-container-high/50 p-4 rounded-2xl border border-white/5">
              {groupType === 'private' ? (
                <div className="flex gap-3">
                  <Users className="text-secondary shrink-0" size={20} />
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    <strong className="text-on-surface">For friends and training buddies.</strong> Everyone is an admin. The first person to log the WOD rules the day.
                  </p>
                </div>
              ) : (
                <div className="flex gap-3">
                  <ShieldAlert className="text-primary-light shrink-0" size={20} />
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    <strong className="text-on-surface">For coaches and gym owners.</strong> Only admins can program the daily WOD. You control the official leaderboard.
                  </p>
                </div>
              )}
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full h-14 mt-4 bg-secondary text-on-secondary font-bold text-lg rounded-full shadow-glow hover:scale-[1.02] active:scale-95 transition-all duration-200 uppercase tracking-wide disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Group'}
          </button>
        </form>
      </main>
    </div>
  );
}
