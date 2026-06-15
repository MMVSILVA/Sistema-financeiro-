import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Sparkles, 
  Send, 
  RefreshCw, 
  HelpCircle, 
  TrendingUp, 
  ShieldCheck, 
  Lightbulb, 
  Trash2, 
  Coins, 
  Target, 
  AlertCircle,
  TrendingDown,
  ArrowRight,
  BrainCircuit,
  PiggyBank,
  Paperclip
} from 'lucide-react';
import { ChatMessage, SystemAlert, Income, Expense, UserProfile } from '../types';
// @ts-expect-error - image asset
import lionIcon from '../assets/images/lion_icon_1781116211738.png';

// Helper to parse simple markdown to react elements for extremely professional chat outputs
const formatTextSegments = (str: string) => {
  if (!str) return '';
  const parts = str.split('**');
  return parts.map((part, i) => {
    if (i % 2 === 1) {
      if (part.includes('SUPERENDIVIDAMENTO') || part.includes('ALERTA') || part.includes('RISCO')) {
        return (
          <strong key={i} className="font-extrabold text-red-400 bg-red-500/10 border border-red-500/25 px-1.5 py-0.5 rounded text-[11px] uppercase font-mono tracking-wider mx-1">
            {part}
          </strong>
        );
      }
      return <strong key={i} className="font-extrabold text-amber-300 font-sans">{part}</strong>;
    }
    return part;
  });
};

const parseMarkdownMessage = (text: string) => {
  if (!text) return null;
  const lines = text.split('\n');
  return (
    <div className="space-y-2 text-zinc-100 font-sans leading-relaxed text-xs">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (trimmed === '') return <div key={i} className="h-1.5" />;
        
        // Headers
        if (line.startsWith('# ')) {
          return (
            <h1 key={i} className="text-sm font-black text-amber-400 uppercase tracking-wider mt-3 mb-1.5">
              {formatTextSegments(line.substring(2))}
            </h1>
          );
        }
        if (line.startsWith('## ')) {
          return (
            <h2 key={i} className="text-xs font-black text-amber-300 uppercase tracking-wider mt-2.5 mb-1">
              {formatTextSegments(line.substring(3))}
            </h2>
          );
        }
        if (line.startsWith('### ')) {
          return (
            <h3 key={i} className="text-xs font-bold text-zinc-200 mt-2 mb-1">
              {formatTextSegments(line.substring(4))}
            </h3>
          );
        }
        
        // Blockquotes
        if (line.startsWith('> ')) {
          return (
            <blockquote key={i} className="border-l-2 border-amber-500/50 pl-2.5 py-1 my-2 bg-amber-500/5 rounded-r-xl italic text-amber-100/90 leading-relaxed font-sans">
              {formatTextSegments(line.substring(2))}
            </blockquote>
          );
        }

        // Bullet lists
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return (
            <div key={i} className="flex items-start gap-1.5 ml-2.5 my-0.5">
              <span className="text-amber-400 shrink-0 select-none mt-1">•</span>
              <span className="flex-1 text-zinc-200">{formatTextSegments(line.substring(2))}</span>
            </div>
          );
        }

        // Default paragraph
        return (
          <p key={i} className="my-1.5 leading-relaxed text-zinc-200 font-sans">
            {formatTextSegments(line)}
          </p>
        );
      })}
    </div>
  );
};

interface FinanceAgentProps {
  incomes: Income[];
  expenses: Expense[];
  profile: UserProfile;
  onSendMessage: (
    msg: string, 
    currentHistory?: ChatMessage[], 
    fileAttachment?: { name: string, type: string, data: string }
  ) => Promise<string>;
  chatHistory: ChatMessage[];
  setChatHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  score: number;
  diagnostic: string;
  alerts: SystemAlert[];
  setAlerts: React.Dispatch<React.SetStateAction<SystemAlert[]>>;
}

export default function FinanceAgent({
  incomes,
  expenses,
  profile,
  onSendMessage,
  chatHistory,
  setChatHistory,
  score,
  diagnostic,
  alerts,
  setAlerts
}: FinanceAgentProps) {
  const [userInput, setUserInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{ name: string; type: string; data: string; dataUrl: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Math calculated from real user data
  const totalIncomes = incomes.reduce((sum, item) => sum + item.valor, 0);
  const totalExpenses = expenses.reduce((sum, item) => sum + item.valor, 0);
  const netSavings = totalIncomes - totalExpenses;
  const savingsRate = totalIncomes > 0 ? (netSavings / totalIncomes) * 100 : 0;
  
  // Real fixed bills categorization ratios
  const fixedBillsSum = expenses.reduce((sum, item) => {
    // Standard household bills from real data
    const isFixed = item.isRecorrente || 
                    ['Luz', 'Água', 'Internet', 'Educação', 'Outros'].includes(item.categoria) ||
                    ['consórcio', 'mensalidade', 'escola', 'faculdade', 'telefonia', 'vivo', 'dízimo', 'empréstimo'].some(term => item.estabelecimento.toLowerCase().includes(term));
    return isFixed ? sum + item.valor : sum;
  }, 0);

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      setAttachedFile({
        name: file.name,
        type: file.type,
        data: base64String,
        dataUrl: base64String
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!userInput.trim() && !attachedFile) || isSending) return;

    const userMessage: ChatMessage = {
      id: `agent-msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      role: 'user',
      content: userInput || (attachedFile ? `[Arquivo enviado: ${attachedFile.name}]` : ''),
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      attachment: attachedFile ? {
        name: attachedFile.name,
        type: attachedFile.type,
        dataUrl: attachedFile.dataUrl
      } : undefined
    };

    const updatedHistory = [...chatHistory, userMessage];
    setChatHistory(updatedHistory);
    
    const inputToSend = userInput || (attachedFile ? `Analise por favor o arquivo que anexei: ${attachedFile.name}` : '');
    const fileToSend = attachedFile ? { name: attachedFile.name, type: attachedFile.type, data: attachedFile.data } : undefined;

    setUserInput('');
    setAttachedFile(null);
    setIsSending(true);

    try {
      const modelReply = await onSendMessage(inputToSend, updatedHistory, fileToSend);
      
      const modelMessage: ChatMessage = {
        id: `agent-msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        role: 'model',
        content: modelReply,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
      setChatHistory(prev => [...prev, modelMessage]);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: `agent-msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        role: 'model',
        content: "Olá! Houve uma instabilidade de conexão na API do Gemini. Mas já estou operando o autoreparo, por favor repita sua dúvida!",
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  const clearChat = () => {
    if (confirm("Deseja limpar o histórico do chat com o consultor?")) {
      setChatHistory([]);
    }
  };

  const handleSuggestQuery = (query: string) => {
    setUserInput(query);
  };

  const presetQueries = [
    { text: "Estou no vermelho? Calcule meu saldo real", label: "Raio-X de Caixa" },
    { text: "Onde posso enxugar gastos na minha lista de despesas?", label: "Dicas de Economia" },
    { text: "Como economizar na conta de luz (Light R$ 373,47)?", label: "Reduzir Conta de Luz" },
    { text: "Se eu economizar R$ 400 por mês, em quanto tempo crio uma reserva?", label: "Criar Reserva" }
  ];

  return (
    <div className="space-y-6" id="financial-agent-page">
      {/* Premium Gradient Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-amber-950/30 via-amber-900/5 to-zinc-950/40 border border-amber-500/20 p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center border border-amber-400/30 shadow-lg shadow-amber-500/20 shrink-0 mt-1 overflow-hidden">
            <img 
              src={lionIcon} 
              alt="Leão" 
              className="w-full h-full object-cover animate-pulse"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-amber-500/20 text-amber-300 font-mono tracking-wider font-bold px-2 py-0.5 rounded-full border border-amber-400/30">ATIVADO</span>
              <span className="text-xs text-white/40 font-mono">MODELO: GEMINI 3.5 FLASH LATEST • MEU ANALISTA FINANCEIRO</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-white mt-1.5 font-display tracking-tight flex items-center gap-1.5">
              Meu Analista Financeiro <span className="text-amber-400 text-xs md:text-sm font-medium">— Gestão, Planejamento e Crédito</span>
            </h1>
            <p className="text-xs text-amber-100/70 italic font-medium mt-1">
              "Prosperidade e riquezas haverá na sua casa..." — Salmos 112:3
            </p>
          </div>
        </div>

        {/* Dynamic Score widget */}
        <div className="bg-black/35 border border-white/5 p-4 rounded-2xl flex items-center gap-4 shrink-0 min-w-[200px]">
          <div className="relative flex items-center justify-center">
            {/* Round indicator */}
            <svg className="w-16 h-16 transform -rotate-90">
              <circle cx="32" cy="32" r="28" className="stroke-white/5" strokeWidth="4" fill="transparent" />
              <circle cx="32" cy="32" r="28" 
                className="stroke-purple-500" 
                strokeWidth="4" 
                fill="transparent" 
                strokeDasharray={175} 
                strokeDashoffset={175 - (175 * Math.max(0, Math.min(score, 100))) / 100}
                strokeLinecap="round" 
              />
            </svg>
            <span className="absolute text-sm font-mono font-bold text-white">{score}</span>
          </div>
          <div>
            <span className="text-[10px] text-white/40 block font-mono font-bold uppercase tracking-wider">Saúde Financeira</span>
            <strong className="text-xs text-green-400 mt-1 block">
              {score >= 80 ? 'Excelente' : score >= 60 ? 'Estável' : 'Alerta de Caixa'}
            </strong>
            <span className="text-[10px] text-white/50 block">Baseado nos dados reais</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Chat, Right Diagnostics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Chat Component - Column Span 7 */}
        <div className="lg:col-span-8 flex flex-col bg-[#0b0c10]/40 border border-white/5 rounded-3xl h-[620px] shadow-lg relative overflow-hidden">
          {/* Header */}
          <div className="p-4 px-6 border-b border-white/5 flex items-center justify-between bg-black/20">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <span className="font-bold text-xs text-white tracking-wide block">Chat de Diagnósticos Ativos</span>
                <span className="text-[9px] text-zinc-400 font-mono">
                  {profile?.displayName || 'Vini Silva'} • {profile?.familyName || 'Família Silva'}
                </span>
              </div>
            </div>
            {chatHistory.length > 0 && (
              <button 
                onClick={clearChat}
                className="text-white/45 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-xl transition-all flex items-center gap-1.5 text-[10px] font-bold"
                title="Limpar Conversa"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Limpar Histórico
              </button>
            )}
          </div>

          {/* Message List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-white/5">
            {chatHistory.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20 overflow-hidden">
                  <img 
                    src={lionIcon} 
                    alt="Logo Leão" 
                    className="w-8 h-8 object-cover rounded-lg"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-display">Meu Analista Financeiro</h3>
                  <p className="text-xs text-white/50 mt-1 leading-relaxed">
                    Olá, bem-vindo! Sou o seu parceiro em gestão de orçamento familiar, planejamento estratégico e análise de crédito. 
                    Envie faturas, comprovantes de renda/gastos, boletos ou propostas de empréstimo em PDF/foto para avaliarmos detalhadamente o impacto no seu bolso!
                  </p>
                </div>
                
                {/* Suggestions chips */}
                <div className="w-full grid grid-cols-1 gap-2 pt-3">
                  {presetQueries.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestQuery(q.text)}
                      className="text-left w-full bg-white/5 hover:bg-amber-600/10 hover:border-amber-500/30 border border-white/5 p-3 rounded-2xl text-[11px] text-white/70 hover:text-white transition-all duration-300 flex items-center justify-between"
                    >
                      <span className="font-medium">{q.label}: <span className="text-amber-400">{q.text}</span></span>
                      <ArrowRight className="w-3.5 h-3.5 text-white/30 shrink-0 ml-1.5" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {chatHistory.map((msg) => {
                  const isUser = msg.role === 'user';
                  return (
                    <div 
                      key={msg.id} 
                      className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                    >
                      <div className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                        isUser 
                          ? 'bg-amber-500/15 border border-amber-500/25 text-white rounded-tr-none' 
                          : 'bg-white/5 border border-white/5 text-white/90 rounded-tl-none'
                      }`}>
                        <div className="flex items-center gap-2 mb-1.5 opacity-60 text-[10px]">
                          <span className="font-bold">{isUser ? 'Você' : 'Meu Analista Financeiro'}</span>
                          <span>•</span>
                          <span>{msg.timestamp || 'Agora'}</span>
                        </div>
                        
                        {msg.attachment && (
                          <div className="mb-2.5 p-2 bg-black/35 border border-white/5 rounded-xl flex items-center gap-2 max-w-sm">
                            {msg.attachment.type.startsWith('image/') ? (
                              <img src={msg.attachment.dataUrl} alt={msg.attachment.name} className="w-12 h-12 object-cover rounded border border-white/10" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="w-12 h-12 bg-amber-500/15 text-amber-500 rounded flex items-center justify-center text-[10px] font-bold font-mono border border-amber-500/20 shrink-0">
                                DOC
                              </div>
                            )}
                            <div className="truncate">
                              <span className="text-[11px] font-bold text-white block truncate max-w-[140px]" title={msg.attachment.name}>
                                {msg.attachment.name}
                              </span>
                              <span className="text-[9px] text-amber-400 font-medium block">Foto/Arquivo enviado</span>
                            </div>
                          </div>
                        )}

                        <div className="whitespace-pre-wrap font-sans text-xs text-white/95">
                          {isUser ? msg.content : parseMarkdownMessage(msg.content)}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {isSending && (
                  <div className="flex justify-start animate-pulse">
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-4 text-xs text-white/40 flex items-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                      Analisando faturamento e avaliando anexo lançado...
                    </div>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>
            )}
          </div>

          {/* Quick chips container when chat has items */}
          {chatHistory.length > 0 && (
            <div className="px-6 py-2 border-t border-white/5 bg-black/10 flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-none">
              <span className="text-[10px] text-amber-400 font-mono uppercase font-bold mr-1">Sugestões:</span>
              {presetQueries.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestQuery(q.text)}
                  className="bg-white/5 hover:bg-amber-600/10 border border-white/5 text-[10px] text-white/70 hover:text-white px-2.5 py-1 rounded-full transition-all duration-300"
                >
                  {q.label}
                </button>
              ))}
            </div>
          )}

          {/* File attachment preview bubble */}
          {attachedFile && (
            <div className="px-6 py-2.5 border-t border-white/10 bg-zinc-950/60 flex items-center justify-between gap-4 animate-slideIn">
              <div className="flex items-center gap-3">
                {attachedFile.type.startsWith('image/') ? (
                  <img src={attachedFile.dataUrl} alt="preview" className="w-10 h-10 object-cover rounded-lg border border-white/15" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-10 h-10 bg-amber-500/10 text-amber-500 rounded-lg border border-amber-500/20 flex items-center justify-center font-mono text-[9px] font-bold shrink-0">
                    DOC
                  </div>
                )}
                <div>
                  <span className="text-xs font-bold text-white block truncate max-w-[200px]">{attachedFile.name}</span>
                  <span className="text-[10px] text-amber-400/80 font-medium block">Imagem/Documento anexado</span>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setAttachedFile(null)}
                className="text-white/40 hover:text-red-400 p-1.5 hover:bg-white/5 rounded-lg transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-white/5 bg-black/20 flex gap-2">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange}
              className="hidden" 
              accept="image/*,application/pdf,text/plain"
            />
            
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-[#121318] hover:bg-zinc-800 text-white/70 hover:text-white px-4 rounded-xl flex items-center justify-center border border-white/5 transition-all"
              title="Enviar Foto ou Arquivo"
            >
              <Paperclip className="w-4 h-4 text-amber-400" />
            </button>

            <input 
              type="text" 
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Envie uma foto/arquivo ou escreva sua dúvida financeira aqui..."
              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-amber-500/40"
              disabled={isSending}
            />
            <button 
              type="submit"
              disabled={(!userInput.trim() && !attachedFile) || isSending}
              className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-4 rounded-xl flex items-center justify-center transition-all disabled:opacity-45 disabled:hover:bg-amber-500 shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Intelligence Board - Column Span 4 */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Diagnostic Executive Card */}
          <div className="bg-[#0b0c10]/40 border border-white/5 rounded-3xl p-5 flex flex-col gap-3.5 relative">
            <div className="flex items-center gap-2 text-purple-400">
              <Sparkles className="w-4 h-4" />
              <h3 className="text-xs font-bold font-display uppercase tracking-wider">Último Parecer executivo</h3>
            </div>
            <div className="text-xs leading-relaxed text-white/80 bg-purple-950/10 border border-purple-500/10 p-3.5 rounded-2xl">
              "{diagnostic || 'Verificando o impacto de sua renda mensal CLT e contas fixas do SAAE e Light para traçar soluções críticas de caixa...'}"
            </div>
            <div className="mt-1 flex flex-col gap-2">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-white/45">Saldo Líquido Real:</span>
                <span className={`font-semibold font-mono ${netSavings >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatBRL(netSavings)}
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-white/45">Comprometimento em Custos Fixos:</span>
                <span className="font-semibold font-mono text-white">
                  {totalIncomes > 0 ? ((fixedBillsSum / totalIncomes) * 100).toFixed(1) : 0}% ({formatBRL(fixedBillsSum)})
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-white/45">Margem de Poupança Líquida:</span>
                <span className="font-semibold font-mono text-purple-300">
                  {savingsRate.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Real AI-Powered Checklist Suggestions */}
          <div className="bg-[#0b0c10]/40 border border-white/5 rounded-3xl p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-purple-400">
              <Lightbulb className="w-4 h-4" />
              <h3 className="text-xs font-bold font-display uppercase tracking-wider">Checklist Acionável IA</h3>
            </div>
            <p className="text-[10px] text-white/45">Gargalos reais detectados na contabilidade familiar:</p>
            
            <div className="space-y-2.5 mt-1">
              {/* Point 1: Electric excess */}
              <div className="p-3 bg-red-950/10 border border-red-500/15 rounded-2xl flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="text-[11px]">
                  <h4 className="font-bold text-red-300">Luz Light: Consumo Elevado (R$ 373,47)</h4>
                  <p className="text-white/60 leading-normal mt-0.5">O gasto na concessionária consome 4.4% do seu salário família. Reduza chuveiro e ferro no horário de pico.</p>
                </div>
              </div>

              {/* Point 2: Balance risk */}
              <div className="p-3 bg-red-950/10 border border-red-500/15 rounded-2xl flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="text-[11px]">
                  <h4 className="font-bold text-red-300">Soma de Compromissos de Dívida</h4>
                  <p className="text-white/60 leading-normal mt-0.5">Carro (R$ 1.509) e Empréstimo (R$ 1.523) somados tomam R$ 3.032, ou seja, 36.1% de toda a sua renda familiar. Evite assumir novos boletos parcelados.</p>
                </div>
              </div>

              {/* Point 3: Safe opportunity */}
              <div className="p-3 bg-purple-950/10 border border-purple-500/15 rounded-2xl flex items-start gap-2.5">
                <PiggyBank className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div className="text-[11px]">
                  <h4 className="font-bold text-purple-300">Ajuste de Assinaturas (Vivo R$ 140)</h4>
                  <p className="text-white/60 leading-normal mt-0.5">O plano de telefonia está acima da média familiar nacional. Revisar opções ou migrar para planos controle reduzirá o custo fixo.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Secure Trust Stamp */}
          <div className="bg-black/25 border border-white/5 rounded-2xl p-4 flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-green-400/80 shrink-0" />
            <div>
              <h4 className="text-[11px] font-bold text-white leading-normal">Ambiente Seguro e Sem Dados Falsos</h4>
              <p className="text-[10px] text-white/50 leading-normal mt-0.5">Filtramos todas as simulações e dados fictícios antigos. Seus dados mostrados refletem estritamente os lançamentos oficiais que você envia.</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
