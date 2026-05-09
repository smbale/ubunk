import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './hooks/useAuth';
import { SubmissionRing } from './components/SubmissionRing';
import { RingsideFeed } from './components/RingsideFeed';
import { Leaderboard } from './components/Leaderboard';
import { FighterProfile } from './components/FighterProfile';
import { HallOfFame } from './components/HallOfFame';
import { Trophy, Home, User as UserIcon, LogIn, Swords, Award } from 'lucide-react';
import { cn } from './lib/utils';

export default function App() {
  const { user, fighter, loading, signIn } = useAuth();
  const [activeTab, setActiveTab] = useState<'ring' | 'feed' | 'leaderboard' | 'profile' | 'fame'>('ring');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-brand font-display text-6xl italic"
        >
          UBUNK
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black px-4 boxing-grid">
        <motion.h1
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-8xl md:text-12xl font-display italic text-brand mb-8 text-center"
        >
          UBUNK
        </motion.h1>
        <p className="text-xl text-zinc-400 mb-12 text-center max-w-md">
          Step into the arena. Knockout the nonsense. Prove you're a heavyweight truth-teller.
        </p>
        <button
          onClick={signIn}
          className="group relative flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full font-bold text-xl hover:bg-brand hover:text-white transition-all duration-300"
        >
          <LogIn className="group-hover:translate-x-1 transition-transform" />
          ENTER THE GYM
        </button>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'ring':
        return <SubmissionRing />;
      case 'feed':
        return <RingsideFeed />;
      case 'leaderboard':
        return <Leaderboard />;
      case 'profile':
        return <FighterProfile />;
      case 'fame':
        return <HallOfFame />;
      default:
        return <SubmissionRing />;
    }
  };

  return (
    <div className="min-h-screen bg-black boxing-grid selection:bg-brand selection:text-white pb-24">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-display italic text-brand tracking-tighter">UBUNK</h1>
            <div className="hidden sm:block h-4 w-px bg-white/20" />
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Weight Class</span>
              <span className="text-xs font-bold text-gold uppercase">{fighter?.weightClass}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4 bg-zinc-900/50 rounded-full px-4 py-1.5 border border-white/5">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-mono text-zinc-500 leading-none">REPUTATION</span>
              <span className="text-sm font-bold text-brand leading-none">{fighter?.reputationPoints} RP</span>
            </div>
            <div className="h-6 w-px bg-white/10" />
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-mono text-zinc-500 leading-none">RECORD</span>
              <span className="text-sm font-bold leading-none">
                {fighter?.record.wins}-{fighter?.record.losses}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto pt-24 px-4 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Navigation */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-zinc-900 border border-white/10 rounded-full p-2 flex items-center gap-2 shadow-2xl shadow-brand/20">
        <NavButton
          icon={<Swords size={20} />}
          label="The Ring"
          active={activeTab === 'ring'}
          onClick={() => setActiveTab('ring')}
        />
        <NavButton
          icon={<Home size={20} />}
          label="Ringside"
          active={activeTab === 'feed'}
          onClick={() => setActiveTab('feed')}
        />
        <NavButton
          icon={<Trophy size={20} />}
          label="Ranks"
          active={activeTab === 'leaderboard'}
          onClick={() => setActiveTab('leaderboard')}
        />
        <NavButton
          icon={<Award size={20} />}
          label="Hall of Fame"
          active={activeTab === 'fame'}
          onClick={() => setActiveTab('fame')}
        />
        <NavButton
          icon={<UserIcon size={20} />}
          label="Profile"
          active={activeTab === 'profile'}
          onClick={() => setActiveTab('profile')}
        />
      </nav>
    </div>
  );
}

function NavButton({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300",
        active ? "bg-brand text-white shadow-lg shadow-brand/40" : "text-zinc-500 hover:text-white hover:bg-white/5"
      )}
    >
      {icon}
      {active && <span className="text-xs font-bold uppercase tracking-widest">{label}</span>}
    </button>
  );
}
