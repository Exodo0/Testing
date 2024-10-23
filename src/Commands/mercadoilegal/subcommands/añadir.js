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
      return numero * 1000; // Convertir kilos a gramos
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
  subCommand: "mercadoilegal.añadir",

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

    const articulo = options.getString("articulo");
    const precio = options.getNumber("precio");
    const cantidadInput = options.getString("cantidad");

    const cantidad = parseUnidadPeso(cantidadInput);
    if (cantidad === null) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x2B2D31)
            .setTitle("❌ Error")
            .setDescription("Formato de cantidad inválido. Usa números seguidos de 'g' o 'k' (ej: 15, 15g, 1.5k)")
            .setTimestamp()
        ],
        ephemeral: true
      });
    }

    if (precio <= 0 || cantidad <= 0) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x2B2D31)
            .setTitle("❌ Error")
            .setDescription("El precio y la cantidad deben ser mayores a 0.")
            .setTimestamp()
        ],
        ephemeral: true
      });
    }

    let tiendaData = await TiendaSchema.findOne({ 
      GuildId: guild.id,
      Tipo: "ilegal"
    });
    
    if (!tiendaData) {
      tiendaData = new TiendaSchema({
        GuildId: guild.id,
        Tipo: "ilegal",
        Inventario: []
      });
    }

    const articuloExistente = tiendaData.Inventario.find(
      item => item.Articulo.toLowerCase() === articulo.toLowerCase()
    );

    if (articuloExistente) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x2B2D31)
            .setTitle("❌ Error")
            .setDescription("Este artículo ya existe en el mercado ilegal.")
            .addFields({
              name: "Artículo Existente",
              value: codeBlock(
                `ID: ${articuloExistente.Identificador}\n` +
                `Precio: $${formatearMonto(articuloExistente.Precio)}/g\n` +
                `Cantidad: ${formatearPeso(articuloExistente.Cantidad)}`
              )
            })
            .setTimestamp()
        ],
        ephemeral: true
      });
    }

    const identificador = client.GenIdent();
    
    tiendaData.Inventario.push({
      Articulo: articulo,
      Precio: precio,
      Cantidad: cantidad,
      Identificador: identificador,
      FechaAgregado: new Date()
    });

    await tiendaData.save();

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(0x2B2D31)
          .setTitle("✅ Artículo Añadido al Mercado Ilegal")
          .setDescription("El artículo ha sido añadido exitosamente al mercado ilegal.")
          .addFields(
            {
              name: "📦 Artículo",
              value: codeBlock(articulo),
              inline: true
            },
            {
              name: "💰 Precio por Gramo",
              value: codeBlock(`$${formatearMonto(precio)} MXN`),
              inline: true
            },
            {
              name: "⚖️ Cantidad",
              value: codeBlock(formatearPeso(cantidad)),
              inline: true
            },
            {
              name: "🏷️ Identificador",
              value: codeBlock(identificador),
              inline: false
            }
          )
          .setTimestamp()
      ],
      ephemeral: true
    });
  }
};