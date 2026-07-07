const fs = require('fs');
let content = fs.readFileSync('src/screens/WodScreen.tsx', 'utf8');

const target1 = `import { Camera, Dumbbell, Trophy, ArrowLeft, X } from 'lucide-react';
import { TopBar } from '../components/layout/TopBar';`;

const replacement1 = `import { Camera, Dumbbell, Trophy, ArrowLeft, X, MoreVertical, LogOut, Trash2 } from 'lucide-react';
import { TopBar } from '../components/layout/TopBar';
import { leaveGroup, deleteGroup } from '../lib/db';`;

content = content.replace(target1, replacement1);

const target2 = `  const [newWodCreating, setNewWodCreating] = useState(false);
  const [isEditingWod, setIsEditingWod] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);`;

const replacement2 = `  const [newWodCreating, setNewWodCreating] = useState(false);
  const [isEditingWod, setIsEditingWod] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);`;

content = content.replace(target2, replacement2);

const target3 = `      <header className="fixed top-0 w-full z-50 bg-surface/60 backdrop-blur-xl border-b border-white/5 shadow-md flex justify-between items-center px-4 md:px-8 py-3 h-16">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-primary-light hover:bg-white/5 transition-colors p-2 rounded-full active:scale-95 duration-150">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-on-surface">
            CrossFit Valhalla
          </h1>
        </div>
      </header>`;

const replacement3 = `      <header className="fixed top-0 w-full z-50 bg-surface/60 backdrop-blur-xl border-b border-white/5 shadow-md flex justify-between items-center px-4 md:px-8 py-3 h-16">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-primary-light hover:bg-white/5 transition-colors p-2 rounded-full active:scale-95 duration-150">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-on-surface">
            CrossFit Valhalla
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
                      await deleteGroup(groupId);
                      onBack();
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
      </header>`;

content = content.replace(target3, replacement3);

fs.writeFileSync('src/screens/WodScreen.tsx', content);
console.log('Menu patched');
