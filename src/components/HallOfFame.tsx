import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { collection, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Fight, Fighter } from '../types';
import { Award, Star, History, Skull } from 'lucide-react';

export function HallOfFame() {
  const [legendaryKOs, setLegendaryKOs] = useState<Fight[]>([]);
  const [topFighters, setTopFighters] = useState<Fighter[]>([]);

  useEffect(() => {
    // Top cheers
    const qFights = query(
      collection(db, 'fights'),
      where('cheers', '>=', 5),
      orderBy('cheers', 'desc'),
      limit(5)
    );

    // Top RP
    const qFighters = query(
      collection(db, 'fighters'),
      orderBy('reputationPoints', 'desc'),
      limit(3)
    );

    const unsubFights = onSnapshot(qFights, (snap) => {
      setLegendaryKOs(snap.docs.map(d => ({ id: d.id, ...d.data() } as Fight)));
    });

    const unsubFighters = onSnapshot(qFighters, (snap) => {
      setTopFighters(snap.docs.map(d => d.data() as Fighter));
    });

    return () => {
      unsubFights();
      unsubFighters();
    };
  }, []);

  return (
    <div className="max-w-5xl mx-auto py-12">
      <div className="text-center mb-16">
        <h2 className="text-7xl font-display italic text-gold uppercase tracking-tighter mb-4">HALL OF FAME</h2>
        <p className="text-zinc-500 font-mono text-sm uppercase tracking-[0.3em] font-bold">Immortalizing the Champions of Truth</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Champions Wall */}
        <div className="space-y-8">
           <div className="flex items-center gap-3 mb-6">
             <Award className="text-gold" size={32} />
             <h3 className="text-2xl font-display italic uppercase tracking-tight">Wall of Champions</h3>
           </div>
           
           <div className="space-y-4">
             {topFighters.map((fighter, i) => (
                <motion.div
                  key={fighter.uid}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-6 p-6 bg-zinc-900/40 border-2 border-gold/20 rounded-[32px]"
                >
                  <div className="text-4xl font-display italic text-gold/40">{i + 1}</div>
                  <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center text-2xl font-display text-gold border border-gold/30">
                    {fighter.username[0]}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white leading-none mb-1">{fighter.username}</h4>
                    <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">{fighter.weightClass}</span>
                  </div>
                  <div className="ml-auto text-right">
                    <div className="text-[10px] font-mono text-zinc-500 uppercase">Legacy</div>
                    <div className="text-lg font-black italic text-gold">{fighter.reputationPoints} RP</div>
                  </div>
                </motion.div>
             ))}
           </div>
        </div>

        {/* Myth Graveyard */}
        <div className="space-y-8">
           <div className="flex items-center gap-3 mb-6">
             <Skull className="text-brand" size={32} />
             <h3 className="text-2xl font-display italic uppercase tracking-tight">Myth Graveyard</h3>
           </div>

           <div className="space-y-4">
             {legendaryKOs.map((fight, i) => (
                <motion.div
                  key={fight.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 bg-zinc-900/20 border border-white/5 rounded-[32px] hover:border-brand/30 transition-colors"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-lg font-bold italic text-zinc-200 uppercase tracking-tight">{fight.officialName}</h4>
                    <div className="flex items-center gap-1 text-brand">
                      <Star size={14} fill="currentColor" />
                      <span className="text-xs font-mono font-bold tracking-tighter">LEGENDARY</span>
                    </div>
                  </div>
                  <p className="text-zinc-500 text-sm italic mb-4">"{fight.mythContent}"</p>
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">K.O.'d by {fight.username}</span>
                    <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">{fight.cheers} Cheers</span>
                  </div>
                </motion.div>
             ))}

             {legendaryKOs.length === 0 && (
                <div className="text-center py-12 bg-zinc-900/20 rounded-3xl border border-dashed border-white/10">
                  <History className="mx-auto text-zinc-700 mb-4" size={32} />
                  <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">No legends have been written yet.</p>
                </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
}
