import { Product, Sale, CostSettings } from "../types";

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "prod-001",
    code: "789102030401",
    name: "Fone de Ouvido Bluetooth Premium Noise-Cancelling Pro",
    link: "https://www.mercadolivre.com.br",
    quantity: 45,
    supplierPrice: 120.00,
    supplierName: "Eletronics Express Ltda",
    sellingPrice: 329.90,
    createdAt: "2026-05-10T10:15:00.000Z"
  },
  {
    id: "prod-002",
    code: "789102030402",
    name: "Teclado Mecânico RGB Wireless - Layout ABNT2",
    link: "https://shop.shopee.com.br",
    quantity: 22,
    supplierPrice: 185.00,
    supplierName: "Master Teclados Corp",
    sellingPrice: 489.00,
    createdAt: "2026-05-12T14:30:00.000Z"
  },
  {
    id: "prod-003",
    code: "789102030403",
    name: "Mouse Gamer Ergonômico RGB 16000 DPI",
    link: "https://www.amazon.com.br",
    quantity: 50,
    supplierPrice: 75.00,
    supplierName: "Eletronics Express Ltda",
    sellingPrice: 199.90,
    createdAt: "2026-05-15T09:00:00.000Z"
  },
  {
    id: "prod-004",
    code: "789102030404",
    name: "Smartwatch Sport Track IP68 GPS Integrado",
    link: "",
    quantity: 12,
    supplierPrice: 240.00,
    supplierName: "Direct Imports S.A.",
    sellingPrice: 599.90,
    createdAt: "2026-05-18T16:45:00.000Z"
  },
  {
    id: "prod-005",
    code: "789102030405",
    name: "Carregador Portátil Powerbank 20000mAh Power Delivery",
    link: "https://www.mercadolivre.com.br",
    quantity: 5,
    supplierPrice: 55.00,
    supplierName: "Direct Imports S.A.",
    sellingPrice: 149.90,
    createdAt: "2026-05-20T11:20:00.000Z"
  }
];

export const MOCK_SALES: Sale[] = [
  {
    id: "sale-001",
    productId: "prod-001",
    productName: "Fone de Ouvido Bluetooth Premium Noise-Cancelling Pro",
    quantity: 2,
    unitPrice: 329.90,
    totalValue: 659.80,
    profit: 327.90, // Calculated dynamically based on simulated costs too
    date: "2026-06-01"
  },
  {
    id: "sale-002",
    productId: "prod-003",
    productName: "Mouse Gamer Ergonômico RGB 16000 DPI",
    quantity: 5,
    unitPrice: 199.90,
    totalValue: 999.50,
    profit: 541.00,
    date: "2026-06-04"
  },
  {
    id: "sale-003",
    productId: "prod-002",
    productName: "Teclado Mecânico RGB Wireless - Layout ABNT2",
    quantity: 1,
    unitPrice: 489.00,
    totalValue: 489.00,
    profit: 245.75,
    date: "2026-06-10"
  },
  {
    id: "sale-004",
    productId: "prod-005",
    productName: "Carregador Portátil Powerbank 20000mAh Power Delivery",
    quantity: 3,
    unitPrice: 149.90,
    totalValue: 449.70,
    profit: 236.40,
    date: "2026-06-15"
  }
];
