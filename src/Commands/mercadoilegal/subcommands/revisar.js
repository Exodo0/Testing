import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import TiendaSchema from "../../../Schemas/Tienda/Articulos.js";

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
  subCommand: "mercadoilegal.revisar",

  async execute(interaction, client) {
    const { guild } = interaction;

    const tiendaData = await TiendaSchema.findOne({ 
      GuildId: guild.id,
      Tipo: "ilegal"
    });
    
    if (!tiendaData || !tiendaData.Inventario.length) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setTitle("🏪 Mercado Ilegal Vacío")
            .setDescription("No hay artículos disponibles en el mercado ilegal.")
            .setTimestamp()
        ],
        ephemeral: true
      });
    }

    const baseEmbed = new EmbedBuilder()
      .setColor("DarkPurple")
      .setAuthor({
        name: "🏪 Mercado Ilegal",
        iconURL: guild.iconURL()
      })
      .setTimestamp()
      .setFooter({
        text: `Solicitado por ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL()
      });

    const itemsPerPage = 5;
    const pages = [];

    const mainEmbed = EmbedBuilder.from(baseEmbed)
      .setDescription(
        "```md\n# Bienvenido al Mercado Ilegal```\n" +
        "Usa los botones de navegación para explorar todos los artículos disponibles.\n\n" +
        "**📊 Estadísticas del Mercado**\n" +
        `> 📦 Total de Artículos: \`${tiendaData.Inventario.length}\`\n` +
        `> 🏷️ Artículos Únicos: \`${new Set(tiendaData.Inventario.map(item => item.Articulo)).size}\`\n\n` +
        "```md\n# Información```\n" +
        "> 🔹 Usa `/mercadoilegal comprar` para adquirir artículos\n" +
        "> 🔹 Los precios están en MXN por gramo\n" +
        "> 🔹 Navega con los botones de abajo"
      );
    pages.push(mainEmbed);

    for (let i = 0; i < tiendaData.Inventario.length; i += itemsPerPage) {
      const pageItems = tiendaData.Inventario.slice(i, i + itemsPerPage);
      const itemsDisplay = pageItems.map(item => 
        `> 📦 **${item.Articulo}**\n` +
        `> 💰 Precio: \`$${formatearMonto(item.Precio)} MXN/g\`\n` +
        `> ⚖️ Disponible: \`${formatearPeso(item.Cantidad)}\`\n` +
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
  }
};