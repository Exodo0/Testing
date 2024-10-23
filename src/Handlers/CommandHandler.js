import { REST, Routes } from "discord.js";
import { pathToFileURL } from "url";
import { LoadFiles } from "../Functions/FileLoader.js";
import chalk from "chalk";
import AsciiTable from "ascii-table";
import dotenv from "dotenv";
dotenv.config();

async function LoadCommands(client) {
  client.commands = new Map();
  client.subCommands = new Map();

  try {
    const files = await LoadFiles("/src/Commands/");

    const table = new AsciiTable()
      .setHeading(
        "⠀⠀ID⠀⠀",
        "⠀⠀⠀⠀Comando⠀⠀⠀⠀",
        "⠀⠀Entorno⠀⠀",
        "⠀⠀Estado⠀⠀",
        "⠀⠀Tiempo (ms)⠀⠀"
      )
      .setBorder("┋", "═", "●", "●")
      .setAlign(1, AsciiTable.CENTER)
      .setAlign(2, AsciiTable.CENTER)
      .setAlign(3, AsciiTable.CENTER)
      .setAlign(4, AsciiTable.CENTER)
      .setAlign(5, AsciiTable.CENTER);

    const loadTimes = [];
    const commandsArray = [];

    await Promise.all(
      files.map(async (file, index) => {
        const startTime = process.hrtime();
        const command = await loadCommand(client, file);
        const [seconds, nanoseconds] = process.hrtime(startTime);
        const loadTime = (seconds * 1000 + nanoseconds / 1e6).toFixed(2);

        loadTimes.push({
          commandName: command.name,
          loadTime: parseFloat(loadTime),
        });
        commandsArray.push(command);

        table.addRow(
          (index + 1).toString() + ".",
          command.name || "Comando Desconocido",
          getCommandEnvironment(command),
          command.status ? "🔷" : "🔺",
          loadTime
        );
      })
    );

    if (files.length === 0) {
      table.addRow("0", "Sin comandos", "-", "🔆", "-");
    }

    console.log(chalk.cyan("\n=== Carga de Comandos ==="));
    console.log(chalk.white(table.toString()));

    // Encontrar el comando que tardó más en cargar
    const slowestCommand = loadTimes.reduce((prev, current) =>
      prev.loadTime > current.loadTime ? prev : current
    );

    console.log(chalk.yellow("\nEstadísticas de carga:"));
    console.log(
      chalk.magenta(
        `Comando más lento: ${
          slowestCommand.commandName
        } (${slowestCommand.loadTime.toFixed(2)} ms)`
      )
    );

    const averageTime =
      loadTimes.reduce((sum, { loadTime }) => sum + loadTime, 0) /
      loadTimes.length;
    console.log(
      chalk.blue(`Tiempo promedio de carga: ${averageTime.toFixed(2)} ms`)
    );

    await updateApplicationCommands(
      client,
      commandsArray.filter((c) => !c.subCommand)
    );
  } catch (error) {
    console.error(chalk.red("Error loading commands:"), error);
  }
}

async function loadCommand(client, file) {
  try {
    const commandModule = await import(pathToFileURL(file).href);
    const command = commandModule.default || commandModule;

    if (command.subCommand) {
      return handleSubCommand(client, command);
    } else {
      return handleMainCommand(client, command);
    }
  } catch (error) {
    console.error(chalk.red(`Error loading command from ${file}:`), error);
    return { name: "Unknown Command", status: false };
  }
}

function handleSubCommand(client, command) {
  const [commandName, subCommandName] = command.subCommand.split(".");
  if (!client.subCommands.has(commandName)) {
    client.subCommands.set(commandName, new Map());
  }
  client.subCommands.get(commandName).set(subCommandName, command);
  return {
    name: `${commandName}.${subCommandName}`,
    subCommand: true,
    status: true,
  };
}

function handleMainCommand(client, command) {
  client.commands.set(command.data.name, command);
  return {
    ...command.data.toJSON(),
    name: command.data.name,
    subCommand: false,
    developer: command.developer || false,
    Va: command.Va || false,
    Mxrp: command.Mxrp || false,
    Faccion: command.Faccion || false,
    status: true,
  };
}

function getCommandEnvironment(command) {
  if (command.subCommand) return "SubCmd";
  if (command.developer) return "Dev";
  if (command.Faccion) return "Facción";
  if (command.Va) return "VA";
  if (command.Mxrp) return "MXRP";
  return "Global";
}

async function updateApplicationCommands(client, commandsArray) {
  const rest = new REST().setToken(process.env.Token);
  const guildIds = {
    dev: process.env.Dev,
    vinculacion: process.env.Vinculacion,
    mxrp: process.env.MxRP,
    facciones: process.env.Facciones,
  };

  console.log(chalk.yellow("\nStarted refreshing application (/) commands."));

  const commandTypes = {
    dev: (cmd) => cmd.developer,
    va: (cmd) => cmd.Va,
    mx: (cmd) => cmd.Mxrp,
    fac: (cmd) => cmd.Faccion,
    global: (cmd) => !cmd.developer && !cmd.Va && !cmd.Mxrp && !cmd.Faccion,
  };

  const updatePromises = Object.entries(commandTypes).map(([type, filter]) => {
    const commands = commandsArray.filter(
      (cmd) => filter(cmd) && cmd.name !== "Unknown Command"
    );
    if (commands.length > 0) {
      const guildId = guildIds[type] || null;
      const route = guildId
        ? Routes.applicationGuildCommands(client.user.id, guildId)
        : Routes.applicationCommands(client.user.id);
      return rest.put(route, { body: commands }).then(() => {
        console.log(chalk.green(`Successfully reloaded ${type} commands.`));
      });
    }
    return Promise.resolve();
  });

  try {
    await Promise.all(updatePromises);
  } catch (error) {
    console.error(chalk.red("Error updating application commands:"), error);
  }
}

export { LoadCommands };
