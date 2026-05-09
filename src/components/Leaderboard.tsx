import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Fighter } from '../types';
import { Trophy, Medal, Star } from 'lucide-react';
import { cn } from '../lib/utils';

export function Leaderboard() {
  const [fighters, setFighters] = useState<Fighter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'fighters'),
      orderBy('reputationPoints', 'desc'),
      limit(50)
    );

    return onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => d.data() as Fighter);
      setFighters(docs);
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="relative mb-16 h-48 rounded-[40px] overflow-hidden bg-brand/20 border-2 border-brand flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
        <Trophy className="text-gold mb-2 relative z-20" size={48} />
        <h2 className="text-5xl font-display italic text-white relative z-20 uppercase tracking-tighter">TITLE RANKINGS</h2>
        <p className="text-gold/60 font-mono text-xs uppercase tracking-widest relative z-20 mt-2">The Heavyweight Division</p>
        
        {/* Animated belt decorations */}
        <div className="absolute -left-12 top-1/2 -translate-y-1/2 opacity-20">
          <Star size={120} className="text-gold animate-spin-slow" />
        </div>
        <div className="absolute -right-12 top-1/2 -translate-y-1/2 opacity-20">
          <Star size={120} className="text-gold animate-spin-slow" />
        </div>
      </div>

      <div className="space-y-3">
        {fighters.map((fighter, index) => (
          <motion.div
            key={fighter.uid}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              "flex items-center gap-4 p-5 rounded-2xl border transition-all duration-300",
              index === 0 ? "bg-gold/10 border-gold/30 ring-1 ring-gold/20" : 
              index === 1 ? "bg-zinc-100/5 border-zinc-500/30" :
              index === 2 ? "bg-orange-900/10 border-orange-900/30" : "bg-zinc-900/30 border-white/5"
            )}
          >
            <div className={cn(
              "w-12 h-12 flex items-center justify-center font-display italic text-2xl rounded-xl",
              index === 0 ? "bg-gold text-black shadow-lg shadow-gold/20" : 
              index === 1 ? "bg-zinc-400 text-black" :
              index === 2 ? "bg-orange-800 text-white" : "bg-zinc-900 text-zinc-500"
            )}>
              {index + 1}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-white">{fighter.username}</span>
                {index === 0 && <Medal size={20} className="text-gold" />}
              </div>
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest transition-all">
                {fighter.weightClass}
              </span>
            </div>

            <div className="flex items-center gap-8">
              <div className="text-right hidden sm:block">
                <div className="text-[10px] font-mono text-zinc-500 uppercase leading-none mb-1">Record</div>
                <div className="text-sm font-bold text-white leading-none">
                  {fighter.record.wins}-{fighter.record.losses}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-mono text-zinc-500 uppercase leading-none mb-1">Reputation</div>
                <div className="text-lg font-black italic text-brand leading-none">
                  {fighter.reputationPoints.toLocaleString()} RP
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}
