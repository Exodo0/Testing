import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  codeBlock,
} from "discord.js";
import TiendaSchema from "../../../Schemas/Tienda/Articulos.js";
import InventarioUsuario from "../../../Schemas/Inventario/UsuarioInventario.js";
import EcoUsuario from "../../../Schemas/Economia/EcoUsuarios.js";

export default {
  subCommand: "tienda.comprar",
  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    const { options, guild, member } = interaction;
    const itemId = options.getString("articulo");
    const cantidad = options.getInteger("cantidad");

    if (cantidad <= 0) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setTitle("❌ Error")
            .setDescription("La cantidad debe ser mayor a 0.")
            .setTimestamp(),
        ],
        ephemeral: true,
      });
    }

    const tiendaData = await TiendaSchema.findOne({ GuildId: guild.id });

    if (!tiendaData) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setTitle("❌ Error")
            .setDescription("No hay artículos disponibles en la tienda.")
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
            .setDescription("El artículo seleccionado no existe en la tienda.")
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
                `Stock actual: \`${item.Cantidad}\` unidades`
            )
            .setTimestamp(),
        ],
        ephemeral: true,
      });
    }

    const subtotal = item.Precio * cantidad;
    const impuestoSAT = Math.ceil(subtotal * 0.16); // 16% de impuesto
    const costoTotal = subtotal + impuestoSAT;

    const economiaDoc = await EcoUsuario.findOne({ GuildId: guild.id });
    const userBalance = economiaDoc?.Usuario?.find(
      (u) => u.UserId === member.id
    );
    const satUser = economiaDoc?.Usuario?.find((u) => u.Sat === true);

    if (!satUser) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setTitle("❌ Error")
            .setDescription("No se encontró un usuario SAT en el sistema.")
            .setTimestamp(),
        ],
        ephemeral: true,
      });
    }

    if (!userBalance || userBalance.Efectivo < costoTotal) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setTitle("❌ Error")
            .setDescription(
              `No tienes suficiente efectivo para realizar esta compra.\n` +
                `Subtotal: \`$${formatearMonto(subtotal)} MXN\`\n` +
                `Impuesto SAT (16%): \`$${formatearMonto(
                  impuestoSAT
                )} MXN\`\n` +
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
    const satIndex = economiaDoc.Usuario.findIndex((u) => u.Sat === true);

    // Actualizar balance del usuario
    economiaDoc.Usuario[userIndex].Efectivo -= costoTotal;

    // Actualizar balance del SAT (impuesto va al banco)
    economiaDoc.Usuario[satIndex].Banco += impuestoSAT;

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
          .setThumbnail(client.user.displayAvatarURL())
          .setDescription(
            `Has comprado **${cantidad}x ${item.Articulo}** exitosamente.`
          )
          .addFields(
            {
              name: "💰 Detalles de la Compra",
              value: codeBlock(
                `+ Subtotal: $${formatearMonto(subtotal)} MXN\n` +
                  `- Impuesto SAT (16%): $${formatearMonto(
                    impuestoSAT
                  )} MXN\n` +
                  `= Total Pagado: $${formatearMonto(costoTotal)} MXN`
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

function formatearMonto(monto) {
  return monto.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}
