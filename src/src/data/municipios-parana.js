'use strict';

// Relação inicial baseada na página oficial de descentralização do IAT.
// Certificação/delegação não significa competência para toda atividade:
// o escopo deve ser conferido na resolução e no plano de trabalho aplicáveis.
const IAT_SOURCE = 'https://www.iat.pr.gov.br/Pagina/Descentralizacao-Licenciamento-Monitoramento-e-Fiscalizacao-Ambiental';

const MUNICIPIOS = [
  { nome: 'Araucária', certificado: true, delegacaoIntegral: true, observacao: 'Certificação e delegação; conferir tipologias no plano de trabalho.' },
  { nome: 'Cascavel', certificado: true, delegacaoIntegral: false, observacao: 'Certificação com exclusões de tipologias; conferir Resolução CEMA vigente.' },
  { nome: 'Colombo', certificado: true, delegacaoIntegral: false, observacao: 'Certificação com exclusões de tipologias; conferir Resolução CEMA vigente.' },
  { nome: 'Colorado', certificado: true, delegacaoIntegral: false, observacao: 'Certificação parcial; conferir tipologias autorizadas.' },
  { nome: 'Curitiba', certificado: true, delegacaoIntegral: true, observacao: 'Certificação e delegação; conferir tipologias no plano de trabalho.' },
  { nome: 'Fazenda Rio Grande', certificado: true, delegacaoIntegral: false, observacao: 'Certificação parcial; conferir tipologias autorizadas.' },
  { nome: 'Foz do Iguaçu', certificado: true, delegacaoIntegral: false, observacao: 'Certificação com regras específicas; conferir resoluções e plano de trabalho.' },
  { nome: 'Guarapuava', certificado: true, delegacaoIntegral: true, observacao: 'Certificação e delegação; conferir tipologias no plano de trabalho.' },
  { nome: 'Londrina', certificado: true, delegacaoIntegral: true, observacao: 'Certificação e delegação; conferir tipologias no plano de trabalho.' },
  { nome: 'Maringá', certificado: true, delegacaoIntegral: true, observacao: 'Certificação e delegação; conferir tipologias no plano de trabalho.' },
  { nome: 'Pinhais', certificado: true, delegacaoIntegral: false, observacao: 'Certificação para as tipologias do Anexo I; confirmar delegação e plano de trabalho.' },
  { nome: 'Piraquara', certificado: true, delegacaoIntegral: false, observacao: 'Certificação com exclusões de tipologias; conferir Resolução CEMA vigente.' },
  { nome: 'Ponta Grossa', certificado: true, delegacaoIntegral: false, observacao: 'Certificação com exclusões de tipologias; conferir Resolução CEMA vigente.' },
  { nome: 'São José dos Pinhais', certificado: true, delegacaoIntegral: true, observacao: 'Certificação e delegação; conferir tipologias no plano de trabalho.' },
];

function normalizarNome(nome = '') {
  return String(nome).normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function consultarOrgaoMunicipal(nomeMunicipio) {
  if (!nomeMunicipio) {
    return {
      municipio: null,
      orgao_referencial: 'IAT',
      situacao: 'municipio_nao_informado',
      mensagem: 'Informe o município do empreendimento para verificar eventual competência municipal.',
      fonte: IAT_SOURCE,
    };
  }
  const municipio = MUNICIPIOS.find((item) => normalizarNome(item.nome) === normalizarNome(nomeMunicipio));
  if (!municipio) {
    return {
      municipio: nomeMunicipio,
      orgao_referencial: 'IAT',
      situacao: 'sem_certificacao_municipal_identificada_na_lista_consultada',
      mensagem: 'A lista consultada do IAT não identifica este município entre os certificados/delegados. A competência deve ser confirmada com o IAT antes de concluir que não há órgão municipal licenciador.',
      fonte: IAT_SOURCE,
    };
  }
  return {
    municipio: municipio.nome,
    orgao_referencial: 'Órgão ambiental municipal',
    situacao: municipio.delegacaoIntegral ? 'certificado_e_com_delegacao_integral_reportada' : 'certificado_com_escopo_a_conferir',
    certificado: municipio.certificado,
    delegacao_integral_reportada: municipio.delegacaoIntegral,
    mensagem: municipio.observacao,
    fonte: IAT_SOURCE,
  };
}

module.exports = { MUNICIPIOS, IAT_SOURCE, normalizarNome, consultarOrgaoMunicipal };
