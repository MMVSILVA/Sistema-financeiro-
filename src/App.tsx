import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  HelpCircle, 
  FileText, 
  Check, 
  Info, 
  Sparkles, 
  UserPlus, 
  Trash2, 
  Settings as SettingsIcon,
  Bot,
  Zap,
  CheckCircle,
  AlertTriangle,
  Database,
  Download,
  Upload,
  Target,
  Menu,
  Clock,
  Copy
} from 'lucide-react';

// Modular Imports
import Sidebar from './components/Sidebar';
// @ts-expect-error - image asset
import lionIcon from './assets/images/lion_icon_1781116211738.png';
import KPICards from './components/KPICards';
import ConsumoChart from './components/ConsumoChart';
import AISidePanel from './components/AISidePanel';
import OCRScanner from './components/OCRScanner';
import TransactionsTable from './components/TransactionsTable';
import InvestmentSimulator from './components/InvestmentSimulator';
import ReportsBI from './components/ReportsBI';
import GoalsProgress from './components/GoalsProgress';
import WhatsAppAutomation from './components/WhatsAppAutomation';
import RelatorioFiscal from './components/RelatorioFiscal';
import RemindersSection from './components/RemindersSection';
import FinanceAgent from './components/FinanceAgent';
import LoginView from './components/LoginView';
import ProfileForm from './components/ProfileForm';

// Types definition
import { 
  UserProfile, 
  Income, 
  Expense, 
  FixedBill, 
  Investment, 
  Goal, 
  DynamicBoleto,
  ChatMessage, 
  SystemAlert,
  OCRResult,
  CustomReminder
} from './types';

// Expert financial dynamic recommendations by category
const dicasPorCategoria: Record<string, string[]> = {
  'Alimentação': [
    'Substituir apps de delivery por compras semanais planejadas reduz em média 35% as despesas com alimentação.',
    'Adote a prática de levar marmitas preparadas em casa para o trabalho; além de mais saudável, a economia mensal média ultrapassa os R$ 350.',
    'Evite ir ao supermercado com fome e sempre leve uma lista rígida de compras para cortar os impulsos por guloseimas e supérfluos.'
  ],
  'Transporte': [
    'Calcule seu gasto mensal total com aplicativos de transporte — em trajetos curtos abaixo de 2 km, caminhar poupa dinheiro e revigora a saúde.',
    'Agrupar tarefas cotidianas em um único roteiro estratégico de carro poupa combustível e diminui o desgaste natural das peças do veículo.',
    'Considere caronas solidárias de revezamento semanal com colegas de trabalho para abater pela metade seus custos mensais de estacionamento e gasolina.'
  ],
  'Luz': [
    'O modo stand-by de TVs, micro-ondas, modems e carregadores fora de uso soma até R$ 60 silenciosos na fatura no final do ano.',
    'Programar o temporizador (timer) do aparelho de ar-condicionado para desligar de madrugada diminui o consumo total em até 20%.',
    'Substituir lâmpadas eletrônicas velhas por lâmpadas de LED diminui em até 80% o consumo elétrico relativo à iluminação residencial.'
  ],
  'Água': [
    'Reduzir seu banho diário de 15 para apenas 5 minutos poupa até 90 litros de água tratada potável por dia.',
    'Uma única torneira pingando no banheiro escorrega mais de 45 litros d\'água limpa direto para o esgoto por mês. Troque a vedação!',
    'Aproveite a água de reuso do enxágue da máquina de lavar roupas para lavar calçadas, panos de chão ou para descargas em casa.'
  ],
  'Lazer': [
    'Substitua saídas e jantares formais caros de fim de semana por encontros temáticos ou piqueniques em praças ao ar livre com amigos.',
    'Busque eventos culturais alternativos gratuitos ou de ingressos solidários na sua cidade antes de agendar experiências comerciais.',
    'Estipule um "teto budget de entretenimento e lazer" mensal rígido. Se atingir o limite no dia 15, explore hobbies caseiros e livros acumulados.'
  ],
  'Compras': [
    'Utilize portais e plugins de cashback integrados de cupons de descontos para reverter parte dos gastos em vestuário essencial.',
    'Pratique a "regra das 24 horas" antes de fechar o carrinho de compras de vestuário ou eletrônicos na internet. Isso reduz a impulsividade.',
    'Cancele assinaturas mensais de e-commerce e portais de clube de compras que bombardeiam seu e-mail com ofertas supérfluas desnecessárias.'
  ],
  'Outros': [
    'Faça uma auditoria de seguros e tarifas de cartões de crédito anualmente; negociar isenção de anuidade economiza pequenas fortunas com o tempo.',
    'Arredonde seus pagamentos diários via Pix e mova centavos para a sua conta de reserva. A soma mensal desses micro-depósitos surpreende.',
    'Cancele imediatamente qualquer aplicativo ou serviço de streaming por assinatura que você não tenha consumido nos últimos 30 dias.'
  ]
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('saas_is_authenticated') === 'true';
  });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAiOnline, setIsAiOnline] = useState(true);
  const [isAlertDrawerOpen, setIsAlertDrawerOpen] = useState(false);
  const [ocrPreset, setOcrPreset] = useState<OCRResult | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // --- Daily Recurring Reminder State Engagements ---
  const [dailyReminderActive, setDailyReminderActive] = useState<boolean>(() => {
    const cached = localStorage.getItem('daily_reminder_active');
    return cached !== null ? JSON.parse(cached) : true;
  });
  const [dailyReminderTime, setDailyReminderTime] = useState<string>(() => {
    return localStorage.getItem('daily_reminder_time') || '20:00';
  });
  const [lastTriggeredDailyReminder, setLastTriggeredDailyReminder] = useState<string>(() => {
    return localStorage.getItem('last_triggered_daily_reminder') || '';
  });
  const [showDailyReminderToast, setShowDailyReminderToast] = useState(false);
  const [copiedBibleMsg, setCopiedBibleMsg] = useState(false);

  // --- 1. LOCAL PERSISTENT STORAGE ENGINE ---
  const [profile, setProfile] = useState<UserProfile>(() => {
    const cached = localStorage.getItem('saas_profile');
    if (cached) return JSON.parse(cached);
    return {
      uid: 'silva-family-123',
      email: 'vinidoctor@gmail.com',
      displayName: 'Vini Silva',
      familyMembers: ['Vini', 'Sandra (Mãe)', 'Pedro (Filho)'],
      monthlyBudget: 5000,
      profileType: 'family',
      profileRegistered: false
    };
  });

  const [incomes, setIncomes] = useState<Income[]>(() => {
    const cached = localStorage.getItem('saas_incomes_real');
    if (cached) return JSON.parse(cached);
    return [
      {
        id: 'inc-1',
        uid: 'silva-family-123',
        valor: 8400.00,
        categoria: 'Salário',
        data: '2026-06-05',
        descricao: 'Salário Mensal CLT Família',
        recorrencia: 'Mensal'
      }
    ];
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const cached = localStorage.getItem('saas_expenses_real');
    if (cached) return JSON.parse(cached);
    return [
      // June Fixed Expenses (from notebook)
      {
        id: 'exp-fix-1',
        uid: 'silva-family-123',
        valor: 500.00,
        categoria: 'Outros',
        data: '2026-06-05',
        formaPagamento: 'Pix',
        parcelas: 1,
        isRecorrente: true,
        estabelecimento: 'Dízimo 1',
        observacoes: 'Contribuição recorrente'
      },
      {
        id: 'exp-fix-2',
        uid: 'silva-family-123',
        valor: 340.00,
        categoria: 'Outros',
        data: '2026-06-05',
        formaPagamento: 'Pix',
        parcelas: 1,
        isRecorrente: true,
        estabelecimento: 'Dízimo 2',
        observacoes: 'Contribuição recorrente'
      },
      {
        id: 'exp-fix-3',
        uid: 'silva-family-123',
        valor: 737.70,
        categoria: 'Educação',
        data: '2026-06-02',
        formaPagamento: 'Boleto',
        parcelas: 1,
        isRecorrente: true,
        estabelecimento: 'Escola',
        observacoes: 'Mensalidade escolar'
      },
      {
        id: 'exp-fix-4',
        uid: 'silva-family-123',
        valor: 898.00,
        categoria: 'Educação',
        data: '2026-06-05',
        formaPagamento: 'Boleto',
        parcelas: 1,
        isRecorrente: true,
        estabelecimento: 'Faculdade',
        observacoes: 'Mensalidade faculdade'
      },
      {
        id: 'exp-fix-5',
        uid: 'silva-family-123',
        valor: 250.00,
        categoria: 'Outros',
        data: '2026-06-10',
        formaPagamento: 'Pix',
        parcelas: 1,
        isRecorrente: true,
        estabelecimento: 'Sítio',
        observacoes: 'Manutenção sítio'
      },
      {
        id: 'exp-fix-6',
        uid: 'silva-family-123',
        valor: 1509.00,
        categoria: 'Transporte',
        data: '2026-06-05',
        formaPagamento: 'Boleto',
        parcelas: 1,
        isRecorrente: true,
        estabelecimento: 'Carro',
        observacoes: 'Consórcio/Financiamento'
      },
      {
        id: 'exp-fix-7',
        uid: 'silva-family-123',
        valor: 109.89,
        categoria: 'Internet',
        data: '2026-06-08',
        formaPagamento: 'Boleto',
        parcelas: 1,
        isRecorrente: true,
        estabelecimento: 'Internet',
        observacoes: 'Assinatura banda larga'
      },
      {
        id: 'exp-fix-8',
        uid: 'silva-family-123',
        valor: 140.00,
        categoria: 'Internet',
        data: '2026-06-08',
        formaPagamento: 'Boleto',
        parcelas: 1,
        isRecorrente: true,
        estabelecimento: 'Vivo',
        observacoes: 'Telefonia celular / Vivo móvel'
      },
      {
        id: 'exp-fix-9',
        uid: 'silva-family-123',
        valor: 480.00,
        categoria: 'Saúde',
        data: '2026-06-01',
        formaPagamento: 'Pix',
        parcelas: 1,
        isRecorrente: true,
        estabelecimento: 'Personal',
        observacoes: 'Acompanhamento físico'
      },
      {
        id: 'exp-fix-10',
        uid: 'silva-family-123',
        valor: 350.00,
        categoria: 'Transporte',
        data: '2026-06-04',
        formaPagamento: 'Pix',
        parcelas: 1,
        isRecorrente: true,
        estabelecimento: 'Van',
        observacoes: 'Transporte escolar'
      },
      {
        id: 'exp-fix-11',
        uid: 'silva-family-123',
        valor: 1523.00,
        categoria: 'Outros',
        data: '2026-06-05',
        formaPagamento: 'Boleto',
        parcelas: 1,
        isRecorrente: true,
        estabelecimento: 'Empréstimo',
        observacoes: 'Amortização de parcela'
      },
      {
        id: 'exp-fix-12',
        uid: 'silva-family-123',
        valor: 50.00,
        categoria: 'Educação',
        data: '2026-06-15',
        formaPagamento: 'Pix',
        parcelas: 1,
        isRecorrente: true,
        estabelecimento: 'Formatura',
        observacoes: 'Fundo de formatura'
      },
      {
        id: 'exp-fix-13',
        uid: 'silva-family-123',
        valor: 600.00,
        categoria: 'Transporte',
        data: '2026-06-05',
        formaPagamento: 'Dinheiro',
        parcelas: 1,
        isRecorrente: true,
        estabelecimento: 'Combustível',
        observacoes: 'Média de gasto'
      },
      // June Luz (Real)
      {
        id: 'exp-luz-jun',
        uid: 'silva-family-123',
        valor: 373.47,
        categoria: 'Luz',
        data: '2026-06-07',
        formaPagamento: 'Boleto',
        parcelas: 1,
        isRecorrente: true,
        estabelecimento: 'Light',
        observacoes: 'Faturamento real fechado'
      },
      // Cartão Bradesco - Real History
      {
        id: 'exp-cc-jun',
        uid: 'silva-family-123',
        valor: 3327.61,
        categoria: 'Compras',
        data: '2026-06-10',
        formaPagamento: 'Cartão de Crédito',
        parcelas: 1,
        isRecorrente: false,
        estabelecimento: 'Cartão Bradesco',
        observacoes: 'Fatura de Junho'
      },
      {
        id: 'exp-cc-jul',
        uid: 'silva-family-123',
        valor: 1954.12,
        categoria: 'Compras',
        data: '2026-07-10',
        formaPagamento: 'Cartão de Crédito',
        parcelas: 1,
        isRecorrente: false,
        estabelecimento: 'Cartão Bradesco',
        observacoes: 'Projeção/Real fatura Julho'
      },
      {
        id: 'exp-cc-ago',
        uid: 'silva-family-123',
        valor: 1133.21,
        categoria: 'Compras',
        data: '2026-08-10',
        formaPagamento: 'Cartão de Crédito',
        parcelas: 1,
        isRecorrente: false,
        estabelecimento: 'Cartão Bradesco',
        observacoes: 'Projeção fatura Agosto'
      },
      {
        id: 'exp-cc-set',
        uid: 'silva-family-123',
        valor: 1069.04,
        categoria: 'Compras',
        data: '2026-09-10',
        formaPagamento: 'Cartão de Crédito',
        parcelas: 1,
        isRecorrente: false,
        estabelecimento: 'Cartão Bradesco',
        observacoes: 'Projeção fatura Setembro'
      },
      {
        id: 'exp-cc-out',
        uid: 'silva-family-123',
        valor: 655.08,
        categoria: 'Compras',
        data: '2026-10-10',
        formaPagamento: 'Cartão de Crédito',
        parcelas: 1,
        isRecorrente: false,
        estabelecimento: 'Cartão Bradesco',
        observacoes: 'Projeção fatura Outubro'
      },
      {
        id: 'exp-cc-nov',
        uid: 'silva-family-123',
        valor: 305.65,
        categoria: 'Compras',
        data: '2026-11-10',
        formaPagamento: 'Cartão de Crédito',
        parcelas: 1,
        isRecorrente: false,
        estabelecimento: 'Cartão Bradesco',
        observacoes: 'Projeção final de ano'
      },
      {
        id: 'exp-cc-dez',
        uid: 'silva-family-123',
        valor: 305.65,
        categoria: 'Compras',
        data: '2026-12-10',
        formaPagamento: 'Cartão de Crédito',
        parcelas: 1,
        isRecorrente: false,
        estabelecimento: 'Cartão Bradesco',
        observacoes: 'Projeção final de ano'
      }
    ];
  });

  const [investments, setInvestments] = useState<Investment[]>(() => {
    const cached = localStorage.getItem('saas_investments_real');
    if (cached) return JSON.parse(cached);
    return [];
  });

  const [goals, setGoals] = useState<Goal[]>(() => {
    const cached = localStorage.getItem('saas_goals_real');
    if (cached) return JSON.parse(cached);
    return [];
  });

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(() => {
    const cached = localStorage.getItem('saas_chat_history');
    if (cached) return JSON.parse(cached);
    return [];
  });

  // Default values for AI score/diagnostic, syncable via Gemini API
  const [aiScore, setAiScore] = useState(82);
  const [aiDiagnostic, setAiDiagnostic] = useState(
    'Analisando o orçamento familiar real de Vini Silva. Pronta para apoiar seus lançamentos.'
  );

  const [alerts, setAlerts] = useState<SystemAlert[]>(() => {
    const cached = localStorage.getItem('saas_alerts_real');
    if (cached) return JSON.parse(cached);
    return [];
  });

  const [boletos, setBoletos] = useState<DynamicBoleto[]>(() => {
    const cached = localStorage.getItem('saas_boletos_real');
    if (cached) return JSON.parse(cached);
    return [];
  });

  const [reminders, setReminders] = useState<CustomReminder[]>(() => {
    const cached = localStorage.getItem('saas_reminders_real');
    if (cached) return JSON.parse(cached);
    return [];
  });
  // --- Caching updates to LocalStorage ---
  useEffect(() => {
    localStorage.setItem('saas_reminders_real', JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    localStorage.setItem('saas_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('saas_incomes_real', JSON.stringify(incomes));
  }, [incomes]);

  useEffect(() => {
    localStorage.setItem('saas_expenses_real', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('saas_investments_real', JSON.stringify(investments));
  }, [investments]);

  useEffect(() => {
    localStorage.setItem('saas_goals_real', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('saas_chat_history', JSON.stringify(chatHistory));
  }, [chatHistory]);

  useEffect(() => {
    localStorage.setItem('saas_alerts_real', JSON.stringify(alerts));
  }, [alerts]);

   useEffect(() => {
    localStorage.setItem('saas_boletos_real', JSON.stringify(boletos));
  }, [boletos]);

  // --- Daily Reminder Sync and Clock triggers ---
  useEffect(() => {
    localStorage.setItem('daily_reminder_active', JSON.stringify(dailyReminderActive));
  }, [dailyReminderActive]);

  useEffect(() => {
    localStorage.setItem('daily_reminder_time', dailyReminderTime);
  }, [dailyReminderTime]);

  useEffect(() => {
    localStorage.setItem('last_triggered_daily_reminder', lastTriggeredDailyReminder);
  }, [lastTriggeredDailyReminder]);

  useEffect(() => {
    if (!dailyReminderActive) return;

    const checkTimeMatch = () => {
      const now = new Date();
      const currentHourMin = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const todayString = now.toISOString().split('T')[0];

      if (currentHourMin === dailyReminderTime && lastTriggeredDailyReminder !== todayString) {
        setLastTriggeredDailyReminder(todayString);
        triggerDailyFinancialReminder();
      }
    };

    // Run matching on load and then every 15 seconds
    checkTimeMatch();
    const interval = setInterval(checkTimeMatch, 15000);

    return () => clearInterval(interval);
  }, [dailyReminderActive, dailyReminderTime, lastTriggeredDailyReminder]);

  const triggerDailyFinancialReminder = () => {
    // 1. Add System Alert
    const newAlert: SystemAlert = {
      id: `daily-rem-${Date.now()}`,
      tipo: 'info',
      titulo: '⏰ Hora do Controle Financeiro!',
      mensagem: `Este é o seu lembrete recorrente agendado para as ${dailyReminderTime}. Dedique 5 minutos para registrar as transações do dia e manter a saúde financeira em foco!`,
      data: new Date().toISOString().split('T')[0],
      lido: false
    };
    setAlerts(prev => [newAlert, ...prev]);
    
    // 2. Open visual notification toast/modal
    setShowDailyReminderToast(true);
  };

  // Polling loop for real-time WhatsApp Webhook transactions
  useEffect(() => {
    const defaultNumber = '5521999999999';
    const interval = setInterval(async () => {
      try {
        const storedPhone = localStorage.getItem('saas_whatsapp_number') || defaultNumber;
        const res = await fetch(`/api/webhooks/whatsapp/pending?phone=${encodeURIComponent(storedPhone)}`);
        if (!res.ok) return;
        const data = await res.json();
        
        if (data && data.transaction) {
          const tx = data.transaction;
          if (tx.tipo === 'receita') {
            const newInc: Income = {
              id: tx.id,
              uid: profile.uid,
              valor: tx.valor,
              categoria: tx.categoria,
              data: tx.data,
              descricao: tx.estabelecimento,
              recorrencia: 'Avulso'
            };
            setIncomes(prev => [...prev, newInc]);
            
            // Push active alert notifications to the feed
            const newAlert: SystemAlert = {
              id: `alert-wpp-${Date.now()}`,
              tipo: 'sucesso',
              titulo: 'WhatsApp: Receita Recebida',
              mensagem: `Uma receita de R$ ${tx.valor.toFixed(2)} (${tx.estabelecimento}) foi enviada pelo WhatsApp e adicionada ao seu saldo.`,
              data: new Date().toISOString().split('T')[0],
              lido: false
            };
            setAlerts(prev => [newAlert, ...prev]);
          } else {
            const newExp: Expense = {
              id: tx.id,
              uid: profile.uid,
              valor: tx.valor,
              categoria: tx.categoria,
              data: tx.data,
              formaPagamento: tx.formaPagamento,
              parcelas: tx.parcelas,
              isRecorrente: tx.isRecorrente,
              estabelecimento: tx.estabelecimento,
              observacoes: tx.observacoes
            };
            setExpenses(prev => [...prev, newExp]);
            
            // Push active alert notifications to the feed
            const newAlert: SystemAlert = {
              id: `alert-wpp-${Date.now()}`,
              tipo: 'info',
              titulo: 'WhatsApp: Despesa Lançada',
              mensagem: `Uma despesa de R$ ${tx.valor.toFixed(2)} (${tx.estabelecimento}) foi enviada pelo WhatsApp e cadastrada com sucesso.`,
              data: new Date().toISOString().split('T')[0],
              lido: false
            };
            setAlerts(prev => [newAlert, ...prev]);
          }
        }
      } catch (err) {
        console.warn('Erro ao consultar faturamento do bot do WhatsApp:', err);
      }
    }, 4000); // Check every 4 seconds

    return () => clearInterval(interval);
  }, [profile.uid]);

  // --- DICAS DE ECONOMIA & DATA BACKUP ENGINE ---
  const [tipIndex, setTipIndex] = useState(0);

  const getHighestSpendingCategory = () => {
    if (expenses.length === 0) return 'Outros';
    const categoriesSums: Record<string, number> = {};
    expenses.forEach(e => {
      categoriesSums[e.categoria] = (categoriesSums[e.categoria] || 0) + e.valor;
    });
    let highestCategory = 'Outros';
    let highestSum = 0;
    Object.entries(categoriesSums).forEach(([cat, sum]) => {
      if (sum > highestSum) {
        highestSum = sum;
        highestCategory = cat;
      }
    });
    return highestCategory;
  };

  const handleExportJSON = () => {
    const data = {
      profile,
      incomes,
      expenses,
      investments,
      goals
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(data, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `backup_financas_ia_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportCSV = () => {
    let csvContent = "\uFEFFTipo,Categoria,Valor (R$),Data,Estabelecimento/Descricao,Forma de Pagamento (ou Recorrencia),Parcelas,Recorrente\n";
    
    incomes.forEach(inc => {
      csvContent += `Receita,"${inc.categoria}",${inc.valor},${inc.data},"${inc.descricao || ''}","${inc.recorrencia}",1,false\n`;
    });
    
    expenses.forEach(exp => {
      csvContent += `Despesa,"${exp.categoria}",${exp.valor},${exp.data},"${exp.estabelecimento || ''}","${exp.formaPagamento}",${exp.parcelas || 1},${exp.isRecorrente ? 'true' : 'false'}\n`;
    });

    const csvData = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(csvData);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `lancamentos_financeiros_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsedData = JSON.parse(event.target?.result as string);
        if (parsedData.profile) setProfile(parsedData.profile);
        if (parsedData.incomes) setIncomes(parsedData.incomes);
        if (parsedData.expenses) setExpenses(parsedData.expenses);
        if (parsedData.investments) setInvestments(parsedData.investments);
        if (parsedData.goals) setGoals(parsedData.goals);
        alert('Backup financeiro (.JSON) restaurado com absoluto sucesso!');
      } catch (err) {
        alert('Falha ao ler o arquivo de backup. Verifique se o formato JSON é válido.');
      }
    };
    reader.readAsText(file);
  };

  // --- SPENDING LIMITS AND BOLETO SCHEDULERS ---
  const getCategorySuggestions = () => {
    const totalIncomes = incomes.reduce((acc, inc) => acc + inc.valor, 0) || profile.monthlyBudget || 5000;
    
    const standardShares: Record<string, number> = {
      'Alimentação': 0.18, 
      'Transporte': 0.08,  
      'Saúde': 0.06,       
      'Educação': 0.07,    
      'Água': 0.02,        
      'Luz': 0.04,         
      'Internet': 0.03,    
      'Streaming': 0.02,   
      'Lazer': 0.08,       
      'Compras': 0.08,     
      'Emergências': 0.06, 
      'Investimentos': 0.08, 
      'Outros': 0.04       
    };

    const categoryExpenses: Record<string, number> = {};
    expenses.forEach(e => {
      categoryExpenses[e.categoria] = (categoryExpenses[e.categoria] || 0) + e.valor;
    });

    const suggestions: Record<string, number> = {};
    const categories = [
      'Alimentação', 'Transporte', 'Saúde', 'Educação', 'Água', 
      'Luz', 'Internet', 'Streaming', 'Lazer', 'Compras', 
      'Emergências', 'Investimentos', 'Outros'
    ];

    categories.forEach(cat => {
      const shareValue = totalIncomes * (standardShares[cat] || 0.05);
      const actualVal = categoryExpenses[cat] || 0;
      
      let suggestion = 0;
      if (actualVal > 0) {
        suggestion = Math.round(0.6 * actualVal + 0.4 * shareValue);
      } else {
        suggestion = Math.round(shareValue);
      }
      suggestions[cat] = Math.max(suggestion, 50);
    });

    return suggestions;
  };

  const handleUpdateCategoryLimit = (category: string, value: number) => {
    setProfile(prev => ({
      ...prev,
      categoryLimits: {
        ...(prev.categoryLimits || {}),
        [category]: value
      }
    }));
  };

  const handleAcceptAllSuggestions = () => {
    const suggestions = getCategorySuggestions();
    setProfile(prev => ({
      ...prev,
      categoryLimits: suggestions
    }));

    // Trigger alert
    const newAlert: SystemAlert = {
      id: `alert-limits-${Date.now()}`,
      tipo: 'sucesso',
      titulo: 'Metas Sugeridas Aplicadas! 🎯',
      mensagem: 'Todos os limites de gastos mensais sugeridos pela IA foram aplicados com sucesso em seu perfil familiar.',
      data: new Date().toISOString().split('T')[0],
      lido: false
    };
    setAlerts(prevAlerts => [newAlert, ...prevAlerts]);
  };

  const handleAgendarBoletoPix = (boletoId: string) => {
    setBoletos(prev => prev.map(b => {
      if (b.id === boletoId) {
        const updated = { ...b, agendado: true, pago: true };
        
        const newExpense: Expense = {
          id: `exp-bol-${b.id}-${Date.now()}`,
          uid: profile.uid,
          valor: b.valor,
          categoria: b.categoria,
          data: b.vencimento,
          formaPagamento: 'Pix',
          parcelas: 1,
          isRecorrente: false,
          estabelecimento: b.beneficiario,
          observacoes: `Boleto agendado e pago via Pix: ${b.codigoBarras}`
        };
        setExpenses(prevExpenses => [newExpense, ...prevExpenses]);

        const newAlert: SystemAlert = {
          id: `alert-pix-${Date.now()}`,
          tipo: 'sucesso',
          titulo: 'Pix Agendado com Sucesso! ⚡',
          mensagem: `O boleto para "${b.beneficiario}" no valor de R$ ${b.valor.toFixed(2)} foi agendado e liquidado via Pix. Transação registrada em Despesas!`,
          data: new Date().toISOString().split('T')[0],
          lido: false
        };
        setAlerts(prevAlerts => [newAlert, ...prevAlerts]);

        return updated;
      }
      return b;
    }));
  };

  // --- 2. DYNAMIC GEMINI COGNITION ENGINE ---
  const syncDynamicInsights = async () => {
    try {
      const response = await fetch('/api/gemini/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile,
          incomes,
          expenses,
          investments,
          goals
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.score) setAiScore(data.score);
        if (data.diagnostic) setAiDiagnostic(data.diagnostic);
        if (data.alerts && Array.isArray(data.alerts)) {
          // Merge API alerts with existing alerts cleanly
          const formattedAlerts: SystemAlert[] = data.alerts.map((al: any, idx: number) => ({
            id: `api-al-${idx}-${Date.now()}`,
            tipo: al.tipo,
            titulo: al.titulo,
            mensagem: al.mensagem,
            data: '2026-06-07',
            lido: false
          }));
          setAlerts(prev => {
            // Keep unique ones
            const novel = formattedAlerts.filter(na => !prev.some(pa => pa.mensagem === na.mensagem));
            return [...novel, ...prev];
          });
        }
        setIsAiOnline(true);
      } else {
        setIsAiOnline(false);
      }
    } catch (e) {
      console.warn('Vínculo com Gemini API Offline - Operando no modelo de simulação local de insights:', e);
      setIsAiOnline(false);
    }
  };

  // Run on database alterations / transactions updates to re-calculate dashboard metrics
  useEffect(() => {
    syncDynamicInsights();
  }, [incomes, expenses, investments, goals]);

  // Handles chat questions dynamically over backend proxy
  const handleSendChatMessage = async (
    msg: string, 
    currentHistory?: ChatMessage[], 
    fileAttachment?: { name: string, type: string, data: string }
  ): Promise<string> => {
    try {
      const historyToUse = currentHistory || chatHistory;
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...historyToUse, { role: 'user', content: msg }],
          context: {
            profile,
            incomes,
            expenses,
            investments,
            goals
          },
          attachment: fileAttachment ? {
            name: fileAttachment.name,
            mimeType: fileAttachment.type,
            data: fileAttachment.data
          } : undefined
        })
      });

      if (!response.ok) {
        throw new Error('Falha de conexão com a API do Gemini.');
      }

      const data = await response.json();
      return data.reply || 'Desculpe, não consegui consolidar uma resposta no momento.';
    } catch (err: any) {
      console.warn('API Chat error, backing up locally:', err);
      // Premium local rule simulated answers
      if (msg.toLowerCase().includes('economizar')) {
        return `Com base na sua média de despesas, sua conta da **Light** e o gasto com aluguel fixo são os maiores ralos financeiros atuais. Reduzindo o ar-condicionado fora de horário comercial e cortando pequenos supérfluos, você poupa ~R$ 312 complementares que, aplicados a uma taxa Selic de 10.75%, somarão quase **R$ 4.250 em 12 meses**! Que tal estabelecer essa meta no painel?`;
      }
      return `Olá! Estou operando em módulo local simplificado pois a chave GEMINI_API_KEY do servidor não está configurada ou o contêiner não pôde conectar.

Suas receitas somam **R$ 8.400,00** e suas despesas registradas acumulam **R$ 3.120,45**, apresentando saldo livre de **R$ 5.279,55**! Ative a inteligência em tempo real no menu AI Studio secrets para diagnósticos dinâmicos detalhados.`;
    }
  };

  // --- 3. HELPER STATE HANDLERS ---
  const handleAddIncome = (newInc: Omit<Income, 'id' | 'uid'>) => {
    const inc: Income = {
      ...newInc,
      id: `inc-${Date.now()}`,
      uid: profile.uid
    };
    setIncomes(prev => [...prev, inc]);
  };

  const handleAddExpense = (newExp: Omit<Expense, 'id' | 'uid'>) => {
    const exp: Expense = {
      ...newExp,
      id: `exp-${Date.now()}`,
      uid: profile.uid
    };
    setExpenses(prev => [...prev, exp]);
  };

  const handleDeleteIncome = (id: string) => {
    setIncomes(prev => prev.filter(i => i.id !== id));
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const handleToggleIncomeConferido = (id: string) => {
    setIncomes(prev => prev.map(i => i.id === id ? { ...i, conferido: !i.conferido } : i));
  };

  const handleToggleExpenseConferido = (id: string) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, conferido: !e.conferido } : e));
  };

  const handleAddInvestment = (newInv: Omit<Investment, 'id' | 'uid'>) => {
    const inv: Investment = {
      ...newInv,
      id: `inv-${Date.now()}`,
      uid: profile.uid
    };
    setInvestments(prev => [...prev, inv]);
  };

  const handleDeleteInvestment = (id: string) => {
    setInvestments(prev => prev.filter(inv => inv.id !== id));
  };

  const handleAddGoal = (newGoal: Omit<Goal, 'id' | 'uid'>) => {
    const goal: Goal = {
      ...newGoal,
      id: `goal-${Date.now()}`,
      uid: profile.uid
    };
    setGoals(prev => [...prev, goal]);
  };

  const handleUpdateGoalProgress = (id: string, newPoupado: number) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, valorPoupado: newPoupado } : g));
  };

  const handleDeleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const handleAddReminder = (rem: Omit<CustomReminder, 'id'>) => {
    const newRem: CustomReminder = {
      ...rem,
      id: `rem-${Date.now()}`
    };
    setReminders(prev => [...prev, newRem]);
  };

  const handleToggleReminderPaid = (id: string) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, pago: !r.pago } : r));
  };

  const handleDeleteReminder = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  };

  const handleScanComplete = (result: OCRResult) => {
    setOcrPreset(result);
    // Switch over to Transaction tab to let user save
    setActiveTab('transactions');
  };

  // Profile triggers
  const handleUpdateProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    alert('Perfil Familiar atualizado com sucesso!');
  };

  const handleLoginSuccess = (token: string) => {
    localStorage.setItem('saas_is_authenticated', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('saas_is_authenticated');
    setIsAuthenticated(false);
  };

  const handleCopyBibleMsg = () => {
    const textToCopy = "Consagre ao Senhor tudo o que você faz, e os seus planos serão bem-sucedidos. (Provérbios 16:3)";
    navigator.clipboard.writeText(textToCopy);
    setCopiedBibleMsg(true);
    setTimeout(() => {
      setCopiedBibleMsg(false);
    }, 2000);
  };

  const unreadAlertsCount = alerts.filter(a => !a.lido).length;

  const markAllAlertsRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, lido: true })));
  };

  // Helper calculation metrics
  const totalIncomesSum = incomes.reduce((acc, current) => acc + current.valor, 0);
  const totalExpensesSum = expenses.reduce((acc, current) => acc + current.valor, 0);
  const totalFixedSum = expenses.filter(e => e.isRecorrente || e.categoria === 'Luz' || e.categoria === 'Água' || e.categoria === 'Internet').reduce((acc, current) => acc + current.valor, 0);

  if (!isAuthenticated) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  if (!profile.profileRegistered) {
    return (
      <ProfileForm 
        initialProfile={profile} 
        onSave={(updatedProfile) => {
          setProfile(updatedProfile);
        }} 
        isWizardMode={true}
        onSkip={() => {
          setProfile(prev => ({ ...prev, profileRegistered: true }));
        }}
      />
    );
  }

  return (
    <div id="saas-applet-layout" className="w-full h-screen bg-[#050505] text-white font-sans flex overflow-hidden">
      
      {/* Dynamic Left panel layout */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        userEmail={profile.email}
        userName={profile.displayName}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onLogout={handleLogout}
      />

      {/* Main workspace section client */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* UPPER MAIN HEADER */}
        <header className="h-20 border-b border-white/10 px-3 md:px-8 flex items-center justify-between shrink-0 bg-[#080808]">
          <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
            {/* Menu toggle button on mobile */}
            <button 
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 text-amber-500 hover:text-amber-400 transition shrink-0"
              title="Abrir Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="w-9 h-9 md:w-10 md:h-10 bg-amber-500/10 border border-amber-500/35 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/10 shrink-0 overflow-hidden">
              <img 
                src={lionIcon} 
                alt="Logo Leão" 
                className="w-full h-full object-cover rounded-xl"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="truncate">
              <h1 className="text-sm md:text-lg lg:text-xl font-bold font-display tracking-tight flex items-center gap-1 md:gap-2 text-white truncate">
                Finance Control <span className="text-[9px] uppercase font-mono tracking-wider text-amber-400 font-extrabold px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 shrink-0 hidden lg:inline-block">Propósito & Prosperidade</span>
              </h1>
              <p className="text-amber-100/60 text-[9px] md:text-xs italic font-semibold mt-0.5 truncate max-w-[150px] sm:max-w-xs md:max-w-none">
                "Prosperidade e riquezas haverá na sua casa..." — Salmos 112:3
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            
            {/* AI Connectivity status banner */}
            <span className={`hidden sm:flex items-center gap-1.5 md:gap-2 border px-2.5 md:px-3.5 py-1.5 rounded-full text-[10px] md:text-xs font-semibold shrink-0 ${
              isAiOnline 
                ? 'bg-purple-600/10 border-purple-500/25 text-purple-400' 
                : 'bg-yellow-500/10 border-yellow-500/25 text-yellow-500'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isAiOnline ? 'bg-purple-400' : 'bg-yellow-400'} animate-pulse`}></span>
              <span className="hidden lg:inline">{isAiOnline ? 'Gemini IA Conectado' : 'Mapeado Local'}</span>
              <span className="lg:hidden">{isAiOnline ? 'IA Ativa' : 'Local'}</span>
            </span>

            {/* Notification Alert drawer button */}
            <button 
              onClick={() => {
                setIsAlertDrawerOpen(!isAlertDrawerOpen);
                if (!isAlertDrawerOpen) markAllAlertsRead();
              }}
              className="relative p-2 md:p-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 hover:border-white/10 transition-all cursor-pointer shrink-0"
            >
              <Bell className="w-4 h-4 text-white/80" />
              {unreadAlertsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-[9px] text-white font-bold h-4 w-4 rounded-full flex items-center justify-center font-mono">
                  {unreadAlertsCount}
                </span>
              )}
            </button>

            {/* Direct launch trigger */}
            <button 
              onClick={() => {
                setOcrPreset(null);
                setActiveTab('transactions');
              }}
              className="bg-purple-600 hover:bg-purple-500 px-3 md:px-5 py-2 md:py-2.5 rounded-xl text-[10px] md:text-xs font-semibold transition shadow-md hover:scale-[1.01] active:scale-95 shrink-0"
            >
              <span className="hidden md:inline">Novo Lançamento +</span>
              <span className="md:hidden font-black text-sm px-1">+</span>
            </button>
          </div>
        </header>

        {/* DETAILED SCENARIO TABS */}
        <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-6 scrollbar-thin scrollbar-thumb-white/10">
          
          {/* FADE TRANSITION FOR TAB PANELS */}
          {activeTab === 'dashboard' && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              
              {/* MENSAGEM BÍBLICA MOTIVADORA DE BOAS-VINDAS */}
              <div id="welcome-bible-banner" className="relative p-6 md:p-8 rounded-3xl overflow-hidden bg-[#0e0d16] bg-gradient-to-br from-[#0e0d16] via-[#15120f] to-[#0a0910] shadow-[0_12px_44px_-12px_rgba(245,158,11,0.12)] premium-border-shimmer">
                {/* Decorative gold glows */}
                <div className="absolute top-0 right-0 w-[30%] h-[120%] bg-amber-500/[0.04] rounded-full blur-[80px] pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[20%] h-[100%] bg-purple-500/[0.03] rounded-full blur-[80px] pointer-events-none"></div>
                
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                  <div className="flex items-center gap-4 shrink-0">
                    {/* Majestic Lion Emblem badge within Banner */}
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-amber-500/10 border border-amber-500/35 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/10 shrink-0 overflow-hidden">
                      <img 
                        src={lionIcon} 
                        alt="Logo Leão Emblema" 
                        className="w-full h-full object-cover p-1 scale-[1.05]"
                      />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <h2 className="text-lg md:text-xl font-black text-white font-display tracking-tight flex items-center gap-2">
                        Graça e Paz, <span className="text-amber-400 font-extrabold">{profile.displayName || 'Família'}</span>! ✨
                      </h2>
                      <p className="text-xs text-white/50">
                        Seu ecossistema inteligente está plenamente sincronizado.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex-1 max-w-xl md:border-l md:border-white/10 md:pl-6 py-1">
                    <div className="flex gap-3">
                      <span className="text-2xl text-amber-500/70 font-serif select-none">“</span>
                      <div>
                        <blockquote className="text-xs md:text-sm font-medium italic text-amber-100/90 leading-relaxed font-sans mt-1">
                          Consagre ao Senhor tudo o que você faz, e os seus planos serão bem-sucedidos.
                        </blockquote>
                        <span className="flex items-center gap-2 mt-2">
                          <cite className="text-[10px] uppercase font-mono tracking-widest text-amber-500 font-bold block">
                            — Provérbios 16:3
                          </cite>
                          <button
                            id="btn-copy-bible-msg"
                            type="button"
                            onClick={handleCopyBibleMsg}
                            className={`p-1.5 bg-white/5 border border-white/10 hover:border-amber-500/20 rounded-lg transition-all duration-200 cursor-pointer flex items-center gap-1.5 shrink-0 ${
                              copiedBibleMsg ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-amber-500/50 hover:text-amber-400 hover:bg-amber-500/10'
                            }`}
                            title="Copiar mensagem bíblica"
                          >
                            {copiedBibleMsg ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-[8px] font-mono tracking-widest uppercase font-black">Copiado!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-2.5 h-2.5" />
                                <span className="text-[8px] font-mono tracking-widest uppercase">Copiar</span>
                              </>
                            )}
                          </button>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* KPIs indicators list row */}
              <KPICards 
                totalIncomes={totalIncomesSum}
                totalExpenses={totalExpensesSum}
                totalFixed={totalFixedSum}
                monthlyBudget={profile.monthlyBudget}
              />



              {/* Daily Financial Tip Section */}
              {(() => {
                const highestCat = getHighestSpendingCategory();
                const categoryTips = dicasPorCategoria[highestCat] || dicasPorCategoria['Outros'];
                const activeTip = categoryTips[tipIndex % categoryTips.length];
                
                return (
                  <div className="bg-gradient-to-r from-[#17143a]/70 to-[#0b0c16]/90 border border-purple-500/25 p-5 rounded-3xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>
                    
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/25 rounded-2xl flex items-center justify-center text-purple-400 shrink-0 shadow-inner">
                        <Sparkles className="w-6 h-6 animate-pulse" />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className="text-[10px] tracking-wider font-mono font-black uppercase text-purple-400 bg-purple-500/15 border border-purple-500/20 px-2.5 py-0.5 rounded-full">
                            Dica Diária de Economia
                          </span>
                          <span className="text-[11px] text-white/55">
                            Foco inteligente baseado no seu principal dreno financeiro: <strong className="text-white bg-white/5 border border-white/5 px-2 py-0.5 rounded-md">{highestCat}</strong>
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm font-medium text-white/90 leading-relaxed font-sans mt-2">
                          "{activeTip}"
                        </p>
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => setTipIndex(prev => prev + 1)}
                      className="px-4 py-2.5 bg-purple-600/15 hover:bg-purple-600/25 border border-purple-500/20 hover:border-purple-500/35 text-purple-300 text-xs font-bold rounded-xl flex items-center gap-2 shrink-0 transition-all cursor-pointer self-start md:self-center"
                    >
                      🔄 Nova Sugestão
                    </button>
                  </div>
                );
              })()}

              {/* SISTEMA DE LEMBRETES DIÁRIOS RECORRENTES */}
              <div className="bg-[#0b0a14]/60 border border-amber-500/15 p-5 rounded-3xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/[0.02] rounded-full blur-3xl pointer-events-none"></div>
                
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-all ${
                    dailyReminderActive 
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
                      : 'bg-white/5 border-white/5 text-white/30'
                  }`}>
                    <Clock className={`w-5 h-5 ${dailyReminderActive ? 'animate-pulse' : ''}`} />
                  </div>
                  
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-[10px] tracking-wider font-mono font-black uppercase text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                        Lembrete Diário Recorrente
                      </span>
                      <span className={`text-[9px] font-mono tracking-wider uppercase font-bold px-1.5 py-0.5 rounded ${
                        dailyReminderActive 
                          ? 'bg-green-500/15 border border-green-500/20 text-green-400' 
                          : 'bg-white/5 border-white/5 text-white/35'
                      }`}>
                        {dailyReminderActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white font-display">Alerta de Fechamento Diário</h4>
                    <p className="text-xs text-amber-100/60 mt-0.5 max-w-xl">
                      Configure um horário específico para receber um lembrete visual de fechamento financeiro, facilitando o registro consistente de faturas e dízimos familiares.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 bg-white/[0.02] border border-white/5 p-3 rounded-2xl md:self-center">
                  {/* Switch Active Status */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-white/40 font-bold">Estado:</span>
                    <button
                      onClick={() => setDailyReminderActive(!dailyReminderActive)}
                      className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                        dailyReminderActive ? 'bg-amber-500' : 'bg-white/10'
                      }`}
                      title={dailyReminderActive ? "Desativar" : "Ativar"}
                    >
                      <div className={`bg-black w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                        dailyReminderActive ? 'translate-x-4' : 'translate-x-0'
                      }`}></div>
                    </button>
                  </div>

                  {/* Time Input */}
                  <div className="flex items-center gap-1.5 border-l border-white/10 pl-3">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-white/40 font-bold">Hora:</span>
                    <input 
                      type="time" 
                      value={dailyReminderTime}
                      disabled={!dailyReminderActive}
                      onChange={(e) => setDailyReminderTime(e.target.value)}
                      className="bg-[#121214] border border-white/15 rounded-lg px-2 py-1 text-xs text-white text-center outline-none focus:border-amber-500/40 disabled:opacity-30 font-mono w-[115px] transition focus:ring-1 focus:ring-amber-500/25 cursor-pointer"
                      style={{ colorScheme: 'dark' }}
                    />
                  </div>

                  {/* Manual trigger for prompt check */}
                  <button
                    onClick={() => triggerDailyFinancialReminder()}
                    className="px-2.5 py-1 bg-amber-500/15 hover:bg-amber-500/35 border border-amber-500/30 text-amber-400 text-[10px] font-mono font-bold rounded-lg transition-all cursor-pointer"
                  >
                    ⚡ Simular Lembrete
                  </button>
                </div>
              </div>

              {/* Central Section Map: Consumo visualizers and IA helper */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Visual metric water/electricity charts */}
                <div className="lg:col-span-2">
                  <ConsumoChart fixedBills={[]} />
                </div>

                {/* AI Insights and interactive text advisor */}
                <div className="lg:col-span-1">
                  <AISidePanel 
                    score={aiScore}
                    diagnostic={aiDiagnostic}
                    alerts={alerts}
                    onSendMessage={handleSendChatMessage}
                    chatHistory={chatHistory}
                    setChatHistory={setChatHistory}
                  />
                </div>
              </div>

              {/* Bottom ledger helper: OCR quick portal and brief table of transactions */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                <div className="lg:col-span-1">
                  <OCRScanner onScanComplete={handleScanComplete} />
                </div>

                {/* Dynamic mini table */}
                <div className="lg:col-span-2 bg-white/[0.02] border border-white/10 p-5 rounded-3xl flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-3.5">Painel de Lançamentos Recentes</h3>
                    <div className="flex flex-col gap-2.5 max-h-[160px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/5">
                      {expenses.slice(0, 3).map((exp) => (
                        <div key={exp.id} className="flex items-center justify-between border-b border-white/5 pb-2.5 transition hover:bg-white/[0.01] p-1.5 rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="text-xs shrink-0 w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center font-bold">
                              R$
                            </span>
                            <div>
                              <p className="text-xs font-semibold text-white">{exp.estabelecimento || exp.categoria}</p>
                              <span className="text-[9px] text-white/40 font-mono block mt-0.5">{exp.data} • {exp.categoria} ({exp.formaPagamento})</span>
                            </div>
                          </div>
                          <span className="text-xs font-bold font-mono text-red-400">- R$ {exp.valor.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center border-t border-white/5 pt-3.5 mt-2">
                    <span className="text-[10px] text-white/35 font-mono">Gasto familiar monitorado real</span>
                    <button 
                      onClick={() => setActiveTab('transactions')}
                      className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 transition"
                    >
                      Acessar livro completo →
                    </button>
                  </div>
                </div>
              </div>

              {/* Reminders Management Section */}
              <RemindersSection 
                reminders={reminders}
                onAddReminder={handleAddReminder}
                onToggleReminderPaid={handleToggleReminderPaid}
                onDeleteReminder={handleDeleteReminder}
              />
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="animate-fadeIn">
              <TransactionsTable 
                incomes={incomes}
                expenses={expenses}
                onAddIncome={handleAddIncome}
                onAddExpense={handleAddExpense}
                onDeleteIncome={handleDeleteIncome}
                onDeleteExpense={handleDeleteExpense}
                ocrPreset={ocrPreset}
                clearOcrPreset={() => setOcrPreset(null)}
                onToggleIncomeConferido={handleToggleIncomeConferido}
                onToggleExpenseConferido={handleToggleExpenseConferido}
              />
            </div>
          )}

          {activeTab === 'agent' && (
            <div className="animate-fadeIn">
              <FinanceAgent
                incomes={incomes}
                expenses={expenses}
                profile={profile}
                onSendMessage={handleSendChatMessage}
                chatHistory={chatHistory}
                setChatHistory={setChatHistory}
                score={aiScore}
                diagnostic={aiDiagnostic}
                alerts={alerts}
                setAlerts={setAlerts}
              />
            </div>
          )}

          {activeTab === 'investments' && (
            <div className="animate-fadeIn">
              <InvestmentSimulator 
                investments={investments}
                onAddInvestment={handleAddInvestment}
                onDeleteInvestment={handleDeleteInvestment}
              />
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="animate-fadeIn">
              <ReportsBI 
                incomes={incomes}
                expenses={expenses}
                investments={investments}
              />
            </div>
          )}

          {activeTab === 'goals' && (
            <div className="animate-fadeIn">
              <GoalsProgress 
                goals={goals}
                onAddGoal={handleAddGoal}
                onUpdateGoalProgress={handleUpdateGoalProgress}
                onDeleteGoal={handleDeleteGoal}
              />
            </div>
          )}

          {activeTab === 'fiscal' && (
            <div className="animate-fadeIn">
              <RelatorioFiscal 
                incomes={incomes}
                expenses={expenses}
                investments={investments}
              />
            </div>
          )}

          {activeTab === 'whatsapp' && (
            <div className="animate-fadeIn">
              <WhatsAppAutomation 
                onAddExpense={handleAddExpense}
                onAddIncome={handleAddIncome}
                expenses={expenses}
                incomes={incomes}
              />
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Profile setup card */}
                <div className="md:col-span-2">
                  <ProfileForm 
                    initialProfile={profile}
                    onSave={(updatedProfile) => {
                      setProfile(updatedProfile);
                    }}
                  />
                </div>

                {/* Developer Secrets configuration helper */}
                <div className="md:col-span-1 bg-[#0c0820]/45 border border-purple-500/20 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="p-1 px-2.5 bg-purple-600/10 text-purple-400 border border-purple-500/10 text-[10px] font-mono font-bold rounded-full">CREDENCIAIS</span>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-white">Instruções de Configuração AI</h4>
                    </div>
                    <p className="text-xs text-white/70 leading-relaxed mb-4">
                      Para conectar o sistema de forma resiliente ao cérebro inteligente do <strong className="text-purple-400">Google Gemini</strong> e permitir o OCR de alta fidelidade e assessoria em tempo real, você deve fornecer sua própria chave de API nas configurações do ambiente.
                    </p>

                    <div className="bg-black/60 border border-white/10 p-4 rounded-2xl flex flex-col gap-2 font-mono text-[11px] text-white/80 leading-relaxed">
                      <p className="text-purple-400 font-bold mb-1">// Como configurar sua Chave de API:</p>
                      <p>1. Vá no canto superior do painel AI Studio e abra as configurações.</p>
                      <p>2. Adicione uma nova variável secreta com o nome exato:</p>
                      <p className="bg-white/5 p-1.5 rounded inline-block font-bold">GEMINI_API_KEY</p>
                      <p>3. Insira sua chave obtida gratuitamente no site de desenvolvedores do Google.</p>
                    </div>
                  </div>

                  <div className="mt-4 bg-purple-950/20 border border-purple-500/10 p-3 rounded-2xl flex items-start gap-2.5 text-[10px] text-white/50 leading-relaxed">
                    <Info className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>Em conformidade com nossos protocolos rígidos de segurança, as chaves nunca são expostas ao navegador. Todas as requisições passam pela segurança do nosso proxy reverso Express em containers.</span>
                  </div>
                </div>

              </div>

              {/* CATEGORY SPENDING LIMITS CARD */}
              <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 flex flex-col gap-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-600/10 border border-purple-500/25 text-purple-400 rounded-2xl flex items-center justify-center shrink-0">
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-wider text-white">✨ Limites Planejados por Categoria</h4>
                      <p className="text-xs text-white/45">Defina quanto sua família planeja gastar por mês por setor ou clique no botão para usar as sugestões automáticas baseadas em inteligência artificial.</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAcceptAllSuggestions}
                    className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition duration-200 cursor-pointer shadow-lg active:scale-95 shrink-0"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Sugestões Automatizadas IA</span>
                  </button>
                </div>

                {/* Sub-legend sums and budget status */}
                {(() => {
                  const suggestions = getCategorySuggestions();
                  const categories = Object.keys(suggestions);
                  const totalSuggested = categories.reduce((sum, cat) => sum + suggestions[cat], 0);
                  const totalCurrentLimits = categories.reduce((sum, cat) => sum + (profile.categoryLimits?.[cat] || suggestions[cat]), 0);
                  const totalIncomesValue = incomes.reduce((sum, inc) => sum + inc.valor, 0) || profile.monthlyBudget || 5000;
                  const ratio = (totalCurrentLimits / totalIncomesValue) * 100;

                  return (
                    <div className="bg-black/40 border border-white/5 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs font-mono">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] uppercase text-white/40 font-bold tracking-widest">Resumo do Planejamento</span>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span className="text-white">Orçamento Planejado: <strong className="text-purple-400">R$ {totalCurrentLimits.toFixed(2)}</strong></span>
                          <span className="text-white/40">|</span>
                          <span className="text-white/60">Sugestão Total IA: <strong>R$ {totalSuggested.toFixed(2)}</strong></span>
                          <span className="text-white/40">|</span>
                          <span className="text-white/60">Renda Total: <strong className="text-green-400">R$ {totalIncomesValue.toFixed(2)}</strong></span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0 w-full sm:w-auto">
                        <div className="flex justify-between w-full sm:w-auto gap-3 text-[10px] text-white/50">
                          <span>Percentual Comprometido:</span>
                          <span className={`${ratio > 100 ? 'text-red-400 font-bold' : 'text-purple-400'}`}>{ratio.toFixed(1)}%</span>
                        </div>
                        <div className="w-full sm:w-48 bg-white/5 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-300 ${ratio > 100 ? 'bg-red-500' : ratio > 80 ? 'bg-amber-500' : 'bg-purple-600'}`}
                            style={{ width: `${Math.min(ratio, 100)}%` }}
                          ></div>
                        </div>
                        {ratio > 100 && (
                          <span className="text-[9px] text-red-400 font-sans mt-1">⚠️ Cuidado: O total de limites por categoria supera sua renda total!</span>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Sub category parameters editor list */}
                {(() => {
                  const suggestions = getCategorySuggestions();
                  const categories = Object.keys(suggestions);

                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {categories.map(cat => {
                        const suggestedVal = suggestions[cat];
                        const currentVal = profile.categoryLimits?.[cat] || suggestedVal;

                        return (
                          <div 
                            key={cat} 
                            className="bg-black/35 border border-white/5 hover:border-white/10 rounded-2xl p-4 flex flex-col justify-between gap-3 transition"
                          >
                            <div>
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-white tracking-wide">{cat}</span>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateCategoryLimit(cat, suggestedVal)}
                                  className="text-[9px] text-purple-400 font-semibold hover:text-purple-300 flex items-center gap-1 bg-purple-600/10 hover:bg-purple-600/25 px-2 py-0.5 rounded border border-purple-500/10 cursor-pointer"
                                  title="Clique para aceitar a recomendação IA para este setor"
                                >
                                  Usar IA (R$ {suggestedVal})
                                </button>
                              </div>

                              <div className="flex justify-between items-end mt-2 text-[10px] font-mono text-white/55">
                                <span>IA sugere: R$ {suggestedVal}</span>
                                <span className="text-sm font-bold text-white">R$ {currentVal}</span>
                              </div>
                            </div>

                            {/* Range slider for intuitive adjusts */}
                            <div className="flex items-center gap-3">
                              <input 
                                type="range" 
                                min={50} 
                                max={5000} 
                                step={50}
                                value={currentVal}
                                onChange={(e) => handleUpdateCategoryLimit(cat, parseInt(e.target.value) || 50)}
                                className="flex-1 accent-purple-500 h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              {/* Security Backups Card */}
              <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-600/10 border border-purple-500/25 text-purple-400 rounded-2xl flex items-center justify-center shrink-0">
                      <Database className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-wider text-white">Backups de Segurança & Exportação Geral</h4>
                      <p className="text-xs text-white/45 font-sans leading-normal">Exporte seu histórico financeiro completo em formato universal de planilhas (CSV) ou JSON de recuperação.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="px-4 py-2.5 bg-purple-600/15 hover:bg-purple-600/25 border border-purple-500/20 hover:border-purple-500/35 text-purple-300 text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer transition-all">
                      <Upload className="w-4 h-4" />
                      Restaurar JSON
                      <input 
                        type="file" 
                        accept=".json" 
                        onChange={handleImportJSON} 
                        className="hidden" 
                      />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                  <button
                    type="button"
                    onClick={handleExportJSON}
                    className="p-4 bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 hover:border-white/15 rounded-2xl flex items-center gap-3.5 transition group cursor-pointer text-left"
                  >
                    <div className="w-9 h-9 bg-purple-600/5 group-hover:bg-purple-600/15 text-purple-400 rounded-lg flex items-center justify-center shrink-0 transition">
                      <Download className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">Exportar Backup Completo (JSON)</h5>
                      <p className="text-[10px] text-white/50 mt-0.5 font-sans font-normal leading-normal">Salva perfil, receitas, despesas, ativos e metas em arquivo estruturado.</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportCSV}
                    className="p-4 bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 hover:border-white/15 rounded-2xl flex items-center gap-3.5 transition group cursor-pointer text-left"
                  >
                    <div className="w-9 h-9 bg-green-500/5 group-hover:bg-green-500/15 text-green-400 rounded-lg flex items-center justify-center shrink-0 transition">
                      <Download className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-white group-hover:text-green-300 transition-colors">Exportar Livro Dinâmico (CSV)</h5>
                      <p className="text-[10px] text-white/50 mt-0.5 font-sans font-normal leading-normal">Planilha universal contendo lançamentos de receitas e despesas formatados.</p>
                    </div>
                  </button>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* ALERT DRAWER SIDE MODAL */}
        {isAlertDrawerOpen && (
          <div className="absolute inset-y-0 right-0 w-80 bg-[#0d0d12] border-l border-white/10 shadow-2xl p-6 flex flex-col gap-4 z-40 animate-slideLeft">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-white/60">Notificações</h3>
              <button 
                onClick={() => setIsAlertDrawerOpen(false)}
                className="text-xs text-white/40 hover:text-white"
              >
                Fechar
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto flex flex-col gap-2.5">
              {alerts.map((al) => (
                <div 
                  key={al.id} 
                  className={`p-3 rounded-xl border relative ${
                    !al.lido ? 'bg-purple-600/5 border-purple-500/20' : 'bg-transparent border-white/5 opacity-60'
                  }`}
                >
                  {!al.lido && <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-purple-500 rounded-full"></span>}
                  <h4 className="text-[11px] font-bold text-white mb-1.5">{al.titulo}</h4>
                  <p className="text-[10px] text-white/70 leading-relaxed">{al.mensagem}</p>
                </div>
              ))}
            </div>

            <button 
              onClick={() => setIsAlertDrawerOpen(false)}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-semibold py-2 rounded-xl transition"
            >
              Concluído
            </button>
          </div>
        )}

        {/* FLOATING DAILY REMINDER NOTIFICATION TOAST OVERLAY */}
        {showDailyReminderToast && (
          <div className="fixed bottom-6 right-6 z-[100] animate-slideUp max-w-sm w-full bg-[#141224]/95 border border-amber-500/40 p-5 rounded-2xl shadow-2xl shadow-black/80 backdrop-blur-md">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-xl flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 animate-pulse" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-display flex items-center gap-1.5">
                  ⏰ Lembrete de Controle Diário
                </h4>
                <p className="text-xs text-white/70 mt-1 leading-relaxed">
                  Olá! Chegou o seu horário selecionado ({dailyReminderTime}) para reconciliar faturas e atualizar seus lançamentos de dízimos e contas familiares. Cultive a consistência financeira!
                </p>
                <div className="flex items-center gap-2 mt-3.5">
                  <button
                    onClick={() => {
                      setActiveTab('transactions');
                      setShowDailyReminderToast(false);
                    }}
                    className="px-3 py-1.5 bg-amber-500 text-black text-[10px] font-bold rounded-lg hover:bg-amber-400 transition cursor-pointer"
                  >
                    Lançar Agora
                  </button>
                  <button
                    onClick={() => setShowDailyReminderToast(false)}
                    className="px-3 py-1.5 bg-white/5 border border-white/5 text-white/55 hover:text-white text-[10px] font-bold rounded-lg transition cursor-pointer"
                  >
                    Dispensar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
