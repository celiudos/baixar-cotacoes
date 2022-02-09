import lodash from "lodash";
import { URL } from "url";
import FileUtils from "utils/FileUtils";
import PuppeteerUtils from "utils/PuppeteerUtils";
import { ACOES_TESTE } from "./acoes";

//===================================

const PUPPETER_PARAMS = { headless: true };
const DIR_ARQUIVO = `./files/fis.csv`;
const ORDER_BY = {
  col: ["converterPorcentagem", "risco"],
  sort: ["desc", "asc"],
};
const LOG_CRIADO_A_CADA_BATCH: number = 10;

(async () => {
  // await baixarPadraoDOUXml(ACOES);
  await baixarPadraoDOUXml(ACOES_TESTE);
})();

//===================================

async function baixarPadraoDOUXml(acoes): Promise<void> {
  const params = {
    url: new URL(`https://www.infomoney.com.br/cotacoes/fundos-imobiliarios-`),
    selectors: {
      cotacao: ".cotacoes__header-price span:first",
      risco: ".cotacoes__yield span.typography__pill-risk--medium",
      razaoSocial: "div.cotacoes__list .cotacoes__list-item:eq(0) p",
      setor: "div.cotacoes__list .cotacoes__list-item:eq(2) p",
      segmento: "div.cotacoes__list .cotacoes__list-item:eq(3) p",
      administrador: "div.cotacoes__list .cotacoes__list-item:eq(4) p",
      rendimento:
        ".cotacoes__yield .cotacoes__yield-item:first .typography--wmedium",
    },
  };

  const pup = await processoPrincipal_ini();

  let relacaoTotalJson = [];

  console.log(`Lendo url de ${acoes.length} ações`);

  let i = 0;
  for await (const acao of acoes) {
    i++;
    const page = await pup.acessarUrl(new URL(params.url.href + acao + "/"));

    const risco = await page.jQuery(params.selectors.risco).text();
    const rendimento = removerStrDinheiro(
      await page.jQuery(params.selectors.rendimento).text()
    );
    const cotacao = removerStrDinheiro(
      await page.jQuery(params.selectors.cotacao).text()
    );
    const razaoSocial = await page.jQuery(params.selectors.razaoSocial).text();
    const setor = await page.jQuery(params.selectors.setor).text();
    const segmento = await page.jQuery(params.selectors.segmento).text();
    const administrador = await page
      .jQuery(params.selectors.administrador)
      .text();

    const cotacao_por_rendimento = converterPorcentagem(rendimento, cotacao);

    relacaoTotalJson.push({
      acao,
      cotacao,
      rendimento,
      risco,
      cotacao_por_rendimento,
      razaoSocial,
      setor,
      segmento,
      administrador,
    });

    if (i % LOG_CRIADO_A_CADA_BATCH === 0) {
      console.log(`${i} lidos`);
    }
  }
  console.log(`${i} lidos - Finalizado`);

  await pup.fecharNavegador();

  relacaoTotalJson = lodash.orderBy(
    relacaoTotalJson,
    ORDER_BY.col,
    ORDER_BY.sort
  );

  const relacaoTotalCsv = transformarJsonEmCsv(relacaoTotalJson);
  const qnt = relacaoTotalJson.length;

  FileUtils.criarArquivo(DIR_ARQUIVO, relacaoTotalCsv, qnt);
}

function converterStrNumeroParaFloat(dinheiro: string) {
  const val = parseFloat(dinheiro.replace(",", "."));
  if (isNaN(val)) return 0;
  return val;
}

function removerStrDinheiro(dinheiro: string) {
  return dinheiro.replace("R$ ", "");
}

function converterPorcentagem(val1: string, val2: string): string {
  let val =
    converterStrNumeroParaFloat(val1) / converterStrNumeroParaFloat(val2);
  const valStr = val.toString().replace(".", ",");

  return valStr;
}

function transformarJsonEmCsv(conteudo: {}[]) {
  const items = conteudo;
  const replacer = (key, value) => (value === null ? "" : value); // specify how you want to handle null values here
  const header = Object.keys(items[0]);
  const csv = [
    header.join(";"), // header row first
    ...items.map((row) =>
      header
        .map((fieldName) => JSON.stringify(row[fieldName], replacer))
        .join(";")
    ),
  ].join("\r\n");
  return csv;
}

async function processoPrincipal_ini(): Promise<PuppeteerUtils> {
  const pup = new PuppeteerUtils(PUPPETER_PARAMS);
  await pup.iniciar();
  return pup;
}
