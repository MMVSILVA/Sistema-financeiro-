import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  HelpCircle, 
  Sparkles, 
  ChevronRight, 
  DollarSign, 
  Info,
  Calendar
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Investment } from '../types';

interface InvestmentSimulatorProps {
  investments: Investment[];
  onAddInvestment: (inv: Omit<Investment, 'id' | 'uid'>) => void;
  onDeleteInvestment: (id: string) => void;
}

export default function InvestmentSimulator({ 
  investments, 
  onAddInvestment, 
  onDeleteInvestment 
}: InvestmentSimulatorProps) {
  // Simulator Controls
  const [initialCapital, setInitialCapital] = useState(1000);
  const [monthlyContribution, setMonthlyContribution] = useState(250);
  const [selectedAssetIdx, setSelectedAssetIdx] = useState(0);
  const [durationYears, setDurationYears] = useState(5);
  const [useCustomRate, setUseCustomRate] = useState(false);
  const [customAnnualRate, setCustomAnnualRate] = useState(10.75); // Custom continuous annual %

  // New investment form fields
  const [newInvName, setNewInvName] = useState('');
  const [newInvValue, setNewInvValue] = useState('');
  const [newInvType, setNewInvType] = useState<'CDB' | 'Tesouro Direto' | 'Renda Fixa' | 'Ações' | 'Cripto' | 'Fundos Imobiliários'>('CDB');
  const [newInvYield, setNewInvYield] = useState('0.85');

  const assetPredefinedYields = [
    { label: 'CDB 102% CDI (Conservador)', monthlyYieldRate: 0.0087 }, // 0.87% monthly
    { label: 'Tesouro Selic (Padrão)', monthlyYieldRate: 0.0085 },     // 0.85% monthly
    { label: 'FIIs Fundos Imobiliários', monthlyYieldRate: 0.0075 },   // 0.75% monthly
    { label: 'Renda Variável (Moderado)', monthlyYieldRate: 0.0098 },  // 0.98% monthly
    { label: 'Poupança Convencional', monthlyYieldRate: 0.0050 },     // 0.50% monthly
  ];

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // Compute compound interest projections over years
  const simulationData = useMemo(() => {
    const dataPoints = [];
    const monthlyRate = useCustomRate
      ? Math.pow(1 + customAnnualRate / 100, 1 / 12) - 1
      : assetPredefinedYields[selectedAssetIdx].monthlyYieldRate;
    const totalMonths = durationYears * 12;

    let accumulatedValue = initialCapital;
    let accumulatedDeposits = initialCapital;

    // Push initial point
    dataPoints.push({
      month: 0,
      label: 'Início',
      Deposits: accumulatedDeposits,
      TotalTotal: accumulatedValue,
      Earnings: 0
    });

    for (let m = 1; m <= totalMonths; m++) {
      // Compound previous total
      accumulatedValue = accumulatedValue * (1 + monthlyRate);
      
      // Add contribution
      accumulatedValue += monthlyContribution;
      accumulatedDeposits += monthlyContribution;

      // Only push progress points per year/semester for cleaner chart rendering
      if (m % 6 === 0 || m === totalMonths) {
        const yearLabel = m % 12 === 0 ? `Ano ${m / 12}` : `Mês ${m}`;
        dataPoints.push({
          month: m,
          label: yearLabel,
          Deposits: Math.round(accumulatedDeposits),
          TotalTotal: Math.round(accumulatedValue),
          Earnings: Math.round(accumulatedValue - accumulatedDeposits)
        });
      }
    }
    return dataPoints;
  }, [initialCapital, monthlyContribution, selectedAssetIdx, durationYears, useCustomRate, customAnnualRate]);

  // Final simulation balances
  const lastPoint = simulationData[simulationData.length - 1];

  const submitNewInvestment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvName || !newInvValue) return;

    onAddInvestment({
      nome: newInvName,
      tipo: newInvType,
      valorAplicado: parseFloat(newInvValue),
      dataAplicacao: new Date().toISOString().split('T')[0],
      rendimentoMensalEst: parseFloat(newInvYield)
    });

    setNewInvName('');
    setNewInvValue('');
  };

  return (
    <div id="investments-simulation-section" className="flex flex-col gap-6">
      
      {/* Simulation workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sliders and controller panel */}
        <div className="lg:col-span-1 bg-white/[0.02] border border-white/10 rounded-3xl p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1 px-2.5 bg-purple-600/10 text-purple-400 border border-purple-500/20 text-[10px] font-mono font-bold rounded-full">SIMULADOR</span>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-display">Simular Juros Compostos</h3>
          </div>

          {/* Slider 1: Capital Inicial */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-white/60">Aporte Inicial</span>
              <span className="font-bold text-white font-mono">{formatBRL(initialCapital)}</span>
            </div>
            <input 
              type="range"
              min="0"
              max="50000"
              step="500"
              value={initialCapital}
              onChange={(e) => setInitialCapital(parseInt(e.target.value))}
              className="w-full accent-purple-600 cursor-pointer h-1 bg-white/10 rounded"
            />
          </div>

          {/* Slider 2: Aporte mensal */}
          <div className="flex flex-col gap-1.5 mt-2">
            <div className="flex justify-between text-xs">
              <span className="text-white/60">Aporte Mensal Recorrente</span>
              <span className="font-bold text-white font-mono">{formatBRL(monthlyContribution)}</span>
            </div>
            <input 
              type="range"
              min="50"
              max="5000"
              step="50"
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(parseInt(e.target.value))}
              className="w-full accent-purple-600 cursor-pointer h-1 bg-white/10 rounded"
            />
          </div>

          {/* Rate Mode Toggle & Input */}
          <div className="flex items-center justify-between border-t border-white/5 pt-3.5 mt-2">
            <span className="text-[10px] uppercase font-mono font-bold text-white/40">Modo de Rentabilidade</span>
            <div className="flex bg-black/40 border border-white/10 p-0.5 rounded-lg text-[9px] font-mono">
              <button
                type="button"
                onClick={() => setUseCustomRate(false)}
                className={`px-2 py-1 rounded font-bold transition ${!useCustomRate ? 'bg-purple-600 text-white' : 'text-white/45 hover:text-white'}`}
              >
                Ativos
              </button>
              <button
                type="button"
                onClick={() => setUseCustomRate(true)}
                className={`px-2 py-1 rounded font-bold transition ${useCustomRate ? 'bg-purple-600 text-white' : 'text-white/45 hover:text-white'}`}
              >
                Taxa Anual %
              </button>
            </div>
          </div>

          {useCustomRate ? (
            <div className="flex flex-col gap-1.5 mt-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-white/60">Taxa de Juros Anual (a.a.)</span>
                <span className="font-bold text-white font-mono">{customAnnualRate.toFixed(2)}% a.a.</span>
              </div>
              <input 
                type="range"
                min="1"
                max="30"
                step="0.05"
                value={customAnnualRate}
                onChange={(e) => setCustomAnnualRate(parseFloat(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer h-1 bg-white/10 rounded"
              />
              <span className="text-[9px] text-white/35 font-mono">Rendimento mensal equivalente: {((Math.pow(1 + customAnnualRate / 100, 1 / 12) - 1) * 100).toFixed(3)}% a.m.</span>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5 mt-1.5">
              <label className="text-[10px] uppercase font-mono font-bold text-white/40">Ativo Predefinido Líquido</label>
              <select 
                value={selectedAssetIdx}
                onChange={(e) => setSelectedAssetIdx(parseInt(e.target.value))}
                className="w-full bg-black/40 border border-white/10 text-white rounded-xl text-xs p-2.5 outline-none focus:ring-1 focus:ring-purple-500"
              >
                {assetPredefinedYields.map((yieldObj, idx) => (
                  <option key={idx} value={idx}>{yieldObj.label} (~{(yieldObj.monthlyYieldRate * 12 * 100).toFixed(1)}% a.a.)</option>
                ))}
              </select>
            </div>
          )}

          {/* Slider 4: Time length selector */}
          <div className="flex flex-col gap-1.5 mt-2">
            <div className="flex justify-between text-xs">
              <span className="text-white/60">Período de Acúmulo</span>
              <span className="font-bold text-white font-mono">{durationYears} anos</span>
            </div>
            <input 
              type="range"
              min="1"
              max="25"
              step="1"
              value={durationYears}
              onChange={(e) => setDurationYears(parseInt(e.target.value))}
              className="w-full accent-purple-600 cursor-pointer h-1 bg-white/10 rounded"
            />
          </div>

          {/* AI Optimizer recommendation */}
          <div className="mt-4 bg-purple-950/20 border border-purple-500/15 p-3 rounded-2xl text-[11px] leading-relaxed text-white/70">
            <span className="font-bold text-purple-400 flex items-center gap-1 mb-1">
              <Sparkles className="w-3.5 h-3.5" /> Insight de Investimentos IA:
            </span>
            Realocando o excedente das suas despesas recorrentes (R$ 312) no <span className="font-bold text-white">CDB 102% CDI</span> em {durationYears} anos, seu rendimento líquido adicional acumulado é de <span className="font-bold text-green-400 font-mono">{formatBRL(lastPoint.Earnings)}</span>.
          </div>
        </div>

        {/* Compound Interest Output chart Area */}
        <div className="lg:col-span-2 bg-[#08080c]/50 border border-white/10 rounded-3xl p-5 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div>
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">Curva de Evolução Patrimonial</h4>
              <p className="text-xs text-white/40 mt-0.5 font-normal font-sans">Previsão geométrica baseado no modelo Price de juros compostos</p>
            </div>

            {/* Quick KPI stats from simulator */}
            <div className="flex gap-4 items-center shrink-0">
              <div className="text-right">
                <span className="text-[9px] uppercase tracking-wider text-white/30 block">Total Aplicado</span>
                <span className="text-xs font-mono font-semibold text-white">{formatBRL(lastPoint?.Deposits)}</span>
              </div>
              <div className="text-right">
                <span className="text-[9px] uppercase tracking-wider text-green-400/50 block">Rendimentos</span>
                <span className="text-xs font-mono font-semibold text-green-400">+{formatBRL(lastPoint?.Earnings)}</span>
              </div>
              <div className="text-right border-l border-white/10 pl-4">
                <span className="text-[9px] uppercase tracking-wider text-purple-400 block">Total Final</span>
                <span className="text-sm font-mono font-bold text-purple-400">{formatBRL(lastPoint?.TotalTotal)}</span>
              </div>
            </div>
          </div>

          {/* Graphic Recharts canvas */}
          <div className="flex-1 w-full min-h-[220px] max-h-[250px] mb-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={simulationData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#9333ea" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#9333ea" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="depGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#c084fc" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#c084fc" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
                <XAxis dataKey="label" stroke="rgba(255,255,255,0.3)" fontSize={9} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={9} tickLine={false} tickFormatter={(v) => `R$ ${v}`} />
                <Tooltip 
                  formatter={(value: any, name: any) => {
                    const label = name === 'TotalTotal' ? 'Patrimônio Total' : 'Total Depositado';
                    return [formatBRL(value), label];
                  }}
                  contentStyle={{ backgroundColor: '#09090b', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                />
                <Area type="monotone" name="TotalTotal" dataKey="TotalTotal" stroke="#a855f7" strokeWidth={2} fill="url(#totalGrad)" />
                <Area type="monotone" name="Deposits" dataKey="Deposits" stroke="rgba(255,255,255,0.3)" strokeDasharray="4 4" fill="url(#depGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Actual user Investment Portfolio Table */}
      <div id="investments-portfolio" className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
        {/* Form panel to add an investment */}
        <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Registrar Investimento Real</h4>
          <form onSubmit={submitNewInvestment} className="flex flex-col gap-3.5">
            <div>
              <label className="text-[10px] uppercase font-mono font-bold text-white/40 block mb-1">Nome do Ativo</label>
              <input 
                type="text" 
                required
                value={newInvName}
                onChange={(e) => setNewInvName(e.target.value)}
                placeholder="Ex: Tesouro SELIC 2029, CDB Inter"
                className="w-full bg-black/40 border border-white/10 focus:border-purple-500/50 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase font-mono font-bold text-white/40 block mb-1">Tipo de Ativo</label>
                <select 
                  value={newInvType}
                  onChange={(e) => setNewInvType(e.target.value as any)}
                  className="w-full bg-black/40 border border-white/10 focus:border-purple-500/50 rounded-xl px-3 py-2 text-xs text-white outline-none"
                >
                  <option value="CDB">CDB</option>
                  <option value="Tesouro Direto">Tesouro Direto</option>
                  <option value="Renda Fixa">Renda Fixa</option>
                  <option value="Ações">Ações (B3)</option>
                  <option value="Cripto">Cripto</option>
                  <option value="Fundos Imobiliários">FIIs</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase font-mono font-bold text-white/40 block mb-1">Valor Aplicado*</label>
                <input 
                  type="number" 
                  required
                  value={newInvValue}
                  onChange={(e) => setNewInvValue(e.target.value)}
                  placeholder="Ex: 500.00"
                  className="w-full bg-black/40 border border-white/10 focus:border-purple-500/50 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] uppercase font-mono font-bold text-white/40 block mb-1">Rendimento Est. (% a.m.)</label>
              <input 
                type="number" 
                step="0.01"
                value={newInvYield}
                onChange={(e) => setNewInvYield(e.target.value)}
                placeholder="Ex: 0.85"
                className="w-full bg-black/40 border border-white/10 focus:border-purple-500/50 rounded-xl px-3 py-2 text-xs text-white outline-none font-mono"
              />
            </div>
            <button 
              type="submit" 
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-2.5 rounded-xl text-xs transition cursor-pointer"
            >
              Registrar Ativo
            </button>
          </form>
        </div>

        {/* Portfolio List column */}
        <div className="md:col-span-2 bg-white/[0.02] border border-white/10 rounded-3xl p-5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3 flex items-center justify-between">
            Meus Ativos Registrados
            <span className="text-[10px] text-white/40 font-mono font-normal">Patrimônio Líquido Alocado: {formatBRL(investments.reduce((acc, current) => acc + current.valorAplicado, 0))}</span>
          </h4>
          <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/5">
            {investments.length === 0 ? (
              <div className="h-32 flex flex-col items-center justify-center text-white/30 text-xs">
                <span>Nenhum ativo financeiro monitorado.</span>
                <p className="text-[10px] text-white/20 mt-1">Registrado no formulário ao lado para gerenciar.</p>
              </div>
            ) : (
              investments.map((inv) => (
                <div 
                  key={inv.id}
                  className="bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 p-3 rounded-xl flex justify-between items-center transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-[11px]">
                      {inv.tipo.slice(0, 3).toUpperCase()}
                    </div>
                    <div>
                      <h5 className="text-xs font-semibold text-white">{inv.nome}</h5>
                      <span className="text-[10px] bg-white/5 text-white/40 px-1.5 py-0.2 rounded font-mono uppercase mt-1 inline-block">{inv.tipo} • Rendimento: {inv.rendimentoMensalEst}% a.m.</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold font-mono tracking-tight text-purple-400">{formatBRL(inv.valorAplicado)}</span>
                    <button 
                      onClick={() => onDeleteInvestment(inv.id)}
                      className="text-red-400 hover:text-red-300 p-1 hover:bg-red-500/10 rounded text-xs cursor-pointer"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
