import React, { useState } from "react";
import { Sale } from "../types";
import { formatCurrency, exportSalesToCSV } from "../lib/exportUtils";
import { 
  History, 
  Calendar, 
  Trash2, 
  Download, 
  Search, 
  FileSpreadsheet,
  ArrowUpRight,
  TrendingUp,
  DollarSign,
  Eye,
  X,
  Tag
} from "lucide-react";

interface VendasTabProps {
  sales: Sale[];
  onRevertSale: (saleId: string) => void;
}

export default function VendasTab({ sales, onRevertSale }: VendasTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [viewingSale, setViewingSale] = useState<Sale | null>(null);

  const filteredSales = sales.filter(s => {
    const matchesSearch = s.productName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = dateFilter === "" || s.date === dateFilter;
    return matchesSearch && matchesDate;
  });

  const totalSalesRevenue = filteredSales.reduce((acc, curr) => acc + curr.totalValue, 0);
  const totalSalesProfit = filteredSales.reduce((acc, curr) => acc + curr.profit, 0);

  return (
    <div className="space-y-6">
      
      {/* Resumo de Vendas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* KPI: Faturamento Total */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex items-center space-x-4">
          <div className="p-3.5 bg-emerald-50 rounded-xl text-emerald-600">
            <ArrowUpRight size={22} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Faturamento Real (Filtro)</span>
            <span className="text-xl font-bold font-mono text-slate-800">{formatCurrency(totalSalesRevenue)}</span>
          </div>
        </div>

        {/* KPI: Lucro Líquido Real */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex items-center space-x-4">
          <div className="p-3.5 bg-indigo-50 rounded-xl text-indigo-600">
            <TrendingUp size={22} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Lucro Real Líquido</span>
            <span className="text-xl font-bold font-mono text-indigo-600">{formatCurrency(totalSalesProfit)}</span>
          </div>
        </div>

        {/* KPI: Quantidade de Saídas */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex items-center space-x-4">
          <div className="p-3.5 bg-slate-50 rounded-xl text-slate-600">
            <History size={22} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Transações Efetuadas</span>
            <span className="text-xl font-bold font-mono text-slate-800">{filteredSales.length} vendas</span>
          </div>
        </div>

      </div>

      {/* Barra de Filtros */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        <div className="relative flex-1 max-w-sm">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Filtrar lançamentos por nome..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 text-slate-700 font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2">
            <Calendar size={14} className="text-slate-400" />
            <input
              type="date"
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 focus:outline-hidden"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>

          <button
            onClick={() => exportSalesToCSV(sales)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-3.5 py-2.5 rounded-xl transition duration-200 flex items-center space-x-1.5 shadow-sm"
          >
            <FileSpreadsheet size={15} />
            <span>Exportar Vendas (Excel)</span>
          </button>
        </div>

      </div>

      {/* Histórico Tabela */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        
        {filteredSales.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm font-semibold">
            Nenhuma venda registrada na data selecionada. <br />
            <span className="text-xs font-medium text-slate-400 mt-1 block">Registre uma saída clicando no botão de carrinho na aba "Controle de Estoque"</span>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="overflow-x-auto hidden md:block">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                    <th className="px-6 py-4">Data</th>
                    <th className="px-6 py-4">Nome do Item</th>
                    <th className="px-6 py-4 text-center">Unidades Comercializadas</th>
                    <th className="px-6 py-4 text-right">Valor Unitário</th>
                    <th className="px-6 py-4 text-right">Faturamento Total</th>
                    <th className="px-6 py-4 text-right">Lucro Retornado</th>
                    <th className="px-6 py-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 text-xs font-semibold font-mono">
                  {filteredSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-slate-50/50 transition-colors">
                      
                      {/* Data */}
                      <td className="px-6 py-4 font-sans text-slate-500">
                        {sale.date}
                      </td>

                      {/* Titulo produto */}
                      <td className="px-6 py-4 font-sans font-bold text-slate-800 max-w-sm">
                        {sale.productName}
                      </td>

                      {/* Qtd */}
                      <td className="px-6 py-4 text-center text-slate-600">
                        {sale.quantity} un
                      </td>

                      {/* Unit */}
                      <td className="px-6 py-4 text-right text-slate-500 font-bold">
                        {formatCurrency(sale.unitPrice)}
                      </td>

                      {/* Total */}
                      <td className="px-6 py-4 text-right text-indigo-600 font-extrabold">
                        {formatCurrency(sale.totalValue)}
                      </td>

                      {/* Lucro de fato */}
                      <td className="px-6 py-4 text-right text-emerald-600 font-extrabold">
                        {formatCurrency(sale.profit)}
                      </td>

                      {/* Reverter transação */}
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => {
                            if (confirm(`Atenção: deseja com certeza estornar esta venda? ${sale.quantity} un de "${sale.productName}" retornarão automaticamente ao estoque.`)) {
                              onRevertSale(sale.id);
                            }
                          }}
                          className="p-1.5 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-400 hover:text-rose-600 rounded-lg transition cursor-pointer"
                          title="Reverter Transação (Devolver ao Estoque)"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="grid grid-cols-1 gap-4 p-4 md:hidden">
              {filteredSales.map((sale) => (
                <div key={sale.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-xl shadow-xs space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono font-bold block">{sale.date}</span>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 mt-1 truncate">{sale.productName}</h4>
                    </div>
                    <span className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-350 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border border-slate-100 dark:border-slate-800">
                      {sale.quantity} un
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] dark:text-slate-300">
                    <div>
                      <span className="text-slate-450 dark:text-slate-500 block text-[9px] uppercase font-bold">Faturamento Total</span>
                      <span className="font-mono font-extrabold text-indigo-650 dark:text-indigo-400">{formatCurrency(sale.totalValue)}</span>
                    </div>
                    <div>
                      <span className="text-slate-450 dark:text-slate-500 block text-[9px] uppercase font-bold">Lucro Líquido</span>
                      <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400">{formatCurrency(sale.profit)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 gap-2">
                    <button
                      onClick={() => setViewingSale(sale)}
                      className="bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100/60 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold text-[11px] px-3 py-1.5 rounded-lg flex items-center space-x-1 border border-indigo-100/50 dark:border-indigo-500/10 transition cursor-pointer"
                    >
                      <Eye size={12} />
                      <span>Visualizar Campos</span>
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Atenção: deseja com certeza estornar esta venda? ${sale.quantity} un de "${sale.productName}" retornarão automaticamente ao estoque.`)) {
                          onRevertSale(sale.id);
                        }
                      }}
                      className="p-2 bg-slate-50 dark:bg-slate-850 hover:bg-rose-50 dark:hover:bg-rose-500/20 border border-slate-200 dark:border-slate-800 hover:border-rose-200 text-slate-400 hover:text-rose-600 rounded-lg transition shrink-0 cursor-pointer"
                      title="Estornar e Devolver ao Estoque"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

      </div>

      {/* MODAL: VISUALIZAR CAMPOS DA TRANSACAO DE VENDA */}
      {viewingSale && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 animate-zoomIn shadow-xl text-slate-800 dark:text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <h3 className="text-sm font-bold flex items-center space-x-1.5 text-slate-800 dark:text-white">
                <History size={16} className="text-emerald-600" />
                <span>Detalhamento de Saída</span>
              </h3>
              <button 
                onClick={() => setViewingSale(null)} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                id="close-sale-details-modal"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[10px] text-slate-450 block uppercase font-bold">Data do Lançamento</span>
                <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-350 block mt-1">
                  {viewingSale.date}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-450 block uppercase font-bold">Produto Vendido</span>
                <p className="text-xs font-bold text-slate-800 dark:text-white leading-normal mt-1">{viewingSale.productName}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-slate-450 block uppercase font-bold">Quantidade Saída</span>
                  <span className="text-xs font-bold block mt-1 font-mono dark:text-slate-300">{viewingSale.quantity} unidades</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-450 block uppercase font-bold">Valor Unitário</span>
                  <span className="text-xs font-bold block mt-1 font-mono dark:text-slate-350">{formatCurrency(viewingSale.unitPrice)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-50/50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[10px] text-indigo-500 block uppercase font-bold">Faturamento Total</span>
                  <span className="font-mono text-xs font-extrabold block text-indigo-600 dark:text-indigo-400 mt-1">{formatCurrency(viewingSale.totalValue)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-500 block uppercase font-bold">Lucro Líquido</span>
                  <span className="font-mono text-xs font-extrabold block text-emerald-600 dark:text-emerald-400 mt-1">{formatCurrency(viewingSale.profit)}</span>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setViewingSale(null)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer shadow-sm"
                >
                  Fechar Detalhes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
