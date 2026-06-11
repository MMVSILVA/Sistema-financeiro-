import React, { useState, useEffect, useRef } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  AlertCircle,
  HelpCircle,
  PiggyBank
} from 'lucide-react';

interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  className?: string;
}

export function AnimatedCounter({ value, prefix = 'R$ ', className = '' }: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const previousValueRef = useRef(0);

  useEffect(() => {
    const startValue = previousValueRef.current;
    const endValue = value;
    
    const duration = 1000; // Animation length in ms
    const frameRate = 35; // Frames per second
    const totalFrames = Math.round((duration / 1000) * frameRate);
    let currentFrame = 0;

    const timer = setInterval(() => {
      currentFrame++;
      // Easing out math: progress = 1 - (1 - progress) ^ 2
      const progress = currentFrame / totalFrames;
      const easeProgress = 1 - Math.pow(1 - progress, 2);
      
      const currentVal = startValue + (endValue - startValue) * easeProgress;
      setDisplayValue(currentVal);

      if (currentFrame >= totalFrames) {
        setDisplayValue(endValue);
        clearInterval(timer);
      }
    }, 1000 / frameRate);

    previousValueRef.current = value;

    return () => clearInterval(timer);
  }, [value]);

  const formatBRLValue = (val: number) => {
    // Handle negative/positive values gracefully
    const absoluteVal = Math.abs(val);
    const formatted = absoluteVal.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return val < 0 ? `-${prefix}${formatted}` : `${prefix}${formatted}`;
  };

  return (
    <span className={`${className} privacy-sensitive inline-block`}>
      {formatBRLValue(displayValue)}
    </span>
  );
}

interface KPICardsProps {
  totalIncomes: number;
  totalExpenses: number;
  totalFixed: number;
  monthlyBudget: number;
}

export default function KPICards({ totalIncomes, totalExpenses, totalFixed, monthlyBudget }: KPICardsProps) {
  const currentBalance = totalIncomes - totalExpenses;
  const budgetPercentage = Math.min((totalExpenses / (monthlyBudget || 1)) * 100, 100);

  return (
    <section id="kpi-banner-cards" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* Saldo Total */}
      <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
        <div className="absolute -right-5 -bottom-5 w-24 h-24 bg-purple-500/10 rounded-full blur-xl group-hover:bg-purple-500/20 transition-all"></div>
        <div className="flex justify-between items-start">
          <p className="text-xs text-white/40 uppercase tracking-widest font-display">Saldo Geral</p>
          <div className="p-2 bg-purple-600/10 text-purple-400 rounded-lg">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <h2 className={`text-2xl font-bold mt-2 font-display ${currentBalance >= 0 ? 'text-white' : 'text-red-400'}`}>
          <AnimatedCounter value={currentBalance} />
        </h2>
        <p className="text-[11px] text-white/50 mt-3 flex items-center gap-1.5 font-mono">
          <span className="text-green-400 font-bold">▲ +4.2%</span> este mês
        </p>
      </div>

      {/* Receitas */}
      <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
        <div className="absolute -right-5 -bottom-5 w-24 h-24 bg-green-500/10 rounded-full blur-xl group-hover:bg-green-500/20 transition-all"></div>
        <div className="flex justify-between items-start">
          <p className="text-xs text-white/40 uppercase tracking-widest font-display">Receitas (Salários)</p>
          <div className="p-2 bg-green-500/10 text-green-400 rounded-lg">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <h2 className="text-2xl font-bold mt-2 text-green-400 font-display">
          <AnimatedCounter value={totalIncomes} />
        </h2>
        <p className="text-[11px] text-white/50 mt-3 font-mono">
          Próximo depósito: 05/11
        </p>
      </div>

      {/* Despesas Fixas */}
      <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
        <div className="absolute -right-5 -bottom-5 w-24 h-24 bg-red-500/10 rounded-full blur-xl group-hover:bg-red-500/20 transition-all"></div>
        <div className="flex justify-between items-start">
          <p className="text-xs text-white/40 uppercase tracking-widest font-display">Despesas Fixas</p>
          <div className="p-2 bg-red-500/10 text-red-400 rounded-lg">
            <TrendingDown className="w-4 h-4" />
          </div>
        </div>
        <h2 className="text-2xl font-bold mt-2 text-red-400 font-display">
          <AnimatedCounter value={totalFixed} />
        </h2>
        <div className="mt-4 w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
          <div className="bg-red-500 h-full rounded-full" style={{ width: `${Math.min((totalFixed / (totalExpenses || 1)) * 100, 100)}%` }}></div>
        </div>
      </div>

      {/* Orçamento Familiar */}
      <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
        <div className="absolute -right-5 -bottom-5 w-24 h-24 bg-purple-500/10 rounded-full blur-xl group-hover:bg-purple-500/20 transition-all"></div>
        <div className="flex justify-between items-start">
          <p className="text-xs text-white/40 uppercase tracking-widest font-display">Uso do Orçamento</p>
          <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
            <PiggyBank className="w-4 h-4" />
          </div>
        </div>
        <h2 className="text-2xl font-bold mt-2 text-purple-400 font-display">
          <AnimatedCounter value={monthlyBudget} />
        </h2>
        <div className="mt-3 flex items-center justify-between text-[11px] font-mono">
          <span className="text-white/60">Gasto: {budgetPercentage.toFixed(0)}%</span>
          <span className="text-white/40">
            <AnimatedCounter value={totalExpenses} /> usado
          </span>
        </div>
      </div>
    </section>
  );
}
