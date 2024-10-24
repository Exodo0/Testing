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
    .setName("transferir")
    .setDescription("🔄 Transfiere dinero entre tus cuentas")
    .addStringOption((option) =>
      option
        .setName("origen")
        .setDescription("💳 Cuenta de origen")
        .setRequired(true)
        .addChoices(
          { name: "Cuenta Salario", value: "salario" },
          { name: "Cuenta Corriente", value: "corriente" },
          { name: "Efectivo", value: "efectivo" }
        )
    )
    .addStringOption((option) =>
      option
        .setName("destino")
        .setDescription("💳 Cuenta de destino")
        .setRequired(true)
        .addChoices(
          { name: "Cuenta Salario", value: "salario" },
          { name: "Cuenta Corriente", value: "corriente" },
          { name: "Efectivo", value: "efectivo" }
        )
    )
    .addNumberOption((option) =>
      option
        .setName("cantidad")
        .setDescription("💰 Cantidad a transferir")
        .setRequired(true)
        .setMinValue(1)
    ),

  async execute(interaction, client) {
    const { options, guild, user } = interaction;
    const origen = options.getString("origen");
    const destino = options.getString("destino");
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

    // Prevenir transferencias desde/hacia cuentas SAT
    if (userData.Sat || userData.TipoCuenta === "gobierno") {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setDescription(
              "❌ Las cuentas gubernamentales no pueden realizar transferencias."
            ),
        ],
        ephemeral: true,
      });
    }

    if (origen === destino) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setDescription("❌ No puedes transferir a la misma cuenta."),
        ],
        ephemeral: true,
      });
    }

    // Verificar fondos en origen
    let saldoOrigen;
    if (origen === "efectivo") {
      saldoOrigen = userData.Efectivo;
    } else {
      const cuentaOrigen =
        origen === "salario"
          ? userData.CuentaSalario
          : userData.CuentaCorriente;
      if (!cuentaOrigen.Activa) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("Red")
              .setDescription("❌ La cuenta de origen no está activa."),
          ],
          ephemeral: true,
        });
      }
      saldoOrigen = cuentaOrigen.Balance;
    }

    if (saldoOrigen < cantidad) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setDescription(
              "❌ No tienes suficientes fondos en la cuenta de origen."
            ),
        ],
        ephemeral: true,
      });
    }

    // Verificar cuenta destino
    if (destino !== "efectivo") {
      const cuentaDestino =
        destino === "salario"
          ? userData.CuentaSalario
          : userData.CuentaCorriente;
      if (!cuentaDestino.Activa) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("Red")
              .setDescription("❌ La cuenta de destino no está activa."),
          ],
          ephemeral: true,
        });
      }
    }

    // Realizar transferencia
    if (origen === "efectivo") {
      userData.Efectivo -= cantidad;
    } else if (origen === "salario") {
      userData.CuentaSalario.Balance -= cantidad;
    } else {
      userData.CuentaCorriente.Balance -= cantidad;
    }

    if (destino === "efectivo") {
      userData.Efectivo += cantidad;
    } else if (destino === "salario") {
      userData.CuentaSalario.Balance += cantidad;
    } else {
      userData.CuentaCorriente.Balance += cantidad;
    }

    const economiaData = await EcoUsuarios.findOne({ GuildId: guild.id });
    const userIndex = economiaData.Usuario.findIndex(
      (u) => u.UserId === user.id
    );
    economiaData.Usuario[userIndex] = userData;
    await economiaData.save();

    const embed = new EmbedBuilder()
      .setColor("Green")
      .setTitle("✅ Transferencia Exitosa")
      .addFields(
        {
          name: "💸 Cantidad Transferida",
          value: codeBlock(formatNumber(cantidad)),
          inline: true,
        },
        {
          name: "📤 Origen",
          value: `${origen.charAt(0).toUpperCase() + origen.slice(1)}`,
          inline: true,
        },
        {
          name: "📥 Destino",
          value: `${destino.charAt(0).toUpperCase() + destino.slice(1)}`,
          inline: true,
        },
        {
          name: "📊 Nuevos Saldos",
          value: codeBlock(
            `Efectivo: ${formatNumber(userData.Efectivo)}\n` +
              `Cuenta Salario: ${formatNumber(
                userData.CuentaSalario.Balance
              )}\n` +
              `Cuenta Corriente: ${formatNumber(
                userData.CuentaCorriente.Balance
              )}`
          ),
        }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
