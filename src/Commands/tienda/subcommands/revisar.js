import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import TiendaSchema from "../../../Schemas/Tienda/Articulos.js";

export default {
  subCommand: "tienda.revisar",
  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    const { guild } = interaction;

    const tiendaData = await TiendaSchema.findOne({ GuildId: guild.id });
    
    if (!tiendaData || !tiendaData.Inventario.length) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x2B2D31)
            .setTitle("🏪 Tienda Vacía")
            .setDescription("No hay artículos disponibles en la tienda.")
            .setTimestamp()
        ],
        ephemeral: true
      });
    }

    const baseEmbed = new EmbedBuilder()
      .setColor(0x2B2D31)
      .setAuthor({
        name: "🏪 Tienda del Servidor",
        iconURL: guild.iconURL()
      })
      .setTimestamp()
      .setFooter({
        text: `Solicitado por ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL()
      });

    const itemsPerPage = 5;
    const pages = [];

    // Página principal con estadísticas
    const mainEmbed = EmbedBuilder.from(baseEmbed)
      .setDescription(
        "```md\n# Bienvenido a la Tienda```\n" +
        "Usa los botones de navegación para explorar todos los artículos disponibles.\n\n" +
        "**📊 Estadísticas de la Tienda**\n" +
        `> 📦 Total de Artículos: \`${tiendaData.Inventario.length}\`\n` +
        `> 🏷️ Artículos Únicos: \`${new Set(tiendaData.Inventario.map(item => item.Articulo)).size}\`\n\n` +
        "```md\n# Información```\n" +
        "> 🔹 Usa `/tienda comprar` para adquirir artículos\n" +
        "> 🔹 Los precios están en MXN\n" +
        "> 🔹 Navega con los botones de abajo"
      );
    pages.push(mainEmbed);

    // Páginas de artículos
    for (let i = 0; i < tiendaData.Inventario.length; i += itemsPerPage) {
      const pageItems = tiendaData.Inventario.slice(i, i + itemsPerPage);
      const itemsDisplay = pageItems.map(item => 
        `> 📦 **${item.Articulo}**\n` +
        `> 💵 Precio: \`$${formatearMonto(item.Precio)} MXN\`\n` +
        `> 🔢 Disponibles: \`${item.Cantidad}\`\n` +
        `> 🏷️ ID: \`${item.Identificador}\`\n`
      ).join("\n");

      const pageEmbed = EmbedBuilder.from(baseEmbed)
        .setDescription(
          "```md\n# Artículos Disponibles```\n" +
          itemsDisplay +
          "\n```md\n" +
          `# Página ${Math.floor(i / itemsPerPage) + 1} de ${Math.ceil(tiendaData.Inventario.length / itemsPerPage)}` +
          "```"
        );
      pages.push(pageEmbed);
    }

    const pagination = new client.Pagination(interaction);
    await pagination
      .addPages(pages)
      .changeButton("first", { label: "≪ Inicio", style: "Primary" })
      .changeButton("previous", { label: "⇐ Anterior", style: "Primary" })
      .changeButton("next", { label: "Siguiente ⇒", style: "Primary" })
      .changeButton("last", { label: "Final ≫", style: "Primary" })
      .display();
  },
};

function formatearMonto(monto) {
  return monto.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}