import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  updateDoc, 
  doc, 
  increment 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Fight } from '../types';
import { Zap, MessageSquare, Share, Shield, ScrollText, Play } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '../lib/utils';
import { TaleOfTheTape } from './TaleOfTheTape';

export function RingsideFeed() {
  const [fights, setFights] = useState<Fight[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFight, setSelectedFight] = useState<Fight | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'fights'),
      orderBy('timestamp', 'desc'),
      limit(20)
    );

    return onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Fight));
      setFights(docs);
      setLoading(false);
    });
  }, []);

  const handleCheer = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const fightRef = doc(db, 'fights', id);
    await updateDoc(fightRef, {
      cheers: increment(1)
    });
  };

  if (selectedFight) {
    return (
      <div className="relative">
        <button 
          onClick={() => setSelectedFight(null)}
          className="fixed top-24 left-4 z-[60] bg-zinc-900 border border-white/10 p-4 rounded-full text-brand"
        >
          <Shield size={24} className="rotate-[-90deg]" />
        </button>
        <TaleOfTheTape 
          mythContent={selectedFight.mythContent}
          data={{
            id: selectedFight.id,
            verdict: selectedFight.verdict,
            official_name: selectedFight.officialName,
            referee_commentary: "Archived from the arena.",
            tale_of_the_tape: selectedFight.taleOfTheTape,
            knockout_punch: selectedFight.knockoutPunch,
            reliability_score: selectedFight.reliabilityScore,
            category: selectedFight.category,
            videoUrl: selectedFight.videoUrl
          }}
          onReset={() => setSelectedFight(null)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-4xl font-display italic uppercase tracking-tighter">Ringside Feed</h2>
          <p className="text-zinc-500 font-mono text-xs uppercase letter-spacing-[0.2em] mt-1">Live from the Arena of Truth</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-4 py-1 bg-brand/10 border border-brand/20 rounded-full animate-pulse">
          <div className="w-2 h-2 bg-brand rounded-full" />
          <span className="text-[10px] font-bold text-brand uppercase tracking-widest">LIVE TRACKER</span>
        </div>
      </div>

      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {fights.map((fight) => (
            <motion.div
              key={fight.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={() => setSelectedFight(fight)}
              className="group bg-zinc-900/40 border border-white/5 rounded-3xl p-6 hover:bg-zinc-900/60 transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold ring-2 ring-brand/20">
                    {fight.username[0].toUpperCase()}
                  </div>
                  <div>
                    <span className="text-sm font-bold text-white group-hover:text-brand transition-colors">{fight.username}</span>
                    <span className="text-[10px] text-zinc-500 font-mono ml-2 uppercase">
                      {fight.timestamp ? formatDistanceToNow(fight.timestamp.toDate()) : 'just now'} ago
                    </span>
                  </div>
                </div>
                
                <div className={cn(
                  "px-3 py-0.5 rounded text-[10px] font-black italic uppercase italic tracking-widest",
                  fight.verdict === 'BUNK' ? "bg-red-600 text-white" : 
                  fight.verdict === 'TRUTH' ? "bg-green-600 text-white" : "bg-zinc-700 text-zinc-300"
                )}>
                  {fight.verdict} K.O.
                </div>
              </div>

              <div className="bg-black/40 border border-white/5 rounded-2xl p-6 mb-6">
                <blockquote className="text-xl font-bold italic text-zinc-200 leading-tight mb-4">
                  "{fight.mythContent}"
                </blockquote>
                <div className="flex items-center gap-2 text-brand text-xs font-black italic uppercase">
                  <ScrollText size={14} />
                  <span>{fight.officialName}</span>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <button 
                  onClick={(e) => handleCheer(fight.id, e)}
                  className="flex items-center gap-2 group/btn"
                >
                  <div className="p-2 bg-brand/10 rounded-full group-hover/btn:bg-brand group-hover/btn:text-white transition-all">
                    <Zap size={18} fill={fight.cheers > 0 ? "currentColor" : "none"} />
                  </div>
                  <span className="text-sm font-bold text-zinc-400 group-hover/btn:text-white">{fight.cheers} Cheers</span>
                </button>

                <button className="flex items-center gap-2 group/btn">
                  <div className="p-2 bg-zinc-800/50 rounded-full group-hover/btn:bg-zinc-700 transition-all">
                    <Play size={18} fill="currentColor" />
                  </div>
                  <span className="text-sm font-bold text-zinc-500 group-hover/btn:text-white">Watch K.O.</span>
                </button>

                <button className="flex items-center gap-2 group/btn ml-auto">
                  <div className="p-2 bg-zinc-800/50 rounded-full group-hover/btn:bg-zinc-700 transition-all">
                    <Share size={18} />
                  </div>
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && fights.length === 0 && (
          <div className="text-center py-24 bg-zinc-900/20 rounded-3xl border border-dashed border-white/10">
            <Shield className="mx-auto text-zinc-700 mb-4" size={48} />
            <p className="text-zinc-500 font-mono italic">The arena is quiet... for now.</p>
          </div>
        )}
      </div>
    </div>
  );
}
