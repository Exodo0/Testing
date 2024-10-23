import { Events, ActivityType } from "discord.js";
import { LoadCommands } from "../../Handlers/CommandHandler.js";
import { LoadButtons } from "../../Handlers/ButtonHandler.js";
import { LoadFunctions } from "../../Handlers/FunctionHandler.js";
//import { LoadMenu } from "../../Handlers/MenuHandler.js";
//import { LoadModals } from "../../Handlers/ModalHandler.js";
import mongoose from "mongoose";
import chalk from "chalk";
import erlc from "erlc-api";
import dotenv from "dotenv";
dotenv.config();

export default {
  name: Events.ClientReady,
  once: true,
  /**
   * @param {Client} client
   */
  async execute(client) {
    const Activities = [
      { name: "MXRP", type: ActivityType.Watching },
      { name: "discord.gg/mxrp", type: ActivityType.Watching },
      { name: "Recuerda leer las reglas", type: ActivityType.Watching },
    ];

    const selectActivity = () => {
      return Activities[Math.floor(Math.random() * Activities.length)];
    };

    try {
      LoadCommands(client);
      LoadButtons(client);
      LoadFunctions(client);
      //LoadMenu(client);
      //LoadModals(client);

      await mongoose
        .connect(process.env.Mongoose)
        .then(() => console.log(chalk.greenBright("[DataBase] Conectada")))
        .catch((error) => {
          console.log(chalk.redBright("[DataBase] Fallida"));
          console.error(error.message);
        });

      const activityBot = selectActivity();
      client.user.setActivity(activityBot.name, { type: activityBot.type });

      const ERLC = new erlc.Client({
        globalToken: process.env.GlobalToken,
      });

      ERLC.config(console.log(chalk.greenBright("[ERLC API] Activa")));
    } catch (error) {
      console.error(chalk.redBright(`[Error] ${error}`));
      throw error;
    }
  },
};
