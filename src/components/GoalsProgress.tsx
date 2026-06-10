import React, { useState } from 'react';
import { Target, Plus, CheckCircle, Trophy, Sparkles, TrendingUp, HelpCircle } from 'lucide-react';
import { Goal } from '../types';

interface GoalsProgressProps {
  goals: Goal[];
  onAddGoal: (goal: Omit<Goal, 'id' | 'uid'>) => void;
  onUpdateGoalProgress: (id: string, newPoupado: number) => void;
  onDeleteGoal: (id: string) => void;
}

export default function GoalsProgress({
  goals,
  onAddGoal,
  onUpdateGoalProgress,
  onDeleteGoal
}: GoalsProgressProps) {
  // New goal form state
  const [goalTitle, setGoalTitle] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalDate, setGoalDate] = useState('2026-12-31');
  const [goalCat, setGoalCat] = useState('Reserva de Emergência');

  // Confetti particle system & milestone triggers
  const previousPoupadoRef = React.useRef<Record<string, number>>({});
  const [showBlast, setShowBlast] = useState(false);
  const [blastMessage, setBlastMessage] = useState('');
  const [particles, setParticles] = useState<{id: number, left: number, color: string, size: number, tx: number, ty: number, rot: number}[]>([]);

  React.useEffect(() => {
    // Seed initial values
    goals.forEach(goal => {
      if (previousPoupadoRef.current[goal.id] === undefined) {
        previousPoupadoRef.current[goal.id] = goal.valorPoupado;
      }
    });
  }, [goals]);

  React.useEffect(() => {
    let triggered = false;
    let message = '';
    goals.forEach(goal => {
      const prev = previousPoupadoRef.current[goal.id];
      if (prev !== undefined && goal.valorPoupado > prev) {
        const percentPrev = (prev / goal.valorAlvo) * 100;
        const percentCurr = (goal.valorPoupado / goal.valorAlvo) * 100;

        if (percentCurr >= 100 && percentPrev < 100) {
          triggered = true;
          message = `🏆 Incrível! Você atingiu 100% da meta: "${goal.titulo}"! 🎉`;
        } else if (percentCurr - percentPrev >= 10) {
          triggered = true;
          message = `✨ Aporte significativo de +${(percentCurr - percentPrev).toFixed(0)}% na meta: "${goal.titulo}"! 🚀`;
        }
      }
      previousPoupadoRef.current[goal.id] = goal.valorPoupado;
    });

    if (triggered) {
      setBlastMessage(message);
      setShowBlast(true);

      const generated = Array.from({ length: 70 }).map((_, i) => ({
        id: Date.now() + i + Math.random(),
        left: Math.random() * 80 + 10, // 10% to 90%
        color: ['#a855f7', '#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#14b8a6'][Math.floor(Math.random() * 6)],
        size: Math.random() * 8 + 6,
        tx: (Math.random() - 0.5) * 350,
        ty: -200 - Math.random() * 250,
        rot: 360 + Math.random() * 720
      }));
      setParticles(generated);

      const timer1 = setTimeout(() => {
        setShowBlast(false);
      }, 3500);

      const timer2 = setTimeout(() => {
        setParticles([]);
      }, 4500);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [goals]);

  const submitGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle || !goalTarget) return;

    onAddGoal({
      titulo: goalTitle,
      valorAlvo: parseFloat(goalTarget),
      valorPoupado: 0,
      prazo: goalDate,
      categoria: goalCat
    });

    setGoalTitle('');
    setGoalTarget('');
  };

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div id="goals-milestones" className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
      
      {/* Styles for confetti floating particles */}
      <style>{`
        @keyframes confettiFountain {
          0% {
            transform: translate3d(0, 0, 0) rotate(0deg);
            opacity: 1;
          }
          40% {
            opacity: 1;
          }
          100% {
            transform: translate3d(var(--tx), var(--ty), 0) rotate(var(--rot));
            opacity: 0;
          }
        }
        .confetti-element {
          animation: confettiFountain var(--dur, 3s) cubic-bezier(0.12, 0.85, 0.35, 1) forwards;
        }
      `}</style>

      {/* Confetti Particle Layer */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="confetti-element absolute pointer-events-none rounded"
          style={{
            '--tx': `${p.tx}px`,
            '--ty': `${p.ty}px`,
            '--rot': `${p.rot}deg`,
            '--dur': `${2.5 + Math.random() * 1.5}s`,
            left: `${p.left}%`,
            bottom: '24px',
            backgroundColor: p.color,
            width: `${p.size}px`,
            height: `${p.size * 1.6}px`,
            zIndex: 99
          } as React.CSSProperties}
        />
      ))}

      {/* Celebratory Banner */}
      {showBlast && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-[#120824]/90 border border-purple-500/40 p-4 rounded-3xl shadow-2xl flex items-center gap-3 backdrop-blur-md animate-fadeIn transition-all duration-300 transform scale-100 max-w-sm w-full">
          <div className="w-10 h-10 bg-purple-500/20 text-purple-400 rounded-full flex items-center justify-center shrink-0 border border-purple-500/30">
            <Trophy className="w-5 h-5 text-yellow-500 animate-bounce" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono font-bold text-purple-400 block tracking-widest">Acontecendo Agora!</span>
            <p className="text-xs text-white font-medium mt-0.5">{blastMessage}</p>
          </div>
        </div>
      )}

      {/* 1. Register Goal component form */}
      <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="p-1 px-2.5 bg-purple-600/10 text-purple-400 border border-purple-500/10 text-[10px] font-mono font-bold rounded-full">METAS FAMILY</span>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-display">Traçar Objetivos</h4>
          </div>
          <p className="text-xs text-white/45 mb-4 leading-relaxed font-normal">Crie metas financeiras de médio e longo prazo para que a inteligência artificial ajuste o orçamento de gastos e recomende aportes ideais.</p>

          <form onSubmit={submitGoal} className="flex flex-col gap-3.5">
            <div>
              <label className="text-[10px] uppercase font-mono font-bold text-white/40 block mb-1">Título do Objetivo</label>
              <input 
                type="text" 
                required
                value={goalTitle}
                onChange={(e) => setGoalTitle(e.target.value)}
                placeholder="Ex: Reforma da sala, Trocar de Carro"
                className="w-full bg-black/40 border border-white/10 focus:border-purple-500/50 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase font-mono font-bold text-white/40 block mb-1">Categoria</label>
                <select 
                  value={goalCat}
                  onChange={(e) => setGoalCat(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 focus:border-purple-500/50 rounded-xl px-3 py-2 text-xs text-white outline-none"
                >
                  <option value="Reserva de Emergência">Reserva de Emergência</option>
                  <option value="Aquisição">Aquisição / Bens</option>
                  <option value="Viagem">Viagem Familiar</option>
                  <option value="Investimento">Investimento</option>
                  <option value="Outros">Outras Metas</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase font-mono font-bold text-white/40 block mb-1">Valor Alvo (R$)*</label>
                <input 
                  type="number" 
                  required
                  value={goalTarget}
                  onChange={(e) => setGoalTarget(e.target.value)}
                  placeholder="Ex BRL: 25000"
                  className="w-full bg-black/40 border border-white/10 focus:border-purple-500/50 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] uppercase font-mono font-bold text-white/40 block mb-1">Prazo Alvo</label>
              <input 
                type="date" 
                value={goalDate}
                onChange={(e) => setGoalDate(e.target.value)}
                className="w-full bg-black/40 border border-white/10 focus:border-purple-500/50 rounded-xl px-3 py-2 text-xs text-white outline-none font-mono"
              />
            </div>
            <button 
              type="submit" 
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-2.5 rounded-xl text-xs transition active:scale-95 shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Criar Meta
            </button>
          </form>
        </div>
      </div>

      {/* 2. Goal lists with progress bars and quick aport buttons */}
      <div className="lg:col-span-2 bg-[#08080c]/50 border border-white/10 rounded-3xl p-5 flex flex-col justify-between">
        <div>
          <h4 className="text-sm font-semibold text-white mb-1">Meus Objetivos e Progresso Real</h4>
          <p className="text-xs text-white/40 mb-4 font-normal">Veja o progresso e adicione recursos poupados do mês diretamente nelas.</p>

          <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/5">
            {goals.length === 0 ? (
              <div className="h-44 flex flex-col justify-center items-center text-white/30 text-xs">
                <Target className="w-8 h-8" />
                <span>Nenhum objetivo cadastrado.</span>
              </div>
            ) : (
              goals.map((goal) => {
                const percent = Math.min((goal.valorPoupado / (goal.valorAlvo || 1)) * 100, 100);
                return (
                  <div 
                    key={goal.id}
                    className="bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 p-4 rounded-2xl flex flex-col gap-3 transition"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="text-xs font-bold text-white">{goal.titulo}</h5>
                          <span className="text-[9px] bg-purple-500/10 text-purple-400 font-mono px-1.5 py-0.2 rounded font-semibold">{goal.categoria}</span>
                        </div>
                        <span className="text-[10px] text-white/30 block mt-0.5">Prazo de Resgate: {goal.prazo}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => onDeleteGoal(goal.id)}
                          className="text-red-400 hover:text-red-300 text-[10px] cursor-pointer"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>

                    {/* Progress slider loop */}
                    <div className="flex flex-col gap-1.5">
                      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            percent >= 100 ? 'bg-green-500 glow-green' : 'bg-purple-600'
                          }`} 
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                      
                      <div className="flex justify-between text-[10px] font-mono text-white/40">
                        <span>Poupado: <strong className="text-white">{formatBRL(goal.valorPoupado)}</strong></span>
                        <span>Progresso: {percent.toFixed(0)}%</span>
                        <span>Alvo: <strong className="text-white">{formatBRL(goal.valorAlvo)}</strong></span>
                      </div>
                    </div>

                    {/* Quick increment tool slider */}
                    <div className="flex items-center gap-3 bg-black/40 p-2 rounded-xl">
                      <label className="text-[9px] text-white/40 uppercase font-mono shrink-0 font-bold">Aporte Rápido:</label>
                      <input 
                        type="range"
                        min="0"
                        max={goal.valorAlvo}
                        step="50"
                        value={goal.valorPoupado}
                        onChange={(e) => onUpdateGoalProgress(goal.id, parseFloat(e.target.value))}
                        className="flex-1 accent-purple-600 h-1 cursor-pointer"
                      />
                      {percent >= 100 && (
                        <span className="text-[9px] font-mono font-bold text-green-400 flex items-center gap-1">
                          <Trophy className="w-3.5 h-3.5 shrink-0" /> CONCLUÍDO!
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* AI auto categorization prompt tip */}
        <div className="mt-4 bg-purple-950/20 border border-purple-500/10 p-3 rounded-2xl flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
          <p className="text-[10px] leading-relaxed text-white/60 font-normal">
            <span className="font-bold text-purple-300">Reserva de Emergência Ativa:</span> Com base no seu custo de vida recorrente médio de <strong className="text-white">R$ 3.120,45 BRL</strong>, a IA recomenda que a sua reserva ideal de segurança para 6 meses seja de <strong className="text-white">R$ 18.722,70</strong>. O progresso atual cobriu 76% do colchão amortecedor de segurança.
          </p>
        </div>
      </div>
    </div>
  );
}
