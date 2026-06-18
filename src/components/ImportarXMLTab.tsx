import React, { useState, useRef } from "react";
import { parsePurchaseXML, ParsedInvoice, ParsedItem } from "../lib/xmlParser";
import { formatCurrency } from "../lib/exportUtils";
import { 
  FileText, 
  Upload, 
  CheckCircle, 
  AlertTriangle, 
  CheckSquare, 
  Square,
  HelpCircle,
  FileCheck,
  PlusCircle,
  ArrowRight,
  Eye,
  X,
  Tag
} from "lucide-react";

interface ImportarXMLTabProps {
  onImportProducts: (supplierName: string, items: { code: string; name: string; quantity: number; unitPrice: number; sellingPrice: number; link: string }[]) => void;
}

// Exemplary real-shaped Brazilian NF-e XML layout so they can test instantly!
const EXAMPLE_NFE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">
  <NFe>
    <infNFe Id="NFe35220600000000000155550010001234561001234567" versao="4.00">
      <emit>
        <CNPJ>12345678000199</CNPJ>
        <xNome>Giga Atacado Distribuidora Ltda</xNome>
        <xFant>Giga Atacado</xFant>
      </emit>
      <det nItem="1">
        <prod>
          <cProd>789102030401</cProd>
          <cEAN>7891020304013</cEAN>
          <xProd>Fone de Ouvido Bluetooth Premium Noise-Cancelling Pro</xProd>
          <NCM>85183000</NCM>
          <CFOP>5102</CFOP>
          <uCom>UN</uCom>
          <qCom>15.0000</qCom>
          <vUnCom>120.0000000000</vUnCom>
          <vProd>1800.00</vProd>
        </prod>
      </det>
      <det nItem="2">
        <prod>
          <cProd>789102030455</cProd>
          <cEAN>7891020304554</cEAN>
          <xProd>Cabo HDMI 2.1 Ultra High Speed 2 Metros Blindado</xProd>
          <NCM>85444200</NCM>
          <CFOP>5102</CFOP>
          <uCom>UN</uCom>
          <qCom>50.0000</qCom>
          <vUnCom>18.5000000000</vUnCom>
          <vProd>925.00</vProd>
        </prod>
      </det>
      <det nItem="3">
        <prod>
          <cProd>789102030499</cProd>
          <cEAN>7891020304999</cEAN>
          <xProd>Mini Tripé Flexível para Smartphone c/ Articulação</xProd>
          <NCM>96200000</NCM>
          <CFOP>5102</CFOP>
          <uCom>UN</uCom>
          <qCom>30.0000</qCom>
          <vUnCom>12.2000000000</vUnCom>
          <vProd>366.00</vProd>
        </prod>
      </det>
    </infNFe>
  </NFe>
</nfeProc>`;

export default function ImportarXMLTab({ onImportProducts }: ImportarXMLTabProps) {
  const [errorMsg, setErrorMsg] = useState("");
  const [invoice, setInvoice] = useState<ParsedInvoice | null>(null);
  
  // Custom states for each parsed item prior to importing
  const [selectedItemIndexes, setSelectedItemIndexes] = useState<number[]>([]);
  const [sellingPrices, setSellingPrices] = useState<{ [index: number]: number }>({});
  const [links, setLinks] = useState<{ [index: number]: string }>({});
  const [viewingItemIndex, setViewingItemIndex] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const processXMLString = (xmlString: string) => {
    try {
      setErrorMsg("");
      const parsed = parsePurchaseXML(xmlString);
      setInvoice(parsed);
      
      // Select all parsed items by default
      const indexes = parsed.items.map((_, i) => i);
      setSelectedItemIndexes(indexes);

      // Pre-fill suggested selling prices (e.g., supplier purchase price with a nice 100% markup / 2x multiplier)
      const initialPrices: { [index: number]: number } = {};
      const initialLinks: { [index: number]: string } = {};
      parsed.items.forEach((item, index) => {
        initialPrices[index] = Number((item.unitPrice * 1.8).toFixed(2));
        initialLinks[index] = "";
      });
      setSellingPrices(initialPrices);
      setLinks(initialLinks);
    } catch (e) {
      console.error(e);
      setErrorMsg(e instanceof Error ? e.message : "Erro ao processar o arquivo XML de Nota Fiscal.");
      setInvoice(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const xmlString = event.target?.result as string;
      processXMLString(xmlString);
    };
    reader.onerror = () => {
      setErrorMsg("Falha ao carregar o arquivo.");
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".xml")) {
      setErrorMsg("O arquivo enviado não é um arquivo .XML.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const xmlString = event.target?.result as string;
      processXMLString(xmlString);
    };
    reader.readAsText(file);
  };

  const handleLoadExample = () => {
    processXMLString(EXAMPLE_NFE_XML);
  };

  const toggleItemSelection = (index: number) => {
    if (selectedItemIndexes.includes(index)) {
      setSelectedItemIndexes(selectedItemIndexes.filter(i => i !== index));
    } else {
      setSelectedItemIndexes([...selectedItemIndexes, index]);
    }
  };

  const toggleAllItems = () => {
    if (!invoice) return;
    if (selectedItemIndexes.length === invoice.items.length) {
      setSelectedItemIndexes([]);
    } else {
      setSelectedItemIndexes(invoice.items.map((_, i) => i));
    }
  };

  const handlePriceChange = (index: number, val: number) => {
    setSellingPrices({
      ...sellingPrices,
      [index]: val
    });
  };

  const handleLinkChange = (index: number, val: string) => {
    setLinks({
      ...links,
      [index]: val
    });
  };

  const handleImportSubmit = () => {
    if (!invoice) return;
    if (selectedItemIndexes.length === 0) {
      alert("Selecione pelo menos um item para importar para o estoque.");
      return;
    }

    // Build lists of final items with user inputs
    const itemsToImport = selectedItemIndexes.map((index) => {
      const item = invoice.items[index];
      return {
        code: item.code,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        sellingPrice: sellingPrices[index] || item.unitPrice * 1.5,
        link: links[index] || ""
      };
    });

    onImportProducts(invoice.supplierName, itemsToImport);
    
    // Clear preview state
    setInvoice(null);
    setSelectedItemIndexes([]);
    setSellingPrices({});
    setLinks({});
    alert(`Sucesso! ${itemsToImport.length} itens da nota fiscal foram importados e integrados com sucesso ao estoque.`);
  };

  return (
    <div className="space-y-6">
      
      {/* Intro e instruções do Parser XML */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            NFC-e / NF-e XML Parser
          </span>
          <h2 className="text-xl md:text-2xl font-extrabold mt-3 tracking-tight">
            Importação Inteligente de Compras
          </h2>
          <p className="text-slate-300 text-xs md:text-sm mt-2 leading-relaxed">
            Faça upload do arquivo XML da sua nota fiscal de compra fornecido por seus atacadistas. 
            O sistema extrai o CNPJ, nome da distribuidora fornecedora, código do produto, preços de custo, 
            e quantidades compradas, alimentando seu estoque e poupando tempo de escrita manual!
          </p>

          <div className="mt-5 flex items-center space-x-3">
            <button
              onClick={handleLoadExample}
              className="bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition duration-200"
            >
              Testar com Nota Fiscal de Exemplo
            </button>
          </div>
        </div>

        {/* Decorative backdrop graphics */}
        <div className="absolute top-1/2 right-10 -translate-y-1/2 opacity-10 pointer-events-none hidden lg:block">
          <FileText size={180} />
        </div>
      </div>

      {/* Caixa de Upload / Area de Drag-and-Drop */}
      {!invoice && (
        <div 
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-white hover:bg-indigo-50_50 rounded-2xl p-12 text-center transition duration-200 cursor-pointer shadow-xs group"
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".xml" 
            className="hidden" 
          />
          <div className="max-w-md mx-auto">
            <div className="bg-slate-50 group-hover:bg-indigo-50 p-4 rounded-full inline-flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition mb-4">
              <Upload size={32} />
            </div>
            <h3 className="text-sm font-bold text-slate-800">
              Arraste e solte o XML da Nota Fiscal aqui
            </h3>
            <p className="text-slate-400 text-xs mt-1">
              ou clique para selecionar o arquivo nos seus diretórios locais
            </p>
            <div className="flex items-center justify-center space-x-1 mt-4 text-[11px] text-slate-400 font-medium">
              <HelpCircle size={12} />
              <span>Suporta layouts convencionais de NF-e e NFC-e brasileiras.</span>
            </div>
          </div>
        </div>
      )}

      {/* Mensagem de Erro */}
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl flex items-center space-x-3 text-xs font-semibold">
          <AlertTriangle size={16} className="text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Tabela de Revisão do XML da Compra */}
      {invoice && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm animate-fadeIn overflow-hidden">
          
          {/* Cabeçalho do Fornecedor Nota Fiscal */}
          <div className="bg-slate-50/75 px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-sm">
                Nota Fiscal Importada
              </span>
              <h3 className="text-sm font-bold text-slate-800 mt-1 flex items-center space-x-1.5">
                <FileCheck size={16} className="text-indigo-600" />
                <span>{invoice.supplierName}</span>
              </h3>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                Código / CNPJ Fornecedor: {invoice.supplierCode || "Sem registro"}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setInvoice(null)}
                className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-500 font-bold text-[11px] rounded-xl transition cursor-pointer"
              >
                Limpar Nota
              </button>
              <button
                onClick={handleImportSubmit}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] px-4 py-2 rounded-xl transition shadow-xs flex items-center space-x-1 cursor-pointer"
              >
                <span>Importar Selecionados ({selectedItemIndexes.length})</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
           {/* Listagem de Itens e precificação de entrada */}
          {/* Desktop Table View */}
          <div className="overflow-x-auto hidden md:block">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/40 border-b border-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                  <th className="px-6 py-3 text-center w-12">
                    <button 
                      onClick={toggleAllItems}
                      className="text-slate-400 hover:text-indigo-600 transition cursor-pointer"
                      title="Marcar / Desmarcar Todos"
                    >
                      {selectedItemIndexes.length === invoice.items.length ? (
                        <CheckSquare size={16} className="text-indigo-600 mx-auto" />
                      ) : (
                        <Square size={16} className="mx-auto" />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3">Código SKU</th>
                  <th className="px-6 py-3">Nome do Produto</th>
                  <th className="px-6 py-3 text-center">Qtd Comprada</th>
                  <th className="px-6 py-3 text-right">Compra Unit. (XML)</th>
                  <th className="px-6 py-3 text-right">Preço de Venda Unit. (Sugerido)</th>
                  <th className="px-6 py-3">Link E-commerce (Opcional)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-xs font-semibold">
                {invoice.items.map((item, index) => {
                  const isSelected = selectedItemIndexes.includes(index);
                  
                  return (
                    <tr 
                      key={index} 
                      className={`transition-colors ${isSelected ? "bg-indigo-50/10 hover:bg-indigo-50/20" : "hover:bg-slate-50/50 opacity-60"}`}
                    >
                      
                      {/* Checkbox de importação */}
                      <td className="px-6 py-4 text-center">
                        <button 
                          onClick={() => toggleItemSelection(index)}
                          className="text-slate-400 hover:text-indigo-600 transition cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckSquare size={16} className="text-indigo-600 mx-auto" />
                          ) : (
                            <Square size={16} className="mx-auto" />
                          )}
                        </button>
                      </td>

                      {/* Código */}
                      <td className="px-6 py-4">
                        <span className="font-mono text-[11px] text-slate-500 bg-slate-50 px-2.5 py-1 rounded-sm border border-slate-100">
                          {item.code}
                        </span>
                      </td>

                      {/* Nome do Produto */}
                      <td className="px-6 py-4 max-w-xs font-bold text-slate-800">
                        {item.name}
                      </td>

                      {/* Qtd */}
                      <td className="px-6 py-4 text-center font-mono text-slate-600">
                        {item.quantity} un
                      </td>

                      {/* Custo de compra */}
                      <td className="px-6 py-4 text-right font-mono font-bold text-slate-500">
                        {formatCurrency(item.unitPrice)}
                      </td>

                      {/* Preço de venda sugerida */}
                      <td className="px-6 py-4 text-right font-mono text-slate-800">
                        {isSelected ? (
                          <div className="flex items-center justify-end space-x-1.5">
                            <span className="text-[10px] text-slate-400">R$</span>
                            <input
                              type="number"
                              step="0.01"
                              min="0.01"
                              className="w-24 px-2 py-1 border border-slate-300 rounded-lg text-xs font-bold text-right font-mono focus:border-indigo-500 focus:outline-hidden"
                              value={sellingPrices[index] || ""}
                              onChange={(e) => handlePriceChange(index, parseFloat(e.target.value) || 0)}
                            />
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Preço omitido</span>
                        )}
                      </td>

                      {/* Link opcional */}
                      <td className="px-6 py-4">
                        {isSelected ? (
                          <input
                            type="text"
                            placeholder="Link do e-commerce (URL)"
                            className="w-full max-w-[200px] px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:border-indigo-500 focus:outline-hidden"
                            value={links[index] || ""}
                            onChange={(e) => handleLinkChange(index, e.target.value)}
                          />
                        ) : (
                          <span className="text-slate-400 italic">Desativado</span>
                        )}
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View */}
          <div className="grid grid-cols-1 gap-4 p-4 md:hidden">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Marcar/Desmarcar todos na nota</span>
              <button 
                onClick={toggleAllItems}
                className="text-xs text-indigo-650 dark:text-indigo-400 font-bold flex items-center space-x-1 cursor-pointer bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-xl border border-slate-100 dark:border-slate-750"
              >
                {selectedItemIndexes.length === invoice.items.length ? (
                  <>
                    <CheckSquare size={13} className="text-indigo-600 shrink-0" />
                    <span>Nenhum</span>
                  </>
                ) : (
                  <>
                    <Square size={13} className="shrink-0" />
                    <span>Selecionar Todos</span>
                  </>
                )}
              </button>
            </div>

            {invoice.items.map((item, index) => {
              const isSelected = selectedItemIndexes.includes(index);
              return (
                <div 
                  key={index} 
                  className={`border rounded-xl p-4 transition-all duration-200 ${
                    isSelected 
                      ? "bg-indigo-50/10 dark:bg-indigo-500/5 border-indigo-150 dark:border-indigo-500/20" 
                      : "bg-slate-50/40 dark:bg-slate-900 border-slate-150 dark:border-slate-800 opacity-65"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start space-x-2.5 min-w-0">
                      <button 
                        onClick={() => toggleItemSelection(index)}
                        className="text-slate-400 hover:text-indigo-600 transition shrink-0 mt-1 cursor-pointer"
                      >
                        {isSelected ? (
                          <CheckSquare size={17} className="text-indigo-600" />
                        ) : (
                          <Square size={17} />
                        )}
                      </button>
                      <div className="min-w-0">
                        <span className="font-mono text-[9px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-sm">
                          {item.code}
                        </span>
                        <h4 className="text-xs font-bold text-slate-850 dark:text-slate-150 mt-1 leading-snug line-clamp-2">
                          {item.name}
                        </h4>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-100 dark:border-slate-700 shrink-0">
                      {item.quantity} un
                    </span>
                  </div>

                  {isSelected && (
                    <div className="mt-4 pt-3 border-t border-dashed border-slate-100 dark:border-slate-800/80 space-y-3 animate-fadeIn">
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="text-slate-400 dark:text-slate-500 uppercase text-[8px] font-bold block">Qtd Importada</span>
                          <span className="font-mono font-bold dark:text-slate-350">{item.quantity} un</span>
                        </div>
                        <div>
                          <span className="text-slate-400 dark:text-slate-500 uppercase text-[8px] font-bold block">Fornecedor Unit.</span>
                          <span className="font-mono font-bold dark:text-slate-350">{formatCurrency(item.unitPrice)}</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold block">
                          Preço de Venda Unitário Sugerido
                        </label>
                        <div className="flex items-center space-x-1.5 focus-within:ring-1 focus-within:ring-indigo-500 rounded-lg p-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                          <span className="text-xs text-slate-400 font-bold px-1">R$</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            className="w-full bg-transparent text-xs font-bold font-mono focus:outline-hidden dark:text-white"
                            value={sellingPrices[index] || ""}
                            onChange={(e) => handlePriceChange(index, parseFloat(e.target.value) || 0)}
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold block">
                          Link E-commerce (Opcional)
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: https://lista.mercadolivre.com..."
                          className="w-full text-xs p-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-hidden focus:border-indigo-500 dark:text-white"
                          value={links[index] || ""}
                          onChange={(e) => handleLinkChange(index, e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>
              Ao importar, se o código/SKU já existir no sistema, as quantidades serão somadas e o preço de fornecedor atualizado para a média ponderada ou o valor mais recente.
            </span>
          </div>

        </div>
      )}

    </div>
  );
}
