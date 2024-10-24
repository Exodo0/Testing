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
    .setName("retirar")
    .setDescription("💰 Retira dinero de tus cuentas bancarias")
    .addStringOption((option) =>
      option
        .setName("cuenta")
        .setDescription("💳 Cuenta de origen")
        .setRequired(true)
        .addChoices(
          { name: "Cuenta Salario", value: "salario" },
          { name: "Cuenta Corriente", value: "corriente" }
        )
    )
    .addNumberOption((option) =>
      option
        .setName("cantidad")
        .setDescription("💵 Cantidad a retirar")
        .setRequired(true)
        .setMinValue(1)
    ),

  async execute(interaction, client) {
    const { options, guild, user } = interaction;
    const cuenta = options.getString("cuenta");
    const cantidad = options.getNumber("cantidad");

    const userData = await client.FetchBalance(user.id, guild.id);
    if (!userData) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setDescription("❌ No tienes una cuenta bancaria."),
        ],
        ephemeral: true,
      });
    }

    if (userData.TipoCuenta === "gobierno") {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setDescription(
              "❌ Las cuentas gubernamentales no pueden realizar retiros."
            ),
        ],
        ephemeral: true,
      });
    }

    const cuentaOrigen =
      cuenta === "salario" ? userData.CuentaSalario : userData.CuentaCorriente;

    if (!cuentaOrigen.Activa) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setDescription("❌ La cuenta seleccionada no está activa."),
        ],
        ephemeral: true,
      });
    }

    if (cuentaOrigen.Balance < cantidad) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setDescription(
              "❌ No tienes suficientes fondos en la cuenta seleccionada."
            ),
        ],
        ephemeral: true,
      });
    }

    // Realizar el retiro
    cuentaOrigen.Balance -= cantidad;
    userData.Efectivo += cantidad;

    // Guardar cambios
    const economiaData = await EcoUsuarios.findOne({ GuildId: guild.id });
    const userIndex = economiaData.Usuario.findIndex(
      (u) => u.UserId === user.id
    );
    economiaData.Usuario[userIndex] = userData;
    await economiaData.save();

    const embed = new EmbedBuilder()
      .setColor("Green")
      .setTitle("💰 Retiro Exitoso")
      .addFields(
        {
          name: "💵 Cantidad Retirada",
          value: codeBlock(formatNumber(cantidad)),
          inline: true,
        },
        {
          name: "💳 Cuenta",
          value: cuenta === "salario" ? "Cuenta Salario" : "Cuenta Corriente",
          inline: true,
        },
        {
          name: "📊 Nuevos Saldos",
          value: codeBlock(
            `Efectivo: ${formatNumber(userData.Efectivo)}\n` +
              `${
                cuenta === "salario" ? "Cuenta Salario" : "Cuenta Corriente"
              }: ${formatNumber(cuentaOrigen.Balance)}`
          ),
        }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
