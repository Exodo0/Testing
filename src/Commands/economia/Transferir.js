import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  codeBlock,
} from "discord.js";
import EcoUsuarios from "../../Schemas/Economia/EcoUsuarios.js";

const formatNumber = (num) =>
  Math.round(num).toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
  });

export default {
  data: new SlashCommandBuilder()
    .setName("transferir")
    .setDescription("📩 Transfiere dinero a otro usuario")
    .addUserOption((option) =>
      option
        .setName("usuario")
        .setDescription("👤 Usuario al que deseas transferir dinero")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("cantidad")
        .setDescription("💰 Especifica la cantidad a transferir")
        .setRequired(true)
    ),

  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */

  async execute(interaction, client) {
    const { options, guild, user } = interaction;
    await interaction.deferReply({ ephemeral: true });
    const Target = options.getUser("usuario");

    let CantidadFormat = options.getString("cantidad").replace(/,/g, "");
    const cantidad = parseFloat(CantidadFormat);

    if (isNaN(cantidad) || cantidad <= 0) {
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setDescription(
              "<:Error:1296181956844847175> La cantidad a transferir debe ser un número positivo válido."
            )
            .setTimestamp(),
        ],
        ephemeral: true,
      });
    } else if (Target.id === user.id) {
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setDescription(
              "<:Error:1296181956844847175> No puedes transferirte a ti mismo."
            )
            .setTimestamp(),
        ],
        ephemeral: true,
      });
    }

    const userData = await client.FetchBalance(user.id, guild.id);
    const targetData = await client.FetchBalance(Target.id, guild.id);

    if (userData.Efectivo < cantidad) {
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setThumbnail(client.user.displayAvatarURL())
            .setDescription(
              "<:Error:1296181956844847175> No tienes suficiente dinero para transferir."
            )
            .setTimestamp(),
        ],
        ephemeral: true,
      });
    }

    const commissionRate = 0.05; // 5% de comisión
    const commission =
      Target.id === userData.Sat ? 0 : Math.round(cantidad * commissionRate);
    const amountAfterCommission = cantidad - commission;

    let remainingAmount = amountAfterCommission;
    let amountUsedForDebt = 0;

    if (targetData.Deuda > 0) {
      const deuda = targetData.Deuda;
      if (remainingAmount >= deuda) {
        amountUsedForDebt = deuda;
        remainingAmount -= deuda;
        targetData.Deuda = 0;
      } else {
        amountUsedForDebt = remainingAmount;
        targetData.Deuda -= remainingAmount;
        remainingAmount = 0;
      }
    }

    targetData.Efectivo =
      (parseFloat(targetData.Efectivo) || 0) + remainingAmount;
    userData.Efectivo -= cantidad;

    await EcoUsuarios.findOneAndUpdate(
      { GuildId: guild.id, "Usuario.UserId": user.id },
      { $set: { "Usuario.$": userData } }
    );

    await EcoUsuarios.findOneAndUpdate(
      { GuildId: guild.id, "Usuario.UserId": Target.id },
      { $set: { "Usuario.$": targetData } }
    );

    if (commission > 0) {
      const satData = await client.FetchBalance(userData.Sat, guild.id);
      satData.Banco += commission;
      await EcoUsuarios.findOneAndUpdate(
        { GuildId: guild.id, "Usuario.UserId": userData.Sat },
        { $set: { "Usuario.$": satData } }
      );
    }

    const EmbedSuccess = new EmbedBuilder()
      .setTitle("💸 Transferencia Exitosa")
      .setThumbnail(interaction.user.displayAvatarURL())
      .setDescription(`Enviaste a: <@${Target.id}>`)
      .addFields(
        {
          name: "Monto Transferido:",
          value: `Enviado: ${codeBlock(formatNumber(cantidad))}`,
        },
        {
          name: "Comisión Cobrada:",
          value:
            commission > 0
              ? `Se cobró un 5% (${codeBlock(
                  formatNumber(commission)
                )}) de comisión.`
              : "No se cobró comisión.",
        },
        {
          name: "Monto Recibido por el Destinatario:",
          value: `${codeBlock(formatNumber(amountAfterCommission))}`,
        }
      )
      .setColor("Green")
      .setFooter({ text: "Transacción completada con éxito" })
      .setTimestamp();

    if (amountUsedForDebt > 0) {
      EmbedSuccess.addFields(
        {
          name: "💳 Deuda Pagada",
          value: `Se pagaron: ${codeBlock(
            formatNumber(amountUsedForDebt)
          )} de la deuda.`,
        },
        {
          name: "💳 Deuda Restante",
          value:
            targetData.Deuda > 0
              ? `${codeBlock(formatNumber(targetData.Deuda))} aún por pagar.`
              : "La deuda ha sido saldada por completo.",
        }
      );
    }

    await interaction.editReply({ embeds: [EmbedSuccess], ephemeral: true });
  },
};
