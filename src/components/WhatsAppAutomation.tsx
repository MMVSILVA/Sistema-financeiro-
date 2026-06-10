import React, { useState, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  Phone, 
  QrCode, 
  CheckCircle, 
  AlertTriangle, 
  Copy, 
  ChevronRight, 
  Share2, 
  Sparkles, 
  Code,
  Smartphone,
  Check,
  Camera,
  Image as ImageIcon
} from 'lucide-react';
import { Expense, Income } from '../types';

interface WhatsAppAutomationProps {
  onAddExpense: (exp: Omit<Expense, 'id' | 'uid'>) => void;
  onAddIncome: (inc: Omit<Income, 'id' | 'uid'>) => void;
  expenses: Expense[];
  incomes: Income[];
}

interface ChatBubble {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  image?: string; // base64 or thumbnail
  parsedData?: {
    valor: number;
    categoria: string;
    estabelecimento: string;
    vencimento: string;
    tipo: 'despesa' | 'receita';
  };
}

export default function WhatsAppAutomation({
  onAddExpense,
  onAddIncome,
  expenses,
  incomes
}: WhatsAppAutomationProps) {
  // Config state
  const [whatsappNumber, setWhatsappNumber] = useState(() => {
    return localStorage.getItem('saas_whatsapp_number') || '5521999999999';
  });
  const [apiKey, setApiKey] = useState('wpp_sec_key_live_da39a3ee5e6b4b0d3255');
  const [webhookUrl, setWebhookUrl] = useState('https://ais-pre-4kfhaqsm7eljirt7tekosn-588738955013.us-east1.run.app/api/webhooks/whatsapp');
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const handleWhatsappNumberChange = (val: string) => {
    setWhatsappNumber(val);
    localStorage.setItem('saas_whatsapp_number', val);
  };
  
  // Interactive Simulator chat history
  const [chatHistory, setChatHistory] = useState<ChatBubble[]>([
    {
      id: 'msg-init-1',
      sender: 'bot',
      text: '🤖 Olá! Eu sou o Bot do Finanças IA no WhatsApp. Pode me enviar qualquer foto de nota fiscal, comprovante Pix, boleto ou simplesmente digite seu lançamento (ex: "Gastei R$ 45 com Uber de volta do Shopping") e eu adiciono na sua conta automaticamente!',
      timestamp: '19:42'
    }
  ]);
  const [typedMessage, setTypedMessage] = useState('');
  const [simulatedPhoto, setSimulatedPhoto] = useState<string | null>(null);
  const [simulatedPhotoName, setSimulatedPhotoName] = useState('');
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [activeInstructionTab, setActiveInstructionTab] = useState<'node' | 'python' | 'webhook'>('node');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const mockPredefinedPhotos = [
    {
      id: 'receipt-comb',
      name: 'Nota Fiscal de Combustível (Posto Shell)',
      icon: '⛽',
      text: 'Foto do Cupom Shell: R$ 150.00 pagos no Pix',
      data: {
        valor: 151.40,
        categoria: 'Transporte',
        estabelecimento: 'Posto Shell Limitada',
        vencimento: new Date().toISOString().split('T')[0],
        tipo: 'despesa' as const
      }
    },
    {
      id: 'receipt-luz',
      name: 'Fatura de Energia Elétrica (Light)',
      icon: '⚡',
      text: 'Boleto Light do mês de referência',
      data: {
        valor: 245.30,
        categoria: 'Luz',
        estabelecimento: 'Macaé Light Distribuidora',
        vencimento: '2026-06-15',
        tipo: 'despesa' as const
      }
    },
    {
      id: 'receipt-salario',
      name: 'Comprovante CLT Família',
      icon: '💼',
      text: 'Sincronizar depósito de Salário de Sandra (Mãe)',
      data: {
        valor: 4200.00,
        categoria: 'Salário',
        estabelecimento: 'Aporte Salário Sandra',
        vencimento: new Date().toISOString().split('T')[0],
        tipo: 'receita' as const
      }
    }
  ];

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(id);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  // Helper function to formulate Brazilian real formatting
  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // Pre-composes a WhatsApp sharing message with actual transaction data
  const composeWhatsAppLink = (transaction: { valor: number; categoria: string; label: string; data: string; type: 'income' | 'expense' }) => {
    const emoji = transaction.type === 'income' ? '🟢' : '🔴';
    const typeLabel = transaction.type === 'income' ? 'RECEITA' : 'DESPESA';
    const textMsg = `Olá! ${emoji} Segue lançamento para incluir no sistema familiar de Finanças IA:

📌 Tipo: ${typeLabel}
💰 Valor: ${formatBRL(transaction.valor)}
🏷️ Categoria: ${transaction.categoria}
🏢 Local/Ref: ${transaction.label}
📅 Data: ${transaction.data}

Enviado pelo painel rápido de links.`;
    return `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent(textMsg)}`;
  };

  // Simulate Photo Upload inside the mock Chat app
  const triggerFileSelector = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSimulatedPhotoName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        setSimulatedPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Core conversational flow simulator
  const handleSendSimulatedMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim() && !simulatedPhoto) return;

    const userText = typedMessage;
    const userPhoto = simulatedPhoto;
    const photoName = simulatedPhotoName;

    // 1. Log user chat bubble
    const userMsgId = `user-msg-${Date.now()}`;
    const newBubbles: ChatBubble[] = [
      ...chatHistory,
      {
        id: userMsgId,
        sender: 'user',
        text: userText || `[Foto Enviada]: ${photoName}`,
        image: userPhoto || undefined,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      }
    ];

    setChatHistory(newBubbles);
    setTypedMessage('');
    setSimulatedPhoto(null);
    setSimulatedPhotoName('');
    setIsBotThinking(true);

    // 2. Process message using simple regex logic or full mockup response
    setTimeout(() => {
      let responseText = '';
      let parsed = undefined;

      if (userPhoto) {
        // Simulated AI receipt parsing
        parsed = {
          valor: 154.20,
          categoria: 'Alimentação',
          estabelecimento: 'Supermercado Multishow Macaé',
          vencimento: new Date().toISOString().split('T')[0],
          tipo: 'despesa' as const
        };
        responseText = `✅ **Nota Fiscal Identificada e Importada!**
        
🏢 **Estabelecimento:** ${parsed.estabelecimento}
💰 **Valor total:** ${formatBRL(parsed.valor)}
🏷️ **Categoria atribuída:** ${parsed.categoria}
📅 **Vencimento/Data:** ${parsed.vencimento}

*Adicionei com sucesso esta despesa no seu livro financeiro principal do painel!* O saldo global e gráficos já foram re-sincronizados.`;

        // Direct write database inject!
        onAddExpense({
          valor: parsed.valor,
          categoria: parsed.categoria,
          data: parsed.vencimento,
          formaPagamento: 'Pix',
          parcelas: 1,
          isRecorrente: false,
          estabelecimento: parsed.estabelecimento,
          observacoes: 'Recebido via Bot WhatsApp 🟢'
        });

      } else {
        // Simple text parsing algorithm
        const moneyMatch = userText.match(/(?:r\$|brl)?\s*([0-9]+[.,][0-9]{2}|[0-9]+)/i);
        const textLower = userText.toLowerCase();
        
        let valor = 50.00;
        if (moneyMatch) {
          const rawVal = moneyMatch[1].replace(',', '.');
          valor = parseFloat(rawVal) || 50.00;
        }

        let categoria = 'Outros';
        let estabelecimento = 'Lançamento WhatsApp';
        let isReceita = false;

        if (textLower.includes('uber') || textLower.includes('posto') || textLower.includes('gasolina') || textLower.includes('combustivel')) {
          categoria = 'Transporte';
          estabelecimento = 'Uber/Combustível WhatsApp';
        } else if (textLower.includes('mercado') || textLower.includes('comida') || textLower.includes('pão') || textLower.includes('almoço') || textLower.includes('jantar')) {
          categoria = 'Alimentação';
          estabelecimento = 'Alimentação / Mercado';
        } else if (textLower.includes('luz') || textLower.includes('energia') || textLower.includes('light')) {
          categoria = 'Luz';
          estabelecimento = 'Macaé Light Distribuidora';
        } else if (textLower.includes('água') || textLower.includes('saae')) {
          categoria = 'Água';
          estabelecimento = 'SAAE Saneamento S/A';
        } else if (textLower.includes('salário') || textLower.includes('recebi') || textLower.includes('ganhei') || textLower.includes('pix de')) {
          categoria = 'Salário';
          estabelecimento = 'Salário / Renda Extra';
          isReceita = true;
        }

        parsed = {
          valor,
          categoria,
          estabelecimento,
          vencimento: new Date().toISOString().split('T')[0],
          tipo: isReceita ? ('receita' as const) : ('despesa' as const)
        };

        if (isReceita) {
          responseText = `🟢 **Lançamento de Receita efetuado por texto!**
          
💰 **Rendimento:** ${formatBRL(parsed.valor)}
🏷️ **Categoria:** ${parsed.categoria}
📝 **Descrição:** ${parsed.estabelecimento}

*Já incluí este saldo em seu painel.* Excelente trabalho trazendo mais receitas em caixa!`;

          onAddIncome({
            valor: parsed.valor,
            categoria: parsed.categoria,
            data: parsed.vencimento,
            descricao: parsed.estabelecimento + ' (via WhatsApp Bot)',
            recorrencia: 'Avulso'
          });
        } else {
          responseText = `🔴 **Sua despesa foi gravada por mensagem de texto com sucesso!**
          
💰 **Valor registrado:** ${formatBRL(parsed.valor)}
🏷️ **Categoria:** ${parsed.categoria}
🏢 **Local:** ${parsed.estabelecimento}

*Sua carteira familiar foi reestimada com desconto deste novo lançamento.*`;

          onAddExpense({
            valor: parsed.valor,
            categoria: parsed.categoria,
            data: parsed.vencimento,
            formaPagamento: 'Pix',
            parcelas: 1,
            isRecorrente: false,
            estabelecimento: parsed.estabelecimento,
            observacoes: 'Recebido via Bot WhatsApp 🟢'
          });
        }
      }

      setChatHistory(prev => [
        ...prev,
        {
          id: `bot-msg-${Date.now()}`,
          sender: 'bot',
          text: responseText,
          parsedData: parsed,
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsBotThinking(false);
    }, 1500);
  };

  // Instantly test preset receipt simulations via conversational mock WhatsApp
  const handleTestPresetSandbox = (preset: typeof mockPredefinedPhotos[0]) => {
    setIsBotThinking(true);
    
    // Log user sending preset text/thumbnail
    setChatHistory(prev => [
      ...prev,
      {
        id: `user-preset-${Date.now()}`,
        sender: 'user',
        text: `📲 [Disparar Atomo de Teste]: ${preset.name} (${preset.icon})`,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    setTimeout(() => {
      let botResponse = '';
      if (preset.data.tipo === 'despesa') {
        onAddExpense({
          valor: preset.data.valor,
          categoria: preset.data.categoria,
          data: preset.data.vencimento,
          formaPagamento: 'Pix',
          parcelas: 1,
          isRecorrente: preset.data.categoria === 'Luz',
          estabelecimento: preset.data.estabelecimento,
          observacoes: 'Recebido via Bot WhatsApp 🟢'
        });

        botResponse = `✅ **Lançamento de Despesa computado à distância!**
        
🏢 **Estabelecimento/Concessionária:** ${preset.data.estabelecimento}
💰 **Valor captado:** ${formatBRL(preset.data.valor)}
🏷️ **Categoria:** ${preset.data.categoria}
📅 **Resgate de Vencimento:** ${preset.data.vencimento}

_Lançamento gravado com sucesso no ecossistema e visualizadores!_`;
      } else {
        onAddIncome({
          valor: preset.data.valor,
          categoria: preset.data.categoria,
          data: preset.data.vencimento,
          descricao: preset.data.estabelecimento,
          recorrencia: 'Mensal'
        });

        botResponse = `🟢 **Lançamento de Receita familiar catalogado por Whatsapp!**
        
🏢 **Origem:** ${preset.data.estabelecimento}
💰 **Aporte financeiro:** ${formatBRL(preset.data.valor)}
🏷️ **Categoria:** ${preset.data.categoria}

_Seus KPIs e relatórios financeiros de BI foram reatualizados._`;
      }

      setChatHistory(prev => [
        ...prev,
        {
          id: `bot-preset-reply-${Date.now()}`,
          sender: 'bot',
          text: botResponse,
          parsedData: preset.data,
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsBotThinking(false);
    }, 1200);
  };

  // Build some general templates of recent transactions to share / create dynamic wa.me links
  const recentTransactions = [
    ...expenses.map(e => ({ id: e.id, valor: e.valor, categoria: e.categoria, label: e.estabelecimento || e.categoria, data: e.data, type: 'expense' as const })),
    ...incomes.map(i => ({ id: i.id, valor: i.valor, categoria: i.categoria, label: i.descricao || 'Salário', data: i.data, type: 'income' as const }))
  ].slice(0, 3);

  // Full-stack code to display for users
  const nodeCodeExample = `/**
 * BOT FINANCEIRO INTEGRADO - NODE.JS & EVOLUTION API
 * Exemplo de Webhook auto-executável para capturar mensagens e faturas via WhatsApp.
 */
import express from 'express';
import axios from 'axios';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8080;
const SAAS_BACKEND_URL = "${webhookUrl.replace('/api/webhooks/whatsapp', '/api/gemini/analyze-bill')}";

app.post('/whatsapp-webhook', async (req, res) => {
  const { event, data } = req.body;
  
  // Capturar nova mensagem recebida (texto ou imagem)
  if (event === 'messages.upsert' && data.message) {
    const from = data.key.remoteJid;
    const messageType = Object.keys(data.message)[0];
    
    console.log(\`Mensagem recebida de \${from}: Tipo \${messageType}\`);
    
    // CASO 1: Foto / Cupom Fiscal enviado pelo WhatsApp
    if (messageType === 'imageMessage') {
      const mediaBuffer = await downloadWhatsAppMedia(data.message.imageMessage);
      const base64Image = mediaBuffer.toString('base64');
      
      console.log('Enviando imagem captada para OCR do Finanças IA...');
      try {
        const response = await axios.post(SAAS_BACKEND_URL, {
          imageBase64: \`data:image/png;base64,\${base64Image}\`,
          mimeType: 'image/png'
        });
        
        await sendWhatsAppText(from, \`✅ *Lançamento Processado!* \\n\\nEstabelecimento: \${response.data.estabelecimento}\\nValor: R$ \${response.data.valor.toFixed(2)}\`);
      } catch (err) {
        await sendWhatsAppText(from, '❌ Erro ao decodificar boleto usando a inteligência artificial.');
      }
    }
  }
  
  res.sendStatus(200);
});

async function downloadWhatsAppMedia(message) {
  // Baixar arquivos de imagem do servidor WhatsApp
  return Buffer.from('');
}

async function sendWhatsAppText(to, text) {
  // Chamar API de envio do WhatsApp
}`;

  return (
    <div id="whatsapp-automation-tab" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      {/* LEFT AREA: Configs & Linking Links generator */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        
        {/* Intro banner */}
        <div className="bg-gradient-to-br from-[#0c1613] to-[#040906] border border-green-500/20 rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-green-500/10 border border-green-500/30 text-green-400 flex items-center justify-center shrink-0">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <span className="p-1 px-2 text-[9px] font-mono font-bold uppercase rounded bg-green-500/15 border border-green-500/20 text-green-400 mb-1 inline-block">MÓDULO DE AUTOMAÇÃO</span>
              <h2 className="text-lg font-bold text-white tracking-tight">Robô de WhatsApp Finanças IA</h2>
              <p className="text-xs text-white/60 leading-relaxed mt-1">
                Conecte seu WhatsApp ao cérebro do sistema. Envie boletos, fotos de faturas ou digite relatos de despesas pelo celular. O bot decodifica os metadados do texto/imagem e insere as despesas com o valor correto em tempo real!
              </p>
            </div>
          </div>
        </div>

        {/* Integration Credentials Card */}
        <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6">
          <h3 className="text-xs font-mono font-bold text-white/40 uppercase tracking-wider mb-4 flex items-center gap-2">
            <QrCode className="w-4 h-4 text-green-400" /> Parâmetros de Endereçamento do Webhook
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase font-mono font-bold text-white/40 block mb-1">Seu Número do WhatsApp</label>
              <input 
                type="text" 
                value={whatsappNumber}
                onChange={(e) => handleWhatsappNumberChange(e.target.value)}
                placeholder="Ex: 5521999999999"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-green-500/40"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-mono font-bold text-white/40 block mb-1">Chave Secreta da API Bot</label>
              <input 
                type="text" 
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white/65 outline-none font-mono"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="text-[10px] uppercase font-mono font-bold text-white/40 block mb-1">URL de Retorno (Webhook Callback)</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                readOnly
                value={webhookUrl}
                className="flex-1 bg-black/60 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white/50 outline-none font-mono"
              />
              <button 
                onClick={() => handleCopyText(webhookUrl, 'webhook')}
                className="px-3 py-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-xs transition flex items-center gap-1.5 cursor-pointer text-white/80"
              >
                {copiedLink === 'webhook' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedLink === 'webhook' ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Prefilled quick-action Link Generator */}
        <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-3.5">
            <div>
              <h3 className="text-sm font-semibold text-white tracking-wide">Gerador de Mensagem WhatsApp</h3>
              <p className="text-[10px] text-white/40 font-normal">Selecione uma transação de seu histórico para criar um link de sincronização rápida do WhatsApp</p>
            </div>
            <Share2 className="w-4 h-4 text-green-400" />
          </div>

          {recentTransactions.length === 0 ? (
            <div className="p-6 text-center border border-white/5 bg-black/25 rounded-2xl text-xs text-white/30">
              Nenhum histórico disponível ainda. Adicione lançamentos primeiro.
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {recentTransactions.map((t) => {
                const link = composeWhatsAppLink(t);
                return (
                  <div key={t.id} className="bg-black/30 border border-white/5 p-3 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition hover:bg-black/55">
                    <div className="flex items-center gap-3">
                      <span className={`w-2.5 h-2.5 rounded-full ${t.type === 'income' ? 'bg-green-400' : 'bg-red-400'}`}></span>
                      <div>
                        <p className="text-xs font-semibold text-white">{t.label}</p>
                        <p className="text-[10px] text-white/40 font-mono mt-0.5">{t.categoria} • {formatBRL(t.valor)}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto self-end sm:self-center">
                      <button 
                        onClick={() => handleCopyText(link, `link-${t.id}`)}
                        className="flex-1 sm:flex-initial px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-xl text-[11px] font-medium transition cursor-pointer text-white/70"
                      >
                        {copiedLink === `link-${t.id}` ? 'Copiado URL!' : 'Copiar Link Api'}
                      </button>
                      <a 
                        href={link}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 sm:flex-initial px-3.5 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1.5 shadow"
                      >
                        Enviar p/ WhatsApp <Share2 className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Integration Instructions Code block */}
        <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-mono font-bold text-white/40 uppercase tracking-wider flex items-center gap-2">
              <Code className="w-4 h-4 text-purple-400" /> Código Código Fonte do Robô Real
            </h3>
            <div className="flex bg-black/40 border border-white/10 p-0.5 rounded-xl">
              <button 
                onClick={() => setActiveInstructionTab('node')}
                className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all ${
                  activeInstructionTab === 'node' ? 'bg-purple-600 text-white' : 'text-white/40 hover:text-white'
                }`}
              >
                Express (Node)
              </button>
              <button 
                onClick={() => setActiveInstructionTab('python')}
                className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all ${
                  activeInstructionTab === 'python' ? 'bg-purple-600 text-white' : 'text-white/40 hover:text-white'
                }`}
              >
                FastAPI (Python)
              </button>
              <button 
                onClick={() => setActiveInstructionTab('webhook')}
                className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all ${
                  activeInstructionTab === 'webhook' ? 'bg-purple-600 text-white' : 'text-white/40 hover:text-white'
                }`}
              >
                Evolution API Setup
              </button>
            </div>
          </div>

          <div className="relative font-mono text-[10.5px] leading-relaxed max-h-[250px] overflow-y-auto bg-black/60 p-4 border border-white/10 rounded-2xl scrollbar-thin scrollbar-thumb-white/10">
            {activeInstructionTab === 'node' && (
              <pre className="text-white/80 whitespace-pre-wrap">{nodeCodeExample}</pre>
            )}
            {activeInstructionTab === 'python' && (
              <pre className="text-white/80 whitespace-pre-wrap">{`# ROBÔ WHATSAPP BOT - PYTHON FASTAPI
# Processador assíncrono de faturas em tempo real

from fastapi import FastAPI, Request
import requests

app = FastAPI()

WHATSAPP_WEBHOOK = "${webhookUrl.replace('/api/webhooks/whatsapp', '/api/gemini/analyze-bill')}"

@app.post("/whatsapp-webhook")
async def receive_message(request: Request):
    payload = await request.json()
    
    # Filtro Evolution API / Baileys
    if payload.get("event") == "messages.upsert":
        msg_data = payload.get("data", {})
        sender = msg_data.get("key", {}).get("remoteJid")
        
        # Se for imagem, acionar endpoint de OCR Inteligente do Finanças IA
        if "imageMessage" in msg_data.get("message", {}):
            base64_img = get_base64_media(msg_data["message"]["imageMessage"])
            
            res = requests.post(WHATSAPP_WEBHOOK, json={
                "imageBase64": f"data:image/png;base64,{base64_img}",
                "mimeType": "image/png"
            })
            
            if res.status_code == 200:
                data = res.json()
                msg = f"✅ *Gasto Gravado por IA:* \\nEstabelecimento: {data['estabelecimento']}\\nValor: R$ {data['valor']}"
                send_text_back(sender, msg)
                
    return {"status": "ok"}`}</pre>
            )}
            {activeInstructionTab === 'webhook' && (
              <pre className="text-white/80 whitespace-pre-wrap">{`=== COMO INSTALAR E INTEGRAR A EVOLUTION API ===

A Evolution API é uma API open-source para WhatsApp (baseada em Baileys).
Ela cria as conexões e encaminha as mensagens recebidas para nosso Webhook.

1. SUBIR A EVOLUTION API VIA DOCKER COPMOSE:
Crie um arquivo 'docker-compose.yml' em seu servidor local ou VPS com este conteúdo:

version: '3'
services:
  evolution-api:
    image: atendare/evolution-api:latest
    container_name: evolution_api
    ports:
      - "8080:8080"
    environment:
      - SERVER_URL=http://localhost:8080
      - ENV=dev
      - AUTHENTICATION_TYPE=apikey
      - AUTHENTICATION_API_KEY=wpp_sec_key_live_da39a3ee5e6b4b0d3255
      - WEBSOCKET_ENABLED=true
    volumes:
      - evolution_instances:/evolution/instances
volumes:
  evolution_instances:

2. COMANDO PARA INICIAR:
$ docker compose up -d

3. CRIAR UMA INSTÂNCIA E CONECTAR O WHATSAPP:
Acesse o painel do Evolution API (ou use Postman para chamar 'POST /instance/create'):
URL: http://localhost:8080/instance/create
Headers: { "apikey": "wpp_sec_key_live_da39a3ee5e6b4b0d3255" }
Body JSON:
{
  "instanceName": "FinancasBot",
  "token": "wpp_sec_key_live_da39a3ee5e6b4b0d3255",
  "qrcode": true
}
Isso retornará um QR code base64 para você escanear com o seu WhatsApp pelo aparelho celular!

4. CONFIGURAR O WEBHOOK NO EVOLUTION API:
Defina o webhook para a instância para encaminhar mensagens do WhatsApp direto ao nosso SaaS.
Você deve chamar o endpoint 'POST /webhook/set/FinancasBot':
Headers: { "apikey": "wpp_sec_key_live_da39a3ee5e6b4b0d3255" }
Body JSON:
{
  "enabled": true,
  "url": "${webhookUrl}",
  "events": ["MESSAGES_UPSERT"]
}

5. PRONTO!
Agora, qualquer mensagem de texto que você enviar do seu número (configurado como '${whatsappNumber}') contendo gastos ex: "Comi hambúrguer R$ 42,90" ou receitas "Recebi Pix de R$ 1500" será interceptada, interpretada pelo Gemini Inteligente em nosso backend, e inserida automaticamente no seu painel financeiro em tempo real!`}</pre>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT AREA: Interactive Live mobile chat simulator */}
      <div className="lg:col-span-5 flex flex-col items-center">
        
        {/* Smartphone Wrapper Layout */}
        <div className="w-full max-w-[340px] border-[5px] border-[#222228] bg-[#0c0c0f] rounded-[36px] shadow-2xl relative flex flex-col h-[560px] overflow-hidden">
          
          {/* Phone Speaker line */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 bg-[#222228] rounded-full z-20 flex items-center justify-center">
            <span className="w-12 h-1 bg-black rounded-full block"></span>
          </div>

          {/* Smartphone Header screen */}
          <div className="bg-[#075e54] pt-8 pb-3.5 px-4 flex items-center justify-between shrink-0 shadow-md">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-teal-800 text-white flex items-center justify-center font-bold text-xs relative">
                🤖
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border border-[#075e54] rounded-full"></span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-white tracking-wide">Finanças IA Bot</h4>
                <p className="text-[9px] text-teal-100 font-normal">Robô Inteligente • Online</p>
              </div>
            </div>
            
            <span className="text-[10px] text-teal-100 font-mono">Simulador</span>
          </div>

          {/* Chat list viewport windows */}
          <div className="flex-1 bg-[#0b141a] p-3 flex flex-col gap-3.5 overflow-y-auto scrollbar-none font-sans text-xs">
            {chatHistory.map((item) => (
              <div 
                key={item.id} 
                className={`max-w-[85%] p-2.5 rounded-2xl flex flex-col gap-1.5 shadow ${
                  item.sender === 'user' 
                    ? 'self-end bg-[#005c4b] text-white rounded-tr-none' 
                    : 'self-start bg-[#202c33] text-white rounded-tl-none'
                }`}
              >
                {item.image && (
                  <img 
                    src={item.image} 
                    alt="Uploaded receipt" 
                    className="w-full max-h-32 object-cover rounded-xl mb-1.5 border border-white/10" 
                  />
                )}
                <p className="text-xs leading-relaxed leading-normal whitespace-pre-wrap">{item.text}</p>
                <span className="text-[9px] font-mono text-white/40 align-bottom self-end text-right">{item.timestamp}</span>
              </div>
            ))}

            {isBotThinking && (
              <div className="self-start bg-[#202c33] text-white p-2.5 rounded-2xl rounded-tl-none max-w-[85%] flex items-center gap-2">
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce delay-100"></span>
                  <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce delay-200"></span>
                  <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce delay-300"></span>
                </span>
                <span className="text-[10px] text-white/50 font-mono">Processando com Gemini Vision...</span>
              </div>
            )}
          </div>

          {/* Simulated prompt message inputs footer */}
          <form onSubmit={handleSendSimulatedMessage} className="bg-[#1f2c34] p-2 flex items-center gap-2 shrink-0">
            <button 
              type="button"
              onClick={triggerFileSelector}
              className="p-2 bg-white/5 hover:bg-white/10 transition rounded-full text-white/50 hover:text-white shrink-0 cursor-pointer"
              title="Upload Cupom"
            >
              <ImageIcon className="w-4 h-4 text-green-400" />
            </button>
            <input 
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {simulatedPhoto ? (
              <div className="flex-1 bg-[#2a3942] rounded-xl px-3 py-1.5 text-xs text-white truncate flex items-center justify-between gap-1">
                <span className="truncate text-[10px] text-green-400">Pronto: {simulatedPhotoName}</span>
                <button type="button" onClick={() => { setSimulatedPhoto(null); setSimulatedPhotoName(''); }} className="text-red-400 text-[10px]">Apagar</button>
              </div>
            ) : (
              <input 
                type="text"
                value={typedMessage}
                onChange={(e) => setTypedMessage(e.target.value)}
                placeholder="Ex: Almoço R$ 45 ou envie imagem"
                className="flex-1 bg-[#2a3942] text-xs text-white placeholder-white/35 rounded-xl px-3.5 py-2 outline-none"
              />
            )}

            <button 
              type="submit"
              className="p-2.5 bg-[#00a884] hover:bg-[#00c298] transition rounded-full text-white shrink-0 shadow-md cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Preset Sandbox Quick Clicks triggers */}
        <div className="mt-4 w-full max-w-[340px] bg-white/[0.02] border border-white/10 rounded-2xl p-4">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-green-400 block mb-2">Ambiente de Testes do Bot:</span>
          <p className="text-[10px] text-white/40 mb-3 leading-relaxed">Clique para disparar um disparo de teste e veja os dados entrando ativamente no sistema:</p>
          <div className="flex flex-col gap-1.5">
            {mockPredefinedPhotos.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleTestPresetSandbox(preset)}
                className="w-full bg-black/40 hover:bg-green-950/20 border border-white/5 hover:border-green-500/20 p-2 rounded-xl text-left text-[11px] font-semibold text-white/90 flex justify-between items-center transition cursor-pointer"
              >
                <span>{preset.icon} {preset.name}</span>
                <ChevronRight className="w-3.5 h-3.5 text-white/30" />
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
