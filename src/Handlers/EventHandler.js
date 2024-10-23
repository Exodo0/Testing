import { LoadFiles } from "../Functions/FileLoader.js";
import { pathToFileURL } from "url";
import AsciiTable from "ascii-table";
import chalk from "chalk";

async function LoadEvents(client) {
  client.events = new Map();

  try {
    const files = await LoadFiles("/src/Events");

    const table = new AsciiTable()
      .setHeading("⠀⠀ID⠀⠀", "⠀⠀⠀⠀Evento⠀⠀⠀⠀", "⠀⠀Estado⠀⠀", "⠀⠀Tiempo (ms)⠀⠀")
      .setBorder("┋", "═", "●", "●")
      .setAlign(1, AsciiTable.CENTER)
      .setAlign(2, AsciiTable.CENTER)
      .setAlign(3, AsciiTable.CENTER)
      .setAlign(4, AsciiTable.CENTER);

    const loadTimes = [];

    await Promise.all(
      files.map(async (file, index) => {
        const startTime = process.hrtime();
        const { eventName, status } = await loadEvent(client, file);
        const [seconds, nanoseconds] = process.hrtime(startTime);
        const loadTime = (seconds * 1000 + nanoseconds / 1e6).toFixed(2);

        loadTimes.push({ eventName, loadTime: parseFloat(loadTime) });

        table.addRow(
          (index + 1).toString() + ".",
          eventName || "Evento Desconocido",
          status ? "🔷" : "🔺",
          loadTime
        );
      })
    );

    if (files.length === 0) {
      table.addRow("0", "Sin eventos", "🔆", "-");
    }

    console.log(chalk.cyan("\n=== Carga de Eventos ==="));
    console.log(chalk.white(table.toString()));

    // Encontrar el evento que tardó más en cargar
    const slowestEvent = loadTimes.reduce((prev, current) =>
      prev.loadTime > current.loadTime ? prev : current
    );

    console.log(chalk.yellow("\nEstadísticas de carga:"));
    console.log(
      chalk.magenta(
        `Evento más lento: ${
          slowestEvent.eventName
        } (${slowestEvent.loadTime.toFixed(2)} ms)`
      )
    );

    const averageTime =
      loadTimes.reduce((sum, { loadTime }) => sum + loadTime, 0) /
      loadTimes.length;
    console.log(
      chalk.blue(`Tiempo promedio de carga: ${averageTime.toFixed(2)} ms`)
    );
  } catch (error) {
    console.error(chalk.redBright(`[Error] ${error.message}`));
  }
}

async function loadEvent(client, file) {
  try {
    const eventModule = await import(pathToFileURL(file).href);
    const event = eventModule.default || eventModule;

    if (!event.name) {
      throw new Error(`El evento en ${file} no tiene nombre.`);
    }

    const execute = (...args) => event.execute(...args, client);
    const target = event.rest ? client.rest : client;
    target[event.once ? "once" : "on"](event.name, execute);

    client.events.set(event.name, execute);

    return { eventName: event.name, status: true };
  } catch (error) {
    const eventName = file.split("/").pop().slice(0, -3);
    console.error(
      chalk.redBright(`[Error] Cargando ${eventName}: ${error.message}`)
    );
    return { eventName, status: false };
  }
}

export { LoadEvents };
