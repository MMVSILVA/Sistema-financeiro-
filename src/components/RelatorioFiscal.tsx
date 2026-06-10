import React, { useState, useMemo } from 'react';
import { 
  Building, 
  HelpCircle, 
  Sparkles, 
  FileText, 
  BadgeCheck, 
  ChevronRight, 
  Download, 
  Printer, 
  DollarSign, 
  Coins, 
  TrendingUp, 
  Info,
  Calendar,
  Layers,
  ArrowBigUpDash
} from 'lucide-react';
import { Income, Expense, Investment } from '../types';

interface RelatorioFiscalProps {
  incomes: Income[];
  expenses: Expense[];
  investments: Investment[];
}

export default function RelatorioFiscal({ incomes, expenses, investments }: RelatorioFiscalProps) {
  const [fiscalYear, setFiscalYear] = useState('2026');
  const [activeSection, setActiveSection] = useState<'dirpf' | 'flow'>('dirpf');

  // Hardcoded real consumption logs for 2026 from user's JSON spec
  const consumoHistorico2026 = useMemo(() => {
    return {
      'Junho': { Luz: 373.47, Agua: 0.00, 'Cartão Bradesco': 3327.61, 'Cartão Santander': 0.00, obs: 'Faturamento real fechado' },
      'Julho': { Luz: 0.00, Agua: 0.00, 'Cartão Bradesco': 1954.12, 'Cartão Santander': 0.00, obs: 'Projeção cartão bradesco' },
      'Agosto': { Luz: 0.00, Agua: 0.00, 'Cartão Bradesco': 1133.21, 'Cartão Santander': 0.00, obs: 'Projeção cartão bradesco' },
      'Setembro': { Luz: 0.00, Agua: 0.00, 'Cartão Bradesco': 1069.04, 'Cartão Santander': 0.00, obs: 'Projeção cartão bradesco' },
      'Outubro': { Luz: 0.00, Agua: 0.00, 'Cartão Bradesco': 655.08, 'Cartão Santander': 0.00, obs: 'Projeção cartão bradesco' },
      'Novembro': { Luz: 0.00, Agua: 0.00, 'Cartão Bradesco': 305.65, 'Cartão Santander': 0.00, obs: 'Projeção de final de ano' },
      'Dezembro': { Luz: 0.00, Agua: 0.00, 'Cartão Bradesco': 305.65, 'Cartão Santander': 0.00, obs: 'Projeção de final de ano' },
    };
  }, []);

  // Hardcoded fixed monthly expenses from user's JSON spec
  const despesasFixasMensais = useMemo(() => {
    return [
      { item: 'Dízimo 1', valor: 500.00 },
      { item: 'Dízimo 2', valor: 340.00 },
      { item: 'Escola', valor: 737.70 },
      { item: 'Faculdade', valor: 898.00 },
      { item: 'Sítio', valor: 250.00 },
      { item: 'Carro', valor: 1509.00 },
      { item: 'Internet', valor: 109.89 },
      { item: 'Vivo', valor: 140.00 },
      { item: 'Personal', valor: 480.00 },
      { item: 'Van', valor: 350.00 },
      { item: 'Empréstimo', valor: 1523.00 },
      { item: 'Formatura', valor: 50.00 },
      { item: 'Combustível', valor: 600.00 }
    ];
  }, []);

  const totalMonthlyFixo = useMemo(() => {
    return despesasFixasMensais.reduce((sum, item) => sum + item.valor, 0);
  }, [despesasFixasMensais]);

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // 1. Tributos consolidadas para DIRPF
  const dirpfConsolidation = useMemo(() => {
    // Rendimentos tributáveis da CLT PJ
    const baseSalarioMensal = incomes.filter(inc => inc.categoria === 'Salário' || inc.descricao.toLowerCase().includes('clt')).reduce((sum, inc) => sum + inc.valor, 0);
    // Project 12 months + 13th for the whole year 2026 based on active base salary of 8400.00
    const activeSalaryBase = baseSalarioMensal > 0 ? baseSalarioMensal : 8400.00;
    const rendimentoAnualCLT = activeSalaryBase * 13; // 12 months + 13th
    
    // Deductive education expenses
    // Fixed School and College for 12 months
    const totalEducacaoAnual = (737.70 + 898.00) * 12;

    // Donations & religious (Dizimos 1 and 2 and others)
    const dizimosAnual = (500.00 + 340.00) * 12;

    // Remaining fixed recurring annual sum
    const totalRemainingFixosAnual = despesasFixasMensais
      .filter(d => !['Escola', 'Faculdade', 'Dízimo 1', 'Dízimo 2'].includes(d.item))
      .reduce((sum, d) => sum + d.valor, 0) * 12;

    // Assets sum in investments list
    const totalAplicadoInvestements = investments.reduce((sum, i) => sum + i.valorAplicado, 0);

    return {
      rendimentoAnualCLT,
      totalEducacaoAnual,
      dizimosAnual,
      totalRemainingFixosAnual,
      totalAplicadoInvestements,
      inssEstimado: rendimentoAnualCLT * 0.11, // Standard INSS estimate
      irrfEstimado: rendimentoAnualCLT * 0.15, // Standard approximate base retention
    };
  }, [incomes, investments, despesasFixasMensais]);

  return (
    <div id="relatorio-fiscal-view" className="flex flex-col gap-6">
      
      {/* Top Selector Ribbon Banner */}
      <div className="bg-gradient-to-r from-purple-900/10 via-black/40 to-black/30 border border-white/10 rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-600/15 border border-purple-500/25 text-purple-400 rounded-2xl flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white uppercase tracking-wider font-display">Relatório Fiscal e DIRPF</h3>
            <p className="text-xs text-white/50">Consolidação anual simplificada orientada à Declaração de Renda e fluxo financeiro regulamentado.</p>
          </div>
        </div>

        <div className="flex bg-black/40 border border-white/10 p-1 rounded-2xl self-end md:self-auto">
          <button
            onClick={() => setActiveSection('dirpf')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
              activeSection === 'dirpf' ? 'bg-purple-600 text-white' : 'text-white/40 hover:text-white'
            }`}
          >
            Auxiliar Declaração DIRPF
          </button>
          <button
            onClick={() => setActiveSection('flow')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
              activeSection === 'flow' ? 'bg-purple-600 text-white' : 'text-white/40 hover:text-white'
            }`}
          >
            Balanço Fixo vs Consumo
          </button>
        </div>
      </div>

      {activeSection === 'dirpf' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          
          {/* Main DIRPF Summary Sheets Cards */}
          <div className="lg:col-span-2 bg-white/[0.02] border border-white/10 rounded-3xl p-6 flex flex-col gap-5">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <BadgeCheck className="w-4.5 h-4.5 text-purple-400" />
                  Rascunho Auxiliar para Declaração IRRF - Ano Calendário {fiscalYear}
                </h4>
                <p className="text-xs text-white/45 mt-0.5">Mapeamento estruturado das seções oficiais do software da Receita Federal.</p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => window.print()}
                  className="p-2 bg-white/5 hover:bg-white/10 border border-white/5 text-white/70 hover:text-white rounded-xl transition text-xs flex items-center gap-1.5"
                  title="Imprimir Ficha"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Imprimir</span>
                </button>
              </div>
            </div>

            {/* DIRPF Standard Fichas */}
            <div className="flex flex-col gap-4">
              
              {/* FICHA 1: Rendimentos PJ */}
              <div className="bg-black/30 border border-white/5 rounded-2xl p-4 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] uppercase font-mono tracking-widest text-purple-400 font-bold block">Ficha 01 • Rendimentos Tributáveis de PJ</span>
                    <h5 className="text-xs font-bold text-white mt-1">Salários CLT CLT/Familiar de Fonte Pagadora Externa</h5>
                  </div>
                  <span className="text-[10px] bg-green-500/10 border border-green-500/20 text-green-400 px-2 py-0.5 rounded font-mono font-bold">Rend. Recebidos</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2 bg-black/40 border border-white/5 p-3 rounded-xl text-xs font-mono">
                  <div>
                    <span className="text-[9px] text-white/40 block">Total de Rendimentos</span>
                    <strong className="text-white text-sm block mt-1">{formatBRL(dirpfConsolidation.rendimentoAnualCLT)}</strong>
                    <span className="text-[9px] text-white/20 mt-0.5 block">Proj. 13 salários</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-white/40 block">Dedução Oficial INSS (Est.)</span>
                    <strong className="text-red-400 text-sm block mt-1">-{formatBRL(dirpfConsolidation.inssEstimado)}</strong>
                    <span className="text-[9px] text-white/20 mt-0.5 block">Aliquota aprox. 11%</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-white/40 block">Imposto Retido na Fonte (Est.)</span>
                    <strong className="text-amber-400 text-sm block mt-1">{formatBRL(dirpfConsolidation.irrfEstimado)}</strong>
                    <span className="text-[9px] text-white/20 mt-0.5 block">Sujeito a Ajuste Anual</span>
                  </div>
                </div>
                <p className="text-[10px] text-white/45 italic leading-relaxed">
                  💡 <strong>Instrução da IA:</strong> Lance o valor de <strong>{formatBRL(dirpfConsolidation.rendimentoAnualCLT)}</strong> no campo "Rendimentos Recebidos de Pessoa Jurídica" no programa da Receita Federal.
                </p>
              </div>

              {/* FICHA 2: Pagamentos Efetuados (Deduções) */}
              <div className="bg-black/30 border border-white/5 rounded-2xl p-4 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] uppercase font-mono tracking-widest text-purple-400 font-bold block">Ficha 02 • Pagamentos Efetuados (Deduções de Base)</span>
                    <h5 className="text-xs font-bold text-white mt-1">Despesas Dedutíveis com Instrução e Educação Integral</h5>
                  </div>
                  <span className="text-[10px] bg-red-500/10 border border-red-500/20 text-red-400 px-2 py-0.5 rounded font-mono font-bold">Deduções</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 bg-black/40 border border-white/5 p-3 rounded-xl text-xs font-mono">
                  <div>
                    <span className="text-[9px] text-white/40 block">Despesas com Instrução (Escola + Fac.)</span>
                    <strong className="text-white text-sm block mt-1">{formatBRL(dirpfConsolidation.totalEducacaoAnual)}</strong>
                    <span className="text-[9px] text-white/35 mt-0.5 block">Total Escola Pedro/Faculdade</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-white/40 block">Doações & Contribuições (Dízimos e Afins)</span>
                    <strong className="text-purple-300 text-sm block mt-1">{formatBRL(dirpfConsolidation.dizimosAnual)}</strong>
                    <span className="text-[9px] text-white/35 mt-0.5 block">Soma de Dízimo 1 e Dízimo 2 Anuais</span>
                  </div>
                </div>
                <p className="text-[10px] text-white/45 italic leading-relaxed">
                  💡 <strong>Instrução da IA:</strong> Despesas com Instrução de dependente (Pedro) totalizam <strong>{formatBRL(737.70 * 12)}</strong> (Código 01). Despesas próprias com Faculdade somam <strong>{formatBRL(898.00 * 12)}</strong> (Código 02). Ambos são dedutíveis até o limite individual sob legislação vigente.
                </p>
              </div>

              {/* FICHA 3: Bens e Direitos */}
              <div className="bg-black/30 border border-white/5 rounded-2xl p-4 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] uppercase font-mono tracking-widest text-purple-400 font-bold block">Ficha 03 • Bens e Direitos (Saldos de Ativos)</span>
                    <h5 className="text-xs font-bold text-white mt-1">Aplicações Financeiras, CDBs, Tesouro Direto e Contas</h5>
                  </div>
                  <span className="text-[10px] bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-0.5 rounded font-mono font-bold">Patrimônio</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 bg-black/40 border border-white/5 p-3 rounded-xl text-xs font-mono">
                  <div>
                    <span className="text-[9px] text-white/40 block">Alocação em Renda Fixa e Títulos Ativos</span>
                    <strong className="text-green-400 text-sm block mt-1">{formatBRL(dirpfConsolidation.totalAplicadoInvestements)}</strong>
                    <span className="text-[9px] text-white/35 mt-0.5 block">CDB Inter + Tesouro Direto Selic</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-white/40 block">Código DIRPF Comum</span>
                    <strong className="text-white text-sm block mt-1">Grupo 04 • Bens de Aplicação</strong>
                    <span className="text-[9px] text-white/35 mt-0.5 block">Código 02 - Títulos de Renda Fixa</span>
                  </div>
                </div>
                <p className="text-[10px] text-white/45 italic leading-relaxed">
                  💡 <strong>Instrução da IA:</strong> Declare o saldo acumulado de investimento ativo no Banco Inter e no Tesouro Direto com base no informe oficial de rendimentos enviado pelas instituições financeiras correlacionadas.
                </p>
              </div>

            </div>
          </div>

          {/* Side AI Expert Advisor Box */}
          <div className="lg:col-span-1 bg-gradient-to-b from-[#120516]/40 to-[#0e071c]/10 border border-purple-500/20 rounded-3xl p-5 flex flex-col justify-between h-fit relative">
            <div className="absolute top-0 left-0 w-32 h-32 bg-purple-600/5 rounded-full blur-2xl pointer-events-none"></div>
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-200">Recomendações da IA</h4>
              </div>

              <div className="flex flex-col gap-4">
                <div className="bg-black/50 p-3 rounded-2xl border border-white/5 flex gap-2.5">
                  <div className="bg-purple-600/15 text-purple-300 w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border border-purple-500/10 text-xs font-bold font-mono">
                    1
                  </div>
                  <div className="text-[11px] text-white/70 leading-relaxed font-normal">
                    <span className="font-semibold text-white">Declaração Completa vs Simplificada:</span> Devido à alta soma de despesas escolares do dependente Pedro e sua faculdade (total de <strong>{formatBRL(dirpfConsolidation.totalEducacaoAnual)}</strong>), a declaração pelo modelo <strong className="text-purple-300">Completo por Deduções Legais</strong> pode reverter uma restituição consideravelmente maior comparada ao desconto simplificado padrão de 20%.
                  </div>
                </div>

                <div className="bg-black/50 p-3 rounded-2xl border border-white/5 flex gap-2.5">
                  <div className="bg-purple-600/15 text-purple-300 w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border border-purple-500/10 text-xs font-bold font-mono">
                    2
                  </div>
                  <div className="text-[11px] text-white/70 leading-relaxed font-normal">
                    <span className="font-semibold text-white">Isenção de Imposto em CDB:</span> Os rendimentos do CDB Inter de 102% CDI sofrem tributação exclusiva direto na fonte no resgate pela tabela regressiva de 22.5% a 15% IR. Lance no campo "Rendimentos Sujeitos à Tributação Exclusiva".
                  </div>
                </div>

                <div className="bg-black/50 p-3 rounded-2xl border border-white/5 flex gap-2.5">
                  <div className="bg-purple-600/15 text-purple-300 w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border border-purple-500/10 text-xs font-bold font-mono">
                    3
                  </div>
                  <div className="text-[11px] text-white/70 leading-relaxed font-normal">
                    <span className="font-semibold text-white">Previdência PGBL Dedutível:</span> Como sua base de renda mensal é de <strong>R$ 8.400,00</strong>, a IA aconselha aportar até 12% da renda bruta em Previdência PGBL (até R$ 12.096,00 anuais) para abater totalmente essa cota no IR de 2027.
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      ) : (
        <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 flex flex-col gap-5 animate-fadeIn">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4.5 h-4.5 text-purple-400" />
                Matriz Comparativa de Despesas Fixas vs Consumo Variável (Ano 2026)
              </h4>
              <p className="text-xs text-white/45 mt-1">
                Conforme as regras do sistema, computamos o balanço dividindo as despesas mensais imutáveis das despesas dinâmicas baseadas nos dados históricos fornecidos.
              </p>
            </div>
            <div className="bg-black/40 border border-white/5 px-3 py-1.5 rounded-xl text-xs font-mono text-purple-300">
              Renda de Entrada CLT: <strong>R$ 8.400,00</strong>
            </div>
          </div>

          {/* Quick Cards of Totals */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-black/35 border border-white/5 p-4 rounded-2xl flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-white/40 block">Subtotal Fixo Mensal</span>
                <span className="text-lg font-bold text-white font-mono mt-0.5 block">{formatBRL(totalMonthlyFixo)}</span>
              </div>
              <div className="p-2 bg-white/5 border border-white/10 text-white rounded-xl text-xs font-mono">
                13 Itens Fixos
              </div>
            </div>
            <div className="bg-black/35 border border-white/5 p-4 rounded-2xl flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-white/40 block">Média Consumo Variável 2026</span>
                <span className="text-lg font-bold text-purple-400 font-mono mt-0.5 block">
                  {formatBRL(
                    Object.values(consumoHistorico2026).reduce((acc, c) => acc + c.Luz + c.Agua + c['Cartão Bradesco'] + c['Cartão Santander'], 0) / Object.keys(consumoHistorico2026).length
                  )}
                </span>
              </div>
              <div className="p-2 bg-purple-600/10 border border-purple-500/20 text-purple-300 rounded-xl text-xs font-mono">
                Luz / Água / Cartões
              </div>
            </div>
            <div className="bg-black/35 border border-white/5 p-4 rounded-2xl flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-white/40 block">Balanço Líquido Médio</span>
                <span className="text-lg font-bold text-green-400 font-mono mt-0.5 block">
                  {formatBRL(
                    8400.00 - totalMonthlyFixo - (Object.values(consumoHistorico2026).reduce((acc, c) => acc + c.Luz + c.Agua + c['Cartão Bradesco'] + c['Cartão Santander'], 0) / Object.keys(consumoHistorico2026).length)
                  )}
                </span>
              </div>
              <div className="p-2 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl text-xs font-mono">
                Sobra Prevista
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/5 bg-black/40">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-white/[0.04] border-b border-white/10 text-white/60 font-mono text-[9px] uppercase tracking-wider">
                  <th className="p-3.5 pl-5">Mês (2026)</th>
                  <th className="p-3.5">Fixo (Imutável)</th>
                  <th className="p-3.5 text-purple-300">Luz / Água Consumo</th>
                  <th className="p-3.5 text-blue-300">Cartão Bradesco / Santander</th>
                  <th className="p-3.5 text-red-300">Gasto Total do Mês</th>
                  <th className="p-3.5 text-green-400">Balancete Líquido</th>
                  <th className="p-3.5 pr-5">Anotação Fiscal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {Object.entries(consumoHistorico2026).map(([month, val]) => {
                  const consumoVariavel = val.Luz + val.Agua;
                  const cartoesVariavel = val['Cartão Bradesco'] + val['Cartão Santander'];
                  const totalSpent = totalMonthlyFixo + consumovariavelCalculated(consumoVariavel) + cartoesVariavel;
                  const netSobra = 8400.00 - totalSpent;
                  
                  // Helper function to resolve null values to default estimates from profile
                  function consumovariavelCalculated(v: number) {
                    // if zero or null, let's assume default base of 400 total
                    return v > 0 ? v : 373.47; // Default June Luz base if unspecified/null in history
                  }

                  return (
                    <tr key={month} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-3.5 pl-5 font-semibold text-white">{month}</td>
                      <td className="p-3.5 text-white/50">{formatBRL(totalMonthlyFixo)}</td>
                      <td className="p-3.5 text-purple-300">
                        {consumoVariavel > 0 
                          ? `${formatBRL(consumoVariavel)}` 
                          : `${formatBRL(373.47)} (Projetado)`}
                      </td>
                      <td className="p-3.5 text-blue-300">{formatBRL(cartoesVariavel)}</td>
                      <td className="p-3.5 text-red-300 font-bold">{formatBRL(totalSpent)}</td>
                      <td className={`p-3.5 font-bold ${netSobra >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatBRL(netSobra)}
                      </td>
                      <td className="p-3.5 pr-5 text-[10px] text-white/40 italic truncate max-w-xs" title={val.obs}>
                        {val.obs}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* LIST OF THE 13 HARDCODED SYSTEM FIXED RECURRING ITEMS */}
          <div className="bg-black/30 border border-white/5 rounded-2xl p-5 mt-2 flex flex-col gap-4">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <h5 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Relação dos 13 Itens de Despesas Recorrentes Fixas</h5>
              <span className="text-[10px] font-mono font-bold text-purple-400">Total Fixo: {formatBRL(totalMonthlyFixo)}</span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {despesasFixasMensais.map((fixed, idx) => (
                <div key={idx} className="bg-black/50 p-2.5 rounded-xl border border-white/5 font-mono text-[11px] flex justify-between items-center">
                  <span className="text-white/50 font-sans">{fixed.item}</span>
                  <strong className="text-white">{formatBRL(fixed.valor)}</strong>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
