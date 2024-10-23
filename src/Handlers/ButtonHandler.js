import { LoadFiles } from "../Functions/FileLoader.js";
import { pathToFileURL } from "url";
import chalk from "chalk";
import AsciiTable from "ascii-table";

async function LoadButtons(client) {
  client.buttons = new Map();

  try {
    const files = await LoadFiles("/src/Bot/Buttons/");

    const table = new AsciiTable()
      .setHeading("⠀⠀ID⠀⠀", "⠀⠀⠀⠀Botón⠀⠀⠀⠀", "⠀⠀Estado⠀⠀")
      .setBorder("┋", "═", "●", "●")
      .setAlign(1, AsciiTable.CENTER)
      .setAlign(2, AsciiTable.CENTER)
      .setAlign(3, AsciiTable.CENTER);

    const buttonsArray = await Promise.all(
      files.map(async (file, index) => {
        const { buttonName, status } = await loadButton(client, file);

        table.addRow(
          (index + 1).toString() + ".",
          buttonName || "Botón Desconocido",
          status ? "🔷" : "🔺"
        );

        return { buttonName, status };
      })
    );

    if (files.length === 0) {
      table.addRow("0", "Sin botones", "🔆");
    }

    console.log(chalk.cyan("\n=== Carga de Botones ==="));
    console.log(chalk.white(table.toString()));

    console.log(chalk.yellow("\nEstadísticas de carga:"));
    const totalButtons = buttonsArray.length;
    const loadedButtons = buttonsArray.filter((b) => b.status).length;
    console.log(chalk.blue(`Botones cargados correctamente: ${loadedButtons}`));
    console.log(
      chalk.red(`Botones con errores: ${totalButtons - loadedButtons}`)
    );
  } catch (error) {
    console.error(chalk.redBright(`[Error] ${error.message}`));
  }
}

async function loadButton(client, file) {
  try {
    const buttonModule = await import(pathToFileURL(file).href);
    const button = buttonModule.default || buttonModule;

    if (!button.name) {
      throw new Error("ButtonID No Encontrado");
    }

    client.buttons.set(button.name, button);

    return { buttonName: button.name, status: true };
  } catch (error) {
    const buttonName = file.split("/").pop().slice(0, -3);
    console.error(
      chalk.redBright(`[Error] Cargando ${buttonName}: ${error.message}`)
    );
    return { buttonName, status: false };
  }
}

export { LoadButtons };
