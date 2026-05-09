import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import confetti from 'canvas-confetti';

interface PunchAnimationProps {
  myth: string;
  onComplete: () => void;
}

export function PunchAnimation({ myth, onComplete }: PunchAnimationProps) {
  const controls = useAnimation();

  useEffect(() => {
    const sequence = async () => {
      // 1. Initial pause
      await new Promise(resolve => setTimeout(resolve, 500));

      // 2. Glove slam
      await controls.start({
        y: [-1000, 0],
        opacity: [0, 1],
        transition: { type: 'spring', damping: 15, stiffness: 200 }
      });

      // 3. Impact
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ff4500', '#ffd700', '#ffffff'],
        gravity: 1.2
      });

      // 4. Hold for impact
      await new Promise(resolve => setTimeout(resolve, 800));

      // 5. Fade out
      await controls.start({
        opacity: 0,
        scale: 0.8,
        transition: { duration: 0.5 }
      });

      onComplete();
    };

    sequence();
  }, [controls, onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 pointer-events-none p-4">
      {/* Target Myth */}
      <motion.div
        initial={{ opacity: 1, scale: 1 }}
        animate={{ 
          scale: [1, 1.1, 0.5], 
          opacity: [1, 1, 0],
          rotate: [0, -10, 20]
        }}
        transition={{ delay: 0.5, duration: 1 }}
        className="absolute w-full max-w-lg p-12 bg-white/5 border-2 border-white/10 rounded-3xl text-center"
      >
        <div className="text-zinc-500 font-mono text-xs uppercase mb-4 tracking-tighter">Target Myth</div>
        <div className="text-3xl font-bold italic text-white line-through decoration-brand decoration-4">
          "{myth}"
        </div>
      </motion.div>

      {/* The Punch */}
      <motion.div
        animate={controls}
        initial={{ y: -1000, opacity: 0 }}
        className="relative z-10 text-[20vw]"
      >
        🥊
      </motion.div>

      {/* K.O. Text */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: [0, 1, 1, 0], scale: [0, 1.5, 1.5, 2] }}
        transition={{ delay: 0.6, duration: 1 }}
        className="absolute font-display italic text-brand text-9xl md:text-[200px]"
      >
        K.O.!
      </motion.div>
    </div>
  );
}
