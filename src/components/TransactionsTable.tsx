import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Tag, 
  Calendar, 
  CreditCard,
  TrendingUp, 
  TrendingDown,
  Sparkles,
  User,
  Check
} from 'lucide-react';
import { Income, Expense, FixedBill, OCRResult } from '../types';

interface TransactionsTableProps {
  incomes: Income[];
  expenses: Expense[];
  onAddIncome: (inc: Omit<Income, 'id' | 'uid'>) => void;
  onAddExpense: (exp: Omit<Expense, 'id' | 'uid'>) => void;
  onDeleteIncome: (id: string) => void;
  onDeleteExpense: (id: string) => void;
  ocrPreset: OCRResult | null;
  clearOcrPreset: () => void;
  onToggleIncomeConferido?: (id: string) => void;
  onToggleExpenseConferido?: (id: string) => void;
}

export default function TransactionsTable({
  incomes,
  expenses,
  onAddIncome,
  onAddExpense,
  onDeleteIncome,
  onDeleteExpense,
  ocrPreset,
  clearOcrPreset,
  onToggleIncomeConferido,
  onToggleExpenseConferido
}: TransactionsTableProps) {
  const [activeFormType, setActiveFormType] = useState<'expense' | 'income'>('expense');
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('Todas');
  const [filterPayment, setFilterPayment] = useState('Todas');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  // Fields for adding a new expense
  const [expValor, setExpValor] = useState('');
  const [expCat, setExpCat] = useState('Alimentação');
  const [expData, setExpData] = useState('2026-06-07');
  const [expEstabelecimento, setExpEstabelecimento] = useState('');
  const [expForma, setExpForma] = useState<'Pix' | 'Cartão de Crédito' | 'Boleto' | 'Dinheiro' | 'Outro'>('Pix');
  const [expParcelas, setExpParcelas] = useState('1');
  const [expIsRecorrente, setExpIsRecorrente] = useState(false);
  const [expObservacoes, setExpObservacoes] = useState('');

  // Fields for adding a new income
  const [incValor, setIncValor] = useState('');
  const [incCat, setIncCat] = useState('Salário');
  const [incData, setIncData] = useState('2026-06-07');
  const [incDescricao, setIncDescricao] = useState('');
  const [incRecorrencia, setIncRecorrencia] = useState<'Mensal' | 'Avulso' | 'Outro'>('Mensal');

  // Apply OCR scanned results to form fields automatically
  const handleApplyOCRResult = () => {
    if (!ocrPreset) return;
    if (ocrPreset.tipoConta === 'Light' || ocrPreset.tipoConta === 'SAAE' || ocrPreset.categoria === 'Luz' || ocrPreset.categoria === 'Água') {
      setActiveFormType('expense');
      setExpValor(ocrPreset.valor.toString());
      setExpCat(ocrPreset.categoria === 'Luz' ? 'Luz' : 'Água');
      setExpData(ocrPreset.vencimento);
      setExpEstabelecimento(ocrPreset.estabelecimento);
      setExpForma('Boleto');
      setExpObservacoes(ocrPreset.descricao);
    } else {
      setActiveFormType('expense');
      setExpValor(ocrPreset.valor.toString());
      setExpCat(ocrPreset.categoria || 'Alimentação');
      setExpData(ocrPreset.vencimento);
      setExpEstabelecimento(ocrPreset.estabelecimento);
      setExpObservacoes(ocrPreset.descricao);
    }
    clearOcrPreset();
  };

  const submitExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expValor) return;
    onAddExpense({
      valor: parseFloat(expValor),
      categoria: expCat,
      data: expData,
      formaPagamento: expForma,
      parcelas: parseInt(expParcelas) || 1,
      isRecorrente: expIsRecorrente,
      estabelecimento: expEstabelecimento || undefined,
      observacoes: expObservacoes || undefined
    });
    // Reset manual form fields
    setExpValor('');
    setExpEstabelecimento('');
    setExpObservacoes('');
  };

  const submitIncome = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incValor) return;
    onAddIncome({
      valor: parseFloat(incValor),
      categoria: incCat,
      data: incData,
      descricao: incDescricao,
      recorrencia: incRecorrencia
    });
    // Reset manual form fields
    setIncValor('');
    setIncDescricao('');
  };

  // Build centralized sorted array of transactions
  const formattedIncomes = incomes.map(i => ({
    keyId: `inc-${i.id}`,
    id: i.id,
    type: 'income' as const,
    valor: i.valor,
    categoria: i.categoria,
    data: i.data,
    extra: i.recorrencia,
    label: i.descricao || 'Renda Extra',
    subLabel: `Sincronizado • ${i.recorrencia}`,
    conferido: i.conferido
  }));

  const formattedExpenses = expenses.map(e => ({
    keyId: `exp-${e.id}`,
    id: e.id,
    type: 'expense' as const,
    valor: e.valor,
    categoria: e.categoria,
    data: e.data,
    extra: e.formaPagamento,
    label: e.estabelecimento || 'Gasto Geral',
    subLabel: `${e.formaPagamento} • ${e.parcelas > 1 ? `${e.parcelas}x` : 'À Vista'}`,
    conferido: e.conferido
  }));

  const allTransactions = [...formattedIncomes, ...formattedExpenses].sort((a, b) => {
    return new Date(b.data).getTime() - new Date(a.data).getTime();
  });

  const categoriesList = ['Todas', 'Salário', 'Alimentação', 'Transporte', 'Luz', 'Água', 'Lazer', 'Compras', 'Saúde', 'Educação', 'Renda Extra', 'Outros'];

  const filteredTransactions = allTransactions.filter(item => {
    const matchesSearch = item.label.toLowerCase().includes(search.toLowerCase()) || 
                          item.categoria.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory === 'Todas' || item.categoria === filterCategory;
    
    // For incomes, the default payment method acts as 'Mensal'/'Avulso', 
    // so we can map or handle payment method filter wisely.
    const matchesPayment = filterPayment === 'Todas' || 
                           (item.type === 'expense' && item.extra === filterPayment) ||
                           (item.type === 'income' && filterPayment === 'Outro');

    const matchesStartDate = !filterStartDate || item.data >= filterStartDate;
    const matchesEndDate = !filterEndDate || item.data <= filterEndDate;

    return matchesSearch && matchesCategory && matchesPayment && matchesStartDate && matchesEndDate;
  });

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div id="transactions-ledger-panel" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* 1. Launch Forms Column */}
      <div className="lg:col-span-1 bg-white/[0.02] border border-white/10 rounded-3xl p-5 flex flex-col h-fit">
        
        {/* Forms selection tabs */}
        <div className="flex bg-black/40 border border-white/10 p-1 rounded-2xl mb-4">
          <button
            onClick={() => setActiveFormType('expense')}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeFormType === 'expense' ? 'bg-purple-600 text-white' : 'text-white/40 hover:text-white'
            }`}
          >
            Lançar Despesa
          </button>
          <button
            onClick={() => setActiveFormType('income')}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeFormType === 'income' ? 'bg-purple-600 text-white' : 'text-white/40 hover:text-white'
            }`}
          >
            Lançar Receita
          </button>
        </div>

        {/* OCR prefill banner helper */}
        {ocrPreset && (
          <div className="mb-4 bg-purple-950/25 border border-purple-500/20 p-3 rounded-2xl flex flex-col gap-2 animate-fadeIn text-xs">
            <span className="font-bold text-purple-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Leitura OCR ativa
            </span>
            <p className="text-white/70">Temos um rascunho de {ocrPreset.estabelecimento} de R$ {ocrPreset.valor.toFixed(2)} pronto para preenchimento rápido.</p>
            <div className="flex gap-2 mt-1">
              <button 
                onClick={handleApplyOCRResult}
                className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg text-[10px] flex items-center gap-1 transition-all cursor-pointer"
              >
                Aplicar ao Form <Check className="w-3 h-3" />
              </button>
              <button 
                onClick={clearOcrPreset}
                className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white rounded-lg text-[10px] transition cursor-pointer"
              >
                Ignorar
              </button>
            </div>
          </div>
        )}

        {/* ACTIVE FORM SHEETS */}
        {activeFormType === 'expense' ? (
          <form onSubmit={submitExpense} className="flex flex-col gap-3.5">
            <div>
              <label className="text-[10px] uppercase font-mono font-bold text-white/40 block mb-1">Valor (R$)*</label>
              <input 
                type="number" 
                step="0.01" 
                required
                value={expValor}
                onChange={(e) => setExpValor(e.target.value)}
                placeholder="Ex BRL: 45.90"
                className="w-full bg-black/40 border border-white/10 focus:border-purple-500/50 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase font-mono font-bold text-white/40 block mb-1">Categoria</label>
                <select 
                  value={expCat}
                  onChange={(e) => setExpCat(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 focus:border-purple-500/50 rounded-xl px-3 py-2 text-xs text-white outline-none"
                >
                  <option value="Alimentação">Alimentação</option>
                  <option value="Transporte">Transporte</option>
                  <option value="Luz">⚡ Energia (Light)</option>
                  <option value="Água">💧 Água (SAAE)</option>
                  <option value="Internet">Internet</option>
                  <option value="Saúde">Saúde</option>
                  <option value="Educação">Educação</option>
                  <option value="Lazer">Lazer</option>
                  <option value="Compras">Compras</option>
                  <option value="Emergências">Emergências</option>
                  <option value="Investimentos">Investimentos</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase font-mono font-bold text-white/40 block mb-1">Data*</label>
                <input 
                  type="date" 
                  required
                  value={expData}
                  onChange={(e) => setExpData(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 focus:border-purple-500/50 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] uppercase font-mono font-bold text-white/40 block mb-1">Estabelecimento</label>
              <input 
                type="text" 
                value={expEstabelecimento}
                onChange={(e) => setExpEstabelecimento(e.target.value)}
                placeholder="Ex: Padaria, Posto Shell..."
                className="w-full bg-black/40 border border-white/10 focus:border-purple-500/50 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase font-mono font-bold text-white/40 block mb-1">Forma</label>
                <select 
                  value={expForma}
                  onChange={(e) => setExpForma(e.target.value as any)}
                  className="w-full bg-black/40 border border-white/10 focus:border-purple-500/50 rounded-xl px-3 py-2 text-xs text-white outline-none"
                >
                  <option value="Pix">Pix</option>
                  <option value="Cartão de Crédito">Cartão de Crédito</option>
                  <option value="Boleto">Boleto</option>
                  <option value="Dinheiro">Dinheiro</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase font-mono font-bold text-white/40 block mb-1">Parcelas</label>
                <input 
                  type="number" 
                  min="1"
                  max="48"
                  value={expParcelas}
                  onChange={(e) => setExpParcelas(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 focus:border-purple-500/50 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <input 
                type="checkbox"
                id="isRec"
                checked={expIsRecorrente}
                onChange={(e) => setExpIsRecorrente(e.target.checked)}
                className="accent-purple-600 rounded cursor-pointer"
              />
              <label htmlFor="isRec" className="text-xs text-white/60 cursor-pointer select-none">Marcar como Despesa Fixa Recorrente</label>
            </div>
            <div>
              <label className="text-[10px] uppercase font-mono font-bold text-white/40 block mb-1">Observações</label>
              <textarea 
                value={expObservacoes}
                onChange={(e) => setExpObservacoes(e.target.value)}
                placeholder="Notas auxiliares..."
                rows={2}
                className="w-full bg-black/40 border border-white/10 focus:border-purple-500/50 rounded-xl px-3 py-2 text-xs text-white outline-none resize-none"
              ></textarea>
            </div>
            <button 
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Registrar Despesa
            </button>
          </form>
        ) : (
          <form onSubmit={submitIncome} className="flex flex-col gap-3.5">
            <div>
              <label className="text-[10px] uppercase font-mono font-bold text-white/40 block mb-1">Valor (R$)*</label>
              <input 
                type="number" 
                step="0.01" 
                required
                value={incValor}
                onChange={(e) => setIncValor(e.target.value)}
                placeholder="Ex BRL: 4500.00"
                className="w-full bg-black/40 border border-white/10 focus:border-purple-500/50 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase font-mono font-bold text-white/40 block mb-1">Categoria</label>
                <select 
                  value={incCat}
                  onChange={(e) => setIncCat(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 focus:border-purple-500/50 rounded-xl px-3 py-2 text-xs text-white outline-none"
                >
                  <option value="Salário">Salário</option>
                  <option value="Renda Extra">Renda Extra</option>
                  <option value="Investimentos">Investimento</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase font-mono font-bold text-white/40 block mb-1">Data*</label>
                <input 
                  type="date" 
                  required
                  value={incData}
                  onChange={(e) => setIncData(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 focus:border-purple-500/50 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] uppercase font-mono font-bold text-white/40 block mb-1">Descrição</label>
              <input 
                type="text" 
                value={incDescricao}
                onChange={(e) => setIncDescricao(e.target.value)}
                placeholder="Ex: Salário Mensal Empresa..."
                className="w-full bg-black/40 border border-white/10 focus:border-purple-500/50 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-mono font-bold text-white/40 block mb-1">Recorrência</label>
              <select 
                value={incRecorrencia}
                onChange={(e) => setIncRecorrencia(e.target.value as any)}
                className="w-full bg-black/40 border border-white/10 focus:border-purple-500/50 rounded-xl px-3 py-2 text-xs text-white outline-none"
              >
                <option value="Mensal">Mensal</option>
                <option value="Avulso">Avulso</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
            <button 
              type="submit"
              className="w-full bg-green-600 hover:bg-green-500 text-white font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Registrar Receita
            </button>
          </form>
        )}
      </div>

      {/* 2. Ledger List / Table column */}
      <div className="lg:col-span-2 bg-white/[0.02] border border-white/10 rounded-3xl p-5 flex flex-col h-full min-h-[400px]">
        
        {/* Ledger Header filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 pb-4 border-b border-white/5">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Livro de Lançamentos</h3>
            <p className="text-[10px] text-white/40 font-mono mt-0.5">{filteredTransactions.length} registros correspondentes</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
            {/* Context searching filter */}
            <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs w-full sm:w-60">
              <Search className="w-3.5 h-3.5 text-white/40 shrink-0" />
              <input 
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Pesquisar..."
                className="bg-transparent text-white placeholder-white/30 outline-none w-full text-xs"
              />
            </div>

            {/* Category selection */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-xl text-xs px-2.5 py-1.5 text-white outline-none focus:ring-1 focus:ring-purple-500 w-full sm:w-auto"
            >
              {categoriesList.map((cat, idx) => (
                <option key={idx} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick filters sub-bar */}
        <div className="bg-black/20 border border-white/5 rounded-2xl p-3 mb-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-white/60 font-medium">
            <CreditCard className="w-4 h-4 text-purple-400 shrink-0" />
            <span>Forma:</span>
            <select
              value={filterPayment}
              onChange={(e) => setFilterPayment(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-xl text-xs px-2 py-1 text-white outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
            >
              <option value="Todas">Todas as Formas</option>
              <option value="Pix">Pix</option>
              <option value="Cartão de Crédito">Cartão de Crédito</option>
              <option value="Boleto">Boleto</option>
              <option value="Dinheiro">Dinheiro</option>
              <option value="Outro">Outro</option>
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 text-xs text-white/60">
            <div className="flex items-center gap-1.5 ">
              <Calendar className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span>Período:</span>
              <input
                type="date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-lg text-[11px] px-2 py-1 text-white outline-none focus:ring-1 focus:ring-purple-500 text-center"
              />
              <span className="text-white/30">até</span>
              <input
                type="date"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-lg text-[11px] px-2 py-1 text-white outline-none focus:ring-1 focus:ring-purple-500 text-center"
              />
            </div>

            {(filterPayment !== 'Todas' || filterStartDate || filterEndDate || search || filterCategory !== 'Todas') && (
              <button
                type="button"
                onClick={() => {
                  setFilterPayment('Todas');
                  setFilterStartDate('');
                  setFilterEndDate('');
                  setSearch('');
                  setFilterCategory('Todas');
                }}
                className="text-[10px] font-semibold text-purple-400 hover:text-purple-300 font-mono bg-purple-500/10 hover:bg-purple-500/20 px-2 py-1 rounded-lg transition shrink-0 cursor-pointer"
              >
                Limpar filtros
              </button>
            )}
          </div>
        </div>

        {/* Scrollable list of ledger */}
        <div className="flex-1 overflow-y-auto max-h-[420px] pr-2 scrollbar-thin scrollbar-thumb-white/5">
          {filteredTransactions.length === 0 ? (
            <div className="h-44 flex flex-col justify-center items-center gap-2 text-white/30 text-center">
              <Search className="w-8 h-8" />
              <span className="text-xs font-semibold">Nenhum lançamento encontrado</span>
              <p className="text-[11px] text-white/15">Tente limpar os filtros ou realizar novo lançamento à esquerda.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {filteredTransactions.map((item) => (
                <div 
                  key={item.keyId}
                  className="bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 hover:border-white/10 p-3 rounded-xl flex items-center justify-between gap-3 transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    {/* Confirmar Valor Reconciliação */}
                    <button
                      onClick={() => {
                        if (item.type === 'income' && onToggleIncomeConferido) {
                          onToggleIncomeConferido(item.id);
                        } else if (item.type === 'expense' && onToggleExpenseConferido) {
                          onToggleExpenseConferido(item.id);
                        }
                      }}
                      className={`p-1 rounded-lg border transition-all duration-300 flex items-center gap-1 shrink-0 ${
                        item.conferido
                          ? 'bg-emerald-500/15 border-emerald-500/20 text-emerald-400 font-semibold'
                          : 'bg-white/5 border-white/5 text-white/40 hover:text-white/80 hover:bg-white/10'
                      }`}
                      title={item.conferido ? "Reconciliado: Valor conferido com a fatura original" : "Marcar como conferido com a fatura original"}
                    >
                      <Check className={`w-3 h-3 ${item.conferido ? 'text-emerald-400 stroke-[3.5]' : 'text-white/20'}`} />
                      <span className="text-[9px] hidden sm:inline">
                        {item.conferido ? 'Conferido' : 'Confirmar'}
                      </span>
                    </button>

                    {/* Leading indicator */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      item.type === 'income' 
                        ? 'bg-green-500/10 text-green-400' 
                        : 'bg-red-500/10 text-red-400'
                    }`}>
                      {item.type === 'income' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    </div>
                    
                    <div>
                      <p className="text-xs font-semibold text-white tracking-wide">{item.label}</p>
                      <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-[10px] text-white/40">
                        <span className="bg-white/5 text-white/50 px-1.5 py-0.2 rounded font-mono uppercase tracking-wider">{item.categoria}</span>
                        <span>•</span>
                        <span className="font-mono">{item.data}</span>
                        <span>•</span>
                        <span className="italic text-white/30">{item.subLabel}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className={`text-xs font-bold font-mono tracking-tight privacy-sensitive ${
                      item.type === 'income' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {item.type === 'income' ? '+' : '-'} {formatBRL(item.valor)}
                    </span>
                    
                    <button 
                      onClick={() => item.type === 'income' ? onDeleteIncome(item.id) : onDeleteExpense(item.id)}
                      className="text-red-400 hover:text-red-300 p-1 rounded-lg hover:bg-red-500/10 transition cursor-pointer"
                      title="Excluir"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
