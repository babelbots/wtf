import React, { useEffect, useState } from 'react';
import { Users, VolumeX, Monitor, Plus, Search, TrendingUp, Dumbbell, Timer, Trophy, Bell } from 'lucide-react';
import { TopBar } from '../components/layout/TopBar';
import { getUserGroups } from '../lib/db';
import { useAuth } from '../contexts/AuthContext';

interface HomeScreenProps {
  onNavigateToGroup: (groupId: string) => void;
  onNavigateToCreateGroup: () => void;
  onNavigateToJoinGroup: () => void;
  onNavigateToProfile: () => void;
}

export function HomeScreen({ onNavigateToGroup, onNavigateToCreateGroup, onNavigateToJoinGroup, onNavigateToProfile }: HomeScreenProps) {
  const { user } = useAuth();
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGroups() {
      if (user) {
        try {
          const userGroups = await getUserGroups(user.uid);
          setGroups(userGroups);
        } catch (error) {
          console.error("Failed to load groups", error);
        }
      }
      setLoading(false);
    }
    loadGroups();
  }, [user]);

  return (
    <div className="min-h-screen bg-background pb-28 pt-16 relative overflow-hidden">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="vibrant-glow-purple absolute inset-0 opacity-50" />
        <div className="vibrant-glow-green absolute inset-0 opacity-50" />
      </div>

      <TopBar showSettings={false} title="Home" onProfile={onNavigateToProfile} />

      <main className="relative z-10 max-w-5xl mx-auto px-4 md:px-8 py-8 flex flex-col gap-8">
        
        {/* Hero Section */}
        <section className="text-center md:text-left mb-4">
          <h2 className="text-4xl md:text-5xl font-extrabold text-on-surface mb-2">Your Squads</h2>
          <p className="text-on-surface-variant text-lg max-w-xl font-medium">
            Jump into your active boxes, check today's WODs, or build your own fitness legacy from scratch.
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Active Groups */}
          <div className="md:col-span-8 flex flex-col gap-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Users className="text-secondary" />
              Active Groups
            </h3>

            {loading ? (
              <div className="text-on-surface-variant p-4">Loading your squads...</div>
            ) : groups.length === 0 ? (
              <div className="p-8 border-2 border-dashed border-outline-variant/30 rounded-2xl flex flex-col items-center justify-center text-center">
                <Dumbbell className="text-outline-variant mb-4" size={48} />
                <h4 className="text-lg font-bold text-on-surface mb-2">No active groups yet</h4>
                <p className="text-on-surface-variant text-sm max-w-sm">Join a box or create your own to start logging workouts and climbing the leaderboard.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {groups.map(group => (
                  <div 
                    key={group.id}
                    onClick={() => onNavigateToGroup(group.id)}
                    className="bg-surface-container rounded-2xl overflow-hidden glass-card transition-all hover:scale-[1.02] cursor-pointer group"
                  >
                    <div className="relative h-48 w-full bg-[#1b2200] flex items-center justify-center overflow-hidden">
                      {group.imageUrl ? (
                        <img src={group.imageUrl} alt={group.name} className="w-full h-full object-cover opacity-90 transition-transform group-hover:scale-105" />
                      ) : (
                        <>
                          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                          
                          <div className="flex flex-wrap gap-4 justify-center items-center opacity-30 text-secondary">
                            <Dumbbell size={48} />
                            <Timer size={48} />
                            <Trophy size={48} />
                          </div>
                        </>
                      )}

                      {group.type === 'official' && (
                        <div className="absolute top-4 left-4 bg-primary text-on-primary px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1.5 shadow-glow">
                          Official Box
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4 flex justify-between items-start">
                      <div>
                        <h4 className="text-lg font-bold mb-1">{group.name}</h4>
                        <p className="text-on-surface-variant text-sm">Join Code: <span className="font-bold text-secondary tracking-widest">{group.joinCode}</span></p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className="bg-surface-container-highest px-3 py-1 rounded-full flex items-center gap-1">
                          <span className="text-xs font-bold">{group.memberCount || 1}</span>
                          <Users size={12} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}




          </div>

          {/* Right Column: Actions */}
          <div className="md:col-span-4 flex flex-col gap-6 md:sticky md:top-24 mt-4 md:mt-0">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Plus className="text-primary-light" />
              Get Started
            </h3>

            <div className="flex flex-col gap-4">
              
              {/* Create Group Card */}
              <div 
                onClick={onNavigateToCreateGroup}
                className="bg-secondary-container p-6 rounded-2xl flex flex-col gap-4 shadow-[0_4px_0_0_rgba(0,0,0,0.3)] hover:-translate-y-1 transition-transform cursor-pointer group"
              >
                <div className="w-14 h-14 bg-[#181e00] rounded-xl flex items-center justify-center">
                  <Plus className="text-secondary" size={32} />
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-[#181e00] mb-1 uppercase">New Group</h4>
                  <p className="text-[#3d4800] text-sm font-medium">Start your own community and lead the leaderboard.</p>
                </div>
              </div>

              {/* Join Group Card */}
              <div 
                onClick={onNavigateToJoinGroup}
                className="bg-surface-container-high p-6 rounded-2xl border border-white/5 flex flex-col gap-4 hover:bg-surface-container-highest transition-colors cursor-pointer group"
              >
                <div className="w-14 h-14 bg-primary/20 rounded-xl flex items-center justify-center">
                  <Search className="text-primary-light" size={32} />
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-on-surface mb-1">Join a Group</h4>
                  <p className="text-on-surface-variant text-sm font-medium">Find your friends or discover nearby active boxes.</p>
                </div>
              </div>



            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
