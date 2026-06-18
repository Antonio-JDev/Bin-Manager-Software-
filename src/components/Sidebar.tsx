import React from "react";
import { 
  signInWithPopup, 
  signOut, 
  googleProvider, 
  auth 
} from "../lib/firebase";
import { User } from "firebase/auth";
import { 
  Package, 
  Upload, 
  Sliders, 
  History, 
  BarChart3, 
  Sun, 
  Moon, 
  LogOut, 
  LogIn, 
  ShieldAlert,
  TrendingUp,
  X,
  Layers,
  ChevronRight,
  Settings
} from "lucide-react";

interface SidebarProps {
  user: User | null;
  isDemo: boolean;
  onStartDemo: () => void;
  onExitDemo: () => void;
  loading: boolean;
  activeTab: "estoque" | "importar" | "previsao" | "vendas" | "relatorios" | "configuracoes";
  setActiveTab: (tab: "estoque" | "importar" | "previsao" | "vendas" | "relatorios" | "configuracoes") => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
  productsCount: number;
  companyName?: string;
}

export default function Sidebar({
  user,
  isDemo,
  onStartDemo,
  onExitDemo,
  loading,
  activeTab,
  setActiveTab,
  darkMode,
  setDarkMode,
  isOpenMobile,
  setIsOpenMobile,
  productsCount,
  companyName
}: SidebarProps) {

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      setIsOpenMobile(false);
    } catch (error) {
      console.error("Erro no login com o Google:", error);
      alert("Houve um erro ao realizar login com o Google. Se estiver no preview, você pode alternativamente usar o 'Modo Demonstrativo' para testar tudo de forma segura.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsOpenMobile(false);
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  };

  const menuItems: { 
    id: "estoque" | "importar" | "previsao" | "vendas" | "relatorios" | "configuracoes"; 
    label: string; 
    icon: React.ComponentType<any>; 
    badge?: number; 
  }[] = [
    { 
      id: "estoque", 
      label: "Estoque / Cadastro", 
      icon: Package,
      badge: productsCount > 0 ? productsCount : undefined 
    },
    { 
      id: "importar", 
      label: "Importar Compra XML", 
      icon: Upload 
    },
    { 
      id: "previsao", 
      label: "Previsão & Margens", 
      icon: Sliders 
    },
    { 
      id: "vendas", 
      label: "Saídas de Vendas", 
      icon: History 
    },
    { 
      id: "relatorios", 
      label: "Relatórios & PDF", 
      icon: BarChart3 
    },
    {
      id: "configuracoes",
      label: "Configurações",
      icon: Settings
    }
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 text-slate-100 p-6 no-print justify-between">
      <div>
        {/* Header/Logotipo */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg flex items-center justify-center">
              <TrendingUp size={20} className="animate-spin-slow text-indigo-100" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent break-words max-w-[150px]">
                {companyName || "EstoqueFinanceiro"}
              </h1>
              {!companyName && (
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Gestão Comercial</p>
              )}
            </div>
          </div>
          <button 
            onClick={() => setIsOpenMobile(false)}
            className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X size={18} />
          </button>
        </div>

        {/* Links de Navegação */}
        <div className="space-y-1.5">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block px-2 mb-2">Navegação</span>
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpenMobile(false);
                }}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all duration-250 cursor-pointer text-left group ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/15 border border-indigo-500/35"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-transparent"
                }`}
                id={`sidebar-tab-${item.id}`}
              >
                <div className="flex items-center space-x-3">
                  <IconComponent size={16} className={`transition-transform duration-250 ${isActive ? 'scale-110 text-white' : 'text-slate-500 group-hover:text-slate-300'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined ? (
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    isActive ? "bg-indigo-700 text-white" : "bg-slate-800 text-indigo-400"
                  }`}>
                    {item.badge}
                  </span>
                ) : (
                  <ChevronRight size={14} className={`opacity-0 group-hover:opacity-100 transition-opacity duration-150 ${isActive ? 'text-indigo-200' : 'text-slate-600'}`} />
                )}
              </button>
            );
          })}
        </div>

        {/* Indicador do Sandbox em destaque */}
        {isDemo && (
          <div className="mt-6 bg-amber-500/10 border border-amber-500/20 text-amber-400 p-4 rounded-2xl">
            <div className="flex items-start space-x-2.5">
              <ShieldAlert size={16} className="text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-amber-300">Modo Demonstrativo</h4>
                <p className="text-[10px] text-amber-400/80 leading-relaxed mt-1">Sessão temporária no cache do navegador.</p>
              </div>
            </div>
            <button
              onClick={onExitDemo}
              className="w-full mt-3 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 py-1.5 rounded-lg text-[10px] font-bold transition duration-200 text-center flex items-center justify-center space-x-1"
            >
              <LogOut size={11} />
              <span>Sair do Modo Demo</span>
            </button>
          </div>
        )}
      </div>

      <div className="border-t border-slate-800 pt-5 space-y-4">
        {/* Toggle Modo Escuro */}
        <div className="bg-slate-800/40 border border-slate-800/80 p-1 rounded-xl flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">Modo Visual</span>
          <div className="flex space-x-1">
            <button
              onClick={() => setDarkMode(false)}
              className={`p-2 rounded-lg transition-all duration-200 ${
                !darkMode 
                  ? "bg-indigo-600/15 text-indigo-400 border border-indigo-500/20" 
                  : "text-slate-500 hover:text-slate-300"
              }`}
              title="Modo Claro"
              id="theme-light-btn"
            >
              <Sun size={14} />
            </button>
            <button
              onClick={() => setDarkMode(true)}
              className={`p-2 rounded-lg transition-all duration-200 ${
                darkMode 
                  ? "bg-indigo-600/15 text-indigo-400 border border-indigo-500/20" 
                  : "text-slate-500 hover:text-slate-300"
              }`}
              title="Modo Escuro"
              id="theme-dark-btn"
            >
              <Moon size={14} />
            </button>
          </div>
        </div>

        {/* Painel do Usuário logado */}
        {loading ? (
          <div className="text-[10px] text-slate-500 font-medium animate-pulse text-center">Autenticando...</div>
        ) : user ? (
          <div className="bg-slate-800/30 border border-slate-800 p-3 rounded-2xl flex items-center justify-between">
            <div className="flex items-center space-x-2.5 min-w-0">
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName || "Avatar"} 
                  className="w-8 h-8 rounded-full border border-indigo-500 shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs text-white font-bold shrink-0">
                  {user.displayName?.charAt(0) || "U"}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-white truncate">{user.displayName}</p>
                <p className="text-[9px] text-slate-500 truncate">{user.email}</p>
              </div>
            </div>
            
            <button 
              onClick={handleLogout}
              className="hover:bg-slate-800 text-slate-400 hover:text-rose-400 p-2 rounded-xl transition duration-200 shrink-0"
              title="Sair da Conta"
              id="btn-logout-sidebar"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {!isDemo && (
              <button
                onClick={onStartDemo}
                className="w-full bg-slate-800 hover:bg-slate-750 text-slate-200 py-2.5 rounded-xl text-xs font-semibold border border-slate-700/80 transition duration-200 flex items-center justify-center space-x-2 cursor-pointer"
                id="btn-sidebar-demo"
              >
                <Layers size={14} />
                <span>Ativar Modo Demo</span>
              </button>
            )}
            <button
              onClick={handleGoogleLogin}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl text-xs font-bold shadow-md transition duration-200 flex items-center justify-center space-x-2 cursor-pointer hover:scale-[1.01]"
              id="btn-sidebar-login"
            >
              <LogIn size={14} />
              <span>Entrar com Google</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Sidebar Fixo para Telas Desktops */}
      <aside className="hidden md:block w-70 h-screen sticky top-0 shrink-0 z-40">
        {sidebarContent}
      </aside>

      {/* Sidebar Gaveta (Drawer) para Telas Mobiles */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex no-print">
          {/* Backdrop sombreamento/backdrop */}
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsOpenMobile(false)}
          />
          {/* Drawer Lateral */}
          <div 
            className="relative flex flex-col w-72 max-w-sm h-full bg-slate-900 border-r border-slate-800 animate-zoomIn shadow-2xl z-10"
          >
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
