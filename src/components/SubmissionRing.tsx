import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Send } from 'lucide-react';
import { getRefereeVerdict } from '../services/gemini';
import { useAuth } from '../hooks/useAuth';
import { db } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  increment, 
  serverTimestamp 
} from 'firebase/firestore';
import { PunchAnimation } from './PunchAnimation';
import { TaleOfTheTape } from './TaleOfTheTape';
import { Fight, WeightClass } from '../types';

export function SubmissionRing() {
  const { user, fighter } = useAuth();
  const [myth, setMyth] = useState('');
  const [loading, setLoading] = useState(false);
  const [verdict, setVerdict] = useState<any>(null);
  const [showPunch, setShowPunch] = useState(false);

  const calculateWeightClass = (rp: number): WeightClass => {
    if (rp >= 50000) return 'G.O.A.T.';
    if (rp >= 15000) return 'Heavyweight';
    if (rp >= 5000) return 'Middleweight';
    if (rp >= 1000) return 'Welterweight';
    if (rp >= 500) return 'Flyweight';
    return 'Sparring Partner';
  };

  const handleUbunk = async () => {
    if (!myth.trim() || !user || !fighter) return;
    setLoading(true);

    try {
      const data = await getRefereeVerdict(myth);
      
      // Save the fight to Firestore
      const fightData: Omit<Fight, 'id'> = {
        userId: user.uid,
        username: fighter.username,
        mythContent: myth,
        verdict: data.verdict,
        category: data.category,
        officialName: data.official_name,
        taleOfTheTape: data.tale_of_the_tape,
        knockoutPunch: data.knockout_punch,
        reliabilityScore: data.reliability_score,
        cheers: 0,
        timestamp: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'fights'), fightData);
      
      // Update Fighter stats
      const fighterRef = doc(db, 'fighters', user.uid);
      const isWin = data.verdict === 'BUNK' || data.verdict === 'TRUTH';
      const isDangerous = data.category === 'DANGEROUS';
      
      const newRp = fighter.reputationPoints + data.rp_adjustment;
      const newWeightClass = calculateWeightClass(newRp);

      await updateDoc(fighterRef, {
        reputationPoints: increment(data.rp_adjustment),
        weightClass: newWeightClass,
        'record.wins': increment(isWin ? 1 : 0),
        'record.losses': increment(isDangerous ? 1 : 0),
        lastActive: serverTimestamp()
      });

      setVerdict({ ...data, id: docRef.id });
      setShowPunch(true);
    } catch (error) {
      alert("The Ref was knocked out by a technical glitch. Try again!");
    } finally {
      setLoading(false);
    }
  };

  if (showPunch && verdict) {
    return (
      <PunchAnimation 
        myth={myth} 
        onComplete={() => setShowPunch(false)} 
      />
    );
  }

  if (verdict && !showPunch) {
    return (
      <TaleOfTheTape 
        mythContent={myth}
        data={verdict} 
        onReset={() => {
          setVerdict(null);
          setMyth('');
        }} 
      />
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-2xl bg-zinc-900/50 border-2 border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-brand/20 rounded-2xl text-brand">
            <Swords size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-display italic uppercase tracking-tight">Challenge a Myth</h2>
            <p className="text-zinc-500 text-sm font-mono">The Referee is watching. No low blows.</p>
          </div>
        </div>

        <textarea
          value={myth}
          onChange={(e) => setMyth(e.target.value)}
          placeholder="e.g. 'We only use 10% of our brains...'"
          className="w-full h-40 bg-black/40 border border-white/5 rounded-2xl p-6 text-xl text-white placeholder:text-zinc-700 focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/50 transition-all resize-none mb-6"
        />

        <button
          onClick={handleUbunk}
          disabled={loading || !myth.trim()}
          className="w-full group relative flex items-center justify-center gap-3 bg-brand text-white py-5 rounded-2xl font-black italic text-2xl hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:grayscale transition-all duration-300 overflow-hidden"
        >
          {loading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Swords />
            </motion.div>
          ) : (
            <>
              <span className="relative z-10">UBUNK IT!</span>
              <Send size={24} className="relative z-10 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </>
          )}
          
          <motion.div
            className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"
          />
        </button>
      </motion.div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
         <TipCard title="Identity" content="Claims about who we are or what we're capable of." />
         <TipCard title="History" content="Did vikings really have horned helmets? Find out." />
         <TipCard title="Science" content="The Referee has access to the latest research." />
      </div>
    </div>
  );
}

function TipCard({ title, content }: { title: string, content: string }) {
  return (
    <div className="p-6 bg-zinc-900/30 border border-white/5 rounded-2xl">
      <h3 className="text-gold font-display italic text-sm mb-2 uppercase tracking-widest">{title}</h3>
      <p className="text-zinc-500 text-sm leading-relaxed">{content}</p>
    </div>
  );
}
