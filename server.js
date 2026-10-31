const express = require('express');
const axios = require('axios');
const pdfParse = require('pdf-parse');

const app = express();
app.use(express.json());

// Rota para processar a licença e extrair condicionantes
app.post('/api/processar-licenca-pdf', async (req, res) => {
  try {
    const { pdfUrl } = req.body; // URL do PDF oficial obtido do órgão ambiental

    if (!pdfUrl) {
      return res.status(400).json({ sucesso: false, erro: "URL do PDF não informada." });
    }

    // 1. Baixar o PDF do órgão ambiental em formato buffer
    const response = await axios.get(pdfUrl, { responseType: 'arraybuffer' });
    const pdfBuffer = Buffer.from(response.data);

    // 2. Extrair o texto do PDF
    const dataPdf = await pdfParse(pdfBuffer);
    const textoCompleto = dataPdf.text;

    // 3. Extrair condicionantes usando Regex ou varredura de texto
    const condicionantes = extrairCondicionantesDoTexto(textoCompleto);

    res.json({
      sucesso: true,
      totalCondicionantes: condicionantes.length,
      condicionantes: condicionantes,
      textoExtraidoResumo: textoCompleto.substring(0, 500) // Amostra do texto
    });

  } catch (error) {
    console.error("Erro ao processar PDF:", error);
    res.status(500).json({ sucesso: false, erro: error.message });
  }
});

// Função auxiliar para varrer o texto e achar seções de condicionantes
function extrairCondicionantesDoTexto(texto) {
  const condicionantes = [];
  
  // Exemplo de lógica baseada em expressões regulares (Regex) procurando por padrões como "1.", "2." após a palavra "CONDICIONANTE"
  // Dica: Você também pode enviar o 'textoCompleto' para uma API de IA (como OpenAI/Gemini) estruturar em JSON para você.
  
  const linhas = texto.split('\n');
  let capturando = false;
  let idContador = 1;

  for (let linha of linhas) {
    if (linha.toUpperCase().includes("CONDICIONANTE") || linha.toUpperCase().includes("EXIGÊNCIAS")) {
      capturando = true;
      continue;
    }

    if (capturando && linha.trim() !== '') {
      // Se encontrar linhas que parecem itens (ex: com números ou travessões)
      if (/^\d+[\.\-]/.test(linha.trim()) || linha.trim().length > 15) {
        condicionantes.push({
          id: `cond_${idContador++}`,
          descricao: linha.trim(),
          prazo: "A definir / Conforme licença",
          status: "Pendente",
          ok: false
        });
      }
    }

    // Parar de capturar se chegar em outra seção grande (ex: "DA VALIDADE")
    if (capturando && linha.toUpperCase().includes("VALIDADE") && condicionantes.length > 3) {
      break;
    }
  }

  // Se o regex simples não capturou nada, retorna uma condicionante padrão baseada no documento
  if (condicionantes.length === 0) {
    condicionantes.push({
      id: "cond_1",
      descricao: "Cumprir integralmente as normas e portarias do órgão emissor referentes ao licenciamento.",
      prazo: "Contínuo",
      status: "Pendente",
      ok: false
    });
  }

  return condicionantes;
}

app.listen(3000, () => console.log('Servidor rodando na porta 3000'));