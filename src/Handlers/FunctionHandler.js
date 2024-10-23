import { LoadFiles } from "../Functions/FileLoader.js";
import { pathToFileURL } from "url";
import { basename } from "path";
import chalk from "chalk";
import AsciiTable from "ascii-table";

async function LoadFunctions(client) {
  try {
    const files = await LoadFiles("/src/Functions/");

    const functionsArray = await Promise.all(
      files.map(async (file, index) => {
        const baseFile = basename(file);

        if (baseFile === "FileLoader.js") {
          return { file: baseFile, status: null };
        }

        try {
          const functionModule = await import(pathToFileURL(file).href);
          const func = functionModule.default || functionModule;

          if (typeof func === "function") {
            func(client);
            return { file: baseFile, status: true };
          } else {
            return {
              file: baseFile,
              status: false,
              error: "No es una función válida",
            };
          }
        } catch (error) {
          return { file: baseFile, status: false, error: error.message };
        }
      })
    );

    const table = new AsciiTable()
      .setHeading("⠀⠀ID⠀⠀", "⠀⠀⠀⠀Function⠀⠀⠀⠀", "⠀⠀Estado⠀⠀")
      .setBorder("┋", "═", "●", "●")
      .setAlign(1, AsciiTable.CENTER)
      .setAlign(2, AsciiTable.CENTER)
      .setAlign(3, AsciiTable.CENTER);

    functionsArray.forEach((func, index) => {
      if (func.status !== null) {
        table.addRow(
          (index + 1).toString() + ".",
          func.file,
          func.status ? "🔷" : `🔶`
        );
      }
    });

    if (functionsArray.length === 0) {
      table.addRow("0", "No Functions Found", "🔆");
    }

    console.log(chalk.cyan("\n=== Carga de Funciones ==="));
    console.log(chalk.white(table.toString()));

    console.log(chalk.yellow("\nEstadísticas de carga:"));
    const totalFunctions = functionsArray.filter(
      (f) => f.status !== null
    ).length;
    const loadedFunctions = functionsArray.filter(
      (f) => f.status === true
    ).length;
    console.log(
      chalk.blue(`Funciones cargadas correctamente: ${loadedFunctions}`)
    );
    console.log(
      chalk.red(`Funciones con errores: ${totalFunctions - loadedFunctions}`)
    );
  } catch (error) {
    console.error(chalk.redBright(`[Error] ${error.message}`));
  }
}

export { LoadFunctions };
