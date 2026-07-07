const fs = require('fs');
let content = fs.readFileSync('src/screens/WodScreen.tsx', 'utf8');

// I'll just change the main logic here:
// From:
//        ) : (!wod || showCreateForm) ? (
//           <div className="text-center text-on-surface-variant my-12 p-8 border-2 border-dashed border-outline-variant/30 rounded-3xl">

const target = `        {loading ? (
           <div className="text-center text-on-surface-variant my-12 font-bold">Loading...</div>
        ) : (!wod || showCreateForm) ? (
           <div className="text-center text-on-surface-variant my-12 p-8 border-2 border-dashed border-outline-variant/30 rounded-3xl">
             {!wod && (
               <>
                 <Dumbbell className="mx-auto mb-4 text-outline-variant" size={48} />
                 <h3 className="text-xl font-bold text-on-surface mb-2">No WOD posted yet</h3>
               </>
             )}
             
             {(group?.type === 'private' || userRole === 'admin') ? (
               showCreateForm ? (
                 <form onSubmit={handleCreateWod} className="mt-6 text-left space-y-4 glass-panel p-6 rounded-2xl border border-white/5">`;

const replacement = `        {loading ? (
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
             <form onSubmit={handleCreateWod} className="text-left space-y-4 glass-panel p-6 rounded-2xl border border-white/5">`;

content = content.replace(target, replacement);

const target2 = `                 </form>
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
            {/* WOD Display */}
            <section className="glass-card p-6 md:p-8 rounded-3xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>`;

const replacement2 = `                 </form>
           </div>
        ) : (
          <>
            {/* WOD Display */}
            <section className="glass-card p-6 md:p-8 rounded-3xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>`;

content = content.replace(target2, replacement2);
fs.writeFileSync('src/screens/WodScreen.tsx', content);
console.log('Patch complete');
