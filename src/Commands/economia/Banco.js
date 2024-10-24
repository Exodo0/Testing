import { SlashCommandBuilder, EmbedBuilder, codeBlock } from "discord.js";
import EcoUsuarios from "../../Schemas/Economia/EcoUsuarios.js";

const formatNumber = (num) =>
  Math.round(num).toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
  });

export default {
  data: new SlashCommandBuilder()
    .setName("banco")
    .setDescription("🏦 Muestra tu saldo bancario")
    .addUserOption((option) =>
      option
        .setName("usuario")
        .setDescription("👤 Consulta el saldo bancario de otro usuario")
        .setRequired(false)
    ),

  async execute(interaction, client) {
    const { guild, user, options } = interaction;
    const Target = options.getUser("usuario") || user;
    const userData = await client.FetchBalance(Target.id, guild.id);
    const economiaConfig = await EcoUsuarios.findOne({ GuildId: guild.id });

    if (!userData) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setDescription("❌ Usuario no encontrado en el sistema bancario."),
        ],
        ephemeral: true,
      });
    }

    // Verificar si es cuenta SAT
    if (userData.Sat || userData.TipoCuenta === "gobierno") {
      // Solo permitir ver el saldo si tiene el rol SAT
      if (!interaction.member.roles.cache.has(economiaConfig.RolSat)) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("Red")
              .setDescription(
                "❌ No tienes permiso para ver el saldo de cuentas gubernamentales."
              ),
          ],
          ephemeral: true,
        });
      }

      const embed = new EmbedBuilder()
        .setColor("Gold")
        .setTitle("🏦 Balance SAT")
        .setDescription(`Balance de la cuenta gubernamental`)
        .setThumbnail(Target.displayAvatarURL())
        .addFields({
          name: "💰 Cuenta Gobierno",
          value: codeBlock(formatNumber(userData.CuentaGobierno.Balance)),
          inline: true,
        })
        .setTimestamp();

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setColor("Blue")
      .setTitle("🏦 Balance Bancario")
      .setDescription(`Balance de: <@${Target.id}>`)
      .setThumbnail(Target.displayAvatarURL())
      .addFields(
        {
          name: "💳 Cuenta Salario",
          value: codeBlock(formatNumber(userData.CuentaSalario.Balance)),
          inline: true,
        },
        {
          name: "🏦 Cuenta Corriente",
          value: codeBlock(formatNumber(userData.CuentaCorriente.Balance)),
          inline: true,
        }
      )
      .setTimestamp();

    // Agregar campo de deuda si existe
    if (userData.Deuda > 0) {
      embed.addFields({
        name: "⚠️ Deuda Pendiente",
        value: codeBlock(formatNumber(userData.Deuda)),
        inline: false,
      });

      // Cambiar el color del embed a rojo si hay deuda
      embed.setColor("Red");
    }

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
