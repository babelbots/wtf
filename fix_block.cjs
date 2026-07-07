const fs = require('fs');
let content = fs.readFileSync('src/screens/WodScreen.tsx', 'utf8');

const target = `                   <div className="flex gap-2 mt-4">
                     <button type="button" onClick={() => setShowCreateForm(false)} className="flex-1 py-3 font-bold text-on-surface-variant hover:text-on-surface">Cancel</button>
                     <button type="submit" disabled={newWodCreating || !newWodDesc} className="flex-1 py-3 bg-secondary text-on-secondary font-bold rounded-full disabled:opacity-50">
                       {newWodCreating ? 'Posting...' : 'Post WOD'}
                     </button>
                   </div>
                 </form>
               ) : (
                 <>
                   <p className="text-sm mb-6">Be the hero and post today's workout.</p>
                   <button onClick={() => setShowCreateForm(true)} className="bg-primary text-white px-6 py-3 rounded-full font-bold shadow-glow hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-wide">
                     Post Today's WOD
                   </button>
                 </>
               )
             ) : (
               <p className="text-sm">Check back later or ask your admin to post the workout.</p>
             )}
           </div>
        ) : (
          <>
            {/* WOD Card */}`;

const replacement = `                   <div className="flex gap-2 mt-4">
                     <button type="button" onClick={() => { setShowCreateForm(false); setIsEditingWod(false); }} className="flex-1 py-3 font-bold text-on-surface-variant hover:text-on-surface">Cancel</button>
                     <button type="submit" disabled={newWodCreating || !newWodDesc} className="flex-1 py-3 bg-secondary text-on-secondary font-bold rounded-full disabled:opacity-50">
                       {newWodCreating ? 'Saving...' : (isEditingWod ? 'Save Changes' : 'Post WOD')}
                     </button>
                   </div>
                 </form>
           </div>
        ) : (
          <>
            {/* WOD Card */}`;

content = content.replace(target, replacement);

const targetType = `                   <div className="space-y-2">
                     <label className="text-xs font-bold text-primary-light uppercase tracking-wider">Workout Details</label>
                     <textarea value={newWodDesc} onChange={e => setNewWodDesc(e.target.value)} placeholder="Describe the workout here..." className="w-full bg-surface-container rounded-xl px-4 py-3 text-sm font-medium text-on-surface outline-none focus:ring-2 focus:ring-secondary h-24 resize-none" required />
                   </div>
                   <div className="flex gap-2 mt-4">`;

const replacementType = `                   <div className="space-y-2">
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
                   <div className="flex gap-2 mt-4">`;
content = content.replace(targetType, replacementType);

fs.writeFileSync('src/screens/WodScreen.tsx', content);
