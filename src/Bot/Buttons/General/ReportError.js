import {
  EmbedBuilder,
  ButtonInteraction,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} from "discord.js";
import chalk from "chalk";
import { create } from "sourcebin";

export default {
  name: "ReporteError",
  /**
   *
   * @param {ButtonInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    if (client.lastError) {
      try {
        const developer = await client.users.fetch("979454725189689375");

        const errorMessage = `${client.lastError.stack || client.lastError}`;

        const bin = await create({
          title: `Reporte de Error - ${new Date().toISOString()}`,
          description: `Error en: ${interaction.guild.name}`,
          files: [
            {
              content: `${errorMessage}`,
              language: "JavaScript",
            },
          ],
        });

        const Row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setEmoji("🔗")
            .setLabel("Log")
            .setStyle(ButtonStyle.Link)
            .setURL(`${bin.url}`)
        );

        await developer.send({
          embeds: [
            new EmbedBuilder()
              .setColor("Red")
              .setDescription("Reporte de error")
              .setThumbnail(client.user.displayAvatarURL())
              .setTimestamp(),
          ],
          components: [Row],
        });

        client.lastError = null;

        const successEmbed = new EmbedBuilder()
          .setColor("Green")
          .setTitle("Error Reportado")
          .setDescription(
            "El error ha sido reportado al desarrollador con todos los detalles. Gracias por tu ayuda."
          )
          .setTimestamp();

        await interaction.reply({
          embeds: [successEmbed],
          ephemeral: true,
        });
      } catch (error) {
        console.error(
          chalk.red("Error al enviar reporte al desarrollador:"),
          error
        );

        const errorEmbed = new EmbedBuilder()
          .setColor("Red")
          .setTitle("Error al Reportar")
          .setDescription(
            "Hubo un problema al reportar el error. Por favor, inténtalo de nuevo más tarde."
          )
          .setTimestamp();

        await interaction.reply({
          embeds: [errorEmbed],
          ephemeral: true,
        });
      }
    } else {
      const noErrorEmbed = new EmbedBuilder()
        .setColor("Blue")
        .setTitle("Sin Errores Recientes")
        .setDescription("No hay errores recientes para reportar.")
        .setTimestamp();

      await interaction.reply({
        embeds: [noErrorEmbed],
        ephemeral: true,
      });
    }
  },
};
