import { SlashCommandBuilder, EmbedBuilder, codeBlock } from "discord.js";

const formatNumber = (num) =>
  Math.round(num).toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
  });

export default {
  data: new SlashCommandBuilder()
    .setName("saldo")
    .setDescription("📊 Muestra tu saldo en efectivo")
    .addUserOption((option) =>
      option
        .setName("usuario")
        .setDescription("👤 Consulta el saldo de otro usuario")
        .setRequired(false)
    ),

  async execute(interaction, client) {
    const { guild, user, options } = interaction;
    const Target = options.getUser("usuario") || user;
    const userData = await client.FetchBalance(Target.id, guild.id);

    if (!userData) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setDescription(
              "❌ Usuario no encontrado en el sistema económico."
            ),
        ],
        ephemeral: true,
      });
    }

    // Prevenir consulta de saldo SAT
    if (userData.Sat || userData.TipoCuenta === "gobierno") {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setDescription(
              "❌ No se puede consultar el saldo de cuentas gubernamentales."
            ),
        ],
        ephemeral: true,
      });
    }

    const embed = new EmbedBuilder()
      .setColor("Blue")
      .setTitle("💰 Balance en Efectivo")
      .setDescription(`Balance de: <@${Target.id}>`)
      .setThumbnail(Target.displayAvatarURL())
      .addFields(
        {
          name: "💵 Efectivo",
          value: codeBlock(formatNumber(userData.Efectivo)),
          inline: true,
        },
        {
          name: "🦹‍♂️ Dinero Negro",
          value: codeBlock(formatNumber(userData.DineroNegro)),
          inline: true,
        }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
