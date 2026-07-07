const fs = require('fs');
let content = fs.readFileSync('src/screens/WodScreen.tsx', 'utf8');

const targetStr = `{loading ? (
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
                     <label className={\`flex-1 cursor-pointer bg-surface-container border-2 border-dashed border-outline-variant/30 rounded-xl p-4 flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors \${isTranscribing ? 'opacity-50' : ''}\`}>
                       <Camera size={24} className="mb-2" />
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
                           className={\`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors border \${newWodType === type ? 'bg-secondary text-on-secondary border-secondary shadow-glow' : 'border-outline-variant/30 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'}\`}
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
        ) : (`;

const startIndex = content.indexOf('{loading ? (');
const endIndex = content.indexOf('             {/* WOD Card */}');

if (startIndex !== -1 && endIndex !== -1) {
  content = content.substring(0, startIndex) + targetStr + '\n          <>\n' + content.substring(endIndex);
  fs.writeFileSync('src/screens/WodScreen.tsx', content);
  console.log('Fixed');
} else {
  console.log('Could not find indices');
}
