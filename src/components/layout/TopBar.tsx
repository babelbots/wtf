import React, { useState } from 'react';
import { Menu, LogOut, Settings } from 'lucide-react';
import { logout } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';

interface TopBarProps {
  title?: string;
  showSettings?: boolean;
}

export function TopBar({ title = "WOD the FAQ", showSettings = false }: TopBarProps) {
  const { user } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="fixed top-0 w-full z-50 bg-surface/60 backdrop-blur-xl border-b border-white/5 shadow-md flex justify-between items-center px-4 md:px-8 py-3 h-16">
      <div className="flex items-center gap-3">
        <button 
          onClick={() => setShowMenu(!showMenu)}
          className="text-primary-light hover:bg-white/5 transition-colors p-2 rounded-full active:scale-95 duration-150"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-on-surface">
          {title}
        </h1>
      </div>
      <div className="flex items-center gap-2 relative">
        {user && (
          <button 
            onClick={() => logout()}
            className="text-on-surface-variant hover:text-error hover:bg-white/5 transition-colors p-2 rounded-full active:scale-95 flex items-center gap-2"
          >
            {user.photoURL ? (
              <img src={user.photoURL} alt="Avatar" className="w-8 h-8 rounded-full border border-outline-variant" />
            ) : (
              <LogOut size={20} />
            )}
          </button>
        )}
      </div>
    </header>
  );
}
