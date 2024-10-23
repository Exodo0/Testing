import { SlashCommandBuilder } from "discord.js";
import TiendaSchema from "../../Schemas/Tienda/Articulos.js";

function formatearMonto(monto) {
  return monto.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function formatearPeso(gramos) {
  if (gramos >= 1000) {
    return `${(gramos / 1000).toFixed(1)}k`;
  }
  return `${gramos}g`;
}

export default {
  data: new SlashCommandBuilder()
    .setName("mercadoilegal")
    .setDescription("⚠️ Acciones exclusivas del mercado ilegal")
    .addSubcommand((sub) =>
      sub
        .setName("añadir")
        .setDescription("🚨 Añade un ítem al mercado ilegal")
        .addStringOption((option) =>
          option
            .setName("articulo")
            .setDescription("📦 Nombre del artículo")
            .setRequired(true)
        )
        .addNumberOption((option) =>
          option
            .setName("precio")
            .setDescription("💰 Precio por gramo")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("cantidad")
            .setDescription("🔢 Cantidad (ej: 15, 15g, 1.5k)")
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("remover")
        .setDescription("🗑️ Remueve un ítem del mercado ilegal")
        .addStringOption((option) =>
          option
            .setName("articulo")
            .setDescription("📦 Nombre del artículo a remover")
            .setAutocomplete(true)
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("cantidad")
            .setDescription("🔢 Cantidad (ej: 15, 15g, 1.5k)")
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("comprar")
        .setDescription("💸 Compra un ítem del mercado ilegal")
        .addStringOption((option) =>
          option
            .setName("articulo")
            .setDescription("📦 Nombre del artículo")
            .setAutocomplete(true)
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("cantidad")
            .setDescription("🔢 Cantidad (ej: 15, 15g, 1.5k)")
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("revisar")
        .setDescription("📋 Revisa el inventario del mercado ilegal")
    ),

  async autocomplete(interaction, client) {
    const { options, guild } = interaction;
    const subCommand = options.getSubcommand();
    const focusedOption = options.getFocused(true);
    const focusedValue = focusedOption.value.toLowerCase();

    if (
      ["comprar", "remover"].includes(subCommand) &&
      focusedOption.name === "articulo"
    ) {
      const tiendaData = await TiendaSchema.findOne({
        GuildId: guild.id,
        Tipo: "ilegal",
      });

      if (!tiendaData || !tiendaData.Inventario.length) {
        return interaction.respond([]);
      }

      const filteredItems = tiendaData.Inventario.filter(
        (item) =>
          item.Articulo.toLowerCase().includes(focusedValue) ||
          item.Identificador.toLowerCase().includes(focusedValue)
      )
        .slice(0, 25)
        .map((item) => ({
          name: `${item.Articulo} - $${formatearMonto(
            item.Precio
          )}/g (${formatearPeso(item.Cantidad)} disponibles)`,
          value: item.Identificador,
        }));

      await interaction.respond(filteredItems);
    }
  },
};
