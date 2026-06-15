/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  familyMembers: string[];
  monthlyBudget: number;
  familyName?: string;
  profileType?: 'individual' | 'family';
  profileRegistered?: boolean;
  categoryLimits?: Record<string, number>;
}

export interface Income {
  id: string;
  uid: string;
  valor: number;
  categoria: string; // Salário, Renda Extra, Investimentos, Outros
  data: string; // YYYY-MM-DD
  descricao: string;
  recorrencia: 'Mensal' | 'Avulso' | 'Outro';
  conferido?: boolean;
}

export interface Expense {
  id: string;
  uid: string;
  valor: number;
  categoria: string; // Alimentação, Transporte, Saúde, Educação, Água, Luz, Internet, Streaming, Lazer, Compras, Emergências, Investimentos
  data: string; // YYYY-MM-DD
  formaPagamento: 'Pix' | 'Cartão de Crédito' | 'Boleto' | 'Dinheiro' | 'Outro';
  parcelas: number;
  isRecorrente: boolean;
  comprovanteUrl?: string; // Base64 or local photo
  estabelecimento?: string;
  observacoes?: string;
  conferido?: boolean;
}

export interface FixedBill {
  id: string;
  uid: string;
  tipo: 'Light' | 'SAAE'; // Light = Luz, SAAE = Água
  mesReferencia: string; // YYYY-MM
  valor: number;
  consumo: number; // kWh (Light) ou m³ (SAAE)
  vencimento: string; // YYYY-MM-DD
  pago: boolean;
}

export interface Investment {
  id: string;
  uid: string;
  tipo: 'Renda Fixa' | 'CDB' | 'Tesouro Direto' | 'Ações' | 'Cripto' | 'Fundos Imobiliários';
  nome: string;
  valorAplicado: number;
  dataAplicacao: string; // YYYY-MM-DD
  rendimentoMensalEst: number; // Porcentagem estimada por mês (ex: 0.8 para 0.8%)
}

export interface Goal {
  id: string;
  uid: string;
  titulo: string;
  valorAlvo: number;
  valorPoupado: number;
  prazo: string; // YYYY-MM-DD
  categoria: string;
}

export interface DynamicBoleto {
  id: string;
  beneficiario: string;
  valor: number;
  vencimento: string; // YYYY-MM-DD
  codigoBarras: string;
  categoria: string;
  pago: boolean;
  agendado: boolean;
}

export interface CustomReminder {
  id: string;
  descricao: string;
  valor: number;
  vencimento: string; // YYYY-MM-DD
  recorrencia: 'Anual' | 'Semestral' | 'Mensal' | 'Única';
  avisoPrevioDias: number; // e.g. 3
  categoria: string;
  pago: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  attachment?: {
    name: string;
    type: string;
    dataUrl?: string; // Data URL for rendering previews
  };
}

export interface SystemAlert {
  id: string;
  tipo: 'info' | 'vencimento' | 'limite' | 'aumento' | 'sucesso';
  titulo: string;
  mensagem: string;
  data: string; // YYYY-MM-DD
  lido: boolean;
}

export interface OCRResult {
  valor: number;
  vencimento: string; // YYYY-MM-DD
  estabelecimento: string;
  categoria: string;
  consumo: number; // Para contas de concessionárias (Light/SAAE)
  tipoConta: 'Light' | 'SAAE' | 'Outros';
  descricao: string;
}
