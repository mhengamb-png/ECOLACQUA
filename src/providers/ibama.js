'use strict';

const axios = require('axios');
const DATASET_URL = 'https://dadosabertos.ibama.gov.br/dataset/licencas-ambientais-de-atividades-e-empreendimentos-licenciados-pelo-ibama';
const CKAN_BASE = 'https://dadosabertos.ibama.gov.br/api/3/action';
const DATASET_ID = 'licencas-ambientais-de-atividades-e-empreendimentos-licenciados-pelo-ibama';
const TIMEOUT_MS = Number(process.env.OFFICIAL_SOURCE_TIMEOUT_MS) || 12000;

function digits(value) { return String(value ?? '').replace(/\D/g, ''); }

function recordContainsCnpj(record, cnpj) {
  const target = digits(cnpj);
  if (!target || !record || typeof record !== 'object') return false;
  return Object.entries(record).some(([key, value]) => {
    if (value === null || value === undefined) return false;
    const keyNorm = key.toLowerCase();
    if (!/(cnpj|cpf|documento|empreendedor|interessado|titular)/.test(keyNorm)) return false;
    return digits(value) === target;
  });
}

async function consultarIbama(cnpj, municipio) {
  const base = {
    orgao: 'IBAMA',
    fonte: DATASET_URL,
    automatizada: true,
    municipio_filtro: municipio || null,
    consultado_em: new Date().toISOString(),
  };
  try {
    const meta = await axios.get(`${CKAN_BASE}/package_show`, {
      params: { id: DATASET_ID }, timeout: TIMEOUT_MS, headers: { Accept: 'application/json' },
    });
    if (!meta.data?.success || !Array.isArray(meta.data?.result?.resources)) {
      return { ...base, status: 'fonte_indisponivel', resultados: [], mensagem: 'O catálogo oficial não retornou metadados utilizáveis.' };
    }

    const resources = meta.data.result.resources;
    const resource = resources.find((item) => String(item.format).toLowerCase() === 'json')
      || resources.find((item) => String(item.format).toLowerCase() === 'csv');
    if (!resource) {
      return { ...base, status: 'recurso_nao_identificado', resultados: [], mensagem: 'O catálogo não apresentou recurso JSON/CSV reconhecível.' };
    }

    // Primeiro tenta a API CKAN de dados tabulares. Se o recurso não estiver
    // indexado, devolve status explícito sem baixar arquivo potencialmente grande.
    if (resource.datastore_active) {
      const query = await axios.get(`${CKAN_BASE}/datastore_search`, {
        params: { resource_id: resource.id, q: cnpj, limit: 100 },
        timeout: TIMEOUT_MS, headers: { Accept: 'application/json' },
      });
      const records = query.data?.result?.records;
      if (Array.isArray(records)) {
        const matched = records.filter((record) => recordContainsCnpj(record, cnpj));
        return {
          ...base,
          status: matched.length ? 'resultados_encontrados' : 'nenhum_registro_encontrado_na_base_consultada',
          resultados: matched,
          total: matched.length,
          atualizacao_fonte: meta.data.result.metadata_modified || null,
          mensagem: matched.length ? 'Registros encontrados na base aberta do IBAMA. Confira o documento original e a situação atual antes de tomar decisão.' : 'A consulta na base aberta do IBAMA não retornou registro correspondente. Isso não comprova inexistência de processo/licença.',
        };
      }
    }

    return {
      ...base,
      status: 'consulta_automatizada_nao_disponivel',
      resultados: [],
      mensagem: 'O conjunto oficial foi localizado, mas o recurso não está indexado para consulta tabular automática. Consulte a fonte oficial; nenhum resultado foi presumido.',
      recurso_url: resource.url || null,
      atualizacao_fonte: meta.data.result.metadata_modified || null,
    };
  } catch (error) {
    return {
      ...base,
      status: 'fonte_indisponivel',
      resultados: [],
      mensagem: 'Não foi possível acessar a base oficial do IBAMA nesta tentativa. Isso não significa ausência de licença.',
      detalhe_tecnico: process.env.NODE_ENV === 'development' ? error.message : undefined,
    };
  }
}

module.exports = { consultarIbama, DATASET_URL, recordContainsCnpj };
