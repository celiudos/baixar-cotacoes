import fs from "fs";

export default class FileUtils {
  static criarArquivo(dirComArquivo: string, conteudo: string, qnt: number) {
    fs.writeFileSync(dirComArquivo, conteudo, "utf8");
  }

  static abrirArquivo(dirComArquivo) {
    return fs.readFileSync(dirComArquivo, { encoding: "utf8", flag: "r" });
  }
}
