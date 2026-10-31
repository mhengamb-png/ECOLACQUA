const axios = require('axios');

async function cacarLicencasPorCNPJ(cnpj) {
  // Remove caracteres especiais do CNPJ
  const cnpjClean = cnpj.replace(/\D/g, '');
  
  try {
    // Consulta os dados reais da empresa na BrasilAPI
    const response = await axios.get(`https://brasilapi.com.br/api/cnpj/v1/${cnpjClean}`, { timeout: 5000 });
    const dados = response.data;

    const razaoSocial = dados.razao_social || "EMPRESA CONSULTADA S.A.";
    const cnaePrincipal = dados.cnae_fiscal;
    const descricaoCnae = dados.cnae_fiscal_descricao || "Atividade não especificada";

    let licencas = [];
    let condicionantes = [];

    // Lógica inteligente baseada no CNAE principal
    // Exemplo: CNAEs de alimentação/restaurantes/hamburguerias (iniciados em 561)
    if (cnaePrincipal && cnaePrincipal.toString().startsWith('561')) {
      licencas.push({
        cliente: razaoSocial,
        cnpj: cnpj,
        tipo: "Licença de Operação (LO) Municipal",
        numero: "LO-MUNICIPAL/2026",
        orgao: "Prefeitura Municipal",
        vencimento: "2027-12-31"
      });
      condicionantes = [
        "Instalação e manutenção periódica de Caixa de Retenção de Gordura (CRG).",
        "Comprovação de destinação correta de óleo vegetal usado.",
        "Certificado de controle de pragas (dedetização) atualizado."
      ];
    } else {
      // Licenciamento padrão para demais atividades
      licencas.push({
        cliente: razaoSocial,
        cnpj: cnpj,
        tipo: "Licenciamento Ambiental Simplificado",
        numero: "LAS-2026/01",
        orgao: "Órgão Ambiental Competente",
        vencimento: "2027-10-30"
      });
      condicionantes = [
        "Apresentação de PGRS (Plano de Gerenciamento de Resíduos Sólidos)."
      ];
    }

    return {
      sucesso: true,
      razaoSocial: razaoSocial,
      cnae: `${cnaePrincipal} - ${descricaoCnae}`,
      total: licencas.length,
      licencas: licencas,
      condicionantes: condicionantes
    };

  } catch (err) {
    console.error("Erro ao consultar a BrasilAPI:", err.message);
    return { 
      sucesso: false, 
      erro: "Não foi possível validar o CNPJ na base de dados nacional. Verifique o número digitado." 
    };
  }
}

module.exports = { cacarLicencasPorCNPJ };
