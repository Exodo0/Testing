import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  codeBlock,
} from "discord.js";
import TiendaSchema from "../../../Schemas/Tienda/Articulos.js";
import PermisosManager from "../../../Bot/Classes/Permisos.js";

export default {
  subCommand: "tienda.añadir",
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

    const articulo = options.getString("articulo");
    const precio = options.getNumber("precio");
    const cantidad = options.getInteger("cantidad");

    if (precio <= 0 || cantidad <= 0) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setTitle("❌ Error")
            .setDescription("El precio y la cantidad deben ser mayores a 0.")
            .setTimestamp(),
        ],
        ephemeral: true,
      });
    }

    let tiendaData = await TiendaSchema.findOne({ GuildId: guild.id });

    if (!tiendaData) {
      tiendaData = new TiendaSchema({
        GuildId: guild.id,
        Inventario: [],
      });
    }

    const articuloExistente = tiendaData.Inventario.find(
      (item) => item.Articulo.toLowerCase() === articulo.toLowerCase()
    );

    if (articuloExistente) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setTitle("❌ Error")
            .setDescription("Este artículo ya existe en la tienda.")
            .addFields({
              name: "Artículo Existente",
              value: codeBlock(
                `ID: ${articuloExistente.Identificador}\n` +
                  `Precio: $${formatearMonto(articuloExistente.Precio)} MXN\n` +
                  `Cantidad: ${articuloExistente.Cantidad}`
              ),
            })
            .setTimestamp(),
        ],
        ephemeral: true,
      });
    }

    const identificador = client.GenIdent();

    tiendaData.Inventario.push({
      Articulo: articulo,
      Precio: precio,
      Cantidad: cantidad,
      Identificador: identificador,
    });

    await tiendaData.save();

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor("LightGrey")
          .setTitle("✅ Artículo Añadido")
          .setDescription(
            "El artículo ha sido añadido exitosamente a la tienda."
          )
          .addFields(
            {
              name: "📦 Artículo",
              value: codeBlock(articulo),
              inline: true,
            },
            {
              name: "💵 Precio",
              value: codeBlock(`$${formatearMonto(precio)} MXN`),
              inline: true,
            },
            {
              name: "🔢 Cantidad",
              value: codeBlock(cantidad.toString()),
              inline: true,
            },
            {
              name: "🏷️ Identificador",
              value: codeBlock(identificador),
              inline: false,
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
