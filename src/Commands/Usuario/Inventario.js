import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import InventarioUsuario from "../../Schemas/Inventario/UsuarioInventario.js";

export default {
  data: new SlashCommandBuilder()
    .setName("inventario")
    .setDescription("📦 Revisa tu inventario personal")
    .addUserOption((option) =>
      option
        .setName("usuario")
        .setDescription(
          "👤 Usuario del que quieres ver el inventario (opcional)"
        )
    ),

  async execute(interaction, client) {
    const { guild, options } = interaction;
    const targetUser = options.getUser("usuario") || interaction.user;

    const inventarioData = await InventarioUsuario.findOne({
      GuildId: guild.id,
      UserId: targetUser.id,
    });

    if (!inventarioData || !inventarioData.Inventario.length) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setTitle("📦 Inventario Vacío")
            .setDescription(
              targetUser.id === interaction.user.id
                ? "No tienes ningún artículo en tu inventario."
                : `${targetUser.tag} no tiene ningún artículo en su inventario.`
            )
            .setTimestamp(),
        ],
        ephemeral: true,
      });
    }

    const baseEmbed = new EmbedBuilder()
      .setColor("Red")
      .setAuthor({
        name: `📦 Inventario de ${targetUser.tag}`,
        iconURL: targetUser.displayAvatarURL(),
      })
      .setTimestamp()
      .setFooter({
        text: `Solicitado por ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL(),
      });

    const itemsPerPage = 5;
    const pages = [];

    const mainEmbed = EmbedBuilder.from(baseEmbed).setDescription(
      "```md\n# Resumen del Inventario```\n" +
        "Usa los botones de navegación para explorar todos tus artículos.\n\n" +
        "**📊 Estadísticas**\n" +
        `> 📦 Total de Artículos: \`${inventarioData.Inventario.reduce(
          (acc, item) => acc + item.Cantidad,
          0
        )}\`\n` +
        `> 🏷️ Artículos Únicos: \`${inventarioData.Inventario.length}\`\n\n` +
        "```md\n# Información```\n" +
        "> 🔹 Usa los botones para navegar\n" +
        "> 🔹 Los artículos están ordenados por fecha de compra\n" +
        "> 🔹 Puedes usar `/tienda` para comprar más artículos"
    );
    pages.push(mainEmbed);

    const sortedInventario = [...inventarioData.Inventario].sort(
      (a, b) => new Date(b.FechaCompra) - new Date(a.FechaCompra)
    );

    for (let i = 0; i < sortedInventario.length; i += itemsPerPage) {
      const pageItems = sortedInventario.slice(i, i + itemsPerPage);
      const itemsDisplay = pageItems
        .map((item) => {
          const fechaCompra = new Date(item.FechaCompra);
          return (
            `> 📦 **${item.Articulo}**\n` +
            `> 🔢 Cantidad: \`${item.Cantidad}\`\n` +
            `> 🏷️ ID: \`${item.Identificador}\`\n` +
            `> 📅 Comprado: <t:${Math.floor(fechaCompra.getTime() / 1000)}:R>\n`
          );
        })
        .join("\n");

      const pageEmbed = EmbedBuilder.from(baseEmbed)
        .setColor("Random")
        .setDescription(
          "```md\n# Tus Artículos```\n" +
            itemsDisplay +
            "\n```md\n" +
            `# Página ${Math.floor(i / itemsPerPage) + 1} de ${Math.ceil(
              sortedInventario.length / itemsPerPage
            )}` +
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
