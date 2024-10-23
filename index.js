console.clear();
import { ShardingManager } from "discord.js";
import chalk from "chalk";
import dotenv from "dotenv";
dotenv.config();

try {
  const Manager = new ShardingManager("./src/Main.js", {
    token: process.env.Token,
    totalShards: "auto",
    respawn: true,
  });

  Manager.on("shardCreate", (shard) => {
    console.log(chalk.greenBright(`[Shard Creado] Shard ID: ${shard.id}`));
    shard.on("ready", () =>
      console.log(chalk.blue(`[Shard Listo] Shard ID: ${shard.id}`))
    );
    shard.on("disconnect", () =>
      console.log(chalk.yellow(`[Shard Desconectado] Shard ID: ${shard.id}`))
    );
    shard.on("reconnecting", () =>
      console.log(chalk.magenta(`[Shard Reconectando] Shard ID: ${shard.id}`))
    );
    shard.on("error", (error) =>
      console.log(
        chalk.red(`[Shard Error] Shard ID: ${shard.id}, Error: ${error}`)
      )
    );
  });

  Manager.spawn().catch((spawnError) => {
    console.log(chalk.redBright(`[Shard Spawn Fallido] ${spawnError}`));
  });
} catch (error) {
  console.log(chalk.redBright(`[Manager Fallido] ${error}`));
  throw error;
}
