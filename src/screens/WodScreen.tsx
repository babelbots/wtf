import React, { useState, useEffect } from 'react';
import { Camera, Dumbbell, Trophy, ArrowLeft, X, MoreVertical, LogOut, Trash2 } from 'lucide-react';
import { TopBar } from '../components/layout/TopBar';
import { leaveGroup, deleteGroup } from '../lib/db';
import { collection, query, orderBy, getDocs, limit, onSnapshot, doc, getDoc, addDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { resizeImage } from '../lib/imageUtils';

const MOCK_LEADERBOARD = [
  { id: '1', name: 'Bjorn H.', score: '08:45', avatar: 'https://i.pravatar.cc/150?img=11', rank: 1 },
  { id: '2', name: 'Alex R.', score: '09:02', avatar: 'https://i.pravatar.cc/150?img=33', rank: 2 },
  { id: '3', name: 'Maja K.', score: '09:08', avatar: 'https://i.pravatar.cc/150?img=47', rank: 3 },
  { id: '4', name: 'Sarah Connor', score: '09:12', avatar: 'https://i.pravatar.cc/150?img=41', rank: 4 },
  { id: '5', name: 'You (Erik S.)', score: '09:45', avatar: 'https://i.pravatar.cc/150?img=12', rank: 5 },
];

interface WodScreenProps {
  groupId: string;
  onBack: () => void;
}

export function WodScreen({ groupId, onBack }: WodScreenProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'rx' | null>(null);
  const [activeLeaderboardTab, setActiveLeaderboardTab] = useState<'leaderboard' | 'community'>('leaderboard');
  const [isCapped, setIsCapped] = useState(false);
  const [group, setGroup] = useState<any>(null);
  const [wod, setWod] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form State
  const [weight, setWeight] = useState('');
  const [weightUnit, setWeightUnit] = useState<'KG'|'LB'>('KG');
  const [timeOrReps, setTimeOrReps] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  // Create WOD State
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newWodTitle, setNewWodTitle] = useState('');
  const [newWodType, setNewWodType] = useState('AMRAP');
  const [newWodDesc, setNewWodDesc] = useState('');
  const [newWodTimeCap, setNewWodTimeCap] = useState('');
  const [newWodNotes, setNewWodNotes] = useState('');
  const [newWodImage, setNewWodImage] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionError, setTranscriptionError] = useState('');
  const [newWodCreating, setNewWodCreating] = useState(false);
  const [newWodSaveError, setNewWodSaveError] = useState('');
  const [isEditingWod, setIsEditingWod] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!groupId) return;
      try {
        // Load Group details
        const groupSnap = await getDoc(doc(db, 'groups', groupId));
        if (groupSnap.exists()) {
          setGroup({ id: groupSnap.id, ...groupSnap.data() });
        }

        if (user) {
          const memberSnap = await getDoc(doc(db, 'groups', groupId, 'members', user.uid));
          if (memberSnap.exists()) {
            setUserRole(memberSnap.data().role);
          }
        }

        // Load today's WOD
        const wodsRef = collection(db, 'groups', groupId, 'wods');
        const q = query(wodsRef, orderBy('createdAt', 'desc'), limit(1));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const currentWod = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
          setWod(currentWod);

          // Subscribe to results for this WOD
          const resultsRef = collection(db, 'groups', groupId, 'results');
          const resultsQuery = query(resultsRef, orderBy('loggedAt', 'desc'));
          const unsubscribe = onSnapshot(resultsQuery, (snap) => {
            const fetchedResults = snap.docs
              .map(d => ({ id: d.id, ...d.data() }))
              .filter((r: any) => r.wodId === currentWod.id);
            setResults(fetchedResults);
          });
          
          setLoading(false);
          return () => unsubscribe();
        }
      } catch (error) {
        console.error("Failed to load WOD", error);
      }
      setLoading(false);
    }
    const unsub = loadData();
    return () => {
      unsub.then(fn => fn && fn());
    };
  }, [groupId, user]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsTranscribing(true);
      setTranscriptionError('');
      const base64 = await resizeImage(file);
      setNewWodImage(base64);

      const res = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64 })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Could not analyze the image.');
      }
      
      if (data.title) setNewWodTitle(data.title);
      if (data.type) {
        const typeMatch = ['AMRAP', 'EMOM', 'FOR TIME', 'HEAVY DAY'].find(t => data.type.toUpperCase().includes(t));
        if (typeMatch) setNewWodType(typeMatch);
      }
      if (data.notes) setNewWodNotes(data.notes);
      if (data.timeCap) setNewWodTimeCap(data.timeCap);
      
      let desc = data.metcon || '';
      if (data.strength) desc = `Strength:\n${data.strength}\n\nMetcon:\n${desc}`;
      
      if (desc) setNewWodDesc(desc);
    } catch (err) {
      console.error(err);
      setTranscriptionError(err instanceof Error ? err.message : 'Failed to transcribe image.');
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleEditClick = () => {
    setNewWodTitle(wod.title || '');
    setNewWodType(wod.type || 'AMRAP');
    setNewWodDesc(wod.metcon || wod.description || '');
    setNewWodTimeCap(wod.timeCap || '');
    setNewWodNotes(wod.notes || '');
    setNewWodImage(wod.imageUrl || null);
    setIsEditingWod(true);
    setShowCreateForm(true);
  };

  const handleCreateWod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setNewWodCreating(true);
    setNewWodSaveError('');
    try {
      const wodsRef = collection(db, 'groups', groupId, 'wods');
      const wodData = {
        title: newWodTitle || 'Workout of the Day',
        type: newWodType,
        description: '',
        strength: '',
        metcon: newWodDesc,
        notes: newWodNotes,
        timeCap: newWodTimeCap.trim(),
        imageUrl: newWodImage || null,
        updatedAt: new Date().toISOString()
      };
      
      if (isEditingWod && wod) {
        const updatedWodData = { ...wodData, authorId: user.uid };
        await updateDoc(doc(db, 'groups', groupId, 'wods', wod.id), updatedWodData);
        setWod({ ...wod, ...updatedWodData });
      } else {
        const docRef = await addDoc(wodsRef, {
          ...wodData,
          date: new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString(),
          authorId: user.uid
        });
        setWod({ id: docRef.id, ...wodData, date: new Date().toISOString().split('T')[0] });
        
        const resultsRef = collection(db, 'groups', groupId, 'results');
        const resultsQuery = query(resultsRef, orderBy('loggedAt', 'desc'));
        onSnapshot(resultsQuery, (snap) => {
          const fetchedResults = snap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .filter((r: any) => r.wodId === docRef.id);
          setResults(fetchedResults);
        });
      }
      setShowCreateForm(false);
      setIsEditingWod(false);
      setNewWodTimeCap('');
    } catch (err) {
      console.error(err);
      setNewWodSaveError(err instanceof Error ? err.message : 'Could not save this WOD.');
    } finally {
      setNewWodCreating(false);
    }
  };

  const handleTimeBlur = () => {
    let val = timeOrReps.trim();
    if (val.includes('.') || val.includes(',')) {
      let [mins, secs] = val.split(/[.,]/);
      if (secs.length === 1) secs = secs + '0';
      if (!secs) secs = '00';
      setTimeOrReps(`${mins}:${secs}`);
    }
  };

  const handleSubmitResult = async () => {
    if (!user || !wod || !timeOrReps) return;
    setSubmitting(true);
    try {
      const resultsRef = collection(db, 'groups', groupId, 'results');
      await addDoc(resultsRef, {
        wodId: wod.id,
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        userAvatar: user.photoURL || '',
        weight: activeTab === 'rx' ? 'RX' : (weight ? `${weight} ${weightUnit}` : ''),
        timeOrReps,
        scale: activeTab === 'rx' ? 'rx' : 'scaled',
        isCapped,
        notes,
        loggedAt: new Date().toISOString()
      });
      // Optionally reset form or show success
      setWeight('');
      setTimeOrReps('');
      setNotes('');
    } catch (e) {
      console.error(e);
    }
    setSubmitting(false);
  };


  return (
    <div className="min-h-screen bg-background pb-28 pt-16">
      {fullScreenImage && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm">
          <button 
            onClick={() => setFullScreenImage(null)} 
            className="absolute top-6 right-6 text-white hover:text-gray-300 bg-black/50 p-2 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
          <img src={fullScreenImage} alt="Fullscreen WOD" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
        </div>
      )}

      <header className="fixed top-0 w-full z-50 bg-surface/60 backdrop-blur-xl border-b border-white/5 shadow-md flex justify-between items-center px-4 md:px-8 py-3 h-16">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-primary-light hover:bg-white/5 transition-colors p-2 rounded-full active:scale-95 duration-150">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-on-surface">
            {group?.name || 'WOD the FAQ'}
          </h1>
        </div>
        <div className="relative">
          <button onClick={() => setShowSettingsMenu(!showSettingsMenu)} className="p-2 rounded-full hover:bg-white/5 transition-colors text-on-surface">
            <MoreVertical size={20} />
          </button>
          {showSettingsMenu && (
            <div className="absolute right-0 top-12 w-48 bg-surface-container-high border border-white/10 rounded-xl shadow-xl overflow-hidden z-50">
              <button 
                onClick={async () => {
                  if (window.confirm('Are you sure you want to leave this group?')) {
                    if (user) await leaveGroup(groupId, user.uid);
                    onBack();
                  }
                }}
                className="w-full text-left px-4 py-3 text-sm font-bold text-on-surface hover:bg-white/5 transition-colors flex items-center gap-2"
              >
                <LogOut size={16} />
                Leave Group
              </button>
              {userRole === 'admin' && (
                <button 
                  onClick={async () => {
                    if (window.confirm('Are you sure you want to delete this group forever?')) {
                      try {
                        await deleteGroup(groupId);
                        onBack();
                      } catch (error) {
                        console.error(error);
                        alert('Could not delete this group. Please try again.');
                      }
                    }
                  }}
                  className="w-full text-left px-4 py-3 text-sm font-bold text-error hover:bg-white/5 transition-colors flex items-center gap-2 border-t border-white/5"
                >
                  <Trash2 size={16} />
                  Delete Group
                </button>
              )}
            </div>
          )}
        </div>
      </header>
      
      <main className="max-w-3xl mx-auto px-4 md:px-8 py-6 flex flex-col gap-8">
        
        {/* Box Header */}
        <section className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-full border-2 border-secondary overflow-hidden bg-surface-container flex items-center justify-center">
                <Dumbbell className="text-secondary" size={24} />
              </div>
              {group?.type === 'official' && (
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-secondary text-on-secondary text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-widest border-2 border-background">
                  Box
                </div>
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-on-surface">{group ? group.name : 'Loading...'}</h2>
              <p className="text-xs text-on-surface-variant font-medium">{group ? `${group.memberCount || 1} Members` : ''}</p>
            </div>
          </div>
        </section>

        {loading ? (
           <div className="text-center text-on-surface-variant my-12 font-bold">Loading...</div>
        ) : (!wod && !showCreateForm) ? (
           <div className="text-center text-on-surface-variant my-12 p-8 border-2 border-dashed border-outline-variant/30 rounded-3xl">
             <Dumbbell className="mx-auto mb-4 text-outline-variant" size={48} />
             <h3 className="text-xl font-bold text-on-surface mb-2">No WOD posted yet</h3>
             
             {(group?.type === 'private' || userRole === 'admin') ? (
               <>
                 <p className="text-sm mb-6">Be the hero and post today's workout.</p>
                 <button onClick={() => setShowCreateForm(true)} className="bg-primary text-white px-6 py-3 rounded-full font-bold shadow-glow hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-wide">
                   Post Today's WOD
                 </button>
               </>
             ) : (
               <p className="text-sm">Check back later or ask your admin to post the workout.</p>
             )}
           </div>
        ) : showCreateForm ? (
           <div className="text-center text-on-surface-variant my-12 p-8 border-2 border-dashed border-outline-variant/30 rounded-3xl">
             <form onSubmit={handleCreateWod} className="text-left space-y-4 glass-panel p-6 rounded-2xl border border-white/5">
                   <div className="flex gap-4">
                     <label className={`flex-1 cursor-pointer bg-surface-container border-2 border-dashed border-outline-variant/30 rounded-xl p-4 flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors ${isTranscribing ? 'opacity-50' : ''}`}>
                       {isTranscribing ? (
                         <div className="w-6 h-6 mb-2 border-2 border-secondary/30 border-t-secondary rounded-full animate-spin" />
                       ) : (
                         <Camera size={24} className="mb-2" />
                       )}
                       <span className="text-xs font-bold uppercase tracking-wider text-center">
                         {isTranscribing ? 'Analyzing...' : 'Upload Photo'}
                       </span>
                       <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isTranscribing} />
                     </label>
                     {newWodImage && (
                       <div className="flex-1 rounded-xl overflow-hidden border border-white/5 relative h-28">
                         <img src={newWodImage} alt="WOD" className="w-full h-full object-cover" />
                         <button type="button" onClick={() => setNewWodImage(null)} className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-black">
                           <X size={14} />
                         </button>
                       </div>
                     )}
                   </div>
                   {isTranscribing && (
                     <div className="bg-secondary/10 border border-secondary/20 rounded-xl px-4 py-3 text-secondary text-xs font-bold uppercase tracking-wider">
                       AI is reading the photo and filling the workout fields...
                     </div>
                   )}
                   {transcriptionError && (
                     <div className="bg-error/10 border border-error/20 rounded-xl px-4 py-3 text-error text-sm font-bold">
                       {transcriptionError}
                     </div>
                   )}
                   {newWodSaveError && (
                     <div className="bg-error/10 border border-error/20 rounded-xl px-4 py-3 text-error text-sm font-bold">
                       {newWodSaveError}
                     </div>
                   )}
                   <div className="space-y-2">
                     <label className="text-xs font-bold text-primary-light uppercase tracking-wider">Title</label>
                     <input type="text" value={newWodTitle} onChange={e => setNewWodTitle(e.target.value)} placeholder="e.g. Hero WOD Murph" className="w-full bg-surface-container rounded-xl px-4 py-3 text-on-surface outline-none focus:ring-2 focus:ring-secondary font-bold" />
                   </div>
                   <div className="space-y-2">
                     <label className="text-xs font-bold text-primary-light uppercase tracking-wider mb-1 block">Workout Type</label>
                     <div className="flex flex-wrap gap-2">
                       {['AMRAP', 'EMOM', 'FOR TIME', 'HEAVY DAY'].map((type) => (
                         <button
                           key={type}
                           type="button"
                           onClick={() => setNewWodType(type)}
                           className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors border ${newWodType === type ? 'bg-secondary text-on-secondary border-secondary shadow-glow' : 'border-outline-variant/30 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'}`}
                         >
                           {type}
                         </button>
                       ))}
                     </div>
                   </div>
                   <div className="space-y-2">
                     <label className="text-xs font-bold text-primary-light uppercase tracking-wider">Workout Details</label>
                     <textarea value={newWodDesc} onChange={e => setNewWodDesc(e.target.value)} placeholder="Describe the workout here..." className="w-full bg-surface-container rounded-xl px-4 py-3 text-sm font-medium text-on-surface outline-none focus:ring-2 focus:ring-secondary h-24 resize-none" required />
                   </div>
                   <div className="space-y-2">
                     <label className="text-xs font-bold text-primary-light uppercase tracking-wider">Time Cap (Optional)</label>
                     <input type="text" value={newWodTimeCap} onChange={e => setNewWodTimeCap(e.target.value)} placeholder="e.g. 20 min, 12:00, 30 minute cap" className="w-full bg-surface-container rounded-xl px-4 py-3 text-sm font-bold text-on-surface outline-none focus:ring-2 focus:ring-secondary" />
                   </div>
                   <div className="space-y-2">
                     <label className="text-xs font-bold text-primary-light uppercase tracking-wider">Notes & Weights (Optional)</label>
                     <textarea value={newWodNotes} onChange={e => setNewWodNotes(e.target.value)} placeholder="e.g. RX Weights: 60kg/40kg..." className="w-full bg-surface-container rounded-xl px-4 py-3 text-sm font-medium text-on-surface outline-none focus:ring-2 focus:ring-secondary h-16 resize-none" />
                   </div>
                   <div className="flex gap-2 mt-4">
                     <button type="button" onClick={() => { setShowCreateForm(false); setIsEditingWod(false); }} className="flex-1 py-3 font-bold text-on-surface-variant hover:text-on-surface">Cancel</button>
                     <button type="submit" disabled={newWodCreating || !newWodDesc} className="flex-1 py-3 bg-secondary text-on-secondary font-bold rounded-full disabled:opacity-50">
                       {newWodCreating ? 'Saving...' : (isEditingWod ? 'Save Changes' : 'Post WOD')}
                     </button>
                   </div>
                 </form>
           </div>
        ) : (
          <>
            {/* WOD Card */}
            <section className="glass-panel rounded-3xl p-6 relative overflow-hidden">
              <div className="absolute top-6 right-6 opacity-20">
                <Dumbbell size={48} />
              </div>
              
              <div className="flex justify-between items-start mb-4">
                <div className="inline-block bg-secondary/20 text-secondary text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-widest">
                  {wod.date || 'WOD of the Day'}
                </div>
                {(group?.type === 'private' || userRole === 'admin') && (
                  <button onClick={handleEditClick} className="text-on-surface-variant hover:text-on-surface text-xs font-bold uppercase tracking-wider">
                    Edit
                  </button>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-on-surface mb-2">{wod.title}</h1>
              {wod.type && <div className="text-secondary font-bold text-sm tracking-widest mb-4 uppercase">{wod.type}</div>}
              {wod.description && <p className="text-on-surface-variant italic mb-8 font-medium">"{wod.description}"</p>}

              {wod.imageUrl && (
                <div className="mb-6 rounded-2xl overflow-hidden border border-white/5 shadow-md cursor-pointer hover:opacity-90 transition-opacity" onClick={() => setFullScreenImage(wod.imageUrl)}>
                  <img src={wod.imageUrl} alt="WOD image" className="w-full h-auto object-cover max-h-96" />
                </div>
              )}

              <div className="space-y-4">
                {wod.strength && (
                  <div className="bg-surface-container/50 p-4 rounded-2xl border border-white/5">
                    <div className="text-secondary text-xs font-bold uppercase tracking-widest mb-1">Strength</div>
                    <div className="text-on-surface-variant text-sm font-medium whitespace-pre-line">{wod.strength}</div>
                  </div>
                )}
                
                <div className="bg-surface-container/50 p-4 rounded-2xl border border-white/5">
                  <div className="text-secondary text-xs font-bold uppercase tracking-widest mb-1">Metcon</div>
                  <div className="text-on-surface-variant text-sm font-medium whitespace-pre-line">{wod.metcon}</div>
                </div>

                {wod.timeCap && (
                  <div className="bg-surface-container/50 p-4 rounded-2xl border border-white/5">
                    <div className="text-secondary text-xs font-bold uppercase tracking-widest mb-1">Cap</div>
                    <div className="text-xl font-bold text-on-surface">{wod.timeCap}</div>
                  </div>
                )}

                {wod.notes && (
                  <div className="bg-surface-container/50 p-4 rounded-2xl border border-white/5">
                    <div className="text-secondary text-xs font-bold uppercase tracking-widest mb-1">Notes</div>
                    <div className="text-on-surface-variant text-sm font-medium whitespace-pre-line">{wod.notes}</div>
                  </div>
                )}
              </div>
            </section>

            {/* Log Performance */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-on-surface">Log<br/>Performance</h3>
                <div className="flex bg-surface-container-high rounded-full p-1 border border-white/5">
                  <button 
                    onClick={() => setActiveTab(activeTab === 'rx' ? null : 'rx')}
                    className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${activeTab === 'rx' ? 'bg-secondary text-on-secondary shadow-glow' : 'text-on-surface-variant hover:text-on-surface'}`}
                  >
                    RX
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center ml-2 pr-1">
                      <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Weight</label>
                      <button 
                        onClick={() => setWeightUnit(weightUnit === 'KG' ? 'LB' : 'KG')} 
                        disabled={activeTab === 'rx'}
                        className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded transition-colors bg-surface-container-high text-on-surface-variant hover:text-on-surface disabled:opacity-50"
                      >
                        {weightUnit}
                      </button>
                    </div>
                    <input 
                      type="text" 
                      value={activeTab === 'rx' ? 'RX' : weight} 
                      onChange={e => setWeight(e.target.value)} 
                      disabled={activeTab === 'rx'}
                      placeholder="0.0" 
                      className="w-full bg-surface-container-low rounded-xl border border-transparent focus:border-secondary px-4 py-4 text-xl font-bold text-on-surface outline-none transition-all disabled:opacity-30 disabled:cursor-not-allowed" 
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center ml-2 pr-1">
                      <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Result</label>
                      <button 
                        onClick={() => setIsCapped(!isCapped)}
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded transition-colors ${isCapped ? 'bg-error/20 text-error border border-error/30' : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'}`}
                      >
                        CAP
                      </button>
                    </div>
                    <input 
                      type="text" 
                      value={timeOrReps} 
                      onChange={e => setTimeOrReps(e.target.value)} 
                      onBlur={handleTimeBlur}
                      placeholder={isCapped ? "Missed reps (e.g. 5)" : "Time or Reps"} 
                      className="w-full bg-surface-container-low rounded-xl border border-transparent focus:border-secondary px-4 py-4 text-xl font-bold text-on-surface outline-none transition-all" 
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant ml-2 uppercase tracking-wider">Adaptations / Notes</label>
                  <textarea 
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Write down your scaling, mods or feelings..." 
                    className="w-full bg-surface-container-low rounded-xl border border-transparent focus:border-secondary px-4 py-3 text-sm font-medium text-on-surface outline-none transition-all resize-none h-20" 
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <button disabled={submitting || !timeOrReps} onClick={handleSubmitResult} className="flex-1 bg-secondary text-on-secondary font-bold text-lg rounded-full shadow-glow hover:scale-[1.02] active:scale-95 transition-all duration-200 uppercase tracking-wide h-14 disabled:opacity-50">
                  {submitting ? 'Logging...' : 'Submit Result'}
                </button>
                <button className="w-14 h-14 rounded-full border border-outline-variant text-on-surface-variant flex items-center justify-center hover:bg-white/5 active:scale-95 transition-all">
                  <Camera size={20} />
                </button>
              </div>
            </section>
          </>
        )}


        {/* Tabs for Leaderboard / Feed */}
        <section className="mt-4">
          <div className="flex border-b border-outline-variant/30">
            <button 
              onClick={() => setActiveLeaderboardTab('leaderboard')}
              className={`flex-1 pb-4 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${activeLeaderboardTab === 'leaderboard' ? 'text-secondary border-secondary' : 'text-on-surface-variant border-transparent hover:text-on-surface'}`}
            >
              Leaderboard
            </button>
            <button 
              onClick={() => setActiveLeaderboardTab('community')}
              className={`flex-1 pb-4 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${activeLeaderboardTab === 'community' ? 'text-secondary border-secondary' : 'text-on-surface-variant border-transparent hover:text-on-surface'}`}
            >
              Community Feed
            </button>
          </div>

          {activeLeaderboardTab === 'leaderboard' && (
            <div className="mt-8 space-y-6">
              
              {/* Top 3 Podium */}
              {results.length > 0 && (
                <div className="flex justify-center items-end gap-2 md:gap-6 pt-10 pb-6 px-2">
                  {/* 2nd Place */}
                  {results[1] && (
                    <div className="flex flex-col items-center flex-1 z-10">
                      <div className="relative mb-2">
                        {results[1].userAvatar ? (
                           <img src={results[1].userAvatar} alt="" className="w-16 h-16 rounded-full border-4 border-surface-container-high object-cover" />
                        ) : (
                           <div className="w-16 h-16 rounded-full border-4 border-surface-container-high bg-surface-container flex items-center justify-center font-bold text-xs">{results[1].userName?.substring(0, 2).toUpperCase()}</div>
                        )}
                        <div className="absolute -top-3 -right-2 bg-slate-300 text-slate-800 text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full border-2 border-background">#2</div>
                      </div>
                      <div className="text-xs font-bold text-on-surface mb-2">{results[1].userName}</div>
                      <div className="w-full h-24 bg-surface-container-high rounded-t-xl" />
                    </div>
                  )}

                  {/* 1st Place */}
                  {results[0] && (
                    <div className="flex flex-col items-center flex-1 z-20">
                      <div className="relative mb-2">
                        <div className="absolute -inset-2 bg-secondary/30 rounded-full blur-md" />
                        {results[0].userAvatar ? (
                           <img src={results[0].userAvatar} alt="" className="relative w-20 h-20 rounded-full border-4 border-secondary object-cover" />
                        ) : (
                           <div className="relative w-20 h-20 rounded-full border-4 border-secondary bg-surface-container flex items-center justify-center font-bold text-xs">{results[0].userName?.substring(0, 2).toUpperCase()}</div>
                        )}
                        <div className="absolute -top-3 -right-2 bg-secondary text-on-secondary text-[10px] font-black w-7 h-7 flex items-center justify-center rounded-full border-2 border-background shadow-glow">#1</div>
                      </div>
                      <div className="text-xs font-bold text-secondary mb-2">{results[0].userName}</div>
                      <div className="w-full h-32 bg-[#313b18] rounded-t-xl" />
                    </div>
                  )}

                  {/* 3rd Place */}
                  {results[2] && (
                    <div className="flex flex-col items-center flex-1 z-10">
                      <div className="relative mb-2">
                        {results[2].userAvatar ? (
                           <img src={results[2].userAvatar} alt="" className="w-14 h-14 rounded-full border-4 border-[#b07044] object-cover" />
                        ) : (
                           <div className="w-14 h-14 rounded-full border-4 border-[#b07044] bg-surface-container flex items-center justify-center font-bold text-xs">{results[2].userName?.substring(0, 2).toUpperCase()}</div>
                        )}
                        <div className="absolute -top-3 -right-2 bg-[#d97c3b] text-white text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full border-2 border-background">#3</div>
                      </div>
                      <div className="text-xs font-bold text-on-surface mb-2">{results[2].userName}</div>
                      <div className="w-full h-20 bg-[#422d20] rounded-t-xl" />
                    </div>
                  )}
                </div>
              )}

              {/* List */}
              <div className="space-y-2">
                {results.length === 0 ? (
                  <div className="text-center text-on-surface-variant py-8">No results logged yet. Be the first!</div>
                ) : (
                  results.map((result, index) => (
                    <div key={result.id} className={`flex items-center justify-between p-4 rounded-xl ${result.userId === user?.uid ? 'border-l-4 border-secondary bg-secondary/5' : 'bg-surface-container-low'}`}>
                      <div className="flex items-center gap-4">
                        <span className={`text-sm font-bold w-4 ${result.userId === user?.uid ? 'text-secondary' : 'text-on-surface-variant'}`}>{index + 1}</span>
                        {result.userAvatar ? (
                          <img src={result.userAvatar} className="w-10 h-10 rounded-full object-cover" alt="" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center font-bold text-xs">{result.userName?.substring(0, 2).toUpperCase()}</div>
                        )}
                        <span className={`font-bold ${result.userId === user?.uid ? 'text-secondary' : 'text-on-surface'}`}>{result.userName}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg text-on-surface">{result.timeOrReps}</div>
                        <div className="text-[10px] font-bold text-secondary uppercase tracking-widest">{result.scale} {result.isCapped && '(Capped)'}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>
          )}
        </section>

      </main>
    </div>
  );
}
