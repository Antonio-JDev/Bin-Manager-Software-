export interface Product {
  id: string;
  code: string;
  name: string;
  link: string;
  quantity: number;
  supplierPrice: number;
  supplierName: string;
  sellingPrice: number;
  createdAt: string;
  priceHistory?: number[];
  minStock?: number;
}

export interface Sale {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  profit: number;
  date: string;
}

export interface CostSettings {
  taxRate: number; // Porcentagem de imposto de compra/venda (%)
  shippingCostUnit: number; // Custo de frete por unidade (R$)
  otherFeesUnit: number; // Outras taxas fixas por unidade (R$)
  platformFeeRate: number; // Comissão da plataforma de e-commerce (%)
  companyName?: string; // Nome da empresa
  userName?: string; // Nome do usuário
}

export const DEFAULT_COST_SETTINGS: CostSettings = {
  taxRate: 5,
  shippingCostUnit: 0,
  otherFeesUnit: 0,
  platformFeeRate: 10,
  companyName: "Minha Empresa",
  userName: ""
};
