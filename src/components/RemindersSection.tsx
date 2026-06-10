import React, { useState } from 'react';
import { 
  Bell, 
  Plus, 
  Trash2, 
  Calendar, 
  DollarSign, 
  Clock, 
  BadgeCheck, 
  Sparkles,
  CheckCircle,
  AlertTriangle,
  X
} from 'lucide-react';
import { CustomReminder } from '../types';

interface RemindersSectionProps {
  reminders: CustomReminder[];
  onAddReminder: (rem: Omit<CustomReminder, 'id'>) => void;
  onToggleReminderPaid: (id: string) => void;
  onDeleteReminder: (id: string) => void;
}

export default function RemindersSection({
  reminders,
  onAddReminder,
  onToggleReminderPaid,
  onDeleteReminder
}: RemindersSectionProps) {
  const [desc, setDesc] = useState('');
  const [val, setVal] = useState('');
  const [vencimento, setVencimento] = useState('2026-06-12');
  const [recorrencia, setRecorrencia] = useState<'Anual' | 'Semestral' | 'Mensal' | 'Única'>('Anual');
  const [avisoPrevio, setAvisoPrevio] = useState('3');
  const [categoria, setCategoria] = useState('Assinaturas');

  // Modal alert triggers
  const [selectedUrgentReminder, setSelectedUrgentReminder] = useState<CustomReminder | null>(() => {
    // Check if there is any unpaid reminder exactly 3 days from reference day June 09, 2026 on load
    const referenceDate = new Date('2026-06-09');
    const urgent = reminders.find(r => {
      if (r.pago) return false;
      const targetDate = new Date(r.vencimento);
      const diffDays = Math.ceil((targetDate.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays === 3;
    });
    return urgent || null;
  });

  const getDaysRemaining = (vencimentoStr: string) => {
    const todayDate = new Date('2026-06-09');
    const targetDate = new Date(vencimentoStr);
    const diffTime = targetDate.getTime() - todayDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !val) return;

    onAddReminder({
      descricao: desc,
      valor: parseFloat(val),
      vencimento,
      recorrencia,
      avisoPrevioDias: parseInt(avisoPrevio) || 3,
      categoria,
      pago: false
    });

    setDesc('');
    setVal('');
  };

  const formatBRL = (v: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
  };

  return (
    <div id="reminders-panel" className="bg-[#0c0c14]/30 border border-white/10 rounded-3xl p-6 flex flex-col gap-5">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider font-display flex items-center gap-2">
            <Bell className="w-4.5 h-4.5 text-purple-400 animate-swing" />
            Lembretes de Pagamentos Recorrentes
          </h4>
          <p className="text-[11px] text-white/50 mt-1">
            Programe alarmes para assinaturas anuais, semestrais ou licenças não automatizadas para receber notificações com antecedência.
          </p>
        </div>

        <span className="text-[10px] font-mono font-bold bg-purple-500/10 border border-purple-500/20 text-purple-300 px-2.5 py-1 rounded-full whitespace-nowrap">
          Base simulada: 09/06/2026
        </span>
      </div>

      {/* DYNAMIC ACTIVE REMINDER MODAL WARNING IF TRIGGERED COINCIDENTALLY */}
      {selectedUrgentReminder && (
        <div id="urgent-reminder-popup-dialog" className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-gradient-to-b from-[#1c1228] to-[#0c0814] border border-purple-500/40 max-w-md w-full rounded-3xl p-6 relative shadow-2xl shadow-purple-950/50 flex flex-col gap-4">
            <button 
              onClick={() => setSelectedUrgentReminder(null)}
              className="absolute top-4 right-4 text-white/40 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-2.5 text-amber-400 font-bold text-xs uppercase tracking-wider">
              <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 animate-bounce" />
              <span>Aviso de Vencimento Remoto</span>
            </div>

            <div className="bg-purple-950/20 border border-purple-500/15 p-4 rounded-2xl flex flex-col gap-1 mt-1">
              <span className="text-[10px] uppercase font-mono tracking-widest text-purple-400 font-bold block">Vencimento Próximo (3 Dias)</span>
              <h5 className="text-base font-bold text-white mt-1">{selectedUrgentReminder.descricao}</h5>
              <p className="text-xs text-white/60">Categoria: <span className="text-white">{selectedUrgentReminder.categoria}</span></p>
              
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/5">
                <div>
                  <span className="text-[9px] text-white/40 block">Valor da Fatura</span>
                  <strong className="text-white text-base font-mono block">{formatBRL(selectedUrgentReminder.valor)}</strong>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-white/40 block font-mono">Data Vencimento</span>
                  <strong className="text-purple-300 text-xs font-mono block">12/06/2026</strong>
                </div>
              </div>
            </div>

            <p className="text-[11px] leading-relaxed text-white/60 italic">
              Este lembrete recorrente <strong>{selectedUrgentReminder.recorrencia}</strong> está agendado para aviso prévio de <strong>{selectedUrgentReminder.avisoPrevioDias} dias antes</strong> do checkout. Realize a quitação para evitar acréscimo de juros.
            </p>

            <div className="flex gap-2.5 mt-2">
              <button
                type="button"
                onClick={() => {
                  onToggleReminderPaid(selectedUrgentReminder.id);
                  setSelectedUrgentReminder(null);
                }}
                className="flex-1 py-2.5 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded-xl transition cursor-pointer active:scale-95"
              >
                Sim, marcar como Pago ✓
              </button>
              <button
                type="button"
                onClick={() => setSelectedUrgentReminder(null)}
                className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs rounded-xl transition cursor-pointer"
              >
                Dispensar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BODY GRID: Form on left, and List on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* FORM TO ADD */}
        <div className="lg:col-span-1 bg-white/[0.01] border border-white/5 rounded-2xl p-4 flex flex-col">
          <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-2 font-display">Novo Lembrete</h5>
          
          <form onSubmit={handleCreate} className="flex flex-col gap-3 text-xs">
            <div>
              <label className="text-[9px] uppercase font-mono text-white/40 block mb-1">Descrição do Serviço</label>
              <input 
                type="text" 
                required
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Ex: Assinatura AWS, HostGator"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-500/40"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[9px] uppercase font-mono text-white/40 block mb-1">Valor (R$)*</label>
                <input 
                  type="number" 
                  step="0.01"
                  required
                  value={val}
                  onChange={(e) => setVal(e.target.value)}
                  placeholder="249.90"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-500/40"
                />
              </div>
              <div>
                <label className="text-[9px] uppercase font-mono text-white/40 block mb-1">Vencimento*</label>
                <input 
                  type="date" 
                  required
                  value={vencimento}
                  onChange={(e) => setVencimento(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-500/40 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[9px] uppercase font-mono text-white/40 block mb-1">Recorrência</label>
                <select
                  value={recorrencia}
                  onChange={(e) => setRecorrencia(e.target.value as any)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white outline-none focus:border-purple-500/40"
                >
                  <option value="Anual">Anual</option>
                  <option value="Semestral">Semestral</option>
                  <option value="Mensal">Mensal</option>
                  <option value="Única">Única / Avulsa</option>
                </select>
              </div>
              <div>
                <label className="text-[9px] uppercase font-mono text-white/40 block mb-1">Aviso Prévio (Dias)</label>
                <select
                  value={avisoPrevio}
                  onChange={(e) => setAvisoPrevio(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white outline-none focus:border-purple-500/40"
                >
                  <option value="1">1 dia antes</option>
                  <option value="3">3 dias antes</option>
                  <option value="5">5 dias antes</option>
                  <option value="7">7 dias antes</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[9px] uppercase font-mono text-white/40 block mb-1">Categoria</label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white outline-none focus:border-purple-500/40"
              >
                <option value="Assinaturas">Assinaturas</option>
                <option value="Educação">Educação</option>
                <option value="Hospedagem / Web">Hospedagem / Web</option>
                <option value="Impostos">Impostos</option>
                <option value="Seguros">Seguros</option>
                <option value="Outros">Outras Contas</option>
              </select>
            </div>

            <button 
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition active:scale-95 mt-1 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Agendar Lembrete
            </button>
          </form>
        </div>

        {/* LIST OF ACTIVATED REMINDERS */}
        <div className="lg:col-span-2 bg-white/[0.01] border border-white/5 rounded-2xl p-4 flex flex-col">
          <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-3 font-display">Lembretes Cadastrados</h5>
          
          <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[290px] pr-2 scrollbar-thin scrollbar-thumb-white/5 text-xs">
            {reminders.length === 0 ? (
              <div className="h-44 flex flex-col justify-center items-center text-white/20">
                <Clock className="w-8 h-8" />
                <span>Nenhum lembrete cadastrado.</span>
              </div>
            ) : (
              reminders.map((r) => {
                const daysRemaining = getDaysRemaining(r.vencimento);
                const isUrgent = !r.pago && daysRemaining <= 3 && daysRemaining >= 0;
                
                return (
                  <div 
                    key={r.id}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                      r.pago 
                        ? 'bg-black/20 border-white/5 opacity-55' 
                        : isUrgent 
                          ? 'bg-amber-950/20 border-amber-500/30' 
                          : 'bg-black/40 border-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        r.pago 
                          ? 'bg-green-500/10 text-green-400' 
                          : isUrgent 
                            ? 'bg-amber-500/15 text-amber-400 animate-pulse' 
                            : 'bg-purple-500/10 text-purple-400'
                      }`}>
                        {r.pago ? (
                          <BadgeCheck className="w-4.5 h-4.5" />
                        ) : (
                          <Clock className="w-4.5 h-4.5" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-white">{r.descricao}</span>
                          <span className="bg-white/5 px-1.5 py-0.2 rounded font-mono text-[9px] text-white/40">{r.categoria}</span>
                          <span className="bg-purple-600/15 px-1.5 py-0.2 rounded font-mono text-[9px] text-purple-400">{r.recorrencia}</span>
                        </div>
                        
                        <div className="flex items-center gap-1.5 text-[10px] text-white/40 mt-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Vence em <strong className="text-white/60">{r.vencimento}</strong></span>
                          <span>•</span>
                          {r.pago ? (
                            <span className="text-green-400">Pago ✓</span>
                          ) : daysRemaining < 0 ? (
                            <span className="text-red-400">Atrasado</span>
                          ) : daysRemaining === 0 ? (
                            <span className="text-amber-400 font-bold">Vence HOJE!</span>
                          ) : (
                            <span className={isUrgent ? 'text-amber-400 font-semibold' : ''}>
                              Faltam {daysRemaining} dias
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 font-mono">
                      <span className={`font-bold ${r.pago ? 'text-white/30 line-through' : 'text-purple-300'}`}>
                        {formatBRL(r.valor)}
                      </span>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => onToggleReminderPaid(r.id)}
                          className={`p-1 rounded transition text-xs cursor-pointer ${
                            r.pago 
                              ? 'text-white/30 hover:text-white bg-white/5' 
                              : 'text-green-400 hover:text-green-300 hover:bg-green-500/10'
                          }`}
                          title={r.pago ? "Marcar como Em Aberto" : "Marcar como Pago"}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>

                        <button 
                          onClick={() => onDeleteReminder(r.id)}
                          className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-500/10 transition cursor-pointer"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
