const fs = require('fs');
let content = fs.readFileSync('src/screens/WodScreen.tsx', 'utf8');

const target = `                   <div className="flex gap-2 mt-4">
                      <button type="button" onClick={() => { setShowCreateForm(false); setIsEditingWod(false); }} className="flex-1 py-3 font-bold text-on-surface-variant hover:text-on-surface">Cancel</button>
                      <button type="submit" disabled={newWodCreating || !newWodDesc} className="flex-1 py-3 bg-secondary text-on-secondary font-bold rounded-full disabled:opacity-50">
                        {newWodCreating ? 'Saving...' : (isEditingWod ? 'Save Changes' : 'Post WOD')}
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
             {/* WOD Display */}`;

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
             {/* WOD Display */}`;

content = content.replace(target, replacement);
fs.writeFileSync('src/screens/WodScreen.tsx', content);
