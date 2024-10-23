import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("🆘 Revisa los comandos del bot"),

  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */

  async execute(interaction, client) {
    const categories = {
      Global: [],
    };

    for (const [, command] of client.commands) {
      const cmdData = command.data.toJSON();
      if (
        !command.developer &&
        !command.Va &&
        !command.Mxrp &&
        !command.Faccion
      ) {
        categories.Global.push(
          `> 🔹 \`/${cmdData.name}\`\n> ${cmdData.description}`
        );
      }
    }

    const baseEmbed = new EmbedBuilder()
      .setColor("Random")
      .setAuthor({
        name: "MXRP",
        iconURL: client.user.displayAvatarURL(),
      })
      .setTimestamp()
      .setFooter({
        text: `Solicitado por ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL(),
      });

    const pages = [];
    const mainEmbed = EmbedBuilder.from(baseEmbed).setDescription(
      "```md\n# Bienvenido al Sistema de Ayuda```\n" +
        "Usa los botones de navegación para explorar todos los comandos disponibles.\n\n" +
        "**📊 Estadísticas**\n" +
        `> 📑 Total de Comandos: \`${categories.Global.length}\`\n` +
        `> 👥 Servidor: \`${interaction.guild.name}\`\n` +
        `> 🤖 Prefix: \`/\`\n\n` +
        "```md\n# Información Adicional```\n" +
        "> 🔹 Este bot está diseñado para uso global\n" +
        "> 🔹 Todos los comandos usan slash commands\n" +
        "> 🔹 Navega con los botones de abajo"
    );
    pages.push(mainEmbed);

    const commandsPerPage = 5;
    for (let i = 0; i < categories.Global.length; i += commandsPerPage) {
      const pageCommands = categories.Global.slice(i, i + commandsPerPage);
      const pageEmbed = EmbedBuilder.from(baseEmbed).setDescription(
        "```md\n# Lista de Comandos```\n" +
          "Aquí encontrarás todos los comandos disponibles para ti:\n\n" +
          pageCommands.join("\n\n") +
          "\n\n```md\n# Página " +
          (Math.floor(i / commandsPerPage) + 1) +
          " de " +
          Math.ceil(categories.Global.length / commandsPerPage) +
          "```"
      );
      pages.push(pageEmbed);
    }

    const pagination = new client.Pagination(interaction);
    await pagination
      .addPages(pages)
      .changeButton("first", { label: "≪ Inicio", style: "Primary" })
      .changeButton("previous", { label: "⇐ Anterior", style: "Primary" })
      .changeButton("next", { label: "Siguiente ⇒", style: "Primary" })
      .changeButton("last", { label: "Final ≫", style: "Primary" })
      .display();
  },
};
