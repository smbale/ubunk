import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, RotateCcw, Zap, TrendingUp, Video, Download, Key, Play, Pause, Volume2, VolumeX, AlertTriangle } from 'lucide-react';
import { Verdict, Category } from '../types';
import { cn } from '../lib/utils';
import { generateVeoVideo } from '../services/gemini';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface TaleOfTheTapeProps {
  mythContent: string;
  data: {
    id: string;
    verdict: Verdict;
    official_name: string;
    referee_commentary: string;
    tale_of_the_tape: string[];
    knockout_punch: string;
    reliability_score: number;
    category: Category;
    videoUrl?: string;
  };
  onReset: () => void;
}

export function TaleOfTheTape({ mythContent, data, onReset }: TaleOfTheTapeProps) {
  const isDangerous = data.category === 'DANGEROUS';
  const isNonsense = data.category === 'NONSENSE';

  const [videoUrl, setVideoUrl] = useState<string | null>(data.videoUrl || null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoStatus, setVideoStatus] = useState('');
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleGenerateVideo = async () => {
    setError(null);
    const aistudio = (window as any).aistudio;
    if (aistudio) {
      const hasKey = await aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await aistudio.openSelectKey();
      }
    }

    setIsGeneratingVideo(true);
    setVideoStatus('Stepping into the digital arena...');
    
    const statuses = [
      'Gloving up the AI...',
      'Setting the stage in 9:16...',
      'Applying the knockout blow...',
      'Polishing the golden truth...',
      'Finalizing the broadcast feed...'
    ];

    let statusIdx = 0;
    const interval = setInterval(() => {
      setVideoStatus(statuses[statusIdx]);
      statusIdx = (statusIdx + 1) % statuses.length;
    }, 15000);

    try {
      const url = await generateVeoVideo(mythContent, data.official_name, data.knockout_punch);
      setVideoUrl(url);
      
      // Persist to Firestore so others can see it in the feed
      if (data.id) {
        const fightRef = doc(db, 'fights', data.id);
        await updateDoc(fightRef, { videoUrl: url });
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'The video ref had a technical knockout.');
    } finally {
      setIsGeneratingVideo(false);
      setVideoStatus('');
      clearInterval(interval);
    }
  };

  const handleShareVideo = async () => {
    if (!videoUrl) return;

    const shareData = {
      title: `UBUNK: ${data.official_name}`,
      text: `Just K.O.'d this myth on Ubunk: "${mythContent}". The truth hits hard! 🥊`,
      url: window.location.href
    };

    try {
      // Try to share the blob if supported
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const file = new File([blob], `ubunk-${data.id}.mp4`, { type: 'video/mp4' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          ...shareData,
          files: [file]
        });
      } else if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Arena link copied to clipboard! Share it with the world.');
      }
    } catch (error) {
      console.error('Sharing failed', error);
      // Fallback to simple link copy
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Arena link copied to clipboard!');
      } catch (clipError) {
        alert('The crowd is too loud! Copy the URL manually to share.');
      }
    }
  };

  return (
    <div className="flex flex-col items-center py-8">
      <AnimatePresence>
        {isGeneratingVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="relative mb-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                className="w-32 h-32 border-4 border-brand border-t-transparent rounded-full"
              />
              <Video className="absolute inset-0 m-auto text-brand" size={40} />
            </div>
            <h3 className="text-4xl font-display italic text-white mb-4">GENERATING K.O. VIDEO</h3>
            <p className="text-xl font-mono text-zinc-400 max-w-md mx-auto h-8 italic">
              {videoStatus}
            </p>
            <div className="mt-12 text-zinc-600 text-sm font-mono max-w-xs">
              Video generation can take up to 2 minutes. Don't leave the ringside!
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0.5, rotate: -10, opacity: 0 }}
            animate={{ scale: 1, rotate: -3, opacity: 1 }}
            className={cn(
              "inline-block px-12 py-3 mb-6 font-display text-5xl italic text-white",
              isDangerous ? "bg-red-600" : isNonsense ? "bg-zinc-700" : "bg-brand"
            )}
          >
            {data.verdict}
          </motion.div>
          <h2 className="text-4xl font-display italic text-white uppercase tracking-tight block">
            {data.official_name}
          </h2>
        </div>

        {/* Referee commentary */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-zinc-900 border-l-4 border-brand p-6 rounded-r-2xl mb-8"
        >
          <p className="text-xl font-medium italic text-zinc-300">"{data.referee_commentary}"</p>
        </motion.div>

        {/* Video Preview (if generated) */}
        {videoUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 rounded-3xl overflow-hidden bg-zinc-900 border-2 border-brand shadow-2xl shadow-brand/40 aspect-[9/16] max-w-[300px] mx-auto relative group"
          >
            <video
              ref={videoRef}
              src={videoUrl}
              autoPlay
              loop
              playsInline
              className="w-full h-full object-cover"
              onClick={togglePlay}
            />
            
            {/* Custom Controls Overlays */}
            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
               <button onClick={togglePlay} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md">
                 {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
               </button>
               
               <div className="flex gap-2">
                 <button onClick={toggleMute} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md">
                   {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                 </button>
                 <a 
                   href={videoUrl} 
                   download={`ubunk-${data.id}.mp4`}
                   className="p-2 bg-brand rounded-full text-white hover:scale-105 transition-transform"
                 >
                   <Download size={18} />
                 </a>
               </div>
            </div>

            {/* Status Badge */}
            <div className="absolute top-4 left-4">
              <span className="bg-brand text-[10px] font-black italic text-white px-2 py-0.5 rounded tracking-widest">K.O. REPLAY</span>
            </div>
          </motion.div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-8 p-4 bg-red-600/10 border border-red-600/30 rounded-2xl flex items-center gap-3 text-red-500">
            <AlertTriangle size={20} />
            <p className="text-sm font-bold">{error}</p>
          </div>
        )}

        {/* The Tape */}
        <div className="bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden mb-8">
          <div className="bg-zinc-800 px-6 py-3 border-b border-white/5">
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <TrendingUp size={14} /> Tale of the Tape
            </span>
          </div>
          <div className="p-2">
            {data.tale_of_the_tape.map((point, i) => (
              <motion.div
                key={i}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.8 + (i * 0.2) }}
                className="flex items-start gap-4 p-4 border-b border-white/5 last:border-0"
              >
                <div className="mt-1 p-1 bg-gold/10 rounded text-gold">
                  <Zap size={14} fill="currentColor" />
                </div>
                <p className="text-zinc-300 leading-relaxed font-medium">{point}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* The Finisher */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1.5, type: 'spring' }}
          className="bg-gold p-8 rounded-3xl mb-12 shadow-2xl shadow-gold/20"
        >
          <span className="text-[10px] font-mono text-black/60 uppercase tracking-widest block mb-2 font-bold">The Knockout Blow</span>
          <p className="text-2xl font-black italic text-black leading-tight">
            {data.knockout_punch}
          </p>
        </motion.div>

        {/* Score */}
        <div className="w-full h-2 bg-zinc-900 rounded-full mb-12 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${data.reliability_score}%` }}
            transition={{ delay: 2, duration: 1 }}
            className="h-full bg-green-500"
          />
          <div className="flex justify-between mt-2">
            <span className="text-[10px] font-mono text-zinc-500 uppercase">Uncertain</span>
            <span className="text-[10px] font-mono text-zinc-500 uppercase">Absolute Truth</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          {!videoUrl ? (
            <button 
              onClick={handleGenerateVideo}
              disabled={isGeneratingVideo}
              className="flex items-center gap-2 bg-zinc-900 text-gold border-2 border-gold/50 px-8 py-4 rounded-full font-bold hover:bg-gold hover:text-black transition-all active:scale-95 disabled:opacity-50"
            >
              <Video size={20} />
              GENERATE K.O. VIDEO
            </button>
          ) : (
            <button 
              onClick={handleShareVideo}
              className="flex items-center gap-2 bg-gold text-black px-8 py-4 rounded-full font-bold hover:scale-105 transition-transform active:scale-95"
            >
              <Share2 size={20} />
              BROADCAST K.O.
            </button>
          )}
          
          {!videoUrl && (
            <button className="flex items-center gap-2 bg-brand text-white px-8 py-4 rounded-full font-bold hover:scale-105 transition-transform active:scale-95">
              <Share2 size={20} />
              SHARE VERDICT
            </button>
          )}
          
          <button 
            onClick={onReset}
            className="p-4 bg-zinc-900 border border-white/10 rounded-full hover:bg-zinc-800 transition-colors text-brand"
          >
            <RotateCcw size={24} />
          </button>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-[10px] font-mono text-zinc-600 flex items-center justify-center gap-1">
            <Key size={10} /> VE-O POWERED GENERATION • REQUIRES PAID API KEY
          </p>
        </div>
      </motion.div>
    </div>
  );
}
