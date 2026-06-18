import React, { useMemo } from "react";
import { Product, Sale, CostSettings } from "../types";
import { 
  formatCurrency, 
  calculateTotalCost, 
  calculateProfitAndMargin, 
  exportProductsToCSV 
} from "../lib/exportUtils";
import { 
  TrendingUp, 
  DollarSign, 
  Download, 
  Printer, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowUpRight, 
  ChevronRight, 
  Percent, 
  Package, 
  FileSpreadsheet,
  Zap,
  Briefcase
} from "lucide-react";

interface RelatoriosTabProps {
  products: Product[];
  sales: Sale[];
  settings: CostSettings;
}

export default function RelatoriosTab({ products, sales, settings }: RelatoriosTabProps) {
  
  // Calculate critical financial figures
  const financials = useMemo(() => {
    
    // 1. Current stock evaluations
    let totalInvestedInStock = 0; // Cumulative cost
    let potentialRevenue = 0; // Cumulative sell value
    let potentialNetProfit = 0; // Cumulative profit

    products.forEach(p => {
      const unitCost = calculateTotalCost(p.supplierPrice, settings);
      const { profit } = calculateProfitAndMargin(p.sellingPrice, unitCost, settings);
      
      totalInvestedInStock += p.quantity * unitCost;
      potentialRevenue += p.quantity * p.sellingPrice;
      potentialNetProfit += p.quantity * profit;
    });

    // 2. Already realized sales figures
    const realizedRevenue = sales.reduce((acc, curr) => acc + curr.totalValue, 0);
    const realizedProfit = sales.reduce((acc, curr) => acc + curr.profit, 0);

    // 3. Average margin calculation of currently active items
    const avgMargin = products.length > 0
      ? products.reduce((acc, curr) => {
          const unitCost = calculateTotalCost(curr.supplierPrice, settings);
          const { margin } = calculateProfitAndMargin(curr.sellingPrice, unitCost, settings);
          return acc + margin;
        }, 0) / products.length
      : 0;

    return {
      totalInvestedInStock,
      potentialRevenue,
      potentialNetProfit,
      realizedRevenue,
      realizedProfit,
      avgMargin
    };
  }, [products, sales, settings]);

  // Sort and highlight top/bottom products based on profitability (margin %)
  const rankedProducts = useMemo(() => {
    return products.map(p => {
      const unitCost = calculateTotalCost(p.supplierPrice, settings);
      const { profit, margin } = calculateProfitAndMargin(p.sellingPrice, unitCost, settings);
      return {
        ...p,
        realCost: unitCost,
        unitProfit: profit,
        unitMargin: margin
      };
    }).sort((a, b) => b.unitMargin - a.unitMargin);
  }, [products, settings]);

  const topPerformers = rankedProducts.filter(p => p.unitMargin >= 30).slice(0, 3);
  const cautionPerformers = rankedProducts.filter(p => p.unitMargin < 15).slice(0, 3);

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6 printable-section">
      
      {/* COORDENADA CORPORATIVA (ONLY FOR PRINT VIEW) */}
      <div className="hidden print:flex items-center justify-between border-b pb-4 mb-6 border-slate-250">
        <div>
          <h1 className="text-xl font-bold font-sans text-slate-900">{settings.companyName || "Minha Empresa"}</h1>
          <p className="text-[10px] text-slate-550 font-bold uppercase tracking-wider">Relatório de Gestão de Estoque & Balanço Geral</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-slate-800">Operador: {settings.userName || "Não assinado"}</p>
          <p className="text-[9px] text-slate-450 font-mono mt-0.5">Gerado em {new Date().toLocaleDateString("pt-BR")} às {new Date().toLocaleTimeString("pt-BR")}</p>
        </div>
      </div>

      {/* Bloco de botões de Ação para Exportação */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex flex-row items-center justify-between no-print gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Exportação de Relatórios</h3>
          <p className="text-[11px] text-slate-400 font-medium">Faça download das tabelas estruturadas ou salve um PDF completo do balancete comercial.</p>
        </div>

        <div className="flex items-center space-x-2">
          
          <button
            onClick={() => exportProductsToCSV(products, settings, sales)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition duration-200 flex items-center space-x-1.5 shadow-sm cursor-pointer"
            id="btn-export-excel"
          >
            <FileSpreadsheet size={15} />
            <span>Excel (.CSV)</span>
          </button>

          <button
            onClick={handlePrintReport}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition duration-200 flex items-center space-x-1.5 shadow-sm cursor-pointer"
            id="btn-export-pdf"
          >
            <Printer size={15} />
            <span>PDF (Imprimir)</span>
          </button>

        </div>
      </div>

      {/* Visão de Metas e KPIs Financeiros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* KPI 1: Capital Ativo no Estoque */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-50 pb-3 mb-3">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Capital de Compra Preso</span>
            <span className="p-2 bg-indigo-50 text-indigo-500 rounded-lg text-xs font-bold font-mono">ESTOQUE</span>
          </div>
          <div>
            <h4 className="text-xl font-extrabold text-slate-800 font-mono">
              {formatCurrency(financials.totalInvestedInStock)}
            </h4>
            <p className="text-[10px] text-slate-400 font-medium mt-1">Custo total ponderado de aquisição real do estoque ativo.</p>
          </div>
        </div>

        {/* KPI 2: Margem Média Ativa */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-50 pb-3 mb-3">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Margem Média de Margem</span>
            <span className="p-2 bg-amber-50 text-amber-600 rounded-lg text-xs font-bold font-mono">GERAL</span>
          </div>
          <div>
            <h4 className="text-xl font-extrabold text-slate-800 font-mono">
              {financials.avgMargin.toFixed(1)}%
            </h4>
            <p className="text-[10px] text-slate-400 font-medium mt-1">Retorno de margem líquida agregada dos preços em catálogo.</p>
          </div>
        </div>

        {/* KPI 3: Vendas Reais Efetuadas */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-50 pb-3 mb-3">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Receita Real Líquida</span>
            <span className="p-2 bg-emerald-50 text-emerald-500 rounded-lg text-xs font-bold font-mono">PAGO</span>
          </div>
          <div>
            <h4 className="text-xl font-extrabold text-emerald-600 font-mono">
              {formatCurrency(financials.realizedRevenue)}
            </h4>
            <p className="text-[10px] text-slate-400 font-medium mt-1">Faturamento real bruto arrecadado por vendas já efetuadas.</p>
          </div>
        </div>

        {/* KPI 4: Lucro Real Obtido */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-50 pb-3 mb-3">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Lucro Real Líquido</span>
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold font-mono">LÍQUIDO</span>
          </div>
          <div>
            <h4 className="text-xl font-extrabold text-indigo-600 font-mono">
              {formatCurrency(financials.realizedProfit)}
            </h4>
            <p className="text-[10px] text-indigo-500 font-bold mt-1">Soma de lucro real de itens vendidos (líquido de custos agregados!).</p>
          </div>
        </div>

      </div>

      {/* Projeção de Margens e Saúde de Preços */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl p-6 text-white grid grid-cols-1 md:grid-cols-3 gap-6 align-middle">
        
        <div className="border-r border-indigo-900/40 pr-6 flex flex-col justify-center">
          <span className="bg-indigo-500/20 text-indigo-300 font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-indigo-500/20 w-fit">
            Projeção Total De Catálogo
          </span>
          <h3 className="text-sm font-bold text-slate-200 mt-2">DRE Sintética do Estoque Atual</h3>
          <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
            Caso você comercialize a totalidade do seu estoque atual de produtos pelos preços configurados e condições de custos atuais, estes serão seus resultados.
          </p>
        </div>

        <div className="flex flex-col justify-center">
          <span className="text-[9px] uppercase font-bold text-indigo-300/80 tracking-widest block">Faturamento Previso</span>
          <h4 className="text-xl font-extrabold font-mono text-white mt-1">
            {formatCurrency(financials.potentialRevenue)}
          </h4>
          <span className="text-[10px] text-slate-400 mt-1">Receita bruta se zerar todo estoque.</span>
        </div>

        <div className="flex flex-col justify-center">
          <span className="text-[9px] uppercase font-bold text-indigo-300/80 tracking-widest block">Lucro Líquido Teórico</span>
          <h4 className="text-xl font-extrabold font-mono text-indigo-400 mt-1">
            {formatCurrency(financials.potentialNetProfit)}
          </h4>
          <span className="text-[10px] text-slate-400 mt-1">
            Lucro restante subtraído impostos, frete, embalagens e tarifas.
          </span>
        </div>

      </div>

      {/* Caixa de Insights / Classificação de Margens e Rentabilidades */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 no-print">
        
        {/* Painel: Alto Desempenho (Margem >= 30%) */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs">
          <h4 className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider flex items-center space-x-1.5 border-b border-slate-50 pb-3 mb-4">
            <Zap size={15} className="text-emerald-500" />
            <span>Produtos Altamente Rentáveis (Margem &ge; 30%)</span>
          </h4>

          {topPerformers.length === 0 ? (
            <p className="text-[11px] text-slate-400 italic">Nenhum produto cadastrado atinge margem líquida de 30% nas configurações atuais.</p>
          ) : (
            <div className="space-y-3">
              {topPerformers.map(p => (
                <div key={p.id} className="flex items-center justify-between bg-emerald-50/20 border border-emerald-100/50 p-3 rounded-xl text-xs">
                  <div>
                    <div className="font-bold text-slate-800 truncate max-w-[200px]">{p.name}</div>
                    <span className="text-[10px] text-slate-400 font-medium">Código: {p.code} &bull; Compra: {formatCurrency(p.supplierPrice)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-bold text-emerald-700 block font-mono">{p.unitMargin.toFixed(1)}% Margem</span>
                    <span className="text-[10px] text-slate-500 font-mono font-bold">+{formatCurrency(p.unitProfit)} /un</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Painel: Margem Apertada ou Prejuízo (Margem < 15%) */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs">
          <h4 className="text-xs font-extrabold text-amber-800 uppercase tracking-wider flex items-center space-x-1.5 border-b border-slate-50 pb-3 mb-4">
            <AlertTriangle size={15} className="text-amber-500" />
            <span>Alerta de Margem Baixa (Margem &lt; 15%)</span>
          </h4>

          {cautionPerformers.length === 0 ? (
            <p className="text-[11px] text-slate-400 italic">Excelente! Nenhum produto cadastrado possui margem de lucro crítica abaixo de 15%.</p>
          ) : (
            <div className="space-y-3">
              {cautionPerformers.map(p => (
                <div key={p.id} className="flex items-center justify-between bg-amber-50/20 border border-amber-100/50 p-3 rounded-xl text-xs">
                  <div>
                    <div className="font-bold text-slate-800 truncate max-w-[200px]">{p.name}</div>
                    <span className="text-[10px] text-slate-400 font-medium">Compra: {formatCurrency(p.supplierPrice)} &bull; Venda: {formatCurrency(p.sellingPrice)}</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-[11px] font-bold block font-mono ${p.unitProfit < 0 ? 'text-rose-600' : 'text-amber-700'}`}>
                      {p.unitMargin.toFixed(1)}% Margem
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono font-bold">
                      {p.unitProfit < 0 
                        ? `Prejuízo: ${formatCurrency(Math.abs(p.unitProfit))}` 
                        : `+${formatCurrency(p.unitProfit)} /un`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Tabela de Detalhamento de Rentabilidade de Todos os Itens */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-800">Demonstrativo de Rentabilidade Unitária por Produto</h3>
          <p className="text-[11px] text-slate-400 font-medium font-mono">Planilha de custos agregados reais, preços impostos de comercialização e rentabilidade unitária líquida.</p>
        </div>

        {rankedProducts.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">Nenhum dado financeiro para listar.</div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="overflow-x-auto hidden md:block">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                    <th className="px-6 py-4">Item</th>
                    <th className="px-6 py-4 text-right">Preço Compra</th>
                    <th className="px-6 py-4 text-right">Custo Agregado</th>
                    <th className="px-6 py-4 text-right">Custo Real Final</th>
                    <th className="px-6 py-4 text-right">Preço Venda</th>
                    <th className="px-6 py-4 text-right">Margem Líquida</th>
                    <th className="px-6 py-1 text-right">Lucro Unitário</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 text-xs font-semibold font-mono">
                  {rankedProducts.map((p) => {
                    
                    let marginBadgeClass = "text-emerald-700 bg-emerald-50 border-emerald-100";
                    if (p.unitProfit < 0) {
                      marginBadgeClass = "text-rose-700 bg-rose-50 border-rose-200";
                    } else if (p.unitMargin < 15) {
                      marginBadgeClass = "text-amber-700 bg-amber-50 border-amber-200";
                    }

                    return (
                      <tr key={p.id} className="hover:bg-slate-55/35 transition-colors">
                        <td className="px-6 py-4 font-sans font-bold text-slate-800 max-w-xs truncate">
                          {p.name}
                          <div className="text-[9px] font-medium font-sans text-slate-400 mt-0.5">Sub: {p.supplierName}</div>
                        </td>
                        <td className="px-6 py-4 text-right text-slate-400 font-bold">
                          {formatCurrency(p.supplierPrice)}
                        </td>
                        <td className="px-6 py-4 text-right text-slate-400 font-medium">
                          + {formatCurrency(p.realCost - p.supplierPrice)}
                        </td>
                        <td className="px-6 py-4 text-right text-slate-500 font-bold">
                          {formatCurrency(p.realCost)}
                        </td>
                        <td className="px-6 py-4 text-right text-indigo-600 font-extrabold">
                          {formatCurrency(p.sellingPrice)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`${marginBadgeClass} px-2 py-0.5 rounded-sm border font-bold text-[10px]`}>
                            {p.unitMargin.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-slate-900 font-extrabold">
                          <span className={p.unitProfit < 0 ? 'text-rose-600' : 'text-emerald-600'}>
                            {formatCurrency(p.unitProfit)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="grid grid-cols-1 gap-4 p-4 md:hidden">
              {rankedProducts.map((p) => {
                let marginBadgeClass = "text-emerald-750 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20";
                if (p.unitProfit < 0) {
                  marginBadgeClass = "text-rose-750 bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20";
                } else if (p.unitMargin < 15) {
                  marginBadgeClass = "text-amber-700 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20";
                }

                return (
                  <div key={p.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-xl shadow-xs space-y-3">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Subfornecedor: {p.supplierName || "Geral"}</span>
                      <h4 className="text-xs font-bold text-slate-850 dark:text-slate-100 mt-0.5 line-clamp-1">{p.name}</h4>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 text-[10px] py-2 border-y border-slate-50 dark:border-slate-800/80">
                      <div>
                        <span className="text-slate-400 dark:text-slate-500 text-[8px] uppercase block font-bold">Preço Compra</span>
                        <span className="font-mono font-bold text-slate-705 dark:text-slate-350">{formatCurrency(p.supplierPrice)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 dark:text-slate-500 text-[8px] uppercase block font-bold">Agregado</span>
                        <span className="font-mono font-semibold text-slate-505 dark:text-slate-400">+{formatCurrency(p.realCost - p.supplierPrice)}</span>
                      </div>
                      <div>
                        <span className="text-indigo-650 dark:text-indigo-400 text-[8px] uppercase block font-bold">Custo Final</span>
                        <span className="font-mono font-bold text-indigo-705 dark:text-indigo-450">{formatCurrency(p.realCost)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1.5 gap-2 text-xs">
                      <div>
                        <span className="text-slate-400 dark:text-slate-500 text-[8px] uppercase block font-bold mb-0.5">Preço Venda</span>
                        <span className="font-mono font-extrabold text-indigo-600 dark:text-indigo-450">{formatCurrency(p.sellingPrice)}</span>
                      </div>

                      <div className="text-right">
                        <span className="text-slate-450 dark:text-slate-550 text-[8px] uppercase block font-bold mb-0.5">Rentabilidade Unitária</span>
                        <div className="flex items-center space-x-1.5 justify-end">
                          <span className={`${marginBadgeClass} px-2 py-0.5 rounded-md border font-bold text-[10px] font-mono`}>
                            {p.unitMargin.toFixed(1)}%
                          </span>
                          <span className={`font-mono font-extrabold ${p.unitProfit < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {formatCurrency(p.unitProfit)}
                          </span>
                        </div>
                      </div>
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
