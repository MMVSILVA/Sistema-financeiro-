import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Users, 
  Plus, 
  Trash2, 
  Save, 
  Building, 
  TrendingUp, 
  ShieldCheck, 
  Coins, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { UserProfile } from '../types';

interface ProfileFormProps {
  initialProfile: UserProfile;
  onSave: (updatedProfile: UserProfile) => void;
  isWizardMode?: boolean; // If true, it displays as an elegant full-screen initial registration setup of individual/family profile
  onSkip?: () => void;
}

export default function ProfileForm({ initialProfile, onSave, isWizardMode = false, onSkip }: ProfileFormProps) {
  const [profileType, setProfileType] = useState<'individual' | 'family'>(
    initialProfile.profileType || (initialProfile.familyMembers.length > 1 ? 'family' : 'individual')
  );
  const [displayName, setDisplayName] = useState(initialProfile.displayName || '');
  const [familyName, setFamilyName] = useState(initialProfile.familyName || '');
  const [email, setEmail] = useState(initialProfile.email || 'vinidoctor@gmail.com');
  const [monthlyBudget, setMonthlyBudget] = useState<number>(initialProfile.monthlyBudget || 5000);
  const [newMember, setNewMember] = useState('');
  const [familyMembers, setFamilyMembers] = useState<string[]>(
    initialProfile.familyMembers && initialProfile.familyMembers.length > 0 
      ? initialProfile.familyMembers 
      : ['Você']
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Auto add default member name depending on user display name
  const updateDisplayName = (name: string) => {
    setDisplayName(name);
    if (profileType === 'individual') {
      setFamilyMembers([name || 'Você']);
    } else {
      // If family type and first element is 'Você' or empty, rename it
      if (familyMembers[0] === 'Você' || familyMembers[0] === '') {
        const copy = [...familyMembers];
        copy[0] = name || 'Você';
        setFamilyMembers(copy);
      }
    }
  };

  const handleProfileTypeChange = (type: 'individual' | 'family') => {
    setProfileType(type);
    if (type === 'individual') {
      setFamilyMembers([displayName || 'Você']);
    } else {
      if (familyMembers.length === 1 && familyMembers[0] === 'Você') {
        setFamilyMembers([displayName || 'Você', 'Membro 2']);
      }
    }
  };

  const handleAddMember = () => {
    if (!newMember.trim()) return;
    if (familyMembers.includes(newMember.trim())) {
      setError('Este membro já está cadastrado.');
      return;
    }
    setError(null);
    setFamilyMembers([...familyMembers, newMember.trim()]);
    setNewMember('');
  };

  const handleRemoveMember = (index: number) => {
    if (familyMembers.length <= 1) {
      setError('O perfil deve conter pelo menos 1 integrante.');
      return;
    }
    setError(null);
    const updated = familyMembers.filter((_, idx) => idx !== index);
    setFamilyMembers(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!displayName.trim()) {
      setError('O Nome de Exibição é obrigatório.');
      return;
    }

    if (monthlyBudget <= 0) {
      setError('O orçamento mensal estimado deve ser maior que R$ 0.');
      return;
    }

    const updatedProfile: UserProfile = {
      ...initialProfile,
      displayName: displayName.trim(),
      familyName: familyName.trim() || undefined,
      email: email.trim(),
      monthlyBudget,
      profileType,
      familyMembers: profileType === 'individual' ? [displayName.trim()] : familyMembers.map(m => m.trim()),
      profileRegistered: true
    };

    onSave(updatedProfile);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
    }, 3000);
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Profile Type Selector Cards */}
      <div>
        <label className="text-[10px] uppercase font-mono font-bold text-white/40 block mb-2.5 tracking-wider">
          Tipo de Perfil de Gestão
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            id="select-type-individual"
            onClick={() => handleProfileTypeChange('individual')}
            className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col gap-3 cursor-pointer overflow-hidden ${
              profileType === 'individual'
                ? 'bg-amber-500/10 border-amber-500/40 text-white'
                : 'bg-white/[0.02] border-white/10 text-white/60 hover:border-white/20'
            }`}
          >
            {profileType === 'individual' && (
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-amber-500/15 to-transparent rounded-full blur-xl pointer-events-none"></div>
            )}
            <div className={`p-2 rounded-xl w-9 h-9 flex items-center justify-center shrink-0 ${
              profileType === 'individual' ? 'bg-amber-500/15 text-amber-400' : 'bg-white/5 text-white/40'
            }`}>
              <User className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold leading-none">Perfil Individual</p>
              <p className="text-[10px] text-white/40 mt-1 leading-normal">Foco em orçamentos pessoais e despesas próprias.</p>
            </div>
            {profileType === 'individual' && (
              <span className="absolute top-2 right-2 text-[8px] bg-amber-500 hover:bg-amber-400 text-black px-1.5 py-0.5 rounded font-bold font-mono">ATIVADO</span>
            )}
          </button>

          <button
            type="button"
            id="select-type-family"
            onClick={() => handleProfileTypeChange('family')}
            className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col gap-3 cursor-pointer overflow-hidden ${
              profileType === 'family'
                ? 'bg-purple-600/15 border-purple-500/40 text-white'
                : 'bg-white/[0.02] border-white/10 text-white/60 hover:border-white/20'
            }`}
          >
            {profileType === 'family' && (
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-purple-500/15 to-transparent rounded-full blur-xl pointer-events-none"></div>
            )}
            <div className={`p-2 rounded-xl w-9 h-9 flex items-center justify-center shrink-0 ${
              profileType === 'family' ? 'bg-purple-500/15 text-purple-400' : 'bg-white/5 text-white/40'
            }`}>
              <Users className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold leading-none">Perfil Familiar</p>
              <p className="text-[10px] text-white/40 mt-1 leading-normal">Gestão integrada para casais, famílias e multilares.</p>
            </div>
            {profileType === 'family' && (
              <span className="absolute top-2 right-2 text-[8px] bg-purple-500 text-white px-1.5 py-0.5 rounded font-bold font-mono">ATIVADO</span>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Name input */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="pform-display-name" className="text-[10px] uppercase font-mono font-bold text-white/40 block ml-1 tracking-wider">
            {profileType === 'individual' ? 'Seu Nome de Exibição' : 'Nome do Gestor da Família'}
          </label>
          <input 
            id="pform-display-name"
            type="text"
            required
            placeholder={profileType === 'individual' ? 'Ex: Vini Silva' : 'Ex: Família Silva'}
            value={displayName}
            onChange={(e) => updateDisplayName(e.target.value)}
            className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-amber-500/45 focus:ring-1 focus:ring-amber-500/20 transition-all font-sans"
          />
        </div>

        {/* Family Name input */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="pform-family-name" className="text-[10px] uppercase font-mono font-bold text-white/40 block ml-1 tracking-wider">
            Nome da Família / Caderno
          </label>
          <input 
            id="pform-family-name"
            type="text"
            placeholder="Ex: Caderno de Vini Silva"
            value={familyName}
            onChange={(e) => setFamilyName(e.target.value)}
            className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-amber-500/45 focus:ring-1 focus:ring-amber-500/20 transition-all font-sans"
          />
        </div>

        {/* Email input */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="pform-email" className="text-[10px] uppercase font-mono font-bold text-white/40 block ml-1 tracking-wider">
            Email de Acesso
          </label>
          <input 
            id="pform-email"
            type="email"
            required
            placeholder="Ex: vinidoctor@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-amber-500/45 focus:ring-1 focus:ring-amber-500/20 transition-all font-sans"
          />
        </div>
      </div>

      {/* Budget Limit estimation */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="pform-budget" className="text-[10px] uppercase font-mono font-bold text-white/40 block ml-1 tracking-wider">
          {profileType === 'individual' ? 'Orçamento Mensal Estimado (R$)' : 'Orçamento Familiar Mensal Integrado (R$)'}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40 font-mono text-xs">
            R$
          </div>
          <input 
            id="pform-budget"
            type="number"
            min="1"
            value={monthlyBudget || ''}
            onChange={(e) => setMonthlyBudget(parseFloat(e.target.value) || 0)}
            className="w-full pl-9 pr-4 py-2.5 bg-black/60 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-amber-500/45 focus:ring-1 focus:ring-amber-500/20 transition-all font-mono"
            placeholder="Ex: 5000"
          />
        </div>
        <p className="text-[9px] text-white/30 italic">
          Utilizado para calcular as barras de progresso, alertas do Agente IA e controle de limite de categoria.
        </p>
      </div>

      {/* Family members config (Only if family mode of course!) */}
      {profileType === 'family' && (
        <div className="p-4 rounded-2xl bg-black/30 border border-white/5 flex flex-col gap-3">
          <label className="text-[10px] uppercase font-mono font-bold text-white/40 block tracking-wider">
            Membros que constituem a Família
          </label>
          
          <div className="flex gap-2">
            <input 
              type="text"
              placeholder="Nome do integrante familiar (ex: Maria)"
              value={newMember}
              onChange={(e) => setNewMember(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddMember();
                }
              }}
              className="flex-1 bg-black/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-500/40"
            />
            <button
              type="button"
              onClick={handleAddMember}
              className="p-2 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mt-1">
            {familyMembers.map((member, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-purple-950/20 border border-purple-500/20 text-xs text-purple-200"
              >
                <span>{member}</span>
                <button
                  type="button"
                  title="Remover"
                  onClick={() => handleRemoveMember(idx)}
                  className="p-0.5 hover:bg-red-500/20 rounded text-purple-400 hover:text-red-400 transition"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl flex items-start gap-2 text-xs">
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-xl flex items-center gap-2 text-xs">
          <ShieldCheck className="w-4 h-4" />
          <span>Perfil registrado e atualizado com pleno sucesso!</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-4 pt-2">
        {isWizardMode && onSkip && (
          <button
            type="button"
            onClick={onSkip}
            className="text-xs font-semibold text-white/40 hover:text-white underline"
          >
            Pular e usar valores padrão
          </button>
        )}
        
        <button
          type="submit"
          className="ml-auto px-5 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs tracking-wider uppercase rounded-xl transition duration-200 cursor-pointer shadow-lg active:scale-95 flex items-center gap-2"
        >
          <Save className="w-4 h-4 stroke-[2.5]" />
          <span>{isWizardMode ? 'Finalizar Cadastro' : 'Salvar Alterações'}</span>
        </button>
      </div>
    </form>
  );

  // If we are in initial Wizard setup mode, we display a gorgeous cinematic full-screen module
  if (isWizardMode) {
    return (
      <div id="register-wizard-layout" className="min-h-screen w-full bg-[#050507] text-white flex items-center justify-center p-4 relative overflow-hidden font-sans">
        {/* Background Atmosphere */}
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-purple-900/[0.08] rounded-full blur-[140px] pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-amber-500/[0.05] rounded-full blur-[140px] pointer-events-none"></div>
        
        {/* Grid pattern overlays */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none opacity-20"></div>

        <motion.div
          initial={{ opacity: 0, y: 25, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="w-full max-w-2xl bg-[#0b0a14]/90 border border-white/10 p-8 md:p-10 rounded-3xl relative shadow-[0_32px_80px_-16px_rgba(0,0,0,0.95)] backdrop-blur-2xl z-20"
        >
          {/* Edge Golden Glow */}
          <div className="absolute -inset-px bg-gradient-to-r from-amber-500/25 via-transparent to-purple-500/15 rounded-3xl pointer-events-none opacity-80"></div>

          <div className="flex flex-col gap-1 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[9px] uppercase font-mono tracking-[0.2em] text-amber-500 font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                Cadastro de Perfil
              </span>
              <span className="text-white/30 text-xs">&bull;</span>
              <span className="text-[9px] text-white/55 font-bold uppercase tracking-widest font-mono">Boas-vindas</span>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight">
              Como deseja gerenciar suas finanças?
            </h1>
            <p className="text-xs text-white/50 leading-relaxed max-w-lg">
              Escolha entre o monitoramento <span className="text-amber-400 font-bold">Individual</span> ou agregue sua <span className="text-purple-400 font-bold">Família</span> para sincronizar planejamentos, metas, despesas e relatórios inteligentes.
            </p>
          </div>

          <div className="mt-6 border-t border-white/5 pt-6">
            {formContent}
          </div>
        </motion.div>
      </div>
    );
  }

  // Otherwise, it is rendered as an inline card in Settings tab or a standalone editor panel
  return (
    <div className="bg-[#0b0a14]/60 border border-white/10 rounded-3xl p-6 md:p-8 relative overflow-hidden backdrop-blur-md">
      <div className="absolute -inset-px bg-gradient-to-r from-amber-500/10 via-transparent to-purple-500/5 rounded-3xl pointer-events-none opacity-50"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-500/10 border border-amber-500/25 rounded-xl flex items-center justify-center text-amber-400 shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Editar Perfil Operacional</h3>
              <p className="text-[10px] text-white/40 mt-0.5">Defina as definições estruturais do aplicativo.</p>
            </div>
          </div>
          
          <span className="text-[9px] font-mono tracking-widest uppercase font-bold text-white/30">
            Sincronizado Localmente
          </span>
        </div>

        {formContent}
      </div>
    </div>
  );
}
