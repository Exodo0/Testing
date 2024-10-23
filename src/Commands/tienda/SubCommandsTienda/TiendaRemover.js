import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  codeBlock,
} from "discord.js";
import TiendaSchema from "../../../Schemas/Tienda/Articulos.js";
import PermisosManager from "../../../Bot/Classes/Permisos.js";

function formatearMonto(monto) {
  return monto.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export default {
  subCommand: "tienda.remover",
  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    const { options, guild, member } = interaction;

    const permisosManager = new PermisosManager(guild.id);
    const { loaded, embed: permisosEmbed } =
      await permisosManager.loadPermisos();

    if (!loaded) {
      return interaction.reply({
        embeds: [permisosEmbed],
        ephemeral: true,
      });
    }

    const { allowed, embed: permisoEmbed } =
      await permisosManager.checkPermissions(member, ["high"]);

    if (!allowed) {
      return interaction.reply({
        embeds: [permisoEmbed],
        ephemeral: true,
      });
    }

    const itemId = options.getString("articulo");
    const cantidad = options.getInteger("cantidad");

    const tiendaData = await TiendaSchema.findOne({
      GuildId: guild.id,
      Tipo: "legal",
    });

    if (!tiendaData || !tiendaData.Inventario.length) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setTitle("❌ Error")
            .setDescription("No hay artículos en la tienda.")
            .setTimestamp(),
        ],
        ephemeral: true,
      });
    }

    const itemIndex = tiendaData.Inventario.findIndex(
      (item) => item.Identificador === itemId
    );

    if (itemIndex === -1) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setTitle("❌ Error")
            .setDescription("El artículo especificado no existe en la tienda.")
            .setTimestamp(),
        ],
        ephemeral: true,
      });
    }

    const item = tiendaData.Inventario[itemIndex];

    if (cantidad > item.Cantidad) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setTitle("❌ Error")
            .setDescription(
              `No puedes remover más unidades de las disponibles.\n` +
                `Cantidad disponible: \`${item.Cantidad} unidades\``
            )
            .setTimestamp(),
        ],
        ephemeral: true,
      });
    }

    const cantidadRemovida = cantidad;
    item.Cantidad -= cantidad;

    if (item.Cantidad === 0) {
      tiendaData.Inventario.splice(itemIndex, 1);
    }

    await tiendaData.save();

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor("Green")
          .setTitle("✅ Artículo Actualizado")
          .setDescription(
            item.Cantidad === 0
              ? "El artículo ha sido removido completamente de la tienda."
              : "Se han removido las unidades especificadas del artículo."
          )
          .addFields(
            {
              name: "📦 Artículo",
              value: codeBlock(item.Articulo),
              inline: true,
            },
            {
              name: "💰 Precio",
              value: codeBlock(`$${formatearMonto(item.Precio)} MXN`),
              inline: true,
            },
            {
              name: "🔢 Cantidad Removida",
              value: codeBlock(`${cantidadRemovida} unidades`),
              inline: true,
            },
            {
              name: "📊 Cantidad Restante",
              value: codeBlock(`${item.Cantidad} unidades`),
              inline: true,
            }
          )
          .setTimestamp(),
      ],
      ephemeral: true,
    });
  },
};
