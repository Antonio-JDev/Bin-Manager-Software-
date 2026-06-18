import React, { useState, useEffect } from "react";
import { CostSettings } from "../types";
import { User } from "firebase/auth";
import { 
  Building2, 
  UserCircle2, 
  DollarSign, 
  Percent, 
  Truck, 
  Save, 
  CheckCircle2, 
  HelpCircle,
  Settings,
  Shield,
  Layers,
  Sparkles
} from "lucide-react";

interface ConfiguracoesTabProps {
  settings: CostSettings;
  onUpdateSettings: (settings: CostSettings) => void;
  user: User | null;
  isDemo: boolean;
}

export default function ConfiguracoesTab({
  settings,
  onUpdateSettings,
  user,
  isDemo
}: ConfiguracoesTabProps) {
  const [companyName, setCompanyName] = useState(settings.companyName || "Minha Empresa");
  const [userName, setUserName] = useState(settings.userName || "");
  const [taxRate, setTaxRate] = useState(settings.taxRate);
  const [shippingCostUnit, setShippingCostUnit] = useState(settings.shippingCostUnit);
  const [otherFeesUnit, setOtherFeesUnit] = useState(settings.otherFeesUnit);
  const [platformFeeRate, setPlatformFeeRate] = useState(settings.platformFeeRate);

  const [saved, setSaved] = useState(false);

  // Sync with prop changes: especially useful when Google Login pre-fills userName
  useEffect(() => {
    if (settings.companyName) setCompanyName(settings.companyName);
    if (settings.userName) setUserName(settings.userName);
    setTaxRate(settings.taxRate);
    setShippingCostUnit(settings.shippingCostUnit);
    setOtherFeesUnit(settings.otherFeesUnit);
    setPlatformFeeRate(settings.platformFeeRate);
  }, [settings]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      companyName,
      userName,
      taxRate: Number(taxRate) || 0,
      shippingCostUnit: Number(shippingCostUnit) || 0,
      otherFeesUnit: Number(otherFeesUnit) || 0,
      platformFeeRate: Number(platformFeeRate) || 0
    });

    setSaved(true);
    setTimeout(() => {
      setSaved(false);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* CARD DE CABEÇALHO */}
      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-950 dark:text-white flex items-center gap-2">
            <Settings className="text-indigo-600 dark:text-indigo-400" size={20} />
            Configurações do Sistema
          </h2>
          <p className="text-xs text-slate-455 dark:text-slate-450 mt-1 leading-relaxed">
            Personalize a identidade da sua empresa, configure taxas operacionais padrões e gerencie o perfil de usuário.
          </p>
        </div>
        
        {/* Badge Sincronização */}
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 px-3.5 py-2 rounded-xl self-start md:self-auto">
          {isDemo ? (
            <>
              <Layers size={14} className="text-amber-500 animate-pulse" />
              <div>
                <span className="text-[10px] text-amber-550 dark:text-amber-400 uppercase tracking-widest font-black block leading-none">Sandbox Local</span>
                <span className="text-[9px] text-slate-400 dark:text-slate-500">Dados salvos no navegador</span>
              </div>
            </>
          ) : (
            <>
              <Shield size={14} className="text-emerald-500" />
              <div>
                <span className="text-[10px] text-emerald-650 dark:text-emerald-400 uppercase tracking-widest font-black block leading-none">Firebase Nuvem</span>
                <span className="text-[9px] text-slate-400 dark:text-slate-500">Sincronização em tempo real ativa</span>
              </div>
            </>
          )}
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUNA 1: IDENTIDADE E PERFIL (2 COLS SPAN ON LG) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* CARD: PERFIL COMERCIAL (NOME DA EMPRESA E USUÁRIO) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
            <div className="border-b border-slate-150 dark:border-slate-800 px-6 py-4 flex items-center gap-2 bg-slate-50/50 dark:bg-slate-800/20">
              <Building2 className="text-indigo-600 dark:text-indigo-400 animate-pulse" size={16} />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">Perfil & Identidade Comercial</h3>
            </div>
            
            <div className="p-6 space-y-5">
              {/* Campo: Nome da Empresa */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Nome da sua Empresa / Negócio
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Building2 size={16} />
                  </div>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Ex: Minha Loja E-Commerce"
                    className="block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-2.5 pl-10 pr-4 text-xs font-bold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">
                  Este nome será exibido nos relatórios de balanço, exportações de planilhas e no topo dos PDF impressos.
                </p>
              </div>

              {/* Campo: Nome do Usuário */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Nome do Operador (Usuário)
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <UserCircle2 size={16} />
                  </div>
                  <input
                    type="text"
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Seu Nome completo para assinatura"
                    className="block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-2.5 pl-10 pr-4 text-xs font-bold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
                
                {/* Indicador de Auto-preenchimento Google */}
                {user && (
                  <div className="mt-2 flex items-center gap-1.5 text-[10px] text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50/50 dark:bg-indigo-950/20 px-2.5 py-1 rounded-lg w-fit">
                    <Sparkles size={11} />
                    <span>Vinculado automaticamente ao Google Login ({user.displayName})</span>
                  </div>
                )}
                <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">
                  O nome será preenchido automaticamente com seu login do Google, mas você pode personalizá-lo livremente caso queira assinar relatórios de outra forma.
                </p>
              </div>
            </div>
          </div>

          {/* CARD DE CONTA DO GOOGLE (QUANDO LOGADO OU DESLOGADO) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl shadow-xs p-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-900/30">
            <div className="flex items-center space-x-3.5">
              {user ? (
                <>
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || "Avatar"}
                      className="w-12 h-12 rounded-full border-2 border-indigo-500 shadow-md"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-md text-white font-bold shadow-md">
                      {user.displayName?.charAt(0) || "U"}
                    </div>
                  )}
                  <div>
                    <h4 className="text-xs font-black text-slate-850 dark:text-slate-100 uppercase tracking-wider">Conta Conectada</h4>
                    <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">{user.displayName || "Usuário"}</p>
                    <p className="text-[10px] text-slate-400">{user.email}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                    <UserCircle2 size={24} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Modo Desconectado</h4>
                    <p className="text-[10px] text-slate-450 dark:text-slate-450 leading-relaxed mt-0.5">Seus dados e relatórios estão salvos temporariamente apenas neste computador.</p>
                  </div>
                </>
              )}
            </div>
          </div>

        </div>

        {/* COLUNA 2: TAXAS OPERACIONAIS PADRÃO (1 COL SPAN ON LG) */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
            <div className="border-b border-slate-150 dark:border-slate-800 px-6 py-4 flex items-center gap-2 bg-slate-50/50 dark:bg-slate-800/20">
              <DollarSign className="text-indigo-600 dark:text-indigo-400" size={16} />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">Custos Padrão (Sugestão)</h3>
            </div>

            <div className="p-6 space-y-4">
              
              {/* Imposto Padrão */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1 flex items-center justify-between">
                  <span>Imposto sobre Venda</span>
                  <HelpCircle size={10} title="Sugerido automaticamente na aba de Previsão de lucros" className="cursor-help" />
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Percent size={13} />
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={taxRate}
                    onChange={(e) => setTaxRate(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-105 py-2 pl-9 pr-3 text-xs font-mono font-bold text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Comissão de Marketplace */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1 flex items-center justify-between">
                  <span>Plataforma / E-commerce (%)</span>
                  <HelpCircle size={10} title="Taxa ou comissão padrão cobrada pelo canal de venda" className="cursor-help" />
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Percent size={13} />
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={platformFeeRate}
                    onChange={(e) => setPlatformFeeRate(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-105 py-2 pl-9 pr-3 text-xs font-mono font-bold text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Custo de Frete por Unidade */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1 flex items-center justify-between">
                  <span>Frete Unitário (R$)</span>
                  <HelpCircle size={10} title="Custo de envio individual distribuído por item" className="cursor-help" />
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-450">
                    <Truck size={13} />
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={shippingCostUnit}
                    onChange={(e) => setShippingCostUnit(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-105 py-2 pl-9 pr-3 text-xs font-mono font-bold text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Outras Despesas Unitárias */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1 flex items-center justify-between">
                  <span>Outras taxas unitárias (R$)</span>
                  <HelpCircle size={10} title="Embalagem, tags, brindes ou custos diretos fixos extras" className="cursor-help" />
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-450 border-r-0">
                    <span className="text-xs font-mono font-bold">$</span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={otherFeesUnit}
                    onChange={(e) => setOtherFeesUnit(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-105 py-2 pl-9 pr-3 text-xs font-mono font-bold text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* BOTÃO DE CONFIRMAÇÃO SALVAR */}
          <div className="bg-slate-50/50 dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3 rounded-xl shadow-xs transition duration-200 flex items-center justify-center space-x-2 cursor-pointer hover:scale-[1.01]"
              id="settings-save-button"
            >
              <Save size={15} />
              <span>Salvar Alterações</span>
            </button>

            {saved && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-550/20 text-emerald-700 dark:text-emerald-400 rounded-xl text-[11px] font-bold flex items-center space-x-1.5 animate-fadeIn">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                <span>Configurações atualizadas e salvas com sucesso!</span>
              </div>
            )}
          </div>
        </div>

      </form>

    </div>
  );
}
