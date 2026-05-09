import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { 
  Flame, 
  Trophy, 
  TrendingUp, 
  Target, 
  LogOut, 
  ShieldCheck,
  Swords
} from 'lucide-react';
import { cn } from '../lib/utils';

export function FighterProfile() {
  const { fighter, signOut } = useAuth();

  if (!fighter) return null;

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Profile Header */}
      <div className="flex flex-col items-center mb-12">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative mb-6"
        >
          <div className="w-32 h-32 rounded-[40px] bg-zinc-900 border-4 border-brand flex items-center justify-center overflow-hidden rotate-3">
             {fighter.photoURL ? (
               <img src={fighter.photoURL} alt={fighter.username} className="w-full h-full object-cover -rotate-3" />
             ) : (
               <span className="text-6xl font-display italic text-brand -rotate-3">{fighter.username[0].toUpperCase()}</span>
             )}
          </div>
          <div className="absolute -bottom-2 -right-2 bg-gold p-2 rounded-2xl shadow-xl rotate-12">
            <Trophy size={20} className="text-black" />
          </div>
        </motion.div>

        <h2 className="text-5xl font-display italic text-white uppercase tracking-tighter mb-2">{fighter.username}</h2>
        <div className="flex items-center gap-3">
          <span className="px-4 py-1 bg-brand text-white rounded-full text-xs font-black italic uppercase italic tracking-widest">
            {fighter.weightClass}
          </span>
          <div className="flex items-center gap-1 text-gold">
             <Flame size={16} fill="currentColor" />
             <span className="text-sm font-bold">{fighter.streak} Day Streak</span>
          </div>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <StatCard 
          icon={<TrendingUp className="text-brand" />} 
          label="Total RP" 
          value={fighter.reputationPoints.toLocaleString()} 
        />
        <StatCard 
          icon={<ShieldCheck className="text-green-500" />} 
          label="Wins" 
          value={fighter.record.wins} 
        />
        <StatCard 
          icon={<Target className="text-red-500" />} 
          label="Losses" 
          value={fighter.record.losses} 
        />
        <StatCard 
          icon={<Swords className="text-gold" />} 
          label="Bouts" 
          value={fighter.record.wins + fighter.record.losses} 
        />
      </div>

      {/* Hall of Fame Preview or Achievements */}
      <div className="bg-zinc-900/40 border border-white/5 rounded-[32px] p-8 mb-12">
        <h3 className="text-xl font-display italic text-zinc-400 mb-6 uppercase tracking-widest">Training Progress</h3>
        <div className="space-y-6">
           <ProgressItem label="Speed Bag (Response Time)" percentage={85} />
           <ProgressItem label="Heavy Bag (Fact Precision)" percentage={72} />
           <ProgressItem label="Shadow Boxing (Debunk Quality)" percentage={94} />
        </div>
      </div>

      {/* Settings/Account */}
      <div className="flex justify-center">
        <button
          onClick={signOut}
          className="flex items-center gap-2 text-zinc-500 hover:text-red-500 transition-colors uppercase font-mono text-xs tracking-widest"
        >
          <LogOut size={16} />
          Leave the Gym
        </button>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) {
  return (
    <div className="bg-zinc-900/50 border border-white/10 p-6 rounded-3xl flex flex-col items-center">
      <div className="mb-3">{icon}</div>
      <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">{label}</div>
      <div className="text-2xl font-black italic text-white">{value}</div>
    </div>
  );
}

function ProgressItem({ label, percentage }: { label: string, percentage: number }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-bold text-zinc-300">{label}</span>
        <span className="text-xs font-mono text-zinc-500">{percentage}%</span>
      </div>
      <div className="h-2 bg-black rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          className="h-full bg-brand" 
        />
      </div>
    </div>
  );
}
