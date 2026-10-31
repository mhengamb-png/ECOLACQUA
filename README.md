# ECOLACQUA Backend — Paraná

Backend Node.js/Express para consulta ambiental no Paraná. Esta versão substitui resultados fictícios por consultas reais quando há fonte automatizável e por encaminhamento explícito ao portal oficial quando não há API pública documentada.

## Instalação

```bash
npm install
cp .env.example .env
npm run check
npm test
npm start
```

Configure `CORS_ORIGINS` com o domínio real do frontend antes de publicar.

## Endpoints

### `GET /health`
Verifica se o servidor está ativo.

### `GET /api/orgaos/parana`
Retorna a lista inicial de municípios identificados pelo IAT com certificação/delegação para licenciamento ambiental.

### `GET /api/orgaos/parana?municipio=Maringá`
Retorna a classificação de competência municipal disponível na lista de referência. A resposta não substitui análise da resolução CEMA e do plano de trabalho para a tipologia específica.

### `POST /api/cacar-licencas`

```json
{
  "cnpj": "11222333000181",
  "municipio": "Maringá"
}
```

O município é opcional. Se omitido, o sistema tenta usar o município do cadastro empresarial retornado pela Brasil API. Atenção: sede do CNPJ pode ser diferente do local do empreendimento; informe o município do empreendimento sempre que possível.

## Situação das fontes

- **IBAMA:** integração tenta localizar o conjunto oficial no catálogo CKAN e consultar recurso tabular quando o catálogo informa que o recurso está indexado. Se não estiver indexado, informa que a consulta automática não foi possível. A busca sem resultado não comprova inexistência de licença.
- **IAT:** fornece link para o formulário público do SGA e página de extratos. Não foi identificada API pública documentada para consulta automatizada por CNPJ; por isso, não há scraping de endpoints internos nem resultado presumido.
- **PNLA:** fornece link para consulta pública. Não foi identificada API pública documentada para consulta automatizada por CNPJ.
- **Municípios:** classifica inicialmente os municípios listados na página de descentralização do IAT. A certificação pode ser parcial e a competência depende da tipologia, resolução e plano de trabalho vigentes.

## Fontes oficiais utilizadas

- IAT — consulta de licenciamentos: https://www.iat.pr.gov.br/Pagina/Consultar-licenciamentos
- IAT — descentralização municipal: https://www.iat.pr.gov.br/Pagina/Descentralizacao-Licenciamento-Monitoramento-e-Fiscalizacao-Ambiental
- SGA — consulta de processos: https://www.sga.pr.gov.br/sga-iap/consultarProcessoLicenciamento.do?action=iniciar
- IBAMA — conjunto de dados de licenças: https://dadosabertos.ibama.gov.br/dataset/licencas-ambientais-de-atividades-e-empreendimentos-licenciados-pelo-ibama
- PNLA: https://pnla.mma.gov.br/

## Limitações e próximos passos necessários

1. Confirmar com o IAT se há API/serviço de integração autorizado para consulta por CNPJ ou obter especificação técnica do SGA.
2. Verificar os recursos/colunas atuais do dataset CKAN do IBAMA em produção e validar a correspondência dos campos identificadores.
3. Mapear os canais oficiais de cada prefeitura e obter confirmação de integração (API, dados abertos, portal público ou atendimento manual).
4. Acrescentar autenticação Firebase Admin, autorização multiempresa e logs de auditoria antes de expor dados a clientes SaaS.
5. Implementar cache e monitoramento das fontes externas para evitar excesso de chamadas e indisponibilidade em cascata.

## Importante

Esta versão é um primeiro incremento técnico. Não representa homologação pelo IAT, IBAMA, PNLA ou prefeituras e não deve ser anunciada como consulta nacional/estadual totalmente automatizada. A confirmação da validade de uma licença deve ocorrer no documento e no órgão emissor.

## Integração com o frontend

O frontend atualizado está em `../../frontend/code001.html` no pacote completo. Ele consome `GET /api/orgaos/parana` para sugestões de municípios e `POST /api/cacar-licencas` para executar a consulta. Configure `CORS_ORIGINS` com o domínio exato onde o HTML será hospedado.
