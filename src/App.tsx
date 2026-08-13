/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import defaultLogo from './assets/images/rrpl-logo.svg';
import { 
  Users, 
  Mic2, 
  Trophy, 
  Plus, 
  Minus, 
  ChevronRight, 
  ChevronLeft,
  RotateCcw, 
  CheckCircle2,
  Sword,
  Share2,
  Lock,
  UserRound,
  Undo2,
  Trash2,
  Droplet,
  Scale,
  Upload,
  Image as ImageIcon
} from 'lucide-react';

type RoundScore = {
  rhymes: number;
  quality: number; // 0-50
  response: number; // 0-10
  performance: number; // 0-10
  oooShit: number; // 0-10
  brancas: number; // 0-25
  notes: string;
};

type MCData = {
  name: string;
  rounds: RoundScore[];
};

type BattlePhase = 'setup' | 'round1' | 'round2' | 'round3' | 'result';

export default function App() {
  const [phase, setPhase] = useState<BattlePhase>(() => (localStorage.getItem('rrpl_phase') as BattlePhase) || 'setup');
  const [juryName, setJuryName] = useState<string>(() => localStorage.getItem('rrpl_jury') || '');
  const DEFAULT_LOGO = defaultLogo;
  const [logo, setLogo] = useState<string>(() => {
    const saved = localStorage.getItem('rrpl_custom_logo');
    if (saved && saved.startsWith('data:image/')) {
      return saved;
    }
    return DEFAULT_LOGO;
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeMc, setActiveMc] = useState<0 | 1 | 2 | 3>(() => {
    const saved = localStorage.getItem('rrpl_active_mc');
    return saved ? (parseInt(saved) as 0 | 1 | 2 | 3) : 0;
  });
  const [roundStarter, setRoundStarter] = useState<0 | 1 | 2>(() => {
    const saved = localStorage.getItem('rrpl_round_starter');
    return saved ? (parseInt(saved) as 0 | 1 | 2) : 0;
  });
  const [firstRoundStarter, setFirstRoundStarter] = useState<0 | 1 | 2>(() => {
    const saved = localStorage.getItem('rrpl_first_round_starter');
    return saved ? (parseInt(saved) as 0 | 1 | 2) : 0;
  });

  const [starterAnimation, setStarterAnimation] = useState<{ name: string; roundNum: number; isSecond?: boolean } | null>(null);

  useEffect(() => {
    if (starterAnimation) {
      const timer = setTimeout(() => {
        setStarterAnimation(null);
      }, 3550);
      return () => clearTimeout(timer);
    }
  }, [starterAnimation]);
  
  const [mc1, setMc1] = useState<MCData>(() => {
    const saved = localStorage.getItem('rrpl_mc1');
    if (!saved) return { name: '', rounds: [{ rhymes: 0, quality: 0, response: 0, performance: 0, oooShit: 0, brancas: 25, notes: '' }, { rhymes: 0, quality: 0, response: 0, performance: 0, oooShit: 0, brancas: 25, notes: '' }, { rhymes: 0, quality: 0, response: 0, performance: 0, oooShit: 0, brancas: 25, notes: '' }] };
    const parsed = JSON.parse(saved);
    parsed.rounds = parsed.rounds.map((r: any) => ({
      rhymes: r.rhymes || 0,
      quality: r.quality || 0,
      response: r.response || 0,
      performance: r.performance || 0,
      oooShit: r.oooShit || 0,
      brancas: r.brancas !== undefined ? r.brancas : 25,
      notes: r.notes || ''
    }));
    return parsed;
  });
  
  const [mc2, setMc2] = useState<MCData>(() => {
    const saved = localStorage.getItem('rrpl_mc2');
    if (!saved) return { name: '', rounds: [{ rhymes: 0, quality: 0, response: 0, performance: 0, oooShit: 0, brancas: 25, notes: '' }, { rhymes: 0, quality: 0, response: 0, performance: 0, oooShit: 0, brancas: 25, notes: '' }, { rhymes: 0, quality: 0, response: 0, performance: 0, oooShit: 0, brancas: 25, notes: '' }] };
    const parsed = JSON.parse(saved);
    parsed.rounds = parsed.rounds.map((r: any) => ({
      rhymes: r.rhymes || 0,
      quality: r.quality || 0,
      response: r.response || 0,
      performance: r.performance || 0,
      oooShit: r.oooShit || 0,
      brancas: r.brancas !== undefined ? r.brancas : 25,
      notes: r.notes || ''
    }));
    return parsed;
  });

  // Persists state changes safely
  useEffect(() => {
    localStorage.setItem('rrpl_phase', phase);
    localStorage.setItem('rrpl_jury', juryName);
    localStorage.setItem('rrpl_mc1', JSON.stringify(mc1));
    localStorage.setItem('rrpl_mc2', JSON.stringify(mc2));
    localStorage.setItem('rrpl_active_mc', activeMc.toString());
    localStorage.setItem('rrpl_round_starter', roundStarter.toString());
    localStorage.setItem('rrpl_first_round_starter', firstRoundStarter.toString());
  }, [phase, juryName, mc1, mc2, activeMc, roundStarter, firstRoundStarter]);

  const currentRoundIndex = phase === 'round1' ? 0 : phase === 'round2' ? 1 : phase === 'round3' ? 2 : -1;

  const selectGladiatorToStart = (idx: 1 | 2) => {
    setActiveMc(idx);
    setRoundStarter(idx);
    if (currentRoundIndex === 0) {
      setFirstRoundStarter(idx);
    }
    const starterName = (idx === 1 ? mc1.name : mc2.name) || `Gladiador ${idx}`;
    setStarterAnimation({ name: starterName, roundNum: currentRoundIndex + 1, isSecond: false });
  };

  const handleStart = () => {
    if (mc1.name.trim() && mc2.name.trim()) {
      setActiveMc(0);
      setRoundStarter(0);
      setFirstRoundStarter(0);
      setPhase('round1');
    }
  };

  const updateScore = (mcIndex: 1 | 2, field: 'rhymes' | 'quality' | 'response' | 'performance' | 'oooShit' | 'brancas' | 'notes', value: number | string) => {
    if (activeMc !== mcIndex) return;
    if (currentRoundIndex === -1) return;

    const setMc = mcIndex === 1 ? setMc1 : setMc2;
    setMc(prev => {
      const newRounds = [...prev.rounds];
      const current = { ...newRounds[currentRoundIndex] };
      
      if (field === 'rhymes') {
        current.rhymes = Math.max(0, (current.rhymes || 0) + (value as number));
      } else if (field === 'quality') {
        current.quality = Math.max(0, Math.min(50, (current.quality || 0) + (value as number)));
      } else if (field === 'response') {
        current.response = Math.max(0, Math.min(10, (current.response || 0) + (value as number)));
      } else if (field === 'performance') {
        current.performance = Math.max(0, Math.min(10, (current.performance || 0) + (value as number)));
      } else if (field === 'oooShit') {
        current.oooShit = Math.max(0, Math.min(10, (current.oooShit || 0) + (value as number)));
      } else if (field === 'brancas') {
        const diff = value as number;
        current.brancas = Math.max(0, Math.min(25, (current.brancas !== undefined ? current.brancas : 25) + diff));
      } else if (field === 'notes') {
        current.notes = value as string;
      }
      
      newRounds[currentRoundIndex] = current;
      return { ...prev, rounds: newRounds };
    });
  };

  const nextPhase = () => {
    let nextP: 'round1' | 'round2' | 'round3' | 'result' = 'result';
    if (phase === 'round1') nextP = 'round2';
    else if (phase === 'round2') nextP = 'round3';
    else if (phase === 'round3') nextP = 'result';

    if (nextP === 'round2' || nextP === 'round3') {
      const starter = firstRoundStarter || roundStarter || 1;
      setRoundStarter(starter);
      setActiveMc(starter);
      setPhase(nextP);
      const nextRoundNum = nextP === 'round2' ? 2 : 3;
      const starterName = (starter === 1 ? mc1.name : mc2.name) || `Gladiador ${starter}`;
      setStarterAnimation({ name: starterName, roundNum: nextRoundNum, isSecond: false });
    } else {
      setActiveMc(0);
      setRoundStarter(0);
      setPhase('result');
    }
  };

  const resetScoresOnly = () => {
    const emptyRounds = () => [
      { rhymes: 0, quality: 0, response: 0, performance: 0, oooShit: 0, brancas: 25, notes: '' },
      { rhymes: 0, quality: 0, response: 0, performance: 0, oooShit: 0, brancas: 25, notes: '' },
      { rhymes: 0, quality: 0, response: 0, performance: 0, oooShit: 0, brancas: 25, notes: '' }
    ];
    setMc1(prev => ({ ...prev, rounds: emptyRounds() }));
    setMc2(prev => ({ ...prev, rounds: emptyRounds() }));
    setActiveMc(0);
    setRoundStarter(0);
    setFirstRoundStarter(0);
  };

  const resetCurrentRoundScores = (targetMc: 0 | 1 | 2 = 0) => {
    if (currentRoundIndex === -1) return;
    const emptyRound = { rhymes: 0, quality: 0, response: 0, performance: 0, oooShit: 0, brancas: 25, notes: '' };
    
    setMc1(prev => {
      const newRounds = [...prev.rounds];
      newRounds[currentRoundIndex] = { ...emptyRound };
      return { ...prev, rounds: newRounds };
    });

    setMc2(prev => {
      const newRounds = [...prev.rounds];
      newRounds[currentRoundIndex] = { ...emptyRound };
      return { ...prev, rounds: newRounds };
    });

    setActiveMc(targetMc);
    setRoundStarter(targetMc);
  };

  const reset = () => {
    setPhase('setup');
    setActiveMc(0);
    setRoundStarter(0);
    setFirstRoundStarter(0);
    setJuryName('');
    setMc1({ name: '', rounds: [{ rhymes: 0, quality: 0, response: 0, performance: 0, oooShit: 0, brancas: 25, notes: '' }, { rhymes: 0, quality: 0, response: 0, performance: 0, oooShit: 0, brancas: 25, notes: '' }, { rhymes: 0, quality: 0, response: 0, performance: 0, oooShit: 0, brancas: 25, notes: '' }] });
    setMc2({ name: '', rounds: [{ rhymes: 0, quality: 0, response: 0, performance: 0, oooShit: 0, brancas: 25, notes: '' }, { rhymes: 0, quality: 0, response: 0, performance: 0, oooShit: 0, brancas: 25, notes: '' }, { rhymes: 0, quality: 0, response: 0, performance: 0, oooShit: 0, brancas: 25, notes: '' }] });
    localStorage.removeItem('rrpl_phase');
    localStorage.removeItem('rrpl_jury');
    localStorage.removeItem('rrpl_mc1');
    localStorage.removeItem('rrpl_mc2');
    localStorage.removeItem('rrpl_active_mc');
    localStorage.removeItem('rrpl_round_starter');
    localStorage.removeItem('rrpl_first_round_starter');
  };

  const calculateTotal = (mc: MCData) => {
    return mc.rounds.reduce((acc, r) => {
      const base = ((r.rhymes || 0) * 1) + ((r.quality || 0) * 2) + ((r.response || 0) * 1) + ((r.performance || 0) * 1) + ((r.oooShit || 0) * 1.5);
      const penalty = 25 - (r.brancas !== undefined ? r.brancas : 25);
      return acc + (base - penalty);
    }, 0).toFixed(1);
  };

  const mc1Total = useMemo(() => calculateTotal(mc1), [mc1]);
  const mc2Total = useMemo(() => calculateTotal(mc2), [mc2]);

  const getRoundWinner = (index: number) => {
    const r1 = mc1.rounds[index];
    const r2 = mc2.rounds[index];
    const s1 = (((r1.rhymes || 0) * 1) + ((r1.quality || 0) * 2) + ((r1.response || 0) * 1) + ((r1.performance || 0) * 1) + ((r1.oooShit || 0) * 1.5)) - (25 - (r1.brancas !== undefined ? r1.brancas : 25));
    const s2 = (((r2.rhymes || 0) * 1) + ((r2.quality || 0) * 2) + ((r2.response || 0) * 1) + ((r2.performance || 0) * 1) + ((r2.oooShit || 0) * 1.5)) - (25 - (r2.brancas !== undefined ? r2.brancas : 25));
    if (s1 > s2) return 1;
    if (s2 > s1) return 2;
    return 0;
  };

  const copyToClipboard = () => {
    const winner = parseFloat(mc1Total) > parseFloat(mc2Total) ? mc1.name : parseFloat(mc2Total) > parseFloat(mc1Total) ? mc2.name : 'Empate';
    const text = `
🏆 *VEREDITO RRPL*
👤 *Anfitrião:* FLY-SQUAD
⚖️ *Júri:* ${juryName || 'Não especificado'}
━━━━━━━━━━━━━━
🎤 *${mc1.name}:* ${mc1Total} pts
🎤 *${mc2.name}:* ${mc2Total} pts

📊 *POR ROUNDS:*
R1: ${getRoundWinner(0) === 1 ? mc1.name : getRoundWinner(0) === 2 ? mc2.name : 'Empate'}
R2: ${getRoundWinner(1) === 1 ? mc1.name : getRoundWinner(1) === 2 ? mc2.name : 'Empate'}
R3: ${getRoundWinner(2) === 1 ? mc1.name : getRoundWinner(2) === 2 ? mc2.name : 'Empate'}

👑 *VENCEDOR:* ${winner}
    `.trim();

    navigator.clipboard.writeText(text);
    alert('Veredito copiado para a área de transferência!');
  };

  return (
    <div className="min-h-screen bg-neutral-950 font-sans selection:bg-brand selection:text-white">
      {/* 2-Second Gladiator Starter Animation Overlay */}
      <AnimatePresence>
        {starterAnimation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/90 backdrop-blur-xl p-6 text-center select-none"
          >
            {/* Animated Microphone Icon */}
            <motion.div 
              initial={{ scale: 0.4, rotate: -25 }}
              animate={{ scale: [0.8, 1.15, 1], rotate: 0 }}
              transition={{ duration: 0.45, ease: "backOut" }}
              className="relative mb-6"
            >
              <div className="absolute inset-0 bg-brand/40 blur-3xl rounded-full scale-150 animate-pulse" />
              <div className="w-28 h-28 sm:w-36 sm:h-36 bg-gradient-to-br from-brand via-brand/90 to-red-950 rounded-full border-4 border-white/20 shadow-[0_0_60px_rgba(255,62,62,0.8)] flex items-center justify-center relative z-10">
                <Mic2 className="w-14 h-14 sm:w-20 sm:h-20 text-white drop-shadow-xl animate-bounce" />
              </div>
            </motion.div>

            {/* Subtitle Badge */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-brand font-black tracking-widest uppercase text-xs sm:text-sm mb-3 px-5 py-2 bg-brand/15 border border-brand/40 rounded-full shadow-lg"
            >
              🎤 {starterAnimation.isSecond ? 'Vez de Rimar' : 'Rima Primeiro'} • {starterAnimation.roundNum > 0 ? `${starterAnimation.roundNum}º Round` : 'Batalha'}
            </motion.div>

            {/* Gladiator Name */}
            <motion.h2 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl sm:text-6xl md:text-7xl font-black italic tracking-wider text-white uppercase drop-shadow-[0_4px_30px_rgba(255,62,62,0.5)] mb-3"
            >
              {starterAnimation.name}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="text-white font-black italic uppercase text-sm sm:text-lg md:text-xl tracking-wider mb-8 text-center drop-shadow-[0_0_15px_rgba(255,62,62,0.6)] px-4 max-w-xl leading-tight"
            >
              O MIC É TODO TEU NIGGA, COSPE!
            </motion.p>

            {/* 3.55-Second Progress Countdown Bar */}
            <div className="w-64 sm:w-80 h-2.5 bg-neutral-800 rounded-full overflow-hidden border border-neutral-700 shadow-inner relative">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 3.55, ease: 'linear' }}
                className="h-full bg-gradient-to-r from-brand to-red-500 rounded-full shadow-[0_0_20px_rgba(255,62,62,1)]"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Background decoration with Large Watermark Logo */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden select-none z-0 flex items-center justify-center">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand blur-[120px] rounded-full opacity-20" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-accent blur-[120px] rounded-full opacity-20" />
        
        {logo && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] h-[90vh] max-w-[900px] max-h-[900px] flex items-center justify-center opacity-[0.07] pointer-events-none">
            <img 
              src={logo || defaultLogo} 
              alt="RRPL Logo Watermark" 
              referrerPolicy="no-referrer"
              onError={(e) => {
                const target = e.currentTarget;
                if (target.src !== defaultLogo) {
                  target.src = defaultLogo;
                  setLogo(defaultLogo);
                  localStorage.removeItem('rrpl_custom_logo');
                }
              }}
              className="w-full h-full object-contain object-center scale-[1.05]" 
            />
          </div>
        )}
      </div>

      {/* Persistent Top Header Controls */}
      {phase !== 'setup' && (
        <>
          {/* Top-Left Brand Badge */}
          <div className="fixed top-4 left-4 sm:left-6 z-[100] flex items-center gap-2 bg-neutral-950/90 backdrop-blur-md border border-neutral-800/80 px-3.5 py-2 rounded-2xl shadow-2xl">
            <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
            <span className="text-[11px] font-black tracking-widest text-white uppercase italic">RRPL LEAGUE</span>
          </div>

          {/* Top-Right Action Controls Bar */}
          <div className="fixed top-4 right-4 sm:right-6 z-[100] flex items-center gap-1.5 bg-neutral-950/90 backdrop-blur-md border border-neutral-800/80 p-1.5 rounded-2xl shadow-2xl">
            {/* Trocar Gladiador button */}
            {phase !== 'result' && (
              (() => {
                const isTrocarDisabled = phase !== 'round1' || activeMc === 0 || activeMc === 3;
                return (
                  <button 
                    onClick={() => {
                      if (!isTrocarDisabled) {
                        resetCurrentRoundScores(0);
                      }
                    }}
                    disabled={isTrocarDisabled}
                    className={`px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-bold ${
                      isTrocarDisabled 
                        ? 'opacity-30 cursor-not-allowed border-transparent text-neutral-500' 
                        : 'border-brand/40 hover:border-brand text-brand hover:bg-brand/10'
                    }`}
                    title={isTrocarDisabled ? "Troca de gladiador inativa após o 1º Round" : "Trocar Gladiador (Zera a pontuação deste round)"}
                  >
                    <RotateCcw className={`w-4 h-4 ${!isTrocarDisabled ? 'group-hover:-rotate-90 transition-transform' : ''}`} />
                    <span className="text-[10px] uppercase hidden sm:inline">Trocar Gladiador</span>
                  </button>
                );
              })()
            )}

            {/* Edit Names button */}
            <button 
              onClick={() => {
                resetScoresOnly();
                setPhase('setup');
              }}
              disabled={activeMc !== 0}
              className={`px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-bold ${
                activeMc !== 0 
                  ? 'opacity-30 cursor-not-allowed border-transparent text-neutral-500' 
                  : 'border-blue-500/40 hover:border-blue-500 text-blue-400 hover:bg-blue-500/10'
              }`}
              title={activeMc !== 0 ? "Bloqueado durante o combate" : "Editar Nomes"}
            >
              <UserRound className="w-4 h-4" />
              <span className="text-[10px] uppercase hidden sm:inline">Corrigir Nomes</span>
            </button>

            {/* Full Reset button */}
            <button 
              onClick={() => {
                reset();
              }}
              className="px-3 py-1.5 rounded-xl border border-transparent hover:border-red-500/40 text-neutral-400 hover:text-red-500 hover:bg-red-500/10 transition-all flex items-center gap-1.5 text-xs font-bold"
              title="Reiniciar Tudo"
            >
              <Trash2 className="w-4 h-4" />
              <span className="text-[10px] uppercase hidden sm:inline">Reiniciar Tudo</span>
            </button>
          </div>
        </>
      )}

      <main className={`relative z-10 mx-auto p-3 sm:p-6 flex flex-col min-h-screen transition-all duration-500 ${phase === 'setup' || activeMc === 0 || phase === 'result' ? 'max-w-2xl' : 'max-w-4xl'}`}>
        {(activeMc !== 0 || phase === 'setup' || phase === 'result') && (
          <header className="py-2 sm:py-4 text-center">
          <div className="flex flex-col items-center gap-3 mb-2 sm:mb-4">
            <input 
              type="file" 
              ref={fileInputRef} 
              accept="image/*" 
              className="hidden" 
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (evt) => {
                    const rawResult = evt.target?.result as string;
                    if (!rawResult) return;

                    // Compress large images via HTML5 Canvas to prevent storage quota crashes
                    const img = document.createElement('img');
                    img.onload = () => {
                      const canvas = document.createElement('canvas');
                      const maxDim = 800;
                      let width = img.width;
                      let height = img.height;

                      if (width > height) {
                        if (width > maxDim) {
                          height = Math.round((height * maxDim) / width);
                          width = maxDim;
                        }
                      } else {
                        if (height > maxDim) {
                          width = Math.round((width * maxDim) / height);
                          height = maxDim;
                        }
                      }

                      canvas.width = width;
                      canvas.height = height;
                      const ctx = canvas.getContext('2d');
                      if (ctx) {
                        ctx.drawImage(img, 0, 0, width, height);
                        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.9);
                        
                        // Set state immediately for fast UI feedback
                        setLogo(compressedDataUrl);
                        
                        // Save to localStorage safely
                        try {
                          localStorage.setItem('rrpl_custom_logo', compressedDataUrl);
                        } catch (err) {
                          console.warn('Could not persist custom logo:', err);
                        }
                      }
                    };
                    img.src = rawResult;
                  };
                  reader.readAsDataURL(file);
                }
                // Clear input value so selecting the same file triggers change event
                e.target.value = '';
              }} 
            />

            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-28 h-28 sm:w-36 sm:h-36 relative overflow-hidden rounded-full shadow-2xl select-none mx-auto flex items-center justify-center p-0 cursor-pointer group"
              title="Clique para alterar o logótipo"
            >
              <div className="absolute inset-0 bg-brand/20 blur-2xl rounded-full" />
              <img 
                src={logo || defaultLogo} 
                alt="RRPL Logo" 
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src !== defaultLogo) {
                    target.src = defaultLogo;
                    setLogo(defaultLogo);
                    localStorage.removeItem('rrpl_custom_logo');
                  }
                }}
                className="w-full h-full object-cover object-center relative z-10 drop-shadow-2xl rounded-full group-hover:scale-105 transition-transform"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </header>
        )}

        <AnimatePresence mode="wait">
          {phase === 'setup' && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col justify-center gap-8"
            >
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-brand flex items-center gap-2">
                      <Users className="w-4 h-4" /> ANFITRIÃO
                    </label>
                    <div className="w-full bg-neutral-900/60 border-2 border-neutral-800 p-4 rounded-xl text-lg font-bold text-white tracking-widest uppercase italic select-none flex items-center h-[60px]">
                      FLY-SQUAD
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-brand flex items-center gap-2">
                      <Scale className="w-4 h-4" /> JÚRI / JURADO
                    </label>
                    <input
                      type="text"
                      placeholder="NOME DO JÚRI"
                      value={juryName}
                      onChange={(e) => setJuryName(e.target.value.toUpperCase())}
                      className="w-full bg-neutral-900 border-2 border-neutral-800 px-4 py-3 rounded-xl focus:border-brand outline-none transition-colors text-base sm:text-lg font-bold italic text-white placeholder:text-neutral-600 uppercase h-[56px] tracking-wide"
                    />
                  </div>
                </div>

                <div className="flex flex-col items-center space-y-2">
                  <div className="w-full max-w-sm flex justify-between items-center">
                    <label className="text-xs font-bold uppercase tracking-widest text-neutral-400 flex items-center gap-2">
                      <Users className="w-4 h-4 text-brand" /> GLADIADOR 1
                    </label>
                    <span className="text-[10px] text-neutral-500 font-mono font-bold">
                      {mc1.name.length}/20
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder="NOME DO MC"
                    value={mc1.name}
                    maxLength={20}
                    onChange={(e) => setMc1({ ...mc1, name: e.target.value.toUpperCase() })}
                    className="w-full max-w-sm bg-neutral-900 border-2 border-neutral-800 px-4 py-3 rounded-xl focus:border-brand outline-none transition-colors text-base font-bold italic text-white placeholder:text-neutral-600 uppercase h-[52px] tracking-wide text-center"
                  />
                </div>
                
                <div className="flex justify-center items-center py-1">
                  <div className="h-px w-16 bg-neutral-800" />
                  <div className="relative px-4">
                    <div className="absolute inset-0 bg-brand/10 blur-xl rounded-full scale-110" />
                    <span className="relative z-10 text-2xl font-black italic tracking-tighter text-brand drop-shadow-[0_0_10px_rgba(255,62,62,0.3)]">VS</span>
                  </div>
                  <div className="h-px w-16 bg-neutral-800" />
                </div>

                <div className="flex flex-col items-center space-y-2">
                  <div className="w-full max-w-sm flex justify-between items-center">
                    <label className="text-xs font-bold uppercase tracking-widest text-neutral-400 flex items-center gap-2">
                      <Users className="w-4 h-4 text-brand" /> GLADIADOR 2
                    </label>
                    <span className="text-[10px] text-neutral-500 font-mono font-bold">
                      {mc2.name.length}/20
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder="NOME DO MC"
                    value={mc2.name}
                    maxLength={20}
                    onChange={(e) => setMc2({ ...mc2, name: e.target.value.toUpperCase() })}
                    className="w-full max-w-sm bg-neutral-900 border-2 border-neutral-800 px-4 py-3 rounded-xl focus:border-brand outline-none transition-colors text-base font-bold italic text-white placeholder:text-neutral-600 uppercase h-[52px] tracking-wide text-center"
                  />
                </div>
              </div>

              <div className="flex justify-center pt-2">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleStart}
                  disabled={!mc1.name.trim() || !mc2.name.trim()}
                  className="px-8 py-3.5 bg-brand hover:bg-brand/90 rounded-xl text-white font-black uppercase text-base sm:text-lg shadow-[0_0_20px_rgba(255,62,62,0.35)] disabled:opacity-50 disabled:grayscale transition-all flex items-center justify-center gap-2"
                >
                  Iniciar Batalha <ChevronRight className="w-5 h-5" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {(phase === 'round1' || phase === 'round2' || phase === 'round3') && (
            <motion.div
              key={`${phase}-${activeMc === 0 ? 'select' : 'combat'}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex-1 flex flex-col gap-6 relative z-10"
            >
              {activeMc === 0 ? (
                /* Menu de seleção dos gladiadores (Padrão de cores da aplicação - Brand Red & Dark Neutral) */
                <div className="my-auto py-12 flex flex-col items-center justify-center min-h-[60vh] text-center">
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 w-full max-w-6xl px-4">
                    <button
                      type="button"
                      onClick={() => selectGladiatorToStart(1)}
                      className="w-full sm:w-[380px] md:w-[440px] h-24 sm:h-28 border-2 border-brand/60 hover:border-brand bg-neutral-900/90 hover:bg-brand/10 rounded-2xl active:scale-95 transition-all flex items-center justify-center px-6 sm:px-8 cursor-pointer group shadow-[0_0_25px_rgba(255,62,62,0.25)] hover:shadow-[0_0_40px_rgba(255,62,62,0.6)]"
                    >
                      <span className={`font-black italic uppercase text-white group-hover:text-brand tracking-wide text-center whitespace-nowrap transition-colors ${
                        (mc1.name || 'braza').length > 14
                          ? 'text-base sm:text-lg md:text-xl lg:text-2xl'
                          : (mc1.name || 'braza').length > 10
                          ? 'text-lg sm:text-xl md:text-2xl lg:text-3xl'
                          : 'text-xl sm:text-2xl md:text-3xl lg:text-4xl'
                      }`}>
                        {mc1.name || 'braza'}
                      </span>
                    </button>

                    <span className="text-2xl sm:text-4xl font-black italic tracking-tighter text-brand drop-shadow-[0_0_10px_rgba(255,62,62,0.5)] px-2 select-none shrink-0">
                      VS
                    </span>

                    <button
                      type="button"
                      onClick={() => selectGladiatorToStart(2)}
                      className="w-full sm:w-[380px] md:w-[440px] h-24 sm:h-28 border-2 border-brand/60 hover:border-brand bg-neutral-900/90 hover:bg-brand/10 rounded-2xl active:scale-95 transition-all flex items-center justify-center px-6 sm:px-8 cursor-pointer group shadow-[0_0_25px_rgba(255,62,62,0.25)] hover:shadow-[0_0_40px_rgba(255,62,62,0.6)]"
                    >
                      <span className={`font-black italic uppercase text-white group-hover:text-brand tracking-wide text-center whitespace-nowrap transition-colors ${
                        (mc2.name || 'hidra').length > 14
                          ? 'text-base sm:text-lg md:text-xl lg:text-2xl'
                          : (mc2.name || 'hidra').length > 10
                          ? 'text-lg sm:text-xl md:text-2xl lg:text-3xl'
                          : 'text-xl sm:text-2xl md:text-3xl lg:text-4xl'
                      }`}>
                        {mc2.name || 'hidra'}
                      </span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Ecrã de Combate e Contagem de Rimas (só aparece após escolher o gladiador) */
                <>
                  <div className="relative z-10 flex items-center gap-3">
                <div className="flex-1 flex justify-between items-center bg-neutral-900/50 p-4 rounded-2xl border border-neutral-800 relative overflow-hidden">
                  <div className="flex flex-col">
                    <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-brand flex items-center gap-1">
                      <Users className="w-3 h-3 text-brand" /> ANFITRIÃO
                    </div>
                    <div className="text-xs sm:text-base font-black text-white italic mt-0.5 uppercase tracking-wider max-w-[130px] sm:max-w-[220px] truncate">
                      FLY-SQUAD
                    </div>
                  </div>
                  {/* Centered Round Indicator */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="relative">
                      <div className="absolute inset-0 bg-brand/20 blur-xl rounded-full animate-pulse" />
                      <div className="w-20 h-20 border-2 border-brand rounded-full flex flex-col items-center justify-center bg-neutral-900 relative z-10 shadow-[0_0_20px_rgba(255,62,62,0.5)]">
                        <span className="text-xs font-black text-brand uppercase tracking-tighter leading-none mb-0.5">Round</span>
                        <span className={`text-3xl font-black text-white italic leading-none animate-pulse ${currentRoundIndex === 0 ? 'pr-1.5' : 'pr-0.5'}`}>{currentRoundIndex + 1}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1.5">
                    <div className="flex items-center gap-2 sm:gap-4">
                      {/* Júri Badge */}
                      <div className="flex flex-col items-end">
                        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-brand flex items-center gap-1">
                          <Scale className="w-3 h-3 text-brand" /> Júri
                        </span>
                        <span className="text-xs sm:text-base font-black text-amber-400 italic uppercase tracking-wider bg-neutral-900/90 border border-brand/60 px-3 py-1.5 rounded-xl select-none shadow-md mt-0.5 max-w-[120px] sm:max-w-[220px] truncate">
                          {juryName || 'NÃO ESPECIFICADO'}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-1 pt-0.5">
                      {[1, 2, 3].map(r => (
                        <div 
                          key={r}
                          className={`w-1.5 h-1.5 rounded-full transition-all ${
                            currentRoundIndex + 1 === r ? 'bg-brand scale-125' : r <= currentRoundIndex ? 'bg-neutral-600' : 'bg-neutral-800'
                          }`} 
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {activeMc === 1 || activeMc === 2 ? (
                /* Single Active Gladiator Counting Card (Centered) */
                <div className="w-full max-w-xl mx-auto">
                  {(() => {
                    const idx = activeMc as 1 | 2;
                    const mc = idx === 1 ? mc1 : mc2;
                    const roundData = mc.rounds[currentRoundIndex];
                    const otherMcIdx = idx === 1 ? 2 : 1;
                    const otherMc = idx === 1 ? mc2 : mc1;

                    const hasRhymes = (roundData?.rhymes || 0) > 0;

                    const ptsTotal = (
                      ((roundData.rhymes || 0) * 1) +
                      ((roundData.quality || 0) * 2) +
                      ((roundData.response || 0) * 1) +
                      ((roundData.performance || 0) * 1) +
                      ((roundData.oooShit || 0) * 1.5) -
                      (25 - (roundData.brancas !== undefined ? roundData.brancas : 25))
                    ).toFixed(1);

                    return (
                      <div className="flex flex-col gap-4">
                        <div className="bg-neutral-900/95 rounded-3xl border-2 border-brand p-5 sm:p-7 space-y-5 shadow-[0_0_30px_rgba(255,62,62,0.15)] relative overflow-hidden">
                          {/* Top Identity bar */}
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <motion.div animate={{ scale: [1, 1.25, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-2.5 h-2.5 bg-brand rounded-full shadow-[0_0_12px_#FF3E3E]" />
                                <span className="text-xs font-black uppercase tracking-widest text-brand">
                                  Rimando Agora • Turno {roundStarter === idx ? '1' : '2'}
                                </span>
                              </div>
                              <div className="text-2xl sm:text-3xl font-black italic uppercase leading-tight text-white tracking-wider">
                                {mc.name || `GLADIADOR ${idx}`}
                              </div>
                            </div>

                            <div className="bg-brand border-2 border-brand/80 shadow-[0_0_20px_rgba(255,62,62,0.4)] px-4 py-2 rounded-2xl flex flex-col items-center shrink-0">
                              <span className="text-[9px] font-black uppercase leading-none mb-0.5 tracking-tighter text-white/80">PTS ROUND</span>
                              <div className="text-2xl font-black font-mono leading-none text-white">
                                {ptsTotal}
                              </div>
                            </div>
                          </div>

                          {/* Rhymes */}
                          <div className="space-y-2 pt-2 border-t border-neutral-800">
                            <div className="flex justify-between items-baseline">
                              <span className="text-sm font-black uppercase tracking-wider text-white">Rimas</span>
                              <span className="text-2xl font-black font-mono text-brand">{roundData.rhymes}</span>
                            </div>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => updateScore(idx, 'rhymes', -1)}
                                className="flex-1 bg-neutral-800 hover:bg-neutral-700 py-3 rounded-xl transition-colors flex justify-center items-center text-white font-bold cursor-pointer"
                              >
                                <Minus className="w-5 h-5" />
                              </button>
                              <button 
                                onClick={() => updateScore(idx, 'rhymes', 1)}
                                className="flex-[3] bg-brand/20 border-2 border-brand hover:bg-brand/30 py-3 rounded-xl transition-colors flex justify-center items-center gap-2 font-black text-base text-white shadow-[0_0_15px_rgba(255,62,62,0.2)] active:scale-95 cursor-pointer"
                              >
                                <Plus className="w-5 h-5" /> RIMA!
                              </button>
                            </div>
                          </div>

                          {/* Evaluation Fields */}
                          <div className="space-y-4 pt-2 border-t border-neutral-800">
                            {[
                              { label: 'Ataque Direto', field: 'quality' as const, max: 50, color: 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]', textColor: 'text-green-300', labelColor: 'text-green-300' },
                              { label: 'Resposta', field: 'response' as const, max: 10, color: 'bg-yellow-300 shadow-[0_0_8px_rgba(253,224,71,0.5)]', textColor: 'text-yellow-300', labelColor: 'text-yellow-300' },
                              { label: 'BRANCAS', field: 'brancas' as const, max: 25, color: 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]', textColor: 'text-cyan-300', labelColor: 'text-cyan-300', onlyMinus: true },
                              { label: 'Encenação', field: 'performance' as const, max: 10, color: 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]', textColor: 'text-red-300', labelColor: 'text-red-300' },
                              { label: 'OOOOH SHIT!', field: 'oooShit' as const, max: 10, color: 'bg-amber-300 shadow-[0_0_8px_rgba(252,211,77,0.5)]', textColor: 'text-amber-300', labelColor: 'text-amber-300', special: true },
                            ].map((item) => (
                              <div 
                                key={item.label} 
                                className={`space-y-1.5 transition-all ${
                                  item.special && roundData.oooShit > 0 
                                    ? 'bg-amber-500/10 -mx-2 px-3 py-1.5 rounded-xl shadow-[0_0_20px_rgba(251,191,36,0.15)] border border-amber-500/30' 
                                    : ''
                                }`}
                              >
                                <div className="flex justify-between items-baseline">
                                  <span className={`text-xs sm:text-sm font-black uppercase tracking-wider flex items-center gap-1.5 ${item.special ? 'text-amber-300 animate-pulse' : item.labelColor}`}>
                                    {item.field === 'brancas' && (
                                      <Droplet className="w-4 h-4 text-cyan-300 fill-cyan-300/30" />
                                    )}
                                    {item.label}
                                  </span>
                                  <span className={`text-base sm:text-lg font-black ${item.textColor} ${item.special && roundData.oooShit > 0 ? 'scale-125 origin-right drop-shadow-[0_0_10px_rgba(252,211,77,0.8)]' : ''}`}>
                                    {roundData[item.field]}/{item.max}
                                  </span>
                                </div>
                                <div className="flex gap-2 items-center">
                                  <button 
                                    onClick={() => updateScore(idx, item.field, -1)}
                                    className="flex-1 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700/80 transition-colors p-2.5 rounded-xl flex justify-center items-center text-white cursor-pointer"
                                  >
                                    <Minus className="w-4 h-4 text-white" />
                                  </button>
                                  <div className="flex-[4] h-3 bg-neutral-950 border border-neutral-800 rounded-full overflow-hidden">
                                    <motion.div 
                                      className={`h-full ${item.color}`}
                                      initial={false}
                                      animate={{ 
                                        width: `${(roundData[item.field] / item.max) * 100}%` 
                                      }}
                                    />
                                  </div>
                                  {!(item as any).onlyMinus ? (
                                    <button 
                                      onClick={() => updateScore(idx, item.field, 1)}
                                      className="flex-1 p-2.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700/80 transition-colors rounded-xl flex justify-center items-center text-white cursor-pointer"
                                    >
                                      <Plus className="w-4 h-4 text-white" />
                                    </button>
                                  ) : (
                                    <div className="flex-1" />
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Notes */}
                          <div className="space-y-1.5 pt-2 border-t border-neutral-800">
                            <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">Notas Rápidas</span>
                            <textarea
                              placeholder="Observações das rimas do gladiador..."
                              value={roundData.notes}
                              onChange={(e) => updateScore(idx, 'notes', e.target.value)}
                              className="w-full bg-neutral-950 border border-neutral-800 p-3 rounded-xl text-sm text-white font-medium focus:border-brand outline-none transition-colors min-h-[60px] resize-none placeholder-neutral-600"
                            />
                          </div>
                        </div>

                        {/* Turn Action Button */}
                        <button
                          disabled={!hasRhymes}
                          onClick={() => {
                            const isFirstToRhymeInRound = activeMc === roundStarter;
                            if (isFirstToRhymeInRound) {
                              setActiveMc(otherMcIdx as 1 | 2);
                              const nextName = otherMc.name || `Gladiador ${otherMcIdx}`;
                              setStarterAnimation({ name: nextName, roundNum: currentRoundIndex + 1, isSecond: true });
                            } else {
                              setActiveMc(3); // Both finished
                            }
                          }}
                          className={`w-full py-4 rounded-2xl font-black uppercase text-sm sm:text-base flex items-center justify-center gap-2 border-2 transition-all ${
                            hasRhymes 
                              ? 'border-brand bg-brand text-white hover:bg-brand/90 shadow-[0_0_25px_rgba(255,62,62,0.4)] cursor-pointer active:scale-98'
                              : 'border-neutral-800 bg-neutral-900 text-neutral-500 opacity-50 cursor-not-allowed shadow-none'
                          }`}
                        >
                          <Mic2 className="w-5 h-5" />
                          <span>
                            {!hasRhymes 
                              ? `Adicione pelo menos 1 rima para concluir o turno`
                              : activeMc === roundStarter 
                              ? `Finalizar Vez de ${mc.name || `Gladiador ${idx}`} → Ir para ${otherMc.name || `Gladiador ${otherMcIdx}`}` 
                              : `Concluir Turno & Ver Resultado do Round ${currentRoundIndex + 1}`}
                          </span>
                        </button>
                      </div>
                    );
                  })()}
                </div>
              ) : activeMc === 3 ? (
                /* Round Completed Summary Card */
                <div className="w-full max-w-xl mx-auto space-y-6">
                  <div className="bg-neutral-900/95 border-2 border-neutral-700/80 rounded-3xl p-6 sm:p-8 space-y-6 text-center shadow-2xl">
                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-500/40 rounded-full text-green-400 text-xs font-bold uppercase tracking-widest">
                        <CheckCircle2 className="w-4 h-4" /> Round {currentRoundIndex + 1} Concluído
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-black italic uppercase text-white tracking-wider">
                        Resumo do Round {currentRoundIndex + 1}
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      {[1, 2].map(idx => {
                        const mc = idx === 1 ? mc1 : mc2;
                        const roundData = mc.rounds[currentRoundIndex];
                        const pts = (
                          ((roundData.rhymes || 0) * 1) +
                          ((roundData.quality || 0) * 2) +
                          ((roundData.response || 0) * 1) +
                          ((roundData.performance || 0) * 1) +
                          ((roundData.oooShit || 0) * 1.5) -
                          (25 - (roundData.brancas !== undefined ? roundData.brancas : 25))
                        ).toFixed(1);

                        return (
                          <div key={idx} className="bg-neutral-950 border border-neutral-800 p-4 rounded-2xl flex flex-col items-center gap-1">
                            <span className="text-[10px] font-extrabold uppercase text-neutral-400 tracking-wider">
                              {mc.name || `GLADIADOR ${idx}`}
                            </span>
                            <span className="text-3xl font-black font-mono text-white italic">
                              {pts} <span className="text-xs text-brand font-normal uppercase">pts</span>
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <button
                      onClick={nextPhase}
                      className="w-full bg-brand text-white py-4 rounded-2xl font-black uppercase text-base flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(255,62,62,0.4)] hover:bg-brand/90 transition-all cursor-pointer active:scale-98"
                    >
                      <span>{phase === 'round3' ? 'Ver Resultado Final da Batalha' : `Avançar para o Round ${currentRoundIndex + 2}`}</span>
                      <ChevronRight className="w-5 h-5" />
                    </button>

                    <button
                      onClick={() => setActiveMc(roundStarter || 1)}
                      className="text-xs text-neutral-500 hover:text-neutral-300 font-bold uppercase tracking-wider underline transition-colors cursor-pointer"
                    >
                      Ajustar Pontos deste Round
                    </button>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </motion.div>
          )}

          {phase === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 flex flex-col gap-6 relative z-10"
            >
              <div className="relative z-10 text-center py-4 space-y-3">
                <Trophy className="w-16 h-16 text-accent mx-auto mb-2 drop-shadow-[0_0_15px_rgba(255,215,0,0.5)]" />
                <h2 className="text-4xl font-black uppercase italic tracking-tighter">Resultado Final</h2>
                
                <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 py-2">
                  <div className="flex items-center gap-3 bg-neutral-900/90 border border-neutral-700/80 px-5 py-3 rounded-2xl shadow-lg">
                    <div className="p-2 bg-neutral-800 rounded-xl text-neutral-300">
                      <Users className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">Anfitrião</span>
                      <span className="text-base sm:text-lg font-black text-white italic uppercase tracking-wider">
                        FLY-SQUAD
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-neutral-900/90 border border-brand/60 px-5 py-3 rounded-2xl shadow-lg">
                    <div className="p-2 bg-brand/20 rounded-xl text-brand">
                      <Scale className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand">Júri / Jurado</span>
                      <span className="text-base sm:text-lg font-black text-amber-400 italic uppercase tracking-wider">
                        {juryName || 'NÃO ESPECIFICADO'}
                      </span>
                    </div>
                  </div>
                </div>

                {parseFloat(mc1Total) !== parseFloat(mc2Total) ? (
                  <div className="inline-block bg-brand px-6 py-2 rounded-full text-white font-black uppercase tracking-widest text-sm animate-bounce shadow-lg mt-1">
                    VENCEDOR: {parseFloat(mc1Total) > parseFloat(mc2Total) ? mc1.name : mc2.name}
                  </div>
                ) : (
                  <div className="inline-block bg-neutral-700 px-6 py-2 rounded-full text-white font-black uppercase tracking-widest text-sm shadow-lg mt-1">
                    EMPATE TÉCNICO
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={copyToClipboard}
                  className="w-full bg-brand text-white py-5 rounded-2xl font-black uppercase text-lg flex items-center justify-center gap-2 shadow-xl mb-4"
                >
                  Compartilhar Veredito <Share2 className="w-5 h-5" />
                </motion.button>

                {[1, 2].map(idx => {
                  const mc = idx === 1 ? mc1 : mc2;
                  const score = idx === 1 ? mc1Total : mc2Total;
                  const otherScore = idx === 1 ? mc2Total : mc1Total;
                  const isWinner = parseFloat(score) > parseFloat(otherScore);
                  const isTie = parseFloat(score) === parseFloat(otherScore);
                  
                  return (
                    <div 
                      key={idx} 
                      className={`p-6 rounded-3xl border-2 transition-all select-none cursor-default ${
                        isWinner ? 'bg-brand/10 border-brand shadow-[0_0_15px_rgba(255,62,62,0.2)]' : isTie ? 'bg-neutral-800/50 border-neutral-700' : 'bg-neutral-900 border-neutral-800 opacity-60'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="text-2xl font-black italic uppercase px-2 py-0.5 select-none cursor-default text-white text-left">
                            {mc.name}
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {mc.rounds.map((r, i) => (
                              <div key={i} className="flex flex-col gap-1 p-2 bg-neutral-800/50 rounded-lg min-w-[80px]">
                                <div className="text-[10px] font-bold text-neutral-500 uppercase">RD {i+1}</div>
                                <div className={`text-sm font-bold ${getRoundWinner(i) === idx ? 'text-brand' : 'text-neutral-200'}`}>
                                  {
                                    (
                                      (((r.rhymes || 0) * 1) + ((r.quality || 0) * 2) + ((r.response || 0) * 1) + ((r.performance || 0) * 1) + ((r.oooShit || 0) * 1.5)) - (25 - (r.brancas !== undefined ? r.brancas : 25))
                                    ).toFixed(0)
                                  } <span className="text-[10px] font-normal text-neutral-400">pts</span>
                                  {getRoundWinner(i) === idx && <span className="ml-1 text-[8px] bg-brand/20 text-brand px-1 rounded">WIN</span>}
                                </div>
                                {r.notes && (
                                  <div className="text-[11px] text-neutral-300 italic line-clamp-3 mt-1 border-t border-neutral-700 pt-1">
                                    "{r.notes}"
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-xs uppercase font-bold text-neutral-500 tracking-widest">Total</div>
                          <div className={`text-4xl font-black font-mono text-white`}>
                            {score}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-auto py-8">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={reset}
                  className="w-full bg-neutral-900 border border-neutral-800 py-4 rounded-xl font-bold uppercase tracking-widest text-neutral-400 flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" /> Nova Batalha
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <footer className="py-8 border-t border-neutral-900 mt-auto text-center">
          <p className="text-[10px] uppercase font-bold tracking-widest text-neutral-700">
            Design for High Energy Rap Battles • 2026
          </p>
        </footer>
      </main>
    </div>
  );
}
