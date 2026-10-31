'use strict';

const SGA_URL = 'https://www.sga.pr.gov.br/sga-iap/consultarProcessoLicenciamento.do?action=iniciar';
const IAT_CONSULTAS_URL = 'https://www.iat.pr.gov.br/Pagina/Consultar-licenciamentos';

async function consultarIAT(cnpj, municipio) {
  // O SGA disponibiliza formulário público de consulta, mas não foi identificada
  // documentação pública de API para pesquisa automatizada por CNPJ. Não fazer
  // scraping de endpoints internos ou simular resultado: encaminhar à consulta oficial.
  return {
    orgao: 'IAT',
    status: 'consulta_oficial_disponivel_requer_pesquisa_no_portal',
    automatizada: false,
    cnpj,
    municipio: municipio || null,
    resultados: [],
    url_consulta: SGA_URL,
    url_extratos: IAT_CONSULTAS_URL,
    mensagem: 'O portal oficial permite pesquisar por CPF/CNPJ, razão social, município, protocolo e número do documento. A integração automatizada depende de interface/API oficial documentada ou autorização do órgão; por enquanto, nenhum resultado foi presumido.',
    consultado_em: new Date().toISOString(),
  };
}

module.exports = { consultarIAT, SGA_URL, IAT_CONSULTAS_URL };
