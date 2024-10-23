import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  codeBlock,
} from "discord.js";

const formatNumber = (num) =>
  Math.round(num).toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
  });

export default {
  data: new SlashCommandBuilder()
    .setName("saldo")
    .setDescription("📊 Muestra tu saldo actual en efectivo y banco")
    .addUserOption((option) =>
      option
        .setName("usuario")
        .setDescription("👤 Consulta el saldo de otro usuario")
        .setRequired(false)
    ),
  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    const { guild, user, options } = interaction;
    const Target = options.getUser("usuario") || user;
    const userData = await client.FetchBalance(Target.id, guild.id);

    if (userData.Sat) {
      const satEmbed = new EmbedBuilder()
        .setTitle("💰 Balance del SAT")
        .setDescription(
          `<a:Arrow:1296172602175258696> Balance de: <@${Target.id}> (SAT)`
        )
        .setThumbnail(Target.displayAvatarURL({}))
        .setFields({
          name: "``🏦`` Banco",
          value: codeBlock(formatNumber(userData.Banco)),
          inline: true,
        })
        .setFooter({ text: "Entidad gubernamental - Solo se muestra el Banco" })
        .setColor("Red")
        .setTimestamp();

      await interaction.reply({ embeds: [satEmbed] });
    } else {
      const normalEmbed = new EmbedBuilder()
        .setTitle("💰 Balance General")
        .setDescription(
          `<a:Arrow:1296172602175258696> Balance de: <@${Target.id}>`
        )
        .setThumbnail(Target.displayAvatarURL({}))
        .setFields(
          {
            name: "``💼`` Efectivo",
            value: codeBlock(formatNumber(userData.Efectivo)),
            inline: true,
          },
          {
            name: "``🏦`` Banco",
            value: codeBlock(formatNumber(userData.Banco)),
            inline: true,
          },
          {
            name: "``💼`` Dinero Negro",
            value: codeBlock(formatNumber(userData.DineroNegro)),
            inline: true,
          }
        )
        .setFooter({ text: "Recuerda revisar tu cuenta regularmente" })
        .setColor("Blurple")
        .setTimestamp();

      if (userData.Deuda > 0) {
        normalEmbed.addFields({
          name: "``💳`` Deuda Actual",
          value: codeBlock(formatNumber(userData.Deuda)),
        });
      }

      await interaction.reply({ embeds: [normalEmbed] });
    }
  },
};
