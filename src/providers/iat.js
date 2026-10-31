'use strict';

const SGA_URL = 'https://www.sga.pr.gov.br/sga-iap/consultarProcessoLicenciamento.do?action=iniciar';
const IAT_CONSULTAS_URL = 'https://www.iat.pr.gov.br/Pagina/Consultar-licenciamentos';

/**
 * Consulta assistida: não há API pública documentada validada neste projeto.
 * Não acessa endpoints internos, não inventa resultados e não declara ausência
 * de licença. A pesquisa e a validação do documento ocorrem no portal oficial.
 */
async function consultarIAT(termoInformado, tipoIdentificador) {
  const termo = String(termoInformado || '').trim();
  return {
    orgao: 'IAT',
    status: 'pesquisa_oficial_pendente',
    automatizada: false,
    identificador: { tipo: tipoIdentificador || 'texto', valor: termo },
    resultados: [],
    url_consulta: SGA_URL,
    url_extratos: IAT_CONSULTAS_URL,
    permite_concluir_que_nao_existem_licencas: false,
    mensagem: 'A pesquisa deve ser concluída no portal oficial do IAT. Esta integração ainda não possui API pública documentada validada; portanto, não apresenta resultados presumidos nem interpreta a lista vazia como inexistência de licença.',
    consultado_em: new Date().toISOString(),
  };
}

module.exports = { consultarIAT, SGA_URL, IAT_CONSULTAS_URL };
