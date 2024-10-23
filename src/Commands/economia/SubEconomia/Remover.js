import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  codeBlock,
} from "discord.js";
import PermisosManager from "../../../Bot/Classes/Permisos.js";
import EcoUsuario from "../../../Schemas/Economia/EcoUsuarios.js";

export default {
  subCommand: "economia.remover",

  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    const { options, guild, member } = interaction;
    const Usuario = options.getUser("usuario");
    const Lugar = options.getString("lugar");
    const Cantidad = parseInt(options.getString("cantidad"));
    const Razon = options.getString("razon");
    const Embed = new EmbedBuilder().setThumbnail(
      client.user.displayAvatarURL()
    );

    if (Cantidad <= 0) {
      return interaction.reply({
        embeds: [
          Embed.setTitle("Error Detectado")
            .setTimestamp()
            .setDescription(
              codeBlock("diff", "- La cantidad debe ser un número positivo.")
            ),
        ],
        ephemeral: true,
      });
    }

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

    const userEconomy = await client.FetchBalance(Usuario.id, guild.id);
    if (!userEconomy) {
      return interaction.reply({
        embeds: [
          Embed.setTitle("Error Detectado")
            .setTimestamp()
            .setDescription(
              codeBlock(
                "diff",
                "- El usuario no tiene un registro de economía."
              )
            ),
        ],
        ephemeral: true,
      });
    }

    if (Lugar === "Banco") {
      if (userEconomy.Banco < Cantidad) {
        return interaction.reply({
          embeds: [
            Embed.setTitle("Error Detectado")
              .setTimestamp()
              .setDescription(
                codeBlock(
                  "diff",
                  "- El usuario no tiene suficiente dinero en el banco para remover esa cantidad."
                )
              ),
          ],
          ephemeral: true,
        });
      }
      userEconomy.Banco -= Cantidad;
    } else if (Lugar === "Efectivo") {
      if (userEconomy.Efectivo < Cantidad) {
        return interaction.reply({
          embeds: [
            Embed.setTitle("Error Detectado")
              .setTimestamp()
              .setDescription(
                codeBlock(
                  "diff",
                  "- El usuario no tiene suficiente dinero en efectivo para remover esa cantidad."
                )
              ),
          ],
          ephemeral: true,
        });
      }
      userEconomy.Efectivo -= Cantidad;
    }

    const economiaDoc = await EcoUsuario.findOne({ GuildId: guild.id });
    const userIndex = economiaDoc.Usuario.findIndex(
      (u) => u.UserId === Usuario.id
    );

    if (userIndex !== -1) {
      economiaDoc.Usuario[userIndex] = userEconomy;
      await economiaDoc.save();
    }

    if (economiaDoc.Registro) {
      const logChannel = guild.channels.cache.get(economiaDoc.Registro);

      if (logChannel) {
        const logEmbed = new EmbedBuilder()
          .setColor("Blue")
          .setTitle("Log Economía (Removido)")
          .setThumbnail(client.user.displayAvatarURL())
          .addFields(
            { name: "Staff Que Removió:", value: `<@${member.user.id}>` },
            { name: "Receptor:", value: `<@${Usuario.id}>` },
            {
              name: `Monto Removido (${Lugar}):`,
              value: codeBlock(`$${formatearMonto(Cantidad)}`),
            },
            { name: "Motivo:", value: codeBlock(`${Razon}`) }
          )
          .setTimestamp();

        await logChannel.send({ embeds: [logEmbed] });
      }
    }

    const confirmEmbed = new EmbedBuilder()
      .setColor("Green")
      .setThumbnail(client.user.displayAvatarURL())
      .setDescription(
        `✅ Has removido ${codeBlock(
          `$${formatearMonto(Cantidad)} MXN`
        )} del **${Lugar === "Banco" ? "🏦 Banco" : "💵 Efectivo"}** de **${
          Usuario.tag
        }**.\n`
      );

    return interaction.reply({
      embeds: [confirmEmbed],
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
