import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  codeBlock,
} from "discord.js";
import EcoUsuario from "../../../../Schemas/Economia/EcoUsuarios.js";
import PermisosManager from "../../../../Bot/Classes/Permisos.js";

export default {
  subCommand: "economia.añadir",

  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    const { options, guild, member } = interaction;
    const Usuario = options.getUser("usuario");
    const Cantidad = parseInt(options.getString("cantidad"));
    const Razon = options.getString("razon");
    const Embed = new EmbedBuilder().setThumbnail(client.user.displayAvatarURL());

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

    const userEconomy = await client.FetchBalance(Usuario.id, guild.id);
    if (!userEconomy) {
      return interaction.reply({
        embeds: [
          Embed.setTitle("Error")
            .setDescription(
              "No se pudo obtener o crear el balance del usuario."
            )
            .setColor("Red"),
        ],
        ephemeral: true,
      });
    }

    let nuevoEfectivo = Cantidad;
    let deudaRestante = userEconomy.Deuda;

    if (deudaRestante > 0) {
      if (Cantidad >= deudaRestante) {
        nuevoEfectivo = Cantidad - deudaRestante;
        userEconomy.Deuda = 0;
      } else {
        userEconomy.Deuda -= Cantidad;
        nuevoEfectivo = 0;
      }
    }

    userEconomy.Efectivo += nuevoEfectivo;

    const economiaDoc = await EcoUsuario.findOne({ GuildId: guild.id });
    const userIndex = economiaDoc.Usuario.findIndex(u => u.UserId === Usuario.id);
    
    if (userIndex !== -1) {
      economiaDoc.Usuario[userIndex] = userEconomy;
    } else {
      economiaDoc.Usuario.push(userEconomy);
    }

    await economiaDoc.save();

    if (economiaDoc.Registro) {
      const logChannel = guild.channels.cache.get(economiaDoc.Registro);

      if (logChannel) {
        const logEmbed = new EmbedBuilder()
          .setColor("Blue")
          .setTitle("Log Economía (Agregado)")
          .setThumbnail(Usuario.displayAvatarURL())
          .setFields(
            { name: "Staff Agregador:", value: `<@${member.user.id}>` },
            { name: "Receptor:", value: `<@${Usuario.id}>` },
            {
              name: "Monto Agregado:",
              value: codeBlock(`$${formatearMonto(Cantidad)} MXN`),
            },
            { name: "Motivo:", value: codeBlock(`${Razon}`) }
          )
          .setTimestamp();

        await logChannel.send({ embeds: [logEmbed] });
      }
    }

    const confirmEmbed = new EmbedBuilder()
      .setColor("Green")
      .setTitle("Transacción Exitosa")
      .setThumbnail(client.user.displayAvatarURL())
      .addFields(
        { name: "Receptor", value: `<@${Usuario.id}>`, inline: true },
        {
          name: "Monto Agregado",
          value: `$${formatearMonto(Cantidad)} MXN`,
        },
        {
          name: "Efectivo Actual",
          value: `$${formatearMonto(userEconomy.Efectivo)} MXN`,
        }
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