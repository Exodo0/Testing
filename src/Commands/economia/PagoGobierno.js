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
    .setName("pagogobierno")
    .setDescription("🏛️ Realiza un pago gubernamental a un usuario")
    .addUserOption((option) =>
      option
        .setName("destinatario")
        .setDescription("👤 Usuario que recibirá el pago")
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
        .setName("destino")
        .setDescription("💳 Cuenta de destino del pago")
        .setRequired(true)
        .addChoices(
          { name: "Cuenta Corriente", value: "corriente" },
          { name: "Efectivo", value: "efectivo" }
        )
    )
    .addStringOption((option) =>
      option
        .setName("concepto")
        .setDescription("📝 Concepto del pago")
        .setRequired(true)
    ),

  async execute(interaction, client) {
    const { options, guild, user } = interaction;
    const destinatario = options.getUser("destinatario");
    const cantidad = options.getNumber("cantidad");
    const destino = options.getString("destino");
    const concepto = options.getString("concepto");

    // Verificar permisos
    const economiaConfig = await EcoUsuarios.findOne({ GuildId: guild.id });
    if (!interaction.member.roles.cache.has(economiaConfig.RolSat)) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setDescription(
              "❌ No tienes permiso para realizar pagos gubernamentales."
            ),
        ],
        ephemeral: true,
      });
    }

    // Obtener cuenta SAT y destinatario
    const satData = await client.FetchBalance(
      economiaConfig.Usuario.find((u) => u.Sat).UserId,
      guild.id
    );
    const destinatarioData = await client.FetchBalance(
      destinatario.id,
      guild.id
    );

    if (!satData || !destinatarioData) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setDescription("❌ Error al acceder a los datos bancarios."),
        ],
        ephemeral: true,
      });
    }

    // Verificar fondos SAT
    if (satData.CuentaGobierno.Balance < cantidad) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setDescription(
              "❌ Fondos gubernamentales insuficientes para realizar el pago."
            ),
        ],
        ephemeral: true,
      });
    }

    // Realizar el pago
    satData.CuentaGobierno.Balance -= cantidad;
    if (destino === "corriente") {
      destinatarioData.CuentaCorriente.Balance += cantidad;
    } else {
      destinatarioData.Efectivo += cantidad;
    }

    // Guardar cambios
    const satIndex = economiaConfig.Usuario.findIndex((u) => u.Sat);
    const destinatarioIndex = economiaConfig.Usuario.findIndex(
      (u) => u.UserId === destinatario.id
    );

    economiaConfig.Usuario[satIndex] = satData;
    economiaConfig.Usuario[destinatarioIndex] = destinatarioData;

    await economiaConfig.save();

    // Crear registro
    const logEmbed = new EmbedBuilder()
      .setColor("Blue")
      .setTitle("📊 Registro de Pago Gubernamental")
      .addFields(
        { name: "💳 Pagador", value: `SAT (${user.tag})`, inline: true },
        { name: "👤 Destinatario", value: destinatario.tag, inline: true },
        { name: "💰 Cantidad", value: formatNumber(cantidad), inline: true },
        { name: "📝 Concepto", value: concepto, inline: false }
      )
      .setTimestamp();

    const logChannel = guild.channels.cache.get(economiaConfig.Registro);
    if (logChannel) {
      await logChannel.send({ embeds: [logEmbed] });
    }

    // Responder al usuario
    const confirmEmbed = new EmbedBuilder()
      .setColor("Green")
      .setTitle("✅ Pago Gubernamental Realizado")
      .addFields(
        {
          name: "💸 Cantidad Pagada",
          value: codeBlock(formatNumber(cantidad)),
          inline: true,
        },
        {
          name: "👤 Destinatario",
          value: `<@${destinatario.id}>`,
          inline: true,
        },
        {
          name: "💳 Cuenta Destino",
          value: destino === "corriente" ? "Cuenta Corriente" : "Efectivo",
          inline: true,
        },
        {
          name: "📝 Concepto",
          value: concepto,
          inline: false,
        },
        {
          name: "💰 Saldo SAT Restante",
          value: codeBlock(formatNumber(satData.CuentaGobierno.Balance)),
          inline: true,
        }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [confirmEmbed], ephemeral: true });
  },
};
