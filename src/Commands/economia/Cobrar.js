import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  codeBlock,
} from "discord.js";
import EcoUsuarios from "../../Schemas/Economia/EcoUsuarios.js";

function formatCurrency(amount) {
  return amount.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
  });
}

export default {
  data: new SlashCommandBuilder()
    .setName("cobrar")
    .setDescription("💸 Cobra tu salario diario"),

  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    const { guild, user } = interaction;
    await interaction.deferReply({ ephemeral: true });

    try {
      const ecoData = await EcoUsuarios.findOne({
        GuildId: guild.id,
        "Usuario.UserId": user.id,
      });

      if (!ecoData) {
        return interaction.editReply({
          content: "❌ No estás registrado en el sistema económico.",
        });
      }

      const userData = ecoData.Usuario.find((u) => u.UserId === user.id);

      if (!userData) {
        return interaction.editReply({
          content: "❌ No se encontraron datos económicos para tu usuario.",
        });
      }

      if (!userData.CuentaSalario.Activa) {
        return interaction.editReply({
          content: "❌ Tu cuenta salario no está activa.",
        });
      }

      const now = new Date();
      const lastCobro = userData.LastCobro || new Date(0);
      const hoursPassed = (now - lastCobro) / (1000 * 60 * 60);

      if (hoursPassed < 24) {
        const nextCobroTime = new Date(
          lastCobro.getTime() + 24 * 60 * 60 * 1000
        );
        const embed = new EmbedBuilder()
          .setTitle("⚠️ Cobro de salario ya realizado")
          .setColor("Yellow")
          .setDescription(
            `Ya has cobrado tu salario recientemente. Tu siguiente cobro estará disponible el:\n\n**${nextCobroTime.toLocaleDateString()}** a las **${nextCobroTime.toLocaleTimeString()}**.`
          )
          .setThumbnail(user.displayAvatarURL({ dynamic: true }))
          .setTimestamp();

        return interaction.editReply({ embeds: [embed] });
      }

      let salario = 0;
      const roles = interaction.member.roles.cache.map((role) => role.id);

      if (roles.includes(ecoData.Salario2k)) salario += 2500;
      if (roles.includes(ecoData.Salario5k)) salario += 5000;
      if (roles.includes(ecoData.Salario7k)) salario += 7500;
      if (roles.includes(ecoData.Salario10k)) salario += 10000;
      if (roles.includes(ecoData.Salario15k)) salario += 15000;
      if (roles.includes(ecoData.Salario20k)) salario += 20000;
      if (roles.includes(ecoData.Salario25k)) salario += 25000;

      if (salario === 0) {
        return interaction.editReply({
          content: "⚠️ No tienes un rol de salario válido para cobrar.",
        });
      }

      // Calcular el IVA (16%)
      const iva = salario * 0.16;
      const salarioNeto = salario - iva;

      // Depositar en cuenta salario
      userData.CuentaSalario.Balance += salarioNeto;
      userData.LastCobro = now;

      // Buscar cuenta SAT y depositar IVA
      const satUser = ecoData.Usuario.find((u) => u.Sat === true);
      if (satUser && satUser.CuentaGobierno.Activa) {
        satUser.CuentaGobierno.Balance += iva;
      }

      await ecoData.save();

      const nextCobroTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      const embed = new EmbedBuilder()
        .setTitle("💸 Salario Cobrado")
        .setColor("Green")
        .setTimestamp()
        .addFields(
          {
            name: "Has cobrado:",
            value: codeBlock(formatCurrency(salarioNeto)),
            inline: false,
          },
          {
            name: "IVA (16%):",
            value: codeBlock(formatCurrency(iva)),
            inline: false,
          },
          {
            name: "Monto total antes de IVA:",
            value: codeBlock(formatCurrency(salario)),
            inline: false,
          },
          {
            name: "Saldo actual en cuenta salario:",
            value: codeBlock(formatCurrency(userData.CuentaSalario.Balance)),
            inline: false,
          },
          {
            name: "Próximo cobro disponible el:",
            value: codeBlock(
              `${nextCobroTime.toLocaleDateString()} a las ${nextCobroTime.toLocaleTimeString()}`
            ),
            inline: false,
          }
        );

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.editReply({
        content: "❌ Hubo un error al intentar cobrar tu salario.",
      });
    }
  },
};
