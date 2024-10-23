import { SlashCommandBuilder } from "discord.js";
import TiendaSchema from "../../Schemas/Tienda/Articulos.js";

function formatearMonto(monto) {
  return monto.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export default {
  data: new SlashCommandBuilder()
    .setName("tienda")
    .setDescription("🏪 Acciones generales de la tienda")
    .addSubcommand((sub) =>
      sub
        .setName("añadir")
        .setDescription("🛒 Añade un ítem a la tienda")
        .addStringOption((option) =>
          option
            .setName("articulo")
            .setDescription("📦 Nombre del artículo")
            .setRequired(true)
        )
        .addNumberOption((option) =>
          option
            .setName("precio")
            .setDescription("💵 Precio del artículo")
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName("cantidad")
            .setDescription("🔢 Cantidad de unidades")
            .setRequired(true)
            .setMinValue(1)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("remover")
        .setDescription("🗑️ Remueve un ítem de la tienda")
        .addStringOption((option) =>
          option
            .setName("articulo")
            .setDescription("📦 Nombre del artículo a remover")
            .setAutocomplete(true)
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName("cantidad")
            .setDescription("🔢 Cantidad a remover")
            .setRequired(true)
            .setMinValue(1)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("comprar")
        .setDescription("🛍️ Compra un ítem de la tienda")
        .addStringOption((option) =>
          option
            .setName("articulo")
            .setDescription("📦 Nombre del artículo a comprar")
            .setAutocomplete(true)
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName("cantidad")
            .setDescription("🔢 Cantidad de unidades")
            .setRequired(true)
            .setMinValue(1)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("revisar")
        .setDescription("📋 Revisa el inventario de la tienda")
    ),

  async autocomplete(interaction, client) {
    const { options, guild } = interaction;
    const subCommand = options.getSubcommand();
    const focusedOption = options.getFocused(true);
    const focusedValue = focusedOption.value.toLowerCase();

    if (["comprar", "remover"].includes(subCommand) && focusedOption.name === "articulo") {
      const tiendaData = await TiendaSchema.findOne({ 
        GuildId: guild.id,
        Tipo: "legal"
      });

      if (!tiendaData || !tiendaData.Inventario.length) {
        return interaction.respond([]);
      }

      const filteredItems = tiendaData.Inventario
        .filter(item => 
          item.Articulo.toLowerCase().includes(focusedValue) ||
          item.Identificador.toLowerCase().includes(focusedValue)
        )
        .slice(0, 25)
        .map(item => ({
          name: `${item.Articulo} - $${formatearMonto(item.Precio)} (${item.Cantidad} unidades)`,
          value: item.Identificador
        }));

      await interaction.respond(filteredItems);
    }
  }
};