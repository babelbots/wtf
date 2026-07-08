import React, { useEffect, useState } from 'react';
import { User, Calendar, Target, Award, ArrowLeft, Clock, LogOut, Info, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getUserResultsHistory } from '../lib/db';
import { logout } from '../lib/firebase';

interface ProfileScreenProps {
  onBack: () => void;
}

export function ProfileScreen({ onBack }: ProfileScreenProps) {
  const { user } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWod, setSelectedWod] = useState<any>(null);

  useEffect(() => {
    async function loadHistory() {
      if (user) {
        try {
          const data = await getUserResultsHistory(user.uid);
          setHistory(data);
        } catch (error) {
          console.error("Failed to load history", error);
        }
      }
      setLoading(false);
    }
    loadHistory();
  }, [user]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background pb-28 pt-16 relative overflow-hidden">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="vibrant-glow-purple absolute inset-0 opacity-40" />
      </div>

      {/* Custom Header with Back Button */}
      <header className="fixed top-0 w-full z-50 bg-surface/60 backdrop-blur-xl border-b border-white/5 shadow-md flex items-center px-4 md:px-8 py-3 h-16">
        <button 
          onClick={onBack}
          className="text-primary-light hover:bg-white/5 transition-colors p-2 rounded-full active:scale-95 duration-150 mr-2"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-on-surface flex-1">
          My Profile
        </h1>
        <button 
          onClick={() => logout()}
          className="text-error hover:bg-error/10 transition-colors p-2 rounded-full active:scale-95 flex items-center gap-2 text-sm font-bold"
        >
          <LogOut size={20} />
          <span className="hidden sm:inline">Log Out</span>
        </button>
      </header>

      <main className="relative z-10 max-w-3xl mx-auto px-4 md:px-8 py-8 flex flex-col gap-8">
        
        {/* Profile Header Card */}
        <section className="bg-surface-container-low border border-white/5 rounded-3xl p-6 flex items-center gap-6 shadow-xl">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-primary-light flex-shrink-0 bg-surface-container-high flex items-center justify-center">
            {user.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User size={40} className="text-on-surface-variant" />
            )}
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-on-surface mb-1">
              {user.displayName || 'Anonymous'}
            </h2>
            <p className="text-on-surface-variant font-medium text-sm md:text-base">
              {user.email}
            </p>
            <div className="mt-3 inline-flex items-center gap-2 bg-primary/20 text-primary-light px-3 py-1 rounded-full text-sm font-bold">
              <Award size={16} />
              {history.length} WODs Completed
            </div>
          </div>
        </section>

        {/* WOD History Timeline */}
        <section className="flex flex-col gap-4">
          <h3 className="text-xl font-bold flex items-center gap-2 text-on-surface">
            <Calendar className="text-secondary" size={20} />
            WOD History
          </h3>

          {loading ? (
            <div className="text-center py-10 text-on-surface-variant">Loading history...</div>
          ) : history.length === 0 ? (
            <div className="bg-surface-container-low border border-white/5 rounded-2xl p-8 text-center">
              <p className="text-on-surface-variant">You haven't logged any results yet.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {history.map((item) => (
                <div key={item.id} className="bg-surface-container-low border border-white/5 rounded-2xl p-5 shadow-lg flex flex-col gap-3 transition-transform hover:-translate-y-1 duration-200">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-secondary bg-secondary/10 px-2 py-0.5 rounded">
                          {item.groupName || 'Unknown Group'}
                        </span>
                        <span className="text-xs text-on-surface-variant flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(item.loggedAt || item.createdAt).toLocaleDateString(undefined, {
                            month: 'short', day: 'numeric', year: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-bold text-on-surface">
                          {item.wod?.title || 'Unknown WOD'}
                        </h4>
                        {item.wod && (
                          <button 
                            onClick={() => setSelectedWod(item.wod)}
                            className="text-primary-light hover:bg-primary/20 p-1.5 rounded-full transition-colors bg-surface-container"
                            title="View WOD info"
                          >
                            <Info size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider ${
                      item.scale === 'rx' ? 'bg-primary/20 text-primary-light' : 'bg-surface-container-high text-on-surface-variant'
                    }`}>
                      {item.scale === 'rx' ? 'RX' : 'Scaled'}
                    </span>
                  </div>

                  <div className="bg-surface-container/50 rounded-xl p-3 flex gap-4 text-sm">
                    <div className="flex flex-col">
                      <span className="text-on-surface-variant text-xs uppercase tracking-wide">Result</span>
                      <span className="font-extrabold text-on-surface text-base">{item.timeOrReps} {item.isCapped && '(Capped)'}</span>
                    </div>
                    {item.weight && item.weight !== 'RX' && (
                      <div className="flex flex-col">
                        <span className="text-on-surface-variant text-xs uppercase tracking-wide">Weight</span>
                        <span className="font-extrabold text-on-surface text-base">{item.weight}</span>
                      </div>
                    )}
                  </div>

                  {item.notes && (
                    <p className="text-sm text-on-surface-variant italic border-l-2 border-white/10 pl-3">
                      "{item.notes}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* WOD Info Modal */}
      {selectedWod && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-surface border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] shadow-2xl">
            <div className="relative">
              {selectedWod.imageUrl ? (
                <img src={selectedWod.imageUrl} alt="WOD" className="w-full h-48 md:h-64 object-cover" />
              ) : (
                <div className="w-full h-32 bg-surface-container-high flex items-center justify-center">
                  <Target size={40} className="text-on-surface-variant opacity-30" />
                </div>
              )}
              <button 
                onClick={() => setSelectedWod(null)}
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-md transition-all active:scale-95"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <h3 className="text-2xl font-black text-on-surface mb-4">{selectedWod.title || 'WOD Info'}</h3>
              <div className="whitespace-pre-wrap text-on-surface-variant font-medium text-sm">
                {selectedWod.description || 'No description available for this WOD.'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
