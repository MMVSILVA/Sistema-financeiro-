import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Sparkles, 
  Send, 
  RefreshCw, 
  ShieldCheck, 
  Lightbulb,
  DollarSign
} from 'lucide-react';
import { ChatMessage, SystemAlert } from '../types';
// @ts-expect-error - image asset
import lionIcon from '../assets/images/lion_icon_1781116211738.png';

interface AISidePanelProps {
  score: number;
  diagnostic: string;
  alerts: SystemAlert[];
  onSendMessage: (msg: string) => Promise<string>;
  chatHistory: ChatMessage[];
  setChatHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

export default function AISidePanel({ 
  score, 
  diagnostic, 
  alerts, 
  onSendMessage, 
  chatHistory, 
  setChatHistory 
}: AISidePanelProps) {
  const [userInput, setUserInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const presetQueries = [
    "Como economizar este mês?",
    "Minha conta de luz aumentará?",
    "Dicas de CDB 102% CDI vs Poupança"
  ];

  // Auto-scroll chats to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userInput.trim() || isSending) return;

    const userMessage: ChatMessage = {
      id: Math.random().toString(),
      role: 'user',
      content: userInput,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    setChatHistory(prev => [...prev, userMessage]);
    const inputToSend = userInput;
    setUserInput('');
    setIsSending(true);

    try {
      const gptReply = await onSendMessage(inputToSend);
      
      const modelMessage: ChatMessage = {
        id: Math.random().toString(),
        role: 'model',
        content: gptReply,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
      setChatHistory(prev => [...prev, modelMessage]);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: Math.random().toString(),
        role: 'model',
        content: "Oops! Houve uma instabilidade de conexão na API do Gemini. Mas já estou verificando, pode tentar novamente!",
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  const handlePresetSelect = (query: string) => {
    setUserInput(query);
  };

  return (
    <div id="ai-side-panel-wrapper" className="bg-[#0b0c10]/40 border border-purple-500/15 rounded-3xl p-5 flex flex-col h-full min-h-[500px]">
      {/* Dynamic Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
            <img 
              src={lionIcon} 
              alt="Logo Leão" 
              className="w-full h-full object-cover rounded-xl"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-white block">Finance Control IA</span>
            <span className="text-[9px] text-amber-400 font-mono tracking-wider font-bold">LION MODEL GEMINI 3.5</span>
          </div>
        </div>

        {/* Dynamic score graphic representation */}
        <div className="flex items-center gap-2 bg-amber-950/40 p-1 px-2.5 rounded-full border border-amber-500/25">
          <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping"></div>
          <span className="text-[10px] font-mono font-bold text-green-400">SCORE: {score}</span>
        </div>
      </div>

      {/* Dynamic Diagnostic executive summary */}
      <div className="mb-4 bg-purple-950/15 border border-purple-500/10 p-3 rounded-2xl relative shadow-sm">
        <div className="flex items-center gap-2 mb-1.5 text-purple-400">
          <Sparkles className="w-3.5 h-3.5" />
          <h4 className="text-xs font-bold font-display uppercase tracking-wider font-semibold">Parecer do Consultor</h4>
        </div>
        <p className="text-xs leading-relaxed text-white/80">
          "{diagnostic || 'Analisando os seus hábitos para construir indicações e diminuir as contas fixas do SAAE e Light...'}"
        </p>
      </div>

      {/* Scrollable chat body & warnings */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-3.5 pr-2 mb-4 scrollbar-thin scrollbar-thumb-white/10" style={{ maxHeight: '280px' }}>
        {chatHistory.length === 0 ? (
          /* Show default diagnostic alerts if chat is empty */
          <div className="flex flex-col gap-2.5">
            <p className="text-[10px] font-bold uppercase text-white/30 tracking-widest font-mono">Destaques Recentes</p>
            {alerts.slice(0, 3).map((item) => (
              <div 
                key={item.id} 
                className={`p-3 rounded-xl border flex items-start gap-2.5 transition-all text-xs ${
                  item.tipo === 'aumento' || item.tipo === 'limite'
                    ? 'bg-red-950/10 border-red-500/20 text-red-100'
                    : item.tipo === 'sucesso'
                    ? 'bg-green-950/10 border-green-500/20 text-green-100'
                    : 'bg-white/5 border-white/10 text-white/90'
                }`}
              >
                <Lightbulb className={`w-4 h-4 shrink-0 mt-0.5 ${
                  item.tipo === 'aumento' || item.tipo === 'limite' ? 'text-red-400' : 'text-purple-400'
                }`} />
                <div>
                  <h4 className="font-bold text-[11px] mb-0.5">{item.titulo}</h4>
                  <p className="text-white/70 leading-normal">{item.mensagem}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Show real chat conversation */
          chatHistory.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div 
                key={msg.id} 
                className={`flex flex-col max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                  isUser 
                    ? 'bg-purple-600/90 text-white self-end rounded-tr-none' 
                    : 'bg-white/5 border border-white/10 text-white/95 self-start rounded-tl-none'
                }`}
              >
                <p className="whitespace-pre-line">{msg.content}</p>
                <span className="text-[9px] text-white/40 self-end mt-1 font-mono">{msg.timestamp}</span>
              </div>
            );
          })
        )}
        <div ref={chatBottomRef}></div>
      </div>

      {/* Suggested prompts widget */}
      <div className="mb-3 flex flex-wrap gap-1.5 justify-start">
        {presetQueries.map((q, i) => (
          <button
            key={i}
            onClick={() => handlePresetSelect(q)}
            className="text-[10px] border border-white/10 bg-white/5 hover:border-purple-500/40 hover:bg-purple-950/20 px-2.5 py-1 rounded-full text-white/70 hover:text-purple-300 transition-all text-left cursor-pointer"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input box */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 bg-black/60 border border-white/10 rounded-2xl p-1.5 focus-within:border-purple-500/50 transition-all">
        <input 
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder={isSending ? "Assistente pensando..." : "Pergunte algo à IA (Ex: Como economizar?)"}
          disabled={isSending}
          className="flex-1 bg-transparent px-3 py-2 text-xs text-white outline-none placeholder-white/30"
        />
        <button 
          type="submit"
          disabled={!userInput.trim() || isSending}
          className="h-8 w-8 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl flex items-center justify-center transition-all shadow-md active:scale-95 shrink-0 cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
