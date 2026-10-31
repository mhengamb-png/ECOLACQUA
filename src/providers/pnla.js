'use strict';

const PNLA_URL = 'https://pnla.mma.gov.br/';

async function consultarPNLA(cnpj, municipio) {
  return {
    orgao: 'PNLA',
    status: 'consulta_manual_no_portal',
    automatizada: false,
    cnpj,
    municipio: municipio || null,
    resultados: [],
    url_consulta: PNLA_URL,
    mensagem: 'O PNLA é um portal público de consulta. Não foi identificada API pública documentada para pesquisa automatizada por CNPJ; abrir o portal para verificação complementar.',
    consultado_em: new Date().toISOString(),
  };
}

module.exports = { consultarPNLA, PNLA_URL };
