const fs = require('fs');
let content = fs.readFileSync('src/screens/WodScreen.tsx', 'utf8');

const target1 = `        {loading ? (
           <div className="text-center text-on-surface-variant my-12 font-bold">Loading...</div>
        ) : !wod ? (
           <div className="text-center text-on-surface-variant my-12 p-8 border-2 border-dashed border-outline-variant/30 rounded-3xl">
             <Dumbbell className="mx-auto mb-4 text-outline-variant" size={48} />
             <h3 className="text-xl font-bold text-on-surface mb-2">No WOD posted yet</h3>
             
             {(group?.type === 'private' || userRole === 'admin') ? (
               showCreateForm ? (
                 <form onSubmit={handleCreateWod} className="mt-6 text-left space-y-4 glass-panel p-6 rounded-2xl border border-white/5">`;

const replacement1 = `        {loading ? (
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

content = content.replace(target1, replacement1);
fs.writeFileSync('src/screens/WodScreen.tsx', content);
console.log('Replaced successfully');
