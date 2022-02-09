import FileUtils from "utils/FileUtils";

//===================================

const PUPPETER_PARAMS = { headless: true };
const DIR_ARQUIVO_INPUT = "./files/fis.csv";
const DIR_ARQUIVO_OUTPUT = "./files/fis_format.csv";
const ORDER_BY = {
  col: ["cotacao", "rendimento", "risco"],
  sort: ["asc", "desc", "asc"],
};

(async () => {
  await ini();
})();

//===================================

async function ini(): Promise<void> {
  const arquivo = FileUtils.abrirArquivo(DIR_ARQUIVO_INPUT);
  console.log("arquivo:", arquivo);

  const quebrarLinhaArquivo = arquivo.split("\n");
  const novoArq = quebrarLinhaArquivo.map((linha) => {
    let conteudo = linha.split(",");
    conteudo = transformarConteudo(conteudo);
    linha = conteudo.join(";");
    return linha;
  });

  console.log("novoArq:", novoArq);

  FileUtils.criarArquivo(
    DIR_ARQUIVO_OUTPUT,
    novoArq.join(""),
    quebrarLinhaArquivo.length
  );
}
function transformarConteudo(conteudo: string[]): string[] {
  return conteudo.map((c) => {
    return c;
  });
}
