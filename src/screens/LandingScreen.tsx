import React from 'react';
import { Dumbbell, Users, Trophy, Activity, ArrowRight } from 'lucide-react';

interface LandingScreenProps {
  onLogin: () => void;
}

export function LandingScreen({ onLogin }: LandingScreenProps) {
  const backgrounds = [
    '/bg_crossfit_1_1783526187355.jpg',
    '/bg_crossfit_2_1783526197644.jpg',
    '/bg_crossfit_3_1783526207597.jpg'
  ];
  
  // Use a fixed background or random for landing
  const bg = backgrounds[0];

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-background text-on-background">
      {/* Background Layer with gradients for aesthetic appeal */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 scale-105"
          style={{ backgroundImage: `url('${bg}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background/90 via-background/80 to-background/95" />
        <div className="absolute inset-0 vibrant-glow-purple mix-blend-screen opacity-50" />
        <div className="absolute top-0 right-0 w-full h-full vibrant-glow-green mix-blend-screen opacity-30" />
      </div>

      {/* Header */}
      <header className="relative z-10 w-full px-6 py-8 flex justify-between items-center max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-secondary rounded-xl shadow-glow">
            <Dumbbell className="text-on-secondary w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">WOD the FAQ</span>
        </div>
        <button 
          onClick={onLogin}
          className="px-6 py-2 rounded-full glass-panel font-semibold hover:bg-white/10 transition-colors active:scale-95 text-white"
        >
          Log In
        </button>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12 max-w-6xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight text-white drop-shadow-lg">
            Train together.<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-primary-light">
              Compete for fun.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-on-surface-variant mb-10 max-w-2xl mx-auto leading-relaxed">
            WOD the FAQ is the ultimate app for group workouts. Track your fitness progress, compete with friends, and log your suffering in a beautifully designed, entertaining way.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={onLogin}
              className="flex items-center justify-center gap-2 px-8 py-4 bg-secondary text-on-secondary rounded-full font-bold text-lg hover:bg-secondary-container transition-all hover:scale-105 active:scale-95 shadow-glow"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 w-full animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
          <FeatureCard 
            icon={<Users className="w-8 h-8 text-secondary" />}
            title="Group Workouts"
            description="Create or join groups to share your WODs and see how everyone else performed."
          />
          <FeatureCard 
            icon={<Trophy className="w-8 h-8 text-primary-light" />}
            title="Compete for Results"
            description="Climb the season rankings. Friendly competition pushes you to give your best."
          />
          <FeatureCard 
            icon={<Activity className="w-8 h-8 text-tertiary" />}
            title="Track Your Work"
            description="Log your scores, keep a history of your workouts, and visualize your progress over time."
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-8 text-center text-on-surface-variant text-sm mt-auto border-t border-white/5 bg-background/50 backdrop-blur-md">
        <p>&copy; {new Date().getFullYear()} WOD the FAQ. All rights reserved.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="glass-card p-8 rounded-3xl flex flex-col items-start hover:-translate-y-2 transition-transform duration-300">
      <div className="p-4 bg-white/5 rounded-2xl mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
      <p className="text-on-surface-variant leading-relaxed">
        {description}
      </p>
    </div>
  );
}
