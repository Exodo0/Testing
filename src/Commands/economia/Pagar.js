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
    .setName("pagar")
    .setDescription("💵 Realiza un pago a otro usuario")
    .addUserOption((option) =>
      option
        .setName("destinatario")
        .setDescription("👤 Usuario al que deseas pagar")
        .setRequired(true)
    )
    .addNumberOption((option) =>
      option
        .setName("cantidad")
        .setDescription("💰 Cantidad a pagar")
        .setRequired(true)
        .setMinValue(1)
    )
    .addStringOption((option) =>
      option
        .setName("origen")
        .setDescription("💳 Cuenta de origen del pago")
        .setRequired(true)
        .addChoices(
          { name: "Efectivo", value: "efectivo" },
          { name: "Cuenta Corriente", value: "corriente" }
        )
    ),

  async execute(interaction, client) {
    const { options, guild, user } = interaction;
    const destinatario = options.getUser("destinatario");
    const cantidad = options.getNumber("cantidad");
    const origen = options.getString("origen");

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

    const pagadorData = await client.FetchBalance(user.id, guild.id);
    const destinatarioData = await client.FetchBalance(
      destinatario.id,
      guild.id
    );

    if (!pagadorData || !destinatarioData) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setDescription("❌ Error al acceder a los datos bancarios."),
        ],
        ephemeral: true,
      });
    }

    // Verificar fondos según origen
    const fondosDisponibles =
      origen === "efectivo"
        ? pagadorData.Efectivo
        : pagadorData.CuentaCorriente.Balance;

    if (fondosDisponibles < cantidad) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setDescription(
              `❌ No tienes suficientes fondos en ${
                origen === "efectivo" ? "efectivo" : "tu cuenta corriente"
              }.`
            ),
        ],
        ephemeral: true,
      });
    }

    // Determinar si el destinatario es SAT
    const esSAT =
      destinatarioData.TipoCuenta === "gobierno" || destinatarioData.Sat;
    const comision = esSAT ? 0 : cantidad * 0.05; // 0% para SAT, 5% para otros
    const cantidadTotal = cantidad + comision;

    if (fondosDisponibles < cantidadTotal) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setDescription(
              `❌ No tienes suficientes fondos para cubrir el pago${
                !esSAT ? " y la comisión (5%)" : ""
              }.`
            ),
        ],
        ephemeral: true,
      });
    }

    // Realizar el pago
    if (origen === "efectivo") {
      pagadorData.Efectivo -= cantidadTotal;
      if (esSAT) {
        destinatarioData.CuentaGobierno.Balance += cantidad;
      } else {
        destinatarioData.Efectivo += cantidad;
      }
    } else {
      pagadorData.CuentaCorriente.Balance -= cantidadTotal;
      if (esSAT) {
        destinatarioData.CuentaGobierno.Balance += cantidad;
      } else {
        destinatarioData.CuentaCorriente.Balance += cantidad;
      }
    }

    // Procesar comisión para el SAT (solo si no es pago al SAT)
    if (!esSAT) {
      const economiaData = await EcoUsuarios.findOne({ GuildId: guild.id });
      const satUser = economiaData.Usuario.find((u) => u.Sat === true);
      if (satUser) {
        satUser.CuentaGobierno.Balance += comision;
      }
      await economiaData.save();
    }

    // Guardar cambios
    const economiaData = await EcoUsuarios.findOne({ GuildId: guild.id });
    const pagadorIndex = economiaData.Usuario.findIndex(
      (u) => u.UserId === user.id
    );
    const destinatarioIndex = economiaData.Usuario.findIndex(
      (u) => u.UserId === destinatario.id
    );

    economiaData.Usuario[pagadorIndex] = pagadorData;
    economiaData.Usuario[destinatarioIndex] = destinatarioData;

    await economiaData.save();

    const reciboEmbed = new EmbedBuilder()
      .setTitle("📄 Recibo de Pago")
      .setColor("Green")
      .setDescription(`Has pagado a <@${destinatario.id}>`)
      .addFields({
        name: "💵 Cantidad Pagada",
        value: codeBlock(formatNumber(cantidad)),
        inline: true,
      });

    // Solo mostrar comisión si no es pago al SAT
    if (!esSAT) {
      reciboEmbed.addFields({
        name: "💸 Comisión (5%)",
        value: codeBlock(formatNumber(comision)),
        inline: true,
      });
    }

    reciboEmbed
      .addFields(
        {
          name: "💰 Total Debitado",
          value: codeBlock(formatNumber(cantidadTotal)),
          inline: true,
        },
        {
          name: "💳 Origen",
          value: origen === "efectivo" ? "Efectivo" : "Cuenta Corriente",
          inline: true,
        },
        {
          name: "📊 Saldo Restante",
          value: codeBlock(
            formatNumber(
              origen === "efectivo"
                ? pagadorData.Efectivo
                : pagadorData.CuentaCorriente.Balance
            )
          ),
          inline: true,
        }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [reciboEmbed], ephemeral: true });
  },
};
