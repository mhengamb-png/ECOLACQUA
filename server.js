require('dotenv').config();
const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');
const pdfParse = require('pdf-parse');
const { GoogleGenAI } = require('@google/genai');

const app = express();
app.use(cors());
app.use(express.json());

// Inicializa a API do Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// -------------------------------------------------------------
// OPÇÃO 1: Robô para Acessar Órgão e Obter o PDF / Dados Reais
// -------------------------------------------------------------
app.post('/api/cacar-licencas', async (req, res) => {
  const { cnpj } = req.body;

  if (!cnpj) {
    return res.status(400).json({ sucesso: false, erro: "CNPJ é obrigatório." });
  }

  let browser = null;
  try {
    // Inicia o navegador em modo headless (sem interface gráfica)
    browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    // Exemplo de acesso a um portal de consulta (ajuste a URL para o órgão desejado, ex: IAT/IBAMA)
    // await page.goto('https://portal-do-orgao.gov.br/consulta-licencas');
    // await page.type('#input-cnpj', cnpj);
    // await page.click('#btn-pesquisar');
    // await page.waitForSelector('.resultado-tabela');

    // Após a busca, extraia os links dos PDFs e metadados reais
    // Exemplo de retorno estruturado pelo robô:
    const licencasEncontradas = [
      {
        cliente: "Empresa Exemplo S.A.",
        cnpj: cnpj,
        tipo: "LO",
        numero: "45892/2024",
        orgao: "IAT",
        vencimento: "2028-10-31",
        pdfUrl: "https://www meuid.com/exemplo_licenca.pdf", // Link real retornado do portal
        ficheiroNome: "Licenca_Operacao_45892.pdf"
      }
    ];

    await browser.close();

    res.json({
      sucesso: true,
      total: licencasEncontradas.length,
      licencas: licencasEncontradas
    });

  } catch (error) {
    if (browser) await browser.close();
    console.error("Erro no robô de varredura:", error);
    res.status(500).json({ sucesso: false, erro: "Falha ao consultar órgão: " + error.message });
  }
});

// -------------------------------------------------------------
// OPÇÃO 2: Baixar PDF, Extrair Texto e Analisar Condicionantes com IA
// -------------------------------------------------------------
app.post('/api/processar-licenca-pdf', async (req, res) => {
  try {
    const { pdfUrl } = req.body;

    if (!pdfUrl) {
      return res.status(400).json({ sucesso: false, erro: "URL do PDF não informada." });
    }

    // 1. Baixar o arquivo PDF para a memória
    const response = await fetch(pdfUrl);
    const arrayBuffer = await response.arrayBuffer();
    const pdfBuffer = Buffer.from(arrayBuffer);

    // 2. Extrair o texto bruto do PDF
    const dataPdf = await pdfParse(pdfBuffer);
    const textoBruto = dataPdf.text;

    if (!textoBruto || textoBruto.trim().length === 0) {
      return res.status(400).json({ sucesso: false, erro: "Não foi possível ler o texto do PDF (pode ser uma imagem escaneada)." });
    }

    // 3. Enviar o texto para a IA (Gemini) extrair as condicionantes reais
    const prompt = `
      Você é um especialista em licenciamento ambiental brasileiro.
      Analise o texto abaixo retirado de uma Licença Ambiental oficial e extraia TODAS as condicionantes, exigências e restrições.

      Retorne APENAS um objeto JSON válido no seguinte formato exacto, sem marcações markdown adicionais:
      {
        "condicionantes": [
          {
            "id": "cond_1",
            "descricao": "Descrição clara da exigência",
            "prazo": "Prazo estipulado (ex: 60 dias, Anual, Semestral, Contínuo)",
            "status": "Pendente",
            "ok": false
          }
        ]
      }

      Texto da Licença:
      ${textoBruto.substring(0, 15000)}
    `;

    const responseAi = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const resultadoJson = JSON.parse(responseAi.text);

    res.json({
      sucesso: true,
      totalCondicionantes: resultadoJson.condicionantes ? resultadoJson.condicionantes.length : 0,
      condicionantes: resultadoJson.condicionantes || []
    });

  } catch (error) {
    console.error("Erro ao processar PDF com IA:", error);
    res.status(500).json({ sucesso: false, erro: "Erro ao processar condicionantes: " + error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
