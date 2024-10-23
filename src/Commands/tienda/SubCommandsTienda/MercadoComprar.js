import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  codeBlock,
} from "discord.js";
import TiendaSchema from "../../../Schemas/Tienda/Articulos.js";
import InventarioUsuario from "../../../Schemas/Inventario/UsuarioInventario.js";
import EcoUsuario from "../../../Schemas/Economia/EcoUsuarios.js";

function parseUnidadPeso(cantidad) {
  const match = String(cantidad).match(/^(\d+\.?\d*)(g|k)?$/i);
  if (!match) return null;

  const numero = parseFloat(match[1]);
  const unidad = (match[2] || "").toLowerCase();

  switch (unidad) {
    case "k":
      return numero * 1000;
    case "g":
    case "":
      return numero;
    default:
      return null;
  }
}

function formatearPeso(gramos) {
  if (gramos >= 1000) {
    return `${(gramos / 1000).toFixed(1)}k`;
  }
  return `${gramos}g`;
}

function formatearMonto(monto) {
  return monto.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export default {
  subCommand: "mercadoilegal.comprar",
  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */

  async execute(interaction, client) {
    const { options, guild, member } = interaction;
    const itemId = options.getString("articulo");
    const cantidadInput = options.getString("cantidad");

    const cantidad = parseUnidadPeso(cantidadInput);
    if (cantidad === null) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setTitle("❌ Error")
            .setDescription(
              "Formato de cantidad inválido. Usa números seguidos de 'g' o 'k' (ej: 15, 15g, 1.5k)"
            )
            .setTimestamp(),
        ],
        ephemeral: true,
      });
    }

    const tiendaData = await TiendaSchema.findOne({
      GuildId: guild.id,
      Tipo: "ilegal",
    });

    if (!tiendaData) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setTitle("❌ Error")
            .setDescription(
              "No hay artículos disponibles en el mercado ilegal."
            )
            .setTimestamp(),
        ],
        ephemeral: true,
      });
    }

    const item = tiendaData.Inventario.find((i) => i.Identificador === itemId);

    if (!item) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setTitle("❌ Error")
            .setDescription(
              "El artículo seleccionado no existe en el mercado ilegal."
            )
            .setTimestamp(),
        ],
        ephemeral: true,
      });
    }

    if (item.Cantidad < cantidad) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setTitle("❌ Error")
            .setDescription(
              `No hay suficiente stock disponible.\n` +
                `Stock actual: \`${formatearPeso(item.Cantidad)}\``
            )
            .setTimestamp(),
        ],
        ephemeral: true,
      });
    }

    const costoTotal = item.Precio * cantidad;

    const economiaDoc = await EcoUsuario.findOne({ GuildId: guild.id });
    const userBalance = economiaDoc?.Usuario?.find(
      (u) => u.UserId === member.id
    );

    if (!userBalance || userBalance.Efectivo < costoTotal) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setTitle("❌ Error")
            .setDescription(
              `No tienes suficiente efectivo para realizar esta compra.\n` +
                `Total a pagar: \`$${formatearMonto(costoTotal)} MXN\`\n` +
                `Tu efectivo: \`$${formatearMonto(
                  userBalance?.Efectivo || 0
                )} MXN\``
            )
            .setTimestamp(),
        ],
        ephemeral: true,
      });
    }

    let inventarioUsuario = await InventarioUsuario.findOne({
      GuildId: guild.id,
      UserId: member.id,
    });

    if (!inventarioUsuario) {
      inventarioUsuario = new InventarioUsuario({
        GuildId: guild.id,
        UserId: member.id,
        Inventario: [],
      });
    }

    const itemExistente = inventarioUsuario.Inventario.find(
      (i) => i.Identificador === itemId
    );

    if (itemExistente) {
      itemExistente.Cantidad += cantidad;
    } else {
      inventarioUsuario.Inventario.push({
        Articulo: item.Articulo,
        Cantidad: cantidad,
        Identificador: item.Identificador,
        FechaCompra: new Date(),
      });
    }

    item.Cantidad -= cantidad;
    if (item.Cantidad === 0) {
      tiendaData.Inventario = tiendaData.Inventario.filter(
        (i) => i.Identificador !== itemId
      );
    }

    const userIndex = economiaDoc.Usuario.findIndex(
      (u) => u.UserId === member.id
    );
    economiaDoc.Usuario[userIndex].Efectivo -= costoTotal;

    await Promise.all([
      tiendaData.save(),
      inventarioUsuario.save(),
      economiaDoc.save(),
    ]);

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor("Green")
          .setTitle("✅ Compra Exitosa")
          .setDescription(
            `Has comprado **${formatearPeso(cantidad)} de ${
              item.Articulo
            }** exitosamente.`
          )
          .addFields(
            {
              name: "💰 Detalles de la Compra",
              value: codeBlock(
                "diff\n" + `= Total Pagado: $${formatearMonto(costoTotal)} MXN`
              ),
              inline: false,
            },
            {
              name: "💵 Efectivo Restante",
              value: codeBlock(
                `$${formatearMonto(
                  economiaDoc.Usuario[userIndex].Efectivo
                )} MXN`
              ),
              inline: true,
            }
          )
          .setTimestamp(),
      ],
      ephemeral: true,
    });
  },
};
