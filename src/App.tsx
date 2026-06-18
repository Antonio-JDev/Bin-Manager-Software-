import React, { useState, useEffect } from "react";
import { 
  db, 
  auth, 
  onAuthStateChanged, 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  getDocs, 
  deleteDoc, 
  updateDoc 
} from "./lib/firebase";
import { User } from "firebase/auth";
import { Product, Sale, CostSettings, DEFAULT_COST_SETTINGS } from "./types";
import { MOCK_PRODUCTS, MOCK_SALES } from "./lib/mockData";
import Sidebar from "./components/Sidebar";
import EstoqueTab from "./components/EstoqueTab";
import ImportarXMLTab from "./components/ImportarXMLTab";
import PrevisaoTab from "./components/PrevisaoTab";
import VendasTab from "./components/VendasTab";
import RelatoriosTab from "./components/RelatoriosTab";
import ConfiguracoesTab from "./components/ConfiguracoesTab";

import { 
  ShieldAlert,
  Loader2,
  Menu,
  TrendingUp,
  Sun,
  Moon,
  WifiOff
} from "lucide-react";

export default function App() {
  // Authentication states
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // Application database states
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [costSettings, setCostSettings] = useState<CostSettings>(DEFAULT_COST_SETTINGS);
  
  // Tab states
  const [activeTab, setActiveTab] = useState<"estoque" | "importar" | "previsao" | "vendas" | "relatorios" | "configuracoes">("estoque");

  // Visual Theme state and mobile drawer status
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("estoque_dark_mode");
    return saved !== null ? saved === "true" : true; // Default to dark mode immediately as requested!
  });
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  // Synchronize document dark class hook
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("estoque_dark_mode", String(darkMode));
  }, [darkMode]);

  // Track Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
      
      if (currentUser) {
        // Force deactivate demo if real user logs in
        setIsDemo(false);
        loadUserData(currentUser.uid);
      } else {
        // Check if there was a previous demo session or load blank/demo
        const demoActive = localStorage.getItem("estoque_demo_active") === "true";
        if (demoActive) {
          setIsDemo(true);
          loadDemoData();
        } else {
          // If no user and no active demo, default to sandbox demo so user gets a rich, immediate preview!
          setIsDemo(true);
          localStorage.setItem("estoque_demo_active", "true");
          loadDemoData();
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // --- LOCAL PERSISTENCE (MOCK MODE / SANDBOX) ---
  const loadDemoData = () => {
    try {
      const storedProducts = localStorage.getItem("estoque_demo_products");
      const storedSales = localStorage.getItem("estoque_demo_sales");
      const storedSettings = localStorage.getItem("estoque_demo_settings");

      if (storedProducts && storedSales && storedSettings) {
        setProducts(JSON.parse(storedProducts));
        setSales(JSON.parse(storedSales));
        const parsedSettings = JSON.parse(storedSettings) as CostSettings;
        if (parsedSettings.companyName === undefined) {
          parsedSettings.companyName = "Minha Empresa";
        }
        setCostSettings(parsedSettings);
      } else {
        // First load of demo data, inject standard mocks
        setProducts(MOCK_PRODUCTS);
        setSales(MOCK_SALES);
        setCostSettings(DEFAULT_COST_SETTINGS);
        
        localStorage.setItem("estoque_demo_products", JSON.stringify(MOCK_PRODUCTS));
        localStorage.setItem("estoque_demo_sales", JSON.stringify(MOCK_SALES));
        localStorage.setItem("estoque_demo_settings", JSON.stringify(DEFAULT_COST_SETTINGS));
      }
    } catch (e) {
      console.error("Erro ao carregar dados do LocalStorage:", e);
      setProducts(MOCK_PRODUCTS);
      setSales(MOCK_SALES);
      setCostSettings(DEFAULT_COST_SETTINGS);
    }
  };

  const handleStartDemo = () => {
    setIsDemo(true);
    localStorage.setItem("estoque_demo_active", "true");
    loadDemoData();
  };

  const handleExitDemo = () => {
    setIsDemo(false);
    localStorage.removeItem("estoque_demo_active");
    // Clear demo local records
    localStorage.removeItem("estoque_demo_products");
    localStorage.removeItem("estoque_demo_sales");
    localStorage.removeItem("estoque_demo_settings");
    setProducts([]);
    setSales([]);
    setCostSettings(DEFAULT_COST_SETTINGS);
  };

  // Save changes locally in demo sandbox
  const saveDemoChanges = (updatedProducts: Product[], updatedSales: Sale[], updatedSettings: CostSettings) => {
    localStorage.setItem("estoque_demo_products", JSON.stringify(updatedProducts));
    localStorage.setItem("estoque_demo_sales", JSON.stringify(updatedSales));
    localStorage.setItem("estoque_demo_settings", JSON.stringify(updatedSettings));
  };

  // Cache authenticated user data locally as backup
  const cacheOfflineUserData = (uid: string, updatedProducts: Product[], updatedSales: Sale[], updatedSettings: CostSettings) => {
    try {
      localStorage.setItem(`estoque_cached_products_${uid}`, JSON.stringify(updatedProducts));
      localStorage.setItem(`estoque_cached_sales_${uid}`, JSON.stringify(updatedSales));
      localStorage.setItem(`estoque_cached_settings_${uid}`, JSON.stringify(updatedSettings));
    } catch (e) {
      console.warn("Aviso: Erro ao persistir cache local secundário:", e);
    }
  };


  // --- CLOUD PERSISTENCE (FIREBASE FIRESTORE) ---
  const loadUserData = async (userId: string) => {
    try {
      setIsOfflineMode(false);
      setProducts([]);
      setSales([]);

      // 1. Fetch products
      const productsSnapshot = await getDocs(collection(db, "users", userId, "products"));
      const loadedProducts: Product[] = [];
      productsSnapshot.forEach((doc) => {
        loadedProducts.push({ id: doc.id, ...doc.data() } as Product);
      });
      setProducts(loadedProducts);

      // 2. Fetch sales history
      const salesSnapshot = await getDocs(collection(db, "users", userId, "sales"));
      const loadedSales: Sale[] = [];
      salesSnapshot.forEach((doc) => {
        loadedSales.push({ id: doc.id, ...doc.data() } as Sale);
      });
      setSales(loadedSales);

      // 3. Fetch cost settings
      let finalSettings = DEFAULT_COST_SETTINGS;
      const settingsDoc = await getDoc(doc(db, "users", userId, "settings", "costs"));
      if (settingsDoc.exists()) {
        const data = settingsDoc.data() as CostSettings;
        let modified = false;
        
        if (!data.userName && auth.currentUser?.displayName) {
          data.userName = auth.currentUser.displayName;
          modified = true;
        }
        if (data.companyName === undefined) {
          data.companyName = "Minha Empresa";
          modified = true;
        }
        
        if (modified) {
          await setDoc(doc(db, "users", userId, "settings", "costs"), data);
        }
        finalSettings = data;
        setCostSettings(data);
      } else {
        // Save defaults first
        const initialSettings = {
          ...DEFAULT_COST_SETTINGS,
          userName: auth.currentUser?.displayName || ""
        };
        await setDoc(doc(db, "users", userId, "settings", "costs"), initialSettings);
        finalSettings = initialSettings;
        setCostSettings(initialSettings);
      }

      // Persist to offline storage cache on successful load
      cacheOfflineUserData(userId, loadedProducts, loadedSales, finalSettings);
    } catch (error) {
      console.warn("Aviso: Conexão direta com Firestore offline/indisponível. Ativando modo local com backup (Resiliente):", error);
      setIsOfflineMode(true);

      const cachedProductsRaw = localStorage.getItem(`estoque_cached_products_${userId}`);
      const cachedSalesRaw = localStorage.getItem(`estoque_cached_sales_${userId}`);
      const cachedSettingsRaw = localStorage.getItem(`estoque_cached_settings_${userId}`);

      if (cachedProductsRaw || cachedSalesRaw || cachedSettingsRaw) {
        if (cachedProductsRaw) {
          try {
            setProducts(JSON.parse(cachedProductsRaw));
          } catch (e) { console.error(e); }
        }
        if (cachedSalesRaw) {
          try {
            setSales(JSON.parse(cachedSalesRaw));
          } catch (e) { console.error(e); }
        }
        if (cachedSettingsRaw) {
          try {
            setCostSettings(JSON.parse(cachedSettingsRaw));
          } catch (e) { console.error(e); }
        }
      } else {
        // Fallback to initial demo if nothing is cached yet so they don't see blank UI during offline startup testing
        loadDemoData();
      }
    }
  };


  // --- DB WRITE DISPATCHERS (Resiliently routes to Cloud or Local depending on context) ---

  // Add Product
  const handleAddProduct = async (newProductInput: Omit<Product, "id" | "createdAt">) => {
    const timestamp = new Date().toISOString();
    const mockId = "prod-" + Math.random().toString(36).substr(2, 9);
    
    const newProduct: Product = {
      id: mockId,
      createdAt: timestamp,
      priceHistory: [newProductInput.sellingPrice],
      ...newProductInput
    };

    const updatedProducts = [newProduct, ...products];
    setProducts(updatedProducts);

    if (user && !isDemo) {
      cacheOfflineUserData(user.uid, updatedProducts, sales, costSettings);
      try {
        await setDoc(doc(db, "users", user.uid, "products", mockId), {
          code: newProduct.code,
          name: newProduct.name,
          link: newProduct.link,
          quantity: newProduct.quantity,
          supplierPrice: newProduct.supplierPrice,
          supplierName: newProduct.supplierName,
          sellingPrice: newProduct.sellingPrice,
          createdAt: timestamp,
          priceHistory: newProduct.priceHistory,
          minStock: newProduct.minStock || 0
        });
      } catch (e) {
        console.error(e);
      }
    } else {
      saveDemoChanges(updatedProducts, sales, costSettings);
    }
  };

  // Update Product
  const handleUpdateProduct = async (updatedProduct: Product) => {
    const existing = products.find(p => p.id === updatedProduct.id);
    let finalProduct = { ...updatedProduct };
    
    if (existing) {
      const prevHistory = existing.priceHistory || [existing.sellingPrice];
      if (updatedProduct.sellingPrice !== existing.sellingPrice) {
        finalProduct.priceHistory = [updatedProduct.sellingPrice, ...prevHistory].slice(0, 5);
      } else {
        finalProduct.priceHistory = prevHistory;
      }
    } else {
      finalProduct.priceHistory = [updatedProduct.sellingPrice];
    }

    const updatedProducts = products.map(p => p.id === updatedProduct.id ? finalProduct : p);
    setProducts(updatedProducts);

    if (user && !isDemo) {
      cacheOfflineUserData(user.uid, updatedProducts, sales, costSettings);
      try {
        await updateDoc(doc(db, "users", user.uid, "products", updatedProduct.id), {
          code: finalProduct.code,
          name: finalProduct.name,
          link: finalProduct.link,
          quantity: finalProduct.quantity,
          supplierPrice: finalProduct.supplierPrice,
          supplierName: finalProduct.supplierName,
          sellingPrice: finalProduct.sellingPrice,
          priceHistory: finalProduct.priceHistory,
          minStock: finalProduct.minStock || 0
        });
      } catch (e) {
        console.error(e);
      }
    } else {
      saveDemoChanges(updatedProducts, sales, costSettings);
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id: string) => {
    const updatedProducts = products.filter(p => p.id !== id);
    setProducts(updatedProducts);

    // Filter sales to exclude deleted product logs if required or keep them (typically keep logs but handle product absence)
    if (user && !isDemo) {
      cacheOfflineUserData(user.uid, updatedProducts, sales, costSettings);
      try {
        await deleteDoc(doc(db, "users", user.uid, "products", id));
      } catch (e) {
        console.error(e);
      }
    } else {
      saveDemoChanges(updatedProducts, sales, costSettings);
    }
  };

  // Bulk XML import dispatcher
  const handleImportXMLProducts = async (
    supplierName: string, 
    importedItems: { code: string; name: string; quantity: number; unitPrice: number; sellingPrice: number; link: string }[]
  ) => {
    const updatedProducts = [...products];
    const timestamp = new Date().toISOString();

    for (const item of importedItems) {
      // Look for a matching SKU/code in current inventory to decide whether to sum stock or insert
      const existingProductIdx = updatedProducts.findIndex(p => p.code === item.code);

      if (existingProductIdx !== -1) {
        const existing = updatedProducts[existingProductIdx];
        
        // Formulated blended value or just update to newest supplier price
        const newQty = existing.quantity + item.quantity;
        const newSellingPrice = item.sellingPrice || existing.sellingPrice;
        
        const prevHistory = existing.priceHistory || [existing.sellingPrice];
        let newHistory = prevHistory;
        if (newSellingPrice !== existing.sellingPrice) {
          newHistory = [newSellingPrice, ...prevHistory].slice(0, 5);
        }
        
        const updatedItem = {
          ...existing,
          quantity: newQty,
          supplierPrice: item.unitPrice, // set to newest purchase unit price
          supplierName: supplierName || existing.supplierName,
          sellingPrice: newSellingPrice,
          link: item.link || existing.link,
          priceHistory: newHistory
        };

        updatedProducts[existingProductIdx] = updatedItem;

        if (user && !isDemo) {
          try {
            await updateDoc(doc(db, "users", user.uid, "products", existing.id), {
              quantity: newQty,
              supplierPrice: item.unitPrice,
              supplierName: supplierName || existing.supplierName,
              sellingPrice: newSellingPrice,
              link: item.link || existing.link,
              priceHistory: newHistory
            });
          } catch (e) {
            console.error(e);
          }
        }
      } else {
        // Insert as new item
        const newId = "prod-" + Math.random().toString(36).substr(2, 9);
        const newProduct: Product = {
          id: newId,
          code: item.code,
          name: item.name,
          link: item.link,
          quantity: item.quantity,
          supplierPrice: item.unitPrice,
          supplierName: supplierName,
          sellingPrice: item.sellingPrice,
          createdAt: timestamp,
          priceHistory: [item.sellingPrice]
        };

        updatedProducts.push(newProduct);

        if (user && !isDemo) {
          try {
            await setDoc(doc(db, "users", user.uid, "products", newId), {
              code: newProduct.code,
              name: newProduct.name,
              link: newProduct.link,
              quantity: newProduct.quantity,
              supplierPrice: newProduct.supplierPrice,
              supplierName: newProduct.supplierName,
              sellingPrice: newProduct.sellingPrice,
              createdAt: timestamp,
              priceHistory: newProduct.priceHistory
            });
          } catch (e) {
            console.error(e);
          }
        }
      }
    }

    setProducts(updatedProducts);
    if (user && !isDemo) {
      cacheOfflineUserData(user.uid, updatedProducts, sales, costSettings);
    } else {
      saveDemoChanges(updatedProducts, sales, costSettings);
    }
  };

  // Record Outbound Sale
  const handleRecordSale = async (productId: string, quantitySold: number, customSalePrice: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    // 1. Calculate profit returned for this sale using actual aggregate cost values
    const taxAmount = product.supplierPrice * (costSettings.taxRate / 100);
    const costBasis = product.supplierPrice + taxAmount + costSettings.shippingCostUnit + costSettings.otherFeesUnit;
    const platformFee = customSalePrice * (costSettings.platformFeeRate / 100);
    
    const profitUnit = customSalePrice - costBasis - platformFee;
    const profitTotal = profitUnit * quantitySold;

    // 2. Generate sale record
    const saleId = "sale-" + Math.random().toString(36).substr(2, 9);
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    
    const newSale: Sale = {
      id: saleId,
      productId,
      productName: product.name,
      quantity: quantitySold,
      unitPrice: customSalePrice,
      totalValue: quantitySold * customSalePrice,
      profit: profitTotal,
      date: today
    };

    // 3. Update products catalog (subtract quantities)
    const updatedProducts = products.map(p => {
      if (p.id === productId) {
        return {
          ...p,
          quantity: Math.max(0, p.quantity - quantitySold)
        };
      }
      return p;
    });

    const updatedSales = [newSale, ...sales];

    setProducts(updatedProducts);
    setSales(updatedSales);

    if (user && !isDemo) {
      cacheOfflineUserData(user.uid, updatedProducts, updatedSales, costSettings);
      try {
        // Save sale
        await setDoc(doc(db, "users", user.uid, "sales", saleId), {
          productId: newSale.productId,
          productName: newSale.productName,
          quantity: newSale.quantity,
          unitPrice: newSale.unitPrice,
          totalValue: newSale.totalValue,
          profit: newSale.profit,
          date: newSale.date
        });

        // Subtract quantity in Firestore
        await updateDoc(doc(db, "users", user.uid, "products", productId), {
          quantity: Math.max(0, product.quantity - quantitySold)
        });
      } catch (e) {
        console.error(e);
      }
    } else {
      saveDemoChanges(updatedProducts, updatedSales, costSettings);
    }
  };

  // Revert/Refuse Sale item (Return units back to inventory)
  const handleRevertSale = async (saleId: string) => {
    const sale = sales.find(s => s.id === saleId);
    if (!sale) return;

    const product = products.find(p => p.id === sale.productId);
    
    // 1. Return stock quantity
    const updatedProducts = products.map(p => {
      if (p.id === sale.productId) {
        return {
          ...p,
          quantity: p.quantity + sale.quantity
        };
      }
      return p;
    });

    const updatedSales = sales.filter(s => s.id !== saleId);

    setProducts(updatedProducts);
    setSales(updatedSales);

    if (user && !isDemo) {
      cacheOfflineUserData(user.uid, updatedProducts, updatedSales, costSettings);
      try {
        await deleteDoc(doc(db, "users", user.uid, "sales", saleId));
        
        if (product) {
          await updateDoc(doc(db, "users", user.uid, "products", product.id), {
            quantity: product.quantity + sale.quantity
          });
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      saveDemoChanges(updatedProducts, updatedSales, costSettings);
    }
  };

  // Update cost configuration factors
  const handleUpdateCostSettings = async (updatedSettings: CostSettings) => {
    setCostSettings(updatedSettings);

    if (user && !isDemo) {
      cacheOfflineUserData(user.uid, products, sales, updatedSettings);
      try {
        await setDoc(doc(db, "users", user.uid, "settings", "costs"), updatedSettings);
      } catch (e) {
        console.error(e);
      }
    } else {
      saveDemoChanges(products, sales, updatedSettings);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-800 dark:text-slate-100 flex flex-col md:flex-row antialiased transition-colors duration-150">
      
      {/* Sidebar de Navegação */}
      <Sidebar 
        user={user} 
        isDemo={isDemo} 
        onStartDemo={handleStartDemo} 
        onExitDemo={handleExitDemo} 
        loading={loadingAuth} 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        isOpenMobile={isOpenMobile}
        setIsOpenMobile={setIsOpenMobile}
        productsCount={products.length}
        companyName={costSettings.companyName}
      />

      {/* Container de Conteúdo Principal */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        
        {/* Header Superior mobile-only */}
        <header className="md:hidden bg-slate-900 border-b border-slate-800 px-4 py-4.5 flex items-center justify-between no-print sticky top-0 z-30 shadow-md">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsOpenMobile(true)}
              className="text-slate-200 hover:text-white hover:bg-slate-800 p-2 rounded-xl transition duration-150"
              title="Abrir Menu"
              id="mobile-menu-hamburger"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center space-x-2">
              <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
                <TrendingUp size={16} className="animate-spin-slow" />
              </div>
              <span className="font-extrabold text-sm text-white tracking-tight">{costSettings.companyName || "EstoqueFinanceiro"}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Quick dark mode toggle also on mobile header */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition duration-150"
              id="mobile-darkmode-toggle"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </header>

        {/* Faixa superior do modo de demonstração */}
        {isDemo && (
          <div className="bg-amber-500 text-amber-950 px-4 py-2.5 text-center text-xs font-bold flex items-center justify-center space-x-2 no-print shadow-sm z-10">
            <ShieldAlert size={15} />
            <span>Você está no <strong>Modo Demonstrativo (Sandbox offline)</strong>. Seus dados persistem localmente. Entre com o Google na sidebar para salvar em nuvem segura!</span>
          </div>
        )}

        {/* Faixa superior do modo offline */}
        {isOfflineMode && !isDemo && (
          <div className="bg-rose-600 text-white px-4 py-2.5 text-center text-xs font-bold flex items-center justify-center space-x-2 no-print shadow-sm z-10">
            <WifiOff size={15} className="animate-pulse" />
            <span>Você está no <strong>Modo de Emergência Offline</strong>. A conexão direta com Firestore falhou, mas seus dados estão sendo salvos localmente no dispositivo.</span>
          </div>
        )}

        {/* Conteúdo Central do Viewport */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Desktop Custom Corporate Header Subnav */}
          <div className="hidden md:flex items-center justify-between mb-6 pb-4 border-b border-slate-200/50 dark:border-slate-800/60 no-print">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Unidade Ativa:</span>
              <span className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 font-extrabold text-xs px-3.5 py-1 rounded-xl border border-indigo-100/50 dark:border-indigo-900/30">
                {costSettings.companyName || "Minha Empresa"}
              </span>
            </div>
            {costSettings.userName && (
              <div className="text-right text-[11px] font-bold text-slate-405 dark:text-slate-400">
                <span>Operador Ativo: </span>
                <span className="text-slate-700 dark:text-slate-200 font-extrabold">{costSettings.userName}</span>
              </div>
            )}
          </div>
          
          <div className="tab-viewport animate-fadeSimple">
            {loadingAuth && products.length === 0 ? (
              <div className="py-24 flex flex-col items-center justify-center text-slate-400 text-xs font-semibold">
                <Loader2 className="animate-spin text-indigo-600 mb-3" size={32} />
                <span>Sincronizando base de dados na nuvem...</span>
              </div>
            ) : (
              <>
                {activeTab === "estoque" && (
                  <EstoqueTab 
                    products={products} 
                    onAddProduct={handleAddProduct}
                    onUpdateProduct={handleUpdateProduct}
                    onDeleteProduct={handleDeleteProduct}
                    onRecordSale={handleRecordSale}
                  />
                )}

                {activeTab === "importar" && (
                  <ImportarXMLTab 
                    onImportProducts={handleImportXMLProducts}
                  />
                )}

                {activeTab === "previsao" && (
                  <PrevisaoTab 
                    products={products}
                    settings={costSettings}
                    onUpdateSettings={handleUpdateCostSettings}
                    onUpdateProduct={handleUpdateProduct}
                  />
                )}

                {activeTab === "vendas" && (
                  <VendasTab 
                    sales={sales}
                    onRevertSale={handleRevertSale}
                  />
                )}

                {activeTab === "relatorios" && (
                  <RelatoriosTab 
                    products={products}
                    sales={sales}
                    settings={costSettings}
                  />
                )}

                {activeTab === "configuracoes" && (
                  <ConfiguracoesTab 
                    settings={costSettings}
                    onUpdateSettings={handleUpdateCostSettings}
                    user={user}
                    isDemo={isDemo}
                  />
                )}
              </>
            )}
          </div>

        </main>

        {/* Rodapé institucional */}
        <footer className="bg-white border-t border-slate-200/50 py-6 text-center text-xs text-slate-400 font-medium no-print">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span>&copy; {new Date().getFullYear()} EstoqueFinanceiro. Todos os direitos reservados.</span>
            <span className="font-mono text-[10px]">Administrador de Estoques e Compras NF-e XML v1.2</span>
          </div>
        </footer>

      </div>

    </div>
  );
}
