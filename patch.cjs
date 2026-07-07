const fs = require('fs');
let content = fs.readFileSync('src/screens/WodScreen.tsx', 'utf8');

const target = `                    <div className="space-y-2">
                      <label className="text-xs font-bold text-primary-light uppercase tracking-wider">Workout Details</label>
                      <textarea value={newWodDesc} onChange={e => setNewWodDesc(e.target.value)} placeholder="Describe the workout here..." className="w-full bg-surface-container rounded-xl px-4 py-3 text-sm font-medium text-on-surface outline-none focus:ring-2 focus:ring-secondary h-24 resize-none" required />
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button type="button" onClick={() => setShowCreateForm(false)} className="flex-1 py-3 font-bold text-on-surface-variant hover:text-on-surface">Cancel</button>
                      <button type="submit" disabled={newWodCreating || !newWodDesc} className="flex-1 py-3 bg-secondary text-on-secondary font-bold rounded-full disabled:opacity-50">
                        {newWodCreating ? 'Posting...' : 'Post WOD'}
                      </button>
                    </div>
                  </form>`;

const replacement = `                    <div className="space-y-2">
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
                  </form>`;

content = content.replace(target, replacement);

const targetCard1 = `              <div className="inline-block bg-secondary/20 text-secondary text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-widest mb-4">
                {wod.date || 'WOD of the Day'}
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-on-surface mb-2">{wod.title}</h1>
              {wod.description && <p className="text-on-surface-variant italic mb-8 font-medium">"{wod.description}"</p>}

              {wod.imageUrl && (
                <div className="mb-6 rounded-2xl overflow-hidden border border-white/5 shadow-md">
                  <img src={wod.imageUrl} alt="WOD image" className="w-full h-auto object-cover max-h-96" />
                </div>
              )}`;

const replacementCard1 = `              <div className="flex justify-between items-start mb-4">
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
              )}`;

content = content.replace(targetCard1, replacementCard1);

const targetCard2 = `                {wod.timeCap && (
                  <div className="bg-surface-container/50 p-4 rounded-2xl border border-white/5">
                    <div className="text-secondary text-xs font-bold uppercase tracking-widest mb-1">Cap</div>
                    <div className="text-xl font-bold text-on-surface">{wod.timeCap}</div>
                  </div>
                )}
              </div>`;

const replacementCard2 = `                {wod.timeCap && (
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
              </div>`;
content = content.replace(targetCard2, replacementCard2);
fs.writeFileSync('src/screens/WodScreen.tsx', content);
console.log('Replaced successfully');
