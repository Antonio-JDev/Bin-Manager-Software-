import { Product, Sale, CostSettings } from "../types";

/**
 * Formata um número como moeda brasileira (BRL)
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value);
}

/**
 * Calcula o custo total de um produto somando os custos agregados globais
 */
export function calculateTotalCost(supplierPrice: number, settings: CostSettings): number {
  const taxAmount = supplierPrice * (settings.taxRate / 100);
  const platformFeeFactor = 1 - (settings.platformFeeRate / 100);
  
  // Fórmula de custo agregado considerando imposto, frete e outras taxas fixas
  // Custo unitário = (Preço fornecedor + Imposto + Frete unitário + Outras taxas)
  return supplierPrice + taxAmount + settings.shippingCostUnit + settings.otherFeesUnit;
}

/**
 * Calcula o ganho real de um produto dadas as configurações de plataforma
 */
export function calculateProfitAndMargin(sellingPrice: number, totalCost: number, settings: CostSettings): { profit: number; margin: number } {
  if (sellingPrice <= 0) {
    return { profit: -totalCost, margin: -100 };
  }
  
  // Comissão cobrada pela plataforma de vendas (de acordo com a taxa cadastrada)
  const platformFee = sellingPrice * (settings.platformFeeRate / 100);
  
  // Lucro unitário líquido = Preço Venda - Custo Total - Comissão Plataforma
  const profit = sellingPrice - totalCost - platformFee;
  const margin = (profit / sellingPrice) * 100;
  
  return { profit, margin };
}

/**
 * Exporta uma tabela de produtos e rentabilidade para CSV (compatível com Excel)
 */
export function exportProductsToCSV(products: Product[], settings: CostSettings, sales: Sale[]): void {
  // UTF-8 BOM para garantir acentos perfeitos no Excel
  let csvContent = "\uFEFF";
  
  // Redação dos cabeçalhos
  const headers = [
    "CODGIO",
    "PRODUTO",
    "FORNECEDOR",
    "ESTOQUE ATUAL",
    "PRECO FORNECEDOR (R$)",
    "CUSTO TOTAL (R$)",
    "PRECO DE VENDA (R$)",
    "LUCRO UNITARIO ESTIMADO (R$)",
    "MARGEM DE LUCRO (%)",
    "VALOR TOTAL ESTOQUE (PROVEDOR)",
    "RETORNO ESTIMADO TOTAL (LUCRO)",
    "VENDAS EFETUADAS (QTD)",
    "RECEITA REAL (R$)",
    "LUCRO REAL OBTIDO (R$)"
  ];
  
  csvContent += headers.join(";") + "\n";
  
  products.forEach(p => {
    const totalCost = calculateTotalCost(p.supplierPrice, settings);
    const { profit, margin } = calculateProfitAndMargin(p.sellingPrice, totalCost, settings);
    const stockValuation = p.quantity * totalCost;
    const estimatedReturn = p.quantity * profit;
    
    // Calcular dados reais de vendas para este item
    const itemSales = sales.filter(s => s.productId === p.id);
    const salesQty = itemSales.reduce((acc, curr) => acc + curr.quantity, 0);
    const salesRevenue = itemSales.reduce((acc, curr) => acc + curr.totalValue, 0);
    const salesRealProfit = itemSales.reduce((acc, curr) => acc + curr.profit, 0);
    
    const row = [
      `"${p.code}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.supplierName.replace(/"/g, '""')}"`,
      p.quantity,
      p.supplierPrice.toFixed(2).replace(".", ","),
      totalCost.toFixed(2).replace(".", ","),
      p.sellingPrice.toFixed(2).replace(".", ","),
      profit.toFixed(2).replace(".", ","),
      margin.toFixed(1).replace(".", ","),
      stockValuation.toFixed(2).replace(".", ","),
      estimatedReturn.toFixed(2).replace(".", ","),
      salesQty,
      salesRevenue.toFixed(2).replace(".", ","),
      salesRealProfit.toFixed(2).replace(".", ",")
    ];
    
    csvContent += row.join(";") + "\n";
  });
  
  // Criar e engajar download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  
  const today = new Date().toISOString().split("T")[0];
  link.setAttribute("href", url);
  link.setAttribute("download", `relatorio_financeiro_loja_${today}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Exporta dados de vendas (saídas) estruturados para CSV
 */
export function exportSalesToCSV(sales: Sale[]): void {
  let csvContent = "\uFEFF";
  
  const headers = [
    "DATA DA VENDA",
    "PRODUTO",
    "QUANTIDADE",
    "VALOR UNITARIO (R$)",
    "VALOR TOTAL (R$)",
    "LUCRO LIQUIDO OBTIDO (R$)"
  ];
  
  csvContent += headers.join(";") + "\n";
  
  sales.forEach(s => {
    const row = [
      s.date,
      `"${s.productName.replace(/"/g, '""')}"`,
      s.quantity,
      s.unitPrice.toFixed(2).replace(".", ","),
      s.totalValue.toFixed(2).replace(".", ","),
      s.profit.toFixed(2).replace(".", ",")
    ];
    
    csvContent += row.join(";") + "\n";
  });
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  
  const today = new Date().toISOString().split("T")[0];
  link.setAttribute("href", url);
  link.setAttribute("download", `registro_vendas_loja_${today}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
