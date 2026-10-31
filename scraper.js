'use strict';

const { consultarIAT } = require('./src/providers/iat');

function classificarIdentificador(valor) {
  const texto = String(valor || '').trim();
  const digitos = texto.replace(/\D/g, '');
  if (!texto) return { valido: false, tipo: null, valor: texto };
  if (/^\d{11}$/.test(digitos) && /^[\d.\-/\s]+$/.test(texto)) return { valido: true, tipo: 'cpf', valor: digitos };
  if (/^\d{14}$/.test(digitos) && /^[\d.\-/\s]+$/.test(texto)) return { valido: true, tipo: 'cnpj', valor: digitos };
  if (texto.length < 2 || texto.length > 160) return { valido: false, tipo: null, valor: texto };
  if (/^[\d./-]+$/.test(texto)) return { valido: true, tipo: 'protocolo_ou_documento', valor: texto };
  return { valido: true, tipo: 'razao_social_ou_nome', valor: texto };
}

async function cacarLicencasIAT(termoInformado) {
  const identificador = classificarIdentificador(termoInformado);
  if (!identificador.valido) {
    const error = new Error('Informe CPF, CNPJ, razão social, protocolo ou número do documento.');
    error.statusCode = 400;
    throw error;
  }
  const consulta = await consultarIAT(identificador.valor, identificador.tipo);
  return {
    sucesso: true,
    orgao: 'IAT',
    consulta_concluida: false,
    requer_consulta_oficial: true,
    identificador,
    total: null,
    licencas: [],
    fontes: { iat: consulta },
    aviso: 'Nenhuma conclusão sobre existência ou inexistência de licença foi feita. Abra o portal oficial do IAT e confira os documentos e seus status.',
    consultado_em: new Date().toISOString(),
  };
}

// Mantém o nome antigo exportado para compatibilidade com integrações legadas.
module.exports = { cacarLicencasIAT, cacarLicencasPorCNPJ: cacarLicencasIAT, classificarIdentificador };
