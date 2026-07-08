import React, { useEffect, useState } from 'react';
import { ArrowLeft, Trophy, Flame, Ghost, Calendar, XCircle, TrendingUp, Settings, Shield } from 'lucide-react';
import { doc, onSnapshot, collection, query, orderBy, updateDoc, getDoc } from 'firebase/firestore';
import { db, promoteToAdmin, updateSeasonDates } from '../lib/db';
import { useAuth } from '../contexts/AuthContext';

interface SeasonRankingScreenProps {
  groupId: string;
  onBack: () => void;
}

export function SeasonRankingScreen({ groupId, onBack }: SeasonRankingScreenProps) {
  const { user } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [seasonStart, setSeasonStart] = useState('');
  const [seasonEnd, setSeasonEnd] = useState('');

  useEffect(() => {
    if (!groupId) return;
    const groupRef = doc(db, 'groups', groupId);
    const unsub = onSnapshot(groupRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.seasonStartDate) setSeasonStart(data.seasonStartDate);
        if (data.seasonEndDate) setSeasonEnd(data.seasonEndDate);
      }
    });
    return () => unsub();
  }, [groupId]);

  useEffect(() => {
    if (!groupId) return;

    const membersRef = collection(db, 'groups', groupId, 'members');
    // Remove orderBy to ensure members without the points field are included, then sort in JS
    const q = query(membersRef);
    
    const unsubscribe = onSnapshot(q, async (snap) => {
      const fetchedMembers = await Promise.all(snap.docs.map(async (d) => {
        const data = d.data();
        let name = `Member ${d.id.substring(0, 5)}`;
        let avatarUrl = '';
        
        try {
          const userDoc = await getDoc(doc(db, 'users', d.id));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            name = userData.name || name;
            avatarUrl = userData.avatarUrl || '';
          }
        } catch (e) {
          console.error('Error fetching user', e);
        }
        
        return { id: d.id, ...data, name, avatarUrl };
      }));
      
      // Sort members by points descending (default 100)
      fetchedMembers.sort((a, b) => (b.points ?? 100) - (a.points ?? 100));
      
      const currentUserMember = fetchedMembers.find(m => m.id === user?.uid);
      setIsAdmin(currentUserMember?.role === 'admin');

      setMembers(fetchedMembers);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [groupId]);

  const handleReportMissedDay = async (targetUserId: string) => {
    if (!user) return;
    try {
      const memberRef = doc(db, 'groups', groupId, 'members', targetUserId);
      const memberSnap = await getDoc(memberRef);
      if (memberSnap.exists()) {
        const data = memberSnap.data();
        const currentPoints = data.points || 100;
        
        // Check if user already logged a WOD today using local date
        const today = new Date().toLocaleDateString('en-CA');
        const lastWodDate = data.lastWodDate ? new Date(data.lastWodDate).toLocaleDateString('en-CA') : null;
        if (lastWodDate === today) {
          alert('This athlete already logged a WOD today!');
          return;
        }

        // Check if already reported today
        const lastReportedDate = data.lastReportedDate ? new Date(data.lastReportedDate).toLocaleDateString('en-CA') : null;
        if (lastReportedDate === today) {
          alert('This athlete was already reported for missing today!');
          return;
        }

        await updateDoc(memberRef, {
          points: currentPoints - 5,
          lastReportedDate: new Date().toISOString()
        });
      }
    } catch (e) {
      console.error("Failed to report missed day", e);
    }
  };

  const handleUpdateSeason = async () => {
    if (!seasonStart || !seasonEnd) return;
    try {
      await updateSeasonDates(groupId, seasonStart, seasonEnd);
      alert('Season dates updated!');
    } catch (e) {
      console.error(e);
      alert('Failed to update season dates');
    }
  };

  const handleMakeAdmin = async (targetId: string) => {
    if (!window.confirm('Are you sure you want to make this user an admin?')) return;
    try {
      await promoteToAdmin(groupId, targetId);
    } catch (e) {
      console.error(e);
      alert('Failed to promote to admin');
    }
  };

  return (
    <div className="min-h-screen bg-background pb-28 pt-16">
      <header className="fixed top-0 w-full z-50 bg-surface/60 backdrop-blur-xl border-b border-white/5 shadow-md flex justify-between items-center px-4 md:px-8 py-3 h-16">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-primary-light hover:bg-white/5 transition-colors p-2 rounded-full active:scale-95 duration-150">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-on-surface flex items-center gap-2">
            <Trophy className="text-secondary" />
            Season Rankings
          </h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 md:px-8 py-6 flex flex-col gap-8">
        {isAdmin && (
          <section className="glass-panel p-6 rounded-3xl border border-secondary/50 bg-secondary/5">
            <h2 className="text-xl font-bold text-secondary mb-4 flex items-center gap-2">
              <Settings /> Admin Controls
            </h2>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                  <label className="block text-sm font-bold text-primary-light mb-1">Season Start</label>
                  <input 
                    type="date" 
                    value={seasonStart}
                    onChange={(e) => setSeasonStart(e.target.value)}
                    className="w-full bg-surface-container rounded-xl p-3 text-on-surface border border-white/10"
                  />
                </div>
                <div className="flex-1 w-full">
                  <label className="block text-sm font-bold text-primary-light mb-1">Season End</label>
                  <input 
                    type="date" 
                    value={seasonEnd}
                    onChange={(e) => setSeasonEnd(e.target.value)}
                    className="w-full bg-surface-container rounded-xl p-3 text-on-surface border border-white/10"
                  />
                </div>
                <button 
                  onClick={handleUpdateSeason}
                  className="bg-secondary text-on-secondary px-6 py-3 rounded-xl font-bold hover:scale-105 active:scale-95 transition-all whitespace-nowrap"
                >
                  Save Dates
                </button>
              </div>
            </div>
          </section>
        )}

        <section className="glass-panel p-6 rounded-3xl border border-secondary/20">
          <h2 className="text-xl font-bold text-secondary mb-2 flex items-center gap-2">
            <Flame /> Current Season Leaderboard
          </h2>
          <p className="text-sm text-on-surface-variant mb-6">
            Points accumulate daily. Missing 7 days deducts points. Report missed days to keep your squad accountable!
          </p>

          {loading ? (
            <div className="text-center py-8 text-on-surface-variant">Loading leaderboard...</div>
          ) : (
            <div className="flex flex-col gap-4">
              {members.map((member, idx) => (
                <div key={member.id} className="bg-surface-container rounded-2xl p-4 flex items-center justify-between border border-white/5 hover:border-secondary/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${idx === 0 ? 'bg-secondary text-on-secondary shadow-glow' : 'bg-surface-container-high text-on-surface'}`}>
                      {idx + 1}
                    </div>
                    {member.avatarUrl ? (
                      <img src={member.avatarUrl} alt={member.name} className="w-10 h-10 rounded-full border border-outline-variant object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-surface-container-highest border border-outline-variant flex items-center justify-center font-bold text-sm text-on-surface">
                        {member.name?.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-on-surface">{member.id === user?.uid ? `${member.name} (You)` : member.name}</h4>
                      <div className="text-xs text-on-surface-variant flex items-center gap-1">
                        <TrendingUp size={12} /> {member.points ?? 100} PTS
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    {isAdmin && member.id !== user?.uid && member.role !== 'admin' && (
                      <button 
                        onClick={() => handleMakeAdmin(member.id)}
                        className="text-xs font-bold bg-primary/20 text-primary-light px-3 py-1.5 rounded-full hover:bg-primary/30 transition-colors flex items-center gap-1"
                      >
                        <Shield size={14} /> Make Admin
                      </button>
                    )}
                    {member.id !== user?.uid && (
                    <button 
                      onClick={() => handleReportMissedDay(member.id)}
                      disabled={
                        (member.lastWodDate && new Date(member.lastWodDate).toLocaleDateString('en-CA') === new Date().toLocaleDateString('en-CA')) ||
                        (member.lastReportedDate && new Date(member.lastReportedDate).toLocaleDateString('en-CA') === new Date().toLocaleDateString('en-CA'))
                      }
                      className="text-xs font-bold bg-error/20 text-error px-3 py-1.5 rounded-full hover:bg-error/30 transition-colors flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      🚨 Missed Today
                    </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="glass-panel p-6 rounded-3xl border border-white/5">
          <h2 className="text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
            <Trophy className="text-primary-light" /> Season Awards (Preview)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-surface-container rounded-xl p-4 flex items-center gap-3">
              <div className="bg-green-500/20 text-green-500 p-2 rounded-full"><TrendingUp size={20} /></div>
              <div>
                <div className="text-xs font-bold text-on-surface-variant uppercase">Most Profitable</div>
                <div className="text-sm font-medium">To be determined...</div>
              </div>
            </div>
            <div className="bg-surface-container rounded-xl p-4 flex items-center gap-3">
              <div className="bg-gray-500/20 text-gray-400 p-2 rounded-full"><Ghost size={20} /></div>
              <div>
                <div className="text-xs font-bold text-on-surface-variant uppercase">Ghost Member</div>
                <div className="text-sm font-medium">To be determined...</div>
              </div>
            </div>
            <div className="bg-surface-container rounded-xl p-4 flex items-center gap-3">
              <div className="bg-orange-500/20 text-orange-500 p-2 rounded-full"><Flame size={20} /></div>
              <div>
                <div className="text-xs font-bold text-on-surface-variant uppercase">Best Streak</div>
                <div className="text-sm font-medium">To be determined...</div>
              </div>
            </div>
            <div className="bg-surface-container rounded-xl p-4 flex items-center gap-3">
              <div className="bg-blue-500/20 text-blue-500 p-2 rounded-full"><Calendar size={20} /></div>
              <div>
                <div className="text-xs font-bold text-on-surface-variant uppercase">Monday Motivator</div>
                <div className="text-sm font-medium">To be determined...</div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
