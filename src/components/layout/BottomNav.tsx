import React from 'react';
import { Home, Dumbbell, Users, User, Search } from 'lucide-react';
import { Screen } from '../../types';

interface BottomNavProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

export function BottomNav({ currentScreen, onNavigate }: BottomNavProps) {
  if (currentScreen === 'login') return null;

  return (
    <nav className="fixed bottom-0 w-full z-50 rounded-t-3xl bg-surface-container/90 backdrop-blur-xl border-t border-white/5 shadow-[0_-8px_30px_rgba(195,192,255,0.15)] flex justify-around items-center h-20 px-4 pb-safe">
      <NavItem 
        icon={<Home size={24} />} 
        label="Home" 
        isActive={currentScreen === 'home'} 
        onClick={() => onNavigate('home')} 
      />
      <NavItem 
        icon={<Dumbbell size={24} />} 
        label="Workouts" 
        isActive={false} 
        onClick={() => {}} 
      />

      <NavItem 
        icon={<Users size={24} />} 
        label="Squads" 
        isActive={currentScreen === 'wod'} 
        onClick={() => {}} 
      />

      <NavItem 
        icon={<User size={24} />} 
        label="Profile" 
        isActive={false} 
        onClick={() => {}} 
      />
    </nav>
  );
}

function NavItem({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center px-4 py-2 transition-all active:scale-90 duration-200 ${
        isActive ? 'text-secondary' : 'text-on-surface-variant opacity-70 hover:opacity-100'
      }`}
    >
      {icon}
      {isActive && <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">{label}</span>}
    </button>
  );
}
