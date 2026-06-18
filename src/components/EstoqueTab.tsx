import React, { useState } from "react";
import { Product } from "../types";
import { formatCurrency } from "../lib/exportUtils";
import { 
  PackageOpen, 
  Plus, 
  Search, 
  ExternalLink, 
  ShoppingCart, 
  Trash2, 
  AlertTriangle, 
  Edit3, 
  TrendingUp,
  Tag,
  Link as LinkIcon,
  Store,
  RefreshCw,
  Eye,
  X
} from "lucide-react";

interface EstoqueTabProps {
  products: Product[];
  onAddProduct: (product: Omit<Product, "id" | "createdAt">) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onRecordSale: (productId: string, quantity: number, salePrice: number) => void;
}

export default function EstoqueTab({ 
  products, 
  onAddProduct, 
  onUpdateProduct, 
  onDeleteProduct,
  onRecordSale
}: EstoqueTabProps) {
  
  // State for search & filters
  const [searchTerm, setSearchTerm] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("");
  const [stockStatusFilter, setStockStatusFilter] = useState("all"); // 'all', 'low', 'out'

  // State for manual product modal/form
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [link, setLink] = useState("");
  const [quantity, setQuantity] = useState<number>(0);
  const [supplierPrice, setSupplierPrice] = useState<number>(0);
  const [supplierName, setSupplierName] = useState("");
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [minStock, setMinStock] = useState<number>(5);

  // State for editing Links directly 
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [tempLinkValue, setTempLinkValue] = useState("");

  // State for Quick Sale modal
  const [selectedProductForSale, setSelectedProductForSale] = useState<Product | null>(null);
  const [saleQty, setSaleQty] = useState<number>(1);
  const [salePrice, setSalePrice] = useState<number>(0);

  // State for details modal (mobile popup)
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

  // States for quantity editing (two-stage modal flow)
  const [quantityEditProduct, setQuantityEditProduct] = useState<Product | null>(null);
  const [tempQuantityValue, setTempQuantityValue] = useState<number>(0);
  const [showQtyConfirmModal, setShowQtyConfirmModal] = useState(false);

  // States for line link edit in details modal
  const [isEditingModalLink, setIsEditingModalLink] = useState(false);
  const [modalLinkValue, setModalLinkValue] = useState("");

  // States for minStock edit in details modal
  const [isEditingModalMinStock, setIsEditingModalMinStock] = useState(false);
  const [modalMinStockValue, setModalMinStockValue] = useState<number>(5);

  // States for pagination (40 items per page limit)
  const [currentPage, setCurrentPage] = useState(1);

  // Get list of unique suppliers for filtering
  const uniqueSuppliers = Array.from(new Set(products.map(p => p.supplierName).filter(Boolean)));

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.supplierName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSupplier = supplierFilter === "" || p.supplierName === supplierFilter;
    
    let matchesStock = true;
    const minStockVal = p.minStock !== undefined ? p.minStock : 5;
    if (stockStatusFilter === "low") {
      matchesStock = p.quantity > 0 && p.quantity <= minStockVal;
    } else if (stockStatusFilter === "out") {
      matchesStock = p.quantity === 0;
    } else if (stockStatusFilter === "normal") {
      matchesStock = p.quantity > minStockVal;
    }

    return matchesSearch && matchesSupplier && matchesStock;
  });

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, supplierFilter, stockStatusFilter]);

  // Paginate filtered products
  const ITEMS_PER_PAGE = 40;
  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const startEditModalLink = () => {
    if (viewingProduct) {
      setModalLinkValue(viewingProduct.link || "");
      setIsEditingModalLink(true);
    }
  };

  const saveModalLink = () => {
    if (viewingProduct) {
      onUpdateProduct({
        ...viewingProduct,
        link: modalLinkValue
      });
      setViewingProduct({
        ...viewingProduct,
        link: modalLinkValue
      });
      setIsEditingModalLink(false);
    }
  };

  const startEditModalMinStock = () => {
    if (viewingProduct) {
      setModalMinStockValue(viewingProduct.minStock !== undefined ? viewingProduct.minStock : 5);
      setIsEditingModalMinStock(true);
    }
  };

  const saveModalMinStock = () => {
    if (viewingProduct) {
      const updated = {
        ...viewingProduct,
        minStock: Number(modalMinStockValue) || 0
      };
      onUpdateProduct(updated);
      setViewingProduct(updated);
      setIsEditingModalMinStock(false);
    }
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) {
      alert("Por favor, preencha o Nome e o Código do item.");
      return;
    }
    onAddProduct({
      code,
      name,
      link,
      quantity: Number(quantity) || 0,
      supplierPrice: Number(supplierPrice) || 0,
      supplierName: supplierName || "Fornecedor Manual",
      sellingPrice: Number(sellingPrice) || Number(supplierPrice) * 1.5, // default margin markup
      minStock: Number(minStock) || 0
    });

    // Reset fields
    setCode("");
    setName("");
    setLink("");
    setQuantity(0);
    setSupplierPrice(0);
    setSupplierName("");
    setSellingPrice(0);
    setMinStock(5);
    setIsAddOpen(false);
  };

  const handleStartEditLink = (product: Product) => {
    setEditingLinkId(product.id);
    setTempLinkValue(product.link || "");
  };

  const handleSaveLink = (product: Product) => {
    onUpdateProduct({
      ...product,
      link: tempLinkValue
    });
    setEditingLinkId(null);
  };

  const openSaleModal = (product: Product) => {
    setSelectedProductForSale(product);
    setSaleQty(1);
    setSalePrice(product.sellingPrice);
  };

  const handleConfirmSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForSale) return;
    
    if (saleQty <= 0) {
      alert("A quantidade deve ser maior do que 0.");
      return;
    }

    if (saleQty > selectedProductForSale.quantity) {
      alert(`Quantidade indisponível em estoque! Estoque atual: ${selectedProductForSale.quantity} unidades.`);
      return;
    }

    onRecordSale(selectedProductForSale.id, saleQty, salePrice);
    setSelectedProductForSale(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Barra de Ações Rápidas & Filtros */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Barra de Pesquisa */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Pesquisar por nome, código ou fornecedor..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition text-slate-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Seletores de Filtros */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Fornecedor */}
          <select
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-600 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
            value={supplierFilter}
            onChange={(e) => setSupplierFilter(e.target.value)}
          >
            <option value="">Todos Fornecedores</option>
            {uniqueSuppliers.map(sup => (
              <option key={sup} value={sup}>{sup}</option>
            ))}
          </select>

          {/* Status de estoque */}
          <select
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-600 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
            value={stockStatusFilter}
            onChange={(e) => setStockStatusFilter(e.target.value)}
          >
            <option value="all">Todo Estoque</option>
            <option value="normal">Estoque Normal (&gt; 10)</option>
            <option value="low">Estoque Baixo (&le; 10)</option>
            <option value="out">Sem Estoque (Zero)</option>
          </select>

          {/* Botão de Adicionar Manual */}
          <button
            onClick={() => setIsAddOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition duration-200 shadow-sm flex items-center space-x-1.5"
            id="btn-add-product"
          >
            <Plus size={16} />
            <span>Cadastrar Produto</span>
          </button>

        </div>

      </div>

      {/* Tabela de Produtos */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        
        {filteredProducts.length === 0 ? (
          <div className="py-16 text-center">
            <PackageOpen size={48} className="mx-auto text-slate-300 stroke-[1.5] mb-3" />
            <p className="text-slate-500 font-medium text-sm">Nenhum produto cadastrado no estoque.</p>
            <p className="text-slate-400 text-xs mt-1">Experimente importar um XML ou cadastrar manualmente acima.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="overflow-x-auto hidden md:block">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider">
                    <th className="px-6 py-4">Código / SKU</th>
                    <th className="px-6 py-4">Item / E-commerce Link</th>
                    <th className="px-6 py-4">Fornecedor</th>
                    <th className="px-6 py-4 text-center">Qtde Estoque</th>
                    <th className="px-6 py-4 text-right">Compra Unit.</th>
                    <th className="px-6 py-4 text-right">Venda Unit.</th>
                    <th className="px-6 py-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 text-xs font-medium">
                  {paginatedProducts.map((p) => {
                    
                    // Stock style helper
                    const currentMinStock = p.minStock !== undefined ? p.minStock : 5;
                    let stockBadgeClass = "bg-emerald-50 text-emerald-700 border-emerald-100";
                    if (p.quantity === 0) {
                      stockBadgeClass = "bg-rose-50 text-rose-700 border-rose-200";
                    } else if (p.quantity <= currentMinStock) {
                      stockBadgeClass = "bg-amber-50 text-amber-700 border-amber-200";
                    }

                    return (
                      <tr key={p.id} className="hover:bg-slate-55/35 transition-colors">
                        
                        {/* Código */}
                        <td className="px-6 py-4">
                           <span className="font-mono text-slate-500 bg-slate-50 px-2.5 py-1 text-[11px] rounded-md border border-slate-100">
                            {p.code}
                          </span>
                        </td>

                        {/* Item e links */}
                        <td className="px-6 py-4 max-w-sm">
                          <div className="font-bold text-slate-800 line-clamp-1 mb-1">{p.name}</div>
                          
                          {/* URL interface */}
                          <div className="flex items-center space-x-1.5 mt-1">
                            {editingLinkId === p.id ? (
                              <div className="flex items-center space-x-1.5 w-full">
                                <input
                                  type="text"
                                  className="w-full max-w-[200px] px-2 py-0.5 border border-indigo-400 bg-indigo-50/10 rounded-md focus:outline-hidden text-[10px]"
                                  placeholder="Link da plataforma de vendas..."
                                  value={tempLinkValue}
                                  onChange={(e) => setTempLinkValue(e.target.value)}
                                />
                                <button 
                                  onClick={() => handleSaveLink(p)}
                                  className="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-sm hover:bg-emerald-100 text-[9px] font-bold cursor-pointer"
                                >
                                  Salvar
                                </button>
                                <button 
                                  onClick={() => setEditingLinkId(null)}
                                  className="text-slate-500 hover:text-slate-700 text-[9px] cursor-pointer"
                                >
                                  Cancelar
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                                {p.link ? (
                                  <a 
                                    href={p.link} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-indigo-600 hover:text-indigo-500 flex items-center space-x-0.5 font-bold"
                                  >
                                    <LinkIcon size={12} className="inline mr-0.5" />
                                    <span>E-commerce</span>
                                    <ExternalLink size={10} />
                                  </a>
                                ) : (
                                  <span className="italic text-slate-400">Sem link associado</span>
                                )}
                                <button 
                                  onClick={() => handleStartEditLink(p)}
                                  className="text-[10px] text-slate-500 hover:text-indigo-600 underline font-semibold ml-2 cursor-pointer"
                                >
                                  Editar Link
                                </button>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Fornecedor */}
                        <td className="px-6 py-4">
                          <div className="text-slate-600 flex items-center space-x-1">
                            <Store size={12} className="text-slate-400" />
                            <span className="truncate max-w-[140px]">{p.supplierName}</span>
                          </div>
                        </td>

                        {/* Estoque */}
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center items-center space-x-1.5">
                            <span className={`${stockBadgeClass} font-mono px-2.5 py-1 rounded-sm border text-xs font-bold text-center flex items-center space-x-1.5`}>
                              <span>{p.quantity} un</span>
                              {p.quantity <= currentMinStock && (
                                <AlertTriangle 
                                  size={12} 
                                  className="text-amber-500 shrink-0" 
                                  title={`Abaixo do estoque mínimo (${currentMinStock} un)`} 
                                />
                              )}
                            </span>
                            <button 
                              onClick={() => {
                                setQuantityEditProduct(p);
                                setTempQuantityValue(p.quantity);
                              }}
                              className="p-1 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-450 hover:text-indigo-600 rounded-md transition cursor-pointer"
                              title="Editar Quantidade"
                            >
                              <Edit3 size={11} />
                            </button>
                          </div>
                        </td>

                        {/* Preço de Compra */}
                        <td className="px-6 py-4 text-right text-slate-500 font-mono font-bold">
                          {formatCurrency(p.supplierPrice)}
                        </td>

                        {/* Preço de Venda */}
                        <td className="px-6 py-4 text-right text-indigo-600 font-mono font-bold">
                          {formatCurrency(p.sellingPrice)}
                        </td>

                        {/* Ações */}
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center items-center space-x-1">
                            
                            {/* Visualizar detalhes */}
                            <button
                              onClick={() => setViewingProduct(p)}
                              className="p-1.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 text-slate-500 hover:text-indigo-600 rounded-lg transition cursor-pointer"
                              title="Visualizar Detalhes e Histórico de Preços"
                            >
                              <Eye size={15} />
                            </button>

                            {/* Registrar venda */}
                            <button
                              onClick={() => openSaleModal(p)}
                              disabled={p.quantity <= 0}
                              className={`p-1.5 rounded-lg border flex items-center justify-center transition cursor-pointer ${
                                p.quantity > 0 
                                  ? "bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700"
                                  : "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                              }`}
                              title="Registrar Saída (Venda)"
                            >
                              <ShoppingCart size={15} />
                            </button>

                            {/* Excluir Item */}
                            <button
                              onClick={() => {
                                  if (confirm(`Tem certeza que deseja excluir o produto "${p.name}"?`)) {
                                    onDeleteProduct(p.id);
                                  }
                              }}
                              className="p-1.5 bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-400 hover:text-rose-600 rounded-lg transition shrink-0"
                              title="Excluir produto do Estoque"
                            >
                              <Trash2 size={15} />
                            </button>

                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="grid grid-cols-1 gap-4 p-4 md:hidden">
              {paginatedProducts.map((p) => {
                const currentMinStock = p.minStock !== undefined ? p.minStock : 5;
                let stockBadgeClass = "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20";
                if (p.quantity === 0) {
                  stockBadgeClass = "bg-rose-50 text-rose-700 border-rose-250 dark:bg-rose-500/10 dark:text-rose-450 dark:border-rose-500/20";
                } else if (p.quantity <= currentMinStock) {
                  stockBadgeClass = "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20";
                }

                return (
                  <div key={p.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-xl shadow-xs space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="font-mono text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-2.5 py-0.5 text-[10px] rounded-md border border-slate-100 dark:border-slate-800 font-bold">
                          {p.code}
                        </span>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 mt-1.5 truncate">{p.name}</h4>
                      </div>
                      <span className={`${stockBadgeClass} text-[11px] font-bold px-2 py-1 rounded-md border shrink-0`}>
                        {p.quantity} un
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] dark:text-slate-300">
                      <div>
                        <span className="text-slate-450 dark:text-slate-500 block text-[9px] uppercase font-bold">Compra Unit.</span>
                        <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{formatCurrency(p.supplierPrice)}</span>
                      </div>
                      <div>
                        <span className="text-slate-450 dark:text-slate-500 block text-[9px] uppercase font-bold">Venda Unit.</span>
                        <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{formatCurrency(p.sellingPrice)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 gap-2">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => setViewingProduct(p)}
                          className="bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100/60 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold text-[11px] px-2 py-1.5 rounded-lg flex items-center space-x-1 border border-indigo-100/50 dark:border-indigo-500/10 transition cursor-pointer font-bold"
                        >
                          <Eye size={12} />
                          <span>Visualizar</span>
                        </button>

                        <button
                          onClick={() => {
                            setQuantityEditProduct(p);
                            setTempQuantityValue(p.quantity);
                          }}
                          className="bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100/60 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold text-[11px] px-2 py-1.5 rounded-lg flex items-center space-x-1 border border-indigo-100/50 dark:border-indigo-500/10 transition cursor-pointer font-bold"
                        >
                          <Edit3 size={12} />
                          <span>Qtd</span>
                        </button>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => openSaleModal(p)}
                          disabled={p.quantity <= 0}
                          className={`p-2 rounded-lg border flex items-center justify-center transition cursor-pointer ${
                            p.quantity > 0 
                              ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-800 cursor-not-allowed"
                          }`}
                          title="Registrar Saída (Venda)"
                        >
                          <ShoppingCart size={13} />
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`Tem certeza que deseja excluir o produto "${p.name}"?`)) {
                              onDeleteProduct(p.id);
                            }
                          }}
                          className="p-2 bg-slate-50 dark:bg-slate-850 hover:bg-rose-50 dark:hover:bg-rose-500/20 border border-slate-200 dark:border-slate-800 hover:border-rose-200 text-slate-400 hover:text-rose-600 rounded-lg transition shrink-0"
                          title="Excluir"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination footer */}
            <div className="bg-slate-50/75 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Mostrando <span className="font-bold text-slate-700 dark:text-slate-350">{Math.min(totalItems, (currentPage - 1) * ITEMS_PER_PAGE + 1)}</span> a <span className="font-bold text-slate-700 dark:text-slate-350">{Math.min(totalItems, currentPage * ITEMS_PER_PAGE)}</span> de <span className="font-bold text-slate-700 dark:text-slate-350">{totalItems}</span> itens (Página <span className="font-bold text-slate-700 dark:text-slate-350">{currentPage}</span> de <span className="font-bold text-slate-705 dark:text-slate-350">{totalPages}</span>)
              </div>
              <div className="flex items-center space-x-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold select-none transition ${
                    currentPage === 1
                      ? "bg-slate-100 border-slate-200 text-slate-400 dark:bg-slate-800 dark:border-slate-750 dark:text-slate-500 cursor-not-allowed"
                      : "bg-white hover:bg-slate-50 dark:bg-slate-850 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-750 text-slate-700 dark:text-slate-300 cursor-pointer"
                  }`}
                >
                  Anterior
                </button>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold select-none transition ${
                    currentPage >= totalPages
                      ? "bg-slate-100 border-slate-200 text-slate-400 dark:bg-slate-800 dark:border-slate-750 dark:text-slate-500 cursor-not-allowed"
                      : "bg-emerald-600 hover:bg-emerald-500 border-emerald-600 text-white shadow-xs cursor-pointer font-bold"
                  }`}
                  id="next-page-btn"
                >
                  Ir para os próximos 40 itens
                </button>
              </div>
            </div>
          </>
        )}

      </div>

      {/* MODAL: REGISTRAR VENDA (Outflow) */}
      {selectedProductForSale && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 border border-slate-100 animate-zoomIn shadow-xl">
            <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center space-x-2">
              <ShoppingCart className="text-emerald-600" />
              <span>Registrar Saída de Venda</span>
            </h3>
            <p className="text-xs text-slate-400 border-b border-slate-100 pb-3 mb-4">
              Registre a venda para subtrair unidades do estoque e gerar lançamentos financeiros.
            </p>

            <form onSubmit={handleConfirmSale} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Produto Selecionado</label>
                <div className="text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
                  {selectedProductForSale.name}
                  <div className="text-[10px] text-slate-500 font-medium mt-1 font-mono">
                    Código: {selectedProductForSale.code} &bull; Estoque atual: {selectedProductForSale.quantity} unidades
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Qtd Comprada/Vendida</label>
                  <input
                    type="number"
                    min="1"
                    max={selectedProductForSale.quantity}
                    value={saleQty}
                    onChange={(e) => setSaleQty(Math.min(selectedProductForSale.quantity, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Valor Unitário Venda (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={salePrice}
                    onChange={(e) => setSalePrice(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div className="bg-emerald-50/70 border border-emerald-100 p-3 rounded-xl flex items-center justify-between text-emerald-800 font-bold mb-2">
                <span className="text-[11px]">Valor Total da Venda:</span>
                <span className="font-mono text-sm">{formatCurrency(saleQty * salePrice)}</span>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedProductForSale(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition cursor-pointer shadow-sm flex items-center space-x-1"
                >
                  <ShoppingCart size={14} />
                  <span>Confirmar Receita</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CADASTRO MANUAL DE NOVO PRODUTO */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 flex-wrap">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 border border-slate-100 shadow-xl overflow-y-auto max-h-[90vh]">
            <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center space-x-2">
              <PackageOpen className="text-indigo-600" />
              <span>Novo Cadastro de Produto</span>
            </h3>
            <p className="text-xs text-slate-400 border-b border-slate-100 pb-3 mb-4">
              Adicione itens manualmente para complementar o controle do seu estoque.
            </p>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Código de Barras / SKU *</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Ex: 789102030401"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Fornecedor / Compra</label>
                  <input
                    type="text"
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    placeholder="Ex: Eletronics Express"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Nome / Descrição do Produto *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Mouse Sem Fio Recarregável"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">URL / Link do E-commerce (Opcional)</label>
                <input
                  type="url"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="Ex: https://www.mercadolivre.com.br/produto-abc"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Qtd Inicial</label>
                  <input
                    type="number"
                    min="0"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono font-bold w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Compra Unit. (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={supplierPrice}
                    onChange={(e) => setSupplierPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono font-bold w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Venda Unit. (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono font-bold w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Estoque Mínimo</label>
                  <input
                    type="number"
                    min="0"
                    value={minStock}
                    onChange={(e) => setMinStock(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono font-bold w-full"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl transition cursor-pointer shadow-sm"
                >
                  Confirmar Cadastro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VISUALIZAR CAMPOS DO PRODUTO (Mobile Popup details view) */}
      {viewingProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 animate-zoomIn shadow-xl text-slate-800 dark:text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <h3 className="text-sm font-bold flex items-center space-x-1.5 text-slate-800 dark:text-white">
                <Tag size={16} className="text-indigo-600" />
                <span>Detalhamento do Produto</span>
              </h3>
              <button 
                onClick={() => {
                  setViewingProduct(null);
                  setIsEditingModalLink(false);
                  setIsEditingModalMinStock(false);
                }} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                id="close-prod-details-modal"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Código SKU</span>
                <span className="font-mono text-xs font-bold text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-100 dark:border-slate-850 inline-block mt-1">
                  {viewingProduct.code}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Nome do Item / Descrição</span>
                <p className="text-xs font-bold text-slate-800 dark:text-white leading-normal mt-1">{viewingProduct.name}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Quantidade em Estoque</span>
                  <span className="text-xs font-bold block mt-1 dark:text-slate-300 flex items-center">
                    {viewingProduct.quantity} unidades
                    {viewingProduct.quantity <= (viewingProduct.minStock !== undefined ? viewingProduct.minStock : 5) && (
                      <span className="text-amber-550 dark:text-amber-400 font-bold ml-1.5 inline-flex items-center gap-0.5 animate-pulse" title="Abaixo do estoque mínimo">
                        <AlertTriangle size={12} />
                        <span className="text-[9px] uppercase tracking-wider">Abaixo do Mín.</span>
                      </span>
                    )}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold text-slate-400 dark:text-slate-500 mb-0.5">Estoque Mínimo</span>
                  {isEditingModalMinStock ? (
                    <div className="flex items-center space-x-1 mt-1">
                      <input
                        type="number"
                        min="0"
                        className="w-16 px-2 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-indigo-400 focus:outline-hidden rounded-lg text-slate-800 dark:text-slate-100 font-mono font-bold"
                        value={modalMinStockValue}
                        onChange={(e) => setModalMinStockValue(Math.max(0, parseInt(e.target.value) || 0))}
                      />
                      <button
                        type="button"
                        onClick={saveModalMinStock}
                        className="bg-emerald-600 hover:bg-emerald-550 text-white font-bold text-[10px] px-2 py-1 rounded-md cursor-pointer shrink-0"
                      >
                        OK
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingModalMinStock(false)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium text-[10px] cursor-pointer shrink-0"
                      >
                        Canc
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs font-bold block dark:text-slate-300">
                        {viewingProduct.minStock !== undefined ? viewingProduct.minStock : 5} unidades
                      </span>
                      <button
                        type="button"
                        onClick={startEditModalMinStock}
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 hover:underline text-[10px] font-bold cursor-pointer"
                      >
                        Editar
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Nome do Fornecedor</span>
                <span className="text-xs font-bold block mt-1 truncate dark:text-slate-300">{viewingProduct.supplierName || "Não registrado"}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-50/50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-450 block uppercase font-bold">Preço do Fornecedor (Compra)</span>
                  <span className="font-mono text-xs font-bold block text-slate-800 dark:text-white mt-1">{formatCurrency(viewingProduct.supplierPrice)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-450 block uppercase font-bold">Preço Final de Venda</span>
                  <span className="font-mono text-xs font-bold block text-indigo-600 dark:text-indigo-400 mt-1">{formatCurrency(viewingProduct.sellingPrice)}</span>
                </div>
              </div>

              {/* HISTÓRICO DOS ÚLTIMOS 5 PREÇOS DE VENDA */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-100 dark:border-slate-805">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block uppercase font-bold mb-2 flex items-center gap-1">
                  <TrendingUp size={12} className="text-indigo-500" />
                  Histórico dos Últimos 5 Preços de Venda
                </span>
                <div className="space-y-1.5">
                  {((viewingProduct.priceHistory && viewingProduct.priceHistory.length > 0) 
                    ? viewingProduct.priceHistory 
                    : [viewingProduct.sellingPrice]
                  ).slice(0, 5).map((price, idx, arr) => {
                    const nextPrice = arr[idx + 1];
                    let trendIcon = null;
                    if (nextPrice !== undefined) {
                      if (price > nextPrice) {
                        trendIcon = <span className="text-emerald-500 font-bold ml-1">↑</span>;
                      } else if (price < nextPrice) {
                        trendIcon = <span className="text-rose-505 font-bold ml-1">↓</span>;
                      } else {
                        trendIcon = <span className="text-slate-400 font-semibold ml-1">=</span>;
                      }
                    }
                    return (
                      <div key={idx} className="flex items-center justify-between text-[11px] py-1 border-b border-dashed border-slate-100 dark:border-slate-800 last:border-0 last:pb-0">
                        <span className="text-slate-550 dark:text-slate-400 font-medium">
                          {idx === 0 ? "Preço Atual" : `Preço Anterior ${idx}`}
                        </span>
                        <span className="font-mono font-bold text-slate-700 dark:text-slate-300 flex items-center">
                          {formatCurrency(price)}
                          {trendIcon}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* LINK E-COMMERCE INTEGRADO COM EDIÇÃO INTERNA */}
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold mb-1">
                  Link E-commerce Associado
                </span>
                {isEditingModalLink ? (
                  <div className="flex items-center space-x-1.5 mt-1">
                    <input
                      type="text"
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-indigo-400 focus:outline-hidden rounded-xl text-slate-800 dark:text-slate-100 font-mono"
                      placeholder="Cole o link do e-commerce..."
                      value={modalLinkValue}
                      onChange={(e) => setModalLinkValue(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={saveModalLink}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-2.5 py-1.5 rounded-lg shrink-0 transition cursor-pointer"
                    >
                      Salvar
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingModalLink(false)}
                      className="text-slate-400 hover:text-slate-600 font-bold text-xs shrink-0 cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between mt-1">
                    {viewingProduct.link ? (
                      <a 
                        href={viewingProduct.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-bold flex items-center space-x-1.5 mt-1 animate-fadeIn"
                      >
                        <span>Abrir Plataforma de Vendas</span>
                        <ExternalLink size={12} />
                      </a>
                    ) : (
                      <span className="italic text-slate-400 text-xs block mt-1">Nenhum endereço cadastrado</span>
                    )}
                    <button
                      type="button"
                      onClick={startEditModalLink}
                      className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 hover:underline text-[11px] font-bold cursor-pointer"
                    >
                      Editar Link
                    </button>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100 dark:border-slate-850 pt-4 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setViewingProduct(null);
                    setIsEditingModalLink(false);
                    setIsEditingModalMinStock(false);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer shadow-sm"
                >
                  Fechar Detalhes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: EDITAR QUANTIDADE (STAGE 1) */}
      {quantityEditProduct && !showQtyConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-xl animate-zoomIn">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 flex items-center space-x-2">
              <PackageOpen className="text-indigo-600" />
              <span>Editar Quantidade em Estoque</span>
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              Modifique de forma direta o saldo atual deste produto em seu estoque.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Produto</label>
                <div className="text-xs font-bold text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  {quantityEditProduct.name}
                  <div className="text-[10px] text-slate-500 font-medium mt-1">
                    SKU: {quantityEditProduct.code}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Nova Quantidade em Estoque</label>
                <input
                  type="number"
                  min="0"
                  value={tempQuantityValue}
                  onChange={(e) => setTempQuantityValue(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 rounded-xl text-xs font-mono font-bold text-slate-800 dark:text-white"
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setQuantityEditProduct(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => setShowQtyConfirmModal(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl transition cursor-pointer shadow-sm"
                >
                  Atualizar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CONFIRMAÇÃO DE QUANTIDADE (STAGE 2) */}
      {showQtyConfirmModal && quantityEditProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl w-full max-w-sm p-6 shadow-xl animate-scaleIn">
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-amber-50 dark:bg-amber-500/10 rounded-full flex items-center justify-center text-amber-500">
                <AlertTriangle size={24} />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Confirmar Alteração de Estoque
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  tem certeza que deseja alterar a quantidade?
                </p>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-2.5 text-xs font-semibold font-mono text-slate-700 dark:text-slate-350">
                  De <span className="text-rose-500">{quantityEditProduct.quantity}</span> para <span className="text-emerald-500">{tempQuantityValue}</span> unidades
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowQtyConfirmModal(false)}
                  className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onUpdateProduct({
                      ...quantityEditProduct,
                      quantity: tempQuantityValue
                    });
                    setQuantityEditProduct(null);
                    setShowQtyConfirmModal(false);
                  }}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                  id="btn-confirm-qty-change"
                >
                  ALTERAR
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
