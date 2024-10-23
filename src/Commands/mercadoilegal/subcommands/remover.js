import { ChatInputCommandInteraction, EmbedBuilder, codeBlock } from "discord.js";
import TiendaSchema from "../../../Schemas/Tienda/Articulos.js";
import PermisosManager from "../../../../Bot/Classes/Permisos.js";

function parseUnidadPeso(cantidad) {
  const match = String(cantidad).match(/^(\d+\.?\d*)(g|k)?$/i);
  if (!match) return null;

  const numero = parseFloat(match[1]);
  const unidad = (match[2] || '').toLowerCase();

  switch (unidad) {
    case 'k':
      return numero * 1000;
    case 'g':
    case '':
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
  subCommand: "mercadoilegal.remover",

  async execute(interaction, client) {
    const { options, guild, member } = interaction;

    const permisosManager = new PermisosManager(guild.id);
    const { loaded, embed: permisosEmbed } = await permisosManager.loadPermisos();

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
    const cantidadInput = options.getString("cantidad");

    const cantidad = parseUnidadPeso(cantidadInput);
    if (cantidad === null) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setTitle("❌ Error")
            .setDescription("Formato de cantidad inválido. Usa números seguidos de 'g' o 'k' (ej: 15, 15g, 1.5k)")
            .setTimestamp()
        ],
        ephemeral: true
      });
    }

    const tiendaData = await TiendaSchema.findOne({ 
      GuildId: guild.id,
      Tipo: "ilegal"
    });

    if (!tiendaData || !tiendaData.Inventario.length) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setTitle("❌ Error")
            .setDescription("No hay artículos en el mercado ilegal.")
            .setTimestamp()
        ],
        ephemeral: true
      });
    }

    const itemIndex = tiendaData.Inventario.findIndex(
      item => item.Identificador === itemId
    );

    if (itemIndex === -1) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setTitle("❌ Error")
            .setDescription("El artículo especificado no existe en el mercado ilegal.")
            .setTimestamp()
        ],
        ephemeral: true
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
              `No puedes remover más cantidad de la disponible.\n` +
              `Cantidad disponible: \`${formatearPeso(item.Cantidad)}\``
            )
            .setTimestamp()
        ],
        ephemeral: true
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
              ? "El artículo ha sido removido completamente del mercado ilegal."
              : "Se ha removido la cantidad especificada del artículo."
          )
          .addFields(
            {
              name: "📦 Artículo",
              value: codeBlock(item.Articulo),
              inline: true
            },
            {
              name: "💰 Precio por Gramo",
              value: codeBlock(`$${formatearMonto(item.Precio)} MXN`),
              inline: true
            },
            {
              name: "⚖️ Cantidad Removida",
              value: codeBlock(formatearPeso(cantidadRemovida)),
              inline: true
            },
            {
              name: "📊 Cantidad Restante",
              value: codeBlock(formatearPeso(item.Cantidad)),
              inline: true
            }
          )
          .setTimestamp()
      ],
      ephemeral: true
    });
  }
};