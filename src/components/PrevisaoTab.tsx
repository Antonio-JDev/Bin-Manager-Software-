import React, { useState } from "react";
import { Product, CostSettings } from "../types";
import { 
  formatCurrency, 
  calculateTotalCost, 
  calculateProfitAndMargin 
} from "../lib/exportUtils";
import { 
  SlidersHorizontal, 
  Percent, 
  DollarSign, 
  PackageCheck, 
  RefreshCw, 
  ArrowUpRight, 
  Scale, 
  HelpCircle,
  Truck,
  Building,
  Save,
  CheckCircle2
} from "lucide-react";

interface PrevisaoTabProps {
  products: Product[];
  settings: CostSettings;
  onUpdateSettings: (settings: CostSettings) => void;
  onUpdateProduct: (product: Product) => void;
}

export default function PrevisaoTab({ 
  products, 
  settings, 
  onUpdateSettings,
  onUpdateProduct
}: PrevisaoTabProps) {
  
  // Local pricing simulators state to handle typing in real-time before applying changes to database
  const [simulatedPrices, setSimulatedPrices] = useState<{ [id: string]: number }>({});
  const [savedLogs, setSavedLogs] = useState<{ [id: string]: boolean }>({});

  const handleSettingsChange = (field: keyof CostSettings, val: number) => {
    onUpdateSettings({
      ...settings,
      [field]: val
    });
  };

  const handlePriceSimulate = (productId: string, price: number) => {
    setSimulatedPrices({
      ...simulatedPrices,
      [productId]: price
    });
    // Reset saved status indicator for this item
    if (savedLogs[productId]) {
      setSavedLogs({
        ...savedLogs,
        [productId]: false
      });
    }
  };

  const handleApplySinglePrice = (product: Product) => {
    const finalPrice = simulatedPrices[product.id] ?? product.sellingPrice;
    onUpdateProduct({
      ...product,
      sellingPrice: finalPrice
    });
    
    // Trigger success feedback state
    setSavedLogs({
      ...savedLogs,
      [product.id]: true
    });
    setTimeout(() => {
      setSavedLogs(prev => ({ ...prev, [product.id]: false }));
    }, 2000);
  };

  const handleApplyAllPrices = () => {
    if (products.length === 0) return;
    if (!confirm("Deseja gravar em lote todos os preços de venda simulados na sua lista de estoque?")) return;

    products.forEach(p => {
      const simulatedPrice = simulatedPrices[p.id];
      if (simulatedPrice !== undefined && simulatedPrice !== p.sellingPrice) {
        onUpdateProduct({
          ...p,
          sellingPrice: simulatedPrice
        });
      }
    });

    alert("Todos os preços simulados foram migrados e gravados no estoque com sucesso!");
    setSimulatedPrices({});
  };

  return (
    <div className="space-y-6">
      
      {/* Grade de Configuração de Custos Agregados */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-5">
          <SlidersHorizontal size={18} className="text-indigo-600 dark:text-indigo-400" />
          <span>Configuração Geral de Custos Agregados por Unidade</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Alíquota de Impostos */}
          <div className="bg-slate-50/50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Impostos de Aquisição</span>
              <Building size={14} className="text-indigo-500" />
            </label>
            <div className="mt-2 flex items-center">
              <input
                type="number"
                min="0"
                step="0.1"
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 font-mono text-xs font-bold text-slate-700 dark:text-slate-100 focus:outline-hidden"
                value={settings.taxRate}
                onChange={(e) => handleSettingsChange("taxRate", Math.max(0, parseFloat(e.target.value) || 0))}
              />
              <span className="text-slate-400 dark:text-slate-500 font-bold text-xs ml-2">%</span>
            </div>
            <span className="text-[9px] text-slate-400 dark:text-slate-500 block mt-1 leading-normal">
              Soma impostos (ex: ICMS/IPI) cobrados na nota de compra do distribuidor.
            </span>
          </div>

          {/* Custo de Frete */}
          <div className="bg-slate-50/50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Frete por Unidade</span>
              <Truck size={14} className="text-emerald-500" />
            </label>
            <div className="mt-2 flex items-center">
              <span className="text-slate-400 dark:text-slate-500 font-bold text-xs mr-2">R$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 font-mono text-xs font-bold text-slate-700 dark:text-slate-100 focus:outline-hidden"
                value={settings.shippingCostUnit}
                onChange={(e) => handleSettingsChange("shippingCostUnit", Math.max(0, parseFloat(e.target.value) || 0))}
              />
            </div>
            <span className="text-[9px] text-slate-400 dark:text-slate-500 block mt-1 leading-normal">
              Rateio médio do valor de frete logístico por produto encomendado.
            </span>
          </div>

          {/* Embalagens e Manuseios */}
          <div className="bg-slate-50/50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Taxas de Embalagem</span>
              <PackageCheck size={14} className="text-amber-500" />
            </label>
            <div className="mt-2 flex items-center">
              <span className="text-slate-400 dark:text-slate-500 font-bold text-xs mr-2">R$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 font-mono text-xs font-bold text-slate-700 dark:text-slate-100 focus:outline-hidden"
                value={settings.otherFeesUnit}
                onChange={(e) => handleSettingsChange("otherFeesUnit", Math.max(0, parseFloat(e.target.value) || 0))}
              />
            </div>
            <span className="text-[9px] text-slate-400 dark:text-slate-500 block mt-1 leading-normal">
              Plástico bolha, fitas e brindes adicionados por caixa enviada.
            </span>
          </div>

          {/* Comissão E-commerce */}
          <div className="bg-slate-50/50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Tarifa Plataforma</span>
              <Percent size={14} className="text-indigo-500" />
            </label>
            <div className="mt-2 flex items-center">
              <input
                type="number"
                min="0"
                step="0.1"
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 font-mono text-xs font-bold text-slate-700 dark:text-slate-100 focus:outline-hidden"
                value={settings.platformFeeRate}
                onChange={(e) => handleSettingsChange("platformFeeRate", Math.max(0, parseFloat(e.target.value) || 0))}
              />
              <span className="text-slate-400 dark:text-slate-500 font-bold text-xs ml-2">%</span>
            </div>
            <span className="text-[9px] text-slate-400 dark:text-slate-500 block mt-1 leading-normal">
              Porcentagem descontada pela plataforma (Meli, Shopee, Amazon).
            </span>
          </div>

        </div>

        <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100/60 dark:border-indigo-900/30 p-3.5 rounded-xl text-indigo-950 dark:text-indigo-200 font-medium text-[11px] leading-relaxed mt-4 flex items-center space-x-2">
          <HelpCircle size={20} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span>
            <strong>Fórmula do Custo de Aquisição Real:</strong> Preço do Fornecedor + Impostos (R$) + Frete Unitário + Embalagem. <br />
            <strong>Ganho Unitário Líquido Estimado:</strong> Preço de Venda Simulada - Custo de Aquisição Real - Comissão retida da Plataforma de E-commerce.
          </span>
        </div>
      </div>

      {/* Simulador de Preços em Lote / Lista de Itens */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Tabela de Planejamento de Margens & Previsão</h3>
            <p className="text-[11px] text-slate-400 font-medium font-mono mt-0.5">Simule preços de comercialização diferentes para ver seu lucro final retornado!</p>
          </div>
          
          {Object.keys(simulatedPrices).length > 0 && (
            <button
              onClick={handleApplyAllPrices}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition duration-200 flex items-center space-x-1 shadow-sm hover:scale-[1.01]"
            >
              <RefreshCw size={13} className="animate-spin-slow" />
              <span>Gravar Preços Simulados ({Object.keys(simulatedPrices).length})</span>
            </button>
          )}
        </div>

        {products.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs font-semibold">
            Cadastre produtos na aba de Controle de Estoque primeiro para simular projeções de lucratividade.
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="overflow-x-auto hidden md:block">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                    <th className="px-6 py-4">Item / Código</th>
                    <th className="px-6 py-4 text-right">Compra Unit.</th>
                    <th className="px-6 py-4 text-center">Custos Agregados</th>
                    <th className="px-6 py-4 text-right">Custo Real Total</th>
                    <th className="px-6 py-4 text-right">Venda Simulada (R$)</th>
                    <th className="px-6 py-4 text-right">Margem Líquida (%)</th>
                    <th className="px-6 py-4 text-right">Lucro Unitário (R$)</th>
                    <th className="px-6 py-4 text-center">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 text-xs font-medium">
                  {products.map((p) => {
                    
                    const activePriceSimulated = simulatedPrices[p.id] !== undefined;
                    const currentSimPrice = simulatedPrices[p.id] ?? p.sellingPrice;
                    
                    const costAgregated = calculateTotalCost(p.supplierPrice, settings) - p.supplierPrice;
                    const finalCostValue = calculateTotalCost(p.supplierPrice, settings);
                    
                    const { profit, margin } = calculateProfitAndMargin(currentSimPrice, finalCostValue, settings);
                    
                    // Margin Style Color Helpers
                    let marginBadgeClass = "text-emerald-700 bg-emerald-50 border-emerald-100";
                    if (profit < 0) {
                      marginBadgeClass = "text-rose-700 bg-rose-50 border-rose-200";
                    } else if (margin < 15) {
                      marginBadgeClass = "text-amber-700 bg-amber-50 border-amber-200";
                    }

                    const isSaved = savedLogs[p.id];

                    return (
                      <tr key={p.id} className={`hover:bg-slate-50/50 transition-colors ${activePriceSimulated ? 'bg-indigo-50/15' : ''}`}>
                        
                        {/* Descritivo */}
                        <td className="px-6 py-4 max-w-xs">
                          <div className="font-bold text-slate-800 line-clamp-1">{p.name}</div>
                          <span className="font-mono text-[9px] text-slate-400">Código: {p.code}</span>
                        </td>

                        {/* Fornecedor */}
                        <td className="px-6 py-4 text-right font-mono font-bold text-slate-400">
                          {formatCurrency(p.supplierPrice)}
                        </td>

                        {/* Custos agregados */}
                        <td className="px-6 py-4 text-center font-mono font-semibold text-slate-500">
                          + {formatCurrency(costAgregated)}
                        </td>

                        {/* Custo Real */}
                        <td className="px-6 py-4 text-right font-mono font-extrabold text-slate-600">
                          {formatCurrency(finalCostValue)}
                        </td>

                        {/* Preço de Venda Simulada */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <span className="text-[10px] text-slate-400">R$</span>
                            <input
                              type="number"
                              step="0.01"
                              min="0.01"
                              value={currentSimPrice}
                              onChange={(e) => handlePriceSimulate(p.id, Math.max(0, parseFloat(e.target.value) || 0))}
                              className="w-24 px-2 py-1 border border-slate-300 rounded-lg text-xs font-extrabold text-right font-mono focus:border-indigo-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500/20"
                            />
                          </div>
                        </td>

                        {/* Margem Reativa */}
                        <td className="px-6 py-4 text-right">
                          <span className={`${marginBadgeClass} px-2.5 py-1 text-[11px] font-bold rounded-md border font-mono`}>
                            {margin.toFixed(1)}%
                          </span>
                        </td>

                        {/* Lucro Reativo */}
                        <td className="px-6 py-4 text-right font-mono text-xs font-bold">
                          <span className={profit < 0 ? "text-rose-600" : "text-emerald-600"}>
                            {formatCurrency(profit)}
                          </span>
                        </td>

                        {/* Botão de gravação isolado */}
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleApplySinglePrice(p)}
                            disabled={!activePriceSimulated && !isSaved}
                            className={`p-1.5 rounded-lg border flex items-center justify-center transition mx-auto ${
                              isSaved 
                                ? "bg-emerald-100 border-emerald-300 text-emerald-800"
                                : activePriceSimulated
                                  ? "bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-700 cursor-pointer"
                                  : "bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed"
                            }`}
                            title="Salvar Novo Preço de Venda no Estoque"
                          >
                            {isSaved ? <CheckCircle2 size={15} /> : <Save size={15} />}
                          </button>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="grid grid-cols-1 gap-4 p-4 md:hidden">
              {products.map((p) => {
                const activePriceSimulated = simulatedPrices[p.id] !== undefined;
                const currentSimPrice = simulatedPrices[p.id] ?? p.sellingPrice;
                
                const costAgregated = calculateTotalCost(p.supplierPrice, settings) - p.supplierPrice;
                const finalCostValue = calculateTotalCost(p.supplierPrice, settings);
                
                const { profit, margin } = calculateProfitAndMargin(currentSimPrice, finalCostValue, settings);
                
                let marginBadgeClass = "text-emerald-750 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20";
                if (profit < 0) {
                  marginBadgeClass = "text-rose-750 bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20";
                } else if (margin < 15) {
                  marginBadgeClass = "text-amber-700 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20";
                }

                const isSaved = savedLogs[p.id];

                return (
                  <div 
                    key={p.id} 
                    className={`bg-white dark:bg-slate-900 border p-4 rounded-xl shadow-xs space-y-3 transition-colors ${
                      activePriceSimulated 
                        ? "border-indigo-200 dark:border-indigo-500/20 bg-indigo-50/5" 
                        : "border-slate-100 dark:border-slate-800"
                    }`}
                  >
                    <div>
                      <span className="font-mono text-[9px] text-slate-400 dark:text-slate-500 uppercase font-bold">Código SKU: {p.code}</span>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 mt-0.5 truncate">{p.name}</h4>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-[10px] bg-slate-50 dark:bg-slate-850 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="text-slate-400 block font-semibold text-[8px] uppercase">Compra Fonecedor</span>
                        <span className="font-mono font-bold text-slate-650 dark:text-slate-350">{formatCurrency(p.supplierPrice)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-semibold text-[8px] uppercase">Agregados</span>
                        <span className="font-mono font-bold text-slate-650 dark:text-slate-350">+({formatCurrency(costAgregated)})</span>
                      </div>
                      <div>
                        <span className="text-indigo-650 dark:text-indigo-400 block font-bold text-[8px] uppercase">Custo Real Total</span>
                        <span className="font-mono font-bold text-indigo-750 dark:text-indigo-400">{formatCurrency(finalCostValue)}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold block">
                        Preço Unitário de Venda Simulado
                      </label>
                      <div className="flex items-center space-x-1.5 focus-within:ring-1 focus-within:ring-indigo-500 rounded-lg p-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                        <span className="text-xs text-slate-450 font-bold px-1">R$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          className="w-full bg-transparent text-xs font-bold font-mono focus:outline-hidden dark:text-white"
                          value={currentSimPrice}
                          onChange={(e) => handlePriceSimulate(p.id, Math.max(0, parseFloat(e.target.value) || 0))}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                      <div className="bg-slate-50/50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 p-2 rounded-lg">
                        <span className="text-slate-450 dark:text-slate-500 text-[8px] block uppercase font-bold">Margem Líquida</span>
                        <span className={`${marginBadgeClass} inline-block font-bold px-2 py-0.5 mt-1 rounded-sm border font-mono`}>
                          {margin.toFixed(1)}%
                        </span>
                      </div>
                      <div className="bg-slate-50/50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 p-2 rounded-lg">
                        <span className="text-slate-450 dark:text-slate-500 text-[8px] block uppercase font-bold">Retorno de Lucro</span>
                        <span className={`font-mono font-bold block mt-1.5 ${profit < 0 ? "text-rose-600" : "text-emerald-600"}`}>
                          {formatCurrency(profit)}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 italic">
                        {activePriceSimulated ? "Modificado não gravado" : "Preço sincronizado"}
                      </span>
                      <button
                        onClick={() => handleApplySinglePrice(p)}
                        disabled={!activePriceSimulated && !isSaved}
                        className={`px-3 py-1.5 rounded-lg border flex items-center space-x-1 transition cursor-pointer text-[11px] font-bold ${
                          isSaved 
                            ? "bg-emerald-100 border-emerald-300 text-emerald-800"
                            : activePriceSimulated
                              ? "bg-indigo-600 border-indigo-700 text-white hover:bg-indigo-500"
                              : "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                        }`}
                      >
                        {isSaved ? (
                          <>
                            <CheckCircle2 size={12} />
                            <span>Gravado</span>
                          </>
                        ) : (
                          <>
                            <Save size={12} />
                            <span>Gravar Preço</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
        
      </div>

    </div>
  );
}
