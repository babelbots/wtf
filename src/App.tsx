import React, { useState } from 'react';
import { Screen } from './types';
import { LoginScreen } from './screens/LoginScreen';
import { WodScreen } from './screens/WodScreen';
import { HomeScreen } from './screens/HomeScreen';
import { CreateGroupScreen } from './screens/CreateGroupScreen';
import { JoinGroupScreen } from './screens/JoinGroupScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { SeasonRankingScreen } from './screens/SeasonRankingScreen';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-on-surface">Loading...</div>;
  }

  if (!user) {
    return <LoginScreen />;
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'wod':
        return <WodScreen groupId={activeGroupId!} onBack={() => setCurrentScreen('home')} onNavigateToRanking={() => setCurrentScreen('season-ranking')} />;
      case 'season-ranking':
        return <SeasonRankingScreen groupId={activeGroupId!} onBack={() => setCurrentScreen('wod')} />;
      case 'create-group':
        return <CreateGroupScreen onBack={() => setCurrentScreen('home')} onCreate={() => setCurrentScreen('home')} />;
      case 'join-group':
        return <JoinGroupScreen onBack={() => setCurrentScreen('home')} onJoin={() => setCurrentScreen('home')} />;
      case 'profile':
        return <ProfileScreen onBack={() => setCurrentScreen('home')} />;
      case 'home':
      default:
        return <HomeScreen 
          onNavigateToGroup={(id) => {
            setActiveGroupId(id);
            setCurrentScreen('wod');
          }} 
          onNavigateToCreateGroup={() => setCurrentScreen('create-group')}
          onNavigateToJoinGroup={() => setCurrentScreen('join-group')}
          onNavigateToProfile={() => setCurrentScreen('profile')}
        />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-background font-sans selection:bg-secondary selection:text-on-secondary">
      {renderScreen()}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}


