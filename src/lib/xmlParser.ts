export interface ParsedItem {
  code: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ParsedInvoice {
  supplierName: string;
  supplierCode: string; // Like CNPJ or ID
  items: ParsedItem[];
}

/**
 * Parses an XML string representing an invoice (such as Brazilian NF-e or a custom XML structure)
 * and extracts supplier and product details.
 */
export function parsePurchaseXML(xmlText: string): ParsedInvoice {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, "text/xml");

  // Check for parse errors
  const parseError = xmlDoc.getElementsByTagName("parsererror");
  if (parseError.length > 0) {
    throw new Error("Formato de arquivo XML inválido. Verifique o arquivo enviado.");
  }

  // 1. Get supplier (emitente) info
  let supplierName = "";
  let supplierCode = "";

  const emit = xmlDoc.getElementsByTagName("emit")[0];
  if (emit) {
    const xNomeNode = emit.getElementsByTagName("xNome")[0];
    if (xNomeNode) supplierName = xNomeNode.textContent || "";

    const cnpjNode = emit.getElementsByTagName("CNPJ")[0];
    const cpfNode = emit.getElementsByTagName("CPF")[0];
    if (cnpjNode) {
      supplierCode = cnpjNode.textContent || "";
    } else if (cpfNode) {
      supplierCode = cpfNode.textContent || "";
    }
  }

  // Fallback for supplier name in generic files
  if (!supplierName) {
    const supplierNodes = xmlDoc.getElementsByTagName("supplier") || xmlDoc.getElementsByTagName("fornecedor");
    if (supplierNodes.length > 0) {
      const nameNode = supplierNodes[0].getElementsByTagName("name")[0] || supplierNodes[0].getElementsByTagName("nome")[0];
      const codeNode = supplierNodes[0].getElementsByTagName("code")[0] || supplierNodes[0].getElementsByTagName("cnpj")[0] || supplierNodes[0].getElementsByTagName("id")[0];
      if (nameNode) supplierName = nameNode.textContent || "";
      if (codeNode) supplierCode = codeNode.textContent || "";
    }
  }

  if (!supplierName) {
    supplierName = "Fornecedor Não Identificado";
  }

  // 2. Extract items
  const items: ParsedItem[] = [];
  const detNodes = xmlDoc.getElementsByTagName("det"); // Brazilian NF-e det item block

  if (detNodes.length > 0) {
    for (let i = 0; i < detNodes.length; i++) {
      const prodNode = detNodes[i].getElementsByTagName("prod")[0];
      if (prodNode) {
        const cProd = prodNode.getElementsByTagName("cProd")[0]?.textContent || "";
        const xProd = prodNode.getElementsByTagName("xProd")[0]?.textContent || "";
        const qCom = parseFloat(prodNode.getElementsByTagName("qCom")[0]?.textContent || "0");
        const vUnCom = parseFloat(prodNode.getElementsByTagName("vUnCom")[0]?.textContent || "0");
        const vProd = parseFloat(prodNode.getElementsByTagName("vProd")[0]?.textContent || "0");

        if (xProd) {
          items.push({
            code: cProd || `SKU-${i + 1}`,
            name: xProd,
            quantity: qCom,
            unitPrice: vUnCom,
            totalPrice: vProd || (qCom * vUnCom)
          });
        }
      }
    }
  } else {
    // Check for generic "item", "product" or "produto" tags inside the XML
    const genericItemNodes = xmlDoc.getElementsByTagName("item") || xmlDoc.getElementsByTagName("produto") || xmlDoc.getElementsByTagName("product");
    if (genericItemNodes.length > 0) {
      for (let i = 0; i < genericItemNodes.length; i++) {
        const itemNode = genericItemNodes[i];
        const code = itemNode.getElementsByTagName("code")[0]?.textContent || 
                     itemNode.getElementsByTagName("codigo")[0]?.textContent || 
                     itemNode.getAttribute("id") || `SKU-${i + 1}`;
        const name = itemNode.getElementsByTagName("name")[0]?.textContent || 
                     itemNode.getElementsByTagName("nome")[0]?.textContent || 
                     itemNode.getElementsByTagName("descricao")[0]?.textContent || "";
        const quantity = parseFloat(itemNode.getElementsByTagName("quantity")[0]?.textContent || 
                                    itemNode.getElementsByTagName("quantidade")[0]?.textContent || "0");
        const unitPrice = parseFloat(itemNode.getElementsByTagName("unitPrice")[0]?.textContent || 
                                     itemNode.getElementsByTagName("valorUnitario")[0]?.textContent || 
                                     itemNode.getElementsByTagName("preco")[0]?.textContent || "0");
        const totalPrice = parseFloat(itemNode.getElementsByTagName("totalPrice")[0]?.textContent || 
                                      itemNode.getElementsByTagName("valorTotal")[0]?.textContent || "0") || (quantity * unitPrice);

        if (name) {
          items.push({
            code,
            name,
            quantity,
            unitPrice,
            totalPrice
          });
        }
      }
    }
  }

  // If we couldn't find items in standard NF-e structure or tags, see if there are any <prod> tags directly
  if (items.length === 0) {
    const prodDirectNodes = xmlDoc.getElementsByTagName("prod");
    for (let i = 0; i < prodDirectNodes.length; i++) {
      const prodNode = prodDirectNodes[i];
      const cProd = prodNode.getElementsByTagName("cProd")[0]?.textContent || `PROD-${i + 1}`;
      const xProd = prodNode.getElementsByTagName("xProd")[0]?.textContent || "";
      const qCom = parseFloat(prodNode.getElementsByTagName("qCom")[0]?.textContent || "0");
      const vUnCom = parseFloat(prodNode.getElementsByTagName("vUnCom")[0]?.textContent || "0");
      const vProd = parseFloat(prodNode.getElementsByTagName("vProd")[0]?.textContent || "0") || (qCom * vUnCom);

      if (xProd) {
        items.push({
          code: cProd,
          name: xProd,
          quantity: qCom,
          unitPrice: vUnCom,
          totalPrice: vProd
        });
      }
    }
  }

  return {
    supplierName,
    supplierCode,
    items
  };
}
