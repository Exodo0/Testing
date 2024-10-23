import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  codeBlock,
} from "discord.js";
import EcoUsuario from "../../Schemas/Economia/EcoUsuarios.js";

const formatNumber = (num) =>
  Math.round(num).toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
  });

export default {
  data: new SlashCommandBuilder()
    .setName("pagar")
    .setDescription("💵 Realiza un pago a otro usuario y genera un recibo")
    .addUserOption((option) =>
      option
        .setName("destinatario")
        .setDescription("👤 Usuario al que deseas pagar")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("cantidad")
        .setDescription("💰 Cantidad a pagar")
        .setRequired(true)
    ),

  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    const { options, guild, user } = interaction;
    const destinatario = options.getUser("destinatario");
    let cantidadFormat = options.getString("cantidad").replace(/,/g, "");
    const cantidad = parseFloat(cantidadFormat);

    if (isNaN(cantidad) || cantidad <= 0) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setDescription(
              "❌ La cantidad debe ser un número positivo válido."
            ),
        ],
        ephemeral: true,
      });
    }

    if (destinatario.id === user.id) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setDescription("❌ No puedes pagarte a ti mismo."),
        ],
        ephemeral: true,
      });
    }

    const pagadorBalance = await client.FetchBalance(user.id, guild.id);
    const destinatarioBalance = await client.FetchBalance(
      destinatario.id,
      guild.id
    );

    if (pagadorBalance.Efectivo < cantidad) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setDescription(
              "❌ No tienes suficiente dinero en efectivo para realizar este pago."
            ),
        ],
        ephemeral: true,
      });
    }

    const isSat = destinatarioBalance.Sat || false;
    const comision = isSat ? 0 : cantidad * 0.05;
    const cantidadFinal = cantidad - comision;

    pagadorBalance.Efectivo -= cantidad;
    destinatarioBalance.Efectivo += cantidadFinal;

    if (!isSat) {
      const satBalance = await EcoUsuario.findOne({
        GuildId: guild.id,
        "Usuario.Sat": true,
      });

      if (satBalance) {
        const satUser = satBalance.Usuario.find((u) => u.Sat);
        if (satUser) {
          satUser.Banco += comision;
          await satBalance.save();
        }
      }
    }

    await EcoUsuario.findOneAndUpdate(
      { GuildId: guild.id, "Usuario.UserId": user.id },
      { $set: { "Usuario.$": pagadorBalance } }
    );

    await EcoUsuario.findOneAndUpdate(
      { GuildId: guild.id, "Usuario.UserId": destinatario.id },
      { $set: { "Usuario.$": destinatarioBalance } }
    );

    const reciboEmbed = new EmbedBuilder()
      .setTitle("📄 Recibo de Pago")
      .setThumbnail(client.user.displayAvatarURL())
      .setDescription(`Has pagado a <@${destinatario.id}>`)
      .addFields(
        {
          name: "💵 Cantidad Pagada",
          value: codeBlock(formatNumber(cantidad)),
        },
        { name: "👤 Destinatario", value: `<@${destinatario.id}>` },
        {
          name: "💸 Comisión Cobrada",
          value: isSat
            ? "Exento de comisión."
            : `Se cobró un 5% (${codeBlock(
                formatNumber(comision)
              )}) de comisión.`,
        },
        {
          name: "💰 Cantidad Recibida por el Destinatario",
          value: codeBlock(formatNumber(cantidadFinal)),
        }
      )
      .setColor("Green")
      .setFooter({ text: "Pago registrado correctamente" })
      .setTimestamp();

    await interaction.reply({
      embeds: [reciboEmbed],
      ephemeral: true,
    });
  },
};
