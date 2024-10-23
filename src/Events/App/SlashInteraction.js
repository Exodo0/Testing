import {
  Events,
  ChatInputCommandInteraction,
  Collection,
  Client,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} from "discord.js";
import chalk from "chalk";

const formatCooldown = (seconds) => {
  const units = [
    { value: 86400, label: "d" },
    { value: 3600, label: "h" },
    { value: 60, label: "m" },
    { value: 1, label: "s" },
  ];

  return units
    .reduce((time, { value, label }) => {
      const count = Math.floor(seconds / value);
      seconds %= value;
      return count > 0 ? `${time}${count}${label} ` : time;
    }, "")
    .trim();
};

const handleError = async (interaction, client, error) => {
  console.error(chalk.redBright(`[Error] ${error}`));
  console.error(error);

  const errorEmbed = new EmbedBuilder()
    .setColor("Red")
    .setThumbnail(client.user.displayAvatarURL())
    .setTitle("Error Detectado")
    .setDescription(
      "<:s_discord:1271586960087191603> Estamos teniendo problemas técnicos \n\nPuedes intentarlo más tarde"
    );

  const Row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("ReporteError")
      .setLabel("Reportar Error")
      .setStyle(ButtonStyle.Danger)
  );

  const reply = {
    embeds: [errorEmbed],
    components: [Row],
    ephemeral: true,
  };

  if (!interaction.deferred && !interaction.replied) {
    await interaction.reply(reply);
  } else {
    await interaction.editReply(reply);
  }

  client.lastError = error;
};

export default {
  name: Events.InteractionCreate,
  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    if (!client.cooldowns) client.cooldowns = new Collection();

    try {
      if (interaction.isAutocomplete()) {
        const command = client.commands.get(interaction.commandName);
        return command?.autocomplete
          ? command.autocomplete(interaction, client)
          : interaction.respond([]);
      }

      if (!interaction.isCommand()) return;

      if (!interaction.inGuild()) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("Red")
              .setDescription(
                "<:s_discord:1271586960087191603> Este comando solo puede ser usado dentro de un servidor."
              ),
          ],
          ephemeral: true,
        });
      }

      const command = client.commands.get(interaction.commandName);
      if (!command) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("Red")
              .setThumbnail(client.user.displayAvatarURL())
              .setDescription(
                "<:s_discord:1271586960087191603> Este comando está desactualizado"
              )
              .setFooter({ text: "Inténtalo en un par de minutos" }),
          ],
          ephemeral: true,
        });
      }

      if (command.cooldown) {
        const { cooldowns } = client;
        const now = Date.now();
        const cooldownAmount = (command.cooldown ?? 5) * 1000;
        const userCooldowns =
          cooldowns.get(interaction.commandName) ?? new Collection();
        cooldowns.set(interaction.commandName, userCooldowns);

        const expirationTime = userCooldowns.get(interaction.user.id);
        if (expirationTime && now < expirationTime) {
          const timeLeft = (expirationTime - now) / 1000;
          const embed = new EmbedBuilder()
            .setColor("Random")
            .setTitle(" <a:alert:1283189217123631281> Alerta de Cooldown")
            .setDescription(
              `Por favor espera: ${formatCooldown(timeLeft)} más para usar \`${
                interaction.commandName
              }\` este comando.`
            );

          return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        userCooldowns.set(interaction.user.id, now + cooldownAmount);
        setTimeout(
          () => userCooldowns.delete(interaction.user.id),
          cooldownAmount
        );
      }

      const subCommandName = interaction.options.getSubcommand(false);
      if (subCommandName) {
        const subCommand = client.subCommands
          .get(interaction.commandName)
          ?.get(subCommandName);
        if (subCommand) return subCommand.execute(interaction, client);
      }

      await command.execute(interaction, client);
    } catch (error) {
      await handleError(interaction, client, error);
    }
  },
};
